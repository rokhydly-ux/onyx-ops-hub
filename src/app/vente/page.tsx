"use client";

import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState, useRef, DragEvent, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, Edit, Trash2, Plus, FileUp, Sparkles, X, Heart, Star, QrCode, Download, Box,
  Image as ImageIcon, DollarSign, Tag, Type, Home, LayoutDashboard, GripVertical,
  Settings, Store, ChevronRight, Share2, Menu, ShoppingCart, Minus, Filter, ArrowRight, Sun, Moon, BarChart, AlertTriangle, Ticket, Printer, Truck, Bell, Users, Clock, Lock, Gift, ArrowUp, ArrowDown, Eye, EyeOff, Calendar, PieChart as PieChartIcon, TrendingUp, ArrowDownRight, RefreshCcw, Search, Save, Package, Check, LayoutTemplate, Phone, LogOut, Megaphone, Send, XCircle, CheckCircle, Edit3, Copy, LogIn, Wallet, ExternalLink
, ChevronLeft, GraduationCap } from 'lucide-react';
import QRCode from "react-qr-code";
import * as XLSX from 'xlsx';
import { supabase } from "@/lib/supabaseClient";

// --- TYPES ---
interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  admin_reply?: string;
}

interface VariantOption {
  name: string;
  priceModifier: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  costPrice?: number;
  oldPrice?: number;
  description: string;
  image: string;
  gallery?: string[];
  category: string;
  videoUrl?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  barcode?: string;
  reviewsList?: Review[];
  variants?: {
    sizes?: VariantOption[];
    colors?: VariantOption[];
  };
}

interface CartItem extends Product {
  quantity: number;
  selectedVariant?: {
    size?: string;
    color?: string;
  };
}

interface DeliveryZone {
  id: number;
  name: string;
  price: number;
  quartiers: string[];
}

// --- INITIAL DATA ---
const generateMockProducts = (): Product[] => {
  const categories = ['Homme', 'Femme', 'Enfant', 'Sport', 'Accessoires'];
  const types = ['Chemise', 'Pantalon', 'Robe', 'Chaussures', 'Sac', 'Montre', 'Ensemble', 'T-shirt', 'Veste', 'Costume', 'Casquette', 'Lunettes'];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Gris'];
  
  return Array.from({ length: 40 }).map((_, i) => {
    const cat = categories[i % categories.length];
    const type = types[i % types.length];
    const basePrice = (Math.floor(Math.random() * 20) + 2) * 2500;
    const isPromo = Math.random() > 0.7;
    const price = isPromo ? Math.floor(basePrice * 0.8) : basePrice;

    const productSizes = [sizes[i % sizes.length], sizes[(i + 1) % sizes.length], sizes[(i + 2) % sizes.length]];
    const productColors = [colors[i % colors.length], colors[(i + 1) % colors.length]];

    return {
      id: i + 1,
      name: `${type} Premium ${cat} ${i + 1}`,
      price: price,
      costPrice: Math.floor(price * 0.4),
      oldPrice: isPromo ? basePrice : undefined,
      description: `Un article incontournable de la collection ${cat}. Confort et style garantis pour le quotidien ou les grandes occasions. Matériaux de première qualité.`,
      image: `https://placehold.co/600x800/1a1a1a/39FF14?text=${type}+${cat}`,
      gallery: [
        `https://placehold.co/600x800/222222/39FF14?text=Vue+Dos`,
        `https://placehold.co/600x800/333333/39FF14?text=Détails`
      ],
      category: cat,
      stock: Math.floor(Math.random() * 50) + 2,
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 100) + 5,
      variants: {
        sizes: productSizes.map((s, idx) => ({ name: s, priceModifier: idx === 2 ? 2000 : 0 })), // Example: last size is more expensive
        colors: productColors.map(c => ({ name: c, priceModifier: 0 }))
      },
      videoUrl: i % 4 === 0 ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : "",
      reviewsList: [
        { id: 1, name: "Client Vérifié", rating: 5, comment: "Excellente qualité, je recommande !", date: "2026-03-10" },
        { id: 2, name: "Acheteur Anonyme", rating: 4, comment: "Très bon produit, livraison rapide.", date: "2026-03-12" }
      ]
    };
  });
};

const initialProducts: Product[] = generateMockProducts();

const INITIAL_ZONES: DeliveryZone[] = [
  { id: 1, name: "Zone 1", price: 1300, quartiers: ["Libertés (1-6)", "Scat Urbam", "Sacré Cœur", "Cité Guorgui", "Point E", "Niary Tally", "Sicap", "Grand Dakar", "Dieuppeul", "Castor", "Amitié", "Baobab"] },
  { id: 2, name: "Zone 2", price: 1800, quartiers: ["Yoff", "Ville", "Colobane", "HLM", "Patte d'oie", "Foire", "Sicap Foire", "Mermoz", "Ouakam", "Fann", "Mamelles", "Maristes", "Grand Yoff", "SIPRES", "Zone de captage", "Fass", "Médina", "Corniche", "Front de Terre", "Khar Yallah"] },
  { id: 3, name: "Zone 3", price: 2000, quartiers: ["Almadies", "Ngor", "Parcelles", "Hlm grand Médine", "Yarakh", "Pikine", "Golf", "Hann Marinas", "Bel Air"] },
  { id: 4, name: "Zone 4", price: 2500, quartiers: ["Guédiawaye", "Cambérène", "Beaux Maraîchers", "Thiaroye"] },
  { id: 5, name: "Zone 5", price: 3000, quartiers: ["Yeumbeul", "Sicap Mbao", "Petit Mbao", "Keur Massar"] },
  { id: 6, name: "Zone 6", price: 3500, quartiers: ["Grand Mbao", "Zac Mbao", "Rufisque", "Tivaouane peulh", "Malika"] },
  { id: 7, name: "Zone 7", price: 3500, quartiers: ["Régions"] },
];

const WHATSAPP_NUMBER = "221771234567"; // À remplacer par le vrai numéro

const initialShopInfo = {
  name: 'Onyx Jaay',
  description: 'Version Pro',
  phone: WHATSAPP_NUMBER,
  deliveryFees: 0,
  logoUrl: '',
  currency: 'FCFA',
  deliveryOptions: { delivery: true, pickup: true },
  openingHours: { start: '09:00', end: '18:00', enabled: false },
  slug: '',
  categoryCovers: {} as Record<string, string>,
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  twitterUrl: '',
  youtubeUrl: ''
};

const CONVERSION_RATES: Record<string, { rate: number; symbol: string }> = {
    'FCFA': { rate: 1, symbol: 'FCFA' },
    'EUR': { rate: 1 / 655.957, symbol: '€' },
    'USD': { rate: 1 / 610, symbol: '$' },
};

const displayPrice = (priceInCfa: number | null | undefined, currency: string = 'FCFA') => {
    const config = CONVERSION_RATES[currency] || CONVERSION_RATES['FCFA'];
    const convertedPrice = (priceInCfa || 0) * config.rate;
    
    if (currency === 'FCFA') {
        return `${convertedPrice.toLocaleString('fr-SN')} ${config.symbol}`;
    }
    return `${convertedPrice.toFixed(2)} ${config.symbol}`;
};

const validateSenegalPhone = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, '');
    return /^(?:\+221)?(7[05678]\d{7})$/.test(cleaned);
};

const formatSenegalPhone = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.length === 9) return `+221${cleaned}`;
    return cleaned;
};

const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    if (match && match[1]) {
        videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
};

const PACK_CONTENTS: Record<string, string[]> = {
  "pack tekki": ["vente", "stock", "tiak"],
  "pack tekki (boutique)": ["vente", "stock", "tiak"],
  "onyxtekki (resto)": ["menu", "stock", "tiak"],
  "pack tekki pro": ["vente", "stock", "tiak", "formation", "staff"],
  "onyx crm": ["crm", "booking"],
  "pack onyx crm": ["crm", "booking"],
  "pack onyx gold": ["vente", "stock", "tiak", "formation", "staff", "crm", "booking", "menu", "tontine"],
  "onyx gold": ["vente", "stock", "tiak", "formation", "staff", "crm", "booking", "menu", "tontine"]
};

const checkAccess = (appId: string, userObj: any) => {
  if (!userObj) return false;
  const activeSaas = userObj.active_saas || [];
  const allSaas = [userObj.saas || '', ...activeSaas].map((s: string) => (s || '').toLowerCase());
  
  if (allSaas.some((s: string) => s.includes('gold'))) return true;
  if (allSaas.some((s: string) => s === appId.toLowerCase() || s.includes(appId.toLowerCase()))) return true;
  
  for (const saas of allSaas) {
      for (const [packName, modules] of Object.entries(PACK_CONTENTS)) {
          if (saas.includes(packName) && modules.includes(appId)) return true;
      }
  }
  return false;
};

const WIDGET_TYPE = 'WIDGET';

interface WidgetProps {
  id: string;
  name: string;
  settings?: any;
  type?: string;
}

function DraggableWidget({ id, name }: WidgetProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: { name, type: WIDGET_TYPE }
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-grab">
      {name}
    </div>
  );
}

