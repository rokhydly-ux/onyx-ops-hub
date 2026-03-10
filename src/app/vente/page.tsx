"use client";

import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { 
  MessageSquare, Edit, Trash2, Plus, FileUp, Sparkles, X, Heart, Star, QrCode, Download,
  Image as ImageIcon, DollarSign, Tag, Type, Home, LayoutDashboard, 
  Settings, Store, ChevronRight, Share2, Menu, ShoppingCart, Minus, Filter, ArrowRight, Sun, Moon, BarChart, AlertTriangle, Ticket, Printer, Truck, Bell, Users, Clock, Lock, Gift
} from 'lucide-react';
import QRCode from "react-qr-code";
import * as XLSX from 'xlsx';

// --- TYPES ---
interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  videoUrl?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  reviewsList?: Review[];
  variants?: {
    sizes?: string[];
    colors?: string[];
  };
}

interface CartItem extends Product {
  quantity: number;
  selectedVariant?: {
    size?: string;
    color?: string;
  };
}

// --- INITIAL DATA ---
const initialProducts: Product[] = [
  { id: 1, name: 'Boubou Onyx Premium', price: 75000, description: 'Tissu de luxe, coupe moderne, parfait pour les grandes occasions.', image: 'https://i.ibb.co/pPZJz7j/boubou-1.jpg', category: 'Luxe', rating: 5, reviews: 13, stock: 10, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', reviewsList: [{id: 1, name: "Aïssatou", rating: 5, comment: "Magnifique, la qualité est au rendez-vous.", date: "2024-03-10"}] },
  { id: 2, name: 'Ensemble Tailleur "Business"', price: 85000, description: 'Pour un look pro et élégant au bureau.', image: 'https://i.ibb.co/yQJ4c1g/tailleur-femme.jpg', category: 'Professionnel', rating: 4.5, reviews: 8, stock: 5, reviewsList: [] },
  { id: 3, name: 'Robe de Soirée "Lagoon"', price: 120000, description: 'Faites sensation lors de vos événements avec cette pièce unique.', image: 'https://i.ibb.co/VvzHZj3/robe-soiree.jpg', category: 'Soirée', rating: 5, reviews: 24, stock: 0, reviewsList: [] },
  { id: 4, name: 'Chemise en Lin "Dakar 2"', price: 25000, description: 'Légère et respirante, idéale pour la saison chaude.', image: 'https://i.ibb.co/3sSqcCg/chemise-lin.jpg', category: 'Casual', rating: 4, reviews: 15, variants: { sizes: ['M', 'L', 'XL'], colors: ['Blanc', 'Beige', 'Bleu Ciel'] }, stock: 20, reviewsList: [] },
];

const WHATSAPP_NUMBER = "221771234567"; // À remplacer par le vrai numéro

export default function OnyxJaayShop() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIWriting, setIsAIWriting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [qrCodeProduct, setQrCodeProduct] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [theme, setTheme] = useState('dark');
  const [shopView, setShopView] = useState<'boutique' | 'dashboard' | 'settings' | 'clients'>('boutique');
  const [categories, setCategories] = useState(['Toutes', 'Favoris', 'Luxe', 'Professionnel', 'Soirée', 'Casual']);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: 1, code: 'BIENVENUE10', discount: 10, type: 'percentage', active: true },
    { id: 2, code: 'SOLDE5000', discount: 5000, type: 'fixed', active: false },
  ]);
  const [shopInfo, setShopInfo] = useState({
    name: 'Onyx Jaay',
    description: 'Version Pro',
    phone: WHATSAPP_NUMBER,
    deliveryFees: 2000,
    openingHours: { start: '09:00', end: '18:00', enabled: false }
  });
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [currentCustomerPoints, setCurrentCustomerPoints] = useState(0);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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
  }, []);

  useEffect(() => {
    localStorage.setItem('onyx_jaay_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('onyx_jaay_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

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
  }, [products]);

  const addToCart = (product: Product, variant?: { size?: string; color?: string }) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
      );
      
      // Check stock
      const currentQuantityInCart = existing ? existing.quantity : 0;
      if (product.stock !== undefined && currentQuantityInCart >= product.stock) {
        alert("Quantité maximale en stock atteinte !");
        return prev;
      }

      if (existing) {
        return prev.map(item => (item.id === product.id && JSON.stringify(item.selectedVariant) === JSON.stringify(variant)) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, selectedVariant: variant }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCost = deliveryMethod === 'delivery' ? (shopInfo.deliveryFees || 0) : 0;
  const promoDiscountAmount = appliedPromo 
    ? (appliedPromo.type === 'percentage' ? (subTotal * appliedPromo.discount / 100) : appliedPromo.discount)
    : 0;
  const loyaltyDiscountAmount = useLoyaltyPoints 
    ? Math.min(currentCustomerPoints * 10, subTotal - promoDiscountAmount) // 1 point = 10 FCFA
    : 0;
  const cartTotal = Math.max(0, subTotal - promoDiscountAmount - loyaltyDiscountAmount + deliveryCost);
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
      setAppliedPromo(code);
      alert("Code promo appliqué !");
    } else {
      alert("Code promo invalide ou inactif.");
      setAppliedPromo(null);
    }
    setPromoInput('');
  };

  useEffect(() => {
    if (isCheckoutModalOpen && customerInfo.phone) {
        const savedOrders = localStorage.getItem('onyx_jaay_orders');
        if (savedOrders) {
            try {
                const orders = JSON.parse(savedOrders);
                const customerOrders = orders.filter((o: any) => o.customer?.phone === customerInfo.phone);
                let points = 0;
                customerOrders.forEach((order: any) => {
                    points += Math.floor(order.total / 1000); // Earn
                    if (order.pointsUsed) {
                        points -= order.pointsUsed; // Spend
                    }
                });
                setCurrentCustomerPoints(points);
            } catch (e) {
                console.error("Erreur calcul points", e);
                setCurrentCustomerPoints(0);
            }
        } else {
            setCurrentCustomerPoints(0);
        }
    } else {
        setCurrentCustomerPoints(0);
    }
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

  const handleDeleteProduct = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    if (product.category && !categories.includes(product.category)) {
      setCategories(prev => [...prev, product.category]);
    }
    setIsModalOpen(false);
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

  const confirmOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) {
        alert("Veuillez remplir votre nom et téléphone pour valider la commande.");
        return;
    }

    const pointsToUse = useLoyaltyPoints ? Math.floor(loyaltyDiscountAmount / 10) : 0;

    // Save order locally for history/clients
    const newOrder = {
        id: Date.now(),
        date: new Date().toISOString(),
        customer: customerInfo,
        items: cart,
        total: cartTotal, // This is the final total paid
        pointsUsed: pointsToUse,
        status: 'En attente'
    };
    const existingOrders = JSON.parse(localStorage.getItem('onyx_jaay_orders') || '[]');
    localStorage.setItem('onyx_jaay_orders', JSON.stringify([newOrder, ...existingOrders]));

    let message = `Bonjour, je suis ${customerInfo.name}. Je souhaite passer commande :\n\n`;
    cart.forEach(item => {
      let variantInfo = "";
      if (item.selectedVariant) {
        const parts = [];
        if (item.selectedVariant.size) parts.push(`Taille: ${item.selectedVariant.size}`);
        if (item.selectedVariant.color) parts.push(`Couleur: ${item.selectedVariant.color}`);
        if (parts.length > 0) variantInfo = ` (${parts.join(', ')})`;
      }
      message += `- ${item.name}${variantInfo} (x${item.quantity}) : ${(item.price * item.quantity).toLocaleString('fr-SN')} FCFA\n`;
    });
    message += `\nSous-total : ${subTotal.toLocaleString('fr-SN')} FCFA`;
    if (deliveryMethod === 'delivery') {
        message += `\nFrais de livraison : ${deliveryCost.toLocaleString('fr-SN')} FCFA`;
    }
    if (appliedPromo) {
        message += `\nRemise (${appliedPromo.code}) : -${promoDiscountAmount.toLocaleString('fr-SN')} FCFA`;
    }
    if (useLoyaltyPoints && loyaltyDiscountAmount > 0) {
        message += `\nPoints Fidélité : -${loyaltyDiscountAmount.toLocaleString('fr-SN')} FCFA`;
    }
    message += `\nMode de livraison : ${deliveryMethod === 'delivery' ? 'Livraison à domicile' : 'Retrait en boutique'}`;
    message += `\n*Total à payer : ${cartTotal.toLocaleString('fr-SN')} FCFA*`;
    message += `\n\nMerci de confirmer la disponibilité.`;

    const url = `https://wa.me/${shopInfo.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
    setCart([]);
    setAppliedPromo(null);
    setUseLoyaltyPoints(false);
    setCustomerInfo({ name: '', phone: '' });
    setIsOrderSuccessOpen(true);
  };
  
  const handleAddReview = (productId: number, review: Omit<Review, 'id' | 'date'>) => {
    setProducts(prevProducts => {
      const newProducts = prevProducts.map(p => {
        if (p.id === productId) {
          const newReview = { ...review, id: Date.now(), date: new Date().toISOString().split('T')[0] };
          const updatedReviews = [...(p.reviewsList || []), newReview];
          const newRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
          return { ...p, reviewsList: updatedReviews, reviews: updatedReviews.length, rating: parseFloat(newRating.toFixed(1)) };
        }
        return p;
      });
      return newProducts;
    });
  };

  const handleViewProduct = (product: Product) => {
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
      'Tailles': p.variants?.sizes?.join(', ') || '',
      'Couleurs': p.variants?.colors?.join(', ') || ''
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
            sizes: (row['Tailles'] || row['sizes'] || '').toString().split(',').map((s: string) => s.trim()).filter(Boolean),
            colors: (row['Couleurs'] || row['colors'] || '').toString().split(',').map((s: string) => s.trim()).filter(Boolean)
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

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Toutes' 
      ? true 
      : activeCategory === 'Favoris'
      ? wishlist.includes(p.id)
      : p.category === activeCategory;
    const matchesMinPrice = minPrice === '' || p.price >= minPrice;
    const matchesMaxPrice = maxPrice === '' || p.price <= maxPrice;
    const matchesSearch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesSearch;
  });

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
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-black dark:text-white outline-none focus:border-[#39FF14] transition"
                  />
                </div>
                <nav className="px-4 space-y-2 mb-8">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
                  <button onClick={() => { setShopView('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'dashboard' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                    <LayoutDashboard size={18} className={shopView === 'dashboard' ? "text-[#39FF14]" : ""} /> Tableau de bord
                  </button>
                  <button onClick={() => { setShopView('clients'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'clients' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                    <Users size={18} className={shopView === 'clients' ? "text-[#39FF14]" : ""} /> Clients
                  </button>
                  <button onClick={() => { setShopView('boutique'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'boutique' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                    <Store size={18} className={shopView === 'boutique' ? "text-[#39FF14]" : ""} /> Ma Boutique
                  </button>
                  <button onClick={() => { setShopView('settings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'settings' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                    <Settings size={18} className={shopView === 'settings' ? "text-[#39FF14]" : ""} /> Paramètres
                  </button>
                </nav>
                <div className="px-4 space-y-2">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catégories</p>
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setShopView('boutique'); setIsMobileMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                        activeCategory === cat 
                          ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' 
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">{cat === 'Favoris' && <Heart size={14} />}{cat}</span>
                      {activeCategory === cat && <ChevronRight size={14} />}
                    </button>
                  ))}
                </div>
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
                </div>
              </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex-col hidden md:flex print:hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-black tracking-tighter uppercase">{shopInfo.name}</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-4 mb-6">
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-black dark:text-white outline-none focus:border-[#39FF14] transition"
            />
          </div>

          <nav className="px-4 space-y-2 mb-8">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
            <button onClick={() => setShopView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'dashboard' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
              <LayoutDashboard size={18} className={shopView === 'dashboard' ? "text-[#39FF14]" : ""} /> Tableau de bord
            </button>
            <button onClick={() => setShopView('clients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'clients' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
              <Users size={18} className={shopView === 'clients' ? "text-[#39FF14]" : ""} /> Clients
            </button>
            <button onClick={() => setShopView('boutique')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'boutique' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
              <Store size={18} className={shopView === 'boutique' ? "text-[#39FF14]" : ""} /> Ma Boutique
            </button>
            <button onClick={() => setShopView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${shopView === 'settings' ? 'bg-zinc-200 dark:bg-zinc-900 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
              <Settings size={18} className={shopView === 'settings' ? "text-[#39FF14]" : ""} /> Paramètres
            </button>
          </nav>

          <div className="px-4 space-y-2">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catégories</p>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setShopView('boutique'); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeCategory === cat 
                    ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {cat === 'Favoris' && <Heart size={14} />}
                  {cat}
                </span>
                {activeCategory === cat && <ChevronRight size={14} />}
              </button>
            ))}
          </div>

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
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
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
              {cartCount > 0 && <span className="absolute top-0 right-0 bg-[#39FF14] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
           </button>
        </div>

        {/* Top Header Toggle */}
        <header className="absolute top-0 right-0 p-6 z-10 flex items-center gap-4 print:hidden">
          <button onClick={() => setIsCartOpen(true)} className="hidden md:flex items-center gap-2 bg-white/50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 transition backdrop-blur-md">
            <div className="relative">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#39FF14] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </div>
            <span className="text-xs font-bold uppercase">Panier</span>
          </button>

          <button onClick={toggleTheme} className="p-2 rounded-full bg-white/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
            <Sun className="h-4 w-4 text-black dark:hidden" />
            <Moon className="h-4 w-4 text-white hidden dark:block" />
          </button>

          {isEditingMode && (
            <div className="relative">
              <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full bg-white/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md relative">
                <Bell size={16} className="text-black dark:text-white" />
                {lowStockProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-black">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 z-50 animate-in slide-in-from-top-2">
                  <h4 className="font-black uppercase text-xs mb-3 flex items-center gap-2 text-black dark:text-white"><AlertTriangle size={14} className="text-yellow-500"/> Alertes Stock</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {lowStockProducts.length === 0 ? <p className="text-xs text-zinc-500">Tout va bien.</p> : lowStockProducts.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <span className="font-bold truncate max-w-[140px] text-black dark:text-white">{p.name}</span>
                        <span className="text-red-500 font-black">{p.stock} restants</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <span className="text-xs font-bold uppercase mr-2 text-black dark:text-white bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-zinc-200 dark:border-zinc-800">Mode Éditeur</span>
          <label htmlFor="editModeToggle" className="cursor-pointer">
            <div className={`w-14 h-8 rounded-full p-1 transition-colors border border-zinc-700 ${isEditingMode ? 'bg-[#39FF14]' : 'bg-zinc-800/80 backdrop-blur-md'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isEditingMode ? 'translate-x-6' : ''}`}></div>
            </div>
            <input type="checkbox" id="editModeToggle" className="hidden" checked={isEditingMode} onChange={() => setIsEditingMode(!isEditingMode)} />
          </label>
        </header>

        {!isShopOpen() && !isEditingMode && (
            <div className="bg-red-500 text-white text-center py-2 px-4 font-bold text-sm sticky top-0 z-30 flex items-center justify-center gap-2">
                <Clock size={16} /> La boutique est actuellement fermée. (Ouverture : {shopInfo.openingHours?.start})
            </div>
        )}

        {shopView === 'boutique' && (
          <div className="p-8 md:p-12 max-w-7xl mx-auto">
            <div className="mb-12 mt-12 md:mt-0">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Catalogue <span className="text-[#39FF14]">Produits</span></h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">Gérez votre inventaire, modifiez vos prix et partagez vos produits directement sur WhatsApp.</p>
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
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 ${isEditingMode ? 'cursor-grab active:cursor-grabbing hover:border-[#39FF14]/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]' : 'cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                onClick={() => !isEditingMode && handleViewProduct(product)}
                draggable={isEditingMode && activeCategory === 'Toutes'} // Drag & Drop only logical when all products are shown
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500 bg-zinc-100 dark:bg-zinc-800" />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-black uppercase tracking-widest border-2 border-white px-4 py-2 rounded-lg">Épuisé</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700 text-[#39FF14]">
                    {product.category}
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
                      <p className="text-2xl font-black text-black dark:text-white">{product.price.toLocaleString('fr-SN')} <span className="text-sm font-bold text-[#39FF14]">FCFA</span></p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                      disabled={product.stock === 0}
                      className="bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition-colors flex items-center gap-2 shadow-lg disabled:bg-zinc-300 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-zinc-500 dark:text-zinc-500">
                <Filter size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aucun produit ne correspond à vos filtres.</p>
              </div>
            )}
          </div>
        )}
        {shopView === 'dashboard' && (
            <ShopDashboard products={products} />
        )}
        {shopView === 'clients' && (
            <ShopClients />
        )}
        {shopView === 'settings' && (
            <ShopSettings 
              promoCodes={promoCodes} 
              setPromoCodes={setPromoCodes} 
              shopInfo={shopInfo}
              setShopInfo={setShopInfo}
            />
        )}
      </main>

      {/* --- CART DRAWER --- */}
      {isCartOpen && !isEditingMode && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative bg-white dark:bg-zinc-950 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-100 dark:bg-zinc-900">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <ShoppingCart className="text-[#39FF14]" /> Mon Panier
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full transition"><X size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center text-zinc-500 dark:text-zinc-500 mt-20">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Votre panier est vide.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                       <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                             <h4 className="font-bold text-sm line-clamp-1 text-black dark:text-white">{item.name}</h4>
                             <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 dark:text-zinc-500 hover:text-red-500 shrink-0"><Trash2 size={16}/></button>
                          </div>
                          {(item.selectedVariant?.size || item.selectedVariant?.color) && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
                              {item.selectedVariant.size && <span className="mr-2">Taille: {item.selectedVariant.size}</span>}
                              {item.selectedVariant.color && <span>Coul: {item.selectedVariant.color}</span>}
                            </p>
                          )}
                          <p className="text-[#39FF14] font-bold text-sm">{item.price.toLocaleString()} FCFA</p>
                          <div className="flex items-center gap-3 mt-2">
                             <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700"><Minus size={14}/></button>
                             <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700"><Plus size={14}/></button>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>

             <div className="p-6 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                <div className="mb-6">
                   <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-3">Mode de livraison</p>
                   <div className="flex gap-3">
                      <button 
                          onClick={() => setDeliveryMethod('delivery')}
                          className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'delivery' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}
                      >
                          <Truck size={20} />
                          <span className="text-[10px] font-black uppercase">Livraison</span>
                      </button>
                      <button 
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}
                      >
                          <Store size={20} />
                          <span className="text-[10px] font-black uppercase">Retrait</span>
                      </button>
                   </div>
                </div>

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

                {appliedPromo && (
                    <div className="flex justify-between items-center mb-2 text-xs text-[#39FF14]">
                        <span className="font-bold">Remise ({appliedPromo.code})</span>
                        <span className="font-bold">-{promoDiscountAmount.toLocaleString()} F</span>
                    </div>
                )}

                {deliveryMethod === 'delivery' && (
                    <div className="flex justify-between items-center mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-bold">Frais de livraison</span>
                        <span className="font-bold">{deliveryCost.toLocaleString()} F</span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                   <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs">Total à payer</span>
                   <span className="text-2xl font-black text-black dark:text-white">{cartTotal.toLocaleString()} <span className="text-[#39FF14] text-sm">FCFA</span></span>
                </div>
                <button 
                    onClick={handleCheckout} 
                    disabled={cart.length === 0 || (!isShopOpen() && !isEditingMode)} 
                    className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                   Commander sur WhatsApp <ArrowRight size={18} />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- CHECKOUT CONFIRMATION MODAL --- */}
      {isCheckoutModalOpen && !isEditingMode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 relative">
            <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-500 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white">Confirmation</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Vérifiez votre commande avant l'envoi sur WhatsApp.</p>
            
            <div className="mb-6 space-y-3 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Vos Coordonnées</p>
                <input type="text" placeholder="Votre Nom *" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black" />
                <input type="tel" placeholder="Votre Téléphone *" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black" />
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
              <div className="pt-4 flex justify-between text-lg font-black text-[#39FF14]">
                <span>Total</span>
                <span>{cartTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl font-bold text-xs uppercase hover:bg-zinc-200 dark:hover:bg-zinc-800 transition text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">Annuler</button>
              <button onClick={confirmOrder} className="flex-1 py-4 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase hover:bg-white transition flex items-center justify-center gap-2 shadow-lg shadow-[#39FF14]/20">
                <MessageSquare size={18}/> Confirmer l'envoi
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
                Votre commande est bien partie vers notre équipe sur WhatsApp. On s'occupe de tout préparer avec soin !<br/><br/>
                <span className="font-bold text-black dark:text-white">Un membre de l'équipe va vous répondre dans quelques instants pour valider la livraison.</span>
            </p>
            <button onClick={() => setIsOrderSuccessOpen(false)} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-xl">
                C'est noté, à tout de suite !
            </button>
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
            isAIWriting={isAIWriting}
         />
      )}

      {/* --- PRODUCT DETAIL MODAL --- */}
      {viewingProduct && !isEditingMode && (
        <ProductDetailModal 
          product={viewingProduct}
          allProducts={products}
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          onAddToCart={addToCart}
          onShare={handleShareProduct}
          onViewProduct={handleViewProduct}
          onGenerateQR={setQrCodeProduct}
          onAddReview={handleAddReview}
        />
      )}

      {qrCodeProduct && !isEditingMode && (
        <QRCodeModal 
          product={qrCodeProduct}
          onClose={() => setQrCodeProduct(null)}
        />
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
    isAIWriting: boolean;
}

function ProductModal({ product, onClose, onSave, onImageUpload, isAIWriting }: ProductModalProps) {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: product?.name || '',
        price: product?.price || 0,
        description: product?.description || '',
        image: product?.image || '',
        category: product?.category || '',
        stock: product?.stock ?? 0,
        rating: product?.rating || 5,
        reviews: product?.reviews || 0,
        variants: product?.variants || { sizes: [], colors: [] },
        videoUrl: product?.videoUrl || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...product, ...formData } as Product);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
                    <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nom du produit</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" placeholder="Ex: Robe de soirée" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Prix (FCFA)</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 pl-10 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Catégorie</label>
                                <input type="text" name="category" value={formData.category} onChange={handleChange} list="categories-list" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                            <datalist id="categories-list">
                              <option value="Luxe" />
                              <option value="Professionnel" />
                              <option value="Soirée" />
                              <option value="Casual" />
                            </datalist>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Note (0-5)</label>
                                <input type="number" name="rating" value={formData.rating} onChange={handleChange} min="0" max="5" step="0.1" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nombre d'avis</label>
                                <input type="number" name="reviews" value={formData.reviews} onChange={handleChange} min="0" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Quantité en Stock</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Tailles (séparées par virgule)</label>
                                <input type="text" value={formData.variants?.sizes?.join(', ')} onChange={e => setFormData({...formData, variants: {...formData.variants, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}})} placeholder="S, M, L, XL" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Couleurs (séparées par virgule)</label>
                                <input type="text" value={formData.variants?.colors?.join(', ')} onChange={e => setFormData({...formData, variants: {...formData.variants, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}})} placeholder="Rouge, Bleu, Noir" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-900/50 p-3 rounded-t-xl border-b border-zinc-200 dark:border-zinc-800">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                                <button type="button" className="text-[10px] font-bold text-[#39FF14] flex items-center gap-1 hover:underline">
                                    <Sparkles size={12} /> {isAIWriting ? 'Rédaction...' : 'Générer avec IA'}
                                </button>
                            </div>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-b-xl p-4 font-medium text-black dark:text-white outline-none focus:border-[#39FF14] transition min-h-[120px]" placeholder="Description détaillée du produit..." />
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Image du produit</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
                                    {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-zinc-700" />}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input type="text" placeholder="Ou coller une URL d'image" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-black dark:text-white outline-none focus:border-[#39FF14]" />
                                    <input type="file" accept="image/*" onChange={(e) => onImageUpload(e, setFormData, formData)} className="w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-200 dark:file:bg-zinc-800 file:text-black dark:file:text-white hover:file:bg-[#39FF14] hover:file:text-black transition" />
                                </div>
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

// --- PRODUCT DETAIL MODAL COMPONENT ---
interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: { size?: string; color?: string }) => void;
  onShare: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onAddReview: (productId: number, review: Omit<Review, 'id' | 'date'>) => void;
  onGenerateQR: (product: Product) => void;
}

function ProductDetailModal({ product, allProducts, isOpen, onClose, onAddToCart, onShare, onViewProduct, onGenerateQR, onAddReview }: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [mediaView, setMediaView] = useState<'image' | 'video'>('image');

  // Reset selection when product changes
  React.useEffect(() => {
    setSelectedSize(null);
    setSelectedColor(null);
    setMediaView('image');
  }, [product]);

  if (!isOpen) return null;

  const similarProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  const isOutOfStock = product.stock === 0;

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
            
            <div className="w-full md:w-1/2 h-72 md:h-auto relative bg-zinc-100 dark:bg-zinc-900">
               {mediaView === 'image' || !product.videoUrl ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <iframe
                        className="w-full h-full"
                        src={product.videoUrl}
                        title={product.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                )}
                {product.videoUrl && (
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <button onClick={(e) => {e.stopPropagation(); setMediaView('image')}} className={`px-4 py-2 rounded-lg text-xs font-bold border backdrop-blur-sm ${mediaView === 'image' ? 'bg-white/80 text-black border-black' : 'bg-black/30 text-white border-white/30'}`}>Image</button>
                        <button onClick={(e) => {e.stopPropagation(); setMediaView('video')}} className={`px-4 py-2 rounded-lg text-xs font-bold border backdrop-blur-sm ${mediaView === 'video' ? 'bg-white/80 text-black border-black' : 'bg-black/30 text-white border-white/30'}`}>Vidéo</button>
                    </div>
                )}
            </div>
            
            <div className="w-full md:w-1/2 p-8 flex flex-col max-h-[90vh] overflow-y-auto">
               <div className="mb-8">
                  <span className="text-[#39FF14] text-xs font-bold uppercase tracking-widest border border-[#39FF14]/20 px-3 py-1 rounded-full mb-4 inline-block">{product.category}</span>
                  <h2 className="text-3xl font-black tracking-tighter text-black dark:text-white mb-2">{product.name}</h2>
                  <p className="text-2xl font-bold text-black dark:text-white mb-4">{product.price.toLocaleString('fr-SN')} <span className="text-sm text-[#39FF14]">FCFA</span></p>
                  
                  {product.stock !== undefined && (
                    <p className={`text-sm font-bold mb-6 ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
                      {isOutOfStock ? 'Épuisé' : `En stock (${product.stock} restants)`}
                    </p>
                  )}

                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">{product.description}</p>

                  <div className="flex items-center gap-2 mb-6 bg-zinc-100 dark:bg-zinc-900 w-max px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex text-yellow-400"><Star size={16} className="fill-yellow-400" /></div>
                    <span className="text-sm font-bold text-black dark:text-white">{product.rating || 5}/5</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium border-l border-zinc-300 dark:border-zinc-700 pl-2 ml-1">{product.reviews || 0} avis vérifiés</span>
                  </div>

                  {/* VARIANTS SELECTION */}
                  {(product.variants?.sizes?.length || 0) > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Taille</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants?.sizes?.map(size => (
                          <button 
                            key={size} 
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${selectedSize === size ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(product.variants?.colors?.length || 0) > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Couleur</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants?.colors?.map(color => (
                          <button 
                            key={color} 
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${selectedColor === color ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500'}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
               
               <div className="flex flex-col gap-3 mb-8 mt-auto">
                  <button 
                    onClick={() => { 
                      onAddToCart(product, { size: selectedSize || undefined, color: selectedColor || undefined }); 
                      onClose(); 
                    }} 
                    disabled={isOutOfStock}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition flex items-center justify-center gap-2 shadow-lg disabled:bg-zinc-400 disabled:cursor-not-allowed"
                  >
                     <Plus size={18} /> Ajouter au panier
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => onShare(product)} className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white py-4 rounded-xl font-bold uppercase text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800">
                       <Share2 size={18} /> Partager
                    </button>
                    <button onClick={() => onGenerateQR(product)} className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white py-4 rounded-xl font-bold uppercase text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800">
                       <QrCode size={18} /> QR Code
                    </button>
                  </div>
               </div>

               {/* REVIEWS SECTION */}
               <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase mb-4">Avis des clients</h4>
                  <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
                    {(product.reviewsList || []).length > 0 ? product.reviewsList?.map(review => (
                      <div key={review.id} className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-black dark:text-white">{review.name}</span>
                          <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-400 dark:text-zinc-600'} />)}</div>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{review.comment}</p>
                      </div>
                    )) : <p className="text-xs text-zinc-500 dark:text-zinc-500 italic">Aucun avis pour ce produit.</p>}
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Laisser un avis</p>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Votre nom" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14]" />
                      <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14]">
                        <option value={5}>5 ★</option>
                        <option value={4}>4 ★</option>
                        <option value={3}>3 ★</option>
                        <option value={2}>2 ★</option>
                        <option value={1}>1 ★</option>
                      </select>
                    </div>
                    <textarea 
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
                 <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase mb-4">Vous aimerez aussi</h4>
                    <div className="grid grid-cols-3 gap-4">
                       {similarProducts.map(p => (
                          <div key={p.id} className="group cursor-pointer" onClick={() => onViewProduct(p)}>
                             <div className="aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             </div>
                             <p className="text-xs font-bold text-black dark:text-white truncate">{p.name}</p>
                             <p className="text-[10px] text-zinc-500 dark:text-zinc-500">{p.price.toLocaleString()} F</p>
                          </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
        </div>
    </div>
  );
}

function ShopDashboard({ products }: { products: Product[] }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('onyx_jaay_orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);

        const uniqueClients: any = {};
        parsedOrders.forEach((order: any) => {
            if (order.customer && order.customer.phone) {
                if (!uniqueClients[order.customer.phone]) {
                    uniqueClients[order.customer.phone] = { ...order.customer };
                }
            }
        });
        setClients(Object.values(uniqueClients));

      } catch (e) {
        console.error("Erreur chargement commandes", e);
      }
    }
  }, []);

  useEffect(() => {
    setLowStockProducts(products.filter(p => (p.stock || 0) < 5 && p.stock !== 0));
  }, [products]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalClients = clients.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const productSales = new Map<number, { quantity: number, name: string, image: string, category: string }>();
  orders.forEach(order => {
    order.items.forEach((item: CartItem) => {
      const sold = productSales.get(item.id) || { quantity: 0, name: item.name, image: item.image, category: item.category };
      productSales.set(item.id, { ...sold, quantity: sold.quantity + item.quantity });
    });
  });

  const bestSellers = [...productSales.entries()]
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5);


  const chartData = (() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      
      const dailyTotal = orders
        .filter(o => o.date.startsWith(dayStr))
        .reduce((sum, o) => sum + o.total, 0);
        
      data.push({ day: days[d.getDay()], total: dailyTotal });
    }
    return data;
  })();

  const maxTotal = Math.max(...chartData.map(d => d.total), 1);

  const handlePrint = () => {
    window.print();
  };

  const StatCard = ({ icon, label, value, colorClass }: { icon: React.ReactNode, label: string, value: string | number, colorClass: string }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex items-center gap-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider">{label}</p>
            <p className="text-black dark:text-white font-black text-3xl">{value}</p>
        </div>
    </div>
  );

  return (
    <div id="dashboard-section" className="p-8 md:p-12 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in print:p-0">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 print:hidden">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Tableau de <span className="text-[#39FF14]">Bord</span></h2>
        <button onClick={handlePrint} className="bg-zinc-800 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
          <Printer size={16} /> Imprimer
        </button>
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mb-12">Aperçu des performances et alertes de stock.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
        <StatCard icon={<DollarSign size={32} />} label="Revenu Total" value={`${totalRevenue.toLocaleString('fr-SN')} F`} colorClass="bg-green-500/10 text-green-500" />
        <StatCard icon={<ShoppingCart size={32} />} label="Commandes" value={totalOrders} colorClass="bg-blue-500/10 text-blue-500" />
        <StatCard icon={<Users size={32} />} label="Clients" value={totalClients} colorClass="bg-orange-500/10 text-orange-500" />
        <StatCard icon={<BarChart size={32} />} label="Panier Moyen" value={`${Math.round(averageOrderValue).toLocaleString('fr-SN')} F`} colorClass="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-black uppercase text-xl">Ventes (7 derniers jours)</h3>
             <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <BarChart size={20} className="text-[#39FF14]" />
             </div>
          </div>
          
          <div className="flex items-end justify-between h-64 gap-4">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                <div 
                  className="w-full max-w-[40px] bg-black dark:bg-white rounded-t-xl transition-all duration-500 relative group-hover:bg-[#39FF14]" 
                  style={{ height: `${(d.total / maxTotal) * 100}%`, minHeight: '4px' }}
                >
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {d.total.toLocaleString()} F
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
              <h3 className="font-black uppercase text-xl">Meilleures Ventes</h3>
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
      
       {/* Low Stock Alert */}
       <div className="mt-8 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl">
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
                       <div className={`px-3 py-1 rounded-lg text-xs font-black ${p.stock === 0 ? 'bg-red-500 text-white' : 'bg-yellow-500/20 text-yellow-600'}`}>
                          {p.stock}
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

    </div>
  );
}

function ShopClients() {
    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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
            'Points de Fidélité': c.loyaltyPoints,
            'Dernière Commande': new Date(c.lastOrder).toLocaleDateString('fr-FR')
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
        XLSX.writeFile(workbook, `onyx_clients_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    useEffect(() => {
        const savedOrders = localStorage.getItem('onyx_jaay_orders');
        if (savedOrders) {
            try {
                const orders = JSON.parse(savedOrders);
                const uniqueClients: any = {};
                
                orders.forEach((order: any) => {
                    if (order.customer && order.customer.phone) {
                        if (!uniqueClients[order.customer.phone]) {
                            uniqueClients[order.customer.phone] = { ...order.customer, totalSpent: 0, ordersCount: 0, lastOrder: order.date, loyaltyPoints: 0 };
                        }
                        uniqueClients[order.customer.phone].totalSpent += order.total;
                        uniqueClients[order.customer.phone].ordersCount += 1;
                        uniqueClients[order.customer.phone].loyaltyPoints += Math.floor(order.total / 1000); // 1 point par 1000 FCFA
                        if (order.pointsUsed) {
                            uniqueClients[order.customer.phone].loyaltyPoints -= order.pointsUsed;
                        }
                        if (new Date(order.date) > new Date(uniqueClients[order.customer.phone].lastOrder)) {
                            uniqueClients[order.customer.phone].lastOrder = order.date;
                        }
                    }
                });
                setClients(Object.values(uniqueClients));
            } catch (e) { console.error(e); }
        }
    }, []);

    const filteredClients = clients.filter(client =>
        (client.name && typeof client.name === 'string' && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && typeof client.phone === 'string' && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Mes <span className="text-[#39FF14]">Clients</span></h2>
                <button onClick={handleExportClients} className="bg-zinc-800 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                    <Download size={16} /> Exporter la liste
                </button>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mb-12">Historique des clients ayant passé commande.</p>
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-black dark:text-white outline-none focus:border-[#39FF14] transition"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-black text-lg">{client.name.charAt(0)}</div>
                            <div>
                                <h3 className="font-bold text-lg leading-none">{client.name}</h3>
                                <p className="text-sm text-zinc-500">{client.phone}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800 gap-4">
                            <div className="flex items-center gap-2">
                                <Gift size={16} className="text-[#39FF14]"/>
                                <p className="font-black text-lg">{client.loyaltyPoints || 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Dépensé</p>
                                <p className="font-black text-[#39FF14]">{client.totalSpent.toLocaleString()} F</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Commandes</p>
                                <p className="font-black">{client.ordersCount}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredClients.length === 0 && <p className="text-zinc-500 col-span-full text-center py-10">Aucun client trouvé.</p>}
            </div>
        </div>
    );
}

interface PromoCode {
  id: number;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  active: boolean;
}

interface ShopSettingsProps {
  promoCodes: PromoCode[];
  setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  shopInfo: { name: string; description: string; phone: string; deliveryFees: number; openingHours: { start: string; end: string; enabled: boolean } };
  setShopInfo: React.Dispatch<React.SetStateAction<{ name: string; description: string; phone: string; deliveryFees: number; openingHours: { start: string; end: string; enabled: boolean } }>>;
}

function ShopSettings({ promoCodes, setPromoCodes, shopInfo, setShopInfo }: ShopSettingsProps) {
  const [newCode, setNewCode] = useState({ code: '', discount: '', type: 'percentage' as 'percentage' | 'fixed' });

  const handleAddCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code || !newCode.discount) return;
    const newPromo: PromoCode = {
      id: Date.now(),
      code: newCode.code.toUpperCase(),
      discount: Number(newCode.discount),
      type: newCode.type,
      active: true,
    };
    setPromoCodes(prev => [...prev, newPromo]);
    setNewCode({ code: '', discount: '', type: 'percentage' });
  };

  const toggleCodeStatus = (id: number) => {
    setPromoCodes(codes => codes.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const deleteCode = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce code promo ?")) {
      setPromoCodes(codes => codes.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto text-black dark:text-white animate-in fade-in">
      <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Paramètres de la <span className="text-[#39FF14]">Boutique</span></h2>
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
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Frais de livraison (Fixe)</label>
                  <input type="number" value={shopInfo.deliveryFees} onChange={(e) => setShopInfo({...shopInfo, deliveryFees: Number(e.target.value)})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#39FF14]" />
              </div>
              
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                      <label className="text-xs font-bold text-zinc-500 uppercase block">Horaires d'ouverture auto</label>
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
          </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
        <h3 className="font-black uppercase text-xl mb-6 flex items-center gap-3"><Ticket size={20} className="text-[#39FF14]" /> Codes Promo</h3>
        
        <form onSubmit={handleAddCode} className="flex flex-wrap gap-4 items-end mb-8 p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <input type="text" placeholder="CODEPROMO" value={newCode.code} onChange={e => setNewCode({...newCode, code: e.target.value})} className="flex-1 bg-white dark:bg-zinc-800 p-3 rounded-lg font-bold text-sm uppercase outline-none focus:border-[#39FF14] border" required />
          <input type="number" placeholder="Valeur" value={newCode.discount} onChange={e => setNewCode({...newCode, discount: e.target.value})} className="w-24 bg-white dark:bg-zinc-800 p-3 rounded-lg font-bold text-sm outline-none focus:border-[#39FF14] border" required />
          <select value={newCode.type} onChange={e => setNewCode({...newCode, type: e.target.value as any})} className="bg-white dark:bg-zinc-800 p-3 rounded-lg font-bold text-sm outline-none focus:border-[#39FF14] border">
            <option value="percentage">%</option>
            <option value="fixed">FCFA</option>
          </select>
          <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={16} /> Ajouter</button>
        </form>

        <div className="space-y-3">
          {promoCodes.map(code => (
            <div key={code.id} className="flex justify-between items-center p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
              <div className="font-bold text-sm uppercase">{code.code} - <span className="text-[#39FF14]">{code.discount}{code.type === 'percentage' ? '%' : ' FCFA'}</span></div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer"><div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${code.active ? 'bg-[#39FF14]' : 'bg-zinc-300 dark:bg-zinc-700'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${code.active ? 'translate-x-5' : ''}`}></div></div><input type="checkbox" checked={code.active} onChange={() => toggleCodeStatus(code.id)} className="hidden" /></label>
                <button onClick={() => deleteCode(code.id)} className="text-zinc-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-zinc-400 bg-zinc-100 p-2 rounded-full hover:bg-zinc-200 transition z-10"><X size={20}/></button>
        <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-2">{product.name}</h3>
        <p className="text-sm text-zinc-500 mb-6">Scannez pour voir ou partager ce produit.</p>
        <div className="p-4 bg-white rounded-2xl border-4 border-black inline-block">
          <QRCode value={productUrl} size={200} />
        </div>
        <input 
          type="text" 
          readOnly 
          value={productUrl} 
          className="w-full mt-6 bg-zinc-100 text-zinc-600 text-xs p-3 rounded-lg border border-zinc-200 text-center"
          onFocus={(e) => e.target.select()}
        />
      </div>
    </div>
  );
}