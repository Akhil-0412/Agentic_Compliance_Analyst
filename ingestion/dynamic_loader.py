from datetime import datetime
import re
from ingestion.schemas import LegalDocument, Article, Clause, ClauseType

class DynamicLoader:
    """
    Parses generic text into the LegalDocument structure.
    Since we don't have perfect 'Article X' regex for every law, 
    we use a generic chunking strategy.
    """
    
    @staticmethod
    def parse_text(text: str, title: str, source_url: str) -> LegalDocument:
        articles = []
        
        # Split by typical legal headers (Section, Article, Chapter)
        # If none found, we split by paragraphs.
        
        # Generic Regex for headers: "Article 1", "Section 2.3", "Chapter IV"
        # We look for a line that starts with these keywords and is short (< 50 chars)
        HEADER_PATTERN = re.compile(r"^(Article|Section|Chapter)\s+([0-9IVX]+.*?)$", re.IGNORECASE | re.MULTILINE)
        
        # We iterate through the text
        lines = text.split('\n')
        current_article = None
        current_clauses = []
        
        article_counter = 1
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            match = HEADER_PATTERN.match(line)
            if match and len(line) < 100:
                # Save previous
                if current_article:
                    current_article.clauses = current_clauses
                    articles.append(current_article)
                
                # Start new
                art_type = match.group(1)
                art_num = match.group(2)
                art_id = f"{art_type}-{art_num}"
                
                current_article = Article(
                    article_id=art_id,
                    title=line,
                    clauses=[]
                )
                current_clauses = []
            else:
                # It's content
                if current_article is None:
                    # Create a dummy Intro article
                    current_article = Article(
                        article_id="Intro", 
                        title="Preamble / Introduction", 
                        clauses=[]
                    )
                
                # Check if it's a new clause (simple heuristic: if it looks like a list item or new para)
                # For now, every non-empty line is a clause/paragraph
                clause_id = f"{current_article.article_id}-{len(current_clauses)+1}"
                
                # Naive classification (can use LLM here later)
                c_type = ClauseType.OTHER
                lower_line = line.lower()
                if "shall" in lower_line or "must" in lower_line or "required" in lower_line:
                    c_type = ClauseType.OBLIGATION
                elif "prohibited" in lower_line or "shall not" in lower_line:
                    c_type = ClauseType.PROHIBITION
                elif "penalty" in lower_line or "fine" in lower_line:
                    c_type = ClauseType.PENALTY
                    
                current_clauses.append(Clause(
                    clause_id=clause_id,
                    text=line,
                    parent_article=current_article.article_id,
                    clause_type=c_type
                ))

        # Append last
        if current_article:
            current_article.clauses = current_clauses
            articles.append(current_article)
            
        return LegalDocument(
            source=source_url,
            parsed_at=datetime.now(),
            article_count=len(articles),
            articles=articles
        )