function SortableWidget({ id, name, settings, type, onEdit, onDelete }: WidgetProps & { onEdit?: () => void, onDelete?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow group relative border border-transparent hover:border-black dark:hover:border-white transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div {...attributes} {...listeners} className="flex-1 cursor-grab font-bold flex items-center">
          {name}
          <span className="ml-2 text-[10px] font-normal text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md">{type || (id.startsWith('category-grid') ? 'category-grid' : id.startsWith('promo-banner') ? 'promo-banner' : id.startsWith('new-arrivals') ? 'new-arrivals' : id.startsWith('best-sellers') ? 'best-sellers' : id.startsWith('featured-category') ? 'featured-category' : id.startsWith('promo-day') ? 'promo-day' : id.split('-')[0])}</span>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-zinc-100 dark:bg-zinc-700 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"><Edit size={14}/></button>}
           {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-zinc-100 dark:bg-zinc-700 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 size={14}/></button>}
        </div>
      </div>
      {(type === 'promo-banner' || id.startsWith('promo-banner')) && settings?.imageUrl && (
         <div className="w-full h-24 rounded-lg bg-zinc-100 dark:bg-zinc-900 bg-cover bg-center border border-zinc-200 dark:border-zinc-700 mt-2 pointer-events-none" style={{ backgroundImage: `url(${settings.imageUrl})` }}></div>
      )}
      {(type === 'category-grid' || id.startsWith('category-grid')) && (
         <div className="grid grid-cols-3 gap-2 mt-4 pointer-events-none">
           {(settings?.categories?.length > 0 ? settings.categories : ['Toutes', 'Catégorie 1', 'Catégorie 2']).slice(0, 3).map((cat: string) => (
             <div key={cat} className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900 bg-cover bg-center border border-zinc-200 dark:border-zinc-700 relative overflow-hidden shadow-sm" style={{ backgroundImage: `url(https://placehold.co/800x800/111/FFF?text=${encodeURIComponent(cat.includes(' / ') ? cat.split(' / ')[1] : cat)})` }}>
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center">
                  <span className="text-white font-black text-[10px] uppercase tracking-wider drop-shadow-md truncate w-full">{cat.includes(' / ') ? cat.split(' / ')[1] : cat}</span>
               </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}


function SortableSidebarCategoryItem({ id, isEditingMode, children }: { id: string, isEditingMode: boolean, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      position: 'relative' as any,
      zIndex: isDragging ? 50 : 1,
  };
  const isDraggable = isEditingMode && id !== 'Toutes' && id !== 'Favoris';

  return (
      <div ref={isDraggable ? setNodeRef : undefined} style={isDraggable ? style : {}} className="group/cat relative flex items-center w-full">
          {isDraggable && (
              <div {...attributes} {...listeners} className="absolute left-1 z-10 cursor-grab opacity-0 group-hover/cat:opacity-100 p-1 text-zinc-400 hover:text-black dark:hover:text-white hidden md:block" title="Déplacer">
                 <GripVertical size={14} />
              </div>
          )}
          {children}
      </div>
  );
}

function DroppableCanvas({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
  });

  const style = {
    backgroundColor: isOver ? 'rgba(57, 255, 20, 0.1)' : undefined,
    outline: isOver ? '2px dashed #39FF14' : '2px dashed transparent',
    transition: 'background-color 0.2s ease, outline 0.2s ease',
  };

  return (
    <div ref={setNodeRef} style={style} className="lg:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 min-h-[400px]">
      {children}
    </div>
  );
}

function WidgetSettingsModal({ widget, onClose, onSave, categories, products }: any) {
    const [settings, setSettings] = useState(widget.settings || {});
    const widgetType = widget.type || (widget.id.startsWith('category-grid') ? 'category-grid' : widget.id.startsWith('promo-banner') ? 'promo-banner' : widget.id.startsWith('new-arrivals') ? 'new-arrivals' : widget.id.startsWith('best-sellers') ? 'best-sellers' : widget.id.startsWith('featured-category') ? 'featured-category' : widget.id.startsWith('promo-day') ? 'promo-day' : '');

    const toggleCategory = (cat: string) => {
        const current = settings.categories || [];
        if (current.includes(cat)) {
            setSettings({ ...settings, categories: current.filter((c: string) => c !== cat) });
        } else {
            setSettings({ ...settings, categories: [...current, cat] });
        }
    };

    return (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && onClose()} className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl w-full max-w-md relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
                <h3 className="text-xl font-black uppercase mb-6 pr-8">Paramètres: {widget.name}</h3>
                
                {widgetType === 'category-grid' && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-bold mb-3">Sélectionnez les catégories à afficher :</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                            {categories.filter((c: string) => c !== 'Toutes' && c !== 'Favoris').map((cat: string) => (
                                <label key={cat} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl cursor-pointer hover:border-black transition border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700">
                                    <input type="checkbox" checked={(settings.categories || []).includes(cat)} onChange={() => toggleCategory(cat)} className="w-5 h-5 accent-black" />
                                    <span className="font-bold text-sm text-black dark:text-white">{cat}</span>
                                </label>
                            ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-2 block">Style d'affichage :</label>
                            <select value={settings.layout || 'grid'} onChange={e => setSettings({ ...settings, layout: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold">
                                <option value="grid">Grille classique</option>
                                <option value="carousel">Carrousel horizontal</option>
                            </select>
                        </div>
                    </div>
                )}

                {widgetType === 'promo-banner' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold mb-2 block">Image de la bannière (600x200 recommandé) :</label>
                            <div className="flex flex-col gap-4">
                                <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center relative">
                                    {settings.imageUrl ? <img src={settings.imageUrl} alt="Aperçu" className="w-full h-full object-cover" /> : <ImageIcon className="text-zinc-400" size={32} />}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input type="text" placeholder="Ou coller une URL d'image" value={settings.imageUrl || ''} onChange={e => setSettings({ ...settings, imageUrl: e.target.value })} className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#39FF14]" />
                                    <input type="file" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setSettings({...settings, imageUrl: reader.result as string});
                                            reader.readAsDataURL(file);
                                        }
                                    }} className="w-full text-xs text-zinc-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-zinc-200 dark:file:bg-zinc-800 file:text-black dark:file:text-white hover:file:bg-[#39FF14] transition" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-2 block">Hauteur de la bannière :</label>
                            <select value={settings.height || 'medium'} onChange={e => setSettings({...settings, height: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-xs font-bold text-black dark:text-white">
                                <option value="small">Petite (150px)</option>
                                <option value="medium">Moyenne (250px)</option>
                                <option value="large">Grande (400px)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-2 block">Texte superposé (Optionnel) :</label>
                            <input type="text" value={settings.textOverlay || ''} onChange={e => setSettings({ ...settings, textOverlay: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold" placeholder="Ex: SOLDES D'ÉTÉ -50%" />
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-2 block">Lien au clic (Optionnel) :</label>
                            <div className="flex gap-2">
                                <select value={settings.linkType || ''} onChange={e => setSettings({...settings, linkType: e.target.value, linkTarget: ''})} className="w-1/3 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-xs font-bold text-black dark:text-white">
                                    <option value="">Aucun</option>
                                    <option value="category">Catégorie</option>
                                    <option value="product">Produit</option>
                                </select>
                                {settings.linkType === 'category' && (
                                    <select value={settings.linkTarget || ''} onChange={e => setSettings({...settings, linkTarget: e.target.value})} className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-xs font-bold text-black dark:text-white">
                                        <option value="">Choisir...</option>
                                        {categories.filter((c: string) => c !== 'Toutes' && c !== 'Favoris').map((c: string) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                )}
                                {settings.linkType === 'product' && (
                                    <select value={settings.linkTarget || ''} onChange={e => setSettings({...settings, linkTarget: e.target.value})} className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-xs font-bold text-black dark:text-white">
                                        <option value="">Choisir...</option>
                                        {products?.map((p: any) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {(widgetType === 'new-arrivals' || widgetType === 'best-sellers' || widgetType === 'featured-category') && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold mb-2 block">Titre de la section :</label>
                            <input type="text" value={settings.title || ''} onChange={e => setSettings({ ...settings, title: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold uppercase" placeholder="Ex: Nouveautés" />
                        </div>
                        
                        {widgetType === 'featured-category' && (
                            <div>
                                <label className="text-sm font-bold mt-2 mb-2 block">Catégorie à mettre en avant :</label>
                                <select value={settings.category || ''} onChange={e => setSettings({ ...settings, category: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white cursor-pointer">
                                    <option value="">Sélectionner une catégorie...</option>
                                    {categories.filter((c: string) => c !== 'Toutes' && c !== 'Favoris').map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-bold mb-2 block">Style d'affichage :</label>
                            <select value={settings.layout || 'marquee'} onChange={e => setSettings({ ...settings, layout: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold">
                                <option value="marquee">Défilement continu (Marquee)</option>
                                <option value="grid">Grille fixe (Grid)</option>
                            </select>
                        </div>

                        {widgetType === 'new-arrivals' && (
                            <div>
                                <label className="text-sm font-bold mt-2 mb-2 block">Sélectionner des produits (Optionnel) :</label>
                                <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    {products?.map((p: any) => (
                                        <label key={p.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition">
                                            <input type="checkbox" checked={(settings.selectedProducts || []).includes(p.id)} onChange={(e) => { const curr = settings.selectedProducts || []; setSettings({ ...settings, selectedProducts: e.target.checked ? [...curr, p.id] : curr.filter((id: number) => id !== p.id) }); }} className="w-4 h-4 accent-black dark:accent-[#39FF14]" />
                                            <span className="text-xs font-bold text-black dark:text-white truncate">{p.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {widgetType === 'promo-day' && (
                    <div>
                        <label className="text-sm font-bold mb-2 block">Titre de l'encart :</label>
                        <input type="text" value={settings.title || ''} onChange={e => setSettings({ ...settings, title: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold uppercase mb-4" placeholder="Ex: Offre Flash" />
                        
                        <label className="text-sm font-bold mt-4 mb-2 block">Produit en promotion :</label>
                        <select value={settings.selectedProduct || ''} onChange={e => setSettings({ ...settings, selectedProduct: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white cursor-pointer mb-4">
                            <option value="">Sélectionner un produit...</option>
                            {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>

                        <label className="text-sm font-bold mb-2 block">Texte du bouton :</label>
                        <input type="text" value={settings.buttonText || ''} onChange={e => setSettings({ ...settings, buttonText: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold mb-4" placeholder="Ex: Profiter de l'offre" />

                        <label className="text-sm font-bold mb-2 block">Description personnalisée (Optionnel) :</label>
                        <textarea value={settings.customDescription || ''} onChange={e => setSettings({ ...settings, customDescription: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm mb-4 resize-none h-20 custom-scrollbar" placeholder="Laissez vide pour utiliser la description du produit..." />
                    </div>
                )}

                <button onClick={() => onSave(settings)} className="w-full mt-8 bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform flex justify-center items-center gap-2">
                    <Save size={16} /> Enregistrer
                </button>
            </div>
        </div>
    );
}

function ShopPageBuilder({ categories, products, shopId }: { categories: string[], products: Product[], shopId: string | null }) {
  const availableWidgets = [
    { id: 'category-grid', type: 'category-grid', name: 'Grille de Catégories', settings: { categories: [] } },
    { id: 'promo-banner', type: 'promo-banner', name: 'Bannière Promotionnelle', settings: { imageUrl: '' } },
    { id: 'new-arrivals', type: 'new-arrivals', name: 'Nouveautés', settings: { title: 'Nouveautés' } },
    { id: 'best-sellers', type: 'best-sellers', name: 'Meilleures Ventes', settings: { title: 'Populaires' } },
    { id: 'promo-day', type: 'promo-day', name: 'Promo du Jour', settings: { title: 'Offres Éclair', selectedProduct: null } },
    { id: 'featured-category', type: 'featured-category', name: 'Catégorie à la une', settings: { category: '', title: 'Notre Sélection' } }
  ];

  const [pageWidgets, setPageWidgets] = useState<WidgetProps[]>([]);
  const [editingWidget, setEditingWidget] = useState<WidgetProps | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const savedLayout = localStorage.getItem('onyx_jaay_homepage_layout');
    if (savedLayout) {
      setPageWidgets(JSON.parse(savedLayout));
    }
  }, []);

  const handleSaveLayout = async () => {
    localStorage.setItem('onyx_jaay_homepage_layout', JSON.stringify(pageWidgets));
    if (shopId) {
        await supabase.from('shops').update({ homepage_layout: pageWidgets }).eq('id', shopId);
    }
    alert('Mise en page enregistrée !');
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const isFromToolbox = availableWidgets.some(w => w.id === active.id);

    if (isFromToolbox && over.id === 'canvas') {
        const widget = availableWidgets.find(w => w.id === active.id);
        if (widget) {
            setPageWidgets(current => [...current, { ...widget, id: widget.id + '-' + Date.now() }]);
        }
        return;
    }

    const isReordering = pageWidgets.some(w => w.id === active.id);
    const overIsWidget = pageWidgets.some(w => w.id === over.id);

    if (isReordering && overIsWidget && active.id !== over.id) {
        setPageWidgets(items => {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  }

  const generateAutoLayout = () => {
      const hasCategories = categories.filter(c => c !== 'Toutes' && c !== 'Favoris').length > 0;
      const hasPromos = products.some(p => p.oldPrice && p.oldPrice > p.price);
      
      const newLayout: WidgetProps[] = [];
      
      if (hasCategories) {
          newLayout.push({ id: `category-grid-${Date.now()}-1`, type: 'category-grid', name: 'Grille de Catégories', settings: { categories: [], layout: 'carousel' } });
      }

      newLayout.push({ id: `new-arrivals-${Date.now()}-2`, type: 'new-arrivals', name: 'Nouveautés', settings: { title: 'Nouveautés', layout: 'marquee' } });
      
      if (hasPromos) {
          const promoProduct = products.find(p => p.oldPrice && p.oldPrice > p.price);
          newLayout.push({ id: `promo-day-${Date.now()}-3`, type: 'promo-day', name: 'Promo du Jour', settings: { title: 'Offre Spéciale', selectedProduct: promoProduct?.id } });
      }

      newLayout.push({ id: `best-sellers-${Date.now()}-4`, type: 'best-sellers', name: 'Meilleures Ventes', settings: { title: 'Les plus populaires', layout: 'grid' } });

      setPageWidgets(newLayout);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="p-8 md:p-12 pt-32 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Mettre à jour mon site</h2>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">Faites glisser et déposez des composants pour construire votre page d'accueil ou laissez l'IA le faire.</p>
            </div>
            <button onClick={generateAutoLayout} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shrink-0">
                <Sparkles size={16} /> Suggestions (IA)
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h3 className="font-bold text-lg mb-4">Widgets Disponibles</h3>
              <div className="space-y-4">
                  {availableWidgets.map(widget => (
                    <DraggableWidget key={widget.id} id={widget.id} name={widget.name} />
                  ))}
              </div>
            </div>
            <DroppableCanvas>
              <h3 className="font-bold text-lg mb-4">Aperçu de la Page</h3>
               <SortableContext items={pageWidgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                    {pageWidgets.map((widget) => (
                      <SortableWidget key={widget.id} id={widget.id} type={widget.type} settings={widget.settings} name={widget.name} onEdit={() => setEditingWidget(widget)} onDelete={() => setPageWidgets(prev => prev.filter(w => w.id !== widget.id))} />
                    ))}
                    {pageWidgets.length === 0 && (
                      <div className="text-center text-zinc-500 py-16">
                          <p>Déposez des widgets ici</p>
                      </div>
                    )}
                </div>
              </SortableContext>
            </DroppableCanvas>
        </div>
        <div className="mt-8 flex justify-end">
            <button onClick={handleSaveLayout} className="bg-[#39FF14] text-black px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-white transition-colors flex items-center gap-2">
                <Save size={16} /> Enregistrer la page
            </button>
        </div>
        </div>
        {editingWidget && (
            <WidgetSettingsModal 
                widget={editingWidget} 
                onClose={() => setEditingWidget(null)} 
                onSave={(newSettings: any) => {
                   setPageWidgets(prev => prev.map(w => w.id === editingWidget.id ? { ...w, settings: newSettings } : w));
                   setEditingWidget(null);
                }}
                categories={categories}
                products={products}
            />
        )}
    </DndContext>
  );
}

interface CategoryGridWidgetProps {
    categories: string[];
    setActiveCategory: (category: string) => void;
    categoryCovers?: Record<string, string>;
    layout?: 'grid' | 'carousel';
}

const CategoryGridWidget = ({ categories, setActiveCategory, categoryCovers = {}, layout = 'grid' }: CategoryGridWidgetProps) => {
    if (layout === 'carousel') {
        return (
            <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x animate-in fade-in">
                {categories.map((cat: string) => (
                    <div key={cat} onClick={() => setActiveCategory(cat)} className="snap-start shrink-0 w-48 h-64 rounded-3xl overflow-hidden cursor-pointer relative group">
                        <img src={categoryCovers[cat] || `https://placehold.co/800x800/111/FFF?text=${encodeURIComponent(cat.includes(' / ') ? cat.split(' / ')[1] : cat)}`} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center p-4 text-center">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-md">{cat.includes(' / ') ? cat.split(' / ')[1] : cat}</h3>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
        {categories.map((cat) => (
            <div key={cat} onClick={() => setActiveCategory(cat)} className="group relative h-80 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800">
                <img src={categoryCovers[cat] || `https://placehold.co/800x800/111/FFF?text=${encodeURIComponent(cat.includes(' / ') ? cat.split(' / ')[1] : cat)}`} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">{cat.includes(' / ') ? cat.split(' / ')[1] : cat}</h3>
                    <span className="mt-4 px-6 py-2 bg-[#39FF14] text-black text-xs font-bold uppercase rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    Voir la collection
                    </span>
                </div>
            </div>
        ))}
        </div>
    );
};

const PromoBannerWidget = ({ settings, onClick }: { settings?: any, onClick?: () => void }) => {
    const heightClass = settings?.height === 'small' ? 'h-[150px]' : settings?.height === 'large' ? 'h-[400px]' : 'h-[250px]';
    return (
        <div 
            onClick={onClick}
            className={`w-full max-w-[800px] mx-auto ${heightClass} rounded-[2.5rem] overflow-hidden relative my-8 shadow-xl flex items-center justify-center bg-black transition-all ${onClick ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : ''}`}
            style={{
                backgroundImage: settings?.imageUrl ? `url(${settings.imageUrl})` : undefined,
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            }}
        >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            {!settings?.imageUrl && !settings?.textOverlay && <p className="relative z-10 text-white font-black text-xl opacity-50 uppercase tracking-widest text-center px-4">Bannière Promotionnelle<br/><span className="text-sm">Parallax</span></p>}
            {settings?.textOverlay && <h3 className="relative z-10 text-white font-black text-3xl md:text-5xl uppercase tracking-tighter text-center px-6 drop-shadow-2xl">{settings.textOverlay}</h3>}
        </div>
    );
};

const PromoDayWidget = ({ settings, products, onViewProduct, addToCart, currency, cart }: any) => {
    const product = products.find((p: any) => String(p.id) === String(settings?.selectedProduct));
    if (!product) return null;
    const isOutOfStock = product.stock === 0;
    const qtyInCart = cart ? cart.filter((i:any) => i.id === product.id).reduce((sum:any, i:any) => sum + i.quantity, 0) : 0;
    const isMaxedOut = product.stock !== undefined && qtyInCart >= product.stock;

    return (
        <div className="my-12 bg-black dark:bg-zinc-900 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden animate-in fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="w-full md:w-1/2 relative z-10 text-white">
                <h3 className="text-[#39FF14] font-black uppercase tracking-widest text-sm mb-2">{settings?.title || "Offre du Jour"}</h3>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{product.name}</h2>
                <p className="text-zinc-400 mb-8 line-clamp-3">{settings?.customDescription || product.description}</p>
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-black">{displayPrice(product.price, currency)}</span>
                    {((product.oldPrice || product.old_price) || 0) > product.price && <span className="text-xl text-zinc-500 line-through">{displayPrice(product.oldPrice || product.old_price, currency)}</span>}
                </div>
                <button onClick={() => { if ((product.variants?.sizes?.length || 0) > 0 || (product.variants?.colors?.length || 0) > 0) { onViewProduct(product); } else { addToCart(product, undefined, false); } }} disabled={isOutOfStock || isMaxedOut} className="bg-[#39FF14] text-black px-8 py-4 rounded-full font-black uppercase text-sm hover:bg-white transition-colors disabled:opacity-50 shadow-[0_10px_30px_rgba(57,255,20,0.3)] w-full sm:w-auto text-center">
                    {isOutOfStock ? 'Épuisé' : (settings?.buttonText || 'Profiter de l\'offre')}
                </button>
            </div>
            <div className="w-full md:w-1/2 relative z-10 flex justify-center">
                <div className="relative w-full max-w-[280px] aspect-square rounded-[2rem] overflow-hidden group cursor-pointer border-4 border-zinc-800 hover:border-[#39FF14] transition-colors bg-white" onClick={() => onViewProduct(product)}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {((product.oldPrice || product.old_price) || 0) > product.price && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full font-black text-xs uppercase shadow-lg transform rotate-12">
                            -{Math.round(((((product.oldPrice || product.old_price) || 0) - product.price) / ((product.oldPrice || product.old_price) || 1)) * 100)}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NewArrivalsWidget = ({ title, products, selectedProductIds, onViewProduct, addToCart, currency, cart }: any) => {
    let displayProducts: Product[] = [...products];
    if (selectedProductIds && selectedProductIds.length > 0) {
        displayProducts = products.filter((p: Product) => selectedProductIds.includes(p.id));
    } else {
        displayProducts = displayProducts.sort((a: Product, b: Product) => b.id - a.id).slice(0, 8);
    }
    const latestProducts = displayProducts;
    const marqueeProducts = [...latestProducts, ...latestProducts, ...latestProducts];
    
    const getQtyInCart = (id: number) => cart ? cart.filter((i:any) => i.id === id).reduce((sum:any, i:any) => sum + i.quantity, 0) : 0;

    return (
        <div className="my-12 overflow-hidden">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 px-2">{title || 'Nouveautés'}</h3>
            <div className="relative w-full flex overflow-x-hidden group">
                <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } } .animate-marquee { animation: marquee 25s linear infinite; display: flex; width: max-content; } .group:hover .animate-marquee { animation-play-state: paused; }`}</style>
                <div className="animate-marquee gap-6">
                    {marqueeProducts.map((p: Product, idx: number) => (
                        <div key={`${p.id}-${idx}`} className={`w-[300px] h-[350px] bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all shrink-0 ${p.stock === 0 ? 'grayscale opacity-75' : ''}`} onClick={() => onViewProduct(p)}>
                            <div className="h-[220px] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                               <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                               {p.stock === 0 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                                    <span className="text-white font-black uppercase tracking-widest border-2 border-white px-4 py-2 rounded-lg">Épuisé</span>
                                  </div>
                               )}
                               <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                                  {((p.oldPrice || (p as any).old_price) || 0) > p.price && (
                                     <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Promo -{Math.round(((((p.oldPrice || (p as any).old_price) || 0) - p.price) / ((p.oldPrice || (p as any).old_price) || 1)) * 100)}%</span>
                                  )}
                                  {p.stock === 0 && <div className="bg-zinc-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Épuisé</div>}
                                  {p.stock !== 0 && ((p as any).created_at ? new Date((p as any).created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : p.id > Date.now() - 7 * 24 * 60 * 60 * 1000) && <div className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-[#39FF14]/30">Nouveau</div>}
                                  {p.stock === 1 && <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-pulse">Stock critique !</div>}
                               </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <h4 className="font-bold text-base truncate text-black dark:text-white">{p.name}</h4>
                                <div className="flex justify-between items-end mt-2">
                                    <div className="flex flex-col">
                                        {p.oldPrice && p.oldPrice > p.price && <span className="text-[10px] text-zinc-400 line-through mb-[-4px]">{displayPrice(p.oldPrice, currency)}</span>}
                                        <span className="font-black text-xl text-black dark:text-white">{displayPrice(p.price, currency)}</span>
                                    </div>
                                    <button onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if ((Array.isArray(p.variants?.sizes) && p.variants.sizes.length > 0) || (Array.isArray(p.variants?.colors) && p.variants.colors.length > 0)) {
                                            onViewProduct(p);
                                        } else {
                                            addToCart(p, undefined, false); 
                                        }
                                    }} disabled={p.stock === 0 || (p.stock !== undefined && getQtyInCart(p.id) >= p.stock)} className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-xl hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition-colors disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed"><Plus size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function OnyxJaayShop() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isShopOwner, setIsShopOwner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIWriting, setIsAIWriting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string[]>([]);
  const [activeSize, setActiveSize] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [qrCodeProduct, setQrCodeProduct] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [theme, setTheme] = useState('dark');
  const [shopView, setShopView] = useState<'boutique' | 'dashboard' | 'settings' | 'clients' | 'page-builder' | 'planning' | 'reviews'>('boutique');
  const [categories, setCategories] = useState(['Toutes', 'Favoris', 'Homme', 'Femme', 'Enfant', 'Sport', 'Accessoires']);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: 1, code: 'BIENVENUE10', discount: 10, type: 'percentage', active: true },
    { id: 2, code: 'SOLDE5000', discount: 5000, type: 'fixed', active: false },
  ]);
  const [shopInfo, setShopInfo] = useState<typeof initialShopInfo>(initialShopInfo);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [currentCustomerPoints, setCurrentCustomerPoints] = useState(0);
  const [customDeliveryCost, setCustomDeliveryCost] = useState<number | ''>('');
  const [manualDiscountPct, setManualDiscountPct] = useState<number | ''>('');
  const [productViews, setProductViews] = useState<Record<number, number>>({});
  const [viewHistory, setViewHistory] = useState<Record<string, number>>({});
  const [barcodeInput, setBarcodeInput] = useState('');
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [homepageLayout, setHomepageLayout] = useState<WidgetProps[] | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);
  
  const handleSaveCategoriesSilently = async (newCategories: string[], newCovers: any) => {
      if (shopId) {
          await supabase.from('shops').update({ categories: newCategories, category_covers: newCovers }).eq('id', shopId);
      }
  };

  const toggleSidebarCategoryVisibility = (cat: string) => {
      const hiddenKey = '__hidden_' + cat;
      const newCovers = { ...(shopInfo.categoryCovers || {}) };
      if (newCovers[hiddenKey]) delete newCovers[hiddenKey];
      else newCovers[hiddenKey] = 'true';
      setShopInfo({ ...shopInfo, categoryCovers: newCovers });
      handleSaveCategoriesSilently(categories, newCovers);
  };

  const handleCategoryDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
          if (active.id === 'Toutes' || active.id === 'Favoris' || over.id === 'Toutes' || over.id === 'Favoris') return;

          const fixedCats = categories.filter(c => c === 'Toutes' || c === 'Favoris');
          const movableCats = categories.filter(c => c !== 'Toutes' && c !== 'Favoris');

          const oldIndex = movableCats.indexOf(active.id as string);
          const newIndex = movableCats.indexOf(over.id as string);
          
          if (oldIndex !== -1 && newIndex !== -1) {
              const newMovableCats = arrayMove(movableCats, oldIndex, newIndex);
              const newCats = [...fixedCats, ...newMovableCats];
              
              setCategories(newCats);
              handleSaveCategoriesSilently(newCats, shopInfo.categoryCovers || {});
          }
      }
  };

  const getCategoryCount = useCallback((cat: string) => {
      if (cat === 'Toutes') return products.length;
      if (cat === 'Favoris') return wishlist.length;
      return products.filter(p => p.category === cat || (p.category && p.category.startsWith(cat + ' / '))).length;
  }, [products, wishlist.length]);

  const categorySensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const toggleSidebarCategoryBadge = (cat: string) => {
      const badgeKey = '__new_' + cat;
      const newCovers = { ...(shopInfo.categoryCovers || {}) };
      if (newCovers[badgeKey]) delete newCovers[badgeKey];
      else newCovers[badgeKey] = 'true';
      setShopInfo({ ...shopInfo, categoryCovers: newCovers });
      handleSaveCategoriesSilently(categories, newCovers);
  };

  const handleSidebarRenameCategory = (oldCat: string) => {
      const newCatName = prompt(`Renommer la catégorie "${oldCat}" en :`, oldCat.includes(' / ') ? oldCat.split(' / ').pop() : oldCat);
      if (newCatName && newCatName.trim() && newCatName.trim() !== oldCat) {
          const newCatFull = oldCat.includes(' / ') 
            ? `${oldCat.substring(0, oldCat.lastIndexOf(' / '))} / ${newCatName.trim()}` 
            : newCatName.trim();

          const updatedCategories = categories.map(c => c === oldCat ? newCatFull : c);
          const finalCategories = updatedCategories.map(c => (!oldCat.includes(' / ') && c.startsWith(oldCat + ' / ')) ? c.replace(oldCat + ' / ', newCatFull + ' / ') : c);
          
          setCategories(finalCategories);

          const newCovers = { ...(shopInfo.categoryCovers || {}) };
          if (newCovers[oldCat]) { newCovers[newCatFull] = newCovers[oldCat]; delete newCovers[oldCat]; }
          if (!oldCat.includes(' / ')) {
              Object.keys(newCovers).forEach(key => {
                  if (key.startsWith(oldCat + ' / ')) {
                      const newKey = key.replace(oldCat + ' / ', newCatFull + ' / ');
                      newCovers[newKey] = newCovers[key];
                      delete newCovers[key];
                  }
              });
          }
          setShopInfo({ ...shopInfo, categoryCovers: newCovers });
          handleSaveCategoriesSilently(finalCategories, newCovers);

          if (shopId) {
              supabase.from('products').select('id, category').eq('shop_id', shopId).ilike('category', `${oldCat}%`).then(({ data: prods }) => {
                  if (prods && prods.length > 0) {
                      for (const p of prods) {
                          let updatedCat = p.category === oldCat ? newCatFull : (!oldCat.includes(' / ') && p.category.startsWith(oldCat + ' / ')) ? p.category.replace(oldCat + ' / ', newCatFull + ' / ') : p.category;
                          if (updatedCat !== p.category) supabase.from('products').update({ category: updatedCat }).eq('id', p.id).then();
                      }
                  }
              });
          }
      }
  };

  const handleSidebarDeleteCategory = (cat: string) => {
      if (confirm(`Supprimer la catégorie "${cat}" ? Les produits resteront dans le catalogue global.`)) {
          const newCats = categories.filter(c => c !== cat);
          setCategories(newCats);
          handleSaveCategoriesSilently(newCats, shopInfo.categoryCovers || {});
      }
  };

  const [showStockUpdate, setShowStockUpdate] = useState(false);
  const stockUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerStockUpdateBadge = () => {
    setShowStockUpdate(true);
    if (stockUpdateTimeoutRef.current) clearTimeout(stockUpdateTimeoutRef.current);
    stockUpdateTimeoutRef.current = setTimeout(() => setShowStockUpdate(false), 2000);
  };

  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const [iaSuggestions, setIaSuggestions] = useState<any[]>([]);
  const [plannedEvents, setPlannedEvents] = useState<any[]>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('onyx_jaay_planned_events');
          return saved ? JSON.parse(saved) : [];
      }
      return [];
  });

  const handleLogout = async () => {
    localStorage.removeItem('onyx_custom_session');
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [orderReview, setOrderReview] = useState({ name: '', rating: 5, comment: '' });

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const bestSellerIds = useMemo(() => {
      if (!products || products.length === 0) return [];
      return [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 3).map(p => p.id);
  }, [products]);

  const availableColors = useMemo(() => {
      const colorsSet = new Set<string>();
      products.forEach((p: any) => {
          if (p.variants?.colors && Array.isArray(p.variants.colors)) {
              p.variants.colors.forEach((c: any) => colorsSet.add(typeof c === 'string' ? c : c.name));
          }
      });
      return Array.from(colorsSet).sort();
  }, [products]);

  const availableSizes = useMemo(() => {
      const sizesSet = new Set<string>();
      products.forEach((p: any) => {
          if (p.variants?.sizes && Array.isArray(p.variants.sizes)) {
              p.variants.sizes.forEach((s: any) => sizesSet.add(typeof s === 'string' ? s : s.name));
          }
      });
      const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
      return Array.from(sizesSet).sort((a, b) => {
          const indexA = sizeOrder.indexOf(a.toUpperCase());
          const indexB = sizeOrder.indexOf(b.toUpperCase());
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          const numA = parseInt(a);
          const numB = parseInt(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
      });
  }, [products]);

  const fetchOrders = async (targetShopId?: string) => {
      const idToFetch = targetShopId || shopId;
      if (!idToFetch) return;
      const { data, error } = await supabase.from('orders').select('*').eq('shop_id', idToFetch).order('created_at', { ascending: false });
      
      if (data && !error) {
        const formattedOrders = data.map((o: any) => ({
          id: o.id,
          date: o.created_at || new Date().toISOString(),
          customer: { name: o.customer_name, phone: o.customer_phone, address: o.customer_address, instructions: o.delivery_instructions },
          items: o.items || [],
          total: o.total_amount,
          status: o.status,
          pointsUsed: o.points_used,
          trackingNumber: o.tracking_number,
          deliveryMethod: o.delivery_method,
          deliveryZone: o.delivery_zone,
          delivery_driver: o.delivery_driver,
          history: o.history || [{ status: o.status || 'En attente', date: o.created_at || new Date().toISOString(), user: 'Système' }]
        }));
        setOrders(formattedOrders);
      } else {
        // Restauration de l'historique local si Supabase est vide
        const savedOrders = localStorage.getItem('onyx_jaay_orders');
        if (savedOrders) {
            try { setOrders(JSON.parse(savedOrders)); } catch(e) {}
        }
      }
  };

  const fetchShopData = async (userId: string, passedPhone?: string) => {
      let { data: shop, error: shopError } = await supabase.from('shops').select('*').eq('owner_id', userId).maybeSingle();
      
      if (!shop) {
          // Fallback : On cherche par le numéro de téléphone si owner_id est introuvable
          let userPhone = passedPhone || authUser?.phone;
          if (!userPhone && typeof window !== 'undefined') {
              try {
                  const customSession = JSON.parse(localStorage.getItem('onyx_custom_session') || '{}');
                  userPhone = customSession.phone;
              } catch (e) {}
          }

          if (userPhone) {
              const { data: shopByPhone } = await supabase.from('shops').select('*').eq('phone', userPhone).maybeSingle();
              if (shopByPhone) {
                  shop = shopByPhone;
                  // Optionnel : on répare la liaison pour les futures connexions
                  if (!shop.owner_id) {
                      await supabase.from('shops').update({ owner_id: userId }).eq('id', shop.id);
                  }
              }
          }
      }

      if (!shop) {
          const { data: profile } = await supabase.from('clients').select('full_name').eq('id', userId).maybeSingle();
          const defaultName = profile?.full_name ? `Boutique de ${profile.full_name}` : 'Ma Boutique';
          const defaultSlug = defaultName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);

          const { data: newShop, error: createError } = await supabase.from('shops').insert([{
              owner_id: userId,
              name: defaultName,
              slug: defaultSlug,
              currency: 'FCFA'
          }]).select().single();
          
          if (!createError && newShop) shop = newShop;
      }

      if (shop) {
          setShopId(shop.id);
          setShopInfo({
              name: shop.name || '',
              description: shop.description || '',
              phone: shop.phone || '',
              deliveryFees: 0,
              logoUrl: shop.logo_url || '',
              currency: shop.currency || 'FCFA',
              deliveryOptions: shop.delivery_options || { delivery: true, pickup: true },
              openingHours: shop.opening_hours || { start: '09:00', end: '18:00', enabled: false },
              slug: shop.slug || '',
              categoryCovers: shop.category_covers || {},
              instagramUrl: shop.instagram_url || '',
              facebookUrl: shop.facebook_url || '',
              tiktokUrl: shop.tiktok_url || '',
              twitterUrl: shop.twitter_url || '',
              youtubeUrl: shop.youtube_url || ''
          });
          
          if (shop.delivery_zones && Array.isArray(shop.delivery_zones) && shop.delivery_zones.length > 0) {
              setDeliveryZones(shop.delivery_zones);
          }

          let loadedCategories = ['Toutes', 'Favoris', 'Homme', 'Femme', 'Enfant', 'Sport', 'Accessoires'];
          if (shop.categories && Array.isArray(shop.categories) && shop.categories.length > 0) {
              loadedCategories = shop.categories;
              setCategories(shop.categories);
          }

          const { data: productsData } = await supabase.from('products').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false });
          let productIds: string[] = [];
          if (productsData && productsData.length > 0) {
            productIds = productsData.map(p => String(p.id));
            const { data: reviewsData } = await supabase.from('reviews').select('*').in('reference_id', productIds);
            
            // S'assure que toutes les catégories de produits sont dans la liste des catégories
            const productCats = new Set<string>();
            productsData.forEach((p: any) => { if (p.category) productCats.add(p.category); });
            const combined = new Set([...loadedCategories, ...Array.from(productCats)]);
            setCategories(Array.from(combined));

            setProducts(productsData.map(p => {
                const productReviews = reviewsData ? reviewsData.filter(r => String(r.reference_id) === String(p.id)) : [];
                return {
                    id: p.id, name: p.name, price: p.price, costPrice: p.cost_price, oldPrice: p.old_price,
                    description: p.description, image: p.image, gallery: p.gallery || [], category: p.category,
                    stock: p.stock, rating: p.rating, reviews: p.reviews, variants: p.variants || { sizes: [], colors: [] },
                    videoUrl: p.video_url, reviewsList: productReviews
                };
            }));
          }
          fetchOrders(shop.id);

          // Récupération des derniers avis pour les notifications
          const { data: reviewsData } = await supabase.from('reviews').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false }).limit(10);
          if (reviewsData) {
              setRecentReviews(reviewsData);
          }
      }
  };

  useEffect(() => {
    if (!shopId) return;
    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${shopId}` }, (payload) => { fetchOrders(shopId); })
      .subscribe();

    const reviewsChannel = supabase
      .channel('realtime-reviews')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
          setRecentReviews(prev => [payload.new, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(reviewsChannel); };
  }, [shopId]);

  useEffect(() => {
      const verifyAuth = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
              setAuthUser(session.user);
              setIsShopOwner(true);
              setIsEditingMode(true);
              await fetchShopData(session.user.id, session.user.phone || session.user.user_metadata?.phone);
          } else {
              const customSession = localStorage.getItem('onyx_custom_session');
              if (customSession) {
                  try {
                      const user = JSON.parse(customSession);
                      setAuthUser(user);
                      setIsShopOwner(true);
                      setIsEditingMode(true);
                      await fetchShopData(user.id, user.phone);
                  } catch (e) {
                      setIsShopOwner(false);
                      setIsEditingMode(false);
                  }
              } else {
                  setIsShopOwner(false);
                  setIsEditingMode(false);
              }
          }
          setIsLoading(false); // Dans tous les cas on affiche la page
      };
      verifyAuth();
  }, [router]);

  useEffect(() => {
    const savedLayout = localStorage.getItem('onyx_jaay_homepage_layout');
    if (savedLayout) {
      setHomepageLayout(JSON.parse(savedLayout));
    }
  }, []);

  useEffect(() => {
      localStorage.setItem('onyx_jaay_planned_events', JSON.stringify(plannedEvents));
  }, [plannedEvents]);

  const renderWidget = (widget: WidgetProps) => {
    const widgetType = widget.type || (widget.id.startsWith('category-grid') ? 'category-grid' : widget.id.startsWith('promo-banner') ? 'promo-banner' : widget.id.startsWith('new-arrivals') ? 'new-arrivals' : widget.id.startsWith('best-sellers') ? 'best-sellers' : widget.id.startsWith('featured-category') ? 'featured-category' : widget.id.startsWith('promo-day') ? 'promo-day' : '');
    switch (widgetType) {
      case 'category-grid':
        let catsToDisplay = widget.settings?.categories?.length > 0 ? widget.settings.categories : categories.filter(c => c !== 'Toutes' && c !== 'Favoris');
        catsToDisplay = catsToDisplay.filter((c: string) => !shopInfo?.categoryCovers?.['__hidden_' + c]);
        return <CategoryGridWidget categories={catsToDisplay} setActiveCategory={setActiveCategory} categoryCovers={shopInfo.categoryCovers || {}} layout={widget.settings?.layout} />;
      case 'promo-banner':
        return <PromoBannerWidget 
            settings={widget.settings} 
            onClick={(!isEditingMode && widget.settings?.linkType) ? () => {
                if (widget.settings.linkType === 'category' && widget.settings.linkTarget) setActiveCategory(widget.settings.linkTarget);
                else if (widget.settings.linkType === 'product' && widget.settings.linkTarget) {
                    const p = products.find(prod => String(prod.id) === String(widget.settings.linkTarget));
                    if (p) handleViewProduct(p);
                }
            } : undefined} />;
      case 'new-arrivals':
        return <NewArrivalsWidget settings={widget.settings} products={products} selectedProductIds={widget.settings?.selectedProducts} onViewProduct={handleViewProduct} addToCart={addToCart} currency={shopInfo.currency} cart={cart} />;
      case 'best-sellers':
        const bestSellersProducts = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        return <NewArrivalsWidget settings={widget.settings} products={bestSellersProducts} onViewProduct={handleViewProduct} addToCart={addToCart} currency={shopInfo.currency} cart={cart} />;
      case 'featured-category':
        const featProducts = products.filter(p => p.category === widget.settings?.category);
        return <NewArrivalsWidget settings={widget.settings} products={featProducts} onViewProduct={handleViewProduct} addToCart={addToCart} currency={shopInfo.currency} cart={cart} />;
      case 'promo-day':
        return <PromoDayWidget settings={widget.settings} products={products} onViewProduct={handleViewProduct} addToCart={addToCart} currency={shopInfo.currency} cart={cart} />;
      default:
        return <div className="p-4 bg-red-200 rounded-lg">Widget inconnu: {widget.name}</div>;
    }
  };

  // --- CART LOGIC ---
  useEffect(() => {
    const savedCart = localStorage.getItem('onyx_jaay_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erreur chargement panier", e);
      }
    }
    const savedWishlist = localStorage.getItem('onyx_jaay_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Erreur chargement wishlist", e);
      }
    }
    const savedViews = localStorage.getItem('onyx_jaay_views');
    if (savedViews) {
      try {
        setProductViews(JSON.parse(savedViews));
      } catch (e) {
        console.error("Erreur chargement Vues", e);
      }
    }
    const savedViewHistory = localStorage.getItem('onyx_jaay_view_history');
    if (savedViewHistory) {
      try {
        setViewHistory(JSON.parse(savedViewHistory));
      } catch (e) {
        console.error("Erreur chargement historique vues", e);
      }
    }
    const savedAddr = localStorage.getItem('onyx_jaay_address');
    if (savedAddr) {
      setCustomerAddress(savedAddr);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('onyx_jaay_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('onyx_jaay_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('onyx_jaay_views', JSON.stringify(productViews));
  }, [productViews]);

  useEffect(() => {
    localStorage.setItem('onyx_jaay_view_history', JSON.stringify(viewHistory));
  }, [viewHistory]);

  useEffect(() => {
    localStorage.setItem('onyx_jaay_address', customerAddress);
  }, [customerAddress]);

  // --- THEME LOGIC ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('onyx_jaay_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('onyx_jaay_theme', newTheme);
  };

  // New useEffect for QR code deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
      const product = products.find(p => p.id === Number(productId));
      if (product) {
        setViewingProduct(product);
      }
    }
    const orderId = urlParams.get('order_review');
    if (orderId) {
      setReviewOrderId(orderId);
    }
  }, [products]);

  const addToCart = (product: Product, variant?: { size?: string; color?: string }, openCart: boolean = true, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
      );
      
      // Check stock
      const totalProductQuantityInCart = prev.filter(item => item.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
      if (product.stock !== undefined && (totalProductQuantityInCart + qty) > product.stock) {
        alert(`Stock insuffisant. Il ne reste que ${product.stock} unité(s).`);
        return prev;
      }

      if (existing) {
        return prev.map(item => (item.id === product.id && JSON.stringify(item.selectedVariant) === JSON.stringify(variant)) ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty, selectedVariant: variant }];
    });
    if (openCart) setIsCartOpen(true);
    triggerStockUpdateBadge();
    setToastMessage(`🛒 ${product.name} ajouté au panier !`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (!barcodeInput.trim()) return;
        
        const scannedCode = barcodeInput.trim();
        const product = products.find(p => p.barcode === scannedCode || p.id.toString() === scannedCode);
        
        if (product) {
            addToCart(product, undefined, false);
        } else {
            alert(`Aucun produit trouvé pour le code : ${scannedCode}`);
        }
        setBarcodeInput('');
    }
  };

  const removeFromCart = (itemToRemove: CartItem) => {
    setCart(prev => prev.filter(item => item.id !== itemToRemove.id || JSON.stringify(item.selectedVariant) !== JSON.stringify(itemToRemove.selectedVariant)));
    triggerStockUpdateBadge();
  };

  const updateQuantity = (itemToUpdate: CartItem, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemToUpdate.id && JSON.stringify(item.selectedVariant) === JSON.stringify(itemToUpdate.selectedVariant)) {
        const newQty = item.quantity + delta;
        if (delta > 0 && item.stock !== undefined) {
          const totalProductQuantityInCart = prev.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
          if (totalProductQuantityInCart >= item.stock) {
            return item;
          }
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
    triggerStockUpdateBadge();
  };

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calcul dynamique des frais de livraison basé sur la zone (avec override admin)
  const defaultDeliveryCost = deliveryMethod === 'delivery' 
    ? selectedZoneId 
      ? (deliveryZones.find(z => z.id === selectedZoneId)?.price || 0) 
      : 0
    : 0;

  const deliveryCost = customDeliveryCost !== '' ? customDeliveryCost : defaultDeliveryCost;

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);

  const promoDiscountAmount = appliedPromo 
    ? (appliedPromo.type === 'percentage' ? (subTotal * appliedPromo.discount / 100) : appliedPromo.discount)
    : 0;
  const manualDiscountAmount = manualDiscountPct !== '' ? (subTotal * Number(manualDiscountPct) / 100) : 0;
  const loyaltyDiscountAmount = useLoyaltyPoints 
    ? Math.min(currentCustomerPoints * 10, subTotal - promoDiscountAmount - manualDiscountAmount) // 1 point = 10 FCFA
    : 0;
  const cartTotal = Math.max(0, subTotal - promoDiscountAmount - manualDiscountAmount - loyaltyDiscountAmount + deliveryCost);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const lowStockProducts = products.filter(p => (p.stock || 0) < 5);
  
  const isShopOpen = () => {
    if (!shopInfo.openingHours?.enabled) return true;
    const now = new Date();
    const currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return currentTime >= shopInfo.openingHours.start && currentTime <= shopInfo.openingHours.end;
  };

  const handleApplyPromo = () => {
    const code = promoCodes.find(c => c.code === promoInput.toUpperCase() && c.active);
    if (code) {
      if (code.expirationDate) {
        const expDate = new Date(code.expirationDate);
        expDate.setHours(23, 59, 59, 999); // Valide jusqu'à la fin de la journée
        if (expDate < new Date()) {
          alert("Désolé, ce code promotionnel a expiré.");
          setAppliedPromo(null);
          return;
        }
      }
      if (code.minPurchase && subTotal < code.minPurchase) {
        const missingAmount = code.minPurchase - subTotal;
        alert(`Le montant minimum d'achat pour utiliser ce code est de ${displayPrice(code.minPurchase, shopInfo.currency)}.\n\nIl vous manque ${displayPrice(missingAmount, shopInfo.currency)} pour en profiter ! Ajoutez quelques articles à votre panier.`);
        setAppliedPromo(null);
        return;
      }
      setAppliedPromo(code);
      alert("Code promo appliqué !");
    } else {
      alert("Code promo invalide ou inactif.");
      setAppliedPromo(null);
    }
    setPromoInput('');
  };

  useEffect(() => {
    const fetchCustomerPoints = async () => {
      if (isCheckoutModalOpen && customerInfo.phone) {
          let orders: any[] = [];
          const { data, error } = await supabase.from('orders').select('*').eq('customer_phone', customerInfo.phone);
          
          if (data && !error && data.length > 0) {
              orders = data.map(o => ({ total: o.total_amount, pointsUsed: o.points_used }));
          } else {
              const savedOrders = localStorage.getItem('onyx_jaay_orders');
              if (savedOrders) {
                  try {
                      const parsed = JSON.parse(savedOrders);
                      orders = parsed.filter((o: any) => o.customer?.phone === customerInfo.phone);
                  } catch (e) { }
              }
          }
          
          let points = 0;
          orders.forEach((order: any) => {
              points += Math.floor(order.total / 1000); // Gagne
              if (order.pointsUsed) points -= order.pointsUsed; // Dépense
          });
          setCurrentCustomerPoints(points);
      } else {
          setCurrentCustomerPoints(0);
      }
    };
    fetchCustomerPoints();
  }, [customerInfo.phone, isCheckoutModalOpen]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // --- HANDLERS ---
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== id));
      if (shopId) {
          await supabase.from('products').delete().eq('id', id);
      }
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    const tempId = Date.now();
    const duplicatedProduct = {
      ...product,
      id: tempId, // Nouvel identifiant unique temporaire
      name: `${product.name} (Copie)`,
      reviews: 0,
      reviewsList: [],
      rating: 5
    };
    setProducts(prev => [duplicatedProduct, ...prev]);

    if (shopId) {
        const payload = {
            shop_id: shopId,
            name: duplicatedProduct.name,
            price: duplicatedProduct.price,
            cost_price: duplicatedProduct.costPrice || 0,
            old_price: duplicatedProduct.oldPrice || null,
            description: duplicatedProduct.description,
            image: duplicatedProduct.image,
            gallery: duplicatedProduct.gallery || [],
            category: duplicatedProduct.category,
            stock: duplicatedProduct.stock,
            rating: duplicatedProduct.rating,
            reviews: duplicatedProduct.reviews,
            variants: duplicatedProduct.variants || { sizes: [], colors: [] },
            video_url: duplicatedProduct.videoUrl || null
        };
        const { data, error } = await supabase.from('products').insert([payload]).select().single();
        if (data && !error) {
            setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id } : p));
            setToastMessage(`Le produit "${product.name}" a été dupliqué !`);
            setTimeout(() => setToastMessage(null), 3000);
        } else if (error) {
            console.error("Erreur de duplication:", error);
            alert("Erreur lors de la duplication: " + error.message);
        }
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Voulez-vous vraiment supprimer ${bulkSelection.length} produit(s) ?`)) return;
    setProducts(prev => prev.filter(p => !bulkSelection.includes(p.id)));
    const idsToDelete = [...bulkSelection];
    setBulkSelection([]);
    setToastMessage(`${idsToDelete.length} produits supprimés !`);
    setTimeout(() => setToastMessage(null), 3000);

    if (shopId) {
        await supabase.from('products').delete().in('id', idsToDelete);
    }
  };

  const handleBulkDuplicate = async () => {
    if (!confirm(`Voulez-vous dupliquer ${bulkSelection.length} produit(s) ?`)) return;
    const productsToDuplicate = products.filter(p => bulkSelection.includes(p.id));
    
    const newProducts = productsToDuplicate.map((p, index) => ({
        ...p,
        id: Date.now() + index, // Temp ID
        name: `${p.name} (Copie)`,
        reviews: 0,
        reviewsList: [],
        rating: 5
    }));
    
    setProducts(prev => [...newProducts, ...prev]);
    setBulkSelection([]);
    setToastMessage(`${newProducts.length} produits dupliqués !`);
    setTimeout(() => setToastMessage(null), 3000);

    if (shopId) {
        const payloads = newProducts.map(dp => ({
            shop_id: shopId, name: dp.name, price: dp.price, cost_price: dp.costPrice || 0, old_price: dp.oldPrice || null,
            description: dp.description, image: dp.image, gallery: dp.gallery || [], category: dp.category, stock: dp.stock,
            barcode: dp.barcode || null, rating: dp.rating, reviews: dp.reviews, variants: dp.variants || { sizes: [], colors: [] }, video_url: dp.videoUrl || null
        }));
        const { data, error } = await supabase.from('products').insert(payloads).select();
        if (data && !error) {
            setProducts(prev => {
                const next = [...prev];
                data.forEach((realProd: any, idx: number) => {
                    const tempProd = newProducts[idx];
                    const indexToUpdate = next.findIndex(p => p.id === tempProd.id);
                    if (indexToUpdate !== -1) {
                        next[indexToUpdate].id = realProd.id;
                    }
                });
                return next;
            });
        }
    }
  };

  const handleSaveProduct = async (product: Product) => {
    const isEditing = !!editingProduct;
    setIsModalOpen(false);

    const payload = {
        shop_id: shopId,
        name: product.name,
        price: product.price,
        cost_price: product.costPrice || 0,
        old_price: product.oldPrice || null,
        description: product.description,
        image: product.image,
        gallery: product.gallery || [],
        category: product.category,
        stock: product.stock,
        barcode: product.barcode || null,
        rating: product.rating || 5,
        reviews: product.reviews || 0,
        variants: product.variants || { sizes: [], colors: [] },
        video_url: product.videoUrl || null
    };

    if (isEditing) {
        setProducts(products.map(p => p.id === product.id ? product : p));
        if (shopId) await supabase.from('products').update(payload).eq('id', product.id);
    } else {
        const tempId = Date.now();
        setProducts(prev => [{ ...product, id: tempId }, ...prev]);
        if (shopId) {
            const { data, error } = await supabase.from('products').insert([payload]).select().single();
            if (data && !error) {
                 setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id } : p));
            }
        }
    }
    
    if (product.category && !categories.includes(product.category)) {
      setCategories(prev => [...prev, product.category]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setFormData: any, formData: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const confirmOrder = async (skipWhatsApp: boolean = false) => {
    // Validation assouplie pour les commandes "Sur place"
    let finalName = skipWhatsApp && !customerInfo.name ? "Client en boutique" : customerInfo.name;
    let finalPhone = skipWhatsApp && !customerInfo.phone ? "Sur place" : customerInfo.phone;

    if (!skipWhatsApp) {
        if (!finalName || !finalPhone) {
            alert("Veuillez remplir le nom et le téléphone pour valider la commande en ligne.");
            return;
        }
        if (!validateSenegalPhone(finalPhone)) {
            alert("Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67 ou +221...).");
            return;
        }
        finalPhone = formatSenegalPhone(finalPhone);
    }

    if (deliveryMethod === 'delivery' && shopInfo.deliveryOptions?.delivery === false) return alert("La livraison n'est pas disponible actuellement.");
    if (deliveryMethod === 'pickup' && shopInfo.deliveryOptions?.pickup === false) return alert("Le retrait n'est pas disponible actuellement.");

    const pointsToUse = useLoyaltyPoints ? Math.floor(loyaltyDiscountAmount / 10) : 0;
    const trackingNumber = `CMD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Save order locally for history/clients
    const newOrder = {
        id: Date.now(),
        trackingNumber,
        date: new Date().toISOString(),
        customer: { ...customerInfo, name: finalName, phone: finalPhone, address: customerAddress, instructions: deliveryInstructions },
        items: cart,
        total: cartTotal, // This is the final total paid
        pointsUsed: pointsToUse,
        status: 'En attente',
        deliveryMethod: deliveryMethod,
        deliveryZone: selectedZone ? selectedZone.name : null,
        history: [{ status: 'En attente', date: new Date().toISOString(), user: 'Client (Web)' }]
    };
    const existingOrders = JSON.parse(localStorage.getItem('onyx_jaay_orders') || '[]');
    localStorage.setItem('onyx_jaay_orders', JSON.stringify([newOrder, ...existingOrders]));

    // --- 🚀 INTÉGRATION SUPABASE 🚀 ---
    try {
      const { error } = await supabase.from('orders').insert([{
        shop_id: shopId,
        customer_name: finalName,
        customer_phone: finalPhone,
        customer_address: customerAddress,
        delivery_instructions: deliveryInstructions,
        items: cart,
        total_amount: cartTotal,
        points_used: pointsToUse,
        status: 'En attente',
        delivery_method: deliveryMethod,
        delivery_zone: selectedZone ? selectedZone.name : null,
        tracking_number: trackingNumber,
        history: [{ status: 'En attente', date: new Date().toISOString(), user: 'Client (Web)' }]
      }]);
      if (error) {
        console.error("Erreur d'insertion Supabase:", error.message);
      } else {
        // 🚀 DÉCRÉMENTER LE STOCK EN TEMPS RÉEL (ADMIN)
        cart.forEach(async (item) => {
            if (item.stock !== undefined && item.stock > 0) {
                const newStock = Math.max(0, item.stock - item.quantity);
                await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
            }
        });

        // --- ALERTE EMAIL AUTO ADMIN ---
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: `🚨 Nouvelle Commande ${skipWhatsApp ? '(Boutique)' : ''} : ${trackingNumber} - ${displayPrice(cartTotal, shopInfo.currency)}`,
                    text: `Nouvelle commande de ${finalName} (${finalPhone}). Total: ${displayPrice(cartTotal, shopInfo.currency)}`,
                    html: `<h2>Nouvelle commande sur ${shopInfo.name} !</h2><p><b>Référence :</b> ${trackingNumber}</p><p><b>Client :</b> ${finalName} (${finalPhone})</p><p><b>Montant Total :</b> ${displayPrice(cartTotal, shopInfo.currency)}</p><h3>Détails :</h3><ul>${cart.map(i => `<li>${i.name} (x${i.quantity})</li>`).join('')}</ul>`
                })
            });
        } catch (e) {
            console.error("Erreur lors de l'envoi de l'alerte email :", e);
        }
        alert("Commande enregistrée avec succès !");
      }
    } catch (err) {
      console.error("Erreur réseau Supabase:", err);
    }

    const isReturningCustomer = orders.some(o => o.customer?.phone === finalPhone);
    let message = isReturningCustomer 
        ? `👋 Bonjour l'équipe ! C'est ${finalName}, je suis de retour pour une nouvelle commande :\n\n`
        : `👋 Bonjour ! Je suis un nouveau client (${finalName}). Je souhaite passer ma première commande :\n\n`;
        
    message += `📦 *Numéro de suivi :* ${trackingNumber}\n\n`;
    cart.forEach(item => {
      let variantInfo = "";
      if (item.selectedVariant) {
          const parts: string[] = [];
        if (item.selectedVariant.size) parts.push(`Taille: ${item.selectedVariant.size}`);
        if (item.selectedVariant.color) parts.push(`Couleur: ${item.selectedVariant.color}`);
        if (parts.length > 0) variantInfo = ` (${parts.join(', ')})`;
      }
      message += `- ${item.name}${variantInfo} (x${item.quantity}) : ${displayPrice(item.price * item.quantity, shopInfo.currency)}\n`;
    });
    message += `\nSous-total : ${displayPrice(subTotal, shopInfo.currency)}`;
    if (deliveryMethod === 'delivery') {
        message += `\nFrais de livraison : ${displayPrice(deliveryCost, shopInfo.currency)}`;
    }
    if (appliedPromo) {
        message += `\nRemise (${appliedPromo.code}) : -${displayPrice(promoDiscountAmount, shopInfo.currency)}`;
    }
    if (manualDiscountAmount > 0) {
        message += `\nRemise Exceptionnelle (${manualDiscountPct}%) : -${displayPrice(manualDiscountAmount, shopInfo.currency)}`;
    }
    if (useLoyaltyPoints && loyaltyDiscountAmount > 0) {
        message += `\nPoints Fidélité : -${displayPrice(loyaltyDiscountAmount, shopInfo.currency)}`;
    }
    message += `\nMode de livraison : ${deliveryMethod === 'delivery' ? 'Livraison à domicile' : 'Retrait en boutique'}`;
    if (deliveryMethod === 'delivery' && selectedZone) {
        message += `\n📍 Zone : ${selectedZone.name} (${selectedZone.quartiers[0]}...)`;
        if (customerAddress.trim()) {
            message += `\n🏠 Adresse : ${customerAddress.trim()}`;
        }
    }
    if (deliveryInstructions.trim()) {
        message += `\n📝 Instructions : ${deliveryInstructions.trim()}`;
    }
    message += `\n*Total à payer : ${displayPrice(cartTotal, shopInfo.currency)}*`;
    message += `\n\nMerci de confirmer la disponibilité.`;

    if (!skipWhatsApp) {
        const url = `https://wa.me/${shopInfo.phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
    setCart([]);
    setAppliedPromo(null);
    setDeliveryInstructions('');
    setUseLoyaltyPoints(false);
    setCustomerInfo({ name: '', phone: '' });
    setCustomDeliveryCost('');
    setManualDiscountPct('');
    setIsOrderSuccessOpen(true);
  };
  
  const handleAddReview = async (productId: number, review: Omit<Review, 'id' | 'date'>) => {
    try {
        const { data, error } = await supabase.from('reviews').insert([{
            shop_id: shopId,
            type: 'product',
            reference_id: String(productId),
            name: review.name,
            rating: review.rating,
            comment: review.comment
        }]).select().single();

        if (error) throw error;

        setProducts(prevProducts => prevProducts.map(p => {
            if (p.id === productId) {
                const newReview = { ...review, id: data?.id || Date.now(), date: new Date().toISOString().split('T')[0] };
                const updatedReviews = [...(p.reviewsList || []), newReview];
                const newRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
                return { ...p, reviewsList: updatedReviews, reviews: updatedReviews.length, rating: parseFloat(newRating.toFixed(1)) };
            }
            return p;
        }));
    } catch (err: any) {
        console.error("Erreur sauvegarde avis:", err);
        alert("Erreur lors de l'envoi de l'avis: " + (err.message || "Erreur inconnue."));
    }
  };

  const handleUpdateStock = (id: number, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, newStock) } : p));
  };

  const handleViewProduct = (product: Product) => {
    // Ajout pour les statistiques de vues
    setProductViews(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    
    const today = new Date().toISOString().split('T')[0];
    setViewHistory(prev => ({
        ...prev,
        [today]: (prev[today] || 0) + 1
    }));

    setViewingProduct(product);
  };

  const handleShareProduct = (product: Product) => {
    const text = `*${product.name}*\nPrix : ${product.price.toLocaleString('fr-SN')} FCFA\n\n${product.description}\n\nIntéressé(e) ?`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // --- DRAG & DROP LOGIC ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    const newProducts = [...products];
    const dragItemContent = newProducts[dragItem.current!];
    newProducts.splice(dragItem.current!, 1);
    newProducts.splice(dragOverItem.current!, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setProducts(newProducts);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportXLS = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nom': 'Ex: Robe de Soirée',
        'Prix': 15000,
        'Description': 'Ex: Une robe élégante pour les grandes occasions.',
        'Catégorie': 'Ex: Soirée',
        'Stock': 10,
        'Image': 'https://example.com/image.jpg',
        'Tailles': 'S, M, L',
        'Couleurs': 'Rouge, Noir'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 30 }, // Nom
      { wch: 15 }, // Prix
      { wch: 50 }, // Description
      { wch: 20 }, // Catégorie
      { wch: 10 }, // Stock
      { wch: 40 }, // Image
      { wch: 20 }, // Tailles
      { wch: 20 }, // Couleurs
    ];

    XLSX.writeFile(workbook, "modele_import_produits_onyx.xlsx");
  };

  const handleExportProducts = () => {
    const exportData = products.map(p => ({
      'Nom': p.name,
      'Prix': p.price,
      'Description': p.description,
      'Catégorie': p.category,
      'Stock': p.stock || 0,
      'Image': p.image,
      'Tailles': p.variants?.sizes?.map((s: any) => typeof s === 'string' ? s : s.name).join(', ') || '',
      'Couleurs': p.variants?.colors?.map((c: any) => typeof c === 'string' ? c : c.name).join(', ') || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");

    XLSX.writeFile(workbook, `onyx_produits_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert("Le fichier est vide.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Validation des colonnes obligatoires
      const firstRow = jsonData[0] as any;
      const requiredCols = ['Nom', 'Prix'];
      const missingCols = requiredCols.filter(col => !Object.keys(firstRow).some(k => k.toLowerCase() === col.toLowerCase() || (col === 'Nom' && k.toLowerCase() === 'name') || (col === 'Prix' && k.toLowerCase() === 'price')));

      if (missingCols.length > 0) {
         alert(`Erreur : Colonnes manquantes (${missingCols.join(', ')}). Veuillez utiliser le modèle.`);
         if (fileInputRef.current) fileInputRef.current.value = '';
         return;
      }

      const newProducts: Product[] = jsonData.map((row: any, index: number) => ({
        id: Date.now() + index,
        name: row['Nom'] || row['name'] || 'Produit Importé',
        price: Number(row['Prix'] || row['price'] || 0),
        description: row['Description'] || row['description'] || '',
        image: row['Image'] || row['image'] || 'https://via.placeholder.com/300',
        category: row['Catégorie'] || row['category'] || 'Importé',
        stock: Number(row['Stock'] || row['stock'] || 0),
        rating: 5,
        reviews: 0,
        reviewsList: [],
        variants: {
            sizes: (row['Tailles'] || row['sizes'] || '').toString().split(',').map((s: string) => ({ name: s.trim(), priceModifier: 0 })).filter((v: any) => v.name),
            colors: (row['Couleurs'] || row['colors'] || '').toString().split(',').map((s: string) => ({ name: s.trim(), priceModifier: 0 })).filter((v: any) => v.name)
        }
      }));

      setProducts(prev => [...prev, ...newProducts]);
      
      const newCats = new Set(categories);
      newProducts.forEach(p => { if(p.category) newCats.add(p.category); });
      setCategories(Array.from(newCats));

      alert(`${newProducts.length} produits importés avec succès !`);
    } catch (error) {
      console.error("Erreur import XLS:", error);
      alert("Erreur lors de l'importation. Assurez-vous d'avoir un fichier Excel valide.");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim() !== '') {
        if (shopView !== 'boutique') setShopView('boutique');
        if (activeCategory !== 'Toutes') setActiveCategory('Toutes');
    }
  };

  const handleExportAllData = () => {
    const workbook = XLSX.utils.book_new();

    // Produits
    const productsSheet = XLSX.utils.json_to_sheet(products.map(p => ({
      ID: p.id,
      Nom: p.name,
      Prix: p.price,
      Catégorie: p.category,
      Stock: p.stock,
      Description: p.description
    })));
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Produits");

    // Commandes
    const savedOrders = localStorage.getItem('onyx_jaay_orders');
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        const ordersData = orders.map((o: any) => ({
          ID: o.id,
          Date: new Date(o.date).toLocaleDateString(),
          Client: o.customer?.name,
          Téléphone: o.customer?.phone,
          Total: o.total,
          Statut: o.status,
          Articles: o.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(', ') || ''
        }));
        const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(workbook, ordersSheet, "Commandes");
      } catch (e) { console.error("Erreur export commandes", e); }
    }

    XLSX.writeFile(workbook, `onyx_backup_complet_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleResetData = () => {
    if (confirm("⚠️ ATTENTION ⚠️\n\nVous êtes sur le point de supprimer TOUTES les données de démonstration (commandes, clients, panier, favoris, etc.) et de réinitialiser la boutique à son état d'origine.\n\nCette action est irréversible. Continuer ?")) {
      if (confirm("Êtes-vous vraiment certain de vouloir tout effacer ? Cette opération est définitive.")) {
        if (confirm("Voulez-vous télécharger une sauvegarde de vos données avant la réinitialisation ?")) {
          handleExportAllData();
        }
        
        setTimeout(() => {
          // Clear localStorage
          localStorage.removeItem('onyx_jaay_orders');
          localStorage.removeItem('onyx_jaay_cart');
          localStorage.removeItem('onyx_jaay_wishlist');
          localStorage.removeItem('onyx_jaay_shop_info');
          localStorage.removeItem('onyx_jaay_zones');
          localStorage.removeItem('onyx_jaay_views');
          localStorage.removeItem('onyx_jaay_view_history');

          alert("Données de démo réinitialisées. La page va maintenant se recharger pour appliquer les changements.");
          window.location.reload();
        }, 1000);
      }
    }
  };

  const handleClearOrders = () => {
    if (confirm("Confirmer la suppression de TOUT l'historique des commandes pour cette boutique ?\nLes produits et autres paramètres seront conservés.")) {
        if (shopId) {
            supabase.from('orders').delete().eq('shop_id', shopId).then(() => {
                alert("Historique des commandes effacé.");
                window.location.reload();
            });
        }
    }
  };

  const handleGenerateDemo = async () => {
      if (!shopId) return;
      if (confirm("Voulez-vous générer 40 produits de démonstration (Images, Prix, Variants, Vidéos) ?\nCela s'ajoutera à votre catalogue actuel.")) {
          const seedData = initialProducts.map(p => ({
              shop_id: shopId, name: p.name, price: p.price, cost_price: p.costPrice || 0, old_price: p.oldPrice || null,
              description: p.description, image: p.image, gallery: p.gallery || [], category: p.category,
              stock: p.stock, rating: p.rating, reviews: p.reviews, variants: p.variants || { sizes: [], colors: [] }, video_url: p.videoUrl || null
          }));
          const { error } = await supabase.from('products').insert(seedData);
          if (!error) {
              alert("40 Produits générés avec succès ! La page va se recharger.");
              window.location.reload();
          } else {
              console.error("Supabase Generate Error:", error);
              alert("Erreur lors de la génération : " + error.message);
          }
      }
  };

  const handleClearCatalog = async () => {
    if (confirm("⚠️ ATTENTION : Voulez-vous vraiment supprimer TOUS les produits de votre catalogue ? Cette action est définitive.")) {
        if (shopId) {
            const { error } = await supabase.from('products').delete().eq('shop_id', shopId);
            if (!error) {
                localStorage.setItem(`onyx_demo_seeded_${shopId}`, 'true');
                setProducts([]);
                alert("Catalogue vidé avec succès. Vous pouvez maintenant ajouter vos vrais produits !");
            } else {
                alert("Erreur lors de la suppression : " + error.message);
            }
        }
    }
  };

  const handleSeedDatabase = async () => {
      if (!confirm("Générer 40 produits IA dans la base Supabase pour cette boutique ?")) return;

      const { data: shop, error: fetchError } = await supabase.from('shops').select('id').eq('slug', 'keur-yaay').single();
      if (!shop || fetchError) { alert('Boutique Keur Yaay introuvable dans Supabase.'); return; }

      const categoriesList = ['Homme', 'Femme', 'Enfant', 'Sport', 'Accessoires'];
      const typesList = ['Chemise', 'Pantalon', 'Robe', 'Baskets', 'Sac', 'Montre', 'Ensemble'];
      
      const productsArray = Array.from({ length: 40 }).map((_, i) => {
          const cat = categoriesList[i % categoriesList.length];
          const type = typesList[i % typesList.length];
          
          const basePrice = Math.floor((Math.random() * (45000 - 5000 + 1) + 5000) / 100) * 100;
          const isPromo = Math.random() > 0.7;
          const price = isPromo ? Math.floor(basePrice * 0.8) : basePrice;

          return {
              shop_id: shop.id,
              name: `${type} Premium ${cat} ${i + 1}`,
              price: price,
              old_price: isPromo ? basePrice : null,
              cost_price: Math.floor(price * 0.4), // 40% du prix
              description: `Un article incontournable de la collection ${cat}. Confort et style garantis au quotidien.`,
              category: cat,
              image: `https://placehold.co/600x800/1a1a1a/39FF14?text=${type}+${cat}`,
              stock: Math.floor(Math.random() * 46) + 5, // Entre 5 et 50
              gallery: [],
              rating: 5,
              reviews: 0,
              variants: { sizes: ['S', 'M', 'L'], colors: ['Noir', 'Standard'] }
          };
      });

      const { error } = await supabase.from('products').insert(productsArray);
      if (error) {
          alert("Erreur lors de la génération: " + error.message);
      } else {
          alert("✅ 40 produits générés avec succès !");
          window.location.reload();
      }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracking(true);
    setTrackedOrder(null);
    
    // Nettoie les espaces accidentels avant ou après le code
    const cleanTrackingInput = trackingInput.trim(); 
    
    try {
        // Permet la recherche par numéro de suivi ou numéro de téléphone
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .or(`tracking_number.eq.${cleanTrackingInput},customer_phone.ilike.%${cleanTrackingInput}%`)
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (data && data.length > 0 && !error) {
            setTrackedOrder(data[0]);
        } else {
            const savedOrders = JSON.parse(localStorage.getItem('onyx_jaay_orders') || '[]');
            const localOrder = savedOrders.find((o: any) => 
                o.trackingNumber === cleanTrackingInput || 
                o.tracking_number === cleanTrackingInput ||
                (o.customer?.phone && o.customer.phone.includes(cleanTrackingInput)) ||
                (o.customer_phone && o.customer_phone.includes(cleanTrackingInput))
            );
            if (localOrder) {
                setTrackedOrder(localOrder);
            } else {
                alert("Aucune commande trouvée avec cet identifiant ou numéro de téléphone.");
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsTracking(false);
    }
  };

  const runIaScanGeneral = () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const suggestions: any[] = [];
      const plannedPhoneNumbers = new Set(plannedEvents.map(e => e.clientPhone));
      
      const uniqueClients: any = {};
      orders.forEach((order: any) => {
          if (order.customer && order.customer.phone && order.status !== 'Annulé') {
              if (!uniqueClients[order.customer.phone]) uniqueClients[order.customer.phone] = { ...order.customer, totalSpent: 0, ordersCount: 0, lastOrder: order.date || new Date().toISOString() };
              uniqueClients[order.customer.phone].ordersCount += 1;
              uniqueClients[order.customer.phone].totalSpent += order.total;
              if (new Date(order.date) > new Date(uniqueClients[order.customer.phone].lastOrder)) uniqueClients[order.customer.phone].lastOrder = order.date;
          }
      });

      Object.values(uniqueClients).forEach((contact: any) => {
          if (plannedPhoneNumbers.has(contact.phone)) return;
          const totalSpent = contact.totalSpent || 0;
          const ordersCount = contact.ordersCount || 0;
          const lastOrder = contact.lastOrder ? new Date(contact.lastOrder) : null;

          if (totalSpent > 100000 || ordersCount > 3) {
              suggestions.push({ id: `ia-vip-${contact.phone}`, clientName: contact.name, clientPhone: contact.phone, type: 'vip', title: `Action VIP pour ${contact.name}`, description: 'Client fidèle. Proposer une offre exclusive ou un accès anticipé.', msg: `⭐ Bonjour ${contact.name}, en tant que client VIP chez ${shopInfo.name}, nous vous offrons un accès anticipé à notre nouvelle collection ! Ne ratez pas ça.` });
          } else if (lastOrder && lastOrder < thirtyDaysAgo) {
              suggestions.push({ id: `ia-inactive-${contact.phone}`, clientName: contact.name, clientPhone: contact.phone, type: 'inactive', title: `Réactivation de ${contact.name}`, description: 'Client inactif depuis plus de 30 jours.', msg: `😢 Bonjour ${contact.name}, vous nous manquez chez ${shopInfo.name} ! Profitez de -10% sur votre prochaine commande. Offre limitée !` });
          }
      });

      setIaSuggestions(suggestions);
      if (suggestions.length > 0) {
          setShopView('planning');
          alert(`${suggestions.length} nouvelle(s) action(s) marketing suggérée(s) par l'IA.`);
      } else {
          alert("Scan IA terminé. Aucune nouvelle opportunité détectée pour le moment.");
      }
  };

  const filteredProducts = (products || []).filter(p => {
    if (!p) return false;
    const search = (searchTerm || '').toLowerCase().trim();
    const nameMatch = p.name ? String(p.name).toLowerCase().includes(search) : false;
    const descMatch = p.description ? String(p.description).toLowerCase().includes(search) : false;
    const catMatch = p.category ? String(p.category).toLowerCase().includes(search) : false;
    const matchesSearch = search === '' || nameMatch || descMatch || catMatch;

    const matchesCategory = activeCategory === 'Toutes' || (activeCategory === 'Favoris' ? wishlist.includes(p.id) : (p.category === activeCategory || (p.category && p.category.startsWith(activeCategory + ' / '))));
    const matchesMinPrice = minPrice === '' || (p.price || 0) >= Number(minPrice);
    const matchesMaxPrice = maxPrice === '' || (p.price || 0) <= Number(maxPrice);

    const matchesColor = activeColor.length === 0 || (p.variants?.colors && Array.isArray(p.variants.colors) && p.variants.colors.some((c: any) => activeColor.includes(c.name || c)));
    const matchesSize = activeSize.length === 0 || (p.variants?.sizes && Array.isArray(p.variants.sizes) && p.variants.sizes.some((s: any) => activeSize.includes(s.name || s)));

    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesSearch && matchesColor && matchesSize;
  }).sort((a, b) => {
    if (sortOrder === 'asc') return (a.price || 0) - (b.price || 0);
    if (sortOrder === 'desc') return (b.price || 0) - (a.price || 0);
    return (b.id || 0) - (a.id || 0);
  });

  const visibleCategories = categories.filter(cat => cat === 'Toutes' || cat === 'Favoris' || !shopInfo?.categoryCovers?.['__hidden_' + cat]);
  const sidebarCategories = isEditingMode ? categories : visibleCategories;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-16 h-16 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#39FF14]"></div>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden print:block">
      
      {/* --- MOBILE SIDEBAR --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative bg-zinc-50 dark:bg-zinc-950 w-72 h-full shadow-2xl flex flex-col border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-300">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h1 className="text-2xl font-black tracking-tighter uppercase">{shopInfo.name}</h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="px-4 mb-6">
                <button onClick={() => window.open(`/${shopInfo.slug || 'keur-yaay'}`, '_blank')} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black transition bg-[#39FF14] text-black hover:bg-white shadow-[0_0_20px_rgba(57,255,20,0.3)] mb-6 uppercase text-xs">
                  <ExternalLink size={16} /> Voir ma boutique
                </button>
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={searchTerm}
                    onChange={handleGlobalSearch}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-black dark:text-white outline-none focus:border-[#39FF14] transition"
                  />
                  <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-zinc-400 mt-5" />
                  {searchTerm && shopView === 'boutique' && (
                    <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[60vh]">
                      <div className="overflow-y-auto custom-scrollbar">
                      {filteredProducts.slice(0, 5).map(p => (
                         <div key={p.id} onClick={() => { handleViewProduct(p); setSearchTerm(''); setIsMobileMenuOpen(false); }} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors">
                            <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-black dark:text-white truncate">{p.name}</p>
                               <p className="text-[10px] text-[#39FF14] font-black mt-0.5">{displayPrice(p.price, shopInfo?.currency)}</p>
                            </div>
                         </div>
                      ))}
                      </div>
                      {filteredProducts.length > 5 && (
                         <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center text-[10px] font-black uppercase text-zinc-500 bg-zinc-50 dark:bg-zinc-950 hover:text-[#39FF14] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-200 dark:border-zinc-800 w-full">
                            Voir les {filteredProducts.length} résultats
                         </button>
                      )}
                      {filteredProducts.length === 0 && <div className="p-4 text-center text-xs text-zinc-500 font-medium">Aucun résultat</div>}
                    </div>
                  )}
                </div>
                <nav className="px-4 space-y-2 mb-8">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
                  {isEditingMode && (
                      <>
                          <button onClick={() => { setShopView('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'dashboard' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                            <LayoutDashboard size={18} className={shopView === 'dashboard' ? "text-[#39FF14]" : ""} /> Tableau de bord
                          </button>
                          <button onClick={() => { setShopView('clients'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'clients' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                            <Users size={18} className={shopView === 'clients' ? "text-[#39FF14]" : ""} /> Clients
                          </button>
                          <button onClick={() => { setShopView('planning'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'planning' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                            <Calendar size={18} className={shopView === 'planning' ? "text-[#39FF14]" : ""} /> Planning Marketing
                          </button>
                          <button onClick={() => { setShopView('reviews'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'reviews' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                            <Star size={18} className={shopView === 'reviews' ? "text-[#39FF14]" : ""} /> Avis Clients
                          </button>
                          <button onClick={() => window.location.href = '/tiak'} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white`}>
                            <Truck size={18} /> Onyx Tiak (Logistique)
                          </button>
                      <button onClick={() => window.location.href = '/stock'} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white`}>
                        <Box size={18} /> Onyx Stock
                      </button>
                      </>
                  )}
                  <button onClick={() => { setShopView('boutique'); setIsMobileMenuOpen(false); setSearchTerm(''); setActiveCategory('Toutes'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'boutique' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                    <Store size={18} className={shopView === 'boutique' ? "text-[#39FF14]" : ""} /> {isEditingMode ? 'Ma Boutique' : 'Accueil'}
                  </button>
                  {isEditingMode && (
                      <>
                          <button onClick={() => { setShopView('settings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'settings' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                            <Settings size={18} className={shopView === 'settings' ? "text-[#39FF14]" : ""} /> Paramètres
                          </button>
                          <button onClick={() => { setShopView('page-builder'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'page-builder' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                            <LayoutTemplate size={18} className={shopView === 'page-builder' ? "text-[#39FF14]" : ""} /> Mettre à jour mon site
                          </button>
                      </>
                  )}
                  <button onClick={() => { setIsTrackingModalOpen(true); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white`}>
                    <Package size={18} /> Suivi Commande
                  </button>
                  {isEditingMode && (
                      <>
                          <button onClick={() => window.location.href = '/dashboard'} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white`}>
                            <Home size={18} /> Retour au Hub
                          </button>
                          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-red-500 hover:bg-red-500/10`}>
                            <LogOut size={18} /> Se déconnecter
                          </button>
                      </>
                  )}
                </nav>
                <div className="px-4 space-y-1">
                  <div className="flex items-center justify-between px-4 mb-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Catégories</p>
                    {isEditingMode && (
                        <button onClick={() => { setShopView('settings'); setIsMobileMenuOpen(false); }} className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 hover:text-black dark:hover:text-white transition flex items-center gap-1">
                            <Settings size={10} /> Gérer
                        </button>
                    )}
                  </div>
                  {sidebarCategories.map(cat => (
                    <div key={cat} className="group relative flex items-center w-full">
                      <button 
                        onClick={() => { setActiveCategory(cat); setShopView('boutique'); setIsMobileMenuOpen(false); }} 
                        className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition ${cat.includes(' / ') ? 'pl-8 text-xs' : 'text-sm'} ${
                          activeCategory === cat 
                            ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' 
                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                        } ${shopInfo?.categoryCovers?.['__hidden_' + cat] ? 'opacity-50 line-through' : ''}`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {cat === 'Favoris' && <Heart size={14} />}
                          {cat.includes(' / ') ? `↳ ${cat.split(' / ').slice(1).join(' / ')}` : cat}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full leading-none font-bold ${cat === 'Favoris' ? (wishlist.length > 0 ? 'bg-red-500 text-white' : 'hidden') : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                             {getCategoryCount(cat)}
                          </span>
                          {shopInfo?.categoryCovers?.['__hidden_' + cat] && <EyeOff size={12} className="text-zinc-500" />}
                          {shopInfo?.categoryCovers?.['__new_' + cat] && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full leading-none font-black uppercase tracking-widest shrink-0 mt-0.5">Nouveau</span>}
                        </span>
                        {activeCategory === cat && <ChevronRight size={14} />}
                      </button>
                      {isEditingMode && cat !== 'Toutes' && cat !== 'Favoris' && (
                          <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg">
                              <button onClick={(e) => { e.stopPropagation(); toggleSidebarCategoryVisibility(cat); }} title="Masquer/Afficher" className="p-1.5 hover:text-orange-500 text-zinc-500 transition-colors">
                                  {shopInfo?.categoryCovers?.['__hidden_' + cat] ? <EyeOff size={14}/> : <Eye size={14}/>}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleSidebarDeleteCategory(cat); }} title="Supprimer" className="p-1.5 hover:text-red-500 text-zinc-500 transition-colors">
                                  <Trash2 size={14}/>
                              </button>
                          </div>
                      )}
                    </div>
                  ))}
                </div>

                {availableColors.length > 0 && (
                  <div className="px-4 space-y-2 mt-6">
                    <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between gap-2">
                      Couleurs
                      {activeColor.length > 0 && <button onClick={() => setActiveColor([])} className="text-red-500 hover:text-red-600 transition"><X size={14}/></button>}
                    </p>
                    <div className="flex flex-wrap gap-2 px-4">
                      {availableColors.map(color => (
                        <button key={color} onClick={() => { setActiveColor(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]); setShopView('boutique'); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeColor.includes(color) ? 'bg-black text-[#39FF14] border-black dark:bg-white dark:text-black dark:border-white' : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'}`}>{color}</button>
                      ))}
                    </div>
                  </div>
                )}

                {availableSizes.length > 0 && (
                  <div className="px-4 space-y-2 mt-6">
                    <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between gap-2">
                      Tailles
                      {activeSize.length > 0 && <button onClick={() => setActiveSize([])} className="text-red-500 hover:text-red-600 transition"><X size={14}/></button>}
                    </p>
                    <div className="flex flex-wrap gap-2 px-4">
                      {availableSizes.map(size => (
                        <button key={size} onClick={() => { setActiveSize(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]); setShopView('boutique'); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeSize.includes(size) ? 'bg-black text-[#39FF14] border-black dark:bg-white dark:text-black dark:border-white' : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'}`}>{size}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="px-4 space-y-2 mt-6">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Filter size={12}/> Prix (FCFA)
                  </p>
                  <div className="px-4 flex gap-2">
                    <input 
                      type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14] transition"
                    />
                    <input 
                      type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14] transition"
                    />
                  </div>
                  <div className="px-4 mt-2 flex gap-2">
                    <button 
                        onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')} 
                        className={`flex-1 p-2 rounded-xl text-xs font-bold border ${sortOrder === 'asc' ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}
                    >
                        <ArrowUp size={12} className="inline mr-1"/> Prix
                    </button>
                    <button 
                        onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')}
                        className={`flex-1 p-2 rounded-xl text-xs font-bold border ${sortOrder === 'desc' ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}
                    >
                        <ArrowDown size={12} className="inline mr-1"/> Prix
                    </button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex-col hidden md:flex print:hidden transition-all duration-300 z-30 ${isSidebarCollapsed ? 'w-24 items-center' : 'w-64'}`}>
        <div className={`p-6 border-b border-zinc-200 dark:border-zinc-800 h-20 flex items-center justify-between w-full ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
          {!isSidebarCollapsed && (
            shopInfo.logoUrl ? (
              <img src={shopInfo.logoUrl} alt={shopInfo.name} className="h-10 w-auto object-contain" />
            ) : (
              <h1 className="text-2xl font-black tracking-tighter uppercase truncate">{shopInfo.name}</h1>
            )
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-[#39FF14] hover:text-black transition ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
             {isSidebarCollapsed ? <Menu size={18}/> : <ChevronRight size={18} className="rotate-180" />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 w-full overflow-x-hidden custom-scrollbar">
          <div className="px-4 mb-6">
            {!isSidebarCollapsed ? (
               <>
                  {isEditingMode && (
                      <button onClick={() => window.open(`/${shopInfo.slug || 'keur-yaay'}`, '_blank')} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black transition bg-[#39FF14] text-black hover:bg-white shadow-[0_0_20px_rgba(57,255,20,0.3)] mb-6 uppercase text-xs">
                        <ExternalLink size={16} /> Voir ma boutique
                      </button>
                  )}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher un produit..." 
                      value={searchTerm}
                      onChange={handleGlobalSearch}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-black dark:text-white outline-none focus:border-[#39FF14] transition"
                    />
                    {searchTerm && shopView === 'boutique' && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[60vh]">
                        <div className="overflow-y-auto custom-scrollbar">
                        {filteredProducts.slice(0, 5).map(p => (
                           <div key={p.id} onClick={() => { handleViewProduct(p); setSearchTerm(''); }} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors">
                              <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-bold text-black dark:text-white truncate">{p.name}</p>
                                 <p className="text-[10px] text-[#39FF14] font-black mt-0.5">{displayPrice(p.price, shopInfo?.currency)}</p>
                              </div>
                           </div>
                        ))}
                        </div>
                        {filteredProducts.length > 5 && (
                           <button className="w-full p-3 text-center text-[10px] font-black uppercase text-zinc-500 bg-zinc-50 dark:bg-zinc-950 hover:text-[#39FF14] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-200 dark:border-zinc-800">
                              Voir les {filteredProducts.length} résultats
                           </button>
                        )}
                        {filteredProducts.length === 0 && <div className="p-4 text-center text-xs text-zinc-500 font-medium">Aucun résultat</div>}
                      </div>
                    )}
                  </div>
               </>
            ) : (
               <div className="flex flex-col gap-4 items-center">
                  {isEditingMode && <button onClick={() => window.open(`/${shopInfo.slug || 'keur-yaay'}`, '_blank')} title="Voir ma boutique" className="p-3 bg-[#39FF14] text-black rounded-xl hover:bg-white shadow-lg"><ExternalLink size={18}/></button>}
                  <button onClick={() => setIsSidebarCollapsed(false)} title="Rechercher" className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-xl hover:text-[#39FF14]"><Search size={18}/></button>
               </div>
            )}
          </div>

          <nav className="px-4 space-y-2 mb-8">
            {!isSidebarCollapsed && <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>}
            {isEditingMode && (
                <>
                    <button onClick={() => setShopView('dashboard')} title="Tableau de bord" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'dashboard' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <LayoutDashboard size={18} className={shopView === 'dashboard' ? "text-[#39FF14]" : ""} /> {!isSidebarCollapsed && 'Tableau de bord'}
                    </button>
                    <button onClick={() => setShopView('clients')} title="Clients" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'clients' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <Users size={18} className={shopView === 'clients' ? "text-[#39FF14]" : ""} /> {!isSidebarCollapsed && 'Clients'}
                    </button>
                    <button onClick={() => setShopView('planning')} title="Planning Marketing" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'planning' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <Calendar size={18} className={shopView === 'planning' ? "text-[#39FF14]" : ""} /> {!isSidebarCollapsed && 'Planning Marketing'}
                    </button>
                    <button onClick={() => setShopView('reviews')} title="Avis Clients" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'reviews' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <Star size={18} className={shopView === 'reviews' ? "text-[#39FF14]" : ""} /> {!isSidebarCollapsed && 'Avis Clients'}
                    </button>
                    <button onClick={() => window.location.href = '/tiak'} title="Onyx Tiak (Logistique)" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <Truck size={18} /> {!isSidebarCollapsed && 'Onyx Tiak'}
                    </button>
                    <button onClick={() => window.location.href = '/stock'} title="Onyx Stock" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <Box size={18} /> {!isSidebarCollapsed && 'Onyx Stock'}
                    </button>
                </>
            )}
            <button onClick={() => { setShopView('boutique'); setSearchTerm(''); setActiveCategory('Toutes'); }} title={isEditingMode ? 'Ma Boutique' : 'Accueil'} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'boutique' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <Store size={18} className={shopView === 'boutique' ? "text-[#39FF14]" : ""} /> {!isSidebarCollapsed && (isEditingMode ? 'Ma Boutique' : 'Accueil')}
            </button>
            {isEditingMode && (
                <>
                    <button onClick={() => setShopView('settings')} title="Paramètres" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'settings' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <Settings size={18} className={shopView === 'settings' ? "text-[#39FF14]" : ""} /> {!isSidebarCollapsed && 'Paramètres'}
                    </button>
                    <button onClick={() => setShopView('page-builder')} title="Mettre à jour mon site" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'page-builder' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <LayoutTemplate size={18} className={shopView === 'page-builder' ? "text-[#39FF14]" : ""} /> {!isSidebarCollapsed && 'Mettre à jour mon site'}
                    </button>
                </>
            )}
            <button onClick={() => setIsTrackingModalOpen(true)} title="Suivi Commande" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <Package size={18} /> {!isSidebarCollapsed && 'Suivi Commande'}
            </button>
            {isEditingMode && (
                <>
                    <button onClick={() => window.location.href = '/dashboard'} title="Retour au Hub" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <Home size={18} /> {!isSidebarCollapsed && 'Retour au Hub'}
                    </button>
                    <button onClick={handleLogout} title="Se déconnecter" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-red-500 hover:bg-red-500/10 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                      <LogOut size={18} /> {!isSidebarCollapsed && 'Se déconnecter'}
                    </button>
                </>
            )}
          </nav>

          <div className={`px-4 space-y-1 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            <div className="flex items-center justify-between px-4 mb-2">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Catégories</p>
              {isEditingMode && (
                <button onClick={() => setShopView('settings')} className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 hover:text-black dark:hover:text-white transition flex items-center gap-1">
                  <Settings size={10} /> Gérer
                </button>
              )}
            </div>
            <DndContext sensors={categorySensors} onDragEnd={handleCategoryDragEnd} collisionDetection={closestCenter}>
              <SortableContext items={sidebarCategories} strategy={verticalListSortingStrategy}>
                {sidebarCategories.map(cat => (
                  <SortableSidebarCategoryItem key={cat} id={cat} isEditingMode={isEditingMode}>
                    <button 
                      onClick={() => { setActiveCategory(cat); setShopView('boutique'); }}
                      className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition ${cat.includes(' / ') ? 'pl-8 text-xs' : 'text-sm'} ${
                        activeCategory === cat 
                          ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' 
                          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                      } ${shopInfo?.categoryCovers?.['__hidden_' + cat] ? 'opacity-50 line-through' : ''} ${isEditingMode && cat !== 'Toutes' && cat !== 'Favoris' ? 'pl-7' : ''}`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {cat === 'Favoris' && <Heart size={14} />}
                        {cat.includes(' / ') ? `↳ ${cat.split(' / ').slice(1).join(' / ')}` : cat}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full leading-none font-bold ${cat === 'Favoris' ? (wishlist.length > 0 ? 'bg-red-500 text-white' : 'hidden') : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                           {getCategoryCount(cat)}
                        </span>
                        {shopInfo?.categoryCovers?.['__hidden_' + cat] && <EyeOff size={12} className="text-zinc-500" />}
                        {shopInfo?.categoryCovers?.['__new_' + cat] && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full leading-none font-black uppercase tracking-widest shrink-0 mt-0.5">Nouveau</span>}
                      </span>
                      {activeCategory === cat && <ChevronRight size={14} />}
                    </button>
                    {isEditingMode && cat !== 'Toutes' && cat !== 'Favoris' && (
                        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg">
                            <button onClick={(e) => { e.stopPropagation(); toggleSidebarCategoryVisibility(cat); }} title="Masquer/Afficher" className="p-1.5 hover:text-orange-500 text-zinc-500 transition-colors">
                                {shopInfo?.categoryCovers?.['__hidden_' + cat] ? <EyeOff size={14}/> : <Eye size={14}/>}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); toggleSidebarCategoryBadge(cat); }} title="Badge Nouveau" className={`p-1.5 transition-colors ${shopInfo?.categoryCovers?.['__new_' + cat] ? 'text-red-500 hover:text-red-600' : 'text-zinc-500 hover:text-red-500'}`}>
                                <Tag size={14}/>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleSidebarRenameCategory(cat); }} title="Renommer" className="p-1.5 hover:text-blue-500 text-zinc-500 transition-colors">
                                <Edit size={14}/>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleSidebarDeleteCategory(cat); }} title="Supprimer" className="p-1.5 hover:text-red-500 text-zinc-500 transition-colors">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    )}
                  </SortableSidebarCategoryItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {availableColors.length > 0 && (
            <div className={`px-4 space-y-2 mt-6 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between gap-2">
                Couleurs
                {activeColor.length > 0 && <button onClick={() => setActiveColor([])} className="text-red-500 hover:text-red-600 transition"><X size={14}/></button>}
              </p>
              <div className="flex flex-wrap gap-2 px-4">
                {availableColors.map(color => (
                  <button key={color} onClick={() => setActiveColor(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeColor.includes(color) ? 'bg-black text-[#39FF14] border-black dark:bg-white dark:text-black dark:border-white' : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'}`}>{color}</button>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className={`px-4 space-y-2 mt-6 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between gap-2">
                Tailles
                {activeSize.length > 0 && <button onClick={() => setActiveSize([])} className="text-red-500 hover:text-red-600 transition"><X size={14}/></button>}
              </p>
              <div className="flex flex-wrap gap-2 px-4">
                {availableSizes.map(size => (
                  <button key={size} onClick={() => setActiveSize(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeSize.includes(size) ? 'bg-black text-[#39FF14] border-black dark:bg-white dark:text-black dark:border-white' : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'}`}>{size}</button>
                ))}
              </div>
            </div>
          )}

          <div className={`px-4 space-y-2 mt-6 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Filter size={12}/> Prix (FCFA)
            </p>
            <div className="px-4 flex gap-2">
              <input 
                type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14] transition"
              />
              <input 
                type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14] transition"
              />
            </div>
            <div className="px-4 mt-2 flex gap-2">
                <button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')} 
                    className={`flex-1 p-2 rounded-xl text-xs font-bold border ${sortOrder === 'asc' ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}
                >
                    <ArrowUp size={12} className="inline mr-1"/> Prix
                </button>
                <button 
                    onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')}
                    className={`flex-1 p-2 rounded-xl text-xs font-bold border ${sortOrder === 'desc' ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}
                >
                    <ArrowDown size={12} className="inline mr-1"/> Prix
                </button>
            </div>
          </div>
        </div>

        <div className={`p-6 border-t border-zinc-200 dark:border-zinc-800 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#39FF14] flex items-center justify-center text-black font-bold">
              OJ
            </div>
            <div>
              <p className="text-sm font-bold text-black dark:text-white">{shopInfo.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">{shopInfo.description}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto relative bg-zinc-100 dark:bg-black print:overflow-visible">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 print:hidden">
           <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-black dark:text-white"><Menu size={24}/></button>
              <h1 className="text-lg font-black tracking-tighter uppercase text-black dark:text-white">{shopInfo.name}</h1> 
           </div>
           <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-black dark:text-white">
              <ShoppingCart size={24} />
           {cartCount > 0 && <span className={`absolute top-0 right-0 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center transition-colors ${cartCount > 5 ? 'bg-red-500 text-white' : 'bg-[#39FF14] text-black'}`}>{cartCount}</span>}
           </button>
        </div>

        {/* Top Header Toggle */}
        <header className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none print:hidden">
          <div className="flex items-center gap-4 pointer-events-auto ml-auto">
          <button onClick={() => setIsCartOpen(true)} className="hidden md:flex items-center gap-2 bg-white/50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 transition backdrop-blur-md">
            <div className="relative">
              <ShoppingCart size={18} />
          {cartCount > 0 && <span className={`absolute -top-2 -right-2 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center transition-colors ${cartCount > 5 ? 'bg-red-500 text-white' : 'bg-[#39FF14] text-black'}`}>{cartCount}</span>}
            </div>
            <span className="text-xs font-bold uppercase">Panier</span>
          </button>

          <button onClick={() => setIsWishlistOpen(true)} className="hidden md:flex items-center gap-2 bg-white/50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 transition backdrop-blur-md">
            <div className="relative">
              <Heart size={18} />
              {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
            </div>
          </button>

          <button onClick={toggleTheme} className="p-2 rounded-full bg-white/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
            <Sun className="h-4 w-4 text-black dark:hidden" />
            <Moon className="h-4 w-4 text-white hidden dark:block" />
          </button>

          {isShopOwner && (
            <>
            <div className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 backdrop-blur-md mr-2 shadow-sm">
                <button className="p-2 bg-black dark:bg-white text-[#39FF14] dark:text-black rounded-full shadow-md transition-all" title="Onyx Jaay (Vente)"><ShoppingCart size={16}/></button>
                {checkAccess('stock', authUser) && <button onClick={() => window.location.href='/stock'} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors" title="Onyx Stock"><Box size={16}/></button>}
                {checkAccess('tiak', authUser) && <button onClick={() => window.location.href='/tiak'} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors" title="Onyx Tiak"><Truck size={16}/></button>}
                {checkAccess('formation', authUser) && <button onClick={() => window.location.href='/admin/saas/formation'} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors" title="Onyx Formation"><GraduationCap size={16}/></button>}
                {checkAccess('staff', authUser) && <button onClick={() => window.location.href='/staff'} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors" title="Onyx Staff"><Users size={16}/></button>}
            </div>
            <div className="relative">
              <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full bg-white/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md relative">
                <Bell size={16} className="text-black dark:text-white" />
                {(lowStockProducts.length > 0 || recentReviews.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-black">
                    {lowStockProducts.length + recentReviews.length}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 z-50 animate-in slide-in-from-top-2 cursor-default">
                  <h4 className="font-black uppercase text-xs mb-3 flex items-center gap-2 text-black dark:text-white"><AlertTriangle size={14} className="text-yellow-500"/> Alertes Stock</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {lowStockProducts.length === 0 ? <p className="text-xs text-zinc-500">Tout va bien.</p> : lowStockProducts.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <span className="font-bold truncate max-w-[140px] text-black dark:text-white">{p.name}</span>
                        <span className="text-red-500 font-black">{p.stock} restants</span>
                      </div>
                    ))}
                  </div>
                  {recentReviews.length > 0 && (
                     <>
                        <h4 className="font-black uppercase text-xs mb-3 flex items-center gap-2 text-black dark:text-white mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800"><Star size={14} className="text-[#39FF14] fill-[#39FF14]"/> Nouveaux Avis</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                           {recentReviews.map(r => (
                              <div key={r.id} onClick={() => { setShopView('reviews'); setIsNotificationsOpen(false); }} className="flex flex-col text-xs p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:border-[#39FF14] border border-transparent transition-colors">
                                 <span className="font-bold text-black dark:text-white flex justify-between"><span>{r.name}</span> <span className="text-yellow-500 flex items-center gap-1">{r.rating}<Star size={10} className="fill-yellow-500"/></span></span>
                                 <span className="text-zinc-500 truncate mt-1 italic">"{r.comment}"</span>
                              </div>
                           ))}
                        </div>
                     </>
                  )}
                </div>
              )}
            </div>

            <span className="text-xs font-bold uppercase ml-4 mr-2 text-black dark:text-white bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-zinc-200 dark:border-zinc-800">Mode Éditeur</span>
            <label htmlFor="editModeToggle" className="cursor-pointer">
              <div className={`w-14 h-8 rounded-full p-1 transition-colors border border-zinc-700 ${isEditingMode ? 'bg-[#39FF14]' : 'bg-zinc-800/80 backdrop-blur-md'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isEditingMode ? 'translate-x-6' : ''}`}></div>
              </div>
              <input type="checkbox" id="editModeToggle" className="hidden" checked={isEditingMode} onChange={() => setIsEditingMode(!isEditingMode)} />
            </label>
            </>
          )}
          </div>
        </header>

        {!isShopOpen() && !isEditingMode && (
            <div className="bg-red-500 text-white text-center py-2 px-4 font-bold text-sm sticky top-0 z-30 flex items-center justify-center gap-2">
                <Clock size={16} /> La boutique est actuellement fermée. (Ouverture : {shopInfo.openingHours?.start})
            </div>
        )}

        {shopView === 'boutique' && (
          <div className="p-8 md:p-12 pt-32 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
            <div className="flex-1">
            <div className="mb-12 print:hidden">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Catalogue <span className="text-[#39FF14]">Produits</span></h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mb-4">Gérez votre inventaire, modifiez vos prix et partagez vos produits directement sur WhatsApp.</p>
              {isEditingMode && (
                 <button onClick={handleSeedDatabase} className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-black uppercase text-xs hover:bg-red-600 transition shadow-lg flex items-center gap-2">
                    <Sparkles size={16} /> Générer 40 produits IA
                 </button>
              )}
            </div>

            {isEditingMode && (
              <div className="mb-8 flex flex-wrap gap-4">
                <button onClick={handleAddProduct} className="w-full sm:w-auto bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                  <Plus size={20} /> Ajouter un produit
                </button>
                <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button onClick={handleImportXLS} className="w-full sm:w-auto bg-zinc-800 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                  <FileUp size={20} /> Importer via XLS
                </button>
                <button onClick={handleDownloadTemplate} className="w-full sm:w-auto bg-zinc-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-zinc-500 transition-colors flex items-center justify-center gap-2">
                  <Download size={20} /> Télécharger le modèle
                </button>
                <button onClick={handleExportProducts} className="w-full sm:w-auto bg-white text-black border-2 border-zinc-200 px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2">
                  <Share2 size={20} /> Exporter
                </button>

                {filteredProducts.length > 0 && (
                   <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-2xl shadow-sm ml-auto animate-in fade-in">
                      <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition">
                         <input type="checkbox" checked={bulkSelection.length > 0 && bulkSelection.length === filteredProducts.length} onChange={(e) => e.target.checked ? setBulkSelection(filteredProducts.map(p => p.id)) : setBulkSelection([])} className="w-4 h-4 accent-black dark:accent-[#39FF14]" />
                         <span className="text-xs font-bold whitespace-nowrap text-black dark:text-white">Tout sélectionner</span>
                      </label>
                      {bulkSelection.length > 0 && (
                         <>
                            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                            <span className="text-xs font-black text-[#39FF14] px-2">{bulkSelection.length}</span>
                            <button onClick={handleBulkDuplicate} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition" title="Dupliquer la sélection"><Copy size={16}/></button>
                            <button onClick={handleBulkDelete} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition" title="Supprimer la sélection"><Trash2 size={16}/></button>
                            <button onClick={() => setBulkSelection([])} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"><X size={16}/></button>
                         </>
                      )}
                   </div>
                )}
              </div>
            )}

            {activeCategory === 'Toutes' && !searchTerm && !minPrice && !maxPrice && !isEditingMode && homepageLayout && homepageLayout.length > 0 ? (
                <div className="space-y-8">
                    {homepageLayout.map((widget, index) => <div key={index}>{renderWidget(widget)}</div>)}
                </div>
            ) : (
              <>
                {activeCategory === 'Toutes' && !searchTerm && !minPrice && !maxPrice ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                    {visibleCategories.filter(c => c !== 'Toutes' && c !== 'Favoris').map((cat) => (
                      <div 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="group relative h-80 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800"
                      >
                        <img 
                          src={shopInfo.categoryCovers?.[cat] || `https://placehold.co/800x800/111/FFF?text=${encodeURIComponent(cat.includes(' / ') ? cat.split(' / ')[1] : cat)}`} 
                          alt={cat}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-6 text-center">
                          <h3 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">{cat.includes(' / ') ? cat.split(' / ')[1] : cat}</h3>
                          <span className="mt-4 px-6 py-2 bg-[#39FF14] text-black text-xs font-bold uppercase rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            Voir la collection
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 ${isEditingMode ? 'cursor-grab active:cursor-grabbing hover:border-[#39FF14]/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]' : 'cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600'} ${product.stock === 0 ? 'grayscale opacity-75' : ''}`}
                    onClick={() => !isEditingMode && handleViewProduct(product)}
                    draggable={isEditingMode && activeCategory === 'Toutes'} // Drag & Drop only logical when all products are shown
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="relative">
                      {isEditingMode && (
                         <div className="absolute top-4 left-4 z-30" onClick={(e) => e.stopPropagation()}>
                            <input 
                               type="checkbox" 
                               checked={bulkSelection.includes(product.id)}
                               onChange={() => setBulkSelection(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id])}
                               className="w-5 h-5 rounded cursor-pointer accent-black dark:accent-[#39FF14] shadow-md border-2 border-white dark:border-black"
                            />
                         </div>
                      )}
                      <img src={product.image} alt={product.name} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500 bg-zinc-100 dark:bg-zinc-800" />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                          <span className="text-white font-black uppercase tracking-widest border-2 border-white px-4 py-2 rounded-lg">Épuisé</span>
                        </div>
                      )}
                      <div className={`absolute ${isEditingMode ? 'top-12' : 'top-4'} left-4 flex flex-col items-start gap-2 transition-all`}>
                        <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700 text-[#39FF14]">
                          {product.category}
                        </div>
                        {bestSellerIds.includes(product.id) && (
                          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                             <Star size={10} className="fill-black" /> Meilleure Vente
                          </div>
                        )}
                        {((product.oldPrice || (product as any).old_price) || 0) > (product.price || 0) && (
                           <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Promo -{Math.round(((((product.oldPrice || (product as any).old_price) || 0) - (product.price || 0)) / ((product.oldPrice || (product as any).old_price) || 1)) * 100)}%</div>
                        )}
                        {product.stock === 0 && (
                          <div className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Épuisé</div>
                        )}
                        {product.stock === 1 && (
                          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">Stock critique !</div>
                        )}
                        {product.stock !== 0 && ((product as any).created_at ? new Date((product as any).created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : product.id > Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                          <div className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-[#39FF14]/30">Nouveau</div>
                        )}
                      </div>
                      
                      {/* Wishlist Button */}
                      {!isEditingMode && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                          className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md p-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
                        >
                          <Heart 
                            size={18} 
                            className={`transition-all ${wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-black dark:text-white'}`} 
                          />
                        </button>
                      )}

                      {isEditingMode && (
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                              <button onClick={() => handleEditProduct(product)} className="bg-black/70 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-[#39FF14] hover:text-black transition border border-zinc-700 shadow-lg"><Edit size={16}/></button>
                              <button onClick={() => handleDuplicateProduct(product)} className="bg-black/70 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-blue-500 hover:text-white transition border border-zinc-700 shadow-lg" title="Dupliquer"><Copy size={16}/></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="bg-black/70 backdrop-blur-md text-red-500 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition border border-zinc-700 shadow-lg"><Trash2 size={16}/></button>
                          </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">{product.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 flex-1 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center gap-1 mt-3">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-black dark:text-white">{product.rating || 5}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">({product.reviews || 0} avis)</span>
                      </div>

                      <div className="flex justify-between items-end mt-6">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1">Prix</p>
                          <div className="flex items-end gap-2">
                             <p className="text-2xl font-black text-black dark:text-white">{displayPrice(product.price, shopInfo.currency)}</p>
                             {product.oldPrice && product.oldPrice > product.price && <p className="text-sm text-zinc-400 line-through mb-1">{displayPrice(product.oldPrice, shopInfo.currency)}</p>}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { 
                              e.stopPropagation(); 
                              if ((Array.isArray(product.variants?.sizes) && product.variants.sizes.length > 0) || (Array.isArray(product.variants?.colors) && product.variants.colors.length > 0)) {
                                  handleViewProduct(product);
                              } else {
                                  addToCart(product, undefined, false); 
                              }
                          }} 
                          disabled={product.stock === 0 || (product.stock !== undefined && cart.filter(i => i.id === product.id).reduce((sum, i) => sum + i.quantity, 0) >= product.stock)}
                          className="bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition-colors flex items-center gap-2 shadow-lg disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed"
                        >
                          <Plus size={16} /> {((Array.isArray(product.variants?.sizes) && product.variants.sizes.length > 0) || (Array.isArray(product.variants?.colors) && product.variants.colors.length > 0)) ? 'Options' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
                )}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 text-zinc-500 dark:text-zinc-500">
                    <Filter size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xl font-black text-black dark:text-white mb-2">0 résultat trouvé</p>
                    <p>Aucun produit ne correspond à votre recherche ou à vos filtres.</p>
                  </div>
                )}
              </>
            )}
            </div>

            {/* FOOTER */}
            {!isEditingMode && (
                <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-8 px-6 text-center animate-in fade-in shrink-0 print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left max-w-5xl mx-auto">
                        <div>
                            <h4 className="font-black uppercase mb-4 text-black dark:text-white">Onyx Jaay</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{shopInfo.description || "Votre boutique propulsée par OnyxOps."}</p>
                        </div>
                        <div>
                            <h4 className="font-black uppercase mb-4 text-black dark:text-white">Liens Utiles</h4>
                            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                                <li><button onClick={() => { setActiveCategory('Toutes'); setSearchTerm(''); }} className="hover:text-[#39FF14] transition-colors">Catalogue</button></li>
                                <li><button onClick={() => setIsTrackingModalOpen(true)} className="hover:text-[#39FF14] transition-colors">Suivi de Commande</button></li>
                                <li><button onClick={() => setIsCartOpen(true)} className="hover:text-[#39FF14] transition-colors">Mon Panier</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black uppercase mb-4 text-black dark:text-white">Contact</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">WhatsApp : {shopInfo.phone}</p>
                            <a href={`https://wa.me/${String(shopInfo.phone).replace(/[^0-9]/g, '')}`} target="_blank" className="mt-2 inline-block px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:bg-[#39FF14] hover:text-black transition">Discuter avec nous</a>
                        </div>
                        <div>
                            <h4 className="font-black uppercase mb-4 text-black dark:text-white">Newsletter</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Abonnez-vous pour recevoir nos offres.</p>
                            <form onSubmit={(e) => { e.preventDefault(); alert("Merci de votre inscription à la newsletter !"); setNewsletterEmail(''); }} className="flex gap-2">
                                <input type="email" placeholder="Votre email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} required className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs outline-none focus:border-[#39FF14]" />
                                <button type="submit" className="bg-[#39FF14] text-black px-3 py-2 rounded-lg text-xs font-bold hover:bg-black hover:text-[#39FF14] transition-colors"><Send size={14}/></button>
                            </form>
                        </div>
                    </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-600">&copy; {new Date().getFullYear()} {shopInfo.name}. Propulsé par <a href="https://onyxlinks.com" target="_blank" className="font-bold text-black dark:text-white">OnyxOps</a>.</p>
                </footer>
            )}
          </div>
        )}
        {shopView === 'dashboard' && (
            <ShopDashboard products={products} productViews={productViews} viewHistory={viewHistory} onUpdateStock={handleUpdateStock} onViewProduct={handleViewProduct} currency={shopInfo.currency} setShopView={setShopView} orders={orders} refreshOrders={fetchOrders} shopName={shopInfo.name} shopLogo={shopInfo.logoUrl} recentReviews={recentReviews} />
        )}
        {shopView === 'clients' && (
            <ShopClients currency={shopInfo.currency} orders={orders} onClientSelect={setSelectedClient} onRunIaScan={runIaScanGeneral} />
        )}
        {shopView === 'settings' && (
            <ShopSettings 
              promoCodes={promoCodes} 
              setPromoCodes={setPromoCodes} 
              shopInfo={shopInfo}
              setShopInfo={setShopInfo}
              deliveryZones={deliveryZones}
              setDeliveryZones={setDeliveryZones}
              categories={categories}
              setCategories={setCategories}
              onResetData={handleResetData}
              onClearOrders={handleClearOrders}
          onClearCatalog={handleClearCatalog}
          onGenerateDemo={handleGenerateDemo}
              currency={shopInfo.currency}
          shopId={shopId}
            />
        )}
        {shopView === 'page-builder' && (
            <ShopPageBuilder categories={categories} products={products} shopId={shopId} />
        )}
        {shopView === 'planning' && (
            <MarketingPlanner suggestions={iaSuggestions} plannedEvents={plannedEvents} setPlannedEvents={setPlannedEvents} />
        )}
        {shopView === 'reviews' && (
            <ShopReviews shopId={shopId} products={products} orders={orders} shopName={shopInfo.name} />
        )}
      </main>

      {/* --- FLOATING MOBILE CART BUTTON --- */}
      {cartCount > 0 && !isEditingMode && !isCartOpen && (
        <div className="fixed bottom-6 left-6 right-[5.5rem] z-40 md:hidden animate-in slide-in-from-bottom-4">
            <button
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-xs shadow-[0_10px_30px_rgba(57,255,20,0.3)] flex items-center justify-between px-4 border border-[#32E612]"
            >
                <span className="flex items-center gap-3">
                    <div className="relative">
                        <ShoppingCart size={18} />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#39FF14] leading-none">{cartCount}</span>
                    </div>
                    À la caisse
                </span>
                <span className="bg-black text-[#39FF14] px-2 py-1 rounded-lg">
                    {displayPrice(cartTotal, shopInfo.currency)}
                </span>
            </button>
        </div>
      )}

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative bg-white dark:bg-zinc-950 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-100 dark:bg-zinc-900">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <ShoppingCart className="text-[#39FF14]" /> Mon Panier
                  {cartCount > 0 && (
                      <div className="flex gap-2 ml-2 flex-wrap">
                          <button 
                              onClick={() => {
                                  let shareMsg = `Salut ! Regarde mon panier sur ${shopInfo.name} :\n\n`;
                                  cart.forEach(item => { shareMsg += `- ${item.name} (x${item.quantity}) : ${displayPrice(item.price * item.quantity, shopInfo.currency)}\n`; });
                                  shareMsg += `\n*Total : ${displayPrice(cartTotal, shopInfo.currency)}*\n\nLien : ${window.location.origin}/vente`;
                                  window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');
                              }} 
                              className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded hover:bg-green-500 hover:text-white transition tracking-widest flex items-center gap-1"
                          >
                              <Share2 size={12} /> PARTAGER
                          </button>
                          <button 
                              onClick={() => {
                                  localStorage.setItem('onyx_jaay_cart', JSON.stringify(cart));
                                  alert("Votre panier est sauvegardé sur cet appareil ! Vous le retrouverez lors de votre prochaine visite.");
                              }} 
                              className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition tracking-widest flex items-center gap-1"
                          >
                              <Save size={12} /> SAUVER
                          </button>
                          <button 
                              onClick={() => { if(confirm("Voulez-vous vraiment vider votre panier ?")) { setCart([]); setAppliedPromo(null); } }} 
                              className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition tracking-widest flex items-center gap-1"
                          >
                              <Trash2 size={12} /> VIDER
                          </button>
                      </div>
                  )}
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full transition"><X size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
               {isShopOwner && (
                 <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                   <div className="relative">
                     <QrCode size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                     <input 
                       type="text" 
                       autoFocus
                       placeholder="Scanner code-barre ou ID (Entrée)..." 
                       value={barcodeInput}
                       onChange={e => setBarcodeInput(e.target.value)}
                       onKeyDown={handleBarcodeScan}
                       className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:border-[#39FF14] text-black dark:text-white transition"
                     />
                   </div>
                 </div>
               )}
               <div className="p-6 space-y-4 flex-1">
                  {cart.length === 0 ? (
                  <div className="text-center text-zinc-500 dark:text-zinc-500 mt-20">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Votre panier est vide.</p>
                  </div>
                ) : (
                  cart.map(item => (
                  <div key={`${item.id}-${JSON.stringify(item.selectedVariant)}`} className="flex gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                       <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                             <h4 className="font-bold text-sm line-clamp-1 text-black dark:text-white">{item.name}</h4>
                           <button onClick={() => removeFromCart(item)} className="text-zinc-500 dark:text-zinc-500 hover:text-red-500 shrink-0"><Trash2 size={16}/></button>
                          </div>
                          {(item.selectedVariant?.size || item.selectedVariant?.color) && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
                              {item.selectedVariant.size && <span className="mr-2">Taille: {item.selectedVariant.size}</span>}
                              {item.selectedVariant.color && <span>Coul: {item.selectedVariant.color}</span>}
                            </p>
                          )}
                          <p className="text-[#39FF14] font-bold text-sm">{item.price.toLocaleString()} FCFA</p>
                          <div className="flex items-center gap-3 mt-2">
                           <button onClick={() => updateQuantity(item, -1)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700"><Minus size={14}/></button>
                             <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item, 1)} disabled={item.stock !== undefined && cart.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0) >= item.stock} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"><Plus size={14}/></button>
                          </div>
                       </div>
                    </div>
                  ))
                )}
               </div>

               <div className="p-6 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                <div className="mb-6">
                   <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-3">Mode de livraison</p>
                   <div className="flex gap-3">
                      {shopInfo.deliveryOptions?.delivery !== false && (
                          <button 
                              onClick={() => setDeliveryMethod('delivery')}
                              className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'delivery' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}
                          >
                              <Truck size={20} />
                              <span className="text-[10px] font-black uppercase">Livraison</span>
                          </button>
                      )}
                      {shopInfo.deliveryOptions?.pickup !== false && (
                          <button 
                              onClick={() => setDeliveryMethod('pickup')}
                              className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}
                          >
                              <Store size={20} />
                              <span className="text-[10px] font-black uppercase">Retrait</span>
                          </button>
                      )}
                   </div>
                </div>

                {deliveryMethod === 'delivery' && (
                    <div className="mb-4">
                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Zone de livraison</p>
                        <select 
                            value={selectedZoneId || ''} 
                            onChange={(e) => setSelectedZoneId(Number(e.target.value))}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#39FF14]"
                        >
                            <option value="">Sélectionner votre zone</option>
                            {deliveryZones.map(zone => (
                                <option key={zone.id} value={zone.id}>{zone.name} - {zone.price.toLocaleString()} F</option>
                            ))}
                        </select>
                        {selectedZoneId && (
                            <p className="text-[10px] text-zinc-400 mt-1 italic">
                                {deliveryZones.find(z => z.id === selectedZoneId)?.quartiers.join(', ')}
                            </p>
                        )}
                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mt-5 mb-2">Adresse détaillée</p>
                        <textarea 
                            value={customerAddress}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCustomerAddress(val);
                                const lowerVal = val.toLowerCase();
                                for (const zone of deliveryZones) {
                                    if (zone.quartiers && zone.quartiers.some((q: string) => q.trim() && lowerVal.includes(q.trim().toLowerCase()))) {
                                        setSelectedZoneId(zone.id);
                                        break;
                                    }
                                }
                            }}
                            placeholder="Quartier, rue, numéro de villa, repère..."
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#39FF14] resize-none h-20"
                        />
                    </div>
                )}

                {promoCodes.some(c => c.active) && (
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            placeholder="Code Promo" 
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold uppercase outline-none focus:border-[#39FF14]"
                        />
                        <button onClick={handleApplyPromo} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-black uppercase">OK</button>
                    </div>
                )}

                {appliedPromo && (
                    <div className="flex justify-between items-center mb-2 text-xs text-[#39FF14]">
                        <span className="font-bold">Remise ({appliedPromo.code})</span>
                        <span className="font-bold">-{promoDiscountAmount.toLocaleString()} F</span>
                    </div>
                )}

                {isShopOwner && (
                    <div className="flex justify-between items-center mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-bold flex items-center gap-2">
                            Remise globale (%)
                            <input 
                                type="number" 
                                placeholder="0" 
                                value={manualDiscountPct} 
                                onChange={e => setManualDiscountPct(e.target.value ? Number(e.target.value) : '')} 
                                className="w-16 font-normal bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 outline-none text-black dark:text-white"
                            />
                        </span>
                        {manualDiscountAmount > 0 && (
                            <span className="font-bold text-[#39FF14]">-{manualDiscountAmount.toLocaleString()} FCFA</span>
                        )}
                    </div>
                )}

                {deliveryMethod === 'delivery' && (
                    <div className="flex justify-between items-center mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-bold flex items-center gap-2">
                            Frais de livraison
                            {isShopOwner && (
                                <input 
                                    type="number" 
                                    placeholder="Auto" 
                                    value={customDeliveryCost} 
                                    onChange={e => setCustomDeliveryCost(e.target.value ? Number(e.target.value) : '')} 
                                    className="w-20 font-normal bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 outline-none text-black dark:text-white"
                                />
                            )}
                        </span>
                        <span className="font-bold">{deliveryCost.toLocaleString()} F</span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                   <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs">Total à payer</span>
                   <span className="text-2xl font-black text-black dark:text-white">{displayPrice(cartTotal, shopInfo.currency)}</span>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleCheckout} 
                        disabled={cart.length === 0 || (deliveryMethod === 'delivery' && !selectedZoneId) || (deliveryMethod === 'delivery' && shopInfo.deliveryOptions?.delivery === false) || (deliveryMethod === 'pickup' && shopInfo.deliveryOptions?.pickup === false)} 
                        className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                       Commander sur WhatsApp <ArrowRight size={18} />
                    </button>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="w-full bg-transparent border-2 border-black dark:border-white text-black dark:text-white py-3 rounded-xl font-bold uppercase text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center"
                    >
                        Continuer mes achats
                    </button>
                </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* --- WISHLIST DRAWER --- */}
      {isWishlistOpen && !isEditingMode && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)}></div>
          <div className="relative bg-zinc-50 dark:bg-black w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right-4 duration-500">
             <div className="p-8 border-b-2 border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <Heart className="text-red-500 fill-red-500" /> Liste de souhaits
                </h2>
                <button onClick={() => setIsWishlistOpen(false)} className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"><X size={24}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="text-center text-zinc-400 dark:text-zinc-600 h-full flex flex-col items-center justify-center">
                    <Heart size={64} className="mx-auto mb-6 opacity-10" />
                    <p className="font-bold text-lg">Votre liste est vide.</p>
                    <p className="text-sm mt-2">Cliquez sur le cœur d'un produit pour l'ajouter.</p>
                  </div>
                ) : (
                  products.filter(p => wishlist.includes(p.id)).map(item => (
                    <div key={item.id} className="flex gap-6 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-black dark:hover:border-zinc-700 transition-all cursor-pointer" onClick={() => { setViewingProduct(item); setIsWishlistOpen(false); }}>
                       <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                       <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-base line-clamp-1 text-black dark:text-white">{item.name}</h4>
                             <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item.id); }} className="text-zinc-400 hover:text-red-500 shrink-0 p-1"><Trash2 size={18}/></button>
                          </div>
                          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg mb-auto">{displayPrice(item.price, shopInfo.currency)}</p>
                            <button onClick={(e) => { 
                                e.stopPropagation(); 
                                if ((Array.isArray(item.variants?.sizes) && item.variants.sizes.length > 0) || (Array.isArray(item.variants?.colors) && item.variants.colors.length > 0)) {
                                    setViewingProduct(item);
                                } else {
                                    addToCart(item, undefined, false); 
                                }
                                setIsWishlistOpen(false); 
                            }} className="text-xs bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl w-max mt-2 font-bold uppercase tracking-wider hover:bg-[#39FF14] hover:text-black transition-colors">
                                {((Array.isArray(item.variants?.sizes) && item.variants.sizes.length > 0) || (Array.isArray(item.variants?.colors) && item.variants.colors.length > 0)) ? 'Options' : 'Ajouter au panier'}
                            </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

      {/* --- TRACKING MODAL --- */}
      {isTrackingModalOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsTrackingModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setIsTrackingModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-[#39FF14]/10 rounded-xl text-[#39FF14]"><Package size={24}/></div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">Suivi Commande</h3>
            </div>
            
            <form onSubmit={handleTrackOrder} className="mb-6 flex gap-2">
               <input 
                  type="text" 
                  placeholder="Ex: CMD-123456 ou 77..." 
                  value={trackingInput} 
                  onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                  required
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 font-bold outline-none focus:border-[#39FF14] uppercase text-sm" 
               />
               <button type="submit" disabled={isTracking} className="bg-black text-[#39FF14] px-4 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition disabled:opacity-50 flex items-center gap-2">
                  <Search size={16}/> {isTracking ? '...' : 'Chercher'}
               </button>
            </form>

            {trackedOrder && (
               <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 animate-in slide-in-from-bottom-2 mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Détails de la commande</p>
                  <div className="flex justify-between items-center mb-4">
                     <p className="font-bold text-black dark:text-white">{trackedOrder.trackingNumber || trackedOrder.tracking_number}</p>
                     <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                         trackedOrder.status === 'Livré' ? 'bg-green-100 text-green-700' : 
                         trackedOrder.status === 'Payé' ? 'bg-emerald-100 text-emerald-700' :
                         trackedOrder.status === 'Expédié' ? 'bg-blue-100 text-blue-700' :
                         trackedOrder.status === 'En cours de préparation' ? 'bg-purple-100 text-purple-700' :
                         trackedOrder.status === 'Annulé' || trackedOrder.status === 'Retour article' ? 'bg-red-100 text-red-700' : 
                         'bg-yellow-100 text-yellow-700'
                     }`}>
                        {trackedOrder.status || 'En attente'}
                     </span>
                  </div>
                  <div className="flex justify-between items-end pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                     <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Date</p>
                        <p className="text-xs font-bold text-black dark:text-white">{new Date(trackedOrder.date || trackedOrder.created_at).toLocaleDateString('fr-FR')}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Total</p>
                        <p className="text-sm font-black text-[#39FF14]">{displayPrice(trackedOrder.total || trackedOrder.total_amount, shopInfo.currency)}</p>
                     </div>
                  </div>

                  {trackedOrder.delivery_driver && trackedOrder.status !== 'Livré' && (
                     <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 p-3 rounded-xl mb-6 text-xs font-bold border border-orange-200 dark:border-orange-500/20">
                        <Truck size={16} /> Livreur assigné : {trackedOrder.delivery_driver}
                     </div>
                  )}

                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Historique & Suivi</p>
                  <div className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-6 ml-3">
                     {(trackedOrder.history && trackedOrder.history.length > 0 ? trackedOrder.history : [{status: trackedOrder.status || 'En attente', date: trackedOrder.date || trackedOrder.created_at || new Date().toISOString()}]).map((h: any, i: number, arr: any[]) => {
                         const getStatusInfo = (status: string) => {
                             switch(status) {
                                 case 'En attente': return { color: 'bg-yellow-500', msg: 'Votre commande a bien été reçue et est en attente de traitement.' };
                                 case 'Payé': return { color: 'bg-emerald-500', msg: 'Paiement confirmé. Nous préparons votre commande.' };
                                 case 'En cours de préparation': return { color: 'bg-purple-500', msg: 'Votre commande est en cours de préparation par notre équipe.' };
                                 case 'Expédié': return { color: 'bg-blue-500', msg: 'Votre colis a été remis au livreur et est en route !' };
                                 case 'Livré': return { color: 'bg-green-500', msg: 'Votre commande a été livrée avec succès.' };
                                 case 'Retour article': return { color: 'bg-red-500', msg: 'Le retour de votre article est en cours de traitement.' };
                                 case 'Annulé': return { color: 'bg-red-500', msg: 'Votre commande a été annulée.' };
                                 default: return { color: 'bg-zinc-500', msg: 'Mise à jour de la commande.' };
                             }
                         };
                         const info = getStatusInfo(h.status);
                         const isLast = i === arr.length - 1;
                         return (
                             <div key={i} className="relative pb-4">
                                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${info.color} ${isLast ? 'animate-pulse' : ''}`}></div>
                                <div className="pl-2">
                                   <p className="text-xs font-black text-black dark:text-white uppercase">{h.status}</p>
                                   <p className="text-[10px] text-zinc-500 mb-1">
                                      {new Date(h.date).toLocaleDateString('fr-FR')} à {new Date(h.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                   </p>
                                   <p className="text-xs text-zinc-600 dark:text-zinc-400">{info.msg}</p>
                                </div>
                             </div>
                         );
                     })}
                  </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* --- CHECKOUT CONFIRMATION MODAL --- */}
      {isCheckoutModalOpen && !isEditingMode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 relative">
            <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-500 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white">Confirmation</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Vérifiez votre commande avant l&apos;envoi sur WhatsApp.</p>
            
            <div className="mb-6 space-y-3 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Vos Coordonnées</p>
                <input type="text" placeholder="Votre Nom *" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black" />
                <input type="tel" placeholder="Votre Téléphone *" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black" />
            </div>
            
            <div className="mb-6 space-y-3 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Mode de réception</p>
                <div className="flex gap-3 mb-4">
                    {shopInfo.deliveryOptions?.delivery !== false && (
                        <button onClick={() => setDeliveryMethod('delivery')} className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'delivery' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                            <Truck size={20} /> <span className="text-[10px] font-black uppercase">Livraison</span>
                        </button>
                    )}
                    {shopInfo.deliveryOptions?.pickup !== false && (
                        <button onClick={() => setDeliveryMethod('pickup')} className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                            <Store size={20} /> <span className="text-[10px] font-black uppercase">Retrait</span>
                        </button>
                    )}
                </div>
                {deliveryMethod === 'delivery' && (
                    <div className="space-y-3">
                        <select value={selectedZoneId || ''} onChange={(e) => setSelectedZoneId(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-3 text-sm font-bold outline-none focus:border-[#39FF14]">
                            <option value="">Sélectionner votre zone de livraison *</option>
                            {deliveryZones.map(zone => (
                                <option key={zone.id} value={zone.id}>{zone.name} - {zone.price.toLocaleString()} F</option>
                            ))}
                        </select>
                        {selectedZoneId && <p className="text-[10px] text-zinc-400 italic px-1">{deliveryZones.find(z => z.id === selectedZoneId)?.quartiers.join(', ')}</p>}
                        <textarea placeholder="Adresse détaillée (Quartier, rue, repère...)" value={customerAddress} onChange={e => {
                            const val = e.target.value;
                            setCustomerAddress(val);
                            const lowerVal = val.toLowerCase();
                            for (const zone of deliveryZones) {
                                if (zone.quartiers && zone.quartiers.some((q: string) => q.trim() && lowerVal.includes(q.trim().toLowerCase()))) {
                                    setSelectedZoneId(zone.id);
                                    break;
                                }
                            }
                        }} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black resize-none min-h-[60px]" />
                    </div>
                )}
                <textarea placeholder="Instructions de livraison (Optionnel)" value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black min-h-[60px] resize-none" />
            </div>

            {currentCustomerPoints > 0 && (
                <div className="mb-6 space-y-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-2"><Gift size={14}/> Vos points de fidélité</p>
                        <p className="font-black text-green-600 dark:text-green-400">{currentCustomerPoints} pts</p>
                    </div>
                    <button 
                        onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors ${useLoyaltyPoints ? 'bg-green-200 dark:bg-green-800' : 'bg-white dark:bg-zinc-800'}`}
                    >
                        <input type="checkbox" checked={useLoyaltyPoints} readOnly className="w-4 h-4 accent-green-600" />
                        <span className="text-xs font-bold">Utiliser mes points pour une remise de {Math.min(currentCustomerPoints * 10, subTotal - promoDiscountAmount).toLocaleString()} FCFA</span>
                    </button>
                </div>
            )}
            
            <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-zinc-100 dark:border-zinc-900">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {item.name} 
                    {(item.selectedVariant?.size || item.selectedVariant?.color) && <span className="text-zinc-500 dark:text-zinc-500 text-xs ml-1">({[item.selectedVariant.size, item.selectedVariant.color].filter(Boolean).join(', ')})</span>}
                    <span className="text-zinc-500 dark:text-zinc-500 text-xs ml-1">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-black dark:text-white">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                </div>
              ))}
              {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-900 text-sm">
                      <span className="text-zinc-600 dark:text-zinc-300 font-bold flex items-center gap-2">
                          Frais de livraison {selectedZoneId ? `(${deliveryZones.find(z => z.id === selectedZoneId)?.name})` : ''}
                          {isShopOwner && (
                              <input 
                                  type="number" 
                                  placeholder="Auto" 
                                  value={customDeliveryCost} 
                                  onChange={e => setCustomDeliveryCost(e.target.value ? Number(e.target.value) : '')} 
                                  className="w-20 font-normal bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 outline-none text-black dark:text-white text-xs"
                              />
                          )}
                      </span>
                      <span className="font-bold text-black dark:text-white">{deliveryCost.toLocaleString()} FCFA</span>
                  </div>
              )}
                  {manualDiscountAmount > 0 && (
                     <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-900 text-sm text-[#39FF14]">
                         <span className="font-bold flex items-center gap-1">Remise ({manualDiscountPct}%)</span>
                         <span className="font-bold">-{displayPrice(manualDiscountAmount, shopInfo.currency)}</span>
                     </div>
                  )}
              <div className="pt-4 flex justify-between text-lg font-black text-[#39FF14]">
                <span>Total</span>
                <span>{displayPrice(cartTotal, shopInfo.currency)}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => { if(confirm("Voulez-vous vraiment vider le panier et annuler la commande ?")) { setCart([]); setAppliedPromo(null); setIsCheckoutModalOpen(false); setIsCartOpen(false); } }} 
                className="py-4 px-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition flex items-center justify-center" title="Vider le panier"
              >
                 <Trash2 size={18}/>
              </button>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl font-bold text-xs uppercase hover:bg-zinc-200 dark:hover:bg-zinc-800 transition text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">Annuler</button>
              {isShopOwner && (
                  <button onClick={() => confirmOrder(true)} className="flex-[1.2] py-4 bg-zinc-800 dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase hover:opacity-80 transition flex items-center justify-center gap-2 shadow-lg">
                    <Store size={18}/> Sur place
                  </button>
              )}
              <button onClick={() => confirmOrder(false)} className="flex-[1.8] py-4 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase hover:bg-white transition flex items-center justify-center gap-2 shadow-lg shadow-[#39FF14]/20">
                <MessageSquare size={18}/> Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ORDER SUCCESS MODAL --- */}
      {isOrderSuccessOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] w-full max-w-md p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#39FF14]"></div>
            <div className="w-20 h-20 bg-[#39FF14]/20 text-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Sparkles size={40} />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">Merci pour votre confiance ! 💖</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
                Votre commande a été enregistrée avec succès. On s&apos;occupe de tout préparer avec soin !<br/><br/>
                <span className="font-bold text-black dark:text-white">Notre équipe reviendra vers vous très vite si besoin.</span>
            </p>
            <button onClick={() => setIsOrderSuccessOpen(false)} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-xl">
                C&apos;est noté, à tout de suite !
            </button>
            </div>
        </div>
      )}

      {/* --- ORDER REVIEW MODAL --- */}
      {reviewOrderId && !isEditingMode && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setReviewOrderId(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setReviewOrderId(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-yellow-400/10 rounded-xl text-yellow-500"><Star size={24} className="fill-yellow-500"/></div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">Votre Avis</h3>
            </div>
            <p className="text-sm text-zinc-500 mb-6">Merci pour votre commande ! Comment s'est passée votre expérience avec la boutique ?</p>
            
            <form onSubmit={async (e) => {
                e.preventDefault();
                if (!orderReview.name || !orderReview.comment) return alert("Veuillez remplir votre nom et votre commentaire.");
                
                const { error } = await supabase.from('reviews').insert([{
                   shop_id: shopId,
                   type: 'order',
                     reference_id: String(reviewOrderId),
                   name: orderReview.name,
                   rating: orderReview.rating,
                   comment: orderReview.comment
                }]);

                if (error) {
                    console.error("Erreur:", error);
                      alert("Erreur lors de l'envoi (Supabase) : " + error.message);
                    return;
                }
                
                alert("Merci pour votre avis ! Il a été enregistré avec succès.");
                setReviewOrderId(null);
                setOrderReview({ name: '', rating: 5, comment: '' });
                
                // Nettoie l'URL pour ne pas rouvrir la modale au rafraîchissement
                window.history.replaceState({}, document.title, window.location.pathname);
            }} className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Votre prénom / nom</label>
                 <input type="text" value={orderReview.name} onChange={e => setOrderReview({...orderReview, name: e.target.value})} required className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-[#39FF14]" />
               </div>
               <div>
                 <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Note</label>
                 <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                       <button key={star} type="button" onClick={() => setOrderReview({...orderReview, rating: star})} className="p-2 hover:scale-110 transition-transform">
                          <Star size={32} className={star <= orderReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300 dark:text-zinc-700'} />
                       </button>
                    ))}
                 </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Votre commentaire</label>
                 <textarea value={orderReview.comment} onChange={e => setOrderReview({...orderReview, comment: e.target.value})} required className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-[#39FF14] min-h-[100px] resize-none" placeholder="Racontez-nous..."></textarea>
               </div>
               <button type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg mt-4">
                  Envoyer mon avis
               </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
         <ProductModal 
            product={editingProduct} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveProduct}
            onImageUpload={handleImageUpload}
            categories={categories}
            currency={shopInfo.currency}
            onApplyVariantsToAll={async (variants) => {
                if(confirm("Appliquer ces tailles et couleurs à TOUS les produits de votre catalogue ?")) {
                    setProducts(prev => prev.map(p => ({ ...p, variants })));
                    if (shopId) {
                        await supabase.from('products').update({ variants }).eq('shop_id', shopId);
                    }
                    alert("Variantes appliquées à tous les produits !");
                }
            }}
            onAddCategory={(cat) => setCategories(prev => prev.includes(cat) ? prev : [...prev, cat])}
         />
      )}

      {/* --- PRODUCT DETAIL MODAL --- */}
      {viewingProduct && !isEditingMode && (
        <ProductDetailModal 
          product={viewingProduct}
          allProducts={products}
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          onAddToCart={(p: any, v: any, openCart?: boolean, qty?: number) => addToCart(p, v, openCart, qty)}
          onBuyDirectly={(p: any, v: any, qty?: number) => { addToCart(p, v, false, qty); setIsCheckoutModalOpen(true); }}
          onShare={handleShareProduct}
          onViewProduct={handleViewProduct}
          onGenerateQR={setQrCodeProduct}
          onAddReview={handleAddReview}
          currency={shopInfo.currency}
        cart={cart}
        shopPhone={shopInfo.phone}
        />
      )}

      {qrCodeProduct && !isEditingMode && (
        <QRCodeModal 
          product={qrCodeProduct}
          onClose={() => setQrCodeProduct(null)}
        />
      )}

      {selectedClient && (
        <ClientDetailModal 
            client={selectedClient} 
            orders={orders} 
            onClose={() => setSelectedClient(null)}
            shopName={shopInfo.name}
            currency={shopInfo.currency}
                refreshOrders={() => fetchOrders(shopId || undefined)}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-[#39FF14] dark:text-black px-6 py-3 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 z-[300] animate-in slide-in-from-bottom-5">
            <CheckCircle size={16}/> {toastMessage}
        </div>
      )}
    </div>
  );
}

// --- PRODUCT MODAL COMPONENT ---
interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, setFormData: any, formData: any) => void;
    categories: string[];
    currency: string;
    onApplyVariantsToAll?: (variants: any) => void;
    onAddCategory?: (cat: string) => void;
}

function ProductModal({ product, onClose, onSave, onImageUpload, categories, currency, onApplyVariantsToAll, onAddCategory }: ProductModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [galleryUrlInput, setGalleryUrlInput] = useState('');
    
    const [sizesInput, setSizesInput] = useState(product?.variants?.sizes?.map(s => s.name).join(', ') || '');
    const [colorsInput, setColorsInput] = useState(product?.variants?.colors?.map(c => c.name).join(', ') || '');

    // Simulateur de Rentabilité
    const [simulator, setSimulator] = useState({
        taxRate: 18,
        shippingCost: 0,
        packagingCost: 0,
        marketingCac: 0,
        customsFee: 0,
        paymentFeePct: 1, // 1% par defaut (Wave/OM)
        targetMarginPct: 20,
        show: false
    });
    const [formData, setFormData] = useState<Partial<Product>>({
        name: product?.name || '',
        price: product?.price || 0,
        costPrice: product?.costPrice || 0,
        oldPrice: product?.oldPrice || 0,
        description: product?.description || '',
        image: product?.image || '',
        gallery: product?.gallery || [],
        category: product?.category || '',
        stock: product?.stock ?? 0,
        barcode: product?.barcode || '',
        rating: product?.rating || 5,
        reviews: product?.reviews || 0,
        variants: product?.variants || { sizes: [], colors: [] },
        videoUrl: product?.videoUrl || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const priceVal = formData.price || 0;
    const costPriceVal = formData.costPrice || 0;

    const simTVA = priceVal - (priceVal / (1 + Number(simulator.taxRate) / 100));
    const simPrixHT = priceVal - simTVA;
    const simCharges = costPriceVal + Number(simulator.shippingCost) + Number(simulator.packagingCost) + Number(simulator.marketingCac) + Number(simulator.customsFee) + (priceVal * Number(simulator.paymentFeePct) / 100);
    const simNetProfit = priceVal - simTVA - simCharges;
    const simMarginPct = simPrixHT > 0 ? (simNetProfit / simPrixHT) * 100 : 0;

    const calculateIdealPrice = () => {
        const Cf = Number(formData.costPrice || 0) + Number(simulator.shippingCost) + Number(simulator.packagingCost) + Number(simulator.marketingCac) + Number(simulator.customsFee);
        const T = simulator.taxRate / 100;
        const Fee = simulator.paymentFeePct / 100;
        const M = (simulator.targetMarginPct || 0) / 100;
        const denominator = 1 - M - Fee * (1 + T);
        if (denominator <= 0) return alert("Marge impossible à atteindre avec ces frais de transaction et TVA. Veuillez réduire la marge cible ou les frais.");
        const idealPrice = (Cf * (1 + T)) / denominator;
        const roundedIdeal = Math.ceil(idealPrice / 100) * 100;
        
        setFormData(prev => {
            const oldP = prev.oldPrice || 0;
            return {
                ...prev,
                price: roundedIdeal,
                oldPrice: oldP < roundedIdeal ? roundedIdeal : oldP
            };
        });
    };

    const handleSizesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSizesInput(val);
        const names = val.split(',').map(s => s.trim()).filter(Boolean);
        const newSizes = names.map(name => {
            const existing = formData.variants?.sizes?.find((s: any) => s.name === name);
            return existing || { name, priceModifier: 0 };
        });
        setFormData(prev => ({ ...prev, variants: { ...prev.variants, sizes: newSizes } }));
    };

    const handleColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setColorsInput(val);
        const names = val.split(',').map(s => s.trim()).filter(Boolean);
        const newColors = names.map(name => {
            const existing = formData.variants?.colors?.find((c: any) => c.name === name);
            return existing || { name, priceModifier: 0 };
        });
        setFormData(prev => ({ ...prev, variants: { ...prev.variants, colors: newColors } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...product, ...formData } as Product);
    };

    const handleAddGalleryUrl = () => {
        if (!galleryUrlInput) return;
        if ((formData.gallery?.length || 0) >= 7) {
            return alert("Vous ne pouvez ajouter que 7 images supplémentaires maximum.");
        }
        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), galleryUrlInput] }));
        setGalleryUrlInput('');
    };

    const handleAddGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        let currentLength = formData.gallery?.length || 0;
        files.forEach(file => {
            if (currentLength >= 7) return;
            currentLength++;
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), reader.result as string] }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({ ...prev, gallery: prev.gallery?.filter((_, i) => i !== index) }));
    };

    const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
        const newGallery = [...(formData.gallery || [])];
        if (direction === 'left' && index > 0) {
            [newGallery[index - 1], newGallery[index]] = [newGallery[index], newGallery[index - 1]];
        } else if (direction === 'right' && index < newGallery.length - 1) {
            [newGallery[index + 1], newGallery[index]] = [newGallery[index], newGallery[index + 1]];
        }
        setFormData(prev => ({ ...prev, gallery: newGallery }));
    };

    const handleGenerateIA = () => {
        if (!formData.name) return alert("Veuillez d'abord saisir le nom du produit pour utiliser l'IA.");
        setIsGenerating(true);
        setTimeout(() => {
            let variantText = '';
            const sizes = formData.variants?.sizes || [];
            const colors = formData.variants?.colors || [];
            if (sizes.length > 0) variantText += ` Disponible en tailles : ${sizes.join(', ')}.`;
            if (colors.length > 0) variantText += ` Couleurs proposées : ${colors.join(', ')}.`;
            
            setFormData({ ...formData, description: `Découvrez notre incroyable ${formData.name}${formData.category ? ` de la collection ${formData.category}` : ''}. Un concentré de qualité et de style conçu spécialement pour répondre à vos attentes. Profitez d'une finition soignée et d'un confort optimal au quotidien !${variantText} Proposé au prix exceptionnel de ${displayPrice(formData.price || 0, currency)}.` });
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
                    <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nom du produit</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" placeholder="Ex: Robe de soirée" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Prix Normal ({currency})</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input type="number" value={formData.oldPrice || formData.price || ''} onChange={(e) => {
                                        if (e.target.value === '') {
                                            setFormData(prev => ({...prev, oldPrice: 0}));
                                            return;
                                        }
                                        const val = Number(e.target.value);
                                        const currentDiscount = formData.oldPrice && formData.price && formData.oldPrice > formData.price 
                                            ? ((formData.oldPrice - formData.price) / formData.oldPrice) : 0;
                                        setFormData(prev => ({...prev, oldPrice: val, price: Math.round(val * (1 - currentDiscount))}));
                                    }} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 pl-10 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" placeholder="Prix barré" />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Remise (%)</label>
                                <div className="relative">
                                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input type="number" min="0" max="100" value={formData.oldPrice && formData.price && formData.oldPrice > formData.price ? Math.round(((formData.oldPrice - formData.price) / formData.oldPrice) * 100) : ''} onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            setFormData(prev => ({...prev, price: prev.oldPrice || prev.price}));
                                            return;
                                        }
                                        const disc = Number(val);
                                        if (disc >= 0 && disc <= 100) {
                                            setFormData(prev => {
                                                const basePrice = prev.oldPrice || prev.price || 0;
                                                return { ...prev, oldPrice: basePrice, price: Math.round(basePrice * (1 - disc / 100)) };
                                            });
                                        }
                                    }} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 pl-10 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" placeholder="Ex: 20" />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Prix Final ({currency})</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input type="number" value={formData.price === 0 ? '' : formData.price} onChange={(e) => {
                                        if (e.target.value === '') {
                                            setFormData(prev => ({...prev, price: 0}));
                                            return;
                                        }
                                        const newPrice = Number(e.target.value);
                                        setFormData(prev => ({
                                            ...prev, 
                                            price: newPrice,
                                            oldPrice: (!prev.oldPrice || prev.oldPrice < newPrice) ? newPrice : prev.oldPrice
                                        }));
                                    }} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 pl-10 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" placeholder="Prix de vente" />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Coût d&apos;achat</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input type="number" value={formData.costPrice === 0 ? '' : formData.costPrice} onChange={(e) => {
                                        setFormData(prev => ({...prev, costPrice: Number(e.target.value)}));
                                    }} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 pl-10 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" placeholder="Fournisseur" />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 flex justify-between items-center">
                                    Catégorie
                                    {onAddCategory && (
                                        <button type="button" onClick={() => {
                                            const newCat = prompt("Nom de la catégorie (Pour créer une sous-catégorie, utilisez ' / ' ex: Homme / Pantalons) :");
                                            if (newCat && newCat.trim()) {
                                                onAddCategory(newCat.trim());
                                                setFormData({...formData, category: newCat.trim()});
                                            }
                                        }} className="text-[#39FF14] hover:underline flex items-center gap-1 font-bold">
                                            <Plus size={12}/> Nouvelle
                                        </button>
                                    )}
                                </label>
                                <select name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition appearance-none cursor-pointer">
                                    <option value="">Sélectionner une catégorie...</option>
                                    {categories.filter(c => c !== 'Toutes' && c !== 'Favoris').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Note (0-5)</label>
                                <input type="number" name="rating" value={formData.rating} onChange={handleChange} min="0" max="5" step="0.1" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                            <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nombre d&apos;avis</label>
                                <input type="number" name="reviews" value={formData.reviews} onChange={handleChange} min="0" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Quantité en Stock</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Code-barre / SKU</label>
                                <div className="relative">
                                    <QrCode size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input type="text" name="barcode" value={formData.barcode || ''} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 pl-10 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" placeholder="Ex: 370123456789" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 flex justify-between items-center">
                                    Tailles 
                                    <span className="text-[10px] text-zinc-400 font-normal normal-case">Séparées par une virgule</span>
                                </label>
                                <input type="text" placeholder="Ex: S, M, L, XL" value={sizesInput} onChange={handleSizesChange} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                                {formData.variants?.sizes && formData.variants.sizes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.variants.sizes.map((s, idx) => (
                                            <div key={idx} className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                <span className="text-xs font-bold">{s.name}</span>
                                                <input type="number" placeholder="+ Prix" value={s.priceModifier || ''} onChange={(e) => {
                                                    const newSizes = [...(formData.variants?.sizes || [])];
                                                    newSizes[idx].priceModifier = Number(e.target.value) || 0;
                                                    setFormData(prev => ({...prev, variants: {...prev.variants, sizes: newSizes}}));
                                                }} className="w-16 bg-transparent outline-none text-xs text-[#39FF14] placeholder-zinc-500 ml-2" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 flex justify-between items-center">
                                    Couleurs
                                    <span className="text-[10px] text-zinc-400 font-normal normal-case">Séparées par une virgule</span>
                                </label>
                                <input type="text" placeholder="Ex: Noir, Blanc, Rouge" value={colorsInput} onChange={handleColorsChange} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                                {formData.variants?.colors && formData.variants.colors.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.variants.colors.map((c, idx) => (
                                            <div key={idx} className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                <span className="text-xs font-bold">{c.name}</span>
                                                <input type="number" placeholder="+ Prix" value={c.priceModifier || ''} onChange={(e) => {
                                                    const newColors = [...(formData.variants?.colors || [])];
                                                    newColors[idx].priceModifier = Number(e.target.value) || 0;
                                                    setFormData(prev => ({...prev, variants: {...prev.variants, colors: newColors}}));
                                                }} className="w-16 bg-transparent outline-none text-xs text-[#39FF14] placeholder-zinc-500 ml-2" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {onApplyVariantsToAll && (formData.variants?.sizes?.length || formData.variants?.colors?.length) ? ( // This logic might need adjustment if variants are now objects
                            <button type="button" onClick={() => onApplyVariantsToAll(formData.variants)} className="text-[10px] font-bold text-[#39FF14] bg-black dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:scale-105 transition-transform shadow-md">
                                Appliquer ces tailles et couleurs à TOUS mes produits
                            </button>
                        ) : null}

                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-900/50 p-3 rounded-t-xl border-b border-zinc-200 dark:border-zinc-800">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                                <button type="button" onClick={handleGenerateIA} disabled={isGenerating} className="text-[10px] font-bold text-[#39FF14] flex items-center gap-1 hover:underline disabled:opacity-50 disabled:cursor-wait">
                                    <Sparkles size={12} /> {isGenerating ? 'Rédaction...' : 'Générer avec IA'}
                                </button>
                            </div>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-b-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition min-h-[120px]" placeholder="Description détaillée du produit..." />
                        </div>

                        <div className="space-y-6 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-3 block">Image principale (Couverture)</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                        {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-zinc-400" />}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input type="text" placeholder="Ou coller une URL d'image" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-black dark:text-white outline-none focus:border-[#39FF14] transition-all" />
                                        <input type="file" accept="image/*" onChange={(e) => onImageUpload(e, setFormData, formData)} className="w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-200 dark:file:bg-zinc-700 file:text-black dark:file:text-white hover:file:bg-[#39FF14] hover:file:text-black transition cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                            <div className="relative group pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <label className="text-xs font-bold text-[#39FF14] uppercase mb-3 flex justify-between items-center">
                                Galerie d&apos;images supplémentaires (Max 7)
                                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-300">{(formData.gallery?.length || 0)} / 7</span>
                            </label>
                                <div className="flex flex-col gap-3 mb-4">
                                    <div className="flex gap-2">
                                        <input 
                                            type="url" 
                                            placeholder="Coller l'URL d'une image..." 
                                            value={galleryUrlInput} 
                                            onChange={(e) => setGalleryUrlInput(e.target.value)} 
                                            className="flex-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-black dark:text-white outline-none focus:border-[#39FF14] transition-all"
                                            disabled={(formData.gallery?.length || 0) >= 7}
                                        />
                                        <button type="button" onClick={handleAddGalleryUrl} disabled={(formData.gallery?.length || 0) >= 7 || !galleryUrlInput} className="bg-black text-[#39FF14] px-4 rounded-lg text-xs font-bold uppercase disabled:opacity-50">Ajouter</button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-zinc-500">OU</span>
                                        <input type="file" accept="image/*" multiple onChange={handleAddGalleryImage} disabled={(formData.gallery?.length || 0) >= 7} className="flex-1 text-xs text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-200 dark:file:bg-zinc-700 file:text-black dark:file:text-white hover:file:bg-[#39FF14] hover:file:text-black transition cursor-pointer disabled:opacity-50" />
                                    </div>
                                </div>
                                {(formData.gallery?.length || 0) > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {formData.gallery?.map((img, idx) => (
                                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group/gal shadow-sm">
                                                <img src={img} className="w-full h-full object-cover bg-zinc-100 dark:bg-zinc-900" />
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/gal:opacity-100 transition-all">
                                                    <div className="flex gap-1 mb-1">
                                                        <button type="button" onClick={() => moveGalleryImage(idx, 'left')} disabled={idx === 0} className="text-white hover:text-[#39FF14] disabled:opacity-30"><ChevronLeft size={14}/></button>
                                                        <button type="button" onClick={() => moveGalleryImage(idx, 'right')} disabled={idx === (formData.gallery?.length || 0) - 1} className="text-white hover:text-[#39FF14] disabled:opacity-30"><ChevronRight size={14}/></button>
                                                    </div>
                                                    <button type="button" onClick={() => removeGalleryImage(idx)} className="text-red-400 hover:text-red-500"><Trash2 size={14}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">URL Vidéo (YouTube Embed)</label>
                            <input
                                type="text"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://www.youtube.com/embed/..."
                                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition"
                            />
                        </div>

                        {/* SIMULATEUR DE RENTABILITÉ INTELLIGENT */}
                        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <button type="button" onClick={() => setSimulator({...simulator, show: !simulator.show})} className="flex items-center gap-2 text-sm font-black uppercase text-[#39FF14] mb-4 hover:underline w-full text-left">
                                <BarChart size={16}/> {simulator.show ? 'Masquer le simulateur de rentabilité' : 'Afficher le Simulateur de Rentabilité 💰'}
                            </button>
                            
                            {simulator.show && (
                                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">TVA Applicable</label>
                                            <select value={simulator.taxRate} onChange={e => setSimulator({...simulator, taxRate: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold cursor-pointer">
                                                <option value="18">18% (Standard)</option>
                                                <option value="10">10% (Réduit)</option>
                                                <option value="0">0% (Exonéré)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 cursor-help" title="Wave/OM prennent environ 1% sur les paiements marchands.">Frais paiement ℹ️</label>
                                            <select value={simulator.paymentFeePct} onChange={e => setSimulator({...simulator, paymentFeePct: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold cursor-pointer">
                                                <option value="1">Wave / OM (~1%)</option>
                                                <option value="3.5">Carte Bancaire (~3.5%)</option>
                                                <option value="0">À la livraison (0%)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Logistique (Livreur)</label>
                                            <input type="number" value={simulator.shippingCost || ''} onChange={e => setSimulator({...simulator, shippingCost: Number(e.target.value)})} placeholder="Ex: 1500" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold"/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Emballage (Carton)</label>
                                            <input type="number" value={simulator.packagingCost || ''} onChange={e => setSimulator({...simulator, packagingCost: Number(e.target.value)})} placeholder="Ex: 500" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold"/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Coût Acq. (Pub)</label>
                                            <input type="number" value={simulator.marketingCac || ''} onChange={e => setSimulator({...simulator, marketingCac: Number(e.target.value)})} placeholder="Ex: 1000" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold"/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Douane / Import</label>
                                            <input type="number" value={simulator.customsFee || ''} onChange={e => setSimulator({...simulator, customsFee: Number(e.target.value)})} placeholder="Ex: 2500" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold"/>
                                        </div>
                                    </div>

                                    {/* CALCUL INVERSE (PRIX IDÉAL) */}
                                    <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-200 dark:border-blue-500/20 flex flex-col sm:flex-row items-end gap-4">
                                        <div className="flex-1 w-full space-y-1">
                                            <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">Calculer le prix idéal selon la marge voulue (%)</label>
                                            <div className="flex gap-2">
                                                <input type="number" value={simulator.targetMarginPct || ''} onChange={e => setSimulator({...simulator, targetMarginPct: Number(e.target.value)})} placeholder="Ex: 20" className="w-24 p-3 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-500/30 rounded-xl outline-none focus:border-blue-500 text-xs font-bold text-blue-700 dark:text-blue-300"/>
                                                <button type="button" onClick={calculateIdealPrice} className="bg-blue-600 text-white px-4 py-3 rounded-xl text-xs font-black uppercase hover:bg-blue-700 transition shadow-md whitespace-nowrap">
                                                    Calculer & Appliquer
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><p className="text-[10px] font-bold text-zinc-500 uppercase">TVA à reverser</p><p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">{displayPrice(Math.round(simTVA), currency)}</p></div>
                                        <div><p className="text-[10px] font-bold text-zinc-500 uppercase">Prix de vente HT</p><p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">{displayPrice(Math.round(simPrixHT), currency)}</p></div>
                                        <div><p className="text-[10px] font-bold text-zinc-500 uppercase">Total des Charges</p><p className="font-bold text-sm text-red-500">{displayPrice(Math.round(simCharges), currency)}</p></div>
                                        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Bénéfice Net</p><p className={`font-black text-xl leading-none ${simNetProfit > 0 ? 'text-[#39FF14] dark:text-[#39FF14]' : 'text-red-500'}`}>{simNetProfit > 0 ? '+' : ''}{displayPrice(Math.round(simNetProfit), currency)}</p><p className={`text-xs font-bold mt-1 ${simMarginPct > 0 ? 'text-green-600' : 'text-red-500'}`}>Marge : {simMarginPct.toFixed(1)}%</p></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-xs uppercase text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">Annuler</button>
                        <button type="submit" className="px-8 py-3 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase hover:bg-white transition shadow-lg shadow-[#39FF14]/20">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ShopReviews({ shopId, products, orders, shopName }: { shopId: string | null, products: Product[], orders: any[], shopName: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchReviews = async () => {
            if (!shopId) return;
            setIsLoading(true);
            
            const productIds = products.map(p => String(p.id));
            
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('shop_id', shopId)
                .order('created_at', { ascending: false });

            if (data && !error) {
                setReviews(data);
            }
            setIsLoading(false);
        };
        fetchReviews();
    }, [shopId, products]);

    const handleDeleteReview = async (id: number) => {
        if(confirm("Voulez-vous supprimer cet avis ?")) {
            await supabase.from('reviews').delete().eq('id', id);
            setReviews(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleReplySubmit = async (reviewId: number) => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ admin_reply: replyText })
                .eq('id', reviewId);

            if (error) throw error;

            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, admin_reply: replyText } : r));
            
            // --- NOTIFICATION WHATSAPP AU CLIENT ---
            const review = reviews.find(r => r.id === reviewId);
            let phone = '';
            if (review?.type === 'order') {
                const order = orders.find(o => String(o.id) === String(review.reference_id) || o.trackingNumber === review.reference_id || o.tracking_number === review.reference_id);
                if (order && order.customer?.phone) phone = order.customer.phone;
            }
            
            if (confirm("Réponse enregistrée avec succès.\n\nVoulez-vous notifier le client de votre réponse sur WhatsApp ?")) {
                let userPhone = phone;
                if (!userPhone) {
                    userPhone = prompt("Numéro de téléphone introuvable (Avis Produit anonyme). Veuillez entrer le numéro du client (ex: 77 123 45 67) pour le notifier :") || "";
                }
                
                if (userPhone) {
                    const msg = `Bonjour ${review?.name} ! 🌟\n\nNous vous remercions pour votre avis suite à votre expérience chez ${shopName}.\n\n*Notre réponse :*\n"${replyText}"\n\nÀ très bientôt !`;
                    const rawPhone = String(userPhone).replace(/\s+/g, '').replace(/[^0-9]/g, '');
                    const phoneWithPrefix = rawPhone.startsWith('221') ? rawPhone : `221${rawPhone}`;
                    window.open(`https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(msg)}`, '_blank');
                }
            }

            setReplyingTo(null);
            setReplyText("");
        } catch (err: any) {
            alert("Erreur lors de l'envoi de la réponse: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportReviews = () => {
        if (reviews.length === 0) return alert("Aucun avis à exporter.");
        const exportData = reviews.map(r => {
            const product = products.find(p => String(p.id) === String(r.reference_id));
            return {
                'Date': new Date(r.created_at || Date.now()).toLocaleDateString('fr-FR'),
                'Client': r.name,
                'Note / 5': r.rating,
                'Commentaire': r.comment,
                'Réponse Vendeur': r.admin_reply || 'Aucune réponse',
                'Contexte': r.type === 'product' ? 'Avis Produit' : 'Avis Commande',
                'Référence': r.type === 'product' ? (product ? product.name : `Produit #${r.reference_id}`) : `Cmd #${r.reference_id}`
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Avis_Clients");
        XLSX.writeFile(workbook, `Avis_${shopName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredReviews = reviews.filter(r => 
        (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.admin_reply && r.admin_reply.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 md:p-12 pt-32 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-12">
                <div className="flex items-center gap-4">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Avis <span className="text-[#39FF14]">Clients</span></h2>
                    {reviews.length > 0 && (
                        <div className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-4 py-2 rounded-2xl font-black text-xl flex items-center gap-2 shadow-lg">
                            <Star className="fill-[#39FF14] dark:fill-black text-[#39FF14] dark:text-black" size={20} /> {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5
                        </div>
                    )}
                </div>
                <button onClick={handleExportReviews} className="bg-[#39FF14] text-black px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#39FF14]/20">
                    <Download size={16} /> Exporter en Excel
                </button>
            </div>
            
            {isLoading ? (
                <p className="text-zinc-500">Chargement des avis...</p>
            ) : reviews.length === 0 ? (
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 rounded-3xl text-center">
                    <p className="font-bold text-lg text-zinc-500">Aucun avis client pour le moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map(review => {
                        const product = products.find(p => String(p.id) === String(review.reference_id));
                        return (
                            <div key={review.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col group transition hover:border-[#39FF14]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-1">
                                        {[1,2,3,4,5].map(star => (
                                            <Star key={star} size={16} className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-200 dark:text-zinc-700"} />
                                        ))}
                                    </div>
                                <div className="flex gap-2 opacity-100 transition-opacity">
                                    <button onClick={() => { setReplyingTo(review.id); setReplyText(review.admin_reply || ''); }} className="text-zinc-500 hover:text-[#39FF14] transition bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg" title="Répondre"><MessageSquare size={16}/></button>
                                    <button onClick={() => handleDeleteReview(review.id)} className="text-zinc-500 hover:text-red-500 transition bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg" title="Supprimer"><Trash2 size={16}/></button>
                                </div>
                                </div>
                                <p className="font-medium text-sm mb-4 flex-1 text-black dark:text-white">"{review.comment}"</p>
                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-end">
                                    <div>
                                        <p className="font-bold text-sm uppercase text-black dark:text-white">{review.name}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                                            {review.type === 'product' ? (product ? `Produit : ${product.name}` : 'Produit inconnu') : 'Commande'}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-zinc-400">{new Date(review.created_at || Date.now()).toLocaleDateString('fr-FR')}</p>
                                </div>
                            
                            {replyingTo === review.id ? (
                                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-[#39FF14] mb-2 min-h-[80px]" placeholder="Votre réponse..."/>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition">Annuler</button>
                                        <button onClick={() => handleReplySubmit(review.id)} disabled={isSubmitting} className="px-4 py-2 text-xs font-bold bg-[#39FF14] text-black rounded-lg hover:scale-105 transition disabled:opacity-50 flex items-center gap-1">{isSubmitting ? '...' : <><Send size={14}/> Envoyer</>}</button>
                                    </div>
                                </div>
                            ) : review.admin_reply && (
                                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-black uppercase text-[#39FF14] mb-1 flex items-center gap-1"><MessageSquare size={10}/> Votre réponse</p>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">"{review.admin_reply}"</p>
                                </div>
                            )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// --- CLIENT DETAIL MODAL ---
function ClientDetailModal({ client, orders, shopName, currency, onClose, refreshOrders }: { client: any, orders: any[], shopName: string, currency: string, onClose: () => void, refreshOrders: () => void }) {
    const clientOrders = orders.filter(o => o.customer?.phone === client.phone && o.status !== 'Annulé');

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        const order = orders.find(o => o.id === orderId);
        const newHistory = [...(order?.history || []), { status: newStatus, date: new Date().toISOString(), user: 'Administrateur' }];
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus, history: newHistory }).eq('id', orderId);
            if (!error) {
                refreshOrders();
                
                // --- NOTIFICATION WHATSAPP CLIENT AUTOMATISÉE ---
                if (order && order.customer?.phone) {
                    let msg = '';
                    const customerName = order.customer.name.split(' ')[0];
                    const tracking = order.trackingNumber || order.tracking_number || order.id;
                    
                    if (newStatus === 'En cours de préparation') {
                        msg = `Bonjour ${customerName} ! 📦\nVotre commande (${tracking}) est actuellement en cours de préparation par notre équipe. Nous vous informerons dès qu'elle sera prête !`;
                    } else if (newStatus === 'Expédié') {
                        const mapsLink = prompt("Veuillez coller le lien de suivi Google Maps du livreur (Laissez vide si vous n'en avez pas) :");
                        msg = `Bonjour ${customerName} ! 🚚\nBonne nouvelle ! Votre commande (${tracking}) a été expédiée et est en route vers vous.`;
                        if (mapsLink) {
                            msg += `\n\n📍 Suivez votre livreur en temps réel ici : ${mapsLink}`;
                        }
                    } else if (newStatus === 'Livré') {
                        const reviewLink = `${window.location.origin}/vente?order_review=${order.id}`;
                        msg = `Bonjour ${customerName} ! 🌟\nVotre commande (${tracking}) a été livrée avec succès.\n\nPourriez-vous prendre 1 minute pour nous laisser un avis vérifié ? C'est très important pour nous.\nCliquez ici : ${reviewLink}\n\nMerci pour votre confiance !`;
                    } else if (newStatus === 'Annulé') {
                        msg = `Bonjour ${customerName},\nNous vous informons que votre commande (${tracking}) a été annulée. N'hésitez pas à nous contacter si vous avez des questions.`;
                    }

                    if (msg && confirm(`Le statut de la commande est passé à "${newStatus}".\n\nVoulez-vous envoyer une notification automatique au client sur WhatsApp ?`)) {
                        const rawPhone = String(order.customer.phone).replace(/\s+/g, '').replace(/[^0-9]/g, '');
                        const phoneWithPrefix = rawPhone.startsWith('221') ? rawPhone : `221${rawPhone}`;
                        window.open(`https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(msg)}`, '_blank');
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const generateAction = (type: 'fomo' | 'reactivation' | 'vip') => {
        let message = '';
        const clientName = client.name.split(' ')[0];

        switch (type) {
            case 'fomo':
                const categoryCounts = clientOrders.flatMap(o => o.items).reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
                message = `🔥 Offre Flash pour vous ${clientName} ! -20% sur toute la collection ${topCategory || 'préférée'} pendant 24h. Ne ratez pas ça !\n\nSigné, ${shopName}`;
                break;
            case 'reactivation':
                message = `😢 ${clientName}, vous nous manquez ! Profitez d'un bon d'achat de ${displayPrice(5000, currency)} sur votre prochaine commande. Offre limitée !\n\nSigné, ${shopName}`;
                break;
            case 'vip':
                message = `⭐ ${clientName}, vous êtes un client VIP ! En remerciement, voici un accès anticipé à notre nouvelle collection. Soyez le premier à la découvrir !\n\nSigné, ${shopName}`;
                break;
        }
        const whatsappUrl = `https://wa.me/${String(client.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const sendReceipt = (order: any) => {
        let message = `Bonjour ${client.name.split(' ')[0]},\n\nVoici le reçu de votre commande du ${new Date(order.date).toLocaleDateString('fr-FR')} chez ${shopName} :\n\n`;
        if (order.trackingNumber) message += `📦 Référence : ${order.trackingNumber}\n\n`;
        order.items.forEach((item: any) => {
            message += `- ${item.name} (x${item.quantity}) : ${displayPrice(item.price * item.quantity, currency)}\n`;
        });
        message += `\n*Total payé : ${displayPrice(order.total, currency)}*`;
        message += `\n\nMerci pour votre confiance ! À bientôt.`;

        const whatsappUrl = `https://wa.me/${String(client.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div id="modal-overlay" onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-black text-2xl">{client.name.charAt(0)}</div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white flex items-center gap-3">
                                {client.name}
                                {clientOrders.length > 5 && <span className="bg-yellow-400 text-black px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest align-middle shadow-sm">VIP ⭐</span>}
                            </h3>
                            <p className="text-sm font-bold text-[#39FF14]">{client.phone}</p>
                        </div>
                    </div>
                    <a href={`tel:${String(client.phone).replace(/[^0-9]/g, '')}`} className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center group" title="Appeler le client">
                        <Phone size={22} className="group-hover:text-[#39FF14] transition-colors"/>
                    </a>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4 -mr-4">
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Historique des Commandes ({clientOrders.length})</h4>
                        <div className="space-y-3">
                            {clientOrders.length > 0 ? clientOrders.map((order: any) => (
                                <div key={order.id} className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs font-bold">{new Date(order.date).toLocaleDateString('fr-FR')} à {new Date(order.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                                            {order.trackingNumber && <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Réf: {order.trackingNumber}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-sm text-[#39FF14]">{displayPrice(order.total, currency)}</p>
                                            {(() => {
                                                const orderCost = order.items?.reduce((sum: number, item: any) => sum + ((item.costPrice || 0) * item.quantity), 0) || 0;
                                                const orderMargin = order.total - orderCost;
                                                return <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Marge: <span className="text-[#39FF14]">{displayPrice(orderMargin, currency)}</span></p>;
                                            })()}
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1 mb-3">{order.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}</p>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                        <select 
                                            value={order.status || 'En attente'} 
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`text-[10px] font-bold uppercase px-2 py-1.5 rounded outline-none cursor-pointer border ${
                                                order.status === 'Livré' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                order.status === 'Payé' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                order.status === 'Expédié' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                order.status === 'En cours de préparation' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                order.status === 'Annulé' || order.status === 'Retour article' ? 'bg-red-100 text-red-700 border-red-200' : 
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}
                                        >
                                            <option value="En attente">En attente</option>
                                            <option value="Payé">Payé</option>
                                            <option value="En cours de préparation">En cours de préparation</option>
                                            <option value="Expédié">Expédié</option>
                                            <option value="Livré">Livré</option>
                                            <option value="Retour article">Retour article</option>
                                            <option value="Annulé">Annulé</option>
                                        </select>

                                        <button onClick={() => sendReceipt(order)} className="text-[10px] font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition text-black dark:text-white shadow-sm">
                                            <MessageSquare size={12} /> Envoyer reçu
                                        </button>
                                    </div>
                                </div>
                            )) : <p className="text-xs text-zinc-500 italic">Aucune commande trouvée.</p>}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2"><Sparkles size={14} className="text-[#39FF14]"/> Actions Marketing IA</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button onClick={() => generateAction('fomo')} className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center hover:border-black dark:hover:border-white transition"><p className="font-bold text-xs text-black dark:text-white">🔥 Offre Flash (FOMO)</p><p className="text-[10px] text-zinc-500 mt-1">Basé sur ses achats</p></button>
                            <button onClick={() => generateAction('reactivation')} className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center hover:border-black dark:hover:border-white transition"><p className="font-bold text-xs text-black dark:text-white">😢 Réactivation</p><p className="text-[10px] text-zinc-500 mt-1">Client inactif</p></button>
                            <button onClick={() => generateAction('vip')} className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center hover:border-black dark:hover:border-white transition"><p className="font-bold text-xs text-black dark:text-white">⭐ Traitement VIP</p><p className="text-[10px] text-zinc-500 mt-1">Meilleur client</p></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- PRODUCT DETAIL MODAL COMPONENT ---
interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: { size?: string; color?: string }, openCart?: boolean, qty?: number) => void;
  onBuyDirectly: (product: Product, variant?: { size?: string; color?: string }, qty?: number) => void;
  onShare: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onAddReview: (productId: number, review: Omit<Review, 'id' | 'date'>) => void;
  onGenerateQR: (product: Product) => void;
  currency: string;
  cart: CartItem[];
  shopPhone: string;
}

function ProductDetailModal({ product, allProducts, isOpen, onClose, onAddToCart, onBuyDirectly, onShare, onViewProduct, onGenerateQR, onAddReview, currency, cart, shopPhone }: ProductDetailModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedQty, setSelectedQty] = useState(1);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [mediaView, setMediaView] = useState<'image' | 'video'>('image');
  const [activeImage, setActiveImage] = useState(product?.image);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const galleryImages = React.useMemo(() => {
    return product ? [product.image, ...(product.gallery || [])].filter(Boolean) : [];
  }, [product]);

  const handleNextImage = React.useCallback(() => {
    if (galleryImages.length <= 1) return;
    if (isLightboxOpen) {
      setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
    } else if (mediaView === 'image') {
      setActiveImage((prev: string) => {
        const currentIndex = galleryImages.indexOf(prev);
        const nextIndex = currentIndex > -1 ? (currentIndex + 1) % galleryImages.length : 0;
        return galleryImages[nextIndex];
      });
    }
  }, [galleryImages, isLightboxOpen, mediaView]);

  const handlePrevImage = React.useCallback(() => {
    if (galleryImages.length <= 1) return;
    if (isLightboxOpen) {
      setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    } else if (mediaView === 'image') {
      setActiveImage((prev: string) => {
        const currentIndex = galleryImages.indexOf(prev);
        const nextIndex = currentIndex > -1 ? (currentIndex - 1 + galleryImages.length) % galleryImages.length : 0;
        return galleryImages[nextIndex];
      });
    }
  }, [galleryImages, isLightboxOpen, mediaView]);

  React.useEffect(() => {
    if (product) {
      setSelectedSizes([]);
      setSelectedColors([]);
      setSelectedQty(1);
      setMediaView('image');
      setActiveImage(product.image);
      setIsLightboxOpen(false);
      setLightboxIndex(0);
    }
  }, [product]);

  React.useEffect(() => {
    if (!product || galleryImages.length <= 1) return;
    const intervalId = setInterval(() => {
      handleNextImage();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [product, galleryImages.length, handleNextImage]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen || !product || galleryImages.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, galleryImages.length, handleNextImage, handlePrevImage, isLightboxOpen]);

  if (!isOpen || !product) return null;

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNextImage();
    if (distance < -minSwipeDistance) handlePrevImage();
  };

  const similarProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  const qtyInCart = cart.filter(i => i.id === product.id).reduce((sum, i) => sum + i.quantity, 0);
  const maxAvailable = product.stock !== undefined ? Math.max(0, product.stock - qtyInCart) : Infinity;
  const isMaxedOut = selectedQty >= maxAvailable;
  const isOutOfStock = product.stock === 0 || maxAvailable === 0;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return alert("Veuillez remplir votre nom et votre commentaire.");
    onAddReview(product.id, newReview);
    setNewReview({ name: '', rating: 5, comment: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto" onClick={onClose}>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row my-auto" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black transition z-10"><X size={20}/></button>
            
            <div className="w-full md:w-1/2 flex flex-col bg-zinc-100 dark:bg-zinc-900">
                <div className="flex-1 relative min-h-[300px] bg-zinc-100 dark:bg-zinc-900">
                   {mediaView === 'image' || !product.videoUrl ? (
                        <div 
                          className="w-full h-full absolute inset-0 overflow-hidden cursor-zoom-in group/img" 
                          onClick={(e) => { e.stopPropagation(); setLightboxIndex(galleryImages.indexOf(activeImage) > -1 ? galleryImages.indexOf(activeImage) : 0); setIsLightboxOpen(true); }}
                          onTouchStart={onTouchStart}
                          onTouchMove={onTouchMove}
                          onTouchEnd={onTouchEnd}
                        >
                            <img src={activeImage} alt={product.name} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                <Search className="text-white drop-shadow-lg" size={32} />
                            </div>
                            {galleryImages.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors opacity-0 group-hover/img:opacity-100 z-20">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors opacity-0 group-hover/img:opacity-100 z-20">
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                            {galleryImages.length > 1 && (
                               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md" onClick={e => e.stopPropagation()}>
                                  {galleryImages.map((img: string, idx: number) => (
                                     <button 
                                       key={idx} 
                                       onClick={(e) => { e.stopPropagation(); setActiveImage(img); setLightboxIndex(idx); }}
                                       className={`w-2 h-2 rounded-full transition-all ${activeImage === img ? 'bg-[#39FF14] scale-125' : 'bg-white/50 hover:bg-white'}`}
                                     />
                                  ))}
                               </div>
                            )}
                        </div>
                    ) : (
                        <iframe
                            className="w-full h-full absolute inset-0"
                            src={getEmbedUrl(product.videoUrl)}
                            title={product.name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    )}
                    {product.videoUrl && (
                        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                            <button onClick={(e) => {e.stopPropagation(); setMediaView('image')}} className={`px-4 py-2 rounded-lg text-xs font-bold border backdrop-blur-sm transition-colors ${mediaView === 'image' ? 'bg-white/80 text-black border-black' : 'bg-black/30 text-white border-white/30 hover:bg-black/50'}`}>Image</button>
                            <button onClick={(e) => {e.stopPropagation(); setMediaView('video')}} className={`px-4 py-2 rounded-lg text-xs font-bold border backdrop-blur-sm transition-colors ${mediaView === 'video' ? 'bg-white/80 text-black border-black' : 'bg-black/30 text-white border-white/30 hover:bg-black/50'}`}>Vidéo</button>
                        </div>
                    )}
                </div>
                {Array.isArray(product.gallery) && product.gallery.length > 0 && mediaView === 'image' && (
                    <div className="p-4 flex gap-3 overflow-x-auto bg-white dark:bg-zinc-950 shrink-0 border-t border-zinc-200 dark:border-zinc-800 custom-scrollbar">
                        <button onClick={() => setActiveImage(product.image)} className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.image ? 'border-[#39FF14]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                            <img src={product.image} className="w-full h-full object-cover bg-zinc-100 dark:bg-zinc-900" />
                        </button>
                        {product.gallery.map((img: string, idx: number) => (
                            <button key={idx} onClick={() => setActiveImage(img)} className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[#39FF14]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                <img src={img} className="w-full h-full object-cover bg-zinc-100 dark:bg-zinc-900" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="w-full md:w-1/2 p-8 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
               <div className="mb-8">
                  <span className="text-[#39FF14] text-xs font-bold uppercase tracking-widest border border-[#39FF14]/20 px-3 py-1 rounded-full mb-4 inline-block">{product.category}</span>
                  <h2 className="text-3xl font-black tracking-tighter text-black dark:text-white mb-2">{product.name}</h2>
                  <div className="flex items-center gap-3 mb-6">
                      <p className="text-2xl font-bold text-black dark:text-white">{displayPrice(product.price, currency)}</p>
                      {product.oldPrice && product.oldPrice > product.price && (
                          <>
                              <p className="text-lg text-zinc-500 line-through">{displayPrice(product.oldPrice, currency)}</p>
                              <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-xs font-black">-{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</span>
                          </>
                      )}
                  </div>
                  
                  {product.stock !== undefined && (
                    <p className={`text-sm font-bold mb-6 ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
                      {isOutOfStock ? 'Épuisé' : `En stock (${product.stock} restants)`}
                    </p>
                  )}

                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">{product.description || "Aucune description fournie pour ce produit."}</p>

                  <div className="flex items-center gap-2 mb-6 bg-zinc-100 dark:bg-zinc-900 w-max px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex text-yellow-400 cursor-pointer" title="Noter ce produit">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={16} 
                          className={star <= Math.round(product.rating || 5) ? 'fill-yellow-400 hover:scale-125 transition-transform' : 'text-zinc-300 dark:text-zinc-700 hover:scale-125 transition-transform'} 
                          onClick={(e) => { 
                              e.stopPropagation(); 
                              setNewReview(prev => ({...prev, rating: star})); 
                              document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                              setTimeout(() => { document.getElementById('review-comment-input')?.focus({ preventScroll: true }); }, 500);
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-black dark:text-white ml-2">{product.rating || 5}/5</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium border-l border-zinc-300 dark:border-zinc-700 pl-2 ml-1">{product.reviews || 0} avis vérifiés</span>
                  </div>

                  {/* VARIANTS SELECTION */}
                  {product?.variants?.sizes && Array.isArray(product.variants.sizes) && product.variants.sizes.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-1">Taille(s) <span className="text-red-500">* (Sélection multiple possible)</span></p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.sizes.map((size: VariantOption) => (
                          <button 
                            key={size.name} 
                            onClick={() => setSelectedSizes(prev => prev.includes(size.name) ? prev.filter(s => s !== size.name) : [...prev, size.name])}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${selectedSizes.includes(size.name) ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500'}`}
                          >
                            {size.name} {size.priceModifier !== 0 ? `(${size.priceModifier > 0 ? '+' : ''}${displayPrice(size.priceModifier, currency)})` : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product?.variants?.colors && Array.isArray(product.variants.colors) && product.variants.colors.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-1">Couleur(s) <span className="text-red-500">* (Sélection multiple possible)</span></p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.colors.map((color: VariantOption) => (
                          <button 
                            key={color.name} 
                            onClick={() => setSelectedColors(prev => prev.includes(color.name) ? prev.filter(c => c !== color.name) : [...prev, color.name])}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${selectedColors.includes(color.name) ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500'}`}
                          >
                            {color.name} {color.priceModifier !== 0 ? `(${color.priceModifier > 0 ? '+' : ''}${displayPrice(color.priceModifier, currency)})` : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QUANTITY SELECTION */}
                  <div className="mb-6 flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 w-max p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-500 uppercase ml-2">Quantité</span>
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg shadow-sm">
                      <button onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))} className="p-1 hover:text-[#39FF14] transition-colors"><Minus size={14}/></button>
                      <input 
                        type="number" 
                        min={1} 
                        max={maxAvailable !== Infinity ? maxAvailable : undefined}
                        value={selectedQty || ''}
                        onChange={(e) => {
                          if (e.target.value === '') return setSelectedQty(0 as any); // Permet de vider la case temporairement
                          const val = parseInt(e.target.value);
                          if (isNaN(val)) return;
                          setSelectedQty(Math.min(Math.max(1, val), maxAvailable !== Infinity ? maxAvailable : val));
                        }}
                        disabled={isOutOfStock}
                        className="font-black text-sm w-12 text-center bg-transparent outline-none text-black dark:text-white disabled:opacity-50"
                      />
                      <button onClick={() => setSelectedQty(isMaxedOut ? selectedQty : selectedQty + 1)} disabled={isMaxedOut || isOutOfStock} className="p-1 hover:text-[#39FF14] transition-colors disabled:opacity-50"><Plus size={14}/></button>
                    </div>
                  </div>
               </div>
               
               <div className="flex flex-col gap-3 mb-8 mt-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => { 
                          if ((product.variants?.sizes?.length || 0) > 0 && selectedSizes.length === 0) return alert("Veuillez sélectionner au moins une taille.");
                          if ((product.variants?.colors?.length || 0) > 0 && selectedColors.length === 0) return alert("Veuillez sélectionner au moins une couleur.");
                          onAddToCart(product, { size: selectedSizes.join(', ') || undefined, color: selectedColors.join(', ') || undefined }, true, selectedQty || 1); 
                          onClose();
                        }} 
                        disabled={isOutOfStock || selectedQty === 0}
                        className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white py-4 rounded-xl font-black uppercase text-[11px] sm:text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <Plus size={18} /> {maxAvailable === 0 && product.stock !== 0 ? "Limite panier" : "Ajouter"}
                      </button>
                      <button 
                        onClick={() => { 
                          if ((product.variants?.sizes?.length || 0) > 0 && selectedSizes.length === 0) return alert("Veuillez sélectionner au moins une taille.");
                          if ((product.variants?.colors?.length || 0) > 0 && selectedColors.length === 0) return alert("Veuillez sélectionner au moins une couleur.");
                          onBuyDirectly(product, { size: selectedSizes.join(', ') || undefined, color: selectedColors.join(', ') || undefined }, selectedQty || 1); 
                          onClose();
                        }} 
                        disabled={isOutOfStock || selectedQty === 0}
                        className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase text-[11px] sm:text-sm hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition flex items-center justify-center gap-2 shadow-lg disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed"
                      >
                         <ShoppingCart size={18} /> Acheter Directement
                      </button>
                  </div>
                  <button 
                        onClick={() => {
                            const productUrl = `${window.location.origin}/vente?product=${product.id}`;
                            const message = `Bonjour, je suis intéressé(e) par le produit *${product.name}* (${displayPrice(product.price, currency)}).\nLien : ${productUrl}\n\nJ'ai une question : `;
                            window.open(`https://wa.me/${String(shopPhone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black uppercase text-[11px] sm:text-sm hover:bg-[#1ebd58] transition flex items-center justify-center gap-2 shadow-lg"
                      >
                         <MessageSquare size={18} /> Continuer sur WhatsApp
                      </button>
                  <div className="flex gap-3">
                    <button onClick={() => onShare(product)} className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white py-4 rounded-xl font-bold uppercase text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800">
                       <Share2 size={18} /> Partager
                    </button>
                    <button onClick={() => onGenerateQR(product)} className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white py-4 rounded-xl font-bold uppercase text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800">
                       <QrCode size={18} /> QRCode
                    </button>
                  </div>
               </div>

               {/* REVIEWS SECTION */}
               <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase mb-4">Avis des clients</h4>
                  <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {(product.reviewsList || []).length > 0 ? product.reviewsList?.map(review => (
                      <div key={review.id} className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-black dark:text-white">{review.name}</span>
                          <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-400 dark:text-zinc-600'} />)}</div>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{review.comment}</p>
                        {review.admin_reply && (
                          <div className="mt-3 p-3 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-lg border-l-2 border-[#39FF14]">
                            <p className="text-[10px] font-black uppercase text-[#39FF14] mb-1 flex items-center gap-1"><MessageSquare size={10}/> Réponse du vendeur</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">"{review.admin_reply}"</p>
                          </div>
                        )}
                      </div>
                    )) : <p className="text-xs text-zinc-500 dark:text-zinc-500 italic">Aucun avis pour ce produit.</p>}
                  </div>

                  {/* Add Review Form */}
                  <form id="review-form" onSubmit={handleReviewSubmit} className="space-y-3">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Laisser un avis</p>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setNewReview({...newReview, rating: star})} className="hover:scale-110 transition-transform">
                          <Star size={24} className={star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300 dark:text-zinc-700'} />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Votre nom" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14]" />
                    </div>
                    <textarea 
                      id="review-comment-input"
                      placeholder="Votre commentaire..." 
                      value={newReview.comment} 
                      onChange={e => setNewReview({...newReview, comment: e.target.value})}
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14] min-h-[60px]"
                    />
                    <button type="submit" className="w-full bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white py-2 rounded-lg text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">Envoyer</button>
                  </form>
               </div>

               {/* SIMILAR PRODUCTS */}
               {similarProducts.length > 0 && (
                 <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 mt-8">
                    <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase mb-4">Vous aimerez aussi</h4>
                    <div className="grid grid-cols-3 gap-4">
                       {similarProducts.map((p: any) => (
                          <div key={p.id} className="group cursor-pointer" onClick={() => onViewProduct(p)}>
                             <div className="aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             </div>
                             <p className="text-xs font-bold text-black dark:text-white truncate">{p.name}</p>
                             <p className="text-[10px] text-zinc-500 dark:text-zinc-500">{displayPrice(p.price, currency)}</p>
                          </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
            
            {/* LIGHTBOX INSIDE THE MODAL TO COVER IT */}
            {isLightboxOpen && (
                <div 
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-sm animate-in fade-in" 
                  onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <button onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }} className="absolute top-6 right-6 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10 backdrop-blur-md">
                      <X size={24}/>
                  </button>
                  
                  {galleryImages.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} className="absolute left-4 sm:left-8 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10 backdrop-blur-md">
                          <ChevronLeft size={24}/>
                      </button>
                  )}

                  <img 
                      src={galleryImages[lightboxIndex] || product.image} 
                      alt={product.name} 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 cursor-zoom-out" 
                      onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
                  />

                  {galleryImages.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }} className="absolute right-4 sm:right-8 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10 backdrop-blur-md">
                          <ChevronRight size={24}/>
                      </button>
                  )}

                  {galleryImages.length > 1 && (
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                        {galleryImages.map((_, idx) => (
                           <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === lightboxIndex ? 'bg-[#39FF14]' : 'bg-white/30'}`} />
                        ))}
                     </div>
                  )}
              </div>
            )}
        </div>
    </div>
  );
}

function ShopDashboard({ products, productViews, viewHistory, onUpdateStock, onViewProduct, currency, setShopView, orders, refreshOrders, shopName, shopLogo, recentReviews }: { products: Product[], productViews: Record<number, number>, viewHistory: Record<string, number>, onUpdateStock: (id: number, val: number) => void, onViewProduct: (product: Product) => void, currency: string, setShopView: React.Dispatch<React.SetStateAction<'boutique' | 'dashboard' | 'settings' | 'clients' | 'page-builder' | 'planning' | 'reviews'>>, orders: any[], refreshOrders: () => void, shopName: string, shopLogo: string, recentReviews?: any[] }) {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');
  const [selectedDayOrders, setSelectedDayOrders] = useState<{date: string, orders: any[]} | null>(null);
  const [historyModalOrder, setHistoryModalOrder] = useState<any | null>(null);
  const [popularCategory, setPopularCategory] = useState('Toutes');
  const [showAbandoned, setShowAbandoned] = useState(false);

  const [simulator, setSimulator] = useState({
      taxRate: 18,
      shippingSpend: 0,
      packagingSpend: 0,
      marketingSpend: 0,
      customsSpend: 0,
      paymentFeePct: 1,
      show: false
  });

  const productCategories = ['Toutes', ...Array.from(new Set(products.map(p => p.category)))];

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
        const order = orders.find(o => o.id === orderId);
        const newHistory = [...(order?.history || []), { status: newStatus, date: new Date().toISOString(), user: 'Administrateur' }];
        const updateFn = (o: any) => o.id === orderId ? { ...o, status: newStatus, history: newHistory } : o;
        
        // Mise à jour optimiste instantanée de l'interface
        if (selectedDayOrders) {
            setSelectedDayOrders(prev => prev ? { ...prev, orders: prev.orders.map(updateFn) } : prev);
        }

        try {
            const { error } = await supabase.from('orders').update({ status: newStatus, history: newHistory }).eq('id', orderId);
            if (error) {
                console.error("Erreur mise à jour statut:", error.message);
            } else {
                // Rafraîchir la liste depuis la source de données principale
                refreshOrders();

                // --- NOTIFICATION WHATSAPP CLIENT AUTOMATISÉE ---
                if (order && order.customer?.phone) {
                    let msg = '';
                    const customerName = order.customer.name.split(' ')[0];
                    const tracking = order.trackingNumber || order.tracking_number || order.id;
                    
                    if (newStatus === 'En cours de préparation') {
                        msg = `Bonjour ${customerName} ! 📦\nVotre commande (${tracking}) est actuellement en cours de préparation par notre équipe. Nous vous informerons dès qu'elle sera remise au livreur.`;
                    } else if (newStatus === 'Expédié') {
                        const mapsLink = prompt("Veuillez coller le lien de suivi Google Maps du livreur (Laissez vide si vous n'en avez pas) :");
                        msg = `Bonjour ${customerName} ! 🚚\nBonne nouvelle ! Votre commande (${tracking}) a été expédiée et est en route vers vous.`;
                        if (mapsLink) {
                            msg += `\n\n📍 Suivez votre livreur en temps réel ici : ${mapsLink}`;
                        }
                    } else if (newStatus === 'Livré') {
                        const reviewLink = `${window.location.origin}/vente?order_review=${order.id}`;
                        msg = `Bonjour ${customerName} ! 🌟\nVotre commande (${tracking}) a été livrée avec succès.\n\nPourriez-vous prendre 1 minute pour nous laisser un avis vérifié ? C'est très important pour nous.\nCliquez ici : ${reviewLink}\n\nMerci pour votre confiance !`;
                    } else if (newStatus === 'Annulé') {
                        msg = `Bonjour ${customerName},\nNous vous informons que votre commande (${tracking}) a été annulée. N'hésitez pas à nous contacter si vous avez des questions.`;
                    }

                    if (msg && confirm(`Le statut de la commande est passé à "${newStatus}".\n\nVoulez-vous envoyer automatiquement la notification de suivi au client sur WhatsApp ?`)) {
                        const rawPhone = String(order.customer.phone).replace(/\s+/g, '').replace(/[^0-9]/g, '');
                        const phoneWithPrefix = rawPhone.startsWith('221') ? rawPhone : `221${rawPhone}`;
                        window.open(`https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(msg)}`, '_blank');
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
  };

  const updateOrderDriver = async (orderId: number, driverName: string) => {
        const updateFn = (o: any) => o.id === orderId ? { ...o, delivery_driver: driverName } : o;
        if (selectedDayOrders) {
            setSelectedDayOrders(prev => prev ? { ...prev, orders: prev.orders.map(updateFn) } : prev);
        }
        try {
            await supabase.from('orders').update({ delivery_driver: driverName }).eq('id', orderId);
            refreshOrders();
        } catch (err) {
            console.error(err);
        }
  };

  useEffect(() => {
    setLowStockProducts(products.filter(p => (p.stock || 0) < 5 && p.stock !== 0));
  }, [products]);

  const { 
    totalRevenue, totalCost, totalOrders, totalClients, averageOrderValue, netMargin,
    revenueTrend, ordersTrend, clientsTrend, avgOrderTrend, marginTrend,
    bestSellers
  } = useMemo(() => {
    const isPeriodSelected = dateFilter.start && dateFilter.end;

    const currentOrders = orders.filter(o => {
        if (o.status === 'Panier abandonné') return false; // Ne pas compter dans les stats
        if (!isPeriodSelected) return true;
        const d = new Date(o.date);
        const start = new Date(dateFilter.start);
        const end = new Date(dateFilter.end);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return d >= start && d <= end;
    });

    const revenue = currentOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const totalCost = currentOrders.reduce((sum, order) => sum + (order.items || []).reduce((iSum: number, item: CartItem) => iSum + ((Number(item.costPrice) || 0) * (Number(item.quantity) || 0)), 0), 0);
    const margin = revenue - totalCost;
    const TOrders = currentOrders.length;
    const TClients = new Set(currentOrders.map(o => o.customer?.phone).filter(Boolean)).size;
    const avgOrder = TOrders > 0 ? revenue / TOrders : 0;

    let trends: {
      revenueTrend: number | null;
      ordersTrend: number | null;
      clientsTrend: number | null;
      avgOrderTrend: number | null;
      marginTrend: number | null;
    } = { revenueTrend: null, ordersTrend: null, clientsTrend: null, avgOrderTrend: null, marginTrend: null };

    if (isPeriodSelected) {
        const startDate = new Date(dateFilter.start);
        const endDate = new Date(dateFilter.end);
        const duration = endDate.getTime() - startDate.getTime();

        if (duration >= 0) {
            const previousEndDate = new Date(startDate.getTime() - 1);
            const previousStartDate = new Date(previousEndDate.getTime() - duration);

            const previousPeriodOrders = orders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate >= previousStartDate && orderDate <= previousEndDate;
            });

            const prevRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.total, 0);
            const prevTotalCost = previousPeriodOrders.reduce((sum, order) => sum + order.items.reduce((iSum: number, item: CartItem) => iSum + ((item.costPrice || 0) * item.quantity), 0), 0);
            const prevMargin = prevRevenue - prevTotalCost;
            const prevOrders = previousPeriodOrders.length;
            const prevClients = new Set(previousPeriodOrders.map(o => o.customer?.phone).filter(Boolean)).size;
            const prevAvgOrder = prevOrders > 0 ? prevRevenue / prevOrders : 0;

            const calculateTrend = (current: number, previous: number) => {
                if (previous === 0) return current > 0 ? 999 : 0;
                return ((current - previous) / previous) * 100;
            };

            trends.revenueTrend = calculateTrend(revenue, prevRevenue);
            trends.ordersTrend = calculateTrend(TOrders, prevOrders);
            trends.clientsTrend = calculateTrend(TClients, prevClients);
            trends.avgOrderTrend = calculateTrend(avgOrder, prevAvgOrder);
            trends.marginTrend = calculateTrend(margin, prevMargin);
        }
    }
    
    const productSales = new Map<number, { quantity: number, name: string, image: string, category: string }>();
    currentOrders.forEach(order => {
        order.items.forEach((item: CartItem) => {
          const sold = productSales.get(item.id) || { quantity: 0, name: item.name, image: item.image, category: item.category };
          productSales.set(item.id, { ...sold, quantity: sold.quantity + item.quantity });
        });
    });
    const localBestSellers = [...productSales.entries()].sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 5);

    return { 
        totalRevenue: revenue, totalCost: totalCost, totalOrders: TOrders, totalClients: TClients, averageOrderValue: avgOrder, netMargin: margin,
        ...trends,
        bestSellers: localBestSellers
    };
  }, [orders, dateFilter]);

  const salesByCategory = useMemo(() => {
    const categorySales: Record<string, number> = {};
    const isPeriodSelected = dateFilter.start && dateFilter.end;
    const currentOrders = orders.filter(o => {
        if (o.status === 'Panier abandonné') return false;
        if (!isPeriodSelected) return true;
        const d = new Date(o.date);
        const start = new Date(dateFilter.start);
        const end = new Date(dateFilter.end);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return d >= start && d <= end;
    });
    currentOrders.forEach(order => {
      order.items.forEach((item: CartItem) => {
        const category = item.category || 'Non classé';
        if (!categorySales[category]) {
          categorySales[category] = 0;
        }
        categorySales[category] += item.price * item.quantity;
      });
    });
    return Object.entries(categorySales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [orders, dateFilter]);

  const mostViewed = [...products]
    .sort((a, b) => (productViews[b.id] || 0) - (productViews[a.id] || 0))
    .slice(0, 5);

  const maxProductViews = Math.max(...mostViewed.map(p => productViews[p.id] || 0), 1);


  const chartData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();
    const data: any[] = [];
    const range = chartPeriod === 'week' ? 7 : 30;
    
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      
      const dailyTotal = orders
        .filter(o => o.date.startsWith(dayStr) && o.status !== 'Panier abandonné')
        .reduce((sum, o) => sum + o.total, 0);
        
      data.push({ 
          day: chartPeriod === 'week' ? days[d.getDay()] : d.getDate().toString(), 
          total: dailyTotal,
          fullDate: dayStr
      });
    }
    return data;
  }, [orders, chartPeriod]);

  const viewsChartData = (() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();
    const data: any[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const count = viewHistory[dayStr] || 0;
        data.push({ day: days[d.getDay()], count });
    }
    return data;
  })();
  const maxViews = Math.max(...viewsChartData.map(d => d.count), 5);

  const newClientsChartData = useMemo(() => {
    const firstOrders = new Map<string, Date>();
    orders.forEach(o => {
        if (o.customer?.phone && o.status !== 'Annulé' && o.status !== 'Panier abandonné') {
            const orderDate = new Date(o.date);
            const existing = firstOrders.get(o.customer.phone);
            if (!existing || orderDate < existing) {
                firstOrders.set(o.customer.phone, orderDate);
            }
        }
    });

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const data: any[] = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
        
        let count = 0;
        firstOrders.forEach((date) => {
            if (date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()) {
                count++;
            }
        });
        
        data.push({ label: monthLabel, count });
    }
    return data;
  }, [orders]);
  const maxNewClients = Math.max(...newClientsChartData.map(d => d.count), 5);

  const maxTotal = Math.max(...chartData.map(d => d.total), 1);

  const simTVA = totalRevenue - (totalRevenue / (1 + simulator.taxRate / 100));
  const simRevHT = totalRevenue - simTVA;
  const simCogs = totalCost;
  const simFees = totalRevenue * (simulator.paymentFeePct / 100);
  const simOtherCharges = simulator.marketingSpend + simulator.packagingSpend + simulator.shippingSpend + simulator.customsSpend;
  const simTotalCharges = simCogs + simFees + simOtherCharges;
  const simNetProfit = simRevHT - simTotalCharges;
  const simMarginPct = simRevHT > 0 ? (simNetProfit / simRevHT) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  const handlePrintDayOrders = (dayOrders: {date: string, orders: any[]}) => {
    if (!dayOrders || dayOrders.orders.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour imprimer.");
      return;
    }

    const dayRev = dayOrders.orders.reduce((sum, o) => sum + o.total, 0);
    const dayCost = dayOrders.orders.reduce((sum, o) => sum + o.items.reduce((iSum: number, item: any) => iSum + ((item.costPrice || 0) * item.quantity), 0), 0);
    const dayMargin = dayRev - dayCost;

    const ordersHtml = dayOrders.orders.map(order => `
      <div style="border-bottom: 1px solid #eee; padding: 16px 0; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <p style="font-weight: bold; margin: 0; font-size: 16px;">${order.customer.name}</p>
            <p style="font-size: 14px; color: #555; margin: 4px 0 0;">${order.customer.phone}</p>
          </div>
          <p style="font-weight: 900; font-size: 20px; margin: 0; color: #2ecc71;">${order.total.toLocaleString('fr-FR')} F</p>
        </div>
        <p style="font-size: 14px; color: #333; margin: 0; padding-top: 8px;">
          <strong>Articles:</strong> ${order.items.map((item: CartItem) => `${item.name} (x${item.quantity})`).join(', ')}
        </p>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Commandes du ${new Date(dayOrders.date).toLocaleDateString('fr-FR')}</title>
          <style> body { font-family: sans-serif; padding: 20px; } h1 { text-transform: uppercase; } </style>
        </head>
        <body>
          <h1>Commandes du ${new Date(dayOrders.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</h1>
          <div style="display: flex; gap: 20px; font-weight: bold; margin-bottom: 30px; font-size: 16px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
              <p style="margin: 0;">Chiffre d'affaires : ${dayRev.toLocaleString('fr-FR')} F</p>
              <p style="margin: 0; color: #2ecc71;">Marge Brute : ${dayMargin.toLocaleString('fr-FR')} F</p>
          </div>
          ${ordersHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handlePrintSingleInvoice = (order: any, isPdf: boolean = false) => {
    const clientOrdersCount = orders.filter(o => o.customer?.phone === order.customer?.phone && o.status !== 'Annulé').length;
    const isVip = clientOrdersCount > 5;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour imprimer.");
      return;
    }

    const itemsHtml = order.items.map((item: CartItem) => `
      <tr>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px;">${item.name} ${item.selectedVariant?.size || item.selectedVariant?.color ? `<br><span style="font-size: 11px; color: #777;">${[item.selectedVariant.size, item.selectedVariant.color].filter(Boolean).join(', ')}</span>` : ''}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">${displayPrice(item.price, currency)}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">${displayPrice(item.price * item.quantity, currency)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Facture ${order.trackingNumber || order.tracking_number || order.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 0; background: #fff; }
            #invoice-content { padding: 40px; max-width: 800px; margin: 0 auto; background: #fff; }
            h1 { color: #000; font-size: 36px; font-weight: 900; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: -1.5px; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; align-items: flex-end; }
            .header-right { text-align: right; }
            .header-right p { margin: 2px 0; font-size: 14px; color: #555; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-radius: 12px; }
            .info-box { width: 48%; }
            .info-box h3 { font-size: 11px; text-transform: uppercase; color: #888; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; letter-spacing: 1px; }
            .info-box p { margin: 4px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #000; color: #fff; padding: 12px 15px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .totals { width: 50%; float: right; background: #f9f9f9; padding: 20px; border-radius: 12px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #555; }
            .total-row.final { font-weight: 900; font-size: 24px; border-top: 2px solid #ddd; margin-top: 10px; padding-top: 15px; color: #000; }
            .footer { clear: both; text-align: center; padding-top: 50px; font-size: 12px; color: #aaa; }
          </style>
          ${isPdf ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>` : ''}
        </head>
        <body>
          <div id="invoice-content">
          <div class="header">
            <div style="display: flex; align-items: center; gap: 15px;">
              ${shopLogo ? `<img src="${shopLogo}" alt="Logo" style="max-height: 80px; max-width: 200px; object-fit: contain; border-radius: 8px;" />` : ''}
              <div>
                <h1 style="font-size: 32px; letter-spacing: -1px; line-height: 1; margin: 0;">FACTURE</h1>
                <p style="margin: 4px 0 0 0; font-size: 18px; color: #222; font-weight: 900; text-transform: uppercase;">${shopName}</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold; color: #777;">Réf: ${order.trackingNumber || order.tracking_number || order.id}</p>
              </div>
            </div>
            <div class="header-right">
              <p><strong>Date:</strong> ${new Date(order.date || order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p><strong>Heure:</strong> ${new Date(order.date || order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Facturé à</h3>
              <p style="font-weight: bold; font-size: 16px; color: #000;">
                ${order.customer?.name}
                ${isVip ? '<span style="background-color: #ffd700; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px; vertical-align: middle; text-transform: uppercase;">VIP ⭐</span>' : ''}
              </p>
              <p>${order.customer?.phone}</p>
              ${(order.deliveryMethod === 'delivery' || order.delivery_method === 'delivery') ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #ddd;">
                  <p style="font-weight: bold; margin-bottom: 4px;">🚚 Livraison à domicile</p>
                  ${order.deliveryZone || order.delivery_zone ? `<p style="font-size: 13px; color: #555; margin: 2px 0;"><strong>Zone :</strong> ${order.deliveryZone || order.delivery_zone}</p>` : ''}
                  ${order.customer?.address || order.customer_address ? `<p style="font-size: 13px; color: #555; margin: 2px 0;"><strong>Adresse :</strong> ${order.customer?.address || order.customer_address}</p>` : ''}
                  ${order.customer?.instructions || order.delivery_instructions ? `<p style="font-size: 13px; color: #555; margin: 2px 0;"><strong>Note :</strong> ${order.customer?.instructions || order.delivery_instructions}</p>` : ''}
                </div>
              ` : (order.deliveryMethod === 'pickup' || order.delivery_method === 'pickup') ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #ddd;">
                  <p style="font-weight: bold;">🏬 Retrait en boutique</p>
                </div>
              ` : ''}
            </div>
            <div class="info-box">
              <h3>Informations de commande</h3>
              <p><strong>Statut:</strong> ${order.status || 'En attente'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th style="text-align: center;">Qté</th>
                <th style="text-align: right;">P.U</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            ${order.pointsUsed ? `
            <div class="total-row">
              <span>Points Fidélité utilisés</span>
              <span>-${displayPrice(order.pointsUsed * 10, currency)}</span>
            </div>
            ` : ''}
            <div class="total-row final">
              <span>TOTAL NET</span>
              <span>${displayPrice(order.total || order.total_amount, currency)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Merci de votre confiance !</p>
            <p>Document généré informatiquement par OnyxOps.</p>
          </div>
          </div>
          ${isPdf ? `
          <script>
            const checkAndGenerate = () => {
              if (typeof html2pdf !== 'undefined' && document.readyState === 'complete') {
                const element = document.getElementById('invoice-content');
                const opt = {
                  margin:       10,
                  filename:     'Facture_${order.trackingNumber || order.tracking_number || order.id}.pdf',
                  image:        { type: 'jpeg', quality: 0.98 },
                  html2canvas:  { scale: 2, useCORS: true },
                  jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save().then(() => {
                   setTimeout(() => window.close(), 1000);
                }).catch(err => console.error('Erreur PDF:', err));
              } else {
                setTimeout(checkAndGenerate, 200);
              };
            };
            checkAndGenerate();
          </script>
          ` : `
          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); }, 250);
            };
          </script>
          `}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  const handleExportDayOrdersToCSV = (dayOrders: {date: string, orders: any[]}) => {
      if (!dayOrders || dayOrders.orders.length === 0) {
          alert("Aucune commande à exporter pour ce jour.");
          return;
      }

      const flattenedData = dayOrders.orders.flatMap(order => 
          order.items.map((item: CartItem) => ({
              'Date': new Date(order.date).toLocaleDateString('fr-FR'),
              'Client': order.customer.name,
              'Téléphone': order.customer.phone,
              'Produit': item.name,
              'Quantité': item.quantity,
              'Prix Unitaire (FCFA)': item.price,
              'Coût Unitaire (FCFA)': item.costPrice || 0,
              'Total Ligne (FCFA)': item.price * item.quantity,
              'Marge Ligne (FCFA)': (item.price - (item.costPrice || 0)) * item.quantity,
              'ID Commande': order.id,
          }))
      );

      const worksheet = XLSX.utils.json_to_sheet(flattenedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Commandes ${dayOrders.date}`);
      XLSX.writeFile(workbook, `commandes_${dayOrders.date}.xlsx`);
  };

  const handleExportNewClientsToCSV = () => {
      const worksheet = XLSX.utils.json_to_sheet(newClientsChartData.map(d => ({
          'Mois': d.label,
          'Nouveaux Clients': d.count
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Nouveaux Clients");
      XLSX.writeFile(workbook, `onyx_nouveaux_clients_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const StatCard = ({ icon, label, value, colorClass, trend, onClick }: { icon: React.ReactNode, label: string, value: string | number, colorClass: string, trend?: number | null, onClick?: () => void }) => (
    <div onClick={onClick} className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex flex-col justify-between h-full text-left transition-all ${colorClass} ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default'}`}>
        <div className="flex justify-between items-start">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`}>
            {icon}
            </div>
            {trend != null && trend !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {trend > 0 ? <TrendingUp size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend).toFixed(0)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider mt-4">{label}</p>
            <p className="text-black dark:text-white font-black text-3xl">{value}</p>
        </div>
    </div>
  );

  return (
    <div id="dashboard-section" className="p-8 md:p-12 pt-32 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: landscape !important; margin: 10mm; } }` }} />
      
      {/* EN-TÊTE INVISIBLE SUR ÉCRAN - VISIBLE SEULEMENT EN EXPORT PDF */}
      <div className="hidden print:flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
         <div className="flex items-center gap-4">
            {shopLogo && <img src={shopLogo} alt="Logo Boutique" className="h-16 w-auto object-contain" />}
            <div>
                <h1 className="text-2xl font-black uppercase">{shopName}</h1>
                <p className="text-sm font-bold text-zinc-500">Rapport de Performance Global</p>
            </div>
         </div>
         <div className="text-right">
            <p className="font-bold text-sm">Édité le {new Date().toLocaleDateString('fr-FR')}</p>
            <p className="text-xs text-zinc-500">Période : {dateFilter.start && dateFilter.end ? `${new Date(dateFilter.start).toLocaleDateString('fr-FR')} au ${new Date(dateFilter.end).toLocaleDateString('fr-FR')}` : 'Toutes les ventes depuis le début'}</p>
         </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 print:hidden">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Tableau de <span className="text-[#39FF14]">Bord</span></h2>
        <div className="flex gap-2 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 px-2">
                <Calendar size={16} className="text-zinc-400"/>
                <input 
                    type="date" 
                    value={dateFilter.start} 
                    onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})} 
                    className="bg-transparent text-xs font-bold outline-none text-black dark:text-white w-28"
                />
                <span className="text-zinc-400">-</span>
                <input 
                    type="date" 
                    value={dateFilter.end} 
                    onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})} 
                    className="bg-transparent text-xs font-bold outline-none text-black dark:text-white w-28"
                />
                <button onClick={() => { const t = new Date().toISOString().split('T')[0]; setDateFilter({ start: t, end: t }); }} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition ml-2 text-xs font-bold shadow-sm">
                    Aujourd'hui
                </button>
                <button onClick={() => { const d = new Date(); d.setDate(d.getDate() - 1); const t = d.toISOString().split('T')[0]; setDateFilter({ start: t, end: t }); }} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition ml-2 text-xs font-bold shadow-sm">
                    Hier
                </button>
                {(dateFilter.start || dateFilter.end) && (
                    <button onClick={() => setDateFilter({ start: '', end: '' })} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition ml-2 text-xs font-bold flex items-center gap-1 shadow-sm">
                        <X size={14} /> Vider les filtres
                    </button>
                )}
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
              <Download size={16} /> PDF
            </button>
            <button onClick={handlePrint} className="bg-zinc-800 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
              <Printer size={16} /> Imprimer
            </button>
        </div>
      </div>

      {/* SIMULATEUR DE SANTÉ GLOBALE */}
      <div className="mb-8">
          <button type="button" onClick={() => setSimulator({...simulator, show: !simulator.show})} className="flex items-center gap-2 text-sm font-black uppercase text-[#39FF14] mb-4 hover:underline w-max">
              <BarChart size={16}/> {simulator.show ? 'Masquer le simulateur global' : 'Simulateur de Santé Financière (Masqué)'}
          </button>
          
          {simulator.show && (
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-6 animate-in slide-in-from-top-2">
                  <h3 className="font-black uppercase text-lg">Santé Financière Globale</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">TVA Applicable</label>
                          <select value={simulator.taxRate} onChange={e => setSimulator({...simulator, taxRate: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold cursor-pointer">
                              <option value="18">18% (Standard)</option>
                              <option value="10">10% (Réduit)</option>
                              <option value="0">0% (Exonéré)</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 cursor-help" title="Frais des plateformes (Wave/OM/Stripe)">Frais de paiement ℹ️</label>
                          <select value={simulator.paymentFeePct} onChange={e => setSimulator({...simulator, paymentFeePct: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold cursor-pointer">
                              <option value="1">Wave / OM (~1%)</option>
                              <option value="3.5">Carte Bancaire (~3.5%)</option>
                              <option value="0">Aucun (0%)</option>
                          </select>
                      </div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase">Total Logistique Payé</label><input type="number" value={simulator.shippingSpend || ''} onChange={e => setSimulator({...simulator, shippingSpend: Number(e.target.value)})} placeholder="Ex: 50000" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold"/></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase">Total Emballage (Cartons)</label><input type="number" value={simulator.packagingSpend || ''} onChange={e => setSimulator({...simulator, packagingSpend: Number(e.target.value)})} placeholder="Ex: 15000" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold"/></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase">Total Marketing (Pub)</label><input type="number" value={simulator.marketingSpend || ''} onChange={e => setSimulator({...simulator, marketingSpend: Number(e.target.value)})} placeholder="Ex: 100000" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold"/></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase">Total Douane / Import</label><input type="number" value={simulator.customsSpend || ''} onChange={e => setSimulator({...simulator, customsSpend: Number(e.target.value)})} placeholder="Ex: 250000" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-xs font-bold"/></div>
                  </div>
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div><p className="text-[10px] font-bold text-zinc-500 uppercase">TVA Globale</p><p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">{displayPrice(Math.round(simTVA), currency)}</p></div>
                      <div><p className="text-[10px] font-bold text-zinc-500 uppercase">CA Brut HT</p><p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">{displayPrice(Math.round(simRevHT), currency)}</p></div>
                      <div><p className="text-[10px] font-bold text-zinc-500 uppercase">Coût Marchandises</p><p className="font-bold text-sm text-red-500">{displayPrice(Math.round(simCogs), currency)}</p></div>
                      <div><p className="text-[10px] font-bold text-zinc-500 uppercase">Autres Charges</p><p className="font-bold text-sm text-red-500">{displayPrice(Math.round(simFees + simOtherCharges), currency)}</p></div>
                      <div className="col-span-2 md:col-span-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Bénéfice Net Réel</p><p className={`font-black text-xl leading-none ${simNetProfit > 0 ? 'text-[#39FF14] dark:text-[#39FF14]' : 'text-red-500'}`}>{simNetProfit > 0 ? '+' : ''}{displayPrice(Math.round(simNetProfit), currency)}</p><p className={`text-xs font-bold mt-1 ${simMarginPct > 0 ? 'text-green-600' : 'text-red-500'}`}>Marge : {simMarginPct.toFixed(1)}%</p></div>
                  </div>
              </div>
          )}
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mb-12">
          Aperçu des performances globales {dateFilter.start || dateFilter.end ? 'sur la période sélectionnée' : 'globales'}.
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard icon={<span className="font-black text-xl">XOF</span>} label="Revenu Total" value={displayPrice(totalRevenue, currency)} colorClass="text-green-500" trend={revenueTrend} onClick={() => { document.getElementById('dashboard-chart')?.scrollIntoView({ behavior: 'smooth' }) }} />
        <StatCard icon={<Wallet size={32} />} label="Marge Nette" value={displayPrice(netMargin, currency)} colorClass="text-[#39FF14]" trend={marginTrend} onClick={() => { document.getElementById('dashboard-chart')?.scrollIntoView({ behavior: 'smooth' }) }} />
        <StatCard icon={<ShoppingCart size={32} />} label="Commandes" value={totalOrders} colorClass="text-blue-500" trend={ordersTrend} onClick={() => setShopView('clients')} />
        <StatCard icon={<Users size={32} />} label="Clients" value={totalClients} colorClass="text-orange-500" trend={clientsTrend} onClick={() => setShopView('clients')} />
        <StatCard icon={<BarChart size={32} />} label="Panier Moyen" value={displayPrice(averageOrderValue, currency)} colorClass="text-purple-500" trend={avgOrderTrend} />
      </div>

      {/* ABANDONNED CARTS ALERT */}
      {orders.filter(o => o.status === 'Panier abandonné').length > 0 && (
        <div className="mb-8 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 p-4 sm:p-6 rounded-r-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-500" size={24} />
            <div>
              <p className="font-black text-orange-700 dark:text-orange-400">Paniers Abandonnés détectés</p>
              <p className="text-sm text-orange-600 dark:text-orange-500">{orders.filter(o => o.status === 'Panier abandonné').length} client(s) ont commencé une commande sans la terminer.</p>
            </div>
          </div>
          <button onClick={() => setShowAbandoned(!showAbandoned)} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-orange-600 transition shadow-lg shrink-0">
            {showAbandoned ? 'Masquer' : 'Voir les paniers'}
          </button>
        </div>
      )}

      {showAbandoned && (
        <div className="mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-4">
          <h3 className="font-black uppercase text-xl mb-4">Relance WhatsApp</h3>
          <div className="space-y-3">
            {orders.filter(o => o.status === 'Panier abandonné').map(order => (
              <div key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 gap-4">
                <div>
                  <p className="font-bold text-sm text-black dark:text-white">{order.customer?.name || 'Client Anonyme'}</p>
                  <p className="text-xs text-zinc-500 mt-1">{order.customer?.phone}</p>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-1">{order.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <p className="font-black text-lg text-[#39FF14]">{displayPrice(order.total, currency)}</p>
                  <button 
                    onClick={() => {
                      const msg = `Bonjour ${order.customer?.name || ''}, nous avons remarqué que vous n'avez pas finalisé votre commande de ${displayPrice(order.total, currency)} sur *${shopName}*. Avez-vous rencontré un problème ? Si vous le souhaitez, nous pouvons valider votre panier directement ici ! 🛒`;
                      window.open(`https://wa.me/${String(order.customer?.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="flex-1 sm:flex-none bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-[#1ebd58] transition shadow-md flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={14} /> Relancer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div id="dashboard-chart" className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-black uppercase text-xl">Tendance ({chartPeriod === 'week' ? '7' : '30'}j)</h3>
             <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-1">
                <button 
                    onClick={() => setChartPeriod('week')} 
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${chartPeriod === 'week' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}
                >7j</button>
                <button 
                    onClick={() => setChartPeriod('month')} 
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${chartPeriod === 'month' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}
                >30j</button>
             </div>
          </div>
          
          <div className={`flex items-end justify-between h-64 ${chartPeriod === 'week' ? 'gap-4' : 'gap-1'}`}>
            {chartData.map((d, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer"
                onClick={() => {
                    const ordersForDay = orders.filter(o => o.date.startsWith(d.fullDate));
                    setSelectedDayOrders({ date: d.fullDate, orders: ordersForDay });
                }}
              >
                <div 
                  className="w-full max-w-[40px] bg-black dark:bg-white rounded-t-xl transition-all duration-500 relative group-hover:bg-[#39FF14]" 
                  style={{ height: `${(d.total / maxTotal) * 100}%`, minHeight: '4px' }}
                >
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {displayPrice(d.total, currency)}
                   </div>
                </div>
                <span className="mt-4 text-xs font-bold text-zinc-400 uppercase">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Best Sellers */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl">
           <div className="flex items-center gap-3 mb-6">
              <Star className="text-yellow-400" size={24} />
              <h3 className="font-black uppercase text-xl">Top Ventes {dateFilter.start && '(Période)'}</h3>
           </div>
           
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {bestSellers.length === 0 ? (
                 <p className="text-zinc-500 text-sm">Aucune vente enregistrée.</p>
              ) : (
                 bestSellers.map(([id, data]) => (
                    <div key={id} className="flex items-center gap-4">
                       <img src={data.image} alt={data.name} className="w-12 h-12 rounded-lg object-cover bg-zinc-200" />
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-black dark:text-white">{data.name}</p>
                          <p className="text-xs text-zinc-500">{data.category}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-black text-lg text-black dark:text-white">{data.quantity}</p>
                         <p className="text-[10px] font-bold text-zinc-400 uppercase">Ventes</p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* MOST VIEWED */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl">
           <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-blue-500" size={24} />
              <h3 className="font-black uppercase text-xl">Produits Populaires</h3>
           </div>
           <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              {productCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setPopularCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${popularCategory === cat ? 'bg-blue-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {mostViewed.length === 0 ? (
                 <p className="text-zinc-500 text-sm">Aucune vue enregistrée.</p>
              ) : (
                 mostViewed.map(p => (
                    <div key={p.id} onClick={() => onViewProduct(p)} className="relative flex items-center gap-4 p-2 rounded-xl cursor-pointer overflow-hidden hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                       {/* Background Bar */}
                       <div 
                         className="absolute inset-y-0 left-0 bg-blue-50 dark:bg-blue-900/20 z-0 transition-all duration-500" 
                         style={{ width: `${((productViews[p.id] || 0) / maxProductViews) * 100}%` }}
                       />
                       <div className="relative z-10 flex items-center gap-4 w-full">
                           <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-zinc-200 shadow-sm" />
                           <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate text-black dark:text-white">{p.name}</p>
                              <p className="text-xs text-zinc-500">{p.category}</p>
                           </div>
                           <p className="font-black text-lg text-blue-500">{productViews[p.id] || 0} <span className="text-xs text-zinc-400">vues</span></p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

        {/* VIEWS HISTORY CHART */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-black uppercase text-xl">Trafic (Vues 7j)</h3>
             <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Eye size={20} className="text-blue-500" />
             </div>
          </div>
          
          <div className="flex items-end justify-between h-64 gap-2">
            {viewsChartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                <div 
                  className="w-full max-w-[30px] bg-blue-500 rounded-t-lg transition-all duration-500 relative group-hover:bg-blue-400" 
                  style={{ height: `${(d.count / maxViews) * 100}%`, minHeight: '4px' }}
                >
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {d.count} vues
                   </div>
                </div>
                <span className="mt-4 text-[10px] font-bold text-zinc-400 uppercase">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORY SALES PIE CHART */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <PieChartIcon size={24} className="text-purple-500" />
            <h3 className="font-black uppercase text-xl">Ventes par Catégorie</h3>
          </div>
          {salesByCategory.length > 0 && totalRevenue > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 shrink-0">
                <div 
                  className="w-full h-full rounded-full" 
                  style={{
                    background: `conic-gradient(${
                      salesByCategory.map((cat, i) => {
                        const colors = ['#39FF14', '#000000', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899'];
                        const startAngle = (salesByCategory.slice(0, i).reduce((acc, c) => acc + c.value, 0) / totalRevenue) * 100;
                        const endAngle = startAngle + (cat.value / totalRevenue) * 100;
                        return `${colors[i % colors.length]} ${startAngle}% ${endAngle}%`;
                      }).join(', ')
                    })`
                  }}
                ></div>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {salesByCategory.slice(0, 5).map((cat, i) => {
                  const colors = ['#39FF14', '#000000', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899'];
                  const percentage = ((cat.value / totalRevenue) * 100).toFixed(0);
                  return (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span><span className="font-bold text-black dark:text-white">{cat.name}</span></div><span className="font-black text-zinc-500">{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (<p className="text-zinc-500 text-sm text-center py-10">Aucune vente pour afficher le graphique.</p>)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Low Stock Alert */}
        <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl">
           <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="font-black uppercase text-xl">Stock Faible</h3>
           </div>
           
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {lowStockProducts.length === 0 ? (
                 <p className="text-zinc-500 text-sm">Aucun produit en rupture imminente.</p>
              ) : (
                 lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                       <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-zinc-200" />
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-black dark:text-white">{p.name}</p>
                          <p className="text-xs text-zinc-500">{p.category}</p>
                       </div>
                       <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                          <button onClick={() => onUpdateStock(p.id, (p.stock||0) - 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-zinc-700 rounded text-black dark:text-white hover:bg-zinc-200 transition">-</button>
                          <span className={`w-6 text-center text-xs font-black ${p.stock === 0 ? 'text-red-500' : 'text-black dark:text-white'}`}>{p.stock}</span>
                          <button onClick={() => onUpdateStock(p.id, (p.stock||0) + 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-zinc-700 rounded text-black dark:text-white hover:bg-zinc-200 transition">+</button>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

        {/* NOUVEAUX CLIENTS CHART */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <Users className="text-orange-500" size={24} />
                <h3 className="font-black uppercase text-xl">Nouveaux Clients</h3>
             </div>
             <button onClick={handleExportNewClientsToCSV} className="p-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors" title="Exporter en CSV">
                 <Download size={16}/>
             </button>
          </div>
          
          <div className="flex items-end justify-between h-64 gap-2">
            {newClientsChartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                <div 
                  className="w-full max-w-[40px] bg-orange-500 rounded-t-lg transition-all duration-500 relative group-hover:bg-orange-400" 
                  style={{ height: `${(d.count / maxNewClients) * 100}%`, minHeight: '4px' }}
                >
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {d.count}
                   </div>
                </div>
                <span className="mt-4 text-[10px] font-bold text-zinc-400 uppercase">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AVIS VERIFIES WIDGET */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <Star className="text-[#39FF14] fill-[#39FF14]" size={24} />
                <h3 className="font-black uppercase text-xl">Avis Vérifiés</h3>
             </div>
             <button onClick={() => setShopView('reviews')} className="text-[10px] font-black uppercase text-zinc-400 hover:text-black dark:hover:text-white transition">Voir tout</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {recentReviews && recentReviews.length > 0 ? recentReviews.slice(0, 4).map((r: any) => (
                 <div key={r.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                     <div className="flex justify-between items-center mb-2">
                         <p className="font-bold text-sm text-black dark:text-white truncate">{r.name}</p>
                         <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-bold">{r.rating}</span>
                            <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                         </div>
                     </div>
                     <p className="text-xs text-zinc-500 italic line-clamp-2">"{r.comment}"</p>
                 </div>
             )) : (
                 <p className="text-zinc-500 text-sm">Aucun avis récent.</p>
             )}
          </div>
        </div>
      </div>

      {/* DERNIÈRES COMMANDES */}
      <div className="mt-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm overflow-x-auto">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-black uppercase text-xl">Dernières Commandes</h3>
         </div>
         <table className="w-full text-left min-w-[800px]">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
               <tr>
                  <th className="p-4 text-xs font-black uppercase text-zinc-500">Date & Réf</th>
                  <th className="p-4 text-xs font-black uppercase text-zinc-500">Client</th>
                  <th className="p-4 text-xs font-black uppercase text-zinc-500 text-center">Montant</th>
                  <th className="p-4 text-xs font-black uppercase text-zinc-500 text-right">Statut & Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
               {orders.filter((o: any) => o.status !== 'Panier abandonné').slice(0, 10).map((order: any) => (
                   <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4">
                         <p className="font-bold text-sm">{new Date(order.date || order.created_at).toLocaleDateString('fr-FR')}</p>
                         <p className="text-[10px] text-zinc-500">{order.trackingNumber || order.tracking_number}</p>
                      </td>
                      <td className="p-4">
                         <p className="font-bold text-sm">{order.customer?.name}</p>
                         <p className="text-xs text-zinc-500">{order.customer?.phone}</p>
                      </td>
                      <td className="p-4 text-center">
                         <p className="font-black text-[#39FF14]">{displayPrice(order.total || order.total_amount, currency)}</p>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-3">
                         <select 
                             value={order.status || 'En attente'} 
                             onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                             className={`text-[10px] font-bold uppercase px-3 py-2 rounded-xl outline-none cursor-pointer border ${
                                 order.status === 'Livré' ? 'bg-green-100 text-green-700 border-green-200' : 
                                 order.status === 'Payé' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                 order.status === 'Expédié' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                 order.status === 'En cours de préparation' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                 order.status === 'Annulé' || order.status === 'Retour article' ? 'bg-red-100 text-red-700 border-red-200' : 
                                 'bg-yellow-100 text-yellow-700 border-yellow-200'
                             }`}
                         >
                             <option value="En attente">En attente</option>
                             <option value="Payé">Payé</option>
                             <option value="En cours de préparation">En cours de préparation</option>
                             <option value="Expédié">Expédié</option>
                             <option value="Livré">Livré</option>
                             <option value="Retour article">Retour article</option>
                             <option value="Annulé">Annulé</option>
                         </select>
                         <button onClick={() => setHistoryModalOrder(order)} className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-2 rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">
                            Détails
                         </button>
                      </td>
                   </tr>
               ))}
               {orders.filter((o: any) => o.status !== 'Panier abandonné').length === 0 && (
                   <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500 italic">Aucune commande récente.</td>
                   </tr>
               )}
            </tbody>
         </table>
      </div>

        {/* MODALE DÉTAILS COMMANDES JOUR */}
        {selectedDayOrders && (
            <div id="modal-overlay" onClick={() => setSelectedDayOrders(null)} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-lg uppercase">Commandes du {new Date(selectedDayOrders.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</h3>
                            {(() => {
                                const dayRev = selectedDayOrders.orders.reduce((sum, o) => sum + o.total, 0);
                                const dayCost = selectedDayOrders.orders.reduce((sum, o) => sum + o.items.reduce((iSum: number, item: any) => iSum + ((item.costPrice || 0) * item.quantity), 0), 0);
                                const dayMargin = dayRev - dayCost;
                                return (
                                    <p className="text-xs font-bold text-zinc-500 mt-1">CA: <span className="text-black dark:text-white">{displayPrice(dayRev, currency)}</span> <span className="mx-2">•</span> Marge Brute: <span className="text-[#39FF14]">{displayPrice(dayMargin, currency)}</span></p>
                                );
                            })()}
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleExportDayOrdersToCSV(selectedDayOrders)} 
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-xs font-bold transition-colors"
                                title="Exporter en CSV"
                            >
                                <Download size={16}/> CSV
                            </button>
                            <button onClick={() => handlePrintDayOrders(selectedDayOrders)} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-xs font-bold transition-colors" title="Imprimer">
                                <Printer size={16}/> Imprimer
                            </button>
                            <button onClick={() => setSelectedDayOrders(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X size={20}/></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {selectedDayOrders.orders.length === 0 ? (
                            <p className="text-center text-zinc-500 py-10">Aucune commande ce jour.</p>
                        ) : (
                            selectedDayOrders.orders.map((order: any) => (
                                <div key={order.id} className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm text-black dark:text-white">{order.customer.name}</p>
                                            <p className="text-xs text-zinc-500">{order.customer.phone}</p>
                                            {order.trackingNumber && <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Réf: {order.trackingNumber}</p>}
                                            {order.deliveryZone && <p className="text-[10px] font-bold text-zinc-500 mt-1 flex items-center gap-1">📍 {order.deliveryZone}</p>}
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="font-black text-lg text-[#39FF14] leading-none mb-1">{displayPrice(order.total, currency)}</p>
                                            {(() => {
                                                const orderCost = order.items.reduce((sum: number, item: any) => sum + ((item.costPrice || 0) * item.quantity), 0);
                                                const orderMargin = order.total - orderCost;
                                                return <p className="text-[10px] font-bold text-zinc-500 mb-2">Marge: <span className="text-[#39FF14]">{displayPrice(orderMargin, currency)}</span></p>;
                                            })()}
                                            <select 
                                                value={order.status || 'En attente'} 
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className={`text-[10px] font-bold uppercase px-2 py-1 rounded outline-none cursor-pointer border ${
                                                    order.status === 'Livré' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                    order.status === 'Payé' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    order.status === 'Expédié' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    order.status === 'En cours de préparation' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    order.status === 'Annulé' || order.status === 'Retour article' ? 'bg-red-100 text-red-700 border-red-200' : 
                                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }`}
                                            >
                                                <option value="En attente">En attente</option>
                                                <option value="Payé">Payé</option>
                                                <option value="En cours de préparation">En cours de préparation</option>
                                                <option value="Expédié">Expédié</option>
                                                <option value="Livré">Livré</option>
                                                <option value="Retour article">Retour article</option>
                                                <option value="Annulé">Annulé</option>
                                            </select>
                                            
                                            {/* Assignation Livreur (Onyx Tiak) */}
                                            {(order.deliveryMethod === 'delivery' || order.delivery_method === 'delivery') && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-800">
                                                        <Truck size={12} className="text-orange-500" />
                                                        <input 
                                                            type="text"
                                                            placeholder="Livreur..."
                                                            value={order.delivery_driver || ''}
                                                            onChange={(e) => updateOrderDriver(order.id, e.target.value)}
                                                            className="text-[10px] font-bold outline-none bg-transparent text-black dark:text-white w-20 placeholder:text-zinc-400"
                                                        />
                                                    </div>
                                                    {order.delivery_driver && (
                                                        <button 
                                                            onClick={() => {
                                                                const msg = `📦 *NOUVELLE COURSE*\n\n*Client:* ${order.customer?.name}\n*Téléphone:* ${order.customer?.phone}\n*Adresse:* ${order.deliveryZone || order.delivery_zone || ''} - ${order.customer?.address || 'Non spécifiée'}\n\n*Commande:* ${order.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}\n\n*Montant à encaisser:* ${displayPrice(order.total, currency)}\n*Instructions:* ${order.customer?.instructions || 'Aucune'}`;
                                                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                                                            }}
                                                            className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg transition-colors"
                                                            title="Envoyer la course au livreur sur WhatsApp"
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-3">
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                            <span className="font-bold text-zinc-500 mr-1">Articles:</span>
                                            {order.items.map((item: CartItem) => `${item.name} (x${item.quantity})`).join(', ')}
                                        </p>
                                        <div className="flex gap-2 ml-4">
                                            <button onClick={() => setHistoryModalOrder(order)} className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition shrink-0" title="Voir l'historique">
                                                <Clock size={12}/> Historique
                                            </button>
                                            <button onClick={() => handlePrintSingleInvoice(order, true)} className="text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition shrink-0" title="Télécharger en PDF">
                                                <Download size={12}/> PDF
                                            </button>
                                            <button onClick={() => handlePrintSingleInvoice(order, false)} className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition shrink-0" title="Imprimer la facture">
                                                <Printer size={12}/> Imprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* MODALE HISTORIQUE STATUT */}
        {historyModalOrder && (
            <div id="modal-overlay" onClick={() => setHistoryModalOrder(null)} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-start">
                        <div>
                            <h3 className="font-black text-lg uppercase">Détails Commande</h3>
                            <p className="text-xs text-zinc-500 font-bold mt-1">Réf: {historyModalOrder.trackingNumber || historyModalOrder.tracking_number}</p>
                            {(() => {
                                const orderTotal = historyModalOrder.total || historyModalOrder.total_amount || 0;
                                const orderCost = historyModalOrder.items?.reduce((sum: number, item: any) => sum + ((item.costPrice || 0) * item.quantity), 0) || 0;
                                const orderMargin = orderTotal - orderCost;
                                const customerPhone = historyModalOrder.customer?.phone || historyModalOrder.customer_phone || '';
                                const cleanPhone = String(customerPhone).replace(/[^0-9]/g, '');
                                const phoneWithPrefix = cleanPhone.startsWith('221') ? cleanPhone : (cleanPhone ? `221${cleanPhone}` : '');
                                return (
                                    <div className="mt-4 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-sm font-black">CA: <span className="text-black dark:text-white">{displayPrice(orderTotal, currency)}</span></p>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-xs font-bold text-zinc-500">Marge Nette: <span className="text-[#39FF14]">{displayPrice(orderMargin, currency)}</span></p>
                                            {phoneWithPrefix && (
                                                <button onClick={() => window.open(`https://wa.me/${phoneWithPrefix}`, '_blank')} className="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-2 py-1 rounded flex items-center gap-1 text-[10px] font-black uppercase transition-colors shadow-sm">
                                                    <MessageSquare size={12} /> WhatsApp
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <button onClick={() => setHistoryModalOrder(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"><X size={20}/></button>
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                        {(historyModalOrder.history || []).map((entry: any, index: number) => (
                            <div key={index} className="flex gap-4 items-start relative">
                                {index !== (historyModalOrder.history?.length || 0) - 1 && <div className="absolute left-3 top-8 bottom-[-16px] w-[2px] bg-zinc-200 dark:bg-zinc-800"></div>}
                                <div className="w-6 h-6 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 border-2 border-white dark:border-zinc-950 relative z-10">
                                    <CheckCircle size={12} />
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="font-bold text-sm text-black dark:text-white">Statut : <span className="uppercase text-[#39FF14]">{entry.status}</span></p>
                                    <p className="text-xs text-zinc-500 mt-1">{new Date(entry.date).toLocaleString('fr-FR')} • par {entry.user}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

function ShopClients({ currency, orders, onClientSelect, onRunIaScan }: { currency: string, orders: any[], onClientSelect: (client: any) => void, onRunIaScan: () => void }) {
    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortKey, setSortKey] = useState('totalSpent');
    const [newClient, setNewClient] = useState({ name: '', phone: '' });

    const handleSaveClient = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClient.name || !newClient.phone) return;

        if (!validateSenegalPhone(newClient.phone)) {
            alert("Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67).");
            return;
        }
        const formattedPhone = formatSenegalPhone(newClient.phone);

        if (clients.some(c => c.phone === formattedPhone)) {
            alert('Un client avec ce numéro de téléphone existe déjà.');
            return;
        }

        const manualClients = JSON.parse(localStorage.getItem('onyx_jaay_manual_clients') || '[]');
        manualClients.push({ ...newClient, phone: formattedPhone });
        localStorage.setItem('onyx_jaay_manual_clients', JSON.stringify(manualClients));

        setClients(prev => [...prev, {
            ...newClient,
            phone: formattedPhone,
            totalSpent: 0,
            ordersCount: 0,
            cancelledCount: 0,
            lastOrder: new Date().toISOString(),
            loyaltyPoints: 0
        }]);

        setIsModalOpen(false);
        setNewClient({ name: '', phone: '' });
    };

    const handleExportClients = () => {
        if (clients.length === 0) {
            alert("Aucun client à exporter.");
            return;
        }
        const exportData = clients.map(c => ({
            'Nom': c.name,
            'Téléphone': c.phone,
            'Dépenses Totales (FCFA)': c.totalSpent,
            'Nombre de Commandes': c.ordersCount,
            'Commandes Annulées': c.cancelledCount || 0,
            'Points de Fidélité': c.loyaltyPoints,
            'Dernière Commande': new Date(c.lastOrder).toLocaleDateString('fr-FR')
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
        XLSX.writeFile(workbook, `onyx_clients_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    useEffect(() => {
        const processClientsData = () => {
            const uniqueClients: any = {};
            orders.forEach((order: any) => {
                if (order.customer && order.customer.phone) {
                    if (!uniqueClients[order.customer.phone]) {
                        uniqueClients[order.customer.phone] = { ...order.customer, totalSpent: 0, ordersCount: 0, cancelledCount: 0, lastOrder: order.date || new Date().toISOString(), loyaltyPoints: 0 };
                    }
                    uniqueClients[order.customer.phone].ordersCount += 1;
                    
                    if (order.status === 'Annulé') {
                        uniqueClients[order.customer.phone].cancelledCount += 1;
                    } else {
                        // On n'ajoute pas les montants et points si la commande est annulée
                        uniqueClients[order.customer.phone].totalSpent += order.total;
                        uniqueClients[order.customer.phone].loyaltyPoints += Math.floor(order.total / 1000);
                        if (order.pointsUsed) {
                            uniqueClients[order.customer.phone].loyaltyPoints -= order.pointsUsed;
                        }
                    }
                    if (new Date(order.date) > new Date(uniqueClients[order.customer.phone].lastOrder)) {
                        uniqueClients[order.customer.phone].lastOrder = order.date;
                    }
                }
            });

            const manualClients = JSON.parse(localStorage.getItem('onyx_jaay_manual_clients') || '[]');
            manualClients.forEach((manualClient: any) => {
                if (!uniqueClients[manualClient.phone]) {
                    uniqueClients[manualClient.phone] = {
                        ...manualClient,
                        totalSpent: 0,
                        ordersCount: 0,
                        cancelledCount: 0,
                        lastOrder: new Date().toISOString(),
                        loyaltyPoints: 0
                    };
                }
            });

            setClients(Object.values(uniqueClients));
        };
        processClientsData();
    }, [orders]);

    const filteredClients = clients.filter(client =>
        (client.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (client.phone || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    const sortedClients = [...filteredClients].sort((a, b) => {
        if (sortKey === 'totalSpent') {
            return (b.totalSpent || 0) - (a.totalSpent || 0);
        }
        if (sortKey === 'ordersCount') {
            return (b.ordersCount || 0) - (a.ordersCount || 0);
        }
        if (sortKey === 'lastOrder') {
            return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
        }
        return 0;
    });

    return (
        <div className="p-8 md:p-12 pt-32 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Mes <span className="text-[#39FF14]">Clients</span></h2>
                <div className="flex gap-4">
                    <button onClick={onRunIaScan} className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-xs hover:scale-105 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#39FF14]/20 hidden sm:flex">
                        <Sparkles size={16} /> Scan IA Marketing
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-[#39FF14] text-black px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#39FF14]/20">
                        <Plus size={16} /> Ajouter un client
                    </button>
                    <button onClick={handleExportClients} className="bg-zinc-800 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                        <Download size={16} /> Exporter la liste
                    </button>
                </div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mb-12">Historique des clients ayant passé commandes.</p>
            <div className="mb-8 flex flex-wrap gap-4 items-center">
                <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-black dark:text-white outline-none focus:border-[#39FF14] transition"
                />
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-500 pl-2">Trier par:</span>
                    <button onClick={() => setSortKey('totalSpent')} className={`px-3 py-1 rounded-lg text-xs font-bold ${sortKey === 'totalSpent' ? 'bg-[#39FF14] text-black' : 'text-zinc-500'}`}>Plus dépensé</button>
                    <button onClick={() => setSortKey('ordersCount')} className={`px-3 py-1 rounded-lg text-xs font-bold ${sortKey === 'ordersCount' ? 'bg-[#39FF14] text-black' : 'text-zinc-500'}`}>Plus de commandes</button>
                    <button onClick={() => setSortKey('lastOrder')} className={`px-3 py-1 rounded-lg text-xs font-bold ${sortKey === 'lastOrder' ? 'bg-[#39FF14] text-black' : 'text-zinc-500'}`}>Plus récents</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedClients.map((client, i) => (
                    <div key={i} onClick={() => onClientSelect(client)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm cursor-pointer hover:border-[#39FF14] transition-all hover:shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-black text-lg">{client.name.charAt(0)}</div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg leading-none">{client.name}</h3>
                                    {client.ordersCount > 5 && (
                                        <span className="text-[9px] bg-yellow-400 text-black px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm">
                                            VIP ⭐
                                        </span>
                                    )}
                                    {client.cancelledCount > 0 && (
                                        <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-red-200 dark:border-red-500/30">
                                            {client.cancelledCount} Annulé{client.cancelledCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-500">{client.phone}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800 gap-4">
                            <div className="flex flex-col items-start">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Points Fidélité</p>
                                <div className="flex items-center gap-2 text-[#39FF14]">
                                    <Gift size={16}/>
                                    <p className="font-black text-lg">{client.loyaltyPoints || 0}</p>
                                </div>
                                <p className="text-[9px] text-zinc-500 font-bold">= {((client.loyaltyPoints || 0) * 10).toLocaleString()} F</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Dépensé</p>
                                <p className="font-black text-[#39FF14]">{displayPrice(client.totalSpent, currency)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Commandes</p>
                                <p className="font-black">{client.ordersCount}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {sortedClients.length === 0 && <p className="text-zinc-500 col-span-full text-center py-10">Aucun client trouvé.</p>}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Ajouter un Client</h3>
                        <form onSubmit={handleSaveClient}>
                            <div className="space-y-4">
                                <input type="text" placeholder="Nom du client" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" required />
                                <input type="tel" placeholder="Téléphone du client" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" required />
                            </div>
                            <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase text-zinc-500 hover:bg-zinc-100 transition">Annuler</button>
                                <button type="submit" className="px-8 py-3 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase hover:bg-white transition">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

interface PromoCode {
  id: number;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  active: boolean;
  singleUse?: boolean;
  minPurchase?: number;
  usageCount?: number;
  expirationDate?: string;
}

interface ShopSettingsProps {
  promoCodes: PromoCode[];
  setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  shopInfo: typeof initialShopInfo & { currency: string, categoryCovers?: Record<string, string>, instagramUrl?: string, facebookUrl?: string };
  setShopInfo: React.Dispatch<React.SetStateAction<typeof initialShopInfo>>;
  deliveryZones: DeliveryZone[];
  setDeliveryZones: React.Dispatch<React.SetStateAction<DeliveryZone[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onResetData: () => void;
  onClearOrders: () => void;
  onClearCatalog: () => void;
  onGenerateDemo: () => void;
  currency: string;
  shopId: string | null;
}

function ShopSettings({ promoCodes, setPromoCodes, shopInfo, setShopInfo, deliveryZones, setDeliveryZones, categories, setCategories, onResetData, onClearOrders, onClearCatalog, onGenerateDemo, currency, shopId }: ShopSettingsProps) {
  const [newCode, setNewCode] = useState({ code: '', discount: '', type: 'percentage' as 'percentage' | 'fixed', singleUse: false, minPurchase: '', expirationDate: '' });
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  
  const [editingCodeId, setEditingCodeId] = useState<number | null>(null);
  const [editingCodeData, setEditingCodeData] = useState({ code: '', discount: '', type: 'percentage' as 'percentage' | 'fixed', singleUse: false, minPurchase: '', expirationDate: '' });
  const [newCat, setNewCat] = useState('');
  const [parentCat, setParentCat] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const handleSaveCategoriesSilently = async (newCategories: string[], newCovers: any) => {
      if (shopId) {
          const dataToSave = { categories: newCategories, category_covers: newCovers };
          console.log("TENTATIVE D'ENREGISTREMENT SUPABASE :", dataToSave);
          const { data, error } = await supabase.from('shops').update(dataToSave).eq('id', shopId).select();
          if (error) {
              console.error("ERREUR SUPABASE LORS DE L'UPDATE :", error);
          } else {
              console.log("RÉPONSE SUPABASE OK :", data);
          }
      }
  };

  const handleAddCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code || !newCode.discount) return;
    const newPromo: PromoCode = {
      id: Date.now(),
      code: newCode.code.toUpperCase(),
      discount: Number(newCode.discount),
      type: newCode.type,
      active: true,
      singleUse: newCode.singleUse,
      minPurchase: newCode.minPurchase ? Number(newCode.minPurchase) : undefined,
      expirationDate: newCode.expirationDate || undefined,
    };
    setPromoCodes(prev => [...prev, newPromo]);
    setNewCode({ code: '', discount: '', type: 'percentage', singleUse: false, minPurchase: '', expirationDate: '' });
  };

  const handleEditCode = (code: PromoCode) => {
    setEditingCodeId(code.id);
    setEditingCodeData({
        code: code.code,
        discount: String(code.discount),
        type: code.type,
        singleUse: code.singleUse || false,
        minPurchase: String(code.minPurchase || ''),
        expirationDate: code.expirationDate ? new Date(code.expirationDate).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveEditCode = () => {
    if (!editingCodeId) return;

    setPromoCodes(prev => prev.map(c => {
        if (c.id === editingCodeId) {
            return {
                ...c,
                code: editingCodeData.code.toUpperCase(),
                discount: Number(editingCodeData.discount),
                type: editingCodeData.type,
                singleUse: editingCodeData.singleUse,
                minPurchase: Number(editingCodeData.minPurchase) || undefined,
                expirationDate: editingCodeData.expirationDate || undefined
            };
        }
        return c;
    }));

    setEditingCodeId(null);
    setEditingCodeData({ code: '', discount: '', type: 'percentage', singleUse: false, minPurchase: '', expirationDate: '' });
  };

  const toggleCodeStatus = (id: number) => {
    setPromoCodes(codes => codes.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const deleteCode = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce code promos ?")) {
      setPromoCodes(codes => codes.filter(c => c.id !== id));
    }
  };

  const handleUpdateZone = (id: number, field: keyof DeliveryZone, value: any) => {
    setDeliveryZones(prev => prev.map(z => z.id === id ? { ...z, [field]: value } : z));
  };

  const handleAddZone = () => {
    const newId = Math.max(...deliveryZones.map(z => z.id), 0) + 1;
    setDeliveryZones([...deliveryZones, { id: newId, name: `Zone ${newId}`, price: 2000, quartiers: ["Nouveau quartier"] }]);
  };

  const handleDeleteZone = (id: number) => {
    if(confirm("Supprimer cette zone ?")) setDeliveryZones(prev => prev.filter(z => z.id !== id));
  };

  const handleSaveInfo = async () => {
    if (!shopId) return alert("Erreur: ID de la boutique non trouvé.");
    const { error } = await supabase.from('shops').update({
        name: shopInfo.name,
        description: shopInfo.description,
        phone: shopInfo.phone,
        logo_url: shopInfo.logoUrl,
        currency: shopInfo.currency,
        delivery_options: shopInfo.deliveryOptions,
        opening_hours: shopInfo.openingHours,
        slug: shopInfo.slug,
        categories: categories,
        category_covers: shopInfo.categoryCovers || {},
        instagram_url: shopInfo.instagramUrl,
        facebook_url: shopInfo.facebookUrl,
        tiktok_url: shopInfo.tiktokUrl,
        twitter_url: shopInfo.twitterUrl,
        youtube_url: shopInfo.youtubeUrl,
        delivery_zones: deliveryZones
    }).eq('id', shopId);
    if (error) { alert("Erreur lors de la sauvegarde des paramètres : " + error.message); } else { alert("Paramètres de la boutique mis à jour avec succès !"); }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCat = parentCat ? `${parentCat} / ${newCat}` : newCat;
    if (finalCat && !categories.includes(finalCat)) {
        const newCats = [...categories, finalCat];
        setCategories(newCats);
        handleSaveCategoriesSilently(newCats, shopInfo.categoryCovers || {});
        setNewCat('');
        setParentCat('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (cat === 'Toutes' || cat === 'Favoris') return alert("Cette catégorie système ne peut pas être supprimée.");
    if (confirm(`Supprimer la catégorie "${cat}" ? Les produits associés ne seront pas supprimés.`)) {
        const newCats = categories.filter(c => c !== cat);
        setCategories(newCats);
        handleSaveCategoriesSilently(newCats, shopInfo.categoryCovers || {});
    }
  };

  const handleEditCategorySave = async (oldCat: string) => {
      if (!editCategoryName.trim()) return;
      const isSub = oldCat.includes(' / ');
      const parent = isSub ? oldCat.substring(0, oldCat.lastIndexOf(' / ')) : '';
      const newCatFull = isSub ? `${parent} / ${editCategoryName.trim()}` : editCategoryName.trim();

      if (newCatFull === oldCat) {
          setEditingCategory(null);
          return;
      }

      const updatedCategories = categories.map(c => c === oldCat ? newCatFull : c);
      const finalCategories = updatedCategories.map(c => (!isSub && c.startsWith(oldCat + ' / ')) ? c.replace(oldCat + ' / ', newCatFull + ' / ') : c);
      setCategories(finalCategories);

      const newCovers = { ...(shopInfo.categoryCovers || {}) };
      if (newCovers[oldCat]) { newCovers[newCatFull] = newCovers[oldCat]; delete newCovers[oldCat]; }
      if (!isSub) {
           Object.keys(newCovers).forEach(key => {
               if (key.startsWith(oldCat + ' / ')) {
                   const newKey = key.replace(oldCat + ' / ', newCatFull + ' / ');
                   newCovers[newKey] = newCovers[key];
                   delete newCovers[key];
               }
           });
      }
      setShopInfo({ ...shopInfo, categoryCovers: newCovers });
      handleSaveCategoriesSilently(finalCategories, newCovers);

      if (shopId) {
          const { data: prods } = await supabase.from('products').select('id, category').eq('shop_id', shopId).ilike('category', `${oldCat}%`);
          if (prods && prods.length > 0) {
              for (const p of prods) {
                  let updatedCat = p.category === oldCat ? newCatFull : (!isSub && p.category.startsWith(oldCat + ' / ')) ? p.category.replace(oldCat + ' / ', newCatFull + ' / ') : p.category;
                  if (updatedCat !== p.category) await supabase.from('products').update({ category: updatedCat }).eq('id', p.id);
              }
          }
      }
      setEditingCategory(null);
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
      const fixedCats = categories.filter(c => c === 'Toutes' || c === 'Favoris');
      const movableCats = categories.filter(c => c !== 'Toutes' && c !== 'Favoris');
      
      if (direction === 'up' && index > 0) {
          [movableCats[index - 1], movableCats[index]] = [movableCats[index], movableCats[index - 1]];
      } else if (direction === 'down' && index < movableCats.length - 1) {
          [movableCats[index + 1], movableCats[index]] = [movableCats[index], movableCats[index + 1]];
      } else {
          return;
      }
      const newCats = [...fixedCats, ...movableCats];
      setCategories(newCats);
      handleSaveCategoriesSilently(newCats, shopInfo.categoryCovers || {});
  };

  const toggleCategoryVisibility = (cat: string) => {
      const hiddenKey = '__hidden_' + cat;
      const newCovers = { ...(shopInfo.categoryCovers || {}) };
      if (newCovers[hiddenKey]) {
          delete newCovers[hiddenKey];
      } else {
          newCovers[hiddenKey] = 'true';
      }
      setShopInfo({ ...shopInfo, categoryCovers: newCovers });
      handleSaveCategoriesSilently(categories, newCovers);
  };

  const toggleCategoryBadge = (cat: string) => {
      const badgeKey = '__new_' + cat;
      const newCovers = { ...(shopInfo.categoryCovers || {}) };
      if (newCovers[badgeKey]) {
          delete newCovers[badgeKey];
      } else {
          newCovers[badgeKey] = 'true';
      }
      setShopInfo({ ...shopInfo, categoryCovers: newCovers });
      handleSaveCategoriesSilently(categories, newCovers);
  };

  const handleSaveCategories = async () => {
    if (!shopId) return alert("Erreur: ID de la boutique non trouvé.");
    const { error } = await supabase.from('shops').update({
        categories: categories,
        category_covers: shopInfo.categoryCovers || {},
    }).eq('id', shopId);
    if (error) { alert("Erreur lors de la sauvegarde : " + error.message); } else { alert("Catégories et couvertures enregistrées avec succès !"); }
  };

  return (
    <div className="p-8 md:p-12 pt-32 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in">
      <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Paramètres de la <span className="text-[#39FF14]">Boutique</span> <span className="text-xs bg-[#39FF14] text-black px-3 py-1 rounded-full align-middle ml-2 shadow-lg">V 2.0</span></h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mb-12">Gérez les informations générales et les promotions de votre boutique.</p>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm mb-8">
          <h3 className="font-black uppercase text-xl mb-6 flex items-center gap-3"><Store size={20} className="text-[#39FF14]" /> Informations Boutique</h3>
          <div className="space-y-4">
              <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nom de la boutique</label>
                  <input type="text" value={shopInfo.name} onChange={(e) => setShopInfo({...shopInfo, name: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
              </div>
              <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Description courte</label>
                  <input type="text" value={shopInfo.description} onChange={(e) => setShopInfo({...shopInfo, description: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
              </div>
              <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Numéro WhatsApp</label>
                  <input type="text" value={shopInfo.phone} onChange={(e) => setShopInfo({...shopInfo, phone: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
              </div>
              <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Logo de la boutique (Factures & Accueil)</label>
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                          {shopInfo.logoUrl ? <img src={shopInfo.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : <Store className="text-zinc-400" />}
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                          <input type="text" placeholder="URL de l'image (ou importez un fichier)" value={shopInfo.logoUrl} onChange={(e) => setShopInfo({...shopInfo, logoUrl: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 font-bold text-xs outline-none focus:border-[#39FF14]" />
                          <input type="file" accept="image/*" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setShopInfo({...shopInfo, logoUrl: reader.result as string});
                                  reader.readAsDataURL(file);
                              }
                          }} className="w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:font-bold file:bg-zinc-200 dark:file:bg-zinc-700 file:text-black dark:file:text-white hover:file:bg-[#39FF14] hover:file:text-black transition cursor-pointer" />
                      </div>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Lien Instagram</label>
                      <input type="url" value={shopInfo.instagramUrl || ''} onChange={(e) => setShopInfo({...shopInfo, instagramUrl: e.target.value})} placeholder="https://instagram.com/..." className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Lien Facebook</label>
                      <input type="url" value={shopInfo.facebookUrl || ''} onChange={(e) => setShopInfo({...shopInfo, facebookUrl: e.target.value})} placeholder="https://facebook.com/..." className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
                  </div>
              </div>

              <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Devise de la boutique</label>
                  <select 
                      value={shopInfo.currency} 
                      onChange={(e) => setShopInfo({...shopInfo, currency: e.target.value})} 
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]"
                  >
                      <option value="FCFA">FCFA (XOF)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar Américain ($)</option>
                  </select>
                  <p className="text-[10px] text-zinc-400 mt-2 italic">Les prix sont basés en FCFA et convertis automatiquement pour l'affichage.</p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Lien public de la boutique</label>
                  <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 focus-within:border-[#39FF14] transition-colors">
                      <span className="text-sm font-bold text-zinc-400">https://onyxlinks.com/</span>
                      <input type="text" value={shopInfo.slug || ''} onChange={(e) => setShopInfo({...shopInfo, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} className="w-full bg-transparent p-3 pl-1 font-bold text-sm outline-none text-black dark:text-white" placeholder="keur-yaay" />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2 italic">Ceci sera l'URL que vous partagerez à vos clients.</p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mb-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-3 block">Modes de livraison autorisés</p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={shopInfo.deliveryOptions?.delivery !== false} onChange={(e) => setShopInfo({...shopInfo, deliveryOptions: { ...shopInfo.deliveryOptions, delivery: e.target.checked }})} className="w-5 h-5 accent-[#39FF14]" />
                          <span className="text-sm font-bold text-black dark:text-white">Livraison à domicile</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={shopInfo.deliveryOptions?.pickup !== false} onChange={(e) => setShopInfo({...shopInfo, deliveryOptions: { ...shopInfo.deliveryOptions, pickup: e.target.checked }})} className="w-5 h-5 accent-[#39FF14]" />
                          <span className="text-sm font-bold text-black dark:text-white">Retrait en boutique</span>
                      </label>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Lien TikTok</label>
                      <input type="url" value={shopInfo.tiktokUrl || ''} onChange={(e) => setShopInfo({...shopInfo, tiktokUrl: e.target.value})} placeholder="https://tiktok.com/@..." className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Lien X (Twitter)</label>
                      <input type="url" value={shopInfo.twitterUrl || ''} onChange={(e) => setShopInfo({...shopInfo, twitterUrl: e.target.value})} placeholder="https://x.com/..." className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Lien YouTube</label>
                      <input type="url" value={shopInfo.youtubeUrl || ''} onChange={(e) => setShopInfo({...shopInfo, youtubeUrl: e.target.value})} placeholder="https://youtube.com/..." className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
                  </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-zinc-500 uppercase block">Horaires d&apos;ouverture auto</label>
                      <input type="checkbox" checked={shopInfo.openingHours?.enabled} onChange={(e) => setShopInfo({...shopInfo, openingHours: { ...shopInfo.openingHours, enabled: e.target.checked }})} className="w-5 h-5 accent-[#39FF14]" />
                  </div>
                  {shopInfo.openingHours?.enabled && (
                      <div className="flex gap-4">
                          <div className="flex-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Ouverture</label>
                              <input type="time" value={shopInfo.openingHours.start} onChange={(e) => setShopInfo({...shopInfo, openingHours: { ...shopInfo.openingHours, start: e.target.value }})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none" />
                          </div>
                          <div className="flex-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Fermeture</label>
                              <input type="time" value={shopInfo.openingHours.end} onChange={(e) => setShopInfo({...shopInfo, openingHours: { ...shopInfo.openingHours, end: e.target.value }})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none" />
                          </div>
                      </div>
                  )}
              </div>
              <div className="pt-2 flex justify-end">
                  <button onClick={handleSaveInfo} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-6 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition flex items-center gap-2 shadow-lg">
                      <Save size={16} /> Enregistrer
                  </button>
              </div>
          </div>
      </div>

      {/* ZONES DE LIVRAISON */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black uppercase text-xl flex items-center gap-3"><Truck size={20} className="text-[#39FF14]" /> Zones de Livraison</h3>
            <button onClick={handleAddZone} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2"><Plus size={14}/> Ajouter Zone</button>
          </div>
          <div className="space-y-4">
            {deliveryZones.map(zone => (
                <div key={zone.id} className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <input 
                                type="text" 
                                value={zone.name} 
                                onChange={(e) => handleUpdateZone(zone.id, 'name', e.target.value)} 
                                className="bg-white dark:bg-zinc-900 p-2 rounded-lg font-bold text-sm outline-none border border-transparent focus:border-[#39FF14]"
                            />
                            <input 
                                type="number" 
                                value={zone.price} 
                                onChange={(e) => handleUpdateZone(zone.id, 'price', Number(e.target.value))} 
                                className="bg-white dark:bg-zinc-900 p-2 rounded-lg font-bold text-sm outline-none border border-transparent focus:border-[#39FF14]"
                            />
                        </div>
                        <button onClick={() => handleDeleteZone(zone.id)} className="text-zinc-400 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                    <textarea 
                        value={zone.quartiers.join(', ')} 
                        onChange={(e) => handleUpdateZone(zone.id, 'quartiers', e.target.value.split(',').map(s=>s.trim()))} 
                        className="w-full bg-white dark:bg-zinc-900 p-2 rounded-lg text-xs outline-none border border-transparent focus:border-[#39FF14] h-16 resize-none"
                        placeholder="Quartiers séparés par des virgules..."
                    />
                </div>
            ))}
          </div>
      </div>

      {/* GESTION DES CATÉGORIES */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black uppercase text-xl flex items-center gap-3"><Tag size={20} className="text-[#39FF14]" /> Gestion des Catégories & Couvertures</h3>
        </div>
        
        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-4 mb-6 items-end">
           <div className="flex-1 min-w-[200px]">
               <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Catégorie Parente (Optionnel)</label>
               <select value={parentCat} onChange={e => setParentCat(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#39FF14]">
                   <option value="">Aucune (Catégorie principale)</option>
                   {categories.filter(c => c !== 'Toutes' && c !== 'Favoris' && !c.includes(' / ')).map(c => <option key={c} value={c}>{c}</option>)}
               </select>
           </div>
           <div className="flex-1 min-w-[200px]">
               <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nom de la catégorie</label>
               <input type="text" placeholder="Nouvelle catégorie (ex: Électronique)" value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#39FF14]" required />
           </div>
           <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-[#39FF14] hover:text-black transition flex items-center gap-2 h-[46px]"><Plus size={16}/> Ajouter</button>
        </form>

        <div className="space-y-3">
           {categories.filter(c => c !== 'Toutes' && c !== 'Favoris').map((cat, index, arr) => (
              <div key={cat} className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 ${cat.includes(' / ') ? 'ml-8 border-l-4 border-l-[#39FF14]' : ''}`}>
                 <div className="flex flex-col gap-2 w-full sm:w-1/3 mt-1">
                    {editingCategory === cat ? (
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={editCategoryName} 
                                onChange={(e) => setEditCategoryName(e.target.value)} 
                                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold outline-none focus:border-[#39FF14]"
                                autoFocus
                            />
                            <button type="button" onClick={() => handleEditCategorySave(cat)} className="text-green-500 hover:text-green-600 bg-green-500/10 p-1.5 rounded-lg"><Check size={16}/></button>
                            <button type="button" onClick={() => setEditingCategory(null)} className="text-zinc-400 hover:text-zinc-500 bg-zinc-200 dark:bg-zinc-700 p-1.5 rounded-lg"><X size={16}/></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-black dark:text-white flex-1 truncate" title={cat}>{cat}</span>
                            <button type="button" onClick={() => toggleCategoryVisibility(cat)} className="text-zinc-400 hover:text-orange-500 transition shrink-0 p-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg" title={shopInfo.categoryCovers?.['__hidden_' + cat] ? 'Afficher la catégorie' : 'Masquer la catégorie'}>
                                {shopInfo.categoryCovers?.['__hidden_' + cat] ? <EyeOff size={14}/> : <Eye size={14}/>}
                            </button>
                            <button type="button" onClick={() => toggleCategoryBadge(cat)} className={`transition shrink-0 p-1 rounded-lg ${shopInfo.categoryCovers?.['__new_' + cat] ? 'bg-red-500/10 text-red-500 hover:text-red-600' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 hover:text-red-500'}`} title={shopInfo.categoryCovers?.['__new_' + cat] ? 'Retirer le badge Nouveau' : 'Ajouter le badge Nouveau'}>
                                <Tag size={14}/>
                            </button>
                            <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg p-1 shrink-0">
                                <button type="button" onClick={() => handleMoveCategory(index, 'up')} disabled={index === 0} className="text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-30"><ArrowUp size={14}/></button>
                                <button type="button" onClick={() => handleMoveCategory(index, 'down')} disabled={index === arr.length - 1} className="text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-30"><ArrowDown size={14}/></button>
                            </div>
                            <button type="button" onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.includes(' / ') ? cat.split(' / ').pop() || '' : cat); }} className="text-zinc-400 hover:text-blue-500 transition shrink-0 p-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg"><Edit size={14}/></button>
                            <button type="button" onClick={() => handleDeleteCategory(cat)} className="text-zinc-400 hover:text-red-500 transition shrink-0 p-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                    )}
                 </div>
                 
                 <div className="flex-1 flex items-start gap-3 w-full">
                     <img src={shopInfo.categoryCovers?.[cat] || `https://placehold.co/100x100/111/FFF?text=${encodeURIComponent(cat.includes(' / ') ? cat.split(' / ')[1] : cat)}`} alt={cat} className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 bg-white" />
                     <div className="flex-1 flex flex-col gap-2 w-full">
                         <input 
                             type="url" 
                             placeholder="URL de l'image de couverture..." 
                             value={shopInfo.categoryCovers?.[cat] || ''}
                             onChange={(e) => setShopInfo({ ...shopInfo, categoryCovers: { ...(shopInfo.categoryCovers || {}), [cat]: e.target.value } })}
                         onBlur={(e) => handleSaveCategoriesSilently(categories, { ...(shopInfo.categoryCovers || {}), [cat]: e.target.value })}
                             className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#39FF14] transition-colors"
                         />
                         <input 
                             type="file" 
                             accept="image/*" 
                             onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                     const reader = new FileReader();
                                 reader.onloadend = () => {
                                     const newCovers = { ...(shopInfo.categoryCovers || {}), [cat]: reader.result as string };
                                     setShopInfo({ ...shopInfo, categoryCovers: newCovers });
                                     handleSaveCategoriesSilently(categories, newCovers);
                                 };
                                     reader.readAsDataURL(file);
                                 }
                             }} 
                             className="w-full text-[10px] text-zinc-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-zinc-200 dark:file:bg-zinc-700 file:text-black dark:file:text-white hover:file:bg-[#39FF14] transition cursor-pointer" 
                         />
                     </div>
                 </div>
              </div>
           ))}
        </div>
        <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button onClick={handleSaveCategories} className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-6 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition flex items-center gap-2 shadow-lg">
                <Save size={16} /> Enregistrer Catégories & Covers
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
        <h3 className="font-black uppercase text-xl mb-6 flex items-center gap-3"><Ticket size={20} className="text-[#39FF14]" /> Codes Promo</h3>
        
        <form onSubmit={handleAddCode} className="flex flex-wrap gap-4 items-end mb-8 p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <input type="text" placeholder="CODEPROMO" value={newCode.code} onChange={e => setNewCode({...newCode, code: e.target.value})} className="flex-1 min-w-[120px] bg-white dark:bg-zinc-800 p-3 rounded-lg font-bold text-sm uppercase outline-none focus:border-[#39FF14] border" required />
          <input type="number" placeholder="Valeur" value={newCode.discount} onChange={e => setNewCode({...newCode, discount: e.target.value})} className="w-24 bg-white dark:bg-zinc-800 p-3 rounded-lg font-bold text-sm outline-none focus:border-[#39FF14] border" required />
          <select value={newCode.type} onChange={e => setNewCode({...newCode, type: e.target.value as any})} className="bg-white dark:bg-zinc-800 p-3 rounded-lg font-bold text-sm outline-none focus:border-[#39FF14] border">
            <option value="percentage">%</option>
            <option value="fixed">FCFA</option>
          </select>
          <input type="number" placeholder="Min. Achat (Opt.)" value={newCode.minPurchase} onChange={e => setNewCode({...newCode, minPurchase: e.target.value})} className="w-32 bg-white dark:bg-zinc-800 p-3 rounded-lg font-bold text-sm outline-none focus:border-[#39FF14] border" />
          <input type="date" title="Date d'expiration" value={newCode.expirationDate} onChange={e => setNewCode({...newCode, expirationDate: e.target.value})} className="bg-white dark:bg-zinc-800 p-3 rounded-lg font-bold text-sm outline-none focus:border-[#39FF14] border text-zinc-500" />
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 cursor-pointer h-11 px-2">
             <input type="checkbox" checked={newCode.singleUse} onChange={e => setNewCode({...newCode, singleUse: e.target.checked})} className="w-4 h-4 accent-black dark:accent-[#39FF14]" /> Usage unique
          </label>
          <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-lg font-bold text-xs uppercase flex items-center gap-2 h-11"><Plus size={16} /> Ajouter</button>
        </form>

        <div className="space-y-3">
          {promoCodes.map(code => (
            <div key={code.id} className="flex justify-between items-center p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
              {editingCodeId === code.id ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex flex-wrap gap-2">
                    <input type="text" value={editingCodeData.code} onChange={e => setEditingCodeData({...editingCodeData, code: e.target.value})} className="flex-1 min-w-[120px] bg-white dark:bg-zinc-900 p-2 rounded-lg text-sm uppercase outline-none focus:border-[#39FF14] border border-zinc-200 dark:border-zinc-700" />
                    <input type="number" value={editingCodeData.discount} onChange={e => setEditingCodeData({...editingCodeData, discount: e.target.value})} className="w-20 bg-white dark:bg-zinc-900 p-2 rounded-lg text-sm outline-none focus:border-[#39FF14] border border-zinc-200 dark:border-zinc-700" />
                    <select value={editingCodeData.type} onChange={e => setEditingCodeData({...editingCodeData, type: e.target.value as any})} className="bg-white dark:bg-zinc-900 p-2 rounded-lg text-sm outline-none focus:border-[#39FF14] border border-zinc-200 dark:border-zinc-700">
                      <option value="percentage">%</option>
                      <option value="fixed">FCFA</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <input type="number" placeholder="Min. Achat" value={editingCodeData.minPurchase} onChange={e => setEditingCodeData({...editingCodeData, minPurchase: e.target.value})} className="w-24 bg-white dark:bg-zinc-900 p-2 rounded-lg text-xs outline-none focus:border-[#39FF14] border border-zinc-200 dark:border-zinc-700" />
                      <input type="date" title="Date d'expiration" value={editingCodeData.expirationDate} onChange={e => setEditingCodeData({...editingCodeData, expirationDate: e.target.value})} className="w-32 bg-white dark:bg-zinc-900 p-2 rounded-lg text-xs outline-none focus:border-[#39FF14] border border-zinc-200 dark:border-zinc-700 text-zinc-500" />
                      <label className="flex items-center gap-1 text-xs text-zinc-500 cursor-pointer font-bold">
                        <input type="checkbox" checked={editingCodeData.singleUse} onChange={e => setEditingCodeData({...editingCodeData, singleUse: e.target.checked})} className="w-3 h-3 accent-black dark:accent-[#39FF14]" /> Usage unique
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingCodeId(null)} className="text-xs px-3 py-1.5 bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white rounded-lg hover:bg-zinc-400 font-bold transition-colors">Annuler</button>
                      <button onClick={handleSaveEditCode} className="text-xs px-3 py-1.5 bg-black text-[#39FF14] rounded-lg hover:bg-zinc-800 font-bold flex items-center gap-1 shadow-md transition-colors"><Check size={14}/> Sauver</button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-bold text-sm uppercase">
                    {code.code} - <span className="text-[#39FF14]">{code.discount}{code.type === 'percentage' ? '%' : ' ' + currency}</span>
                    {code.singleUse && <span className="ml-3 text-[9px] bg-red-500/10 text-red-500 px-2 py-1 rounded-md tracking-widest border border-red-500/20">Usage Unique</span>}
                    {code.minPurchase && code.minPurchase > 0 ? <span className="ml-2 text-[9px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md tracking-widest border border-blue-500/20">Min: {code.minPurchase} {currency}</span> : null}
                    {code.expirationDate && (
                        <span className={`ml-2 text-[9px] px-2 py-1 rounded-md tracking-widest border ${new Date(code.expirationDate).setHours(23,59,59,999) < new Date().getTime() ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                            Exp: {new Date(code.expirationDate).toLocaleDateString('fr-FR')}
                        </span>
                    )}
                    <span className="ml-2 text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md tracking-widest border border-zinc-200 dark:border-zinc-700">Utilisé {code.usageCount || 0} fois</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleCodeStatus(code.id)} className={`text-[10px] font-black uppercase px-3 py-1 rounded-md transition-all ${code.active ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'}`}>
                       {code.active ? 'Actif' : 'Inactif'}
                    </button>
                    <button onClick={() => handleEditCode(code)} className="text-zinc-400 hover:text-blue-500 transition-colors"><Edit size={16} /></button>
                    <button onClick={() => deleteCode(code.id)} className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WHATSAPP BOT */}
      <div className="mt-12 pt-8 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
        <h3 className="font-black uppercase text-xl mb-4 flex items-center gap-3 text-black dark:text-white"><MessageSquare size={20} className="text-[#39FF14]" /> Assistant WhatsApp Automatique</h3>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm leading-relaxed">Ne perdez plus de clients. Activez cette option pour que OnyxOps envoie des réponses automatiques et instantanées sur WhatsApp avec votre menu, vos prix et un lien de commande — même lorsque vous êtes occupé. Transformez chaque message en une véritable commande sans lever le petit doigt.</p>
            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl">
                <span className="font-bold text-sm">Activer les réponses automatiques</span>
                <label className="cursor-pointer">
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors bg-zinc-300 dark:bg-zinc-700`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform`}></div>
                    </div>
                </label>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              Note : Cette fonctionnalité nécessite une configuration avancée avec l'API WhatsApp Business. 
              <button onClick={() => alert("Veuillez contacter le support OnyxOps pour activer l'assistant WhatsApp.")} className="text-blue-500 underline ml-1">Contactez le support</button> pour l'activer.
            </p>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="mt-12 pt-8 border-t-2 border-dashed border-red-500/30">
        <h3 className="font-black uppercase text-xl mb-4 flex items-center gap-3 text-red-500"><AlertTriangle size={20} /> Zone de Danger</h3>
        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-black dark:text-white">Gestion des données</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Actions irréversibles sur la base de données locale.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap justify-end">
            <button 
              onClick={onGenerateDemo}
              className="w-full sm:w-auto bg-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles size={16} /> Générer 40 Produits
            </button>
            <button 
              onClick={onClearCatalog}
              className="w-full sm:w-auto bg-red-500 text-white px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              <Trash2 size={16} /> Vider Catalogue
            </button>
            <button 
              onClick={onClearOrders}
              className="w-full sm:w-auto bg-orange-500 text-white px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              <Trash2 size={16} /> Vider Commandes
            </button>
            <button 
              onClick={onResetData}
              className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              <RefreshCcw size={16} /> Réinitialiser Tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketingPlanner({ suggestions, plannedEvents, setPlannedEvents }: any) {
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const plannedCount = plannedEvents.filter((e: any) => e.status === 'Planifié').length;
    const executedCount = plannedEvents.filter((e: any) => e.status === 'Exécuté').length;
    const cancelledCount = plannedEvents.filter((e: any) => e.status === 'Annulé').length;

    const planAction = (suggestion: any) => {
        const newEvent = { ...suggestion, status: 'Planifié', planDate: new Date().toISOString() };
        setPlannedEvents((prev: any) => [newEvent, ...prev]);
    };

    const executePlannedAction = (event: any) => {
        window.open(`https://wa.me/${event.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(event.msg)}`, '_blank');
        setPlannedEvents((prev: any[]) => prev.map(e => e.id === event.id ? { ...e, status: 'Exécuté', executionDate: new Date().toISOString() } : e));
        setToastMessage("Action exécutée avec succès !");
        setTimeout(() => setToastMessage(null), 3000);
    };

    const cancelPlannedAction = (id: string) => {
        if (confirm("Voulez-vous supprimer cette action planifiée ?")) {
            setPlannedEvents((prev: any[]) => prev.map(e => e.id === id ? { ...e, status: 'Annulé', cancellationDate: new Date().toISOString() } : e));
        }
    };

    const clearFinishedActions = () => {
        if (confirm("Voulez-vous vraiment effacer toutes les actions terminées (Exécutées et Annulées) de l'historique ?")) {
            setPlannedEvents((prev: any[]) => prev.filter(e => e.status === 'Planifié'));
        }
    };

    const sortedEvents = [...plannedEvents].sort((a: any, b: any) => new Date(a.planDate || new Date()).getTime() - new Date(b.planDate || new Date()).getTime());
    const suggestionsToShow = suggestions.filter((s: any) => !plannedEvents.some((p: any) => p.id === s.id));
    const isOverdue = (dateString: string) => { const d = new Date(dateString); d.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); return d.getTime() < today.getTime(); };

    return (
        <div className="p-8 md:p-12 pt-32 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Planning <span className="text-[#39FF14]">Marketing</span></h2>
                <div className="flex gap-3">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl flex flex-col items-center min-w-[100px]"><span className="text-2xl font-black">{plannedCount}</span><span className="text-[9px] font-black text-zinc-500 uppercase">Planifiées</span></div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl flex flex-col items-center min-w-[100px]"><span className="text-2xl font-black text-[#39FF14]">{executedCount}</span><span className="text-[9px] font-black text-zinc-500 uppercase">Exécutées</span></div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-3"><Sparkles size={18} className="text-[#39FF14]"/> Suggestions IA</h3>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        {suggestionsToShow.length > 0 ? suggestionsToShow.map((s: any) => (
                            <div key={s.id} className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700"><p className="font-bold text-sm uppercase">{s.title}</p><p className="text-xs text-zinc-500 mt-1">{s.description}</p><button onClick={() => planAction(s)} className="mt-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-[#39FF14] hover:text-black transition flex items-center gap-2"><Plus size={14}/> Planifier</button></div>
                        )) : <p className="text-sm text-zinc-400 italic text-center py-10">Aucune nouvelle suggestion. Lancez un Scan IA depuis l'onglet Clients.</p>}
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6"><h3 className="font-black uppercase text-lg flex items-center gap-3"><Calendar size={18}/> Actions Planifiées</h3>{(executedCount > 0 || cancelledCount > 0) && <button onClick={clearFinishedActions} className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition flex items-center gap-1"><Trash2 size={12}/> Nettoyer</button>}</div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        {sortedEvents.map((e: any) => (
                            <div key={e.id} className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                                <p className={`font-bold text-sm uppercase flex items-center gap-2 ${e.status === 'Annulé' ? 'line-through text-zinc-500' : ''}`}>{e.status === 'Annulé' && <XCircle size={16} className="text-red-500"/>}{e.title}</p>
                                <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-2">{e.status === 'Exécuté' && e.executionDate ? <><CheckCircle size={12} className="text-green-500"/> Exécuté le: {new Date(e.executionDate).toLocaleDateString('fr-FR')}</> : e.status === 'Annulé' && e.cancellationDate ? <>Annulé le: {new Date(e.cancellationDate).toLocaleDateString('fr-FR')}</> : <>Planifié le: {new Date(e.planDate).toLocaleDateString('fr-FR')}{e.status === 'Planifié' && isOverdue(e.planDate) && <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-red-200 dark:border-red-500/30">En retard</span>}</>}</p>
                                <div className="flex gap-2 mt-3"><button disabled={e.status !== 'Planifié'} onClick={() => executePlannedAction(e)} className="bg-green-500 text-white text-[10px] font-bold px-4 py-2 rounded-xl flex items-center gap-2 disabled:bg-zinc-300 disabled:cursor-not-allowed"><Send size={14}/> {e.status === 'Exécuté' ? 'Envoyé' : 'Exécuter'}</button><button disabled={e.status !== 'Planifié'} onClick={() => setEditingEvent(e)} className="bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-zinc-300 transition disabled:opacity-50 disabled:cursor-not-allowed"><Edit3 size={14}/></button><button disabled={e.status !== 'Planifié'} onClick={() => cancelPlannedAction(e.id)} className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"><X size={14}/></button></div>
                            </div>
                        ))}
                        {plannedEvents.length === 0 && <p className="text-sm text-zinc-400 italic text-center py-10">Aucune action planifiée.</p>}
                    </div>
                </div>
            </div>
            {toastMessage && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] px-6 py-3 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 z-[300] animate-in slide-in-from-bottom-5"><CheckCircle size={16}/> {toastMessage}</div>}
        {editingEvent && <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setEditingEvent(null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"><div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl w-full max-w-lg relative shadow-2xl animate-in zoom-in-95 border border-zinc-200 dark:border-zinc-800"><button onClick={() => setEditingEvent(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={20}/></button><h3 className="text-xl font-black uppercase mb-6 text-black dark:text-white">Modifier l&apos;action</h3><div className="space-y-4"><div><label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Date planifiée</label><input type="date" value={editingEvent.planDate ? new Date(editingEvent.planDate).toISOString().split('T')[0] : ''} onChange={e => {if(e.target.value) setEditingEvent({...editingEvent, planDate: new Date(e.target.value).toISOString()})}} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold text-black dark:text-white" /></div><div><label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Message WhatsApp</label><textarea value={editingEvent.msg} onChange={e => setEditingEvent({...editingEvent, msg: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#39FF14] min-h-[150px] resize-none text-sm text-black dark:text-white" /></div></div><button onClick={() => { setPlannedEvents((prev: any[]) => prev.map(e => e.id === editingEvent.id ? editingEvent : e)); setEditingEvent(null); }} className="w-full mt-6 bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg">Enregistrer</button></div></div>}
        </div>
    );
}

// --- QR CODE MODAL COMPONENT ---
interface QRCodeModalProps {
  product: Product;
  onClose: () => void;
}

function QRCodeModal({ product, onClose }: QRCodeModalProps) {
  const productUrl = `${window.location.origin}/vente?product=${product.id}`;
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${product.name.replace(/\s+/g, "_")}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl relative animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-zinc-400 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition z-10"><X size={20}/></button>
        <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter mb-2">{product.name}</h3>
        <p className="text-sm text-zinc-500 mb-6">Personnalisez et téléchargez votre QR Code.</p>
        <div className="p-4 bg-white rounded-2xl border-4 border-zinc-200 dark:border-zinc-800 inline-block mb-4">
          <QRCode id="qr-code-svg" value={productUrl} size={200} fgColor={fgColor} bgColor={bgColor} />
        </div>
        
        <div className="flex justify-center gap-4 mb-4">
           <div className="flex flex-col items-center">
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Code</label>
              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" />
           </div>
           <div className="flex flex-col items-center">
              <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Fond</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" />
           </div>
        </div>

        <button onClick={downloadQRCode} className="w-full bg-[#39FF14] text-black py-3 rounded-xl font-bold text-xs uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg mb-4">
           <Download size={16} /> Télécharger Image
        </button>

        <input 
          type="text" 
          readOnly 
          value={productUrl} 
          className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center outline-none focus:border-[#39FF14]"
          onFocus={(e) => e.target.select()}
        />
      </div>
    </div>
  );
}