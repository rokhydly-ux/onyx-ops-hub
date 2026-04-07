"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Smartphone, 
  UploadCloud, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  User, 
  Zap,
  ArrowRight,
  Phone,
  Package,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Tesseract from 'tesseract.js';

export default function OCRCapturePage() {
  const router = useRouter();
  
  // États
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: ''
  });
  const [assignee, setAssignee] = useState('Non assigné');
  const [assignees, setAssignees] = useState<{name: string}[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAssignees = async () => {
      const { data } = await supabase.from('commercials').select('full_name');
      if (data && data.length > 0) {
        setAssignees(data.map((d: any) => ({ name: d.full_name })));
        setAssignee(data[0].full_name);
      }
    };
    fetchAssignees();
  }, []);

  // Gérer le Collage (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              handleFile(blob);
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste as any);
    return () => window.removeEventListener('paste', handlePaste as any);
  }, []);

  // Glisser-Déposer
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        handleFile(droppedFile);
      }
    }
  };

  // Gérer le fichier sélectionné
  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setAnalysisComplete(false);
  };

  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
    setFormData({ name: '', phone: '', product: '' });
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    
    try {
      // Lancement de l'OCR réel avec Tesseract.js
      const result = await Tesseract.recognize(
        file,
        'fra' // Modèle de langage français
      );
      
      const text = result.data.text;
      
      // Extraction avec expressions régulières (Regex)
      const phoneMatch = text.match(/(?:(?:\+|00)\d{1,4}[\s.-]*)?(?:\(0\)[\s.-]*)?(?:\d[\s.-]*){8,14}\d/);
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const potentialName = lines.length > 0 ? lines[0].trim() : 'Client Extrait (OCR)';

      setFormData({
        name: potentialName.substring(0, 30),
        phone: phoneMatch ? phoneMatch[0].replace(/[\s.-]/g, '') : '',
        product: 'À définir (Extrait OCR)'
      });
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Erreur OCR :', error);
      alert("Une erreur est survenue lors de l'analyse de l'image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase.from('leads').insert([{
        full_name: formData.name,
        phone: formData.phone,
        intent: formData.product,
        source: 'Capture WhatsApp (OCR)',
        status: 'Nouveau',
        assigned_to: assignee
      }]);

      if (error) throw error;

      alert('Lead ajouté avec succès au pipeline !');
      router.push('/crm/leads');
    } catch (error: any) {
      alert('Erreur lors de l\'ajout du lead : ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#39FF14]/10 text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-[#39FF14]/20">
          <Zap size={14} className="fill-[#39FF14]" /> OnyxOCR AI
        </div>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">Capture <span className="text-[#39FF14]">Rapide</span></h2>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Transformez une capture d'écran WhatsApp en Lead instantanément.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* COLONNE GAUCHE : ZONE IMAGE / DROP */}
        <div className="flex flex-col gap-4">
          {!imagePreview ? (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="bg-white dark:bg-zinc-950 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#39FF14] dark:hover:border-[#39FF14] rounded-[2.5rem] h-[400px] flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors group shadow-sm"
            >
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={32} className="text-zinc-400 group-hover:text-[#39FF14] transition-colors" />
              </div>
              <h3 className="font-black text-xl mb-2 text-black dark:text-white">Glisser-déposer une capture</h3>
              <p className="text-sm font-bold text-zinc-500 mb-6">ou faire Ctrl+V / Coller l'image ici</p>
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest group-hover:bg-[#39FF14] group-hover:text-black transition-colors">
                Parcourir mes fichiers
              </span>
              <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={(e) => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); }} />
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-4 shadow-sm relative overflow-hidden flex flex-col h-[400px]">
               <button onClick={handleReset} className="absolute top-6 right-6 bg-black/60 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors z-10">
                 <X size={16} />
               </button>
               <div className="flex-1 rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative flex items-center justify-center">
                 <img src={imagePreview} alt="Capture WhatsApp" className={`w-full h-full object-contain ${isAnalyzing ? 'opacity-30 grayscale' : 'opacity-100'} transition-all duration-500`} />
                 
                 {/* OVERLAY ANALYSE */}
                 {isAnalyzing && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                     <Loader2 size={48} className="text-[#39FF14] animate-spin mb-4" />
                     <p className="font-black uppercase tracking-widest text-[#39FF14] bg-black/80 px-4 py-2 rounded-full animate-pulse shadow-[0_0_20px_rgba(57,255,20,0.3)]">Extraction en cours...</p>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : ACTIONS & FORMULAIRE */}
        <div className="flex flex-col justify-center">
           {!analysisComplete ? (
             <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 text-zinc-400">
                  <ImageIcon size={24} />
                </div>
                <h3 className="font-black text-xl mb-3">En attente d'analyse</h3>
                <p className="text-sm font-medium text-zinc-500 mb-8 max-w-sm">Importez une capture de votre discussion WhatsApp pour que l'IA détecte automatiquement le prospect.</p>
                <button 
                  onClick={startAnalysis}
                  disabled={!file || isAnalyzing}
                  className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_15px_30px_rgba(57,255,20,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isAnalyzing ? 'Analyse...' : 'Lancer l\'analyse OnyxOCR'}
                </button>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm animate-in slide-in-from-right-8 duration-500">
                <h3 className="font-black text-2xl uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <CheckCircle className="text-[#39FF14]" size={24} /> Lead Détecté
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm outline-none focus:border-[#39FF14] transition-colors" placeholder="Nom ou Pseudo" required />
                  </div>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm outline-none focus:border-[#39FF14] transition-colors" placeholder="Numéro WhatsApp" required />
                  </div>
                  <div className="relative">
                    <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="text" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm outline-none focus:border-[#39FF14] transition-colors" placeholder="Produit d'intérêt" />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block">Assigner automatiquement à</label>
                  <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm uppercase outline-none focus:border-[#39FF14] cursor-pointer appearance-none">
                    <option value="Non assigné">Non assigné</option>
                    {assignees.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_15px_30px_rgba(57,255,20,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  Valider & Ajouter au Pipeline
                </button>
             </form>
           )}
        </div>
      </div>

    </div>
  );
}