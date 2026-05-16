from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ExtractedVectors(BaseModel):
    companyType: str
    primaryIndustry: str
    operatingStage: str
    keyCapabilities: list[str]
    operationalNeeds: list[str]
    targetMarkets: list[str]
    businessModel: str
    productsOrServices: list[str] = Field(default_factory=list)
    targetCorporateSectors: list[str] = Field(default_factory=list)
    fundingTargetMYR: float | None = None
    teamGaps: list[str] = Field(default_factory=list)
    regulatoryRequirements: list[str] = Field(default_factory=list)
    partnershipGoals: list[str] = Field(default_factory=list)


class CompanyEcosystemNode(BaseModel):
    companyName: str
    isDataSufficient: bool
    missingFieldsReasoning: str = ""
    extractedVectors: ExtractedVectors


class IntakeAnalyzeRequest(BaseModel):
    sourceType: Literal["pdf_text", "drive_link"]
    content: str
    fileName: str | None = None


class IntakeClarifyRequest(BaseModel):
    sessionId: str
    message: str


class IntakeResponse(BaseModel):
    status: Literal["verified", "needs_clarification"]
    companyId: str | None = None
    passportId: str | None = None
    missingFieldsReasoning: str | None = None
    sessionId: str | None = None


class ProgrammeEventRequest(BaseModel):
    companyId: str
    eventType: Literal[
        "joined",
        "milestone_completed",
        "programme_completed",
        "match_accepted",
        "match_rejected",
        "engagement_low",
    ]
    payload: dict[str, Any] = Field(default_factory=dict)


class ScoreBreakdownItem(BaseModel):
    category: str
    score: int
    maxScore: int
    reasoning: list[str]


class Passport(BaseModel):
    companyId: str
    companyName: str
    companyType: str
    scoreTotal: int
    tier: str
    breakdown: list[ScoreBreakdownItem]
    programmeHistory: list[dict[str, Any]] = Field(default_factory=list)
    matchHistory: list[dict[str, Any]] = Field(default_factory=list)
    engagementSignals: list[dict[str, Any]] = Field(default_factory=list)
    auditTrail: list[dict[str, Any]] = Field(default_factory=list)
    createdAt: str = Field(default_factory=utc_now_iso)
    updatedAt: str = Field(default_factory=utc_now_iso)


class MatchStatus(str, Enum):
    proposed = "proposed"
    accepted_by_one = "accepted_by_one"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"
