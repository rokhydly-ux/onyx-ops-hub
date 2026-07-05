const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// The request specifically asks to restore these in Guided Mode, Flexible Mode, and Sama Menu lists.
// The user provided the format:
// <img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {prots}g

// Guided Mode & Sama Menu
// The logic for displaying macros usually looks like this in code (using Lucide icons or raw text):
// <span className="flex items-center gap-1 text-zinc-500"><Activity size={10} className="text-blue-500"/> {prots}g prot</span>

pageCode = pageCode.replace(/<span className="flex items-center gap-1 text-zinc-600"><Flame size=\{10\} className="text-orange-500"\/> (\{\w+\}) kcal<\/span>/g, '<span className="flex items-center gap-1 text-zinc-600"><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> $1 kcal</span>');
pageCode = pageCode.replace(/<span className="flex items-center gap-1 text-zinc-600"><Activity size=\{10\} className="text-blue-500"\/> (\{\w+\})g prot<\/span>/g, '<span className="flex items-center gap-1 text-zinc-600"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> $1g prot</span>');
pageCode = pageCode.replace(/<span className="flex items-center gap-1 text-zinc-600"><Box size=\{10\} className="text-yellow-500"\/> (\{\w+\.carbs \|\| 0\})g<\/span>/g, '<span className="flex items-center gap-1 text-zinc-600"><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> $1g</span>');
pageCode = pageCode.replace(/<span className="flex items-center gap-1 text-zinc-600"><Box size=\{10\} className="text-red-500"\/> (\{\w+\.fats \|\| 0\})g<\/span>/g, '<span className="flex items-center gap-1 text-zinc-600"><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> $1g</span>');

// Flexible Mode
pageCode = pageCode.replace(/<Flame size=\{12\} className="text-orange-500"\/>/g, '<img src={CALS_ICON} className="w-3 h-3 rounded-full"/>');
pageCode = pageCode.replace(/<Activity size=\{10\} className="text-blue-500"\/>/g, '<img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/>');
pageCode = pageCode.replace(/<Box size=\{10\} className="text-yellow-500"\/>/g, '<img src={CARBS_ICON} className="w-3 h-3 rounded-full"/>');
pageCode = pageCode.replace(/<Box size=\{10\} className="text-red-500"\/>/g, '<img src={FATS_ICON} className="w-3 h-3 rounded-full"/>');


fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log('Fixed Macro Icons in lists');
