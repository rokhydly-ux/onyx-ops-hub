import React, { useState, useEffect } from 'react';
import { Play, Plus, Edit3, Trash2, X, CheckCircle, Search, Filter, Loader2, Save, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminFitnessView() {
    const [fitnessTab, setFitnessTab] = useState<'catalog' | 'programs' | 'categories'>('catalog');

    // Catalog State
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [courseForm, setCourseForm] = useState({
        title: '', description: '', video_url: '', duration_minutes: 15,
        difficulty: 'Débutant', category: 'Cardio', equipment_needed: 'Aucun',
        benefits: '', linked_product_id: '', thumbnail_url: ''
    });

    // Extract Youtube ID
    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleVideoUrlChange = (url: string) => {
        const ytId = extractYoutubeId(url);
        const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
        setCourseForm(prev => ({ ...prev, video_url: url, thumbnail_url: thumb }));
    };

    return (
        <div className="space-y-6">
            {/* Sous-navigation Fitness */}
            <div className="flex gap-2 border-b border-zinc-200 pb-4">
                <button onClick={() => setFitnessTab('catalog')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${fitnessTab === 'catalog' ? 'bg-black text-[#39FF14]' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Catalogue</button>
                <button onClick={() => setFitnessTab('programs')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${fitnessTab === 'programs' ? 'bg-black text-[#39FF14]' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Programmes</button>
                <button onClick={() => setFitnessTab('categories')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${fitnessTab === 'categories' ? 'bg-black text-[#39FF14]' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Catégories</button>
            </div>

            {/* ONGLET 1: CATALOGUE */}
            {fitnessTab === 'catalog' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Bibliothèque d'Exercices</h2>
                            <p className="text-zinc-500 text-sm font-medium">Gérez vos vidéos d'entraînement.</p>
                        </div>
                        <button onClick={() => setShowCourseModal(true)} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
                            <Plus size={16}/> Ajouter Vidéo
                        </button>
                    </div>

                    <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-10 text-center">
                        <p className="text-zinc-500 text-sm font-bold">Grille des vidéos en cours de développement (Fetch depuis Supabase `nutrition_fitness_courses`).</p>
                    </div>

                    {showCourseModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                                <button onClick={() => setShowCourseModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14]"><X size={20}/></button>
                                <h2 className="text-2xl font-black uppercase mb-6">Ajouter un Cours</h2>

                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Lien YouTube</label>
                                        <input type="text" value={courseForm.video_url} onChange={e => handleVideoUrlChange(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black" placeholder="https://youtube.com/watch?v=..." />
                                        {courseForm.thumbnail_url && (
                                            <div className="mt-2 w-full h-40 rounded-xl overflow-hidden border border-zinc-200 relative">
                                                <img src={courseForm.thumbnail_url} className="w-full h-full object-cover" alt="Thumbnail" />
                                                <div className="absolute inset-0 flex items-center justify-center"><Play className="text-white w-12 h-12 opacity-80 drop-shadow-lg"/></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Titre du cours</label>
                                        <input type="text" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Durée (min)</label>
                                            <input type="number" value={courseForm.duration_minutes} onChange={e => setCourseForm({...courseForm, duration_minutes: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Niveau</label>
                                            <select value={courseForm.difficulty} onChange={e => setCourseForm({...courseForm, difficulty: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black cursor-pointer">
                                                <option value="Débutant">Débutant</option>
                                                <option value="Intermédiaire">Intermédiaire</option>
                                                <option value="Pro">Pro</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Matériel requis</label>
                                        <select value={courseForm.equipment_needed} onChange={e => setCourseForm({...courseForm, equipment_needed: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black cursor-pointer">
                                            <option value="Aucun">Aucun</option>
                                            <option value="Tapis">Tapis</option>
                                            <option value="Haltères / Bouteilles">Haltères / Bouteilles</option>
                                            <option value="Chaise">Chaise</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Cross-Selling (Boutique)</label>
                                        <select value={courseForm.linked_product_id} onChange={e => setCourseForm({...courseForm, linked_product_id: e.target.value})} className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 cursor-pointer">
                                            <option value="">Aucun produit lié</option>
                                            <option value="fake_id_1">Gourde Onyx (5000 FCFA)</option>
                                            <option value="fake_id_2">T-shirt Sudation (12000 FCFA)</option>
                                        </select>
                                        <p className="text-[9px] text-blue-600 ml-2">Le produit apparaîtra sous la vidéo lors de la séance du client.</p>
                                    </div>
                                    <button type="button" className="w-full py-4 rounded-2xl bg-black text-[#39FF14] font-black uppercase tracking-widest">Enregistrer</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ONGLET 2: GÉNÉRATEUR */}
            {fitnessTab === 'programs' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex flex-col md:flex-row justify-between md:items-center bg-zinc-900 p-8 rounded-3xl shadow-lg border border-zinc-800 gap-6">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Générateur Magique</h2>
                            <p className="text-zinc-400 text-sm mt-1">Créez une semaine d'entraînement automatiquement.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <select className="p-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 outline-none text-xs font-bold uppercase">
                                <option>Débutant / Sans matériel</option>
                                <option>Ventre Plat</option>
                                <option>Pro / Avec matériel</option>
                            </select>
                            <button className="bg-gradient-to-r from-[#39FF14] to-[#2ecc71] text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                                Générer Semaine
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                            <div key={day} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm min-h-[150px] flex flex-col">
                                <h4 className="font-black text-sm uppercase mb-3 text-center border-b pb-2">{day}</h4>
                                <div className="flex-1 flex items-center justify-center">
                                    {day === 'Mercredi' || day === 'Dimanche' ? (
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-lg">Repos</span>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-10 h-10 bg-zinc-100 rounded-lg mx-auto mb-2 flex items-center justify-center"><Play size={16} className="text-zinc-400"/></div>
                                            <p className="text-[10px] font-bold text-zinc-600 line-clamp-2">Vidéo Cardio (Générée)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ONGLET 3: CATÉGORIES */}
            {fitnessTab === 'categories' && (
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm animate-in fade-in">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-black mb-6">Taxonomie (Catégories)</h2>
                    <ul className="space-y-3 max-w-md">
                        {['Woyofal Cardio', 'Renforcement Doux', 'Objectif Ventre Plat', 'Mobilité & Étirements', 'Express 10 Min'].map(cat => (
                            <li key={cat} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex justify-between items-center font-bold text-sm">
                                {cat}
                                <button className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
