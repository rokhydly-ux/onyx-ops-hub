const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// Change logo click to dashboard
pageContent = pageContent.replace(/<img src="https:\/\/res.cloudinary.com\/dtr2wtoty\/image\/upload\/v1781224243\/logo_dore_um5fsr.png" alt="NutriAfro" className="h-12 w-auto object-contain cursor-pointer" onClick=\{\(\) => router.push\('\/hub'\)\} \/>/, '<img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro" className="h-12 w-auto object-contain cursor-pointer" onClick={() => setActiveTab(\'dashboard\')} />');

// Add Fitness and Minute Doc back to Mega Menu
const megaMenuNetworkStr = `<button onClick={() => setActiveTab('blog')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.blog} className="w-5 h-5 rounded" alt=""/> Doc & Astuces</button>`;

if(pageContent.includes(megaMenuNetworkStr)){
    const addStr = `
                    <button onClick={() => setActiveTab('fitness')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.fitness} className="w-5 h-5 rounded" alt=""/> Fitness</button>
                    <button onClick={() => setActiveTab('minute-doc')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><Video size={14} className="text-[#39FF14]"/> La Minute Doc</button>
`;
    pageContent = pageContent.replace(megaMenuNetworkStr, megaMenuNetworkStr + addStr);
}

// Rename the Bento condition from today to dashboard
pageContent = pageContent.replace(/\{activeTab === 'today' && \(\s*<div className="flex flex-col md:flex-row/, "{activeTab === 'dashboard' && (\n          <div className=\"flex flex-col md:flex-row");
pageContent = pageContent.replace(/\{activeTab === 'today' && \(\s*<BentoDashboardView/, "{activeTab === 'dashboard' && (\n          <BentoDashboardView");

// Rename the old "Sama Menu" from week to today if that's what's asked? No, "Restaure l'ancien code complet de "Mon Jour" dans cet onglet... l'enregistrement détaillé des repas, le choix "Mode Guidé / Flexible", le bouton Refaire mon diag"
// Actually in the original code, the 'today' tab contained BentoDashboardView and then later the "Mon Jour" logic was maybe moved or deleted.
// Wait, the "Mon Jour" logic was in activeTab === 'week' because that's where the generated menu was?
// Let's check where the detailed tracking is.
fs.writeFileSync('src/app/nutrition/page.tsx', pageContent);
