import json
from datetime import datetime, timezone
from layout_parser import parse_gdpr_pdf

doc = parse_gdpr_pdf("data/raw/CELEX_32016R0679_EN_TXT.pdf")

output = {
    "source": doc.source,
    "parsed_at": datetime.now(timezone.utc).isoformat(),
    "article_count": len(doc.articles),
    "articles": [article.model_dump() for article in doc.articles]
}


# Replace the old json.dump logic with this:
with open("data/processed/gdpr_structured.json", "w", encoding="utf-8") as f:
    # model_dump_json() handles dates, enums, and complex types automatically
    f.write(doc.model_dump_json(indent=4))

print("✅ Structured data successfully saved to data/processed/gdpr_structured.json")
# Add this to the end of your run_parse.py
import json
import os

# 1. Ensure the directory exists
os.makedirs("data/processed", exist_ok=True)

# 2. Use ONLY the Pydantic-native save method
with open("data/processed/gdpr_structured.json", "w", encoding="utf-8") as f:
    # This single line handles the whole document AND the datetime/enum issues
    f.write(doc.model_dump_json(indent=4))

print("✅ Structured data successfully saved to data/processed/gdpr_structured.json")