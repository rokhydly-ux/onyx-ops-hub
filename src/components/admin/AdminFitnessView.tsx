import React, { useState, useEffect } from 'react';
import { Play, Plus, Edit3, Trash2, X, CheckCircle, Search, Filter, Loader2, Save, GripVertical, Bot, Download, Video } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminFitnessView() {
    const [fitnessTab, setFitnessTab] = useState<'catalog' | 'categories'>('catalog');

    // Catalog State
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [isGeneratingStandard, setIsGeneratingStandard] = useState(false);

    // Modal & Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Woyofal Cardio',
        difficulty: 'Débutant',
        duration_minutes: 15,
        benefits: '',
        video_url: ''
    });

    // Manage video URL updates inline
    const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
    const [tempUrl, setTempUrl] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoadingCourses(true);
        const { data } = await supabase.from('nutrition_fitness_courses').select('*').order('created_at', { ascending: false });
        if (data) setCourses(data);
        setLoadingCourses(false);
    };

    // Extract Youtube ID
    const extractYoutubeId = (url: string) => {
        if(!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleGenerateCatalogAI = async () => {
        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/fitness/generate-catalog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 100 }) // Now set to 100
            });
            const data = await res.json();

            if (data.exercises && data.exercises.length > 0) {
                const { error } = await supabase.from('nutrition_fitness_courses').insert(data.exercises);
                if (error) throw error;
                await fetchCourses();
                alert(`${data.exercises.length} exercices générés avec succès via IA !`);
            } else {
                throw new Error(data.error || "Aucun exercice généré.");
            }
        } catch (err: any) {
            console.error(err);
            alert("Erreur lors de la génération IA : " + err.message + "\nAssurez-vous que la clé API OpenAI est bien configurée.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleGenerateCatalogStandard = async () => {
        setIsGeneratingStandard(true);
        try {
            // Un petit catalogue gratuit en dur
            const freeCatalog = [
                { title: "Marche Rapide Sur Place", category: "Woyofal Cardio", difficulty: "Débutant", duration_minutes: 10, benefits: "Stimule le cœur en douceur et réveille les articulations.", video_url: null, thumbnail_url: null },
                { title: "Gainage Ventre Plat", category: "Objectif Ventre Plat", difficulty: "Intermédiaire", duration_minutes: 5, benefits: "Renforce la ceinture abdominale profonde pour un ventre plus ferme.", video_url: null, thumbnail_url: null },
                { title: "Étirements du Matin", category: "Mobilité & Étirements", difficulty: "Débutant", duration_minutes: 10, benefits: "Idéal pour déverrouiller le dos et gagner en souplesse dès le réveil.", video_url: null, thumbnail_url: null },
                { title: "Afro Danse Cardio", category: "Woyofal Cardio", difficulty: "Intermédiaire", duration_minutes: 20, benefits: "Brûle des calories tout en s'amusant sur des rythmes africains.", video_url: null, thumbnail_url: null },
                { title: "Squats Toniques", category: "Renforcement Doux", difficulty: "Débutant", duration_minutes: 15, benefits: "Tonifie les cuisses et les fessiers sans matériel.", video_url: null, thumbnail_url: null },
                { title: "Routine Express 10 Min", category: "Express 10 Min", difficulty: "Intermédiaire", duration_minutes: 10, benefits: "Pour les jours où on manque de temps : un condensé intense.", video_url: null, thumbnail_url: null },
                { title: "Yoga Doux Dos", category: "Mobilité & Étirements", difficulty: "Débutant", duration_minutes: 15, benefits: "Soulage les tensions accumulées dans le bas du dos.", video_url: null, thumbnail_url: null },
                { title: "HIIT Brûle-Graisses", category: "Woyofal Cardio", difficulty: "Avancé", duration_minutes: 20, benefits: "Effort intense par intervalles pour accélérer le métabolisme.", video_url: null, thumbnail_url: null },
                { title: "Abdos Diagonales", category: "Objectif Ventre Plat", difficulty: "Intermédiaire", duration_minutes: 10, benefits: "Cible les obliques pour affiner la taille.", video_url: null, thumbnail_url: null },
                { title: "Renforcement Bras", category: "Renforcement Doux", difficulty: "Débutant", duration_minutes: 12, benefits: "Raffermit l'arrière des bras avec le poids du corps.", video_url: null, thumbnail_url: null },
            ];

            const res = await fetch('/api/fitness/manage-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'insert', payload: freeCatalog }) });
            const result = await res.json();
            const error = !res.ok ? result : null;
            if (error) throw error;
            await fetchCourses();
            alert("10 exercices standards ont été générés avec succès !");
        } catch (err: any) {
            console.error(err);
            alert("Erreur lors de la génération standard.");
        } finally {
            setIsGeneratingStandard(false);
        }
    }

    const handleSaveUrl = async (id: string) => {
        if (!tempUrl) return;
        const ytId = extractYoutubeId(tempUrl);
        const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

        const res = await fetch('/api/fitness/manage-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id, payload: { video_url: tempUrl, thumbnail_url: thumb } }) });
        const result = await res.json();
        const error = !res.ok ? result : null;

        if (error) {
            alert("Erreur lors de la mise à jour");
        } else {
            setEditingUrlId(null);
            setTempUrl('');
            fetchCourses();
        }
    };

    const handleDeleteCourse = async (id: string) => {
        if(!confirm("Supprimer cet exercice ?")) return;
        await fetch('/api/fitness/manage-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
        fetchCourses();
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const ytId = extractYoutubeId(formData.video_url);
        const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

        const payload = {
            title: formData.title,
            category: formData.category,
            difficulty: formData.difficulty,
            duration_minutes: formData.duration_minutes,
            benefits: formData.benefits,
            video_url: formData.video_url || null,
            thumbnail_url: thumb
        };

        const res = await fetch('/api/fitness/manage-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'insert', payload: [payload] }) });
        const result = await res.json();
        const error = !res.ok ? result : null;

        if (error) {
            console.error("Erreur Insert SQL :", error);
            alert("Erreur lors de l'ajout : " + error.message);
        } else {
            setShowAddModal(false);
            setFormData({
                title: '', category: 'Woyofal Cardio', difficulty: 'Débutant', duration_minutes: 15, benefits: '', video_url: ''
            });
            fetchCourses();
        }
    };

    return (
        <div className="space-y-6">
            {/* Sous-navigation Fitness */}
            <div className="flex gap-2 border-b border-zinc-200 pb-4">
                <button onClick={() => setFitnessTab('catalog')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${fitnessTab === 'catalog' ? 'bg-black text-[#39FF14]' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Catalogue Exercices</button>
                <button onClick={() => setFitnessTab('categories')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${fitnessTab === 'categories' ? 'bg-black text-[#39FF14]' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>Taxonomie (Catégories)</button>
            </div>

            {/* ONGLET 1: CATALOGUE */}
            {fitnessTab === 'catalog' && (
                <div className="space-y-6 animate-in fade-in">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm gap-4">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Gestion du Catalogue</h2>
                            <p className="text-zinc-500 text-sm font-medium">Ajoutez manuellement ou générez des exercices pour vos clients.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-zinc-100 text-black px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={16}/> Ajouter Manuellement
                            </button>
                            <button
                                onClick={handleGenerateCatalogStandard}
                                disabled={isGeneratingStandard}
                                className="bg-white border border-zinc-200 text-black px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGeneratingStandard ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                                Standard (Gratuit)
                            </button>
                            <button
                                onClick={handleGenerateCatalogAI}
                                disabled={isGeneratingAI}
                                className="bg-black text-[#39FF14] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 disabled:scale-100"
                            >
                                {isGeneratingAI ? <Loader2 size={16} className="animate-spin"/> : <Bot size={16}/>}
                                IA (100)
                            </button>
                        </div>
                    </div>

                    {/* Grille du Catalogue */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col relative group">
                                <button onClick={() => handleDeleteCourse(course.id)} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-50 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>

                                {course.video_url ? (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-zinc-100 border border-zinc-100">
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 left-2 bg-[#39FF14] text-black px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">Actif</div>
                                    </div>
                                ) : (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-orange-50 border-2 border-dashed border-orange-200 flex flex-col items-center justify-center p-4 text-center">
                                        <Video size={32} className="text-orange-300 mb-2"/>
                                        <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-2">En attente de vidéo</span>
                                        <p className="text-[10px] font-bold text-orange-600">Ajoutez une URL YouTube pour activer.</p>
                                    </div>
                                )}

                                <div className="flex-1 flex flex-col">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md text-[9px] font-black uppercase">{course.category}</span>
                                        <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md text-[9px] font-black uppercase">{course.difficulty}</span>
                                        <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md text-[9px] font-black uppercase">{course.duration_minutes} min</span>
                                    </div>
                                    <h3 className="font-black text-lg uppercase leading-tight mb-2 text-black line-clamp-2">{course.title}</h3>
                                    <p className="text-zinc-500 text-xs font-medium line-clamp-3 mb-4">{course.benefits}</p>
                                </div>

                                {/* Gestion de l'URL */}
                                <div className="mt-auto pt-4 border-t border-zinc-100">
                                    {!course.video_url || editingUrlId === course.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Lien YouTube..."
                                                value={editingUrlId === course.id ? tempUrl : ''}
                                                onChange={e => {
                                                    setEditingUrlId(course.id);
                                                    setTempUrl(e.target.value);
                                                }}
                                                className="flex-1 p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-black"
                                            />
                                            <button
                                                onClick={() => handleSaveUrl(course.id)}
                                                disabled={!tempUrl}
                                                className="bg-black text-[#39FF14] px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                            >Sauver</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Vidéo assignée</p>
                                            <button onClick={() => { setEditingUrlId(course.id); setTempUrl(course.video_url); }} className="text-[10px] font-bold text-zinc-500 hover:text-black underline underline-offset-2">Modifier URL</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {courses.length === 0 && !loadingCourses && (
                            <div className="col-span-full py-16 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-3xl">
                                Le catalogue est vide. Ajoutez un exercice ou générez-en automatiquement.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ONGLET 3: CATÉGORIES */}
            {fitnessTab === 'categories' && (
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm animate-in fade-in">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-black mb-2">Taxonomie</h2>
                    <p className="text-sm font-medium text-zinc-500 mb-6 max-w-lg">Ces catégories sont utilisées par le générateur de programmes côté client pour cibler les besoins.</p>
                    <ul className="space-y-3 max-w-md">
                        {['Woyofal Cardio', 'Renforcement Doux', 'Objectif Ventre Plat', 'Mobilité & Étirements', 'Express 10 Min'].map(cat => (
                            <li key={cat} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex justify-between items-center font-bold text-sm text-black">
                                {cat}
                                <button className="text-red-500 hover:text-red-700 opacity-50 cursor-not-allowed" title="Les catégories par défaut ne peuvent pas être supprimées via l'interface."><Trash2 size={16}/></button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* MODAL AJOUT MANUEL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-black flex items-center gap-2">
                                <Plus size={20} className="text-[#39FF14]"/> Nouvel Exercice
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-black transition-colors"><X size={20}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="manualForm" onSubmit={handleManualSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Titre de l'exercice *</label>
                                    <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Ex: Gainage Dynamique"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Catégorie *</label>
                                        <select required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black outline-none appearance-none">
                                            <option value="Woyofal Cardio">Woyofal Cardio</option>
                                            <option value="Renforcement Doux">Renforcement Doux</option>
                                            <option value="Objectif Ventre Plat">Objectif Ventre Plat</option>
                                            <option value="Mobilité & Étirements">Mobilité & Étirements</option>
                                            <option value="Express 10 Min">Express 10 Min</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Difficulté *</label>
                                        <select required value={formData.difficulty} onChange={e=>setFormData({...formData, difficulty: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black outline-none appearance-none">
                                            <option value="Débutant">Débutant</option>
                                            <option value="Intermédiaire">Intermédiaire</option>
                                            <option value="Avancé">Avancé</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Durée (minutes) *</label>
                                    <input required type="number" min="1" max="120" value={formData.duration_minutes} onChange={e=>setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Bienfaits / Description *</label>
                                    <textarea required value={formData.benefits} onChange={e=>setFormData({...formData, benefits: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black outline-none min-h-[80px] resize-none" placeholder="Ex: Idéal pour sculpter sa silhouette..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Lien YouTube (Optionnel)</label>
                                    <input type="url" value={formData.video_url} onChange={e=>setFormData({...formData, video_url: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black outline-none" placeholder="https://youtube.com/watch?v=..."/>
                                    <p className="text-[10px] text-zinc-400 mt-1">Laissez vide si vous n'avez pas encore de vidéo.</p>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-4">
                            <button onClick={() => setShowAddModal(false)} type="button" className="flex-1 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-xs bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-100 transition-colors">Annuler</button>
                            <button form="manualForm" type="submit" className="flex-1 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-xs bg-black text-[#39FF14] hover:scale-105 transition-transform flex justify-center items-center gap-2 shadow-lg"><Save size={16}/> Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
