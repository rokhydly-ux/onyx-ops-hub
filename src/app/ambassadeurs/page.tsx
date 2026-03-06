"use client"; // <--- TOUJOURS EN PREMIER

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  PlayCircle, BookOpen, FileText, ChevronRight, 
  LogOut, Shield, Download, CheckCircle, Star 
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TYPES ---
type Course = { id: string; title: string; description: string; video_url: string; duration: string; order: number; };
type Resource = { id: string; title: string; type: string; url: string; };

const DEFAULT_COURSES: Course[] = [
  { id: "1", title: "Introduction au Marketing Digital", description: "Les bases du marketing en Afrique", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15 min", order: 1 },
  { id: "2", title: "Publicité Facebook & TikTok", description: "Créer des campagnes efficaces", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "22 min", order: 2 },
  { id: "3", title: "Design avec Canva", description: "Maîtriser les visuels pour vos posts", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18 min", order: 3 },
];

export default function OnyxFormationPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cours" | "ressources">("cours");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(DEFAULT_COURSES[0]);
  const [showCertificate, setShowCertificate] = useState(false);

  // 1. CHARGEMENT SESSION LOCALE
  useEffect(() => {
    const saved = localStorage.getItem("onyx_client_session");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  // 2. CONNEXION MANUELLE (Table clients)
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
    } else {
      alert("Identifiants incorrects. Utilisez votre numéro et le mot de passe fourni par l'admin.");
    }
    setAuthLoading(false);
  };

  const markComplete = (courseId: string) => {
    setProgress((prev) => ({ ...prev, [courseId]: 100 }));
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
          <button onClick={() => { localStorage.removeItem("onyx_client_session"); window.location.reload(); }} className="p-3 bg-zinc-100 rounded-full text-zinc-400 hover:text-red-500 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        {/* SECTION CERTIFICAT SI 100% */}
        {totalProgress === 100 && (
          <div className="mb-12 p-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"><Shield size={32}/></div>
               <div>
                  <h3 className="text-2xl font-black uppercase italic">Félicitations !</h3>
                  <p className="text-sm opacity-80 font-bold uppercase tracking-widest">Vous avez validé l'ensemble de vos modules.</p>
               </div>
            </div>
            <button 
              onClick={() => setShowCertificate(true)}
              className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-black uppercase text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
            >
              <Download size={18}/> Télécharger mon Certificat
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
             <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4 pl-4">Liste des Modules</h3>
            {DEFAULT_COURSES.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCourse(c)}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedCourse?.id === c.id ? "bg-white border-purple-600 shadow-xl" : "bg-white border-transparent hover:border-zinc-200"}`}
              >
                <div className="flex items-start justify-between">
                   <div>
                      <p className={`text-[10px] font-black uppercase mb-1 ${progress[c.id] === 100 ? "text-green-500" : "text-purple-600"}`}>
                        {progress[c.id] === 100 ? "✓ Terminé" : `Module 0${c.id}`}
                      </p>
                      <h4 className="font-black text-sm uppercase leading-tight">{c.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold mt-2 uppercase">{c.duration}</p>
                   </div>
                   {progress[c.id] === 100 && <CheckCircle className="text-green-500" size={18}/>}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedCourse && (
              <div className="bg-white rounded-[3rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="aspect-video bg-black">
                  <iframe src={selectedCourse.video_url} className="w-full h-full" allowFullScreen />
                </div>
                <div className="p-10">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedCourse.title}</h2>
                  <p className="text-zinc-500 mt-4 leading-relaxed font-medium">{selectedCourse.description}</p>
                  
                  <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={() => markComplete(selectedCourse.id)} className="w-full sm:w-auto bg-purple-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs hover:bg-black transition-all">
                      Marquer comme terminé
                    </button>
                    <button className="w-full sm:w-auto border-2 border-zinc-100 text-zinc-400 px-10 py-5 rounded-2xl font-black uppercase text-xs">
                      Télécharger les notes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER RÉCUPÉRÉ */}
      <footer className="bg-white border-t border-zinc-100 py-12 px-6 mt-20 text-center">
         <h2 className="font-black text-2xl tracking-tighter uppercase mb-2">ONYX<span className="text-[#39FF14]">OPS</span></h2>
         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
            Ecosystème Tech & Marketing • Sénégal<br/>
            © 2026 Onyx Ops Terminal v2.4
         </p>
      </footer>

      {/* MODALE CERTIFICAT IMPRIMABLE */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <div className="bg-white p-12 border-[20px] border-zinc-100 shadow-2xl max-w-4xl w-full text-center relative print:m-0 print:border-0" id="certificate-print">
            <button onClick={() => setShowCertificate(false)} className="absolute top-4 right-4 text-zinc-300 hover:text-black print:hidden"><LogOut/></button>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-12"><Shield size={500}/></div>
            <h1 className="font-black text-4xl uppercase tracking-[0.3em] mb-4">Certificat de Réussite</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-12">Onyx Academy • Dakar Hub</p>
            <p className="text-zinc-500 italic mb-2">Ce document officiel atteste que</p>
            <h2 className="text-4xl font-black uppercase text-black mb-8 underline decoration-purple-600 underline-offset-8">
              {user?.full_name}
            </h2>
            <p className="text-zinc-600 max-w-md mx-auto leading-relaxed mb-12">
              A validé avec succès l'ensemble des modules de la formation 
              <span className="font-black"> MARKETING DIGITAL & ADS (FB/TIKTOK)</span>.
            </p>
            <div className="flex justify-between items-end mt-20 text-left">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400">Date</p>
                <p className="font-bold text-sm">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Signature</p>
                <div className="font-serif italic text-2xl text-black">Coach OnyxFormation</div>
                <div className="w-32 h-0.5 bg-black ml-auto mt-1"></div>
              </div>
            </div>
            <button onClick={() => window.print()} className="mt-12 bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] print:hidden">Imprimer le certificat</button>
          </div>
        </div>
      )}
    </div>
  );
}