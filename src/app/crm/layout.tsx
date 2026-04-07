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
  Settings
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const NAV_LINKS = [
  { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
  { name: 'Leads Kanban', href: '/crm/leads', icon: Columns },
  { name: 'Studio PDF', href: '/crm/studio', icon: FileText },
  { name: 'Catalogue', href: '/crm/products', icon: Package },
  { name: 'Contacts', href: '/crm/contacts', icon: Users },
  { name: 'Paramètres', href: '/crm/settings', icon: Settings },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const [crmSettings, setCrmSettings] = useState({ crm_name: 'ONYX CRM', logo_url: '', theme_color: '#39FF14' });

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('onyx_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    const fetchSettings = async () => {
      const { data } = await supabase.from('crm_settings').select('*').eq('id', 1).single();
      if (data) {
        setCrmSettings({ crm_name: data.crm_name || 'ONYX CRM', logo_url: data.logo_url || '', theme_color: data.theme_color || '#39FF14' });
      }
    };
    fetchSettings();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('onyx_theme', newTheme);
  };

  const getCurrentPageTitle = () => {
    const currentLink = NAV_LINKS.find(link => link.href === pathname);
    return currentLink ? currentLink.name : 'Onyx CRM';
  };

  if (!mounted) return null;

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
          {NAV_LINKS.map((link) => {
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/hub')}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
              title="Retour au Hub"
            >
              <ArrowLeft size={16} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:inline-block">Hub</span>
            </button>
            <h1 className="text-base sm:text-xl font-black uppercase tracking-tight truncate">
              {getCurrentPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-sm" style={{ color: crmSettings.theme_color }}>
                <UserCircle size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* --- CHILDREN (CONTENT) --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 relative scroll-smooth custom-scrollbar">
          {children}
        </main>
      </div>

      {/* --- BOTTOM NAVIGATION MOBILE --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center h-16 px-2 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? '' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`} style={isActive ? { color: crmSettings.theme_color } : {}}>
              <link.icon size={20} style={isActive ? { color: crmSettings.theme_color } : {}} />
              <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-full px-1">{link.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}