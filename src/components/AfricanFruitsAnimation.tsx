"use client";
import React, { useEffect, useState } from 'react';

const FRUIT_IMAGES = [
    'https://res.cloudinary.com/dtr2wtoty/image/upload/f_webp,q_auto,w_120/v1791984599/1_ol9nva.png', // Bissap
    'https://res.cloudinary.com/dtr2wtoty/image/upload/f_webp,q_auto,w_120/v1791984599/2_cm6zqm.png', // Bouye
    'https://res.cloudinary.com/dtr2wtoty/image/upload/f_webp,q_auto,w_120/v1791984599/3_hl0fua.png', // Gombo
    'https://res.cloudinary.com/dtr2wtoty/image/upload/f_webp,q_auto,w_120/v1791984599/4_lpcpp2.png'  // Mangue Kent
];

interface Particle {
    id: number;
    left: number;
    animationDuration: number;
    animationDelay: number;
    fruitIndex: number;
    rotation: number;
    scale: number;
}

export default function AfricanFruitsAnimation() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const generatedParticles: Particle[] = [];
        for (let i = 0; i < 30; i++) {
            generatedParticles.push({
                id: i,
                left: Math.random() * 100, // random left position
                animationDuration: Math.random() * 2 + 3, // 3 to 5 seconds
                animationDelay: Math.random() * 2, // 0 to 2 seconds delay
                fruitIndex: Math.floor(Math.random() * FRUIT_IMAGES.length),
                rotation: Math.random() * 360,
                scale: Math.random() * 0.5 + 0.5 // scale between 0.5 and 1
            });
        }
        setParticles(generatedParticles);
    }, []);

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
            <style>{`
                @keyframes fallAndRotate {
                    0% {
                        transform: translateY(-100px) rotate(0deg) scale(var(--scale));
                        opacity: 1;
                    }
                    80% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(var(--endRotation)) scale(var(--scale));
                        opacity: 0;
                    }
                }
                .fruit-particle {
                    position: absolute;
                    top: -100px;
                    animation: fallAndRotate linear forwards;
                }
            `}</style>
            {particles.map((p) => (
                <img
                    key={p.id}
                    src={FRUIT_IMAGES[p.fruitIndex]}
                    alt="African Fruit"
                    className="fruit-particle drop-shadow-xl"
                    style={{
                        left: `${p.left}%`,
                        animationDuration: `${p.animationDuration}s`,
                        animationDelay: `${p.animationDelay}s`,
                        '--scale': p.scale,
                        '--endRotation': `${p.rotation + 360}deg`,
                        width: '40px', // or adjust via w_120
                        height: 'auto'
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}
