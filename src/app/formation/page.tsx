"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  PlayCircle, BookOpen, FileText, ChevronRight, 
  LogOut, Shield, Download, CheckCircle, Star, X, Save, Edit3 
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TYPES ---
type Course = { id: string; title: string; description: string; video_url: string; duration: string; order: number; };

const DEFAULT_COURSES: Course[] = [
  { id: "1", title: "Introduction au Marketing Digital", description: "Les bases du marketing en Afrique. Comprendre son audience et structurer son offre.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15 min", order: 1 },
  { id: "2", title: "Publicité Facebook & TikTok", description: "Créer des campagnes publicitaires rentables sans exploser son budget.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "22 min", order: 2 },
  { id: "3", title: "Design avec Canva", description: "Maîtriser la création visuelle pour vos réseaux sociaux et vos offres.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18 min", order: 3 },
];

export default function OnyxFormationPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  
  // Dashboard states
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(DEFAULT_COURSES[0]);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Notes states (Nouvelle feature)
  const [courseNotes, setCourseNotes] = useState<Record<string, string>>({});
  
  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ full_name: "", phone: "", avatar_url: "" });

  // 1. CHARGEMENT SESSION & DONNÉES LOCALES
  useEffect(() => {
    const saved = localStorage.getItem("onyx_client_session");
    if (saved) {
      const parsedUser = JSON.parse(saved);
      setUser(parsedUser);
      setEditProfileForm({
        full_name: parsedUser.full_name || "",
        phone: parsedUser.phone || "",
        avatar_url: parsedUser.avatar_url || ""
      });
    }
    
    // Charger progressions et notes
    const savedProgress = localStorage.getItem("onyx_course_progress");
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    
    const savedNotes = localStorage.getItem("onyx_course_notes");
    if (savedNotes) setCourseNotes(JSON.parse(savedNotes));
    
    setLoading(false);
  }, []);

  // 2. CONNEXION MANUELLE
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone.trim())
      .eq('password_temp', password.trim())
      .maybeSingle();

    if (data) {
      localStorage.setItem("onyx_client_session", JSON.stringify(data));
      setUser(data);
      setEditProfileForm({ full_name: data.full_name || "", phone: data.phone || "", avatar_url: data.avatar_url || "" });
    } else {
      alert("Identifiants incorrects. Utilisez votre numéro et le mot de passe fourni par l'admin.");
    }
    setAuthLoading(false);
  };

  // 3. MISE À JOUR DU PROFIL
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
      localStorage.setItem("onyx_client_session", JSON.stringify(updatedUser));
      setShowProfileModal(false);
      alert("Profil mis à jour avec succès !");
    } catch (err: any) {
      alert("Erreur lors de la mise à jour : " + (err.message || err));
    }
  };

  // 4. GESTION PROGRESSION & NOTES
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin" /></div>;

  // --- VUE LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 font-sans">
        <div className="w-full max-w-md bg-zinc-900 rounded-[3rem] border border-zinc-800 p-10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-purple-500/20">
              <PlayCircle size={32} />
            </div>
            <h1 className="text-3xl font-black uppercase text-white tracking-tighter italic">ONYX<span className="text-purple-500">FORMATION</span></h1>
            <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-widest">Accès Étudiant • Terminal 2026</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input type="tel" placeholder="NUMÉRO DE TÉLÉPHONE" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-5 bg-black border border-zinc-800 rounded-2xl font-bold text-white outline-none focus:border-purple-500 transition-all" />
            <input type="password" placeholder="MOT DE PASSE" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-5 bg-black border border-zinc-800 rounded-2xl font-bold text-white outline-none focus:border-purple-500 transition-all" />
            <button type="submit" disabled={authLoading} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black uppercase text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-900/20">
              {authLoading ? "Vérification..." : "Entrer dans l'académie"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VUE DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      <header className="bg-white border-b border-zinc-200 px-8 py-6 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">ONYX<span className="text-purple-600">FORMATION</span></h1>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-zinc-400">Progression</p>
            <div className="flex items-center gap-2">
               <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 transition-all" style={{ width: `${totalProgress}%` }}></div>
               </div>
               <p className="text-sm font-black text-purple-600">{totalProgress}%</p>
            </div>
          </div>

          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowProfileModal(true)}>
            <img src={user?.avatar_url || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover border-2 border-purple-600 shadow-sm" alt="Profil" />
            <span className="font-black uppercase text-xs hidden md:block text-zinc-800">{user?.full_name}</span>
          </div>

          <button onClick={() => { localStorage.removeItem("onyx_client_session"); window.location.reload(); }} className="p-3 bg-zinc-100 rounded-full text-zinc-400 hover:text-red-500 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        {/* SECTION CERTIFICAT SI 100% */}
        {totalProgress === 100 && (
          <div className="mb-12 p-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl animate-in slide-in-from-top-4">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"><Shield size={32}/></div>
               <div>
                  <h3 className="text-2xl font-black uppercase italic">Félicitations !</h3>
                  <p className="text-sm opacity-90 font-bold uppercase tracking-widest">Vous avez validé l'ensemble de vos modules.</p>
               </div>
            </div>
            <button onClick={() => setShowCertificate(true)} className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-black uppercase text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
              <Download size={18}/> Télécharger mon Certificat
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* COLONNE GAUCHE : LISTE DES MODULES */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4 pl-4">Programme de la formation</h3>
            {DEFAULT_COURSES.map((c) => (
              <div key={c.id} onClick={() => setSelectedCourse(c)} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedCourse?.id === c.id ? "bg-white border-purple-600 shadow-xl scale-[1.02]" : "bg-white border-transparent hover:border-zinc-200"}`}>
                <div className="flex items-start justify-between">
                   <div>
                      <p className={`text-[10px] font-black uppercase mb-1 ${progress[c.id] === 100 ? "text-green-500" : "text-purple-600"}`}>
                        {progress[c.id] === 100 ? "✓ Terminé" : `Module 0${c.order}`}
                      </p>
                      <h4 className="font-black text-sm uppercase leading-tight text-zinc-800">{c.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold mt-2 uppercase">{c.duration}</p>
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
                <div className="bg-white rounded-[3rem] border border-zinc-200 overflow-hidden shadow-sm animate-in fade-in">
                  <div className="aspect-video bg-black relative">
                    <iframe src={selectedCourse.video_url} className="absolute inset-0 w-full h-full" allowFullScreen title={selectedCourse.title} />
                  </div>
                  <div className="p-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">{selectedCourse.title}</h2>
                    <p className="text-zinc-500 mt-4 leading-relaxed font-medium">{selectedCourse.description}</p>
                    
                    <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 border-t border-zinc-100 pt-8">
                      <button onClick={() => toggleComplete(selectedCourse.id)} className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 ${progress[selectedCourse.id] === 100 ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" : "bg-purple-600 text-white hover:bg-black shadow-xl"}`}>
                        <CheckCircle size={16} /> 
                        {progress[selectedCourse.id] === 100 ? "Marqué comme terminé (Annuler)" : "Valider ce module"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* BLOC NOTES INTÉGRÉ */}
                <div className="bg-white rounded-[3rem] border border-zinc-200 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-amber-100 text-amber-600 p-2 rounded-xl"><Edit3 size={18}/></div>
                     <h3 className="font-black uppercase tracking-tighter text-lg text-zinc-800">Mes Notes Personnelles</h3>
                  </div>
                  <p className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">Sauvegardées automatiquement</p>
                  <textarea 
                    value={courseNotes[selectedCourse.id] || ""} 
                    onChange={saveNote}
                    placeholder="Notez ici les idées clés, stratégies à appliquer, outils mentionnés..." 
                    className="w-full h-40 bg-zinc-50 border border-zinc-200 rounded-[2rem] p-6 font-medium text-sm text-zinc-700 outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 transition-all resize-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-zinc-100 py-12 px-6 mt-20 text-center">
         <h2 className="font-black text-2xl tracking-tighter uppercase mb-2">ONYX<span className="text-purple-600">OPS</span></h2>
         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
            Ecosystème Tech & Marketing • Sénégal<br/>
            © 2026 Onyx Ops Terminal v2.4
         </p>
      </footer>

      {/* MODALE CERTIFICAT IMPRIMABLE */}
      {showCertificate && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white p-12 border-[20px] border-zinc-100 shadow-2xl max-w-4xl w-full text-center relative print:m-0 print:border-0 print:shadow-none animate-in zoom-in" id="certificate-print">
            <button onClick={() => setShowCertificate(false)} className="absolute top-4 right-4 text-zinc-300 hover:text-black print:hidden transition-colors bg-zinc-100 p-2 rounded-full"><X size={20}/></button>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-12 pointer-events-none"><Shield size={500}/></div>
            
            <h1 className="font-black text-4xl md:text-5xl uppercase tracking-[0.2em] mb-4 text-zinc-900 mt-8">Certificat de Réussite</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-16">Onyx Academy • Dakar Hub</p>
            
            <p className="text-zinc-500 italic mb-4 text-lg">Ce document officiel atteste que</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-black mb-10 underline decoration-purple-600 underline-offset-8">
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
                <div className="font-serif italic text-3xl text-purple-900 pr-4">Onyx Formation</div>
                <div className="w-48 h-0.5 bg-black mt-2"></div>
              </div>
            </div>
            
            <button onClick={() => window.print()} className="mt-16 bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs print:hidden hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto">
               <Download size={16}/> Imprimer / PDF
            </button>
          </div>
        </div>
      )}

      {/* MODALE DE PROFIL */}
      {showProfileModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowProfileModal(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] max-w-md w-full relative shadow-2xl border-t-[12px] border-purple-600 animate-in zoom-in-95 my-auto">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all">
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
               <div className="w-24 h-24 mx-auto mb-4 relative">
                  <img src={editProfileForm.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-purple-600 shadow-lg" />
               </div>
               <h3 className="text-2xl font-black uppercase text-black tracking-tighter">Mon Profil</h3>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Espace Onyx Formation</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Nom Complet</label>
                <input type="text" required value={editProfileForm.full_name} onChange={e => setEditProfileForm({...editProfileForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border-none rounded-[1.5rem] font-bold text-sm uppercase outline-none focus:ring-4 focus:ring-purple-600/10 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Numéro WhatsApp</label>
                <input type="tel" required value={editProfileForm.phone} onChange={e => setEditProfileForm({...editProfileForm, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-purple-600/10 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Photo de profil (URL)</label>
                <input type="url" value={editProfileForm.avatar_url} onChange={e => setEditProfileForm({...editProfileForm, avatar_url: e.target.value})} className="w-full p-4 bg-zinc-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-purple-600/10 transition-all placeholder:text-zinc-300" placeholder="https://..." />
              </div>

              <button type="submit" className="w-full mt-6 bg-black text-white py-5 rounded-[2rem] font-black uppercase text-xs hover:bg-purple-600 hover:text-white transition-all shadow-xl flex justify-center items-center gap-2">
                <Save size={18} /> Sauvegarder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}