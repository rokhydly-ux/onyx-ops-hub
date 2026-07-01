
"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, Lock, User, X, Sun, Moon, Play, ArrowLeft } from 'lucide-react';
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
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

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
        <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-zinc-100'} flex flex-col lg:flex-row overflow-hidden font-sans relative transition-colors duration-500`}>

            {/* TOGGLE SOMBRE / CLAIR */}
            <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`absolute top-6 right-6 z-50 p-3 rounded-full border backdrop-blur-md transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-black/5 border-black/10 text-black hover:bg-black/10'}`}
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* ÉLÉMENTS FLOTTANTS (PARALLAX BACKGROUND) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Tomate (En haut à gauche) */}
                <img
                    src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782919475/tomates_nqeqjn.png"
                    alt="Tomate"
                    className="absolute top-10 left-10 w-24 md:w-32 opacity-80 blur-[1px] animate-[bounce_6s_ease-in-out_infinite]"
                />
            </div>

            {/* MOITIÉ GAUCHE : Formulaire Glassmorphism */}
            <div className="w-full lg:w-2/3 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 min-h-screen lg:min-h-0">

                {/* Image Mobile Uniquement */}
                <div className="lg:hidden absolute inset-0 w-full h-full opacity-30 z-[-1]">
                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594196/redimensionner_en_format_16_9_202606272100_k2o5yh.jpg" alt="Fond Mobile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                </div>

                {/* LA CARTE GLASSMORPHISM */}
                <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-[2.5rem] py-4 px-8 relative">

                    {/* IMAGE FONDATRICE (En bas à droite du formulaire) */}
                    <div className="absolute -bottom-10 -right-24 md:-right-32 w-40 md:w-48 z-50 pointer-events-auto">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782918952/MANGO_lo6yxx.png" alt="Mangue" className="absolute bottom-[80%] -right-10 w-20 md:w-24 opacity-80 blur-[1px] animate-[bounce_8s_ease-in-out_infinite_reverse] z-10" />

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

                    <div className="flex justify-center mb-2 relative">
                        <a href="/solutions/onyx-nutritionafricaine" className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-zinc-500 hover:text-black hover:bg-black/5'}`}>
                            <ArrowLeft size={20} />
                        </a>
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro" className="w-28 sm:w-32 h-auto object-contain drop-shadow-xl mb-2" />
                    </div>
                    <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-black'} text-center uppercase tracking-wider mb-2`}>Bon retour !</h1>
                    <p className={`text-sm text-center mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Accédez à votre espace nutritionnel.</p>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2 rounded-xl mb-4 text-center">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-2 relative z-30">
                        <div className="relative">
                            <User size={16} className={`absolute top-3.5 left-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email ou N° WhatsApp" required className={`w-full ${isDarkMode ? 'bg-black/40 border-white/10 text-white focus:bg-black/60 placeholder:text-zinc-600' : 'bg-white/40 border-black/10 text-black focus:bg-white/60 placeholder:text-zinc-500'} border rounded-2xl py-3 pl-12 pr-4 focus:border-[#39FF14] outline-none transition-all`} />
                        </div>

                        <div className="relative">
                            <Lock size={16} className={`absolute top-3.5 left-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required className={`w-full ${isDarkMode ? 'bg-black/40 border-white/10 text-white focus:bg-black/60 placeholder:text-zinc-600' : 'bg-white/40 border-black/10 text-black focus:bg-white/60 placeholder:text-zinc-500'} border rounded-2xl py-3 pl-12 pr-4 focus:border-[#39FF14] outline-none transition-all`} />
                        </div>

                        {/* Options : Remember Me & Forgot Password */}
                        <div className="flex justify-between items-center px-1 py-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className={`w-4 h-4 rounded text-[#39FF14] focus:ring-[#39FF14] accent-[#39FF14] ${isDarkMode ? 'bg-black border-white/20 focus:ring-offset-black' : 'bg-white border-black/20 focus:ring-offset-white'}`} />
                                <span className={`text-xs transition-colors ${isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-600 group-hover:text-black'}`}>Rester connecté</span>
                            </label>
                            <a href="#" className={`text-xs transition-colors hover:text-[#39FF14] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Mot de passe oublié ?</a>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#39FF14] text-black py-3 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                            {loading ? "Connexion..." : "Ouvrir mon Dashboard"} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="mt-4 relative z-30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`h-px flex-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
                            <span className="text-zinc-600 text-xs uppercase font-bold tracking-widest">OU</span>
                            <div className={`h-px flex-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
                        </div>

                        {/* Bouton Google */}
                        <button type="button" className={`w-full border border-transparent py-3 rounded-2xl font-bold text-sm transition-colors flex justify-center items-center gap-3 ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
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
                    <div className={`mt-4 pt-4 border-t relative z-30 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                        <p className={`text-xs text-center mb-3 uppercase font-bold tracking-widest ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Quel est ton objectif ?</p>

                        <div className="grid grid-cols-3 gap-2">
                            {/* Choix 1 : Perte de poids */}
                            <button
                                type="button"
                                onClick={() => { setSelectedGoal('perte'); setIsModalOpen(true); }}
                                className={`group bg-[#39FF14]/10 border border-[#39FF14]/40 hover:bg-[#39FF14]/20 hover:border-[#39FF14] py-3 rounded-xl transition-all flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] cursor-pointer ${isDarkMode ? 'text-white' : 'text-black'}`}
                            >
                                <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-center px-0.5 sm:px-1 leading-tight">Perdre<br/>du Poids</span>
                            </button>

                            {/* Choix 2 : Prise de masse */}
                            <button
                                type="button"
                                onClick={() => { setSelectedGoal('prise'); setIsModalOpen(true); }}
                                className={`group bg-[#39FF14]/10 border border-[#39FF14]/40 hover:bg-[#39FF14]/20 hover:border-[#39FF14] py-3 rounded-xl transition-all flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] cursor-pointer ${isDarkMode ? 'text-white' : 'text-black'}`}
                            >
                                <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-center px-0.5 sm:px-1 leading-tight">Prendre<br/>de la Masse</span>
                            </button>

                            {/* Choix 3 : Maintien */}
                            <button
                                type="button"
                                onClick={() => { setSelectedGoal('maintien'); setIsModalOpen(true); }}
                                className={`group bg-[#39FF14]/10 border border-[#39FF14]/40 hover:bg-[#39FF14]/20 hover:border-[#39FF14] py-3 rounded-xl transition-all flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] cursor-pointer ${isDarkMode ? 'text-white' : 'text-black'}`}
                            >
                                <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-center px-0.5 sm:px-1 leading-tight">Maintenir<br/>la Forme</span>
                            </button>
                        </div>

                        <div className="mt-4 text-center relative z-40">
                            <button
                                type="button"
                                onClick={() => setShowVideoModal(true)}
                                className={`mt-2 w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-xl transition-all group ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#39FF14]' : 'bg-zinc-100 border-zinc-200 hover:border-[#39FF14]'}`}
                            >
                                <div className="bg-[#39FF14] text-black rounded-full p-2 group-hover:scale-110 transition-transform">
                                    <Play size={16} className="ml-0.5" fill="currentColor" />
                                </div>
                                <span className={`text-sm font-medium transition-colors group-hover:text-[#39FF14] ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    Voir comment fonctionne le Bilan
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOITIÉ DROITE : Image Cover Desktop */}
            <div
                className="hidden lg:block w-1/3 relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
                style={{ backgroundImage: "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594196/redimensionner_en_format_16_9_202606272100_k2o5yh.jpg')" }}
            >
                <div className={`absolute inset-0 bg-gradient-to-r z-10 pointer-events-none ${isDarkMode ? 'from-black via-black/50' : 'from-zinc-100 via-zinc-100/50'} to-transparent`}></div>
            </div>

            {/* FOOTER ESPACE CLIENT (ADAPTED FOR LOGIN) */}
            <div className="absolute bottom-0 w-full lg:w-2/3">
                <footer className={`py-6 px-6 text-center border-t relative z-10 ${isDarkMode ? 'bg-black text-white border-white/10' : 'bg-zinc-100 text-black border-black/10'}`}>
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 text-left">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="Onyx Logo" className="h-8 w-auto object-contain opacity-80" />
                            </div>
                            <p className={`text-xs max-w-sm mb-4 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                Le premier écosystème digital pour votre santé. Rééquilibrez votre alimentation selon nos réalités africaines.
                            </p>
                        </div>
                        <div>
                            <h4 className={`font-black uppercase text-xs tracking-widest mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Ressources</h4>
                            <ul className={`space-y-3 text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Articles</a></li>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Apprendre</a></li>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Newsletter</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className={`font-black uppercase text-xs tracking-widest mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Aide</h4>
                            <ul className={`space-y-3 text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">À propos</a></li>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Politique de confidentialité</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className={`font-black uppercase text-xs tracking-widest mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Nous suivre</h4>
                            <ul className={`space-y-3 text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Instagram</a></li>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">YouTube</a></li>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Pinterest</a></li>
                                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Facebook</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed ${isDarkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
                            NutriAfro © 2026<br/>
                            Onyx Ops Elite
                        </p>
                        <div className="flex gap-2">
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8" />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8" />
                            </a>
                        </div>
                    </div>
                </footer>
            </div>

            <DiagnosticModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialGoal={selectedGoal}
            />

            {/* VIDEO MODAL (IPHONE MOCKUP) */}
            {showVideoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setShowVideoModal(false); }}>
                    <div className="relative w-full max-w-[320px] mx-auto">

                        {/* Bouton Fermer (En dehors de l'iPhone) */}
                        <button
                            type="button"
                            onClick={() => setShowVideoModal(false)}
                            className="absolute -top-12 right-0 text-white hover:text-[#39FF14] p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* iPhone Mockup Container */}
                        <div className="relative w-[320px] h-[650px] bg-black border-[14px] border-zinc-900 rounded-[3rem] shadow-2xl mx-auto overflow-hidden ring-1 ring-white/10">

                            {/* Dynamic Island / Notch */}
                            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                                <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
                            </div>

                            {/* Écran (Video Iframe) */}
                            <div className="relative w-full h-full bg-zinc-900 pt-8 rounded-[2rem] overflow-hidden">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/q-BscsUflrw?autoplay=1"
                                    title="Demo NutriAfro"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-[2rem] w-full h-full object-cover"
                                ></iframe>
                            </div>

                            {/* Home Indicator (Barre en bas) */}
                            <div className="absolute bottom-2 inset-x-0 h-1 flex justify-center z-20 pointer-events-none">
                                <div className="w-1/3 h-1 bg-white/50 rounded-full"></div>
                            </div>
                        </div>

                        {/* Bouton FAIRE LE BILAN GRATUIT */}
                        <button
                            type="button"
                            onClick={() => { setShowVideoModal(false); setIsModalOpen(true); }}
                            className="mt-6 w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(57,255,20,0.4)]"
                        >
                            FAIRE LE BILAN GRATUIT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
