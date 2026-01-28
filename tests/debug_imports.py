try:
    import phoenix
    print(f"✅ Phoenix version: {phoenix.__version__}")
    from phoenix.trace import trace
    print("✅ Import 'trace' Successful")
except ImportError as e:
    print(f"❌ Import Failed: {e}")
    try:
        from phoenix.trace.dsl import trace
        print("✅ Import 'trace' from 'dsl' Successful")
    except ImportError as e2:
         print(f"❌ Import from 'dsl' Failed: {e2}")

