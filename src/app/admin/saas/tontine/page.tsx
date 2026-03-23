"use client";

import React, { useState, useEffect } from "react";
import { Settings, Package, Users, Wallet, Search, Power, Trash2, ChevronLeft, Plus, X, CheckCircle, Copy, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const spaceGrotesk = { className: "font-sans" };

export default function TontineSuperAdmin() {
  const [instances, setInstances] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
     nom: "",
     montant_mensuel: 20000,
     gagnants_par_mois: 2,
     duree_mois: 10,
     theme_color: "#39FF14"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  useEffect(() => {
     fetchInstances();
  }, []);

  const fetchInstances = async () => {
     const { data } = await supabase.from('tontines').select('*').order('created_at', { ascending: false });
     if (data) setInstances(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     const { error } = await supabase.from('tontines').insert([formData]);
     setIsSubmitting(false);
     if (error) {
        alert("Erreur lors de la création : " + error.message);
     } else {
        setShowCreateModal(false);
        setFormData({ nom: "", montant_mensuel: 20000, gagnants_par_mois: 2, duree_mois: 10, theme_color: "#39FF14" });
        fetchInstances();
        alert("Tontine créée avec succès !");
     }
  };

  const handleDelete = async (id: string) => {
     if(confirm("Voulez-vous vraiment supprimer cette tontine et toutes ses données ? (Cette action est irréversible)")) {
        await supabase.from('tontines').delete().eq('id', id);
        fetchInstances();
     }
  };

  const copyLink = (id: string) => {
     const url = `${window.location.origin}/tontine/admin?id=${id}`;
     navigator.clipboard.writeText(url);
     setCopiedId(id);
     setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInstances = instances.filter(inst => 
    inst.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inst.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-black p-6 lg:p-12 selection:bg-[#39FF14]/30">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
          <div>
             <Link href="/admin" className="text-zinc-400 hover:text-black flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 transition-colors w-max">
                <ChevronLeft size={16}/> Retour au Hub
             </Link>
             <div className="flex items-center gap-4">
                <h1 className={`${spaceGrotesk.className} text-3xl lg:text-4xl font-black uppercase tracking-tighter`}>Onyx Tontine</h1>
                <span className="bg-[#39FF14]/20 text-[#1da308] border border-[#39FF14]/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">V1.0</span>
             </div>
             <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Super-Admin Module</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setShowCreateModal(true)} className="bg-black text-[#39FF14] px-6 py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95">
                <Plus size={16}/> Créer une Tontine
             </button>
             <button className="bg-white border border-zinc-200 text-black px-6 py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95">
                <Settings size={16}/> Configurer l'offre
             </button>
          </div>
       </div>

       {/* STATS CARDS */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-black transition-colors">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tontines Déployées</p>
                <div className="p-2 bg-zinc-100 rounded-xl text-zinc-600"><Package size={18}/></div>
             </div>
             <p className={`${spaceGrotesk.className} text-4xl lg:text-5xl font-black`}>{instances.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-black transition-colors">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tontines Actives</p>
                <div className="p-2 bg-[#39FF14]/10 rounded-xl text-[#1da308]"><Users size={18}/></div>
             </div>
             <p className={`${spaceGrotesk.className} text-4xl lg:text-5xl font-black`}>{instances.length}</p>
          </div>
          <div className="bg-black p-6 rounded-3xl shadow-[0_15px_30px_rgba(57,255,20,0.15)] flex flex-col justify-between min-h-[140px] border border-zinc-800 hover:scale-[1.02] transition-transform">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">MRR Estimé <span className="opacity-50">(6 900 F/Mois)</span></p>
                <div className="p-2 bg-white/10 rounded-xl text-[#39FF14]"><Wallet size={18}/></div>
             </div>
             <p className={`${spaceGrotesk.className} text-4xl lg:text-5xl font-black text-[#39FF14]`}>{(instances.length * 6900).toLocaleString('fr-FR')} F</p>
          </div>
       </div>

       {/* DATA TABLE */}
       <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8">
          <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
             <h2 className="font-black uppercase tracking-tighter text-lg">Instances Onyx Tontine</h2>
             <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input 
                  type="search" 
                  placeholder="Rechercher une tontine..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-xs focus:border-black transition-colors"
                />
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left min-w-[800px]">
                <thead className="bg-zinc-50/80 border-b border-zinc-100">
                   <tr>
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tontine & Lien</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Création</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">ID Propriétaire</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Statut SaaS</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                   {filteredInstances.map((inst, idx) => (
                      <tr key={inst.id} className="hover:bg-zinc-50/50 transition-colors group">
                         <td className="p-5">
                            <p className="font-black text-sm uppercase text-black">{inst.nom}</p>
                            <div onClick={() => copyLink(inst.id)} className="text-[10px] font-bold text-zinc-400 hover:text-[#39FF14] mt-0.5 inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                               {copiedId === inst.id ? <Check size={12}/> : <Copy size={12}/>}
                               {copiedId === inst.id ? 'Lien copié !' : 'Copier le lien admin'}
                            </div>
                         </td>
                         <td className="p-5 font-bold text-xs text-zinc-600">{new Date(inst.created_at).toLocaleDateString('fr-FR')}</td>
                         <td className="p-5 font-bold text-xs text-zinc-500 font-mono bg-zinc-50 rounded-lg px-3 py-1 w-max">{inst.id.split('-')[0]}...</td>
                         <td className="p-5">
                            <span className="inline-flex items-center gap-1.5 bg-[#39FF14]/10 text-[#1da308] border border-[#39FF14]/30 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                               <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse"></div>
                               ACTIF
                            </span>
                         </td>
                         <td className="p-5 text-right space-x-2">
                            <button className="p-2.5 text-zinc-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all" title="Suspendre l'instance">
                               <Power size={16}/>
                            </button>
                            <button onClick={() => handleDelete(inst.id)} className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Supprimer">
                               <Trash2 size={16}/>
                            </button>
                         </td>
                      </tr>
                   ))}
                   {filteredInstances.length === 0 && (
                      <tr>
                         <td colSpan={5} className="p-12 text-center text-zinc-400 font-bold uppercase text-xs tracking-widest">Aucune instance trouvée</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>

       {/* MODALE CRÉATION MANUELLE */}
       {showCreateModal && (
         <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowCreateModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14]">
             <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
             
             <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-8 text-black`}>Nouvelle Tontine</h2>
             
             <form onSubmit={handleCreate} className="space-y-5">
                <div>
                   <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Nom de la Tontine *</label>
                   <input type="text" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition uppercase" placeholder="Ex: Les Queens" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Montant (F/mois) *</label>
                      <input type="number" required value={formData.montant_mensuel} onChange={e => setFormData({...formData, montant_mensuel: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Gagnants / mois *</label>
                      <input type="number" required value={formData.gagnants_par_mois} onChange={e => setFormData({...formData, gagnants_par_mois: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition" />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Durée (Mois) *</label>
                      <input type="number" required value={formData.duree_mois} onChange={e => setFormData({...formData, duree_mois: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Couleur Thème</label>
                      <input type="color" value={formData.theme_color} onChange={e => setFormData({...formData, theme_color: e.target.value})} className="w-full h-[54px] p-2 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer" />
                   </div>
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-xs mt-4 hover:scale-105 transition shadow-xl flex justify-center items-center gap-2 disabled:opacity-50">
                   {isSubmitting ? 'Création en cours...' : <><CheckCircle size={16}/> Déployer la Tontine</>}
                </button>
             </form>
           </div>
         </div>
       )}
    </div>
  );
}