"use client";

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, Sparkles, Copy, RefreshCcw, Calendar, 
  Image as ImageIcon, Target, Tag, MessageSquare, 
  Zap, Users, FileText, CheckCircle, ChevronDown,
  Wand2, Database
} from 'lucide-react';

export default function AIContentGenerator() {
  // --- ÉTATS : COLONNE 1 (INPUT) ---
  const [selectedClient, setSelectedClient] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ÉTATS : COLONNE 2 (CERVEAU / ANGLES) ---
  const [selectedAngle, setSelectedAngle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const angles = [
    { id: 'promo', title: 'Angle Promo Flash (Urgence)', icon: Zap, desc: 'Créer un sentiment de rareté immédiate.' },
    { id: 'social', title: 'Angle Preuve Sociale (Avis Client)', icon: Users, desc: 'Axé sur les témoignages et la confiance.' },
    { id: 'humour', title: 'Angle Street / Humour local', icon: MessageSquare, desc: 'Ton décalé, références culturelles (Sénégal).' },
    { id: 'benefice', title: 'Angle Bénéfice Direct', icon: Target, desc: 'Focus clair et net sur la solution au problème.' }
  ];

  // --- ÉTATS : COLONNE 3 (OUTPUT) ---
  const [generatedScript, setGeneratedScript] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');

  // ==========================================
  // FONCTIONS PRÉPARÉES POUR LE BRANCHEMENT API
  // ==========================================

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      // TODO: Brancher l'upload vers Supabase Storage ici plus tard
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      // TODO: Brancher l'upload vers Supabase Storage ici plus tard
    }
  };

  const handleGenerate = async () => {
    if (!selectedClient || !productName || !selectedAngle) {
      alert("Veuillez sélectionner un client, un produit et un angle marketing.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // TODO: Brancher l'appel API OpenAI ici.
      // const response = await fetch('/api/openai/generate', { ... })
      // const data = await response.json()
      // setGeneratedScript(data.script)
      // setGeneratedCaption(data.caption)

      // Simulation du temps de chargement pour l'UI
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error("Erreur de génération :", error);
      alert("Erreur lors de la communication avec l'IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    // TODO: Ajouter un petit toast UI "Copié"
  };

  const handleApproveAndSchedule = async () => {
    if (!generatedScript && !generatedCaption) return;
    
    // TODO: Enregistrer dans la base de données (table: actions_ia ou calendar_events)
    // await supabase.from('calendar_events').insert([...])
    
    alert("Contenu approuvé et planifié dans le calendrier !");
  };

  // ==========================================
  // UI RENDU
  // ==========================================
  return (
    <div className="animate-in fade-in duration-500 max-w-[1800px] mx-auto h-full flex flex-col relative z-10">
      
      {/* HEADER */}
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
          <Wand2 className="text-[#39FF14]" size={32} /> Mixeur IA
        </h1>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2">
          Générateur de Scripts Vidéos & Captions Réseaux Sociaux
        </p>
      </div>

      {/* 3 COLONNES LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
        
        {/* --- COLONNE 1 : INPUT (LA MATIÈRE PREMIÈRE) --- */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 bg-[#0a0a0a] border border-zinc-800/80 p-6 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-2 border-b border-zinc-800/50 pb-4">
             <Database size={16} className="text-zinc-500"/>
             <h2 className="text-xs font-black uppercase text-zinc-400 tracking-widest">1. Données Brutes</h2>
          </div>

          <div className="relative">
             <select 
               value={selectedClient} 
               onChange={(e) => setSelectedClient(e.target.value)}
               className="w-full bg-[#050505] border border-zinc-800 text-white text-sm font-bold uppercase p-4 rounded-xl appearance-none outline-none focus:border-[#39FF14] transition-colors cursor-pointer"
             >
               <option value="" disabled>Sélectionner le Client</option>
               {/* Les options seront chargées depuis la base de données */}
             </select>
             <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          <div 
             onDragOver={handleDragOver}
             onDrop={handleDrop}
             onClick={() => fileInputRef.current?.click()}
             className="w-full h-40 bg-[#050505] border-2 border-dashed border-zinc-800 hover:border-[#39FF14]/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden"
          >
             {imagePreview ? (
               <img src={imagePreview} alt="Aperçu" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
             ) : (
               <>
                  <UploadCloud size={28} className="text-zinc-600 group-hover:text-[#39FF14] mb-2 transition-colors" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center px-4">Importer la photo brute du produit<br/>(Glisser-déposer)</p>
               </>
             )}
             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="space-y-4">
             <div className="relative">
                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="Nom du Produit / Offre" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 text-white text-sm font-bold p-4 pl-12 rounded-xl outline-none focus:border-[#39FF14] transition-colors"
                />
             </div>
             <div className="relative">
                <Zap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="Prix / Offre spéciale (ex: 15.000 F)" 
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 text-white text-sm font-bold p-4 pl-12 rounded-xl outline-none focus:border-[#39FF14] transition-colors"
                />
             </div>
             <div className="relative">
                <Target size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="Cible (ex: Étudiants, Mamans...)" 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 text-white text-sm font-bold p-4 pl-12 rounded-xl outline-none focus:border-[#39FF14] transition-colors"
                />
             </div>
          </div>
        </div>

        {/* --- COLONNE 2 : LE CERVEAU (ANGLES) --- */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 bg-[#0a0a0a] border border-zinc-800/80 p-6 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar relative">
          <div className="flex items-center gap-2 mb-2 border-b border-zinc-800/50 pb-4">
             <Sparkles size={16} className="text-zinc-500"/>
             <h2 className="text-xs font-black uppercase text-zinc-400 tracking-widest">2. Stratégie & Angle</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-1">
             {angles.map(angle => (
                <button 
                  key={angle.id}
                  onClick={() => setSelectedAngle(angle.id)}
                  className={`p-4 rounded-xl border flex flex-col items-start gap-2 transition-all text-left group ${
                    selectedAngle === angle.id 
                    ? 'bg-[#39FF14]/10 border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.15)]' 
                    : 'bg-[#050505] border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                   <div className="flex items-center gap-3 w-full">
                      <angle.icon size={18} className={selectedAngle === angle.id ? 'text-[#39FF14]' : 'text-zinc-500 group-hover:text-zinc-300'} />
                      <span className={`text-xs font-black uppercase tracking-wider ${selectedAngle === angle.id ? 'text-[#39FF14]' : 'text-zinc-300'}`}>{angle.title}</span>
                   </div>
                   <p className="text-[10px] text-zinc-500 font-bold mt-1 pl-7 leading-relaxed">{angle.desc}</p>
                </button>
             ))}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-[#39FF14] text-black py-5 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:bg-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 mt-auto shrink-0"
          >
            {isGenerating ? (
               <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <><Sparkles size={18} className="animate-pulse" /> Lancer la Génération IA</>
            )}
          </button>
        </div>

        {/* --- COLONNE 3 : OUTPUT (LE RÉSULTAT) --- */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 bg-[#0a0a0a] border border-zinc-800/80 p-6 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-2 border-b border-zinc-800/50 pb-4">
             <FileText size={16} className="text-zinc-500"/>
             <h2 className="text-xs font-black uppercase text-zinc-400 tracking-widest">3. Résultat Brut</h2>
          </div>

          <div className="flex flex-col gap-2 flex-1">
             <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Script Vidéo (Voice-over / Texte écran)</label>
                <button onClick={() => handleCopyToClipboard(generatedScript)} className="text-zinc-500 hover:text-[#39FF14] p-1"><Copy size={14}/></button>
             </div>
             <textarea 
               value={generatedScript}
               onChange={(e) => setGeneratedScript(e.target.value)}
               placeholder="// En attente de génération OpenAI..."
               className="w-full flex-1 min-h-[150px] bg-[#050505] border border-zinc-800 text-[#39FF14] p-4 rounded-xl font-mono text-xs outline-none focus:border-[#39FF14]/50 transition-colors resize-none custom-scrollbar"
               spellCheck={false}
             />
          </div>

          <div className="flex flex-col gap-2 h-48 shrink-0">
             <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Légende Réseaux Sociaux (Caption)</label>
                <button onClick={() => handleCopyToClipboard(generatedCaption)} className="text-zinc-500 hover:text-white p-1"><Copy size={14}/></button>
             </div>
             <textarea 
               value={generatedCaption}
               onChange={(e) => setGeneratedCaption(e.target.value)}
               placeholder="Légende Instagram / Facebook avec hashtags..."
               className="w-full h-full bg-[#050505] border border-zinc-800 text-zinc-300 p-4 rounded-xl text-sm outline-none focus:border-zinc-500 transition-colors resize-none custom-scrollbar"
             />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto shrink-0 pt-4 border-t border-zinc-800/50">
             <button 
               onClick={handleGenerate}
               disabled={isGenerating || (!generatedScript && !generatedCaption)}
               className="bg-zinc-900 border border-zinc-800 text-zinc-400 py-3 rounded-xl font-black uppercase text-[10px] hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
             >
                <RefreshCcw size={14} /> Refaire
             </button>
             <button 
               onClick={handleApproveAndSchedule}
               disabled={!generatedScript && !generatedCaption}
               className="bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] hover:bg-[#39FF14] transition-colors disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg"
             >
                <CheckCircle size={14} /> Approuver
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}