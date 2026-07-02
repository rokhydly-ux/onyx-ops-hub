const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// 1. Remove the old "Refaire diagnostic" button that I injected in the wrong place earlier
const oldRefaireBtn = `<button onClick={() => setShowRedoDiagModal(true)} className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.4)] animate-pulse flex justify-center items-center gap-2 mb-6">
                           <Target size={16}/> Refaire mon diagnostic
                        </button>`;
content = content.replace(oldRefaireBtn, "");

// 2. Wrap "Objectif Eau" and "Bilan" in a grid, and add the new "Refaire diagnostic" widget
// We need to replace:
//                 {/* Tracking Eau & Bilan */}
//                 <div className="space-y-6 flex flex-col">
//                     <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center text-center">
// ...
//                     <div className="bg-[#39FF14] p-6 rounded-[2rem] border border-black shadow-sm flex flex-col justify-center items-center text-center mt-auto cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowDailyReport(true)}>
// ...
//                 </div>
//             </div>

const trackingEauBlockStart = `{/* Tracking Eau & Bilan */}`;
const trackingEauIdx = content.indexOf(trackingEauBlockStart);
if (trackingEauIdx !== -1) {
    // Find the end of the `space-y-6 flex flex-col` div.
    // It ends right before `</div>\n\n            \n            {/* Suggestions Boutique */}`
    const trackingEauEndIdx = content.indexOf(`            {/* Suggestions Boutique */}`, trackingEauIdx);

    if (trackingEauEndIdx !== -1) {
        // The block we are replacing
        const newBlock = `
                {/* Tracking Eau & Bilan */}
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                        {/* Objectif Eau */}
                        <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                               <img src={WATER_ICON} className="w-10 h-10 object-contain mx-auto mb-2" />
                            </div>
                            <h3 className="font-black text-lg uppercase tracking-tighter text-black mb-1">Objectif Eau</h3>
                            <p className="text-zinc-500 font-bold text-xs mb-6">{waterGlasses} / 8 verres (1.5L)</p>

                            <div className="flex gap-2 flex-wrap justify-center mb-6">
                                {Array.from({length: 8}, (_, i) => (
                                    <button key={i} onClick={() => handleUpdateWater(i + 1 - waterGlasses)} className={\`w-8 h-10 rounded-lg transition-colors \${i < waterGlasses ? 'bg-blue-500' : 'bg-zinc-100 hover:bg-blue-100'}\`}></button>
                                ))}
                            </div>
                            <button onClick={() => handleUpdateWater(1)} className="w-full bg-black text-[#39FF14] py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">
                               + Ajouter un verre
                            </button>
                        </div>

                        {/* Bilan de la journée */}
                        <div className="bg-[#39FF14] p-6 rounded-[2rem] border border-black shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowDailyReport(true)}>
                            <CheckCircle size={32} className="text-black mb-3"/>
                            <h3 className="font-black text-xl uppercase tracking-tighter text-black mb-2">Bilan de la journée</h3>
                            <p className="text-black/70 font-bold text-xs">Clôturez votre journée pour gagner de l'XP et adapter le menu de demain.</p>
                        </div>
                    </div>

                    {/* Nouveau Widget Refaire mon diagnostic */}
                    <button
                      onClick={() => setShowRedoDiagModal(true)}
                      className="relative w-full rounded-[2rem] overflow-hidden group shadow-lg h-48 md:h-56 flex items-center justify-center border-2 border-transparent hover:border-[#39FF14] transition-all"
                    >
                      {/* Background Image */}
                      <img
                        src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783002400/A_high-end__photorealistic_commercial_shot_202607021426_vutjqi.jpg"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Refaire Diagnostic"
                      />
                      {/* Dark Overlay with Blur */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40 backdrop-blur-[2px]"></div>

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                         <div className="bg-[#39FF14] text-black p-3 rounded-full animate-pulse shadow-[0_0_30px_rgba(57,255,20,0.6)]">
                           <Target size={24} />
                         </div>
                         <h3 className={\`\${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase text-white tracking-tighter drop-shadow-md\`}>
                           Refaire mon diagnostic
                         </h3>
                         <p className="text-zinc-300 font-bold text-xs uppercase tracking-widest">
                           Ajuster mes objectifs et mes mensurations
                         </p>
                      </div>
                    </button>
                </div>
            </div>

`;
        content = content.substring(0, trackingEauIdx) + newBlock + content.substring(trackingEauEndIdx);
        fs.writeFileSync('src/app/nutrition/page.tsx', content);
        console.log("Replaced Eau & Bilan layout with correct grid and Refaire button.");
    }
}
