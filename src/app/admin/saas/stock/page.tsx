"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Box, Settings, TrendingUp, Search, X, CheckCircle, Smartphone } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function OnyxStockAdmin() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  useEffect(() => {
    const fetchStockClients = async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (data && !error) {
        const stockClients = data.filter((c: any) => {
            const activeSaas = c.active_saas || [];
            const mainSaas = (c.saas || '').toLowerCase();
            return activeSaas.includes('stock') || mainSaas.includes('stock') || mainSaas.includes('trio') || mainSaas.includes('full') || mainSaas.includes('elite') || mainSaas.includes('master');
        });
        setClients(stockClients);
      }
      setIsLoading(false);
    };
    fetchStockClients();
  }, []);

  const mrr = clients.length * 9900;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 font-sans text-black dark:text-white selection:bg-emerald-500/30">
      {/* Header */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 h-24 flex items-center justify-between px-8 z-20 sticky top-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/admin')} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-emerald-500 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              Onyx Stock <span className="bg-emerald-500/20 text-emerald-500 text-[10px] px-3 py-1 rounded-full font-bold">V 1.0</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">SaaS Gestion d'Inventaire</p>
          </div>
        </div>
        <button className="bg-black text-emerald-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-transform">
             <Settings size={16} /> Configurer l'Offre
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center"><Box size={32}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Inventaires Déployés</p>
              <p className="text-4xl font-black">{clients.length}</p>
            </div>
          </div>
          <div className="bg-black p-6 rounded-3xl border border-zinc-800 flex items-center gap-6 shadow-2xl md:col-span-2">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center"><TrendingUp size={32}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">MRR Stock (9900 F/mois)</p>
              <p className="text-4xl font-black text-emerald-500">{mrr.toLocaleString()} F</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
           <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-black uppercase text-lg">Instances Onyx Stock</h3>
              <div className="relative w-64">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-emerald-500 transition" />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Client / Entreprise</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Téléphone</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Statut SaaS</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Expiration</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {isLoading ? (
                       <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Chargement...</td></tr>
                    ) : clients.filter(c => (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(client => (
                       <tr key={client.id} onClick={() => setSelectedClient(client)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                          <td className="p-4 font-bold text-sm text-black dark:text-white group-hover:text-emerald-500 transition-colors">
                             {client.full_name}
                          </td>
                          <td className="p-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                             {client.phone}
                          </td>
                          <td className="p-4">
                             <span className="text-[9px] font-black uppercase px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-500">
                                Actif
                             </span>
                          </td>
                          <td className="p-4 text-right text-xs font-bold text-zinc-500">
                             {client.saas_expiration_dates?.stock ? new Date(client.saas_expiration_dates.stock).toLocaleDateString() : client.expiration_date ? new Date(client.expiration_date).toLocaleDateString() : 'N/A'}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </main>

      {/* Modal Client Detail */}
      {selectedClient && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedClient(null)}>
            <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative border-t-[8px] border-emerald-500" onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedClient(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-emerald-500 transition-all"><X size={20}/></button>
               
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-black text-2xl">
                     {selectedClient.full_name?.charAt(0)}
                  </div>
                  <div>
                     <h3 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">{selectedClient.full_name}</h3>
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{selectedClient.type || 'Client'}</p>
                  </div>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                     <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Contact WhatsApp</p>
                     <p className="font-bold text-sm text-black dark:text-white">{selectedClient.phone}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                     <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Abonnement Principal</p>
                     <p className="font-bold text-sm text-black dark:text-white">{selectedClient.saas || 'Non spécifié'}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                     <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1"><CheckCircle size={12}/> Fin d'accès (Onyx Stock)</p>
                     <p className="font-bold text-sm text-emerald-700 dark:text-emerald-500">
                        {selectedClient.saas_expiration_dates?.stock 
                            ? new Date(selectedClient.saas_expiration_dates.stock).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
                            : selectedClient.expiration_date 
                                ? new Date(selectedClient.expiration_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
                                : 'Accès illimité / Non défini'}
                     </p>
                  </div>
               </div>

               <div className="flex gap-3">
                  <button onClick={() => {
                      const rawPhone = String(selectedClient.phone).replace(/\s+/g, '').replace(/[^0-9]/g, '');
                      const phoneWithPrefix = rawPhone.startsWith('221') ? rawPhone : `221${rawPhone}`;
                      window.open(`https://wa.me/${phoneWithPrefix}`, '_blank');
                  }} className="flex-1 bg-black text-emerald-500 py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-all flex items-center justify-center gap-2">
                     <Smartphone size={16} /> WhatsApp
                  </button>
                  <button onClick={() => {
                      router.push('/admin');
                  }} className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
                     CRM Admin
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}