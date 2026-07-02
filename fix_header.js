const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// 1. Bouton Boutique dans le Menu Principal
// Check if the dropdown exists in the mega menu for Boutique:
const boutiqueRegex = /<div className="relative group">\s*<button onClick=\{\(\) => setActiveTab\('shop'\)\} className="bg-white border border-\[\#39FF14\] text-zinc-700 hover:bg-\[\#39FF14\] hover:text-black rounded-full px-4 py-2 font-black uppercase text-\[10px\] tracking-widest transition-all flex items-center gap-2">\s*<ShoppingCart size=\{14\}\/> Boutique <ChevronDown size=\{12\}\/>\s*<\/button>\s*<div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">\s*<button onClick=\{\(\) => setActiveTab\('shop'\)\} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src=\{MENU_ICONS.shop\} className="w-5 h-5 rounded" alt=""\/> Shop<\/button>\s*<\/div>\s*<\/div>/g;

const simpleBoutiqueBtn = `<button onClick={() => setActiveTab('shop')} className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-sm">
                    <img src={MENU_ICONS.shop} className="w-4 h-4 rounded" alt=""/> Boutique
                </button>`;

if (boutiqueRegex.test(content)) {
    content = content.replace(boutiqueRegex, simpleBoutiqueBtn);
    console.log("Replaced Boutique Dropdown in Mega Menu");
} else {
    // Maybe it was already replaced by the previous script? Let's check for "Boutique <ChevronDown"
    const fallbackRegex = /<div className="relative group">\s*<button onClick=\{\(\) => setActiveTab\('shop'\)\} className="bg-white border border-\[\#39FF14\] text-zinc-700 hover:bg-\[\#39FF14\] hover:text-black rounded-full px-4 py-2 font-black uppercase text-\[10px\] tracking-widest transition-all flex items-center gap-2">\s*<ShoppingCart size=\{14\}\/> Boutique <ChevronDown size=\{12\}\/>\s*<\/button>[\s\S]*?<\/div>\s*<\/div>/g;
    if (fallbackRegex.test(content)) {
        content = content.replace(fallbackRegex, simpleBoutiqueBtn);
        console.log("Replaced Boutique Dropdown (Fallback)");
    } else {
        console.log("Could not find Boutique Dropdown");
    }
}

// Ensure the bottom nav duplicate "Shop" tab is handled if needed. The user said: "le bouton Boutique ensuite longlet shop est toujours la"
// Ah, the user says: "le bouton Boutique ensuite longlet shop est toujours la".
// Meaning in the mega menu there was a button "Boutique" and then inside the dropdown there was "Shop".
// And now they just want the simple button.

// 2. L'onglet community : "supprimer toute mention d'Onyx Cest le club des Lekkologues"
// In activeTab === 'community', replace "Onyx Community" or "Onyx Plus" or "Onyx" with "Club des Lekkologues" or remove Onyx.

content = content.replace(/Onyx Community/g, "Club des Lekkologues");
content = content.replace(/Onyx Plus/g, "Lekkologue Pro");

fs.writeFileSync('src/app/nutrition/page.tsx', content);
