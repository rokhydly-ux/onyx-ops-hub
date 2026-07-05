const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Replace H2 icons in the views
// Minute Doc
code = code.replace(/<Video className="text-\[\#39FF14\] bg-black p-1\.5 rounded-lg" size=\{24\}\/>/g, `<img src={MENU_ICONS.minuteDoc} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="Minute Doc"/>`);
code = code.replace(/<Video size=\{32\} className="text-black"\/>/g, `<img src={MENU_ICONS.minuteDoc} className="w-12 h-12 rounded-xl object-cover shadow-md" alt="Minute Doc"/>`);
// Communauté
code = code.replace(/<Heart className="text-red-500" size=\{32\} \/>/g, `<img src={MENU_ICONS.community} className="w-12 h-12 rounded-xl object-cover shadow-md" alt="Communauté"/>`);
code = code.replace(/<Heart className="text-red-500" size=\{24\} \/>/g, `<img src={MENU_ICONS.community} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="Communauté"/>`);
// Mon Poids
code = code.replace(/<Activity className="text-\[\#39FF14\] bg-black p-1\.5 rounded-lg" size=\{24\}\/>/g, `<img src={MENU_ICONS.monPoids} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="Mon Poids"/>`);
code = code.replace(/<Activity className="text-white" size=\{32\}\/>/g, `<img src={MENU_ICONS.monPoids} className="w-12 h-12 rounded-xl object-cover shadow-md" alt="Mon Poids"/>`);

// Galerie Recettes
code = code.replace(/<Star className="text-yellow-400 fill-yellow-400 bg-black p-1\.5 rounded-lg" size=\{24\}\/>/g, `<img src={MENU_ICONS.galerieRecettes} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="Galerie Recettes"/>`);

// Conseils (Blog)
code = code.replace(/<h2 className={`\$\{spaceGrotesk.className\} text-3xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-4`}>Doc & Astuces Onyx<\/h2>/g, `<h2 className={\`\${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-4\`}><img src={MENU_ICONS.blog} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Conseils Nutrition" /> Conseils Nutrition</h2>`);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed H2 headers');
