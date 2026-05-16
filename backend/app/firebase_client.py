from __future__ import annotations

import os
import json
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore


_db: firestore.Client | None = None


def get_db() -> firestore.Client:
    global _db
    if _db is not None:
        return _db

    if not firebase_admin._apps:
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if service_account_json:
            cred = credentials.Certificate(json.loads(service_account_json))
        elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            cred = credentials.ApplicationDefault()
        else:
            raise RuntimeError(
                "Firebase Admin credentials are not configured. Set GOOGLE_APPLICATION_CREDENTIALS "
                "to a service-account JSON path or FIREBASE_SERVICE_ACCOUNT_JSON to the JSON payload."
            )
        firebase_admin.initialize_app(cred)

    _db = firestore.client()
    return _db


def create_document(collection_name: str, data: dict[str, Any]) -> str:
    _, ref = get_db().collection(collection_name).add(data)
    return ref.id


def set_document(collection_name: str, doc_id: str, data: dict[str, Any]) -> None:
    get_db().collection(collection_name).document(doc_id).set(data)


def update_document(collection_name: str, doc_id: str, data: dict[str, Any]) -> None:
    get_db().collection(collection_name).document(doc_id).update(data)


def get_document(collection_name: str, doc_id: str) -> dict[str, Any] | None:
    snap = get_db().collection(collection_name).document(doc_id).get()
    if not snap.exists:
        return None
    return {"id": snap.id, **snap.to_dict()}


def list_documents(collection_name: str, limit: int = 200) -> list[dict[str, Any]]:
    return [{"id": snap.id, **snap.to_dict()} for snap in get_db().collection(collection_name).limit(limit).stream()]


def find_passport_by_company(company_id: str) -> tuple[str, dict[str, Any]] | None:
    query = get_db().collection("passports").where("companyId", "==", company_id).limit(1).stream()
    for snap in query:
        return snap.id, snap.to_dict()
    return None
