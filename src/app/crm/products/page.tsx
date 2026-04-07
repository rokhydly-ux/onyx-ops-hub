"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCcw, 
  Database, 
  ChevronDown, 
  AlertTriangle,
  Archive,
  Menu,
  X,
  Plus,
  Minus,
  ShoppingCart,
  FileText,
  Send,
  Trash2,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- DONNÉES MOCKÉES POUR LE CATALOGUE B2B ---
const MOCK_PRODUCTS = [
  { id: '1', odooRef: 'REF-001', name: 'Four Mixte Professionnel 10 Niveaux', price: 2500000, category: 'Cuisine Pro', subCategory: 'Fours', stock: 12, status: 'Normal', image: 'https://placehold.co/400x400/1a1a1a/39FF14?text=Four+Pro' },
  { id: '2', odooRef: 'REF-002', name: 'Chambre Froide Positive 10m3', price: 4200000, category: 'Cuisine Pro', subCategory: 'Frigos', stock: 3, status: 'Faible', image: 'https://placehold.co/400x400/1a1a1a/39FF14?text=Chambre+Froide' },
  { id: '3', odooRef: 'REF-003', name: 'Échographe Portable 3D', price: 5800000, category: 'Équipement Médical', subCategory: 'Échographes', stock: 8, status: 'Normal', image: 'https://placehold.co/400x400/1a1a1a/39FF14?text=Echographe' },
  { id: '4', odooRef: 'REF-004', name: 'Grue de levage 50T', price: 45000000, category: 'Matériel BTP', subCategory: 'Grues', stock: 1, status: 'Faible', image: 'https://placehold.co/400x400/1a1a1a/39FF14?text=Grue' },
  { id: '5', odooRef: 'REF-005', name: 'Vitrine Réfrigérée 2m', price: 1100000, category: 'Cuisine Pro', subCategory: 'Frigos', stock: 0, status: 'Dormant', image: 'https://placehold.co/400x400/1a1a1a/39FF14?text=Vitrine' },
  { id: '6', odooRef: 'REF-006', name: 'Bétonnière Thermique 350L', price: 850000, category: 'Matériel BTP', subCategory: 'Outillage', stock: 24, status: 'Normal', image: 'https://placehold.co/400x400/1a1a1a/39FF14?text=Betonniere' },
  { id: '7', odooRef: 'REF-007', name: 'Table de Réanimation', price: 2100000, category: 'Équipement Médical', subCategory: 'Mobilier', stock: 2, status: 'Faible', image: 'https://placehold.co/400x400/1a1a1a/39FF14?text=Table+Rea' },
  { id: '8', odooRef: 'REF-008', name: 'Four à Pizza Double', price: 950000, category: 'Cuisine Pro', subCategory: 'Fours', stock: 5, status: 'Normal', image: 'https://placehold.co/400x400/1a1a1a/39FF14?text=Four+Pizza' },
];

const CATEGORIES = {
  'Toutes': [],
  'Cuisine Pro': ['Fours', 'Frigos', 'Inox'],
  'Équipement Médical': ['Échographes', 'Mobilier', 'Consommables'],
  'Matériel BTP': ['Grues', 'Outillage', 'Véhicules']
};

