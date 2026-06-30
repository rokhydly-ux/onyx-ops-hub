"use client";
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowRight, Lock, Phone, Stethoscope } from 'lucide-react';

export default function NutriAfroLogin() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClientComponentClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const cleanPhone = phone.replace(/\s+/g, '');
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: `${cleanPhone}@clients.onyxcrm.com`,
                password,
            });
            if (authError) throw authError;
            window.location.href = '/nutrition'; // Redirection directe Espace Client
        } catch (err) {
            setError("Identifiants incorrects.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-hidden font-sans">

            {/* Formulaire Gauche */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 min-h-screen lg:min-h-0">
                {/* Image Fond Mobile */}
                <div className="lg:hidden absolute inset-0 w-full h-full opacity-30 z-[-1]">
                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg" alt="NutriAfro Mobile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                </div>

                <div className="w-full max-w-md bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">
                    <div className="flex justify-center mb-8">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro" className="h-16 object-contain" />
                    </div>
                    <h1 className="text-2xl font-black text-white text-center uppercase tracking-wider mb-2">Bienvenue</h1>
                    <p className="text-zinc-400 text-sm text-center mb-8">Accédez à votre Sama Menu.</p>

                    {error && <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="relative">
                            <Phone size={16} className="absolute top-4 left-4 text-zinc-400" />
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Numéro WhatsApp" required className="w-full bg-black/80 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:border-[#39FF14] outline-none transition-all placeholder:text-zinc-600" />
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute top-4 left-4 text-zinc-400" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required className="w-full bg-black/80 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:border-[#39FF14] outline-none transition-all placeholder:text-zinc-600" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full mt-4 bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform flex justify-center items-center gap-2">
                            {loading ? "Connexion..." : "Ouvrir mon Dashboard"} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <a href="/" className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all flex justify-center items-center gap-2">
                            <Stethoscope size={14}/> Démarrer le diagnostic gratuit
                        </a>
                    </div>
                </div>
            </div>

            {/* Image Droite (PC) */}
            <div className="hidden lg:block w-1/2 relative h-screen">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10"></div>
                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594196/redimensionner_en_format_16_9_202606272100_k2o5yh.jpg" alt="Nutrition Cover" className="w-full h-full object-cover" />
            </div>
        </div>
    );
}
