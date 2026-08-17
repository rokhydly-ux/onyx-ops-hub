"use client";
import * as React from "react";
import { useState, useMemo } from 'react';
import { X, Sparkles, MessageSquare, Mail, Users, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Space_Grotesk } from "next/font/google";
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"], variable: "--font-space" });

export default function AIAudienceModal({ clients, orders, onClose }: { clients: any[], orders: any[], onClose: () => void }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [resultsReady, setResultsReady] = useState(false);

    const segments = useMemo(() => {
        if (!resultsReady) return { vips: [], dormants: [], nouveaux: [] };

        const clientStats = new Map();

        // Aggréger les stats par client
        orders.forEach(o => {
            const phone = o.client_phone || o.phone || "inconnu";
            if (!clientStats.has(phone)) {
                clientStats.set(phone, {
                    name: o.client_name || "Client",
                    phone: phone,
                    email: o.client_email || "",
                    orderCount: 0,
                    totalSpent: 0,
                    lastOrderDate: new Date(0),
                    firstOrderDate: new Date()
                });
            }
            const stats = clientStats.get(phone);
            stats.orderCount += 1;
            stats.totalSpent += (o.total || 0);
            const oDate = new Date(o.created_at);
            if (oDate > stats.lastOrderDate) stats.lastOrderDate = oDate;
            if (oDate < stats.firstOrderDate) stats.firstOrderDate = oDate;
        });

        const vips: any[] = [];
        const dormants: any[] = [];
        const nouveaux: any[] = [];

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        Array.from(clientStats.values()).forEach(stats => {
            // Segment VIP : Plus de 2 commandes ou plus de 50 000 FCFA
            if (stats.orderCount >= 3 || stats.totalSpent >= 50000) {
                vips.push(stats);
            }
            // Segment Dormants : Dernière commande il y a +60 jours, mais a déjà commandé
            else if (stats.lastOrderDate < sixtyDaysAgo) {
                dormants.push(stats);
            }
            // Segment Nouveaux : 1 seule commande récente (moins de 30 jours)
            else if (stats.orderCount === 1 && stats.lastOrderDate > thirtyDaysAgo) {
                nouveaux.push(stats);
            }
        });

        return {
            vips: vips.sort((a,b) => b.totalSpent - a.totalSpent),
            dormants: dormants.sort((a,b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime()),
            nouveaux: nouveaux.sort((a,b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime())
        };

    }, [orders, resultsReady]);

    const startAnalysis = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setResultsReady(true);
        }, 1500);
    };

    const getMessageTemplate = (type: string, clientName: string) => {
        if (type === 'vip') return `Coucou ${clientName} 🌟, tu fais partie de nos meilleurs clients OnyxHub ! Pour te remercier, voici un code promo exclusif de -15% sur ta prochaine commande avec le code VIP15. À très vite !`;
        if (type === 'dormant') return `Hello ${clientName} 👋, ça fait un moment qu'on ne t'a pas vu(e) ! On a plein de nouveautés qui pourraient t'intéresser. Reviens jeter un œil, on a une surprise pour toi !`;
        if (type === 'nouveau') return `Bienvenue dans la famille Onyx ${clientName} 🎉 ! On espère que ta première commande t'a plu. N'hésite pas à partager ton avis ou à nous dire si tu as besoin de conseils.`;
        return "";
    };

    const handleContactWA = (phone: string, msg: string) => {
        const cleanPhone = phone.replace('+', '');
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div id="ai-modal-overlay" onClick={(e: any) => e.target.id === 'ai-modal-overlay' && onClose()} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-4xl w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-purple-500 my-auto text-black max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3`}><Sparkles className="text-purple-500"/> CRM & IA Marketing</h2>
                <p className="text-zinc-500 font-bold text-xs mb-8">Analysez automatiquement votre historique de commandes pour cibler vos clients.</p>

                {!resultsReady && !isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                            <BotIcon className="text-purple-500 w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-black uppercase mb-2">Prêt à segmenter votre base ?</h3>
                        <p className="text-sm text-zinc-500 mb-8 max-w-md">Notre IA va scanner {orders.length} commandes pour identifier vos clients VIP, réveiller vos clients dormants et fidéliser les nouveaux.</p>
                        <button onClick={startAnalysis} className="bg-black text-[#39FF14] hover:scale-105 transition-all shadow-xl px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3">
                            <Sparkles size={18}/> Lancer l'Analyse IA
                        </button>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-pulse">
                        <Sparkles className="text-purple-500 w-16 h-16 animate-spin mb-4" />
                        <h3 className="text-lg font-black uppercase text-purple-600">Analyse en cours...</h3>
                        <p className="text-xs font-bold text-zinc-400 mt-2">Croisement des données d'achat et des dates...</p>
                    </div>
                )}

                {resultsReady && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {/* Segment VIP */}
                        <div className="border border-zinc-200 rounded-3xl p-6 bg-zinc-50/50">
                            <h3 className="text-sm font-black uppercase tracking-tighter text-black flex items-center gap-2 mb-4"><ShieldCheck className="text-yellow-500"/> Clients VIP ({segments.vips.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {segments.vips.map((c: any, i: number) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
                                        <div className="mb-4">
                                            <p className="font-bold text-sm truncate">{c.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">{c.orderCount} commandes • {c.totalSpent.toLocaleString()} F</p>
                                        </div>
                                        <button onClick={() => handleContactWA(c.phone, getMessageTemplate('vip', c.name))} className="w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors p-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                            <MessageSquare size={14}/> Relance VIP
                                        </button>
                                    </div>
                                ))}
                                {segments.vips.length === 0 && <p className="text-xs text-zinc-500 font-medium col-span-2">Aucun client VIP détecté.</p>}
                            </div>
                        </div>

                        {/* Segment Dormants */}
                        <div className="border border-zinc-200 rounded-3xl p-6 bg-zinc-50/50">
                            <h3 className="text-sm font-black uppercase tracking-tighter text-black flex items-center gap-2 mb-4"><AlertTriangle className="text-orange-500"/> Clients Dormants &gt; 60j ({segments.dormants.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {segments.dormants.map((c: any, i: number) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
                                        <div className="mb-4">
                                            <p className="font-bold text-sm truncate">{c.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Vu le {c.lastOrderDate.toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => handleContactWA(c.phone, getMessageTemplate('dormant', c.name))} className="w-full bg-black text-[#39FF14] hover:bg-zinc-800 transition-colors p-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                            <MessageSquare size={14}/> Code Promo
                                        </button>
                                    </div>
                                ))}
                                {segments.dormants.length === 0 && <p className="text-xs text-zinc-500 font-medium col-span-2">Aucun client dormant détecté.</p>}
                            </div>
                        </div>

                        {/* Segment Nouveaux */}
                        <div className="border border-zinc-200 rounded-3xl p-6 bg-zinc-50/50">
                            <h3 className="text-sm font-black uppercase tracking-tighter text-black flex items-center gap-2 mb-4"><TrendingUp className="text-blue-500"/> Nouveaux Clients ({segments.nouveaux.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {segments.nouveaux.map((c: any, i: number) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
                                        <div className="mb-4">
                                            <p className="font-bold text-sm truncate">{c.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">1er Achat le {c.firstOrderDate.toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => handleContactWA(c.phone, getMessageTemplate('nouveau', c.name))} className="w-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors p-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                            <MessageSquare size={14}/> Suivi 1er Achat
                                        </button>
                                    </div>
                                ))}
                                {segments.nouveaux.length === 0 && <p className="text-xs text-zinc-500 font-medium col-span-2">Aucun nouveau client récent.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple fallback Bot icon
function BotIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    )
}
