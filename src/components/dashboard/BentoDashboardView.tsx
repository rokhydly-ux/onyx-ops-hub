"use client";

import React, { useState } from 'react';
import {
    Activity, Droplet, Moon, Search, Bell, LogOut,
    Settings, User as UserIcon, Send, MoreHorizontal, MessageSquare, Heart
} from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";

// Props required for the weaving
interface BentoDashboardViewProps {
    user: any;
    waterGlasses: number;
    handleUpdateWater: (delta: number) => void;
    jongomaXP: number;
    clientProfile: any;
    setActiveTab: (tab: string) => void;
    handleMealClick?: (mealType: string, prefillRecipe: any, contextType: string) => void;
}

export default function BentoDashboardView({ user, waterGlasses, handleUpdateWater, jongomaXP, clientProfile, setActiveTab, handleMealClick }: BentoDashboardViewProps) {
    const [coachInput, setCoachInput] = useState('');
    const currentHour = new Date().getHours();
    const greetingText = currentHour < 18 ? "Bonjour" : "Bonsoir";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/nutriafro-login';
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 pb-20">

            {/* Grille Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-6">

                {/* 1. Mon Jour (Validation repas) - prend plus d'espace */}
                <div className="col-span-1 md:col-span-6 h-full rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm flex flex-col min-h-[300px] relative group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setActiveTab('today')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mon Jour</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                        {/* Fake Donut Chart */}
                        <div className="relative w-32 h-32 rounded-full border-8 border-zinc-100 flex items-center justify-center shrink-0">
                            <div className="absolute inset-0 rounded-full border-8 border-[#39FF14] border-t-transparent border-r-transparent rotate-45 transition-all duration-1000"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-black">1240</p>
                                <p className="text-[10px] text-zinc-500 uppercase">/ {clientProfile?.daily_calorie_goal || 1500} Kcal</p>
                            </div>
                        </div>

                        {/* Macros */}
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black flex items-center gap-1"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375734/A_cute__highly_detailed_3D_202606131825_2_roav76.jpg" className="w-3 h-3 rounded-full"/> Protéines</span><span className="text-zinc-500">45 / {clientProfile?.protein_goal || 80}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-1/2"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black flex items-center gap-1"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375738/A_cute__highly_detailed_3D_202606131825_1_epyark.jpg" className="w-3 h-3 rounded-full"/> Glucides</span><span className="text-zinc-500">120 / {clientProfile?.carbs_goal || 150}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-3/4"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black flex items-center gap-1"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375735/A_cute__highly_detailed_3D_202606131826_jbhb58.jpg" className="w-3 h-3 rounded-full"/> Lipides</span><span className="text-zinc-500">30 / {clientProfile?.fats_goal || 50}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-red-400 w-1/3"></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Mon Jour */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <button onClick={(e) => { e.stopPropagation(); setActiveTab('today'); }} className="bg-zinc-50 border border-zinc-200 hover:border-[#39FF14] text-black rounded-xl p-3 text-xs font-bold transition-colors flex items-center justify-center gap-2">
                            🍲 Loguer Repas
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveTab('today'); }} className="bg-[#39FF14] text-black rounded-xl p-3 text-xs font-bold hover:bg-[#32e012] transition-colors flex items-center justify-center gap-2">
                            ✅ Bilan Quotidien
                        </button>
                    </div>
                </div>

                {/* 2. Poids Actuel */}
                <div className="col-span-1 md:col-span-3 h-full rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between min-h-[300px] group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setActiveTab('weight')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Poids Actuel & Objectif</p>
                        <p className="text-5xl font-black text-black mb-1">{clientProfile?.diagnostic_data?.currentWeight || '--'} <span className="text-xl text-zinc-500">kg</span></p>
                        <p className="text-sm font-bold text-zinc-500">Objectif: <span className="text-[#39FF14]">{clientProfile?.diagnostic_data?.targetWeight || '--'} kg</span></p>
                    </div>

                    <div className="mt-8 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-black">Progression</span>
                            <span className="text-[#39FF14]">30%</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#39FF14] w-[30%]"></div>
                        </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-xl pointer-events-none"></div>
                </div>

                {/* 3. HYDRATATION */}
                <div className="col-span-1 md:col-span-3 h-full rounded-[2rem] bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm p-6 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                    <div>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Droplet size={14} className="fill-blue-500"/> Hydratation
                        </p>
                        <p className="text-4xl font-black text-black mb-1">{waterGlasses} <span className="text-xl text-zinc-500">/ 8</span></p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {waterGlasses === 0 && "Il est temps de boire le premier verre !"}
                            {waterGlasses > 0 && waterGlasses < 4 && "Continue comme ça !"}
                            {waterGlasses >= 4 && waterGlasses < 8 && "Tu es à la moitié, bravo !"}
                            {waterGlasses >= 8 && "Objectif atteint !"}
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-4 z-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleUpdateWater(i + 1 - waterGlasses)}
                                className="aspect-square relative flex justify-center items-end hover:scale-110 transition-transform"
                            >
                                <img
                                    src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png"
                                    className={`w-full h-full object-contain ${i < waterGlasses ? 'opacity-100' : 'opacity-20 grayscale'}`}
                                    alt="Verre d'eau"
                                />
                            </button>
                        ))}
                    </div>

                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                {/* 3. Coach IA (Rokhy) */}
                <div className="col-span-1 lg:col-span-5 rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm flex flex-col justify-between min-h-[300px] relative group" onClick={() => setActiveTab('coaching')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors z-10"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782914179/JEUNE_FILLE_g6qdwc.png" className="w-12 h-12 rounded-full object-cover bg-zinc-200 border-2 border-[#39FF14]" alt="Coach Rokhy" />
                        <div>
                            <p className="text-sm font-bold text-black">Coach Rokhy</p>
                            <p className="text-[10px] text-[#39FF14] uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse"></span> En ligne</p>
                        </div>
                    </div>

                    <div className="flex-1 bg-zinc-50 rounded-xl p-4 mb-4 overflow-y-auto space-y-3 border border-zinc-100 relative z-10">
                        <div className="bg-white border border-zinc-200 text-black text-xs p-3 rounded-2xl rounded-tl-sm w-fit max-w-[85%] shadow-sm">
                            Salut ! T'as bien mangé ton Thiéboudienne ce midi ? Pense à faire léger ce soir, un petit bouillon fera l'affaire.
                        </div>
                    </div>

                    <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="text"
                            value={coachInput}
                            onChange={(e) => setCoachInput(e.target.value)}
                            placeholder="Message Rokhy ou Doc..."
                            className="w-full bg-white border border-zinc-200 rounded-full py-3 pl-4 pr-12 text-xs text-black outline-none focus:border-[#39FF14] transition-colors placeholder:text-zinc-400 shadow-sm"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#39FF14] text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                            <Send size={14} />
                        </button>
                    </div>
                </div>

                {/* 4. Sama Menu du Jour */}
                <div className="col-span-1 lg:col-span-4 rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm relative group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setActiveTab('week')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sama Menu</p>
                    </div>

                    <div className="space-y-3">
                        {/* Repas 1 */}
                        <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 hover:border-[#39FF14]/50 transition-colors">
                            <div className="w-16 h-16 bg-zinc-200 rounded-xl shrink-0 overflow-hidden relative">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781222471/Bouillie_de_mil_r2zihq.jpg" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Petit-Déj • 08:00</p>
                                <p className="text-sm font-black text-black mt-0.5">Fondé & Lait</p>
                            </div>
                        </div>

                        {/* Repas 2 */}
                        <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 hover:border-[#39FF14]/50 transition-colors">
                            <div className="w-16 h-16 bg-zinc-200 rounded-xl shrink-0 overflow-hidden relative">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781221768/Thiebou_dieune_1_hftdhm.jpg" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Déjeuner • 13:30</p>
                                <p className="text-sm font-black text-black mt-0.5 line-clamp-1">Thiéboudienne</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Extrait Communauté */}
                <div className="col-span-1 lg:col-span-3 rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm flex flex-col relative group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setActiveTab('community')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 shrink-0">Communauté</p>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {/* Post 1 */}
                        <div className="border-b border-zinc-100 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white">AM</div>
                                    <div>
                                        <p className="text-xs font-bold text-black">Amina Fall</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-600 mb-3 leading-relaxed line-clamp-3">J'ai atteint mon objectif de pas aujourd'hui ! Le menu guidé m'aide tellement à ne pas craquer le soir.</p>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400"><Heart size={12}/> 24</button>
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400"><MessageSquare size={12}/> 5</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIGNE 4 : Navigation Rapide */}
                <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Galerie Recettes */}
                    <div className="rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 relative group cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between h-40" onClick={() => setActiveTab('favorites')}>
                        <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Galerie Recettes</p>
                            <p className="text-lg font-black text-black leading-tight">Découvre les nouveaux plats du mois</p>
                        </div>
                        <div className="flex gap-2">
                           <div className="w-10 h-10 bg-zinc-200 rounded-xl overflow-hidden"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781223916/Ndambe_qeq2d8.jpg" className="w-full h-full object-cover"/></div>
                           <div className="w-10 h-10 bg-zinc-200 rounded-xl overflow-hidden"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781221768/Thiebou_dieune_1_hftdhm.jpg" className="w-full h-full object-cover"/></div>
                        </div>
                    </div>

                    {/* La Minute Doc */}
                    <div className="rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-xl p-6 relative group cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between h-40" onClick={() => setActiveTab('minute-doc')}>
                        <button className="absolute top-6 right-6 text-zinc-500 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                        <div>
                            <p className="text-xs font-bold text-[#39FF14] uppercase tracking-widest mb-1">La Minute Doc</p>
                            <p className="text-lg font-black text-white leading-tight">Conseils du Dr. Thierno en vidéo</p>
                        </div>
                    </div>

                    {/* Fitness */}
                    <div className="rounded-[2rem] bg-[#39FF14] border border-[#39FF14] shadow-sm p-6 relative group cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between h-40" onClick={() => setActiveTab('fitness')}>
                        <button className="absolute top-6 right-6 text-black/50 group-hover:text-black transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                        <div>
                            <p className="text-xs font-bold text-black/70 uppercase tracking-widest mb-1">Fitness & Sport</p>
                            <p className="text-lg font-black text-black leading-tight">Ton programme sportif t'attend !</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
