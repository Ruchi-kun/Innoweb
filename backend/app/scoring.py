from __future__ import annotations

from typing import Any

from .models import CompanyEcosystemNode, Passport, ScoreBreakdownItem, utc_now_iso


def tier_for_score(score: int) -> str:
    if score >= 80:
        return "Gold"
    if score >= 60:
        return "Silver"
    if score >= 40:
        return "Bronze"
    return "Needs Review"


def score_company(node: CompanyEcosystemNode) -> list[ScoreBreakdownItem]:
    vectors = node.extractedVectors
    has_optional_depth = sum(
        bool(value)
        for value in [
            vectors.productsOrServices,
            vectors.targetCorporateSectors,
            vectors.fundingTargetMYR,
            vectors.teamGaps,
            vectors.regulatoryRequirements,
            vectors.partnershipGoals,
        ]
    )

    team_score = min(25, 12 + len(vectors.keyCapabilities) * 3)
    readiness_score = min(25, 12 + len(vectors.productsOrServices) * 3 + (4 if vectors.operatingStage else 0))
    market_score = min(20, 8 + len(vectors.targetMarkets) * 3 + len(vectors.partnershipGoals) * 2)
    compliance_score = 15 if node.isDataSufficient else 6
    engagement_score = min(15, has_optional_depth * 2)

    return [
        ScoreBreakdownItem(
            category="Team & Expertise",
            score=team_score,
            maxScore=25,
            reasoning=[
                f"{len(vectors.keyCapabilities)} declared capabilities were extracted.",
                f"Operating stage captured as {vectors.operatingStage}.",
            ],
        ),
        ScoreBreakdownItem(
            category="Product / Service Readiness",
            score=readiness_score,
            maxScore=25,
            reasoning=[
                f"Business model captured as {vectors.businessModel}.",
                f"{len(vectors.productsOrServices)} products or services were identified.",
            ],
        ),
        ScoreBreakdownItem(
            category="Market & Traction",
            score=market_score,
            maxScore=20,
            reasoning=[
                f"{len(vectors.targetMarkets)} target markets were identified.",
                f"{len(vectors.partnershipGoals)} partnership goals were identified.",
            ],
        ),
        ScoreBreakdownItem(
            category="Compliance & Verification",
            score=compliance_score,
            maxScore=15,
            reasoning=[
                "Required company vectors are complete." if node.isDataSufficient else node.missingFieldsReasoning,
                f"{len(vectors.regulatoryRequirements)} regulatory requirements were identified.",
            ],
        ),
        ScoreBreakdownItem(
            category="Engagement & Programme History",
            score=engagement_score,
            maxScore=15,
            reasoning=["No programme events have been completed yet.", "Engagement score increases as programme activity is logged."],
        ),
    ]


def build_passport(company_id: str, node: CompanyEcosystemNode) -> Passport:
    breakdown = score_company(node)
    total = sum(item.score for item in breakdown)
    return Passport(
        companyId=company_id,
        companyName=node.companyName,
        companyType=node.extractedVectors.companyType,
        scoreTotal=total,
        tier=tier_for_score(total),
        breakdown=breakdown,
        auditTrail=[
            {
                "eventType": "passport_created",
                "reason": "Company intake data passed required vector validation.",
                "createdAt": utc_now_iso(),
            }
        ],
    )


def apply_programme_event(passport: dict[str, Any], programme_id: str, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
    now = utc_now_iso()
    updated = dict(passport)
    updated.setdefault("programmeHistory", [])
    updated.setdefault("matchHistory", [])
    updated.setdefault("engagementSignals", [])
    updated.setdefault("auditTrail", [])
    updated.setdefault("breakdown", [])

    event = {"programmeId": programme_id, "eventType": event_type, "payload": payload, "createdAt": now}

    if event_type in {"joined", "milestone_completed", "programme_completed"}:
        updated["programmeHistory"] = [*updated["programmeHistory"], event]
    elif event_type in {"match_accepted", "match_rejected"}:
        updated["matchHistory"] = [*updated["matchHistory"], event]
    elif event_type == "engagement_low":
        updated["engagementSignals"] = [*updated["engagementSignals"], event]

    updated["auditTrail"] = [*updated["auditTrail"], event]

    engagement_bonus = {
        "joined": 2,
        "milestone_completed": 4,
        "programme_completed": 6,
        "match_accepted": 3,
        "match_rejected": 0,
        "engagement_low": -3,
    }.get(event_type, 0)

    breakdown = []
    for item in updated["breakdown"]:
        item = dict(item)
        if item.get("category") == "Engagement & Programme History":
            item["score"] = max(0, min(int(item.get("maxScore", 15)), int(item.get("score", 0)) + engagement_bonus))
            item["reasoning"] = [f"Latest programme event: {event_type}.", "Programme history is reflected in this category."]
        breakdown.append(item)

    updated["breakdown"] = breakdown
    updated["scoreTotal"] = sum(int(item.get("score", 0)) for item in breakdown)
    updated["tier"] = tier_for_score(updated["scoreTotal"])
    updated["updatedAt"] = now
    return updated
