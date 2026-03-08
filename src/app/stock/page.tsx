"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Package, Plus, Minus, AlertTriangle } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Product = {
  id: string;
  client_id: string;
  name: string;
  stock: number;
  category: string;
};

export default function OnyxStockPage() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

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
        .select("id, client_id, name, stock, category")
        .eq("client_id", clientId)
        .order("name", { ascending: true });
      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (err) {
      console.error("Erreur chargement inventaire :", err);
      setProducts([]);
    }
  };

  const recordMovement = async (
    productId: string,
    clientId: string,
    type: "ENTREE" | "SORTIE",
    quantity: number
  ) => {
    try {
      await supabase.from("stock_movements").insert({
        product_id: productId,
        client_id: clientId,
        type,
        quantity,
      });
    } catch {
      // on ignore l'erreur — l'inventaire principal reste cohérent
    }
  };

  const updateStock = async (product: Product, delta: number) => {
    if (!client?.id) return;
    const newStock = Math.max(0, (product.stock || 0) + delta);
    try {
      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", product.id)
        .eq("client_id", client.id);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, stock: newStock } : p
        )
      );
      await recordMovement(
        product.id,
        client.id,
        delta > 0 ? "ENTREE" : "SORTIE",
        Math.abs(delta)
      );
    } catch (err) {
      alert("Erreur lors de la mise à jour du stock.");
    }
  };

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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#39FF14] rounded-xl flex items-center justify-center text-black">
            <Package size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">
              Onyx Stock
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em]">
              Inventaire en temps réel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold">
            {client?.full_name || "Ma Boutique"}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl text-xs text-amber-800 font-bold uppercase">
          <AlertTriangle size={16} className="text-amber-500" />
          <span>
            Les lignes en rouge indiquent un stock critique (&lt; 5 unités).
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-zinc-400 tracking-[0.25em]">
                  Produit
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-zinc-400 tracking-[0.25em]">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-zinc-400 tracking-[0.25em]">
                  Stock actuel
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-zinc-400 tracking-[0.25em] text-right">
                  Ajuster
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((p) => {
                const isLow = (p.stock || 0) < 5;
                return (
                  <tr
                    key={p.id}
                    className={isLow ? "bg-red-50/40" : "hover:bg-zinc-50"}
                  >
                    <td className="px-6 py-4 text-sm font-black uppercase text-zinc-800">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">
                      {p.category || "Général"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black ${
                          p.stock <= 0
                            ? "bg-red-100 text-red-700"
                            : isLow
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {p.stock || 0} u.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 bg-zinc-100 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateStock(p, -1)}
                          className="w-8 h-8 rounded-full bg-white text-zinc-700 flex items-center justify-center hover:bg-red-500 hover:text-white text-xs font-black"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-[11px] font-black uppercase text-zinc-500 px-1">
                          +- 1
                        </span>
                        <button
                          onClick={() => updateStock(p, +1)}
                          className="w-8 h-8 rounded-full bg-white text-zinc-700 flex items-center justify-center hover:bg-emerald-500 hover:text-white text-xs font-black"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-zinc-400 text-xs font-black uppercase tracking-[0.3em]"
                  >
                    Aucun produit trouvé. Configurez d&apos;abord votre
                    catalogue dans Onyx Vente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
