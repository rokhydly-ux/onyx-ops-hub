"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Box, Search, Edit, Plus, CheckSquare, Clock, AlertTriangle, AlertCircle, X, Download, User, Minus, Bot, Sparkles, Send, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CRMCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [quoteQuantities, setQuoteQuantities] = useState<Record<number, number>>({});
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCampaigns, setAiCampaigns] = useState<any[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', unit_price: 0 });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      const tId = user.user_metadata?.tenant_id || user.id;
      setTenantId(tId);

      const { data, error } = await supabase
        .from('crm_products')
        .select('*')
        .eq('tenant_id', tId)
        .order('created_at', { ascending: false });

      if (data && !error) setProducts(data);

      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('tenant_id', tId);
      if (clientsData) setClients(clientsData);

      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleCategoryChange = async (productId: number, newCategory: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, category: newCategory } : p));
    if (tenantId) {
      await supabase.from('crm_products').update({ category: newCategory }).eq('id', productId).eq('tenant_id', tenantId);
    }
  };

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const getStockStatus = (lastSoldDate: string | null, createdAt: string | null) => {
    const dateToUse = lastSoldDate || createdAt || new Date().toISOString();
    if (!dateToUse) return { label: 'Inconnu', color: 'bg-zinc-100 text-zinc-500' };
    
    const daysSinceSold = Math.floor((new Date().getTime() - new Date(dateToUse).getTime()) / (1000 * 3600 * 24));
    
    if (daysSinceSold < 15) return { label: 'Actif', color: 'bg-green-100 text-green-700 border-green-200' };
    if (daysSinceSold <= 30) return { label: 'Alerte', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'Stock Mort', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  const handleQuantityChange = (id: number, delta: number) => {
      setQuoteQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  const handleStatusChange = async (productId: number, newStatus: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_status: newStatus } : p));
    if (tenantId) {
      await supabase.from('crm_products').update({ stock_status: newStatus }).eq('id', productId).eq('tenant_id', tenantId);
    }
  };

  const handleOpenAdd = () => {
      setEditingProduct(null);
      setEditForm({ name: '', category: '', unit_price: 0 });
      setIsAddingProduct(true);
  };

  const handleOpenEdit = (p: any) => {
      setEditingProduct(p);
      setIsAddingProduct(false);
      setEditForm({ name: p.name || '', category: p.category || '', unit_price: p.unit_price || p.price_ttc || 0 });
  };

  const handleDeleteProduct = async (id: number) => {
      if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
      try {
          const { error } = await supabase.from('crm_products').delete().eq('id', id).eq('tenant_id', tenantId);
          if (error) throw error;
          setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err: any) {
          alert("Erreur lors de la suppression : " + err.message);
      }
  };

  const handleSaveProduct = async () => {
      if (!editForm.name) return alert("Le nom du produit est requis.");
      setIsSavingEdit(true);
      try {
          const payload = { name: editForm.name, category: editForm.category, unit_price: editForm.unit_price, price_ttc: editForm.unit_price };
          if (isAddingProduct) {
              const { data, error } = await supabase.from('crm_products').insert([{ ...payload, tenant_id: tenantId, last_sold_date: new Date().toISOString() }]).select().single();
              if (error) throw error;
              setProducts(prev => [data, ...prev]);
              setIsAddingProduct(false);
          } else if (editingProduct) {
              const { error } = await supabase.from('crm_products').update(payload).eq('id', editingProduct.id).eq('tenant_id', tenantId);
              if (error) throw error;
              setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
              setEditingProduct(null);
          }
      } catch(err: any) {
          alert("Erreur lors de la mise à jour : " + err.message);
      } finally {
          setIsSavingEdit(false);
      }
  };

  const generateQuote = async () => {
      const client = clients.find(c => String(c.id) === String(selectedClientId));
      if (!client) return alert("Veuillez sélectionner un client pour le devis !");
      
      const selectedProducts = products.filter(p => selectedIds.has(p.id));
      const items = selectedProducts.map(p => ({ ...p, qty: quoteQuantities[p.id] || 1 }));
      const totalAmount = items.reduce((acc, p) => acc + ((p.unit_price || p.price_ttc || 0) * p.qty), 0);

      try {
          await supabase.from('crm_quotes').insert([{
              tenant_id: tenantId,
              client_id: client.id,
              items: items,
              total_amount: totalAmount
          }]);
      } catch(e) { console.error("Erreur d'enregistrement devis", e); }

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("DEVIS COMMERCIAL", 14, 20);
      doc.setFontSize(12);
      doc.text(`Client : ${client.full_name}`, 14, 30);
      doc.text(`Téléphone : ${client.phone}`, 14, 36);
      doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 14, 42);
      
      autoTable(doc, {
          startY: 50,
          head: [['Désignation Produit', 'Prix Unitaire', 'Quantité', 'Total']],
          body: items.map(item => [
              item.name,
              `${(item.unit_price || item.price_ttc || 0).toLocaleString('fr-FR')} F`,
              item.qty,
              `${((item.unit_price || item.price_ttc || 0) * item.qty).toLocaleString('fr-FR')} F`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
      });

      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL NET : ${totalAmount.toLocaleString('fr-FR')} F CFA`, 14, finalY + 15);

      doc.save(`Devis_${client.full_name.replace(/\s+/g, '_')}.pdf`);

      const msg = `Bonjour ${client.full_name}, voici votre devis estimé à ${totalAmount.toLocaleString('fr-FR')} F CFA pour les équipements sélectionnés. N'hésitez pas à nous contacter pour finaliser la commande !`;
      window.open(`https://wa.me/${String(client.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      
      setIsQuoteModalOpen(false);
      setSelectedIds(new Set());
      setQuoteQuantities({});
      setSelectedClientId('');
  };

  const handleOpenAiCampaign = () => {
      const dormantProducts = products.filter(p => getStockStatus(p.last_sold_date, p.created_at).label !== 'Actif');
      if (dormantProducts.length === 0) return alert("L'IA n'a détecté aucun produit en 'Alerte' ou 'Stock Mort'.");

      const campaigns: any[] = [];
      dormantProducts.forEach(p => {
          if (!p.category) return;
          const matchedClients = clients.filter(c => c.activity && c.activity.toLowerCase().includes(p.category.toLowerCase()));
          if (matchedClients.length > 0) campaigns.push({ product: p, clients: matchedClients });
      });
      if (campaigns.length === 0) return alert("Aucun prospect ne correspond aux catégories des produits à déstocker.");
      setAiCampaigns(campaigns);
      setIsAiModalOpen(true);
  };

  const validateAiCampaigns = async () => {
      setIsLoading(true);
      const actions: any[] = [];
      const todayStr = new Date().toISOString().split('T')[0];
      aiCampaigns.forEach(camp => {
          camp.clients.forEach((client: any) => {
              actions.push({
                  tenant_id: tenantId,
                  module: 'Déstockage',
                  title: `Offre Flash : ${camp.product.name}`,
                  desc: `Campagne IA pour client du secteur ${client.activity}`,
                  date: todayStr,
                  status: 'En attente',
                  phone: client.phone,
                  msg: `Bonjour ${client.full_name}, offre spéciale sur notre équipement : ${camp.product.name}. Parfait pour votre activité (${client.activity}) !`
              });
          });
      });
      try {
          await supabase.from('actions_ia').insert(actions);
          alert(`${actions.length} relances ciblées ajoutées au Journal IA du commercial !`);
          setIsAiModalOpen(false);
      } catch(err: any) { alert("Erreur d'enregistrement : " + err.message); } finally { setIsLoading(false); }
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#39FF14]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Catalogue & Écosystème</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gérez vos offres et votre inventaire</p>
        </div>
      </div>

      <div className="animate-in fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button onClick={handleOpenAdd} className="bg-[#39FF14] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 hover:scale-105 transition-transform">
                 <Plus size={16}/> Nouveau
              </button>
              <button onClick={handleOpenAiCampaign} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 hover:scale-105 transition-transform">
                 <Sparkles size={16}/> IA : Déstockage
              </button>
              {selectedIds.size > 0 && (
                <button onClick={() => setIsQuoteModalOpen(true)} className="bg-white dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 hover:scale-105 transition-transform">
                  Créer un devis ({selectedIds.size})
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(new Set(filteredProducts.map(p => p.id)));
                        else setSelectedIds(new Set());
                      }}
                      checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                      className="w-4 h-4 accent-black dark:accent-[#39FF14]"
                    />
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Produit</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Catégorie</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Prix</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut (Rotation)</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Disponibilité</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {filteredProducts.map(product => {
                  const status = getStockStatus(product.last_sold_date, product.created_at);
                  return (
                    <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelection(product.id)}
                          className="w-4 h-4 accent-black dark:accent-[#39FF14] cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-black dark:text-white line-clamp-1">{product.name}</p>
                      </td>
                      <td className="p-4">
                        <select 
                          value={product.category || ''} 
                          onChange={(e) => handleCategoryChange(product.id, e.target.value)}
                          className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-[#39FF14] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        >
                          <option value="">Non catégorisé</option>
                          {uniqueCategories.map(cat => (
                            <option key={cat as string} value={cat as string}>{cat as string}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <p className="font-black text-sm">{product.unit_price ? product.unit_price.toLocaleString('fr-FR') : (product.price_ttc ? product.price_ttc.toLocaleString('fr-FR') : 0)} F</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          value={product.stock_status || 'Actif'} 
                          onChange={(e) => handleStatusChange(product.id, e.target.value)}
                          className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg outline-none cursor-pointer border appearance-none ${product.stock_status === 'Rupture' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'}`}
                        >
                          <option value="Actif">Actif</option>
                          <option value="Rupture">Rupture</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => handleOpenEdit(product)} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white rounded-lg transition-colors" title="Éditer"><Edit size={14}/></button>
                           <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Supprimer"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest italic">Aucun produit trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* MODALE APERÇU DEVIS */}
      {isQuoteModalOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsQuoteModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <button onClick={() => setIsQuoteModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h2 className="text-2xl font-black uppercase mb-2 text-black dark:text-white tracking-tighter">Aperçu du Devis</h2>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Sélection de {selectedIds.size} produits</p>
            
            <div className="mb-6">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-2"><User size={14}/> Sélectionner un Client CRM</label>
               <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold appearance-none cursor-pointer">
                   <option value="">-- Choisir un client --</option>
                   {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
               </select>
            </div>

            <div className="space-y-3 mb-6 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {products.filter(p => selectedIds.has(p.id)).map(p => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 gap-4">
                  <div className="flex-1">
                     <span className="font-bold text-sm text-black dark:text-white line-clamp-1">{p.name}</span>
                     <span className="font-black text-[#39FF14] text-xs">{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 shrink-0">
                     <button onClick={() => handleQuantityChange(p.id, -1)} className="p-1 text-zinc-500 hover:text-black dark:hover:text-white transition"><Minus size={14}/></button>
                     <span className="font-black text-sm w-6 text-center">{quoteQuantities[p.id] || 1}</span>
                     <button onClick={() => handleQuantityChange(p.id, 1)} className="p-1 text-zinc-500 hover:text-black dark:hover:text-white transition"><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800 mb-8 shrink-0">
              <span className="text-sm font-black uppercase text-zinc-500 tracking-widest">Total Net Estimé</span>
              <span className="text-3xl font-black text-black dark:text-white tracking-tighter">
                {products.filter(p => selectedIds.has(p.id)).reduce((acc, p) => acc + ((p.unit_price || p.price_ttc || 0) * (quoteQuantities[p.id] || 1)), 0).toLocaleString('fr-FR')} F
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button onClick={() => setIsQuoteModalOpen(false)} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-black uppercase text-xs rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">Fermer</button>
              <button onClick={generateQuote} className="flex-[2] py-4 bg-black dark:bg-white text-[#39FF14] dark:text-black font-black uppercase text-xs rounded-xl hover:scale-105 transition flex justify-center items-center gap-2 shadow-lg">
                <Download size={16}/> Générer PDF & Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE IA DESTOCKAGE */}
      {isAiModalOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsAiModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <button onClick={() => setIsAiModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <div className="w-12 h-12 bg-black text-[#39FF14] rounded-xl flex items-center justify-center mb-4 shadow-lg"><Bot size={24}/></div>
            <h2 className="text-2xl font-black uppercase mb-2 text-black dark:text-white tracking-tighter">Assistant Déstockage</h2>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Suggestions de l'IA pour vos produits dormants</p>
            
            <div className="space-y-4 mb-6 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {aiCampaigns.map((camp, idx) => (
                 <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                       <AlertTriangle size={14} className="text-orange-500" />
                       <span className="font-bold text-sm text-black dark:text-white">{camp.product.name}</span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                       Ce produit de la catégorie <span className="font-black text-black dark:text-zinc-300">{camp.product.category}</span> ne tourne plus.
                       L'IA a identifié <span className="font-black text-[#39FF14] bg-black px-2 py-0.5 rounded-md mx-1">{camp.clients.length} prospects</span> de ce secteur d'activité.
                    </p>
                 </div>
              ))}
            </div>
            
            <button onClick={validateAiCampaigns} className="w-full py-4 bg-[#39FF14] text-black font-black uppercase text-xs rounded-xl hover:scale-105 transition flex justify-center items-center gap-2 shadow-lg shadow-[#39FF14]/20">
               <Send size={16}/> Valider et Créer les relances
            </button>
          </div>
        </div>
      )}

      {/* MODALE ÉDITION / AJOUT RAPIDE PRODUIT */}
      {(editingProduct || isAddingProduct) && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && (setEditingProduct(null), setIsAddingProduct(false))} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <button onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-black dark:text-white">{isAddingProduct ? 'Nouveau Produit' : 'Éditer Produit'}</h2>
            
            <div className="space-y-4 mb-8">
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nom du Produit</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                </div>
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Catégorie</label>
                    <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} placeholder="Ex: Équipements" className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                </div>
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Prix Unitaire (F CFA)</label>
                    <input type="number" value={editForm.unit_price} onChange={e => setEditForm({...editForm, unit_price: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                </div>
            </div>
            
            <button onClick={handleSaveProduct} disabled={isSavingEdit} className="w-full bg-black dark:bg-white text-[#39FF14] dark:text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
                {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : (isAddingProduct ? <Plus size={16} /> : <Edit size={16} />)}
                Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}