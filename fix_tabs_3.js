const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// Le Sama Menu et le Planificateur doivent s'afficher pour activeTab === 'week'.
// L'ancien "Mon Jour" détaillé doit s'afficher pour activeTab === 'today'.
// Wait! Let's check `old_nutrition.tsx` to see if there was another block for `activeTab === 'today'`.
