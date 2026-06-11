"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, CheckCircle, Activity, ChevronRight, Target, Apple, Scale, Flame } from "lucide-react";
import { motion } from "framer-motion";

const spaceGrotesk = { className: "font-sans" };

export default function NutritionDiagnostic() {
  const router = useRouter();
  const waNumber = "221785338417";
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pin: "",
    gender: "",
    age: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    activityLevel: "",
    dietaryHabits: "",
    allergies: "",
    familyDynamic: "",
    lunchHabit: "",
    shoppingHabit: "",
    sleepHours: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- MOTEUR DE CALCUL NUTRITIONNEL ---
  const heightCm = parseFloat(formData.height) || 0;
  const currentWeight = parseFloat(formData.currentWeight) || 0;
  const targetWeight = parseFloat(formData.targetWeight) || 0;
  const age = parseFloat(formData.age) || 0;
  const isMale = formData.gender === "Homme";
  
  // 1. Formule de Lorentz pour le poids idéal théorique
  const idealWeight = heightCm > 0 
    ? (isMale ? (heightCm - 100 - ((heightCm - 150) / 4)) : (heightCm - 100 - ((heightCm - 150) / 2.5))) 
    : 0;
  
  const weightToLose = currentWeight - targetWeight;
  const estimatedMonths = weightToLose > 0 ? Math.max(1, Math.ceil(weightToLose / 3)) : 0; 

  // 2. Calcul du Métabolisme de Base (BMR) via Mifflin-St Jeor
  const bmr = (heightCm > 0 && currentWeight > 0 && age > 0)
    ? (isMale ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + 5 
              : (10 * currentWeight) + (6.25 * heightCm) - (5 * age) - 161)
    : 0;

  // 3. Calcul de la Dépense Énergétique Journalière (TDEE)
  const activityMultiplier = formData.activityLevel === "Très actif" ? 1.55 : (formData.activityLevel === "Actif" ? 1.375 : 1.2);
  const tdee = bmr * activityMultiplier;

  // 4. Application du déficit/surplus calorique
  let rawCalories = weightToLose > 0 ? tdee - 400 : (weightToLose < 0 ? tdee + 300 : tdee);
  // Sécurité : Ne jamais descendre sous 1200 kcal (femme) ou 1500 kcal (homme)
  const dailyCalories = Math.max(isMale ? 1500 : 1200, rawCalories || 0);

  // 5. Répartition des Macros : 40% Glucides, 30% Protéines, 30% Lipides
  const carbs = (dailyCalories * 0.40) / 4;   // 1g de glucides = 4 kcal
  const protein = (dailyCalories * 0.30) / 4; // 1g de protéines = 4 kcal
  const fats = (dailyCalories * 0.30) / 9;    // 1g de lipides = 9 kcal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Sauvegarde des objectifs pour récupération dans le Dashboard plus tard
      localStorage.setItem('onyx_nutrition_goals', JSON.stringify({
         calories: dailyCalories, carbs, protein, fats
      }));

      // Création automatique du compte client pour l'auto-login
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 14); // 14 Jours d'essai

      const { data: clientData } = await supabase.from('clients').upsert({
        full_name: formData.name,
        phone: formData.phone,
        password_temp: formData.pin || "0000",
        type: "Client",
        saas: "Nutrition à l'Africaine",
        status: "Essai",
        trial_ends_at: trialEnds.toISOString(),
      }, { onConflict: 'phone' }).select().single();

      if (clientData) localStorage.setItem('onyx_custom_session', JSON.stringify(clientData));

      // Insertion automatique dans la nouvelle table nutrition_profiles
      await supabase.from('nutrition_profiles').upsert({
         phone: formData.phone,
         client_id: clientData?.id || null,
         bmr: Math.round(bmr),
         tdee: Math.round(tdee),
         daily_calorie_goal: Math.round(dailyCalories),
         carbs_goal: Math.round(carbs),
         protein_goal: Math.round(protein),
         fats_goal: Math.round(fats),
         diagnostic_data: formData
      }, { onConflict: 'phone' });

      await supabase.from('leads').insert([{
        full_name: formData.name,
        phone: formData.phone,
        source: "Diagnostic Nutrition",
        intent: "A complété son diagnostic (Attente Plan)",
        status: "Nouveau",
        saas: "Nutrition à l'Africaine",
        message: `BMR: ${Math.round(bmr)} | Objectif: ${Math.round(dailyCalories)} kcal (P:${Math.round(protein)}g, G:${Math.round(carbs)}g) | Perte ciblée: ${weightToLose}kg`
      }]);
      
      setStep(5); // Success step
    } catch (err) {
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaRedirect = () => {
    const msg = `🚀 *NOUVEAU PROFIL NUTRITION*\n\nBonjour l'équipe ! Je m'appelle ${formData.name} et je viens de terminer mon diagnostic nutritionnel.\n\nJe souhaite activer mes 14 jours d'essai gratuits et recevoir mon Guide PDF ainsi que mon menu de la Semaine 1 !`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-black">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-[2rem] shadow-xl overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Header */}
        <div className="bg-black text-white p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
            <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
          <Activity className="text-[#39FF14] mx-auto mb-4" size={32} />
          <h1 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase tracking-tighter`}>
            {step === 5 ? "Diagnostic Terminé !" : "Création de votre profil"}
          </h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">
            {step === 5 ? "L'algorithme a traité vos données." : "Pour un plan alimentaire 100% adapté à vos besoins."}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-8 flex-1 flex flex-col justify-center">
          {step !== 5 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6"><Scale className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Informations de base</h2></div>
                  <input type="text" name="name" required placeholder="Votre Prénom et Nom *" value={formData.name} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  <input type="tel" name="phone" required placeholder="Numéro WhatsApp *" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  <input type="password" name="pin" maxLength={4} required placeholder="Créez un code PIN (4 chiffres) *" value={formData.pin} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition cursor-pointer text-black">
                    <option value="" disabled>Votre sexe *</option>
                    <option value="Femme">Femme</option>
                    <option value="Homme">Homme</option>
                  </select>
                  <input type="number" name="age" required placeholder="Votre Âge *" value={formData.age} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6"><Target className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Mensurations & Objectifs</h2></div>
                  <div className="flex gap-4">
                    <input type="number" name="height" required placeholder="Taille (cm) *" value={formData.height} onChange={handleChange} className="w-1/2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                    <input type="number" name="currentWeight" required placeholder="Poids Actuel (kg) *" value={formData.currentWeight} onChange={handleChange} className="w-1/2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  </div>
                  <input type="number" name="targetWeight" required placeholder="Poids Cible / Objectif (kg) *" value={formData.targetWeight} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  <select name="activityLevel" required value={formData.activityLevel} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition cursor-pointer text-black">
                    <option value="" disabled>Niveau d'activité physique *</option>
                    <option value="Sédentaire">Sédentaire (Bureau, peu de sport)</option>
                    <option value="Actif">Légèrement actif (Marche, sport 1-2 fois/semaine)</option>
                    <option value="Très actif">Très actif (Sport 3+ fois/semaine)</option>
                  </select>
                  <input type="number" name="sleepHours" required placeholder="Heures de sommeil par nuit (ex: 7) *" value={formData.sleepHours} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6"><Apple className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Habitudes Alimentaires</h2></div>
                  <select name="familyDynamic" required value={formData.familyDynamic} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition cursor-pointer text-black">
                    <option value="" disabled>Dynamique familiale *</option>
                    <option value="Cuisine pour la famille">Je cuisine pour une famille</option>
                    <option value="Gère ses propres repas">Je gère mes propres repas</option>
                  </select>
                  <select name="lunchHabit" required value={formData.lunchHabit} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition cursor-pointer text-black">
                    <option value="" disabled>À midi, vous mangez plutôt... *</option>
                    <option value="À la cantine du bureau">À la cantine du bureau</option>
                    <option value="Un plat commandé">Un plat commandé</option>
                    <option value="Un repas préparé à la maison">Un repas préparé à la maison</option>
                  </select>
                  <select name="shoppingHabit" required value={formData.shoppingHabit} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition cursor-pointer text-black">
                    <option value="" disabled>Où faites-vous vos courses principalement ? *</option>
                    <option value="Marché local">Marché local</option>
                    <option value="Supermarché (Auchan, etc.)">Supermarché (Auchan, etc.)</option>
                    <option value="Mixte">Mixte (Marché + Supermarché)</option>
                  </select>
                  <select name="dietaryHabits" required value={formData.dietaryHabits} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition cursor-pointer text-black">
                    <option value="" disabled>Consommation de riz/plats en sauce ? *</option>
                    <option value="Tous les jours">Tous les jours</option>
                    <option value="3-4 fois par semaine">3 à 4 fois par semaine</option>
                    <option value="Rarement">Rarement</option>
                  </select>
                  <input type="text" name="allergies" placeholder="Allergies / Intolérances (ex: Lait, Arachide...)" value={formData.allergies} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  <p className="text-xs text-zinc-500 font-bold mt-2">Laissez vide si vous n'avez aucune allergie.</p>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <CheckCircle className="text-[#39FF14] w-20 h-20 mx-auto mb-6" />
                  <h2 className="text-2xl font-black uppercase mb-4 text-black">Prêt(e) à générer votre plan ?</h2>
                  <p className="text-zinc-600 font-medium mb-8">Nous allons analyser vos données pour créer un menu parfaitement adapté à votre métabolisme et à vos habitudes.</p>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex justify-center items-center gap-2">
                    {isSubmitting ? "Analyse en cours..." : "Valider mon profil"} <ArrowRight size={18}/>
                  </button>
                </motion.div>
              )}

              {step < 4 && (
                <div className="flex gap-4 pt-4 border-t border-zinc-100">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-4 bg-zinc-100 rounded-xl font-bold text-sm hover:bg-zinc-200 transition text-black">
                      Retour
                    </button>
                  )}
                  <button type="submit" className="flex-1 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition shadow-lg flex justify-center items-center gap-2">
                    Suivant <ChevronRight size={18}/>
                  </button>
                </div>
              )}
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-[#39FF14]">
                <Activity className="text-[#39FF14] w-10 h-10" />
              </div>
              <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6 text-black tracking-tighter`}>Analyse Terminée !</h2>
              
              {/* RÉSULTATS DU CALCUL */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 mb-8 text-left space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                   <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Poids Santé Idéal</span>
                   <span className="font-black text-2xl text-black">{idealWeight > 0 ? idealWeight.toFixed(1) : '--'} kg</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                   <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Flame size={16}/> Cible Calorique</span>
                   <span className="font-black text-2xl text-[#39FF14] bg-black px-4 py-1.5 rounded-xl shadow-lg">{dailyCalories > 0 ? dailyCalories.toFixed(0) : '--'} kcal</span>
                </div>
                
                <div className="pt-2">
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Répartition Quotidienne</p>
                   <div className="grid grid-cols-3 gap-3">
                      <div className="bg-orange-100 border border-orange-200 p-3 rounded-2xl text-center">
                         <p className="text-[10px] font-black uppercase text-orange-600 mb-1">Glucides</p>
                         <p className="font-black text-lg text-orange-700">{carbs > 0 ? carbs.toFixed(0) : '--'}g</p>
                      </div>
                      <div className="bg-purple-100 border border-purple-200 p-3 rounded-2xl text-center">
                         <p className="text-[10px] font-black uppercase text-purple-600 mb-1">Protéines</p>
                         <p className="font-black text-lg text-purple-700">{protein > 0 ? protein.toFixed(0) : '--'}g</p>
                      </div>
                      <div className="bg-yellow-100 border border-yellow-200 p-3 rounded-2xl text-center">
                         <p className="text-[10px] font-black uppercase text-yellow-600 mb-1">Lipides</p>
                         <p className="font-black text-lg text-yellow-700">{fats > 0 ? fats.toFixed(0) : '--'}g</p>
                      </div>
                   </div>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Temps estimé</span>
                   <span className="font-black text-xl text-black">{estimatedMonths > 0 ? `${estimatedMonths} mois` : '--'}</span>
                </div>
                <p className="text-[10px] text-zinc-400 italic text-center pt-2">* Estimation basée sur une perte saine et durable sans frustration.</p>
              </div>

              <div className="bg-black text-[#39FF14] p-5 rounded-2xl mb-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/20 rounded-full blur-2xl pointer-events-none"></div>
                 <p className="font-black uppercase text-sm mb-2 flex items-center justify-center gap-2">🎁 Compte Créé : 14 Jours Offerts !</p>
                 <p className="text-xs text-white font-medium leading-relaxed">Félicitations. Vous venez de débloquer votre <strong className="text-[#39FF14]">Guide PDF</strong> complet et votre <strong className="text-[#39FF14]">Menu de la Semaine 1</strong> gratuitement.</p>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={() => router.push('/nutrition?from=diagnostic')} className="w-full bg-black text-[#39FF14] py-5 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg flex justify-center items-center gap-2">
                  Accéder à mon espace personnel <ArrowRight size={18}/>
                </button>
                <button onClick={handleWaRedirect} className="w-full bg-zinc-100 text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-sm flex justify-center items-center gap-2 border border-zinc-200">
                  Contacter le coach sur WhatsApp
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
