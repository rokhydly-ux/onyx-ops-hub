"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Settings, Save, Image as ImageIcon, Loader2, Palette, Type, Users, Bot, Plug, Plus, MessageSquare, Database, Activity } from 'lucide-react';

export default function CRMSettingsPage() {
  const [settings, setSettings] = useState({ crm_name: 'ONYX CRM', logo_url: '', theme_color: '#39FF14' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [userId, setUserId] = useState<string | null>(null);

  // Mocks pour les nouveaux onglets
  const [teamMembers] = useState([{ id: 1, name: 'Boss Admin', role: 'Super Admin', color: '#39FF14' }, { id: 2, name: 'Moussa Diop', role: 'Commercial', color: '#3b82f6' }]);
  const [msgJ0, setMsgJ0] = useState('Bonjour [Nom_Client], voici notre offre détaillée pour le montant de [Montant_Devis].');
  const [msgJ2, setMsgJ2] = useState('Bonjour [Nom_Client], avez-vous pu consulter notre proposition ?');
  const [msgJ7, setMsgJ7] = useState('Dernière relance pour votre devis. Cliquez ici : [Lien_Catalogue]');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase.from('crm_settings').select('*').eq('user_id', user.id).single();
        if (data) setSettings({ crm_name: data.crm_name || 'ONYX CRM', logo_url: data.logo_url || '', theme_color: data.theme_color || '#39FF14' });
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      return alert("Erreur: Utilisateur non authentifié.");
    }
    setIsSaving(true);
    const { error } = await supabase.from('crm_settings').upsert({ user_id: userId, ...settings });
    setIsSaving(false);
    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } else {
      alert("Paramètres enregistrés avec succès. Veuillez rafraîchir la page pour appliquer les changements globaux.");
      window.location.reload();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (Max 2Mo).");
      return;
    }
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `crm-logo-${Date.now()}.${fileExt}`;
      
      // On utilise le bucket 'tontines' existant ou un bucket générique si configuré
      const { error: uploadError } = await supabase.storage.from('tontines').upload(fileName, file); 
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('tontines').getPublicUrl(fileName);
      setSettings({ ...settings, logo_url: data.publicUrl });
    } catch (err: any) {
      alert("Erreur d'upload : " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
          <Settings size={28} style={{ color: settings.theme_color }} />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Paramètres CRM</h2>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Configuration de la Tour de Contrôle</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-max overflow-x-auto shadow-sm border border-zinc-200 dark:border-zinc-800">
        <button onClick={() => setActiveTab('general')} className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'general' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Settings size={14}/> Général</button>
        <button onClick={() => setActiveTab('team')} className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Users size={14}/> Mon Équipe</button>
        <button onClick={() => setActiveTab('auto')} className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'auto' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Bot size={14}/> Automatisations</button>
        <button onClick={() => setActiveTab('integrations')} className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'integrations' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Plug size={14}/> Intégrations</button>
        <button onClick={() => setActiveTab('sync')} className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'sync' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Database size={14}/> Import & Sync</button>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm space-y-8 animate-in fade-in">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Type size={16}/> Nom du CRM</label>
            <input type="text" required value={settings.crm_name} onChange={e => setSettings({...settings, crm_name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none transition text-black dark:text-white focus:border-[#39FF14]" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Palette size={16}/> Couleur du Thème (Hex)</label>
            <div className="flex items-center gap-4">
              <input type="color" value={settings.theme_color} onChange={e => setSettings({...settings, theme_color: e.target.value})} className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border-0 p-0" />
              <input type="text" required value={settings.theme_color} onChange={e => setSettings({...settings, theme_color: e.target.value})} className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none uppercase transition text-black dark:text-white focus:border-[#39FF14]" />
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-8">
            <label className="text-xs font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><ImageIcon size={16}/> Logo Client (URL ou Fichier)</label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-16 w-auto object-contain bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg" />}
              <input type="url" placeholder="https://..." value={settings.logo_url} onChange={e => setSettings({...settings, logo_url: e.target.value})} className="flex-1 w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none transition text-black dark:text-white focus:border-[#39FF14]" />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full sm:w-auto px-6 py-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition disabled:opacity-50 text-black dark:text-white">
                {isUploading ? 'Upload...' : 'Parcourir'}
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <button type="submit" disabled={isSaving} className="w-full py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-black" style={{ backgroundColor: settings.theme_color }}>
              {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Enregistrer les paramètres
            </button>
          </div>
        </form>
      )}

      {activeTab === 'team' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm animate-in fade-in overflow-hidden">
           <div className="p-8 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-black text-xl uppercase">Gestion de l'Équipe</h3>
              <button className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"><Plus size={16}/> Inviter</button>
           </div>
           <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                 <tr>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Utilisateur</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Rôle</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Pastille (Couleur)</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                 {teamMembers.map(member => (
                    <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                       <td className="p-5 font-black text-sm uppercase">{member.name}</td>
                       <td className="p-5"><span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">{member.role}</span></td>
                       <td className="p-5"><div className="flex items-center gap-3"><input type="color" defaultValue={member.color} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" /></div></td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'auto' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in space-y-8">
           <h3 className="font-black text-xl uppercase mb-6 flex items-center gap-2"><MessageSquare size={20} className="text-[#39FF14]"/> Modèles de Relance WhatsApp</h3>
           
           {/* J0 */}
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Séquence J0 (Offre Initiale)</label>
              <textarea value={msgJ0} onChange={e => setMsgJ0(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-medium outline-none min-h-[100px] resize-none focus:border-[#39FF14]" />
              <div className="flex gap-2">
                 {['[Nom_Client]', '[Montant_Devis]', '[Lien_Catalogue]'].map(v => (
                    <button key={v} onClick={() => setMsgJ0(msgJ0 + ' ' + v)} className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white px-2 py-1 rounded-md transition-colors">{v}</button>
                 ))}
              </div>
           </div>

           {/* J+2 */}
           <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Séquence J+2 (Relance Catalogue)</label>
              <textarea value={msgJ2} onChange={e => setMsgJ2(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-medium outline-none min-h-[100px] resize-none focus:border-[#39FF14]" />
              <div className="flex gap-2">
                 {['[Nom_Client]', '[Montant_Devis]', '[Lien_Catalogue]'].map(v => (
                    <button key={v} onClick={() => setMsgJ2(msgJ2 + ' ' + v)} className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white px-2 py-1 rounded-md transition-colors">{v}</button>
                 ))}
              </div>
           </div>

           {/* J+7 */}
           <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Séquence J+7 (Dernière Relance)</label>
              <textarea value={msgJ7} onChange={e => setMsgJ7(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-medium outline-none min-h-[100px] resize-none focus:border-[#39FF14]" />
              <div className="flex gap-2">
                 {['[Nom_Client]', '[Montant_Devis]', '[Lien_Catalogue]'].map(v => (
                    <button key={v} onClick={() => setMsgJ7(msgJ7 + ' ' + v)} className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white px-2 py-1 rounded-md transition-colors">{v}</button>
                 ))}
              </div>
           </div>
           
           <button className="w-full mt-6 bg-black dark:bg-white text-[#39FF14] dark:text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2"><Save size={16}/> Sauvegarder les modèles</button>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-4 animate-in fade-in">
           <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center border border-purple-500/20"><Database size={24}/></div>
                 <div><h4 className="font-black text-base uppercase">Odoo ERP</h4><p className="text-xs font-bold text-zinc-500">Synchronisation des stocks & catalogue.</p></div>
              </div>
              <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">Déconnecté</span>
           </div>
           
           <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center border border-green-500/20"><MessageSquare size={24}/></div>
                 <div><h4 className="font-black text-base uppercase">WhatsApp Business API</h4><p className="text-xs font-bold text-zinc-500">Envoi de factures & devis automatisés.</p></div>
              </div>
              <span className="bg-green-500/10 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20">Connecté</span>
           </div>

           <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/20"><Activity size={24}/></div>
                 <div><h4 className="font-black text-base uppercase">Meta Ads API</h4><p className="text-xs font-bold text-zinc-500">Remontée des leads directs depuis Facebook/IG.</p></div>
              </div>
              <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">Déconnecté</span>
           </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in space-y-8">
           <h3 className="font-black text-xl uppercase mb-6">Import & Synchro Leads</h3>
           
           {/* Import Manuel & Mapping */}
           <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm uppercase flex items-center gap-2"><Database size={16}/> Import Manuel (CSV/Excel)</h4>
              <p className="text-xs text-zinc-500">Uploadez votre fichier pour déclencher l'assistant de Mapping des colonnes (ex: 'Téléphone 1' → 'phone').</p>
              <input type="file" accept=".csv, .xlsx" className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-100 dark:file:bg-zinc-900 file:text-black dark:file:text-white cursor-pointer" />
              <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-all">Lancer le Mapping IA</button>
           </div>

           {/* Google Sheets OAuth */}
           <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm uppercase flex items-center gap-2"><Plug size={16}/> Synchronisation Google Sheets</h4>
              <p className="text-xs text-zinc-500">Connectez votre compte Google pour synchroniser automatiquement vos tableaux de prospection en lecture seule.</p>
              
              <button className="flex items-center gap-2 bg-[#4285F4] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#3367D6] transition-colors shadow-md">
                 <Plug size={16}/> Se connecter avec Google
              </button>
              
              <div className="grid grid-cols-2 gap-4 mt-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                 <div className="col-span-2">
                    <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">ID du Spreadsheet</label>
                    <input type="text" placeholder="Ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" className="w-full p-3 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#39FF14]" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Début Campagne</label>
                    <input type="date" className="w-full p-3 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#39FF14] cursor-pointer" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Fin Campagne</label>
                    <input type="date" className="w-full p-3 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#39FF14] cursor-pointer" />
                 </div>
              </div>
              <button className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest w-full hover:scale-[1.02] transition-transform">Forcer la Synchro</button>
           </div>
        </div>
      )}
    </div>
  );
}