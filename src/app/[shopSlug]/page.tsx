"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ShoppingCart, Search, Plus, Filter, AlertTriangle, X, Minus, Trash2, Truck, 
  Store, MessageSquare, Sparkles, Heart, ChevronRight, Menu, ArrowRight, Star, Sun, Moon,
  Package, QrCode, Share2, ArrowUp, ArrowDown
} from "lucide-react";
import QRCode from "react-qr-code";

const displayPrice = (price: number, currency: string = 'FCFA') => {
    return `${price.toLocaleString('fr-SN')} ${currency}`;
};

const INITIAL_ZONES = [
  { id: 1, name: "Zone 1", price: 1300, quartiers: ["Libertés", "Sacré Cœur", "Point E"] },
  { id: 2, name: "Zone 2", price: 1800, quartiers: ["Yoff", "Ville", "Colobane", "Foire"] },
  { id: 3, name: "Zone 3", price: 2000, quartiers: ["Almadies", "Parcelles", "Pikine"] },
  { id: 4, name: "Zone 4", price: 2500, quartiers: ["Guédiawaye", "Thiaroye"] },
  { id: 5, name: "Zone 5", price: 3000, quartiers: ["Keur Massar", "Rufisque"] }
];

export default function DynamicShopPage() {
  const params = useParams();
  const shopSlug = params.shopSlug as string;
  const router = useRouter();

  const [shopInfo, setShopInfo] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState<any[]>(INITIAL_ZONES);
  
  // UI
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [categories, setCategories] = useState<string[]>(["Toutes"]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [qrCodeProduct, setQrCodeProduct] = useState<any | null>(null);

  // Cart
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', instructions: '' });

  // Tracking & Reviews
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('onyx_jaay_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);

    const savedCart = localStorage.getItem(`onyx_cart_${shopSlug}`);
    if (savedCart) {
        try { const parsed = JSON.parse(savedCart); if (Array.isArray(parsed)) setCart(parsed); } catch(e) {}
    }

    const savedWishlist = localStorage.getItem(`onyx_wishlist_${shopSlug}`);
    if (savedWishlist) {
        try { const parsed = JSON.parse(savedWishlist); if (Array.isArray(parsed)) setWishlist(parsed); } catch(e) {}
    }

    const fetchShopData = async () => {
      if (!shopSlug) return;
      setIsLoading(true);
      
      const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("slug", shopSlug).single();
      if (shopError || !shop) { setError(true); setIsLoading(false); return; }

      setShopInfo(shop);
      if (shop.delivery_zones && shop.delivery_zones.length > 0) {
        setDeliveryZones(shop.delivery_zones);
      }

      const { data: shopProducts } = await supabase.from("products").select("*").eq("shop_id", shop.id);
      if (shopProducts) {
        setProducts(shopProducts.map((p: any) => ({
            id: p.id, name: p.name, price: p.price, old_price: p.old_price,
            description: p.description, image: p.image, gallery: p.gallery || [], category: p.category,
            stock: p.stock, rating: p.rating, reviews: p.reviews, variants: p.variants || { sizes: [], colors: [] },
            video_url: p.video_url, reviewsList: []
        })));
        const uniqueCategories = Array.from(new Set(shopProducts.map((p:any) => p.category).filter(Boolean))) as string[];
        setCategories(["Toutes", "Favoris", ...uniqueCategories]);
      }
      setIsLoading(false);
    };
    fetchShopData();
  }, [shopSlug]);

  useEffect(() => {
    localStorage.setItem(`onyx_cart_${shopSlug}`, JSON.stringify(cart));
  }, [cart, shopSlug]);

  useEffect(() => {
    localStorage.setItem(`onyx_wishlist_${shopSlug}`, JSON.stringify(wishlist));
  }, [wishlist, shopSlug]);

  // 🚀 URL PARAMS INTERCEPTION (Marketplace & Tracking & Review)
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      let shouldCleanUrl = false;

      const productToAddId = urlParams.get('add_product');
      
      if (productToAddId) {
        const productToAdd = products.find(p => String(p.id) === productToAddId);
        if (productToAdd) addToCart(productToAdd);
        shouldCleanUrl = true;
      }

      const productId = urlParams.get('product');
      if (productId) {
        const product = products.find(p => String(p.id) === productId);
        if (product) setViewingProduct(product);
        shouldCleanUrl = true;
      }

      const orderId = urlParams.get('order_review');
      if (orderId) {
        setReviewOrderId(orderId);
        shouldCleanUrl = true;
      }

      if (shouldCleanUrl) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isLoading, products]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('onyx_jaay_theme', newTheme);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const addToCart = (product: any, variant?: any, openCart = true) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && JSON.stringify(item.selectedVariant) === JSON.stringify(variant));
      
      const totalProductQuantityInCart = prev.filter(item => item.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
      if (product.stock !== undefined && totalProductQuantityInCart >= product.stock) {
        return prev;
      }

      if (existing) return prev.map(item => (item.id === product.id && JSON.stringify(item.selectedVariant) === JSON.stringify(variant)) ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, selectedVariant: variant }];
    });
    if (openCart) setIsCartOpen(true);
  };

  const removeFromCart = (itemToRemove: any) => setCart(prev => prev.filter(item => item.id !== itemToRemove.id || JSON.stringify(item.selectedVariant) !== JSON.stringify(itemToRemove.selectedVariant)));
  const updateQuantity = (itemToUpdate: any, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.id === itemToUpdate.id && JSON.stringify(item.selectedVariant) === JSON.stringify(itemToUpdate.selectedVariant)) {
            const newQty = item.quantity + delta;
            if (delta > 0 && item.stock !== undefined) {
                const totalProductQuantityInCart = prev.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
                if (totalProductQuantityInCart >= item.stock) return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
    }).filter(item => item.quantity > 0));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCost = deliveryMethod === 'delivery' 
    ? selectedZoneId ? (deliveryZones.find(z => z.id === selectedZoneId)?.price || 0) : 0
    : 0;
  const cartTotal = subTotal + deliveryCost;

  const confirmOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) return alert("Veuillez remplir votre nom et téléphone.");
    if (deliveryMethod === 'delivery' && !selectedZoneId) return alert("Veuillez sélectionner une zone de livraison.");

    const trackingNumber = `CMD-${Math.floor(100000 + Math.random() * 900000)}`;
    const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);

    await supabase.from('orders').insert([{
        shop_id: shopInfo.id,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        delivery_instructions: customerInfo.instructions,
        items: cart,
        total_amount: cartTotal,
        status: 'En attente',
        delivery_method: deliveryMethod,
        delivery_zone: selectedZone ? selectedZone.name : null,
        tracking_number: trackingNumber
    }]);

    let message = `👋 Bonjour ! Je souhaite passer commande sur ${shopInfo.name} :\n\n📦 *Numéro de suivi :* ${trackingNumber}\n\n`;
    cart.forEach(item => { 
        let variantInfo = item.selectedVariant ? ` (${[item.selectedVariant.size, item.selectedVariant.color].filter(Boolean).join(', ')})` : '';
        message += `- ${item.name}${variantInfo} (x${item.quantity}) : ${displayPrice(item.price * item.quantity, shopInfo.currency)}\n`; 
    });
    message += `\nSous-total : ${displayPrice(subTotal, shopInfo.currency)}`;
    if (deliveryMethod === 'delivery') {
        message += `\nFrais de livraison : ${displayPrice(deliveryCost, shopInfo.currency)}\n🏠 Adresse : ${customerInfo.address}`;
        message += `\n📍 Zone : ${selectedZone?.name}`;
    } else {
        message += `\n🏬 Mode : Retrait en boutique`;
    }
    if (customerInfo.instructions) message += `\n📝 Instructions : ${customerInfo.instructions}`;
    message += `\n*Total à payer : ${displayPrice(cartTotal, shopInfo.currency)}*`;

    window.open(`https://wa.me/${String(shopInfo.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    setIsCheckoutModalOpen(false); setIsCartOpen(false); setCart([]); setIsOrderSuccessOpen(true);
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracking(true);
    setTrackedOrder(null);
    const cleanTrackingInput = trackingInput.trim().toUpperCase(); 
    try {
        const { data, error } = await supabase.from('orders').select('*').eq('tracking_number', cleanTrackingInput).eq('shop_id', shopInfo.id).maybeSingle();
        if (data && !error) {
            setTrackedOrder(data);
        } else {
            alert("Aucune commande trouvée avec ce numéro de suivi pour cette boutique.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsTracking(false);
    }
  };

  const handleShareProduct = (product: any) => {
    const productUrl = `${window.location.origin}/${shopSlug}?product=${product.id}`;
    const text = `*${product.name}*\nPrix : ${displayPrice(product.price, shopInfo.currency)}\n\n${product.description}\n\nVoir ici : ${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black"><div className="w-16 h-16 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#39FF14]"></div></div>;
  if (error || !shopInfo) return <div className="flex flex-col h-screen items-center justify-center bg-zinc-50 dark:bg-black text-center p-6"><AlertTriangle size={64} className="text-zinc-300 mb-6" /><h1 className="text-3xl font-black uppercase text-black dark:text-white mb-2">Boutique Introuvable</h1><p className="text-zinc-500">Cette boutique n'existe pas ou a été désactivée.</p></div>;

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Toutes' ? true : activeCategory === 'Favoris' ? wishlist.includes(p.id) : p.category === activeCategory;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMinPrice = minPrice === '' || p.price >= minPrice;
    const matchesMaxPrice = maxPrice === '' || p.price <= maxPrice;
    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
  }).sort((a, b) => {
    if (sortOrder === 'asc') return a.price - b.price;
    if (sortOrder === 'desc') return b.price - a.price;
    return b.id - a.id; 
  });

  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-black text-black dark:text-white font-sans overflow-hidden">
      
      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative bg-zinc-50 dark:bg-zinc-950 w-72 h-full shadow-2xl flex flex-col border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-300">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h1 className="text-2xl font-black tracking-tighter uppercase line-clamp-1">{shopInfo.name}</h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="px-4 mb-6"><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-black dark:text-white outline-none focus:border-[#39FF14] transition" /></div>
                
                <nav className="px-4 space-y-2 mb-8">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
                  <button onClick={() => { setSearchTerm(''); setActiveCategory('Toutes'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 hover:text-black dark:hover:text-white`}>
                    <Store size={18} /> Accueil
                  </button>
                  <button onClick={() => { setIsTrackingModalOpen(true); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 hover:text-black dark:hover:text-white`}>
                    <Package size={18} /> Suivi Commande
                  </button>
                </nav>

                <div className="px-4 space-y-2">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catégories</p>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeCategory === cat ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}>
                      <span className="flex items-center gap-2">{cat === 'Favoris' && <Heart size={14} />}{cat}</span>
                      {activeCategory === cat && <ChevronRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex-col hidden md:flex">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 h-20 flex items-center">
          {shopInfo.logo_url ? <img src={shopInfo.logo_url} alt={shopInfo.name} className="h-10 w-auto object-contain" /> : <h1 className="text-2xl font-black tracking-tighter uppercase line-clamp-1">{shopInfo.name}</h1>}
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-4 mb-6"><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm text-black dark:text-white outline-none focus:border-[#39FF14]" /></div>
          
          <nav className="px-4 space-y-2 mb-8">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
            <button onClick={() => { setSearchTerm(''); setActiveCategory('Toutes'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white`}>
              <Store size={18} /> Accueil
            </button>
            <button onClick={() => setIsTrackingModalOpen(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white`}>
              <Package size={18} /> Suivi Commande
            </button>
          </nav>

          <div className="px-4 space-y-2">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catégories</p>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeCategory === cat ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                <span className="flex items-center gap-2">{cat === 'Favoris' && <Heart size={14} />}{cat}</span>
                {activeCategory === cat && <ChevronRight size={14} />}
              </button>
            ))}
          </div>

          <div className="px-4 space-y-2 mt-8">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Filter size={12}/> Prix ({shopInfo.currency})</p>
            <div className="px-4 flex gap-2">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs text-black dark:text-white outline-none focus:border-[#39FF14] transition" />
            </div>
            <div className="px-4 mt-2 flex gap-2">
                <button onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')} className={`flex-1 p-2 rounded-xl text-xs font-bold border ${sortOrder === 'asc' ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}><ArrowUp size={12} className="inline mr-1"/> Prix</button>
                <button onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')} className={`flex-1 p-2 rounded-xl text-xs font-bold border ${sortOrder === 'desc' ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}><ArrowDown size={12} className="inline mr-1"/> Prix</button>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#39FF14] flex items-center justify-center text-black font-bold">
              {shopInfo.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-black dark:text-white line-clamp-1">{shopInfo.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-1">{shopInfo.description || "Boutique en ligne"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
           <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-black dark:text-white"><Menu size={24}/></button>
              <h1 className="text-lg font-black tracking-tighter uppercase text-black dark:text-white line-clamp-1">{shopInfo.name}</h1> 
           </div>
           <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-black dark:text-white">
              <ShoppingCart size={24} />
              {cartCount > 0 && <span className="absolute top-0 right-0 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center bg-[#39FF14] text-black">{cartCount}</span>}
           </button>
        </div>

        {/* Bouton Panier Flottant Desktop */}
        <header className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-end items-start pointer-events-none hidden md:flex">
          <div className="flex items-center gap-4 pointer-events-auto ml-auto">
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 transition backdrop-blur-md">
              <div className="relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && <span className="absolute -top-2 -right-2 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center bg-[#39FF14] text-black">{cartCount}</span>}
              </div>
              <span className="text-xs font-bold uppercase">Panier</span>
            </button>
            <button onClick={() => setIsWishlistOpen(true)} className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 transition backdrop-blur-md">
              <div className="relative">
                <Heart size={18} />
                {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </div>
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full bg-white/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
              <Sun className="h-4 w-4 text-black dark:hidden" />
              <Moon className="h-4 w-4 text-white hidden dark:block" />
            </button>
          </div>
        </header>

        <div className="p-8 md:p-12 md:pt-32 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
          <div className="flex-1">
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Catalogue <span className="text-[#39FF14]">Produits</span></h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">Bienvenue sur la boutique de {shopInfo.name}. Ajoutez au panier et validez via WhatsApp !</p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col group transition-all shadow-sm cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600" onClick={() => setViewingProduct(product)}>
                    <div className="relative aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <img src={product.image || "https://placehold.co/600"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {product.stock === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none"><span className="text-white font-black uppercase tracking-widest border-2 border-white px-4 py-2 rounded-lg">En rupture</span></div>}
                      <span className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#39FF14] border border-zinc-200 dark:border-zinc-700 shadow-sm">{product.category}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                        className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md p-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
                      >
                        <Heart size={18} className={`transition-all ${wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-black dark:text-white'}`} />
                      </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold tracking-tight text-black dark:text-white line-clamp-2">{product.name}</h3>
                      
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
                            {product.old_price && product.old_price > product.price && <p className="text-sm text-zinc-400 line-through mb-1">{displayPrice(product.old_price, shopInfo.currency)}</p>}
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} disabled={product.stock === 0} className="bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                          <Plus size={16} /> Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-500"><Filter size={48} className="mx-auto mb-4 opacity-20" /><p className="text-xl font-black text-black dark:text-white mb-2">0 résultat</p></div>
            )}
          </div>
          
          {/* Footer */}
          <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-8 px-6 text-center animate-in fade-in shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left max-w-4xl mx-auto">
                  <div>
                      <h4 className="font-black uppercase mb-4 text-black dark:text-white">{shopInfo.name}</h4>
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
              </div>
              <div className="flex flex-col items-center gap-2 mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                  <p className="text-xs text-zinc-400 dark:text-zinc-600">&copy; {new Date().getFullYear()} {shopInfo.name}. Propulsé par <a href="https://onyxops.com" target="_blank" className="font-bold text-black dark:text-white hover:text-[#39FF14]">OnyxOps</a>.</p>
                  <button onClick={() => router.push('/login')} className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest mt-2">Connexion Vendeur</button>
              </div>
          </footer>
        </div>

        {/* --- FLOAT CART MOBILE --- */}
        {cartCount > 0 && !isCartOpen && (
          <div className="fixed bottom-6 left-6 right-6 z-40 md:hidden animate-in slide-in-from-bottom-4">
              <button onClick={() => setIsCartOpen(true)} className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-xs shadow-[0_10px_30px_rgba(57,255,20,0.3)] flex items-center justify-between px-4 border border-[#32E612]">
                  <span className="flex items-center gap-3">
                      <div className="relative"><ShoppingCart size={18} /><span className="absolute -top-2 -right-2 bg-black text-[#39FF14] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">{cartCount}</span></div>
                      Voir le panier
                  </span>
                  <span className="bg-black text-[#39FF14] px-2 py-1 rounded-lg">{displayPrice(cartTotal, shopInfo.currency)}</span>
              </button>
          </div>
        )}

        {/* --- WISHLIST DRAWER --- */}
        {isWishlistOpen && (
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
                    </div>
                  ) : (
                    products.filter(p => wishlist.includes(p.id)).map(item => (
                      <div key={item.id} className="flex gap-6 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer" onClick={() => { setViewingProduct(item); setIsWishlistOpen(false); }}>
                         <img src={item.image || "https://placehold.co/150"} alt={item.name} className="w-24 h-24 object-cover rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                         <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                               <h4 className="font-bold text-base line-clamp-1 text-black dark:text-white">{item.name}</h4>
                               <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item.id); }} className="text-zinc-400 hover:text-red-500 shrink-0 p-1"><Trash2 size={18}/></button>
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg mb-auto">{displayPrice(item.price, shopInfo.currency)}</p>
                            <button onClick={(e) => { e.stopPropagation(); addToCart(item); setIsWishlistOpen(false); }} className="text-xs bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl w-max mt-2 font-bold uppercase hover:bg-[#39FF14] hover:text-black transition-colors">Ajouter</button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}

        {/* --- CART DRAWER --- */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative bg-white dark:bg-zinc-950 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
               <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><ShoppingCart className="text-[#39FF14]" /> Mon Panier</h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full"><X size={20}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {cart.length === 0 ? <p className="text-center text-zinc-500 mt-20">Votre panier est vide.</p> : cart.map(item => (
                    <div key={`${item.id}-${JSON.stringify(item.selectedVariant)}`} className="flex gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                         <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                         <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm line-clamp-1 text-black dark:text-white">{item.name}</h4>
                                <button onClick={() => removeFromCart(item)} className="text-zinc-500 hover:text-red-500 shrink-0"><Trash2 size={16}/></button>
                            </div>
                            {(item.selectedVariant?.size || item.selectedVariant?.color) && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
                                {item.selectedVariant.size && <span className="mr-2">Taille: {item.selectedVariant.size}</span>}
                                {item.selectedVariant.color && <span>Coul: {item.selectedVariant.color}</span>}
                                </p>
                            )}
                            <p className="text-[#39FF14] font-bold text-sm">{displayPrice(item.price * item.quantity, shopInfo.currency)}</p>
                            <div className="flex items-center gap-3 mt-2">
                               <button onClick={() => updateQuantity(item, -1)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white"><Minus size={14}/></button>
                               <span className="text-sm font-bold w-4 text-center text-black dark:text-white">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item, 1)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white"><Plus size={14}/></button>
                            </div>
                         </div>
                      </div>
                  ))}
               </div>
               {cart.length > 0 && (
                 <div className="p-6 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                    <div className="mb-6">
                       <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-3">Mode de livraison</p>
                       <div className="flex gap-3">
                        {shopInfo.delivery_options?.delivery !== false && (
                            <button onClick={() => setDeliveryMethod('delivery')} className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'delivery' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}>
                               <Truck size={20} /><span className="text-[10px] font-black uppercase">Livraison</span>
                            </button>
                        )}
                        {shopInfo.delivery_options?.pickup !== false && (
                            <button onClick={() => setDeliveryMethod('pickup')} className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}>
                               <Store size={20} /><span className="text-[10px] font-black uppercase">Retrait</span>
                            </button>
                        )}
                       </div>
                    </div>

                  {deliveryMethod === 'delivery' && deliveryZones.length > 0 && (
                      <div className="mb-6">
                          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Zone de livraison</p>
                          <select 
                              value={selectedZoneId || ''} 
                              onChange={(e) => setSelectedZoneId(Number(e.target.value))}
                              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:border-[#39FF14] text-black dark:text-white cursor-pointer"
                          >
                              <option value="">-- Sélectionner votre zone --</option>
                              {deliveryZones.map(zone => (
                                  <option key={zone.id} value={zone.id}>{zone.name} - {zone.price.toLocaleString()} F</option>
                              ))}
                          </select>
                      </div>
                  )}

                    <div className="flex justify-between items-center mb-6"><span className="text-zinc-500 font-bold uppercase text-xs">Total à payer</span><span className="text-2xl font-black text-black dark:text-white">{displayPrice(cartTotal, shopInfo.currency)}</span></div>
                    <button onClick={() => setIsCheckoutModalOpen(true)} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2">Commander sur WhatsApp <ArrowRight size={18} /></button>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- CHECKOUT CONFIRMATION MODAL --- */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
              <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white">Confirmation</h3>
              <p className="text-zinc-500 text-sm mb-6">Vos informations de livraison.</p>
              <div className="mb-6 space-y-3">
                  <input type="text" placeholder="Votre Nom *" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 outline-none focus:border-black text-black dark:text-white" />
                  <input type="tel" placeholder="Votre Téléphone *" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 outline-none focus:border-black text-black dark:text-white" />
                  {deliveryMethod === 'delivery' && <textarea placeholder="Adresse de livraison détaillée (Numéro de rue, repère...)" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 outline-none focus:border-black min-h-[60px] text-black dark:text-white resize-none" />}
              </div>
              <button onClick={confirmOrder} className="w-full py-4 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase hover:bg-white transition flex items-center justify-center gap-2 shadow-lg"><MessageSquare size={18}/> Envoyer sur WhatsApp</button>
            </div>
          </div>
        )}

        {/* --- SUCCESS MODAL --- */}
        {isOrderSuccessOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] w-full max-w-md p-10 text-center shadow-2xl relative">
              <div className="w-20 h-20 bg-[#39FF14]/20 text-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><Sparkles size={40} /></div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">Merci ! 💖</h3>
              <p className="text-zinc-500 mb-8">Votre commande a été envoyée sur WhatsApp.</p>
              <button onClick={() => setIsOrderSuccessOpen(false)} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase text-xs">Fermer</button>
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
                    type="text" placeholder="Ex: CMD-123456" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value.toUpperCase())} required
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 font-bold outline-none focus:border-[#39FF14] uppercase text-sm" 
                 />
                 <button type="submit" disabled={isTracking} className="bg-black text-[#39FF14] px-4 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition disabled:opacity-50 flex items-center gap-2">
                    <Search size={16}/> {isTracking ? '...' : 'Chercher'}
                 </button>
              </form>

              {trackedOrder && (
                 <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 animate-in slide-in-from-bottom-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Résultat du suivi</p>
                    <div className="flex justify-between items-center mb-4">
                       <p className="font-bold text-black dark:text-white">{trackedOrder.tracking_number}</p>
                       <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${trackedOrder.status === 'Livré' ? 'bg-green-100 text-green-700' : trackedOrder.status === 'Annulé' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {trackedOrder.status || 'En attente'}
                       </span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                       <div><p className="text-[10px] font-bold text-zinc-500 uppercase">Date</p><p className="text-xs font-bold text-black dark:text-white">{new Date(trackedOrder.created_at).toLocaleDateString('fr-FR')}</p></div>
                       <div className="text-right"><p className="text-[10px] font-bold text-zinc-500 uppercase">Total</p><p className="text-sm font-black text-[#39FF14]">{displayPrice(trackedOrder.total_amount, shopInfo.currency)}</p></div>
                    </div>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* --- PRODUCT DETAIL MODAL --- */}
        {viewingProduct && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto" onClick={() => setViewingProduct(null)}>
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row my-auto" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black transition z-10"><X size={20}/></button>
                    
                    <div className="w-full md:w-1/2 flex flex-col bg-zinc-100 dark:bg-zinc-900 min-h-[300px] relative">
                        {viewingProduct.video_url ? (
                            <iframe className="w-full h-full absolute inset-0" src={viewingProduct.video_url} title={viewingProduct.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                        ) : (
                            <img src={viewingProduct.image} alt={viewingProduct.name} className="w-full h-full absolute inset-0 object-cover" />
                        )}
                    </div>
                    
                    <div className="w-full md:w-1/2 p-8 flex flex-col max-h-[90vh] overflow-y-auto">
                       <div className="mb-8">
                          <span className="text-[#39FF14] text-xs font-bold uppercase tracking-widest border border-[#39FF14]/20 px-3 py-1 rounded-full mb-4 inline-block">{viewingProduct.category}</span>
                          <h2 className="text-3xl font-black tracking-tighter text-black dark:text-white mb-2">{viewingProduct.name}</h2>
                          <div className="flex items-center gap-3 mb-6">
                              <p className="text-2xl font-bold text-black dark:text-white">{displayPrice(viewingProduct.price, shopInfo.currency)}</p>
                              {viewingProduct.old_price && viewingProduct.old_price > viewingProduct.price && (
                                  <p className="text-lg text-zinc-500 line-through">{displayPrice(viewingProduct.old_price, shopInfo.currency)}</p>
                              )}
                          </div>
                          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">{viewingProduct.description || "Aucune description fournie pour ce produit."}</p>
                       </div>
                       
                       <div className="flex flex-col gap-3 mb-4 mt-auto">
                          <div className="flex gap-3">
                              <button onClick={() => { addToCart(viewingProduct); setViewingProduct(null); }} disabled={viewingProduct.stock === 0} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                                 <ShoppingCart size={18} /> {viewingProduct.stock === 0 ? "Épuisé" : "Ajouter au Panier"}
                              </button>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => handleShareProduct(viewingProduct)} className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white py-3 rounded-xl font-bold uppercase text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800">
                               <Share2 size={16} /> Partager
                            </button>
                            <button onClick={() => setQrCodeProduct(viewingProduct)} className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white py-3 rounded-xl font-bold uppercase text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800">
                               <QrCode size={16} /> QR Code
                            </button>
                          </div>
                       </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- QR CODE MODAL --- */}
        {qrCodeProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setQrCodeProduct(null)}>
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <button type="button" onClick={() => setQrCodeProduct(null)} className="absolute top-4 right-4 text-zinc-400 bg-zinc-100 p-2 rounded-full hover:bg-zinc-200 transition z-10"><X size={20}/></button>
              <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-2">{qrCodeProduct.name}</h3>
              <p className="text-sm text-zinc-500 mb-6">Scannez pour voir ou partager ce produit.</p>
              <div className="p-4 bg-white rounded-2xl border-4 border-black inline-block">
                <QRCode value={`${window.location.origin}/${shopSlug}?product=${qrCodeProduct.id}`} size={200} />
              </div>
              <input type="text" readOnly value={`${window.location.origin}/${shopSlug}?product=${qrCodeProduct.id}`} className="w-full mt-6 bg-zinc-100 text-zinc-600 text-xs p-3 rounded-lg border border-zinc-200 text-center" onFocus={(e) => e.target.select()} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}