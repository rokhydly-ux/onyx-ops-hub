"use client";

import React, { useState } from 'react';
import {
    Activity, Droplet, Moon, Search, Bell, LogOut, ArrowUpRight,
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
    weightLogs: any[];
    setActiveTab: (tab: string) => void;
    handleMealClick?: (meal: any) => void;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    consumedMeals?: any[];
    setShowDailyReport: (show: boolean) => void;
    todayMenu?: any;
    isFastingMode?: boolean;
    deleteMealLog?: (item: any) => void;
}

export default function BentoDashboardView({ user, waterGlasses, handleUpdateWater, jongomaXP, clientProfile, weightLogs, setActiveTab, handleMealClick, setShowDailyReport, calories, proteins, carbs, fats, consumedMeals = [], todayMenu, isFastingMode = false, deleteMealLog }: BentoDashboardViewProps) {
    const [coachInput, setCoachInput] = useState('');
    const [hiddenMeals, setHiddenMeals] = useState<string[]>([]);
    const generateCoachMessage = () => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Salam' : 'Bonsoir';
        const name = user?.full_name?.split(' ')[0] || 'la team';

        const goalCals = Number(clientProfile?.diagnostic_data?.bmr || 2000);
        const progressPct = goalCals > 0 ? (calories / goalCals) * 100 : 0;

        if (waterGlasses < 4 && hour > 14) {
            return `${greeting} ${name} ! Il fait soif cet après-midi ! Pense à boire tes verres d'eau pour rester au top.`;
        }

        if (progressPct >= 90) {
            return `Super journée ${name} ! Tu as presque atteint tes objectifs macros, on lâche rien pour le dernier repas !`;
        }

        if (progressPct === 0 && hour > 10) {
            return `${greeting} ${name} ! Tu n'as pas encore tracké tes repas aujourd'hui. N'oublie pas de le faire pour rester focus !`;
        }

        if (hour < 12) {
             return `${greeting} ${name} ! Prête pour une nouvelle journée ? Pense à bien t'hydrater dès ce matin.`;
        }

        return `${greeting} ${name} ! Continue comme ça, la constance c'est la clé de tes résultats.`;
    };

    const coachMessage = generateCoachMessage();


    const waterTips = [
        "L'eau booste votre métabolisme de 30% en 10 min.",
        "Buvez avant les repas pour mieux digérer.",
        "La fatigue est souvent signe de déshydratation.",
        "Objectif : 8 verres pour un ventre plat."
    ];
    const dailyWaterTip = waterTips[new Date().getDay() % waterTips.length];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/nutriafro-login';
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 pb-20">

            {/* Grille Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LIGNE 1 : Quick Stats (12 cols on mobile, 3 cols each on desktop) */}
                <div className="col-span-1 lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Poids */}
                    <div className="rounded-[2rem] bg-white border border-zinc-200 shadow-sm p-6 relative overflow-hidden flex flex-col justify-between h-32 cursor-pointer group" onClick={() => setActiveTab('weight')}>
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783280413/Woman_standing_on_scale_smiling_202607051938_e6h39p.jpg" alt="Scale background" className="absolute inset-0 w-full h-full object-cover opacity-25 z-0" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Poids Actuel</p>
                                <p className="text-xs font-bold text-[#39FF14] uppercase tracking-widest">Obj: {clientProfile?.diagnostic_data?.targetWeight || '--'} kg</p>
                            </div>
                            <p className="text-3xl font-black text-black">{weightLogs && weightLogs.length > 0 ? parseFloat(weightLogs[weightLogs.length - 1].weight).toFixed(1) : (clientProfile?.diagnostic_data?.currentWeight || '--')} <span className="text-sm">kg</span></p>
                            <div className="w-full bg-zinc-100 rounded-full h-1 mt-2">
                                <div className="bg-[#39FF14] h-1 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                    </div>
                    {/* Pas */}
                    <div className="rounded-[2rem] bg-white border border-zinc-200 shadow-sm p-6 flex flex-col justify-between h-32">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Activité</p>
                        <p className="text-3xl font-black text-black">5 240 <span className="text-sm text-zinc-500">pas</span></p>
                        <div className="flex gap-1 items-end h-4 mt-2">
                            {[40, 70, 30, 90, 50, 100, 60].map((h, i) => (
                                <div key={i} className="w-full bg-[#39FF14]/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                    {/* Sommeil */}
                    <div className="rounded-[2rem] bg-white border border-zinc-200 shadow-sm p-6 flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sommeil</p>
                            <Moon size={16} className="text-[#00E5FF]" />
                        </div>
                        <p className="text-3xl font-black text-black">{clientProfile?.diagnostic_data?.sleepHours || '7h'} <span className="text-sm text-zinc-500">moy</span></p>
                    </div>
                    {/* Hydratation */}
                    <div className="rounded-[2rem] bg-white border border-zinc-200 shadow-sm p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783099524/Woman_drinking_clear_water_2K_202607031724_wuqqco.jpg" alt="Water background" className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 z-0 cursor-pointer" onClick={() => setActiveTab('today')} />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none"></div>

                        <div className="relative z-20 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start cursor-pointer" onClick={() => setActiveTab('today')}>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Hydratation</p>
                                    <p className="text-[9px] font-medium text-zinc-400 max-w-[80%] leading-tight">{dailyWaterTip}</p>
                                </div>
                                <Droplet size={16} className="text-blue-400 shrink-0" />
                            </div>
                            <div className="flex gap-2 items-center mt-2">
                                {[0, 1, 2, 3, 4, 5, 6, 7].map(idx => {
                                    const isDrank = idx < waterGlasses;
                                    const isNext = idx === waterGlasses;
                                    return (
                                        <img
                                            key={idx}
                                            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png"
                                            className={`w-4 h-10 object-contain cursor-pointer transition-transform hover:scale-110 ${isDrank ? 'opacity-100' : 'opacity-30 grayscale'} ${isNext ? 'animate-pulse' : ''}`}
                                            alt="Bottle"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateWater(idx + 1 - waterGlasses);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIGNE 2 : Nutrition & Coach */}
                {/* Widget Nutrition */}
                <div className="col-span-1 lg:col-span-7 rounded-[2rem] bg-white border border-zinc-200 shadow-sm p-6 flex flex-col justify-between min-h-[300px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Objectif du jour</p>
                            <div className="flex gap-2 mt-2">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                    <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-[#39FF14] text-black' : 'bg-zinc-100 text-zinc-500'}`}>{d}</div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setActiveTab('today')} className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                            <ArrowUpRight size={18} className="text-black" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                        {/* Fake Donut Chart */}
                        <div className="relative w-32 h-32 rounded-full border-8 border-zinc-100 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-8 border-[#39FF14] border-t-transparent border-r-transparent rotate-45"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-black">{calories}</p>
                                <p className="text-[10px] text-zinc-500 uppercase">/ {clientProfile?.daily_calorie_goal || 1500} Kcal</p>
                            </div>
                        </div>

                        {/* Macros */}
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black">Protéines</span><span className="text-zinc-500">{proteins} / {clientProfile?.protein_goal || 80}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-1/2"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black">Glucides</span><span className="text-zinc-500">{carbs} / {clientProfile?.carbs_goal || 150}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-3/4"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black">Lipides</span><span className="text-zinc-500">{fats} / {clientProfile?.fats_goal || 50}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-red-400 w-1/3"></div></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <button onClick={() => setActiveTab('today')} className="flex-1 bg-white border border-zinc-200 text-black rounded-xl py-3 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_1_uvgqf0.jpg" alt="" className="w-5 h-5 object-cover mix-blend-multiply" />
                            Loguer Repas
                        </button>
                        <button onClick={() => { setActiveTab('today'); setShowDailyReport(true); }} className="flex-1 bg-[#39FF14] text-black rounded-xl py-3 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-sm">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_2_akqmx4.jpg" alt="" className="w-5 h-5 object-cover mix-blend-multiply" />
                            Bilan Quotidien
                        </button>
                    </div>
                </div>

                {/* Widget Coach Personnel */}
                <div className="col-span-1 lg:col-span-5 rounded-[2rem] bg-white border border-zinc-200 shadow-sm p-6 flex flex-col justify-between min-h-[300px]">
                    <div className="flex items-center gap-3 mb-4">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782914179/JEUNE_FILLE_g6qdwc.png" className="w-12 h-12 rounded-full object-cover bg-zinc-100" alt="Coach Rokhy" />
                        <div>
                            <p className="text-sm font-bold text-black">Coach Rokhy</p>
                            <p className="text-[10px] text-[#39FF14] font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse"></span> En ligne</p>
                        </div>
                    </div>

                    <div className="flex-1 bg-zinc-50 rounded-xl p-4 mb-4 overflow-y-auto space-y-3 border border-zinc-100">
                        <div className="bg-black text-white text-xs p-3 rounded-2xl rounded-tl-sm w-fit max-w-[85%] shadow-sm">
                            {coachMessage}
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={coachInput}
                            onChange={(e) => setCoachInput(e.target.value)}
                            placeholder="Message Rokhy ou Doc..."
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-full py-3 pl-4 pr-12 text-xs text-black outline-none focus:border-[#39FF14] transition-colors placeholder:text-zinc-400"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#39FF14] text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                            <Send size={14} />
                        </button>
                    </div>
                </div>

                {/* LIGNE 3 : Planification & Communauté */}
                {/* Sama Menu du Jour */}
                <div className="col-span-1 lg:col-span-8 rounded-[2rem] bg-white border border-zinc-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sama Menu du Jour</p>
                        <button className="text-[10px] text-black font-bold uppercase tracking-widest hover:text-[#39FF14] transition-colors">Voir la semaine</button>
                    </div>

                    <div className="space-y-3">
                        {todayMenu && (isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                            const recipe = todayMenu.meals?.[mealType];
                            if(!recipe) return null;
                            if (hiddenMeals.includes(mealType)) return null;

                            const isConsumed = consumedMeals.some((m: any) => m.name === recipe.nom && m.type === mealType);
                            const consumedMealObj = consumedMeals.find((m: any) => m.name === recipe.nom && m.type === mealType);

                            const handleDelete = (e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (isConsumed && consumedMealObj && deleteMealLog) {
                                    deleteMealLog(consumedMealObj);
                                } else {
                                    setHiddenMeals(prev => [...prev, mealType]);
                                }
                            };

                            return (
                                <div key={mealType} className={`flex items-center gap-4 p-3 rounded-2xl border transition-colors group shadow-sm ${isConsumed ? 'bg-[#39FF14]/10 border-[#39FF14]' : 'bg-white border-zinc-100 hover:border-[#39FF14]/50 cursor-pointer'}`}>
                                    <div className="w-16 h-16 bg-zinc-100 rounded-xl shrink-0 overflow-hidden relative">
                                        <img src={recipe.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={recipe.nom} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{mealType}</p>
                                        <p className="text-sm font-black text-black mt-0.5">{recipe.nom} {isConsumed && '✅'}</p>
                                    </div>
                                    <div className="text-right pr-2 flex flex-col items-end gap-1">
                                        <div>
                                            <span className="text-lg font-black text-[#39FF14]">{recipe.calories || recipe.kcal || recipe.energy || "—"}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase ml-1">Kcal</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {!isConsumed && (
                                                <button onClick={(e) => { e.stopPropagation(); console.log("Swap à venir"); }} className="text-[9px] font-bold text-zinc-500 hover:text-black uppercase border border-zinc-200 px-2 py-0.5 rounded">Swap</button>
                                            )}
                                            {!isConsumed && (
                                                <button onClick={(e) => { e.stopPropagation(); console.log("Valider à venir"); }} className="text-[9px] font-bold bg-[#39FF14] text-black hover:bg-black hover:text-[#39FF14] uppercase px-2 py-0.5 rounded shadow-sm">Valider</button>
                                            )}
                                            <button onClick={handleDelete} className="text-[9px] font-bold text-red-400 hover:text-white hover:bg-red-400 uppercase border border-red-200 px-2 py-0.5 rounded transition-colors">{isConsumed ? 'Suppr.' : 'Cacher'}</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {!todayMenu && (
                            <div className="text-xs text-center text-zinc-500 p-4">Aucun menu pour aujourd'hui.</div>
                        )}
                    </div>
                </div>

                {/* Feed Communautaire */}
                <div className="col-span-1 lg:col-span-4 rounded-[2rem] bg-white border border-zinc-200 shadow-sm p-6 flex flex-col max-h-[400px]">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 shrink-0">Communauté</p>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {/* Post 1 */}
                        <div className="border-b border-zinc-100 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-black">AM</div>
                                    <div>
                                        <p className="text-xs font-bold text-black">Amina Fall</p>
                                        <p className="text-[9px] text-zinc-500">Il y a 10 min</p>
                                    </div>
                                </div>
                                <MoreHorizontal size={14} className="text-zinc-400" />
                            </div>
                            <p className="text-xs text-zinc-600 mb-3 leading-relaxed">J'ai atteint mon objectif de pas aujourd'hui ! Le menu guidé m'aide tellement à ne pas craquer le soir.</p>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-pink-500 transition-colors"><Heart size={12}/> 24</button>
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-blue-500 transition-colors"><MessageSquare size={12}/> 5</button>
                            </div>
                        </div>

                        {/* Post 2 */}
                        <div className="pb-2">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">SD</div>
                                    <div>
                                        <p className="text-xs font-bold text-black">Sophie Diop</p>
                                        <p className="text-[9px] text-zinc-500">Il y a 1h</p>
                                    </div>
                                </div>
                                <MoreHorizontal size={14} className="text-zinc-400" />
                            </div>
                            <p className="text-xs text-zinc-600 mb-2 leading-relaxed">Mon Ndambé allégé de ce matin, une tuerie !</p>
                            <div className="w-full h-24 bg-zinc-100 rounded-xl mb-3 overflow-hidden border border-zinc-100">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1 text-[10px] font-bold text-pink-500"><Heart size={12} className="fill-pink-500"/> 112</button>
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-blue-500 transition-colors"><MessageSquare size={12}/> 18</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
