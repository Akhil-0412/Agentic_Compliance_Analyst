from __future__ import annotations

from enum import Enum
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LegalDocument(BaseModel):
    source: str
    parsed_at: datetime
    article_count: int
    articles: list[Article]

class ClauseType(str, Enum):
    OBLIGATION = "obligation"
    PERMISSION = "permission"
    PROHIBITION = "prohibition"
    DEFINITION = "definition"
    PRINCIPLE = "principle"
    PENALTY = "penalty"
    OTHER = "other"

class Clause(BaseModel):
    clause_id: str
    text: str
    parent_article: str
    clause_type: ClauseType

class Article(BaseModel):
    article_id: str
    title: Optional[str]
    clauses: List[Clause]