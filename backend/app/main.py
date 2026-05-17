from __future__ import annotations

from dotenv import load_dotenv

load_dotenv()

from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .firebase_client import create_document, get_document, list_documents, set_document, update_document
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

ADMIN_COLLECTIONS = {"adminData", "companies", "passports", "programmes"}


def _handle_error(exc: Exception) -> HTTPException:
    return HTTPException(status_code=400, detail=str(exc))


def _validate_collection(collection_name: str) -> None:
    if collection_name not in ADMIN_COLLECTIONS:
        raise ValueError(f"Collection {collection_name} is not available through the Admin API.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/admin/collections/{collection_name}")
def admin_list_documents(collection_name: str) -> dict[str, list[dict[str, Any]]]:
    try:
        _validate_collection(collection_name)
        return {"documents": list_documents(collection_name)}
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.post("/api/admin/collections/{collection_name}")
def admin_create_document(collection_name: str, data: dict[str, Any]) -> dict[str, str]:
    try:
        _validate_collection(collection_name)
        return {"id": create_document(collection_name, data)}
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.get("/api/admin/collections/{collection_name}/{doc_id}")
def admin_get_document(collection_name: str, doc_id: str) -> dict[str, Any]:
    try:
        _validate_collection(collection_name)
        document = get_document(collection_name, doc_id)
        if document is None:
            raise ValueError(f"Document {collection_name}/{doc_id} was not found.")
        return document
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.put("/api/admin/collections/{collection_name}/{doc_id}")
def admin_set_document(collection_name: str, doc_id: str, data: dict[str, Any]) -> dict[str, str]:
    try:
        _validate_collection(collection_name)
        set_document(collection_name, doc_id, data)
        return {"id": doc_id}
    except Exception as exc:
        raise _handle_error(exc) from exc


@app.patch("/api/admin/collections/{collection_name}/{doc_id}")
def admin_update_document(collection_name: str, doc_id: str, data: dict[str, Any]) -> dict[str, str]:
    try:
        _validate_collection(collection_name)
        update_document(collection_name, doc_id, data)
        return {"id": doc_id}
    except Exception as exc:
        raise _handle_error(exc) from exc


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
