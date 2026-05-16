import { useState } from 'react';
import { CreditCard, HelpCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Make sure this path is correct for your structure!
import { recordProgrammeEvent } from '../../lib/api';
import { getLatestPassport } from '../../lib/passports';

interface CreateProgrammeProps {
    onNavigate: (view: 'dashboard' | 'programmes' | 'create') => void;
}

export default function CreateProgramme({ onNavigate }: CreateProgrammeProps) {
    // 1. Form State setup
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Mentorship');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

    // Loading state for the submit button
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper function to toggle multiple entities on/off
    const toggleEntity = (entity: string) => {
        if (selectedEntities.includes(entity)) {
            setSelectedEntities(selectedEntities.filter(e => e !== entity));
        } else {
            setSelectedEntities([...selectedEntities, entity]);
        }
    };

    // 2. Submit handler to push data to Firebase
    const handleSubmit = async () => {
        // Basic validation
        if (!name || !description || !startDate || !endDate) {
            alert("Please fill out all the fields before creating.");
            return;
        }

        setIsSubmitting(true);

        try {
            const latestPassport = await getLatestPassport();

            if (!latestPassport?.companyId) {
                alert("Create a company passport before creating a programme so the passport score can be updated.");
                return;
            }

            // Push the new document to the "programmes" collection
            const programmeRef = await addDoc(collection(db, "programmes"), {
                name: name,
                description: description,
                type: type,
                startDate: startDate,
                endDate: endDate,
                entities: selectedEntities,
                status: "Active", // Defaulting new programmes to Active
                ownerCompanyId: latestPassport.companyId,
                ownerPassportId: latestPassport.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            await recordProgrammeEvent(programmeRef.id, {
                companyId: latestPassport.companyId,
                eventType: "programme_created",
                payload: {
                    name,
                    type,
                    startDate,
                    endDate,
                    entities: selectedEntities,
                },
            });

            // Once successful, send the user back to the Programmes grid to see it!
            onNavigate('programmes');

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to create the programme. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
            <div className="lines-container">
                <div className="line-drop"></div>
                <div className="line-drop"></div>
                <div className="line-drop"></div>
            </div>

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
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Summer Startup Accelerator 2024"
                                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"
                            />
                        </div>

                        {/* Description test */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the programme objectives and benefits..."
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all appearance-none cursor-pointer"
                            >
                                <option value="Mentorship">Mentorship</option>
                                <option value="Accelerator">Accelerator</option>
                                <option value="Grant">Grant</option>
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                                <input
                                    type="text"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    placeholder="mm/dd/yyyy"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                                <input
                                    type="text"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    placeholder="mm/dd/yyyy"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all"
                                />
                            </div>
                        </div>

                        {/* Required Entities (Toggleable Buttons) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Required Entity Type (Select multiple)</label>
                            <div className="flex items-center gap-2">
                                {['Startup', 'Mentor', 'Sponsor', 'Venue'].map((entity) => {
                                    const isSelected = selectedEntities.includes(entity);
                                    return (
                                        <button
                                            key={entity}
                                            onClick={() => toggleEntity(entity)}
                                            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                                isSelected
                                                    ? 'bg-[#3b4256] text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {entity}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-100 my-2"></div>

                        {/* Payment Details (UI Only for now) */}
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
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-[#3b4256] hover:bg-[#2d3142] disabled:bg-slate-400 text-white rounded-lg py-3.5 text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Programme"
                            )}
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
