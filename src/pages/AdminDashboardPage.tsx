import React, { useState, useEffect } from "react";
import { Activity, Users, Link2, Clock, HelpCircle, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { runConflictDetection } from "../lib/api";
import type { PassportData } from "../lib/passports";

export interface Conflict {
  id: string;
  description: string;
}

export interface DetectedConflict {
  id: string;
  description: string;
  detectedAt: string;
  status: "unresolved" | "in_progress" | "resolved";
}

export interface Interaction {
  id: string;
  companyName: string;
  entityType: "Startup" | "Mentor" | "Sponsor" | "Venue";
  interactionType: string;
  status: "Active" | "Pending" | "Completed" | "Failed";
  date: string;
}

export interface ProgrammeData {
  name: string;
  totalCompanies: number;
  activeConnections: number;
  pendingMatches: number;
  companies: {
    name: string;
    entityType: string;
    sector: string;
    mentorLoad: number;
    credentialsVerified: boolean;
    sponsorConfirmed: boolean;
    venueBookingDates: string[];
  }[];
}

interface MatchActivity {
  id: string;
  pair: string;
  score: number;
  outcome: "Matched" | "Failed" | "Conflict Raised";
  timestamp: string;
}

interface AdminData {
  currentInteractions: Interaction[];
  historyInteractions: Interaction[];
  aiMatches: MatchActivity[];
  programmeData: ProgrammeData;
}

interface ProgrammeSummary {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  entities?: string[];
  status?: string;
}

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

const defaultAdminData = {
  currentInteractions: [
    { id: "I001", companyName: "Rocketlab Sdn Bhd", entityType: "Startup", interactionType: "Match Request", status: "Active", date: "2026-05-16" },
    { id: "I002", companyName: "TechVentures", entityType: "Mentor", interactionType: "Programme Join", status: "Pending", date: "2026-05-15" },
    { id: "I003", companyName: "CorporateX", entityType: "Sponsor", interactionType: "Commitment Confirmation", status: "Failed", date: "2026-05-14" },
    { id: "I004", companyName: "BookedSpace KL", entityType: "Venue", interactionType: "Venue Booking", status: "Active", date: "2026-05-16" }
  ],
  historyInteractions: [
    { id: "H001", companyName: "NovaMed", entityType: "Startup", interactionType: "Programme Completed", status: "Completed", date: "2026-04-30" },
    { id: "H002", companyName: "MentorCo", entityType: "Mentor", interactionType: "Match Completed", status: "Completed", date: "2026-04-28" },
    { id: "H003", companyName: "FundersInc", entityType: "Sponsor", interactionType: "Sponsorship Delivered", status: "Completed", date: "2026-04-25" }
  ],
  aiMatches: [
    { id: "M1", pair: "Rocketlab Sdn Bhd ↔ TechVentures", score: 92, outcome: "Matched", timestamp: "2026-05-16T10:00:00Z" },
    { id: "M2", pair: "NovaMed ↔ MentorCo", score: 88, outcome: "Matched", timestamp: "2026-05-15T14:30:00Z" },
    { id: "M3", pair: "GreenTech ↔ CorporateX", score: 45, outcome: "Failed", timestamp: "2026-05-14T09:15:00Z" },
    { id: "M4", pair: "EduStartup ↔ ExpertMentor", score: 85, outcome: "Conflict Raised", timestamp: "2026-05-13T16:45:00Z" },
    { id: "M5", pair: "HealthPlus ↔ MentorCo", score: 95, outcome: "Matched", timestamp: "2026-05-12T11:20:00Z" }
  ],
  programmeData: {
    name: "MyHack 2026 Accelerator",
    totalCompanies: 12,
    activeConnections: 8,
    pendingMatches: 3,
    companies: [
      { name: "Rocketlab Sdn Bhd", entityType: "Startup", sector: "Deeptech", mentorLoad: 4, credentialsVerified: false, sponsorConfirmed: true, venueBookingDates: ["2026-05-16", "2026-05-17"] },
      { name: "TechVentures", entityType: "Mentor", sector: "Fintech", mentorLoad: 5, credentialsVerified: true, sponsorConfirmed: true, venueBookingDates: [] },
      { name: "CorporateX", entityType: "Sponsor", sector: "General", mentorLoad: 0, credentialsVerified: true, sponsorConfirmed: false, venueBookingDates: [] },
      { name: "BookedSpace KL", entityType: "Venue", sector: "General", mentorLoad: 0, credentialsVerified: true, sponsorConfirmed: true, venueBookingDates: ["2026-05-16", "2026-05-17"] }
    ]
  }
};

interface ConflictCardProps {
  conflict: DetectedConflict;
  onResolveManually: (id: string) => void;
  onReRunAi: () => void;
  onDismiss: (id: string) => void;
  isResolved?: boolean;
}

const ConflictCard: React.FC<ConflictCardProps> = ({ conflict, onResolveManually, onReRunAi, onDismiss, isResolved }) => {
  const borderColor = isResolved ? "border-slate-300" : conflict.status === "unresolved" ? "border-rose-500" : "border-amber-500";
  const bgColor = isResolved ? "bg-slate-50" : "bg-white";
  const textColor = isResolved ? "text-slate-500" : "text-slate-800";

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} rounded-r-lg p-4 shadow-sm mb-4 border border-slate-100`}>
      <p className={`text-base mb-3 font-medium ${textColor}`}>{conflict.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Detected {timeAgo(conflict.detectedAt)}
        </span>
        {!isResolved && (
          <div className="flex gap-2">
            <button 
              onClick={() => onResolveManually(conflict.id)}
              disabled={conflict.status === "in_progress"}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            >
              {conflict.status === "in_progress" ? "In Progress" : "Resolve Manually"}
            </button>
            <button 
              onClick={onReRunAi}
              className="px-3 py-1.5 text-sm bg-[#2d3142] text-white hover:bg-[#1e2330] font-medium rounded-lg transition-colors shadow-sm"
            >
              Re-run AI
            </button>
            <button 
              onClick={() => onDismiss(conflict.id)}
              className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface InteractionTableProps {
  interactions: Interaction[];
}

const InteractionTable: React.FC<InteractionTableProps> = ({ interactions }) => {
  const getEntityColor = (type: string) => {
    switch (type) {
      case "Startup": return "bg-blue-100 text-blue-700";
      case "Mentor": return "bg-purple-100 text-purple-700";
      case "Sponsor": return "bg-amber-100 text-amber-700";
      case "Venue": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-100 text-blue-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Completed": return "bg-slate-100 text-slate-700";
      case "Failed": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Company Name</th>
            <th className="px-6 py-4">Entity Type</th>
            <th className="px-6 py-4">Interaction Type</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {interactions.map((interaction) => (
            <tr key={interaction.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5 font-medium text-slate-900">{interaction.companyName}</td>
              <td className="px-6 py-5">
                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getEntityColor(interaction.entityType)}`}>
                  {interaction.entityType}
                </span>
              </td>
              <td className="px-6 py-5 text-slate-500">{interaction.interactionType}</td>
              <td className="px-6 py-5">
                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusColor(interaction.status)}`}>
                  {interaction.status}
                </span>
              </td>
              <td className="px-6 py-5 text-slate-500">{interaction.date}</td>
              <td className="px-6 py-5 text-right">
                <button className="text-[#2d3142] hover:text-[#1e2330] hover:underline font-medium">View Details</button>
              </td>
            </tr>
          ))}
          {interactions.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                No interactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function AdminDashboardPage({ onNavigate }: { onNavigate?: (view: 'dashboard') => void }) {
  const [activeNav, setActiveNav] = useState("Overview");
  const [conflictsLoading, setConflictsLoading] = useState(false);
  const [detectedConflicts, setDetectedConflicts] = useState<DetectedConflict[]>([]);
  const [resolvedConflicts, setResolvedConflicts] = useState<DetectedConflict[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [activeTab, setActiveTab] = useState<"Current" | "History">("Current");
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [programs, setPrograms] = useState<ProgrammeSummary[]>([]);
  const [passports, setPassports] = useState<PassportData[]>([]);

  const navItems = ["Overview"];

  const detectConflicts = async () => {
    setConflictsLoading(true);
    try {
      // Fetch admin data from Firebase
      const adminDocRef = doc(db, "adminData", "dashboard");
      const adminDocSnap = await getDoc(adminDocRef);
      
      let fetchedAdminData: AdminData;
      if (adminDocSnap.exists()) {
        fetchedAdminData = adminDocSnap.data() as AdminData;
      } else {
        // Auto-seed Firebase if it's empty
        await setDoc(adminDocRef, defaultAdminData);
        fetchedAdminData = defaultAdminData as AdminData;
      }
      setAdminData(fetchedAdminData);

      // Fetch programs from Firebase
      const querySnapshot = await getDocs(collection(db, "programmes"));
      const fetchedPrograms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProgrammeSummary[];
      setPrograms(fetchedPrograms);

      const result = await runConflictDetection();
      const detected: DetectedConflict[] = result.detected.map((conflict, index) => ({
        id: String(conflict.id || `backend-${index}`),
        description: String(conflict.description || 'Backend guardrail conflict detected.'),
        detectedAt: new Date().toISOString(),
        status: "unresolved",
      }));

      // Only add conflicts that are not already resolved
      setDetectedConflicts(detected.filter(d => !resolvedConflicts.some(r => r.id === d.id)));
    } catch (error) {
      console.error("Error detecting conflicts:", error);
    } finally {
      setConflictsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void detectConflicts();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribeProgrammes = onSnapshot(collection(db, "programmes"), (snapshot) => {
      setPrograms(snapshot.docs.map(programmeDoc => ({
        id: programmeDoc.id,
        ...programmeDoc.data(),
      })) as ProgrammeSummary[]);
    });

    const unsubscribePassports = onSnapshot(collection(db, "passports"), (snapshot) => {
      setPassports(snapshot.docs.map(passportDoc => ({
        id: passportDoc.id,
        ...passportDoc.data(),
      })) as PassportData[]);
    });

    return () => {
      unsubscribeProgrammes();
      unsubscribePassports();
    };
  }, []);

  const handleResolveManually = (id: string) => {
    setDetectedConflicts(prev => 
      prev.map(c => c.id === id ? { ...c, status: "in_progress" } : c)
    );
  };

  const handleDismiss = (id: string) => {
    const conflictToDismiss = detectedConflicts.find(c => c.id === id);
    if (conflictToDismiss) {
      setDetectedConflicts(prev => prev.filter(c => c.id !== id));
      setResolvedConflicts(prev => [{ ...conflictToDismiss, status: "resolved" }, ...prev]);
    }
  };

  const activeProgrammes = programs.filter(programme => programme.status !== "Cancelled");
  const latestPassport = passports
    .slice()
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0];
  const totalCompanies = passports.length || adminData?.programmeData?.totalCompanies || 0;

  return (
    <div className="flex h-screen bg-[#f8fafb] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-10 pt-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#2d3142] flex items-center justify-center shadow-sm">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Innoweb</span>
        </div>
        <nav className="flex-1">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  onClick={() => setActiveNav(item)}
                  className={`w-full text-left px-6 py-3 transition-colors border-l-4 ${
                    activeNav === item 
                      ? "bg-slate-50 border-[#2d3142] text-slate-900 font-medium" 
                      : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8 pb-16">
          
          <header>
            <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Programme Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage and monitor the MyHack 2026 Accelerator ecosystem.</p>
          </header>

          {/* Section 1: Programme Overview Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">Total Programmes</span>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                  <Activity size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mt-2">{programs.length}</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">Total Companies</span>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                  <Users size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mt-2">{totalCompanies}</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">Active Connections</span>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                  <Link2 size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mt-2">{activeProgrammes.length}</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">Latest Passport Score</span>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                  <Clock size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mt-2">{latestPassport?.scoreTotal ?? "-"}</div>
            </div>
          </section>

          {/* Section 2: Conflict Resolution Panel */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Conflict Resolution
              </h2>
            </div>
            <div className="p-6 bg-slate-50/50">
              {conflictsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex p-4 bg-white border border-slate-100 border-l-4 border-l-slate-200 rounded-r-lg shadow-sm">
                      <div className="flex-1 space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : detectedConflicts.length > 0 ? (
                <div className="space-y-4">
                  {detectedConflicts.map((conflict) => (
                    <ConflictCard 
                      key={conflict.id} 
                      conflict={conflict} 
                      onResolveManually={handleResolveManually}
                      onReRunAi={detectConflicts}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-3 text-emerald-700 shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">AI has detected no conflicts. Programme is running smoothly.</p>
                  <button 
                    onClick={detectConflicts}
                    className="ml-auto px-4 py-2 text-sm bg-white border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors shadow-sm"
                  >
                    Re-run AI
                  </button>
                </div>
              )}

              {/* Resolved Conflicts Accordion */}
              {resolvedConflicts.length > 0 && (
                <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <button 
                    onClick={() => setShowResolved(!showResolved)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
                  >
                    <span>Resolved Conflicts ({resolvedConflicts.length})</span>
                    {showResolved ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showResolved && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-4">
                      {resolvedConflicts.map((conflict) => (
                        <ConflictCard 
                          key={conflict.id} 
                          conflict={conflict} 
                          onResolveManually={handleResolveManually}
                          onReRunAi={detectConflicts}
                          onDismiss={handleDismiss}
                          isResolved={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section 3: Customer Interactions */}
            <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">Customer Interactions</h2>
                <div className="flex gap-6 border-b border-slate-100">
                  <button 
                    onClick={() => setActiveTab("Current")}
                    className={`pb-3 text-sm font-semibold transition-colors relative ${
                      activeTab === "Current" ? "text-[#2d3142]" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Current
                    {activeTab === "Current" && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2d3142] rounded-t-full"></span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab("History")}
                    className={`pb-3 text-sm font-semibold transition-colors relative ${
                      activeTab === "History" ? "text-[#2d3142]" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    History
                    {activeTab === "History" && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2d3142] rounded-t-full"></span>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-0">
                <InteractionTable interactions={adminData ? (activeTab === "Current" ? adminData.currentInteractions : adminData.historyInteractions) : []} />
              </div>
            </section>

            {/* Section 4: AI Match Log */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-800">Recent AI Match Activity</h2>
              </div>
              <div className="p-6 space-y-5 bg-slate-50/30 flex-1">
                {adminData?.aiMatches?.map((match) => (
                  <div key={match.id} className="flex gap-3 text-sm">
                    <div className="mt-1">
                      {match.outcome === "Matched" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                      ) : match.outcome === "Failed" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-sm"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-900 font-medium">{match.pair}</span>
                        <span className="text-slate-400 text-xs font-medium">{timeAgo(match.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs font-medium">Score: {match.score}%</span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className={`text-xs font-semibold ${match.outcome === "Matched" ? "text-emerald-600" : match.outcome === "Failed" ? "text-slate-500" : "text-rose-600"}`}>
                          {match.outcome}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Help Button & Exit */}
      {onNavigate && (
        <button 
          onClick={() => onNavigate('dashboard')}
          className="fixed bottom-20 right-6 px-4 py-2.5 bg-white text-[#2d3142] rounded-lg shadow-lg hover:bg-slate-50 font-semibold text-sm transition-colors z-50 flex items-center gap-2 border border-slate-200"
        >
          Exit Admin View
        </button>
      )}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#1e2330] hover:bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50">
        <HelpCircle size={24} />
      </button>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
