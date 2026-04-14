"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Box, Search, Edit, Plus, CheckSquare, Clock, AlertTriangle, AlertCircle, X, Download, User, Minus, Bot, Sparkles, Send, Trash2, FolderOpen, Image as ImageIcon, Save, FileText, Eye, Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORY_COVERS: Record<string, string> = {
  "Cuisine pro préparation": "https://images.unsplash.com/photo-1556910110-a5a63dfd393c?auto=format&fit=crop&w=800&q=80",
  "Boulangerie/Pâtisserie": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  "Bars et Buffet": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
  "Transformation agricole": "https://images.unsplash.com/photo-1595853035070-59a39f6072ce?auto=format&fit=crop&w=800&q=80",
  "Jetables et emballages": "https://images.unsplash.com/photo-1605600659873-d808a1d14f50?auto=format&fit=crop&w=800&q=80",
  "Art de table": "https://images.unsplash.com/photo-1603017556942-0f56a65576bd?auto=format&fit=crop&w=800&q=80",
  "Hygiène": "https://images.unsplash.com/photo-1584820927498-cafe2c15923f?auto=format&fit=crop&w=800&q=80",
  "📦 Nouveaux Arrivages (À trier)": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
};

export default function CRMCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [quoteQuantities, setQuoteQuantities] = useState<Record<number, number>>({});
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCampaigns, setAiCampaigns] = useState<any[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', unit_price: 0, image_url: '', description: '' });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Catégories
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', parent_id: '', cover_url: '' });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [productSort, setProductSort] = useState<'recent' | 'az' | 'popular'>('recent');
  const [hideZeroPrice, setHideZeroPrice] = useState(false);
  const [categoryCovers, setCategoryCovers] = useState<Record<string, string>>({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {    let isMounted = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          console.error("Pas de session active");
          if (isMounted) setIsLoading(false);
          return; // Ou rediriger
        }
        const user = session.user;
        const tId = user.user_metadata?.tenant_id || user.id;
        if (isMounted) setTenantId(tId);

        const { data, error } = await supabase
          .from('crm_products')
          .select('*')
          .eq('tenant_id', tId)
          .order('created_at', { ascending: false });

        if (data && !error && isMounted) {
          setProducts(data);
        }

        const { data: clientsData } = await supabase.from('clients').select('*').eq('tenant_id', tId);
        if (clientsData && isMounted) setClients(clientsData);

        const { data: catsData } = await supabase.from('crm_categories').select('*').eq('tenant_id', tId);
        if (catsData && isMounted) setCategories(catsData);

        const { data: settingsData } = await supabase.from('crm_settings').select('category_covers').eq('tenant_id', tId).maybeSingle();
        if (settingsData && settingsData.category_covers && isMounted) {
          setCategoryCovers(settingsData.category_covers);
        }
      } catch (err) {
        console.error("Erreur de fetch:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && isMounted) fetchData();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
      setEditForm({ name: '', category: '', unit_price: 0, image_url: '', description: '' });
      setIsAddingProduct(true);
  };

  const handleOpenEdit = (p: any) => {
      setEditingProduct(p);
      setIsAddingProduct(false);
      setEditForm({ name: p.name || '', category: p.category || '', unit_price: p.unit_price || p.price_ttc || 0, image_url: p.image_url || '', description: p.description || '' });
  };

  const generateTechnicalSheet = async (p: any, bulkDoc?: jsPDF) => {
      const doc = bulkDoc || new jsPDF();
      
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(57, 255, 20); // #39FF14
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("FICHE TECHNIQUE PRODUIT", 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.text(p.name || 'Produit sans nom', 14, 60);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Catégorie : ${p.category || 'Non catégorisé'}`, 14, 75);
      doc.text(`Prix de vente : ${(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} FCFA`, 14, 85);
      
      const status = getStockStatus(p.last_sold_date, p.created_at);
      doc.text(`Statut (Rotation) : ${status.label}`, 14, 95);

      doc.setFont("helvetica", "bold");
      doc.text("Description :", 14, 115);
      doc.setFont("helvetica", "normal");
      const splitDesc = doc.splitTextToSize(p.description || "Aucune description détaillée disponible pour ce produit.", 180);
      doc.text(splitDesc, 14, 125);

      if (p.image_url) {
          try {
              const img = new Image();
              img.crossOrigin = "Anonymous";
              img.src = p.image_url;
              await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
              });
              doc.addImage(img, 'JPEG', 14, 150, 80, 80);
          } catch (e) {
              doc.setTextColor(150, 150, 150);
              doc.text("(Image non disponible / Erreur de chargement)", 14, 160);
          }
      }
      
      if (!bulkDoc) {
          doc.save(`Fiche_Technique_${(p.name || 'Produit').replace(/\s+/g, '_')}.pdf`);
      }
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

  const handleBulkDelete = async () => {
      if (!confirm(`Voulez-vous vraiment supprimer ces ${selectedIds.size} produits ?`)) return;
      try {
          const idsToDelete = Array.from(selectedIds);
          const { error } = await supabase.from('crm_products').delete().in('id', idsToDelete).eq('tenant_id', tenantId);
          if (error) throw error;
          setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
          setSelectedIds(new Set());
      } catch (err: any) {
          alert("Erreur lors de la suppression groupée : " + err.message);
      }
  };

  const handleSaveProduct = async () => {
      if (!editForm.name) return alert("Le nom du produit est requis.");
      setIsSavingEdit(true);
      try {
          const payload = { name: editForm.name, category: editForm.category, unit_price: editForm.unit_price, price_ttc: editForm.unit_price, image_url: editForm.image_url, description: editForm.description };
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

  const handleSaveCategory = async () => {
      if (!categoryForm.name) return alert("Le nom de la catégorie est requis.");
      setIsSavingCategory(true);
      try {
          const payload = { tenant_id: tenantId, name: categoryForm.name, parent_id: categoryForm.parent_id || null, cover_url: categoryForm.cover_url };
          if (editingCategory) {
              const { error } = await supabase.from('crm_categories').update(payload).eq('id', editingCategory.id).eq('tenant_id', tenantId);
              if (error) throw error;
              setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...payload } : c));
          } else {
              const { data, error } = await supabase.from('crm_categories').insert([payload]).select().single();
              if (error) throw error;
              setCategories(prev => [...prev, data]);
          }
          setCategoryForm({ name: '', parent_id: '', cover_url: '' });
          setEditingCategory(null);
      } catch(err: any) {
          alert("Erreur lors de l'enregistrement de la catégorie : " + err.message);
      } finally {
          setIsSavingCategory(false);
      }
  };

  const handleDeleteCategory = async (id: number) => {
      if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
      const { error } = await supabase.from('crm_categories').delete().eq('id', id).eq('tenant_id', tenantId);
      if (error) alert("Erreur : " + error.message);
      else setCategories(prev => prev.filter(c => c.id !== id));
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

      // Regroupement intelligent par catégorie
      const categoryGroups = new Map<string, any[]>();
      dormantProducts.forEach(p => {
          const cat = p.category || 'Général';
          if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
          categoryGroups.get(cat)!.push(p);
      });

      const campaigns: any[] = [];
      for (const [category, prods] of Array.from(categoryGroups.entries())) {
          const matchedClients = clients.filter(c => c.activity && c.activity.toLowerCase().includes(category.toLowerCase()));
          if (matchedClients.length > 0) {
              campaigns.push({ 
                  category, 
                  products: prods, 
                  clients: matchedClients,
                  msg: `Offre spéciale déstockage sur nos produits de la catégorie [${category}] ! Découvrez nos promos exclusives parfaites pour votre activité.`
              });
          }
      }

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
                  title: `Campagne Déstockage : ${camp.category}`,
                  desc: `Campagne IA ciblant ${camp.products.length} produit(s) dormant(s)`,
                  date: todayStr,
                  status: 'En attente',
                  phone: client.phone,
                  msg: `Bonjour ${client.full_name}, ${camp.msg}`
              });
          });
      });
      try {
          await supabase.from('actions_ia').insert(actions);
          alert(`${actions.length} relances ciblées ajoutées au Journal IA du commercial !`);
          setIsAiModalOpen(false);
      } catch(err: any) { alert("Erreur d'enregistrement : " + err.message); } finally { setIsLoading(false); }
  };

  const handleBulkTechnicalSheets = async () => {
      const selectedProducts = products.filter(p => selectedIds.has(p.id));
      if (selectedProducts.length === 0) return;
      setIsGeneratingPdf(true);
      try {
          const doc = new jsPDF();
          for (let i = 0; i < selectedProducts.length; i++) {
              if (i > 0) doc.addPage();
              await generateTechnicalSheet(selectedProducts[i], doc);
          }
          doc.save(`Fiches_Techniques_Multiples.pdf`);
      } catch(e) {
          console.error(e);
          alert("Erreur lors de la génération PDF.");
      } finally {
          setIsGeneratingPdf(false);
          setSelectedIds(new Set());
      }
  };

  const handleAutoCategorize = async () => {
      setIsLoading(true);
      try {
          const produitsNonClasses = products.filter(p => !p.category || p.category === 'Autre' || p.category === "📦 Nouveaux Arrivages (À trier)");
          console.log("1. Envoi à l'API:", produitsNonClasses);

          // --- SÉCURISATION JSON ---
          const fakeAiResponseJson = JSON.stringify(
              produitsNonClasses.map(p => {
                  const name = (p.name || '').toLowerCase();
                  let newCat = p.category;
                  let newSubCat = p.subcategory || 'Autre';
                  if (/(fourneau|friteuse|marmite|hachoir|mixeur|plancha|grill|sauteuse)/.test(name)) { newCat = "Cuisine pro préparation"; newSubCat = "Cuisson & Préparation"; }
                  else if (/(pétrin|four|façonneuse|batteur|laminoir|diviseuse)/.test(name)) { newCat = "Boulangerie/Pâtisserie"; newSubCat = "Équipement Lourd"; }
                  else if (/(machine à glace|vitrine|jus|café|bain marie|percolateur)/.test(name)) { newCat = "Bars et Buffet"; newSubCat = "Boissons & Froid"; }
                  else if (/(moulin|décortiqueuse|presse|râpeuse)/.test(name)) { newCat = "Transformation agricole"; newSubCat = "Machines motorisées"; }
                  else if (/(barquette|gobelet|sachet|carton|aluminium|film)/.test(name)) { newCat = "Jetables et emballages"; newSubCat = "Consommables"; }
                  else if (/(assiette|couvert|cuillère|fourchette|verre|couteau|carafe)/.test(name)) { newCat = "Art de table"; newSubCat = "Vaisselle"; }
                  else if (/(lave-vaisselle|poubelle|plonge|savon|chariot|bac)/.test(name)) { newCat = "Hygiène"; newSubCat = "Entretien"; }
                  else if (!newCat || newCat === 'Autre' || !CATEGORY_COVERS[newCat]) { newCat = "📦 Nouveaux Arrivages (À trier)"; newSubCat = "Non classé"; }
                  return { id: p.id, category: newCat, subcategory: newSubCat };
              })
          );
          
          let reponseIA;
          try {
              reponseIA = JSON.parse(fakeAiResponseJson);
              console.log('2. Réponse brute IA:', reponseIA);
          } catch (parseError) {
              console.error("Erreur de parsing JSON:", parseError);
              throw new Error("Le format JSON renvoyé par l'IA est invalide.");
          }
          
          if (tenantId && reponseIA.length > 0) {
              const updatePromises = reponseIA.map(async (product: any) => {
                  const cat = product.category;
                  const subcat = product.subcategory;
                  const { error } = await supabase.from('crm_products').update({ category: cat, subcategory: subcat }).eq('id', product.id).eq('tenant_id', tenantId);
                  if (error) {
                      console.log('3. Erreur Update Supabase:', error);
                      throw error; // Arrête le processus en cas d'échec
                  }
              });
              
              await Promise.all(updatePromises);
              
              // Rechargement forcé UNIQUEMENT quand toutes les mises à jour sont terminées avec succès
              const { data } = await supabase.from('crm_products').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
              if (data) setProducts(data);
          } else if (reponseIA.length === 0) {
              console.log("Aucun produit à catégoriser.");
          }
          alert("Catégorisation IA terminée et sauvegardée dans la base !");
      } catch (erreur) {
          console.log('3. Erreur Update Supabase:', erreur);
          alert("Une erreur est survenue lors de la catégorisation.");
      } finally {
          setIsLoading(false);
      }
  };

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase());
      
      let matchCat = false;
      if (categoryFilter === 'Toutes') {
          matchCat = true;
      } else if (categoryFilter === "📦 Nouveaux Arrivages (À trier)") {
          matchCat = !p.category || p.category === '' || p.category === 'Autre' || p.category === "📦 Nouveaux Arrivages (À trier)" || !CATEGORY_COVERS[p.category];
      } else {
          matchCat = p.category === categoryFilter || (p.category || '').startsWith(categoryFilter + ' /');
      }

      const price = p.unit_price || p.price_ttc || 0;
      if (hideZeroPrice && price === 0) return false;
      const matchMin = minPrice === '' || price >= Number(minPrice);
      const matchMax = maxPrice === '' || price <= Number(maxPrice);
      return matchSearch && matchCat && matchMin && matchMax;
    }).sort((a, b) => {
        if (productSort === 'az') return (a.name || '').localeCompare(b.name || '');
        if (productSort === 'popular') return (b.unit_price || 0) - (a.unit_price || 0);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [products, search, categoryFilter, minPrice, maxPrice, productSort, hideZeroPrice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, minPrice, maxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const zeroPriceCount = products.filter(p => (p.unit_price || p.price_ttc || 0) === 0).length;

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#39FF14]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Catalogue & Écosystème</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gérez vos offres et votre inventaire</p>
        </div>
      </div>

      {zeroPriceCount > 0 && (
        <div className="mb-6 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-500 shrink-0" size={24} />
            <div>
              <p className="font-black text-orange-700 dark:text-orange-400 uppercase text-sm tracking-tight">Produits sans prix détectés</p>
              <p className="text-xs text-orange-600 dark:text-orange-500 font-bold mt-0.5">{zeroPriceCount} produit(s) ont un prix à 0 F CFA.</p>
            </div>
          </div>
          <button onClick={() => setHideZeroPrice(!hideZeroPrice)} className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 transition-colors shrink-0 shadow-sm">
             {hideZeroPrice ? 'Afficher' : 'Masquer'} les produits à 0 F
          </button>
        </div>
      )}

      <div className="animate-in fade-in space-y-6">
          <div className="flex flex-col gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-96">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white" />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button onClick={handleOpenAdd} className="bg-[#39FF14] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 hover:scale-105 transition-transform"><Plus size={16}/> Nouveau</button>
                <button onClick={() => setIsCategoryModalOpen(true)} className="bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-sm flex items-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"><FolderOpen size={16}/> Gérer Catégories</button>
                <button onClick={handleAutoCategorize} className="bg-black dark:bg-zinc-800 text-[#39FF14] px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 hover:scale-105 transition-transform border border-[#39FF14]/30"><Bot size={16}/> Organiser via IA</button>
                <button onClick={handleOpenAiCampaign} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 hover:scale-105 transition-transform"><Sparkles size={16}/> IA : Déstockage</button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={16} className="text-zinc-400 shrink-0" />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full md:w-auto bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#39FF14] appearance-none cursor-pointer text-black dark:text-white">
                  <option value="Toutes">Toutes les catégories</option>
                  {categories.filter(c => c !== 'Toutes' && c !== 'Favoris').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <SlidersHorizontal size={16} className="text-zinc-400 shrink-0" />
                <input type="number" placeholder="Prix Min (F CFA)" value={minPrice} onChange={e => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full md:w-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                <span className="text-zinc-400 font-bold">-</span>
                <input type="number" placeholder="Prix Max (F CFA)" value={maxPrice} onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full md:w-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
              </div>
              {filteredProducts.length > 0 && (
                <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
                   <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#39FF14] dark:hover:border-[#39FF14] transition-colors w-full">
                       <input 
                         type="checkbox" 
                         checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                         onChange={e => {
                             if (e.target.checked) setSelectedIds(new Set(filteredProducts.map(p => p.id)));
                             else setSelectedIds(new Set());
                         }}
                         className="w-4 h-4 accent-black dark:accent-[#39FF14] cursor-pointer"
                       />
                       <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Tout sélectionner</span>
                   </label>
                </div>
              )}
            </div>
          </div>

          {/* INTERFACE GRID */}
          {categoryFilter === 'Toutes' && !search ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Object.entries(CATEGORY_COVERS).map(([cat, defaultImg]) => {
                      const count = products.filter(p => {
                          if (cat === "📦 Nouveaux Arrivages (À trier)") {
                              return !p.category || p.category === '' || p.category === 'Autre' || p.category === "📦 Nouveaux Arrivages (À trier)" || !CATEGORY_COVERS[p.category];
                          }
                          return p.category === cat;
                      }).length;
                      
                      const img = categoryCovers[cat] || defaultImg;

                      return (
                      <div key={cat} onClick={() => setCategoryFilter(cat)} className="relative h-64 rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all border border-zinc-200 dark:border-zinc-800 bg-black">
                          <img src={img} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                          
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              const newUrl = prompt(`Entrez l'URL de la nouvelle image pour la catégorie "${cat}" :`, img);
                              if (newUrl !== null && newUrl.trim() !== "") {
                                const newCovers = { ...categoryCovers, [cat]: newUrl.trim() };
                                setCategoryCovers(newCovers);
                                if (tenantId) await supabase.from('crm_settings').upsert({ tenant_id: tenantId, category_covers: newCovers }, { onConflict: 'tenant_id' });
                              }
                            }}
                            className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-white hover:bg-[#39FF14] hover:text-black transition-colors z-20 opacity-0 group-hover:opacity-100 shadow-md"
                            title="Personnaliser l'image de couverture"
                          >
                            <Edit size={16} />
                          </button>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-colors flex flex-col justify-end p-6 pointer-events-none">
                              <h3 className="text-xl font-black uppercase text-white tracking-tighter drop-shadow-lg leading-tight mb-1">{cat}</h3>
                              <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest">{count} Produits</p>
                          </div>
                      </div>
                  )})}
              </div>
          ) : (
            <>
              {categoryFilter !== 'Toutes' && !search && (
                  <div className="mb-10">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-black uppercase text-xl flex items-center gap-2"><Sparkles className="text-[#39FF14]"/> Les Nouveautés</h3>
                          <button onClick={() => setCategoryFilter('Toutes')} className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"><ChevronLeft size={14}/> Retour aux familles</button>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
                         {products.filter(p => {
                             if (categoryFilter === "📦 Nouveaux Arrivages (À trier)") {
                                 return !p.category || p.category === '' || p.category === 'Autre' || p.category === "📦 Nouveaux Arrivages (À trier)" || !CATEGORY_COVERS[p.category];
                             }
                             return p.category === categoryFilter;
                         }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 8).map(p => (
                             <div key={p.id} className="snap-start shrink-0 w-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm flex flex-col group cursor-pointer hover:border-[#39FF14] transition-all" onClick={() => handleOpenEdit(p)}>
                                 <div className="h-48 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                                    <img src={p.image_url || 'https://placehold.co/400x400/1a1a1a/39FF14?text=PRD'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <span className="absolute top-3 right-3 bg-black text-[#39FF14] text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg border border-[#39FF14]/30">Nouveau</span>
                                 </div>
                                 <div className="p-5 flex flex-col gap-1">
                                    <p className="font-bold text-sm truncate">{p.name}</p>
                                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest truncate">{p.category}</p>
                                    <p className="text-[#39FF14] font-black mt-2 text-lg">{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                                 </div>
                             </div>
                         ))}
                      </div>
                  </div>
              )}
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black uppercase text-lg">Tous les produits {categoryFilter !== 'Toutes' ? `(${categoryFilter})` : ''}</h3>
                  <select value={productSort} onChange={e => setProductSort(e.target.value as any)} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer appearance-none">
                      <option value="recent">Du plus récent au plus ancien</option>
                      <option value="az">De A à Z</option>
                      <option value="popular">Plus populaires</option>
                  </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map(product => {
               const status = getStockStatus(product.last_sold_date, product.created_at);
               return (
                 <div key={product.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-[#39FF14] dark:hover:border-[#39FF14] transition-all shadow-sm group h-[320px]">
                   <div className="h-40 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden shrink-0">
                     {product.image_url ? (
                       <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700"><Box size={40} /></div>
                     )}
                     <div className="absolute top-3 left-3 bg-white/80 dark:bg-black/60 p-1.5 rounded-lg backdrop-blur-md">
                       <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelection(product.id)} className="w-4 h-4 accent-black dark:accent-[#39FF14] cursor-pointer" />
                     </div>
                     <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md ${status.color}`}>{status.label}</span>
                     </div>
                   </div>
                   <div className="p-4 flex-1 flex flex-col">
                     <p className="font-bold text-sm text-black dark:text-white line-clamp-2 mb-1">{product.name}</p>
                     <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest truncate">{product.category || 'Non catégorisé'}</p>
                     
                     <div className="mt-auto pt-3 flex items-end justify-between border-t border-zinc-100 dark:border-zinc-800/50">
                       <p className="font-black text-lg text-[#39FF14]">{(product.unit_price || product.price_ttc || 0).toLocaleString('fr-FR')} <span className="text-xs text-black dark:text-white">F</span></p>
                       <div className="flex gap-1.5">
                         <button onClick={() => setViewingProduct(product)} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white rounded-lg transition-colors shadow-sm" title="Voir Fiche Technique"><Eye size={14}/></button>
                         <button onClick={() => handleOpenEdit(product)} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white rounded-lg transition-colors shadow-sm"><Edit size={14}/></button>
                         <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors shadow-sm"><Trash2 size={14}/></button>
                       </div>
                     </div>
                   </div>
                 </div>
               );
            })}
            {filteredProducts.length === 0 && (
               <div className="col-span-full p-10 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest italic bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">Aucun produit trouvé.</div>
            )}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pb-4">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 disabled:opacity-50 text-black dark:text-white transition-colors shadow-sm"><ChevronLeft size={16}/></button>
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-xl">Page {currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 disabled:opacity-50 text-black dark:text-white transition-colors shadow-sm"><ChevronRight size={16}/></button>
            </div>
          )}
      </div>

      {/* BARRE D'ACTIONS FLOTTANTE */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-[2rem] shadow-2xl flex flex-wrap justify-center items-center gap-4 z-50 animate-in slide-in-from-bottom-8 border border-zinc-800 dark:border-zinc-200">
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs shrink-0">
            <span className="bg-[#39FF14] text-black w-6 h-6 rounded-full flex items-center justify-center">{selectedIds.size}</span>
            Sélectionnés
          </div>
          <div className="hidden sm:block w-px h-6 bg-zinc-800 dark:bg-zinc-200 shrink-0"></div>
          <button onClick={() => setIsQuoteModalOpen(true)} className="text-[#39FF14] dark:text-black font-black uppercase text-xs hover:scale-105 transition-transform flex items-center gap-2 shrink-0">
            <FileText size={16} /> Créer un Devis
          </button>
          <button onClick={handleBulkTechnicalSheets} disabled={isGeneratingPdf} className="text-white dark:text-zinc-600 font-black uppercase text-xs hover:scale-105 transition-transform flex items-center gap-2 shrink-0 disabled:opacity-50">
            {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
            Générer Fiches Techniques
          </button>
          <div className="hidden sm:block w-px h-6 bg-zinc-800 dark:bg-zinc-200 shrink-0"></div>
          <button onClick={handleBulkDelete} className="text-red-500 hover:text-red-400 font-black uppercase text-xs hover:scale-105 transition-transform flex items-center gap-2 shrink-0">
            <Trash2 size={16} /> Supprimer Sélection
          </button>
        </div>
      )}

      {/* MODALE FICHE TECHNIQUE INDIVIDUELLE */}
      {viewingProduct && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setViewingProduct(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            
            <div className="w-full md:w-1/2 flex flex-col items-center">
              <div className="w-full aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm mb-4">
                {viewingProduct.image_url ? (
                  <img src={viewingProduct.image_url} alt={viewingProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700"><Box size={64} /></div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] bg-black px-3 py-1 rounded-full w-max mb-2 border border-[#39FF14]/30">{viewingProduct.category || 'Non catégorisé'}</span>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white mb-2 leading-tight">{viewingProduct.name}</h2>
              <p className="text-3xl font-black text-black dark:text-white mb-4">{(viewingProduct.unit_price || viewingProduct.price_ttc || 0).toLocaleString('fr-FR')} <span className="text-sm text-zinc-500">FCFA</span></p>
              
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-6 flex-1 whitespace-pre-wrap">
                 {viewingProduct.description || "Aucune description détaillée n'a été renseignée pour ce produit."}
              </p>
              
              <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
                 <button onClick={async () => { setIsGeneratingPdf(true); await generateTechnicalSheet(viewingProduct); setIsGeneratingPdf(false); }} disabled={isGeneratingPdf} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                    {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Télécharger PDF Fiche
                 </button>
                 <button onClick={() => {
                    const text = `Découvrez notre produit : *${viewingProduct.name}*\nPrix : ${(viewingProduct.unit_price || viewingProduct.price_ttc || 0).toLocaleString('fr-FR')} FCFA\n\n${viewingProduct.description || ''}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                 }} className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg">
                    <Send size={16} /> Envoyer via WhatsApp
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                       <span className="font-bold text-sm text-black dark:text-white">Catégorie : {camp.category}</span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                       Ces <span className="font-black text-black dark:text-zinc-300">{camp.products.length} produit(s)</span> dorment en stock.
                       L'IA a ciblé <span className="font-black text-[#39FF14] bg-black px-2 py-0.5 rounded-md mx-1">{camp.clients.length} clients/leads</span> de ce secteur d'activité pour les relancer.
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
            <button onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-red-500 hover:text-white transition-colors z-20"><X size={16}/></button>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-black dark:text-white pr-8">{isAddingProduct ? 'Nouveau Produit' : 'Éditer Produit'}</h2>
            
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
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block flex items-center gap-1"><ImageIcon size={14}/> Image du produit (URL)</label>
                    <div className="flex items-center gap-4">
                       {editForm.image_url ? (
                          <img src={editForm.image_url} alt="Aperçu" className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                       ) : (
                          <div className="w-16 h-16 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0"><ImageIcon size={20} className="text-zinc-400"/></div>
                       )}
                       <input type="url" value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} placeholder="https://..." className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-2">
                       <label className="text-xs font-bold text-zinc-500 uppercase block">Description / Pitch</label>
                       <button type="button" onClick={async () => {
                           setIsSavingEdit(true);
                           setTimeout(() => {
                               setEditForm(prev => ({ ...prev, description: `✨ **${editForm.name || 'Produit'}**\n\nDécouvrez la solution parfaite pour les professionnels exigeants. Alliant robustesse et performance, ce produit est conçu pour optimiser votre quotidien.\n\n✅ Qualité premium\n✅ Fiabilité éprouvée\n✅ Design ergonomique\n\nN'attendez plus pour transformer votre activité !` }));
                               setIsSavingEdit(false);
                           }, 1500);
                       }} className="text-[10px] font-black uppercase text-[#39FF14] bg-black px-3 py-1.5 rounded-lg flex items-center gap-1 hover:scale-105 transition-transform"><Bot size={12}/> Réécriture IA</button>
                    </div>
                    <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Description du produit..." className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] text-black dark:text-white min-h-[120px] resize-none" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
               <button onClick={handleSaveProduct} disabled={isSavingEdit} className="w-full bg-black dark:bg-white text-[#39FF14] dark:text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
                   {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : (isAddingProduct ? <Plus size={16} /> : <Save size={16} />)}
                   Enregistrer
               </button>
               {!isAddingProduct && editingProduct && (
                  <button onClick={() => {
                      setSelectedIds(new Set([editingProduct.id]));
                      setIsQuoteModalOpen(true);
                      setEditingProduct(null);
                  }} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white py-4 rounded-xl font-black uppercase text-xs hover:border-black dark:hover:border-white transition-colors flex justify-center items-center gap-2 shadow-sm">
                      <FileText size={16}/> Créer un devis
                  </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE GESTION DES CATÉGORIES */}
      {isCategoryModalOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsCategoryModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 flex flex-col md:flex-row gap-8 max-h-[90vh]">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            
            {/* Formulaire Catégorie */}
            <div className="flex-1 space-y-4">
              <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-black dark:text-white flex items-center gap-2"><FolderOpen size={20}/> {editingCategory ? 'Modifier' : 'Créer'} Catégorie</h2>
              <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nom de la catégorie *</label>
                  <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
              </div>
              <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Catégorie Parente (Optionnel)</label>
                  <select value={categoryForm.parent_id} onChange={e => setCategoryForm({...categoryForm, parent_id: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white appearance-none cursor-pointer">
                     <option value="">-- Aucune (Catégorie Principale) --</option>
                     {categories.filter(c => !c.parent_id).map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                     ))}
                  </select>
              </div>
              <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Image de Couverture (URL)</label>
                  <input type="url" value={categoryForm.cover_url} onChange={e => setCategoryForm({...categoryForm, cover_url: e.target.value})} placeholder="https://..." className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
              </div>
              {categoryForm.cover_url && (
                 <div className="w-full h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-2">
                    <img src={categoryForm.cover_url} alt="Aperçu" className="w-full h-full object-cover" onError={(e: any) => e.target.style.display = 'none'} />
                 </div>
              )}
              <div className="pt-2 flex gap-2">
                 {editingCategory && <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', parent_id: '', cover_url: '' }); }} className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 py-3 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">Annuler</button>}
                 <button onClick={handleSaveCategory} disabled={isSavingCategory} className="flex-[2] bg-black dark:bg-white text-[#39FF14] dark:text-black py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
                     {isSavingCategory ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
                 </button>
              </div>
            </div>

            {/* Liste des Catégories */}
            <div className="flex-1 flex flex-col md:border-l border-zinc-200 dark:border-zinc-800 md:pl-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Catégories Existantes</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                 {categories.map(c => (
                    <div key={c.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group hover:border-[#39FF14] transition-colors">
                       <div className="flex items-center gap-3">
                          {c.cover_url ? (
                             <img src={c.cover_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-zinc-200 dark:bg-zinc-800" />
                          ) : (
                             <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400"><FolderOpen size={14}/></div>
                          )}
                          <div>
                             <p className="font-bold text-sm text-black dark:text-white line-clamp-1">{c.name}</p>
                             {c.parent_id && <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-0.5">Sous-catégorie</p>}
                          </div>
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingCategory(c); setCategoryForm({ name: c.name, parent_id: c.parent_id || '', cover_url: c.cover_url || '' }); }} className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-800 rounded-md shadow-sm"><Edit size={12}/></button>
                          <button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 text-zinc-400 hover:text-red-500 bg-white dark:bg-zinc-800 rounded-md shadow-sm"><Trash2 size={12}/></button>
                       </div>
                    </div>
                 ))}
                 {categories.length === 0 && <p className="text-xs text-zinc-400 italic">Aucune catégorie pour le moment.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}