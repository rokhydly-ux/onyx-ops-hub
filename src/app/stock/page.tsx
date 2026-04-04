"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Box, LogOut, ChevronLeft, Loader2, Plus, Search, 
  AlertTriangle, ArrowUp, ArrowDown, Filter, Package,
  ShoppingCart, Truck, GraduationCap, Users
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

const PACK_CONTENTS: Record<string, string[]> = {
  "pack tekki": ["vente", "stock", "tiak"],
  "pack tekki (boutique)": ["vente", "stock", "tiak"],
  "onyxtekki (resto)": ["menu", "stock", "tiak"],
  "pack tekki pro": ["vente", "stock", "tiak", "formation", "staff"],
  "onyx crm": ["crm", "booking"],
  "pack onyx crm": ["crm", "booking"],
  "pack onyx gold": ["vente", "stock", "tiak", "formation", "staff", "crm", "booking", "menu", "tontine"],
  "onyx gold": ["vente", "stock", "tiak", "formation", "staff", "crm", "booking", "menu", "tontine"]
};

export default function OnyxStock() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');

  // --- 1. VÉRIFICATION SÉCURISÉE DE L'ACCÈS ---
  const checkAccess = (appId: string, userObj: any) => {
    if (!userObj) return false;
    const activeSaas = userObj.active_saas || [];
    const allSaas = [userObj.saas || '', ...activeSaas].map((s: string) => (s || '').toLowerCase());
    
    if (allSaas.some((s: string) => s.includes('gold'))) return true;
    if (allSaas.some((s: string) => s === appId.toLowerCase() || s.includes(appId.toLowerCase()))) return true;
    
    for (const saas of allSaas) {
        for (const [packName, modules] of Object.entries(PACK_CONTENTS)) {
            if (saas.includes(packName) && modules.includes(appId)) {
                return true;
            }
        }
    }
    return false;
  };

  useEffect(() => {
    const verifyAuth = async () => {
      let activeUser = null;
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data } = await supabase.from('clients').select('*').eq('id', session.user.id).maybeSingle();
        activeUser = data ? { ...session.user, ...data } : session.user;
      } else {
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
            try {
                const parsedUser = JSON.parse(customSession);
                const { data } = await supabase.from('clients').select('*').eq('id', parsedUser.id).maybeSingle();
                activeUser = data || parsedUser;
            } catch (e) {}
        }
      }

      // ÉJECTION SI ACCÈS REFUSÉ
      if (!activeUser || !checkAccess('stock', activeUser)) {
          alert("Accès refusé. Vous n'avez pas l'abonnement requis pour Onyx Stock.");
          window.location.href = '/hub';
          return;
      }

      setUser(activeUser);
      if (activeUser) localStorage.setItem('onyx_custom_session', JSON.stringify(activeUser));

      // Chargement de la boutique et du stock
      await fetchInventory(activeUser.id, activeUser.phone);
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  // --- 2. CHARGEMENT DES PRODUITS ---
  const fetchInventory = async (userId: string, userPhone: string) => {
      let { data: shop } = await supabase.from('shops').select('id, name, currency').eq('owner_id', userId).maybeSingle();
      if (!shop && userPhone) {
          const { data: shopByPhone } = await supabase.from('shops').select('id, name, currency').eq('phone', userPhone).maybeSingle();
          shop = shopByPhone;
      }

      if (shop) {
          setShopId(shop.id);
          const { data: productsData } = await supabase.from('products').select('*').eq('shop_id', shop.id).order('name', { ascending: true });
          if (productsData) setProducts(productsData);
      }
  };

  // --- 3. MISE À JOUR RAPIDE DU STOCK ---
  const handleUpdateStock = async (productId: number, newStock: number) => {
      if (newStock < 0) return;
      
      // Mise à jour optimiste UI
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      
      // Mise à jour Supabase
      try {
          await supabase.from('products').update({ stock: newStock }).eq('id', productId);
      } catch (err) {
          console.error("Erreur de mise à jour du stock", err);
      }
  };

  const handleLogout = async () => {
    localStorage.removeItem('onyx_custom_session');
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const filteredProducts = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;
      
      if (filterType === 'low') return p.stock > 0 && p.stock <= 5;
      if (filterType === 'out') return p.stock === 0;
      return true;
  });

  const totalItems = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const inventoryValue = products.reduce((sum, p) => sum + ((p.cost_price || p.costPrice || 0) * (p.stock || 0)), 0);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-black pb-24">
      
      {/* HEADER */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <button onClick={() => window.location.href = '/hub'} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors">
                 <ChevronLeft size={20} />
             </button>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                   <Box size={20} className="text-emerald-600"/>
                </div>
                <div>
                   <h1 className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter leading-none`}>Onyx Stock</h1>
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Gestion d'Inventaire</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200 mr-2 shadow-sm">
                {checkAccess('vente', user) && <button onClick={() => window.location.href='/vente'} className="p-2 text-zinc-500 hover:text-black transition-colors" title="Onyx Jaay (Vente)"><ShoppingCart size={16}/></button>}
                <button className="p-2 bg-black text-[#39FF14] rounded-full shadow-md transition-all" title="Onyx Stock"><Box size={16}/></button>
                {checkAccess('tiak', user) && <button onClick={() => window.location.href='/tiak'} className="p-2 text-zinc-500 hover:text-black transition-colors" title="Onyx Tiak"><Truck size={16}/></button>}
                {checkAccess('formation', user) && <button onClick={() => window.location.href='/admin/saas/formation'} className="p-2 text-zinc-500 hover:text-black transition-colors" title="Onyx Formation"><GraduationCap size={16}/></button>}
                {checkAccess('staff', user) && <button onClick={() => window.location.href='/staff'} className="p-2 text-zinc-500 hover:text-black transition-colors" title="Onyx Staff"><Users size={16}/></button>}
             </div>
             <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center shadow-sm font-black text-sm uppercase overflow-hidden text-black border-2 border-white">
                {user?.photo_url ? <img src={user.photo_url} alt="Avatar" className="w-full h-full object-cover" /> : user?.full_name?.substring(0, 2) || "U"}
             </div>
             <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors bg-zinc-100 hover:bg-red-50 rounded-full hidden sm:block" title="Se déconnecter">
               <LogOut size={16} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
         <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
            <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>Tableau de bord <span className="text-emerald-500">Inventaire</span></h2>
            <button onClick={() => window.location.href = '/vente'} className="bg-black text-emerald-400 px-6 py-3 rounded-xl font-black text-xs uppercase hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
                <Plus size={16}/> Créer un produit
            </button>
         </div>

         {/* KPI CARDS */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 flex items-center gap-2"><Package size={14}/> Articles en stock</p>
                 <p className="text-3xl font-black text-black">{totalItems.toLocaleString()}</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 flex items-center gap-2"><AlertTriangle size={14}/> Stock Faible (&lt;5)</p>
                 <p className="text-3xl font-black text-orange-500">{lowStockCount}</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 flex items-center gap-2"><Box size={14}/> En rupture</p>
                 <p className="text-3xl font-black text-red-500">{outOfStockCount}</p>
             </div>
             <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-2 flex items-center gap-2"><Box size={14}/> Valeur d'achat (Est.)</p>
                 <p className="text-3xl font-black text-emerald-600">{inventoryValue.toLocaleString()} F</p>
             </div>
         </div>

         {/* INVENTORY LIST */}
         <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-50">
               <div className="relative w-full md:w-96">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher par nom ou code-barre..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-colors"
                  />
               </div>
               <div className="flex bg-white border border-zinc-200 rounded-xl p-1 w-full md:w-auto">
                   <button onClick={() => setFilterType('all')} className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black uppercase transition-colors ${filterType === 'all' ? 'bg-black text-emerald-400' : 'text-zinc-500 hover:bg-zinc-100'}`}>Tous</button>
                   <button onClick={() => setFilterType('low')} className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black uppercase transition-colors ${filterType === 'low' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>Faible</button>
                   <button onClick={() => setFilterType('out')} className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black uppercase transition-colors ${filterType === 'out' ? 'bg-red-500 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>Rupture</button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                   <thead className="bg-zinc-100 border-b border-zinc-200">
                       <tr>
                           <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Produit</th>
                           <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Catégorie</th>
                           <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-center">Statut</th>
                           <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-right">Quantité</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-100">
                       {filteredProducts.map(p => (
                           <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                               <td className="p-4 flex items-center gap-4">
                                   <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-zinc-200 shrink-0" />
                                   <div>
                                       <p className="font-bold text-sm text-black line-clamp-1">{p.name}</p>
                                       <p className="text-[10px] text-zinc-400 font-mono mt-1">Ref: {p.barcode || p.id}</p>
                                   </div>
                               </td>
                               <td className="p-4">
                                   <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-md text-[10px] font-black uppercase">{p.category || 'N/A'}</span>
                               </td>
                               <td className="p-4 text-center">
                                   {p.stock === 0 ? (
                                       <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-[10px] font-black uppercase">Rupture</span>
                                   ) : p.stock <= 5 ? (
                                       <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-[10px] font-black uppercase">Faible</span>
                                   ) : (
                                       <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-black uppercase">En Stock</span>
                                   )}
                               </td>
                               <td className="p-4">
                                   <div className="flex items-center justify-end gap-1">
                                       <button onClick={() => handleUpdateStock(p.id, p.stock - 1)} className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-lg text-black hover:bg-zinc-200 transition-colors font-black">-</button>
                                       <input 
                                          type="number" 
                                          value={p.stock} 
                                          onChange={(e) => handleUpdateStock(p.id, parseInt(e.target.value) || 0)}
                                          className={`w-14 text-center font-black text-sm outline-none border-b-2 bg-transparent ${p.stock === 0 ? 'text-red-500 border-red-500' : p.stock <= 5 ? 'text-orange-500 border-orange-500' : 'text-emerald-600 border-emerald-600 focus:border-black'}`}
                                       />
                                       <button onClick={() => handleUpdateStock(p.id, p.stock + 1)} className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-lg text-black hover:bg-zinc-200 transition-colors font-black">+</button>
                                   </div>
                               </td>
                           </tr>
                       ))}
                       {filteredProducts.length === 0 && (
                           <tr><td colSpan={4} className="p-10 text-center text-zinc-500 font-bold">Aucun produit trouvé.</td></tr>
                       )}
                   </tbody>
               </table>
            </div>
         </div>
      </main>
    </div>
  );
}