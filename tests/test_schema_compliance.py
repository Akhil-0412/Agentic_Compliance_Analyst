import sys
import os
import json
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agent.analyst import ComplianceAgent
from retrieval.indexer import ClauseIndexer
from agent.schemas import ComplianceResponse

# Load env variables (API Keys)
load_dotenv()

def test_structured_output():
    print("🚀 Starting Structured Output Verification...")
    
    # 1. Setup minimal indexer (mock or real)
    # We will try to load the real one if it exists, else mock
    data_path = "data/processed/gdpr_structured.json"
    
    if not os.path.exists(data_path):
        print("⚠️ Data file not found. Skipping data loading test.")
        return

    print("📂 Loading GDPR Data...")
    with open(data_path, "r", encoding="utf-8") as f:
        gdpr_doc = json.load(f)

    texts, metadata = [], []
    # Load just a few articles for speed
    for article in gdpr_doc['articles'][:5]: 
        title, art_id = article['title'], article['article_id']
        for clause in article['clauses']:
            texts.append(f"Article {art_id} - {title}: {clause['text']}")
            metadata.append({"article_id": art_id, "clause_id": clause['clause_id'], "text": clause['text']})
            
    indexer = ClauseIndexer()
    indexer.build(texts, metadata)
    
    agent = ComplianceAgent(indexer, data_path)
    
    # 2. Test Query
    query = "What is the territorial scope of the GDPR?"
    print(f"❓ Testing Query: '{query}'")
    
    response = agent.analyze(query)
    
    # 3. Validation
    if isinstance(response, ComplianceResponse):
        print("\n✅ Verification SUCCESS: Received valid Pydantic Object.")
        print(f"🔹 Summary: {response.summary[:50]}...")
        print(f"🔹 Legal Basis: {response.legal_basis}")
        print(f"🔹 Risk Level: {response.risk_level}")
        print(f"🔹 Confidence: {response.confidence_score}")
        print(f"🔹 References: {response.references}")
        
        # Additional checks
        if response.confidence_score < 0 or response.confidence_score > 1:
            print("❌ Verification FAILED: Confidence score out of bounds.")
        if not response.references:
            print("⚠️ Warning: No references returned.")
            
    else:
        print(f"❌ Verification FAILED: Expected ComplianceResponse, got {type(response)}")
        print(f"Raw Output: {response}")

if __name__ == "__main__":
    try:
        test_structured_output()
    except Exception as e:
        print(f"❌ Verification CRASHED: {e}")
