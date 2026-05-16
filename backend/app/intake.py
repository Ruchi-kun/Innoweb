from __future__ import annotations

import json
import os
import re
from typing import Any

import google.generativeai as genai

from .models import CompanyEcosystemNode, ExtractedVectors


REQUIRED_FIELDS = [
    "companyName",
    "companyType",
    "primaryIndustry",
    "operatingStage",
    "keyCapabilities",
    "operationalNeeds",
    "targetMarkets",
    "businessModel",
]


def _model_name() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _extract_json(raw: str) -> dict[str, Any]:
    text = raw.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    return json.loads(text)


def _empty_node(reason: str) -> CompanyEcosystemNode:
    return CompanyEcosystemNode(
        companyName="Unknown Company",
        isDataSufficient=False,
        missingFieldsReasoning=reason,
        extractedVectors=ExtractedVectors(
            companyType="",
            primaryIndustry="",
            operatingStage="",
            keyCapabilities=[],
            operationalNeeds=[],
            targetMarkets=[],
            businessModel="",
        ),
    )


def extract_company_node(context: str) -> CompanyEcosystemNode:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _empty_node("GOOGLE_API_KEY or GEMINI_API_KEY is required for company intake extraction.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(_model_name())
    prompt = f"""
You are extracting company data for Innoweb, an innovation ecosystem platform.
Return only JSON with this exact shape:
{{
  "companyName": "string",
  "isDataSufficient": true,
  "missingFieldsReasoning": "string",
  "extractedVectors": {{
    "companyType": "string",
    "primaryIndustry": "string",
    "operatingStage": "string",
    "keyCapabilities": ["string"],
    "operationalNeeds": ["string"],
    "targetMarkets": ["string"],
    "businessModel": "string",
    "productsOrServices": ["string"],
    "targetCorporateSectors": ["string"],
    "fundingTargetMYR": null,
    "teamGaps": ["string"],
    "regulatoryRequirements": ["string"],
    "partnershipGoals": ["string"]
  }}
}}

Required fields are: {", ".join(REQUIRED_FIELDS)}.
If any required field is missing or too vague, set isDataSufficient false and explain the missing information conversationally.

Input:
\"\"\"
{context}
\"\"\"
"""
    result = model.generate_content(prompt)
    data = _extract_json(result.text)
    return CompanyEcosystemNode.model_validate(data)
