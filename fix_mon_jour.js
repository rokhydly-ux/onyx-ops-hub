const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Find the left column of "Mon Jour" to extract the old Eau and Bilan and remove them
const pieChartRegex = /\{\/\* 2\. Eau et Bilan côte à côte \*\/\}\s*<div className="grid grid-cols-2 gap-4">.*?<\/div>\s*<\/div>\s*\{\/\* COLONNE DROITE \(2\/3\) \*\/\}/s;

pageCode = pageCode.replace(pieChartRegex, `</div>\n\n              {/* COLONNE DROITE (2/3) */}`);

// We need to rebuild the right column.
// First, extract the "Refaire mon diagnostic" widget
const redoDiagRegex = /\{\/\* 2\. Le grand widget "Refaire mon diagnostic" en dessous des repas \*\/\}\s*<button\s*onClick=\{\(\) => setShowRedoDiagModal\(true\)\}\s*className="relative w-full rounded-\[\2rem\] overflow-hidden group shadow-lg h-48 md:h-56 flex items-center justify-center border-2 border-transparent hover:border-\[\#39FF14\] transition-all"\s*>\s*<img\s*src="https:\/\/res.cloudinary.com\/dtr2wtoty\/image\/upload\/v1783002400\/A_high-end__photorealistic_commercial_shot_202607021426_vutjqi.jpg"\s*className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"\s*alt="Refaire Diagnostic"\s*\/>\s*<div className="absolute inset-0 bg-gradient-to-t from-black\/90 via-black\/50 to-black\/40 backdrop-blur-\[2px\]"><\/div>\s*<div className="relative z-10 flex flex-col items-center gap-3">\s*<div className="bg-\[\#39FF14\] text-black p-3 rounded-full animate-pulse shadow-\[0_0_30px_rgba\(57,255,20,0\.6\)\]">\s*<Target size=\{24\} \/>\s*<\/div>\s*<h3 className=\{\`\$\{spaceGrotesk.className\} text-2xl md:text-3xl font-black uppercase text-white tracking-tighter drop-shadow-md\`\}>\s*Refaire mon diagnostic\s*<\/h3>\s*<p className="text-zinc-300 font-bold text-\[10px\] uppercase tracking-widest text-center">\s*Ajuster mes objectifs et mes mensurations\s*<\/p>\s*<\/div>\s*<\/button>/s;

let redoDiagJSX = "";
const redoDiagMatch = pageCode.match(redoDiagRegex);
if(redoDiagMatch) {
    redoDiagJSX = redoDiagMatch[0];
    pageCode = pageCode.replace(redoDiagRegex, ""); // Remove it from the bottom
} else {
    console.log("Could not find redoDiag widget");
}

const interactiveWaterWidgetJSX = `
                {/* Nouveau Widget Hydratation */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">

                  {/* En-tête du Widget */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Objectif Eau</p>
                      <h4 className="text-2xl font-black text-black">{waterGlasses} <span className="text-xs font-bold text-zinc-500">/ 8 bouteilles (1.5L)</span></h4>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center shadow-inner">
                      <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png" alt="Eau" className="w-6 h-6 object-contain" />
                    </div>
                  </div>

                  {/* Grille des 8 Petites Bouteilles Interactives */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-4 py-3 bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
                    {Array.from({ length: 8 }, (_, i) => {
                      const isDrunk = i < waterGlasses;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            // Si on clique sur la bouteille 3, ça règle le quota à 3 (ou désactive si on reclique dessus)
                            const nextVal = i + 1 === waterGlasses ? i : i + 1;
                            handleUpdateWater(nextVal - waterGlasses);
                          }}
                          className={\`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-300 \${
                            isDrunk
                              ? 'bg-[#39FF14]/20 border border-[#39FF14] scale-105 shadow-sm'
                              : 'hover:bg-zinc-200/60 opacity-30 grayscale hover:opacity-60'
                          }\`}
                          title={\`Bouteille \${i + 1}\`}
                        >
                          <img
                            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png"
                            alt="Bouteille"
                            className={\`w-7 h-8 object-contain transition-transform \${isDrunk ? 'animate-pulse drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]' : ''}\`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Astuce Santé Pertinente */}
                  <div className="bg-black text-white p-3.5 rounded-xl flex items-center gap-3 mt-2 border border-zinc-800">
                    <span className="text-lg shrink-0">💡</span>
                    <p className="text-[10px] font-medium leading-relaxed text-zinc-300">
                      <strong className="text-[#39FF14] uppercase font-black">Le saviez-vous ?</strong> Boire 500ml d'eau augmente le métabolisme de près de <span className="text-white font-bold">30%</span> dans l'heure qui suit !
                    </p>
                  </div>

                </div>`;

const dailyBilanJSX = `
                {/* Bilan de la journée */}
                <button onClick={() => setShowDailyReport(true)} className="bg-[#39FF14] p-6 rounded-[2rem] border border-black shadow-[0_0_25px_rgba(57,255,20,0.4)] flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] transition-transform animate-gentle-pulse">
                    <CheckCircle size={32} className="text-black mb-3"/>
                    <h3 className="font-black text-lg uppercase tracking-tighter text-black mb-1">Bilan du jour</h3>
                    <p className="text-black/70 font-bold text-xs">Clôturez pour gagner de l'XP et évaluer vos progrès.</p>
                </button>`;

// Replace the right column structure
// Note: In the right column, we have trackingMode === 'guided' condition for meal list.
// We will place the redoDiagJSX right at the top of the right column, and the water/bilan grid at the bottom.

const rightColumnStart = /\{\/\* COLONNE DROITE \(2\/3\) \*\/\}\s*<div className="lg:col-span-2 flex flex-col gap-6">/;
pageCode = pageCode.replace(rightColumnStart, `{/* COLONNE DROITE (2/3) */}\n              <div className="lg:col-span-2 flex flex-col gap-6">\n                {/* 1. Le grand widget "Refaire mon diagnostic" au sommet */}\n                ${redoDiagJSX.replace('h-48 md:h-56', 'h-40 md:h-48')}`);

const rightColumnEnd = /\{\/\* 2\. Le grand widget "Refaire mon diagnostic" en dessous des repas \*\/\}/;
// Since we removed redoDiagJSX, it just ends with </div>} </div> </div>
// Let's find the end of the meal list.
const endOfRightColRegex = /<\/div>\s*\)\s*\}\)\s*\}\s*<\/div>\s*\)\s*\}/s;

const matchEnd = pageCode.match(endOfRightColRegex);
if(matchEnd) {
    pageCode = pageCode.replace(matchEnd[0], matchEnd[0] + `
                {/* 3. Section Bas Droite (Eau & Bilan) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    ${interactiveWaterWidgetJSX}
                    ${dailyBilanJSX}
                </div>`);
} else {
    console.log("Could not find the end of the right column meal list.");
}

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log('Restructured Mon Jour');
