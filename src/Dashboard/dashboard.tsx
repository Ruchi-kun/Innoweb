import {
    Briefcase,
    TrendingUp,
    Award,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    Plus,
    Settings
} from 'lucide-react';

// --- Types ---
interface Connection {
    id: string;
    companyName: string;
    type: string;
    programme: string;
    date: string;
    status: 'Completed' | 'Active' | 'Pending';
}

const tableData: Connection[] = [
    { id: '1', companyName: 'TechMentor Inc.', type: 'Mentorship', programme: 'Startup Accelerator Q1', date: '2024-03-15', status: 'Completed' },
    { id: '2', companyName: 'Innovation Hub', type: 'Mentorship', programme: 'Startup Accelerator Q1', date: '2024-04-20', status: 'Active' },
    { id: '3', companyName: 'Global Ventures', type: 'Sponsorship', programme: 'Seed Funding Round', date: '2024-05-05', status: 'Pending' },
];

interface DashboardProps {
    onNavigate: (view: any) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
    return (
        <main className="flex-1 flex flex-col h-full relative overflow-y-auto">

            {/* Top Header/Nav */}
            <header className="flex justify-end items-center p-6 pb-2">
                <div className="flex items-center gap-4">
                    <div className="bg-white border border-slate-200 text-slate-500 text-xs px-4 py-1.5 rounded-full shadow-sm">
                        Screen 3: Dashboard
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#2d3142] text-white flex items-center justify-center font-semibold text-sm">
                        A
                    </div>
                </div>
            </header>

            <div className="px-10 pb-10 max-w-6xl mx-auto w-full">
                {/* Welcome Message & Action Button */}
                <div className="flex justify-between items-center mb-8 mt-2">
                    <h2 className="text-3xl font-bold text-[#0f172a]">Welcome back, Acme Ventures</h2>

                    {/* NEW BUTTON TO TRIGGER NAVIGATION */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate('admin')}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-[#2d3142] px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Settings size={18} />
                            Admin View
                        </button>
                        <button
                            onClick={() => onNavigate('create')}
                            className="bg-[#3b4256] hover:bg-[#2d3142] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Create Programme
                        </button>
                    </div>
                </div>

                {/* Top 3 Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-600">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-4xl font-semibold text-slate-800 mb-1">12</h3>
                        <p className="text-slate-500 text-sm font-medium mb-1">Active Connections</p>
                        <p className="text-slate-400 text-xs">+3 this month</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-600">
                            <Briefcase size={20} />
                        </div>
                        <h3 className="text-4xl font-semibold text-slate-800 mb-1">8</h3>
                        <p className="text-slate-500 text-sm font-medium mb-1">Programmes Joined</p>
                        <p className="text-slate-400 text-xs">2 in progress</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-600">
                            <Award size={20} />
                        </div>
                        <h3 className="text-4xl font-semibold text-slate-800 mb-1">142</h3>
                        <p className="text-slate-500 text-sm font-medium mb-1">Passport Score</p>
                        <p className="text-slate-400 text-xs">Lower is better</p>
                    </div>
                </div>

                {/* Middle Score Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex items-center gap-6 mb-6">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
                            <circle cx="36" cy="36" r="32" stroke="#f1f5f9" strokeWidth="6" fill="none" />
                            <circle
                                cx="36" cy="36" r="32"
                                stroke="#2d3142"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray="201"
                                strokeDashoffset="60"
                                className="transition-all duration-1000 ease-in-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-slate-800">142</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Passport Score</h3>
                        <p className="text-slate-500 text-sm">Lower scores indicate better performance</p>
                    </div>
                </div>

                {/* Bottom Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-xl font-semibold text-slate-800">Past Connections</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Company Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Programme</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {tableData.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5 font-medium text-slate-900">{row.companyName}</td>
                                    <td className="px-6 py-5 text-slate-500">{row.type}</td>
                                    <td className="px-6 py-5 text-slate-500">{row.programme}</td>
                                    <td className="px-6 py-5 text-slate-500">{row.date}</td>
                                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${row.status === 'Completed' ? 'bg-green-100 text-green-700' : ''}
                        ${row.status === 'Active' ? 'bg-blue-100 text-blue-700' : ''}
                        ${row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                      `}>
                        {row.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-full"><ChevronLeft size={16} /></button>
                        <button className="w-8 h-8 flex items-center justify-center text-sm text-slate-500 hover:bg-slate-100 rounded-full">1</button>
                        <button className="w-8 h-8 flex items-center justify-center text-sm text-slate-500 hover:bg-slate-100 rounded-full">2</button>
                        <button className="w-8 h-8 flex items-center justify-center text-sm bg-[#2d3142] text-white rounded-full font-medium">3</button>
                        <button className="w-8 h-8 flex items-center justify-center text-sm text-slate-500 hover:bg-slate-100 rounded-full">4</button>
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-full"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#1e2330] hover:bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
                <HelpCircle size={24} />
            </button>
        </main>
    );
}