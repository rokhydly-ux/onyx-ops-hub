"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Package, Plus, Trash2, Edit2, Upload, Search } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Product = {
  id: string;
  client_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
};

export default function OnyxVentePage() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formProduct, setFormProduct] = useState<
    Partial<Omit<Product, "id" | "client_id">>
  >({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    image_url: "",
  });

  useEffect(() => {
    const init = async () => {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("onyx_client_session")
          : null;
      if (!saved) {
        router.push("/login");
        return;
      }
      const parsed = JSON.parse(saved);
      setClient(parsed);
      await loadProducts(parsed.id);
      setLoading(false);
    };
    init();
  }, [router]);

  const loadProducts = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (err) {
      console.error("Erreur chargement produits :", err);
      setProducts([]);
    }
  };

  const saveProduct = async () => {
    if (!client?.id) return;
    const payload = {
      name: formProduct.name?.trim() || "Produit",
      description: formProduct.description?.trim() || "",
      price: Number(formProduct.price) || 0,
      stock: Number(formProduct.stock) || 0,
      category: formProduct.category?.trim() || "Général",
      image_url: formProduct.image_url || null,
      client_id: client.id,
    };
    try {
      if (editingProduct) {
        await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id)
          .eq("client_id", client.id);
      } else {
        await supabase.from("products").insert(payload);
      }
      await loadProducts(client.id);
      setShowProductModal(false);
      setEditingProduct(null);
      setFormProduct({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        image_url: "",
      });
    } catch (err) {
      alert("Erreur enregistrement produit.");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!client?.id) return;
    if (!confirm("Supprimer ce produit du catalogue ?")) return;
    try {
      await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("client_id", client.id);
      await loadProducts(client.id);
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client?.id) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = (ev.target?.result as string) || "";
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length <= 1) return;

      const rows = lines
        .slice(1)
        .map((line) => {
          const [nom, prix, stock, categorie] = line
            .split(";")
            .map((c) => c.trim());
          return {
            client_id: client.id,
            name: nom,
            description: "",
            price: Number(prix) || 0,
            stock: Number(stock) || 0,
            category: categorie || "Général",
            image_url: null,
          };
        })
        .filter((r) => r.name);

      if (!rows.length) return;
      try {
        await supabase.from("products").insert(rows);
        await loadProducts(client.id);
        alert(`${rows.length} produits importés avec succès.`);
      } catch (err) {
        alert("Erreur lors de l'import CSV.");
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const filteredProducts = products.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      (p.description || "").toLowerCase().includes(s)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="w-12 h-12 border-4 border-black border-t-[#39FF14] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter">
            Onyx Vente
          </h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em]">
            Catalogue & Devis WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold">
            {client?.full_name || "Ma Boutique"}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher un produit ou une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#39FF14]/40"
            />
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-2xl text-[11px] font-black uppercase cursor-pointer hover:border-black">
              <Upload size={16} /> Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormProduct({
                  name: "",
                  description: "",
                  price: 0,
                  stock: 0,
                  category: "",
                  image_url: "",
                });
                setShowProductModal(true);
              }}
              className="flex items-center gap-2 bg-black text-[#39FF14] px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase hover:scale-[1.02] transition"
            >
              <Plus size={16} /> Nouveau
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-zinc-200 p-5 flex flex-col gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                    <Package className="text-zinc-400" size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm uppercase truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {p.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase">
                    Prix
                  </p>
                  <p className="text-lg font-black">
                    {p.price.toLocaleString("fr-FR")} F
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-500 uppercase">
                    Stock
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black ${
                      p.stock <= 0
                        ? "bg-red-100 text-red-600"
                        : p.stock < 5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {p.stock} u.
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(p);
                    setFormProduct({
                      name: p.name,
                      description: p.description,
                      price: p.price,
                      stock: p.stock,
                      category: p.category,
                      image_url: p.image_url || "",
                    });
                    setShowProductModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 text-zinc-800 py-2 rounded-2xl text-[11px] font-black uppercase hover:bg-black hover:text-[#39FF14] transition"
                >
                  <Edit2 size={14} /> Modifier
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="px-3 py-2 rounded-2xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-center text-zinc-400 font-bold py-16">
              Aucun produit pour le moment. Ajoutez-en ou importez un CSV.
            </p>
          )}
        </div>
      </main>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200"
            >
              <Trash2 size={16} className="opacity-0" />
            </button>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
              <Package size={18} />{" "}
              {editingProduct ? "Modifier le produit" : "Nouveau produit"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-black uppercase text-zinc-500">
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={formProduct.name || ""}
                  onChange={(e) =>
                    setFormProduct({ ...formProduct, name: e.target.value })
                  }
                  className="w-full p-3 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-zinc-500">
                  Description
                </label>
                <textarea
                  value={formProduct.description || ""}
                  onChange={(e) =>
                    setFormProduct({
                      ...formProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-zinc-500">
                    Prix (F CFA)
                  </label>
                  <input
                    type="number"
                    value={formProduct.price ?? 0}
                    onChange={(e) =>
                      setFormProduct({
                        ...formProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full p-3 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-zinc-500">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formProduct.stock ?? 0}
                    onChange={(e) =>
                      setFormProduct({
                        ...formProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full p-3 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-zinc-500">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={formProduct.category || ""}
                    onChange={(e) =>
                      setFormProduct({
                        ...formProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-zinc-500">
                    Image (URL)
                  </label>
                  <input
                    type="url"
                    value={formProduct.image_url || ""}
                    onChange={(e) =>
                      setFormProduct({
                        ...formProduct,
                        image_url: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-zinc-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#39FF14]"
                  />
                </div>
              </div>
              <button
                onClick={saveProduct}
                className="w-full bg-black text-[#39FF14] py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 mt-2"
              >
                Enregistrer le produit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
