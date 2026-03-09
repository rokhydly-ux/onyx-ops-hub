"use client";

import React, { useState, useRef, DragEvent } from 'react';
import { 
  MessageSquare, Edit, Trash2, Plus, FileUp, Sparkles, X, 
  Image as ImageIcon, DollarSign, Tag, Type, Home, LayoutDashboard, 
  Settings, Store, ChevronRight, Share2, Menu
} from 'lucide-react';

// --- TYPES ---
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

// --- INITIAL DATA ---
const initialProducts: Product[] = [
  { id: 1, name: 'Boubou Onyx Premium', price: 75000, description: 'Tissu de luxe, coupe moderne, parfait pour les grandes occasions.', image: 'https://i.ibb.co/pPZJz7j/boubou-1.jpg', category: 'Luxe' },
  { id: 2, name: 'Ensemble Tailleur "Business"', price: 85000, description: 'Pour un look pro et élégant au bureau.', image: 'https://i.ibb.co/yQJ4c1g/tailleur-femme.jpg', category: 'Professionnel' },
  { id: 3, name: 'Robe de Soirée "Lagoon"', price: 120000, description: 'Faites sensation lors de vos événements avec cette pièce unique.', image: 'https://i.ibb.co/VvzHZj3/robe-soiree.jpg', category: 'Soirée' },
  { id: 4, name: 'Chemise en Lin "Dakar"', price: 25000, description: 'Légère et respirante, idéale pour la saison chaude.', image: 'https://i.ibb.co/3sSqcCg/chemise-lin.jpg', category: 'Casual' },
];

const WHATSAPP_NUMBER = "221771234567"; // À remplacer par le vrai numéro

export default function OnyxJaayDashboard() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIWriting, setIsAIWriting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // --- HANDLERS ---
  const handleWhatsAppOrder = (productName: string) => {
    const message = `Bonjour, je suis intéressé(e) par le produit : ${productName}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (productData: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === productData.id ? productData : p));
    } else {
      const newProduct = { ...productData, id: Date.now() };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  const handleAIWrite = () => {
    setIsAIWriting(true);
    setTimeout(() => {
      const aiDescription = `✨ **Sublimez votre style avec cette pièce exclusive !** ✨\n\nConfectionné avec soin, cet article incarne l'élégance et le raffinement. Sa coupe moderne s'adapte à toutes les morphologies.\n\n- **Qualité Premium** : Matériaux sélectionnés avec soin.\n- **Design Unique** : Démarquez-vous avec style.\n\nNe manquez pas cette pépite, commandez dès maintenant !`;
      const descriptionTextarea = document.getElementById('product-description') as HTMLTextAreaElement;
      if (descriptionTextarea) {
        descriptionTextarea.value = aiDescription;
        // Trigger React state update manually if needed, or rely on onChange
        const event = new Event('input', { bubbles: true });
        descriptionTextarea.dispatchEvent(event);
      }
      setIsAIWriting(false);
    }, 1500);
  };

  // --- DRAG & DROP LOGIC ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    const newProducts = [...products];
    if (dragItem.current === null || dragOverItem.current === null) return;
    const dragItemContent = newProducts[dragItem.current];
    newProducts.splice(dragItem.current, 1);
    newProducts.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setProducts(newProducts);
  };

  const categories = ['Toutes', 'Luxe', 'Professionnel', 'Soirée', 'Casual'];
  const filteredProducts = activeCategory === 'Toutes' ? products : products.filter(p => p.category === activeCategory);

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
                    <button key={cat} onClick={() => { setActiveCategory(cat); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeCategory === cat ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}>
                      {cat} {activeCategory === cat && <ChevronRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-black tracking-tighter uppercase">Onyx <span className="text-[#39FF14]">Jaay</span></h1>
          <p className="text-zinc-500 text-xs mt-1">Catalogue Creator</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
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
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeCategory === cat ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
              >
                {cat}
                {activeCategory === cat && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800">
          <button className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-sm font-bold transition">
            <Share2 size={16} /> Partager la boutique
          </button>
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
        </div>

        {/* Top Header Toggle */}
        <header className="absolute top-0 right-0 p-6 z-10 flex items-center gap-4">
          <span className="text-xs font-bold uppercase mr-2 text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-zinc-800">Mode Éditeur</span>
          <label htmlFor="editModeToggle" className="cursor-pointer">
            <div className={`w-14 h-8 rounded-full p-1 transition-colors border border-zinc-700 ${isEditingMode ? 'bg-[#39FF14]' : 'bg-zinc-800/80 backdrop-blur-md'}`}>
               <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isEditingMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <input id="editModeToggle" type="checkbox" checked={isEditingMode} onChange={() => setIsEditingMode(!isEditingMode)} className="hidden" />
          </label>
        </header>

        {/* Banner */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 relative border-b border-zinc-800 overflow-hidden flex items-end">
          <div className="absolute inset-0 bg-[url('https://i.ibb.co/3sSqcCg/chemise-lin.jpg')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="relative z-10 p-8 md:p-12 w-full">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Collection {activeCategory !== 'Toutes' ? activeCategory : 'Onyx'}</h2>
            <p className="text-zinc-400 max-w-xl text-lg">Découvrez nos pièces exclusives, commandez directement via WhatsApp en un seul clic.</p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-8 md:p-12">
          {isEditingMode && (
              <div className="fixed bottom-8 right-8 z-50 flex flex-col md:flex-row items-center gap-4">
                  <button className="bg-zinc-800 text-white px-6 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-zinc-700 transition duration-300 shadow-xl flex items-center gap-2 border border-zinc-700">
                      <FileUp size={18}/> Importer XLS
                  </button>
                  <button onClick={handleAddProduct} className="bg-[#39FF14] text-black px-6 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-white transition duration-300 shadow-xl flex items-center gap-2 shadow-[#39FF14]/20">
                      <Plus size={18}/> Ajouter un Produit
                  </button>
              </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 ${isEditingMode ? 'cursor-grab active:cursor-grabbing hover:border-[#39FF14]/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]' : ''}`}
                draggable={isEditingMode && activeCategory === 'Toutes'} // Drag & Drop only logical when all products are shown
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-zinc-700 text-[#39FF14]">
                    {product.category}
                  </div>
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
                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Prix</p>
                      <p className="text-2xl font-black text-white">{product.price.toLocaleString('fr-SN')} <span className="text-sm font-bold text-[#39FF14]">FCFA</span></p>
                    </div>
                    <button onClick={() => handleWhatsAppOrder(product.name)} className="bg-white text-black px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#39FF14] transition-colors flex items-center gap-2 shadow-lg">
                      <MessageSquare size={16} /> Commander
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-zinc-500">
              <Store size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucun produit dans cette catégorie.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
         <ProductModal 
            product={editingProduct}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProduct}
            onAIWrite={handleAIWrite}
            isAIWriting={isAIWriting}
         />
      )}
    </div>
  );
}

