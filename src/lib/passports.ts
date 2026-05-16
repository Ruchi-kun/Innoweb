import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

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

const latestPassportQuery = () => query(collection(db, "passports"), orderBy("updatedAt", "desc"), limit(1));

const mapPassport = (snapshot: QueryDocumentSnapshot<DocumentData>): PassportData => ({
  id: snapshot.id,
  ...(snapshot.data() as Omit<PassportData, "id">),
});

export const getLatestPassport = async (): Promise<PassportData | null> => {
  const snapshot = await getDocs(latestPassportQuery());
  const latest = snapshot.docs[0];
  return latest ? mapPassport(latest) : null;
};

export const subscribeLatestPassport = (onChange: (passport: PassportData | null) => void) =>
  onSnapshot(latestPassportQuery(), (snapshot) => {
    const latest = snapshot.docs[0];
    onChange(latest ? mapPassport(latest) : null);
  });
