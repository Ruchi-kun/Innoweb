import { listAdminDocuments } from "./api";

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  reasoning: string[];
}

export interface PassportData {
  id: string;
  companyId: string;
  companyName: string;
  companyType?: string;
  scoreTotal: number;
  tier: string;
  breakdown: ScoreBreakdown[];
  programmeHistory?: Array<Record<string, unknown>>;
  matchHistory?: Array<Record<string, unknown>>;
  engagementSignals?: Array<Record<string, unknown>>;
  auditTrail?: Array<Record<string, unknown>>;
  createdAt?: string;
  updatedAt?: string;
}

const sortByUpdatedAtDesc = (passports: PassportData[]) =>
  passports.slice().sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));

export const getLatestPassport = async (): Promise<PassportData | null> => {
  const passports = await listAdminDocuments<PassportData>("passports");
  return sortByUpdatedAtDesc(passports)[0] || null;
};

export const subscribeLatestPassport = (onChange: (passport: PassportData | null) => void) => {
  let active = true;

  const refresh = async () => {
    try {
      const passport = await getLatestPassport();
      if (active) onChange(passport);
    } catch (error) {
      console.error("Error loading latest passport through Admin API:", error);
      if (active) onChange(null);
    }
  };

  void refresh();
  const intervalId = window.setInterval(refresh, 5000);

  return () => {
    active = false;
    window.clearInterval(intervalId);
  };
};
