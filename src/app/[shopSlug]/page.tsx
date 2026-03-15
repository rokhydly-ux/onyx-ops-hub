"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ShoppingCart, Search, Plus, Filter, AlertTriangle, X, Minus, Trash2, Truck, 
  Store, MessageSquare, Sparkles, Heart, ChevronRight, Menu, ArrowRight, Star, Sun, Moon
} from "lucide-react";

const displayPrice = (price: number, currency: string = 'FCFA') => {
    return `${price.toLocaleString('fr-SN')} ${currency}`;
};

export default function DynamicShopPage() {
  const params = useParams();
  const shopSlug = params.shopSlug as string;
  const router = useRouter();

  const [shopInfo, setShopInfo] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // UI
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>(["Toutes"]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Cart
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', instructions: '' });

  useEffect(() => {
    const savedTheme = localStorage.getItem('onyx_jaay_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);

    const fetchShopData = async () => {
      if (!shopSlug) return;
      setIsLoading(true);
      
      const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("slug", shopSlug).single();
      if (shopError || !shop) { setError(true); setIsLoading(false); return; }

      setShopInfo(shop);

      const { data: shopProducts } = await supabase.from("products").select("*").eq("shop_id", shop.id);
      if (shopProducts) {
        setProducts(shopProducts);
        const uniqueCategories = Array.from(new Set(shopProducts.map((p:any) => p.category).filter(Boolean))) as string[];
        setCategories(["Toutes", "Favoris", ...uniqueCategories]);
      }
      setIsLoading(false);
    };
    fetchShopData();
  }, [shopSlug]);

  // 🚀 INTERCEPTION DU PRODUIT ENVOYÉ PAR LA MARKETPLACE
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const productToAddId = urlParams.get('add_product');
      
      if (productToAddId) {
        const productToAdd = products.find(p => String(p.id) === productToAddId);
        if (productToAdd) {
          addToCart(productToAdd);
          // Nettoie l'URL pour ne pas rajouter le produit si le client rafraîchit la page
          window.history.replaceState({}, document.title, window.location.pathname);
        }
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

  const addToCart = (product: any, variant?: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && JSON.stringify(item.selectedVariant) === JSON.stringify(variant));
      if (existing) return prev.map(item => (item.id === product.id && JSON.stringify(item.selectedVariant) === JSON.stringify(variant)) ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, selectedVariant: variant }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemToRemove: any) => setCart(prev => prev.filter(item => item.id !== itemToRemove.id || JSON.stringify(item.selectedVariant) !== JSON.stringify(itemToRemove.selectedVariant)));
  const updateQuantity = (itemToUpdate: any, delta: number) => {
    setCart(prev => prev.map(item => (item.id === itemToUpdate.id && JSON.stringify(item.selectedVariant) === JSON.stringify(itemToUpdate.selectedVariant)) ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCost = deliveryMethod === 'delivery' ? 2000 : 0;
  const cartTotal = subTotal + deliveryCost;

  const confirmOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) return alert("Veuillez remplir votre nom et téléphone.");
    const trackingNumber = `CMD-${Math.floor(100000 + Math.random() * 900000)}`;

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
    } else {
        message += `\n🏬 Mode : Retrait en boutique`;
    }
    message += `\n*Total à payer : ${displayPrice(cartTotal, shopInfo.currency)}*`;

    window.open(`https://wa.me/${shopInfo.phone}?text=${encodeURIComponent(message)}`, '_blank');
    setIsCheckoutModalOpen(false); setIsCartOpen(false); setCart([]); setIsOrderSuccessOpen(true);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black"><div className="w-16 h-16 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#39FF14]"></div></div>;
  if (error || !shopInfo) return <div className="flex flex-col h-screen items-center justify-center bg-zinc-50 dark:bg-black text-center p-6"><AlertTriangle size={64} className="text-zinc-300 mb-6" /><h1 className="text-3xl font-black uppercase text-black dark:text-white mb-2">Boutique Introuvable</h1><p className="text-zinc-500">Cette boutique n'existe pas ou a été désactivée.</p></div>;

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Toutes' ? true : activeCategory === 'Favoris' ? wishlist.includes(p.id) : p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
          <div className="px-4 space-y-2">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catégories</p>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeCategory === cat ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'}`}>
                <span className="flex items-center gap-2">{cat === 'Favoris' && <Heart size={14} />}{cat}</span>
                {activeCategory === cat && <ChevronRight size={14} />}
              </button>
            ))}
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
                          <li><button onClick={() => setIsCartOpen(true)} className="hover:text-[#39FF14] transition-colors">Mon Panier</button></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-black uppercase mb-4 text-black dark:text-white">Contact</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">WhatsApp : {shopInfo.phone}</p>
                      <a href={`https://wa.me/${String(shopInfo.phone).replace(/[^0-9]/g, '')}`} target="_blank" className="mt-2 inline-block px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:bg-[#39FF14] hover:text-black transition">Discuter avec nous</a>
                  </div>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-600">&copy; {new Date().getFullYear()} {shopInfo.name}. Propulsé par <a href="https://onyxops.com" target="_blank" className="font-bold text-black dark:text-white">OnyxOps</a>.</p>
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
                          <button onClick={() => setDeliveryMethod('delivery')} className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'delivery' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}>
                             <Truck size={20} /><span className="text-[10px] font-black uppercase">Livraison</span>
                          </button>
                          <button onClick={() => setDeliveryMethod('pickup')} className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}>
                             <Store size={20} /><span className="text-[10px] font-black uppercase">Retrait</span>
                          </button>
                       </div>
                    </div>
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
                  {deliveryMethod === 'delivery' && <textarea placeholder="Adresse de livraison..." value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 outline-none focus:border-black min-h-[60px] text-black dark:text-white" />}
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

        {/* --- PRODUCT DETAIL MODAL --- */}
        {viewingProduct && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto" onClick={() => setViewingProduct(null)}>
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row my-auto" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black transition z-10"><X size={20}/></button>
                    
                    <div className="w-full md:w-1/2 flex flex-col bg-zinc-100 dark:bg-zinc-900 min-h-[300px] relative">
                        <img src={viewingProduct.image} alt={viewingProduct.name} className="w-full h-full absolute inset-0 object-cover" />
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
                       
                       <div className="flex flex-col gap-3 mt-auto">
                          <button 
                            onClick={() => { addToCart(viewingProduct); setViewingProduct(null); }} 
                            disabled={viewingProduct.stock === 0}
                            className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-white transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                          >
                             <ShoppingCart size={18} /> {viewingProduct.stock === 0 ? "Épuisé" : "Ajouter au Panier"}
                          </button>
                       </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}