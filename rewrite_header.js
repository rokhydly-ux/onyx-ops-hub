const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const headerStartStr = `{/* HEADER & HORIZONTAL NAVIGATION */}`;
const headerStartIdx = content.indexOf(headerStartStr);

if (headerStartIdx !== -1) {
    const mainContentStr = `{/* MAIN CONTENT AREA */}`;
    const mainContentIdx = content.indexOf(mainContentStr, headerStartIdx);

    if (mainContentIdx !== -1) {
        const oldHeader = content.substring(headerStartIdx, mainContentIdx);

        const newHeader = `
      {/* NOUVEAU HEADER GLASSMORPHISM */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#39FF14]/30 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro" className="h-12 w-auto object-contain cursor-pointer" onClick={() => router.push('/hub')} />
        </div>

        {/* MÉGA-MENU (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <UserIcon size={14}/> Mon Espace <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => setActiveTab('today')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.monJour} className="w-5 h-5 rounded" alt=""/> Mon Jour</button>
                    <button onClick={() => setActiveTab('history')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.dashboard} className="w-5 h-5 rounded" alt=""/> Historique</button>
                    <button onClick={() => setActiveTab('profile')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><UserIcon size={14} className="text-[#39FF14]"/> Profil</button>
                </div>
            </div>

            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <TrendingUp size={14}/> Nutrition <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => setActiveTab('week')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.samaMenu} className="w-5 h-5 rounded" alt=""/> Sama Menu</button>
                    <button onClick={() => setActiveTab('favorites')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><BookOpen size={14} className="text-[#39FF14]"/> Galerie Recettes</button>
                </div>
            </div>

            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <MessageSquare size={14}/> Réseau <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => setActiveTab('community')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><Heart size={14} className="text-red-500"/> Communauté</button>
                    <button onClick={() => setActiveTab('coaching')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.coaching} className="w-5 h-5 rounded" alt=""/> Coaching</button>
                    <button onClick={() => setActiveTab('blog')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.blog} className="w-5 h-5 rounded" alt=""/> Doc & Astuces</button>
                </div>
            </div>

            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <ShoppingCart size={14}/> Boutique <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => setActiveTab('shop')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.shop} className="w-5 h-5 rounded" alt=""/> Shop</button>
                </div>
            </div>
        </div>

        {/* Actions Droite */}
        <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-white border border-zinc-200 rounded-full px-3 py-1.5 shadow-sm">
                <Search size={14} className="text-zinc-400" />
                <input type="text" placeholder="Chercher une recette, un membre..." className="bg-transparent border-none text-xs text-zinc-700 outline-none w-48 focus:w-64 transition-all ml-2 placeholder:text-zinc-400" />
            </div>

            {/* Toggles */}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-400 hover:text-yellow-500 transition-colors shadow-sm" title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}>
                {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
            </button>

            <button onClick={() => handleExpertModeChange(!isExpertMode)} className={\`p-2 rounded-full border transition-colors shadow-sm \${isExpertMode ? 'bg-[#39FF14]/10 border-[#39FF14] text-[#39FF14]' : 'bg-white border-zinc-200 text-zinc-400 hover:text-black'}\`} title="Toggle Kcal">
                <Eye size={16}/>
            </button>

            {/* Cart */}
            <button onClick={() => setShowCartModal(true)} className={\`relative p-2 rounded-full bg-white border transition-all shadow-sm \${isCartBouncing ? 'scale-125 border-[#39FF14] text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.5)] z-[100]' : 'border-zinc-200 text-zinc-400 hover:text-black'}\`}>
                <ShoppingCart size={16} />
                {shopCart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#39FF14] text-black w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-black animate-pulse shadow-md">
                        {shopCart.length}
                    </span>
                )}
            </button>

            {/* Avatar Dropdown */}
            <div className="relative group ml-2">
                <button className="flex items-center gap-2 focus:outline-none">
                    <img src={user?.avatar_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(user?.full_name || 'Membre')}&background=random\`} alt="Profil" className="w-9 h-9 rounded-full border-2 border-[#39FF14]/50 object-cover shadow-sm" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50 flex flex-col">
                    <button onClick={() => setActiveTab('profile')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><UserIcon size={14}/> Mon Profil</button>
                    <div className="h-px w-full bg-zinc-100"></div>
                    <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/nutriafro-login'; }} className="px-4 py-3 text-xs font-bold text-red-500 text-left hover:bg-red-50 flex items-center gap-2"><LogOut size={14}/> Déconnexion</button>
                </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-zinc-700"><MenuIcon size={24}/></button>
        </div>
      </header>\n\n      `;

      content = content.replace(oldHeader, newHeader);
      fs.writeFileSync('src/app/nutrition/page.tsx', content);
      console.log("Successfully replaced header block!");
    } else {
        console.log("Could not find MAIN CONTENT AREA token");
    }
} else {
    console.log("Could not find HEADER & HORIZONTAL NAVIGATION token");
}
