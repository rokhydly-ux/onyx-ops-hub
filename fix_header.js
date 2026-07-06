const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

const targetStr = '<div className="hidden lg:flex items-center gap-2">';
const replacement = `${targetStr}\n            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 font-black uppercase text-[11px] tracking-widest text-black hover:text-[#39FF14] transition-colors py-2 bg-zinc-50 px-4 rounded-full border border-zinc-200"><img src={MENU_ICONS.dashboard} className="w-5 h-5 rounded-full object-cover shadow-sm"/> Accueil</button>`;

if (pageCode.includes(targetStr)) {
    pageCode = pageCode.replace(targetStr, replacement);
    fs.writeFileSync(pagePath, pageCode, 'utf8');
    console.log("Header updated");
} else {
    console.log("Could not find the target string.");
}
