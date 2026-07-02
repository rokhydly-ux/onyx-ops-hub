const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// Le Sama Menu et le Planificateur doivent s'afficher pour activeTab === 'week'.
// Dans ma modification précédente `fix_tab2.js`, j'avais fait un replace `activeTab === 'week'` par `activeTab === 'today'`. C'était une erreur car ça a cassé "Sama Menu".

content = content.replace(/\{activeTab === 'today' && \(\s*<div className="space-y-12 animate-in fade-in slide-in-from-right-4">\s*\{\/\* SECTION SMART PLANNER/, `{activeTab === 'week' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">

            {/* SECTION SMART PLANNER`);

// Put back "Sama Menu" text
content = content.replace(/<h2 className=\{`\$\{spaceGrotesk.className\} text-3xl font-black uppercase tracking-tighter text-black`\}>Mon Jour<\/h2>/, `<h2 className={\`\${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black\`}>Sama Menu</h2>`);

// Now what about "Mon Jour" (today)? We need to restore it.
// "L'enregistrement (log) des repas. Le suivi de la prise d'eau quotidienne. Le Bilan de la journée. Le switch Mode Guidé / Mode Libre. Les suggestions Boutique en bas de page."
// Actually, this old view was completely overwritten when I injected the BentoDashboardView into `activeTab === 'today'`. I need to retrieve it from git!

fs.writeFileSync('src/app/nutrition/page.tsx', content);
