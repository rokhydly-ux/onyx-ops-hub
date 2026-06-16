"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Activity, ChevronLeft } from "lucide-react";

export default function IsolatedDiagnosticFlow({ onComplete }: { onComplete?: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "",
    goalType: "",
    birthDate: "",
    healthConditions: [] as string[],
    lunchHabit: "",
    cookingHabit: "",
    weeklyBudget: "",
    // We add standard fields for the calculation just in case they are needed later
    height: "170",
    currentWeight: "75",
  });

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  // Calculate age from birth date
  const calculateAge = () => {
    if (!formData.birthDate) return 30; // default
    const today = new Date();
    const birthDate = new Date(formData.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Mock calculation for TDEE (BMR * NAP)
  const calculateCalories = () => {
    const isMale = formData.gender === "Homme";
    const heightCm = parseFloat(formData.height) || 170;
    const weightKg = parseFloat(formData.currentWeight) || 75;
    const age = calculateAge();
    
    // BMR Mifflin-St Jeor
    const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161);
    const nap = 1.375; // Average active
    let tdee = bmr * nap;

    if (formData.goalType === 'Perte de poids') tdee -= 500;
    if (formData.goalType === 'Prise de masse') tdee += 300;

    return Math.max(isMale ? 1500 : 1200, Math.round(tdee));
  };

  // Auto-advance with 300ms delay for single-choice questions
  const handleChoice = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTimeout(() => {
      if (step < totalSteps) setStep(step + 1);
    }, 300);
  };

  const handleMultiChoice = (value: string) => {
    setFormData(prev => {
      const current = prev.healthConditions;
      if (current.includes(value)) {
        return { ...prev, healthConditions: current.filter(item => item !== value) };
      } else {
        if (value === "Aucun problème") {
          return { ...prev, healthConditions: ["Aucun problème"] };
        }
        const filtered = current.filter(item => item !== "Aucun problème");
        return { ...prev, healthConditions: [...filtered, value] };
      }
    });
  };

  const goNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete({ ...formData, calories: calculateCalories() });
    } else {
      alert("Redirection vers Sama Menu !");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-zinc-200 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col min-h-[600px] font-sans relative">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-100 z-50">
        <div 
          className="h-full bg-[#39FF14] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(57,255,20,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-black text-white p-6 relative flex items-center justify-between z-40">
        {step > 1 && step < 8 ? (
          <button onClick={goPrev} className="p-2 bg-zinc-800 text-zinc-300 rounded-full hover:text-white hover:bg-zinc-700 transition">
            <ChevronLeft size={20} />
          </button>
        ) : <div className="w-10"></div>}
        
        <div className="flex items-center gap-2">
          <Activity className="text-[#39FF14]" size={20} />
          <span className="font-black uppercase tracking-widest text-sm">Diagnostic Nutrition</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative overflow-hidden bg-zinc-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col"
          >
            {/* STEP 1: Sexe */}
            {step === 1 && (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel est votre sexe ?</h2>
                <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                  {[
                    { id: 'Homme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_format_1_1_en_202606111044_rjknkg.jpg' },
                    { id: 'Femme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_1_1_en_gardant_202606111043_unmonc.jpg' }
                  ].map(option => (
                    <div 
                      key={option.id}
                      onClick={() => handleChoice('gender', option.id)}
                      className={`cursor-pointer border-4 rounded-3xl overflow-hidden relative transition-all duration-300 group ${formData.gender === option.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white hover:shadow-xl hover:scale-105'}`}
                    >
                      <img src={option.img} alt={option.id} className="w-full aspect-square object-cover" />
                      <div className="absolute bottom-0 w-full bg-black/80 text-white py-4 font-black uppercase tracking-widest text-sm backdrop-blur-md">
                        {option.id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Objectif */}
            {step === 2 && (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel est votre objectif principal ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {[
                    { id: "Perte de poids", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544253/A_high-end_commercial_photorealistic_full-body_202606151657_cfq5fb.jpg", desc: "Déficit calorique pour affiner le ventre" },
                    { id: "Maintien du poids", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781542708/A_high-end_commercial_photorealistic_portrait_202606151658_noabp9.jpg", desc: "Stabiliser et manger sainement au quotidien" },
                    { id: "Prise de masse", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544091/rajoute_le_logo_sur_la_202606151721_aayo61.jpg", desc: "Développer la masse musculaire" }
                  ].map(goal => (
                    <div 
                      key={goal.id}
                      onClick={() => handleChoice('goalType', goal.id)}
                      className={`cursor-pointer border-4 rounded-3xl overflow-hidden relative transition-all duration-300 group flex flex-col ${formData.goalType === goal.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white hover:shadow-xl hover:scale-105'}`}
                    >
                      <img src={goal.img} alt={goal.id} className="w-full aspect-square object-cover" />
                      <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                        <span className="font-black uppercase tracking-widest text-xs md:text-sm mb-1 text-center">{goal.id}</span>
                        <span className="text-[10px] text-zinc-400 font-bold leading-tight text-center">{goal.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Date de naissance */}
            {step === 3 && (
              <div className="flex flex-col items-center text-center justify-center flex-1">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quelle est votre date de naissance ?</h2>
                <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-lg border border-zinc-100">
                  <input 
                    type="date" 
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full p-5 bg-zinc-50 border-2 border-zinc-200 rounded-2xl font-black text-xl text-center outline-none focus:border-[#39FF14] transition-colors text-black" 
                  />
                  <button 
                    onClick={goNext}
                    disabled={!formData.birthDate}
                    className="w-full mt-6 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Conditions de Santé */}
            {step === 4 && (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Avez-vous des conditions spécifiques ?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
                  {["Diabète", "Hypertension", "Préménopause ou Ménopause", "Aucun problème"].map(condition => {
                    const isSelected = formData.healthConditions.includes(condition);
                    return (
                      <div 
                        key={condition}
                        onClick={() => handleMultiChoice(condition)}
                        className={`cursor-pointer border-4 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 ${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}
                      >
                        <span className="font-bold text-sm md:text-base text-black">{condition}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#39FF14] bg-[#39FF14]' : 'border-zinc-300'}`}>
                          {isSelected && <CheckCircle size={14} className="text-black" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button 
                  onClick={goNext}
                  disabled={formData.healthConditions.length === 0}
                  className="w-full max-w-lg bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  Continuer
                </button>
              </div>
            )}

            {/* STEP 5: Contexte du midi */}
            {step === 5 && (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Comment déjeunez-vous le midi ?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                  {[
                    { id: "En solo au bureau", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/La_Gamelle_ywfy3t.jpg", desc: "Avec ma gamelle / Tupperware" },
                    { id: "À la maison", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Le_Bol_Commun_hb9fns.jpg", desc: "Autour du grand bol familial commun" }
                  ].map(habit => (
                    <div 
                      key={habit.id}
                      onClick={() => handleChoice('lunchHabit', habit.id)}
                      className={`cursor-pointer border-4 rounded-3xl overflow-hidden relative transition-all duration-300 group flex flex-col ${formData.lunchHabit === habit.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white hover:shadow-xl hover:scale-105'}`}
                    >
                      <img src={habit.img} alt={habit.id} className="w-full h-48 md:h-64 object-cover" />
                      <div className="flex-1 bg-black/90 text-white p-5 flex flex-col justify-center items-center backdrop-blur-md">
                        <span className="font-black uppercase tracking-widest text-sm mb-2 text-center">{habit.id}</span>
                        <span className="text-xs text-zinc-400 font-bold leading-relaxed text-center">{habit.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Gestion de la cuisine */}
            {step === 6 && (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Pour qui préparez-vous les repas ?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                  {[
                    { id: "Je cuisine uniquement pour moi seule", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_moi_seule_mfo6vw.jpg" },
                    { id: "Je cuisine la marmite pour toute la famille", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_la_famille_qzlwke.jpg" }
                  ].map(habit => (
                    <div 
                      key={habit.id}
                      onClick={() => handleChoice('cookingHabit', habit.id)}
                      className={`cursor-pointer border-4 rounded-3xl overflow-hidden relative transition-all duration-300 group flex flex-col ${formData.cookingHabit === habit.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white hover:shadow-xl hover:scale-105'}`}
                    >
                      <img src={habit.img} alt={habit.id} className="w-full h-48 md:h-64 object-cover" />
                      <div className="flex-1 bg-black/90 text-white p-5 flex flex-col justify-center items-center backdrop-blur-md">
                        <span className="font-black uppercase tracking-tight text-sm text-center">{habit.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Budget Hebdomadaire */}
            {step === 7 && (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel est votre budget courses par semaine ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {[
                    { id: "Budget Serré", price: "8 000 F / semaine", desc: "La base survie et efficacité", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630660/A_cute__highly_detailed_3D_202606161723_fcl8jj.jpg" },
                    { id: "Budget Famille", price: "15 000 F / semaine", desc: "Équilibre, goût et variété", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630665/A_cute__highly_detailed_3D_202606161723_1_rx6yry.jpg" },
                    { id: "Budget Confort", price: "25 000 F / semaine", desc: "Santé premium 100% locale", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630664/A_cute__highly_detailed_3D_202606161723_2_xxku54.jpg" }
                  ].map(budget => (
                    <div 
                      key={budget.id}
                      onClick={() => handleChoice('weeklyBudget', budget.id)}
                      className={`cursor-pointer border-4 rounded-3xl overflow-hidden relative transition-all duration-300 group flex flex-col ${formData.weeklyBudget === budget.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white hover:shadow-xl hover:scale-105'}`}
                    >
                      <img src={budget.img} alt={budget.id} className="w-full aspect-square object-cover" />
                      <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                        <span className="font-black uppercase tracking-widest text-xs mb-1">{budget.id}</span>
                        <span className="text-[#39FF14] font-bold text-[10px] mb-2">{budget.price}</span>
                        <span className="text-zinc-400 text-[10px] text-center leading-tight">{budget.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 8: End Screen */}
            {step === 8 && (
              <div className="flex flex-col items-center text-center justify-center flex-1 h-full animate-in zoom-in duration-500">
                <CheckCircle className="text-[#39FF14] w-24 h-24 mb-8 drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
                
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 max-w-lg w-full mb-10">
                  <p className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-800">
                    Calcul médical terminé. Votre corps a besoin de <strong className="font-black text-black text-3xl">{calculateCalories()}</strong> kcal/jour.
                  </p>
                  <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-800 mt-6">
                    La bonne nouvelle ? Vous n'aurez <span className="underline decoration-[#39FF14] decoration-4 font-bold">plus jamais</span> à les compter. Suivez simplement nos portions en bols et cuillères.
                  </p>
                </div>

                <button 
                  onClick={handleFinish}
                  className="w-full max-w-md bg-[#39FF14] text-black py-6 rounded-2xl font-black uppercase text-lg tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(57,255,20,0.4)] animate-pulse"
                >
                  Découvrir mon Sama Menu
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
