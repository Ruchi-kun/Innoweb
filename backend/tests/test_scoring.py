from app.models import CompanyEcosystemNode, ExtractedVectors
from app.scoring import apply_programme_event, build_passport, tier_for_score


def sample_node() -> CompanyEcosystemNode:
    return CompanyEcosystemNode(
        companyName="Acme AI",
        isDataSufficient=True,
        missingFieldsReasoning="",
        extractedVectors=ExtractedVectors(
            companyType="Startup",
            primaryIndustry="AI",
            operatingStage="MVP",
            keyCapabilities=["computer vision", "workflow automation", "data engineering"],
            operationalNeeds=["Mentorship"],
            targetMarkets=["Malaysia", "Singapore"],
            businessModel="SaaS",
            productsOrServices=["AI inspection platform"],
            partnershipGoals=["enterprise pilots"],
        ),
    )


def test_tier_boundaries() -> None:
    assert tier_for_score(80) == "Gold"
    assert tier_for_score(60) == "Silver"
    assert tier_for_score(40) == "Bronze"
    assert tier_for_score(39) == "Needs Review"


def test_build_passport_creates_audited_score() -> None:
    passport = build_passport("company-1", sample_node())

    assert passport.companyId == "company-1"
    assert passport.companyName == "Acme AI"
    assert passport.scoreTotal > 0
    assert passport.auditTrail[0]["eventType"] == "passport_created"


def test_programme_completion_updates_engagement_score() -> None:
    passport = build_passport("company-1", sample_node()).model_dump()
    before = passport["scoreTotal"]

    updated = apply_programme_event(passport, "programme-1", "programme_completed", {"name": "Accelerator"})

    assert updated["scoreTotal"] > before
    assert updated["programmeHistory"][0]["eventType"] == "programme_completed"
    assert updated["auditTrail"][-1]["programmeId"] == "programme-1"


def test_programme_created_updates_engagement_score() -> None:
    passport = build_passport("company-1", sample_node()).model_dump()
    before = passport["scoreTotal"]

    updated = apply_programme_event(passport, "programme-1", "programme_created", {"name": "Accelerator"})

    assert updated["scoreTotal"] > before
    assert updated["programmeHistory"][0]["eventType"] == "programme_created"
    assert updated["auditTrail"][-1]["eventType"] == "programme_created"


def test_programme_cancelled_reduces_engagement_score_without_negative_breakdown() -> None:
    passport = build_passport("company-1", sample_node()).model_dump()
    created = apply_programme_event(passport, "programme-1", "programme_created", {"name": "Accelerator"})

    cancelled = apply_programme_event(created, "programme-1", "programme_cancelled", {"name": "Accelerator"})
    engagement = next(item for item in cancelled["breakdown"] if item["category"] == "Engagement & Programme History")

    assert cancelled["scoreTotal"] < created["scoreTotal"]
    assert engagement["score"] >= 0
    assert cancelled["programmeHistory"][-1]["eventType"] == "programme_cancelled"
    assert cancelled["auditTrail"][-1]["eventType"] == "programme_cancelled"
