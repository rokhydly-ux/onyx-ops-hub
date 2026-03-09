"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Hash, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedVariant?: {
    size?: string;
    color?: string;
  };
}

interface Order {
  id: number;
  date: string;
  items: OrderItem[];
  total: number;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedOrders = localStorage.getItem('onyx_jaay_orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Erreur chargement commandes", e);
      }
    }
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement de l'historique...</div>;

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black mb-4 transition-colors text-sm font-bold uppercase tracking-wider">
                <ArrowLeft size={16} /> Retour au Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-zinc-900">Historique des Commandes</h1>
            <p className="text-zinc-500 font-medium mt-2">Retrouvez toutes les commandes passées depuis votre boutique.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-200">
          {orders.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">Aucune commande enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-zinc-200">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-800"><Hash size={16} className="text-zinc-400"/> Commande #{order.id}</div>
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500"><Calendar size={14}/> {formatDate(order.date)}</div>
                    <div className="flex items-center gap-2 text-lg font-black text-zinc-900"><DollarSign size={18} className="text-green-500"/> {order.total.toLocaleString()} F</div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <p className="text-zinc-700">{item.name} <span className="font-bold">x{item.quantity}</span></p>
                        <p className="text-zinc-500">{(item.price * item.quantity).toLocaleString()} F</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}