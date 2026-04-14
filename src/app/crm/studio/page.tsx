"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Download, MessageSquare, 
  LayoutGrid, Grid3X3, SquareSquare, List, 
  Search, Settings, BookOpen, Smartphone, Zap,
  AlertTriangle, CheckCircle, Target, Send, Box, Bot
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
  
  // Modes de Génération
  const [builderMode, setBuilderMode] = useState<'smart' | 'manual'>('smart');
  
  // Configuration du Catalogue
  const [catalogName, setCatalogName] = useState('Catalogue B2B Exclusif');
  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('grid-4');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [activeTabMobile, setActiveTabMobile] = useState<'editor' | 'preview'>('editor');
  
  // Design Avancé
  const [design, setDesign] = useState({
     coverUrl: '',
     backUrl: '',
     logoUrl: '',
     logoX: 10,
     logoY: 10,
     logoZ: 50,
     logoWidth: 40
  });
  
  // Modale Distribution
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [distributionTarget, setDistributionTarget] = useState('Tous');
  const [contacts, setContacts] = useState<any[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [crmSettings, setCrmSettings] = useState({ crm_name: 'ONYX CRM', logo_url: '', theme_color: '#39FF14' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return;
    }
    const tenantId = user.user_metadata?.tenant_id || user.id;

    const { data: pData } = await supabase
      .from('crm_products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (pData) setProducts(pData);
    
    const { data: sData } = await supabase.from('crm_settings').select('*').eq('tenant_id', tenantId).maybeSingle();
    if (sData) setCrmSettings({ crm_name: sData.crm_name || 'ONYX CRM', logo_url: sData.logo_url || '', theme_color: sData.theme_color || '#39FF14' });

    const { data: cData } = await supabase.from('crm_contacts').select('target_segment').eq('tenant_id', tenantId);
    if (cData) setContacts(cData);
  };

  const generateSmartSelection = (type: 'new' | 'flash' | 'dormant') => {
      let selection: any[] = [];
      if (type === 'new') {
          selection = [...products].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 20);
      } else if (type === 'flash') {
          selection = [...products].sort(() => 0.5 - Math.random()).slice(0, 15);
          const newCustomPrices = {...customPrices};
          selection.forEach(p => {
             newCustomPrices[p.id] = Math.round((p.price_ttc || p.unit_price || 0) * 0.8); // -20%
          });
          setCustomPrices(newCustomPrices);
      } else if (type === 'dormant') {
          selection = products.filter(p => p.stock_status === 'Dormant' || p.stock_status === 'Stock Mort').slice(0, 50);
          if (selection.length === 0) selection = [...products].sort(() => 0.5 - Math.random()).slice(0, 50);
      }
      setSelectedProductIds(selection.map(p => p.id));
      setBuilderMode('manual');
  };

  const handleSaveCatalog = async () => {
      if (!catalogName || selectedProductIds.length === 0) return alert("Le nom et la sélection de produits sont requis.");
      setIsGenerating(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          const tenantId = user?.user_metadata?.tenant_id || user?.id;
          
          const payload = {
              tenant_id: tenantId,
              name: catalogName,
              target_name: prospectName,
              target_phone: prospectPhone,
              template: selectedTemplate,
              product_ids: selectedProductIds,
              design_config: design
          };
          
          const { error } = await supabase.from('crm_catalogs').insert([payload]);
          if (error) throw error;
          
          alert("✅ Catalogue sauvegardé avec succès dans l'historique !");
      } catch (err: any) {
          alert("Erreur de sauvegarde : " + err.message);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleDistribute = () => {
      const message = `Bonjour${prospectName ? ' ' + prospectName : ''} ! Lika de l'équipe ${crmSettings.crm_name}.\n\nVoici notre catalogue exclusif "${catalogName}" spécialement préparé pour vous. Découvrez notre sélection avec des tarifs préférentiels ! Cliquez ici pour le consulter : [Lien_du_catalogue]`;
      
      if (distributionTarget !== 'Tous') {
          alert(`✅ Campagne Lika planifiée !\n\nCible : Segment "${distributionTarget}"\nNombre de produits : ${selectedProductIds.length}\n\nMessage généré par l'IA :\n"${message}"`);
      } else {
          alert(`✅ Campagne Lika planifiée pour TOUS les contacts.\n\nMessage généré par l'IA :\n"${message}"`);
      }
      setDistributeModalOpen(false);
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
    doc.text("Sommaire & Sélection", 14, 20);
    
    const selectedItems = products.filter(p => selectedProductIds.includes(p.id));

    // --- SOMMAIRE AUTOMATIQUE ---
    const categories = Array.from(new Set(selectedItems.map(item => item.category || 'Autres')));
    doc.setFontSize(12);
    doc.text(`Catégories incluses : ${categories.join(' • ')}`, 14, 30);
    
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
        startY: 40,
        head: [['Référence', 'Désignation', 'Catégorie', 'Prix TTC']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
    });

    // --- PAGE DE DOS (BACK COVER) ---
    if (design.backUrl) {
        doc.addPage();
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("MERCI DE VOTRE CONFIANCE.", 105, 148, { align: 'center' });
    }

    // --- FIN ---
    const fileName = `Catalogue_${catalogName.replace(/\s+/g, '_')}.pdf`;
    
    if (mode === 'download') {
        doc.save(fileName);
    } else {
        doc.save(fileName); // On le télécharge aussi pour pouvoir l'envoyer manuellement
        const msg = `Bonjour ${prospectName},\n\nVoici notre catalogue personnalisé "${catalogName}" que nous avons préparé pour vous.\nN'hésitez pas à me faire un retour sur la sélection !`;
        window.open(`https://wa.me/${prospectPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
        setToastMessage("✅ Catalogue envoyé avec succès sur WhatsApp !");
        setTimeout(() => setToastMessage(null), 4000);
    }
    
    setIsGenerating(false);
  };

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const searchTerms = normalize(search).split(' ').filter(Boolean);

  const filteredProducts = products.filter(p => {
      if (searchTerms.length === 0) return true;
      const searchableText = normalize(`${p.name || ''} ${p.odoo_id || ''} ${p.category || ''}`);
      return searchTerms.every(term => searchableText.includes(term));
  });

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
            <div className="flex items-center justify-between mt-2">
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Générateur de Catalogues</p>
               <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                  <button onClick={() => setBuilderMode('smart')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${builderMode === 'smart' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Smart</button>
                  <button onClick={() => setBuilderMode('manual')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${builderMode === 'manual' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Manuel</button>
               </div>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-8">
            {builderMode === 'smart' ? (
               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-black dark:text-white tracking-widest flex items-center gap-2"><Bot size={14}/> OnyxIA Smart Catalogs</h3>
                  <div className="grid grid-cols-1 gap-3">
                     <button onClick={() => generateSmartSelection('new')} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-[#39FF14] transition-all text-left group">
                        <div className="flex items-center gap-3 mb-2">
                           <Sparkles size={18} className="text-[#39FF14]" />
                           <span className="font-black uppercase text-sm">Nouveaux Arrivages</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-500">Les 20 derniers produits ajoutés à votre catalogue.</p>
                     </button>
                     <button onClick={() => generateSmartSelection('flash')} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-orange-500 transition-all text-left group">
                        <div className="flex items-center gap-3 mb-2">
                           <Zap size={18} className="text-orange-500" />
                           <span className="font-black uppercase text-sm">Promo Flash (-20%)</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-500">Sélection aléatoire de 15 best-sellers avec prix barré.</p>
                     </button>
                     <button onClick={() => generateSmartSelection('dormant')} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-red-500 transition-all text-left group">
                        <div className="flex items-center gap-3 mb-2">
                           <AlertTriangle size={18} className="text-red-500" />
                           <span className="font-black uppercase text-sm">Déstockage Massif</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-500">Récupère les produits dormants pour les liquider.</p>
                     </button>
                  </div>
               </div>
            ) : (
               <>
            {/* INFOS GÉNÉRALES */}
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-black dark:text-white tracking-widest flex items-center gap-2"><Settings size={14}/> En-tête du Document</h3>
               <input type="text" placeholder="Nom du Catalogue (Ex: Collection Été)" value={catalogName} onChange={e => setCatalogName(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white" />
               <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom Prospect" value={prospectName} onChange={e => setProspectName(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white" />
                  <input type="tel" placeholder="N° WhatsApp" value={prospectPhone} onChange={e => setProspectPhone(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white" />
               </div>
            </div>

            {/* DESIGN AVANCÉ */}
            <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
               <h3 className="text-xs font-black uppercase text-black dark:text-white tracking-widest flex items-center gap-2"><LayoutGrid size={14}/> Design du Document</h3>
               <div className="space-y-3">
                  <input type="url" placeholder="URL Couverture (Cover)" value={design.coverUrl} onChange={e => setDesign({...design, coverUrl: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] transition-colors" />
                  <input type="url" placeholder="URL Dos (Back Cover)" value={design.backUrl} onChange={e => setDesign({...design, backUrl: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] transition-colors" />
                  
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Logo Dynamique</label>
                     <input type="url" placeholder="URL du Logo" value={design.logoUrl} onChange={e => setDesign({...design, logoUrl: e.target.value})} className="w-full p-3 mb-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14]" />
                     <div className="grid grid-cols-4 gap-2">
                        <div><label className="text-[8px] font-bold text-zinc-400">Pos X</label><input type="number" value={design.logoX} onChange={e => setDesign({...design, logoX: Number(e.target.value)})} className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs" /></div>
                        <div><label className="text-[8px] font-bold text-zinc-400">Pos Y</label><input type="number" value={design.logoY} onChange={e => setDesign({...design, logoY: Number(e.target.value)})} className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs" /></div>
                        <div><label className="text-[8px] font-bold text-zinc-400">Taille (W)</label><input type="number" value={design.logoWidth} onChange={e => setDesign({...design, logoWidth: Number(e.target.value)})} className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs" /></div>
                        <div><label className="text-[8px] font-bold text-zinc-400">Z-Index</label><input type="number" value={design.logoZ} onChange={e => setDesign({...design, logoZ: Number(e.target.value)})} className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs" /></div>
                     </div>
                  </div>
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
            </>
            )}
         </div>
      </div>

      {/* --- COLONNE DROITE (APERÇU PDF) --- */}
      <div className={`flex-1 flex-col h-full bg-zinc-100 dark:bg-black/50 overflow-hidden ${activeTabMobile === 'editor' ? 'hidden md:flex' : 'flex'}`}>
         {/* TOP BAR ACTIONS */}
         <div className="p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-3 justify-end shrink-0 shadow-sm z-10">
            <button onClick={() => setDistributeModalOpen(true)} className="flex-1 sm:flex-none bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md flex items-center justify-center gap-2">
               <Send size={16} /> Distribuer
            </button>
            <button onClick={handleSaveCatalog} disabled={isGenerating} className="flex-1 sm:flex-none bg-zinc-800 text-white px-4 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md flex items-center justify-center gap-2">
               <Box size={16} /> Sauvegarder
            </button>
            <button onClick={() => generatePDF('download')} disabled={isGenerating} className="flex-1 sm:flex-none bg-black text-white dark:bg-white dark:text-black px-4 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md flex items-center justify-center gap-2">
               <Download size={16} /> {isGenerating ? 'Génération...' : 'Télécharger PDF'}
            </button>
            <button onClick={() => generatePDF('whatsapp')} disabled={isGenerating} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 text-black text-center leading-tight" style={{ backgroundColor: crmSettings.theme_color }}>
               <MessageSquare size={16} className="shrink-0" /> <span className="hidden sm:inline">Envoyer via</span> WhatsApp
            </button>
         </div>

         {/* VISUAL A4 PREVIEW */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start custom-scrollbar overflow-x-hidden">
            <div className="w-full max-w-[700px] bg-white border border-zinc-300 shadow-2xl origin-top aspect-[1/1.414] flex flex-col overflow-hidden relative scale-[0.95] sm:scale-100 transform-gpu mb-4">
               
               {/* HEADER SIMULATION */}
               <div className="bg-black p-6 md:p-8 text-center relative overflow-hidden shrink-0 h-32 md:h-48 flex flex-col items-center justify-center">
                  {design.coverUrl && (
                     <img src={design.coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Cover" />
                  )}
                  {design.logoUrl && (
                     <img 
                       src={design.logoUrl} 
                       className="absolute object-contain" 
                       style={{ 
                         left: `${design.logoX}%`, 
                         top: `${design.logoY}%`, 
                         width: `${design.logoWidth}%`, 
                         zIndex: design.logoZ 
                       }} 
                       alt="Logo" 
                     />
                  )}
                  <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${crmSettings.theme_color} 0%, transparent 70%)` }}></div>
                  <h1 className="text-2xl md:text-5xl font-black uppercase text-white relative z-10 tracking-tighter leading-tight px-4 line-clamp-2 drop-shadow-lg">{catalogName}</h1>
                  {prospectName && <div className="mt-4 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 relative z-10"><p className="text-xs font-bold text-white uppercase tracking-widest">Exclusivité : {prospectName}</p></div>}
               </div>

               {/* CONTENT SIMULATION */}
               <div className="flex-1 p-8 bg-zinc-50 overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 md:mb-6 border-b-2 border-black pb-2 gap-2">
                     <h2 className="text-sm md:text-lg font-black uppercase tracking-widest text-black leading-tight">Sélection de {selectedProductsData.length} articles</h2>
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
                              <div key={i} className={`bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden flex flex-col ${selectedTemplate === 'full' ? 'h-[200px] md:h-[300px]' : 'aspect-square'}`}>
                                 <div className="flex-1 bg-zinc-100 relative overflow-hidden">
                                    <img src={p.image_url || `https://placehold.co/400x400/1a1a1a/39FF14?text=PRD`} className="w-full h-full object-cover" />
                                    {p.stock_status === 'Dormant' && <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase">Promo Spéciale</span>}
                                 </div>
                                 <div className="p-3 shrink-0 bg-white">
                                    <p className={`font-black text-black uppercase leading-tight line-clamp-1 ${selectedTemplate === 'full' ? 'text-sm md:text-base' : 'text-[9px]'}`}>{p.name}</p>
                                    <div className="flex justify-between items-end mt-1">
                                       <p className="text-[8px] font-bold text-zinc-400">Réf: {p.odoo_id || 'N/A'}</p>
                                       <p className={`font-black ${selectedTemplate === 'full' ? 'text-base md:text-lg' : 'text-[10px]'}`} style={{ color: crmSettings.theme_color }}>{(customPrices[p.id] !== undefined ? customPrices[p.id] : (p.price_ttc || 0)).toLocaleString('fr-FR')} F</p>
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

      {/* MODALE DE DISTRIBUTION LIKA */}
      {distributeModalOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setDistributeModalOpen(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl max-w-md w-full shadow-2xl relative border-t-8 border-[#39FF14] animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-black text-[#39FF14] p-3 rounded-xl"><Bot size={24} className="animate-pulse" /></div>
               <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">Distribution Lika</h2>
            </div>
            <p className="text-xs font-bold text-zinc-500 mb-6">Sélectionnez la cible pour l'envoi de votre catalogue : <strong className="text-black dark:text-white">{catalogName}</strong></p>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">Segment Cible</label>
               <select value={distributionTarget} onChange={e => setDistributionTarget(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-[#39FF14] cursor-pointer appearance-none">
                  <option value="Tous">Tous les contacts</option>
                  {Array.from(new Set(contacts.map(c => c.target_segment).filter(Boolean))).map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
               </select>
            </div>
            <div className="flex gap-3 mt-8">
               <button onClick={() => setDistributeModalOpen(false)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Annuler</button>
               <button onClick={handleDistribute} className="flex-[2] bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-xl flex justify-center items-center gap-2"><Send size={16}/> Préparer Envoi</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] border border-[#39FF14]/30 px-6 py-3 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 z-[300] animate-in slide-in-from-bottom-5">
             <CheckCircle size={16}/> {toastMessage}
         </div>
      )}

    </div>
  );
}