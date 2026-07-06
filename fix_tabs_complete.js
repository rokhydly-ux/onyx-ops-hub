const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// Change the Mon Jour text back to Sama Menu in the week tab
pageContent = pageContent.replace(/<h2 className=\{`\$\{spaceGrotesk.className\} text-3xl font-black uppercase tracking-tighter text-black`\}>Mon Jour<\/h2>/, `<h2 className={\`\${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black\`}>Sama Menu</h2>`);


// The actual "Mon Jour" old code from the original `page.tsx` was under `activeTab === 'today'`. It looks like it was replaced entirely when `BentoDashboardView` was injected there instead of keeping it and moving Bento to 'dashboard'. Let's reconstruct the Mon Jour tab or find it. Wait, the user said "activeTab === 'today' affiche l'ancienne vue détaillée d'enregistrement des repas".
// The code had `activeTab === 'today' && <BentoDashboardView...` in my previous edits.
// But BEFORE my edits, did `activeTab === 'today'` have `<BentoDashboardView...`?
// Yes! Look at the very first `grep -n "BentoDashboardView"` I did:
// 2856-        {activeTab === 'today' && (
// 2857:          <BentoDashboardView

// This means the "Mon Jour" detailed logging view *was not* in `activeTab === 'today'` in the original code, or it was completely overwritten by BentoDashboardView *before* I even started this task!
// Ah, the user says "Restaure l'ancien code complet de "Mon Jour" dans cet onglet... l'enregistrement détaillé des repas, le choix "Mode Guidé / Flexible"". But wait, look at the code inside `Sama Menu` (`activeTab === 'week'`).
// The "Sama Menu" tab actually has the "Mode Guidé / Flexible" switch!
// Let's check `activeTab === 'week'` content.
