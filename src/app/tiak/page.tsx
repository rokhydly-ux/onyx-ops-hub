"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Truck, MapPin, Search, CheckCircle, Home, Phone, Printer, MessageSquare, PlusCircle, Store } from "lucide-react";

export default function OnyxTiakDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("Toutes");

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;
      let userData: any = null;

      // Fallback custom session
      if (!userId) {
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
            try { 
                userData = JSON.parse(customSession);
                userId = userData.id; 
            } catch (e) {}
        }
      } else {
         // Récupération des droits du client depuis Supabase
         const { data } = await supabase.from('clients').select('saas, active_saas').eq('id', userId).maybeSingle();
         userData = data;
      }

      if (!userId) {
          router.push('/');
          return;
      }

      // --- VÉRIFICATION D'ACCÈS SAAS (BLOCAGE URL DIRECTE) ---
      const activeModules = userData?.active_saas || [];
      const mainSaas = userData?.saas || '';
      const hasTiakAccess = activeModules.includes('tiak') || activeModules.includes('onyxtiak') || mainSaas.toLowerCase().includes('tiak');

      if (!hasTiakAccess) {
          alert("Accès refusé 🔒\n\nVous n'avez pas souscrit au module logistique Onyx Tiak. Redirection vers votre Hub.");
          router.push('/dashboard');
          return;
      }

      const { data: shop } = await supabase.from('shops').select('id, name').eq('owner_id', userId).single();
      if (shop) {
          setShopId(shop.id);
          fetchDeliveryOrders(shop.id);
      }
      setIsLoading(false);
    };
    verifyAuth();
  }, [router]);

  const fetchDeliveryOrders = async (id: string) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', id)
        .in('delivery_method', ['delivery'])
        .neq('status', 'Panier abandonné')
        .order('created_at', { ascending: false });
      
      if (data && !error) setOrders(data);
  };

  useEffect(() => {
    if (!shopId) return;
    const channel = supabase.channel('tiak-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${shopId}` }, () => { fetchDeliveryOrders(shopId); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [shopId]);

  const updateOrderStatus = async (orderId: string, status: string, driver?: string) => {
      const updateData: any = { status };
      if (driver !== undefined) updateData.delivery_driver = driver;
      
      await supabase.from('orders').update(updateData).eq('id', orderId);
      fetchDeliveryOrders(shopId!);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const uniqueZones = Array.from(new Set(orders.map(o => o.delivery_zone).filter(Boolean)));

  const filteredOrders = orders.filter(o => {
      const matchSearch = (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.tracking_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchZone = selectedZone === "Toutes" || o.delivery_zone === selectedZone;
      return matchSearch && matchZone;
  });

  const pendingOrders = filteredOrders.filter(o => o.status === 'En attente' || o.status === 'Payé' || o.status === 'En cours de préparation');
  const shippingOrders = filteredOrders.filter(o => o.status === 'Expédié');
  const deliveredOrders = filteredOrders.filter(o => o.status === 'Livré');

  const handlePrintRoute = () => {
      const ordersToPrint = [...pendingOrders, ...shippingOrders];
      if (ordersToPrint.length === 0) {
          alert("Aucune course à imprimer pour cette sélection.");
          return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
          alert("Veuillez autoriser les pop-ups pour imprimer.");
          return;
      }

      const rowsHtml = ordersToPrint.map(o => `
          <tr>
              <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                  <strong>${o.customer_name}</strong><br/>
                  <span style="font-size: 12px; color: #555;">Réf: ${o.tracking_number}</span>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd;">${o.customer_phone}</td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                  <strong>${o.delivery_zone || 'Zone non définie'}</strong><br/>
                  <span style="font-size: 12px;">${o.customer_address || 'Aucune adresse détaillée'}</span>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; color: #d35400;">
                  ${o.total_amount.toLocaleString()} F
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd;"></td>
          </tr>
      `).join('');

      printWindow.document.write(`
          <html>
              <head>
                  <title>Feuille de Route - ${selectedZone}</title>
                  <style>
                      body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                      h1 { text-transform: uppercase; color: #e67e22; margin-bottom: 5px; }
                      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                      th { background-color: #f9f9f9; padding: 12px; text-align: left; border-bottom: 2px solid #ccc; text-transform: uppercase; font-size: 12px; }
                  </style>
              </head>
              <body>
                  <h1>Feuille de Route Livreur</h1>
                  <p><strong>Zone de livraison :</strong> ${selectedZone}</p>
                  <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')} - ${ordersToPrint.length} course(s)</p>
                  
                  <table>
                      <thead>
                          <tr>
                              <th>Client & Réf</th>
                              <th>Contact</th>
                              <th>Adresse Complète</th>
                              <th>À Encaisser</th>
                              <th>Signature Client</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${rowsHtml}
                      </tbody>
                  </table>
                  
                  <script>
                      window.onload = () => { setTimeout(() => { window.print(); }, 250); };
                  </script>
              </body>
          </html>
      `);
      printWindow.document.close();
  };

  const handleSendRouteSMS = () => {
      const ordersToPrint = [...pendingOrders, ...shippingOrders];
      if (ordersToPrint.length === 0) {
          alert("Aucune course à envoyer pour cette sélection.");
          return;
      }
      let msg = `*📍 Feuille de Route Livreur - ${selectedZone}*\nDate: ${new Date().toLocaleDateString('fr-FR')}\nTotal courses: ${ordersToPrint.length}\n\n`;
      ordersToPrint.forEach((o, i) => {
          msg += `*${i+1}. ${o.customer_name}*\n📞 ${o.customer_phone}\n🏠 ${o.delivery_zone || 'Zone non définie'} - ${o.customer_address || 'Non spécifiée'}\n💰 À encaisser: ${o.total_amount.toLocaleString()} F\n\n`;
      });
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddExtraFee = async (orderId: string, currentTotal: number) => {
      const feeStr = prompt("Entrez le montant des frais supplémentaires (Urgence, Hors Zone, etc.) en FCFA :");
      if (!feeStr) return;
      const fee = parseInt(feeStr);
      if (isNaN(fee)) return alert("Montant invalide.");
      const newTotal = currentTotal + fee;
      if (confirm(`Le nouveau total sera de ${newTotal.toLocaleString()} F. Confirmer ?`)) {
          await supabase.from('orders').update({ total_amount: newTotal }).eq('id', orderId);
          fetchDeliveryOrders(shopId!);
      }
  };

  const Column = ({ title, count, color, children }: any) => (
      <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl p-4 flex flex-col h-[calc(100vh-180px)]">
          <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-black uppercase tracking-tighter text-sm flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                  {title}
              </h3>
              <span className="bg-white dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{count}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {children}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-orange-500/30">
      {/* HEADER */}
      <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Truck size={20}/></div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">Onyx <span className="text-orange-500">Tiak</span></h1>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={handlePrintRoute} className="hidden md:flex items-center gap-2 p-2 px-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 rounded-xl hover:bg-orange-100 transition font-bold text-sm shadow-sm" title="Imprimer la feuille de route">
                  <Printer size={16}/> Imprimer Route
              </button>
              <button onClick={handleSendRouteSMS} className="hidden md:flex items-center gap-2 p-2 px-4 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-xl hover:bg-green-100 transition font-bold text-sm shadow-sm" title="Envoyer par WhatsApp">
                  <MessageSquare size={16}/> SMS Route
              </button>
              <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)} className="hidden md:block py-2 px-4 bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer">
                  <option value="Toutes">Toutes les zones</option>
                  {uniqueZones.map(zone => <option key={zone as string} value={zone as string}>{zone as string}</option>)}
              </select>
              <div className="relative hidden md:block">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="text" placeholder="Rechercher une course..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <button onClick={() => router.push('/vente')} className="hidden md:flex items-center gap-2 p-2 px-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition font-bold text-sm" title="Retourner à ma boutique (Onyx Jaay)">
                  <Store size={16}/> Onyx Jaay
              </button>
              <button onClick={() => router.push('/dashboard')} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"><Home size={18}/></button>
          </div>
      </header>

      {/* KANBAN BOARD */}
      <main className="p-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* COLONNE 1 : À ASSIGNER */}
              <Column title="À Assigner (Entrepôt)" count={pendingOrders.length} color="bg-yellow-500">
                  {pendingOrders.map(order => (
                      <div key={order.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:border-orange-500 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-sm uppercase">{order.customer_name}</p>
                              <div className="flex items-center gap-2">
                                  <p className="text-xs font-black text-orange-500">{order.total_amount.toLocaleString()} F</p>
                                  <button onClick={(e) => { e.stopPropagation(); handleAddExtraFee(order.id, order.total_amount); }} className="text-zinc-400 hover:text-orange-500 transition-colors" title="Ajouter des frais (Urgence, Hors Zone)"><PlusCircle size={14}/></button>
                              </div>
                          </div>
                          <p className="text-[10px] text-zinc-500 flex items-center gap-1 mb-3"><MapPin size={12}/> {order.delivery_zone || 'Zone non définie'} - {order.customer_address}</p>
                          <button onClick={() => {
                              const driver = prompt("Nom ou Numéro du livreur à assigner :");
                              if(driver) updateOrderStatus(order.id, 'Expédié', driver);
                          }} className="w-full py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-[10px] font-black uppercase hover:bg-orange-500 hover:text-white transition-colors">Assigner un livreur</button>
                      </div>
                  ))}
              </Column>

              {/* COLONNE 2 : EN TRANSIT */}
              <Column title="En Transit (Livreurs)" count={shippingOrders.length} color="bg-blue-500">
                  {shippingOrders.map(order => (
                      <div key={order.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-900/50 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                          <p className="font-bold text-sm uppercase pl-2 mb-1">{order.customer_name}</p>
                          <p className="text-[10px] text-zinc-500 flex items-center gap-1 mb-2 pl-2"><Truck size={12}/> {order.delivery_driver}</p>
                          <div className="flex gap-2 pl-2 mt-3">
                              <button onClick={() => updateOrderStatus(order.id, 'Livré')} className="flex-1 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-transform flex justify-center items-center gap-1"><CheckCircle size={14}/> Livré</button>
                              <a href={`tel:${order.customer_phone}`} className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 text-zinc-600 dark:text-white"><Phone size={14}/></a>
                          </div>
                      </div>
                  ))}
              </Column>

              {/* COLONNE 3 : LIVRÉ */}
              <Column title="Courses Terminées" count={deliveredOrders.length} color="bg-green-500">
                  {deliveredOrders.map(order => (
                      <div key={order.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 opacity-60"><div className="flex justify-between items-center"><p className="font-bold text-xs line-through">{order.customer_name}</p><CheckCircle size={14} className="text-green-500"/></div></div>
                  ))}
              </Column>
          </div>
      </main>
    </div>
  );
}