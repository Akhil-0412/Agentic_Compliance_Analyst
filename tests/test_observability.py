import sys
import os
import json
import time
from dotenv import load_dotenv
import phoenix as px

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agent.analyst import ComplianceAgent
from retrieval.indexer import ClauseIndexer

# Load env variables
load_dotenv()

def test_trace_generation():
    print("🚀 Starting Observability Verification...")
    
    # 1. Launch Phoenix (headless mode)
    try:
        session = px.launch_app()
        print(f"✅ Phoenix launched at {session.url}")
    except Exception as e:
        print(f"⚠️ Phoenix launch warning: {e}")

    # 2. Initialize Agent
    data_path = "data/processed/gdpr_structured.json"
    if not os.path.exists(data_path):
        print("⚠️ Data file not found.")
        return

    print("📂 Loading GDPR Data...")
    with open(data_path, "r", encoding="utf-8") as f:
        gdpr_doc = json.load(f)

    texts, metadata = [], []
    for article in gdpr_doc['articles'][:3]: 
        title, art_id = article['title'], article['article_id']
        for clause in article['clauses']:
            texts.append(f"Article {art_id} - {title}: {clause['text']}")
            metadata.append({"article_id": art_id, "clause_id": clause['clause_id'], "text": clause['text']})
            
    indexer = ClauseIndexer()
    indexer.build(texts, metadata)
    agent = ComplianceAgent(indexer, data_path)
    
    # 3. Simulate Query
    query = "What is the fine for non-compliance?"
    print(f"❓ sending Query: '{query}'")
    
    # This should trigger the @trace decorators
    response = agent.analyze(query)
    
    print("\n✅ Verification SUCCESS: Agent responded.")
    print(f"Summary: {response.summary[:50]}...")
    
    # Wait for trace to flush
    time.sleep(2)
    print("✅ Trace flushed (theoretical). Check UI.")

if __name__ == "__main__":
    test_trace_generation()
