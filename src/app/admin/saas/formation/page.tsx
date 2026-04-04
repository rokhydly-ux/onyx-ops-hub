"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, BookOpen, Users, PlayCircle, TrendingUp, 
  Search, Filter, CheckCircle, Clock, MoreVertical, 
  Sun, Moon, Award, GraduationCap, X
} from 'lucide-react';

// Mock Data pour les apprenants (Clients Onyx Formation)
const MOCK_STUDENTS = [
  { id: 1, name: "Aïssatou Diop", shop: "Boutique Ndeye", progress: 85, last_module: "Meta Ads Avancé", status: "Actif" },
  { id: 2, name: "Modou Fall", shop: "Modou Tech", progress: 100, last_module: "Certifié", status: "Terminé" },
  { id: 3, name: "Fatou Sow", shop: "Salon Faty", progress: 12, last_module: "Bases WhatsApp", status: "Inactif" },
  { id: 4, name: "Cheikh Ndiaye", shop: "Auto SN", progress: 45, last_module: "Visuels Canva", status: "Actif" },
];

export default function OnyxFormationAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'students' | 'courses'>('students');
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState<any>(null);

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
            <p className="text-3xl font-black">342</p>
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
                <button className={`p-2.5 ${theme.inputBg} border ${theme.cardBorder} rounded-xl hover:border-[#39FF14] transition-colors`}>
                  <Filter size={18} className={theme.textSub} />
                </button>
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
                    {MOCK_STUDENTS.map((student) => (
                      <tr key={student.id} onClick={() => setEditingStudent(student)} className={`${theme.hoverBg} transition-colors cursor-pointer group`}>
                        <td className="p-5">
                          <p className="font-black text-sm">{student.name}</p>
                          <p className={`text-[10px] font-bold ${theme.textSub}`}>{student.shop}</p>
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
                            <BookOpen size={14} className={student.progress === 100 ? "text-[#39FF14]" : "text-blue-500"}/>
                            {student.last_module}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`text-[10px] font-black uppercase flex items-center gap-1 w-max px-2 py-1 rounded-md ${
                            student.status === 'Terminé' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 
                            student.status === 'Actif' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {student.status === 'Terminé' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                            {student.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button className={`${theme.textMuted} group-hover:text-[#39FF14] p-2 transition-colors`}>
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Catalogue <span className="text-[#39FF14]">Formations</span></h2>
              <button className="bg-[#39FF14] text-black px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-white transition-colors shadow-lg">
                + Ajouter un Module
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Module 1 */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl transition-colors hover:border-[#39FF14]`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                    <PlayCircle size={24} />
                  </div>
                  <span className="bg-[#39FF14]/10 text-[#39FF14] px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Le plus suivi</span>
                </div>
                <h3 className="font-black text-lg uppercase mb-2">Maîtriser Meta Ads (2026)</h3>
                <p className={`text-sm font-medium ${theme.textSub} mb-4 line-clamp-2`}>
                  Apprenez à lancer des campagnes Facebook et Instagram rentables pour le marché africain.
                </p>
                <div className={`flex items-center justify-between pt-4 border-t ${theme.cardBorder}`}>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Durée totale</span>
                    <span className="font-bold">2h 45m (12 Vidéos)</span>
                  </div>
                  <button className={`text-xs font-black uppercase ${theme.textMuted} hover:text-[#39FF14] transition-colors`}>Éditer</button>
                </div>
              </div>

              {/* Module 2 */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl transition-colors hover:border-[#39FF14]`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                    <BookOpen size={24} />
                  </div>
                </div>
                <h3 className="font-black text-lg uppercase mb-2">Copywriting WhatsApp</h3>
                <p className={`text-sm font-medium ${theme.textSub} mb-4 line-clamp-2`}>
                  Techniques de persuasion pour transformer un prospect WhatsApp en client payant sans forcer.
                </p>
                <div className={`flex items-center justify-between pt-4 border-t ${theme.cardBorder}`}>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Durée totale</span>
                    <span className="font-bold">1h 20m (8 Vidéos)</span>
                  </div>
                  <button className={`text-xs font-black uppercase ${theme.textMuted} hover:text-[#39FF14] transition-colors`}>Éditer</button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* MODALE D'ÉDITION APPRENANT */}
      {editingStudent && (
          <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setEditingStudent(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95`}>
               <button onClick={() => setEditingStudent(null)} className={`absolute top-6 right-6 ${theme.textMuted} hover:${theme.text} transition-colors`}><X size={20}/></button>
               <h3 className="text-xl font-black uppercase mb-6">Gérer l'apprenant</h3>
               <p className="font-bold mb-4 text-lg">{editingStudent.name} <span className="text-xs font-normal text-zinc-500">({editingStudent.shop})</span></p>
               <div className="space-y-3">
                  <button onClick={() => { alert("L'accès de cet apprenant a été mis en pause."); setEditingStudent(null); }} className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-bold text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Mettre en pause l'accès</button>
                  <button onClick={() => { alert("Certificat généré avec succès !"); setEditingStudent(null); }} className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-bold text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Générer Certificat (PDF)</button>
                  <button onClick={() => { alert("L'apprenant a été supprimé."); setEditingStudent(null); }} className="w-full p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold text-left hover:bg-red-100 dark:hover:bg-red-500/20 transition">Retirer de la formation</button>
               </div>
            </div>
          </div>
      )}
    </div>
  );
}