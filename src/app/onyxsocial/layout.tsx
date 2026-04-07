import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Users, BarChart2, Wand2, Calendar } from 'lucide-react';

export default function OnyxSocialLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex font-sans selection:bg-[#39FF14]/30">
      {/* SIDEBAR TECHNIQUE */}
      <aside className="w-64 border-r border-zinc-800/50 bg-[#0a0a0a] p-6 flex flex-col gap-8 shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20">
        <div className="text-2xl font-black tracking-tighter text-[#39FF14]">
          ONYX<span className="text-white">SOCIAL</span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-1">AI Factory v1.0</p>
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/onyxsocial" className="hover:bg-zinc-900/50 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3 text-sm font-bold group">
            <Home size={18} className="text-zinc-500 group-hover:text-[#39FF14] transition-colors" /> Accueil
          </Link>
          <Link href="/onyxsocial/clients" className="hover:bg-zinc-900/50 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3 text-sm font-bold group">
            <Users size={18} className="text-zinc-500 group-hover:text-[#39FF14] transition-colors" /> Mes Clients
          </Link>
          <Link href="/onyxsocial/analytics" className="hover:bg-zinc-900/50 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3 text-sm font-bold group">
            <BarChart2 size={18} className="text-zinc-500 group-hover:text-[#39FF14] transition-colors" /> Analyse
          </Link>
          <Link href="/onyxsocial/generator" className="hover:bg-zinc-900/50 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3 text-sm font-bold group">
            <Wand2 size={18} className="text-zinc-500 group-hover:text-[#39FF14] transition-colors" /> Mixeur IA
          </Link>
          <Link href="/onyxsocial/calendar" className="hover:bg-zinc-900/50 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3 text-sm font-bold group">
            <Calendar size={18} className="text-zinc-500 group-hover:text-[#39FF14] transition-colors" /> Calendrier
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800/50">
          <Link href="/hub" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
            ← Retour au Hub
          </Link>
        </div>
      </aside>

      {/* ZONE DE TRAVAIL */}
      <main className="flex-1 p-8 overflow-y-auto bg-[#050505] relative custom-scrollbar">
        <div className="absolute top-0 left-0 w-full h-96 bg-[#39FF14]/5 blur-[120px] pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}