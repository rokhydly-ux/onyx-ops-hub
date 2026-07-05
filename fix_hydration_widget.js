const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Replace the old Hydration Widget in 'Mon Jour' View (activeTab === 'today')
const oldWaterRegex = /\{\/\* Objectif Eau \*\/\}.*?<div className="bg-white p-4 rounded-\[\2rem\] border border-zinc-200 shadow-sm flex flex-col items-center text-center">.*?<div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">.*?<img src=\{WATER_ICON\} className="w-8 h-8 object-contain mx-auto" \/>.*?<\/div>.*?<h3 className="font-black text-\[10px\] uppercase tracking-tighter text-black mb-1">Objectif Eau<\/h3>.*?<p className="text-zinc-500 font-bold text-\[9px\] mb-4">\{waterGlasses\}\/8 verres<\/p>.*?<button onClick=\{\(\) => handleUpdateWater\(1\)\} className="w-full bg-black text-\[\#39FF14\] py-2 rounded-xl text-\[9px\] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">.*? \+ 1 verre.*?<\/button>.*?<\/div>/s;

// We will inject the new requested Hydration JSX directly where needed in step 5 (Restructure 'Mon Jour' Right Column)
