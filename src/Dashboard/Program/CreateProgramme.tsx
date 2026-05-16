
import { CreditCard, HelpCircle, ArrowLeft } from 'lucide-react';

interface CreateProgrammeProps {
    onNavigate: (view: 'dashboard' | 'programmes' | 'create') => void;
}

export default function CreateProgramme({ onNavigate }: CreateProgrammeProps) {
    return (
        <main className="flex-1 flex flex-col h-full relative overflow-y-auto">

            {/* Top Header/Nav */}
            <header className="flex justify-end items-center p-6 pb-2 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-white border border-slate-200 text-slate-500 text-xs px-4 py-1.5 rounded-full shadow-sm">
                        Screen 4: Create Programme
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#2d3142] text-white flex items-center justify-center font-semibold text-sm">
                        A
                    </div>
                </div>
            </header>

            <div className="px-10 pb-12 max-w-3xl mx-auto w-full mt-2">

                {/* Back Button */}
                <button
                    onClick={() => onNavigate('programmes')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium mb-6"
                >
                    <ArrowLeft size={16} /> Back to Programmes
                </button>

                <h2 className="text-3xl font-bold text-[#0f172a] mb-8">Create New Programme</h2>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#3b4256] text-white flex items-center justify-center text-sm font-medium shadow-sm">1</div>
                        <span className="text-sm font-medium text-slate-900">Details</span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200 mx-4"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-medium">2</div>
                        <span className="text-sm font-medium text-slate-500">Requirements</span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200 mx-4"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-medium">3</div>
                        <span className="text-sm font-medium text-slate-500">Payment</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 space-y-6">

                        {/* Programme Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Programme Name</label>
                            <input type="text" placeholder="e.g. Summer Startup Accelerator 2024" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"/>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                            <textarea rows={4} placeholder="Describe the programme objectives and benefits..." className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all resize-none"></textarea>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                            <select className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all appearance-none cursor-pointer">
                                <option>Mentorship</option>
                                <option>Accelerator</option>
                                <option>Grant</option>
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                                <input type="text" placeholder="mm/dd/yyyy" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                                <input type="text" placeholder="mm/dd/yyyy" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"/>
                            </div>
                        </div>

                        {/* Required Entities */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Required Entity Type</label>
                            <div className="flex items-center gap-2">
                                <button className="px-5 py-1.5 rounded-full bg-[#3b4256] text-white text-sm font-medium transition-colors">Startup</button>
                                <button className="px-5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors">Mentor</button>
                                <button className="px-5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors">Sponsor</button>
                                <button className="px-5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors">Venue</button>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-100 my-2"></div>

                        {/* Payment Details */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard size={18} className="text-slate-700" />
                                <h3 className="text-sm font-bold text-slate-800">Payment Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Card Number</label>
                                    <input type="text" placeholder="1234 5678 9012 3456" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Expiry Date</label>
                                        <input type="text" placeholder="MM/YY" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5">CVV</label>
                                        <input type="text" placeholder="123" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Submit Button */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <button
                            onClick={() => onNavigate('programmes')}
                            className="w-full bg-[#3b4256] hover:bg-[#2d3142] text-white rounded-lg py-3.5 text-sm font-semibold transition-colors shadow-sm"
                        >
                            Create Programme
                        </button>
                    </div>
                </div>
            </div>

            <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#1e2330] hover:bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
                <HelpCircle size={24} />
            </button>
        </main>
    );
}