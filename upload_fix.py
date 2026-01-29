"""
Upload fixed files to HuggingFace Space
"""
from huggingface_hub import HfApi, login
import os

# Login with token (replace with your new token)
login(token=os.getenv("HF_TOKEN"))

# Upload just the fixed file
api = HfApi()
api.upload_file(
    path_or_fileobj="hf-space-clean/agent/analyst.py",
    path_in_repo="agent/analyst.py",
    repo_id="Akhil-008/agentic-compliance-analyst",
    repo_type="space",
)
print("✅ Fix uploaded!")
