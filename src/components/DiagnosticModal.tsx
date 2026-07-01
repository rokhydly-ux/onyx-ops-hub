"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, ChevronRight, ArrowRight, X, Phone, Lock, Eye, EyeOff, Activity, Droplets, Target, User, HeartPulse, Scale, Utensils, Baby, Coffee } from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const calculateDailyCalories = (data: any) => {
    const heightCm = parseFloat(data.height) || 0;
    const currentWeight = parseFloat(data.currentWeight) || 0;
    const targetWInput = parseFloat(data.targetWeight) || 0;
    const age = parseFloat(data.age) || 0;
    const isMale = data.gender === "Homme";

    let bmr = (heightCm > 0 && currentWeight > 0 && age > 0) ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161) : 0;

    if (data.gender === "Femme" && (data.femaleSpecific === "SOPK" || data.femaleSpecific === "Périménopause / Ménopause" || data.healthProfile === "Hypothyroïdie")) {
        bmr = bmr * 0.90;
    }

    let nap = 1.2;
    if (data.dailyCommute === "Marche/Activité légère") nap = 1.375;
    else if (data.dailyCommute === "Travail physique/Modérée") nap = 1.55;
    else if (data.dailyCommute === "Sport intense/Intense") nap = 1.725;
    let tdee = bmr * nap;

    if (data.gender === "Femme" && (data.femaleSpecific === "Allaitement" || data.femaleSpecific === "Grossesse")) {
        tdee += 400;
    }

    let requiredDailyDeficit = 0;
    const userTargetDate = data.targetDate ? new Date(data.targetDate) : new Date();
    const now = new Date();
    const daysToTarget = Math.max(1, Math.ceil((userTargetDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
    const weightToLose = currentWeight - targetWInput;

    if (data.goal === 'perte_poids' && weightToLose > 0) {
        requiredDailyDeficit = (weightToLose * 7700) / daysToTarget;
    }

    if (requiredDailyDeficit > 1000) {
        requiredDailyDeficit = 1000;
    }

    let rawCalories = tdee;
    if (data.goal === 'perte_poids') rawCalories = tdee - requiredDailyDeficit;
    else if (data.goal === 'prise_masse') rawCalories = tdee + 300;

    const floorCalories = isMale ? 1500 : 1200;
    const finalCalories = Math.max(floorCalories, rawCalories);

    return {
        calories: Math.round(finalCalories),
        deficit: Math.round(tdee - finalCalories),
        tdee: Math.round(tdee),
        hitFloor: finalCalories === floorCalories,
        hitCeiling: requiredDailyDeficit === 1000
    };
};

interface DiagnosticModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialGoal?: string;
}

export default function DiagnosticModal({ isOpen, onClose, initialGoal }: DiagnosticModalProps) {
    const [diagStep, setDiagStep] = useState(1);
    const [isSubmittingDiag, setIsSubmittingDiag] = useState(false);
    const [diagData, setDiagData] = useState({
        gender: "", age: "", goal: "", currentWeight: "", targetWeight: "", targetDate: "", height: "",
        sleepHours: "", dailyCommute: "", healthProfile: "", femaleSpecific: "", waterIntake: "",
        pastDiets: "", cookingFats: [] as string[], mainMealElement: "", eveningMeal: "", lunchHabit: "",
        cookingHabit: "", weeklyBudget: "", name: "", phone: ""
    });

    useEffect(() => {
        if (isOpen) {
             setDiagStep(1);
        }
        if (initialGoal) {
            let mappedGoal = "";
            if (initialGoal === 'perte') mappedGoal = "perte_poids";
            else if (initialGoal === 'prise') mappedGoal = "prise_masse";
            else if (initialGoal === 'maintien') mappedGoal = "maintien";
            if (mappedGoal) {
                 setDiagData(prev => ({ ...prev, goal: mappedGoal }));
            }
        }
    }, [initialGoal, isOpen]);

    const handleDiagSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingDiag(true);
        try {
            const cleanPhone = diagData.phone.replace(/\s+/g, '');
            const generatedEmail = `${cleanPhone}@clients.onyxcrm.com`;
            const generatedPassword = cleanPhone.slice(-8).padStart(8, "0");
            let realUserId: string | null | undefined = null;

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: generatedEmail, password: generatedPassword
            });

            if (authData?.user) {
                realUserId = authData.user.id;
            } else {
                await fetch('/api/create-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: diagData.name, phone: cleanPhone, password: generatedPassword,
                        role: 'client', saas: "Nutrition à l'Africaine"
                    })
                });

                const { data: newAuthData, error: newAuthError } = await supabase.auth.signInWithPassword({
                    email: generatedEmail, password: generatedPassword
                });

                if (newAuthError) {
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: generatedEmail, password: generatedPassword,
                        options: { data: { full_name: diagData.name, phone: cleanPhone } }
                    });
                    if (signUpError) throw new Error("Échec : " + signUpError.message);
                    realUserId = signUpData.user?.id;
                } else {
                    realUserId = newAuthData.user?.id;
                }
            }

            if (!realUserId) throw new Error("Impossible d'identifier l'utilisateur.");

            const { error: clientErr } = await supabase.from('clients').upsert({
                id: realUserId, full_name: diagData.name, phone: cleanPhone
            }, { onConflict: 'id' });
            if (clientErr) throw new Error("Erreur client : " + clientErr.message);

            const profile = calculateDailyCalories(diagData);
            const payload = {
                client_id: realUserId, phone: cleanPhone, bmr: Math.round(profile.tdee / 1.2),
                tdee: profile.tdee, daily_calorie_goal: profile.calories,
                carbs_goal: Math.round((profile.calories * 0.4) / 4), protein_goal: Math.round((profile.calories * 0.3) / 4),
                fats_goal: Math.round((profile.calories * 0.3) / 9), diagnostic_data: diagData, tracking_mode: 'guided'
            };

            const { error: profileErr } = await supabase.from('nutrition_profiles').upsert(payload, { onConflict: 'client_id' });
            if (profileErr) throw new Error("Erreur profil : " + profileErr.message);

            await supabase.from('leads').insert([{
                full_name: diagData.name, phone: cleanPhone, source: "Diagnostic Nutrition Landing",
                intent: "A complété son diagnostic", status: "Nouveau", saas: "Nutrition à l'Africaine",
                message: `Objectif: ${profile.calories} kcal`
            }]);

            setDiagStep(10);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Erreur");
        } finally {
            setIsSubmittingDiag(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={(e: any) => e.target === e.currentTarget && onClose()}>
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-[2rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 max-h-[95vh] overflow-hidden">
            <button onClick={() => onClose()} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/20 text-white rounded-full hover:bg-black hover:text-[#39FF14] transition z-50"><X size={20}/></button>

            <div className="bg-black text-white p-6 sm:p-8 text-center relative rounded-t-[2rem] shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${(diagStep / 6) * 100}%` }}></div>
              </div>
              <Activity className="text-[#39FF14] mx-auto mb-2" size={28} />
              <h2 className={`${spaceGrotesk.className} text-xl md:text-3xl font-black uppercase tracking-tighter`}>
                {diagStep === 7 ? "Diagnostic Terminé !" : "Bilan Nutritionnel"}
              </h2>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar pb-10">
              {diagStep !== 11 ? (
                <form onSubmit={handleDiagSubmit} className="w-full">

                  {/* ETAPE 1: Sexe & Âge */}
                  {diagStep === 1 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full max-w-lg mx-auto">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 1 : Sexe & Âge</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel est votre sexe ?</label>
                        <div className="grid grid-cols-2 gap-4 w-full mb-8">
                          {[
                            { id: 'Homme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_format_1_1_en_202606111044_rjknkg.jpg' },
                            { id: 'Femme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_1_1_en_gardant_202606111043_unmonc.jpg' }
                          ].map(option => (
                            <div key={option.id} onClick={() => setDiagData({...diagData, gender: option.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 ${diagData.gender === option.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}`}>
                              <img src={option.img} alt={option.id} className="w-full aspect-square object-cover" />
                              <div className="absolute bottom-0 w-full bg-black/80 text-white py-4 font-black uppercase tracking-widest text-sm text-center backdrop-blur-md">{option.id}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel âge avez-vous ?</label>
                        <input type="number" required placeholder="Ex: 35" value={diagData.age} onChange={(e) => setDiagData({...diagData, age: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                      </div>
                    </div>
                  )}

                  {/* ETAPE 2: Objectifs physiques */}
                  {diagStep === 2 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full max-w-lg mx-auto">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 2 : Vos objectifs</h2>

                      <div className="w-full text-left mb-6">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel est votre objectif principal ?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
                          {[
                            { id: 'perte_poids', label: 'Perte de poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544253/A_high-end_commercial_photorealistic_full-body_202606151657_cfq5fb.jpg', desc: 'Déficit calorique' },
                            { id: 'maintien', label: 'Maintien du poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781542708/A_high-end_commercial_photorealistic_portrait_202606151658_noabp9.jpg', desc: 'Stabiliser sainement' },
                            { id: 'prise_masse', label: 'Prise de masse', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544091/rajoute_le_logo_sur_la_202606151721_aayo61.jpg', desc: 'Développer le muscle' }
                          ].map(goal => (
                            <div key={goal.id} onClick={() => setDiagData({...diagData, goal: goal.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col ${diagData.goal === goal.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}`}>
                              <img src={goal.img} alt={goal.label} className="w-full aspect-square object-cover" />
                              <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                                <span className="font-black uppercase tracking-widest text-xs md:text-sm mb-1 text-center">{goal.label}</span>
                                <span className="text-[10px] text-zinc-400 font-bold leading-tight text-center">{goal.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Taille (cm)</label>
                          <input type="number" required placeholder="Ex: 170" value={diagData.height} onChange={(e) => setDiagData({...diagData, height: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Poids actuel (kg)</label>
                          <input type="number" required placeholder="Ex: 75" value={diagData.currentWeight} onChange={(e) => setDiagData({...diagData, currentWeight: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Poids cible (kg)</label>
                          <input type="number" required placeholder="Ex: 65" value={diagData.targetWeight} onChange={(e) => setDiagData({...diagData, targetWeight: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Date cible</label>
                          <input type="date" required value={diagData.targetDate} onChange={(e) => setDiagData({...diagData, targetDate: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-sm outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 3: Mode de vie */}
                  {diagStep === 3 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 3 : Mode de vie</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675093/3_topvyj.png" className="w-8 h-8"/>
                           Combien d'heures de sommeil avez-vous chaque nuit ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Moins de 5h', '6-7h', '8h ou plus'].map(hours => (
                             <div key={hours} onClick={() => setDiagData({...diagData, sleepHours: hours})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.sleepHours === hours ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black">{hours}</span>
                                {diagData.sleepHours === hours && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675092/5_olxege.png" className="w-8 h-8"/>
                            Comment décririez-vous vos déplacements au quotidien ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                          {['Voiture/Sédentaire', 'Marche/Activité légère', 'Travail physique/Modérée', 'Sport intense/Intense'].map(commute => (
                             <div key={commute} onClick={() => setDiagData({...diagData, dailyCommute: commute})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.dailyCommute === commute ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{commute}</span>
                                {diagData.dailyCommute === commute && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 4: Profil Santé */}
                  {diagStep === 4 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 4 : Profil Santé</h2>

                      <div className="w-full mb-6 text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Avez-vous des conditions médicales ?</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                            {['Diabète', 'Hypertension', 'Aucun problème'].map(condition => {
                                const isSelected = diagData.healthProfile === condition;
                                return (
                                  <div key={condition} onClick={() => setDiagData({...diagData, healthProfile: condition})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                    <div className="flex flex-col items-center gap-2 text-center"><HeartPulse size={24} className="text-zinc-400 mb-1"/><span className="font-bold text-black text-sm">{condition}</span></div>
                                    {isSelected && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                                  </div>
                                );
                            })}
                          </div>
                      </div>

                      {diagData.gender === 'Femme' && (
                          <div className="w-full text-left animate-in fade-in slide-in-from-top-2">
                              <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Spécificités féminines :</label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                                {['Allaitement', 'Grossesse', 'SOPK', 'Périménopause/Ménopause', 'Aucune'].map(condition => {
                                    const isSelected = diagData.femaleSpecific === condition;
                                    return (
                                      <div key={condition} onClick={() => setDiagData({...diagData, femaleSpecific: condition})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                        <span className="font-bold text-black">{condition}</span>
                                        {isSelected && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                                      </div>
                                    );
                                })}
                              </div>
                          </div>
                      )}
                    </div>
                  )}

                  {/* ETAPE 5: Nutrition & Hydratation */}
                  {diagStep === 5 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 5 : Nutrition & Hydratation</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png" className="w-8 h-8"/>
                           Quelle quantité d'eau consommez-vous ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Moins de 50cl', '1L', 'Plus de 1.5L'].map(vol => (
                             <div key={vol} onClick={() => setDiagData({...diagData, waterIntake: vol})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.waterIntake === vol ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black">{vol}</span>
                                {diagData.waterIntake === vol && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">
                           Avez-vous enchaîné les régimes restrictifs par le passé ?
                        </label>
                        <div className="grid grid-cols-2 gap-4 w-full">
                          {['Oui', 'Non'].map(ans => (
                             <div key={ans} onClick={() => setDiagData({...diagData, pastDiets: ans})} className={`flex-1 cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.pastDiets === ans ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-lg">{ans}</span>
                                {diagData.pastDiets === ans && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675094/4_uk6ui2.png" className="w-8 h-8"/>
                            Quelles matières grasses utilisez-vous principalement pour la cuisson ?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          {['Huile de palme/Arachide', 'Huile d\'olive/Tournesol', 'Beurre/Karité', 'Je cuisine sans huile'].map(fat => (
                              <div key={fat} onClick={() => {
                                  const fats = diagData.cookingFats.includes(fat) ? diagData.cookingFats.filter(f => f !== fat) : [...diagData.cookingFats, fat];
                                  setDiagData({...diagData, cookingFats: fats});
                              }} className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 ${diagData.cookingFats.includes(fat) ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${diagData.cookingFats.includes(fat) ? 'bg-[#39FF14] border-[#39FF14]' : 'border-zinc-300'}`}>
                                  {diagData.cookingFats.includes(fat) && <CheckCircle size={14} className="text-black"/>}
                                </div>
                                <span className="font-bold text-black text-xs sm:text-sm leading-tight">{fat}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 6: Rythme Africain */}
                  {diagStep === 6 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 6 : Rythme Africain</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675091/sauce_gmyero.png" className="w-8 h-8"/>
                           Quel est l'élément principal de vos repas ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                          {['Féculents lourds (Foufou, Tô)', 'Riz/Céréales', 'Sauces riches', 'Protéines/Légumes'].map(element => (
                             <div key={element} onClick={() => setDiagData({...diagData, mainMealElement: element})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.mainMealElement === element ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{element}</span>
                                {diagData.mainMealElement === element && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675094/4_uk6ui2.png" className="w-8 h-8"/>
                            Le soir à la maison, votre dîner est généralement :
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Très copieux', 'Léger', 'Je grignote'].map(meal => (
                             <div key={meal} onClick={() => setDiagData({...diagData, eveningMeal: meal})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.eveningMeal === meal ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{meal}</span>
                                {diagData.eveningMeal === meal && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 7: Pratique familiale */}
                  {diagStep === 7 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 7 : Pratique Familiale</h2>
                      <div className="space-y-10 w-full max-w-2xl">
                        {/* GRILLE 1 : DÉJEUNER */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Comment déjeunez-vous le midi ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                              { id: 'En solo au bureau', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/La_Gamelle_ywfy3t.jpg', desc: 'Avec ma gamelle / Tupperware' },
                              { id: 'À la maison', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Le_Bol_Commun_hb9fns.jpg', desc: 'Autour du grand bol familial' }
                            ].map(habit => (
                              <div key={habit.id} onClick={() => setDiagData({...diagData, lunchHabit: habit.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.lunchHabit === habit.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={habit.img} className="w-full h-40 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-sm mb-1 text-center">{habit.id}</span>
                                  <span className="text-[10px] text-zinc-400 text-center">{habit.desc}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GRILLE 2 : POUR QUI JE CUISINE */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Pour qui préparez-vous les repas ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                              { id: 'Je cuisine uniquement pour moi seule', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_moi_seule_mfo6vw.jpg' },
                              { id: 'Je cuisine la marmite pour toute la famille', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_la_famille_qzlwke.jpg' }
                            ].map(habit => (
                              <div key={habit.id} onClick={() => setDiagData({...diagData, cookingHabit: habit.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.cookingHabit === habit.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={habit.img} className="w-full h-40 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-xs text-center leading-tight">{habit.id}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GRILLE 3 : BUDGET */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Budget courses par semaine ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { id: 'Budget Serré', price: '8 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630660/A_cute__highly_detailed_3D_202606161723_fcl8jj.jpg' },
                              { id: 'Budget Famille', price: '15 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630665/A_cute__highly_detailed_3D_202606161723_1_rx6yry.jpg' },
                              { id: 'Budget Confort', price: '25 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630664/A_cute__highly_detailed_3D_202606161723_2_xxku54.jpg' }
                            ].map(budget => (
                              <div key={budget.id} onClick={() => setDiagData({...diagData, weeklyBudget: budget.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.weeklyBudget === budget.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={budget.img} className="w-full h-24 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-3 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-[10px] mb-1">{budget.id}</span>
                                  <span className="text-[#39FF14] font-bold text-[9px]">{budget.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* ETAPE 8: Identification (Landing Page Uniquement) */}
                  {diagStep === 8 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 8 : À qui avons-nous l'honneur ?</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Votre Prénom</label>
                        <input type="text" required placeholder="Ex: Aminata" value={diagData.name} onChange={(e) => setDiagData({...diagData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Numéro WhatsApp</label>
                        <input type="tel" required placeholder="+221..." value={diagData.phone} onChange={(e) => setDiagData({...diagData, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                      </div>
                    </div>
                  )}

                  <button type="submit" id="hidden-submit-btn" style={{display:"none"}}></button>

                  {diagStep < 10 && (
                    <div className="flex gap-4 pt-6 mt-8 border-t border-zinc-100">
                        {diagStep > 1 && (
                            <button type="button" onClick={() => setDiagStep(s => s - 1)} className="px-8 py-4 bg-zinc-100 rounded-xl font-bold text-sm text-black hover:bg-zinc-200 transition">
                                Retour
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setDiagStep(s => s === 8 ? 10 : s + 1)}
                            disabled={
                                (diagStep === 1 && (!diagData.gender || !diagData.age)) ||
                                (diagStep === 2 && (!diagData.goal || !diagData.height || !diagData.currentWeight || !diagData.targetWeight || !diagData.targetDate)) ||
                                (diagStep === 3 && (!diagData.sleepHours || !diagData.dailyCommute)) ||
                                (diagStep === 4 && (!diagData.healthProfile || (diagData.gender === 'Femme' && !diagData.femaleSpecific))) ||
                                (diagStep === 5 && (!diagData.waterIntake || !diagData.pastDiets || diagData.cookingFats.length === 0)) ||
                                (diagStep === 6 && (!diagData.mainMealElement || !diagData.eveningMeal)) ||
                                (diagStep === 7 && (!diagData.lunchHabit || !diagData.cookingHabit || !diagData.weeklyBudget)) ||
                                (diagStep === 8 && (!diagData.name || !diagData.phone))
                            }
                            className="flex-1 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase flex justify-center items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant <ChevronRight size={18}/>
                        </button>
                    </div>
                  )}

{/* ETAPE 10: BILAN VISUEL */}
                  {diagStep === 10 && (
    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full bg-white p-6 md:p-8 rounded-[2rem] shadow-xl">
        {(() => {
            const profile = calculateDailyCalories(diagData);
            const currentW = parseFloat(diagData.currentWeight) || 0;
            const targetW = parseFloat(diagData.targetWeight) || 0;
            const weightToLose = currentW - targetW;

            // Calcul de l'IMC
            const hM = (parseFloat(diagData.height) || 0) / 100;
            const imcVal = hM > 0 ? currentW / (hM * hM) : 0;
            const imc = imcVal.toFixed(1);

            let imcBadge = "bg-green-100 text-green-700";
            let imcText = "Normal";
            if (imcVal < 18.5) { imcBadge = "bg-blue-100 text-blue-600"; imcText = "Maigreur"; }
            else if (imcVal >= 25 && imcVal < 30) { imcBadge = "bg-orange-100 text-orange-600"; imcText = "Surpoids"; }
            else if (imcVal >= 30) { imcBadge = "bg-red-100 text-red-600"; imcText = "Obésité"; }

            // Calcul de l'angle de l'aiguille (Min IMC 15 = 0°, Max IMC 40 = 180°)
            const clampedImc = Math.max(15, Math.min(imcVal, 40));
            const needleRotation = ((clampedImc - 15) / 25) * 180;

            return (
                <div className="w-full">
                    <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 text-black">Vos Objectifs Validés</h2>
                    <p className="text-sm font-medium text-zinc-500 mb-8 max-w-lg mx-auto">Voici l'analyse complète de votre profil de départ.</p>

                    {/* Grille Principale à 4 Colonnes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                        {/* Carte 1 : Jauge IMC Demi-Cercle (Speedometer) */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Indice de Masse Corporelle</p>

                            <div className="relative w-32 h-16 mt-2 overflow-visible">
                                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                    {/* Arc de cercle avec dégradé fonctionnel */}
                                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#speedometerGradient)" strokeWidth="12" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="35%" stopColor="#22c55e" />
                                            <stop offset="70%" stopColor="#eab308" />
                                            <stop offset="100%" stopColor="#ef4444" />
                                        </linearGradient>
                                    </defs>
                                    {/* Aiguille rotative pivotant sur l'axe central inférieur (50,50) */}
                                    <g style={{ transform: `rotate(${needleRotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 1.5s ease-out' }}>
                                        <polygon points="48,50 50,12 52,50" fill="#18181b" />
                                        <circle cx="50" cy="50" r="5" fill="#18181b" />
                                    </g>
                                </svg>
                            </div>

                            <div className="text-center mt-2">
                                <p className="text-2xl font-black text-black">{imc}</p>
                                <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 ${imcBadge}`}>{imcText}</span>
                            </div>
                        </div>

                        {/* Carte 2 : Calories Cibles */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Apport Énergétique</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781443964/A_cute__highly_detailed_3D_202606141332_ggiubt.jpg" className="w-12 h-12 rounded-full object-cover" alt="Calories" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-black">{profile.calories} <span className="text-sm font-bold text-zinc-500">kcal</span></p>
                                {profile.hitFloor && <span className="text-red-600 font-bold text-[8px] uppercase tracking-wider block mt-1">Plancher de sécurité activé</span>}
                            </div>
                        </div>

                        {/* Carte 3 : Objectif Poids */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Poids Cible</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg" className="w-12 h-12 rounded-full object-cover" alt="Poids" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-black">{targetW} <span className="text-sm font-bold text-zinc-500">kg</span></p>
                                {weightToLose > 0 && <p className="text-[10px] font-bold text-zinc-500 mt-1">-{weightToLose.toFixed(1)} kg à éliminer</p>}
                            </div>
                        </div>

                        {/* Carte 4 : Date Cible */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Date Prévue</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_1_uvgqf0.jpg" className="w-12 h-12 rounded-full object-cover" alt="Date" />
                            <p className="text-xl font-black text-black capitalize leading-tight">
                                {diagData.targetDate ? new Date(diagData.targetDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>

                    <button onClick={handleDiagSubmit} disabled={isSubmittingDiag} className="w-full bg-black text-[#39FF14] py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl hover:scale-[1.01] transition-transform">
                        {isSubmittingDiag ? "Enregistrement en cours..." : "Valider mes objectifs"}
                    </button>
                </div>
            );
        })()}
    </div>
)}
                </form>
              ) : null}

              {diagStep === 11 && (
    <div className="flex flex-col items-center text-center animate-in zoom-in w-full bg-white border-t-[8px] border-[#39FF14] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        {/* Lueur en arrière-plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#39FF14] opacity-20 blur-[50px] pointer-events-none"></div>

        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="Nutrition à l'Africaine" className="h-16 w-auto mx-auto mb-6 object-contain relative z-10" />

        <h2 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase text-black mb-3 leading-tight relative z-10`}>
            Bienvenue dans la famille,<br/> <span className="text-[#39FF14] bg-black px-3 py-1 rounded-xl inline-block mt-2">{diagData.name.split(' ')[0]} ! 🎉</span>
        </h2>

        <p className="text-sm font-medium text-zinc-600 mb-6 leading-relaxed relative z-10">
            Ton plan nutritionnel sur-mesure est prêt. Garde précieusement ces accès temporaires pour te reconnecter à tout moment à ton espace de suivi.
        </p>

        {/* Encadré Identifiants Design Premium */}
        <div className="bg-black border border-zinc-800 p-6 rounded-2xl w-full text-left space-y-4 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative z-10">
            <p className="font-black text-[#39FF14] text-xs uppercase tracking-widest border-b border-zinc-800 pb-3 mb-3 flex items-center gap-2">
                <Lock size={14}/> Tes identifiants :
            </p>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Numéro WhatsApp</span>
                <span className="font-black text-white">{diagData.phone}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mot de passe provisoire</span>
                <span className="font-black text-black bg-[#39FF14] px-2 py-1 rounded-md tracking-wider">
                    {diagData.phone.replace(/\s+/g, '').slice(-8).padStart(8, "0")}
                </span>
            </div>
        </div>

        <p className="text-[10px] font-bold text-zinc-500 mb-8 flex items-center justify-center gap-2 relative z-10">
            Tu pourras modifier ce mot de passe dans tes paramètres
            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781536233/A_cute__highly_detailed_3D_202606151510_uj9z5c.jpg" className="w-6 h-6 rounded-full shadow-sm" alt="Réglages" />
        </p>

        <button onClick={() => window.location.href = '/nutrition?from=diagnostic'} className="w-full bg-[#39FF14] text-black py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform flex justify-center items-center gap-2 relative z-10">
            Accéder à mon Sama Menu <ArrowRight size={18}/>
        </button>
    </div>
)}
            </div>
          </div>
        </div>
    );
}