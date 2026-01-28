import re
import fitz
from datetime import datetime
from schemas import Article, Clause, LegalDocument
from semantic_parser import classify_clause

ARTICLE_RE = re.compile(r"^Article\s+(\d+)$", re.IGNORECASE)
PARA_RE = re.compile(r"^(\d+)\.\s+") 

def parse_gdpr_pdf(path: str) -> LegalDocument:
    doc = fitz.open(path)
    articles = []
    current_article = None

    for page in doc:
        blocks = page.get_text("blocks")
        for i, block in enumerate(blocks):
            text = block[4].strip()
            if not text or len(text) < 2: 
                continue

            # 1. Detect Article Header
            art_match = ARTICLE_RE.match(text)
            if art_match:
                if current_article:
                    articles.append(current_article)
                
                art_id = art_match.group(1)
                
                # LOOK-AHEAD: Capture the title from the next block
                title = ""
                if i + 1 < len(blocks):
                    title = blocks[i+1][4].strip()
                
                current_article = Article(article_id=art_id, title=title, clauses=[])
                continue

            # 2. Skip title block if already consumed
            if current_article and text == current_article.title:
                continue

            # 3. Detect Clauses / Paragraphs
            if current_article:
                para_match = PARA_RE.match(text)
                if para_match:
                    p_num = para_match.group(1)
                    # Correct integration of Semantic Classification
                    current_article.clauses.append(Clause(
                        clause_id=f"{current_article.article_id}-{p_num}",
                        text=text,
                        parent_article=current_article.article_id,
                        clause_type=classify_clause(text)  # <--- Semantic tag applied here
                    ))
                elif current_article.clauses:
                    # Append sub-points or continuation text
                    current_article.clauses[-1].text += f"\n{text}"
                    # Re-classify in case a continuation adds an "OBLIGATION" keyword like 'shall'
                    current_article.clauses[-1].clause_type = classify_clause(current_article.clauses[-1].text)

    # Append the very last article found
    if current_article:
        articles.append(current_article)
        
    return LegalDocument(source=path, articles=articles, parsed_at=datetime.now(), article_count=len(articles))