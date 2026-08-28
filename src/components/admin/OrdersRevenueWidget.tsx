"use client";
import React, { useState } from 'react';
import { Activity, ChevronRight, ChevronDown, TrendingUp, Minus } from 'lucide-react';

export default function OrdersRevenueWidget({ orders, setShowOrdersWidgetModal }: { orders: any[], setShowOrdersWidgetModal: any }) {
    const [caFilterMode, setCaFilterMode] = useState<'current_month' | 'last_month' | 'custom'>('current_month');
    const [caCustomStartDate, setCaCustomStartDate] = useState('');
    const [caCustomEndDate, setCaCustomEndDate] = useState('');
    const [showCaFilterDropdown, setShowCaFilterDropdown] = useState(false);

    const caStats = React.useMemo(() => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;
        let prevStartDate: Date | null = null;
        let prevEndDate: Date | null = null;

        if (caFilterMode === 'current_month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else if (caFilterMode === 'last_month') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
        } else {
            startDate = caCustomStartDate ? new Date(caCustomStartDate) : new Date(0);
            endDate = caCustomEndDate ? new Date(caCustomEndDate) : now;
            if (caCustomEndDate) { endDate.setHours(23, 59, 59, 999); }
        }

        const filteredOrders = orders.filter(o => {
            const date = new Date(o.created_at);
            return date >= startDate && date <= endDate;
        });

        const prevOrders = prevStartDate && prevEndDate ? orders.filter(o => {
            const date = new Date(o.created_at);
            return date >= prevStartDate! && date <= prevEndDate!;
        }) : [];

        const revenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const aov = filteredOrders.length > 0 ? Math.round(revenue / filteredOrders.length) : 0;

        const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const prevAov = prevOrders.length > 0 ? Math.round(prevRevenue / prevOrders.length) : 0;

        let revenueTrend: number | null = null;
        let aovTrend: number | null = null;

        if (caFilterMode !== 'custom' && prevStartDate) {
            if (prevRevenue > 0) {
                revenueTrend = ((revenue - prevRevenue) / prevRevenue) * 100;
            }
            if (prevAov > 0) {
                aovTrend = ((aov - prevAov) / prevAov) * 100;
            }
        }

        return {
            filteredOrders,
            revenue,
            aov,
            revenueTrend,
            aovTrend,
            prevRevenue,
            prevAov
        };
    }, [orders, caFilterMode, caCustomStartDate, caCustomEndDate]);

    return (
        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:border-[#39FF14] hover:shadow-xl transition-all relative">
            <div className="flex justify-between items-start mb-4">
                <h3 onClick={() => setShowOrdersWidgetModal('ca')} className="text-sm font-black uppercase tracking-tighter text-black flex items-center gap-2 cursor-pointer group hover:text-[#39FF14] transition-colors">
                    <Activity size={16} className="text-[#39FF14]"/> CA & Panier
                    <div className="bg-zinc-50 group-hover:bg-[#39FF14] group-hover:text-black p-1 rounded-full transition-colors text-zinc-400 ml-1">
                        <ChevronRight size={14}/>
                    </div>
                </h3>

                <div className="relative">
                    <button onClick={(e) => {e.stopPropagation(); setShowCaFilterDropdown(!showCaFilterDropdown);}} className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-zinc-200 transition-colors">
                        {caFilterMode === 'current_month' ? 'Ce mois-ci' : caFilterMode === 'last_month' ? 'Mois précédent' : 'Personnalisé'} <ChevronDown size={12}/>
                    </button>
                    {showCaFilterDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg z-20 overflow-hidden">
                            <div className="p-1 space-y-1">
                                <button onClick={() => {setCaFilterMode('current_month'); setShowCaFilterDropdown(false);}} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${caFilterMode === 'current_month' ? 'bg-[#39FF14]/10 text-black' : 'hover:bg-zinc-50 text-zinc-600'}`}>Ce mois-ci</button>
                                <button onClick={() => {setCaFilterMode('last_month'); setShowCaFilterDropdown(false);}} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${caFilterMode === 'last_month' ? 'bg-[#39FF14]/10 text-black' : 'hover:bg-zinc-50 text-zinc-600'}`}>Mois précédent</button>
                                <button onClick={() => {setCaFilterMode('custom'); setShowCaFilterDropdown(false);}} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${caFilterMode === 'custom' ? 'bg-[#39FF14]/10 text-black' : 'hover:bg-zinc-50 text-zinc-600'}`}>Période personnalisée</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {caFilterMode === 'custom' && (
                <div className="flex gap-2 mb-4">
                    <input type="date" value={caCustomStartDate} onChange={(e) => setCaCustomStartDate(e.target.value)} className="w-1/2 p-2 text-[10px] border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#39FF14]" />
                    <input type="date" value={caCustomEndDate} onChange={(e) => setCaCustomEndDate(e.target.value)} className="w-1/2 p-2 text-[10px] border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#39FF14]" />
                </div>
            )}

            <div className="space-y-4">
                <div onClick={() => setShowOrdersWidgetModal('ca')} className="cursor-pointer">
                    <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Chiffre d'affaires</p>
                        {caStats.revenueTrend !== null && (
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${caStats.revenueTrend > 0 ? 'bg-green-100 text-green-700' : caStats.revenueTrend < 0 ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700'}`}>
                                {caStats.revenueTrend > 0 ? <TrendingUp size={10}/> : caStats.revenueTrend < 0 ? <TrendingUp size={10} className="transform rotate-180"/> : <Minus size={10}/>}
                                {Math.abs(caStats.revenueTrend).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <p className="text-3xl font-black text-black">{caStats.revenue.toLocaleString()} <span className="text-lg text-[#39FF14]">F</span></p>
                </div>
                <div onClick={() => setShowOrdersWidgetModal('ca')} className="pt-4 border-t border-zinc-100 cursor-pointer">
                    <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Panier Moyen</p>
                        {caStats.aovTrend !== null && (
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${caStats.aovTrend > 0 ? 'bg-green-100 text-green-700' : caStats.aovTrend < 0 ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700'}`}>
                                {caStats.aovTrend > 0 ? <TrendingUp size={10}/> : caStats.aovTrend < 0 ? <TrendingUp size={10} className="transform rotate-180"/> : <Minus size={10}/>}
                                {Math.abs(caStats.aovTrend).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <p className="text-xl font-black text-black">{caStats.aov.toLocaleString()} F</p>
                </div>
            </div>
        </div>
    );
}
