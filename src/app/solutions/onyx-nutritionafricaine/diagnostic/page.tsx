"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, CheckCircle, Activity, ChevronRight, Target, Apple, Scale, Flame, Lock, Download } from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

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
    dailySteps: "",
    weightLossPace: "Normalement",
    healthProfile: "",
    mainChallenge: "",
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

  const calculateIMC = () => {
    const h = parseFloat(formData.height) / 100;
    const w = parseFloat(formData.currentWeight);
    if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
    return "0";
  };

   const getIMCCategory = (imcValue: string) => {
      const val = parseFloat(imcValue);
      if (val === 0) return "-";
      if (val < 18.5) return "Insuffisance pondérale";
      if (val < 25) return "Corpulence normale";
      if (val < 30) return "Surpoids";
      if (val < 35) return "Obésité modérée";
      return "Obésité sévère";
   };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("Bilan Nutritionnel - Onyx", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 150, 20);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Informations Personnelles", 20, 45);
    doc.setFontSize(12);
    doc.text(`Nom Complet : ${formData.name}`, 20, 55);
    doc.text(`Sexe : ${formData.gender}`, 20, 63);
    doc.text(`Âge : ${formData.age} ans`, 100, 63);
    doc.setFontSize(16);
    doc.text("Mensurations & Objectifs", 20, 80);
    doc.setFontSize(12);
    doc.text(`Taille : ${formData.height} cm`, 20, 90);
    doc.text(`Poids Actuel : ${formData.currentWeight} kg`, 20, 98);
    const imc = calculateIMC();
    const category = getIMCCategory(imc);
    doc.setFontSize(14);
    doc.setTextColor(40, 167, 69);
    doc.text(`IMC Calculé : ${imc} (${category})`, 20, 110);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Habitudes de Vie", 20, 130);
    doc.setFontSize(12);
    doc.text(`Niveau d'activité : ${formData.dailySteps}`, 20, 140);
    doc.text(`Consommation plats en sauce : ${formData.dietaryHabits}`, 20, 148);
    doc.text(`Allergies : ${formData.allergies || "Aucune"}`, 20, 156);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Diagnostic généré par l'application Onyx Nutrition à l'Africaine.", 20, 280);
    doc.save(`Diagnostic_Nutrition_${formData.name.replace(/\s+/g, '_')}.pdf`);
  };

  // --- MOTEUR DE CALCUL NUTRITIONNEL ---
  const heightCm = parseFloat(formData.height) || 0;
  const currentWeight = parseFloat(formData.currentWeight) || 0;
  const age = parseFloat(formData.age) || 0;
  const isMale = formData.gender === "Homme";
  
  // 1. Formule de Lorentz pour le poids idéal théorique
  const idealWeight = heightCm > 0 
    ? (isMale ? (heightCm - 100 - ((heightCm - 150) / 4)) : (heightCm - 100 - ((heightCm - 150) / 2.5))) 
    : 0;
  
  let deficit = 500;
  let lossPerWeek = 0.5;
  if (formData.weightLossPace === 'Progressivement') { deficit = 300; lossPerWeek = 0.3; }
  else if (formData.weightLossPace === 'Rapidement') { deficit = 700; lossPerWeek = 0.7; }
  
  const weightToLose = currentWeight - idealWeight;
  const estimatedWeeks = weightToLose > 0 ? Math.ceil(weightToLose / lossPerWeek) : 0; 
  const estimatedMonths = estimatedWeeks > 0 ? (estimatedWeeks / 4).toFixed(1) : 0; 

  // 2. Calcul du Métabolisme de Base (BMR) via Mifflin-St Jeor
  const bmr = (heightCm > 0 && currentWeight > 0 && age > 0)
    ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161)
    : 0;

  // 3. Calcul de la Dépense Énergétique Journalière (TDEE) selon les pas
  let nap = 1.2;
  if (formData.dailySteps === "5 000 à 7 499 pas/jour (Légèrement actif)") nap = 1.375;
  else if (formData.dailySteps === "7 500 à 9 999 pas/jour (Actif)") nap = 1.55;
  else if (formData.dailySteps === "10 000+ pas/jour (Très actif)") nap = 1.725;
  
  const tdee = bmr * nap;

  // 4. Application du déficit calorique
  let rawCalories = weightToLose > 0 ? tdee - deficit : (weightToLose < 0 ? tdee + 300 : tdee);
  if (formData.healthProfile === "Allaitement") {
      rawCalories += 500;
  }
  // Sécurité : Ne jamais descendre sous 1200 kcal (femme) ou 1500 kcal (homme)
  const dailyCalories = Math.max(isMale ? 1500 : 1200, rawCalories || 0);

  // 5. Répartition des Macros
  let proteinRatio = 0.30;
  if (age >= 50) proteinRatio = 0.35; // Rehaussement pour profils seniors
  
  const carbs = (dailyCalories * (0.70 - proteinRatio)) / 4;
  const protein = (dailyCalories * proteinRatio) / 4;
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
         diagnostic_data: formData,
         weekly_menu: [] // On réinitialise le menu existant pour forcer la regénération
      }, { onConflict: 'client_id' });

      await supabase.from('leads').insert([{
        full_name: formData.name,
        phone: formData.phone,
        source: "Diagnostic Nutrition",
        intent: "A complété son diagnostic (Attente Plan)",
        status: "Nouveau",
        saas: "Nutrition à l'Africaine",
        message: `BMR: ${Math.round(bmr)} | Objectif: ${Math.round(dailyCalories)} kcal (P:${Math.round(protein)}g, G:${Math.round(carbs)}g) | Poids idéal cible: ${idealWeight.toFixed(1)}kg | Profil Santé: ${formData.healthProfile || '-'}`
      }]);
      
      let welcomeMsg = "";
      if (formData.healthProfile === "Allaitement") {
          welcomeMsg = `Bonjour ${formData.name.split(' ')[0]}  ! Bienvenue chez Onyx. D'après ton profil de jeune maman, ton corps a besoin d'énergie. J'ai préparé ton plan avec un bonus calorique pour nourrir ton bébé en toute sécurité sans bloquer ta perte de poids. Prête à commencer ?`;
      } else if (formData.healthProfile === "Changements hormonaux" || age >= 50) {
          welcomeMsg = `Bonjour ${formData.name.split(' ')[0]}  ! Bienvenue chez Onyx. La périménopause ou l'âge bloque parfois la perte de poids, mais c'est terminé ! Ton plan va réactiver ton métabolisme et protéger ton tonus musculaire et tes articulations tout en douceur. Prête à retrouver la forme ?`;
      } else {
          welcomeMsg = `Bonjour ${formData.name.split(' ')[0]}  ! Bienvenue chez Onyx. Ton diagnostic est validé ! On va transformer ton corps sans que tu aies besoin d'arrêter de manger nos délicieux plats locaux. Prête à passer à l'action ?`;
      }
      localStorage.setItem('onyx_nutrition_welcome', welcomeMsg);

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
                  
                  <div className="space-y-2 mt-4">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Votre sexe *</label>
                    <div className="grid grid-cols-2 gap-4">
                       <div onClick={() => setFormData({...formData, gender: 'Femme'})} className={`cursor-pointer border-4 rounded-2xl overflow-hidden relative transition-all ${formData.gender === 'Femme' ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                          <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_1_1_en_gardant_202606111043_unmonc.jpg" className="w-full aspect-square object-cover" alt="Femme" />
                          <div className="absolute bottom-0 w-full bg-black/80 text-white text-center py-3 font-black uppercase tracking-widest text-sm backdrop-blur-sm">Femme</div>
                       </div>
                       <div onClick={() => setFormData({...formData, gender: 'Homme'})} className={`cursor-pointer border-4 rounded-2xl overflow-hidden relative transition-all ${formData.gender === 'Homme' ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                          <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_format_1_1_en_202606111044_rjknkg.jpg" className="w-full aspect-square object-cover" alt="Homme" />
                          <div className="absolute bottom-0 w-full bg-black/80 text-white text-center py-3 font-black uppercase tracking-widest text-sm backdrop-blur-sm">Homme</div>
                       </div>
                    </div>
                  </div>
                  <input type="number" name="age" required placeholder="Votre Âge *" value={formData.age} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black mt-4" />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6"><Target className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Mensurations & Objectifs</h2></div>
                  <div className="flex gap-4">
                    <input type="number" name="height" required placeholder="Taille (cm) *" value={formData.height} onChange={handleChange} className="w-1/2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                    <input type="number" name="currentWeight" required placeholder="Poids Actuel (kg) *" value={formData.currentWeight} onChange={handleChange} className="w-1/2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  </div>
                  <div className="space-y-2 mt-6">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Combien de pas faites-vous par jour ? *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {["< 5 000 pas/jour (Sédentaire)", "5 000 à 7 499 pas/jour (Légèrement actif)", "7 500 à 9 999 pas/jour (Actif)", "10 000+ pas/jour (Très actif)"].map(steps => (
                          <button type="button" key={steps} onClick={() => setFormData({...formData, dailySteps: steps})} className={`p-4 rounded-2xl border-2 text-left font-bold text-xs transition-all ${formData.dailySteps === steps ? 'bg-black text-[#39FF14] border-black shadow-lg' : 'bg-zinc-50 border-zinc-200 hover:border-black text-black'}`}>
                             {steps}
                          </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-6 bg-zinc-50 p-6 rounded-3xl border border-zinc-200">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 block">Rythme de perte de poids souhaité *</label>
                    <div className="relative pt-4 pb-2 px-2">
                       <input 
                          type="range" 
                          min="1" max="3" step="1" 
                          value={formData.weightLossPace === 'Progressivement' ? 1 : formData.weightLossPace === 'Normalement' ? 2 : 3}
                          onChange={(e) => {
                             const val = e.target.value;
                             setFormData({...formData, weightLossPace: val === '1' ? 'Progressivement' : val === '2' ? 'Normalement' : 'Rapidement'});
                          }}
                          className="w-full accent-black h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                       />
                       <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400 mt-4">
                          <span className={`w-1/3 text-left ${formData.weightLossPace === 'Progressivement' ? 'text-[#39FF14] drop-shadow-md' : ''}`}>Progressif<br/>(-0.3kg/sem)</span>
                          <span className={`w-1/3 text-center ${formData.weightLossPace === 'Normalement' ? 'text-black' : ''}`}>Normal<br/>(-0.5kg/sem)</span>
                          <span className={`w-1/3 text-right ${formData.weightLossPace === 'Rapidement' ? 'text-red-500' : ''}`}>Rapide<br/>(-0.7kg/sem)</span>
                       </div>
                    </div>
                  </div>
                  
                  {formData.gender === 'Femme' && (
                    <div className="space-y-4 mt-6">
                       <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Ta situation actuelle *</label>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { id: "Allaitement", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781181320/An_authentic_minimalistic_flat-lay_illustration_202606111234_dg6lni.jpg", title: "Allaitement" },
                            { id: "Changements hormonaux", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781181281/cle_ezqyki.jpg", title: "Changements hormonaux (Ménopause / Périménopause)" },
                            { id: "Forme standard", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781181319/A_minimal_sleek_white_modern_202606111234_bpcoy2.jpg", title: "Forme standard" }
                          ].map(profile => (
                             <div key={profile.id} onClick={() => setFormData({...formData, healthProfile: profile.id})} className={`cursor-pointer border-4 rounded-2xl overflow-hidden relative transition-all ${formData.healthProfile === profile.id ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                <img src={profile.img} className="w-full aspect-square object-cover" alt={profile.title} />
                                <div className="absolute bottom-0 w-full bg-black/80 text-white text-center py-2 px-1 font-black uppercase tracking-widest text-[9px] backdrop-blur-sm h-12 flex items-center justify-center leading-tight">{profile.title}</div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
                  <input type="number" name="sleepHours" required placeholder="Heures de sommeil par nuit (ex: 7) *" value={formData.sleepHours} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black mt-4" />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6"><Apple className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Habitudes Alimentaires</h2></div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Dynamique familiale *</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["Cuisine pour la famille", "Gère ses propres repas"].map(dyn => (
                       <button type="button" key={dyn} onClick={() => setFormData({...formData, familyDynamic: dyn})} className={`p-4 rounded-2xl border-2 text-left font-bold text-xs transition-all ${formData.familyDynamic === dyn ? 'bg-black text-[#39FF14] border-black shadow-md' : 'bg-zinc-50 border-zinc-200 hover:border-black text-black'}`}>
                          {dyn}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-2 mt-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">À midi, vous mangez plutôt... *</label>
                 <div className="grid grid-cols-1 gap-2">
                    {["À la cantine du bureau", "Un plat commandé", "Un repas préparé à la maison"].map(habit => (
                       <button type="button" key={habit} onClick={() => setFormData({...formData, lunchHabit: habit})} className={`p-4 rounded-2xl border-2 text-left font-bold text-xs transition-all ${formData.lunchHabit === habit ? 'bg-black text-[#39FF14] border-black shadow-md' : 'bg-zinc-50 border-zinc-200 hover:border-black text-black'}`}>
                          {habit}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-2 mt-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Où faites-vous vos courses principalement ? *</label>
                 <div className="grid grid-cols-1 gap-2">
                    {["Marché local", "Supermarché (Auchan, etc.)", "Mixte (Marché + Supermarché)"].map(habit => (
                       <button type="button" key={habit} onClick={() => setFormData({...formData, shoppingHabit: habit})} className={`p-4 rounded-2xl border-2 text-left font-bold text-xs transition-all ${formData.shoppingHabit === habit ? 'bg-black text-[#39FF14] border-black shadow-md' : 'bg-zinc-50 border-zinc-200 hover:border-black text-black'}`}>
                          {habit}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-2 mt-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Consommation de riz/plats en sauce ? *</label>
                 <div className="grid grid-cols-1 gap-2">
                    {["Tous les jours", "3-4 fois par semaine", "Rarement"].map(habit => (
                       <button type="button" key={habit} onClick={() => setFormData({...formData, dietaryHabits: habit})} className={`p-4 rounded-2xl border-2 text-left font-bold text-xs transition-all ${formData.dietaryHabits === habit ? 'bg-black text-[#39FF14] border-black shadow-md' : 'bg-zinc-50 border-zinc-200 hover:border-black text-black'}`}>
                          {habit}
                       </button>
                    ))}
                 </div>
              </div>
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              
              {/* L'En-tête de Victoire */}
              <div className="bg-gradient-to-r from-green-600 to-[#2bd40d] text-white p-6 rounded-[2rem] shadow-2xl mb-8">
                 <h2 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase mb-2 tracking-tighter leading-tight`}>Diagnostic Terminé !</h2>
                 <p className="font-bold text-sm">Ta feuille de route Jongoma est prête.</p>
              </div>

              {/* Le Comparatif de Poids Visuel */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-50 border border-zinc-200 rounded-[2rem] p-6 mb-8 shadow-sm relative">
                 <div className="text-center w-full sm:w-1/3">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Poids Actuel</p>
                    <p className="text-4xl md:text-5xl font-black text-red-500">{formData.currentWeight || '--'} <span className="text-lg">kg</span></p>
                 </div>
                 
                 <div className="w-full sm:w-1/3 flex flex-col items-center justify-center py-4 sm:py-0">
                    <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="bg-black text-[#39FF14] p-3 rounded-full mb-2 shadow-[0_0_15px_#39FF14]">
                       <ArrowRight size={24} />
                    </motion.div>
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest text-center">En {estimatedWeeks > 0 ? estimatedWeeks : '--'} semaines<br/>sans frustration</p>
                 </div>

                 <div className="text-center w-full sm:w-1/3">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Poids Idéal Santé</p>
                    <p className="text-4xl md:text-5xl font-black text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">{idealWeight > 0 ? idealWeight.toFixed(1) : '--'} <span className="text-lg text-black">kg</span></p>
                 </div>
              </div>
              
              {/* Le Badge du Profil Métabolique */}
              <div className="bg-[#39FF14]/10 border-2 border-[#39FF14] rounded-2xl p-4 mb-8 flex items-center gap-4 text-left shadow-inner">
                 <div className="bg-[#39FF14] p-3 rounded-xl text-black shadow-md"><Activity size={24} /></div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ton Profil Métabolique</p>
                    <p className="font-black text-black text-sm md:text-base uppercase leading-tight mt-0.5">
                       Jongoma {formData.dailySteps.includes('< 5 000') ? 'Sédentaire' : 'Active'} - 
                       {formData.mainChallenge === 'Le Sel & la Tension' ? ' Sensible au Sel' : formData.mainChallenge === "Le Sucre & l'Attaya" ? ' Alerte Sucre' : ' Profil Familial'}
                       {formData.healthProfile && formData.healthProfile !== 'Forme standard' ? ` - ${formData.healthProfile}` : ''}
                    </p>
                 </div>
              </div>

            {formData.healthProfile === 'Allaitement' && (
               <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8 flex items-center gap-4 text-left shadow-inner">
                  <div className="text-2xl">🤱</div>
                  <div><p className="font-black text-orange-600 text-sm uppercase">Profil Maman Énergie</p><p className="text-xs text-orange-800 font-medium mt-1">Tes calories incluent un bonus de 500 kcal pour nourrir ton bébé en toute sécurité sans bloquer ta perte de poids.</p></div>
               </div>
            )}
            {age >= 50 && (
               <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-8 flex items-center gap-4 text-left shadow-inner">
                  <div className="text-2xl">🧘‍♀️</div>
                  <div><p className="font-black text-purple-600 text-sm uppercase">Profil Longévité</p><p className="text-xs text-purple-800 font-medium mt-1">Ton objectif de protéines a été rehaussé pour protéger ton tonus musculaire et tes articulations.</p></div>
               </div>
            )}

              {/* La Jauge Énergétique Verrouillée */}
              <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 mb-10 shadow-lg relative overflow-hidden group">
                 <h3 className="font-black uppercase text-xs text-zinc-400 tracking-widest mb-4">Ton Quota Quotidien Calculé</h3>
                 <div className="flex justify-center items-center gap-2 mb-6">
                    <Flame className="text-orange-500 animate-pulse" size={32} />
                    <span className="text-4xl font-black text-black">{dailyCalories > 0 ? dailyCalories.toFixed(0) : '--'} <span className="text-xl text-zinc-400">kcal / jour</span></span>
                 </div>
                 
                 <div className="relative">
                    <div className="filter blur-[6px] opacity-60 pointer-events-none select-none space-y-2">
                       <div className="bg-zinc-100 p-4 rounded-xl flex justify-between items-center"><span className="font-bold text-xs uppercase text-zinc-500">Matin</span><span className="text-sm font-medium">Bouillie de Mil allégée</span></div>
                       <div className="bg-zinc-100 p-4 rounded-xl flex justify-between items-center"><span className="font-bold text-xs uppercase text-zinc-500">Midi</span><span className="text-sm font-medium">Yassa Poulet Diététique</span></div>
                       <div className="bg-zinc-100 p-4 rounded-xl flex justify-between items-center"><span className="font-bold text-xs uppercase text-zinc-500">Soir</span><span className="text-sm font-medium">Salade de Niébé</span></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <Lock className="text-black mb-3 w-12 h-12 bg-white p-3 rounded-full shadow-lg" />
                       <span className="bg-black text-[#39FF14] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-[#39FF14]/30">Menu Verrouillé</span>
                    </div>
                 </div>
              </div>

              {/* Le CTA Magnétique */}
              <div className="flex flex-col gap-3">
                <button onClick={() => router.push('/nutrition?from=diagnostic')} className="w-full bg-[#1b74e4] text-white py-6 rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest hover:bg-[#155fc0] transition-colors shadow-[0_15px_30px_rgba(27,116,228,0.3)] flex justify-center items-center gap-3 hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-4">
                  <CheckCircle size={20} /> Créer mon compte & Débloquer mon Yassa Léger de Midi
                </button>
                <p className="text-[10px] text-zinc-500 font-bold mt-2 uppercase tracking-widest">Rejoins les 25 000 membres de la communauté. Inscription gratuite en 10 secondes via Google ou Téléphone.</p>
                
                <button onClick={handleWaRedirect} className="w-full mt-4 bg-zinc-100 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-colors shadow-sm flex justify-center items-center gap-2 border border-zinc-200">
                  Poser une question sur WhatsApp
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
