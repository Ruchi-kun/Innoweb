import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Award, ShieldCheck, ExternalLink, Calendar, ChevronRight } from 'lucide-react';

interface ParticipantProfileProps {
    participantId: string;
    onBack: () => void;
    onViewPassport: () => void;
}

// Mock database fetch based on ID
const fetchParticipantData = (id: string) => {
    return {
        id,
        name: "Dr. Sarah Chen",
        role: "Mentor",
        company: "TechNova",
        expertise: "AI & Machine Learning",
        location: "San Francisco, CA",
        bio: "Former VP of Engineering at OpenAI. Currently advising early-stage deep tech startups on scalable architecture and go-to-market strategies.",
        passport: {
            score: 92,
            tier: "Platinum",
            status: "Verified",
        },
        portfolio: [
            {
                id: 'p1',
                title: "NeuralTrade Algorithm",
                description: "A high-frequency trading algorithm utilizing reinforcement learning, achieving 18% YoY growth for institutional clients.",
                image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
                tags: ["FinTech", "Python", "TensorFlow"],
                date: "2023"
            },
            {
                id: 'p2',
                title: "MediScan Diagnostic AI",
                description: "Computer vision model for early detection of retinal diseases. Deployed in 40+ clinics across Southeast Asia.",
                image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
                tags: ["HealthTech", "Computer Vision"],
                date: "2022"
            }
        ]
    };
};

export default function ParticipantProfile({ participantId, onBack, onViewPassport }: ParticipantProfileProps) {
    const [data, setData] = useState<ReturnType<typeof fetchParticipantData> | null>(null);

    useEffect(() => {
        // Simulate API call
        setData(fetchParticipantData(participantId));
    }, [participantId]);

    if (!data) return <div className="p-8 text-slate-500">Loading profile...</div>;

    return (
        <div className="flex-1 bg-[#f8fafb] overflow-y-auto p-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-medium"
            >
                <ArrowLeft size={18} /> Back to Programme
            </button>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Profile & Portfolio */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Profile Card */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex gap-6 items-start">
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 border-4 border-white shadow-md shrink-0 overflow-hidden">
                            {/* Optional: Add actual image here if available */}
                            {data.name[0]}
                        </div>
                        <div className="space-y-3 flex-1">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{data.name}</h1>
                                <p className="text-blue-600 font-semibold flex items-center gap-2 text-sm mt-1">
                                    <Briefcase size={16} /> {data.role} at {data.company}
                                </p>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm">{data.bio}</p>
                            <div className="flex gap-4 pt-2 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase"><MapPin size={14}/> {data.location}</span>
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase"><Award size={14}/> {data.expertise}</span>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Section */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Project Portfolio</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.portfolio.map((project) => (
                                <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-black uppercase text-slate-700 shadow-sm flex items-center gap-1">
                                            <Calendar size={12} /> {project.date}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors flex items-center justify-between">
                                            {project.title}
                                            <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-600" />
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-2 line-clamp-2">{project.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md">
                          {tag}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Admin Passport Ranking */}
                <div className="space-y-6">
                    <div className="bg-[#1e2330] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-10 -mt-10 blur-2xl" />

                        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider mb-6">
                            <ShieldCheck size={18} /> Admin View
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-white">Passport Rank</h3>
                            <p className="text-slate-400 text-sm">Institutional verification score</p>
                        </div>

                        <div className="mt-8 flex items-end gap-3">
                            <span className="text-6xl font-black text-white leading-none">{data.passport.score}</span>
                            <span className="text-blue-400 font-bold mb-1">/ 100</span>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                <span className="text-slate-400">Tier Level</span>
                                <span className="font-bold text-emerald-400">{data.passport.tier}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                <span className="text-slate-400">Status</span>
                                <span className="font-bold text-white">{data.passport.status}</span>
                            </div>
                        </div>

                        <button
                            onClick={onViewPassport}
                            className="mt-8 w-full py-3 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 group"
                        >
                            View Full Scorecard <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}