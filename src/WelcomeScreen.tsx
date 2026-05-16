// src/WelcomeScreen.tsx
import { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
    onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // --- KEEP YOUR EXISTING PARTICLE LOGIC ---
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const { clientX, clientY } = e;

            // Simple spawn logic for cursor trails
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${clientX}px`;
            particle.style.top = `${clientY}px`;
            particle.style.opacity = '0.8';

            containerRef.current.appendChild(particle);

            setTimeout(() => {
                particle.style.transform = `translate(${(Math.random() - 0.5) * 50}px, ${(Math.random() - 0.5) * 50}px)`;
                particle.style.opacity = '0';
            }, 10);

            setTimeout(() => particle.remove(), 1000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="welcome-screen-wrapper" ref={containerRef}>
            {/* BACKGROUND LAYERS (Behind the Card) */}
            <div className="parallax-bg layer-clouds"></div>
            <div className="parallax-bg layer-mountains"></div>
            <div className="parallax-bg layer-hills"></div>

            {/* THE UI CARD (The "Middle" of the sandwich) */}
            <div className="content-container">
                <div className="glass-welcome-card">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                            <Sparkles className="text-white" size={32} />
                        </div>
                    </div>
                    <h1 className="welcome-title">InnoWeb</h1>
                    <p className="welcome-subtitle">
                        The next generation of regional innovation. Connect, verify, and scale within a trusted institutional ecosystem.
                    </p>
                    <button onClick={onEnter} className="welcome-btn group mx-auto">
                        Enter Ecosystem
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* FOREGROUND LAYERS (In front of the Card) */}
            <div className="parallax-bg layer-ground"></div>
            <div className="parallax-bg layer-foreground"></div>

            {/* CURSOR PARTICLES (Top level) */}
            <div className="particles-container"></div>
        </div>
    );
}