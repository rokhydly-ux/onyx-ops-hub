"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Settings, Save, Image as ImageIcon, Loader2, Palette, Type, Users, Bot, Plug, Plus, MessageSquare, Database, Activity, Phone, Edit, Trash2, X, CheckCircle, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Papa from 'papaparse';

function CRMSettingsContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [settings, setSettings] = useState({ crm_name: 'ONYX CRM', logo_url: '', theme_color: '#39FF14', admin_whatsapp: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'team' || tabFromUrl === 'equipe' ? 'team' : 'general');
  const [userId, setUserId] = useState<string | null>(null);

  const [commercials, setCommercials] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [importsHistory, setImportsHistory] = useState<any[]>([]);
  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState(false);
  const [editingCommercial, setEditingCommercial] = useState<any>(null);
  const [commercialForm, setCommercialForm] = useState({ full_name: '', phone: '', objective: 20, objective_period: 'Mois', status: 'Actif', password_temp: '0000', avatar_url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [importSearch, setImportSearch] = useState('');
  
  const [csvProgress, setCsvProgress] = useState(0);
  const [csvProgressText, setCsvProgressText] = useState('');
  const abortCsvImportRef = useRef(false);
  
  const [isSubmittingOdoo, setIsSubmittingOdoo] = useState(false);
  const odooFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingOdooFile, setPendingOdooFile] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const [msgJ0, setMsgJ0] = useState('Bonjour [Nom_Client], voici notre offre détaillée pour le montant de [Montant_Devis].');
  const [msgJ2, setMsgJ2] = useState('Bonjour [Nom_Client], avez-vous pu consulter notre proposition ?');
  const [msgJ7, setMsgJ7] = useState('Dernière relance pour votre devis. Cliquez ici : [Lien_Catalogue]');

  const handleOutsideClick = (setter: any, val: any = false) => (e: any) => {
    if (e.target.id === "modal-overlay") setter(val);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchSettings = async (user: any) => {
      try {
        const tId = user.user_metadata?.tenant_id || user.id;
        
        if (isMounted) setUserId(tId);
        const { data } = await supabase.from('crm_settings').select('*').eq('tenant_id', tId).maybeSingle();
        if (data && isMounted) setSettings({ crm_name: data.crm_name || 'ONYX CRM', logo_url: data.logo_url || '', theme_color: data.theme_color || '#39FF14', admin_whatsapp: data.admin_whatsapp || '' });
        
        const { data: comms } = await supabase.from('commercials').select('*').eq('tenant_id', tId);
        if (comms && isMounted) setCommercials(comms);
        
        const { data: leads } = await supabase.from('crm_leads').select('status, assigned_to').eq('tenant_id', tId);
        if (leads && isMounted) setAllLeads(leads);

        const { data: imports } = await supabase.from('crm_odoo_imports').select('*').eq('tenant_id', tId).order('created_at', { ascending: false });
        if (imports && isMounted) setImportsHistory(imports);
      } catch (err) {
        console.error("Erreur de fetch settings:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user && isMounted) {
        await fetchSettings(session.user);
      } else if (isMounted) {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && isMounted) fetchSettings(session.user);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      return alert("Erreur: Utilisateur non authentifié.");
    }
    setIsSaving(true);
    
    const payload = { tenant_id: userId, ...settings };
    
    const { data: existing } = await supabase.from('crm_settings').select('id').eq('tenant_id', userId).maybeSingle();
    let res;
    if (existing?.id) {
      res = await supabase.from('crm_settings').update(payload).eq('id', existing.id).select().single();
    } else {
      res = await supabase.from('crm_settings').insert([payload]).select().single();
    }
    const { data, error } = res;
    
    setIsSaving(false);
    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } else {
      if (data) setSettings({ crm_name: data.crm_name || 'ONYX CRM', logo_url: data.logo_url || '', theme_color: data.theme_color || '#39FF14', admin_whatsapp: data.admin_whatsapp || '' });
      alert("Paramètres enregistrés avec succès.");
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

  const chunkArray = <T,>(arr: T[], size: number): T[][] => 
      Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

  const handleFileUploadCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return alert("Utilisateur non authentifié.");
    const tenantId = session.user.user_metadata?.tenant_id || session.user.id;

    Papa.parse(file, {
       header: true,
       skipEmptyLines: true,
       complete: async (results) => {
          const { data: existingLeads } = await supabase.from('crm_leads').select('id, phone, status, created_at').eq('tenant_id', tenantId);
          const existingMap = new Map((existingLeads || []).map((l: any) => [l.phone, l]));

          const newLeads = results.data.map((row: any) => {
             const r: any = {};
             Object.keys(row).forEach(k => r[k.toLowerCase()] = row[k]);
             
             // Ignorer les statuts Facebook natifs
             delete r['lead_status'];
             delete r['status'];

             const name = r['full_name'] || r['name'] || r['nom'] || 'Lead Facebook';
             let phoneRaw = r['whatsapp_number'] || r['phone_number'] || r['phone'] || r['téléphone'] || r['numero'] || '';
             let phone = String(phoneRaw).replace(/\s+/g, '');
             if (phone && !phone.startsWith('+')) {
                 phone = phone.startsWith('221') ? `+${phone}` : `+221${phone}`;
             }
             
             const campaign = r['campaign_name'] || r['campagne'] || '';
             const email = r['email'] || '';
             
             // --- PRÉCISION DES DATES (Facebook created_time) ---
             const dateKey = Object.keys(r).find(k => k.includes('created_time') || k.includes('date') || k.includes('time'));
             let createdAt = new Date().toISOString();
             if (dateKey && r[dateKey]) {
                 const parsedDate = new Date(r[dateKey]);
                 if (!isNaN(parsedDate.getTime())) createdAt = parsedDate.toISOString();
             }
             
             const existingLead = existingMap.get(phone);

             let score = 'Tiède';
             let timeframe = 'Se renseigne';
             let budget = 0;
             const stateKey = Object.keys(r).find(k => k.includes('projet') || (k.includes('état') && !k.includes('état du prospect')) || (k.includes('etat') && !k.includes('lead_status')));
             
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
             
             // --- EXTRACTION ET NETTOYAGE DU BUDGET ---
             const budgetKey = Object.keys(r).find(k => k.includes('budget') || k.includes('montant') || k.includes('prix') || k.includes('price'));
             if (budgetKey && r[budgetKey]) {
                 const rawBudget = String(r[budgetKey]).replace(/[^0-9]/g, '');
                 if (rawBudget) budget = Number(rawBudget) || 0;
             }
             
             return {
                tenant_id: tenantId,
                full_name: name,
                phone: phone,
                email: email,
                campaign_name: campaign,
                lead_score: score,
                timeframe: timeframe,
                budget_estime: Number(budget),
                amount: Number(budget),
                type: 'Prospect',
                status: existingLead ? existingLead.status : 'Nouveau Lead', // Force statut ou préserve
                source: 'Facebook Ads',
                intent: campaign || 'Campagne FB',
                created_at: existingLead ? existingLead.created_at : createdAt
             };
          }).filter(l => l.phone); // Exclut les lignes sans numéro
          
          // Dédoublonnage par téléphone pour éviter l'erreur PostgreSQL "ON CONFLICT DO UPDATE"
          const deduplicatedLeads = Array.from(new Map(newLeads.map(l => [l.phone, l])).values());
          
          if (deduplicatedLeads.length === 0) return alert("Aucun lead avec un numéro valide n'a été trouvé.");

          setIsSubmitting(true);
          setCsvProgress(0);
          setCsvProgressText('Préparation des données...');
          abortCsvImportRef.current = false;
          
          const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
          const BATCH_SIZE = 25; // PRUDENCE : Lot réduit pour éviter le crash "Out Of Memory" Supabase
          const chunks = chunkArray(deduplicatedLeads, BATCH_SIZE);
          let totalImported = 0;
          let hasError = false;
          
          for (const [index, chunk] of chunks.entries()) {
              if (abortCsvImportRef.current) {
                  alert("Importation annulée par l'utilisateur.");
                  break;
              }
              const { data, error } = await supabase.from('crm_leads').upsert(chunk, { onConflict: 'phone, tenant_id' }).select('id');
              if (error) { 
                  console.error("Erreur d'import : " + error.message); 
                  alert(`Erreur sur le lot ${index + 1}: ${error.message}`);
                  hasError = true;
                  break; 
              }
              if (data) totalImported += data.length;
              
              setCsvProgress(Math.round((totalImported / deduplicatedLeads.length) * 100));
              setCsvProgressText(`Traitement en cours... (${totalImported}/${deduplicatedLeads.length} leads)`);
              await delay(250); // Pause de sécurité entre les requêtes
          }
          setIsSubmitting(false);
          setCsvProgressText('');
          
          if (!abortCsvImportRef.current && !hasError) alert(`${totalImported} leads importés et scorés par l'IA avec succès !`);
          if (csvFileInputRef.current) csvFileInputRef.current.value = '';
          window.location.reload();
       }
    });
  };

  const handleFileUploadOdoo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Utilisateur non authentifié.");
    const tenantId = user.user_metadata?.tenant_id || user.id;

    setIsSubmittingOdoo(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const ordersMap = new Map<string, any>();
          let currentOrderRef = "";
          let currentCustomerName = "";
          let currentCustomerPhone = "";
          let currentDate = "";
          let currentVendor = "";
          const cleanedData: any[] = [];

          for (const row of results.data as any[]) {
            const r: any = {};
            Object.keys(row).forEach(k => r[k.toLowerCase().trim()] = row[k]);

            const ref = r['référence de la commande'] || r['order reference'] || r['name'] || r['référence'];
            if (ref) {
              currentOrderRef = ref;
              currentCustomerName = r['client/nom'] || r['client'] || r['customer'] || '';
              currentCustomerPhone = r['client/téléphone/mobile'] || r['client/téléphone'] || r['téléphone'] || r['phone'] || '';
              currentDate = r['date de la commande'] || r['order date'] || r['date de création'] || r['date'] || '';
              currentVendor = r['vendeur/nom'] || r['vendeur'] || r['salesperson'] || '';
            }

            cleanedData.push({
              ...r,
              'référence de la commande': currentOrderRef,
              'client/nom': currentCustomerName,
              'téléphone': currentCustomerPhone,
              'date de la commande': currentDate,
              'vendeur': currentVendor
            });
          }

          cleanedData.forEach((r: any) => {
            const ref = r['référence de la commande'];
            if (!ref) return; // Ignore les lignes totalement vides

            const productName = r['lignes de commande/produit/nom'] || r['produit'] || r['product'] || '';
            
            let unitPriceRaw = r['lignes de commande/prix unitaire'] || r['prix unitaire'] || r['unit price'];
            let unitPrice = 0;
            if (unitPriceRaw !== undefined && String(unitPriceRaw).trim() !== '') {
                unitPrice = parseFloat(String(unitPriceRaw).replace(/[^0-9.-]+/g, '')) || 0;
            }

            const quantityRaw = r['lignes de commande/quantité'] || r['quantité'] || r['quantity'] || '1';
            const quantity = parseFloat(String(quantityRaw).replace(/[^0-9.-]+/g, '')) || 1;

            if (!ordersMap.has(ref)) {
              ordersMap.set(ref, {
                ref: ref,
                customerName: r['client/nom'],
                customerPhone: r['téléphone'],
                date: r['date de la commande'],
                vendorName: r['vendeur'],
                items: [],
                total: 0
              });
            }

            const order = ordersMap.get(ref);
            if (productName) {
              order.items.push({ name: productName, price: unitPrice, quantity });
              order.total += (unitPrice * quantity);
            }
          });

          const uniquePhonesPreview = new Set();
          const uniqueProductsPreview = new Set();
          for (const order of Array.from(ordersMap.values() as Iterable<any>)) {
             let cleanPhone = String(order.customerPhone || '').replace(/\s+/g, '');
             if (cleanPhone && !cleanPhone.startsWith('+') && cleanPhone.length > 0) {
                 if (cleanPhone.startsWith('00')) cleanPhone = '+' + cleanPhone.substring(2);
                 else if (cleanPhone.length === 9) cleanPhone = `+221${cleanPhone}`;
                 else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) cleanPhone = `+33${cleanPhone.substring(1)}`;
                 else cleanPhone = `+${cleanPhone}`;
             }
             if (cleanPhone) uniquePhonesPreview.add(cleanPhone);
             for (const item of order.items) {
                 if (item.name) uniqueProductsPreview.add(item.name);
             }
          }

          setPendingOdooFile({
             filename: file.name,
             ordersCount: ordersMap.size,
             clientsCount: uniquePhonesPreview.size,
             productsCount: uniqueProductsPreview.size,
             data: { ordersMap, tenantId }
          });
        } catch (err: any) {
          console.error("Erreur de parsing Odoo :", err);
          alert("Erreur lors du traitement du fichier Odoo : " + err.message);
        } finally {
          setIsSubmittingOdoo(false);
          if (odooFileInputRef.current) odooFileInputRef.current.value = '';
        }
      },
      error: (err) => {
        alert("Erreur de lecture du fichier CSV.");
        setIsSubmittingOdoo(false);
      }
    });
  };

  const handleConfirmOdooImport = async () => {
      if (!pendingOdooFile) return;
      setIsSubmittingOdoo(true);
      setProgress(0);
      setProgressText('Démarrage du traitement...');
      try {
          // 1. Fetch de l'utilisateur EN TEMPS RÉEL (pas de state externe)
          const { data: { session }, error: authError } = await supabase.auth.getSession();
          const userId = session?.user?.user_metadata?.tenant_id || session?.user?.id;

          if (authError || !userId) {
              console.error("Erreur d'authentification complète:", authError);
              alert("Erreur critique : Impossible de vérifier votre identité. Veuillez rafraîchir la page.");
              setPendingOdooFile(null);
              setIsSubmittingOdoo(false);
              setProgress(0);
              setProgressText('');
              return;
          }

          const { ordersMap } = pendingOdooFile.data;
          const ordersArray = Array.from(ordersMap.values() as Iterable<any>);
          const totalRows = ordersArray.length;
          const chunkSize = 300;
          const startTime = Date.now();
          
          for (let i = 0; i < totalRows; i += chunkSize) {
              const chunk = ordersArray.slice(i, i + chunkSize);
              const processed = i + chunk.length;
              const elapsed = Date.now() - startTime;
              const remainingSecs = Math.max(0, Math.round(((elapsed / processed) * totalRows - elapsed) / 1000));
              setProgressText(`Traitement de la ligne ${processed} sur ${totalRows}... (${remainingSecs}s restantes)`);
              
              const clientsToUpsert: any[] = [];
              const ordersToInsert: any[] = [];
              const uniquePhones = new Set<string>();
              const uniqueProductsMap = new Map<string, any>();

              // 1. Préparation des clients et produits
              for (const order of chunk) {
                  let cleanPhone = String(order.customerPhone || '').replace(/\s+/g, '');
                  if (cleanPhone && !cleanPhone.startsWith('+') && cleanPhone.length > 0) {
                       if (cleanPhone.startsWith('00')) cleanPhone = '+' + cleanPhone.substring(2);
                       else if (cleanPhone.length === 9) cleanPhone = `+221${cleanPhone}`;
                       else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) cleanPhone = `+33${cleanPhone.substring(1)}`;
                       else cleanPhone = `+${cleanPhone}`;
                  }
                  
                  order.cleanPhone = cleanPhone; // Stocké pour l'insertion de commande plus tard

                  if (cleanPhone && !uniquePhones.has(cleanPhone)) {
                      uniquePhones.add(cleanPhone);
                      
                      let assignedTo = null;
                      if (order.vendorName) {
                          const vName = String(order.vendorName).toLowerCase().trim();
                          const matchedComm = commercials.find((c: any) => {
                              const cName = String(c.full_name).toLowerCase().trim();
                              return cName === vName || vName.includes(cName) || cName.includes(vName);
                          });
                          assignedTo = matchedComm ? matchedComm.full_name : order.vendorName;
                      }

                      clientsToUpsert.push({
                          tenant_id: userId,
                          phone: cleanPhone,
                          full_name: order.customerName || 'Client Odoo',
                          type: 'Client',
                          ...(assignedTo ? { assigned_to: assignedTo } : {})
                      });
                  }

                  for (const item of order.items) {
                      if (item.name && item.price > 0 && !uniqueProductsMap.has(item.name)) {
                          uniqueProductsMap.set(item.name, {
                              tenant_id: userId,
                              name: item.name,
                              unit_price: item.price,
                              price_ttc: item.price,
                              last_sold_date: order.date ? new Date(order.date).toISOString() : new Date().toISOString()
                          });
                      }
                  }
              }

              if (clientsToUpsert.length > 0) {
                  const { error: clientError } = await supabase
                      .from('crm_contacts')
                      .upsert(clientsToUpsert, { onConflict: 'phone, tenant_id' });
                  
                  if (clientError) throw new Error("Erreur Contacts: " + clientError.message);
              }

              // 2.bis Récupération SÉCURISÉE des IDs (Même pour les contacts non modifiés par l'upsert)
              const contactIdMap = new Map<string, string>();
              const phonesArray = Array.from(uniquePhones);
              if (phonesArray.length > 0) {
                  const { data: allContacts, error: fetchError } = await supabase
                      .from('crm_contacts')
                      .select('id, phone')
                      .in('phone', phonesArray)
                      .eq('tenant_id', userId);
                  if (fetchError) throw new Error("Erreur Fetch Contacts: " + fetchError.message);
                  if (allContacts) {
                      allContacts.forEach(c => contactIdMap.set(c.phone, c.id));
                  }
              }

              // 3. Upsert Produits
              const productsToUpsert = Array.from(uniqueProductsMap.values());
              if (productsToUpsert.length > 0) {
                  const { error: productError } = await supabase.from('crm_products').upsert(productsToUpsert, { onConflict: 'name, tenant_id' });
                  if (productError) throw new Error("Erreur Produits: " + productError.message);
              }

              // 4. Préparation des Commandes (Avec le bon contact_id mappé !)
              for (const order of chunk) {
                  ordersToInsert.push({
                      tenant_id: userId,
                      order_ref: order.ref,
                      contact_id: contactIdMap.get(order.cleanPhone) || null, // Clé étrangère correcte
                      customer_name: order.customerName,
                      customer_phone: order.cleanPhone,
                      order_date: order.date ? new Date(order.date).toISOString() : new Date().toISOString(),
                      total_amount: order.total,
                      items: order.items
                  });
              }

              // 5. Upsert Commandes
              if (ordersToInsert.length > 0) {
                  const { error: orderError } = await supabase.from('crm_orders').upsert(ordersToInsert, { onConflict: 'order_ref, tenant_id' });
                  if (orderError) throw new Error("Erreur Commandes: " + orderError.message);
              }
              if (uniquePhones.size > 0) {
                  const phonesArray = Array.from(uniquePhones);
                  const { error: leadError } = await supabase.from('crm_leads').update({ status: 'Gagné', type: 'Client' }).in('phone', phonesArray).eq('tenant_id', userId);
                  if (leadError) throw new Error("Erreur Leads: " + leadError.message);
              }

              // --- ENREGISTREMENT HISTORIQUE IMPORT ODOO ---
              const { data: newImport } = await supabase.from('crm_odoo_imports').insert([{
                  tenant_id: userId,
                  filename: pendingOdooFile.filename,
                  orders_count: pendingOdooFile.ordersCount,
                  clients_count: pendingOdooFile.clientsCount,
                  products_count: pendingOdooFile.productsCount,
                  status: 'Succès'
              }]).select();
              
              if (newImport && newImport.length > 0) {
                  setImportsHistory(prev => [newImport[0], ...prev]);
              }

              setProgress(Math.round((processed / totalRows) * 100));
          }

          setProgressText('Importation terminée !');
          alert(`Import Odoo réussi ! ${totalRows} commandes synchronisées.`);
          
          const summaryMsg = `✅ *Rapport d'Importation Odoo - OnyxCRM*\n\nL'importation et la synchronisation de votre fichier de ventes sont terminées avec succès !\n\n📊 *Résumé des opérations :*\n📦 Commandes traitées : ${pendingOdooFile.ordersCount}\n👥 Clients mis à jour : ${pendingOdooFile.clientsCount}\n🛍️ Produits catalogue : ${pendingOdooFile.productsCount}\n\n_Vos indicateurs financiers et tableaux de bord sont désormais à jour._`;
          
          // Utilisation du numéro administrateur configuré
          let adminPhone = settings.admin_whatsapp ? String(settings.admin_whatsapp).replace(/[^0-9]/g, '') : '';
          if (adminPhone) {
              window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(summaryMsg)}`, '_blank');
          } else {
              window.open(`https://wa.me/?text=${encodeURIComponent(summaryMsg)}`, '_blank');
          }
          
          setPendingOdooFile(null);
      } catch (err: any) {
          console.error("Erreur d'import Odoo :", err);
          alert("Erreur lors de l'enregistrement Odoo : " + err.message);
      } finally {
          setIsSubmittingOdoo(false);
          setProgress(0);
          setProgressText('');
      }
  };

  const handleDeleteImport = async (id: string) => {
      if (!confirm("Voulez-vous vraiment supprimer cet historique d'import ?")) return;
      try {
          const { error } = await supabase.from('crm_odoo_imports').delete().eq('id', id);
          if (error) throw error;
          setImportsHistory(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
          alert("Erreur lors de la suppression : " + err.message);
      }
  };

  const filteredImports = importsHistory.filter(item => 
      (item.filename || '').toLowerCase().includes(importSearch.toLowerCase())
  );

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

          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-8 mt-8">
            <label className="text-xs font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Phone size={16}/> Numéro WhatsApp Admin (Rapports)</label>
            <input type="tel" placeholder="Ex: 221770000000" value={settings.admin_whatsapp} onChange={e => setSettings({...settings, admin_whatsapp: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none transition text-black dark:text-white focus:border-[#39FF14]" />
            <p className="text-[10px] text-zinc-500 font-bold mt-1">Ce numéro sera utilisé pour recevoir automatiquement le résumé de vos imports Odoo et alertes systèmes.</p>
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
              <button onClick={() => { setEditingCommercial(null); setCommercialForm({ full_name: '', phone: '', objective: 20, objective_period: 'Mois', status: 'Actif', password_temp: '0000', avatar_url: '' }); setIsCommercialModalOpen(true); }} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"><Plus size={16}/> Ajouter Commercial</button>
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
                          <div className="flex items-center gap-3">
                            <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.full_name}&background=random`} alt={member.full_name} className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
                            <div>
                               <p className="font-black text-sm uppercase">{member.full_name}</p>
                               <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1"><Phone size={10} className="inline mr-1"/> {member.phone}</p>
                            </div>
                          </div>
                       </td>
                       <td className="p-5 text-center">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${workloadColor}`}>{activeLeadsCount} Leads</span>
                       </td>
                       <td className="p-5 text-center">
                          <span className="font-black text-lg text-black dark:text-white">{member.objective || 20}</span><br/>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">/ {member.objective_period || 'Mois'}</span>
                       </td>
                       <td className="p-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${member.status === 'Actif' ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{member.status || 'Actif'}</span>
                       </td>
                       <td className="p-5 text-right">
                          <button onClick={() => {
                             setEditingCommercial(member);
                             setCommercialForm({ full_name: member.full_name, phone: member.phone, objective: member.objective || 20, objective_period: member.objective_period || 'Mois', status: member.status || 'Actif', password_temp: member.password_temp || '••••', avatar_url: member.avatar_url || '' });
                             setIsCommercialModalOpen(true);
                          }} className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"><Edit size={16}/></button>
                          <button onClick={async () => {
                             if (confirm('Supprimer ce commercial ?')) {
                                const { error } = await supabase.from('commercials').delete().eq('id', member.id).eq('tenant_id', userId);
                                if (error) {
                                    alert("Erreur de suppression: " + error.message);
                                } else {
                                    setCommercials(prev => prev.filter(c => c.id !== member.id));
                                }
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <h4 className="font-bold text-sm uppercase flex items-center gap-2"><Database size={16}/> Import IA (CSV Facebook Ads)</h4>
                 <button 
                   onClick={async () => {
                     if (confirm("🚨 DANGER : Voulez-vous vraiment supprimer TOUS vos leads ? Cette action est irréversible !")) {
                       setIsSubmitting(true);
                       const { error } = await supabase.from('crm_leads').delete().eq('tenant_id', userId);
                       setIsSubmitting(false);
                       if (error) alert("Erreur lors de la purge : " + error.message);
                       else { alert("Base de leads purgée avec succès !"); window.location.reload(); }
                     }
                   }} 
                   className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-colors shadow-sm"
                 >
                   Purger la base de Leads (Danger)
                 </button>
              </div>
              <p className="text-xs text-zinc-500">Uploadez votre export Facebook brut. L'IA se chargera de le structurer, le scorer et de calculer le budget prévisionnel.</p>
              <input type="file" accept=".csv" className="hidden" ref={csvFileInputRef} onChange={handleFileUploadCSV} />
              <button onClick={() => csvFileInputRef.current?.click()} disabled={isSubmitting} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-md flex items-center gap-2 w-max">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} 
                  {isSubmitting ? 'Traitement en cours...' : 'Uploader ou Mettre à jour (CSV)'}
              </button>
           </div>

           {/* Import Ventes Odoo */}
           <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm uppercase flex items-center gap-2"><Database size={16}/> Import Ventes Odoo (CSV)</h4>
              <p className="text-xs text-zinc-500">Importez vos commandes Odoo. L'IA regroupera les lignes, mettra à jour vos clients, construira votre catalogue et enregistrera l'historique d'achat.</p>
              <input type="file" accept=".csv" className="hidden" ref={odooFileInputRef} onChange={handleFileUploadOdoo} />
              <button onClick={() => odooFileInputRef.current?.click()} disabled={isSubmittingOdoo} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-md flex items-center gap-2 w-max">
                  {isSubmittingOdoo ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} 
                  {isSubmittingOdoo ? 'Traitement en cours...' : 'Uploader Export Odoo'}
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
              <button type="button" onClick={() => alert("Fonctionnalité de synchronisation Google Sheets en cours de développement.")} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest w-full hover:scale-[1.02] transition-transform">Forcer la Synchro</button>
           </div>

           {/* --- HISTORIQUE DES IMPORTS --- */}
           <div className="pt-8 mt-8 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                  <h4 className="font-black text-lg uppercase flex items-center gap-2"><Database size={20} className="text-[#39FF14]" /> Historique des Imports Odoo</h4>
                  <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                          type="text" 
                          placeholder="Rechercher un fichier..." 
                          value={importSearch}
                          onChange={e => setImportSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] text-black dark:text-white"
                      />
                  </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                 <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                       <tr>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Fichier</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Commandes</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Clients</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Produits</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Statut / Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                       {filteredImports.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                             <td className="p-4 text-xs font-bold text-black dark:text-white">{new Date(item.created_at).toLocaleDateString('fr-FR')} {new Date(item.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</td>
                             <td className="p-4 text-xs font-bold text-zinc-500">{item.filename}</td>
                             <td className="p-4 text-xs font-black text-center text-black dark:text-white">{item.orders_count}</td>
                             <td className="p-4 text-xs font-black text-center text-black dark:text-white">{item.clients_count}</td>
                             <td className="p-4 text-xs font-black text-[#39FF14] text-center">{item.products_count}</td>
                             <td className="p-4 text-right flex items-center justify-end gap-3">
                                <span className="bg-[#39FF14]/10 text-[#39FF14] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#39FF14]/20">{item.status}</span>
                                <button onClick={() => handleDeleteImport(item.id)} className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="Supprimer">
                                    <Trash2 size={14}/>
                                </button>
                             </td>
                          </tr>
                       ))}
                       {filteredImports.length === 0 && (
                          <tr><td colSpan={6} className="p-8 text-center text-zinc-500 font-bold text-xs uppercase tracking-widest italic">Aucun import trouvé.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* MODALE COMMERCIAL */}
      {isCommercialModalOpen && (
        <div id="modal-overlay" onClick={handleOutsideClick(setIsCommercialModalOpen, false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <button onClick={() => setIsCommercialModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h3 className="text-xl font-black uppercase mb-6 text-black dark:text-white">{editingCommercial ? 'Ajuster Objectifs' : 'Nouveau Commercial'}</h3>
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
                   // Mise à jour classique depuis le frontend
                   const { error } = await supabase.from('commercials').update({
                       full_name: payload.full_name,
                       phone: payload.phone,
                       objective: payload.objective,
                       status: payload.status,
                       avatar_url: payload.avatar_url,
                       password_temp: payload.password_temp === '••••' ? editingCommercial.password_temp : payload.password_temp
                   }).eq('id', editingCommercial.id).eq('tenant_id', userId);
                   if (error) throw error;
               } else {
                   const authPassword = payload.password_temp === '••••' || !payload.password_temp ? '0000' : payload.password_temp;
                   const phantomEmail = `${cleanPhone}@clients.onyxcrm.com`;
                   
                   // 1. Appel exclusif pour la création Auth
                   const res = await fetch('/api/crm/create-user', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ email: phantomEmail, password: authPassword, fullName: payload.full_name })
                   });
                   
                   if (!res.ok) {
                       const errorData = await res.json().catch(() => null);
                       throw new Error(errorData?.error || "Erreur API lors de la création Auth.");
                   }
                   
                   const { user } = await res.json();
                   
                   // 2. Insertion de la ligne dans la table
                   const { error } = await supabase.from('commercials').insert([{
                       id: user.id,
                       full_name: payload.full_name,
                       phone: cleanPhone,
                       objective: payload.objective,
                       objective_period: payload.objective_period,
                       status: payload.status || 'Actif',
                       avatar_url: payload.avatar_url,
                       password_temp: authPassword,
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
                <label className="text-xs font-bold text-zinc-500 uppercase">Photo de profil (URL)</label>
                <input type="url" value={commercialForm.avatar_url} onChange={e => setCommercialForm({...commercialForm, avatar_url: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white placeholder:text-zinc-500" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Code PIN</label>
                <input type="password" required inputMode="numeric" maxLength={4} value={commercialForm.password_temp} onChange={e => setCommercialForm({...commercialForm, password_temp: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="text-xs font-bold text-zinc-500 uppercase">Objectif</label>
                   <input type="number" required value={commercialForm.objective} onChange={e => setCommercialForm({...commercialForm, objective: parseInt(e.target.value) || 0})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-zinc-500 uppercase">Période</label>
                   <select value={commercialForm.objective_period} onChange={e => setCommercialForm({...commercialForm, objective_period: e.target.value})} className="w-full mt-1 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white appearance-none cursor-pointer">
                      <option value="Semaine">Semaine</option>
                      <option value="Mois">Mois</option>
                      <option value="Trimestre">Trimestre</option>
                   </select>
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

      {/* MODALE CONFIRMATION ODOO */}
      {pendingOdooFile && (
        <div id="modal-overlay" onClick={handleOutsideClick(setPendingOdooFile, null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 text-center">
            <button onClick={() => setPendingOdooFile(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><Database size={24}/></div>
            <h3 className="text-xl font-black uppercase mb-2 text-black dark:text-white">Confirmer l'import</h3>
            <p className="text-sm font-bold text-zinc-500 mb-6">Fichier : {pendingOdooFile.filename}</p>
            
            <div className="grid grid-cols-3 gap-2 mb-8">
               <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800"><p className="text-2xl font-black text-black dark:text-white">{pendingOdooFile.ordersCount}</p><p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Commandes</p></div>
               <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800"><p className="text-2xl font-black text-black dark:text-white">{pendingOdooFile.clientsCount}</p><p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Clients</p></div>
               <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800"><p className="text-2xl font-black text-[#39FF14]">{pendingOdooFile.productsCount}</p><p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Produits</p></div>
            </div>

            {isSubmittingOdoo && (
               <div className="mb-6 w-full text-left animate-in fade-in">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden shadow-inner">
                     <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-2 tracking-widest uppercase">{progressText}</p>
               </div>
            )}

            <div className="flex gap-3">
               <button onClick={() => setPendingOdooFile(null)} disabled={isSubmittingOdoo} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition disabled:opacity-50">Annuler</button>
               <button onClick={handleConfirmOdooImport} disabled={isSubmittingOdoo} className="flex-[2] py-4 bg-black dark:bg-white text-[#39FF14] dark:text-black rounded-xl font-black uppercase text-xs hover:scale-105 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100">
                  {isSubmittingOdoo ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>} {isSubmittingOdoo ? 'Import...' : 'Valider'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE PROGRESSION IMPORT CSV FACEBOOK */}
      {csvProgressText !== '' && (
        <div id="csv-modal-overlay" className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Database size={24}/>
            </div>
            <h3 className="text-xl font-black uppercase mb-2 text-black dark:text-white">Importation des Leads</h3>
            <div className="mb-6 w-full text-left">
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                   <div className="bg-[#39FF14] h-3 rounded-full transition-all duration-300" style={{ width: `${csvProgress}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">{csvProgressText}</p>
                    <p className="text-xs font-black text-black dark:text-white">{csvProgress}%</p>
                </div>
            </div>
            <button 
                onClick={() => abortCsvImportRef.current = true} 
                className="w-full py-3 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black uppercase text-xs transition-colors"
            >
                Annuler l'importation
            </button>
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