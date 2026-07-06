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


    jongomaXP: number;
    clientProfile: any;
}

export default function BentoDashboardView({ user,   jongomaXP, clientProfile }: BentoDashboardViewProps) {
    const [coachInput, setCoachInput] = useState('');
    const currentHour = new Date().getHours();
    const greetingText = currentHour < 18 ? "Bonjour" : "Bonsoir";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/nutriafro-login';
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 pb-20">
            {/* Bannière de Bienvenue */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                    {greetingText} <span className="text-[#39FF14]">{user?.full_name?.split(' ')[0] || 'Membre'}</span>.
                </h1>
            </div>

            {/* Grille Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LIGNE 1 : Quick Stats (12 cols on mobile, 3 cols each on desktop) */}
                <div className="col-span-1 lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Poids */}
                    <div className="rounded-[2rem] bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between h-32">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Poids Actuel</p>
                        <p className="text-3xl font-black text-white">{clientProfile?.diagnostic_data?.currentWeight || '--'} <span className="text-sm">kg</span></p>
                        {/* Fake curve */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#39FF14]/10 to-transparent"></div>
                    </div>
                    {/* Pas */}
                    <div className="rounded-[2rem] bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-sm flex flex-col justify-between h-32">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Activité</p>
                        <p className="text-3xl font-black text-white">5 240 <span className="text-sm text-zinc-500">pas</span></p>
                        <div className="flex gap-1 items-end h-4 mt-2">
                            {[40, 70, 30, 90, 50, 100, 60].map((h, i) => (
                                <div key={i} className="w-full bg-[#39FF14]/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                    {/* Sommeil */}
                    <div className="rounded-[2rem] bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-sm flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sommeil</p>
                            <Moon size={16} className="text-[#00E5FF]" />
                        </div>
                        <p className="text-3xl font-black text-white">{clientProfile?.diagnostic_data?.sleepHours || '7h'} <span className="text-sm text-zinc-500">moy</span></p>
                    </div>
                    {/* Hydratation */}
                    <div className="rounded-[2rem] bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-sm flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hydratation</p>
                            <Droplet size={16} className="text-blue-400" />
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className={`w-6 h-8 rounded-md border border-white/10 ${i <= 3 ? 'bg-blue-500/20 border-blue-500' : 'bg-transparent'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* LIGNE 2 : Nutrition & Coach */}
                {/* Widget Nutrition */}
                <div className="col-span-1 lg:col-span-7 rounded-[2rem] bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-sm flex flex-col justify-between min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Objectif du jour</p>
                        <div className="flex gap-2">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-[#39FF14] text-black' : 'bg-white/5 text-zinc-500'}`}>{d}</div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Fake Donut Chart */}
                        <div className="relative w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-8 border-[#39FF14] border-t-transparent border-r-transparent rotate-45"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-white">1240</p>
                                <p className="text-[10px] text-zinc-500 uppercase">/ {clientProfile?.daily_calorie_goal || 1500} Kcal</p>
                            </div>
                        </div>

                        {/* Macros */}
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-white">Protéines</span><span className="text-zinc-500">45 / {clientProfile?.protein_goal || 80}g</span></div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-1/2"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-white">Glucides</span><span className="text-zinc-500">120 / {clientProfile?.carbs_goal || 150}g</span></div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-3/4"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-white">Lipides</span><span className="text-zinc-500">30 / {clientProfile?.fats_goal || 50}g</span></div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-red-400 w-1/3"></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Widget Coach Personnel */}
                <div className="col-span-1 lg:col-span-5 rounded-[2rem] bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-sm flex flex-col justify-between min-h-[300px]">
                    <div className="flex items-center gap-3 mb-4">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782914179/JEUNE_FILLE_g6qdwc.png" className="w-12 h-12 rounded-full object-cover bg-zinc-800" alt="Coach Rokhy" />
                        <div>
                            <p className="text-sm font-bold text-white">Coach Rokhy</p>
                            <p className="text-[10px] text-[#39FF14] uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse"></span> En ligne</p>
                        </div>
                    </div>

                    <div className="flex-1 bg-black/40 rounded-xl p-4 mb-4 overflow-y-auto space-y-3">
                        <div className="bg-zinc-800 text-white text-xs p-3 rounded-2xl rounded-tl-sm w-fit max-w-[85%]">
                            Salut ! T'as bien mangé ton Thiéboudienne ce midi ? Pense à faire léger ce soir, un petit bouillon fera l'affaire.
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={coachInput}
                            onChange={(e) => setCoachInput(e.target.value)}
                            placeholder="Message Rokhy ou Doc..."
                            className="w-full bg-black/50 border border-white/10 rounded-full py-3 pl-4 pr-12 text-xs text-white outline-none focus:border-[#39FF14] transition-colors placeholder:text-zinc-600"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#39FF14] text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                            <Send size={14} />
                        </button>
                    </div>
                </div>

                {/* LIGNE 3 : Planification & Communauté */}
                {/* Sama Menu du Jour */}
                <div className="col-span-1 lg:col-span-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sama Menu du Jour</p>
                        <button className="text-[10px] text-[#39FF14] font-bold uppercase tracking-widest hover:underline">Voir la semaine</button>
                    </div>

                    <div className="space-y-3">
                        {/* Repas 1 */}
                        <div className="flex items-center gap-4 bg-black/30 p-3 rounded-2xl border border-white/5 hover:border-[#39FF14]/30 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 bg-zinc-800 rounded-xl shrink-0 overflow-hidden relative">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781222471/Bouillie_de_mil_r2zihq.jpg" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Petit-Déjeuner • 08:00</p>
                                <p className="text-sm font-black text-white mt-0.5">Fondé & Lait caillé</p>
                            </div>
                            <div className="text-right pr-2">
                                <p className="text-lg font-black text-[#39FF14]">350</p>
                                <p className="text-[10px] text-zinc-500 uppercase">Kcal</p>
                            </div>
                        </div>

                        {/* Repas 2 */}
                        <div className="flex items-center gap-4 bg-black/30 p-3 rounded-2xl border border-white/5 hover:border-[#39FF14]/30 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 bg-zinc-800 rounded-xl shrink-0 overflow-hidden relative">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781221768/Thiebou_dieune_1_hftdhm.jpg" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Déjeuner • 13:30</p>
                                <p className="text-sm font-black text-white mt-0.5">Thiéboudienne Rouge Penda Mbaye</p>
                            </div>
                            <div className="text-right pr-2">
                                <p className="text-lg font-black text-[#39FF14]">850</p>
                                <p className="text-[10px] text-zinc-500 uppercase">Kcal</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Communautaire */}
                <div className="col-span-1 lg:col-span-4 rounded-[2rem] bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-sm flex flex-col max-h-[400px]">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 shrink-0">Communauté</p>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {/* Post 1 */}
                        <div className="border-b border-white/5 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white">AM</div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Amina Fall</p>
                                        <p className="text-[9px] text-zinc-500">Il y a 10 min</p>
                                    </div>
                                </div>
                                <MoreHorizontal size={14} className="text-zinc-500" />
                            </div>
                            <p className="text-xs text-zinc-300 mb-3 leading-relaxed">J'ai atteint mon objectif de pas aujourd'hui ! Le menu guidé m'aide tellement à ne pas craquer le soir.</p>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-[#39FF14] transition-colors"><Heart size={12}/> 24</button>
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"><MessageSquare size={12}/> 5</button>
                            </div>
                        </div>

                        {/* Post 2 */}
                        <div className="pb-2">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">SD</div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Sophie Diop</p>
                                        <p className="text-[9px] text-zinc-500">Il y a 1h</p>
                                    </div>
                                </div>
                                <MoreHorizontal size={14} className="text-zinc-500" />
                            </div>
                            <p className="text-xs text-zinc-300 mb-2 leading-relaxed">Mon Ndambé allégé de ce matin, une tuerie !</p>
                            <div className="w-full h-24 bg-zinc-800 rounded-xl mb-3 overflow-hidden">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781223916/Ndambe_qeq2d8.jpg" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1 text-[10px] font-bold text-[#39FF14]"><Heart size={12} className="fill-[#39FF14]"/> 112</button>
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"><MessageSquare size={12}/> 18</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
