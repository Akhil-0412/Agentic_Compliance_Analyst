from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ComplianceResponse(BaseModel):
    """
    Structured response for GDPR compliance analysis.
    """
    summary: str = Field(
        ..., 
        description="A concise summary of the legal situation based on the provided text."
    )
    legal_basis: str = Field(
        ..., 
        description="Specific articles or clauses that apply (e.g., 'Article 83(4)')."
    )
    risk_analysis: str = Field(
        ..., 
        description="Analysis of potential risks, fines, or obligations."
    )
    risk_level: RiskLevel = Field(
        ..., 
        description="The severity of the risk."
    )
    confidence_score: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Confidence score between 0.0 and 1.0 based on how well the context answers the query."
    )
    references: List[str] = Field(
        default_factory=list,
        description="List of specific article IDs referenced (e.g. ['83', '28'])."
    )

    @field_validator('confidence_score')
    @classmethod
    def validate_confidence(cls, v):
        return round(v, 2)
