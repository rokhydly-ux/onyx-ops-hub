"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserPlus, Edit, Trash2, Loader2, X, Phone, Target as TargetIcon } from 'lucide-react';

interface Commercial {
  id: string;
  full_name: string;
  phone: string;
  objective: number;
  status: 'Actif' | 'Suspendu';
  created_at: string;
  tenant_id: string;
}

export default function CRMSettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommercial, setEditingCommercial] = useState<Commercial | null>(null);
  
  const [formState, setFormState] = useState({
    full_name: '',
    phone: '',
    password_temp: '0000',
    objective: 20
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem('onyx_custom_session');
    if (sessionStr) {
      const parsedSession = JSON.parse(sessionStr);
      setSession(parsedSession);
      fetchCommercials(parsedSession.id);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCommercials = async (tenantId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('commercials')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (data) setCommercials(data);
    if (error) console.error("Erreur de chargement des commerciaux:", error);
    setIsLoading(false);
  };

  const handleOpenModal = (commercial: Commercial | null = null) => {
    if (commercial) {
      setEditingCommercial(commercial);
      setFormState({
        full_name: commercial.full_name,
        phone: commercial.phone,
        password_temp: '••••',
        objective: commercial.objective || 20
      });
    } else {
      setEditingCommercial(null);
      setFormState({ full_name: '', phone: '', password_temp: '0000', objective: 20 });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (commercialId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commercial ? Cette action est irréversible.")) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/crm/commercials', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: commercialId, tenant_id: session.id }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Erreur lors de la suppression.');
        }
        
        alert('Commercial supprimé avec succès.');
        fetchCommercials(session.id);

      } catch (error: any) {
        alert(error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.id) {
      alert("Session utilisateur introuvable. Veuillez vous reconnecter.");
      return;
    }
    setIsSubmitting(true);

    const payload: any = {
      ...formState,
      tenant_id: session.id,
      id: editingCommercial?.id
    };
    
    if (formState.password_temp === '••••') {
      delete payload.password_temp;
    }

    try {
      const response = await fetch('/api/crm/commercials', {
        method: editingCommercial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Une erreur est survenue.');
      
      alert(editingCommercial ? 'Commercial mis à jour !' : 'Commercial ajouté avec succès !');
      setIsModalOpen(false);
      fetchCommercials(session.id);

    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0 bg-white dark:bg-zinc-950 p-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Paramètres & Équipe</h2>
        <button onClick={() => handleOpenModal()} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-[#39FF14] transition-all shadow-md active:scale-95">
          <UserPlus size={16} /> Ajouter un commercial
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nom & Contact</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Objectif Ventes</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading ? (
                <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin inline-block" /></td></tr>
              ) : commercials.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="p-5">
                    <p className="font-black text-sm uppercase text-black dark:text-white">{c.full_name}</p>
                    <p className="text-xs font-bold text-[#39FF14] mt-1 flex items-center gap-1.5"><Phone size={12} className="text-zinc-500" /> {c.phone}</p>
                  </td>
                  <td className="p-5">
                    <span className="font-black text-lg">{c.objective || 20}</span>
                    <span className="text-xs text-zinc-500"> / mois</span>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'Actif' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-red-500/10 text-red-500'}`}>{c.status}</span>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => handleOpenModal(c)} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white rounded-xl transition-colors mr-2"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {!isLoading && commercials.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-zinc-500 italic">Aucun commercial ajouté.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h3 className="text-xl font-black uppercase mb-6">{editingCommercial ? 'Modifier' : 'Ajouter'} un commercial</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Nom complet</label>
                <input type="text" required value={formState.full_name} onChange={e => setFormState({...formState, full_name: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-[#39FF14] focus:bg-white dark:focus:bg-zinc-950 rounded-lg transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Téléphone</label>
                <input type="tel" required value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-[#39FF14] focus:bg-white dark:focus:bg-zinc-950 rounded-lg transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Code PIN (4 chiffres)</label>
                <input type="password" required inputMode="numeric" maxLength={4} value={formState.password_temp} onChange={e => setFormState({...formState, password_temp: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-[#39FF14] focus:bg-white dark:focus:bg-zinc-950 rounded-lg transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Objectif de ventes / mois</label>
                <input type="number" required value={formState.objective} onChange={e => setFormState({...formState, objective: parseInt(e.target.value) || 0})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-[#39FF14] focus:bg-white dark:focus:bg-zinc-950 rounded-lg transition-all" />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-black text-[#39FF14] font-black uppercase text-sm py-4 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (editingCommercial ? 'Mettre à jour' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}