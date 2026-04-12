"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  PlayCircle, BookOpen, FileText, ChevronRight, 
  LogOut, Shield, Download, CheckCircle, Star, X, Save, Edit3, ArrowLeft 
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TYPES ---
type Course = { id: string; title: string; description: string; video_url: string; duration: string; order: number; };

const DEFAULT_COURSES: Course[] = [
  { id: "1", title: "Le Protocole Andromeda (Structure)", description: "Les bases du marketing en Afrique. Comprendre son audience et structurer son offre.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18 min", order: 1 },
  { id: "2", title: "La Créa comme Ciblage (Hook & Filtrage)", description: "Créer des campagnes publicitaires rentables sans exploser son budget.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "24 min", order: 2 },
  { id: "3", title: "Conversion WhatsApp & Bot", description: "Maîtriser la création visuelle pour vos réseaux sociaux et vos offres.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15 min", order: 3 },
  { id: "4", title: "Scaling : Multiplier le budget sans crash", description: "Maîtriser l'augmentation du budget publicitaire de façon sereine.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "20 min", order: 4 },
];

export default function OnyxFormationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Dashboard states
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(DEFAULT_COURSES[0]);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Notes states
  const [courseNotes, setCourseNotes] = useState<Record<string, string>>({});
  
  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ full_name: "", phone: "", avatar_url: "" });

  // --- MESSAGE DYNAMIQUE POUR LIKA ---
  const getLikaMessage = (courseId: string) => {
    switch(courseId) {
      case "1": return "Salut ! Je suis Lika, ta Stratège. Prêt à dompter l'algorithme ? On pose les bases solides ici !";
      case "2": return "Ton hook doit stopper le scroll direct ! Concentre-toi sur les 3 premières secondes.";
      case "3": return "C'est ici qu'on transforme les clics en cash. Optimise tes réponses !";
      case "4": return "Ici la Stratège. On accélère ! Augmente le budget sans casser ton coût par acquisition.";
      default: return "Note tes meilleures idées ici, je veille au grain !";
    }
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
          setUser(JSON.parse(customSession));
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [router]);
  
  const logout = async () => {
    localStorage.removeItem('onyx_custom_session');
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    if(user) {
        setEditProfileForm({
            full_name: user.full_name || "",
            phone: user.phone || "",
            avatar_url: user.avatar_url || ""
          });
    }
    // Load local data
    const savedProgress = localStorage.getItem("onyx_course_progress");
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    
    const savedNotes = localStorage.getItem("onyx_course_notes");
    if (savedNotes) setCourseNotes(JSON.parse(savedNotes));
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const { error } = await supabase.from('clients').update({
        full_name: editProfileForm.full_name,
        phone: editProfileForm.phone,
        avatar_url: editProfileForm.avatar_url,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...editProfileForm };
      setUser(updatedUser);
      
      const customSession = localStorage.getItem('onyx_custom_session');
      if (customSession) {
          localStorage.setItem('onyx_custom_session', JSON.stringify(updatedUser));
      }

      setShowProfileModal(false);
      alert("Profil mis à jour avec succès !");
    } catch (err: any) {
      alert("Erreur lors de la mise à jour : " + (err.message || err));
    }
  };

  const toggleComplete = (courseId: string) => {
    const newProgress = { ...progress, [courseId]: progress[courseId] === 100 ? 0 : 100 };
    setProgress(newProgress);
    localStorage.setItem("onyx_course_progress", JSON.stringify(newProgress));
  };

  const saveNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedCourse) return;
    const newNotes = { ...courseNotes, [selectedCourse.id]: e.target.value };
    setCourseNotes(newNotes);
    localStorage.setItem("onyx_course_notes", JSON.stringify(newNotes));
  };

  const totalProgress = Math.round(DEFAULT_COURSES.reduce((acc, c) => acc + (progress[c.id] || 0), 0) / DEFAULT_COURSES.length);

  if (loading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#39FF14]" /></div>;
  }

  // --- VUE DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      <header className="bg-zinc-950 border-b border-zinc-800 px-8 py-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/hub')} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors font-black uppercase text-xs tracking-widest bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
            <ArrowLeft size={16}/> Retour Hub
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic hidden md:block">ONYX<span className="text-[#39FF14]">FORMATION</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-zinc-500">Progression</p>
            <div className="flex items-center gap-2">
               <div className="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-[#39FF14] transition-all shadow-[0_0_10px_#39FF14]" style={{ width: `${totalProgress}%` }}></div>
               </div>
               <p className="text-sm font-black text-[#39FF14]">{totalProgress}%</p>
            </div>
          </div>

          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowProfileModal(true)}>
            <img src={user?.avatar_url || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover border-2 border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.3)] bg-zinc-800" alt="Profil" />
            <span className="font-black uppercase text-xs hidden md:block text-white">{user?.full_name}</span>
          </div>

          <button onClick={logout} className="p-3 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-500 hover:border-red-500/50 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        {/* SECTION CERTIFICAT SI 100% */}
        {totalProgress === 100 && (
          <div className="mb-12 p-8 bg-zinc-900 border border-[#39FF14]/30 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(57,255,20,0.1)] animate-in slide-in-from-top-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
               <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center border border-[#39FF14]/50"><Shield className="text-[#39FF14]" size={32}/></div>
               <div>
                  <h3 className="text-2xl font-black uppercase italic text-white">Félicitations !</h3>
                  <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Vous avez validé l'ensemble de vos modules.</p>
               </div>
            </div>
            <button onClick={() => setShowCertificate(true)} className="px-8 py-4 bg-[#39FF14] text-black rounded-2xl font-black uppercase text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl relative z-10">
              <Download size={18}/> Télécharger mon Certificat
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* COLONNE GAUCHE : LISTE DES MODULES */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4 pl-4">Programme de la formation</h3>
            {DEFAULT_COURSES.map((c) => (
              <div key={c.id} onClick={() => setSelectedCourse(c)} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedCourse?.id === c.id ? "bg-black border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.15)] scale-[1.02]" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"}`}>
                <div className="flex items-start justify-between">
                   <div>
                      <p className={`text-[10px] font-black uppercase mb-1 ${progress[c.id] === 100 ? "text-green-500" : "text-[#39FF14]"}`}>
                        {progress[c.id] === 100 ? "✓ Terminé" : `Module 0${c.order}`}
                      </p>
                      <h4 className="font-black text-sm uppercase leading-tight text-white">{c.title}</h4>
                      <p className="text-[10px] text-zinc-500 font-bold mt-2 uppercase">{c.duration}</p>
                   </div>
                   {progress[c.id] === 100 && <CheckCircle className="text-green-500 flex-shrink-0" size={18}/>}
                </div>
              </div>
            ))}
          </div>

          {/* COLONNE DROITE : LECTEUR VIDEO ET NOTES */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {selectedCourse && (
              <>
                <div className="bg-zinc-950 rounded-[3rem] border border-zinc-800 overflow-hidden shadow-sm animate-in fade-in">
                  <div className="aspect-video bg-black relative border-b border-zinc-800">
                    <iframe src={selectedCourse.video_url} className="absolute inset-0 w-full h-full" allowFullScreen title={selectedCourse.title} />
                  </div>
                  <div className="p-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{selectedCourse.title}</h2>
                    <p className="text-zinc-400 mt-4 leading-relaxed font-medium">{selectedCourse.description}</p>
                    
                    <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 border-t border-zinc-800 pt-8">
                      <button onClick={() => toggleComplete(selectedCourse.id)} className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 ${progress[selectedCourse.id] === 100 ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30" : "bg-[#39FF14] text-black hover:bg-white shadow-[0_0_15px_rgba(57,255,20,0.3)]"}`}>
                        <CheckCircle size={16} /> 
                        {progress[selectedCourse.id] === 100 ? "Marqué comme terminé (Annuler)" : "Valider ce module"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* BLOC NOTES INTÉGRÉ */}
                <div className="bg-zinc-950 rounded-[3rem] border border-zinc-800 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="bg-[#39FF14]/10 text-[#39FF14] p-2 rounded-xl border border-[#39FF14]/20"><Edit3 size={18}/></div>
                     <h3 className="font-black uppercase tracking-tighter text-lg text-white">Mes Notes Personnelles</h3>
                  </div>
                  
                  {/* MASCOTTE LIKA */}
                  <div className="flex items-start gap-4 mb-6">
                    <img src="https://i.ibb.co/B5HhnTjw/La-mascotte-LIKA-202604121725.jpg" alt="Lika - La Stratège" className="w-12 h-12 rounded-full border-2 border-[#39FF14] object-cover shrink-0 bg-black mix-blend-screen shadow-[0_0_10px_rgba(57,255,20,0.2)]" />
                    <div className="bg-zinc-900 border border-zinc-800 text-zinc-300 p-4 rounded-2xl rounded-tl-none text-sm font-medium shadow-sm relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-zinc-900 border-l border-t border-zinc-800 transform -skew-x-12 z-0"></div>
                      <span className="relative z-10">{getLikaMessage(selectedCourse.id)}</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                     <p className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest absolute right-4 top-4">Sauvegarde auto</p>
                     <textarea 
                       value={courseNotes[selectedCourse.id] || ""} 
                       onChange={saveNote}
                       placeholder="Notez ici les idées clés, stratégies à appliquer, outils mentionnés..." 
                       className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 pt-10 font-medium text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] transition-all resize-none placeholder:text-zinc-600"
                     />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black border-t border-zinc-900 py-12 px-6 mt-20 text-center">
         <h2 className="font-black text-2xl tracking-tighter uppercase mb-2 text-white">ONYX<span className="text-[#39FF14]">OPS</span></h2>
         <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
            Onyx Hub - Academy<br/>
            © 2026 Onyx Ops Terminal v2.4
         </p>
      </footer>

      {/* MODALE CERTIFICAT IMPRIMABLE */}
      {showCertificate && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white p-12 border-[20px] border-zinc-100 shadow-2xl max-w-4xl w-full text-center relative print:m-0 print:border-0 print:shadow-none animate-in zoom-in" id="certificate-print">
            <button onClick={() => setShowCertificate(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-black print:hidden transition-colors bg-zinc-100 p-2 rounded-full"><X size={20}/></button>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-12 pointer-events-none"><Shield size={500}/></div>
            
            <h1 className="font-black text-4xl md:text-5xl uppercase tracking-[0.2em] mb-4 text-zinc-900 mt-8">Certificat de Réussite</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-16">Onyx Hub - Academy</p>
            
            <p className="text-zinc-500 italic mb-4 text-lg">Ce document officiel atteste que</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-black mb-10 underline decoration-[#39FF14] underline-offset-8">
              {user?.full_name}
            </h2>
            
            <p className="text-zinc-600 max-w-xl mx-auto leading-relaxed mb-16 text-lg font-medium">
              A validé avec succès l'ensemble des modules d'apprentissage intensif de la formation 
              <span className="font-black text-black"> MARKETING DIGITAL & ADS EXPERT</span>.
            </p>
            
            <div className="flex justify-between items-end mt-20 text-left border-t-2 border-zinc-100 pt-10">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Délivré le</p>
                <p className="font-black text-sm text-zinc-800">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Signature Officielle</p>
                <div className="font-serif italic text-3xl text-zinc-900 pr-4">Onyx Academy</div>
                <div className="w-48 h-0.5 bg-black mt-2"></div>
              </div>
            </div>
            
            <button onClick={() => window.print()} className="mt-16 bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs print:hidden hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg">
               <Download size={16}/> Imprimer / PDF
            </button>
          </div>
        </div>
      )}

      {/* MODALE DE PROFIL */}
      {showProfileModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowProfileModal(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-950 p-8 sm:p-12 rounded-[3.5rem] max-w-md w-full relative shadow-[0_0_50px_rgba(57,255,20,0.1)] border-t-[12px] border-[#39FF14] animate-in zoom-in-95 my-auto">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-900 rounded-full hover:bg-black hover:text-[#39FF14] transition-all text-zinc-400">
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
               <div className="w-24 h-24 mx-auto mb-4 relative">
                  <img src={editProfileForm.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)] bg-zinc-800" />
               </div>
               <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Mon Profil</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Espace Onyx Academy</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Nom Complet</label>
                <input type="text" required value={editProfileForm.full_name} onChange={e => setEditProfileForm({...editProfileForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] font-bold text-sm text-white uppercase outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Numéro WhatsApp</label>
                <input type="tel" required value={editProfileForm.phone} onChange={e => setEditProfileForm({...editProfileForm, phone: e.target.value})} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] font-bold text-sm text-white outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Photo de profil (URL)</label>
                <input type="url" value={editProfileForm.avatar_url} onChange={e => setEditProfileForm({...editProfileForm, avatar_url: e.target.value})} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] font-bold text-sm text-white outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] transition-all placeholder:text-zinc-600" placeholder="https://..." />
              </div>

              <button type="submit" className="w-full mt-6 bg-[#39FF14] text-black py-5 rounded-[2rem] font-black uppercase text-xs hover:bg-white transition-all shadow-[0_10px_30px_rgba(57,255,20,0.3)] flex justify-center items-center gap-2">
                <Save size={18} /> Sauvegarder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
