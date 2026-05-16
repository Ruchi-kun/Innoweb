from __future__ import annotations

try:
    from google.adk.agents import Agent, SequentialAgent
except Exception:  # pragma: no cover - lets non-ADK API tests import the module before deps are installed.
    Agent = None
    SequentialAgent = None

from .tools import create_passport_from_context, record_programme_event, run_conflict_detection, run_programme_matching


if Agent and SequentialAgent:
    intake_agent = Agent(
        name="intake_extraction_agent",
        model="gemini-2.5-flash",
        instruction="Extract company vectors, validate required fields, and create a Firestore company passport.",
        tools=[create_passport_from_context],
    )

    passport_update_agent = Agent(
        name="programme_update_agent",
        model="gemma-4-31b-it",
        instruction="Apply programme events to existing company passports using deterministic scoring tools.",
        tools=[record_programme_event],
    )

    matching_agent = Agent(
        name="matching_agent",
        model="gemini-3.1-flash-lite",
        instruction="Run compatibility matching and persist ranked match proposals.",
        tools=[run_programme_matching],
    )

    conflict_guardrail_agent = Agent(
        name="conflict_guardrail_agent",
        model="gemma-4-31b-it",
        instruction="Detect programme, passport, and match conflicts and persist unresolved guardrail records.",
        tools=[run_conflict_detection],
    )

    root_agent = SequentialAgent(
        name="innoweb_pipeline_agent",
        sub_agents=[intake_agent, passport_update_agent, matching_agent, conflict_guardrail_agent],
        description="Innoweb ADK pipeline for passport creation, programme updates, matching, and guardrails.",
    )
else:
    root_agent = None
