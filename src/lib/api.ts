import type { StartupEcosystemNode } from "../schema";

const API_BASE_URL = import.meta.env.VITE_INNOWEB_API_URL || "http://localhost:8000";

export interface IntakeAnalyzeResponse {
  status: "verified" | "needs_clarification";
  companyId?: string;
  passportId?: string;
  missingFieldsReasoning?: string;
  sessionId?: string;
}

export interface ProgrammeMatch {
  id: string;
  companyId: string;
  score: number;
}

export type ProgrammeEventType =
  | "programme_created"
  | "programme_cancelled"
  | "joined"
  | "milestone_completed"
  | "programme_completed"
  | "match_accepted"
  | "match_rejected"
  | "engagement_low";

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Backend request failed");
  }

  return response.json() as Promise<T>;
};

export const analyzeIntake = (params: {
  sourceType: "pdf_text" | "drive_link";
  content: string;
  fileName?: string;
}) =>
  requestJson<IntakeAnalyzeResponse>("/api/intake/analyze", {
    method: "POST",
    body: JSON.stringify(params),
  });

export const clarifyIntake = (params: { sessionId: string; message: string }) =>
  requestJson<IntakeAnalyzeResponse>("/api/intake/clarify", {
    method: "POST",
    body: JSON.stringify(params),
  });

export const runProgrammeMatching = (programmeId: string) =>
  requestJson<{ programmeId: string; matches: ProgrammeMatch[] }>(`/api/programmes/${programmeId}/match`, {
    method: "POST",
  });

export const recordProgrammeEvent = (
  programmeId: string,
  params: { companyId: string; eventType: ProgrammeEventType; payload?: Record<string, unknown> },
) =>
  requestJson<{ passportId: string; passport: Record<string, unknown> }>(`/api/programmes/${programmeId}/events`, {
    method: "POST",
    body: JSON.stringify({
      companyId: params.companyId,
      eventType: params.eventType,
      payload: params.payload || {},
    }),
  });

export const runConflictDetection = () =>
  requestJson<{ detected: Array<Record<string, unknown>> }>("/api/admin/conflicts/run", {
    method: "POST",
  });

export type { StartupEcosystemNode };
