"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Box, Search, Edit, Plus, CheckSquare, Clock, AlertTriangle, AlertCircle, X, Download, User, Minus, Bot, Sparkles, Send, Trash2, FolderOpen, Image as ImageIcon, Save, FileText, Eye, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Link, ChevronDown, ChevronUp, ImagePlus, Palette, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CRMCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [subcategoryFilter, setSubcategoryFilter] = useState('Toutes');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isEmailingQuote, setIsEmailingQuote] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [quoteQuantities, setQuoteQuantities] = useState<Record<number, number>>({});
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCampaigns, setAiCampaigns] = useState<any[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', subcategory: '', unit_price: 0, image_url: '', description: '', tags: [] as string[], image_gallery: '', video_gallery: '' });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Studio Catalogue
  const [isCatalogStudioOpen, setIsCatalogStudioOpen] = useState(false);
  const [isStudioDesignOpen, setIsStudioDesignOpen] = useState(true);
  const [studioTab, setStudioTab] = useState<'build' | 'analytics'>('build');
  const [catalogStats, setCatalogStats] = useState<any[]>([]);
  const [studioSelectedCategory, setStudioSelectedCategory] = useState('');
  const [studioSelectedSubCategory, setStudioSelectedSubCategory] = useState('');
  const [pdfProgress, setPdfProgress] = useState(0);
  const [crmSettings, setCrmSettings] = useState({ logo_url: '', crm_name: '' });
  const [catalogConfig, setCatalogConfig] = useState({
      coverTitle: 'Catalogue Produits',
      showSummary: true,
      logoX: 65,
      logoY: 60,
      logoSize: 80,
      coverImage: '',
      backCoverImage: '',
      logoUrl: ''
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
      if (isCatalogStudioOpen && studioTab === 'analytics' && tenantId) {
          supabase.from('catalog_analytics').select('*').eq('tenant_id', tenantId)
          .then(({data}) => { if (data) setCatalogStats(data); });
      }
  }, [isCatalogStudioOpen, studioTab, tenantId]);

  // Notifications Push en Temps Réel pour l'Admin
  useEffect(() => {
      if (!tenantId) return;
      
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
      }

      const channel = supabase
          .channel('realtime-catalog-views')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'catalog_analytics', filter: `tenant_id=eq.${tenantId}` }, (payload) => {
              const event = payload.new;
              let msg = "";
              if (event.event_type === 'view') {
                  msg = "👁️ Quelqu'un consulte actuellement votre catalogue !";
              } else if (event.event_type === 'click_whatsapp') {
                  msg = "💬 Un client s'apprête à vous contacter sur WhatsApp !";
              }
              
              if (msg) {
                  setToastMessage(msg);
                  setTimeout(() => setToastMessage(null), 5000);
                  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                      new Notification("Onyx Studio", { body: msg, icon: '/favicon.ico' });
                  }
              }
          })
          .subscribe();

      return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  const analyticsData = React.useMemo(() => {
      const grouped: Record<string, { date: string, views: number, clicks: number }> = {};
      catalogStats.forEach(stat => {
          const date = new Date(stat.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          if (!grouped[date]) grouped[date] = { date, views: 0, clicks: 0 };
          if (stat.event_type === 'view') grouped[date].views += 1;
          if (stat.event_type === 'click_whatsapp') grouped[date].clicks += 1;
      });
      return Object.values(grouped).slice(-7); // Affiche les 7 derniers jours d'activité
  }, [catalogStats]);
  
  const totalViews = catalogStats.filter(s => s.event_type === 'view').length;
  const totalClicks = catalogStats.filter(s => s.event_type === 'click_whatsapp').length;
  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

  const topClickedProducts = React.useMemo(() => {
      const clickCounts: Record<string, number> = {};
      catalogStats.forEach(stat => {
          if (stat.event_type === 'click_whatsapp' && stat.product_id) {
              clickCounts[stat.product_id] = (clickCounts[stat.product_id] || 0) + 1;
          }
      });

      return Object.entries(clickCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([productId, clicks]) => {
              const product = products.find(p => String(p.id) === String(productId));
              return product ? { ...product, clicks } : null;
          })
          .filter(Boolean);
  }, [catalogStats, products]);

  const handleDownloadAnalyticsPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Rapport Analytics - Le Studio", 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
      
      doc.setFontSize(14);
      doc.text("Vue d'ensemble", 14, 45);
      
      autoTable(doc, {
          startY: 50,
          head: [['Métrique', 'Valeur']],
          body: [
              ['Vues Totales', totalViews.toString()],
              ['Leads (Clics WhatsApp)', totalClicks.toString()],
              ['Taux de Conversion', `${conversionRate}%`]
          ],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
      });

      const finalY = (doc as any).lastAutoTable.finalY || 80;
      
      doc.setFontSize(14);
      doc.text("Top 5 Produits Cliqués", 14, finalY + 15);
      
      autoTable(doc, {
          startY: finalY + 20,
          head: [['Produit', 'Catégorie', 'Clics']],
          body: topClickedProducts.length > 0 ? topClickedProducts.map((p: any) => [
              p.name,
              p.category || 'N/A',
              p.clicks.toString()
          ]) : [['Aucun clic enregistré', '-', '-']],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
      });
      
      doc.save(`Analytics_Catalogue_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const emailQuote = async () => {
      const client = clients.find(c => String(c.id) === String(selectedClientId));
      if (!client) return alert("Veuillez sélectionner un client pour le devis !");
      
      const email = prompt("Veuillez entrer l'adresse e-mail du destinataire :");
      if (!email) return;

      setIsEmailingQuote(true);
      try {
          const selectedProducts = products.filter(p => selectedIds.has(p.id));
          const items = selectedProducts.map(p => ({ ...p, qty: quoteQuantities[p.id] || 1 }));
          const totalAmount = items.reduce((acc, p) => acc + ((p.unit_price || p.price_ttc || 0) * p.qty), 0);

          const doc = await buildQuotePdf(client, items, totalAmount);

          const pdfBlob = doc.output('blob');
          const fileName = `Devis_${client.full_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
          
          const { error: uploadError } = await supabase.storage.from('tontines').upload(fileName, pdfBlob, { contentType: 'application/pdf' });
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from('tontines').getPublicUrl(fileName);
          const fileUrl = urlData.publicUrl;

          const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  to: email,
                  subject: `Votre devis - ${client.full_name}`,
                  text: `Bonjour, veuillez trouver ci-joint votre devis. Lien: ${fileUrl}`,
                  html: `<p>Bonjour,</p><p>Veuillez trouver ci-joint le devis demandé pour <b>${client.full_name}</b>.</p><p><a href="${fileUrl}" target="_blank"><b>Cliquez ici pour consulter le devis (PDF)</b></a></p>`
              })
          });

          if (response.ok) alert("Devis envoyé par e-mail avec succès !");
          else alert("Erreur lors de l'envoi via l'API.");
      } catch (error: any) {
          alert("Erreur : " + error.message);
      } finally {
          setIsEmailingQuote(false);
      }
  };

  // Catégories
  const [advancedCategories, setAdvancedCategories] = useState<{id: string, name: string, subcategories: string[], color?: string}[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newSubCatNames, setNewSubCatNames] = useState<Record<string, string>>({});
  const [productSort, setProductSort] = useState<'recent' | 'az' | 'popular'>('recent');
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

        // Load Studio Config
        const savedConfig = localStorage.getItem('onyx_crm_catalog_design');
        if (savedConfig) {
            setCatalogConfig(JSON.parse(savedConfig));
        }

        const { data, error } = await supabase
          .from('crm_products')
          .select('*')
          .eq('tenant_id', tId)
          .order('created_at', { ascending: false });

        if (error) {
            console.error("🚨 ERREUR SQL (fetchProducts) :", error.message);
        }
        if (data && !error && isMounted) {
            // Filtrage hyper-sécurisé pour gérer les prix venant d'Odoo au format texte (ex: "15 000 FCFA")
            const validProducts = data.filter((p: any) => {
                const rawPrice = p.unit_price || p.price_ttc || p.price || 0;
                const cleanPrice = typeof rawPrice === 'string' ? Number(String(rawPrice).replace(/[^0-9.-]+/g, '')) : Number(rawPrice);
                return !isNaN(cleanPrice) && cleanPrice > 0;
            });
          setProducts(validProducts);
        }

        const { data: clientsData } = await supabase.from('clients').select('*').eq('tenant_id', tId);
        if (clientsData && isMounted) setClients(clientsData);

        const { data: settingsData } = await supabase.from('crm_settings').select('categories, category_covers').eq('tenant_id', tId).maybeSingle();
        const { data: fullSettings } = await supabase.from('crm_settings').select('id, categories, category_covers, logo_url, crm_name').eq('tenant_id', tId).maybeSingle();
        if (fullSettings && isMounted) {
          if (fullSettings.category_covers) setCategoryCovers(fullSettings.category_covers);
          
          let loadedCats = fullSettings.categories || [];
          let hasChanges = false;
          const existingNames = new Set(loadedCats.map((c: any) => c.name));

          // Synchronisation automatique des catégories existantes dans les produits
          if (data) {
             const uniqueFromProducts = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean)));
             uniqueFromProducts.forEach(cat => {
                 if (!existingNames.has(cat)) {
                     loadedCats.push({ id: crypto.randomUUID(), name: cat as string, subcategories: [], color: '#39FF14' });
                     existingNames.add(cat);
                     hasChanges = true;
                 }
             });
          }
          
          if (hasChanges) {
             const payload = { tenant_id: tId, categories: loadedCats };
             if (fullSettings.id) {
                 supabase.from('crm_settings').update(payload).eq('id', fullSettings.id).then();
             } else {
                 supabase.from('crm_settings').insert([payload]).then();
             }
          }
          
          setAdvancedCategories(loadedCats);
          setCrmSettings({ logo_url: fullSettings.logo_url || '', crm_name: fullSettings.crm_name || 'ONYX CRM' });
        } else if (isMounted) {
          // Si aucun paramètre n'existe, on initialise
          let loadedCats: any[] = [];
          if (data) {
             const uniqueFromProducts = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean)));
             loadedCats = uniqueFromProducts.map(cat => ({ id: crypto.randomUUID(), name: cat as string, subcategories: [], color: '#39FF14' }));
          }
          setAdvancedCategories(loadedCats);
          if (loadedCats.length > 0) {
             supabase.from('crm_settings').insert([{ tenant_id: tId, categories: loadedCats }]).then();
          }
        }
      } catch (err: any) {
        console.error("🚨 CRASH CRITIQUE (fetchProducts) :", err.message || err);
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
      setEditForm({ name: '', category: '', subcategory: '', unit_price: 0, image_url: '', description: '', tags: [], image_gallery: '', video_gallery: '' });
      setIsAddingProduct(true);
  };

  const handleOpenEdit = (p: any) => {
      setEditingProduct(p);
      setIsAddingProduct(false);
      setEditForm({ name: p.name || '', category: p.category || '', subcategory: p.subcategory || '', unit_price: p.unit_price || p.price_ttc || 0, image_url: p.image_url || '', description: p.description || '', tags: p.tags || [], image_gallery: p.image_gallery || '', video_gallery: p.video_gallery || '' });
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
      doc.text(`Catégorie : ${p.category || 'Non catégorisé'} ${p.subcategory ? ' - ' + p.subcategory : ''}`, 14, 75);
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

  const handleSaveCatalogConfig = (newConfig: any) => {
      setCatalogConfig(newConfig);
      localStorage.setItem('onyx_crm_catalog_design', JSON.stringify(newConfig));
  };

  const generateStudioCatalog = async () => {
      setIsGeneratingPdf(true);
      setPdfProgress(0);
      try {
          const doc = new jsPDF();
          const selectedProducts = products.filter(p => selectedIds.has(p.id));
          
          doc.setFillColor(0, 0, 0);
          doc.rect(0, 0, 210, 297, 'F');
          
          if (catalogConfig.coverImage) {
              try {
                  const img = new Image();
                  img.crossOrigin = "Anonymous";
                  img.src = catalogConfig.coverImage;
                  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
                  doc.addImage(img, 'JPEG', 0, 0, 210, 297); // Couverture pleine page
              } catch(e) { console.warn("Erreur image couverture", e); }
          }

          if (catalogConfig.logoUrl) {
              try {
                  const img = new Image();
                  img.crossOrigin = "Anonymous";
                  img.src = catalogConfig.logoUrl;
                  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
                  doc.addImage(img, 'PNG', catalogConfig.logoX, catalogConfig.logoY, catalogConfig.logoSize, catalogConfig.logoSize);
              } catch(e) { console.warn("Erreur logo", e); }
          }
          
          doc.setTextColor(57, 255, 20);
          doc.setFontSize(36);
          doc.text(catalogConfig.coverTitle.toUpperCase(), 105, 150, { align: 'center' });
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(14);
          doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 170, { align: 'center' });

          if (catalogConfig.showSummary) {
              doc.addPage();
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(24);
              doc.text("SOMMAIRE", 14, 20);
              let y = 40;
              
              const grouped = selectedProducts.reduce((acc, p) => {
                  const cat = p.category || 'Autres';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(p);
                  return acc;
              }, {} as Record<string, any[]>);

              doc.setFontSize(12);
              for (const [cat, prods] of Object.entries(grouped) as [string, any[]][]) {
                  if (y > 270) { doc.addPage(); y = 20; }
                  doc.setFont("helvetica", "bold");
                  doc.text(cat.toUpperCase(), 14, y);
                  y += 8;
                  doc.setFont("helvetica", "normal");
                  for (const p of prods) {
                      if (y > 280) { doc.addPage(); y = 20; }
                      doc.text(`• ${p.name}`, 20, y);
                      y += 8;
                  }
                  y += 5;
              }
          }

          for (let i = 0; i < selectedProducts.length; i++) {
              doc.addPage();
              await generateTechnicalSheet(selectedProducts[i], doc);
              setPdfProgress(Math.round(((i + 1) / selectedProducts.length) * 100));
          }

          if (catalogConfig.backCoverImage) {
              doc.addPage();
              try {
                  const img = new Image();
                  img.crossOrigin = "Anonymous";
                  img.src = catalogConfig.backCoverImage;
                  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
                  doc.addImage(img, 'JPEG', 0, 0, 210, 297); // Dos plein page
              } catch(e) { console.warn("Erreur image dos", e); }
          }
          
          doc.save(`Catalogue_${catalogConfig.coverTitle.replace(/\s+/g, '_')}.pdf`);
      } catch(e) {
          console.error(e);
          alert("Erreur lors de la génération du catalogue PDF.");
      } finally {
          setIsGeneratingPdf(false);
          setPdfProgress(0);
          // Ne pas fermer le studio automatiquement pour permettre de voir le téléchargement se terminer
      }
  };

  const handleQuickImageAdd = async (pId: number) => {
      const url = prompt("Collez l'URL de l'image (format JPG/PNG) :");
      if (url && url.trim() !== "") {
          setProducts(prev => prev.map(p => p.id === pId ? { ...p, image_url: url.trim() } : p));
          if (tenantId) {
              await supabase.from('crm_products').update({ image_url: url.trim() }).eq('id', pId).eq('tenant_id', tenantId);
          }
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
          const payload = { name: editForm.name, category: editForm.category, subcategory: editForm.subcategory, unit_price: editForm.unit_price, price_ttc: editForm.unit_price, image_url: editForm.image_url, description: editForm.description, tags: editForm.tags, image_gallery: editForm.image_gallery, video_gallery: editForm.video_gallery };
          if (isAddingProduct) {
              const { data, error } = await supabase.from('crm_products').insert([{ ...payload, tenant_id: tenantId, last_sold_date: new Date().toISOString() }]).select().single();
              if (error) throw error;
              setProducts(prev => [data, ...prev]);
              setIsAddingProduct(false);
          } else if (editingProduct) {
              const { data, error } = await supabase.from('crm_products').update(payload).eq('id', editingProduct.id).eq('tenant_id', tenantId).select();
              if (error) throw error;
              if (!data || data.length === 0) throw new Error("Modification bloquée (RLS). Activez l'UPDATE sur la table crm_products dans Supabase.");
              setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
              setEditingProduct(null);
          }
      } catch(err: any) {
          alert("Erreur lors de la mise à jour : " + err.message);
      } finally {
          setIsSavingEdit(false);
      }
  };

  const saveCategoriesToSettings = async (cats: any[]) => {
      if (!tenantId) return;
      setAdvancedCategories(cats); // Mise à jour optimiste pour l'UI
      const { data: existing } = await supabase.from('crm_settings').select('id').eq('tenant_id', tenantId).maybeSingle();
      const payload = { tenant_id: tenantId, categories: cats };
      if (existing?.id) {
          const { error } = await supabase.from('crm_settings').update(payload).eq('id', existing.id);
          if (error) alert("Erreur lors de la mise à jour des catégories : " + error.message);
      } else {
          const { error } = await supabase.from('crm_settings').insert([payload]);
          if (error) alert("Erreur lors de l'insertion des catégories : " + error.message);
      }
  };

  const handleAddAdvancedCategory = () => {
      if (!newCatName.trim()) return;
      const newCat = { id: crypto.randomUUID(), name: newCatName.trim(), subcategories: [], color: '#39FF14' };
      const newCats = [...advancedCategories, newCat];
      saveCategoriesToSettings(newCats);
      setNewCatName('');
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
      const newCats = [...advancedCategories];
      if (direction === 'up' && index > 0) {
          [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
      } else if (direction === 'down' && index < newCats.length - 1) {
          [newCats[index + 1], newCats[index]] = [newCats[index], newCats[index + 1]];
      } else {
          return;
      }
      saveCategoriesToSettings(newCats);
  };

  const handleUpdateCategoryColor = (catId: string, color: string) => {
      const newCats = advancedCategories.map(c => 
          c.id === catId ? { ...c, color } : c
      );
      saveCategoriesToSettings(newCats);
  };

  const handleMoveSubCategory = (catId: string, subIndex: number, direction: 'up' | 'down') => {
      const newCats = advancedCategories.map(c => {
          if (c.id === catId) {
              const newSubs = [...c.subcategories];
              if (direction === 'up' && subIndex > 0) {
                  [newSubs[subIndex - 1], newSubs[subIndex]] = [newSubs[subIndex], newSubs[subIndex - 1]];
              } else if (direction === 'down' && subIndex < newSubs.length - 1) {
                  [newSubs[subIndex + 1], newSubs[subIndex]] = [newSubs[subIndex], newSubs[subIndex + 1]];
              }
              return { ...c, subcategories: newSubs };
          }
          return c;
      });
      saveCategoriesToSettings(newCats);
  };

  const handleAddSubCategory = (catId: string) => {
      const subName = newSubCatNames[catId];
      if (!subName || !subName.trim()) return;
      const newCats = advancedCategories.map(c => 
          c.id === catId ? { ...c, subcategories: [...(c.subcategories || []), subName.trim()] } : c
      );
      saveCategoriesToSettings(newCats);
      setNewSubCatNames({ ...newSubCatNames, [catId]: '' });
  };

  const handleRemoveCategory = (catId: string) => {
      if (!confirm("Voulez-vous vraiment supprimer cette catégorie principale ?")) return;
      const newCats = advancedCategories.filter(c => c.id !== catId);
      saveCategoriesToSettings(newCats);
  };

  const handleRemoveSubCategory = (catId: string, subIndex: number) => {
      const newCats = advancedCategories.map(c => 
          c.id === catId ? { ...c, subcategories: c.subcategories.filter((_: any, i: number) => i !== subIndex) } : c
      );
      saveCategoriesToSettings(newCats);
  };

  // --- HELPER DE GÉNÉRATION DU DEVIS ---
  const buildQuotePdf = async (client: any, items: any[], totalAmount: number) => {
      const doc = new jsPDF();
      let startY = 50;

      // Ajout du logo si disponible
      if (crmSettings.logo_url) {
          try {
              const img = new Image();
              img.crossOrigin = "Anonymous";
              img.src = crmSettings.logo_url;
              await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
              doc.addImage(img, 'PNG', 14, 10, 30, 30);
              doc.setFontSize(22);
              doc.text("DEVIS COMMERCIAL", 50, 25);
          } catch(e) {
              doc.setFontSize(22);
              doc.text("DEVIS COMMERCIAL", 14, 20);
          }
      } else {
          doc.setFontSize(22);
          doc.text("DEVIS COMMERCIAL", 14, 20);
      }

      doc.setFontSize(12);
      doc.text(`Client : ${client.full_name}`, 14, 30);
      doc.text(`Téléphone : ${client.phone}`, 14, 36);
      doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 14, 42);
      
      autoTable(doc, {
          startY: startY,
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

      const finalY = (doc as any).lastAutoTable.finalY || startY;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL NET : ${totalAmount.toLocaleString('fr-FR')} F CFA`, 14, finalY + 15);

      // Lien de Paiement Cliquable
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 255);
      doc.textWithLink("👉 Cliquez ici pour payer ce devis en ligne", 14, finalY + 30, { url: "https://pay.onyxlinks.com/paiement" });
      doc.setTextColor(0, 0, 0); // Reset color
      
      return doc;
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

      const doc = await buildQuotePdf(client, items, totalAmount);

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
        
        if (produitsNonClasses.length === 0) {
            alert("Aucun produit non classé à traiter !");
            setIsLoading(false);
            return;
        }

        const productCategoryMap: Record<string, string[]> = {
            'BOULANGERIE & PÂTISSERIE': ['pétrin', 'diviseuse', 'four à sole', 'façonneuse', 'batteur', 'laminoir'],
            'CUISSON PROFESSIONNELLE': ['four mixte', 'friteuse', 'grillade', 'marmite', 'sauteuse', 'feux vifs', 'piano de cuisson'],
            'FROID INDUSTRIEL': ['chambre froide', 'machine à glaçons', 'armoire réfrigérée', 'congélateur', 'glace', 'réfrigérée'],
            'PRÉPARATION & SNACKING': ['trancheur', 'hachoir', 'blender', 'machine chawarma', 'panini', 'gaufrier', 'presse-agrume'],
            'EXPOSITION & VITRINE': ['vitrine chauffante', 'vitrine à pâtisserie', 'saladette', 'présentoir'],
            'ARTICLES MÉNAGERS (B2C)': ['vaisselle', 'petit électroménager', 'ustensile', 'accessoire de table', 'assiette', 'verre', 'poêle', 'cuillère'],
            'TRAITEUR & CATERING': ['bain marie', 'chafing dish', 'faitout', 'conteneur isotherme'],
            'TRANSFORMATION AGRICOLE': ['moulin', 'farine', 'décortiqueuse', 'broyeur'],
            'EMBALLAGE & PACKAGING': ['ensacheuse', 'remplisseuse', 'scelleuse', 'dateur', 'operculeuse']
        };

        const updates = produitsNonClasses.map(p => {
            const name = (p.name || '').toLowerCase();
            let newCat = "📦 Nouveaux Arrivages (À trier)";
            let newSubCat = "Non classé";
            let found = false;

            for (const [category, keywords] of Object.entries(productCategoryMap)) {
                for (const keyword of keywords) {
                    if (name.includes(keyword)) {
                        newCat = category;
                        newSubCat = keyword.charAt(0).toUpperCase() + keyword.slice(1);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            return { id: p.id, category: newCat, subcategory: newSubCat };
        });
          
          if (tenantId && updates.length > 0) {
            const updatePromises = updates.map(productUpdate => 
                supabase.from('crm_products').update({ category: productUpdate.category, subcategory: productUpdate.subcategory }).eq('id', productUpdate.id).eq('tenant_id', tenantId)
            );
            const results = await Promise.all(updatePromises);
            const errors = results.filter(res => res.error);
            if (errors.length > 0) {
                console.error('Erreurs de mise à jour Supabase:', errors);
                throw new Error(`Échec de la mise à jour de ${errors.length} produit(s).`);
            }
              
            const { data } = await supabase.from('crm_products').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
            if (data) {
                const validProducts = data.filter((p: any) => {
                    const rawPrice = p.unit_price || p.price_ttc || p.price || 0;
                    const cleanPrice = typeof rawPrice === 'string' ? Number(String(rawPrice).replace(/[^0-9.-]+/g, '')) : Number(rawPrice);
                    return !isNaN(cleanPrice) && cleanPrice > 0;
                });
                setProducts(validProducts);
            }
        }
        
        alert(`Catégorisation IA terminée ! ${updates.length} produits ont été analysés et mis à jour.`);
      } catch (erreur: any) {
          alert("Une erreur est survenue lors de la catégorisation : " + (erreur.message || JSON.stringify(erreur)));
      } finally {
          setIsLoading(false);
      }
  };

  const filteredProducts = React.useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return products.filter(p => {
      const matchSearch = searchLower === '' || (p.name || '').toLowerCase().includes(searchLower) || (p.category || '').toLowerCase().includes(searchLower) || (p.tags && Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(searchLower)));

      let matchCat = false;
      if (categoryFilter === 'Toutes') {
          matchCat = true;
      } else {
          matchCat = p.category === categoryFilter || (p.category || '').startsWith(categoryFilter + ' /');
      }
              
              let matchSubcat = false;
              if (subcategoryFilter === 'Toutes') {
                  matchSubcat = true;
              } else {
                  matchSubcat = p.subcategory === subcategoryFilter;
              }

          const rawPrice = p.unit_price || p.price_ttc || p.price || 0;
          const price = typeof rawPrice === 'string' ? Number(String(rawPrice).replace(/[^0-9.-]+/g, '')) : Number(rawPrice);
      const matchMin = minPrice === '' || price >= Number(minPrice);
      const matchMax = maxPrice === '' || price <= Number(maxPrice);
              return matchSearch && matchCat && matchSubcat && matchMin && matchMax;
    }).sort((a, b) => {
        if (productSort === 'az') return (a.name || '').localeCompare(b.name || '');
        if (productSort === 'popular') return (b.unit_price || 0) - (a.unit_price || 0);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [products, search, categoryFilter, subcategoryFilter, minPrice, maxPrice, productSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, subcategoryFilter, minPrice, maxPrice]);

  const availableSubcategories = React.useMemo(() => {
     if (categoryFilter === 'Toutes') return [];
     const selectedCat = advancedCategories.find(c => c.name === categoryFilter);
     if (selectedCat && selectedCat.subcategories && selectedCat.subcategories.length > 0) {
         return selectedCat.subcategories;
     }
     return Array.from(new Set(products.filter(p => p.category === categoryFilter && p.subcategory).map(p => p.subcategory as string)));
  }, [categoryFilter, advancedCategories, products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueCategories = React.useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products]);
  
  const displayCategories = React.useMemo(() => {
    const categoryMap = new Map<string, {id: string, name: string, subcategories: string[], color?: string}>();

    // Add categories from products first as a base
    uniqueCategories.forEach(catName => {
        if (catName) {
            categoryMap.set(catName, { id: catName, name: catName, subcategories: [] });
        }
    });

    // Then, overwrite/add with advanced settings for more details (like subcategories and color)
    advancedCategories.forEach(advCat => {
        categoryMap.set(advCat.name, advCat);
    });

    return Array.from(categoryMap.values());
  }, [advancedCategories, uniqueCategories]);

  const allCategoryNames = displayCategories.map(c => c.name);
  const subcategoriesForForm = React.useMemo(() => {
      const selectedCat = displayCategories.find(c => c.name === editForm.category);
      return selectedCat?.subcategories || [];
  }, [displayCategories, editForm.category]);

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#39FF14]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Catalogue & Écosystème</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gérez vos offres et votre inventaire</p>
        </div>
      </div>

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
                <button onClick={() => setIsCatalogStudioOpen(true)} className="bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 hover:scale-105 transition-transform"><FileText size={16}/> Le Studio</button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={16} className="text-zinc-400 shrink-0" />
                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setSubcategoryFilter('Toutes'); }} className="w-full md:w-auto bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#39FF14] appearance-none cursor-pointer text-black dark:text-white">
                  <option value="Toutes">Toutes les catégories</option>
                  {advancedCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {categoryFilter !== 'Toutes' && availableSubcategories.length > 0 && (
                    <select value={subcategoryFilter} onChange={e => setSubcategoryFilter(e.target.value)} className="w-full md:w-auto bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#39FF14] appearance-none cursor-pointer text-black dark:text-white">
                      <option value="Toutes">Toutes les sous-catégories</option>
                      {availableSubcategories.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                )}
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
          {categoryFilter === 'Toutes' && !search && displayCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayCategories.map(catData => {
                      const cat = catData.name;
                      const defaultImg = `https://placehold.co/800x800/111/39FF14?text=${encodeURIComponent(cat)}`;
                      const count = products.filter(p => {
                          return p.category === cat;
                      }).length;
                      
                      const img = categoryCovers[cat] || defaultImg;

                      return (
                      <div key={catData.id} onClick={() => setCategoryFilter(cat)} className="relative h-64 rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all border border-zinc-200 dark:border-zinc-800 bg-black">
                          <img src={img} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                          
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              const newUrl = prompt(`Entrez l'URL de la nouvelle image pour la catégorie "${cat}" :`, img);
                              if (newUrl !== null && newUrl.trim() !== "") {
                                const newCovers = { ...categoryCovers, [cat]: newUrl.trim() };
                                setCategoryCovers(newCovers);
                                if (tenantId) {
                                    const { data: existing } = await supabase.from('crm_settings').select('id').eq('tenant_id', tenantId).maybeSingle();
                                    
                                    const payload: any = { tenant_id: tenantId, category_covers: newCovers, crm_name: 'ONYX CRM' };
                                    if (existing?.id) payload.id = existing.id; // Si l'entrée existe, on passe son ID pour déclencher l'Update
                                    
                                    const { data, error } = await supabase.from('crm_settings').upsert(payload).select();
                                    if (error) alert("Erreur de sauvegarde : " + error.message);
                                    else if (!data || data.length === 0) alert("Sauvegarde bloquée (RLS). Vérifiez vos politiques d'accès sur crm_settings.");
                                }
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
              {categoryFilter !== 'Toutes' && !search && subcategoryFilter === 'Toutes' && (() => {
                  const selectedCategoryData = advancedCategories.find(c => c.name === categoryFilter);
                  // Si des sous-catégories sont définies dans les paramètres, on les utilise.
                  // Sinon, on les génère dynamiquement à partir des produits de la catégorie sélectionnée.
                  const subcategories = (selectedCategoryData?.subcategories?.length ?? 0) > 0 
                      ? selectedCategoryData!.subcategories 
                      : Array.from(new Set(products.filter(p => p.category === categoryFilter && p.subcategory).map(p => p.subcategory as string)));

                  if (subcategories.length > 0) {
                      return (
                          <div className="space-y-12">
                              <div className="flex justify-end">
                                  <button onClick={() => setCategoryFilter('Toutes')} className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"><ChevronLeft size={14}/> Retour aux familles</button>
                              </div>
                              {subcategories.map(subCat => {
                                  const subCatProducts = products
                                      .filter(p => p.category === categoryFilter && p.subcategory === subCat)
                                      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                                      .slice(0, 7);
                                  
                                  if (subCatProducts.length === 0) return null;

                                  return (
                                      <div key={subCat} className="mb-10">
                                          <h3 className="font-black uppercase text-xl flex items-center gap-2 mb-6"><Sparkles className="text-[#39FF14]"/> {subCat}</h3>
                                          <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
                                              {subCatProducts.map(p => (
                                                  <div key={p.id} className="snap-start shrink-0 w-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm flex flex-col group cursor-pointer hover:border-[#39FF14] transition-all" onClick={() => handleOpenEdit(p)}>
                                                      <div className="h-48 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                                                          <img src={p.image_url || 'https://placehold.co/400x400/1a1a1a/39FF14?text=PRD'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                          <span className="absolute top-3 right-3 bg-black text-[#39FF14] text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg border border-[#39FF14]/30">Nouveau</span>
                                                      </div>
                                                      <div className="p-5 flex flex-col gap-1">
                                                          <p className="font-bold text-sm truncate">{p.name}</p>
                                                          <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest truncate">
                                                              {p.category}
                                                              {p.subcategory && <span className="text-zinc-400 opacity-70"> • {p.subcategory}</span>}
                                                          </p>
                                                          <p className="text-[#39FF14] font-black mt-2 text-lg">{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      );
                  }

                  // Fallback to original "Nouveautés" slider if no subcategories
                  return (
                      <div className="mb-10">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-black uppercase text-xl flex items-center gap-2"><Sparkles className="text-[#39FF14]"/> Les Nouveautés</h3>
                              <button onClick={() => setCategoryFilter('Toutes')} className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"><ChevronLeft size={14}/> Retour aux familles</button>
                          </div>
                          <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
                             {products.filter(p => {
                                 if (categoryFilter === "📦 Nouveaux Arrivages (À trier)") {
                                     return !p.category || p.category === '' || p.category === 'Autre' || p.category === "📦 Nouveaux Arrivages (À trier)" || !categoryCovers[p.category];
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
                                        <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest truncate">
                                          {p.category}
                                          {p.subcategory && <span className="text-zinc-400 opacity-70"> • {p.subcategory}</span>}
                                        </p>
                                        <p className="text-[#39FF14] font-black mt-2 text-lg">{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                                     </div>
                                 </div>
                             ))}
                          </div>
                      </div>
                  );
              })()}
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black uppercase text-lg">Tous les produits {categoryFilter !== 'Toutes' ? `(${categoryFilter}${subcategoryFilter !== 'Toutes' ? ' - ' + subcategoryFilter : ''})` : ''}</h3>
                  <select value={productSort} onChange={e => setProductSort(e.target.value as any)} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer appearance-none">
                      <option value="recent">Du plus récent au plus ancien</option>
                      <option value="az">De A à Z</option>
                      <option value="popular">Plus populaires</option>
                  </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map(product => {
               const status = getStockStatus(product.last_sold_date, product.created_at);
               const catColor = advancedCategories.find(c => c.name === product.category)?.color || '#39FF14';
               const rawDisplayPrice = product.unit_price || product.price_ttc || product.price || 0;
               const cleanDisplayPrice = typeof rawDisplayPrice === 'string' ? Number(String(rawDisplayPrice).replace(/[^0-9.-]+/g, '')) : Number(rawDisplayPrice);
               return (
                 <div key={product.id} onMouseEnter={(e) => e.currentTarget.style.borderColor = catColor} onMouseLeave={(e) => e.currentTarget.style.borderColor = ''} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col transition-all shadow-sm group h-[320px]">
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
                     {product.tags && product.tags.map((tag: string, i: number) => (
                        <span key={i} className={`absolute bottom-3 ${i === 0 ? 'left-3' : 'left-24'} px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-black/80 text-[#39FF14] backdrop-blur-md border border-[#39FF14]/30 shadow-lg`}>{tag}</span>
                     ))}
                   </div>
                   <div className="p-4 flex-1 flex flex-col">
                     <p className="font-bold text-sm text-black dark:text-white line-clamp-2 mb-1">{product.name}</p>
                     <div className="inline-flex items-center w-max px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-widest truncate border bg-zinc-50 dark:bg-zinc-900" style={{ borderColor: catColor, color: catColor }}>
                       {product.category || 'Non catégorisé'}
                       {product.subcategory && <span className="text-zinc-400 opacity-70"> • {product.subcategory}</span>}
                     </div>
                     
                     <div className="mt-auto pt-3 flex items-end justify-between border-t border-zinc-100 dark:border-zinc-800/50">
                       <p className="font-black text-lg text-[#39FF14]">{(isNaN(cleanDisplayPrice) ? 0 : cleanDisplayPrice).toLocaleString('fr-FR')} <span className="text-xs text-black dark:text-white">F</span></p>
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

          {!(categoryFilter === 'Toutes' && !search && displayCategories.length > 0) && totalPages > 1 && (
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
              {viewingProduct.image_gallery && (
                <div className="flex overflow-x-auto gap-2 snap-x mt-2 custom-scrollbar pb-2 w-full">
                  {String(viewingProduct.image_gallery).split(',').map((img, idx) => (
                    <img key={idx} src={img.trim()} alt="Gallery" className="snap-start w-20 h-20 object-cover rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900" />
                  ))}
                </div>
              )}
              {viewingProduct.video_gallery && (
                <a href={viewingProduct.video_gallery} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 self-start">
                   ▶️ Voir la vidéo démo
                </a>
              )}
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] bg-black px-3 py-1 rounded-full w-max border border-[#39FF14]/30">{viewingProduct.category || 'Non catégorisé'}</span>
                {viewingProduct.subcategory && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full w-max border border-zinc-200 dark:border-zinc-800">{viewingProduct.subcategory}</span>
                )}
              </div>
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
              <button onClick={generateQuote} className="flex-[1.5] py-4 bg-black dark:bg-white text-[#39FF14] dark:text-black font-black uppercase text-xs rounded-xl hover:scale-105 transition flex justify-center items-center gap-2 shadow-lg">
                <Download size={16}/> WhatsApp
              </button>
              <button onClick={emailQuote} disabled={isEmailingQuote} className="flex-[1.5] py-4 bg-blue-500 text-white font-black uppercase text-xs rounded-xl hover:scale-105 transition flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
                {isEmailingQuote ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} E-mail
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
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 border border-zinc-200 dark:border-zinc-800">
            
            {/* HEADER */}
            <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0 flex justify-between items-center bg-white dark:bg-zinc-950">
              <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">{isAddingProduct ? 'Nouveau Produit' : 'Éditer Produit'}</h2>
              <button onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-red-500 hover:text-white transition-colors text-zinc-500"><X size={16}/></button>
            </div>
            
            {/* CONTENT (SCROLLABLE) */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar bg-zinc-50 dark:bg-zinc-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonne Gauche */}
                <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nom du Produit</label>
                      <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Catégorie</label>
                          <select 
                            value={editForm.category} 
                            onChange={e => setEditForm({...editForm, category: e.target.value, subcategory: ''})} 
                            className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white appearance-none cursor-pointer"
                          >
                             <option value="" disabled>Sélectionner une catégorie</option>
                             {allCategoryNames.map(catName => (
                                <option key={catName} value={catName}>{catName}</option>
                             ))}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Sous-catégorie</label>
                          <input 
                            type="text"
                            list="subcat-options"
                            value={editForm.subcategory || ''} 
                            onChange={e => setEditForm({...editForm, subcategory: e.target.value})} 
                            placeholder="Ex: Sneakers (ou choisir)"
                            className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white"
                          />
                          <datalist id="subcat-options">
                             {subcategoriesForForm.map(sub => (
                                <option key={sub} value={sub} />
                             ))}
                          </datalist>
                      </div>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Prix Unitaire (F CFA)</label>
                      <input type="number" value={editForm.unit_price} onChange={e => setEditForm({...editForm, unit_price: Number(e.target.value)})} className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                  </div>
                </div>
                
                {/* Colonne Droite */}
                <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-1"><ImageIcon size={14}/> Image du produit (URL)</label>
                      <div className="flex flex-col gap-4">
                         <input type="url" value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} placeholder="https://..." className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                         {editForm.image_url ? (
                            <img src={editForm.image_url} alt="Aperçu" className="w-full h-32 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0 shadow-sm" />
                         ) : (
                            <div className="w-full h-32 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0"><ImageIcon size={32} className="text-zinc-400"/></div>
                         )}
                      </div>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Galerie Images (URLs séparées par virgule)</label>
                      <input type="text" value={editForm.image_gallery || ''} onChange={e => setEditForm({...editForm, image_gallery: e.target.value})} placeholder="https://img1.jpg, https://img2.jpg" className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">URL Vidéo Démo</label>
                      <input type="text" value={editForm.video_gallery || ''} onChange={e => setEditForm({...editForm, video_gallery: e.target.value})} placeholder="https://youtube.com/..." className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white" />
                  </div>
                </div>
                
                {/* Tags Rapides (Pleine largeur) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Tags & Badges Rapides</label>
                    <div className="flex flex-wrap gap-2">
                        {['En Promo', 'Nouveau', 'Best-Seller', 'Liquidation', 'Exclusivité'].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                    const newTags = editForm.tags.includes(tag) ? editForm.tags.filter(t => t !== tag) : [...editForm.tags, tag];
                                    setEditForm({ ...editForm, tags: newTags });
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-colors shadow-sm ${editForm.tags.includes(tag) ? 'bg-black dark:bg-white text-[#39FF14] dark:text-black border border-[#39FF14] dark:border-white' : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-black dark:hover:border-white'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description (Pleine largeur) */}
                <div className="col-span-1 md:col-span-2">
                    <div className="flex justify-between items-end mb-2">
                       <label className="text-xs font-bold text-zinc-500 uppercase block">Description / Pitch</label>
                       <button type="button" onClick={async () => {
                           setIsSavingEdit(true);
                           setTimeout(() => {
                               setEditForm(prev => {
                                   const price = prev.unit_price || 0;
                                   const oldPrice = Math.round(price * 1.3);
                                   return { ...prev, description: `🔥 OFFRE EXCLUSIVE : **${prev.name || 'Produit'}** 🔥\n\nPréparez le rush de la saison avec cet équipement indispensable ! Idéal pour booster votre activité.\n\n💰 Prix Exceptionnel : ${(price).toLocaleString('fr-FR')} F\n❌ ~Prix normal : ${(oldPrice).toLocaleString('fr-FR')} F~\n\n⏳ Attention : Cette offre flash est valable uniquement jusqu'à vendredi ! Premier arrivé, premier servi.\n\n[Lien Vidéo Démo]\n\nÀ très vite,\nMaïmouna - Central Équipements` };
                               });
                               setIsSavingEdit(false);
                           }, 1500);
                       }} className="text-[10px] font-black uppercase text-[#39FF14] bg-black px-3 py-1.5 rounded-lg flex items-center gap-1 hover:scale-105 transition-transform shadow-md"><Bot size={12}/> Réécriture IA</button>
                    </div>
                    <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Description détaillée du produit..." className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] text-black dark:text-white min-h-[120px] resize-none custom-scrollbar" />
                </div>
              </div>
            </div>
            
            {/* FOOTER */}
            <div className="p-4 md:p-6 border-t border-zinc-200 dark:border-zinc-800 shrink-0 flex flex-wrap justify-end items-center gap-3 bg-white dark:bg-zinc-950">
               {!isAddingProduct && editingProduct && (
                  <button onClick={() => {
                      setSelectedIds(new Set([editingProduct.id]));
                      setIsQuoteModalOpen(true);
                      setEditingProduct(null);
                  }} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-lg font-bold text-sm hover:border-black dark:hover:border-white transition-colors flex items-center gap-2 shadow-sm mr-auto">
                      <FileText size={16}/> Créer un devis
                  </button>
               )}
               <button onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} className="px-6 py-3 rounded-lg font-bold text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors">
                  Annuler
               </button>
               <button onClick={handleSaveProduct} disabled={isSavingEdit} className="px-6 py-3 rounded-lg font-black uppercase text-sm bg-[#39FF14] text-black hover:bg-black hover:text-[#39FF14] transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
                   {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : (isAddingProduct ? <Plus size={16} /> : <Save size={16} />)}
                   Enregistrer
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE GESTION DES CATÉGORIES */}
      {isCategoryModalOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsCategoryModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] p-8 max-w-3xl w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 text-black dark:text-white flex items-center gap-3">
               <FolderOpen size={24} className="text-[#39FF14]" /> Gérer les Catégories
            </h2>

            <div className="flex gap-4 mb-8">
               <input 
                   type="text" 
                   value={newCatName} 
                   onChange={e => setNewCatName(e.target.value)} 
                   placeholder="Nouvelle catégorie principale (ex: Froid)" 
                   className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-[#39FF14] text-black dark:text-white"
               />
               <button onClick={handleAddAdvancedCategory} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-6 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex items-center gap-2 shadow-md">
                   <Plus size={16}/> Ajouter
               </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                {advancedCategories.map((cat, index) => (
                    <div key={cat.id} className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all" style={{ borderLeftColor: cat.color || '#39FF14', borderLeftWidth: '4px' }}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <input type="color" value={cat.color || '#39FF14'} onChange={(e) => handleUpdateCategoryColor(cat.id, e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0" title="Changer la couleur" />
                                <h3 className="font-black text-lg uppercase" style={{ color: cat.color || 'inherit' }}>{cat.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleMoveCategory(index, 'up')} disabled={index === 0} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm disabled:opacity-30"><ArrowUp size={16}/></button>
                                <button onClick={() => handleMoveCategory(index, 'down')} disabled={index === advancedCategories.length - 1} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm disabled:opacity-30"><ArrowDown size={16}/></button>
                                <button onClick={() => handleRemoveCategory(cat.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm ml-2"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        
                        <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-3">
                            <div className="flex flex-col gap-2">
                                {cat.subcategories?.map((sub, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg shadow-sm w-max min-w-[200px]">
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mr-4">{sub}</span>
                                        <div className="flex items-center gap-1 ml-2">
                                           <button onClick={() => handleMoveSubCategory(cat.id, idx, 'up')} disabled={idx === 0} className="text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-30 p-1"><ArrowUp size={12}/></button>
                                           <button onClick={() => handleMoveSubCategory(cat.id, idx, 'down')} disabled={idx === cat.subcategories.length - 1} className="text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-30 p-1"><ArrowDown size={12}/></button>
                                           <button onClick={() => handleRemoveSubCategory(cat.id, idx)} className="text-zinc-400 hover:text-red-500 ml-1 p-1"><X size={12}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2 max-w-sm">
                               <input 
                                   type="text" 
                                   value={newSubCatNames[cat.id] || ''} 
                                   onChange={e => setNewSubCatNames({...newSubCatNames, [cat.id]: e.target.value})} 
                                   placeholder="Nouvelle sous-catégorie..." 
                                   className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#39FF14] text-black dark:text-white"
                               />
                               <button onClick={() => handleAddSubCategory(cat.id)} className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-3 py-2 rounded-lg font-black hover:bg-[#39FF14] hover:text-black transition-colors">
                                   <Plus size={14}/>
                               </button>
                            </div>
                        </div>
                    </div>
                 ))}
                {advancedCategories.length === 0 && (
                    <p className="text-center text-zinc-500 font-bold py-10">Aucune catégorie. Créez-en une pour commencer.</p>
                )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE STUDIO CATALOGUE */}
      {isCatalogStudioOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsCatalogStudioOpen(false)} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] p-8 max-w-6xl w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
             <button onClick={() => setIsCatalogStudioOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pr-10">
                 <h2 className="text-2xl font-black uppercase flex items-center gap-3 text-black dark:text-white">
                   <FileText className="text-[#39FF14]" size={24}/> Le Studio : {studioTab === 'build' ? 'Création' : 'Analytics'}
                 </h2>
                 <div className="flex items-center gap-3">
                     {studioTab === 'analytics' && (
                         <button onClick={handleDownloadAnalyticsPDF} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition flex items-center gap-2">
                             <Download size={14} /> Export PDF
                         </button>
                     )}
                     <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl">
                         <button onClick={() => setStudioTab('build')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition ${studioTab === 'build' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Création</button>
                         <button onClick={() => setStudioTab('analytics')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition ${studioTab === 'analytics' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>📊 Analytics</button>
                     </div>
                 </div>
             </div>
             
             {studioTab === 'build' ? (
             <div className="flex flex-col gap-4 flex-1 min-h-0">
                {/* ACCORDION DESIGN */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shrink-0 transition-all shadow-sm">
                   <button onClick={() => setIsStudioDesignOpen(!isStudioDesignOpen)} className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 flex justify-between items-center font-black uppercase text-xs tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <span className="flex items-center gap-2 text-black dark:text-white"><Palette size={16} className="text-[#39FF14]"/> Design du Catalogue (Optionnel)</span>
                      {isStudioDesignOpen ? <ChevronUp size={16} className="text-zinc-500"/> : <ChevronDown size={16} className="text-zinc-500"/>}
                   </button>
                   {isStudioDesignOpen && ( // NOTE: This section was correct, just providing context for the change below
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-zinc-950">
                         <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Titre Couverture</label>
                            <input type="text" value={catalogConfig.coverTitle} onChange={e => handleSaveCatalogConfig({...catalogConfig, coverTitle: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold mt-1 outline-none focus:border-[#39FF14]" placeholder="Catalogue 2026"/>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500">URL Couverture (1ère page)</label>
                            <input type="url" value={catalogConfig.coverImage} onChange={e => handleSaveCatalogConfig({...catalogConfig, coverImage: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold mt-1 outline-none focus:border-[#39FF14]" placeholder="https://... (Optionnel)"/>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500">URL Dos (Dernière page)</label>
                            <input type="url" value={catalogConfig.backCoverImage || ''} onChange={e => handleSaveCatalogConfig({...catalogConfig, backCoverImage: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold mt-1 outline-none focus:border-[#39FF14]" placeholder="https://... (Optionnel)"/>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500">URL Logo (Filigrane)</label>
                            <input type="url" value={catalogConfig.logoUrl || ''} onChange={e => handleSaveCatalogConfig({...catalogConfig, logoUrl: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold mt-1 outline-none focus:border-[#39FF14]" placeholder="https://... (PNG transparent)"/>
                         </div>
                         <div className="lg:col-span-4 flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[80px]">
                               <label className="text-[10px] font-bold uppercase text-zinc-500">Logo Pos. X</label>
                               <input type="number" value={catalogConfig.logoX} onChange={e => handleSaveCatalogConfig({...catalogConfig, logoX: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold mt-1 outline-none focus:border-[#39FF14]"/>
                            </div>
                            <div className="flex-1 min-w-[80px]">
                               <label className="text-[10px] font-bold uppercase text-zinc-500">Logo Pos. Y</label>
                               <input type="number" value={catalogConfig.logoY} onChange={e => handleSaveCatalogConfig({...catalogConfig, logoY: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold mt-1 outline-none focus:border-[#39FF14]"/>
                            </div>
                            <div className="flex-1 min-w-[80px]">
                               <label className="text-[10px] font-bold uppercase text-zinc-500">Logo Taille</label>
                               <input type="number" value={catalogConfig.logoSize} onChange={e => handleSaveCatalogConfig({...catalogConfig, logoSize: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold mt-1 outline-none focus:border-[#39FF14]"/>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 dark:bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 h-[42px] mt-1">
                               <input type="checkbox" checked={catalogConfig.showSummary} onChange={e => handleSaveCatalogConfig({...catalogConfig, showSummary: e.target.checked})} className="w-4 h-4 accent-black dark:accent-[#39FF14]"/>
                               <span className="text-xs font-bold uppercase text-black dark:text-white">Générer Sommaire</span>
                            </label>
                         </div>
                      </div>
                   )}
                </div>

                {/* Sélection Produits */}
                <div className="flex flex-col flex-1 min-h-0">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 shrink-0">
                      <h3 className="font-bold uppercase text-zinc-500 text-xs tracking-widest flex items-center gap-2"><Box size={16}/> Sélection des produits ({selectedIds.size} cochés)</h3>
                      <div className="flex gap-2 w-full sm:w-auto">
                          <select value={studioSelectedCategory} onChange={e => { setStudioSelectedCategory(e.target.value); setStudioSelectedSubCategory(''); }} className="w-full sm:w-48 p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold outline-none focus:border-[#39FF14] cursor-pointer text-black dark:text-white">
                              <option value="">Toutes les catégories</option>
                              {advancedCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                          <select value={studioSelectedSubCategory} onChange={e => setStudioSelectedSubCategory(e.target.value)} disabled={!studioSelectedCategory} className="w-full sm:w-48 p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold outline-none focus:border-[#39FF14] cursor-pointer text-black dark:text-white disabled:opacity-50">
                              <option value="">Toutes les sous-catégories</option>
                              {advancedCategories.find(c => c.name === studioSelectedCategory)?.subcategories?.map(sub => (
                                  <option key={sub} value={sub}>{sub}</option>
                              ))}
                          </select>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[250px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.filter(p => {
                          const matchCat = !studioSelectedCategory || p.category === studioSelectedCategory;
                          const matchSub = !studioSelectedSubCategory || p.subcategory === studioSelectedSubCategory;
                          return matchCat && matchSub;
                      }).map(p => (
                         <div key={p.id} className={`flex flex-col bg-white dark:bg-zinc-900/50 p-3 rounded-2xl border ${selectedIds.has(p.id) ? 'border-[#39FF14] shadow-sm' : 'border-zinc-200 dark:border-zinc-800'} transition-all relative group cursor-pointer`} onClick={() => toggleSelection(p.id)}>
                            <div className="absolute top-2 left-2 z-10">
                               <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => {}} className="w-4 h-4 accent-black dark:accent-[#39FF14] cursor-pointer shadow-md border-2 border-white"/>
                            </div>
                            
                            <div className="w-full aspect-square rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden relative bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                               {p.image_url ? (
                                   <img src={p.image_url} className="w-full h-full object-cover"/>
                               ) : (
                                   <button onClick={(e) => { e.stopPropagation(); handleQuickImageAdd(p.id); }} className="w-full h-full flex flex-col items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                       <ImagePlus size={24}/>
                                       <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">Ajouter Image</span>
                                   </button>
                               )}
                               {p.image_url && (
                                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); handleQuickImageAdd(p.id); }} className="text-white hover:text-[#39FF14] p-2 bg-black/50 rounded-full backdrop-blur-sm"><Edit size={16}/></button>
                                   </div>
                               )}
                            </div>

                            <div className="flex-1 min-w-0">
                               <p className="font-bold text-xs text-black dark:text-white line-clamp-2 leading-tight mb-1">{p.name}</p>
                               <p className="text-xs font-black text-[#39FF14]">{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                            </div>
                         </div>
                      ))}
                   </div>

                   <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0 flex flex-col sm:flex-row gap-3 relative z-10 bg-white dark:bg-zinc-950">
                      <button onClick={() => { setSelectedIds(new Set()); setStudioSelectedCategory(''); }} className="px-6 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-bold uppercase text-xs rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">Réinitialiser</button>
                      <button onClick={() => {
                          const ids = Array.from(selectedIds).join(',');
                          const link = `${window.location.origin}/catalogue?ids=${ids}&t=${tenantId}`;
                          navigator.clipboard.writeText(link);
                          alert("✅ Lien web du catalogue copié ! Vous pouvez le coller sur WhatsApp.");
                      }} disabled={selectedIds.size === 0} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex justify-center items-center gap-2 shadow-md disabled:opacity-50">
                         <Link size={16}/> Lien Web
                      </button>
                      <button onClick={generateStudioCatalog} disabled={isGeneratingPdf || selectedIds.size === 0} className="relative overflow-hidden flex-1 bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
                         {isGeneratingPdf && <div className="absolute inset-y-0 left-0 bg-black/20 transition-all duration-300" style={{ width: `${pdfProgress}%` }} />}
                         <span className="relative z-10 flex items-center gap-2">
                            {isGeneratingPdf ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                            {isGeneratingPdf ? `Génération... ${pdfProgress}%` : `PDF (${selectedIds.size})`}
                         </span>
                      </button>
                   </div>
                </div>
             </div>
             ) : (
                 <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                       <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Vues Totales</p>
                          <p className="text-4xl font-black text-black dark:text-white">{totalViews}</p>
                       </div>
                       <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Leads (Clics WhatsApp)</p>
                          <p className="text-4xl font-black text-[#39FF14]">{totalClicks}</p>
                       </div>
                       <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/30">
                          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Taux de Conversion</p>
                          <p className="text-4xl font-black text-blue-600 dark:text-blue-500">{conversionRate}%</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px]">
                       <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-80 shadow-sm flex flex-col">
                          <h3 className="font-black uppercase mb-6 text-sm text-zinc-500">Performances sur les 7 derniers jours</h3>
                          <div className="flex-1">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                   <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                   <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                   <Tooltip cursor={{fill: 'rgba(57, 255, 20, 0.05)'}} contentStyle={{backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', color: '#fff'}} />
                                   <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
                                   <Bar dataKey="views" name="Ouverture du Lien" fill="#71717a" radius={[4, 4, 0, 0]} />
                                   <Bar dataKey="clicks" name="Contact sur WhatsApp" fill="#39FF14" radius={[4, 4, 0, 0]} />
                                </BarChart>
                             </ResponsiveContainer>
                          </div>
                       </div>

                       <div className="lg:col-span-1 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col max-h-[320px]">
                          <h3 className="font-black uppercase mb-6 text-sm text-zinc-500">Top 5 Produits Cliqués</h3>
                          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                             {topClickedProducts.length > 0 ? topClickedProducts.map((p: any, idx: number) => (
                                <div key={p.id} className="flex items-center gap-3">
                                   <div className="w-5 font-black text-zinc-400 text-xs">#{idx + 1}</div>
                                   <img src={p.image_url || 'https://placehold.co/100x100/1a1a1a/39FF14?text=PRD'} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0 shadow-sm" />
                                   <div className="flex-1 min-w-0">
                                      <p className="font-bold text-xs text-black dark:text-white truncate">{p.name}</p>
                                      <p className="text-[10px] text-[#39FF14] font-black mt-0.5">{p.clicks} {p.clicks > 1 ? 'clics' : 'clic'}</p>
                                   </div>
                                </div>
                             )) : (
                                <p className="text-zinc-500 text-xs italic text-center py-10">Aucun clic enregistré pour l'instant.</p>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
             )}
           </div>
        </div>
      )}

       {/* TOAST NOTIFICATION TEMPS RÉEL */}
       {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-[#39FF14] dark:text-black px-6 py-3 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 z-[300] animate-in slide-in-from-bottom-5">
              <Sparkles size={16}/> {toastMessage}
          </div>
       )}
    </div>
  );
}