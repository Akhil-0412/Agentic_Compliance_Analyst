# Agentic GDPR Compliance Analyst ⚖️

> A deterministic legal reasoning engine that combines **Vector Retrieval (RAG)** with **Logic State Machines** and **Human-in-the-Loop Governance**.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Groq](https://img.shields.io/badge/LLM-Llama3%2070B-orange)
![Streamlit](https://img.shields.io/badge/UI-Streamlit-red)

## 🧠 The Problem
Most "Legal AI" chatbots fail because they treat law as a retrieval task. They search for keywords but miss the **logic hierarchy**.
* *Example:* A "Processor" who violates instructions becomes a "Controller" (Art 28.10). Standard RAG misses this state change and quotes the wrong fine tier.

## 💡 The Solution: Cognitive Architecture
This system is not a chatbot. It is a **Reasoning Engine** with three distinct layers:

1.  **Domain Logic Router:** Injects necessary context based on legal intent (e.g., forcing Article 28 context when Article 83 is queried).
2.  **Legal State Machine:** Evaluates role mutability (Controller vs. Processor) before calculating penalties.
3.  **Governance Vault:** A deterministic "Supreme Court" layer that prevents hallucination and enforces human oversight for critical risks.

## 🏗️ Architecture
```mermaid
graph TD
    User[👤 User Query] --> Guard[🛡️ Intent Guardrail]
    Guard -- "Safe" --> Router{🧠 Domain Logic Router}

    subgraph "Reasoning State Machine"
        Router --> StateA[Inject Art 83 + Guidelines]
        Router --> StateB[Inject Art 28 + Art 4]
        StateA & StateB --> Search[🔍 Vector Retrieval]
    end

    Search --> LLM[🤖 Llama 3 70B (w/ Mixtral Failover)]
    
    subgraph "Governance Layer"
        LLM --> Check{⚖️ Risk Gate}
        Check -- "Critical Risk" --> Human[⚠️ Human Review]
        Check -- "High Confidence" --> Auto[✅ Auto-Approve]
    end

    Human --> UI[🖥️ Streamlit Dashboard]
    UI -- "Expert Edit" --> Validator[👨‍⚖️ Supreme Court Agent]