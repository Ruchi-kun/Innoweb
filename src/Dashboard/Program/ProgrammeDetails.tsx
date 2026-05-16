import { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, Loader2, Star, Target, Users, Mail, XCircle } from 'lucide-react';
import { doc, collection, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { recordProgrammeEvent, runProgrammeMatching, type ProgrammeMatch } from '../../lib/api';
import { getLatestPassport } from '../../lib/passports';

interface ProgrammeDetailsProps {
    programmeId: string;
    onNavigate: (view: 'dashboard' | 'programmes' | 'create' | 'details') => void;
    onViewParticipant: (participantId: string) => void;
}

interface Programme {
    id: string;
    name: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    entities: string[];
    status: string;
    ownerCompanyId?: string;
    ownerPassportId?: string;
}

// Added Participant interface to match your Firebase structure
interface Participant {
    id: string;
    name: string;
    role: string;
    expertise: string;
    company: string;
    score?: number;
}

export default function ProgrammeDetails({ programmeId, onNavigate, onViewParticipant }: ProgrammeDetailsProps) {
    const [programme, setProgramme] = useState<Programme | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [matching, setMatching] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const buildParticipantsFromMatches = async (matches: ProgrammeMatch[]) => {
        const companiesSnapshot = await getDocs(collection(db, "companies"));
        const companiesById = new Map(companiesSnapshot.docs.map((companyDoc) => [companyDoc.id, companyDoc.data()]));
        return matches.map((match) => {
            const company = companiesById.get(match.companyId);
            const vectors = company?.extractedVectors || {};
            return {
                id: match.companyId,
                name: company?.companyName || 'Unknown Company',
                role: vectors.companyType || 'Company',
                expertise: vectors.primaryIndustry || 'Not specified',
                company: company?.companyName || 'Unknown Company',
                score: match.score,
            };
        });
    };

    const runMatching = async () => {
        setMatching(true);
        try {
            const result = await runProgrammeMatching(programmeId);
            setParticipants(await buildParticipantsFromMatches(result.matches));
        } catch (error) {
            console.error("Error running matching:", error);
        } finally {
            setMatching(false);
        }
    };

    const cancelProgramme = async () => {
        if (!programme || programme.status === "Cancelled") return;

        setCancelling(true);
        try {
            const latestPassport = await getLatestPassport();
            const companyId = programme.ownerCompanyId || latestPassport?.companyId;

            if (!companyId) {
                alert("No company passport was found for this programme cancellation.");
                return;
            }

            await updateDoc(doc(db, "programmes", programmeId), {
                status: "Cancelled",
                cancelledAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            await recordProgrammeEvent(programmeId, {
                companyId,
                eventType: "programme_cancelled",
                payload: {
                    name: programme.name,
                    type: programme.type,
                    previousStatus: programme.status,
                },
            });
        } catch (error) {
            console.error("Error cancelling programme:", error);
            alert("Failed to cancel the programme. Check console for details.");
        } finally {
            setCancelling(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "programmes", programmeId),
            (docSnap) => {
                if (docSnap.exists()) {
                    setProgramme({ id: docSnap.id, ...docSnap.data() } as Programme);
                } else {
                    setProgramme(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching from Firebase:", error);
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, [programmeId]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f8fafb]">
                <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (!programme) return null;

    return (
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f8fafb]">
            <style>{`
                .header-glass {
                    background: rgba(30, 35, 48, 0.9);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .participant-glass {
                    background: rgba(255, 255, 255, 0.7);
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                .participant-glass:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(66, 133, 244, 0.3);
                    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.12);
                }
            `}</style>

            {/* Header Section */}
            <div className="header-glass p-8 pt-12 text-white relative">
                <button
                    onClick={() => onNavigate('programmes')}
                    className="absolute top-6 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back to Programmes
                </button>

                <div className="max-w-5xl mx-auto mt-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                {programme.type}
                            </span>
                            <h1 className="text-4xl font-black tracking-tight">{programme.name}</h1>
                            <p className="text-slate-400 max-w-2xl leading-relaxed">{programme.description}</p>
                        </div>

                        <div className="flex gap-4 pb-1">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 px-5 text-center">
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Status</p>
                                <p className="text-sm font-mono font-bold text-blue-400">{programme.status}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 px-5 text-center">
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Start Date</p>
                                <p className="text-sm font-mono font-bold text-blue-400">{programme.startDate}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 px-5 text-center">
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">End Date</p>
                                <p className="text-sm font-mono font-bold text-blue-400">{programme.endDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants Section */}
            <div className="max-w-5xl mx-auto w-full p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <Users className="text-blue-600" size={24} />
                            Compatible Participants
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Found {participants.length} backend-ranked matches from your database.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={runMatching}
                            disabled={matching || programme.status === "Cancelled"}
                            className="bg-[#3b4256] hover:bg-[#2d3142] disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            {matching && <Loader2 className="w-4 h-4 animate-spin" />}
                            Run Matching
                        </button>
                        <button
                            onClick={cancelProgramme}
                            disabled={cancelling || programme.status === "Cancelled"}
                            className="bg-white hover:bg-rose-50 disabled:bg-slate-100 border border-rose-200 disabled:border-slate-200 text-rose-700 disabled:text-slate-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            {programme.status === "Cancelled" ? "Cancelled" : "Cancel Programme"}
                        </button>
                    </div>
                </div>

                {participants.length === 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center mb-6">
                        <p className="text-slate-600">Run matching to generate ranked proposals for this programme.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {participants.map((person) => (
                        <button
                            key={person.id}
                            onClick={() => onViewParticipant(person.id)}
                            className="text-left w-full participant-glass p-6 flex flex-col justify-between group cursor-pointer"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg border-2 border-white shadow-sm">
                                        {person.name[0]}
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded border tracking-tighter
                                        ${person.role === 'Mentor' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                                        ${person.role === 'Sponsor' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                                        ${person.role === 'Startup' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                                    `}>
                                        {person.role?.toUpperCase()}
                                    </span>
                                </div>

                                <h3 className="text-slate-900 font-bold text-lg group-hover:text-blue-600 transition-colors">
                                    {person.name}
                                </h3>

                                <div className="space-y-2 mt-3">
                                    <p className="text-slate-500 text-xs flex items-center gap-2">
                                        <Briefcase size={14} className="text-slate-400" />
                                        {person.company}
                                    </p>
                                    <p className="text-slate-600 text-xs flex items-center gap-2 font-medium">
                                        <Target size={14} className="text-blue-400" />
                                        {person.expertise}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center w-full">
                                <div className="flex items-center gap-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-bold text-slate-400 tracking-wide">
                                        {person.score ? `${person.score}% MATCH` : 'MATCH'}
                                    </span>
                                </div>
                                {/* Prevent the mail button from triggering the card click */}
                                <div
                                    className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-full transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Mail size={16} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
}
