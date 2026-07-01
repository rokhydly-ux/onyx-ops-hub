"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, Lock, User, X } from 'lucide-react';
import DiagnosticModal from '@/components/DiagnosticModal';

export default function NutriAfroLogin() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showBubble, setShowBubble] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<string | undefined>(undefined);
    const [showFaq, setShowFaq] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const cleanInput = identifier.replace(/\s+/g, '');
            // Détection Email vs WhatsApp
            const authEmail = cleanInput.includes('@')
                ? cleanInput
                : `${cleanInput}@clients.onyxcrm.com`;

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: authEmail,
                password,
            });
            if (authError) throw authError;
            window.location.href = '/nutrition';
        } catch (err) {
            setError("Identifiants incorrects. Vérifiez vos accès.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-hidden font-sans relative">

            {/* ÉLÉMENTS FLOTTANTS (PARALLAX BACKGROUND) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Tomate (En haut à gauche) */}
                <img
                    src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782919475/tomates_nqeqjn.png"
                    alt="Tomate"
                    className="absolute top-10 left-10 w-24 md:w-32 opacity-80 blur-[1px] animate-[bounce_6s_ease-in-out_infinite]"
                />
                {/* Mangue (En bas au milieu) */}
                <img
                    src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782918952/MANGO_lo6yxx.png"
                    alt="Mangue"
                    className="absolute bottom-32 left-[45%] lg:left-[48%] w-28 md:w-40 opacity-70 blur-[1px] animate-[bounce_8s_ease-in-out_infinite_reverse]"
                />
            </div>

            {/* MOITIÉ GAUCHE : Formulaire Glassmorphism */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 min-h-screen lg:min-h-0">

                {/* Image Mobile Uniquement */}
                <div className="lg:hidden absolute inset-0 w-full h-full opacity-30 z-[-1]">
                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594196/redimensionner_en_format_16_9_202606272100_k2o5yh.jpg" alt="Fond Mobile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                </div>

                {/* LA CARTE GLASSMORPHISM */}
                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 relative">

                    {/* IMAGE FONDATRICE (En bas à droite du formulaire) */}
                    <div className="absolute -bottom-10 -right-12 w-40 md:w-48 z-50 pointer-events-auto">
                        {showBubble && (
                            <div className="absolute -top-32 -right-8 w-56 bg-zinc-900 border border-[#39FF14]/40 text-white text-xs p-4 rounded-2xl shadow-[0_0_25px_rgba(57,255,20,0.2)] z-[100] animate-fade-in">
                                <button type="button" onClick={() => setShowBubble(false)} className="absolute top-2 right-2 text-zinc-400 hover:text-white p-1">
                                    <X size={14} />
                                </button>
                                <p className="pr-2 leading-relaxed font-medium">Tu veux perdre du poids ou prendre de la masse en mangeant sunu plats locaux yi ? Fais le test.</p>
                                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-zinc-900 border-r border-b border-[#39FF14]/40 rotate-45"></div>
                            </div>
                        )}
                        <img
                            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782914179/JEUNE_FILLE_g6qdwc.png"
                            alt="Coach Rokhy"
                            className="w-full h-auto drop-shadow-2xl animate-[bounce_7s_ease-in-out_infinite]"
                        />
                    </div>

                    <div className="flex justify-center mb-6">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro" className="w-40 sm:w-48 h-auto object-contain drop-shadow-xl" />
                    </div>
                    <h1 className="text-2xl font-black text-white text-center uppercase tracking-wider mb-2">Bon retour !</h1>
                    <p className="text-zinc-400 text-sm text-center mb-6">Accédez à votre espace nutritionnel.</p>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-4 relative z-30">
                        <div className="relative">
                            <User size={16} className="absolute top-4 left-4 text-zinc-400" />
                            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email ou N° WhatsApp" required className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:border-[#39FF14] focus:bg-black/60 outline-none transition-all placeholder:text-zinc-600" />
                        </div>

                        <div className="relative">
                            <Lock size={16} className="absolute top-4 left-4 text-zinc-400" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:border-[#39FF14] focus:bg-black/60 outline-none transition-all placeholder:text-zinc-600" />
                        </div>

                        {/* Options : Remember Me & Forgot Password */}
                        <div className="flex justify-between items-center px-1 py-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded bg-black border-white/20 text-[#39FF14] focus:ring-[#39FF14] focus:ring-offset-black accent-[#39FF14]" />
                                <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Rester connecté</span>
                            </label>
                            <a href="#" className="text-xs text-zinc-400 hover:text-[#39FF14] transition-colors">Mot de passe oublié ?</a>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                            {loading ? "Connexion..." : "Ouvrir mon Dashboard"} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="mt-6 relative z-30">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-zinc-600 text-xs uppercase font-bold tracking-widest">OU</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        {/* Bouton Google */}
                        <button type="button" className="w-full bg-white text-black border border-transparent py-3.5 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-colors flex justify-center items-center gap-3">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continuer avec Google
                        </button>
                    </div>

                    {/* SÉLECTION D'OBJECTIF DIRECTE (ANTI-FRICTION) */}
                    <div className="mt-6 pt-6 border-t border-white/10 relative z-30">
                        <p className="text-zinc-500 text-xs text-center mb-4 uppercase font-bold tracking-widest">Quel est ton objectif ?</p>

                        <div className="grid grid-cols-3 gap-2">
                            {/* Choix 1 : Perte de poids */}
                            <button
                                type="button"
                                onClick={() => { setSelectedGoal('perte'); setIsModalOpen(true); }}
                                className="group bg-[#39FF14]/10 border border-[#39FF14]/40 hover:bg-[#39FF14]/20 hover:border-[#39FF14] text-white py-3 rounded-xl transition-all flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] cursor-pointer"
                            >
                                <span className="text-[10px] uppercase font-bold tracking-wider text-center px-1">Perdre<br/>du Poids</span>
                            </button>

                            {/* Choix 2 : Prise de masse */}
                            <button
                                type="button"
                                onClick={() => { setSelectedGoal('prise'); setIsModalOpen(true); }}
                                className="group bg-[#39FF14]/10 border border-[#39FF14]/40 hover:bg-[#39FF14]/20 hover:border-[#39FF14] text-white py-3 rounded-xl transition-all flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] cursor-pointer"
                            >
                                <span className="text-[10px] uppercase font-bold tracking-wider text-center px-1">Prendre<br/>de la Masse</span>
                            </button>

                            {/* Choix 3 : Maintien */}
                            <button
                                type="button"
                                onClick={() => { setSelectedGoal('maintien'); setIsModalOpen(true); }}
                                className="group bg-[#39FF14]/10 border border-[#39FF14]/40 hover:bg-[#39FF14]/20 hover:border-[#39FF14] text-white py-3 rounded-xl transition-all flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] cursor-pointer"
                            >
                                <span className="text-[10px] uppercase font-bold tracking-wider text-center px-1">Maintenir<br/>la Forme</span>
                            </button>
                        </div>

                        <div className="mt-4 text-center relative z-40">
                            <button
                                type="button"
                                onClick={() => setShowFaq(!showFaq)}
                                className="text-[11px] text-zinc-400 hover:text-[#39FF14] transition-colors underline decoration-dashed underline-offset-4"
                            >
                                Comment fonctionne le bilan personnalisé ?
                            </button>

                            {showFaq && (
                                <div className="mt-3 p-4 bg-black/60 border border-white/10 rounded-xl text-left text-xs text-zinc-300 space-y-2 backdrop-blur-md animate-fade-in mx-auto w-full max-w-xs shadow-xl">
                                    <p><strong className="text-[#39FF14]">1.</strong> Tu choisis ton objectif physique.</p>
                                    <p><strong className="text-[#39FF14]">2.</strong> Tu réponds à 4 questions rapides.</p>
                                    <p><strong className="text-[#39FF14]">3.</strong> On calcule tes calories exactes adaptées à la gastronomie africaine !</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MOITIÉ DROITE : Image Cover Desktop */}
            <div className="hidden lg:block w-1/2 relative h-screen">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10 pointer-events-none"></div>
                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594196/redimensionner_en_format_16_9_202606272100_k2o5yh.jpg" alt="Nutrition Cover" className="w-full h-full object-cover" />
            </div>
            <DiagnosticModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialGoal={selectedGoal}
            />
        </div>
    );
}
