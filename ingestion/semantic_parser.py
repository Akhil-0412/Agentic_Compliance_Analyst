from schemas import ClauseType

def classify_clause(text: str) -> ClauseType:
    t = text.lower()

    # Priority 1: High-stakes consequences
    if any(word in t for word in ["fine", "penalty", "liable", "administrative fine"]):
        return ClauseType.PENALTY

    # Priority 2: Clear logical constraints
    if "shall not" in t or "must not" in t or "prohibited" in t:
        return ClauseType.PROHIBITION

    # Priority 3: Definitions
    if "means" in t or "for the purposes of" in t or "referred to as" in t:
        return ClauseType.DEFINITION

    # Priority 4: Obligations vs Permissions
    if "shall" in t or "must" in t or "is required" in t:
        return ClauseType.OBLIGATION

    if "may" in t or "is entitled to" in t:
        return ClauseType.PERMISSION

    # Priority 5: High-level principles
    if "principle" in t:
        return ClauseType.PRINCIPLE

    return ClauseType.OTHER