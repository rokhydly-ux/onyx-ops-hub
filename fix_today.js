const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// Le code Sama Menu qui est actuellement sous 'today' doit repasser sous 'week'.
pageContent = pageContent.replace(/\{activeTab === 'today' && \(\s*<div className="space-y-12 animate-in fade-in slide-in-from-right-4">\s*\{\/\* SECTION SMART PLANNER \(Générateur\) \*\/\}\s*<section>/, `{activeTab === 'week' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">

            {/* SECTION SMART PLANNER (Générateur) */}
            <section>`);

// The user states: "activeTab === 'today' (Mon Jour = À RESTAURER TOTALEMENT) Tu dois RESTAURER l'intégralité de l'ancien code de suivi quotidien dans cet onglet. L'utilisateur doit y retrouver : L'enregistrement (log) des repas. Le suivi de la prise d'eau quotidienne. Le Bilan de la journée. Le switch Mode Guidé / Mode Libre. Les suggestions Boutique en bas de page."
// Is the old code for "Mon Jour" lost?
// If it was lost when the Bento was injected, we need to recover it from git.
