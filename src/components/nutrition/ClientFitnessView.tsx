import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, ChevronRight, Settings, Dumbbell, Clock, Filter, Share2, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ClientFitnessView({ clientProfile }: { clientProfile: any }) {
    const [courses, setCourses] = useState<any[]>([]);
    const [dailyWorkout, setDailyWorkout] = useState<any>(null); // Course for "Today"
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    useEffect(() => {
        const fetchFitnessData = async () => {
            const { data } = await supabase.from('nutrition_fitness_courses').select('*');
            if (data) {
                setCourses(data);
                // Simulation: Le programme du jour est aléatoire parmi les cours dispo
                if (data.length > 0) {
                    setDailyWorkout(data[Math.floor(Math.random() * data.length)]);
                }
            }
        };
        fetchFitnessData();
    }, []);

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleShare = async (course: any) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Séance Fitness : ${course.title}`,
                    text: `Rejoins-moi pour cette séance de fitness : ${course.title}`,
                    url: window.location.href, // Ou un lien direct vers la vidéo
                });
            } catch (err) {
                console.log('Erreur de partage', err);
            }
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-left-4 max-w-5xl mx-auto">

            {/* EN-TÊTE PERSONNALISÉ */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black dark:text-white mb-2">
                    Prête à transpirer, {clientProfile?.full_name?.split(' ')[0] || 'Championne'} ? 🔥
                </h1>
                <p className="text-zinc-500 font-medium max-w-xl mx-auto">
                    Ton programme de la semaine pour atteindre tes objectifs. Reste constante, les résultats suivront.
                </p>
            </div>

            {/* SECTION 1: L'ENTRAÎNEMENT DU JOUR */}
            {dailyWorkout && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                        <Play className="text-[#39FF14] bg-black p-1.5 rounded-lg" size={28}/> Entraînement du Jour
                    </h2>

                    <div className="bg-black rounded-[2.5rem] p-4 md:p-6 shadow-2xl relative overflow-hidden group">
                        {/* Dégradé de fond */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none"></div>

                        {activeVideo === dailyWorkout.id ? (
                            <div className="relative z-20 w-full aspect-video rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(57,255,20,0.1)]">
                                <iframe
                                    src={`https://www.youtube.com/embed/${extractYoutubeId(dailyWorkout.video_url)}?autoplay=1`}
                                    title={dailyWorkout.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="relative w-full aspect-video rounded-3xl overflow-hidden cursor-pointer" onClick={() => setActiveVideo(dailyWorkout.id)}>
                                <img src={dailyWorkout.thumbnail_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80'} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="w-20 h-20 bg-[#39FF14] text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.5)] group-hover:scale-110 transition-transform">
                                        <Play size={40} className="ml-2" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="relative z-20 mt-6 md:px-4 flex flex-col md:flex-row justify-between md:items-end gap-4">
                            <div>
                                <div className="flex gap-2 mb-3">
                                    <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{dailyWorkout.difficulty}</span>
                                    <span className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> {dailyWorkout.duration_minutes} MIN</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase">{dailyWorkout.title}</h3>
                                <p className="text-zinc-400 text-sm mt-2">{dailyWorkout.benefits || 'Améliore le cardio et brûle des graisses.'}</p>
                            </div>

                            {!activeVideo && (
                                <button onClick={() => setActiveVideo(dailyWorkout.id)} className="w-full md:w-auto bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                    <Play size={18}/> Lancer la séance
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SECTION 2: CROSS-SELLING (Produit lié) */}
                    {dailyWorkout.linked_product_id && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-zinc-100 p-2 shrink-0">
                                    <img src="https://m.media-amazon.com/images/I/61k2YfB3bQL._AC_SX679_.jpg" alt="Product" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Boost ta séance</p>
                                    <h4 className="font-bold text-lg text-black dark:text-white">Gourde Infuseur Onyx</h4>
                                    <p className="text-sm text-zinc-500">Reste hydratée pendant l'effort.</p>
                                </div>
                            </div>
                            <button className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg">
                                <ShoppingCart size={16}/> 15.000 FCFA
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 3: EXPLORER PAR CATÉGORIE (Grille de Vidéos) */}
            <div className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                        <Dumbbell className="text-[#39FF14] bg-black p-1.5 rounded-lg" size={28}/> Explorer
                    </h2>
                    <button className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        <Filter size={14}/> Filtres
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-4 shadow-sm hover:shadow-xl hover:border-[#39FF14] transition-all group flex flex-col">

                            <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-zinc-100">
                                <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                {/* Badges Superposés */}
                                <div className="absolute top-2 left-2 flex gap-1">
                                    <span className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> {course.duration_minutes}m</span>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleShare(course); }} className="w-8 h-8 bg-black/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-[#39FF14] hover:text-black transition-colors"><Share2 size={12}/></button>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                    <button onClick={() => { setDailyWorkout(course); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-14 h-14 bg-[#39FF14] text-black rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                                        <Play size={24} className="ml-1" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">{course.difficulty}</span>
                                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">{course.equipment_needed === 'Aucun' ? '🧘🏽‍♀️ Sans matériel' : `🏋️ ${course.equipment_needed}`}</span>
                                </div>
                                <h3 className="font-black text-lg uppercase leading-tight mb-2 text-black dark:text-white line-clamp-2">{course.title}</h3>
                                <p className="text-zinc-500 text-xs font-medium line-clamp-2 mt-auto">{course.benefits}</p>
                            </div>
                        </div>
                    ))}
                    {courses.length === 0 && (
                        <div className="col-span-full py-16 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            Les vidéos sont en cours de chargement...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
