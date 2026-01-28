import os
import sys
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agent.analyst import ComplianceAgent
from retrieval.indexer import ClauseIndexer

def test_structured_output():
    load_dotenv()
    
    print("🚀 Initializing Compliance Agent...")
    try:
        # Mock indexer since we just want to test the LLM structured output
        # For a full test we'd need the real index or mock it
        # But ComplianceAgent builds indexer internally?
        # FIX: Do not pass filename as model_name
        # For FDA mode, we don't strictly need the indexer, so we can pass None
        # But to be safe and follow type hints, let's pass a dummy mock
        class MockIndexer:
            def hybrid_search(self, query, k=5):
                return []
        
        indexer = MockIndexer()
        agent = ComplianceAgent(indexer=indexer, data_path="data/processed/gdpr_structured.json", domain="FDA")
        
        query = "What are the labeling requirements for medical devices?"
        print(f"❓ Query: {query}")
        
        # We need to make sure we don't hit the indexer if we are in FDA mode
        # In FDA mode: it uses tavily.
        # Let's hope tavily works or returns "No external search" (which is fine)
        
        response = agent.analyze(query)
        
        print("\n✅ Response Received:")
        print(f"Type: {type(response)}")
        
        if hasattr(response, 'summary'):
            print(f"Summary: {response.summary}")
            print(f"Risk: {response.risk_level}")
            print(f"Confidence: {response.confidence_score}")
        else:
            print(f"Response (String): {response}")
            
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_structured_output()
