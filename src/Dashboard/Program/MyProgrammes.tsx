import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, MoreHorizontal, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

interface MyProgrammesProps {
    onNavigate: (view: 'dashboard' | 'programmes' | 'create' | 'details') => void;
    onViewDetails: (id: string) => void;
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
}

const getGdgColors = (type: string) => {
    switch (type) {
        case 'Accelerator':
            return {
                primary: '#4285F4',
                bgTint: 'rgba(66, 133, 244, 0.1)',
                borderTint: 'rgba(66, 133, 244, 0.3)'
            };
        case 'Mentorship':
            return {
                primary: '#34A853',
                bgTint: 'rgba(52, 168, 83, 0.1)',
                borderTint: 'rgba(52, 168, 83, 0.3)'
            };
        case 'Grant':
            return {
                primary: '#FBBC04',
                bgTint: 'rgba(251, 188, 4, 0.1)',
                borderTint: 'rgba(251, 188, 4, 0.3)'
            };
        default:
            return {
                primary: '#EA4335',
                bgTint: 'rgba(234, 67, 53, 0.1)',
                borderTint: 'rgba(234, 67, 53, 0.3)'
            };
    }
};

export default function MyProgrammes({ onNavigate, onViewDetails }: MyProgrammesProps) {
    const [programmes, setProgrammes] = useState<Programme[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "programmes"),
            (querySnapshot) => {
                const programmesData: Programme[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as Omit<Programme, 'id'>
                }));
                setProgrammes(programmesData);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching programmes: ", error);
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, []);

    return (
        <main className="flex-1 flex flex-col h-full relative overflow-y-auto bg-[#f8fafb]">
            <style>{`
                .glass-card {
                    user-select: none;
                    border: 1px solid #ffffff22;
                    background-color: #282c34;
                    background: linear-gradient(0deg, rgba(40,44,52,1) 0%, var(--gdg-bg-tint) 100%);
                    box-shadow: 0 7px 20px 5px #00000088;
                    border-radius: 1rem;
                    backdrop-filter: blur(7px);
                    -webkit-backdrop-filter: blur(7px);
                    overflow: hidden;
                    transition: 0.5s all;
                    position: relative;
                    cursor: pointer;
                }
                .glass-card::before {
                    position: absolute;
                    content: "";
                    box-shadow: 0 0 100px 40px var(--gdg-primary);
                    opacity: 0.15;
                    top: -10%;
                    left: -100%;
                    transform: rotate(-45deg);
                    height: 60rem;
                    width: 20px;
                    transition: 0.7s all;
                    pointer-events: none;
                    z-index: 10;
                }
                .glass-card:hover {
                    border: 1px solid var(--gdg-primary);
                    box-shadow: 0 7px 50px 10px #000000aa;
                    transform: scale(1.015);
                    filter: brightness(1.15);
                }
                .glass-card:hover::before {
                    filter: brightness(0.8);
                    top: -100%;
                    left: 200%;
                }
                .glass-badge {
                    background: var(--gdg-bg-tint);
                    border: 1px solid var(--gdg-border-tint);
                    color: var(--gdg-primary);
                }
            `}</style>

            <header className="flex justify-end items-center p-6 pb-2 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-white border border-slate-200 text-slate-500 text-xs px-4 py-1.5 rounded-full shadow-sm">
                        My Programmes
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#2d3142] text-white flex items-center justify-center font-semibold text-sm">
                        A
                    </div>
                </div>
            </header>

            <div className="px-10 pb-12 max-w-6xl mx-auto w-full mt-4 relative z-10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0f172a] mb-2">My Programmes</h2>
                        <p className="text-slate-500 text-sm">Manage and track your active ecosystem initiatives.</p>
                    </div>
                    <button
                        onClick={() => onNavigate('create')}
                        className="bg-[#3b4256] hover:bg-[#2d3142] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Programme
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 w-full">
                        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {programmes.map((prog) => {
                            const colors = getGdgColors(prog.type);
                            return (
                                <div
                                    key={prog.id}
                                    onClick={() => onViewDetails(prog.id)}
                                    className="glass-card flex flex-col h-full"
                                    style={{
                                        '--gdg-primary': colors.primary,
                                        '--gdg-bg-tint': colors.bgTint,
                                        '--gdg-border-tint': colors.borderTint,
                                    } as React.CSSProperties}
                                >
                                    <div className="p-6 pb-4 border-b border-[#ffffff22] relative z-0">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold glass-badge">
                                                <Zap size={14} style={{ color: colors.primary }} />
                                                {prog.type}
                                            </span>
                                            <button className="text-[#9ca3af] hover:text-white transition-colors">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-[#eee] leading-tight mb-2 line-clamp-2">{prog.name}</h3>
                                        <p className="text-sm text-[#e2e8f0] leading-relaxed line-clamp-2">{prog.description}</p>
                                    </div>

                                    <div className="p-6 pt-4 space-y-4 flex-1 relative z-0">
                                        <div className="flex items-center gap-3 text-sm font-medium bg-[#00000033] p-2.5 rounded-lg border border-[#ffffff11] shadow-sm text-[#cbd5e1]">
                                            <Calendar size={16} style={{ color: colors.primary }} />
                                            <span>{prog.startDate}</span>
                                            <ArrowRight size={14} className="text-[#ffffff44]" />
                                            <span>{prog.endDate}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#888888] uppercase tracking-wider">
                                                <Users size={14} /> Required Entities
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {prog.entities?.map((entity, i) => (
                                                    <span key={i} className="px-2.5 py-1 bg-[#ffffff11] border border-[#ffffff22] text-[#cbd5e1] text-xs font-medium rounded-md shadow-sm transition-colors hover:bg-[#ffffff22]">
                                                        {entity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-[#ffffff22] flex justify-between items-center bg-[#00000022] relative z-0">
                                        <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: colors.primary }}>
                                            <div className={`w-2 h-2 rounded-full ${prog.status === 'Active' ? 'animate-pulse' : ''}`}
                                                 style={{ backgroundColor: prog.status === 'Draft' ? '#9ca3af' : colors.primary }}></div>
                                            {prog.status}
                                        </span>
                                        <button className="text-sm font-bold text-[#9ca3af] hover:text-[#eee] transition-colors">
                                            Manage &rarr;
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