// --- PRODUCT MODAL COMPONENT ---
interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    onAIWrite: () => void;
    isAIWriting: boolean;
}

function ProductModal({ product, isOpen, onClose, onSave, onAIWrite, isAIWriting }: ProductModalProps) {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: product?.name || '',
        price: product?.price || 0,
        description: product?.description || '',
        image: product?.image || '',
        category: product?.category || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: product?.id || 0 });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button type="button" onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition bg-zinc-900 p-2 rounded-full"><X size={20}/></button>
                <form onSubmit={handleSubmit} className="p-8 md:p-10">
                    <h2 className="text-2xl font-black tracking-tighter mb-8 text-white">{product ? 'Modifier le Produit' : 'Nouveau Produit'}</h2>
                    
                    <div className="space-y-6">
                        <div className="relative group">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#39FF14] transition" size={20} />
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="URL de l'image (ex: https://...)" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 font-medium text-white outline-none focus:border-[#39FF14] transition focus:ring-1 focus:ring-[#39FF14]" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#39FF14] transition" size={20} />
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom du produit" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 font-medium text-white outline-none focus:border-[#39FF14] transition focus:ring-1 focus:ring-[#39FF14]" required />
                            </div>
                            <div className="relative group">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#39FF14] transition" size={20} />
                                <input type="number" name="price" value={formData.price || ''} onChange={handleChange} placeholder="Prix (FCFA)" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 font-medium text-white outline-none focus:border-[#39FF14] transition focus:ring-1 focus:ring-[#39FF14]" required />
                            </div>
                        </div>

                         <div className="relative group">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#39FF14] transition" size={20} />
                            <input type="text" name="category" list="categories-list" value={formData.category} onChange={handleChange} placeholder="Catégorie (ex: Luxe, Casual...)" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 font-medium text-white outline-none focus:border-[#39FF14] transition focus:ring-1 focus:ring-[#39FF14]" required />
                            <datalist id="categories-list">
                              <option value="Luxe" />
                              <option value="Professionnel" />
                              <option value="Soirée" />
                              <option value="Casual" />
                            </datalist>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-t-xl border-b border-zinc-800">
                                <label htmlFor="product-description" className="text-sm font-bold text-zinc-400">Description</label>
                                <button type="button" onClick={onAIWrite} disabled={isAIWriting} className="bg-gradient-to-r from-emerald-400 to-[#39FF14] text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-wait shadow-lg">
                                    {isAIWriting ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    Optimiser avec l'IA
                                </button>
                            </div>
                            <textarea id="product-description" name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Décrivez le produit, ses matières, sa coupe..." className="w-full bg-zinc-900 border border-zinc-800 rounded-b-xl rounded-t-none p-4 font-medium text-white outline-none focus:border-[#39FF14] transition resize-none focus:ring-1 focus:ring-[#39FF14] -mt-3"></textarea>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition">
                            Annuler
                        </button>
                        <button type="submit" className="bg-white text-black px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#39FF14] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">
                            {product ? 'Enregistrer' : 'Créer le produit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}