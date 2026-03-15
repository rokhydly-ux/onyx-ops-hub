"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ShoppingCart, Search, Plus, Filter, AlertTriangle, X, Minus, Trash2, Truck, 
  Store, MessageSquare, Sparkles, Heart, ChevronRight, Menu, ArrowRight, Star, Sun, Moon,
  Package, QrCode, Share2, ArrowUp, ArrowDown, Gift, Save, ChevronLeft
} from "lucide-react";
import QRCode from "react-qr-code";

const displayPrice = (price: number, currency: string = 'FCFA') => {
    return `${price.toLocaleString('fr-SN')} ${currency}`;
};

const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    // Regex pour extraire l'ID de la vidéo YouTube (format normal ou youtu.be)
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    if (match && match[1]) {
        videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
};

const CategoryGridWidget = ({ categories, setActiveCategory }: { categories: string[], setActiveCategory: (cat: string) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
    {categories.map((cat) => (
        <div 
        key={cat}
        onClick={() => setActiveCategory(cat)}
        className="group relative h-80 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800"
        >
        <img 
            src={`https://placehold.co/800x800/111/FFF?text=${encodeURIComponent(cat)}`} 
            alt={cat}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">{cat}</h3>
            <span className="mt-4 px-6 py-2 bg-[#39FF14] text-black text-xs font-bold uppercase rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            Voir la collection
            </span>
        </div>
        </div>
    ))}
    </div>
);

const PromoBannerWidget = ({ imageUrl, onClick }: { imageUrl?: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className={`w-full max-w-[600px] mx-auto h-[200px] rounded-[2rem] overflow-hidden relative my-8 shadow-xl flex items-center justify-center bg-black transition-all ${onClick ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : ''}`}
        style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
        }}
    >
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
        {!imageUrl && <p className="relative z-10 text-white font-black text-xl opacity-50 uppercase tracking-widest text-center px-4">Bannière Promotionnelle<br/><span className="text-sm">Parallax (600x200)</span></p>}
    </div>
);

