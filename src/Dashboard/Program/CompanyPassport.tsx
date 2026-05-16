import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    ShieldCheck,
    TrendingUp,
    Users,
    Zap,
    ChevronDown,
    ChevronUp,
    Info,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

interface ScoreBreakdown {
    category: string;
    score: number;
    maxScore: number;
    reasoning: string[];
    icon?: React.ElementType;
    color?: string;
}

interface PassportData {
    companyName: string;
    scoreTotal: number;
    tier: string;
    breakdown: ScoreBreakdown[];
}

const categoryMeta = (category: string) => {
    if (category.includes('Team')) return { icon: Users, color: 'text-blue-500' };
    if (category.includes('Product')) return { icon: Zap, color: 'text-amber-500' };
    if (category.includes('Market')) return { icon: TrendingUp, color: 'text-emerald-500' };
    if (category.includes('Compliance')) return { icon: ShieldCheck, color: 'text-purple-500' };
    return { icon: CheckCircle2, color: 'text-sky-500' };
};

export default function CompanyPassport({ onBack }: { onBack: () => void }) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [passportData, setPassportData] = useState<PassportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestPassport = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'passports'), orderBy('updatedAt', 'desc'), limit(1)));
                const latest = snapshot.docs[0];
                if (latest) {
                    setPassportData(latest.data() as PassportData);
                }
            } catch (error) {
                console.error('Error fetching passport:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestPassport();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 bg-[#f8fafb] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (!passportData) {
        return (
            <div className="flex-1 bg-[#f8fafb] overflow-y-auto p-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-medium"
                >
                    <ArrowLeft size={18} /> Back to Participants
                </button>
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">No passport found</h1>
                    <p className="text-slate-500">Upload company credentials to create the first Firestore-backed passport.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#f8fafb] overflow-y-auto p-8">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-medium"
            >
                <ArrowLeft size={18} /> Back to Participants
            </button>

            <div className="max-w-4xl mx-auto space-y-8">

                {/* Main Score Header */}
                <div className="bg-[#1e2330] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="space-y-4">
              <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-bold tracking-widest uppercase">
                Startup Passport v1.0
              </span>
                            <h1 className="text-5xl font-black">{passportData.companyName}</h1>
                            <p className="text-slate-400 text-lg max-w-md">Verified digital identity and health scorecard for institutional matching.</p>

                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <CheckCircle2 size={20} />
                                Fully Verified
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center">
                            {/* Circular Score Visual */}
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={553}
                                        strokeDashoffset={553 - (553 * passportData.scoreTotal) / 100}
                                        className="text-blue-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black leading-none">{passportData.scoreTotal}</span>
                                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Score</span>
                                <span className="text-blue-300 text-xs font-bold mt-2">{passportData.tier}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 px-2">Points Breakdown</h2>
                    {passportData.breakdown.map((item) => {
                        const meta = categoryMeta(item.category);
                        const Icon = item.icon || meta.icon;
                        const color = item.color || meta.color;
                        return (
                        <div
                            key={item.category}
                            className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${
                                expandedCategory === item.category ? 'ring-2 ring-blue-500/20 border-blue-200 shadow-lg' : 'border-slate-200 shadow-sm'
                            }`}
                        >
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === item.category ? null : item.category)}
                                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900">{item.category}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-current ${color}`}
                                                    style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">
                        {item.score}/{item.maxScore} pts
                      </span>
                                        </div>
                                    </div>
                                </div>
                                {expandedCategory === item.category ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                            </button>

                            {/* Reasoning / "The Why" */}
                            {expandedCategory === item.category && (
                                <div className="px-6 pb-6 bg-slate-50/50 border-t border-slate-100">
                                    <div className="pt-4 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            <Info size={14} /> AI Verification Notes
                                        </div>
                                        {item.reasoning.map((note, idx) => (
                                            <div key={idx} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                {note}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
