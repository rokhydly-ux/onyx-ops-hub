"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, CheckCircle, Activity, ChevronRight, Target, Apple, Scale, Download } from "lucide-react";
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
    gender: "",
    age: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    activityLevel: "",
    dietaryHabits: "",
    allergies: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await supabase.from('leads').insert([{
        full_name: formData.name,
        phone: formData.phone,
        source: "Diagnostic Nutrition",
        intent: "A complété son diagnostic (Attente Plan)",
        status: "Nouveau",
        saas: "Nutrition à l'Africaine",
        message: `Âge: ${formData.age} | Sexe: ${formData.gender} | Poids actuel: ${formData.currentWeight}kg | Cible: ${formData.targetWeight}kg | Taille: ${formData.height}cm | Activité: ${formData.activityLevel} | Habitudes: ${formData.dietaryHabits} | Allergies: ${formData.allergies}`
      }]);
      
      setStep(5); // Success step
    } catch (err) {
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaRedirect = () => {
    const msg = `Bonjour l'équipe ! Je m'appelle ${formData.name} et je viens de terminer mon diagnostic nutritionnel sur l'application.\n\nJe suis prêt(e) à recevoir mon premier menu sur-mesure !`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Calcul de l'IMC (Poids / Taille²)
  const calculateIMC = () => {
    const h = parseFloat(formData.height) / 100;
    const w = parseFloat(formData.currentWeight);
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return "0";
  };

  // Catégorisation de l'IMC
  const getIMCCategory = (imcValue: string) => {
    const val = parseFloat(imcValue);
    if (val === 0) return "-";
    if (val < 18.5) return "Insuffisance pondérale";
    if (val < 25) return "Corpulence normale";
    if (val < 30) return "Surpoids";
    if (val < 35) return "Obésité modérée";
    return "Obésité sévère";
  };

  // Génération du PDF
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
    doc.text(`Niveau d'activité : ${formData.activityLevel}`, 20, 140);
    doc.text(`Consommation plats en sauce : ${formData.dietaryHabits}`, 20, 148);
    doc.text(`Allergies : ${formData.allergies || "Aucune"}`, 20, 156);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Diagnostic généré par l'application Onyx Nutrition à l'Africaine.", 20, 280);
    
    doc.save(`Diagnostic_Nutrition_${formData.name.replace(/\s+/g, '_')}.pdf`);
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
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6"><Apple className="text-[#39FF14]" /><h2 className="text-xl font-black uppercase">Habitudes Alimentaires</h2></div>
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
              <div className="w-24 h-24 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-[#39FF14] w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black uppercase mb-6 text-black">Analyse Terminée !</h2>
              
              {/* RÉSULTAT IMC */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 mb-8 text-left shadow-sm">
                 <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-4">
                    <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Votre IMC</span>
                    <span className="font-black text-3xl text-black">{calculateIMC()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Catégorie</span>
                    <span className="font-black text-sm md:text-base text-black bg-[#39FF14] px-4 py-1.5 rounded-xl text-center shadow-sm">{getIMCCategory(calculateIMC())}</span>
                 </div>
              </div>

              <p className="text-zinc-600 font-medium mb-8">Téléchargez votre bilan complet au format PDF pour le conserver, ou envoyez-le à votre coach pour obtenir votre premier menu.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleDownloadPDF} type="button" className="flex-1 bg-black text-[#39FF14] py-5 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg flex justify-center items-center gap-2">
                  <Download size={18}/> Bilan PDF
                </button>
                <button onClick={handleWaRedirect} type="button" className="flex-1 bg-[#25D366] text-white py-5 rounded-xl font-black uppercase tracking-widest hover:bg-[#1ebd58] transition-colors shadow-lg shadow-[#25D366]/30 flex justify-center items-center gap-2">
                  Coach WhatsApp <ArrowRight size={18}/>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}