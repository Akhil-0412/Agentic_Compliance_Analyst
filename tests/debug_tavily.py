import os
import sys
import traceback
from dotenv import load_dotenv, find_dotenv

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Force reload of .env
env_file = find_dotenv()
print(f"📂 Loading .env from: {env_file}")
load_dotenv(env_file, override=True)

api_key = os.getenv("TAVILY_API_KEY")
print(f"🔑 TAVILY_API_KEY Found: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"🔑 Key Preview: {api_key[:5]}...")

try:
    from agent.tavily_search import LawsuitSearcher
    searcher = LawsuitSearcher()
    if searcher.client:
        print("✅ Client initialized.")
        print("🔍 Attempting Search...")
        res = searcher.search_lawsuits("test query", max_results=1)
        print(f"📄 Result length: {len(res)}")
    else:
        print("❌ Client initialization failed (read module logs above).")

except Exception:
    print("❌ Import/Runtime Error:")
    print(traceback.format_exc())
