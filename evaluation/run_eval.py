import json
import os
import re
import sys
from tqdm import tqdm
from dotenv import load_dotenv

# Absolute imports
from agent.analyst import ComplianceAgent
from retrieval.indexer import ClauseIndexer

load_dotenv()

# Configuration
DATASET_PATH = "evaluation/golden_dataset.json"
RESULTS_PATH = "evaluation/eval_results.json"
GDPR_DATA_PATH = "data/processed/gdpr_structured.json"

def check_citation_match(response_text: str, expected_unit: dict) -> bool:
    unit_id = expected_unit['unit_id']
    unit_type = expected_unit['unit_type']
    # Regex for "Article 25", "Art. 25", "Art 25"
    pattern = rf"(?i)\b({unit_type}|Art\.?)\s*{re.escape(unit_id)}\b"
    return bool(re.search(pattern, response_text))

def evaluate_response(question_data: dict, response_text: str) -> dict:
    score = 0.0
    feedback = []
    passed = False

    # 1. Refusal Logic
    if question_data.get('requires_refusal'):
        refusal_phrases = [
            "insufficient context", "cannot answer", 
            "safety violation", "outside the context",
            "low confidence", "format error"
        ]
        is_refusal = any(p in response_text.lower() for p in refusal_phrases)
        if is_refusal:
            score = 1.0
            passed = True
            feedback.append("✅ Correctly refused.")
        else:
            feedback.append("❌ Failed to refuse.")
    
    # 2. Citation Logic
    else:
        expected = question_data.get('expected_citations', [])
        if not expected:
            score = 1.0; passed = True
        else:
            matches = 0
            for cit in expected:
                if check_citation_match(response_text, cit):
                    matches += 1
                else:
                    feedback.append(f"❌ Missed: {cit['unit_id']}")
            score = matches / len(expected) if expected else 1.0
            passed = (score == 1.0)
            if passed: feedback.append("✅ All citations found.")

    return {
        "question_id": question_data['id'],
        "score": score,
        "passed": passed,
        "feedback": "; ".join(feedback),
        "agent_response": response_text
    }

def main():
    print("🚀 Starting Compliance Evaluation Suite...", flush=True)
    
    # --- STEP 1: LOAD DATA ---
    print(f"📂 Loading dataset from {DATASET_PATH}...", flush=True)
    if not os.path.exists(DATASET_PATH):
        print(f"❌ ERROR: File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)
    # Filter comments
    dataset = [d for d in dataset if "id" in d]
    print(f"✅ Loaded {len(dataset)} test cases.", flush=True)

    # --- STEP 2: BUILD INDEX ---
    print("⚙️  Loading GDPR Data...", flush=True)
    if not os.path.exists(GDPR_DATA_PATH):
        print(f"❌ ERROR: GDPR data not found at {GDPR_DATA_PATH}")
        return

    with open(GDPR_DATA_PATH, "r", encoding="utf-8") as f:
        gdpr_doc = json.load(f)

    texts = []
    metadata = []
    
    print("🔹 Pre-processing Articles...", flush=True)
    for article in gdpr_doc['articles']:
        title = article['title']
        art_id = article['article_id']
        for clause in article['clauses']:
            full_text = f"Article {art_id} - {title}: {clause['text']}"
            texts.append(full_text)
            metadata.append({
                "article_id": art_id,
                "clause_id": clause['clause_id'],
                "text": clause['text']
            })

    print(f"🔹 Building Index for {len(texts)} clauses (this uses GPU)...", flush=True)
    indexer = ClauseIndexer()
    # verify build works
    indexer.build(texts, metadata)
    print("✅ Index Build Complete.", flush=True)

    # --- STEP 3: RUN AGENT ---
    print("🤖 Initializing Agent...", flush=True)
    agent = ComplianceAgent(indexer, GDPR_DATA_PATH)

    results = []
    total_score = 0
    
    print("⚡ Starting Inference Loop...", flush=True)
    for entry in tqdm(dataset, desc="Evaluating"):
        q_id = entry['id']
        try:
            raw_response = agent.analyze(entry['question'])
            result = evaluate_response(entry, raw_response or "")
            results.append(result)
            total_score += result['score']
        except Exception as e:
            print(f"\n⚠️ Error on {q_id}: {e}", flush=True)
            results.append({"question_id": q_id, "score": 0, "passed": False, "feedback": str(e)})

    # --- STEP 4: REPORT ---
    if len(dataset) > 0:
        final_acc = (total_score / len(dataset)) * 100
        print(f"\n📊 FINAL SCORE: {final_acc:.2f}%")
        
        # Color coded output
        if final_acc == 100:
            print("🏆 PERFECT RUN! The Agent is ready for UI.")
        elif final_acc > 80:
            print("✅ PASSING. Good enough for Phase 4.")
        else:
            print("❌ FAILING. Review errors in JSON.")
    
    with open(RESULTS_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)
    print(f"📝 Results saved to {RESULTS_PATH}")

if __name__ == "__main__":
    main()