"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Columns,
  FileText,
  Package,
  Users,
  ArrowLeft,
  Sun,
  Moon,
  UserCircle,
  Settings,
  Calendar,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from 'next-themes';

const NAV_LINKS = [
  { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
  { name: 'Leads Kanban', href: '/crm/leads', icon: Columns },
  { name: 'Agenda & RDV', href: '/crm/booking', icon: Calendar },
  { name: 'Studio PDF', href: '/crm/studio', icon: FileText },
  { name: 'Catalogue', href: '/crm/products', icon: Package },
  { name: 'Contacts', href: '/crm/contacts', icon: Users },
  { name: 'Paramètres', href: '/crm/settings', icon: Settings },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [crmSettings, setCrmSettings] = useState({ crm_name: 'ONYX CRM', logo_url: '', theme_color: '#39FF14' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCommercialProfile, setShowCommercialProfile] = useState(false);
  const [commercialProfileForm, setCommercialProfileForm] = useState({ avatar_url: '', password_temp: '' });

  useEffect(() => {
    setMounted(true);
    
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = user.user_metadata?.role || 'admin';
        const tenantId = user.user_metadata?.tenant_id || user.id;
        
        setUserRole(role);
        if (role === 'commercial') {
            const { data: comm } = await supabase.from('commercials').select('*').eq('id', user.id).single();
            if (comm) setCommercialProfileForm({ avatar_url: comm.avatar_url || '', password_temp: comm.password_temp || '' });
        }
        const { data } = await supabase.from('crm_settings').select('*').eq('tenant_id', tenantId).maybeSingle();
        if (data) {
          setCrmSettings({ crm_name: data.crm_name || 'ONYX CRM', logo_url: data.logo_url || '', theme_color: data.theme_color || '#39FF14' });
          if (data.theme_mode) {
             setTheme(data.theme_mode);
          }
        }
      }
    };
    fetchSettings();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const tenantId = user.user_metadata?.tenant_id || user.id;
        await supabase.from('crm_settings').upsert({ tenant_id: tenantId, theme_mode: newTheme }, { onConflict: 'tenant_id' });
    }
  };

  const getCurrentPageTitle = () => {
    const currentLink = NAV_LINKS.find(link => link.href === pathname);
    return currentLink ? currentLink.name : 'Onyx CRM';
  };

  if (!mounted) return null;

  const visibleLinks = NAV_LINKS.filter(link => {
    if (userRole === 'commercial' && (link.name === 'Dashboard' || link.name === 'Paramètres')) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white font-sans overflow-hidden transition-colors duration-300">
      
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="hidden md:flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          {crmSettings.logo_url ? (
            <img src={crmSettings.logo_url} alt="CRM Logo" className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <span style={{ color: crmSettings.theme_color }}>{crmSettings.crm_name}</span>
            </span>
          )}
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Menu Principal</div>
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                  isActive
                    ? 'bg-black shadow-lg dark:bg-zinc-900/80 border border-transparent'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
                style={isActive ? { color: crmSettings.theme_color, borderColor: `${crmSettings.theme_color}40` } : {}}
              >
                <link.icon size={18} style={isActive ? { color: crmSettings.theme_color } : {}} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* --- HEADER TOP BAR --- */}
        <header className="h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={() => router.push('/hub')}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors hidden sm:flex items-center gap-2"
              title="Retour au Hub"
            >
              <ArrowLeft size={16} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:inline-block">Hub</span>
            </button>
            <h1 className="text-sm sm:text-xl font-black uppercase tracking-tight truncate">
              {getCurrentPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 dark:border-zinc-800">
              <button onClick={() => userRole === 'commercial' ? setShowCommercialProfile(true) : router.push('/crm/settings')} className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform" style={{ color: crmSettings.theme_color }}>
                    <UserCircle size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* --- CHILDREN (CONTENT) --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-6 relative scroll-smooth custom-scrollbar">
          {children}
        </main>
        
        {/* --- FOOTER GLOBAL CRM --- */}
        <footer className="mt-auto py-4 px-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
            <div>© {new Date().getFullYear()} OnyxOps CRM. Tous droits réservés.</div>
            <div className="flex gap-4">
                <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Mentions Légales</Link>
                <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Support 24/7</Link>
            </div>
        </footer>
      </div>

      {/* --- DRAWER MENU MOBILE --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-64 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <span className="text-lg font-black uppercase tracking-tighter" style={{ color: crmSettings.theme_color }}>{crmSettings.crm_name}</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Menu Principal</div>
              {visibleLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 ${isActive ? 'bg-black shadow-lg dark:bg-zinc-900/80 border border-transparent' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                    style={isActive ? { color: crmSettings.theme_color, borderColor: `${crmSettings.theme_color}40` } : {}}
                  >
                    <link.icon size={18} style={isActive ? { color: crmSettings.theme_color } : {}} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODALE PROFIL COMMERCIAL */}
      {showCommercialProfile && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowCommercialProfile(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <button onClick={() => setShowCommercialProfile(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2 text-black dark:text-white"><UserCircle size={20}/> Mon Profil</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Photo de profil (URL)</label>
                <input type="url" placeholder="https://..." value={commercialProfileForm.avatar_url} onChange={e => setCommercialProfileForm({...commercialProfileForm, avatar_url: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] text-black dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nouveau Code PIN</label>
                <input type="password" maxLength={4} placeholder="••••" value={commercialProfileForm.password_temp} onChange={e => setCommercialProfileForm({...commercialProfileForm, password_temp: e.target.value.replace(/[^0-9]/g, '')})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] text-black dark:text-white" />
              </div>
              <button onClick={async () => {
                 const { data: { user } } = await supabase.auth.getUser();
                 if (user) {
                    await supabase.from('commercials').update(commercialProfileForm).eq('id', user.id);
                    alert("Profil mis à jour !");
                    setShowCommercialProfile(false);
                 }
              }} className="w-full mt-4 bg-black dark:bg-white text-[#39FF14] dark:text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-lg flex justify-center items-center gap-2">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}