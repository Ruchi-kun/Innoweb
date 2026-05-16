import React, { useState } from 'react';
import {
    ArrowLeft,
    ShieldCheck,
    TrendingUp,
    Users,
    Zap,
    ChevronDown,
    ChevronUp,
    Info,
    CheckCircle2
} from 'lucide-react';

interface ScoreBreakdown {
    category: string;
    score: number;
    maxScore: number;
    reasoning: string[];
    icon: React.ElementType;
    color: string;
}

interface PassportData {
    companyName: string;
    totalScore: number;
    level: string;
    breakdown: ScoreBreakdown[]; // This is where ScoreBreakdown is used!
}

const mockPassportData: PassportData = {
    companyName: "TechNova AI",
    totalScore: 84,
    level: "Gold Tier",
    breakdown: [
        {
            category: "Team & Expertise",
            score: 25,
            maxScore: 30,
            icon: Users,
            color: "text-blue-500",
            reasoning: [
                "Founder has 2 previous successful exits in the AI space.",
                "CTO holds a PhD in Neural Networks from Stanford.",
                "Engineering team is 80% senior-level."
            ]
        },
        {
            category: "Product Readiness",
            score: 22,
            maxScore: 25,
            icon: Zap,
            color: "text-amber-500",
            reasoning: [
                "MVP is live with over 500 active weekly users.",
                "Proprietary algorithm shows 15% better efficiency than competitors.",
                "Full API documentation completed."
            ]
        },
        {
            category: "Market Traction",
            score: 18,
            maxScore: 25,
            icon: TrendingUp,
            color: "text-emerald-500",
            reasoning: [
                "Month-over-month revenue growth of 12%.",
                "Strategic partnerships signed with 3 Fortune 500 companies.",
                "Low churn rate of 2.1%."
            ]
        },
        {
            category: "Legal & Compliance",
            score: 19,
            maxScore: 20,
            icon: ShieldCheck,
            color: "text-purple-500",
            reasoning: [
                "GDPR and SOC2 Type II compliant.",
                "All IP assignments fully signed and verified.",
                "Clean cap table with no litigious history."
            ]
        }
    ]
};

export default function CompanyPassport({ onBack }: { onBack: () => void }) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
                            <h1 className="text-5xl font-black">{mockPassportData.companyName}</h1>
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
                                        strokeDashoffset={553 - (553 * mockPassportData.totalScore) / 100}
                                        className="text-blue-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black leading-none">{mockPassportData.totalScore}</span>
                                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Score</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 px-2">Points Breakdown</h2>
                    {mockPassportData.breakdown.map((item) => (
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
                                    <div className={`p-3 rounded-xl bg-slate-50 ${item.color}`}>
                                        <item.icon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900">{item.category}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-current ${item.color}`}
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
                    ))}
                </div>
            </div>
        </div>
    );
}