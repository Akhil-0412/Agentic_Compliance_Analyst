import os
import re
import json
from dotenv import load_dotenv
from agent.analyst import ComplianceAgent
from retrieval.indexer import ClauseIndexer

load_dotenv()

# Define the "Traps"
TRAP_CASES = [
    {
        "id": "TRAP_01_PROCESSOR_FLIP",
        "query": "A processor starts using data for its own marketing purposes without instruction. What fine tier applies?",
        "expected_trigger": "83(5)",  # The 20M tier (Controller fine), NOT 83(4) (Processor fine)
        "forbidden_trigger": "83(4)",
        "concept": "Role Mutability (Art 28.10)"
    },
    {
        "id": "TRAP_02_JOINT_LIABILITY",
        "query": "Two companies determine purposes together, but their contract says only Company A is liable. Can the data subject sue Company B?",
        "expected_trigger": "26",    # Joint Controllers concept
        "forbidden_trigger": "contract is binding on data subject",
        "concept": "Cross-Article Logic (Art 26 vs Contract)"
    },
    {
        "id": "TRAP_03_THIRD_COUNTRY",
        "query": "I am transferring data to Japan. The Commission has an adequacy decision. Do I still need SCCs?",
        "expected_trigger": "45",    # Adequacy Decision
        "forbidden_trigger": "46",   # Standard Contractual Clauses (SCCs) are NOT needed if Art 45 applies
        "concept": "Hierarchy of Transfers"
    }
]

def run_traps():
    print("🚀 Starting Legal Logic Trap Suite...")
    
    # 1. Setup Agent (In-memory build for speed)
    data_path = "data/processed/gdpr_structured.json"
    with open(data_path, "r", encoding="utf-8") as f:
        gdpr_doc = json.load(f)
    texts, metadata = [], []
    for article in gdpr_doc['articles']:
        for clause in article['clauses']:
            texts.append(f"Article {article['article_id']}: {clause['text']}")
            metadata.append({"article_id": article['article_id'], "clause_id": clause['clause_id'], "text": clause['text']})
    
    indexer = ClauseIndexer()
    indexer.build(texts, metadata)
    agent = ComplianceAgent(indexer, data_path)
    
    score = 0
    
    # 2. Run Tests
    for case in TRAP_CASES:
        print(f"\n⚡ Running {case['id']} ({case['concept']})...")
        response = agent.analyze(case['query'])
        
        # Grading Logic
        passed = False
        if case['expected_trigger'] in response and case['forbidden_trigger'] not in response:
            passed = True
        elif case['id'] == "TRAP_01_PROCESSOR_FLIP" and "20" in response and "10" not in response:
             # loose check for 20 million vs 10 million
             passed = True
             
        if passed:
            print("✅ PASS: Logic held.")
            score += 1
        else:
            print("❌ FAIL: Fell into the trap.")
            print(f"   Expected reference to: {case['expected_trigger']}")
            print(f"   Agent Response Snippet: {response[:100]}...")

    print(f"\n🏆 Final Logic Score: {score}/{len(TRAP_CASES)}")
    if score == len(TRAP_CASES):
        print("🧠 Verdict: LEGAL REASONING ENGINE CONFIRMED.")
    else:
        print("⚠️ Verdict: Optimization Required.")

if __name__ == "__main__":
    run_traps()