const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Communauté Header
code = code.replace(/<h2 className={`\$\{spaceGrotesk.className\} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-3`}><Heart className="text-\[\#39FF14\] bg-black p-2 rounded-xl" size=\{40\}\/> Club des Lekkologues<\/h2>/g, `<h2 className={\`\${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-4\`}><img src={MENU_ICONS.community} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Communauté" /> Club des Lekkologues</h2>`);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed H2 headers part 3');
