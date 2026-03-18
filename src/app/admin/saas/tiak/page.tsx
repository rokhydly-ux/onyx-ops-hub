"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Truck, Settings, TrendingUp, Users, Search } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function OnyxTiakAdmin() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTiakClients = async () => {
      // On cherche les clients qui ont "tiak" dans leur tableau active_saas
      const { data, error } = await supabase.from('clients').select('*').contains('active_saas', ['tiak']);
      if (data && !error) setClients(data);
      setIsLoading(false);
    };
    fetchTiakClients();
  }, []);

  const mrr = clients.length * 9900;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 font-sans text-black dark:text-white selection:bg-orange-500/30">
      {/* Header */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 h-24 flex items-center justify-between px-8 z-20 sticky top-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/admin')} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-orange-500 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              Onyx Tiak <span className="bg-orange-500/20 text-orange-500 text-[10px] px-3 py-1 rounded-full font-bold">V 1.0</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">SaaS Logistique & Flotte</p>
          </div>
        </div>
        <button className="bg-black text-orange-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-transform">
             <Settings size={16} /> Configurer l'Offre
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center"><Truck size={32}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Flottes Déployées</p>
              <p className="text-4xl font-black">{clients.length}</p>
            </div>
          </div>
          <div className="bg-black p-6 rounded-3xl border border-zinc-800 flex items-center gap-6 shadow-2xl md:col-span-2">
            <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center"><TrendingUp size={32}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">MRR Tiak (9900 F/mois)</p>
              <p className="text-4xl font-black text-orange-500">{mrr.toLocaleString()} F</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
           <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-black uppercase text-lg">Instances Onyx Tiak</h3>
              <div className="relative w-64">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-orange-500 transition" />
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
                    ) : clients.map(client => (
                       <tr key={client.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4 font-bold text-sm text-black dark:text-white">
                             {client.full_name}
                          </td>
                          <td className="p-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                             {client.phone}
                          </td>
                          <td className="p-4">
                             <span className="text-[9px] font-black uppercase px-3 py-1 rounded-lg bg-orange-500/20 text-orange-700 dark:text-orange-500">
                                Actif
                             </span>
                          </td>
                          <td className="p-4 text-right text-xs font-bold text-zinc-500">
                             {client.expiration_date ? new Date(client.expiration_date).toLocaleDateString() : 'N/A'}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
}