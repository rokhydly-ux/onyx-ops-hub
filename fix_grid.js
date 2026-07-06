const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// 1. Grid structure for Mon Jour
const startIdx = content.indexOf(`{activeTab === 'today' && (`);
const endIdx = content.indexOf(`{/* Suggestions Boutique */}`, startIdx);
let todayContent = content.substring(startIdx, endIdx);

// Extract Pie Chart
const pieChartMatch = todayContent.match(/\{\/\* GRAPHIQUE CALORIQUE \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
const pieChartCode = pieChartMatch ? pieChartMatch[0] : "";
if(pieChartMatch) todayContent = todayContent.replace(pieChartCode, "");

// Extract Eau & Bilan & Refaire Diag
const eauBilanMatch = todayContent.match(/\{\/\* Tracking Eau & Bilan \*\/\}[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/);
const eauBilanCode = eauBilanMatch ? eauBilanMatch[0] : "";
if(eauBilanMatch) todayContent = todayContent.replace(eauBilanCode, "");

// Extract Repas
const repasMatch = todayContent.match(/\{\/\* Repas du Jour \*\/\}([\s\S]*?)\}\)\(\)\}/);
const repasCode = repasMatch ? repasMatch[0] : "";
if(repasMatch) todayContent = todayContent.replace(repasCode, "");


// Wait, let's just rewrite the whole new grid structure exactly as requested.
const newGrid = `
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* COLONNE GAUCHE (1/3) */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* 1. Le Pie Chart (Calories/Macros) ici */}
                ${pieChartCode.replace('flex-col md:flex-row', 'flex-col').replace('mb-8', '')}

                {/* 2. Eau et Bilan côte à côte */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Objectif Eau */}
                    <div className="bg-white p-4 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                           <img src={WATER_ICON} className="w-8 h-8 object-contain mx-auto" />
                        </div>
                        <h3 className="font-black text-[10px] uppercase tracking-tighter text-black mb-1">Objectif Eau</h3>
                        <p className="text-zinc-500 font-bold text-[9px] mb-4">{waterGlasses}/8 verres</p>
                        <button onClick={() => handleUpdateWater(1)} className="w-full bg-black text-[#39FF14] py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">
                           + 1 verre
                        </button>
                    </div>

                    {/* Bilan de la journée */}
                    <button onClick={() => setShowDailyReport(true)} className="bg-[#39FF14] p-4 rounded-[2rem] border border-black shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] transition-transform">
                        <CheckCircle size={24} className="text-black mb-2"/>
                        <h3 className="font-black text-xs uppercase tracking-tighter text-black mb-1">Bilan du jour</h3>
                        <p className="text-black/70 font-bold text-[9px]">Clôturez pour gagner de l'XP.</p>
                    </button>
                </div>
              </div>

              {/* COLONNE DROITE (2/3) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* 1. La liste des repas */}
                ${repasCode.replace('md:col-span-2', '')}

                {/* 2. Le grand widget "Refaire mon diagnostic" en dessous des repas */}
                <button
                  onClick={() => setShowRedoDiagModal(true)}
                  className="relative w-full rounded-[2rem] overflow-hidden group shadow-lg h-48 md:h-56 flex items-center justify-center border-2 border-transparent hover:border-[#39FF14] transition-all"
                >
                  <img
                    src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783002400/A_high-end__photorealistic_commercial_shot_202607021426_vutjqi.jpg"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Refaire Diagnostic"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40 backdrop-blur-[2px]"></div>

                  <div className="relative z-10 flex flex-col items-center gap-3">
                     <div className="bg-[#39FF14] text-black p-3 rounded-full animate-pulse shadow-[0_0_30px_rgba(57,255,20,0.6)]">
                       <Target size={24} />
                     </div>
                     <h3 className={\`\${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase text-white tracking-tighter drop-shadow-md\`}>
                       Refaire mon diagnostic
                     </h3>
                     <p className="text-zinc-300 font-bold text-xs uppercase tracking-widest text-center">
                       Ajuster mes objectifs et mes mensurations
                     </p>
                  </div>
                </button>
              </div>
            </div>
`;

// Build new today content
todayContent = todayContent.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[\s\S]*?(?=\{\/\* Suggestions Boutique \*\/)/, newGrid);

// Fix Boutique button in header (user said: "Tu n'as toujours pas corrigé l'onglet Boutique dans le menu du haut... Enlève le <div className="relative group"> autour du bouton Boutique")
content = content.replace(/<div className="relative group">\s*<button onClick=\{\(\) => setActiveTab\('shop'\)\} className="bg-white border border-\[\#39FF14\] text-zinc-700 hover:bg-\[\#39FF14\] hover:text-black rounded-full px-4 py-2 font-black uppercase text-\[10px\] tracking-widest transition-all flex items-center gap-2">\s*<img src=\{MENU_ICONS\.shop\} className="w-4 h-4 rounded" alt=""\/> Boutique\s*<\/button>\s*<\/div>/, `<button onClick={() => setActiveTab('shop')} className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <img src={MENU_ICONS.shop} className="w-4 h-4 rounded" alt=""/> Boutique
                </button>`);

// Fix mode libre bug : "Si trackingMode === 'flexible', la liste ne doit pas mapper le todayPlan.meals. Elle doit afficher 4 blocs vides avec un bouton '+ Ajouter un repas'"
// I previously wrote it with today.meals mapping anyway or something else.
const modeLibreCode = `
                                 <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-zinc-200 mt-4 w-full">
                                    {['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner'].map(mealType => (
                                      <div key={mealType} className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-black transition-colors cursor-pointer" onClick={() => { handleMealClick(mealType, null, 'flexible'); setTimeout(() => setIsScanning(true), 300); }}>
                                        <p className="text-xs font-black uppercase text-zinc-500">{mealType}</p>
                                        <button className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                           <Plus size={14}/> Ajouter un repas
                                        </button>
                                      </div>
                                    ))}
                                 </div>
`;
// Let's replace the whole `trackingMode === 'flexible'` block inside `repasCode`!
const flexibleMatch = newGrid.match(/\{trackingMode === 'flexible' \? \([\s\S]*?\) : \(/);
if(flexibleMatch) {
    content = content.substring(0, startIdx) + todayContent.replace(flexibleMatch[0], `{trackingMode === 'flexible' ? (${modeLibreCode}) : (`) + content.substring(endIdx);
} else {
    content = content.substring(0, startIdx) + todayContent + content.substring(endIdx);
}

fs.writeFileSync('src/app/nutrition/page.tsx', content);
