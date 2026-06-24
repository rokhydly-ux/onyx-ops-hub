import React, { useState, useEffect } from 'react';
import { Play, Plus, Edit3, Trash2, X, CheckCircle, Search, Filter, Loader2, Save, GripVertical, Bot } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminFitnessView() {
    const [fitnessTab, setFitnessTab] = useState<'catalog' | 'categories'>('catalog');

    // Catalog State
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Manage video URL updates
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

    const handleGenerateCatalog = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/fitness/generate-catalog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 15 }) // Generating 15 for demo, could be 100
            });
            const data = await res.json();

            if (data.exercises && data.exercises.length > 0) {
                const { error } = await supabase.from('nutrition_fitness_courses').insert(data.exercises);
                if (error) throw error;
                await fetchCourses();
                alert(`${data.exercises.length} exercices générés avec succès !`);
            } else {
                throw new Error(data.error || "Aucun exercice généré.");
            }
        } catch (err: any) {
            console.error(err);
            alert("Erreur lors de la génération : " + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveUrl = async (id: string) => {
        if (!tempUrl) return;
        const ytId = extractYoutubeId(tempUrl);
        const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

        const { error } = await supabase.from('nutrition_fitness_courses')
            .update({ video_url: tempUrl, thumbnail_url: thumb })
            .eq('id', id);

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
        await supabase.from('nutrition_fitness_courses').delete().eq('id', id);
        fetchCourses();
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
                    <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm gap-4">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Générateur de Catalogue IA</h2>
                            <p className="text-zinc-500 text-sm font-medium">Générez la base de données et assignez vos vidéos YouTube.</p>
                        </div>
                        <button
                            onClick={handleGenerateCatalog}
                            disabled={isGenerating}
                            className="bg-black text-[#39FF14] px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50 disabled:scale-100"
                        >
                            {isGenerating ? <Loader2 size={18} className="animate-spin"/> : <Bot size={18}/>}
                            {isGenerating ? "Génération en cours..." : "Générer 15 exercices via IA"}
                        </button>
                    </div>

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
                                        <Play size={32} className="text-orange-300 mb-2"/>
                                        <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-2">En attente de vidéo</span>
                                        <p className="text-[10px] font-bold text-orange-600">Ajoutez une URL YouTube pour activer cet exercice.</p>
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
                                Le catalogue est vide. Utilisez l'IA pour générer une base d'exercices.
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
        </div>
    );
}