const NewArrivalsWidget = ({ title, products, selectedProductIds, onViewProduct, addToCart, currency, cart }: any) => {
    let displayProducts: any[] = [...products];
    if (selectedProductIds && selectedProductIds.length > 0) {
        displayProducts = products.filter((p: any) => selectedProductIds.includes(p.id));
    } else {
        displayProducts = displayProducts.sort((a: any, b: any) => b.id - a.id).slice(0, 8);
    }
    const latestProducts = displayProducts;
    if (latestProducts.length === 0) return null;
    const marqueeProducts = [...latestProducts, ...latestProducts, ...latestProducts];
    
    const getQtyInCart = (id: number) => cart ? cart.filter((i:any) => i.id === id).reduce((sum:any, i:any) => sum + i.quantity, 0) : 0;

    return (
        <div className="my-12 overflow-hidden">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 px-2">{title || 'Nouveautés'}</h3>
            <div className="relative w-full flex overflow-x-hidden group">
                <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } } .animate-marquee { animation: marquee 25s linear infinite; display: flex; width: max-content; } .group:hover .animate-marquee { animation-play-state: paused; }`}</style>
                <div className="animate-marquee gap-6">
                    {marqueeProducts.map((p: any, idx: number) => (
                        <div key={`${p.id}-${idx}`} className="w-[300px] h-[350px] bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all shrink-0" onClick={() => onViewProduct(p)}>
                            <div className="h-[220px] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                               <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                               {p.stock === 0 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                                    <span className="text-white font-black uppercase tracking-widest border-2 border-white px-4 py-2 rounded-lg">En rupture</span>
                                  </div>
                               )}
                               <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                                  {p.stock === 0 && <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">En rupture</div>}
                                  {p.stock !== 0 && <div className="bg-black text-[#39FF14] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Nouveau</div>}
                               </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <h4 className="font-bold text-base truncate text-black dark:text-white">{p.name}</h4>
                                <div className="flex justify-between items-end mt-2">
                                    <div className="flex flex-col">
                                        {p.oldPrice && p.oldPrice > p.price && <span className="text-[10px] text-zinc-400 line-through mb-[-4px]">{displayPrice(p.oldPrice, currency)}</span>}
                                        <span className="font-black text-xl text-black dark:text-white">{displayPrice(p.price, currency)}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} disabled={p.stock === 0 || (p.stock !== undefined && getQtyInCart(p.id) >= p.stock)} className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-xl hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition-colors disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed"><Plus size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const INITIAL_ZONES = [
  { id: 1, name: "Zone 1", price: 1300, quartiers: ["Libertés", "Sacré Cœur", "Point E"] },
  { id: 2, name: "Zone 2", price: 1800, quartiers: ["Yoff", "Ville", "Colobane", "Foire"] },
  { id: 3, name: "Zone 3", price: 2000, quartiers: ["Almadies", "Parcelles", "Pikine"] },
  { id: 4, name: "Zone 4", price: 2500, quartiers: ["Guédiawaye", "Thiaroye"] },
  { id: 5, name: "Zone 5", price: 3000, quartiers: ["Keur Massar", "Rufisque"] }
];

function ProductDetailModal({ product, allProducts, isOpen, onClose, onAddToCart, onBuyDirectly, onShare, onViewProduct, onGenerateQR, onAddReview, currency, cart, shopPhone }: any) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [mediaView, setMediaView] = useState<'image' | 'video'>('image');
  const [activeImage, setActiveImage] = useState(product?.image);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  React.useEffect(() => {
    if (product) {
      setSelectedSize(null);
      setSelectedColor(null);
      setMediaView('image');
      setActiveImage(product.image);
      setIsLightboxOpen(false);
      setLightboxIndex(0);
    }
  }, [product]);

  const galleryImages = product ? [product.image, ...(product.gallery || [])].filter(Boolean) : [];

  React.useEffect(() => {
    if (!product || galleryImages.length <= 1) return;
    const intervalId = setInterval(() => {
      if (isLightboxOpen) {
        setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (mediaView === 'image') {
        setActiveImage((prev: string) => {
          const currentIndex = galleryImages.indexOf(prev);
          const nextIndex = currentIndex > -1 ? (currentIndex + 1) % galleryImages.length : 0;
          return galleryImages[nextIndex];
        });
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [product, galleryImages.length, isLightboxOpen, mediaView]);

  if (!isOpen || !product) return null;

  const similarProducts = allProducts.filter((p: any) => p.category === product.category && p.id !== product.id).slice(0, 3);
  const qtyInCart = cart.filter((i: any) => i.id === product.id).reduce((sum: any, i: any) => sum + i.quantity, 0);
  const isMaxedOut = product.stock !== undefined && qtyInCart >= product.stock;
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
            
            <div className="w-full md:w-1/2 flex flex-col bg-zinc-100 dark:bg-zinc-900">
                <div className="flex-1 relative min-h-[300px] bg-zinc-100 dark:bg-zinc-900">
                   {mediaView === 'image' || !product.videoUrl ? (
                        <div className="w-full h-full absolute inset-0 overflow-hidden cursor-zoom-in group/img" onClick={(e) => { e.stopPropagation(); setLightboxIndex(galleryImages.indexOf(activeImage) > -1 ? galleryImages.indexOf(activeImage) : 0); setIsLightboxOpen(true); }}>
                            <img src={activeImage} alt={product.name} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                <Search className="text-white drop-shadow-lg" size={32} />
                            </div>
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
                {product.gallery && product.gallery.length > 0 && mediaView === 'image' && (
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
                    <div className="flex text-yellow-400"><Star size={16} className="fill-yellow-400" /></div>
                    <span className="text-sm font-bold text-black dark:text-white">{product.rating || 5}/5</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium border-l border-zinc-300 dark:border-zinc-700 pl-2 ml-1">{product.reviews || 0} avis vérifiés</span>
                  </div>

                  {/* VARIANTS SELECTION */}
                  {(product.variants?.sizes?.length || 0) > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Taille</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants?.sizes?.map((size: string) => (
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
                        {product.variants?.colors?.map((color: string) => (
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
                  <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => { 
                          onAddToCart(product, { size: selectedSize || undefined, color: selectedColor || undefined }, true); 
                          onClose();
                        }} 
                        disabled={isOutOfStock || isMaxedOut}
                        className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white py-4 rounded-xl font-black uppercase text-[11px] sm:text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <Plus size={18} /> {isMaxedOut && !isOutOfStock ? "Limite atteinte" : "Ajouter au Panier"}
                      </button>
                      <button 
                        onClick={() => { 
                          onBuyDirectly(product, { size: selectedSize || undefined, color: selectedColor || undefined }); 
                        }} 
                        disabled={isOutOfStock || isMaxedOut}
                        className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase text-[11px] sm:text-sm hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition flex items-center justify-center gap-2 shadow-lg disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed"
                      >
                         <ShoppingCart size={18} /> Acheter Directement
                      </button>
                  </div>
                  <button 
                        onClick={() => {
                            const productUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
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
                       <QrCode size={18} /> QR Code
                    </button>
                  </div>
               </div>

               {/* REVIEWS SECTION */}
               <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase mb-4">Avis des clients</h4>
                  <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {(product.reviewsList || []).length > 0 ? product.reviewsList?.map((review: any) => (
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-sm animate-in fade-in" onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}>
                  <button onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }} className="absolute top-6 right-6 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10 backdrop-blur-md">
                      <X size={24}/>
                  </button>
                  
                  {galleryImages.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length); }} className="absolute left-4 sm:left-8 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10 backdrop-blur-md">
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
                      <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % galleryImages.length); }} className="absolute right-4 sm:right-8 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10 backdrop-blur-md">
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'popular' | null>(null);
  const [categories, setCategories] = useState<string[]>(['Toutes', 'Favoris', 'Homme', 'Femme', 'Enfant', 'Sport', 'Accessoires']);
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
  const [paymentProvider, setPaymentProvider] = useState<'cod' | 'wave' | 'orange_money'>('cod');
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', instructions: '' });
  const [draftId, setDraftId] = useState<string | null>(null);

  // Tracking & Reviews
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  
  // Loyalty System
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [loyaltyPhoneCheck, setLoyaltyPhoneCheck] = useState('');
  const [loyaltyResult, setLoyaltyResult] = useState<number | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  
  // UI Additions
  const [homepageLayout, setHomepageLayout] = useState<any[] | null>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Confettis de célébration lors d'une commande
  useEffect(() => {
    if (isOrderSuccessOpen) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).confetti) {
          (window as any).confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#39FF14', '#ffffff', '#aaaaaa'],
            zIndex: 9999
          });
        }
      };
      document.body.appendChild(script);
      return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }
  }, [isOrderSuccessOpen]);

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

    const savedLayout = localStorage.getItem('onyx_jaay_homepage_layout');
    if (savedLayout) {
      setHomepageLayout(JSON.parse(savedLayout));
    }

    const handleScroll = (e: any) => {
      if (e.target.scrollTop > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    const mainElement = document.getElementById('main-content-scroll');
    if (mainElement) {
        mainElement.addEventListener('scroll', handleScroll);
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
      if (shop.homepage_layout && shop.homepage_layout.length > 0) {
        setHomepageLayout(shop.homepage_layout);
      }

      const { data: shopProducts } = await supabase.from("products").select("*").eq("shop_id", shop.id);
      if (shopProducts) {
        const productIds = shopProducts.map((p: any) => String(p.id));
        const { data: reviewsData } = await supabase.from('reviews').select('*').in('reference_id', productIds);

        setProducts(shopProducts.map((p: any) => {
            const productReviews = reviewsData ? reviewsData.filter((r: any) => String(r.reference_id) === String(p.id)) : [];
            return {
                ...p,
                oldPrice: p.old_price,
                costPrice: p.cost_price,
                videoUrl: p.video_url,
                reviewsList: productReviews
            };
        }));
        
        // Extraction DYNAMIQUE de toutes les catégories depuis les produits existants dans Supabase
        const uniqueCategories = Array.from(new Set(shopProducts.map((p:any) => p.category).filter(Boolean))) as string[];
        const adminCats = shop.categories || [];
        setCategories(Array.from(new Set(["Toutes", "Favoris", ...adminCats, ...uniqueCategories])));
      }
      setIsLoading(false);
    };
    fetchShopData();

    return () => {
      if (mainElement) mainElement.removeEventListener('scroll', handleScroll);
    }
  }, [shopSlug]);

  // 🚀 SAUVEGARDE SILENCIEUSE DU PANIER ABANDONNÉ
  useEffect(() => {
    if (isCheckoutModalOpen && customerInfo.phone.length >= 9 && cart.length > 0 && shopInfo?.id) {
      const timeoutId = setTimeout(async () => {
        try {
          if (!draftId) {
            const tempTracking = `DRF-${Math.floor(100000 + Math.random() * 900000)}`;
            const { data } = await supabase.from('orders').insert([{
              shop_id: shopInfo.id,
              customer_name: customerInfo.name || 'Visiteur',
              customer_phone: customerInfo.phone,
              items: cart,
              total_amount: cartTotal,
              status: 'Panier abandonné',
              tracking_number: tempTracking
            }]).select().single();
            if (data) setDraftId(data.id);
          } else {
            await supabase.from('orders').update({
              customer_name: customerInfo.name || 'Visiteur',
              customer_phone: customerInfo.phone,
              items: cart,
              total_amount: cartTotal
            }).eq('id', draftId);
          }
        } catch (e) {}
      }, 1500); // 1.5s après la dernière frappe pour ne pas spammer la base
      return () => clearTimeout(timeoutId);
    }
  }, [customerInfo.phone, customerInfo.name, cart, isCheckoutModalOpen, shopInfo]);

  useEffect(() => {
    localStorage.setItem(`onyx_cart_${shopSlug}`, JSON.stringify(cart));
  }, [cart, shopSlug]);

  useEffect(() => {
    localStorage.setItem(`onyx_wishlist_${shopSlug}`, JSON.stringify(wishlist));
  }, [wishlist, shopSlug]);

  // 🚀 URL PARAMS INTERCEPTION (Marketplace & Tracking et Review)
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

  const renderWidget = (widget: any) => {
    const widgetType = widget.type || (widget.id.startsWith('category-grid') ? 'category-grid' : widget.id.startsWith('promo-banner') ? 'promo-banner' : widget.id.startsWith('new-arrivals') ? 'new-arrivals' : '');
    switch (widgetType) {
      case 'category-grid':
        const catsToDisplay = widget.settings?.categories?.length > 0 ? widget.settings.categories : categories.filter(c => c !== 'Toutes' && c !== 'Favoris');
        return <CategoryGridWidget categories={catsToDisplay} setActiveCategory={setActiveCategory} />;
      case 'promo-banner':
        return <PromoBannerWidget 
            imageUrl={widget.settings?.imageUrl} 
            onClick={widget.settings?.linkType ? () => {
                if (widget.settings.linkType === 'category' && widget.settings.linkTarget) setActiveCategory(widget.settings.linkTarget);
                else if (widget.settings.linkType === 'product' && widget.settings.linkTarget) {
                    const p = products.find(prod => String(prod.id) === String(widget.settings.linkTarget));
                    if (p) setViewingProduct(p);
                }
            } : undefined} />;
      case 'new-arrivals':
        return <NewArrivalsWidget title={widget.settings?.title} products={products} selectedProductIds={widget.settings?.selectedProducts} onViewProduct={setViewingProduct} addToCart={addToCart} currency={shopInfo?.currency || 'FCFA'} cart={cart} />;
      default:
        return null;
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calcul de la Livraison Gratuite
  const FREE_SHIPPING_THRESHOLD = 50000;
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subTotal);
  const freeShippingProgress = Math.min((subTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const deliveryCost = deliveryMethod === 'delivery' 
    ? (amountForFreeShipping === 0 ? 0 : (selectedZoneId ? (deliveryZones.find(z => z.id === selectedZoneId)?.price || 0) : 0))
    : 0;
  const cartTotal = subTotal + deliveryCost;

  const confirmOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) return alert("Veuillez remplir votre nom et téléphone.");
    if (deliveryMethod === 'delivery' && !selectedZoneId) return alert("Veuillez sélectionner une zone de livraison.");

    const trackingNumber = `CMD-${Math.floor(100000 + Math.random() * 900000)}`;
    const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);

    const orderPayload = {
      shop_id: shopInfo.id,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      delivery_instructions: customerInfo.instructions,
      items: cart,
      total_amount: cartTotal,
      status: 'En attente', // Passe de "Panier abandonné" à "En attente"
      delivery_method: deliveryMethod,
      delivery_zone: selectedZone ? selectedZone.name : null,
      tracking_number: trackingNumber,
      history: [{ status: 'En attente', date: new Date().toISOString(), user: 'Client (Web)' }]
    };

    if (draftId) {
      await supabase.from('orders').update(orderPayload).eq('id', draftId);
      setDraftId(null);
    } else {
      await supabase.from('orders').insert([orderPayload]);
    }

    try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: `🚨 Nouvelle Commande : ${trackingNumber} - ${displayPrice(cartTotal, shopInfo.currency)}`,
                text: `Nouvelle commande de ${customerInfo.name} (${customerInfo.phone}). Total: ${displayPrice(cartTotal, shopInfo.currency)}`,
                html: `<h2>Nouvelle commande sur ${shopInfo.name} !</h2><p><b>Référence :</b> ${trackingNumber}</p><p><b>Client :</b> ${customerInfo.name} (${customerInfo.phone})</p><p><b>Montant Total :</b> ${displayPrice(cartTotal, shopInfo.currency)}</p><h3>Détails :</h3><ul>${cart.map(i => `<li>${i.name} (x${i.quantity})</li>`).join('')}</ul>`
            })
        });
    } catch (e) {
        console.error("Erreur d'envoi d'email admin:", e);
    }

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
    
    const paymentText = paymentProvider === 'wave' ? 'Wave Mobile Money' : paymentProvider === 'orange_money' ? 'Orange Money' : 'Paiement à la livraison';
    message += `\n💳 Paiement : ${paymentText}`;
    message += `\n*Total à payer : ${displayPrice(cartTotal, shopInfo.currency)}*`;
    message += `\n\nNous revenons vers vous sous 1h maximum pour confirmer la livraison.`;

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

  const handleCheckLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoyaltyLoading(true);
    const cleanPhone = loyaltyPhoneCheck.trim().replace(/\s+/g, '');
    const corePhone = cleanPhone.length >= 9 ? cleanPhone.slice(-9) : cleanPhone;
    
    try {
        const { data, error } = await supabase.from('orders').select('total_amount, points_used').eq('shop_id', shopInfo.id).ilike('customer_phone', `%${corePhone}%`).neq('status', 'Annulé');
        if (data && !error && data.length > 0) {
            let pts = 0;
            data.forEach(o => {
                pts += Math.floor(o.total_amount / 1000);
                if (o.points_used) pts -= o.points_used;
            });
            setLoyaltyResult(pts);
        } else {
            setLoyaltyResult(0);
        }
    } catch (err) {
        setLoyaltyResult(0);
    }
    setLoyaltyLoading(false);
  };

  const handleAddReview = async (productId: number, review: Omit<any, 'id' | 'date'>) => {
    try {
        const { data, error } = await supabase.from('reviews').insert([{
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
                const newRating = updatedReviews.reduce((acc: any, r: any) => acc + r.rating, 0) / updatedReviews.length;
                return { ...p, reviewsList: updatedReviews, reviews: updatedReviews.length, rating: parseFloat(newRating.toFixed(1)) };
            }
            return p;
        }));
        alert("Avis envoyé avec succès !");
    } catch (err) { console.error("Erreur sauvegarde avis:", err); alert("Erreur lors de l'envoi de l'avis."); }
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
    if (sortOrder === 'popular') return (b.reviews || 0) - (a.reviews || 0);
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
                  <button onClick={() => { setIsLoyaltyModalOpen(true); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left text-zinc-500 hover:text-black dark:hover:text-white`}>
                    <Gift size={18} className="text-[#39FF14]"/> Programme Fidélité
                  </button>
                </nav>

                <div className="px-4 space-y-2">
                  <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catégories</p>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeCategory === cat ? cat === 'Favoris' ? 'bg-red-500/10 text-red-400' : 'bg-[#39FF14]/10 text-[#39FF14]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}>
                    <span className="flex items-center gap-2">
                      {cat === 'Favoris' && <Heart size={14} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />}
                      {cat}
                      {cat === 'Favoris' && wishlist.length > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none">{wishlist.length}</span>}
                    </span>
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
                      <button onClick={() => { setSortOrder(sortOrder === 'asc' ? null : 'asc'); setIsMobileMenuOpen(false); }} className={`flex-1 p-2 rounded-xl text-xs font-bold border ${sortOrder === 'asc' ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}><ArrowUp size={12} className="inline mr-1"/> Prix</button>
                      <button onClick={() => { setSortOrder(sortOrder === 'desc' ? null : 'desc'); setIsMobileMenuOpen(false); }} className={`flex-1 p-2 rounded-xl text-xs font-bold border ${sortOrder === 'desc' ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}><ArrowDown size={12} className="inline mr-1"/> Prix</button>
                  </div>
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
              <span className="flex items-center gap-2">
                {cat === 'Favoris' && <Heart size={14} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />}
                {cat}
                {cat === 'Favoris' && wishlist.length > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none">{wishlist.length}</span>}
              </span>
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
      <main id="main-content-scroll" className="flex-1 overflow-y-auto relative custom-scrollbar">
        {isBannerVisible && (
          <div className="bg-black dark:bg-[#39FF14] text-[#39FF14] dark:text-black px-4 py-2.5 text-center text-[10px] sm:text-xs font-bold flex justify-center items-center relative z-30 shadow-md animate-in slide-in-from-top-2">
             <span className="flex flex-wrap items-center justify-center gap-2">
                <span>🚀 Bienvenue sur {shopInfo?.name} ! Profitez de nos offres avec le code <span className="bg-[#39FF14] dark:bg-black text-black dark:text-[#39FF14] px-1.5 py-0.5 rounded ml-1">BIENVENUE10</span></span>
                <button 
                   onClick={() => {
                       const msg = `Bonjour l'équipe, je suis sur votre boutique en ligne et j'aimerais avoir plus d'informations !`;
                       window.open(`https://wa.me/${String(shopInfo?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                   }}
                   className="bg-[#39FF14] dark:bg-black text-black dark:text-[#39FF14] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-1 shadow-sm ml-2"
                >
                   <MessageSquare size={12} /> Discuter
                </button>
             </span>
             <button onClick={() => setIsBannerVisible(false)} className="absolute right-4 hover:scale-110 transition p-1"><X size={14}/></button>
          </div>
        )}

        {/* Header Mobile */}
        <div className="md:hidden flex flex-col bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
           <div className="flex items-center justify-between p-4 pb-2">
               <div className="flex items-center gap-3">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="text-black dark:text-white"><Menu size={24}/></button>
                  <h1 className="text-lg font-black tracking-tighter uppercase text-black dark:text-white line-clamp-1">{shopInfo.name}</h1> 
               </div>
               <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-black dark:text-white">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="absolute top-0 right-0 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center bg-[#39FF14] text-black">{cartCount}</span>}
               </button>
           </div>
           <div className="flex items-center gap-3 px-4 pb-3">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Paiements acceptés :</span>
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Wave_Mobile_Money_logo.png" alt="Wave" className="h-3 object-contain" />
              <img src="https://www.rapyd.net/wp-content/uploads/2025/04/Orange-Money-logo-500x336-1.png" alt="Orange Money" className="h-3 object-contain" />
           </div>
        </div>

        {/* Header Desktop (Boutons Flottants) */}
        <header className={`absolute ${isBannerVisible ? 'top-10' : 'top-0'} left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none hidden md:flex transition-all duration-300`}>
          <div className="flex items-center gap-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 pointer-events-auto shadow-sm">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Paiements acceptés :</span>
             <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Wave_Mobile_Money_logo.png" alt="Wave" className="h-4 object-contain" />
             <img src="https://www.rapyd.net/wp-content/uploads/2025/04/Orange-Money-logo-500x336-1.png" alt="Orange Money" className="h-4 object-contain" />
          </div>

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

            {activeCategory === 'Toutes' && !searchTerm && !minPrice && !maxPrice && homepageLayout && homepageLayout.length > 0 ? (
                <div className="space-y-8">
                    {homepageLayout.map((widget, index) => <div key={index}>{renderWidget(widget)}</div>)}
                </div>
            ) : (
              <>
                {activeCategory === 'Toutes' && !searchTerm && !minPrice && !maxPrice ? (
                  <CategoryGridWidget categories={categories.filter(c => c !== 'Toutes' && c !== 'Favoris')} setActiveCategory={setActiveCategory} />
                ) : (
                  filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col group transition-all shadow-sm cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600" onClick={() => setViewingProduct(product)}>
                    <div className="relative aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <img src={product.image || "https://placehold.co/600"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {product.stock === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none"><span className="text-white font-black uppercase tracking-widest border-2 border-white px-4 py-2 rounded-lg">En rupture</span></div>}
                      
                      <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                         <span className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#39FF14] border border-zinc-200 dark:border-zinc-700 shadow-sm">{product.category}</span>
                         {product.old_price && product.old_price > product.price && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Promo -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%</span>
                         )}
                      </div>

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
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} disabled={product.stock === 0 || (product.stock !== undefined && cart.filter(i => i.id === product.id).reduce((sum, i) => sum + i.quantity, 0) >= product.stock)} className="bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition-all flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none">
                          <Plus size={16} /> Ajouter au Panier
                        </button>
                      </div>
                    </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-zinc-500"><Filter size={48} className="mx-auto mb-4 opacity-20" /><p className="text-xl font-black text-black dark:text-white mb-2">0 résultat</p></div>
                  )
                )}
              </>
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
          <div className="fixed bottom-6 left-6 right-[5.5rem] z-40 md:hidden animate-in slide-in-from-bottom-4">
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
          <div className="fixed inset-0 z-[60] flex flex-col justify-end md:flex-row md:justify-end">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)}></div>
            <div className="relative bg-zinc-50 dark:bg-black w-full max-w-full md:max-w-lg h-[90vh] md:h-full shadow-2xl flex flex-col border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom md:slide-in-from-right duration-500 rounded-t-[2rem] md:rounded-none mt-auto md:mt-0">
               <div className="p-8 border-b-2 border-zinc-100 dark:border-zinc-900 flex justify-between items-center rounded-t-[2rem] md:rounded-none">
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
          <div className="fixed inset-0 z-[60] flex flex-col justify-end md:flex-row md:justify-end">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative bg-white dark:bg-zinc-950 w-full max-w-full md:max-w-md h-[90vh] md:h-full shadow-2xl flex flex-col border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom md:slide-in-from-right duration-300 rounded-t-[2rem] md:rounded-none mt-auto md:mt-0">
               <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 rounded-t-[2rem] md:rounded-none">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <ShoppingCart className="text-[#39FF14]" /> Mon Panier
                    {cartCount > 0 && (
                        <div className="flex gap-2 ml-2 flex-wrap">
                            <button onClick={() => {
                                let shareMsg = `Salut ! Regarde mon panier sur ${shopInfo.name} :\n\n`;
                                cart.forEach(item => { shareMsg += `- ${item.name} (x${item.quantity}) : ${displayPrice(item.price * item.quantity, shopInfo.currency)}\n`; });
                                shareMsg += `\n*Total : ${displayPrice(cartTotal, shopInfo.currency)}*\n\nLien : ${window.location.origin}/${shopSlug}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');
                            }} className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded hover:bg-green-500 hover:text-white transition tracking-widest flex items-center gap-1">
                                <Share2 size={12} /> PARTAGER
                            </button>
                            <button onClick={() => {
                                localStorage.setItem(`onyx_cart_${shopSlug}`, JSON.stringify(cart));
                                alert("Votre panier est sauvegardé sur cet appareil ! Vous le retrouverez lors de votre prochaine visite.");
                            }} className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition tracking-widest flex items-center gap-1">
                                <Save size={12} /> SAUVER
                            </button>
                            <button onClick={() => { if(confirm("Voulez-vous vraiment vider votre panier ?")) { setCart([]); } }} className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition tracking-widest flex items-center gap-1">
                                <Trash2 size={12} /> VIDER
                            </button>
                        </div>
                    )}
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full"><X size={20}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-50/50 dark:bg-zinc-950/50">
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
                 <div className="mt-auto bg-white dark:bg-zinc-950 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-zinc-200 dark:border-zinc-800 shrink-0 max-h-[55vh] overflow-y-auto custom-scrollbar">

                    <div className="mb-6 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase text-zinc-500">Livraison (50 000 F max)</span>
                            <span className="text-[10px] font-black text-[#39FF14]">{amountForFreeShipping === 0 ? 'Offerte ! 🎉' : `Plus que ${displayPrice(amountForFreeShipping, shopInfo.currency)}`}</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${freeShippingProgress}%` }}></div>
                        </div>
                    </div>

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
                          {selectedZoneId && (
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 italic">
                                  {deliveryZones.find((z: any) => z.id === selectedZoneId)?.quartiers.join(', ')}
                              </p>
                          )}
                      </div>
                  )}

                    <div className="flex justify-between items-center mb-6"><span className="text-zinc-500 font-bold uppercase text-xs">Total à payer</span><span className="text-2xl font-black text-black dark:text-white">{displayPrice(cartTotal, shopInfo.currency)}</span></div>
                    <button onClick={() => setIsCheckoutModalOpen(true)} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2">Commander sur WhatsApp <ArrowRight size={18} /></button>
                    <button onClick={() => setIsCartOpen(false)} className="w-full mt-3 bg-transparent border-2 border-black dark:border-white text-black dark:text-white py-3 rounded-xl font-bold uppercase text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center">
                        Continuer mes achats
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- CHECKOUT CONFIRMATION MODAL --- */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white">Confirmation</h3>
              <p className="text-zinc-500 text-sm mb-6">Vérifiez vos informations avant l'envoi.</p>
              
              <div className="mb-6 space-y-3 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                 <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Vos Coordonnées</p>
                 <input type="text" placeholder="Votre Nom *" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black text-black dark:text-white transition" />
                 <input type="tel" placeholder="Votre Téléphone *" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black text-black dark:text-white transition" />
                 {deliveryMethod === 'delivery' && <textarea placeholder="Adresse de livraison détaillée (Numéro de rue, repère...)" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:border-black min-h-[60px] text-black dark:text-white resize-none transition" />}
              </div>

              <div className="space-y-3 mb-8 pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-zinc-100 dark:border-zinc-900">
                    <span className="text-zinc-600 dark:text-zinc-300">
                      {item.name} 
                      {(item.selectedVariant?.size || item.selectedVariant?.color) && <span className="text-zinc-500 text-xs ml-1">({[item.selectedVariant.size, item.selectedVariant.color].filter(Boolean).join(', ')})</span>}
                      <span className="text-zinc-500 text-xs ml-1">x{item.quantity}</span>
                    </span>
                    <span className="font-bold text-black dark:text-white">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                  </div>
                ))}
                {deliveryMethod === 'delivery' && (
                   <div className="flex justify-between items-center mb-2 text-xs text-zinc-500 dark:text-zinc-400 py-2 border-b border-zinc-100 dark:border-zinc-900">
                       <span className="font-bold">Frais de livraison ({deliveryZones.find(z => z.id === selectedZoneId)?.name || 'Non défini'})</span>
                       <span className="font-bold">{deliveryCost.toLocaleString()} FCFA</span>
                   </div>
                )}
                <div className="pt-2 flex justify-between text-lg font-black text-[#39FF14]">
                  <span>Total à payer</span>
                  <span>{displayPrice(cartTotal, shopInfo.currency)}</span>
                </div>
              </div>

              <div className="mb-8">
                 <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Moyen de paiement</p>
                 <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setPaymentProvider('cod')} className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentProvider === 'cod' ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'border-transparent bg-zinc-50 dark:bg-zinc-900 text-zinc-500'}`}>
                       <span className="text-[10px] font-black uppercase text-center leading-tight">À la livraison</span>
                    </button>
                    <button onClick={() => setPaymentProvider('wave')} className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentProvider === 'wave' ? 'border-[#1eb2e8] bg-[#1eb2e8]/10 text-[#1eb2e8] shadow-md' : 'border-transparent bg-zinc-50 dark:bg-zinc-900 text-zinc-500'}`}>
                       <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Wave_Mobile_Money_logo.png" alt="Wave" className="h-4 object-contain" />
                       <span className="text-[10px] font-black uppercase">Wave</span>
                    </button>
                    <button onClick={() => setPaymentProvider('orange_money')} className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentProvider === 'orange_money' ? 'border-[#ff6600] bg-[#ff6600]/10 text-[#ff6600] shadow-md' : 'border-transparent bg-zinc-50 dark:bg-zinc-900 text-zinc-500'}`}>
                       <img src="https://www.rapyd.net/wp-content/uploads/2025/04/Orange-Money-logo-500x336-1.png" alt="OM" className="h-4 object-contain" />
                       <span className="text-[10px] font-black uppercase text-center leading-tight">Orange M.</span>
                    </button>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl font-bold text-xs uppercase hover:bg-zinc-200 dark:hover:bg-zinc-800 transition text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">Annuler</button>
                 <button onClick={confirmOrder} className="flex-[2] py-4 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase hover:bg-white transition flex items-center justify-center gap-2 shadow-lg"><MessageSquare size={18}/> Confirmer l'envoi</button>
              </div>
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

        {/* --- LOYALTY MODAL --- */}
        {isLoyaltyModalOpen && (
          <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsLoyaltyModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setIsLoyaltyModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-[#39FF14]/10 rounded-xl text-[#39FF14]"><Gift size={24}/></div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">Fidélité</h3>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Gagnez 1 point pour chaque 1000 FCFA dépensés. 1 point = 10 FCFA de réduction sur votre prochaine commande !</p>
              
              <form onSubmit={handleCheckLoyalty} className="mb-6 flex gap-2">
                 <input 
                    type="tel" placeholder="Votre n° WhatsApp" value={loyaltyPhoneCheck} onChange={(e) => setLoyaltyPhoneCheck(e.target.value)} required
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 font-bold outline-none focus:border-[#39FF14] text-sm text-black dark:text-white" 
                 />
                 <button type="submit" disabled={loyaltyLoading} className="bg-black text-[#39FF14] px-4 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition disabled:opacity-50 flex items-center gap-2">
                    {loyaltyLoading ? '...' : 'Vérifier'}
                 </button>
              </form>

              {loyaltyResult !== null && (
                 <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 animate-in slide-in-from-bottom-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">Solde de points</p>
                    <p className="text-5xl font-black text-green-600 dark:text-green-400 mb-2">{loyaltyResult}</p>
                    <p className="text-sm font-bold text-green-700 dark:text-green-500">soit {(loyaltyResult * 10).toLocaleString()} FCFA de réduction</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* --- PRODUCT DETAIL MODAL --- */}
        <ProductDetailModal 
          product={viewingProduct}
          allProducts={products}
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          onAddToCart={addToCart}
          onBuyDirectly={(p: any, v: any) => { addToCart(p, v, false); setIsCheckoutModalOpen(true); }}
          onShare={handleShareProduct}
          onViewProduct={setViewingProduct}
          onAddReview={handleAddReview}
          onGenerateQR={setQrCodeProduct}
          currency={shopInfo?.currency || 'FCFA'}
          cart={cart}
          shopPhone={shopInfo?.phone || ''}
        />

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

        {/* --- SUPPORT BUBBLE --- */}
        <button 
            onClick={() => {
                const msg = `Bonjour, j'aimerais avoir plus d'informations sur votre boutique !`;
                window.open(`https://wa.me/${String(shopInfo?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            className="fixed bottom-6 right-6 z-[45] bg-[#39FF14] text-black p-4 rounded-full shadow-[0_10px_30px_rgba(57,255,20,0.4)] hover:scale-110 hover:-translate-y-1 transition-all flex items-center justify-center group"
            title="Support Client"
        >
            <MessageSquare size={24} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse"></span>
            <span className="absolute right-full mr-4 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg hidden sm:block">
                Besoin d'aide ?
            </span>
        </button>

        {/* --- SCROLL TO TOP --- */}
        {showScrollTop && (
          <button 
            onClick={() => {
              const mainElement = document.getElementById('main-content-scroll');
              if (mainElement) {
                mainElement.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="fixed bottom-[5.5rem] right-6 z-[45] bg-zinc-800/80 backdrop-blur-md text-white p-3 rounded-full shadow-lg hover:bg-black transition-all hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
            title="Remonter en haut"
          >
            <ArrowUp size={20} />
          </button>
        )}

      </main>
    </div>
  );
}