"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, CheckCircle, Activity, ChevronRight, Target, Apple, Scale, Flame, Lock, Download, HeartPulse, Droplet, Wind, Utensils, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import jsPDF from "jspdf";

const spaceGrotesk = { className: "font-sans" };

export default function NutritionDiagnostic() {
  const router = useRouter();
  const waNumber = "221785338417";
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceTarget, setForceTarget] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pin: "",
    gender: "",
    age: "",
    birthDate: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    goalType: "Perte de poids",
    dailySteps: "",
    weightLossPace: "Normalement",
    healthProfile: "",
    mainChallenge: "",
    dietaryHabits: "",
    allergies: "",
    cookingHabit: "",
    weeklyBudget: "",
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
    doc.text(`Poids Cible : ${formData.targetWeight} kg`, 100, 98);
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
  
  const targetW = parseFloat(formData.targetWeight);
  const finalTargetWeight = targetW > 0 ? targetW : idealWeight;
  const weightToLose = currentWeight - finalTargetWeight;
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
  let rawCalories = tdee;
  if (formData.goalType === 'Perte de poids') {
     rawCalories = tdee - deficit;
  } else if (formData.goalType === 'Prise de masse') {
     rawCalories = tdee + 300;
  } else if (formData.goalType === 'Maintien') {
     rawCalories = tdee;
  }
  
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

  // Pour le graphique interactif (IMC Santé = 22)
  const heightM = heightCm / 100;
  const currentW = parseFloat(formData.currentWeight) || 0;
  const targetWInput = parseFloat(formData.targetWeight) || 0;
  const idealW = heightM > 0 ? 22 * (heightM * heightM) : 0;

  const chartData = [
    { name: 'Poids Actuel', poids: currentW },
    { name: 'Objectif', poids: targetWInput }
  ];

  const diffIdealTarget = Math.abs(targetWInput - idealW);
  const showWarning = targetWInput > 0 && idealW > 0 && diffIdealTarget > 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Removed blocking validation to prevent user friction.
    if (step < 6) {
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
         weekly_budget_tier: formData.weeklyBudget === 'Serré' ? 'serre_8k' : formData.weeklyBudget === 'Famille' ? 'famille_15k' : 'confort_25k',
         lunch_context: formData.lunchHabit === 'Au bureau avec ma gamelle' ? 'bureau_solo' : formData.lunchHabit === 'À la maison autour du bol familial' ? 'maison_bol_commun' : 'restaurant',
         cooking_mode: formData.cookingHabit === 'Je cuisine pour moi seule' ? 'pour_moi_seule' : 'pour_toute_la_famille',
         health_conditions: [formData.healthProfile].filter(p => p && p !== 'Aucun'),
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

      setStep(7); // Success step
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
            <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }}></div>
          </div>
          <Activity className="text-[#39FF14] mx-auto mb-4" size={32} />
          <h1 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase tracking-tighter`}>
            {step === 7 ? "Diagnostic Terminé !" : "Création de votre profil"}
          </h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">
            {step === 7 ? "Votre plan personnalisé est prêt." : "Pour un plan alimentaire 100% adapté à vos besoins."}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-8 flex-1 flex flex-col justify-center">
          {step !== 7 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {step === 1 && ( // Étape 1: Informations de base
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6"><Scale className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Étape 1: Vos Informations</h2></div>
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
                  <div className="space-y-2 mt-4">
                     <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Date de naissance *</label>
                     <input type="date" required value={formData.birthDate} onChange={(e) => {
                        const birthDate = e.target.value;
                        let age = "";
                        if (birthDate) {
                           const today = new Date();
                           const birth = new Date(birthDate);
                           let calculatedAge = today.getFullYear() - birth.getFullYear();
                           const m = today.getMonth() - birth.getMonth();
                           if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) calculatedAge--;
                           age = calculatedAge.toString();
                        }
                        setFormData({...formData, birthDate, age});
                     }} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  </div>

                  <div className="space-y-2 mb-6">
                     <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Quel est votre objectif principal ? *</label>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                           { id: "Perte de poids", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781542708/A_high-end_commercial_photorealistic_portrait_202606151658_noabp9.jpg", desc: "Déficit calorique" },
                           { id: "Maintien", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544253/A_high-end_commercial_photorealistic_full-body_202606151657_cfq5fb.jpg", desc: "TDEE exact" },
                           { id: "Prise de masse", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544091/rajoute_le_logo_sur_la_202606151721_aayo61.jpg", desc: "Surplus calorique" }
                        ].map(goal => (
                           <div key={goal.id} onClick={() => setFormData({...formData, goalType: goal.id})} className={`cursor-pointer border-4 rounded-2xl overflow-hidden relative transition-all ${formData.goalType === goal.id ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                              <img src={goal.img} className="w-full aspect-square object-cover" alt={goal.id} />
                              <div className="absolute bottom-0 w-full bg-black/80 text-white text-center py-2 px-1 backdrop-blur-sm h-14 flex flex-col items-center justify-center leading-tight">
                                 <span className="font-black uppercase tracking-widest text-xs">{goal.id}</span>
                                 <span className="text-[9px] uppercase mt-0.5 opacity-70 tracking-widest">{goal.desc}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap gap-4">
                    <input type="number" name="height" required placeholder="Taille (cm) *" value={formData.height} onChange={handleChange} className="w-full md:w-1/3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                    <input type="number" name="currentWeight" required placeholder="Poids Actuel (kg) *" value={formData.currentWeight} onChange={handleChange} className="w-full md:w-1/3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                    <input type="number" name="targetWeight" required placeholder="Poids Cible (kg) *" value={formData.targetWeight} onChange={handleChange} className="w-full md:w-1/3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
                  </div>
                </motion.div>
              )}

              {step === 2 && ( // Étape 2: Santé
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6"><HeartPulse className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Étape 2: Votre Santé</h2></div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Avez-vous des conditions spécifiques ?</label>
                      <div className="grid grid-cols-2 gap-4">
                          <div onClick={() => setFormData({...formData, healthProfile: 'Diabète'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.healthProfile === 'Diabète' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <Droplet size={24} />
                              <span className="font-bold text-sm">Diabète</span>
                          </div>
                          <div onClick={() => setFormData({...formData, healthProfile: 'Hypertension'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.healthProfile === 'Hypertension' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <HeartPulse size={24} />
                              <span className="font-bold text-sm">Hypertension</span>
                          </div>
                          <div onClick={() => setFormData({...formData, healthProfile: 'Préménopause/Ménopause'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.healthProfile === 'Préménopause/Ménopause' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <Wind size={24} />
                              <span className="font-bold text-sm">Préménopause/Ménopause</span>
                          </div>
                          <div onClick={() => setFormData({...formData, healthProfile: 'Aucun'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.healthProfile === 'Aucun' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <CheckCircle size={24} />
                              <span className="font-bold text-sm">Aucun</span>
                          </div>
                      </div>
                  </div>

                  {currentW > 0 && targetWInput > 0 && heightM > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200 shadow-inner">
                          <div className="flex justify-center items-center gap-6 mb-6">
                             <div className="flex flex-col items-center">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg" alt="Cible" className="w-12 h-12 rounded-xl object-cover shadow-sm mb-2" />
                                <span className="text-[10px] font-black uppercase text-zinc-500">Objectif</span>
                             </div>
                             <div className="flex flex-col items-center">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458359/A_cute__highly_detailed_3D_202606141731_wog3pz.jpg" alt="Idéal" className="w-12 h-12 rounded-xl object-cover shadow-sm mb-2" />
                                <span className="text-[10px] font-black uppercase text-[#39FF14]">Santé</span>
                             </div>
                          </div>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={['auto', 'auto']} stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <ReferenceLine y={idealW} stroke="#39FF14" strokeDasharray="3 3" label={{ position: 'top', value: `Idéal Santé (${idealW.toFixed(1)}kg)`, fill: '#39FF14', fontSize: 12, fontWeight: 'bold' }} />
                            <Line type="monotone" dataKey="poids" stroke="#000" strokeWidth={4} dot={{ r: 8, fill: '#000', stroke: '#39FF14', strokeWidth: 3 }} animationDuration={1500} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {showWarning && !forceTarget && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-orange-50 border border-orange-200 p-5 rounded-2xl">
                           <p className="text-orange-800 text-sm font-bold mb-4 leading-relaxed">Votre poids cible (<span className="font-black">{targetWInput}kg</span>) est assez éloigné de votre poids idéal de santé (<span className="font-black">{idealW.toFixed(1)}kg</span>). Un objectif trop drastique peut être difficile à maintenir sur le long terme.</p>
                           <button type="button" onClick={() => setForceTarget(true)} className="w-full bg-orange-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-md flex justify-center items-center gap-2">Je maintiens mon objectif</button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  <div className="space-y-2 mt-4">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Allergies / Intolérances</label>
                      <input type="text" name="allergies" placeholder="Ex: Lait, Arachide... (Laissez vide si aucune)" value={formData.allergies} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black" />
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
                </motion.div>
              )}

              {step === 3 && ( // Étape 3: Style de vie
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6"><Apple className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Étape 3: Votre Style de Vie</h2></div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Le midi, comment mangez-vous généralement ?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div onClick={() => setFormData({...formData, lunchHabit: 'Au bureau avec ma gamelle'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all ${formData.lunchHabit === 'Au bureau avec ma gamelle' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <span className="text-3xl">🍱</span>
                              <span className="font-bold text-sm">Au bureau avec ma gamelle</span>
                          </div>
                          <div onClick={() => setFormData({...formData, lunchHabit: 'À la maison autour du bol familial'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all ${formData.lunchHabit === 'À la maison autour du bol familial' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <span className="text-3xl">🍲</span>
                              <span className="font-bold text-sm">À la maison autour du bol familial</span>
                          </div>
                          <div onClick={() => setFormData({...formData, lunchHabit: 'Dehors'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all ${formData.lunchHabit === 'Dehors' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <span className="text-3xl">🍽️</span>
                              <span className="font-bold text-sm">Dehors (Restaurant, Fast-food)</span>
                          </div>
                      </div>
                  </div>
                  
                  {formData.goalType === 'Perte de poids' && (
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
                  )}
                  
                  <input type="number" name="sleepHours" required placeholder="Heures de sommeil par nuit (ex: 7) *" value={formData.sleepHours} onChange={handleChange} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition text-black mt-4" />
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
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6"><Utensils className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Étape 4: Votre Cuisine</h2></div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Qui gère les repas ?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div onClick={() => setFormData({...formData, cookingHabit: 'Je cuisine pour moi seule'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all ${formData.cookingHabit === 'Je cuisine pour moi seule' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <span className="text-4xl">🧑‍🍳</span>
                              <span className="font-bold text-sm">Je cuisine pour moi seule</span>
                          </div>
                          <div onClick={() => setFormData({...formData, cookingHabit: 'Je cuisine pour toute la famille'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all ${formData.cookingHabit === 'Je cuisine pour toute la famille' ? 'border-[#39FF14] shadow-md' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <span className="text-4xl">👨‍👩‍👧‍👦</span>
                              <span className="font-bold text-sm">Je cuisine pour toute la famille</span>
                          </div>
                      </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6"><ShoppingBag className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Étape 5: Budget Hebdo</h2></div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Quel est votre budget courses par SEMAINE ?</label>
                      <div className="grid grid-cols-1 gap-4">
                          <div onClick={() => setFormData({...formData, weeklyBudget: 'Serré'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.weeklyBudget === 'Serré' ? 'border-green-500 bg-green-50' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <span className="font-black text-lg text-green-600 uppercase">Serré (8 000 F / sem)</span>
                              <span className="text-xs font-bold text-green-800">Mangez à votre faim sans crédit.</span>
                          </div>
                          <div onClick={() => setFormData({...formData, weeklyBudget: 'Famille'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.weeklyBudget === 'Famille' ? 'border-orange-500 bg-orange-50' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <span className="font-black text-lg text-orange-600 uppercase">Famille (15 000 F / sem)</span>
                              <span className="text-xs font-bold text-orange-800">Équilibre et variété.</span>
                          </div>
                          <div onClick={() => setFormData({...formData, weeklyBudget: 'Confort'})} className={`cursor-pointer border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.weeklyBudget === 'Confort' ? 'border-purple-500 bg-purple-50' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'}`}>
                              <span className="font-black text-lg text-purple-600 uppercase">Confort (25 000 F / sem)</span>
                              <span className="text-xs font-bold text-purple-800">Santé premium locale.</span>
                          </div>
                      </div>
                  </div>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <CheckCircle className="text-[#39FF14] w-20 h-20 mx-auto mb-6" />
                  <h2 className="text-2xl font-black uppercase mb-4 text-black">Analyse en cours...</h2>
                  <p className="text-zinc-600 font-medium mb-8">Validez pour générer vos nouveaux objectifs caloriques et votre menu adapté.</p>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex justify-center items-center gap-2">
                    {isSubmitting ? "Calcul en cours..." : "Mettre à jour mon plan"} <ArrowRight size={18}/>
                  </button>
                </motion.div>
              )}

              {step < 6 && (
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
              <div className="bg-zinc-50 border border-zinc-200 rounded-[2rem] p-6 mb-10 text-left shadow-sm">
                 <p className="text-lg font-medium leading-relaxed text-zinc-800">
                   Calcul médical terminé. Votre corps a besoin de <strong className="font-black text-black text-2xl">{Math.round(dailyCalories)}</strong> kcal/jour.
                 </p>
                 <p className="text-lg font-medium leading-relaxed text-zinc-800 mt-4">
                   La bonne nouvelle ? Vous n'aurez plus jamais à les compter. Suivez simplement nos portions en bols et cuillères.
                 </p>
              </div>
              <div className="flex flex-col gap-3">
                 <button onClick={handleWaRedirect} className="w-full bg-black text-[#39FF14] py-5 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex justify-center items-center gap-2">
                    Débloquer mon plan (14 jours d'essai) <ArrowRight size={18}/>
                 </button>
                 <button onClick={handleDownloadPDF} type="button" className="w-full bg-zinc-100 text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-sm flex justify-center items-center gap-2 border border-zinc-200">
                    <Download size={18}/> Télécharger mon bilan PDF
                 </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}