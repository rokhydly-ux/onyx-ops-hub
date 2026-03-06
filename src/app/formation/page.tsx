"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { PlayCircle, BookOpen, FileText, ChevronRight, LogOut } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Course = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration: string;
  order: number;
};

type Resource = {
  id: string;
  title: string;
  type: string;
  url: string;
};

const DEFAULT_COURSES: Course[] = [
  { id: "1", title: "Introduction au Marketing Digital", description: "Les bases du marketing en Afrique", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15 min", order: 1 },
  { id: "2", title: "Publicité Facebook & TikTok", description: "Créer des campagnes efficaces", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "22 min", order: 2 },
  { id: "3", title: "Design avec Canva", description: "Maîtriser les visuels pour vos posts", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18 min", order: 3 },
];

const DEFAULT_RESOURCES: Resource[] = [
  { id: "r1", title: "Guide Facebook Ads", type: "PDF", url: "#" },
  { id: "r2", title: "Templates Canva Pro", type: "Lien", url: "#" },
  { id: "r3", title: "Scripts de vente WhatsApp", type: "PDF", url: "#" },
];

export default function OnyxFormationPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cours" | "ressources">("cours");
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [resources, setResources] = useState<Resource[]>(DEFAULT_RESOURCES);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      try {
        supabase.from("course_progress").select("*").eq("user_id", user.id).then(({ data }) => {
          if (data?.length) {
            const p: Record<string, number> = {};
            data.forEach((d: any) => { p[d.course_id] = d.progress ?? 0; });
            setProgress(p);
          }
        });
      } catch {}
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setAuthLoading(false);
  };

  const markComplete = (courseId: string) => {
    setProgress((prev) => ({ ...prev, [courseId]: 100 }));
    try {
      supabase.from("course_progress").upsert({ user_id: user?.id, course_id: courseId, progress: 100 });
    } catch {}
  };

  const totalProgress = courses.length ? Math.round(courses.reduce((acc, c) => acc + (progress[c.id] || 0), 0) / courses.length) : 0;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="w-12 h-12 border-4 border-black border-t-[#39FF14] rounded-full animate-spin" />
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
              <PlayCircle size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Onyx Formation</h1>
            <p className="text-sm text-zinc-500 mt-1">Cours vidéo & Marketing</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-purple-500" />
            <button type="submit" disabled={authLoading} className="w-full bg-purple-500 text-white py-4 rounded-xl font-black uppercase text-sm hover:scale-[1.02] transition disabled:opacity-50">
              {authLoading ? "Chargement..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black uppercase tracking-tighter">Onyx Formation</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-zinc-500">Progression globale</p>
            <p className="text-lg font-black text-purple-500">{totalProgress}%</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </header>

      <div className="flex border-b border-zinc-200 bg-white">
        <button onClick={() => setActiveTab("cours")} className={`flex-1 py-4 text-sm font-black uppercase flex items-center justify-center gap-2 ${activeTab === "cours" ? "bg-purple-500 text-white border-b-2 border-purple-600" : "text-zinc-500 hover:bg-zinc-50"}`}>
          <PlayCircle size={18} /> Cours
        </button>
        <button onClick={() => setActiveTab("ressources")} className={`flex-1 py-4 text-sm font-black uppercase flex items-center justify-center gap-2 ${activeTab === "ressources" ? "bg-purple-500 text-white border-b-2 border-purple-600" : "text-zinc-500 hover:bg-zinc-50"}`}>
          <FileText size={18} /> Ressources
        </button>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === "cours" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {courses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedCourse?.id === c.id ? "bg-purple-500 text-white border-purple-600 shadow-lg" : "bg-white border-zinc-200 hover:border-purple-500"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-black uppercase text-sm">{c.title}</p>
                      <p className={`text-xs mt-1 ${selectedCourse?.id === c.id ? "text-white/80" : "text-zinc-500"}`}>{c.duration}</p>
                      <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${progress[c.id] || 0}%` }} />
                      </div>
                    </div>
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              {selectedCourse ? (
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                  <div className="aspect-video bg-black relative">
                    <iframe src={selectedCourse.video_url.includes("embed") ? selectedCourse.video_url : `https://www.youtube.com/embed/${(selectedCourse.video_url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/) || [])[1] || ""}`} className="absolute inset-0 w-full h-full" allowFullScreen />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-black uppercase">{selectedCourse.title}</h2>
                    <p className="text-zinc-500 mt-2">{selectedCourse.description}</p>
                    <button onClick={() => markComplete(selectedCourse.id)} className="mt-6 flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-black uppercase text-sm hover:scale-105">
                      <PlayCircle size={18} /> Marquer comme terminé
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
                  <PlayCircle className="mx-auto text-zinc-300 mb-4" size={64} />
                  <p className="font-bold text-zinc-500">Sélectionnez un cours pour commencer</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "ressources" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="bg-white rounded-2xl border border-zinc-200 p-6 flex items-center gap-4 hover:border-purple-500 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500">
                  <FileText className="group-hover:text-white text-purple-500" size={24} />
                </div>
                <div>
                  <p className="font-black uppercase">{r.title}</p>
                  <p className="text-xs text-zinc-500">{r.type}</p>
                </div>
                <ChevronRight className="ml-auto text-zinc-300 group-hover:text-purple-500" size={20} />
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
