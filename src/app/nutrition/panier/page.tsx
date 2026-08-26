"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, DELIVERY_ZONES, QUARTIERS } from "@/store/useCartStore";
import { supabase } from "@/lib/supabaseClient";
import { ChevronLeft, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingCart, ShoppingBag, Box, X } from "lucide-react";

export default function CartPage() {
    const router = useRouter();
    const {
        shopCart, updateQuantity, removeFromCart, clearCart,
        deliveryZone, setDeliveryZone, deliveryAddress, setDeliveryAddress,
        deliveryCost, setDeliveryCost,
        shopPromoCode, setShopPromoCode, isShopPromoApplied, applyPromo, removePromo, appliedPromoData,
        savedShopProducts, globalShopProducts, addToCart
    } = useCartStore();

    const [showZoneSuggestions, setShowZoneSuggestions] = useState(false);
    const [shopPromoCodesDB, setShopPromoCodesDB] = useState<any[]>([]);

    useEffect(() => {
        // Fetch promo codes on load
        supabase.from('nutrition_promo_codes').select('*').then(({ data }) => {
            if (data) setShopPromoCodesDB(data);
        });
    }, []);

    const subTotal = shopCart.reduce((acc, item) => acc + ((item.finalPrice || item.prix_premium || item.prix_standard || 0) * (item.quantity || 1)), 0);
    const discountPct = isShopPromoApplied && appliedPromoData ? appliedPromoData.discount_pct : 0;
    const discountAmount = Math.round(subTotal * (discountPct / 100));
    const total = Math.round(subTotal * (1 - (discountPct / 100))) + deliveryCost;

    const handleCheckout = async () => {
        if (shopCart.length === 0) return alert("Votre panier est vide.");
        if (!deliveryAddress.trim() || !deliveryZone.trim()) {
            return alert("Veuillez renseigner votre zone et adresse de livraison complète.");
        }

        const cartText = shopCart.map(item => `- ${item.quantity}x ${item.nom} (${((item.finalPrice || item.prix_premium || item.prix_standard || 0) * item.quantity).toLocaleString()} F)`).join('\n');

        const { data: { user } } = await supabase.auth.getUser();

        let clientProfile = null;
        if (user) {
            const { data } = await supabase.from('clients').select('*').eq('id', user.id).single();
            clientProfile = data;
        }

        if (clientProfile) {
            const tenantIdToUse = shopCart[0]?.tenant_id || clientProfile.tenant_id || '';

            const { data, error } = await supabase.from('nutrition_orders').insert({
                client_id: clientProfile.id,
                tenant_id: tenantIdToUse || null,
                client_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Inconnu',
                phone: clientProfile.phone || '',
                items: shopCart.map(p => ({ id: p.id, nom: p.nom, quantity: p.quantity, finalPrice: p.finalPrice })),
                total: total,
                status: 'NOUVEAU',
                promo_code: isShopPromoApplied && appliedPromoData ? appliedPromoData.code : null,
                discount_amount: discountAmount,
                address: deliveryAddress
            }).select();

            if (error) {
                console.error("Erreur commande:", error);
                alert("Oups, impossible de sauvegarder la commande dans l'historique. Erreur : " + error.message);
                // Non-blocking in old logic (only alerted)
            } else if (data && data.length > 0) {
                await supabase.from('clients').update({ address: deliveryAddress }).eq('id', clientProfile.id);
            }
        }

        let msg = `Bonjour ! Je souhaite commander les produits suivants sur la boutique Onyx Nutrition :\n\n${cartText}\n\n*Total : ${total} F*\n`;
        if (isShopPromoApplied && appliedPromoData) {
            msg += `\n *Promo VIP ${appliedPromoData.code} (-${appliedPromoData.discount_pct}%) appliquée !*\n`;
        }
        msg += `\nMon nom : ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Inconnu'}\nTéléphone : ${clientProfile?.phone || ''}\n\n*Adresse de livraison :* ${deliveryZone} - ${deliveryAddress}\n*Frais de livraison :* ${deliveryCost} F`;

        window.open(`https://wa.me/221785338417?text=${encodeURIComponent(msg)}`, "_blank");
        clearCart();
        setShopPromoCode("");
        router.push("/nutrition");
    };

    // Cross-sell logic
    const crossSellItems = savedShopProducts.length > 0
        ? savedShopProducts
        : globalShopProducts.slice(0, 4);

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            {/* Minimalist Header for checkout */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-black font-bold text-xs uppercase tracking-widest transition-colors">
                        <ChevronLeft size={16}/> Continuer mes achats
                    </button>
                    <h1 className="font-black text-xl tracking-tighter uppercase">Mon <span className="text-[#39FF14]">Panier</span></h1>
                    <div className="w-24"></div> {/* Spacer for centering */}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {shopCart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-400">
                            <ShoppingBag size={48} />
                        </div>
                        <h2 className="text-2xl font-black uppercase text-black mb-2">Votre panier est vide</h2>
                        <p className="text-zinc-500 font-bold mb-8">Découvrez nos produits nutritionnels pour atteindre vos objectifs.</p>
                        <button onClick={() => router.push('/nutrition')} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg hover:scale-105 transition-transform">
                            Aller à la boutique
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* COLONNE DE GAUCHE : PRODUITS */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
                                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                    <h2 className="text-lg font-black uppercase tracking-widest text-black">Panier ({shopCart.length})</h2>
                                    <button onClick={() => { if(confirm("Voulez-vous vraiment vider votre panier ?")) clearCart(); }} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors uppercase tracking-widest">
                                        <Trash2 size={14}/> Vider
                                    </button>
                                </div>
                                <div className="p-6 flex flex-col gap-6">
                                    {shopCart.map((item, idx) => (
                                        <div key={`${item.id}-${idx}`} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center py-4 border-b border-zinc-100 last:border-0">
                                            <div className="w-24 h-24 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.nom} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400"><Box size={32}/></div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-sm uppercase text-black mb-1 line-clamp-2">{item.nom}</h3>
                                                <p className="text-xs text-zinc-500 font-bold mb-3">{item.categorie_nom || "Produit"}</p>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center bg-zinc-100 rounded-lg p-1 border border-zinc-200">
                                                        <button onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))} className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-white hover:text-black rounded-md transition-colors"><Minus size={14}/></button>
                                                        <span className="font-black text-sm w-8 text-center text-black">{item.quantity || 1}</span>
                                                        <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-white hover:text-black rounded-md transition-colors"><Plus size={14}/></button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-right sm:ml-auto">
                                                <p className="font-black text-lg text-[#39FF14]">{((item.finalPrice || item.prix_premium || item.prix_standard || 0) * (item.quantity || 1)).toLocaleString()} F</p>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">{(item.finalPrice || item.prix_premium || item.prix_standard || 0).toLocaleString()} F / unité</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* COLONNE DE DROITE : RÉSUMÉ (STICKY) */}
                        <div className="lg:col-span-4">
                            <div className="bg-zinc-50 rounded-2xl shadow-sm border border-zinc-200 p-6 sticky top-24">
                                <h3 className="text-lg font-black uppercase tracking-widest text-black mb-6">Résumé</h3>

                                {/* Formulaire de Livraison */}
                                <div className="space-y-4 mb-6 pb-6 border-b border-zinc-200">
                                    <div className="relative z-50">
                                        <label className="text-xs font-bold uppercase text-zinc-600 mb-1 block">Quartier (Dakar)</label>
                                        <input type="text" placeholder="Ex: Mermoz, Almadies..." value={deliveryZone} onChange={e => {
                                            setDeliveryZone(e.target.value);
                                            setShowZoneSuggestions(e.target.value.length >= 2);
                                            if(!QUARTIERS.includes(e.target.value)) setDeliveryCost(0);
                                        }} className="w-full p-4 rounded-xl border border-zinc-200 bg-white font-bold text-sm outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 transition-all" />

                                        {showZoneSuggestions && deliveryZone.length >= 2 && (
                                            <div className="absolute z-50 w-full bg-white border border-zinc-200 shadow-xl rounded-xl max-h-48 overflow-y-auto mt-2">
                                                {QUARTIERS.filter(q => q.toLowerCase().includes(deliveryZone.toLowerCase())).map(q => (
                                                    <div key={q} onClick={() => { setDeliveryZone(q); setDeliveryCost(DELIVERY_ZONES[q]); setShowZoneSuggestions(false); }} className="p-4 cursor-pointer hover:bg-zinc-50 border-b border-zinc-100 last:border-0 flex justify-between items-center group">
                                                        <span className="font-bold text-sm text-black group-hover:text-[#39FF14] transition-colors">{q}</span>
                                                        <span className="font-black text-[#39FF14] text-xs bg-[#39FF14]/10 px-2 py-1 rounded-md">+{DELIVERY_ZONES[q]} F</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-zinc-600 mb-1 block">Adresse exacte</label>
                                        <input type="text" placeholder="N° de rue, Immeuble, Appartement..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full p-4 rounded-xl border border-zinc-200 bg-white font-bold text-sm outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 transition-all" />
                                    </div>
                                </div>

                                {/* Code Promo */}
                                <div className="mb-6 pb-6 border-b border-zinc-200">
                                    <label className="text-xs font-bold uppercase text-zinc-600 mb-1 block">Code promo</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Entrez votre code" value={shopPromoCode} onChange={e => setShopPromoCode(e.target.value.toUpperCase())} className="flex-1 p-3 rounded-xl border border-zinc-200 bg-white font-bold text-sm outline-none focus:border-black" />
                                        <button onClick={() => {
                                            const promo = shopPromoCodesDB.find(p => p.code === shopPromoCode && p.active);
                                            if (!promo) return alert("Code invalide ou expiré.");

                                            // Fetch clientProfile to check xp
                                            supabase.auth.getUser().then(({ data: { user } }) => {
                                                if (user) {
                                                    supabase.from('clients').select('xp').eq('id', user.id).single().then(({ data }) => {
                                                        if (data && (data.xp || 0) < promo.min_xp) {
                                                            alert(`Il vous faut ${promo.min_xp} XP pour utiliser ce code.`);
                                                        } else {
                                                            applyPromo(promo.code, promo);
                                                        }
                                                    });
                                                } else {
                                                    alert("Veuillez vous connecter pour utiliser un code promo.");
                                                }
                                            });
                                        }} className="bg-zinc-900 text-white px-4 rounded-xl font-black uppercase text-xs hover:bg-[#39FF14] hover:text-black transition-colors">
                                            Valider
                                        </button>
                                    </div>
                                    {isShopPromoApplied && appliedPromoData && (
                                        <div className="mt-3 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-lg p-3 flex justify-between items-center">
                                            <span className="font-bold text-xs text-[#39FF14]">Code {appliedPromoData.code} appliqué !</span>
                                            <button onClick={removePromo} className="text-zinc-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                    )}
                                </div>

                                {/* Totaux */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500 font-bold">Sous-total</span>
                                        <span className="font-black text-black">{subTotal.toLocaleString()} F</span>
                                    </div>
                                    {isShopPromoApplied && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[#39FF14] font-bold">Réduction ({appliedPromoData?.discount_pct}%)</span>
                                            <span className="font-black text-[#39FF14]">- {discountAmount.toLocaleString()} F</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500 font-bold">Frais de livraison</span>
                                        <span className="font-black text-black">{deliveryCost > 0 ? `+ ${deliveryCost.toLocaleString()} F` : 'À calculer'}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-zinc-200 pt-6 mb-6">
                                    <span className="text-sm font-black uppercase tracking-widest text-black">Total TTC</span>
                                    <span className="text-3xl font-black text-[#39FF14]">{total.toLocaleString()} F</span>
                                </div>

                                <button onClick={handleCheckout} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-xl shadow-[#39FF14]/20">
                                    COMMANDER ({total.toLocaleString()} F) <ArrowRight size={16}/>
                                </button>

                                {/* Trust Badges */}
                                <div className="mt-6 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                        <ShieldCheck size={14} className="text-[#39FF14]"/> Paiement 100% Sécurisé
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-white border border-zinc-200 rounded px-2 py-1 text-[8px] font-black uppercase text-blue-900">Visa</div>
                                        <div className="bg-white border border-zinc-200 rounded px-2 py-1 text-[8px] font-black uppercase text-orange-600">MasterCard</div>
                                        <div className="bg-white border border-zinc-200 rounded px-2 py-1 text-[8px] font-black uppercase text-green-600">Wave / Orange</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* SECTION CROSS-SELLING */}
            {crossSellItems.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 py-12 border-t border-zinc-200 mt-8">
                    <h2 className="text-xl font-black uppercase text-black tracking-tighter mb-8 flex items-center gap-2">
                        {savedShopProducts.length > 0 ? "Vos coups de cœur" : "Produits recommandés"}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {crossSellItems.map((p) => (
                            <div key={p.id} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-xl overflow-hidden mb-4 bg-zinc-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                    {p.image_url ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover"/> : <Box size={32} className="text-zinc-300"/>}
                                </div>
                                <h3 className="font-bold text-sm text-black mb-1 line-clamp-1">{p.nom}</h3>
                                <p className="text-[#39FF14] font-black text-sm mb-4">{(p.prix_standard || 0).toLocaleString()} F</p>
                                <button onClick={() => { addToCart({ ...p, finalPrice: p.prix_standard }); alert('Ajouté au panier !'); }} className="w-full bg-zinc-100 hover:bg-[#39FF14] hover:text-black text-zinc-900 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2">
                                    <ShoppingCart size={14}/> Ajouter
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
