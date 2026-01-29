import os
import re
import groq
from groq import Groq
from dotenv import load_dotenv
import instructor

# Absolute imports based on project root
from retrieval.context_builder import ContextBuilder
from agent.router import needs_multi_article_reasoning
from governance.engine import classify_decision, DecisionStatus
from agent.schemas import ComplianceResponse, RiskLevel
from agent.tavily_search import LawsuitSearcher 

load_dotenv()

# --- PROMPTS ---
PROMPTS = {
    "GDPR": (
        "You are a Senior GDPR Compliance Analyst. "
        "Your goal is to provide precise, factual advice based ONLY on the provided legal text.\n\n"
        "Rules of Engagement:\n"
        "1. Cite specific clauses (e.g., Art 83(4)(a)).\n"
        "2. If the context doesn't have the answer, state that clearly in the summary.\n"
        "3. Your output must strictly follow the JSON schema provided.\n"
        "4. CONFLICT RESOLUTION: Specific fines (e.g. Art 83(4)) override general fines (Art 83(5)).\n"
    ),
    "FDA": (
        "You are a Senior FDA Regulatory Consultant. "
        "Your goal is to provide guidance on US Food & Drug Administration regulations and recent legal precedents.\n\n"
        "Rules of Engagement:\n"
        "1. Focus on 21 CFR, FD&C Act, and recent court cases.\n"
        "2. Use the provided External Search Context to cite real lawsuits.\n"
        "3. Your output must strictly follow the JSON schema provided.\n"
    ),
    "CCPA": (
        "You are a Senior Privacy Counsel specializing in CCPA/CPRA. "
        "Your goal is to provide definitive, legally precise classifications based on California Civil Code.\n\n"
        "Rules of Engagement:\n"
        "1. BE DECLARATIVE. Do not use 'may be' unless there is genuine legal ambiguity. If the law lists it, say 'Yes'.\n"
        "2. CITE SECTIONS PRECISELY:\n"
        "   - Personal Information: §1798.140(v)(1)\n"
        "   - Sensitive Personal Information: §1798.140(ae)\n"
        "   - Sale: §1798.140(ad)\n"
        "   - Sharing: §1798.140(ah)\n"
        "3. STATUTORY KNOWLEDGE EXCEPTION: If a question concerns an explicit statutory definition (e.g. 'is X considered personal information') and the statute enumerates the item, ANSWER DIRECTLY even if retrieval does not surface the clause.\n"
        "4. RISK CALIBRATION: Informational/Recall questions are LOW RISK. Only actionable selling/sharing is MH/HR.\n"
        "5. Your output must strictly follow the JSON schema provided.\n"
    )
}

