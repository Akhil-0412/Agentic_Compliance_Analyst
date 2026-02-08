import sys
import os
import inspect

# Add current directory to sys.path
sys.path.append(os.getcwd())

print(f"CWD: {os.getcwd()}")
print(f"Sys Path: {sys.path}")

try:
    from agent.analyst import ComplianceAgent
    print(f"✅ Imported ComplianceAgent from: {inspect.getfile(ComplianceAgent)}")
    
    source = inspect.getsource(ComplianceAgent.__init__)
    print("--- __init__ Source Start ---")
    print(source)
    print("--- __init__ Source End ---")
    
    # Mock dependencies
    class MockIndexer: pass
    
    print("Attempting instantiation...")
    # Use CCPA to avoid file loading
    agent = ComplianceAgent(indexer=MockIndexer(), data_path="dummy.json", domain="CCPA")
    print("Instantiation successful!")
    
    if hasattr(agent, 'api_keys'):
        print(f"✅ agent.api_keys exists: {agent.api_keys}")
    else:
        print("❌ agent.api_keys MISSING!")
        
    # Test method call
    # agent.analyze("test") # Requires more mocks, let's stop here if api_keys is present

except Exception as e:
    print(f"❌ Error during reproduction: {e}")
    import traceback
    traceback.print_exc()
