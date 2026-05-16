from __future__ import annotations

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import IntakeAnalyzeRequest, IntakeClarifyRequest, IntakeResponse, ProgrammeEventRequest
from .tools import (
    clarify_intake_session,
    create_passport_from_context,
    get_passport_for_company,
    record_programme_event,
    run_conflict_detection,
    run_programme_matching,
)


app = FastAPI(title="Innoweb ADK Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _handle_error(exc: Exception) -> HTTPException:
    return HTTPException(status_code=400, detail=str(exc))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/intake/analyze", response_model=IntakeResponse)
def intake_analyze(request: IntakeAnalyzeRequest) -> dict:
    try:
        return create_passport_from_context(request.sourceType, request.content, request.fileName)
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.post("/api/intake/clarify", response_model=IntakeResponse)
def intake_clarify(request: IntakeClarifyRequest) -> dict:
    try:
        return clarify_intake_session(request.sessionId, request.message)
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.get("/api/passports/{company_id}")
def passport(company_id: str) -> dict:
    try:
        return get_passport_for_company(company_id)
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.post("/api/programmes/{programme_id}/events")
def programme_event(programme_id: str, request: ProgrammeEventRequest) -> dict:
    try:
        return record_programme_event(programme_id, request.companyId, request.eventType, request.payload)
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.post("/api/programmes/{programme_id}/match")
def programme_match(programme_id: str) -> dict:
    try:
        return run_programme_matching(programme_id)
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.post("/api/admin/conflicts/run")
def admin_conflicts() -> dict:
    try:
        return run_conflict_detection()
    except Exception as exc:
        raise _handle_error(exc) from exc