export default function ProductsCatalogPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États pour le Générateur de Devis
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [quoteDiscount, setQuoteDiscount] = useState<number | ''>('');

  // Filtres
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [priceRange, setPriceRange] = useState(50000000); // Max 50 Millions

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('crm_products').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
        const formatted = data.map(p => ({
            id: p.id,
            odooRef: p.odoo_id || 'N/A',
            name: p.name,
            price: p.price_ttc || 0,
            category: p.category || 'Général',
            subCategory: p.sub_category || '',
            stock: p.stock_quantity || 0,
            status: p.stock_status || 'Normal',
            image: p.image_url || `https://placehold.co/400x400/1a1a1a/39FF14?text=${encodeURIComponent(p.name)}`
        }));
        setProducts(formatted);
    }
  };

  const handleSync = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSyncing(true);
    try {
       const data = await file.arrayBuffer();
       const wb = XLSX.read(data, { type: 'array' });
       const ws = wb.Sheets[wb.SheetNames[0]];
       const jsonData = XLSX.utils.sheet_to_json(ws);
       
       const newProducts = jsonData.map((row: any) => ({
          odoo_id: String(row['Référence'] || row['Ref'] || row['odoo_id'] || ''),
          name: row['Nom'] || row['Désignation'] || row['name'] || 'Article Inconnu',
          category: row['Catégorie'] || row['category'] || 'Général',
          sub_category: row['Sous-Catégorie'] || row['sub_category'] || '',
          price_ttc: Number(row['Prix TTC'] || row['Prix'] || row['price_ttc'] || 0),
          stock_quantity: Number(row['Stock'] || row['stock_quantity'] || 0),
          stock_status: Number(row['Stock'] || row['stock_quantity'] || 0) > 5 ? 'Normal' : Number(row['Stock'] || row['stock_quantity'] || 0) > 0 ? 'Faible' : 'Dormant'
       }));

       if(newProducts.length > 0) {
           const { error } = await supabase.from('crm_products').insert(newProducts);
           if (error) throw error;
           alert(`${newProducts.length} produits importés avec succès !`);
           fetchProducts();
       }
    } catch(err: any) {
       alert("Erreur lors de l'import : " + err.message);
    } finally {
       setIsSyncing(false);
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addToQuote = (product: any) => {
      setQuoteCart(prev => {
          const exists = prev.find(item => item.id === product.id);
          if (exists) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
          return [...prev, { ...product, qty: 1 }];
      });
  };

  const updateQuoteQty = (id: string, delta: number) => {
      setQuoteCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const removeFromQuote = (id: string) => {
      setQuoteCart(prev => prev.filter(item => item.id !== id));
  };

  const generateQuote = () => {
      if (!clientName || !clientPhone) return alert("Veuillez entrer le nom et le téléphone du client.");
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("DEVIS COMMERCIAL", 14, 20);
      doc.setFontSize(12);
      doc.text(`Client : ${clientName}`, 14, 30);
      doc.text(`Téléphone : ${clientPhone}`, 14, 36);
      doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 14, 42);

      const tableBody = quoteCart.map(item => [
          item.odooRef || '-',
          item.name,
          item.qty,
          `${item.price.toLocaleString('fr-FR')} F`,
          `${(item.price * item.qty).toLocaleString('fr-FR')} F`
      ]);
      
      const totalBeforeDiscount = quoteCart.reduce((acc, item) => acc + (item.price * item.qty), 0);
      const discountAmount = (totalBeforeDiscount * (Number(quoteDiscount) || 0)) / 100;
      const total = totalBeforeDiscount - discountAmount;

      autoTable(doc, {
          startY: 50,
          head: [['Référence', 'Désignation', 'Qté', 'PU TTC', 'Total TTC']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] },
      });
      
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(14);
      if (Number(quoteDiscount) > 0) {
         doc.text(`Remise (${quoteDiscount}%) : -${discountAmount.toLocaleString('fr-FR')} F CFA`, 14, finalY + 10);
         doc.text(`TOTAL NET À PAYER : ${total.toLocaleString('fr-FR')} F CFA`, 14, finalY + 18);
      } else {
         doc.text(`TOTAL NET À PAYER : ${total.toLocaleString('fr-FR')} F CFA`, 14, finalY + 10);
      }
      
      doc.save(`Devis_${clientName.replace(/\s+/g, '_')}.pdf`);
      
      const msg = `Bonjour ${clientName},\nVoici votre devis d'un montant de ${total.toLocaleString('fr-FR')} F CFA.\nN'hésitez pas si vous avez des questions !`;
      window.open(`https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      
      setIsQuoteModalOpen(false);
      setQuoteCart([]);
      setQuoteDiscount('');
  };

  const handleExportProducts = () => {
    if (filteredProducts.length === 0) return alert("Aucun produit à exporter.");
    const dataToExport = filteredProducts.map(p => ({
        "Référence": p.odooRef,
        "Nom": p.name,
        "Catégorie": p.category,
        "Sous-Catégorie": p.subCategory,
        "Prix TTC (F CFA)": p.price,
        "Stock": p.stock,
        "Statut": p.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Catalogue Produits");
    XLSX.writeFile(workbook, `Catalogue_B2B_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.odooRef.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'Toutes' || p.category === activeCategory;
    const matchSubCategory = activeSubCategory === '' || p.subCategory === activeSubCategory;
    const matchPrice = p.price <= priceRange;
    
    return matchSearch && matchCategory && matchSubCategory && matchPrice;
  });

  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const allCategoriesKeys = Array.from(new Set([...Object.keys(CATEGORIES), ...uniqueCategories]));

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500 max-w-[1600px] mx-auto relative">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
             <Database className="text-[#39FF14]" size={28}/> Catalogue B2B
          </h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gestion des stocks & Synchronisation ERP</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-black dark:text-white"
          >
            <Filter size={20} />
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex-1 md:flex-none bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(57,255,20,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isSyncing ? "animate-spin" : ""} /> 
            {isSyncing ? 'Synchronisation...' : 'Importer Odoo / Excel'}
          </button>
          <button 
            onClick={handleExportProducts}
            className="hidden md:flex bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all items-center justify-center gap-2"
          >
            <Download size={16} /> Exporter
          </button>
          <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
        </div>
      </div>

      <div className="flex flex-1 gap-8 min-h-0 relative">
        
        {/* --- SIDEBAR FILTRES (Desktop) --- */}
        <aside className="hidden md:flex w-72 flex-col gap-8 shrink-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 overflow-y-auto custom-scrollbar shadow-sm">
           <div className="relative">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input 
                type="text" 
                placeholder="Réf ou Nom..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] transition-colors"
             />
           </div>

           <div>
              <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Catégories</h3>
              <div className="space-y-2">
                 {allCategoriesKeys.map((cat) => {
                    const subCats = CATEGORIES[cat as keyof typeof CATEGORIES] || [];
                    return (
                    <div key={cat as string}>
                       <button 
                         onClick={() => { setActiveCategory(cat); setActiveSubCategory(''); }}
                         className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeCategory === cat ? 'bg-black text-[#39FF14] dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                       >
                          {cat}
                         {subCats.length > 0 && <ChevronDown size={14} className={activeCategory === cat ? 'rotate-180 transition-transform' : 'transition-transform'} />}
                       </button>
                       
                       {/* Sous-catégories */}
                       {activeCategory === cat && subCats.length > 0 && (
                         <div className="pl-4 pr-2 mt-2 space-y-1 border-l-2 border-zinc-100 dark:border-zinc-800 ml-4 animate-in slide-in-from-top-2">
                            {subCats.map(sub => (
                               <button 
                                 key={sub}
                                 onClick={() => setActiveSubCategory(sub)}
                                 className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeSubCategory === sub ? 'text-black dark:text-white bg-zinc-100 dark:bg-zinc-800' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                               >
                                 ↳ {sub}
                               </button>
                            ))}
                         </div>
                       )}
                    </div>
                 )})}
              </div>
           </div>

           <div>
              <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4 flex justify-between items-end">
                 Prix Maximum <span className="text-[#39FF14] text-sm">{priceRange.toLocaleString('fr-FR')} F</span>
              </h3>
              <input 
                type="range" 
                min="0" 
                max="50000000" 
                step="500000"
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))} 
                className="w-full accent-black dark:accent-[#39FF14] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
              />
           </div>
        </aside>

        {/* --- DRAWER FILTRES (Mobile) --- */}
        {isMobileFiltersOpen && (
           <div className="md:hidden fixed inset-0 z-50 flex justify-end">
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)}></div>
              <div className="relative w-4/5 max-w-[300px] bg-white dark:bg-zinc-950 h-full p-6 flex flex-col gap-8 animate-in slide-in-from-right overflow-y-auto">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase">Filtres</h2>
                    <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full"><X size={20}/></button>
                 </div>
                 
                 <div className="relative">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                   <input type="text" placeholder="Réf ou Nom..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14]" />
                 </div>

                 <div>
                    <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Catégories</h3>
                    <div className="space-y-2">
                       {allCategoriesKeys.map((cat) => {
                          const subCats = CATEGORIES[cat as keyof typeof CATEGORIES] || [];
                          return (
                          <div key={cat as string}>
                             <button onClick={() => { setActiveCategory(cat); setActiveSubCategory(''); }} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeCategory === cat ? 'bg-black text-[#39FF14] dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                {cat} {subCats.length > 0 && <ChevronDown size={14} className={activeCategory === cat ? 'rotate-180' : ''} />}
                             </button>
                             {activeCategory === cat && subCats.length > 0 && (
                               <div className="pl-4 pr-2 mt-2 space-y-1 border-l-2 border-zinc-100 dark:border-zinc-800 ml-4">
                                  {subCats.map(sub => (
                                     <button key={sub} onClick={() => setActiveSubCategory(sub)} className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeSubCategory === sub ? 'text-black dark:text-white bg-zinc-100 dark:bg-zinc-800' : 'text-zinc-500'}`}>↳ {sub}</button>
                                  ))}
                               </div>
                             )}
                          </div>
                       )})}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4 flex justify-between items-end">Prix Max <span className="text-[#39FF14] text-sm">{priceRange.toLocaleString('fr-FR')} F</span></h3>
                    <input type="range" min="0" max="50000000" step="500000" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full accent-black dark:accent-[#39FF14] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none" />
                 </div>
              </div>
           </div>
        )}

        {/* --- MAIN GRID PRODUITS --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                 const isLowStock = product.status === 'Faible' || product.status === 'Dormant';
                 
                 return (
                   <div key={product.id} className={`bg-white dark:bg-zinc-950 rounded-[2rem] p-4 flex flex-col group transition-all duration-300 hover:shadow-xl border-2 ${isLowStock ? 'border-red-500/50 bg-red-50/10 dark:bg-red-950/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-700'}`}>
                      
                      <div className="w-full h-48 rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-900 mb-4 overflow-hidden relative">
                         <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                         <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {product.odooRef}
                         </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                         <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">{product.subCategory}</span>
                         <h3 className="font-bold text-sm text-black dark:text-white leading-tight mb-4 line-clamp-2">{product.name}</h3>
                         
                         <div className="mt-auto flex items-end justify-between">
                            <div>
                               <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-0.5">Prix TTC</p>
                               <p className="font-black text-lg text-[#39FF14] leading-none">{product.price.toLocaleString('fr-FR')} <span className="text-[10px] text-zinc-500 uppercase">F</span></p>
                            </div>
                            <div className={`px-3 py-2 rounded-xl text-center flex flex-col items-center justify-center min-w-[60px] ${isLowStock ? 'bg-red-500/10 text-red-500' : 'bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white'}`}>
                               <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{product.status === 'Dormant' ? 'Dormant' : 'Stock'}</p>
                               <p className="font-black text-sm leading-none flex items-center gap-1">
                                 {isLowStock && <AlertTriangle size={12}/>} {product.stock}
                               </p>
                            </div>
                         </div>
                         
                         <button onClick={() => addToQuote(product)} className="w-full mt-4 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#39FF14] hover:text-black transition-colors flex items-center justify-center gap-2">
                            <Plus size={14}/> Ajouter au devis
                         </button>
                      </div>

                   </div>
                 );
              })}
           </div>
           
           {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                 <Archive size={48} className="mb-4 opacity-20" />
                 <p className="font-bold uppercase tracking-widest text-sm">Aucun produit trouvé</p>
              </div>
           )}
        </div>

      </div>

      {/* --- WIDGET FLOATING: PANIER DE DEVIS --- */}
      {quoteCart.length > 0 && (
         <div className="fixed bottom-6 right-6 z-40">
             <button onClick={() => setIsQuoteModalOpen(true)} className="bg-black text-[#39FF14] px-6 py-4 rounded-full font-black uppercase text-xs shadow-[0_10px_30px_rgba(57,255,20,0.3)] flex items-center gap-3 border border-[#39FF14]/30 hover:scale-105 transition-all">
                <FileText size={18} />
                <span>Devis en cours ({quoteCart.reduce((sum, item) => sum + item.qty, 0)})</span>
             </button>
         </div>
      )}

      {/* --- MODALE GÉNÉRATEUR DE DEVIS --- */}
      {isQuoteModalOpen && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-lg p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
               <button onClick={() => setIsQuoteModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
               <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2"><FileText className="text-[#39FF14]" /> Générateur de Devis</h2>
               
               <div className="space-y-4 mb-6">
                  <input type="text" placeholder="Nom de l'Entreprise ou du Client" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] font-bold text-sm text-black dark:text-white" />
                  <input type="tel" placeholder="Numéro WhatsApp" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] font-bold text-sm text-black dark:text-white" />
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Remise globale (%)</span>
                     <input type="number" min="0" max="100" placeholder="Ex: 10" value={quoteDiscount || ''} onChange={e => setQuoteDiscount(Number(e.target.value))} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] font-bold text-sm text-black dark:text-white" />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-6 pr-2">
                  {quoteCart.map(item => (
                     <div key={item.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex-1 min-w-0 pr-4">
                           <p className="font-bold text-sm truncate text-black dark:text-white">{item.name}</p>
                           <p className="text-[10px] text-[#39FF14] font-black mt-1">{(item.price * item.qty).toLocaleString('fr-FR')} F</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-lg p-1 shrink-0 border border-zinc-200 dark:border-zinc-800">
                           <button onClick={() => updateQuoteQty(item.id, -1)} className="p-1 text-zinc-500 hover:text-[#39FF14]"><Minus size={14}/></button>
                           <span className="w-4 text-center text-xs font-black text-black dark:text-white">{item.qty}</span>
                           <button onClick={() => updateQuoteQty(item.id, 1)} className="p-1 text-zinc-500 hover:text-[#39FF14]"><Plus size={14}/></button>
                           <button onClick={() => removeFromQuote(item.id)} className="p-1 text-red-500 hover:text-red-700 ml-1"><Trash2 size={14}/></button>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center mb-6">
                  <span className="font-bold text-zinc-500 uppercase text-xs">Total TTC</span>
                  <div className="text-right">
                     {Number(quoteDiscount) > 0 && (
                         <span className="text-xs text-red-500 line-through mr-2">
                             {quoteCart.reduce((a,b) => a+(b.price*b.qty), 0).toLocaleString('fr-FR')} F
                         </span>
                     )}
                     <span className="font-black text-2xl text-black dark:text-white">
                         {(quoteCart.reduce((a,b) => a+(b.price*b.qty), 0) * (1 - (Number(quoteDiscount) || 0) / 100)).toLocaleString('fr-FR')} F
                     </span>
                  </div>
               </div>

               <div className="flex gap-3">
                  <button onClick={() => { if(confirm("Vider le devis en cours ?")) { setQuoteCart([]); setIsQuoteModalOpen(false); } }} className="bg-zinc-100 dark:bg-zinc-900 text-red-500 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-lg" title="Supprimer tout">
                     <Trash2 size={16}/>
                  </button>
                  <button onClick={generateQuote} className="flex-1 bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black hover:text-[#39FF14] transition-colors shadow-lg">
                     <Send size={16} /> Générer PDF & WhatsApp
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}