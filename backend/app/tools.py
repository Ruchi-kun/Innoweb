from __future__ import annotations

from typing import Any

from .firebase_client import create_document, find_passport_by_company, get_document, list_documents, set_document, update_document
from .intake import extract_company_node
from .models import utc_now_iso
from .scoring import apply_programme_event, build_passport


def create_passport_from_context(source_type: str, content: str, file_name: str | None = None) -> dict[str, Any]:
    context = f"[{source_type}: {file_name or 'inline'}]\n{content}"
    node = extract_company_node(context)

    if not node.isDataSufficient:
        session_id = create_document(
            "intakeSessions",
            {
                "sourceType": source_type,
                "content": content,
                "fileName": file_name,
                "missingFieldsReasoning": node.missingFieldsReasoning,
                "status": "needs_clarification",
                "createdAt": utc_now_iso(),
                "updatedAt": utc_now_iso(),
            },
        )
        return {
            "status": "needs_clarification",
            "sessionId": session_id,
            "missingFieldsReasoning": node.missingFieldsReasoning,
        }

    company_data = {
        **node.model_dump(),
        "verificationStatus": "verified",
        "createdAt": utc_now_iso(),
        "updatedAt": utc_now_iso(),
    }
    company_id = create_document("companies", company_data)
    passport = build_passport(company_id, node)
    passport_id = create_document("passports", passport.model_dump())
    update_document("companies", company_id, {"passportId": passport_id})
    return {"status": "verified", "companyId": company_id, "passportId": passport_id}


def clarify_intake_session(session_id: str, message: str) -> dict[str, Any]:
    session = get_document("intakeSessions", session_id)
    if not session:
        raise ValueError(f"Intake session {session_id} was not found.")

    previous_messages = session.get("messages", [])
    messages = [*previous_messages, {"role": "user", "text": message, "createdAt": utc_now_iso()}]
    combined = f"""
Original input:
{session.get("content", "")}

Clarification messages:
{messages}
"""
    node = extract_company_node(combined)
    update_document(
        "intakeSessions",
        session_id,
        {
            "messages": messages,
            "missingFieldsReasoning": node.missingFieldsReasoning,
            "status": "verified" if node.isDataSufficient else "needs_clarification",
            "updatedAt": utc_now_iso(),
        },
    )

    if not node.isDataSufficient:
        return {
            "status": "needs_clarification",
            "sessionId": session_id,
            "missingFieldsReasoning": node.missingFieldsReasoning,
        }

    company_id = create_document(
        "companies",
        {
            **node.model_dump(),
            "verificationStatus": "verified",
            "createdAt": utc_now_iso(),
            "updatedAt": utc_now_iso(),
        },
    )
    passport = build_passport(company_id, node)
    passport_id = create_document("passports", passport.model_dump())
    update_document("companies", company_id, {"passportId": passport_id})
    return {"status": "verified", "companyId": company_id, "passportId": passport_id}


def record_programme_event(programme_id: str, company_id: str, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
    passport_pair = find_passport_by_company(company_id)
    if not passport_pair:
        raise ValueError(f"No passport exists for company {company_id}.")
    passport_id, passport = passport_pair
    updated = apply_programme_event(passport, programme_id, event_type, payload)
    set_document("passports", passport_id, updated)
    create_document(
        "programmeEvents",
        {
            "programmeId": programme_id,
            "companyId": company_id,
            "eventType": event_type,
            "payload": payload,
            "createdAt": utc_now_iso(),
        },
    )
    return {"passportId": passport_id, "passport": updated}


def get_passport_for_company(company_id: str) -> dict[str, Any]:
    passport_pair = find_passport_by_company(company_id)
    if not passport_pair:
        raise ValueError(f"No passport exists for company {company_id}.")
    passport_id, passport = passport_pair
    return {"id": passport_id, **passport}


def run_programme_matching(programme_id: str) -> dict[str, Any]:
    programme = get_document("programmes", programme_id)
    if not programme:
        raise ValueError(f"Programme {programme_id} was not found.")

    companies = list_documents("companies")
    required_entities = set(programme.get("entities", []))
    matches = []

    for company in companies:
        vectors = company.get("extractedVectors", {})
        company_type = vectors.get("companyType", "")
        if required_entities and company_type not in required_entities:
            continue
        score = 40
        if programme.get("type", "").lower() in " ".join(vectors.get("operationalNeeds", [])).lower():
            score += 15
        if vectors.get("primaryIndustry") and vectors.get("primaryIndustry", "").lower() in programme.get("description", "").lower():
            score += 15
        score += min(20, len(vectors.get("keyCapabilities", [])) * 3)
        score += min(10, len(vectors.get("targetMarkets", [])) * 2)
        match_id = create_document(
            "matches",
            {
                "programmeId": programme_id,
                "sourceCompanyId": company["id"],
                "targetCompanyId": None,
                "score": min(score, 100),
                "status": "proposed",
                "conflictFlags": [],
                "createdAt": utc_now_iso(),
                "updatedAt": utc_now_iso(),
            },
        )
        matches.append({"id": match_id, "companyId": company["id"], "score": min(score, 100)})

    matches.sort(key=lambda item: item["score"], reverse=True)
    return {"programmeId": programme_id, "matches": matches}


def run_conflict_detection() -> dict[str, Any]:
    programmes = list_documents("programmes")
    companies = list_documents("companies")
    matches = list_documents("matches")
    detected = []

    for company in companies:
        if company.get("verificationStatus") != "verified":
            detected.append(
                {
                    "conflictType": "incomplete_credentials",
                    "description": f"{company.get('companyName', company['id'])} has incomplete or unverified credentials.",
                    "companyId": company["id"],
                }
            )

    programme_dates: dict[tuple[str | None, str | None], list[str]] = {}
    for programme in programmes:
        key = (programme.get("startDate"), programme.get("endDate"))
        programme_dates.setdefault(key, []).append(programme["id"])
    for ids in programme_dates.values():
        if len(ids) > 1:
            detected.append(
                {
                    "conflictType": "programme_overlap",
                    "description": f"Programmes share the same date window: {', '.join(ids)}.",
                    "programmeIds": ids,
                }
            )

    for match in matches:
        if match.get("score", 0) < 50:
            detected.append(
                {
                    "conflictType": "low_match_score",
                    "description": f"Match {match['id']} is below compatibility threshold.",
                    "matchId": match["id"],
                }
            )

    saved = []
    for conflict in detected:
        conflict_id = create_document(
            "conflicts",
            {
                **conflict,
                "status": "unresolved",
                "detectedAt": utc_now_iso(),
            },
        )
        saved.append({"id": conflict_id, **conflict})

    return {"detected": saved}
