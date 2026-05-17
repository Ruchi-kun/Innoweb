import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Star, Target, Users, Mail, Zap, CheckCircle2, Calendar, MapPin, Building2, Briefcase } from 'lucide-react';
import { doc, onSnapshot, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './MyProgrammesModern.css';

// --- Image Helpers ---
const getParticipantImage = (_role: string | undefined, index: number) => {
    const images = [
        "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
    ];
    return images[(index || 0) % images.length];
};

const getVenueImage = (index: number) => {
    const images = [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80"
    ];
    return images[(index || 0) % images.length];
};

// --- Interfaces ---
interface ProgrammeDetailsProps {
    programmeId: string;
    onNavigate: (view: 'dashboard' | 'programmes' | 'create' | 'details') => void;
    onViewParticipant: (participantId: string) => void;
}

interface MatchResult {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    expertise: string;
    score: number;
    type: 'person' | 'venue';
}

interface Programme {
    id: string;
    name: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
    // New Fields for Persistence!
    matchedMentors?: MatchResult[];
    matchedSponsors?: MatchResult[];
    matchedVenues?: MatchResult[];
}

type MatchMode = 'mentors' | 'sponsors' | 'venues';

export default function ProgrammeDetails({ programmeId, onNavigate, onViewParticipant }: ProgrammeDetailsProps) {
    const [programme, setProgramme] = useState<Programme | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);

    // States for Tabs and Matching
    const [matchMode, setMatchMode] = useState<MatchMode>('mentors');
    const [isMatching, setIsMatching] = useState(false);

    // Fetch Programme Details
    useEffect(() => {
        if (!programmeId) return;
        const unsub = onSnapshot(doc(db, 'programmes', programmeId), (docSnap) => {
            if (docSnap.exists()) setProgramme({ id: docSnap.id, ...docSnap.data() } as Programme);
            setLoadingInfo(false);
        });
        return () => unsub();
    }, [programmeId]);

    // --- PURE FIREBASE MATCHING LOGIC ---
    const handleRunMatch = async () => {
        setIsMatching(true);

        try {
            const allMatches: MatchResult[] = [];

            if (matchMode === 'mentors') {
                const participantsRef = collection(db, 'participants');
                const snapshot = await getDocs(participantsRef);

                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const title = data.name || data.fullName || data.companyName;

                    if (title) {
                        allMatches.push({
                            id: docSnap.id,
                            title: title,
                            subtitle: data.company || 'Independent Expert',
                            badge: data.role || 'Mentor',
                            expertise: data.expertise || 'Ecosystem Fit',
                            score: 75 + (title.length % 20),
                            type: 'person'
                        });
                    }
                });
            } else {
                const companiesRef = collection(db, 'companies');
                const snapshot = await getDocs(companiesRef);

                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const type = data.entityType || 'Company';
                    const isVenue = type === 'Venue';
                    const b = type.toLowerCase();
                    const isSponsor = b === 'sponsor' || b === 'startup' || b === 'company';

                    if (data.companyName) {
                        if (matchMode === 'venues' && isVenue) {
                            allMatches.push({
                                id: docSnap.id,
                                title: data.companyName,
                                subtitle: data.extractedVectors?.operatingStage || 'Local',
                                badge: type,
                                expertise: data.extractedVectors?.keyCapabilities?.join(' • ') || 'Event Space',
                                score: 75 + (data.companyName.length % 20) + 5,
                                type: 'venue'
                            });
                        } else if (matchMode === 'sponsors' && isSponsor) {
                            allMatches.push({
                                id: docSnap.id,
                                title: data.companyName,
                                subtitle: data.companyName,
                                badge: type,
                                expertise: data.extractedVectors?.primaryIndustry || 'Ecosystem Fit',
                                score: 75 + (data.companyName.length % 20),
                                type: 'person'
                            });
                        }
                    }
                });
            }

            // Sort by highest score first
            allMatches.sort((a, b) => b.score - a.score);

            // 🚀 SAVE TO FIREBASE INSTEAD OF LOCAL STATE
            const updatePayload: Partial<Programme> = {};
            if (matchMode === 'mentors') updatePayload.matchedMentors = allMatches;
            if (matchMode === 'sponsors') updatePayload.matchedSponsors = allMatches;
            if (matchMode === 'venues') updatePayload.matchedVenues = allMatches;

            await updateDoc(doc(db, 'programmes', programmeId), updatePayload);

        } catch (err) {
            console.error("Firebase Query Failed:", err);
            alert("Could not fetch data from Firebase. Check your connection.");
        } finally {
            setIsMatching(false);
        }
    };

    if (loadingInfo) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    if (!programme) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white"><p>Programme not found.</p></div>;

    // --- Dynamic State derived directly from the DB ---
    const activeMatchesArray =
        matchMode === 'mentors' ? programme.matchedMentors :
            matchMode === 'sponsors' ? programme.matchedSponsors :
                programme.matchedVenues;

    // If the array exists (even if it's empty), it means we have run the match at least once.
    const hasRunMatch = activeMatchesArray !== undefined;
    const displayMatches = activeMatchesArray || [];

    return (
        <main className="min-h-screen bg-[#0f172a] text-slate-200 overflow-y-auto">

            {/* Header Area */}
            <div className="bg-[#1e2330] border-b border-white/5 pt-12 pb-8 px-8 lg:px-12">
                <button onClick={() => onNavigate('programmes')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-semibold tracking-wide">
                    <ArrowLeft size={16} /> BACK TO PROGRAMMES
                </button>

                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">{programme.type}</span>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-full">{programme.status}</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-4">{programme.name}</h1>
                        <p className="text-slate-400 max-w-2xl leading-relaxed">{programme.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm font-medium text-slate-400 bg-black/20 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-blue-400" />
                            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Start</p><p className="text-white">{programme.startDate || 'TBD'}</p></div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-amber-400" />
                            <div><p className="text-xs text-slate-500 uppercase tracking-wider">End</p><p className="text-white">{programme.endDate || 'TBD'}</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matching Section */}
            <div className="max-w-5xl mx-auto px-8 lg:px-12 py-12">

                {/* 3-Way Tab Navigation */}
                <div className="flex items-center gap-6 mb-10 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setMatchMode('mentors')}
                        className={`flex items-center gap-2 pb-4 -mb-[17px] border-b-2 transition-all font-semibold ${matchMode === 'mentors' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <Users size={18} /> Find Mentors
                    </button>
                    <button
                        onClick={() => setMatchMode('sponsors')}
                        className={`flex items-center gap-2 pb-4 -mb-[17px] border-b-2 transition-all font-semibold ${matchMode === 'sponsors' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <Briefcase size={18} /> Find Sponsors & Companies
                    </button>
                    <button
                        onClick={() => setMatchMode('venues')}
                        className={`flex items-center gap-2 pb-4 -mb-[17px] border-b-2 transition-all font-semibold ${matchMode === 'venues' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <Building2 size={18} /> Find Venues
                    </button>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            {matchMode === 'mentors' && <Users size={24} className="text-blue-400" />}
                            {matchMode === 'sponsors' && <Briefcase size={24} className="text-emerald-400" />}
                            {matchMode === 'venues' && <Building2 size={24} className="text-purple-400" />}

                            {matchMode === 'mentors' ? 'Mentor Pool' : matchMode === 'sponsors' ? 'Sponsor & Company Network' : 'Venue Network'}
                        </h2>
                        <p className="text-slate-400 mt-1">
                            {matchMode === 'mentors' ? 'Find expert mentors for your participants.' :
                                matchMode === 'sponsors' ? 'Find highly compatible companies and sponsors.' :
                                    'Find the perfect physical space for this programme.'}
                        </p>
                    </div>

                    <button
                        onClick={handleRunMatch}
                        disabled={isMatching}
                        className={`group flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold tracking-wide transition-all shadow-lg
                            ${matchMode === 'mentors' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' :
                            matchMode === 'sponsors' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' :
                                'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'}
                            disabled:bg-slate-700 disabled:text-slate-400`}
                    >
                        {isMatching ? <Loader2 className="w-5 h-5 animate-spin" /> : hasRunMatch ? <Zap className="w-5 h-5 text-amber-300" /> : <Zap className="w-5 h-5" />}
                        {isMatching ? 'ANALYZING DATABASE...' : hasRunMatch ? 'UPDATE MATCHES' : `FIND ${matchMode.toUpperCase()}`}
                    </button>
                </div>

                {/* Empty State (Never Run Before) */}
                {!hasRunMatch && !isMatching && (
                    <div className="bg-[#1e2330] border border-white/5 rounded-3xl p-16 text-center flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6
                            ${matchMode === 'mentors' ? 'bg-blue-500/10 text-blue-400' :
                            matchMode === 'sponsors' ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-purple-500/10 text-purple-400'}`}>
                            <Zap className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No {matchMode} Generated</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            Run the Match engine to scan your database and permanently save highly compatible {matchMode === 'venues' ? 'locations' : 'entities'} to this programme.
                        </p>
                    </div>
                )}

                {/* Loading State */}
                {isMatching && (
                    <div className={`bg-[#1e2330] border rounded-3xl p-16 text-center flex flex-col items-center relative overflow-hidden
                        ${matchMode === 'mentors' ? 'border-blue-500/20' :
                        matchMode === 'sponsors' ? 'border-emerald-500/20' :
                            'border-purple-500/20'}`}>
                        <div className={`absolute inset-0 animate-pulse
                            ${matchMode === 'mentors' ? 'bg-blue-500/5' :
                            matchMode === 'sponsors' ? 'bg-emerald-500/5' :
                                'bg-purple-500/5'}`}></div>
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                            <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin
                                ${matchMode === 'mentors' ? 'border-blue-500' :
                                matchMode === 'sponsors' ? 'border-emerald-500' :
                                    'border-purple-500'}`}></div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Fetching Local Ecosystem Data...</h3>
                    </div>
                )}

                {/* Results Grid */}
                {hasRunMatch && !isMatching && (
                    <>
                        <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-bold">
                            <CheckCircle2 size={18} className={`
                                ${matchMode === 'mentors' ? 'text-blue-400' :
                                matchMode === 'sponsors' ? 'text-emerald-400' :
                                    'text-purple-400'}`} />
                            Found {displayMatches.length} compatible {matchMode} saved to this programme.
                        </div>

                        {displayMatches.length === 0 && (
                            <div className="text-slate-400 bg-white/5 p-6 rounded-xl text-center">
                                No {matchMode} found in the database during the last scan. Try adding some to the platform and click "Update Matches".
                            </div>
                        )}

                        <div className="modern-grid mt-6">
                            {displayMatches.map((match, index) => (
                                <article
                                    key={match.id}
                                    className="programme-card"
                                    onClick={() => match.type === 'person' ? onViewParticipant(match.id) : alert(`View Venue: ${match.title}`)}
                                    style={{
                                        animation: `floatUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s forwards`,
                                        opacity: 0,
                                        transform: 'translateY(60px)'
                                    }}
                                >
                                    <img src={match.type === 'person' ? getParticipantImage(match.badge, index) : getVenueImage(index)} alt={match.title} className="card-bg-image" />

                                    <div className="card-content">
                                        <div className="card-info-wrapper">
                                            <span className={`prog-type
                                                ${matchMode === 'mentors' ? 'text-blue-300' :
                                                matchMode === 'sponsors' ? 'text-emerald-300' :
                                                    'text-purple-300'}`}>{match.badge}</span>
                                            <h3 className="prog-name" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>
                                                <span>{match.title}</span>
                                            </h3>
                                            <div className="prog-meta !text-slate-200">
                                                <span className="flex items-center gap-1">
                                                    {match.type === 'person' ? <Briefcase size={12}/> : <MapPin size={12}/>}
                                                    {match.subtitle}
                                                </span>
                                                <span className="dot !text-slate-400">•</span>
                                                <span className="flex items-center gap-1 text-amber-400 font-bold">
                                                    <Star size={14} className="fill-amber-400" /> {match.score}% MATCH
                                                </span>
                                            </div>

                                            <div className="mt-4 text-sm text-slate-300 flex items-start gap-2 bg-black/40 p-3 rounded-xl border border-white/10">
                                                <Target size={16} className={
                                                    matchMode === 'mentors' ? 'text-blue-400' :
                                                        matchMode === 'sponsors' ? 'text-emerald-400' :
                                                            'text-purple-400'
                                                } />
                                                <span className="leading-tight">{match.expertise}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Action Button */}
                                    <button
                                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            alert(match.type === 'person' ? `Invite drafted for ${match.title}` : `Booking request drafted for ${match.title}`);
                                        }}
                                    >
                                        {match.type === 'person' ? <Mail size={18} /> : <Calendar size={18} />}
                                    </button>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}