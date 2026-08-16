"use client";
import React, { useState } from 'react';
import { Activity, X, ChevronDown, ChevronUp, Download, User, Phone, MapPin, Package } from 'lucide-react';
import { Space_Grotesk } from "next/font/google";
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"], variable: "--font-space" });

export default function OrdersMonthModal({ orders, setShowOrdersWidgetModal }: { orders: any[], setShowOrdersWidgetModal: any }) {
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    async function downloadReceiptPDF(order: any, e: any) {
        e.stopPropagation();
        const { jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF();

        // En-tête
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("ONYX HUB", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Reçu de commande", 105, 28, { align: "center" });

        // Infos commande
        doc.setFontSize(11);
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')} ${new Date(order.created_at).toLocaleTimeString('fr-FR')}`, 20, 45);
        doc.text(`Commande N°: ${order.id.slice(0, 8)}`, 20, 52);

        // Infos client
        doc.setFont("helvetica", "bold");
        doc.text("Client:", 20, 65);
        doc.setFont("helvetica", "normal");
        doc.text(order.client_name || "N/A", 40, 65);
        doc.text(order.client_phone || "N/A", 40, 72);

        const addr = order.delivery_address || order.address || "Adresse non renseignée";
        const addrLines = doc.splitTextToSize(addr, 100);
        doc.text("Adresse:", 20, 79);
        doc.text(addrLines, 40, 79);

        let items = [];
        if (order.items) {
            if (typeof order.items === 'string') {
                try { items = JSON.parse(order.items); } catch(e) {}
            } else {
                items = order.items;
            }
        }

        const tableData = items.map((item: any) => [
            item.name || item.produit_id || 'Produit',
            item.quantity || item.qty || 1,
            `${item.price || item.prix || 0} F`,
            `${(item.quantity || item.qty || 1) * (item.price || item.prix || 0)} F`
        ]);

        let startY = 85 + (addrLines.length * 5);

        autoTable(doc, {
            startY: startY,
            head: [['Produit', 'Qté', 'Prix U.', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [57, 255, 20], textColor: [0, 0, 0] },
            styles: { font: "helvetica" }
        });

        const finalY = (doc as any).lastAutoTable.finalY || startY + 20;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL: ${order.total?.toLocaleString() || 0} F`, 190, finalY + 15, { align: "right" });

        // Pied de page
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Merci de votre confiance !", 105, 280, { align: "center" });

        doc.save(`Recu_Commande_${order.id.slice(0, 8)}.pdf`);
    }

    const currentMonthOrders = React.useMemo(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders.filter(o => new Date(o.created_at) >= firstDay);
    }, [orders]);

    return (
        <div id="ca-modal-overlay" onClick={(e: any) => e.target.id === 'ca-modal-overlay' && setShowOrdersWidgetModal(null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-3xl w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto text-black max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={() => setShowOrdersWidgetModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3`}><Activity className="text-[#39FF14]"/> Commandes du Mois</h2>
                <p className="text-zinc-500 font-bold text-xs mb-6">Liste détaillée des commandes de ce mois-ci.</p>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Client</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4 text-right">Montant</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                        {[...currentMonthOrders].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(o => (
                            <React.Fragment key={o.id}>
                                <tr onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)} className="hover:bg-zinc-50 transition-colors cursor-pointer">
                                    <td className="p-4 text-xs font-bold text-zinc-500 flex items-center gap-2">
                                        {expandedOrderId === o.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                        {new Date(o.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="p-4 font-bold text-sm text-black">{o.client_name}</td>
                                    <td className="p-4"><span className="px-2 py-1 rounded bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase">{o.status}</span></td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="font-black text-[#39FF14]">{o.total?.toLocaleString()} F</span>
                                            <button onClick={(e) => downloadReceiptPDF(o, e)} className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-black hover:text-[#39FF14] transition-colors" title="Télécharger le reçu">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedOrderId === o.id && (
                                    <tr className="bg-zinc-50/50">
                                        <td colSpan={4} className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-widest flex items-center gap-1"><User size={12}/> Client</h4>
                                                    <p className="text-sm font-bold text-black mb-1">{o.client_name}</p>
                                                    <p className="text-xs text-zinc-600 mb-1 flex items-center gap-1"><Phone size={12}/> {o.client_phone || 'Non renseigné'}</p>
                                                    <p className="text-xs text-zinc-600 flex items-center gap-1"><MapPin size={12}/> {o.delivery_address || o.address || 'Non renseignée'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-widest flex items-center gap-1"><Package size={12}/> Produits</h4>
                                                    <ul className="space-y-1">
                                                        {(() => {
                                                            let items = [];
                                                            if (o.items) {
                                                                if (typeof o.items === 'string') {
                                                                    try { items = JSON.parse(o.items); } catch(e) {}
                                                                } else {
                                                                    items = o.items;
                                                                }
                                                            }
                                                            return items.map((item: any, idx: number) => (
                                                                <li key={idx} className="text-xs text-black flex justify-between border-b border-zinc-200/50 pb-1 last:border-0">
                                                                    <span><span className="font-bold">{item.quantity || item.qty || 1}x</span> {item.name || item.produit_id || 'Produit'}</span>
                                                                    <span className="font-bold">{((item.quantity || item.qty || 1) * (item.price || item.prix || 0)).toLocaleString()} F</span>
                                                                </li>
                                                            ));
                                                        })()}
                                                    </ul>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
