"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Download, MessageSquare, 
  LayoutGrid, Grid3X3, SquareSquare, List, 
  Search, Settings, BookOpen, Smartphone
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TEMPLATES = [
  { id: 'grid-4', name: 'Grille 4 (Standard)', icon: LayoutGrid },
  { id: 'grid-6', name: 'Grille 6 (Dense)', icon: Grid3X3 },
  { id: 'full', name: 'Pleine Page (Focus)', icon: SquareSquare },
  { id: 'list', name: 'Liste Minimaliste', icon: List }
];

export default function PDFStudioPage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Configuration du Catalogue
  const [catalogName, setCatalogName] = useState('Catalogue B2B Exclusif');
  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('grid-4');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [activeTabMobile, setActiveTabMobile] = useState<'editor' | 'preview'>('editor');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [crmSettings, setCrmSettings] = useState({ crm_name: 'ONYX CRM', logo_url: '', theme_color: '#39FF14' });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: pData } = await supabase.from('crm_products').select('*').order('created_at', { ascending: false });
    if (pData) setProducts(pData);
    
    const { data: sData } = await supabase.from('crm_settings').select('*').eq('id', 1).single();
    if (sData) setCrmSettings({ crm_name: sData.crm_name || 'ONYX CRM', logo_url: sData.logo_url || '', theme_color: sData.theme_color || '#39FF14' });
  };

  const suggestDormantStock = () => {
    const dormantProducts = products.filter(p => p.stock_status === 'Dormant' || p.stock_quantity > 20);
    if (dormantProducts.length === 0) return alert("Aucun stock dormant détecté par l'IA.");
    
    const newSelection = new Set([...selectedProductIds, ...dormantProducts.map(p => p.id)]);
    setSelectedProductIds(Array.from(newSelection));
    alert(`OnyxIA a ajouté ${dormantProducts.length} article(s) dormant(s) à votre sélection pour les pousser !`);
  };

  const generatePDF = (mode: 'download' | 'whatsapp') => {
    if (selectedProductIds.length === 0) return alert("Veuillez sélectionner au moins un produit.");
    if (mode === 'whatsapp' && !prospectPhone) return alert("Numéro de téléphone requis pour l'envoi WhatsApp.");
    
    setIsGenerating(true);
    const doc = new jsPDF();
    
    // --- PAGE DE COUVERTURE ---
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(40);
    doc.text(catalogName.toUpperCase(), 105, 100, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(`Préparé spécialement pour : ${prospectName || 'Notre Client Privilégié'}`, 105, 130, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')} | Par : ${crmSettings.crm_name}`, 105, 150, { align: 'center' });

    // --- PAGE SOMMAIRE / PRODUITS ---
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text("Sélection de Produits", 14, 20);
    
    const selectedItems = products.filter(p => selectedProductIds.includes(p.id));
    
    const tableBody = selectedItems.map(item => {
        const itemPrice = customPrices[item.id] !== undefined ? customPrices[item.id] : (item.price_ttc || 0);
        return [
            item.odoo_id || '-',
            item.name,
            item.category || '-',
            `${itemPrice.toLocaleString('fr-FR')} F`
        ];
    });

    autoTable(doc, {
        startY: 30,
        head: [['Référence', 'Désignation', 'Catégorie', 'Prix TTC']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
    });

    // --- FIN ---
    const fileName = `Catalogue_${catalogName.replace(/\s+/g, '_')}.pdf`;
    
    if (mode === 'download') {
        doc.save(fileName);
    } else {
        doc.save(fileName); // On le télécharge aussi pour pouvoir l'envoyer manuellement
        const msg = `Bonjour ${prospectName},\n\nVoici notre catalogue personnalisé "${catalogName}" que nous avons préparé pour vous.\nN'hésitez pas à me faire un retour sur la sélection !`;
        window.open(`https://wa.me/${prospectPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    
    setIsGenerating(false);
  };

  const filteredProducts = products.filter(p => 
      (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (p.odoo_id || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedProductsData = products.filter(p => selectedProductIds.includes(p.id));

  if (!mounted) return null;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] w-full relative bg-zinc-50 dark:bg-zinc-950 max-w-[1800px] mx-auto">
      
      {/* TABS MOBILE */}
      <div className="md:hidden flex bg-white dark:bg-zinc-900 p-2 shrink-0 border-b border-zinc-200 dark:border-zinc-800">
         <button onClick={() => setActiveTabMobile('editor')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTabMobile === 'editor' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>1. Éditeur</button>
         <button onClick={() => setActiveTabMobile('preview')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTabMobile === 'preview' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>2. Aperçu PDF</button>
      </div>

      {/* --- COLONNE GAUCHE (ÉDITEUR) --- */}
      <div className={`w-full md:w-[450px] lg:w-[500px] xl:w-[600px] shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full overflow-hidden ${activeTabMobile === 'preview' ? 'hidden md:flex' : 'flex'}`}>
         <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-2 mb-1">
               <BookOpen style={{ color: crmSettings.theme_color }} /> Studio PDF
            </h2>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Générateur de Catalogues Interactif</p>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-8">
            {/* INFOS GÉNÉRALES */}
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-black dark:text-white tracking-widest flex items-center gap-2"><Settings size={14}/> En-tête du Document</h3>
               <input type="text" placeholder="Nom du Catalogue (Ex: Collection Été)" value={catalogName} onChange={e => setCatalogName(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white" />
               <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom Prospect" value={prospectName} onChange={e => setProspectName(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white" />
                  <input type="tel" placeholder="N° WhatsApp" value={prospectPhone} onChange={e => setProspectPhone(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white" />
               </div>
            </div>

            {/* LAYOUTS */}
            <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
               <h3 className="text-xs font-black uppercase text-black dark:text-white tracking-widest">Choix du Template</h3>
               <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map(tpl => (
                     <button 
                       key={tpl.id} 
                       onClick={() => setSelectedTemplate(tpl.id)}
                       className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${selectedTemplate === tpl.id ? 'bg-black text-[#39FF14] border-black shadow-lg scale-105' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-black dark:hover:border-white'}`}
                     >
                        <tpl.icon size={24} />
                        <span className="text-[10px] font-black uppercase text-center leading-tight">{tpl.name}</span>
                     </button>
                  ))}
               </div>
            </div>

            {/* IA SUGGESTION */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
               <button onClick={suggestDormantStock} className="w-full bg-black border border-[#39FF14]/30 text-[#39FF14] p-4 rounded-xl flex items-center justify-between group hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-[#39FF14]/10 rounded-lg"><Sparkles size={18} className="animate-pulse" /></div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest">OnyxIA Stratégie</p>
                        <p className="text-xs font-bold text-white mt-0.5 group-hover:text-[#39FF14] transition-colors">Suggérer Stocks Dormants</p>
                     </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping"></div>
               </button>
            </div>

            {/* SELECTION PRODUITS */}
            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-black dark:text-white tracking-widest">Catalogue ({selectedProductIds.length} inclus)</h3>
                  <button onClick={() => setSelectedProductIds([])} className="text-[10px] font-bold text-red-500 hover:underline">Vider</button>
               </div>
               
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="text" placeholder="Rechercher pour ajouter..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white" />
               </div>

               <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {filteredProducts.map(p => (
                     <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedProductIds.includes(p.id) ? 'bg-[#39FF14]/5 border-[#39FF14]/50' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-white'}`}>
                        <input 
                           type="checkbox" 
                           checked={selectedProductIds.includes(p.id)} 
                           onChange={(e) => {
                              if(e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                              else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                           }}
                           className="w-4 h-4 accent-black dark:accent-[#39FF14] rounded" 
                        />
                        <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0"><img src={p.image_url || `https://placehold.co/100x100/1a1a1a/39FF14?text=PRD`} className="w-full h-full object-cover" /></div>
                        <div className="min-w-0 flex-1 flex justify-between items-center pr-2">
                           <div className="min-w-0">
                             <p className="text-xs font-bold text-black dark:text-white truncate">{p.name}</p>
                             {selectedProductIds.includes(p.id) ? (
                                <div className="flex items-center gap-1 mt-1">
                                   <input 
                                     type="number" 
                                     value={customPrices[p.id] !== undefined ? customPrices[p.id] : (p.price_ttc || 0)}
                                     onChange={(e) => setCustomPrices({...customPrices, [p.id]: Number(e.target.value)})}
                                     onClick={(e) => e.stopPropagation()}
                                     className="w-16 p-1 text-[10px] font-black bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded outline-none focus:border-[#39FF14] text-black dark:text-white transition-colors"
                                   />
                                   <span className="text-[10px] font-black text-zinc-500 uppercase">F</span>
                                </div>
                             ) : (
                                <p className="text-[10px] font-black text-zinc-500 uppercase mt-0.5">{(p.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                             )}
                           </div>
                        </div>
                     </label>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* --- COLONNE DROITE (APERÇU PDF) --- */}
      <div className={`flex-1 flex-col h-full bg-zinc-100 dark:bg-black/50 overflow-hidden ${activeTabMobile === 'editor' ? 'hidden md:flex' : 'flex'}`}>
         {/* TOP BAR ACTIONS */}
         <div className="p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-3 justify-end shrink-0 shadow-sm z-10">
            <button onClick={() => generatePDF('download')} disabled={isGenerating} className="flex-1 sm:flex-none bg-black text-white dark:bg-white dark:text-black px-4 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md flex items-center justify-center gap-2">
               <Download size={16} /> {isGenerating ? 'Génération...' : 'Télécharger PDF'}
            </button>
            <button onClick={() => generatePDF('whatsapp')} disabled={isGenerating} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 text-black" style={{ backgroundColor: crmSettings.theme_color }}>
               <MessageSquare size={16} /> Envoyer via WhatsApp
            </button>
         </div>

         {/* VISUAL A4 PREVIEW */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start custom-scrollbar">
            <div className="w-full max-w-[700px] bg-white border border-zinc-300 shadow-2xl origin-top aspect-[1/1.414] flex flex-col overflow-hidden relative scale-[0.85] sm:scale-100 transform-gpu">
               
               {/* HEADER SIMULATION */}
               <div className="bg-black p-8 text-center relative overflow-hidden shrink-0 h-48 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${crmSettings.theme_color} 0%, transparent 70%)` }}></div>
                  <h1 className="text-3xl md:text-5xl font-black uppercase text-white relative z-10 tracking-tighter leading-tight px-4">{catalogName}</h1>
                  {prospectName && <div className="mt-4 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20"><p className="text-xs font-bold text-white uppercase tracking-widest">Exclusivité : {prospectName}</p></div>}
               </div>

               {/* CONTENT SIMULATION */}
               <div className="flex-1 p-8 bg-zinc-50 overflow-hidden">
                  <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2">
                     <h2 className="text-lg font-black uppercase tracking-widest text-black">Sélection de {selectedProductsData.length} articles</h2>
                     <p className="text-xs font-bold text-zinc-500 uppercase">{new Date().toLocaleDateString('fr-FR')}</p>
                  </div>

                  {selectedProductsData.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                        <Search size={48} className="mb-4 opacity-50"/>
                        <p className="text-sm font-black uppercase tracking-widest">Aperçu Vierge</p>
                        <p className="text-xs font-bold mt-2 text-center max-w-xs">Sélectionnez des produits à gauche pour construire le PDF.</p>
                     </div>
                  ) : (
                     <div className={`grid gap-4 ${
                        selectedTemplate === 'grid-4' ? 'grid-cols-2' : 
                        selectedTemplate === 'grid-6' ? 'grid-cols-3' : 
                        selectedTemplate === 'full' ? 'grid-cols-1' : 'grid-cols-1'
                     }`}>
                        {selectedProductsData.slice(0, selectedTemplate === 'list' ? 10 : 6).map((p, i) => (
                           selectedTemplate === 'list' ? (
                              <div key={i} className="flex justify-between items-center bg-white p-3 border border-zinc-200 shadow-sm rounded-lg">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-100 rounded overflow-hidden"><img src={p.image_url || `https://placehold.co/100x100/1a1a1a/39FF14?text=PRD`} className="w-full h-full object-cover" /></div>
                                    <div>
                                       <p className="text-[10px] font-black uppercase text-black leading-tight line-clamp-1">{p.name}</p>
                                       <p className="text-[8px] font-bold text-zinc-400 mt-0.5">Réf: {p.odoo_id || 'N/A'}</p>
                                    </div>
                                 </div>
                                 <p className="text-xs font-black" style={{ color: crmSettings.theme_color }}>{(customPrices[p.id] !== undefined ? customPrices[p.id] : (p.price_ttc || 0)).toLocaleString('fr-FR')} F</p>
                              </div>
                           ) : (
                              <div key={i} className={`bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden flex flex-col ${selectedTemplate === 'full' ? 'h-[300px]' : 'aspect-square'}`}>
                                 <div className="flex-1 bg-zinc-100 relative overflow-hidden">
                                    <img src={p.image_url || `https://placehold.co/400x400/1a1a1a/39FF14?text=PRD`} className="w-full h-full object-cover" />
                                    {p.stock_status === 'Dormant' && <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase">Promo Spéciale</span>}
                                 </div>
                                 <div className="p-3 shrink-0 bg-white">
                                    <p className={`font-black text-black uppercase leading-tight line-clamp-1 ${selectedTemplate === 'full' ? 'text-base' : 'text-[9px]'}`}>{p.name}</p>
                                    <div className="flex justify-between items-end mt-1">
                                       <p className="text-[8px] font-bold text-zinc-400">Réf: {p.odoo_id || 'N/A'}</p>
                                       <p className={`font-black ${selectedTemplate === 'full' ? 'text-lg' : 'text-[10px]'}`} style={{ color: crmSettings.theme_color }}>{(customPrices[p.id] !== undefined ? customPrices[p.id] : (p.price_ttc || 0)).toLocaleString('fr-FR')} F</p>
                                    </div>
                                 </div>
                              </div>
                           )
                        ))}
                        {selectedProductsData.length > (selectedTemplate === 'list' ? 10 : 6) && (
                           <div className="col-span-full text-center mt-4 text-[10px] font-bold text-zinc-400 italic">
                              ... et {selectedProductsData.length - (selectedTemplate === 'list' ? 10 : 6)} autres articles sur les pages suivantes.
                           </div>
                        )}
                     </div>
                  )}
               </div>

               {/* FOOTER SIMULATION */}
               <div className="bg-black text-center py-4 shrink-0">
                  {crmSettings.logo_url ? (
                     <img src={crmSettings.logo_url} className="h-6 w-auto mx-auto object-contain brightness-0 invert" />
                  ) : (
                     <p className="text-[10px] font-black uppercase text-white tracking-widest">{crmSettings.crm_name}</p>
                  )}
                  <p className="text-[7px] text-zinc-500 font-bold mt-1 uppercase">Généré par OnyxCRM Studio</p>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}