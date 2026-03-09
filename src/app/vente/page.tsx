"use client";

import React, { useState, useRef, DragEvent } from 'react';
import { MessageSquare, Edit, Trash2, Plus, FileUp, Sparkles, X, Image as ImageIcon, DollarSign, Tag, Type } from 'lucide-react';

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
  { id: 1, name: 'Boubou Onyx Premium', price: 75000, description: 'Tissu de luxe, coupe moderne.', image: 'https://i.ibb.co/pPZJz7j/boubou-1.jpg', category: 'Luxe' },
  { id: 2, name: 'Chemise en Lin "Dakar"', price: 25000, description: 'Légère et parfaite pour le climat.', image: 'https://i.ibb.co/3sSqcCg/chemise-lin.jpg', category: 'Casual' },
  { id: 3, name: 'Ensemble Tailleur "Business"', price: 85000, description: 'Pour un look pro et élégant.', image: 'https://i.ibb.co/yQJ4c1g/tailleur-femme.jpg', category: 'Professionnel' },
  { id: 4, name: 'Robe de Soirée "Lagoon"', price: 120000, description: 'Faites sensation lors de vos événements.', image: 'https://i.ibb.co/VvzHZj3/robe-soiree.jpg', category: 'Soirée' },
  { id: 5, name: 'T-Shirt "Yoff"', price: 15000, description: 'Coton bio, design exclusif.', image: 'https://i.ibb.co/gR7HqvL/tshirt-yoff.jpg', category: 'Casual' },
  { id: 6, name: 'Grand Boubou "Teranga"', price: 95000, description: 'Tradition et modernité réunies.', image: 'https://i.ibb.co/9gXqJqS/grand-boubou.jpg', category: 'Traditionnel' },
];

const WHATSAPP_NUMBER = "221771234567"; // Replace with the actual WhatsApp number

export default function OnyxJaayPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isEditingMode, setIsEditingMode] = useState(true); // Default to true for showcase
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIWriting, setIsAIWriting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
      // Update existing product
      setProducts(products.map(p => p.id === productData.id ? productData : p));
    } else {
      // Add new product
      const newProduct = { ...productData, id: Date.now() };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  const handleAIWrite = () => {
    setIsAIWriting(true);
    setTimeout(() => {
      const aiDescription = `✨ **Sublimez votre style avec le Boubou Onyx Premium.** ✨

Confectionné à partir d'un tissu de luxe importé, ce boubou incarne l'élégance et le raffinement. Sa coupe moderne et épurée s'adapte à toutes les morphologies, vous assurant une allure distinguée en toute occasion.

- **Tissu Exceptionnel** : Douceur et confort incomparables.
- **Design Exclusif** : Un mélange parfait de tradition et de modernité.
- **Finitions Haute Couture** : Chaque détail est pensé pour la perfection.

Commandez le vôtre aujourd'hui et devenez l'icône de l'élégance dakaroise.`;

      // In a real scenario, you'd update the form state here
      const descriptionTextarea = document.getElementById('product-description') as HTMLTextAreaElement;
      if (descriptionTextarea) {
        descriptionTextarea.value = aiDescription;
      }
      setIsAIWriting(false);
    }, 2000);
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

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="py-8 px-6 md:px-12 border-b border-zinc-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Onyx <span className="text-[#39FF14]">Jaay</span></h1>
            <p className="text-zinc-500 text-sm">Votre catalogue WhatsApp-first.</p>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold uppercase mr-2 text-zinc-400">Mode Propriétaire</span>
             <label htmlFor="editModeToggle" className="cursor-pointer">
                <div className={`w-14 h-8 rounded-full p-1 transition-colors ${isEditingMode ? 'bg-[#39FF14]' : 'bg-zinc-700'}`}>
                   <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isEditingMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <input id="editModeToggle" type="checkbox" checked={isEditingMode} onChange={() => setIsEditingMode(!isEditingMode)} className="hidden" />
             </label>
          </div>
        </div>
      </header>
      
      <main className="p-6 md:p-12">
        {isEditingMode && (
            <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
                <button onClick={handleAddProduct} className="bg-[#39FF14] text-black px-6 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-white transition duration-300 shadow-lg flex items-center gap-2">
                    <Plus size={18}/> Ajouter un Produit
                </button>
                 <button className="bg-zinc-800 text-white px-6 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-zinc-700 transition duration-300 shadow-lg flex items-center gap-2">
                    <FileUp size={18}/> Importer XLS
                </button>
            </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className={`bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 ${isEditingMode ? 'cursor-grab active:cursor-grabbing hover:border-[#39FF14]/50' : ''}`}
              draggable={isEditingMode}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
                {isEditingMode && (
                    <div className="absolute top-4 right-4 flex flex-col gap-3">
                        <button onClick={() => handleEditProduct(product)} className="bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white hover:text-black transition"><Edit size={16}/></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="bg-black/70 backdrop-blur-sm text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
                    </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-xl font-bold tracking-tight">{product.name}</h2>
                <p className="text-sm text-zinc-400 mt-1 flex-1">{product.description}</p>
                <div className="flex justify-between items-center mt-6">
                  <p className="text-2xl font-black text-[#39FF14]">{product.price.toLocaleString('fr-SN')} <span className="text-sm font-bold text-zinc-500">F CFA</span></p>
                  <button onClick={() => handleWhatsAppOrder(product.name)} className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#39FF14] transition-colors flex items-center gap-2">
                    <MessageSquare size={16} /> Commander
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

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
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: product?.id || 0 });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition"><X size={24}/></button>
                <form onSubmit={handleSubmit} className="p-8 md:p-12">
                    <h2 className="text-2xl font-black tracking-tighter mb-8">{product ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}</h2>
                    
                    <div className="space-y-6">
                        {/* Image URL */}
                        <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="URL de l'image" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-12 font-bold text-white outline-none focus:border-[#39FF14] transition" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom du produit" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-12 font-bold text-white outline-none focus:border-[#39FF14] transition" required />
                            </div>
                            {/* Price */}
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Prix (F CFA)" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-12 font-bold text-white outline-none focus:border-[#39FF14] transition" required />
                            </div>
                        </div>

                        {/* Category */}
                         <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Catégorie" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-12 font-bold text-white outline-none focus:border-[#39FF14] transition" required />
                        </div>

                        {/* Description & AI Button */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label htmlFor="product-description" className="text-sm font-bold text-zinc-400">Description</label>
                                <button type="button" onClick={onAIWrite} disabled={isAIWriting} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-wait">
                                    {isAIWriting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    Optimiser avec l'IA
                                </button>
                            </div>
                            <textarea id="product-description" name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Décrivez le produit, ses matières, sa coupe..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 font-bold text-white outline-none focus:border-[#39FF14] transition resize-none"></textarea>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-zinc-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-zinc-600 transition">
                            Annuler
                        </button>
                        <button type="submit" className="bg-[#39FF14] text-black px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider hover:bg-white transition">
                            {product ? 'Sauvegarder' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
