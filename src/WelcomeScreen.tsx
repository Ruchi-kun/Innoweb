// src/WelcomeScreen.tsx
import { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
    onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastSpawnTime = useRef<number>(0);

    useEffect(() => {
        const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
        let colorIndex = 0;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const { clientX, clientY } = e;

            // 1. PARALLAX EFFECT FOR SPHERES
            const x = (clientX / window.innerWidth - 0.5) * 40;
            const y = (clientY / window.innerHeight - 0.5) * 40;

            const spheres = document.querySelectorAll('.gradient-sphere');
            spheres.forEach((sphere, index) => {
                const factor = (index + 1) * 0.5;
                (sphere as HTMLElement).style.transform = `translate(${x * factor}px, ${y * factor}px)`;
            });

            // 2. CURSOR TRAIL LOGIC
            // Throttle spawning to every 50ms to prevent DOM overload
            const now = Date.now();
            if (now - lastSpawnTime.current > 5) {
                const particle = document.createElement('div');
                particle.className = 'cursor-particle';

                const size = Math.random() * 8 + 4;
                // Randomize drift direction for the "fade and fall" effect
                const driftX = (Math.random() - 0.5) * 100 + 'px';
                const driftY = (Math.random() * 60 + 20) + 'px';

                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${clientX}px`;
                particle.style.top = `${clientY}px`;

                // Cycle through Google colors
                particle.style.backgroundColor = googleColors[colorIndex];
                colorIndex = (colorIndex + 1) % googleColors.length;

                // Set CSS variables for the animation
                particle.style.setProperty('--drift-x', driftX);
                particle.style.setProperty('--drift-y', driftY);

                containerRef.current.appendChild(particle);
                lastSpawnTime.current = now;

                // Cleanup particle after animation ends
                setTimeout(() => {
                    particle.remove();
                }, 800);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Static background particles
    useEffect(() => {
        const container = document.getElementById('particles-js');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 3 + 1 + 'px';
            particle.style.width = size;
            particle.style.height = size;
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.opacity = (Math.random() * 0.4 + 0.1).toString();
            particle.style.animation = `float-${Math.floor(Math.random() * 4) + 1} ${Math.random() * 10 + 10}s infinite alternate`;
            container.appendChild(particle);
        }
    }, []);

    return (
        <div className="welcome-screen-wrapper" ref={containerRef}>
            <div className="gradient-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
                <div className="gradient-sphere sphere-3"></div>
                <div className="gradient-sphere sphere-4"></div>
                <div className="grid-overlay"></div>
                <div className="noise-overlay"></div>
                <div id="particles-js" className="particles-container"></div>
            </div>

            <div className="content-container flex flex-col items-center">
                <div className="glass-welcome-card text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-sm">
                            <Sparkles className="text-white" size={32} />
                        </div>
                    </div>
                    <h1 className="welcome-title">InnoWeb</h1>
                    <p className="welcome-subtitle">
                        The next generation of regional innovation. Connect, verify, and scale within a trusted institutional ecosystem.
                    </p>
                    <button onClick={onEnter} className="welcome-btn group">
                        Enter Ecosystem
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}