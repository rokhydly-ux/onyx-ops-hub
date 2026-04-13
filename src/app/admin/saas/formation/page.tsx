"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, BookOpen, Users, PlayCircle, TrendingUp, 
  Search, Filter, CheckCircle, Clock, MoreVertical, Edit3, Trash2, Save,
  Sun, Moon, Award, GraduationCap, X, FileText, BarChart
} from 'lucide-react';


export default function OnyxFormationAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'stats'>('students');
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'xp_desc' | 'xp_asc'>('default');
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  const [formations, setFormations] = useState<any[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingCourseInfo, setEditingCourseInfo] = useState<any>(null);
  const [videoViews, setVideoViews] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase.from('clients').select('*');
      if (data) {
        const filtered = data.filter(c => {
          const saas = [c.saas, ...(c.active_saas || [])].map(s => (s || '').toLowerCase());
          return saas.some(s => s.includes('formation') || s.includes('gold') || s.includes('tekki pro'));
        });
        // Map to student structure
        const mapped = filtered.map(c => ({
            ...c,
            progress: Math.floor(Math.random() * 100), // To be replaced by real progress tracking if DB supports it
            last_module: "En cours",
            status: c.status || "Actif",
            xp: Math.floor(Math.random() * 5000) + 500 // Mock des XP
        }));
        setStudents(mapped);
      }
    };
    fetchStudents();

    const local = localStorage.getItem('onyx_formations');
    if (local) {
      setFormations(JSON.parse(local));
    } else {
      const defaultFormations = [{
        id: 'andromeda',
        title: 'Le Protocole Andromeda',
        description: 'Maîtriser le marketing et les Ads en Afrique',
        modules: [
          { id: "1", title: "Le Protocole Andromeda (Structure)", duration: "18 min", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdf_url: "", order: 1 },
          { id: "2", title: "La Créa comme Ciblage (Hook & Filtrage)", duration: "24 min", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdf_url: "", order: 2 },
          { id: "3", title: "Conversion WhatsApp & Bot", duration: "15 min", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdf_url: "", order: 3 },
          { id: "4", title: "Scaling : Multiplier le budget sans crash", duration: "20 min", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", pdf_url: "", order: 4 }
        ]
      }];
      setFormations(defaultFormations);
      localStorage.setItem('onyx_formations', JSON.stringify(defaultFormations));
    }
    
    const views = localStorage.getItem('onyx_video_views');
    if (views) {
      setVideoViews(JSON.parse(views));
    }
  }, []);

  const saveFormationsToLocal = (newFormations: any[]) => {
    setFormations(newFormations);
    localStorage.setItem('onyx_formations', JSON.stringify(newFormations));
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingStudent) return;
      const { error } = await supabase.from('clients').update({ full_name: editingStudent.full_name, phone: editingStudent.phone, status: editingStudent.status }).eq('id', editingStudent.id);
      if (!error) {
          setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
          setEditingStudent(null);
          alert("Apprenant mis à jour !");
      } else {
          alert(error.message);
      }
  };

  // Thème dynamique pour le Toggle Dark/Light Mode
  const theme = {
    bg: isDark ? 'bg-[#050505]' : 'bg-zinc-50',
    text: isDark ? 'text-white' : 'text-zinc-900',
    headerBg: isDark ? 'bg-black/80' : 'bg-white/80',
    headerBorder: isDark ? 'border-zinc-900' : 'border-zinc-200',
    cardBg: isDark ? 'bg-zinc-900' : 'bg-white',
    cardBorder: isDark ? 'border-zinc-800' : 'border-zinc-200',
    textMuted: isDark ? 'text-zinc-500' : 'text-zinc-500',
    textSub: isDark ? 'text-zinc-400' : 'text-zinc-600',
    hoverBg: isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-zinc-50',
    inputBg: isDark ? 'bg-zinc-900' : 'bg-white',
  };

  // Détermination des 3 meilleurs élèves par XP
  const top3StudentIds = [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 3).map(s => s.id);

  // Application de la recherche et du filtre de tri
  const filteredAndSortedStudents = students
    .filter(s => s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone?.includes(searchQuery))
    .sort((a, b) => {
       if (sortOrder === 'xp_desc') return (b.xp || 0) - (a.xp || 0);
       if (sortOrder === 'xp_asc') return (a.xp || 0) - (b.xp || 0);
       return 0;
    });

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans transition-colors duration-500 selection:bg-[#39FF14] selection:text-black pb-20`}>
      
      {/* HEADER NAVBAR */}
      <header className={`${theme.headerBg} backdrop-blur-md border-b ${theme.headerBorder} sticky top-0 z-50 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-100 hover:bg-zinc-200'}`}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-xl flex items-center justify-center">
                <GraduationCap size={20} className="text-[#39FF14]" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
                  Onyx <span className="text-[#39FF14]">Formation</span>
                </h1>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Académie Marketing & Ventes</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* TOGGLE DARK/LIGHT MODE */}
            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'}`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className={`flex p-1 rounded-xl hidden md:flex ${isDark ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
              <button 
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'students' ? 'bg-black text-[#39FF14] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
              >
                Apprenants
              </button>
              <button 
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'courses' ? 'bg-black text-[#39FF14] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
              >
                Catalogue
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'stats' ? 'bg-black text-[#39FF14] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
              >
                Statistiques
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* STATS RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div onClick={() => alert("Détails apprenants à venir...")} className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg transition-transform hover:scale-105 cursor-pointer`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Users size={20} className="text-blue-500"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Apprenants Actifs</p>
            <p className="text-3xl font-black">{students.length}</p>
          </div>
          
          <div onClick={() => alert("Détails de complétion à venir...")} className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg transition-transform hover:scale-105 cursor-pointer`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#39FF14]/10 rounded-lg"><Award size={20} className="text-[#39FF14]"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Taux de Complétion</p>
            <p className="text-3xl font-black">68%</p>
          </div>

          <div onClick={() => alert("Statistiques vidéo à venir...")} className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg transition-transform hover:scale-105 cursor-pointer`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg"><PlayCircle size={20} className="text-purple-500"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Heures Visionnées</p>
            <p className="text-3xl font-black text-purple-500">1,240h</p>
          </div>

          <div onClick={() => alert("Rapport des ventes à venir...")} className="bg-[#39FF14] text-black p-6 rounded-3xl shadow-[0_10px_30px_rgba(57,255,20,0.15)] flex flex-col justify-center transition-transform hover:scale-105 cursor-pointer">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Revenu Formation (Mois)</p>
            <p className="text-3xl font-black tracking-tighter">4.7M F</p>
            <button className="mt-4 w-full bg-black text-[#39FF14] py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform">
              Rapport des ventes
            </button>
          </div>
        </div>

        {activeTab === 'students' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Suivi des <span className="text-[#39FF14]">Apprenants</span></h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un élève..." 
                    className={`w-full ${theme.inputBg} border ${theme.cardBorder} rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[#39FF14] transition-colors`}
                  />
                </div>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className={`p-2.5 ${theme.inputBg} border ${theme.cardBorder} rounded-xl hover:border-[#39FF14] transition-colors outline-none text-xs font-bold uppercase tracking-widest cursor-pointer appearance-none`}
                >
                   <option value="default">Trier par défaut</option>
                   <option value="xp_desc">Top XP (Décroissant)</option>
                   <option value="xp_asc">Flop XP (Croissant)</option>
                </select>
              </div>
            </div>

            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl overflow-hidden shadow-2xl transition-colors`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDark ? 'bg-black/50' : 'bg-zinc-100'} border-b ${theme.cardBorder} text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>
                      <th className="p-5 whitespace-nowrap">Apprenant</th>
                      <th className="p-5 whitespace-nowrap w-48">Progression Globale</th>
                      <th className="p-5 whitespace-nowrap">Dernier Module</th>
                      <th className="p-5 whitespace-nowrap">Statut</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
                  {filteredAndSortedStudents.map((student) => (
                      <tr key={student.id} onClick={() => setEditingStudent(student)} className={`${theme.hoverBg} transition-colors cursor-pointer group`}>
                        <td className="p-5">
                        <p className="font-black text-sm uppercase flex items-center gap-2">
                           {student.full_name}
                           {top3StudentIds.includes(student.id) && (
                              <span className="bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                 <Award size={10} /> Elite
                              </span>
                           )}
                        </p>
                        <p className={`text-[10px] font-bold ${theme.textSub}`}>{student.phone} • <span className="text-[#39FF14]">{student.xp || 0} XP</span></p>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className={theme.textMuted}>Complété</span>
                              <span className={student.progress === 100 ? 'text-[#39FF14]' : theme.text}>
                                {student.progress}%
                              </span>
                            </div>
                            <div className={`h-1.5 w-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} rounded-full overflow-hidden`}>
                              <div 
                                className={`h-full rounded-full ${student.progress === 100 ? 'bg-[#39FF14]' : 'bg-blue-500'}`}
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`flex items-center gap-2 text-xs font-bold ${theme.textSub}`}>
                            <BookOpen size={14} className="text-blue-500"/>
                            {student.last_module}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`text-[10px] font-black uppercase flex items-center gap-1 w-max px-2 py-1 rounded-md ${
                            student.status === 'Terminé' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 
                            student.status === 'Actif' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                            'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                          }`}>
                            <Clock size={12}/>
                            {student.status || 'Actif'}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button className={`${theme.textMuted} group-hover:text-[#39FF14] p-2 transition-colors`}>
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-zinc-500 font-bold text-sm">Aucun apprenant trouvé.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'courses' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto">
            {!selectedFormation ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight">Catalogue <span className="text-[#39FF14]">Formations</span></h2>
                  <button 
                    onClick={() => {
                      setEditingCourseInfo({ id: Date.now().toString(), title: "Nouveau Cours", description: "", modules: [] });
                    }}
                    className="bg-[#39FF14] text-black px-6 py-3 rounded-2xl text-xs font-black uppercase hover:scale-105 transition-transform shadow-lg">
                    + Créer un Cours
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {formations.map(form => (
                    <div key={form.id} className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl transition-colors hover:border-[#39FF14] group`}>
                      <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-[#39FF14]/10 text-[#39FF14] rounded-xl"><GraduationCap size={24}/></div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingCourseInfo(form)} className="p-2 bg-zinc-800 text-white rounded-lg hover:text-[#39FF14]"><Edit3 size={14}/></button>
                            <button onClick={() => {
                                if(confirm("Supprimer ce cours ?")) {
                                    saveFormationsToLocal(formations.filter(f => f.id !== form.id));
                                }
                            }} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={14}/></button>
                         </div>
                      </div>
                      <h3 className="font-black text-xl uppercase mb-2">{form.title}</h3>
                      <p className={`text-sm font-medium ${theme.textSub} mb-6 line-clamp-2`}>{form.description || "Aucune description"}</p>
                      <div className={`flex items-center justify-between pt-4 border-t ${theme.cardBorder}`}>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Modules inclus</span>
                          <span className="font-bold">{form.modules?.length || 0} Leçons</span>
                        </div>
                        <button onClick={() => setSelectedFormation(form)} className={`bg-black text-[#39FF14] px-5 py-2.5 rounded-xl text-xs font-black uppercase hover:scale-105 transition-transform shadow-lg`}>
                           Gérer les modules
                        </button>
                      </div>
                    </div>
                  ))}
                  {formations.length === 0 && <p className="text-zinc-500 italic col-span-2">Aucun cours créé.</p>}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedFormation(null)} className={`p-3 rounded-full bg-black border border-zinc-800 hover:border-[#39FF14] transition-colors`}><ArrowLeft size={20}/></button>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">Édition du cours</p>
                       <h2 className="text-2xl font-black uppercase tracking-tight text-white">{selectedFormation.title}</h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingModule({ id: Date.now().toString(), title: '', duration: '', video_url: '', pdf_url: '', order: (selectedFormation.modules?.length || 0) + 1 })}
                    className="bg-[#39FF14] text-black px-6 py-3 rounded-xl text-xs font-black uppercase hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                    <PlayCircle size={16}/> Ajouter un Module
                  </button>
                </div>

                <div className="space-y-4">
                  {(selectedFormation.modules || []).sort((a:any, b:any) => a.order - b.order).map((mod: any) => (
                    <div key={mod.id} className={`${theme.cardBg} border ${theme.cardBorder} p-5 rounded-2xl flex items-center justify-between gap-4 hover:border-[#39FF14] transition-colors group`}>
                       <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-black border border-[#39FF14]/30 text-[#39FF14] rounded-xl flex items-center justify-center font-black text-lg shadow-inner">{mod.order}</div>
                         <div>
                           <h4 className="font-black uppercase text-base text-white">{mod.title}</h4>
                           <div className="flex items-center gap-3 mt-1">
                               <span className={`text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1`}><Clock size={12}/> {mod.duration}</span>
                               {mod.video_url && <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[9px] font-black uppercase border border-blue-500/20">Vidéo</span>}
                               {mod.pdf_url && <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[9px] font-black uppercase border border-red-500/20">PDF</span>}
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingModule(mod)} className={`p-2.5 bg-zinc-800 rounded-lg hover:text-[#39FF14] transition-colors`}><Edit3 size={16}/></button>
                          <button onClick={() => {
                              if(confirm("Supprimer ce module ?")) {
                                  const updated = { ...selectedFormation, modules: selectedFormation.modules.filter((m:any) => m.id !== mod.id) };
                                  setSelectedFormation(updated);
                                  saveFormationsToLocal(formations.map(f => f.id === updated.id ? updated : f));
                              }
                          }} className={`p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors`}><Trash2 size={16}/></button>
                       </div>
                    </div>
                  ))}
                  {(!selectedFormation.modules || selectedFormation.modules.length === 0) && (
                      <div className="p-10 border-2 border-dashed border-zinc-800 rounded-3xl text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">
                          Aucun module dans ce cours. Ajoutez votre première leçon !
                      </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'stats' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto space-y-8">
             <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Statistiques <span className="text-[#39FF14]">D'engagement</span></h2>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl`}>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><PlayCircle size={24}/></div>
                      <h3 className="font-black uppercase text-sm">Vues Totales</h3>
                   </div>
                   <p className="text-4xl font-black">{Object.values(videoViews).reduce((a, b) => a + b, 0)}</p>
                   <p className={`text-xs font-bold ${theme.textSub} mt-2`}>Vidéos lues par les apprenants</p>
                </div>
                <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl`}>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-[#39FF14]/10 text-[#39FF14] rounded-xl"><CheckCircle size={24}/></div>
                      <h3 className="font-black uppercase text-sm">Taux de réussite Quiz</h3>
                   </div>
                   <p className="text-4xl font-black">85%</p>
                   <p className={`text-xs font-bold ${theme.textSub} mt-2`}>Moyenne au premier essai</p>
                </div>
                <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl`}>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl"><Clock size={24}/></div>
                      <h3 className="font-black uppercase text-sm">Temps Moyen</h3>
                   </div>
                   <p className="text-4xl font-black">3h 45m</p>
                   <p className={`text-xs font-bold ${theme.textSub} mt-2`}>Pour compléter la formation</p>
                </div>
             </div>

             <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl`}>
                <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-2"><BarChart className="text-[#39FF14]" size={20}/> Vues par Module</h3>
                <div className="space-y-6">
                   {formations.flatMap(f => f.modules || []).map((mod: any) => {
                      const views = videoViews[mod.id] || 0;
                      const maxViews = Math.max(...Object.values(videoViews), 1);
                      const percentage = maxViews > 0 ? (views / maxViews) * 100 : 0;
                      
                      return (
                         <div key={mod.id}>
                            <div className="flex justify-between items-end mb-2">
                               <p className="font-bold text-sm uppercase">{mod.title}</p>
                               <p className="text-xs font-black text-[#39FF14]">{views} vues</p>
                            </div>
                            <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                               <div className="h-full bg-[#39FF14] transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                            </div>
                         </div>
                      );
                   })}
                </div>
                <div className="mt-8 pt-6 border-t border-zinc-800">
                   <p className={`text-xs font-medium ${theme.textSub}`}>
                      Astuce : Analysez les abandons. Si un module a significativement moins de vues que le précédent, il est peut-être trop long ou mal compris.
                   </p>
                </div>
             </div>
          </div>
        ) : null}

        {/* LEADERBOARD XP GAMIFIÉ */}
        {activeTab === 'stats' && (
           <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl mt-8 animate-in fade-in slide-in-from-bottom-4`}>
              <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-2"><Award className="text-yellow-400" size={20}/> Classement XP (Top Apprenants)</h3>
              
              <div className="flex items-end justify-center gap-4 mb-10 mt-6 px-2">
                 {(() => {
                    const sorted = [...students].sort((a,b) => (b.xp || 0) - (a.xp || 0));
                    if (sorted.length === 0) return <p className="text-zinc-500 italic">Aucun élève classé.</p>;
                    
                    return (
                       <>
                          {sorted.length > 1 && (
                              <div className="flex flex-col items-center">
                                  <div className={`w-10 h-10 rounded-full bg-zinc-300 flex items-center justify-center font-black text-black mb-2 border-2`}>{sorted[1].full_name?.charAt(0) || 'U'}</div>
                                  <div className={`bg-zinc-200 dark:bg-zinc-800 w-24 h-24 rounded-t-2xl flex flex-col items-center justify-start pt-3 border-t-4 border-zinc-400`}>
                                      <span className={`text-xl font-black text-zinc-500`}>2</span>
                                      <span className={`text-[10px] font-bold mt-1 text-zinc-500`}>{sorted[1].xp} XP</span>
                                  </div>
                                  <p className={`text-[10px] font-black uppercase mt-2 text-zinc-500 truncate max-w-[80px]`}>{sorted[1].full_name?.split(' ')[0]}</p>
                              </div>
                          )}
                          <div className="flex flex-col items-center">
                              <div className={`w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center font-black text-2xl mb-2 border-4 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.4)] text-yellow-900`}>{sorted[0].full_name?.charAt(0) || 'U'}</div>
                              <div className={`bg-gradient-to-t from-yellow-500/20 to-yellow-500/40 w-28 h-32 rounded-t-2xl flex flex-col items-center justify-start pt-3 border-t-4 border-yellow-400`}>
                                  <span className="text-2xl font-black text-yellow-500">1</span>
                                  <span className="text-xs font-black mt-1 text-yellow-500">{sorted[0].xp} XP</span>
                              </div>
                              <p className={`text-[10px] font-black uppercase mt-2 text-yellow-500 truncate max-w-[80px]`}>{sorted[0].full_name?.split(' ')[0]}</p>
                          </div>
                          {sorted.length > 2 && (
                              <div className="flex flex-col items-center">
                                  <div className={`w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center font-black text-white mb-2 border-2`}>{sorted[2].full_name?.charAt(0) || 'U'}</div>
                                  <div className={`bg-orange-50 dark:bg-orange-900/50 w-24 h-20 rounded-t-2xl flex flex-col items-center justify-start pt-3 border-t-4 border-orange-500`}>
                                      <span className={`text-xl font-black text-orange-500`}>3</span>
                                      <span className={`text-[10px] font-bold mt-1 text-orange-500`}>{sorted[2].xp} XP</span>
                                  </div>
                                  <p className={`text-[10px] font-black uppercase mt-2 text-orange-500 truncate max-w-[80px]`}>{sorted[2].full_name?.split(' ')[0]}</p>
                              </div>
                          )}
                       </>
                    );
                 })()}
              </div>

              <div className="space-y-3">
                 {[...students].sort((a,b) => (b.xp || 0) - (a.xp || 0)).slice(3, 10).map((s, i) => (
                    <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                       <div className="flex items-center gap-4">
                          <span className="font-black text-zinc-500 w-4">{i + 4}</span>
                          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500">{s.full_name?.charAt(0) || 'U'}</div>
                          <p className="font-bold text-sm">{s.full_name}</p>
                       </div>
                       <span className="font-black text-[#39FF14] bg-black px-3 py-1 rounded-lg text-xs">{s.xp} XP</span>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </main>

      {/* MODALE D'ÉDITION APPRENANT */}
      {editingStudent && (
          <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setEditingStudent(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className={`bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative animate-in zoom-in-95`}>
               <button onClick={() => setEditingStudent(null)} className={`absolute top-6 right-6 ${theme.textMuted} hover:${theme.text} transition-colors`}><X size={20}/></button>
               <h3 className="text-xl font-black uppercase mb-6">Gérer l'apprenant</h3>
               <form onSubmit={handleSaveStudent} className="space-y-4">
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Nom Complet</label>
                     <input type="text" value={editingStudent.full_name} onChange={e => setEditingStudent({...editingStudent, full_name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14]" />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Téléphone</label>
                     <input type="text" value={editingStudent.phone} onChange={e => setEditingStudent({...editingStudent, phone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14]" />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Statut du Compte</label>
                     <select value={editingStudent.status || 'Actif'} onChange={e => setEditingStudent({...editingStudent, status: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14] appearance-none cursor-pointer">
                        <option value="Actif">Actif</option>
                        <option value="Suspendu">Suspendu</option>
                     </select>
                  </div>
                  {top3StudentIds.includes(editingStudent.id) && (
                     <button type="button" onClick={() => {
                         const msg = `🎓 Félicitations ${editingStudent.full_name} !\n\nVous faites partie de l'Élite (Top 3) de l'Onyx Academy avec ${editingStudent.xp} XP ! 🌟\n\nVoici votre certificat d'excellence en pièce jointe (PDF).\nContinuez d'exceller !`;
                         const phone = editingStudent.phone.replace(/[^0-9]/g, '');
                         const finalPhone = phone.startsWith('221') ? phone : `221${phone}`;
                         window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                     }} className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-yellow-400 transition-colors flex justify-center items-center gap-2 mt-4 shadow-lg">
                        <Award size={16}/> Envoyer Certificat Elite (WhatsApp)
                     </button>
                  )}
                  <button type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-white transition-colors flex justify-center items-center gap-2 mt-4 shadow-lg"><Save size={16}/> Mettre à jour</button>
               </form>
            </div>
          </div>
      )}

      {/* MODALE D'ÉDITION COURS */}
      {editingCourseInfo && (
          <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setEditingCourseInfo(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className={`bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in-95`}>
               <button onClick={() => setEditingCourseInfo(null)} className={`absolute top-6 right-6 ${theme.textMuted} hover:${theme.text} transition-colors`}><X size={20}/></button>
               <h3 className="text-xl font-black uppercase mb-6 text-white flex items-center gap-2"><BookOpen size={20} className="text-[#39FF14]"/> Gérer le Cours</h3>
               <div className="space-y-4">
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Titre du Cours</label>
                     <input type="text" value={editingCourseInfo.title} onChange={e => setEditingCourseInfo({...editingCourseInfo, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14]" placeholder="Ex: Le Protocole Andromeda" />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Description</label>
                     <textarea value={editingCourseInfo.description} onChange={e => setEditingCourseInfo({...editingCourseInfo, description: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-medium text-white outline-none focus:border-[#39FF14] resize-none h-24" placeholder="Ce cours vous apprendra..." />
                  </div>
                  <button onClick={() => {
                      let newFormations = [...formations];
                      if(formations.find(f => f.id === editingCourseInfo.id)) {
                          newFormations = formations.map(f => f.id === editingCourseInfo.id ? editingCourseInfo : f);
                      } else {
                          newFormations.push(editingCourseInfo);
                      }
                      saveFormationsToLocal(newFormations);
                      setEditingCourseInfo(null);
                  }} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-white transition-colors flex justify-center items-center gap-2 mt-4 shadow-lg"><Save size={16}/> Enregistrer le Cours</button>
               </div>
            </div>
          </div>
      )}

      {/* MODALE D'ÉDITION MODULE */}
      {editingModule && (
          <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setEditingModule(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className={`bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in-95`}>
               <button onClick={() => setEditingModule(null)} className={`absolute top-6 right-6 ${theme.textMuted} hover:${theme.text} transition-colors`}><X size={20}/></button>
               <h3 className="text-xl font-black uppercase mb-6 text-white flex items-center gap-2"><PlayCircle size={20} className="text-[#39FF14]"/> Éditer Module</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                         <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Titre de la leçon</label>
                         <input type="text" value={editingModule.title} onChange={e => setEditingModule({...editingModule, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14]" placeholder="Ex: Le Hook parfait" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Ordre</label>
                         <input type="number" value={editingModule.order} onChange={e => setEditingModule({...editingModule, order: parseInt(e.target.value) || 1})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14] text-center" />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Durée</label>
                         <input type="text" value={editingModule.duration} onChange={e => setEditingModule({...editingModule, duration: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14]" placeholder="Ex: 15 min" />
                      </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">URL Vidéo (YouTube Embed)</label>
                     <input type="url" value={editingModule.video_url} onChange={e => setEditingModule({...editingModule, video_url: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14]" placeholder="https://www.youtube.com/embed/..." />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">URL du PDF (Support de cours)</label>
                     <input type="url" value={editingModule.pdf_url || ''} onChange={e => setEditingModule({...editingModule, pdf_url: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-[#39FF14]" placeholder="https://..." />
                  </div>
                  <button onClick={() => {
                      if(!editingModule.title) return alert("Le titre est requis.");
                      const updatedModules = selectedFormation.modules ? [...selectedFormation.modules] : [];
                      const idx = updatedModules.findIndex((m:any) => m.id === editingModule.id);
                      if(idx > -1) {
                          updatedModules[idx] = editingModule;
                      } else {
                          updatedModules.push(editingModule);
                      }
                      const updatedFormation = { ...selectedFormation, modules: updatedModules };
                      setSelectedFormation(updatedFormation);
                      saveFormationsToLocal(formations.map(f => f.id === updatedFormation.id ? updatedFormation : f));
                      setEditingModule(null);
                  }} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-white transition-colors flex justify-center items-center gap-2 mt-4 shadow-lg"><Save size={16}/> Enregistrer la Leçon</button>
               </div>
            </div>
          </div>
      )}
    </div>
  );
}