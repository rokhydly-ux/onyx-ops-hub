"use client";

import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { 
  MessageSquare, Edit, Trash2, Plus, FileUp, Sparkles, X, Heart, Star, QrCode,
  Image as ImageIcon, DollarSign, Tag, Type, Home, LayoutDashboard, 
  Settings, Store, ChevronRight, Share2, Menu, ShoppingCart, Minus, Filter, ArrowRight
} from 'lucide-react';
import QRCode from "react-qr-code";

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
  { id: 1, name: 'Boubou Onyx Premium', price: 75000, description: 'Tissu de luxe, coupe moderne, parfait pour les grandes occasions.', image: 'https://i.ibb.co/pPZJz7j/boubou-1.jpg', category: 'Luxe', rating: 5, reviews: 13, stock: 10, reviewsList: [{id: 1, name: "Aïssatou", rating: 5, comment: "Magnifique, la qualité est au rendez-vous.", date: "2024-03-10"}] },
  { id: 2, name: 'Ensembl Tailleur "Business"', price: 85000, description: 'Pour un look pro et élégant au bureau.', image: 'https://i.ibb.co/yQJ4c1g/tailleur-femme.jpg', category: 'Professionnel', rating: 4.5, reviews: 8, stock: 5, reviewsList: [] },
  { id: 3, name: 'Robe de Soirée "Lagoon"', price: 120000, description: 'Faites sensation lors de vos événements avec cette pièce unique.', image: 'https://i.ibb.co/VvzHZj3/robe-soiree.jpg', category: 'Soirée', rating: 5, reviews: 24, stock: 0, reviewsList: [] },
  { id: 4, name: 'Chemise en Lin "Dakar"', price: 25000, description: 'Légère et respirante, idéale pour la saison chaude.', image: 'https://i.ibb.co/3sSqcCg/chemise-lin.jpg', category: 'Casual', rating: 4, reviews: 15, variants: { sizes: ['M', 'L', 'XL'], colors: ['Blanc', 'Beige', 'Bleu Ciel'] }, stock: 20, reviewsList: [] },
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

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
    let message = "Bonjour, je souhaite passer commande :\n\n";
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
    message += `\n*Total : ${cartTotal.toLocaleString('fr-SN')} FCFA*`;
    message += `\n\nMerci de confirmer la disponibilité.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
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

  const categories = ['Toutes', 'Favoris', 'Luxe', 'Professionnel', 'Soirée', 'Casual'];
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
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* --- MOBILE SIDEBAR --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative bg-zinc-950 w-72 h-full shadow-2xl flex flex-col border-r border-zinc-800 animate-in slide-in-from-left duration-300">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h1 className="text-2xl font-black tracking-tighter uppercase">Onyx <span className="text-[#39FF14]">Jaay</span></h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-400 hover:text-white"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="px-4 mb-6">
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-[#39FF14] transition"
                  />
                </div>
                <nav className="px-4 space-y-2 mb-8">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 text-white font-semibold transition text-left">
                    <LayoutDashboard size={18} className="text-[#39FF14]" /> Tableau de bord
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition text-left">
                    <Store size={18} /> Ma Boutique
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition text-left">
                    <Settings size={18} /> Paramètres
                  </button>
                </nav>
                <div className="px-4 space-y-2">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catégories</p>
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setIsMobileMenuOpen(false); }} 
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none focus:border-[#39FF14] transition"
                    />
                    <input 
                      type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none focus:border-[#39FF14] transition"
                    />
                  </div>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-black tracking-tighter uppercase">Onyx <span className="text-[#39FF14]">Jaay</span></h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-4 mb-6">
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-[#39FF14] transition"
            />
          </div>

          <nav className="px-4 space-y-2 mb-8">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 text-white font-semibold transition text-left">
              <LayoutDashboard size={18} className="text-[#39FF14]" /> Tableau de bord
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition text-left">
              <Store size={18} /> Ma Boutique
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition text-left">
              <Settings size={18} /> Paramètres
            </button>
          </nav>

          <div className="px-4 space-y-2">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catégories</p>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeCategory === cat 
                    ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' 
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none focus:border-[#39FF14] transition"
              />
              <input 
                type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none focus:border-[#39FF14] transition"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800">
          <div className="bg-zinc-900 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#39FF14] flex items-center justify-center text-black font-bold">
              OJ
            </div>
            <div>
              <p className="text-sm font-bold text-white">Onyx Jaay</p>
              <p className="text-xs text-zinc-500">Version Pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-20">
           <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-white"><Menu size={24}/></button>
              <h1 className="text-lg font-black tracking-tighter uppercase text-white">Onyx <span className="text-[#39FF14]">Jaay</span></h1> 
           </div>
           <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-white">
              <ShoppingCart size={24} />
              {cartCount > 0 && <span className="absolute top-0 right-0 bg-[#39FF14] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
           </button>
        </div>

        {/* Top Header Toggle */}
        <header className="absolute top-0 right-0 p-6 z-10 flex items-center gap-4">
          <button onClick={() => setIsCartOpen(true)} className="hidden md:flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-full border border-zinc-800 transition">
            <div className="relative">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#39FF14] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </div>
            <span className="text-xs font-bold uppercase">Panier</span>
          </button>

          <span className="text-xs font-bold uppercase mr-2 text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-zinc-800">Mode Éditeur</span>
          <label htmlFor="editModeToggle" className="cursor-pointer">
            <div className={`w-14 h-8 rounded-full p-1 transition-colors border border-zinc-700 ${isEditingMode ? 'bg-[#39FF14]' : 'bg-zinc-800/80 backdrop-blur-md'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isEditingMode ? 'translate-x-6' : ''}`}></div>
            </div>
            <input type="checkbox" id="editModeToggle" className="hidden" checked={isEditingMode} onChange={() => setIsEditingMode(!isEditingMode)} />
          </label>
        </header>

        <div className="p-8 md:p-12 max-w-7xl mx-auto">
          <div className="mb-12 mt-12 md:mt-0">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Catalogue <span className="text-[#39FF14]">Produits</span></h2>
            <p className="text-zinc-400 max-w-xl">Gérez votre inventaire, modifiez vos prix et partagez vos produits directement sur WhatsApp.</p>
          </div>

          {isEditingMode && (
            <button onClick={handleAddProduct} className="mb-8 w-full md:w-auto bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
              <Plus size={20} /> Ajouter un produit
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 ${isEditingMode ? 'cursor-grab active:cursor-grabbing hover:border-[#39FF14]/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]' : 'cursor-pointer hover:border-zinc-600'}`}
                onClick={() => !isEditingMode && handleViewProduct(product)}
                draggable={isEditingMode && activeCategory === 'Toutes'} // Drag & Drop only logical when all products are shown
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-black uppercase tracking-widest border-2 border-white px-4 py-2 rounded-lg">Épuisé</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-zinc-700 text-[#39FF14]">
                    {product.category}
                  </div>
                  
                  {/* Wishlist Button */}
                  {!isEditingMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-full border border-zinc-700 hover:scale-110 transition-transform"
                    >
                      <Heart 
                        size={18} 
                        className={`transition-all ${wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
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
                  <h3 className="text-xl font-bold tracking-tight">{product.name}</h3>
                  <p className="text-sm text-zinc-400 mt-2 flex-1 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center gap-1 mt-3">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-white">{product.rating || 5}</span>
                    <span className="text-xs text-zinc-500">({product.reviews || 0} avis)</span>
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Prix</p>
                      <p className="text-2xl font-black text-white">{product.price.toLocaleString('fr-SN')} <span className="text-sm font-bold text-[#39FF14]">FCFA</span></p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                      disabled={product.stock === 0}
                      className="bg-white text-black px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#39FF14] transition-colors flex items-center gap-2 shadow-lg disabled:bg-zinc-300 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-zinc-500">
              <Filter size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucun produit ne correspond à vos filtres.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative bg-zinc-950 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-zinc-800 animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <ShoppingCart className="text-[#39FF14]" /> Mon Panier
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full transition"><X size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center text-zinc-500 mt-20">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Votre panier est vide.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                       <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-zinc-800" />
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                             <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                             <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 hover:text-red-500 shrink-0"><Trash2 size={16}/></button>
                          </div>
                          {(item.selectedVariant?.size || item.selectedVariant?.color) && (
                            <p className="text-xs text-zinc-500 mb-1">
                              {item.selectedVariant.size && <span className="mr-2">Taille: {item.selectedVariant.size}</span>}
                              {item.selectedVariant.color && <span>Coul: {item.selectedVariant.color}</span>}
                            </p>
                          )}
                          <p className="text-[#39FF14] font-bold text-sm">{item.price.toLocaleString()} F</p>
                          <div className="flex items-center gap-3 mt-2">
                             <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-zinc-800 rounded-lg hover:bg-zinc-700"><Minus size={14}/></button>
                             <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-zinc-800 rounded-lg hover:bg-zinc-700"><Plus size={14}/></button>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>

             <div className="p-6 bg-zinc-900 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-zinc-400 font-bold uppercase text-xs">Total à payer</span>
                   <span className="text-2xl font-black text-white">{cartTotal.toLocaleString()} <span className="text-[#39FF14] text-sm">FCFA</span></span>
                </div>
                <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                   Commander sur WhatsApp <ArrowRight size={18} />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- CHECKOUT CONFIRMATION MODAL --- */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 relative">
            <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition"><X size={20}/></button>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">Confirmation</h3>
            <p className="text-zinc-400 text-sm mb-6">Vérifiez votre commande avant l'envoi sur WhatsApp.</p>
            
            <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-zinc-900">
                  <span className="text-zinc-300">
                    {item.name} 
                    {(item.selectedVariant?.size || item.selectedVariant?.color) && <span className="text-zinc-500 text-xs ml-1">({[item.selectedVariant.size, item.selectedVariant.color].filter(Boolean).join(', ')})</span>}
                    <span className="text-zinc-500 text-xs ml-1">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-white">{(item.price * item.quantity).toLocaleString()} F</span>
                </div>
              ))}
              <div className="pt-4 flex justify-between text-lg font-black text-[#39FF14]">
                <span>Total</span>
                <span>{cartTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-1 py-4 bg-zinc-900 rounded-xl font-bold text-xs uppercase hover:bg-zinc-800 transition text-zinc-400 hover:text-white">Annuler</button>
              <button onClick={confirmOrder} className="flex-1 py-4 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase hover:bg-white transition flex items-center justify-center gap-2 shadow-lg shadow-[#39FF14]/20">
                <MessageSquare size={18}/> Confirmer l'envoi
              </button>
            </div>
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
      {viewingProduct && (
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

      {qrCodeProduct && (
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
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nom du produit</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-medium text-white outline-none focus:border-[#39FF14] transition" placeholder="Ex: Robe de soirée" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Prix (FCFA)</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-10 font-medium text-white outline-none focus:border-[#39FF14] transition" />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Catégorie</label>
                                <input type="text" name="category" value={formData.category} onChange={handleChange} list="categories-list" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-medium text-white outline-none focus:border-[#39FF14] transition" />
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
                                <input type="number" name="rating" value={formData.rating} onChange={handleChange} min="0" max="5" step="0.1" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-medium text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nombre d'avis</label>
                                <input type="number" name="reviews" value={formData.reviews} onChange={handleChange} min="0" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-medium text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Quantité en Stock</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-medium text-white outline-none focus:border-[#39FF14] transition" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Tailles (séparées par virgule)</label>
                                <input type="text" value={formData.variants?.sizes?.join(', ')} onChange={e => setFormData({...formData, variants: {...formData.variants, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}})} placeholder="S, M, L, XL" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-medium text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Couleurs (séparées par virgule)</label>
                                <input type="text" value={formData.variants?.colors?.join(', ')} onChange={e => setFormData({...formData, variants: {...formData.variants, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}})} placeholder="Rouge, Bleu, Noir" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-medium text-white outline-none focus:border-[#39FF14] transition" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-t-xl border-b border-zinc-800">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                                <button type="button" className="text-[10px] font-bold text-[#39FF14] flex items-center gap-1 hover:underline">
                                    <Sparkles size={12} /> {isAIWriting ? 'Rédaction...' : 'Générer avec IA'}
                                </button>
                            </div>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-b-xl p-4 font-medium text-white outline-none focus:border-[#39FF14] transition min-h-[120px]" placeholder="Description détaillée du produit..." />
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Image du produit</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden">
                                    {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-zinc-700" />}
                                </div>
                                <div className="flex-1">
                                    <input type="file" accept="image/*" onChange={(e) => onImageUpload(e, setFormData, formData)} className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-[#39FF14] hover:file:text-black transition" />
                                    <p className="text-[10px] text-zinc-600 mt-2">JPG, PNG ou WEBP. Max 5MB.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-xs uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 transition">Annuler</button>
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

  // Reset selection when product changes
  React.useEffect(() => {
    setSelectedSize(null);
    setSelectedColor(null);
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
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row my-auto" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black transition z-10"><X size={20}/></button>
            
            <div className="w-full md:w-1/2 h-72 md:h-auto relative bg-zinc-900">
               <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="w-full md:w-1/2 p-8 flex flex-col max-h-[90vh] overflow-y-auto">
               <div className="mb-8">
                  <span className="text-[#39FF14] text-xs font-bold uppercase tracking-widest border border-[#39FF14]/20 px-3 py-1 rounded-full mb-4 inline-block">{product.category}</span>
                  <h2 className="text-3xl font-black tracking-tighter text-white mb-2">{product.name}</h2>
                  <p className="text-2xl font-bold text-white mb-4">{product.price.toLocaleString('fr-SN')} <span className="text-sm text-[#39FF14]">FCFA</span></p>
                  
                  {product.stock !== undefined && (
                    <p className={`text-sm font-bold mb-6 ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
                      {isOutOfStock ? 'Épuisé' : `En stock (${product.stock} restants)`}
                    </p>
                  )}

                  <p className="text-zinc-400 leading-relaxed mb-8">{product.description}</p>

                  <div className="flex items-center gap-2 mb-6 bg-zinc-900 w-max px-4 py-2 rounded-xl border border-zinc-800">
                    <div className="flex text-yellow-400"><Star size={16} className="fill-yellow-400" /></div>
                    <span className="text-sm font-bold text-white">{product.rating || 5}/5</span>
                    <span className="text-xs text-zinc-500 font-medium border-l border-zinc-700 pl-2 ml-1">{product.reviews || 0} avis vérifiés</span>
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
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
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
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${selectedColor === color ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
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
                    className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-[#39FF14] transition flex items-center justify-center gap-2 shadow-lg disabled:bg-zinc-400 disabled:cursor-not-allowed"
                  >
                     <Plus size={18} /> Ajouter au panier
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => onShare(product)} className="flex-1 bg-zinc-900 text-white py-4 rounded-xl font-bold uppercase text-sm hover:bg-zinc-800 transition flex items-center justify-center gap-2 border border-zinc-800">
                       <Share2 size={18} /> Partager
                    </button>
                    <button onClick={() => onGenerateQR(product)} className="flex-1 bg-zinc-900 text-white py-4 rounded-xl font-bold uppercase text-sm hover:bg-zinc-800 transition flex items-center justify-center gap-2 border border-zinc-800">
                       <QrCode size={18} /> QR Code
                    </button>
                  </div>
               </div>

               {/* REVIEWS SECTION */}
               <div className="pt-8 border-t border-zinc-800">
                  <h4 className="text-sm font-bold text-zinc-500 uppercase mb-4">Avis des clients</h4>
                  <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
                    {(product.reviewsList || []).length > 0 ? product.reviewsList?.map(review => (
                      <div key={review.id} className="bg-zinc-900 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-white">{review.name}</span>
                          <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'} />)}</div>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{review.comment}</p>
                      </div>
                    )) : <p className="text-xs text-zinc-500 italic">Aucun avis pour ce produit.</p>}
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <p className="text-xs font-bold text-zinc-400 uppercase">Laisser un avis</p>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Votre nom" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#39FF14]" />
                      <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#39FF14]">
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#39FF14] min-h-[60px]"
                    />
                    <button type="submit" className="w-full bg-zinc-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 transition">Envoyer</button>
                  </form>
               </div>

               {/* SIMILAR PRODUCTS */}
               {similarProducts.length > 0 && (
                 <div className="pt-8 border-t border-zinc-800">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase mb-4">Vous aimerez aussi</h4>
                    <div className="grid grid-cols-3 gap-4">
                       {similarProducts.map(p => (
                          <div key={p.id} className="group cursor-pointer" onClick={() => onViewProduct(p)}>
                             <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-2">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             </div>
                             <p className="text-xs font-bold text-white truncate">{p.name}</p>
                             <p className="text-[10px] text-zinc-500">{p.price.toLocaleString()} F</p>
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