"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Package, Plus, Trash2, Edit2, Download, MessageSquare, FileText, Upload, X, ChevronRight } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Product = {
  id: string;
  nom: string;
  description: string;
  quantite: number;
  photo_url: string;
  gallery_urls: string[];
  video_url?: string;
};

export default function OnyxVentePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"catalogue" | "commandes" | "devis">("catalogue");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [formProduct, setFormProduct] = useState<Partial<Product>>({ nom: "", description: "", quantite: 0, photo_url: "", gallery_urls: [], video_url: "" });
  const [orders, setOrders] = useState<any[]>([]);
  const [shopConfig, setShopConfig] = useState({ name: "Ma Boutique", address: "", date: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProducts();
      loadOrders();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data } = await supabase.from("products").select("*");
      setProducts((data as Product[]) || []);
    } catch { setProducts([]); }
  };

  const loadOrders = async () => {
    try {
      const { data } = await supabase.from("orders").select("*");
      setOrders(data || []);
    } catch { setOrders([]); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
    }
    setAuthLoading(false);
  };

  const saveProduct = async () => {
    const payload = { ...formProduct, quantite: Number(formProduct.quantite) || 0 };
    try {
      if (editingProduct?.id) {
        await supabase.from("products").update(payload).eq("id", editingProduct.id);
      } else {
        await supabase.from("products").insert({ ...payload, id: crypto.randomUUID() });
      }
    } catch (e) { console.error(e); }
    loadProducts();
    setShowProductModal(false);
    setEditingProduct(null);
    setFormProduct({ nom: "", description: "", quantite: 0, photo_url: "", gallery_urls: [], video_url: "" });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try { await supabase.from("products").delete().eq("id", id); } catch (e) { console.error(e); }
    loadProducts();
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || "";
      const lines = text.split("\n").slice(1);
      const rows: Partial<Product>[] = [];
      lines.forEach((line) => {
        const [id, nom, description, quantite, photo_url] = line.split("\t").map((c) => c.trim());
        if (nom) rows.push({ id: id || crypto.randomUUID(), nom, description: description || "", quantite: parseInt(quantite || "0") || 0, photo_url: photo_url || "" });
      });
      rows.forEach((r) => { try { supabase.from("products").upsert(r); } catch {} });
      loadProducts();
    };
    reader.readAsText(file, "UTF-8");
  };

  const generateDevisPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Devis - ${shopConfig.name}</title></head><body style="font-family:Inter,sans-serif;padding:40px">
        <h1>Devis</h1>
        <p><strong>${shopConfig.name}</strong></p>
        <p>${shopConfig.address || ""}</p>
        <p>Date : ${shopConfig.date || new Date().toLocaleDateString("fr-FR")}</p>
        <hr/>
        <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse">
          <tr><th>Produit</th><th>Description</th><th>Qté</th><th>Prix unit.</th></tr>
          ${products.map((p) => `<tr><td>${p.nom}</td><td>${p.description}</td><td>${p.quantite}</td><td>-</td></tr>`).join("")}
        </table>
        <p style="margin-top:20px">Merci pour votre confiance.</p>
      </body></html>`);
    win.document.close();
    win.print();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="w-12 h-12 border-4 border-black border-t-[#39FF14] rounded-full animate-spin" />
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#39FF14] mx-auto mb-4">
              <Package size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Onyx Vente</h1>
            <p className="text-sm text-zinc-500 mt-1">Catalogue & Devis WhatsApp</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setAuthMode("login")} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${authMode === "login" ? "bg-black text-[#39FF14]" : "bg-zinc-100 text-zinc-500"}`}>Connexion</button>
              <button type="button" onClick={() => setAuthMode("register")} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${authMode === "register" ? "bg-black text-[#39FF14]" : "bg-zinc-100 text-zinc-500"}`}>Créer</button>
            </div>
            <button type="submit" disabled={authLoading} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-[1.02] transition disabled:opacity-50">
              {authLoading ? "Chargement..." : authMode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black uppercase tracking-tighter">Onyx Vente</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold text-zinc-500 hover:text-black">Déconnexion</button>
      </header>

      <div className="flex border-b border-zinc-200 bg-white">
        {(["catalogue", "commandes", "devis"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-black uppercase flex items-center justify-center gap-2 ${activeTab === tab ? "bg-black text-[#39FF14] border-b-2 border-[#39FF14]" : "text-zinc-500 hover:bg-zinc-50"}`}>
            {tab === "catalogue" && <Package size={18} />}
            {tab === "commandes" && <MessageSquare size={18} />}
            {tab === "devis" && <FileText size={18} />}
            {tab === "catalogue" ? "Catalogue" : tab === "commandes" ? "Commandes WA" : "Devis PDF"}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === "catalogue" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase">Produits</h2>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-zinc-200">
                  <Upload size={16} /> Import Excel
                  <input type="file" accept=".csv,.xlsx,.xls,.tsv,.txt" onChange={handleExcelImport} className="hidden" />
                </label>
                <button onClick={() => { setEditingProduct(null); setFormProduct({ nom: "", description: "", quantite: 0, photo_url: "", gallery_urls: [], video_url: "" }); setShowProductModal(true); }} className="flex items-center gap-2 bg-black text-[#39FF14] px-4 py-2 rounded-xl text-xs font-black uppercase hover:scale-105">
                  <Plus size={16} /> Ajouter
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-zinc-200 p-5 flex items-center gap-5">
                  {p.photo_url ? <img src={p.photo_url} alt={p.nom} className="w-20 h-20 rounded-xl object-cover" /> : <div className="w-20 h-20 bg-zinc-100 rounded-xl flex items-center justify-center"><Package className="text-zinc-400" size={32} /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg uppercase truncate">{p.nom}</p>
                    <p className="text-xs text-zinc-500 truncate">{p.description}</p>
                    <p className="text-xs font-bold mt-1">Qté : {p.quantite}</p>
                    {p.video_url && <a href={p.video_url} target="_blank" rel="noreferrer" className="text-[10px] text-[#39FF14] font-bold">Vidéo</a>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingProduct(p); setFormProduct({ ...p }); setShowProductModal(true); }} className="p-2 bg-zinc-100 rounded-lg hover:bg-black hover:text-[#39FF14]"><Edit2 size={16} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p className="text-center text-zinc-400 font-bold py-12">Aucun produit. Ajoutez-en ou importez depuis Excel.</p>}
            </div>
          </div>
        )}

        {activeTab === "commandes" && (
          <div>
            <h2 className="text-2xl font-black uppercase mb-6">Commandes WhatsApp</h2>
            {orders.length === 0 ? (
              <p className="text-center text-zinc-400 font-bold py-12">Aucune commande pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((o, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5 flex justify-between items-center">
                    <div>
                      <p className="font-black">{o.client || "Client"}</p>
                      <p className="text-xs text-zinc-500">{o.message || o.details}</p>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#39FF14]/20 text-black">{o.status || "En attente"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "devis" && (
          <div>
            <h2 className="text-2xl font-black uppercase mb-6">Générer un Devis PDF</h2>
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 max-w-md">
              <div>
                <label className="text-xs font-black uppercase text-zinc-500">Nom de la boutique</label>
                <input type="text" value={shopConfig.name} onChange={(e) => setShopConfig({ ...shopConfig, name: e.target.value })} className="w-full p-3 mt-1 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-zinc-500">Adresse</label>
                <input type="text" value={shopConfig.address} onChange={(e) => setShopConfig({ ...shopConfig, address: e.target.value })} className="w-full p-3 mt-1 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" placeholder="Adresse complète" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-zinc-500">Date</label>
                <input type="text" value={shopConfig.date} onChange={(e) => setShopConfig({ ...shopConfig, date: e.target.value })} className="w-full p-3 mt-1 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" placeholder={new Date().toLocaleDateString("fr-FR")} />
              </div>
              <button onClick={generateDevisPDF} className="w-full flex items-center justify-center gap-2 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase text-sm hover:scale-[1.02]">
                <Download size={18} /> Générer le Devis PDF
              </button>
            </div>
          </div>
        )}
      </main>

      {showProductModal && (
        <div id="modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={(e) => (e.target as HTMLElement).id === "modal-overlay" && setShowProductModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase">{editingProduct ? "Modifier" : "Nouveau produit"}</h3>
              <button onClick={() => setShowProductModal(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Nom produit" value={formProduct.nom} onChange={(e) => setFormProduct({ ...formProduct, nom: e.target.value })} className="w-full p-4 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
              <input placeholder="Description" value={formProduct.description} onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })} className="w-full p-4 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
              <input type="number" placeholder="Quantité" value={formProduct.quantite || ""} onChange={(e) => setFormProduct({ ...formProduct, quantite: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
              <input placeholder="Photo (URL)" value={formProduct.photo_url} onChange={(e) => setFormProduct({ ...formProduct, photo_url: e.target.value })} className="w-full p-4 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
              <input placeholder="Galerie (URLs séparées par des virgules)" value={(formProduct.gallery_urls || []).join(", ")} onChange={(e) => setFormProduct({ ...formProduct, gallery_urls: e.target.value.split(",").map((u) => u.trim()).filter(Boolean) })} className="w-full p-4 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
              <input placeholder="Vidéo (YouTube, etc.)" value={formProduct.video_url} onChange={(e) => setFormProduct({ ...formProduct, video_url: e.target.value })} className="w-full p-4 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
            </div>
            <button onClick={saveProduct} className="w-full mt-6 bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase">Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}
