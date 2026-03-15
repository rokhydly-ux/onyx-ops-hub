"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ShoppingCart, Search, Plus, Filter, AlertTriangle, X, Minus, Trash2, Truck, Store, MessageSquare, Sparkles } from "lucide-react";

export default function DynamicShopPage() {
  const params = useParams();
  const shopSlug = params.shopSlug as string;

  const [shopInfo, setShopInfo] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>(["Toutes"]);

  // États pour le Panier & Commande
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', instructions: '' });

  useEffect(() => {
    const fetchShopData = async () => {
      if (!shopSlug) return;
      setIsLoading(true);

      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", shopSlug)
        .single();

      if (shopError || !shop) {
        setError(true);
        setIsLoading(false);
        return;
      }

      setShopInfo(shop);

      const { data: shopProducts, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shop.id);

      if (!productsError && shopProducts) {
        setProducts(shopProducts);
        const uniqueCategories = Array.from(new Set(shopProducts.map(p => p.category).filter(Boolean)));
        setCategories(["Toutes", ...uniqueCategories]);
      }

      setIsLoading(false);
    };

    fetchShopData();
  }, [shopSlug]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string | number) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id: string | number, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCost = deliveryMethod === 'delivery' ? 2000 : 0; 
  const cartTotal = subTotal + deliveryCost;

  const confirmOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) return alert("Veuillez remplir votre nom et téléphone.");
    const trackingNumber = `CMD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Sauvegarde Supabase
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
        tracking_number: trackingNumber,
        history: [{ status: 'En attente', date: new Date().toISOString(), user: 'Client (Web)' }]
    }]);

    let message = `👋 Bonjour ! Je souhaite passer commande sur ${shopInfo.name} :\n\n📦 *Réf :* ${trackingNumber}\n\n`;
    cart.forEach(item => { message += `- ${item.name} (x${item.quantity}) : ${(item.price * item.quantity).toLocaleString('fr-FR')} ${shopInfo.currency}\n`; });
    message += `\nSous-total : ${subTotal.toLocaleString('fr-FR')} ${shopInfo.currency}`;
    if (deliveryMethod === 'delivery') {
        message += `\nFrais de livraison : ${deliveryCost.toLocaleString('fr-FR')} ${shopInfo.currency}\n🏠 Adresse : ${customerInfo.address}`;
    } else {
        message += `\n🏬 Mode : Retrait en boutique`;
    }
    message += `\n*Total à payer : ${cartTotal.toLocaleString('fr-FR')} ${shopInfo.currency}*`;

    window.open(`https://wa.me/${shopInfo.phone}?text=${encodeURIComponent(message)}`, '_blank');
    setIsCheckoutModalOpen(false); setIsCartOpen(false); setCart([]); setIsOrderSuccessOpen(true);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black"><div className="w-16 h-16 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !shopInfo) return <div className="flex flex-col h-screen items-center justify-center bg-zinc-50 dark:bg-black text-center p-6"><AlertTriangle size={64} className="text-zinc-300 mb-6" /><h1 className="text-3xl font-black uppercase text-black dark:text-white mb-2">Boutique Introuvable</h1><p className="text-zinc-500">L'URL ne correspond à aucune boutique.</p></div>;

  const filteredProducts = products.filter(p => (activeCategory === "Toutes" || p.category === activeCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black text-black dark:text-white font-sans pb-24">
      <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 p-4 px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {shopInfo.logo_url ? <img src={shopInfo.logo_url} alt={shopInfo.name} className="h-10 w-auto object-contain" /> : <div className="w-10 h-10 rounded-full bg-[#39FF14] flex items-center justify-center text-black font-bold">{shopInfo.name.charAt(0)}</div>}
          <h1 className="text-xl lg:text-2xl font-black tracking-tighter uppercase">{shopInfo.name}</h1>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-black dark:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#39FF14] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">{cartCount}</span>}
        </button>
      </header>

      <main className="p-6 lg:p-12 max-w-7xl mx-auto">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">{shopInfo.name}</h2>
          <p className="text-zinc-500 dark:text-zinc-400">{shopInfo.description || "Bienvenue sur notre boutique en ligne !"}</p>
          <div className="mt-8 flex items-center bg-white dark:bg-zinc-900 rounded-full p-2 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Search className="text-zinc-400 ml-4" size={20} /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-transparent p-3 outline-none text-sm font-bold" />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 mb-8 custom-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase whitespace-nowrap transition-colors ${activeCategory === cat ? "bg-black dark:bg-white text-[#39FF14] dark:text-black shadow-lg" : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800"}`}>
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-shadow cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img src={product.image || "https://placehold.co/600"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{product.category}</span>
                  <h3 className="font-bold text-lg leading-tight mb-2 text-black dark:text-white line-clamp-2">{product.name}</h3>
                  <div className="mt-auto flex justify-between items-end pt-4">
                    <p className="text-xl font-black text-[#39FF14]">{Number(product.price).toLocaleString('fr-FR')} {shopInfo.currency}</p>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-[#39FF14] hover:text-black transition-colors"><Plus size={20} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500"><Filter size={48} className="mx-auto mb-4 opacity-20" /><p className="text-xl font-black mb-2">Aucun produit trouvé</p></div>
        )}
      </main>

      {/* Floating Cart & Drawers */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-6 right-6 z-40 md:hidden animate-in slide-in-from-bottom-4">
            <button onClick={() => setIsCartOpen(true)} className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm shadow-[0_10px_30px_rgba(57,255,20,0.3)] flex items-center justify-between px-6">
                <span className="flex items-center gap-3"><ShoppingCart size={20} /> Voir mon panier ({cartCount})</span>
                <span>{cartTotal.toLocaleString('fr-FR')} {shopInfo.currency}</span>
            </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative bg-white dark:bg-zinc-950 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center"><h2 className="text-xl font-black uppercase flex items-center gap-3"><ShoppingCart className="text-[#39FF14]" /> Panier</h2><button onClick={() => setIsCartOpen(false)}><X size={20}/></button></div>
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? <p className="text-center text-zinc-500 mt-20">Vide.</p> : cart.map(item => (
                    <div key={item.id} className="flex gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                       <img src={item.image} className="w-20 h-20 object-cover rounded-xl" />
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start"><h4 className="font-bold text-sm">{item.name}</h4><button onClick={() => removeFromCart(item.id)} className="text-red-500"><Trash2 size={16}/></button></div>
                          <p className="text-[#39FF14] font-bold text-sm">{(item.price * item.quantity).toLocaleString('fr-FR')} {shopInfo.currency}</p>
                          <div className="flex items-center gap-3 mt-2"><button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg"><Minus size={14}/></button><span className="text-sm font-bold w-4 text-center">{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg"><Plus size={14}/></button></div>
                       </div>
                    </div>
                ))}
             </div>
             {cart.length > 0 && <div className="p-6 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800"><button onClick={() => setIsCheckoutModalOpen(true)} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm shadow-lg flex items-center justify-between px-6">Commander <span>{cartTotal.toLocaleString('fr-FR')} {shopInfo.currency}</span></button></div>}
          </div>
        </div>
      )}

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"><div className="bg-white dark:bg-zinc-950 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative"><button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-6 right-6"><X size={20}/></button><h3 className="text-2xl font-black uppercase mb-6">Finaliser</h3><div className="space-y-3 mb-6"><input type="text" placeholder="Nom *" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 outline-none border" /><input type="tel" placeholder="Téléphone *" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 outline-none border" /><div className="flex gap-2 mt-4"><button onClick={() => setDeliveryMethod('delivery')} className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center ${deliveryMethod === 'delivery' ? 'border-black dark:border-white bg-white dark:bg-zinc-800' : 'border-transparent bg-zinc-200 dark:bg-zinc-800'}`}><Truck size={18} /> <span className="text-[10px] font-black uppercase">Livraison</span></button><button onClick={() => setDeliveryMethod('pickup')} className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center ${deliveryMethod === 'pickup' ? 'border-black dark:border-white bg-white dark:bg-zinc-800' : 'border-transparent bg-zinc-200 dark:bg-zinc-800'}`}><Store size={18} /> <span className="text-[10px] font-black uppercase">Retrait</span></button></div>{deliveryMethod === 'delivery' && <textarea placeholder="Adresse..." value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 outline-none border min-h-[60px] mt-2" />}</div><button onClick={confirmOrder} className="w-full py-4 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2"><MessageSquare size={18}/> Envoyer sur WhatsApp</button></div></div>
      )}

      {isOrderSuccessOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><div className="bg-white dark:bg-zinc-950 rounded-[3rem] w-full max-w-md p-10 text-center shadow-2xl relative"><div className="w-20 h-20 bg-[#39FF14]/20 text-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-6"><Sparkles size={40} /></div><h3 className="text-3xl font-black uppercase mb-4">Merci ! 💖</h3><p className="text-zinc-500 mb-8">La commande a été envoyée sur WhatsApp.</p><button onClick={() => setIsOrderSuccessOpen(false)} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase text-xs">Fermer</button></div></div>
      )}
    </div>
  );
}
