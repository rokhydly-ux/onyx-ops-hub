const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The user states: "le bouton Boutique ensuite longlet shop est toujours la"
// "pour l'onglet community supprimer toute mention d'Onyx Cest le club des Lekkologues"
// Wait, they mean the dropdown for the shop in the Mega-Menu might still be there, OR the Shop tab string "Boutique Onyx" in the Shop tab?
// "Le Header (Boutique) : ... J'ai enlevé la div et le dropdown pour en faire un unique bouton direct ... le bouton Boutique ensuite longlet shop est toujours la"
// Ah! In my `rewrite_header.js` earlier, I had a fallback regex that might not have worked, so the dropdown is STILL there! Let's check the header.

const headerStartIdx = content.indexOf(`{/* NOUVEAU HEADER GLASSMORPHISM */}`);
const headerEndIdx = content.indexOf(`{/* MAIN CONTENT AREA */}`);

let header = content.substring(headerStartIdx, headerEndIdx);
// Let's print the part containing Boutique
// console.log(header);

// Manually replace it
const oldBoutiqueDropdown = `            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <ShoppingCart size={14}/> Boutique <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => setActiveTab('shop')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.shop} className="w-5 h-5 rounded" alt=""/> Shop</button>
                </div>
            </div>`;
const newBoutiqueBtn = `<button onClick={() => setActiveTab('shop')} className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-sm">
                    <img src={MENU_ICONS.shop} className="w-4 h-4 rounded" alt=""/> Boutique
                </button>`;

if (header.includes(oldBoutiqueDropdown)) {
    header = header.replace(oldBoutiqueDropdown, newBoutiqueBtn);
    content = content.substring(0, headerStartIdx) + header + content.substring(headerEndIdx);
    fs.writeFileSync('src/app/nutrition/page.tsx', content);
    console.log("Replaced Boutique Dropdown");
} else {
    // maybe it has slightly different whitespace
    const boutiqueDropdownRegex = /<div className="relative group">\s*<button className="bg-white border border-\[\#39FF14\] text-zinc-700 hover:bg-\[\#39FF14\] hover:text-black rounded-full px-4 py-2 font-black uppercase text-\[10px\] tracking-widest transition-all flex items-center gap-2">\s*<ShoppingCart size=\{14\}\/> Boutique <ChevronDown size=\{12\}\/>\s*<\/button>\s*<div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">\s*<button onClick=\{\(\) => setActiveTab\('shop'\)\} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src=\{MENU_ICONS\.shop\} className="w-5 h-5 rounded" alt=""\/> Shop<\/button>\s*<\/div>\s*<\/div>/g;

    if (boutiqueDropdownRegex.test(header)) {
        header = header.replace(boutiqueDropdownRegex, newBoutiqueBtn);
        content = content.substring(0, headerStartIdx) + header + content.substring(headerEndIdx);
        fs.writeFileSync('src/app/nutrition/page.tsx', content);
        console.log("Replaced Boutique Dropdown (Regex)");
    } else {
        console.log("Still could not find it. Here is the header:");
        console.log(header);
    }
}
