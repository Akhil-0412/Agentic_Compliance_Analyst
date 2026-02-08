import os
import sys
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.path.abspath("."))

from agent.analyst import ComplianceAgent

# Load env
load_dotenv(".env")

def test_fine_mitigation_reasoning():
    print("🚦 Starting Local Stress Test #2 (Fine Mitigation)...")
    
    # Mock Indexer to bypass retrieval and test LLM logic directly
    class MockIndexer:
        def hybrid_search(self, query, k=5):
            return [
                {"article_id": "83", "text": "Article 83(2)(f) - The degree of cooperation with the supervisory authority..."},
                {"article_id": "34", "text": "Article 34 - Communication of a personal data breach to the data subject..."}
            ]

    indexer = MockIndexer()
    print("✅ Mock Indexer initialized.")

    agent = ComplianceAgent(indexer=indexer, data_path="data/processed/gdpr_structured.json", domain="GDPR")
    
    query = "A company suffered a breach but notified the authority, informed subjects, and cooperated. What factors would reduce the fine?"
    print(f"\n📝 Query: {query}")
    
    try:
        response = agent.analyze(query)
        
        print("\n💡 Response:")
        if hasattr(response, 'model_dump'):
            data = response.model_dump()
            print(data)
            
            reasoning_map = data.get("reasoning_map", [])
            summary = data.get("summary", "")
            
            print("\n🗺️ Reasoning Map Entries:")
            for entry in reasoning_map:
                print(f" - {entry['gdpr_subsection']}: {entry['fact']} ({entry['legal_meaning']})")

            # VALIDATION CHECKS
            failures = []
            
            # Check 1: Reasoning Map Existence
            if not reasoning_map:
                failures.append("❌ REASONING_MAP IS EMPTY")
            
            # Check 2: Authority -> 83(2)(f)
            authority_entries = [e for e in reasoning_map if "authority" in e['fact'].lower() or "authority" in e['legal_meaning'].lower()]
            for e in authority_entries:
                if "83(2)(f)" not in e['gdpr_subsection']:
                    failures.append(f"❌ SEMANTIC MISMATCH: Authority mentioned in '{e['fact']}' but mapped to {e['gdpr_subsection']} (Expected 83(2)(f))")
            
            # Check 3: Data Subjects -> 83(2)(c)
            subject_entries = [e for e in reasoning_map if "subject" in e['fact'].lower() or "subject" in e['legal_meaning'].lower()]
            for e in subject_entries:
                if "83(2)(c)" not in e['gdpr_subsection']:
                    failures.append(f"❌ SEMANTIC MISMATCH: Data Subjects mentioned in '{e['fact']}' but mapped to {e['gdpr_subsection']} (Expected 83(2)(c))")

            if failures:
                print("\n".join(failures))
                print("\n❌ STRESS TEST FAILED")
            else:
                print("\n✅ STRESS TEST PASSED")
                
        else:
            print(f"❌ RAW RESPONSE ERROR: {response}")
                
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")

if __name__ == "__main__":
    test_fine_mitigation_reasoning()