class ComplianceAgent:
    def __init__(self, indexer, data_path: str, domain: str = "GDPR"):
        self.domain = domain
        self.indexer = indexer
        self.context_builder = ContextBuilder(data_path) if domain == "GDPR" else None
        self.tavily = LawsuitSearcher() if domain == "FDA" else None
        
        # --- API KEY MANAGEMENT ---
        self.api_keys = []
        if os.getenv("GROQ_API_KEY"): self.api_keys.append(os.getenv("GROQ_API_KEY"))
        if os.getenv("GROQ_API_KEY2"): self.api_keys.append(os.getenv("GROQ_API_KEY2"))
        
        if not self.api_keys:
            raise ValueError("No GROQ_API_KEY found in .env file.")

        # --- "DEEP CASCADE" MODEL STRATEGY ---
        # Only use valid Groq models
        self.models = [
            "llama-3.3-70b-versatile",            # Tier 1: Best quality
            "llama-3.1-70b-versatile",            # Tier 1: Stable
            "llama3-70b-8192",                    # Tier 2: Fast
            "mixtral-8x7b-32768",                 # Tier 2: Good balance
            "llama-3.1-8b-instant",               # Tier 3: High speed
            "llama3-8b-8192",                     # Tier 3: Fast fallback
            "gemma2-9b-it",                       # Tier 4: Lightweight
        ]
        
        # Initialize Groq client
        self.base_client = Groq(api_key=self.api_keys[0])
        # Patch with Instructor
        self.client = instructor.from_groq(self.base_client, mode=instructor.Mode.TOOLS)

    def _safe_api_call(self, messages, temperature=0, response_model=None):
        """
        ULTIMATE FAILOVER LOOP:
        Tries every Key on every Model until one works.
        Supports Structured Output via `response_model`.
        """
        errors = []
        for model in self.models:
            for i, key in enumerate(self.api_keys):
                try:
                    # Re-instantiate client with current key
                    base = Groq(api_key=key)
                    # Use instructor client
                    client = instructor.from_groq(base, mode=instructor.Mode.TOOLS)

                    if response_model:
                        return client.chat.completions.create(
                            messages=messages,
                            model=model,
                            temperature=temperature,
                            response_model=response_model
                        )
                    else:
                        # Fallback for standard string responses (e.g. validation)
                        return base.chat.completions.create(
                           messages=messages,
                           model=model,
                           temperature=temperature
                        )

                except groq.RateLimitError:
                    print(f"⚠️ Rate Limit: {model} (Key #{i+1}) exhausted. Skipping...")
                    continue 
                except groq.NotFoundError:
                    print(f"⚠️ Model Not Found/Access Denied: {model}. Skipping...")
                    continue
                except Exception as e:
                    print(f"⚠️ Error on {model}: {e}")
                    errors.append(str(e))
                    continue
            print(f"🔻 Downgrading capabilities: Switching from {model}...")

        raise RuntimeError(f"❌ SERVICE OUTAGE: All {len(self.models)} models exhausted. Errors: {errors[:3]}")

    def analyze(self, user_query: str):
        return self._analyze_logic(user_query)

    def _analyze_logic(self, user_query: str):
        # --- GUARDRAIL 0: INTENT FILTER ---
        unethical_keywords = ["evade", "bypass", "avoid detection", "hide", "loophole"]
        if any(k in user_query.lower() for k in unethical_keywords):
            return "Safety Violation: I cannot assist with evading or bypassing regulatory requirements."

        # --- LOGIC LAYER: DEFINITION & RISK CALIBRATION ---
        # If user asks "What is X" or "Is X considered Y", this is KNOWLEDGE_RECALL, not ADVICE.
        is_definition_query = any(k in user_query.lower() for k in ["what is", "define", "meaning of", "considered personal info", "stand for", "are ip addresses"])

        # --- ROUTER: GENERAL CONVERSATION CHECK ---
        # Heuristic check for greetings or general questions
        general_triggers = ["hi", "hello", "who are you", "what can you do", "help", "thanks", "good morning", "capabilities"]
        is_general = len(user_query.split()) < 10 and any(t in user_query.lower() for t in general_triggers)
        
        # If ambiguous, we can ask the LLM to classify, but heuristic is faster for "Hi"
        if is_general:
            # Simple direct response
            return self._safe_api_call(
                messages=[
                    {"role": "system", "content": (
                        "You are the 'Agentic Compliance Analyst', an advanced AI specialized in global regulations. "
                        "You have deep knowledge of GDPR (EU), FDA (US), and are expanding to Global Compliance. "
                        "Introduce yourself formally and list your capabilities (searching laws, analyzing risk, drafting reports). "
                        "Do not answer specific compliance questions here; just introduce yourself."
                    )},
                    {"role": "user", "content": user_query}
                ],
                temperature=0.7
            ).choices[0].message.content

        combined_context = ""
        
        # --- PATH A: GDPR (Internal RAG) ---
        if self.domain == "GDPR":
            # 1. Retrieval
            is_complex = needs_multi_article_reasoning(user_query)
            k = 6 if is_complex else 3
            results = self.indexer.hybrid_search(user_query, k=k)
            
            if not results:
                return "Insufficient context found to provide a compliance answer."

            # 2. Logic Injection
            retrieved_ids = {str(r['article_id']) for r in results}
            q_lower = user_query.lower()
            
            # Simple Domain Logic Mapping (GDPR specific)
            DOMAIN_MAP = {
                "penalty_logic": {
                    "triggers": ["fine", "penalty", "administrative", "sanction", "euro"],
                    "inject": ["83"]
                },
                "scope_logic": {
                    "triggers": ["apply", "applies", "scope", "territorial", "material", "when does"],
                    "inject": ["2", "3"]
                },
                "definition_logic": {
                    "triggers": ["define", "definition", "meaning", "what is a", "who is a"],
                    "inject": ["4"]
                },
                "dpo_logic": {
                    "triggers": ["dpo", "officer", "representative", "public authority"],
                    "inject": ["37", "38", "39"]
                },
                "transfer_logic": {
                    "triggers": ["transfer", "third country", "abroad", "adequacy"],
                    "inject": ["45", "46", "49"]
                }
            }

            for domain, rules in DOMAIN_MAP.items():
                if any(t in q_lower for t in rules['triggers']):
                    for art_id in rules['inject']:
                        if art_id not in retrieved_ids:
                            retrieved_ids.add(art_id)
            
            # 3. Context Builder
            full_contexts = [self.context_builder.expand_article_by_id(aid) for aid in sorted(list(retrieved_ids))]
            combined_context = "\n\n".join(full_contexts)

        # --- PATH B: FDA (External Search) ---
        elif self.domain == "FDA":
            if self.tavily:
                combined_context = self.tavily.search_lawsuits(user_query)
            else:
                combined_context = "No external search capability. Relying on general model knowledge."
        
        # --- PATH C: CCPA (Model Knowledge + Calibration) ---
        elif self.domain == "CCPA":
             # STATUTORY KNOWLEDGE EXCEPTION
             combined_context = "Source: CCPA/CPRA Legal Statutes (Modeled Knowledge - Statutory Exception Active)."

        # 4. LLM Reasoning Call (Structured)
        system_prompt = PROMPTS.get(self.domain, PROMPTS["GDPR"])
        
        # Override Risk Context for Definitions
        risk_guidance = ""
        if is_definition_query:
            risk_guidance = "\n[CONTEXT NOTE: This is a DEFINITION query. Risk Level must be 'low'. Calibrate confidence to 1.0 if the term is explicitly defined in law.]"

        messages = [
            {"role": "system", "content": system_prompt + risk_guidance},
            {"role": "user", "content": f"CONTEXT (Source: {self.domain} Knowledge):\n{combined_context}\n\nQUERY: {user_query}"}
        ]

        # Call with response_model
        try:
            structured_response: ComplianceResponse = self._safe_api_call(
                messages=messages, 
                temperature=0,
                response_model=ComplianceResponse
            )
        except Exception as e:
            return f"⚠️ API Error: {str(e)}"

        # --- SEMANTIC RISK & CITATION OVERRIDE ---
        # Runs for ALL CCPA queries to ensure Risk Compliance on specific topics (SPI, Deletion, Sales)
        if self.domain == "CCPA":
            # Mapping: Keyword -> (Citation, RiskLevel, Confidence)
            # Rule: Definitions triggering obligations (SPI, Sale) or denial of rights are MEDIUM risk.
            SEMANTIC_MAP = {
                "personal information": ("§1798.140(v)(1)", RiskLevel.LOW, 1.0),
                "sensitive": ("§1798.140(ae)", RiskLevel.MEDIUM, 0.95),
                "sale": ("§1798.140(ad)", RiskLevel.MEDIUM, 0.95),
                "share": ("§1798.140(ah)", RiskLevel.MEDIUM, 0.95),
                "sharing": ("§1798.140(ah)", RiskLevel.MEDIUM, 0.95),
                "cross-context": ("§1798.140(ah)", RiskLevel.MEDIUM, 0.95),
                "fraud": ("§1798.105(d)(1)", RiskLevel.MEDIUM, 0.90),
                "deny": ("§1798.105(d)", RiskLevel.MEDIUM, 0.90),
                "delete": ("§1798.105", RiskLevel.MEDIUM, 0.90),
                "deletion": ("§1798.105", RiskLevel.MEDIUM, 0.90),
                "geolocation": ("§1798.140(ae)", RiskLevel.MEDIUM, 0.95)
            }
            
            low_q = user_query.lower()
            for key, (citation, risk, conf) in SEMANTIC_MAP.items():
                if key in low_q:
                    # Append or Overwrite citation
                    structured_response.legal_basis = f"California Civil Code {citation}"
                    if risk == RiskLevel.LOW:
                            structured_response.legal_basis += " (Explicit Statutory Definition)"
                    
                    # Apply Risk & Confidence Semantics
                    structured_response.risk_level = risk
                    structured_response.confidence_score = conf
                    
                    # Regex Repair for Hallucinated Sections in Summary
                    if "1798.140" in structured_response.summary or "1798.105" in structured_response.summary:
                            pattern = r"1798\.\d+(?:\([a-zA-Z0-9]+\))+"
                            structured_response.summary = re.sub(
                            pattern, 
                            citation.replace("§", ""), 
                            structured_response.summary
                        )
                    break
        
        # --- GATING OVERRIDE FOR PURE DEFINITIONS ---
        # Fallback for "What is X" queries not caught above, ensuring they don't get blocked
        elif is_definition_query:
             structured_response.confidence_score = 1.0
             if structured_response.risk_level != RiskLevel.HIGH:
                 structured_response.risk_level = RiskLevel.LOW

        # 5. GOVERNANCE & GATING LAYER
        decision = classify_decision(
            confidence=structured_response.confidence_score,
            risk_level=structured_response.risk_level.value, 
            requires_refusal=False 
        )

        if decision.status == DecisionStatus.BLOCKED:
            return f"❌ **BLOCKED**: {decision.reason}"
        
        if decision.status == DecisionStatus.REVIEW_REQUIRED:
            return (
                f"🧑‍⚖️ **HUMAN REVIEW REQUIRED**\n"
                f"**Reason:** {decision.reason}\n"
                f"**Risk Level:** {decision.risk_level.upper()}\n"
                f"**Confidence:** {decision.confidence}\n\n"
                f"*(System holding response for approval...)*\n\n"
                f"---\n"
                f"### Analysis\n{structured_response.summary}\n\n"
                f"**Legal Basis:** {structured_response.legal_basis}\n"
                f"**Risk Analysis:** {structured_response.risk_analysis}"
            )

        return structured_response
