import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore'; // Only need onSnapshot for real-time
import { Plus, Calendar, Users, MoreHorizontal, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import './MyProgrammesModern.css';

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
    imageUrl?: string;
}

export default function MyProgrammes({ onNavigate, onViewDetails }: MyProgrammesProps) {
    const [programmes, setProgrammes] = useState<Programme[]>([]);
    const [loading, setLoading] = useState(true);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    // REAL-TIME LISTENER (This replaces both previous effects)
    useEffect(() => {
        const programmesCol = collection(db, 'programmes');

        // onSnapshot sets up a permanent link. When the DB changes, this function triggers automatically.
        const unsubscribe = onSnapshot(programmesCol, (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Programme[];

            setProgrammes(data);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to programmes:", error);
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    // MOUSE TRACKING
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
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

    // Helper function to get high-quality thematic images
    const getStockImage = (type: string, index: number) => {
        const typeLower = type?.toLowerCase() || '';
        const images = {
            accelerator: '1559136555-9303baea8ebd',
            mentorship: '1515187029135-18ee286d815b',
            tech: '1518770660439-4636190af475',
            business: '1486406146926-c627a92ad1ab'
        };

        let id = images.business;
        if (typeLower.includes('accelerator')) id = images.accelerator;
        else if (typeLower.includes('mentorship')) id = images.mentorship;
        else if (typeLower.includes('tech')) id = images.tech;

        return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=800`;
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="modern-programmes-container">
            <div
                className="custom-cursor"
                style={{
                    '--x': mousePos.x,
                    '--y': mousePos.y,
                    transform: `translate(calc(${mousePos.x}px - 50%), calc(${mousePos.y}px - 50%)) scale(${isHovering ? 1 : 0})`
                } as React.CSSProperties}
            >
                <span className="cursor-text">VIEW</span>
            </div>

            <div className="programmes-header-minimal">
                <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-2">Institutional</h2>
                <h1 className="text-4xl font-black text-white italic">Programmes</h1>
            </div>

            <div className="modern-grid">
                {programmes.map((prog, index) => (
                    <article
                        key={prog.id}
                        className="programme-card"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        onClick={() => onViewDetails(prog.id)}
                    >
                        <img
                            src={prog.imageUrl || getStockImage(prog.type, index)}
                            alt={prog.name}
                            className="card-bg-image"
                        />

                        <div className="card-content">
                            <div className="card-info-wrapper">
                                <span className="prog-type">{prog.type}</span>
                                <h3 className="prog-name">
                                    <span>{prog.name}</span>
                                </h3>
                                <div className="prog-meta">
                                    <span>{prog.status}</span>
                                    <span className="dot">•</span>
                                    <span>{prog.entities?.length || 0} Entities</span>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}
