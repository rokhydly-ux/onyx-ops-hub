"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, Activity, Image as ImageIcon, Plus, Trash2, 
  Upload, X, CheckCircle, Search, BarChart2, Droplet, Scale, Loader2, Save 
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const spaceGrotesk = { className: "font-sans" };

export default function NutritionAdminPage() {
  const [activeTab, setActiveTab] = useState<'recettes' | 'statistiques'>('recettes');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [clientStatsData, setClientStatsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Ajout Recette
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    nom: '', type: 'Déjeuner', calories: 0, image_url: '', is_bol_commun: false,
    ingredients: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Recipes
    const { data: recipesData } = await supabase.from('nutrition_recipes').select('*').order('created_at', { ascending: false });
    if (recipesData) setRecipes(recipesData);

    // Fetch Clients
    const { data: clientsData } = await supabase.from('clients').select('*').eq('saas', 'Nutrition à l\'Africaine');
    if (clientsData) setClients(clientsData);

    setLoading(false);
  };

  useEffect(() => {
    if (selectedClient) {
      fetchClientStats(selectedClient);
    } else {
      setClientStatsData([]);
    }
  }, [selectedClient]);

  const fetchClientStats = async (clientId: string) => {
    const { data: dailyLogs } = await supabase.from('nutrition_daily_logs').select('*').eq('client_id', clientId).order('log_date', { ascending: true });
    const { data: weightLogs } = await supabase.from('nutrition_weight_logs').select('*').eq('client_id', clientId).order('log_date', { ascending: true });

    // Fusionner les données pour le graphique "Hydratation vs Poids"
    // On groupe par date
    const mergedData: Record<string, any> = {};

    if (dailyLogs) {
      dailyLogs.forEach(log => {
        mergedData[log.log_date] = {
          date: new Date(log.log_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          water: log.water_glasses || 0,
        };
      });
    }

    if (weightLogs) {
      weightLogs.forEach(log => {
        if (!mergedData[log.log_date]) {
          mergedData[log.log_date] = {
            date: new Date(log.log_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            water: 0,
          };
        }
        mergedData[log.log_date].weight = log.weight;
      });
    }

    // Convert and sort
    const finalData = Object.keys(mergedData).sort().map(key => mergedData[key]);
    
    // Remplir les "trous" de poids (reporter la dernière valeur connue si non pesé ce jour)
    let lastWeight = null;
    for (let i = 0; i < finalData.length; i++) {
        if (finalData[i].weight) {
            lastWeight = finalData[i].weight;
        } else if (lastWeight !== null) {
            finalData[i].weight = lastWeight;
        }
    }

    setClientStatsData(finalData);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const ext = file.name.split('.').pop();
      const fileName = `recipes/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const { error, data: uploadData } = await supabase.storage.from('nutrition').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('nutrition').getPublicUrl(fileName);
      setNewRecipe({ ...newRecipe, image_url: data.publicUrl });
    } catch (err: any) {
      alert("Erreur d'upload : " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Transformation des ingrédients textuels en JSON basique
      const ingredientsArray = newRecipe.ingredients.split(',').map(ing => {
         const parts = ing.trim().split(' ');
         const quantite = parts[0] ? parseFloat(parts[0]) : 0;
         const unite = parts[1] || '';
         const nom = parts.slice(2).join(' ') || ing.trim();
         return { nom, quantite, unite, rayon: 'Supermarché' };
      });

      const { data, error } = await supabase.from('nutrition_recipes').insert([{
        nom: newRecipe.nom,
        type: newRecipe.type,
        calories: newRecipe.calories,
        image_url: newRecipe.image_url,
        is_bol_commun: newRecipe.is_bol_commun,
        ingredients: ingredientsArray
      }]).select();

      if (error) throw error;
      if (data) setRecipes([data[0], ...recipes]);
      setShowAddRecipe(false);
      setNewRecipe({ nom: '', type: 'Déjeuner', calories: 0, image_url: '', is_bol_commun: false, ingredients: '' });
      alert("Recette ajoutée avec succès !");
    } catch (error: any) {
      alert("Erreur lors de l'ajout : " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette recette ?")) return;
    try {
      const { error } = await supabase.from('nutrition_recipes').delete().eq('id', id);
      if (error) throw error;
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (err: any) {
      alert("Erreur de suppression : " + err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-24">
      {/* Header Admin */}
      <header className="bg-black text-white px-6 py-6 border-b-4 border-[#39FF14] flex justify-between items-center">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#39FF14] text-black rounded-xl flex items-center justify-center font-black">
                 N
             </div>
             <div>
                 <h1 className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter`}>Onyx Nutrition</h1>
                 <p className="text-[10px] text-[#39FF14] font-black uppercase tracking-widest">Admin Coach</p>
             </div>
         </div>
         <button onClick={() => window.location.href = '/hub'} className="text-zinc-400 hover:text-white text-sm font-bold transition-colors">Retour au Hub</button>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-10">
         {/* Onglets */}
         <div className="flex bg-zinc-200/50 p-1.5 rounded-2xl w-max mb-8">
            <button onClick={() => setActiveTab('recettes')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'recettes' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Gestion des Recettes</button>
            <button onClick={() => setActiveTab('statistiques')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'statistiques' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Statistiques Clients</button>
         </div>

         {/* VUE GESTION DES RECETTES */}
         {activeTab === 'recettes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
               <div className="flex justify-between items-center mb-8">
                   <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>Plats du Smart Planner</h2>
                   <button onClick={() => setShowAddRecipe(true)} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                      <Plus size={16}/> Ajouter une recette
                   </button>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map(recipe => (
                     <div key={recipe.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="h-48 bg-zinc-100 relative">
                           {recipe.image_url ? (
                              <img src={recipe.image_url} alt={recipe.nom} className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                 <ImageIcon size={32} className="mb-2 opacity-50" />
                                 <span className="text-xs font-bold">Aucune photo</span>
                              </div>
                           )}
                           <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              {recipe.type}
                           </div>
                           <button onClick={() => handleDeleteRecipe(recipe.id)} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md">
                              <Trash2 size={14}/>
                           </button>
                        </div>
                        <div className="p-5">
                           <h3 className="font-black text-lg text-black mb-1">{recipe.nom}</h3>
                           <p className="text-orange-500 font-black text-xs uppercase mb-3">{recipe.calories} kcal</p>
                           {recipe.is_bol_commun && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase">Bol Commun</span>}
                        </div>
                     </div>
                  ))}
                  {recipes.length === 0 && (
                     <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                        <p className="text-zinc-500 font-bold">Aucune recette configurée. Ajoutez-en une pour alimenter le Smart Planner.</p>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* VUE STATISTIQUES COACH */}
         {activeTab === 'statistiques' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-8`}>Impact Hydratation vs Poids</h2>
               
               <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm mb-8">
                  <div className="max-w-md mb-8">
                     <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block">Sélectionner un client</label>
                     <select 
                        value={selectedClient} 
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition cursor-pointer"
                     >
                        <option value="">-- Choisir une cliente --</option>
                        {clients.map(c => (
                           <option key={c.id} value={c.id}>{c.full_name || c.phone}</option>
                        ))}
                     </select>
                  </div>

                  {selectedClient ? (
                     clientStatsData.length > 0 ? (
                        <div className="h-96 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={clientStatsData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                 <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                 <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Verres d\'eau', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 12, fontWeight: 'bold' }} />
                                 <YAxis yAxisId="right" orientation="right" stroke="#39FF14" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} label={{ value: 'Poids (kg)', angle: 90, position: 'insideRight', fill: '#16a34a', fontSize: 12, fontWeight: 'bold' }} />
                                 <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                                    labelStyle={{ fontWeight: 'bold', color: '#000' }}
                                 />
                                 <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
                                 
                                 <Bar yAxisId="left" dataKey="water" name="Hydratation (verres)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                 <Line yAxisId="right" type="monotone" dataKey="weight" name="Poids (kg)" stroke="#39FF14" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#16a34a' }} activeDot={{ r: 6 }} />
                              </ComposedChart>
                           </ResponsiveContainer>
                        </div>
                     ) : (
                        <div className="py-12 text-center text-zinc-500 font-bold">
                           Pas assez de données (logs ou pesées) pour ce client.
                        </div>
                     )
                  ) : (
                     <div className="py-12 text-center text-zinc-400 font-bold">
                        Veuillez sélectionner un client pour voir l'impact de son hydratation sur sa perte de poids.
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>

      {/* MODAL AJOUTER UNE RECETTE */}
      {showAddRecipe && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowAddRecipe(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
             <button onClick={() => setShowAddRecipe(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
             <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6`}>Nouvelle Recette</h2>
             
             <form onSubmit={handleSaveRecipe} className="space-y-4">
                <div>
                   <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Nom du plat</label>
                   <input type="text" required value={newRecipe.nom} onChange={e => setNewRecipe({...newRecipe, nom: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" placeholder="Ex: Thieboudienne Diététique" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Type de Repas</label>
                      <select value={newRecipe.type} onChange={e => setNewRecipe({...newRecipe, type: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition cursor-pointer">
                         <option value="Petit-déjeuner">Petit-déjeuner</option>
                         <option value="Déjeuner">Déjeuner</option>
                         <option value="Collation">Collation</option>
                         <option value="Dîner">Dîner</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Calories (Estimées)</label>
                      <input type="number" required value={newRecipe.calories} onChange={e => setNewRecipe({...newRecipe, calories: parseInt(e.target.value)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Image / Photo appétissante (Optionnel)</label>
                   <div className="flex gap-2 items-center">
                     <input type="url" value={newRecipe.image_url} onChange={e => setNewRecipe({...newRecipe, image_url: e.target.value})} className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" placeholder="https://..." />
                     <label className="bg-zinc-100 p-4 rounded-xl cursor-pointer hover:bg-zinc-200 transition flex items-center justify-center" title="Uploader une photo">
                        {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                     </label>
                   </div>
                   {newRecipe.image_url && <img src={newRecipe.image_url} alt="Aperçu" className="mt-2 w-full h-32 object-cover rounded-xl border border-zinc-200 shadow-sm" />}
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Ingrédients & Recette (Format libre)</label>
                   <textarea required value={newRecipe.ingredients} onChange={e => setNewRecipe({...newRecipe, ingredients: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition min-h-[100px] resize-y" placeholder="Ex: 50 g Fonio, 150 g Poulet, 1 càs Huile..." />
                </div>

                <label className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:border-black transition">
                   <input type="checkbox" checked={newRecipe.is_bol_commun} onChange={e => setNewRecipe({...newRecipe, is_bol_commun: e.target.checked})} className="w-5 h-5 accent-black" />
                   <div>
                      <p className="font-bold text-sm">C'est un "Bol Commun"</p>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Le planificateur l'intégrera spécifiquement 2 à 3 fois par semaine.</p>
                   </div>
                </label>

                <button type="submit" disabled={isSaving || uploadingImage} className="w-full mt-4 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50">
                   {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Sauvegarder la recette
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}