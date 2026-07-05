const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Sidebar menu icons fix for missing ones
code = code.replace(/<BookOpen size=\{14\} className="text-\[\#39FF14\]"\/> Galerie Recettes/g, `<img src={MENU_ICONS.galerieRecettes} className="w-5 h-5 rounded" alt=""/> Galerie Recettes`);

// Header icons for all tabs
// Galerie Recettes Header
code = code.replace(/<h2 className={`\$\{spaceGrotesk.className\} text-3xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}>/g, `<h2 className={\`\${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black flex items-center gap-4 mb-6\`}><img src={MENU_ICONS.galerieRecettes} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Galerie Recettes" /> `);

// Communauté Header
code = code.replace(/<div className="flex items-center gap-4">\s*<div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center shrink-0">/g, `<div className="flex items-center gap-4">\n                 <img src={MENU_ICONS.community} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Communauté" />\n                 {/* REMOVED OLD RED GRADIENT DIV */}`);
code = code.replace(/\{"\/\* REMOVED OLD RED GRADIENT DIV \*\/"\}\s*<Heart className="text-white" size=\{32\}\/>\s*<\/div>/g, ``);

// La Minute Doc Header
code = code.replace(/<div className="flex items-center gap-4">\s*<div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-\[\#39FF14\] to-green-500 rounded-2xl shadow-lg flex items-center justify-center shrink-0">/g, `<div className="flex items-center gap-4">\n                 <img src={MENU_ICONS.minuteDoc} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Minute Doc" />\n                 {/* REMOVED OLD GREEN GRADIENT DIV */}`);
code = code.replace(/\{"\/\* REMOVED OLD GREEN GRADIENT DIV \*\/"\}\s*<Video size=\{32\} className="text-black"\/>\s*<\/div>/g, ``);

// Mon Poids Header
code = code.replace(/<div className="flex items-center gap-4 mb-8">\s*<div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-2xl shadow-lg flex items-center justify-center shrink-0">/g, `<div className="flex items-center gap-4 mb-8">\n                 <img src={MENU_ICONS.monPoids} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Mon Poids" />\n                 {/* REMOVED OLD BLACK DIV */}`);
code = code.replace(/\{"\/\* REMOVED OLD BLACK DIV \*\/"\}\s*<img src=\{MENU_ICONS.monPoids\} className="w-12 h-12 rounded-xl object-cover shadow-md" alt="Mon Poids"\/>\s*<\/div>/g, ``);


fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed H2 headers part 2');
