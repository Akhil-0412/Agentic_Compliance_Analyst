
import pypdf
import sys
import os

file_path = "C:\\Users\\AKHILESHWAR\\Desktop\\UoS\\Sem-III\\Submission.pdf"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

try:
    reader = pypdf.PdfReader(file_path)
    text = ""
    print(f"Number of pages: {len(reader.pages)}")
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
        else:
            print(f"Warning: No text found on page {i+1}")
    
    # Write to file with UTF-8 encoding
    output_file = "pdf_text_utf8.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(text)
    
    print(f"Successfully extracted text to {output_file}")
except Exception as e:
    print(f"Error: {e}")
