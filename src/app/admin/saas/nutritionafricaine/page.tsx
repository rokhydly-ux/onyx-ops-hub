"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Users, Search, Activity, HeartPulse, ExternalLink, ChevronLeft, Calendar, Flame, Droplet, Target, AlertTriangle, Clock, Utensils, Plus, Edit3, Trash2, X, Save, CheckCircle } from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function AdminNutritionAfricaine() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'clients'|'recipes'>('clients');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [recipeForm, setRecipeForm] = useState({ id: '', type: 'Petit-déjeuner', nom: '', calories: 0, proteins: 0, carbs: 0, fats: 0, is_bol_commun: false, recipe: '', ingredients: [] as any[] });

  useEffect(() => {
    const fetchClients = async () => {
      // Pour cet affichage on join nutrition_profiles et nutrition_daily_logs
      const { data: profiles, error } = await supabase
        .from('nutrition_profiles')
        .select(`
          *,
          client:clients(*),
          logs:nutrition_daily_logs(*)
        `)
        .order('created_at', { ascending: false });

      if (profiles && !error) {
        setClients(profiles);
      }
      setLoading(false);
    };

    const fetchRecipes = async () => {
      const { data } = await supabase.from('nutrition_recipes').select('*').order('created_at', { ascending: false });
      if (data) setRecipes(data);
    };

    fetchClients();
    fetchRecipes();
  }, []);

  const filteredClients = clients.filter(c => 
    c.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const handleOpenRecipeModal = (recipe?: any) => {
     if (recipe) {
         setEditingRecipe(recipe);
         setRecipeForm({ ...recipe, ingredients: recipe.ingredients || [] });
     } else {
         setEditingRecipe(null);
         setRecipeForm({ id: '', type: 'Petit-déjeuner', nom: '', calories: 0, proteins: 0, carbs: 0, fats: 0, is_bol_commun: false, recipe: '', ingredients: [] });
     }
     setShowRecipeModal(true);
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { ...recipeForm };
      delete payload.id;
      if (editingRecipe) {
          const { error } = await supabase.from('nutrition_recipes').update(payload).eq('id', recipeForm.id);
          if (!error) { setRecipes(recipes.map(r => r.id === recipeForm.id ? { ...payload, id: recipeForm.id } : r)); setShowRecipeModal(false); }
          else alert(error.message);
      } else {
          const { data, error } = await supabase.from('nutrition_recipes').insert([payload]).select().single();
          if (!error && data) { setRecipes([data, ...recipes]); setShowRecipeModal(false); }
          else alert(error?.message);
      }
  };

  const handleDeleteRecipe = async (id: string) => {
      if (!confirm("Supprimer cette recette ?")) return;
      await supabase.from('nutrition_recipes').delete().eq('id', id);
      setRecipes(recipes.filter(r => r.id !== id));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black"><Activity className="animate-spin text-[#39FF14]" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-24">
      <header className="bg-black text-white px-8 py-6 flex items-center justify-between sticky top-0 z-30 border-b-4 border-[#39FF14]">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors font-black uppercase text-xs tracking-widest bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
            <ChevronLeft size={16}/> Retour SaaS (Admin)
          </button>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <HeartPulse className="text-[#39FF14]"/> Coach <span className="text-[#39FF14]">Nutrition</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div>
               <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter`}>Tableau de bord Coach</h2>
               <p className="text-zinc-500 font-bold mt-2">Suivez l'évolution de vos clients et configurez les menus générés.</p>
            </div>
            
            <div className="flex bg-white border border-zinc-200 p-1.5 rounded-2xl w-full md:w-auto shadow-sm">
               <button onClick={() => setActiveTab('clients')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'clients' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Suivi Clients</button>
               <button onClick={() => setActiveTab('recipes')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'recipes' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Menus & Recettes</button>
            </div>
            
            {activeTab === 'clients' && (
            <div className="relative w-full md:w-auto">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
               <input 
                  type="text" 
                  placeholder="Rechercher un client..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 p-4 pl-12 bg-white border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black shadow-sm"
               />
            </div>
            )}
            {activeTab === 'recipes' && (
               <button onClick={() => handleOpenRecipeModal()} className="w-full md:w-auto bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"><Plus size={16}/> Nouvelle Recette</button>
            )}
        </div>

        {activeTab === 'clients' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredClients.map(profile => {
              const clientName = profile.client?.full_name || "Client Inconnu";
              const phone = profile.phone || profile.client?.phone || "";
              
              // Trouver le log du jour
              const todayStr = new Date().toISOString().split('T')[0];
              const todayLog = profile.logs?.find((l: any) => l.log_date === todayStr);

              const calsConsumed = todayLog?.calories_consumed || 0;
              const protsConsumed = todayLog?.proteins_consumed || 0;
              const calsGoal = profile.daily_calorie_goal || 1500;
              const protsGoal = profile.protein_goal || 80;

              // LOGIQUE D'ALERTES COACH
              const isOverCalories = calsConsumed > calsGoal;
              let isMissingLogs = false;
              
              const threeDaysAgo = new Date();
              threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
              
              if (profile.logs && profile.logs.length > 0) {
                 const sortedLogs = [...profile.logs].sort((a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
                 const latestLogDate = new Date(sortedLogs[0].log_date);
                 if (latestLogDate.getTime() < threeDaysAgo.getTime()) isMissingLogs = true;
              } else {
                 const createdAt = new Date(profile.created_at || new Date());
                 if (createdAt.getTime() < threeDaysAgo.getTime()) isMissingLogs = true;
              }

              return (
                 <div key={profile.id} className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm hover:border-[#39FF14] hover:shadow-xl transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <img src={profile.client?.avatar_url || `https://ui-avatars.com/api/?name=${clientName}`} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-zinc-100 object-cover" />
                          <div>
                             <h3 className="font-black uppercase text-sm">{clientName}</h3>
                             <p className="text-xs font-mono text-zinc-500">{phone}</p>
                          </div>
                       </div>
                       <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${profile.tracking_mode === 'guided' || profile.tracking_mode === 'autopilot' ? 'bg-black text-[#39FF14]' : 'bg-[#00E5FF]/20 text-[#00E5FF]'}`}>
                          {profile.tracking_mode === 'guided' || profile.tracking_mode === 'autopilot' ? 'Guidé' : 'Libre'}
                       </span>
                    </div>

                    {/* ZONES D'ALERTES */}
                    {(isOverCalories || isMissingLogs) && (
                       <div className="flex flex-col gap-2 mb-4">
                          {isOverCalories && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><AlertTriangle size={14}/> Dépassement Calorique</div>}
                          {isMissingLogs && <div className="bg-orange-50 text-orange-600 px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><Clock size={14}/> Inactif depuis +3 jours</div>}
                       </div>
                    )}

                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mb-6 space-y-4 flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 border-b border-zinc-200 pb-2 flex justify-between">
                          <span>Suivi du jour</span>
                          <span>{todayLog ? 'Actif' : 'Pas de log'}</span>
                       </p>
                       
                       <div>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                             <span className="text-orange-500 flex items-center gap-1"><Flame size={12}/> Calories</span>
                             <span className="text-zinc-500">{calsConsumed} / {calsGoal}</span>
                          </div>
                          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                             <div className={`h-full ${calsConsumed > calsGoal ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min((calsConsumed/calsGoal)*100, 100)}%` }}></div>
                          </div>
                       </div>

                       <div>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                             <span className="text-[#39FF14] flex items-center gap-1"><Target size={12}/> Protéines</span>
                             <span className="text-zinc-500">{protsConsumed} / {protsGoal}g</span>
                          </div>
                          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-[#39FF14] h-full" style={{ width: `${Math.min((protsConsumed/protsGoal)*100, 100)}%` }}></div>
                          </div>
                       </div>
                    </div>

                    <button onClick={() => window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank')} className="w-full bg-black text-[#39FF14] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform flex justify-center items-center gap-2">
                       Contacter sur WhatsApp <ExternalLink size={14}/>
                  </button>
                 </div>
              );
           })}
           
           {filteredClients.length === 0 && (
              <div className="col-span-full text-center py-20">
                 <Users size={48} className="text-zinc-300 mx-auto mb-4" />
                 <p className="text-zinc-500 font-bold">Aucun profil client trouvé.</p>
              </div>
           )}
        </div>
        ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Type & Nom</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Macros</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Bol Commun</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {recipes.map(r => (
                       <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4">
                             <p className="font-bold text-sm text-black">{r.nom}</p>
                             <p className="text-[10px] font-black text-zinc-500 uppercase mt-1">{r.type}</p>
                          </td>
                          <td className="p-4">
                             <div className="flex gap-3 text-xs font-bold">
                                <span className="text-orange-500 flex items-center gap-1"><Flame size={12}/> {r.calories} kcal</span>
                                <span className="text-green-500">P:{r.proteins}g</span>
                                <span className="text-yellow-600">G:{r.carbs}g</span>
                                <span className="text-zinc-500">L:{r.fats}g</span>
                             </div>
                          </td>
                          <td className="p-4">
                             {r.is_bol_commun ? <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Oui</span> : <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Non</span>}
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                             <button onClick={() => handleOpenRecipeModal(r)} className="p-2 bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors"><Edit3 size={16}/></button>
                             <button onClick={() => handleDeleteRecipe(r.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          </td>
                       </tr>
                    ))}
                    {recipes.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-400 font-bold">Aucune recette configurée.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
        )}
      </main>

      {/* MODALE RECETTE */}
      {showRecipeModal && (
         <div id="recipe-modal-overlay" onClick={(e: any) => e.target.id === 'recipe-modal-overlay' && setShowRecipeModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto max-h-[90vh] overflow-y-auto custom-scrollbar text-black">
               <button onClick={() => setShowRecipeModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3`}>
                  <Utensils className="text-[#39FF14]" size={28}/> {editingRecipe ? 'Modifier Recette' : 'Nouvelle Recette'}
               </h2>
               
               <form onSubmit={handleSaveRecipe} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Type de Repas</label>
                        <select value={recipeForm.type} onChange={e => setRecipeForm({...recipeForm, type: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black cursor-pointer">
                           <option value="Petit-déjeuner">Petit-déjeuner</option>
                           <option value="Déjeuner">Déjeuner</option>
                           <option value="Collation">Collation</option>
                           <option value="Dîner">Dîner</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Nom du Plat</label>
                        <input type="text" required value={recipeForm.nom} onChange={e => setRecipeForm({...recipeForm, nom: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black" placeholder="Ex: Thieboudienne Diététique" />
                     </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-orange-500 tracking-widest ml-1">Kcal</label><input type="number" required value={recipeForm.calories} onChange={e => setRecipeForm({...recipeForm, calories: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-green-500 tracking-widest ml-1">Prot(g)</label><input type="number" required value={recipeForm.proteins} onChange={e => setRecipeForm({...recipeForm, proteins: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-yellow-600 tracking-widest ml-1">Gluc(g)</label><input type="number" required value={recipeForm.carbs} onChange={e => setRecipeForm({...recipeForm, carbs: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Lip(g)</label><input type="number" required value={recipeForm.fats} onChange={e => setRecipeForm({...recipeForm, fats: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-100 transition-colors">
                     <input type="checkbox" checked={recipeForm.is_bol_commun} onChange={e => setRecipeForm({...recipeForm, is_bol_commun: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                     <div>
                        <p className="font-black text-sm uppercase text-blue-800">C'est un "Bol Commun"</p>
                        <p className="text-[10px] font-bold text-blue-600">Repas partagé en famille (le Smart Planner en intègre 2-3 / sem).</p>
                     </div>
                  </label>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Instructions / Recette</label>
                     <textarea value={recipeForm.recipe} onChange={e => setRecipeForm({...recipeForm, recipe: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black min-h-[100px]" placeholder="Astuces de cuisson, remplacement d'ingrédients..."></textarea>
                  </div>

                  <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200">
                     <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ingrédients (Liste de courses)</label>
                        <button type="button" onClick={() => setRecipeForm({...recipeForm, ingredients: [...recipeForm.ingredients, { nom: '', quantite: 1, unite: 'g', rayon: 'Supermarché' }]})} className="bg-black text-[#39FF14] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:scale-105 transition-transform"><Plus size={12}/> Ajouter</button>
                     </div>
                     <div className="space-y-3">
                        {recipeForm.ingredients.map((ing, i) => (
                           <div key={i} className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-white p-2 rounded-xl border border-zinc-100">
                              <input type="text" placeholder="Nom" required value={ing.nom} onChange={e => { const newI = [...recipeForm.ingredients]; newI[i].nom = e.target.value; setRecipeForm({...recipeForm, ingredients: newI}); }} className="flex-1 min-w-[100px] p-2 bg-zinc-50 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-black" />
                              <input type="number" placeholder="Qté" required value={ing.quantite} onChange={e => { const newI = [...recipeForm.ingredients]; newI[i].quantite = Number(e.target.value); setRecipeForm({...recipeForm, ingredients: newI}); }} className="w-16 p-2 bg-zinc-50 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-black text-center" />
                              <input type="text" placeholder="Unité" required value={ing.unite} onChange={e => { const newI = [...recipeForm.ingredients]; newI[i].unite = e.target.value; setRecipeForm({...recipeForm, ingredients: newI}); }} className="w-16 p-2 bg-zinc-50 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-black text-center" />
                              <select value={ing.rayon} onChange={e => { const newI = [...recipeForm.ingredients]; newI[i].rayon = e.target.value; setRecipeForm({...recipeForm, ingredients: newI}); }} className="w-32 p-2 bg-zinc-50 rounded-lg text-[10px] font-black uppercase outline-none border border-transparent focus:border-black cursor-pointer">
                                 <option value="Supermarché">Supermarché</option>
                                 <option value="Marché local">Marché local</option>
                                 <option value="Boucherie / Pêche">Boucherie / Pêche</option>
                              </select>
                              <button type="button" onClick={() => { const newI = [...recipeForm.ingredients]; newI.splice(i, 1); setRecipeForm({...recipeForm, ingredients: newI}); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                           </div>
                        ))}
                        {recipeForm.ingredients.length === 0 && <p className="text-xs text-zinc-400 italic text-center py-2">Aucun ingrédient ajouté.</p>}
                     </div>
                  </div>

                  <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                     <CheckCircle size={20}/> Enregistrer la recette
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}