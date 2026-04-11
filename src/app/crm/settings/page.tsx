"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Settings, Save, Image as ImageIcon, Loader2, Palette, Type, Users, Bot, Plug, Plus, MessageSquare, Database, Activity, Phone, Edit, Trash2, X, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Papa from 'papaparse';

function CRMSettingsContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [settings, setSettings] = useState({ crm_name: 'ONYX CRM', logo_url: '', theme_color: '#39FF14' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'team' || tabFromUrl === 'equipe' ? 'team' : 'general');
  const [userId, setUserId] = useState<string | null>(null);

  const [commercials, setCommercials] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState(false);
  const [editingCommercial, setEditingCommercial] = useState<any>(null);
  const [commercialForm, setCommercialForm] = useState({ full_name: '', phone: '', objective: 20, status: 'Actif', password_temp: '0000' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const [msgJ0, setMsgJ0] = useState('Bonjour [Nom_Client], voici notre offre détaillée pour le montant de [Montant_Devis].');
  const [msgJ2, setMsgJ2] = useState('Bonjour [Nom_Client], avez-vous pu consulter notre proposition ?');
  const [msgJ7, setMsgJ7] = useState('Dernière relance pour votre devis. Cliquez ici : [Lien_Catalogue]');

  const handleOutsideClick = (setter: any, val: any = false) => (e: any) => {
    if (e.target.id === "modal-overlay") setter(val);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const tId = user.user_metadata?.tenant_id || user.id;

        setUserId(tId);
        const { data } = await supabase.from('crm_settings').select('*').eq('tenant_id', tId).maybeSingle();
        if (data) setSettings({ crm_name: data.crm_name || 'ONYX CRM', logo_url: data.logo_url || '', theme_color: data.theme_color || '#39FF14' });
        
        const { data: comms } = await supabase.from('commercials').select('*').eq('tenant_id', tId);
        if (comms) setCommercials(comms);
        
        const { data: leads } = await supabase.from('crm_leads').select('status, assigned_to').eq('tenant_id', tId);
        if (leads) setAllLeads(leads);
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
    
    // On vérifie si la ligne existe pour éviter le conflit de clé primaire (crm_settings_pkey)
    const { data: existing } = await supabase.from('crm_settings').select('tenant_id').eq('tenant_id', userId).maybeSingle();
    let error;
    if (existing) {
        const res = await supabase.from('crm_settings').update(settings).eq('tenant_id', userId);
        error = res.error;
    } else {
        const res = await supabase.from('crm_settings').insert([{ tenant_id: userId, ...settings }]);
        if (res.error && res.error.code === '23505') { // Code d'erreur pour contrainte unique
            const retry = await supabase.from('crm_settings').update(settings).eq('tenant_id', userId);
            error = retry.error;
        } else {
            error = res.error;
        }
    }
    
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

  const handleFileUploadCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Utilisateur non authentifié.");
    const tenantId = user.user_metadata?.tenant_id || user.id;

    Papa.parse(file, {
       header: true,
       skipEmptyLines: true,
       complete: async (results) => {
          const newLeads = results.data.map((row: any) => {
             const r: any = {};
             Object.keys(row).forEach(k => r[k.toLowerCase()] = row[k]);
             
             const name = r['full_name'] || r['name'] || r['nom'] || 'Lead Facebook';
             let phoneRaw = r['whatsapp_number'] || r['phone_number'] || r['phone'] || r['téléphone'] || r['numero'] || '';
             let phone = String(phoneRaw).replace(/\s+/g, '');
             if (phone && !phone.startsWith('+')) {
                 phone = phone.startsWith('221') ? `+${phone}` : `+221${phone}`;
             }
             
             const campaign = r['campaign_name'] || r['campagne'] || '';
             const email = r['email'] || '';
             
             let score = 'Froid';
             let timeframe = 'Se renseigne';
             let budget = 0;
             const stateKey = Object.keys(r).find(k => k.includes('projet') || k.includes('état') || k.includes('etat'));
             
             if (stateKey) {
                const val = String(r[stateKey]).toLowerCase();
                if (val.includes('concret') || val.includes('maintenant') || val.includes('immédiat') || val.includes('pâtisserie') || val.includes('boulangerie')) {
                   score = 'Chaud'; timeframe = 'Immédiat'; budget = 150000;
                } else if (val.includes('mois') || val.includes('semaine')) {
                   score = 'Tiède'; timeframe = '0-3 mois'; budget = 50000;
                } else if (val.includes('renseigne') || val.includes('curiosité')) {
                   score = 'Froid'; timeframe = 'Se renseigne'; budget = 0;
                }
             }
             
             return {
                tenant_id: tenantId,
                full_name: name,
                phone: phone,
                email: email,
                campaign_name: campaign,
                lead_score: score,
                timeframe: timeframe,
                budget: budget,
                amount: budget,
                status: 'Nouveaux Leads',
                source: 'Facebook Ads',
                intent: campaign || 'Campagne FB',
             };
          }).filter(l => l.phone); // Exclut les lignes sans numéro
          
          if (newLeads.length === 0) return alert("Aucun lead avec un numéro valide n'a été trouvé.");

          setIsSubmitting(true);
          const { data, error } = await supabase.from('crm_leads').insert(newLeads).select();
          setIsSubmitting(false);
          
          if (!error && data) {
             alert(`${data.length} leads importés et scorés par l'IA avec succès !`);
             if (csvFileInputRef.current) csvFileInputRef.current.value = '';
          } else {
             alert("Erreur lors de l'importation : " + error?.message);
          }
       }
    });
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
              <button onClick={() => { setEditingCommercial(null); setCommercialForm({ full_name: '', phone: '', objective: 20, status: 'Actif', password_temp: '0000' }); setIsCommercialModalOpen(true); }} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"><Plus size={16}/> Ajouter Commercial</button>
           </div>
           <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                 <tr>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Utilisateur</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Workload (Leads Actifs)</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Objectif Mensuel</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Statut</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                 {commercials.map(member => {
                    const activeLeadsCount = allLeads.filter(l => l.assigned_to === member.full_name && !['Gagné', 'Perdu', 'Converti'].includes(l.status)).length;
                    const workloadColor = activeLeadsCount > 15 ? 'text-red-500 bg-red-500/10 border-red-500/20' : activeLeadsCount > 10 ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 'text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/30';

                    return (
                    <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                       <td className="p-5">
                          <p className="font-black text-sm uppercase">{member.full_name}</p>
                          <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1"><Phone size={10} className="inline mr-1"/> {member.phone}</p>
                       </td>
                       <td className="p-5 text-center">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${workloadColor}`}>{activeLeadsCount} Leads</span>
                       </td>
                       <td className="p-5 text-center">
                          <span className="font-black text-lg text-black dark:text-white">{member.objective || 20}</span>
                       </td>
                       <td className="p-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${member.status === 'Actif' ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{member.status || 'Actif'}</span>
                       </td>
                       <td className="p-5 text-right">
                          <button onClick={() => {
                             setEditingCommercial(member);
                             setCommercialForm({ full_name: member.full_name, phone: member.phone, objective: member.objective || 20, status: member.status || 'Actif', password_temp: member.password_temp || '••••' });
                             setIsCommercialModalOpen(true);
                          }} className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"><Edit size={16}/></button>
                          <button onClick={async () => {
                             if (confirm('Supprimer ce commercial ?')) {
                                await fetch('/api/crm/commercials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: member.id, tenant_id: userId }) });
                                setCommercials(prev => prev.filter(c => c.id !== member.id));
                             }
                          }} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                       </td>
                    </tr>
                 )})}
                 {commercials.length === 0 && (
                    <tr><td colSpan={5} className="p-10 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest italic">Aucun commercial trouvé.</td></tr>
                 )}
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
           
           {/* Import IA & CSV Facebook Ads */}
           <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm uppercase flex items-center gap-2"><Database size={16}/> Import IA (CSV Facebook Ads)</h4>
              <p className="text-xs text-zinc-500">Uploadez votre export Facebook brut. L'IA se chargera de le structurer, le scorer et de calculer le budget prévisionnel.</p>
              <input type="file" accept=".csv" className="hidden" ref={csvFileInputRef} onChange={handleFileUploadCSV} />
              <button onClick={() => csvFileInputRef.current?.click()} disabled={isSubmitting} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-md flex items-center gap-2 w-max">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} 
                  {isSubmitting ? 'Traitement en cours...' : 'Uploader un fichier CSV'}
              </button>
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

      {/* MODALE COMMERCIAL */}
      {isCommercialModalOpen && (
        <div id="modal-overlay" onClick={handleOutsideClick(setIsCommercialModalOpen, false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <button onClick={() => setIsCommercialModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h3 className="text-xl font-black uppercase mb-6 text-black dark:text-white">{editingCommercial ? 'Modifier' : 'Ajouter'} un commercial</h3>
            <form onSubmit={async (e) => {
               e.preventDefault();
               setIsSubmitting(true);
               try {
               const payload: any = { ...commercialForm, tenant_id: userId };
               let cleanPhone = payload.phone.replace(/\s+/g, '');
               if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) cleanPhone = `+221${cleanPhone}`;
               else if (!cleanPhone.startsWith('+')) cleanPhone = `+${cleanPhone}`;
               payload.phone = cleanPhone;

               if (editingCommercial) {
                   const { error } = await supabase.from('commercials').update({
                       full_name: payload.full_name,
                       phone: payload.phone,
                       objective: payload.objective,
                       status: payload.status,
                       password_temp: payload.password_temp === '••••' ? editingCommercial.password_temp : payload.password_temp
                   }).eq('id', editingCommercial.id).eq('tenant_id', userId);
                   if (error) throw error;
               } else {
                   const { error } = await supabase.from('commercials').insert([{
                       full_name: payload.full_name,
                       phone: payload.phone,
                       objective: payload.objective,
                       status: payload.status || 'Actif',
                       password_temp: payload.password_temp === '••••' || !payload.password_temp ? '0000' : payload.password_temp,
                       tenant_id: userId
                   }]);
                   if (error) throw error;
               }

               const { data } = await supabase.from('commercials').select('*').eq('tenant_id', userId);
               if (data) setCommercials(data);
               setIsCommercialModalOpen(false);
               } catch (err: any) {
                   alert("Erreur de sauvegarde: " + err.message);
               } finally {
               setIsSubmitting(false);
               }
            }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Nom complet</label>
                <input type="text" required value={commercialForm.full_name} onChange={e => setCommercialForm({...commercialForm, full_name: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Téléphone</label>
                <input type="tel" required value={commercialForm.phone} onChange={e => setCommercialForm({...commercialForm, phone: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Code PIN</label>
                <input type="password" required inputMode="numeric" maxLength={4} value={commercialForm.password_temp} onChange={e => setCommercialForm({...commercialForm, password_temp: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-zinc-500 uppercase">Objectif</label>
                   <input type="number" required value={commercialForm.objective} onChange={e => setCommercialForm({...commercialForm, objective: parseInt(e.target.value) || 0})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white" />
                 </div>
                 {editingCommercial && (
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase">Statut</label>
                      <select value={commercialForm.status} onChange={e => setCommercialForm({...commercialForm, status: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white appearance-none cursor-pointer">
                         <option value="Actif">Actif</option>
                         <option value="Suspendu">Suspendu</option>
                      </select>
                    </div>
                 )}
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-black dark:bg-white text-[#39FF14] dark:text-black font-black uppercase text-sm py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50">
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

export default function CRMSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>}>
      <CRMSettingsContent />
    </Suspense>
  );
}