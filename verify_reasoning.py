import os
import sys
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.path.abspath("."))

from agent.analyst import ComplianceAgent
from retrieval.indexer import ClauseIndexer

# Load env
load_dotenv(".env")

def test_erasure_reasoning():
    print("🚦 Starting Local Reasoning Test...")
    
    # Mock Indexer (or load real one if exists)
    if os.path.exists("data/processed/gdpr_structured.json"):
        # sys.path.append("c:/Users/AKHILESHWAR/Scripts_UoS/Projects/Agentic-Compliance-Analyst")
        from backend.main import get_gdpr_indexer
        indexer = get_gdpr_indexer() # Use the one from backend logic
    else:
        print("❌ Data not found. Cannot run integration test.")
        return

    agent = ComplianceAgent(indexer=indexer, data_path="data/processed/gdpr_structured.json", domain="GDPR")
    
    query = "Can I refuse a request to erase all data if I need to keep transaction records for tax purposes?"
    print(f"\n📝 Query: {query}")
    
    response = agent.analyze(query)
    
    print("\n💡 Response:")
    if hasattr(response, 'model_dump'):
        print(response.model_dump())
        data = response.model_dump()
        summary = data.get("summary", "")
        legal = data.get("legal_basis", "")
        summary = data.get("summary", "")
        scope = data.get("scope_limitation", "")
        risk = data.get("risk_level", "")

    # VALIDATION
    failures = []
    if "Art" not in legal and "Art" not in summary:
        failures.append("❌ NO CITATIONS FOUND")
    if "17" not in str(response):
        failures.append("❌ MISSING ARTICLE 17")
    if "6" not in str(response) and "legal obligation" not in str(response).lower():
        failures.append("❌ MISSING ARTICLE 6 / LEGAL OBLIGATION")
    if "strictly" not in scope.lower() and "strictly" not in summary.lower():
         failures.append("❌ MISSING 'STRICTLY NECESSARY' SCOPE")
    if risk != "medium" and risk != "high":
         failures.append(f"❌ RISK LEVEL {risk} IS NOT SUFFICIENT (Expected MEDIUM/HIGH)")
    
    if failures:
        print("\n".join(failures))
        print("\n❌ TEST FAILED")
    else:
        print("\n✅ TEST PASSED")

if __name__ == "__main__":
    test_erasure_reasoning()
