"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Users, Search, Activity, HeartPulse, ExternalLink, ChevronLeft, Calendar, Flame, Droplet, Target, AlertTriangle, Clock, Utensils, Plus, Edit3, Trash2, X, Save, CheckCircle, LineChart as LineChartIcon, BarChart as BarChartIcon, Upload, ShoppingBag, ShoppingCart, Package, MessageSquare, Ticket, Database, Loader2, Mail, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Papa from 'papaparse';

const spaceGrotesk = { className: "font-sans" };

export default function AdminNutritionAfricaine() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'clients'|'recipes'|'shop'|'orders'|'promos'>('clients');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [recipeForm, setRecipeForm] = useState({ id: '', type: 'Petit-déjeuner', nom: '', calories: 0, proteins: 0, carbs: 0, fats: 0, is_bol_commun: false, recipe: '', ingredients: [] as any[], image_url: '', description: '', gallery: [] as string[] });
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clientForm, setClientForm] = useState({ id: '', daily_calorie_goal: 0, protein_goal: 0, carbs_goal: 0, fats_goal: 0, tracking_mode: 'guided' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileProductInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ id: '', produit_id: '', categorie_nom: '', nom: '', description_courte: '', description_longue: '', prix_standard: 0, prix_premium: 0, stock: 0, image_url: '', badge: '', goal: 'all' });
  const [promos, setPromos] = useState<any[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [promoForm, setPromoForm] = useState({ id: '', code: '', discount_pct: 10, min_xp: 0, active: true });

  const [pendingProductCsvFile, setPendingProductCsvFile] = useState<any>(null);
  const [isImportingProductCsv, setIsImportingProductCsv] = useState(false);
  const [productCsvImportProgress, setProductCsvImportProgress] = useState(0);

  const [pendingRecipeCsvFile, setPendingRecipeCsvFile] = useState<any>(null);
  const [isImportingRecipeCsv, setIsImportingRecipeCsv] = useState(false);
  const [recipeCsvImportProgress, setRecipeCsvImportProgress] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      // Fetch clients d'abord avec un ilike pour capturer toutes les variantes de "Nutrition"
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .ilike('saas', '%utrition%')
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        setLoading(false);
        return;
      }

      if (clientsData && clientsData.length > 0) {
        const clientIds = clientsData.map(c => c.id);

        // Fetch manuel pour éviter les problèmes de clés étrangères non définies côté postgREST
        const [profilesRes, logsRes, weightLogsRes] = await Promise.all([
           supabase.from('nutrition_profiles').select('*').in('client_id', clientIds),
           supabase.from('nutrition_daily_logs').select('*').in('client_id', clientIds),
           supabase.from('nutrition_weight_logs').select('*').in('client_id', clientIds)
        ]);

        const profiles = profilesRes.data || [];
        const logs = logsRes.data || [];
        const weightLogs = weightLogsRes.data || [];

        const mappedProfiles = clientsData.map(c => {
           const prof = profiles.find(p => p.client_id === c.id) || {};
           const clientLogs = logs.filter(l => l.client_id === c.id) || [];
           const clientWeightLogs = weightLogs.filter(w => w.client_id === c.id) || [];
           
           return {
              ...prof,
              id: prof.id || c.id,
              client: c,
              phone: c.phone || prof.phone,
              logs: clientLogs,
              weight_logs: clientWeightLogs,
              daily_calorie_goal: prof.daily_calorie_goal || 1500,
              protein_goal: prof.protein_goal || 80
           };
        });
        setClients(mappedProfiles);
      } else {
        setClients([]);
      }
      setLoading(false);
    };

    const fetchRecipes = async () => {
      const { data } = await supabase.from('nutrition_recipes').select('*').order('created_at', { ascending: false });
      if (data) setRecipes(data);
    };

    const fetchShopAndOrders = async () => {
      const [prods, ords, promosRes] = await Promise.all([
         supabase.from('nutrition_products').select('*').order('created_at', { ascending: false }),
         supabase.from('nutrition_orders').select('*').order('created_at', { ascending: false }),
         supabase.from('nutrition_promo_codes').select('*').order('created_at', { ascending: false })
      ]);
      if (prods.data) setProducts(prods.data);
      if (ords.data) setOrders(ords.data);
      if (promosRes.data) setPromos(promosRes.data);
    };

    fetchClients();
    fetchRecipes();
    fetchShopAndOrders();
  }, []);

  const filteredClients = clients.filter(c => 
    c.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const handleOpenRecipeModal = (recipe?: any) => {
     if (recipe) {
         setEditingRecipe(recipe);
         setRecipeForm({ ...recipe, ingredients: recipe.ingredients || [], gallery: recipe.gallery || [], image_url: recipe.image_url || '', description: recipe.description || '' });
     } else {
         setEditingRecipe(null);
         setRecipeForm({ id: '', type: 'Petit-déjeuner', nom: '', calories: 0, proteins: 0, carbs: 0, fats: 0, is_bol_commun: false, recipe: '', ingredients: [], image_url: '', description: '', gallery: [] });
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

  const handleOpenClientModal = (profile: any) => {
    setEditingClient(profile);
    setClientForm({
        id: profile.id,
        daily_calorie_goal: profile.daily_calorie_goal || 1500,
        protein_goal: profile.protein_goal || 80,
        carbs_goal: profile.carbs_goal || 150,
        fats_goal: profile.fats_goal || 50,
        tracking_mode: profile.tracking_mode || 'guided'
    });
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { client_id: editingClient.client.id, daily_calorie_goal: clientForm.daily_calorie_goal, protein_goal: clientForm.protein_goal, carbs_goal: clientForm.carbs_goal, fats_goal: clientForm.fats_goal, tracking_mode: clientForm.tracking_mode };
      const { error } = await supabase.from('nutrition_profiles').upsert(payload, { onConflict: 'client_id' });
      if (!error) {
          setClients(clients.map(c => c.client.id === editingClient.client.id ? { ...c, ...payload } : c));
          setEditingClient(null);
      } else alert(error.message);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);

      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
              try {
                  const recipesToImport: any[] = [];

                  for (const row of results.data as any[]) {
                      const r: any = {};
                      Object.keys(row).forEach(k => {
                          if (k && typeof k === 'string') r[k.toLowerCase().trim()] = row[k];
                      });

                      const nom = r['nom'] || r['name'] || r['recette'];
                      if (!nom) continue;

                      let parsedIngredients = [];
                      try { parsedIngredients = r['ingredients'] ? JSON.parse(r['ingredients']) : []; } catch (e) {}

                      recipesToImport.push({
                          nom: nom,
                          type: r['type'] || 'Déjeuner',
                          calories: Number(r['calories']) || 0,
                          proteins: Number(r['proteins'] || r['protéines']) || 0,
                          carbs: Number(r['carbs'] || r['glucides']) || 0,
                          fats: Number(r['fats'] || r['lipides']) || 0,
                          is_bol_commun: r['is_bol_commun']?.toLowerCase() === 'oui' || String(r['is_bol_commun']) === 'true',
                          recipe: r['etapes_cuisson'] || r['recipe'] || r['recette_details'] || '',
                          description: r['description'] || '',
                          image_url: r['photo'] || r['image_url'] || r['image'] || '',
                          gallery: r['galerie_photo'] ? String(r['galerie_photo']).split(',').map((s:string) => s.trim()) : [],
                          ingredients: parsedIngredients
                      });
                  }

                  if (recipesToImport.length === 0) {
                      alert("Aucune recette valide trouvée dans le fichier CSV. Assurez-vous d'avoir une colonne 'nom'.");
                      return;
                  }

                  setPendingRecipeCsvFile({
                      filename: file.name,
                      recipesCount: recipesToImport.length,
                      data: recipesToImport
                  });
              } catch (err: any) {
                  alert("Erreur lors de l'analyse du CSV : " + err.message);
              } finally {
                  setLoading(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
              }
          },
          error: (err) => {
              alert("Erreur de lecture du fichier CSV.");
              setLoading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      });
  };

  const handleConfirmRecipeCsvImport = async () => {
      if (!pendingRecipeCsvFile) return;
      setIsImportingRecipeCsv(true);
      setRecipeCsvImportProgress(0);

      try {
          const recipesArray = pendingRecipeCsvFile.data;
          const totalRows = recipesArray.length;
          const chunkSize = 100;
          let importedCount = 0;
          
          for (let i = 0; i < totalRows; i += chunkSize) {
              const chunk = recipesArray.slice(i, i + chunkSize);
              
              const payload = chunk.map((r: any) => {
                  const existingRecipe = recipes.find(er => er.nom.toLowerCase() === r.nom.toLowerCase());
                  const item = { ...r };
                  if (existingRecipe) {
                      item.id = existingRecipe.id;
                  }
                  return item;
              });

              const { data, error } = await supabase.from('nutrition_recipes').upsert(payload).select();
              if (error) throw new Error("Erreur insertion: " + error.message);

              if (data) {
                  importedCount += data.length;
              }

              setRecipeCsvImportProgress(Math.round(((i + chunk.length) / totalRows) * 100));
          }

          alert(`Importation réussie ! ${importedCount} recettes ajoutées/mises à jour.`);
          setPendingRecipeCsvFile(null);

          const { data: updatedRecipes } = await supabase.from('nutrition_recipes').select('*').order('created_at', { ascending: false });
          if (updatedRecipes) setRecipes(updatedRecipes);

      } catch (err: any) {
          alert("Erreur lors de l'importation : " + err.message);
      } finally {
          setIsImportingRecipeCsv(false);
          setRecipeCsvImportProgress(0);
      }
  };

  const handleImportProductCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);

      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
              try {
                  const productsToImport: any[] = [];
                  const uniqueCategories = new Set<string>();

                  for (const row of results.data as any[]) {
                      const r: any = {};
                      Object.keys(row).forEach(k => {
                          if (k && typeof k === 'string') r[k.toLowerCase().trim()] = row[k];
                      });

                      const nom = r['nom'] || r['name'] || r['produit'];
                      if (!nom) continue;

                      const categorie_nom = r['categorie_nom'] || r['catégorie'] || r['category'] || 'Général';
                      
                      let prix_standard = r['prix_standard'] || r['prix'] || 0;
                      let prix_premium = r['prix_premium'] || r['prix premium'] || 0;
                      let stock = r['stock'] || r['quantité'] || 0;

                      productsToImport.push({
                          nom,
                          categorie_nom,
                          description_courte: r['description_courte'] || r['description courte'] || '',
                          description_longue: r['description_longue'] || r['description longue'] || '',
                          prix_standard: Number(String(prix_standard).replace(/[^0-9.-]+/g, '')) || 0,
                          prix_premium: Number(String(prix_premium).replace(/[^0-9.-]+/g, '')) || 0,
                          stock: Number(String(stock).replace(/[^0-9.-]+/g, '')) || 0,
                          image_url: r['image_url'] || r['image'] || '',
                          badge: r['badge'] || '',
                          goal: r['goal'] || r['objectif'] || 'all'
                      });

                      uniqueCategories.add(categorie_nom);
                  }

                  if (productsToImport.length === 0) {
                      alert("Aucun produit valide trouvé dans le fichier CSV. Assurez-vous d'avoir une colonne 'nom'.");
                      return;
                  }

                  setPendingProductCsvFile({
                      filename: file.name,
                      productsCount: productsToImport.length,
                      categoriesCount: uniqueCategories.size,
                      data: productsToImport
                  });
              } catch (err: any) {
                  alert("Erreur lors de l'analyse du CSV : " + err.message);
              } finally {
                  setLoading(false);
                  if (fileProductInputRef.current) fileProductInputRef.current.value = '';
              }
          },
          error: (err) => {
              alert("Erreur de lecture du fichier CSV.");
              setLoading(false);
              if (fileProductInputRef.current) fileProductInputRef.current.value = '';
          }
      });
  };

  const handleConfirmProductCsvImport = async () => {
      if (!pendingProductCsvFile) return;
      setIsImportingProductCsv(true);
      setProductCsvImportProgress(0);

      try {
          const productsArray = pendingProductCsvFile.data;
          const totalRows = productsArray.length;
          const chunkSize = 100;
          let importedCount = 0;
          
          for (let i = 0; i < totalRows; i += chunkSize) {
              const chunk = productsArray.slice(i, i + chunkSize);
              
              const payload = chunk.map((p: any) => {
                  const existingProd = products.find(ep => ep.nom.toLowerCase() === p.nom.toLowerCase());
                  const item = { ...p };
                  if (existingProd) {
                      item.id = existingProd.id;
                  }
                  return item;
              });

              const { data, error } = await supabase.from('nutrition_products').upsert(payload).select();
              if (error) throw new Error("Erreur insertion: " + error.message);

              if (data) {
                  importedCount += data.length;
              }

              setProductCsvImportProgress(Math.round(((i + chunk.length) / totalRows) * 100));
          }

          alert(`Importation réussie ! ${importedCount} produits ajoutés/mis à jour.`);
          setPendingProductCsvFile(null);

          const { data } = await supabase.from('nutrition_products').select('*').order('created_at', { ascending: false });
          if (data) setProducts(data);

      } catch (err: any) {
          alert("Erreur lors de l'importation : " + err.message);
      } finally {
          setIsImportingProductCsv(false);
          setProductCsvImportProgress(0);
      }
  };

  const handleOpenProductModal = (prod?: any) => {
     if (prod) {
         setEditingProduct(prod);
         setProductForm({ ...prod });
     } else {
         setEditingProduct(null);
         setProductForm({ id: '', produit_id: `prod_${Date.now()}`, categorie_nom: 'Super-Aliments & Céréales Locales', nom: '', description_courte: '', description_longue: '', prix_standard: 0, prix_premium: 0, stock: 0, image_url: '', badge: '', goal: 'all' });
     }
     setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { ...productForm };
      delete payload.id;
      if (editingProduct) {
          const { error } = await supabase.from('nutrition_products').update(payload).eq('id', productForm.id);
          if (!error) { setProducts(products.map(p => p.id === productForm.id ? { ...payload, id: productForm.id } : p)); setShowProductModal(false); }
          else alert(error.message);
      } else {
          const { data, error } = await supabase.from('nutrition_products').insert([payload]).select().single();
          if (!error && data) { setProducts([data, ...products]); setShowProductModal(false); }
          else alert(error?.message);
      }
  };

  const handleDeleteProduct = async (id: string) => {
      if (!confirm("Supprimer ce produit ?")) return;
      await supabase.from('nutrition_products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
  };

  const handleOpenPromoModal = (promo?: any) => {
      if (promo) {
          setEditingPromo(promo);
          setPromoForm({ ...promo });
      } else {
          setEditingPromo(null);
          setPromoForm({ id: '', code: '', discount_pct: 10, min_xp: 0, active: true });
      }
      setShowPromoModal(true);
  };

  const downloadRecipeCsvTemplate = () => {
      const csv = "nom;type;calories;proteines;glucides;lipides;is_bol_commun;etapes_cuisson;description;image_url;galerie_photo;ingredients\nExemple Thieb;Déjeuner;600;30;70;15;oui;Cuire le riz...;Un plat sénégalais;https://...;https://...,https://...;[{\"nom\":\"Riz\",\"quantite\":100,\"unite\":\"g\",\"rayon\":\"Supermarché\"}]";
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'Modele_Recettes_Vierge.csv'; a.click();
  };

  const downloadProductCsvTemplate = () => {
      const csv = "nom;categorie_nom;prix_standard;prix_premium;stock;description_courte;description_longue;image_url;badge;goal\nFonio Premium;Super-Aliments;2500;2100;100;Fonio précuit;Description complète;https://...;Best Seller;cooking";
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'Modele_Produits_Vierge.csv'; a.click();
  };

  const handleSavePromo = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { ...promoForm, code: promoForm.code.toUpperCase().replace(/\s+/g, '') };
      delete payload.id;
      let res;
      if (editingPromo) res = await supabase.from('nutrition_promo_codes').update(payload).eq('id', promoForm.id).select().single();
      else res = await supabase.from('nutrition_promo_codes').insert([payload]).select().single();
      if (!res.error && res.data) {
          if (editingPromo) setPromos(promos.map(p => p.id === promoForm.id ? res.data : p));
          else setPromos([res.data, ...promos]);
          setShowPromoModal(false);
      } else alert(res.error?.message);
  };

  const handleDeletePromo = async (id: string) => {
      if (!confirm("Supprimer ce code promo ?")) return;
      await supabase.from('nutrition_promo_codes').delete().eq('id', id);
      setPromos(promos.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, phone: string, clientName: string) => {
      await supabase.from('nutrition_orders').update({ status: newStatus }).eq('id', orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      let msg = "";
      if (newStatus === 'En préparation') msg = `Bonjour ${clientName}, votre commande OnyxNutrition est en cours de préparation 📦 !`;
      if (newStatus === 'Expédié') msg = `Bonjour ${clientName}, votre commande est en route 🚚 ! Notre livreur va vous contacter.`;
      if (newStatus === 'Livré') msg = `Bonjour ${clientName}, votre commande a été livrée ✅. Merci pour votre confiance !`;

      if (msg) window.open(`https://wa.me/${phone?.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black"><Activity className="animate-spin text-[#39FF14]" size={40} /></div>;
  }

  // Calcul moyenne globale des calories consommées aujourd'hui
  const todayStr = new Date().toISOString().split('T')[0];
  let totalCaloriesToday = 0;
  let clientsWithLogsToday = 0;

  clients.forEach(client => {
     const todayLog = client.logs?.find((l: any) => l.log_date === todayStr);
     if (todayLog && todayLog.calories_consumed > 0) {
        totalCaloriesToday += todayLog.calories_consumed;
        clientsWithLogsToday++;
     }
  });

  const averageCaloriesToday = clientsWithLogsToday > 0 ? Math.round(totalCaloriesToday / clientsWithLogsToday) : 0;

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-24">
      <header className="bg-black text-white px-8 py-6 flex items-center justify-between sticky top-0 z-30 border-b-4 border-[#39FF14]">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors font-black uppercase text-xs tracking-widest bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
            <ChevronLeft size={16}/> Retour SaaS (Admin)
          </button>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="Onyx Nutrition" className="h-8 object-contain" />
            Coach <span className="text-[#39FF14]">Nutrition</span>
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
               <button onClick={() => setActiveTab('shop')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'shop' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Boutique</button>
               <button onClick={() => setActiveTab('orders')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'orders' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Commandes</button>
               <button onClick={() => setActiveTab('promos')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'promos' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Codes Promo</button>
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
               <div className="flex w-full md:w-auto gap-4">
                  <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                  <button onClick={() => fileInputRef.current?.click()} className="bg-zinc-100 text-black px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-sm flex items-center justify-center gap-2"><Upload size={16}/> Import CSV</button>
                  <button onClick={downloadRecipeCsvTemplate} className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all shadow-sm flex items-center justify-center gap-2" title="Télécharger un modèle vierge"><Download size={14}/></button>
                  <button onClick={() => handleOpenRecipeModal()} className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"><Plus size={16}/> Nouvelle Recette</button>
               </div>
            )}
            {activeTab === 'shop' && (
               <div className="flex w-full md:w-auto gap-4">
                  <input type="file" accept=".csv" className="hidden" ref={fileProductInputRef} onChange={handleImportProductCSV} />
                  <button onClick={() => fileProductInputRef.current?.click()} className="bg-zinc-100 text-black px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-sm flex items-center justify-center gap-2"><Upload size={16}/> Import CSV</button>
                  <button onClick={downloadProductCsvTemplate} className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all shadow-sm flex items-center justify-center gap-2" title="Télécharger un modèle vierge"><Download size={14}/></button>
                  <button onClick={() => handleOpenProductModal()} className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"><Plus size={16}/> Nouveau Produit</button>
               </div>
            )}
            {activeTab === 'promos' && (
               <div className="flex w-full md:w-auto gap-4">
                  <button onClick={() => handleOpenPromoModal()} className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"><Plus size={16}/> Créer un Code Promo</button>
               </div>
            )}
        </div>

        {activeTab === 'clients' ? (
        <>
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-black text-[#39FF14] p-6 rounded-2xl shadow-sm border border-zinc-800 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Moyenne Kcal (Aujourd'hui)</p>
                <div className="flex items-center gap-4">
                   <div className="bg-[#39FF14]/10 p-4 rounded-xl"><Flame size={28} className="text-[#39FF14]"/></div>
                   <div>
                     <p className="text-4xl font-black">{averageCaloriesToday} <span className="text-sm font-bold text-zinc-500">kcal</span></p>
                     <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Sur {clientsWithLogsToday} clients ayant logué</p>
                   </div>
                </div>
             </div>
             
             <div className="bg-white text-black p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Clients Actifs (Aujourd'hui)</p>
                <div className="flex items-center gap-4">
                   <div className="bg-blue-50 p-4 rounded-xl"><Activity size={28} className="text-blue-500"/></div>
                   <div>
                     <p className="text-4xl font-black">{clientsWithLogsToday} <span className="text-sm font-bold text-zinc-500">/ {clients.length}</span></p>
                     <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Taux d'activité journalier</p>
                   </div>
                </div>
             </div>
             
             <div className="bg-white text-black p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Base de Recettes</p>
                <div className="flex items-center gap-4">
                   <div className="bg-orange-50 p-4 rounded-xl"><Utensils size={28} className="text-orange-500"/></div>
                   <div>
                     <p className="text-4xl font-black">{recipes.length}</p>
                     <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Plats configurés dans l'app</p>
                   </div>
                </div>
             </div>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredClients.map(profile => {
              const clientName = profile.client?.full_name || "Client Inconnu";
              const phone = profile.phone || profile.client?.phone || "";
              
              const todayLog = profile.logs?.find((l: any) => l.log_date === todayStr);

              const calsConsumed = todayLog?.calories_consumed || 0;
              const protsConsumed = todayLog?.proteins_consumed || 0;
              const calsGoal = profile.daily_calorie_goal || 1500;
              const protsGoal = profile.protein_goal || 80;

              const weightLogs = profile.weight_logs?.sort((a: any, b: any) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()) || [];
              const waterLogs = profile.logs?.sort((a: any, b: any) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()).slice(-7) || [];

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

                    {/* GRAPHIQUES POIDS & EAU */}
                    {expandedClient === profile.id ? (
                       <div className="mb-6 space-y-6 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 animate-in slide-in-from-top-2">
                          <div className="flex justify-between items-center mb-2">
                             <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2"><LineChartIcon size={14} className="text-[#39FF14]"/> Courbe de Poids</h4>
                             <button onClick={() => setExpandedClient(null)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                          </div>
                          
                          {weightLogs.length > 0 ? (
                             <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={weightLogs}>
                                    <Line type="monotone" dataKey="weight" stroke="#39FF14" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#39FF14' }} />
                                    <RechartsTooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
                                  </LineChart>
                                </ResponsiveContainer>
                             </div>
                          ) : (
                             <p className="text-[10px] text-zinc-500 italic">Aucune donnée de poids enregistrée.</p>
                          )}

                          <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2 pt-4 border-t border-zinc-800"><BarChartIcon size={14} className="text-[#00E5FF]"/> Historique Eau (7j)</h4>
                          {waterLogs.length > 0 ? (
                             <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={waterLogs}>
                                    <Bar dataKey="water_glasses" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                                    <RechartsTooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
                                  </BarChart>
                                </ResponsiveContainer>
                             </div>
                          ) : (
                             <p className="text-[10px] text-zinc-500 italic">Aucune donnée d'hydratation.</p>
                          )}
                       </div>
                    ) : (
                       <button onClick={() => setExpandedClient(profile.id)} className="mb-4 w-full bg-zinc-100 py-2.5 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-black hover:bg-zinc-200 flex justify-center items-center gap-2 transition-colors">
                          <LineChartIcon size={14}/> Voir l'évolution (Poids & Eau)
                       </button>
                    )}

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
                    <button onClick={() => handleOpenClientModal(profile)} className="w-full bg-zinc-100 text-black py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2 mt-2">
                       <Edit3 size={14}/> Modifier Objectifs & Mode
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
        </>
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

        {activeTab === 'shop' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Produit</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Prix (Standard/Premium)</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Stock</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {products.map(p => (
                       <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                             {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-100" />}
                             <div>
                                <p className="font-bold text-sm text-black">{p.nom}</p>
                                <p className="text-[10px] font-black text-zinc-500 uppercase mt-1">{p.categorie_nom}</p>
                             </div>
                          </td>
                          <td className="p-4">
                             <p className="text-xs font-bold text-zinc-500 line-through">{p.prix_standard} F</p>
                             <p className="text-sm font-black text-[#39FF14] bg-black px-2 py-0.5 rounded w-max">{p.prix_premium} F</p>
                          </td>
                          <td className="p-4">
                             <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock} en stock</span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                             <button onClick={() => handleOpenProductModal(p)} className="p-2 bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors"><Edit3 size={16}/></button>
                             <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          </td>
                       </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-400 font-bold">Aucun produit configuré.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
        )}

        {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Date & Client</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Commande</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {orders.map(o => (
                       <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4">
                             <p className="font-bold text-sm text-black">{o.client_name}</p>
                             <p className="text-[10px] font-black text-zinc-500 uppercase mt-1">{new Date(o.created_at).toLocaleDateString('fr-FR')} • {o.phone}</p>
                          </td>
                          <td className="p-4">
                             <p className="text-xs font-bold text-zinc-600 mb-1">{o.items?.length || 0} articles</p>
                             <p className="text-sm font-black text-black">{o.total?.toLocaleString()} F</p>
                             {o.promo_code && <p className="text-[10px] font-black text-[#39FF14] uppercase mt-1">Code: {o.promo_code} (-{o.discount_amount} F)</p>}
                          </td>
                          <td className="p-4">
                             <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value, o.phone, o.client_name)} className={`p-2 border rounded-xl outline-none text-xs font-bold ${o.status === 'Nouveau' ? 'bg-blue-50 text-blue-600 border-blue-200' : o.status === 'Livré' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                               <option value="Nouveau">Nouveau</option>
                               <option value="En préparation">En préparation</option>
                               <option value="Expédié">Expédié</option>
                               <option value="Livré">Livré</option>
                               <option value="Annulé">Annulé</option>
                             </select>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-1.5 flex-wrap">
                             <button onClick={() => window.open(`https://wa.me/${o.phone?.replace('+', '')}`, '_blank')} className="px-2 py-2 bg-[#25D366] text-white hover:bg-[#1ebd58] rounded-lg transition-colors flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"><MessageSquare size={12}/> WhatsApp</button>
                             <button onClick={() => window.open(`mailto:?subject=Relance Commande OnyxNutrition&body=Bonjour ${o.client_name}, nous avons remarqué que votre commande de ${o.total?.toLocaleString()} F n'a pas été finalisée. Souhaitez-vous de l'aide ?`, '_blank')} className="px-2 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"><Mail size={12}/> Email</button>
                          </td>
                       </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-400 font-bold">Aucune commande enregistrée.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
        )}

        {activeTab === 'promos' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                 <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Code Promo</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Remise (%)</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Minimum XP</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {promos.map(p => (
                       <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4 font-black text-sm text-black">{p.code}</td>
                          <td className="p-4 font-black text-[#39FF14] text-lg">-{p.discount_pct}%</td>
                          <td className="p-4 text-xs font-bold text-zinc-500">{p.min_xp} XP</td>
                          <td className="p-4">
                             <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.active ? 'Actif' : 'Inactif'}</span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                             <button onClick={() => handleOpenPromoModal(p)} className="p-2 bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors"><Edit3 size={16}/></button>
                             <button onClick={() => handleDeletePromo(p.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          </td>
                       </tr>
                    ))}
                    {promos.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-zinc-400 font-bold">Aucun code promo créé.</td></tr>}
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

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Description</label>
                     <textarea value={recipeForm.description} onChange={e => setRecipeForm({...recipeForm, description: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black min-h-[60px]" placeholder="Courte description de la recette..."></textarea>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">URL Image Principale</label>
                     <input type="text" value={recipeForm.image_url} onChange={e => setRecipeForm({...recipeForm, image_url: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black" placeholder="https://..." />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Galerie Photos (URLs séparées par virgule)</label>
                     <input type="text" value={recipeForm.gallery.join(', ')} onChange={e => setRecipeForm({...recipeForm, gallery: e.target.value.split(',').map(url => url.trim()).filter(Boolean)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black" placeholder="https://img1.jpg, https://img2.jpg" />
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

      {/* MODALE CLIENT */}
      {editingClient && (
         <div id="client-modal-overlay" onClick={(e: any) => e.target.id === 'client-modal-overlay' && setEditingClient(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto text-black">
               <button onClick={() => setEditingClient(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3`}>
                  <Target className="text-[#39FF14]"/> Objectifs Client
               </h2>
               <p className="text-zinc-500 font-bold text-xs mb-8">{editingClient.client.full_name}</p>
               
               <form onSubmit={handleSaveClient} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Mode de Suivi</label>
                     <select value={clientForm.tracking_mode} onChange={e => setClientForm({...clientForm, tracking_mode: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black cursor-pointer">
                        <option value="guided">Guidé (Menu Strict)</option>
                        <option value="flexible">Libre (Flexible)</option>
                        <option value="autopilot">Autopilot</option>
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-orange-500 tracking-widest ml-1">Kcal / Jour</label><input type="number" required value={clientForm.daily_calorie_goal} onChange={e => setClientForm({...clientForm, daily_calorie_goal: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-green-500 tracking-widest ml-1">Protéines (g)</label><input type="number" required value={clientForm.protein_goal} onChange={e => setClientForm({...clientForm, protein_goal: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-yellow-600 tracking-widest ml-1">Glucides (g)</label><input type="number" required value={clientForm.carbs_goal} onChange={e => setClientForm({...clientForm, carbs_goal: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Lipides (g)</label><input type="number" required value={clientForm.fats_goal} onChange={e => setClientForm({...clientForm, fats_goal: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                  </div>

                  <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                     <Save size={20}/> Mettre à jour
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE PRODUIT */}
      {showProductModal && (
         <div id="product-modal-overlay" onClick={(e: any) => e.target.id === 'product-modal-overlay' && setShowProductModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto text-black">
               <button onClick={() => setShowProductModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3`}><ShoppingBag className="text-[#39FF14]"/> Produit Boutique</h2>
               
               <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Catégorie</label><input type="text" required value={productForm.categorie_nom} onChange={e => setProductForm({...productForm, categorie_nom: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Nom</label><input type="text" required value={productForm.nom} onChange={e => setProductForm({...productForm, nom: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Prix Standard</label><input type="number" required value={productForm.prix_standard} onChange={e => setProductForm({...productForm, prix_standard: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#39FF14] tracking-widest">Prix Premium</label><input type="number" required value={productForm.prix_premium} onChange={e => setProductForm({...productForm, prix_premium: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Stock</label><input type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Description Courte</label><textarea required value={productForm.description_courte} onChange={e => setProductForm({...productForm, description_courte: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-sm outline-none focus:border-black min-h-[60px]" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Description Longue</label><textarea value={productForm.description_longue} onChange={e => setProductForm({...productForm, description_longue: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-sm outline-none focus:border-black min-h-[100px]" /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Badge (Optionnel)</label><input type="text" value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" placeholder="Ex: Best Seller" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Image URL</label><input type="text" required value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" /></div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Objectif (Goal)</label>
                     <select value={productForm.goal} onChange={e => setProductForm({...productForm, goal: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black cursor-pointer">
                        <option value="all">Général</option>
                        <option value="detox">Détox</option>
                        <option value="energy">Énergie</option>
                        <option value="cooking">Cuisine</option>
                        <option value="snacks">Snacks</option>
                     </select>
                  </div>
                  <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                     <Save size={20}/> Sauvegarder
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE PROMO CODE */}
      {showPromoModal && (
         <div id="promo-modal-overlay" onClick={(e: any) => e.target.id === 'promo-modal-overlay' && setShowPromoModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto text-black">
               <button onClick={() => setShowPromoModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3`}><Ticket className="text-[#39FF14]"/> Code Promotionnel</h2>
               
               <form onSubmit={handleSavePromo} className="space-y-4">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Code Promo</label><input type="text" required value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-black text-sm outline-none focus:border-black uppercase" placeholder="Ex: JONGOMA1000" /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Remise (%)</label><input type="number" min="0" max="100" required value={promoForm.discount_pct} onChange={e => setPromoForm({...promoForm, discount_pct: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Minimum XP requis</label><input type="number" required value={promoForm.min_xp} onChange={e => setPromoForm({...promoForm, min_xp: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                  </div>
                  
                  <label className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-100 transition-colors mt-4">
                     <input type="checkbox" checked={promoForm.active} onChange={e => setPromoForm({...promoForm, active: e.target.checked})} className="w-5 h-5 accent-black" />
                     <div>
                        <p className="font-black text-sm uppercase text-black">Code Actif</p>
                        <p className="text-[10px] font-bold text-zinc-500">Permettre son utilisation sur la boutique.</p>
                     </div>
                  </label>

                  <button type="submit" className="w-full mt-4 bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                     <Save size={20}/> Sauvegarder
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE CONFIRMATION IMPORT CSV RECETTES */}
      {pendingRecipeCsvFile && (
        <div id="recipe-csv-modal-overlay" onClick={(e: any) => e.target.id === 'recipe-csv-modal-overlay' && !isImportingRecipeCsv && setPendingRecipeCsvFile(null)} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-t-8 border-[#39FF14] animate-in zoom-in-95 text-center text-black">
            <button onClick={() => !isImportingRecipeCsv && setPendingRecipeCsvFile(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors"><X size={16}/></button>
            <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><Utensils size={24}/></div>
            <h3 className="text-xl font-black uppercase mb-2 text-black">Confirmer l'import (Recettes)</h3>
            <p className="text-sm font-bold text-zinc-500 mb-6">Fichier : {pendingRecipeCsvFile.filename}</p>
            
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-8">
               <p className="text-3xl font-black text-[#39FF14]">{pendingRecipeCsvFile.recipesCount}</p>
               <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-1">Recettes trouvées</p>
            </div>

            {isImportingRecipeCsv && (
               <div className="mb-6 w-full text-left animate-in fade-in">
                  <div className="w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                     <div className="bg-[#39FF14] h-2.5 rounded-full transition-all duration-300" style={{ width: `${recipeCsvImportProgress}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-2 tracking-widest uppercase text-center">Importation... {recipeCsvImportProgress}%</p>
               </div>
            )}

            <div className="flex gap-3">
               <button onClick={() => setPendingRecipeCsvFile(null)} disabled={isImportingRecipeCsv} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 transition disabled:opacity-50">Annuler</button>
               <button onClick={handleConfirmRecipeCsvImport} disabled={isImportingRecipeCsv} className="flex-[2] py-4 bg-black text-[#39FF14] rounded-xl font-black uppercase text-xs hover:scale-105 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100">
                  {isImportingRecipeCsv ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>} {isImportingRecipeCsv ? 'En cours...' : 'Valider'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CONFIRMATION IMPORT CSV BOUTIQUE */}
      {pendingProductCsvFile && (
        <div id="csv-modal-overlay" onClick={(e: any) => e.target.id === 'csv-modal-overlay' && !isImportingProductCsv && setPendingProductCsvFile(null)} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-t-8 border-[#39FF14] animate-in zoom-in-95 text-center text-black">
            <button onClick={() => !isImportingProductCsv && setPendingProductCsvFile(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors"><X size={16}/></button>
            <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><Database size={24}/></div>
            <h3 className="text-xl font-black uppercase mb-2 text-black">Confirmer l'import (Boutique)</h3>
            <p className="text-sm font-bold text-zinc-500 mb-6">Fichier : {pendingProductCsvFile.filename}</p>
            
            <div className="grid grid-cols-2 gap-2 mb-8">
               <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <p className="text-2xl font-black text-[#39FF14]">{pendingProductCsvFile.productsCount}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Produits</p>
               </div>
               <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <p className="text-2xl font-black text-black">{pendingProductCsvFile.categoriesCount}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Catégories</p>
               </div>
            </div>

            {isImportingProductCsv && (
               <div className="mb-6 w-full text-left animate-in fade-in">
                  <div className="w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                     <div className="bg-[#39FF14] h-2.5 rounded-full transition-all duration-300" style={{ width: `${productCsvImportProgress}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-2 tracking-widest uppercase text-center">Importation... {productCsvImportProgress}%</p>
               </div>
            )}

            <div className="flex gap-3">
               <button onClick={() => setPendingProductCsvFile(null)} disabled={isImportingProductCsv} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 transition disabled:opacity-50">Annuler</button>
               <button onClick={handleConfirmProductCsvImport} disabled={isImportingProductCsv} className="flex-[2] py-4 bg-black text-[#39FF14] rounded-xl font-black uppercase text-xs hover:scale-105 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100">
                  {isImportingProductCsv ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>} {isImportingProductCsv ? 'En cours...' : 'Valider'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}