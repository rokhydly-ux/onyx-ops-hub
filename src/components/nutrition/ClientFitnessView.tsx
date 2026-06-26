import React, { useState, useEffect } from 'react';
import { Play, Share2, Award, Calendar, CheckCircle, ChevronLeft, ChevronRight, Loader2, Dumbbell } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ClientFitnessView({ clientId, tenantId }: { clientId: string, tenantId: string }) {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingWeek, setGeneratingWeek] = useState(false);
    const [weeklyProgram, setWeeklyProgram] = useState<any[]>([]);

    // Pour la navigation du carrousel de la semaine
    const [currentDayIndex, setCurrentDayIndex] = useState(0);

    const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    useEffect(() => {
        fetchActiveCourses();
        fetchWeeklyProgram();
    }, []);

    const fetchActiveCourses = async () => {
        setLoading(true);
        // Seulement les cours ayant une vidéo (actifs)
        const { data } = await supabase.from('nutrition_fitness_courses').select('*').not('video_url', 'is', null);
        if (data) setCourses(data);
        setLoading(false);
    };

    const fetchWeeklyProgram = async () => {
        const { data } = await supabase.from('nutrition_fitness_programs')
            .select('*, course:course_id(*)')
            .eq('client_id', clientId)
            .order('day_of_week', { ascending: true });

        if (data && data.length > 0) {
            setWeeklyProgram(data);
            // Trouver le jour actuel (0 = Lundi, 6 = Dimanche)
            const today = (new Date().getDay() + 6) % 7;
            setCurrentDayIndex(today);
        } else {
            setWeeklyProgram([]);
        }
    };

    const generateMyWeek = async () => {
        setGeneratingWeek(true);
        try {
            // 1. Vider le programme actuel
            await supabase.from('nutrition_fitness_programs').delete().eq('client_id', clientId);

            // 2. Sélectionner 5 exercices actifs au hasard
            if (courses.length < 5) {
                alert("Pas assez d'exercices actifs dans le catalogue (minimum 5 requis).");
                setGeneratingWeek(false);
                return;
            }

            const shuffled = [...courses].sort(() => 0.5 - Math.random());
            const selectedCourses = shuffled.slice(0, 5);

            // 3. Assigner aux jours (Lundi à Vendredi, 0 à 4). Samedi(5) et Dimanche(6) = Repos
            const newProgram = [];
            for (let i = 0; i < 5; i++) {
                newProgram.push({
                    client_id: clientId,
                    tenant_id: tenantId,
                    course_id: selectedCourses[i].id,
                    program_name: `Programme Automatique - ${selectedCourses[i].title}`,
                    day_of_week: i.toString(), // 0 = Lundi, ..., 4 = Vendredi
                    is_completed: false,
                    is_active: true
                });
            }

            const { error } = await supabase.from('nutrition_fitness_programs').insert(newProgram);
            if (error) {
                console.error("Make sure your Supabase table 'nutrition_fitness_programs' contains the columns: tenant_id, course_id, and is_completed. If not, please run ALTER TABLE.", error);
                throw error;
            }

            await fetchWeeklyProgram();

            // Re-fetch points pour mettre à jour l'UI si nécessaire (ex: bonus de création)
        } catch (error: any) {
            console.error(error);
            alert("Erreur lors de la génération de la semaine.");
        } finally {
            setGeneratingWeek(false);
        }
    };

    const markAsCompleted = async (programId: string) => {
        const { error } = await supabase.from('nutrition_fitness_programs')
            .update({ is_completed: true, completed_at: new Date().toISOString() })
            .eq('id', programId);

        if (!error) {
            // Dans une vraie app, on ajouterait des points ici
            fetchWeeklyProgram();
        }
    };

    const getYoutubeEmbedUrl = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const ytId = (match && match[2].length === 11) ? match[2] : null;
        return ytId ? `https://www.youtube.com/embed/${ytId}` : url;
    };

    // --- Rendu conditionnel si pas de programme ---
    if (weeklyProgram.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 border-4 border-zinc-200">
                    <Dumbbell size={40} className="text-zinc-400" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black">Prêt(e) à transpirer ?</h2>
                <p className="text-zinc-500 max-w-md mb-8">Génère ton programme sportif hebdomadaire sur-mesure. 5 jours d'entraînement, 2 jours de repos.</p>
                <button
                    onClick={generateMyWeek}
                    disabled={generatingWeek || courses.length < 5}
                    className="bg-black text-[#39FF14] px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
                >
                    {generatingWeek ? <Loader2 size={24} className="animate-spin" /> : <Calendar size={24} />}
                    {generatingWeek ? "Création du programme..." : "Générer Ma Semaine"}
                </button>
                {courses.length < 5 && (
                    <p className="text-red-500 text-xs font-bold mt-4">Le catalogue manque d'exercices actifs pour générer un programme.</p>
                )}
            </div>
        );
    }

    // --- Rendu du programme de la semaine ---
    // Construire le tableau complet de 7 jours (incluant repos)
    const fullWeek = DAYS.map((dayName, index) => {
        const prog = weeklyProgram.find(p => p.day_of_week === index.toString());
        return {
            dayIndex: index,
            dayName: dayName,
            isRest: !prog,
            program: prog
        };
    });

    const currentDayData = fullWeek[currentDayIndex];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Bouton Regénérer */}
            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-3xl border border-zinc-200">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Calendar size={20} className="text-black"/> Mon Programme
                    </h2>
                </div>
                <button
                    onClick={generateMyWeek}
                    disabled={generatingWeek}
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-zinc-200 shadow-sm"
                >
                    {generatingWeek ? <Loader2 size={12} className="animate-spin"/> : "Regénérer"}
                </button>
            </div>

            {/* Sélecteur de jour (Slider) */}
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar snap-x">
                {fullWeek.map((day) => (
                    <button
                        key={day.dayIndex}
                        onClick={() => setCurrentDayIndex(day.dayIndex)}
                        className={`flex-shrink-0 snap-center px-6 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentDayIndex === day.dayIndex ? 'bg-black text-[#39FF14] shadow-lg scale-105' : 'bg-white border border-zinc-200 text-zinc-400 hover:bg-zinc-50'}`}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">{day.dayName}</span>
                        {day.program?.is_completed && <CheckCircle size={14} className={currentDayIndex === day.dayIndex ? 'text-[#39FF14]' : 'text-green-500'}/>}
                    </button>
                ))}
            </div>

            {/* Contenu du jour sélectionné */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden relative">
                {currentDayData.isRest ? (
                    <div className="aspect-[4/3] md:aspect-[21/9] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-zinc-50 to-zinc-100">
                        <Award size={64} className="text-zinc-300 mb-4" />
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-black mb-2">Jour de repos</h3>
                        <p className="text-zinc-500 max-w-md">La récupération fait partie intégrante de l'entraînement. Profite de cette journée pour te détendre et bien t'hydrater.</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="aspect-[16/9] w-full bg-black relative">
                            {currentDayData.program?.course?.video_url ? (
                                <iframe
                                    src={getYoutubeEmbedUrl(currentDayData.program.course.video_url)}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white">Vidéo non disponible</div>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{currentDayData.program?.course?.category}</span>
                                <span className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{currentDayData.program?.course?.difficulty}</span>
                                <span className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{currentDayData.program?.course?.duration_minutes} min</span>
                            </div>

                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black">{currentDayData.program?.course?.title}</h3>
                            <p className="text-zinc-500 font-medium mb-8 leading-relaxed">{currentDayData.program?.course?.benefits}</p>

                            <div className="flex flex-col sm:flex-row gap-4 border-t border-zinc-100 pt-8">
                                {currentDayData.program?.is_completed ? (
                                    <div className="flex-1 bg-green-50 text-green-600 px-6 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-green-200">
                                        <CheckCircle size={20}/> Terminé
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => markAsCompleted(currentDayData.program?.id)}
                                        className="flex-1 bg-black text-[#39FF14] px-6 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-xl"
                                    >
                                        <CheckCircle size={20}/> Marquer comme terminé
                                    </button>
                                )}
                                <button className="bg-zinc-100 text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                                    <Share2 size={20}/> Partager
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TODO: Add Cross-Selling Card logic here if needed */}
        </div>
    );
}
