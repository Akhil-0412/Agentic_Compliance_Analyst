import fitz  # PyMuPDF

def load_pdf(path: str):
    doc = fitz.open(path)
    print(f"Pages: {len(doc)}")
    print("\n--- First page preview ---\n")
    # Use "blocks" to see if headers/clauses are separate
    blocks = doc[0].get_text("blocks")
    for b in blocks[:10]:  # Look at the first 10 structural elements
        print(f"Block {b[5]}: {b[4]}")

if __name__ == "__main__":
    load_pdf("C:\Users\AKHILESHWAR\Scripts_UoS\Projects\Agentic-Compliance-Analyst\data\raw\CELEX_32016R0679_EN_TXT.pdf")
