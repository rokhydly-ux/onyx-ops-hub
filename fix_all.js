const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// 1. Remove the old black header and horizontal navigation
const oldHeaderStartRegex = /<div className="lg:hidden p-4 bg-black flex justify-between items-center sticky top-0 z-40 shadow-md">/;
const oldHeaderEndRegex = /<\/header>/;

let oldHeaderStartIdx = pageContent.search(oldHeaderStartRegex);
if (oldHeaderStartIdx !== -1) {
    let oldHeaderEndIdx = pageContent.indexOf('</header>', oldHeaderStartIdx);
    if (oldHeaderEndIdx !== -1) {
        pageContent = pageContent.substring(0, oldHeaderStartIdx) + pageContent.substring(oldHeaderEndIdx + 9);
        console.log("Removed old black header from page.tsx");
    }
}

// 2. Change background to gradient
pageContent = pageContent.replace(/<main className=\{`flex-1 flex flex-col min-w-0 overflow-x-hidden w-full transition-all duration-500 `\}>/, `<main className={\`flex-1 flex flex-col min-w-0 overflow-x-hidden w-full transition-all duration-500 bg-gradient-to-br from-white to-[#39FF14]/5\`}>`);


// 3. Ensure the greeting and badges are right above BentoDashboardView
// Let's replace `<div className="w-full max-w-7xl mx-auto px-6 mt-12 space-y-12">` with the new structure.
const bentoContainerStart = `<div className="w-full max-w-7xl mx-auto px-6 mt-12 space-y-12">`;
if (pageContent.includes(bentoContainerStart) && !pageContent.includes("<!-- GREETING INJECTED -->")) {
    const greetingJSX = `
        {activeTab === 'today' && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4">
            <div>
              {isOffline && (
                 <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md w-max mb-2"><WifiOff size={10}/> Mode Hors-ligne</span>
              )}
              <h1 className={\`\${spaceGrotesk.className} text-[2.5rem] md:text-4xl font-black uppercase tracking-tighter text-black\`}>
                {greetingText}, <span className="text-zinc-600">{user?.full_name?.split(' ')[0] || 'Membre'}</span> !
              </h1>
              <p className="text-zinc-500 font-bold text-sm mt-1">{greetingSubtext}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
               <div className={\`flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border \${xpAnimation ? 'border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'border-zinc-200 shadow-sm'} cursor-pointer hover:border-[#39FF14] transition-all duration-300\`} title={lvlInfo.desc + " - Cliquez pour voir le classement"} onClick={openLeaderboard}>
                  <div className={\`w-10 h-10 bg-black rounded-xl flex items-center justify-center text-xl shadow-md border \${xpAnimation ? 'border-[#39FF14] animate-pulse' : 'border-zinc-800'}\`}>{lvlInfo.badge}</div>
                  <div>
                     <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Niveau : <span className="text-zinc-800">{lvlInfo.name}</span></p>
                     <p className="text-black text-xs font-black">{jongomaXP} XP</p>
                  </div>
               </div>
               <div className="bg-white border border-zinc-200 p-2 pr-4 rounded-2xl flex items-center gap-3 shadow-sm cursor-pointer hover:border-[#39FF14] transition-colors" onClick={() => setShowPaymentModal(true)}>
                 <div className="bg-black border border-zinc-800 p-2.5 rounded-xl flex items-center justify-center">
                    <Clock className={daysLeft > 0 ? "text-[#39FF14]" : "text-red-500"} size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Abonnement</p>
                    <p className="text-xs font-black text-black"><strong className={daysLeft > 0 ? "text-green-600" : "text-red-500"}>{daysLeft > 0 ? \`\${daysLeft} jours restants\` : 'Expiré'}</strong></p>
                 </div>
               </div>
            </div>
          </div>
        )}
`;
    pageContent = pageContent.replace(bentoContainerStart, bentoContainerStart + "\n<!-- GREETING INJECTED -->\n" + greetingJSX);
    console.log("Injected greeting and badges.");
}

// Ensure BentoDashboardView receives correct props
pageContent = pageContent.replace(/<BentoDashboardView([\s\S]*?)clientProfile=\{clientProfile\}\s*\/>/g, (match, p1) => {
    if (match.includes("setActiveTab")) return match;
    return `<BentoDashboardView${p1}clientProfile={clientProfile}\n              setActiveTab={setActiveTab}\n              handleMealClick={handleMealClick}\n          />`;
});


fs.writeFileSync('src/app/nutrition/page.tsx', pageContent);

// NOW BentoDashboardView.tsx
let bentoContent = fs.readFileSync('src/components/dashboard/BentoDashboardView.tsx', 'utf8');
// check if it has the updated props
if (!bentoContent.includes("setActiveTab: (tab: string) => void;")) {
    bentoContent = bentoContent.replace(/clientProfile: any;/, "clientProfile: any;\n    setActiveTab: (tab: string) => void;\n    handleMealClick?: (mealType: string, prefillRecipe: any, contextType: string) => void;");
    bentoContent = bentoContent.replace(/clientProfile \}: BentoDashboardViewProps\)/, "clientProfile, setActiveTab, handleMealClick }: BentoDashboardViewProps)");
}

// Remove old bento items and replace with new
const bentoGridStart = `<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">`;
if (bentoContent.includes(bentoGridStart) && !bentoContent.includes("{/* 1. Mon Jour")) {
    const bentoGridIdx = bentoContent.indexOf(bentoGridStart);
    bentoContent = bentoContent.substring(0, bentoGridIdx);

    // Append the correct bento grid
    const correctBentoGrid = `
            {/* Grille Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

                {/* 1. Mon Jour (Validation repas) - prend plus d'espace */}
                <div className="col-span-1 md:col-span-2 lg:col-span-7 rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm flex flex-col min-h-[300px] relative group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setActiveTab('history')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mon Jour</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                        {/* Fake Donut Chart */}
                        <div className="relative w-32 h-32 rounded-full border-8 border-zinc-100 flex items-center justify-center shrink-0">
                            <div className="absolute inset-0 rounded-full border-8 border-[#39FF14] border-t-transparent border-r-transparent rotate-45 transition-all duration-1000"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-black">1240</p>
                                <p className="text-[10px] text-zinc-500 uppercase">/ {clientProfile?.daily_calorie_goal || 1500} Kcal</p>
                            </div>
                        </div>

                        {/* Macros */}
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black">Protéines</span><span className="text-zinc-500">45 / {clientProfile?.protein_goal || 80}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-1/2"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black">Glucides</span><span className="text-zinc-500">120 / {clientProfile?.carbs_goal || 150}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-3/4"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-black">Lipides</span><span className="text-zinc-500">30 / {clientProfile?.fats_goal || 50}g</span></div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-red-400 w-1/3"></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Mon Jour */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <button onClick={(e) => { e.stopPropagation(); handleMealClick?.('Déjeuner', null, 'guided'); }} className="bg-zinc-50 border border-zinc-200 hover:border-[#39FF14] text-black rounded-xl p-3 text-xs font-bold transition-colors flex items-center justify-center gap-2">
                            🍲 Loguer Repas
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveTab('history'); }} className="bg-[#39FF14] text-black rounded-xl p-3 text-xs font-bold hover:bg-[#32e012] transition-colors flex items-center justify-center gap-2">
                            ✅ Bilan Quotidien
                        </button>
                    </div>
                </div>

                {/* 2. Poids Actuel */}
                <div className="col-span-1 lg:col-span-5 rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between min-h-[300px] group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setActiveTab('weight')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Poids Actuel & Objectif</p>
                        <p className="text-5xl font-black text-black mb-1">{clientProfile?.diagnostic_data?.currentWeight || '--'} <span className="text-xl text-zinc-500">kg</span></p>
                        <p className="text-sm font-bold text-zinc-500">Objectif: <span className="text-[#39FF14]">{clientProfile?.diagnostic_data?.targetWeight || '--'} kg</span></p>
                    </div>

                    <div className="mt-8 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-black">Progression</span>
                            <span className="text-[#39FF14]">30%</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#39FF14] w-[30%]"></div>
                        </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-xl pointer-events-none"></div>
                </div>

                {/* 3. Coach IA (Rokhy) */}
                <div className="col-span-1 lg:col-span-5 rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm flex flex-col justify-between min-h-[300px] relative group" onClick={() => setActiveTab('coaching')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors z-10"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782914179/JEUNE_FILLE_g6qdwc.png" className="w-12 h-12 rounded-full object-cover bg-zinc-200 border-2 border-[#39FF14]" alt="Coach Rokhy" />
                        <div>
                            <p className="text-sm font-bold text-black">Coach Rokhy</p>
                            <p className="text-[10px] text-[#39FF14] uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse"></span> En ligne</p>
                        </div>
                    </div>

                    <div className="flex-1 bg-zinc-50 rounded-xl p-4 mb-4 overflow-y-auto space-y-3 border border-zinc-100 relative z-10">
                        <div className="bg-white border border-zinc-200 text-black text-xs p-3 rounded-2xl rounded-tl-sm w-fit max-w-[85%] shadow-sm">
                            Salut ! T'as bien mangé ton Thiéboudienne ce midi ? Pense à faire léger ce soir, un petit bouillon fera l'affaire.
                        </div>
                    </div>

                    <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="text"
                            value={coachInput}
                            onChange={(e) => setCoachInput(e.target.value)}
                            placeholder="Message Rokhy ou Doc..."
                            className="w-full bg-white border border-zinc-200 rounded-full py-3 pl-4 pr-12 text-xs text-black outline-none focus:border-[#39FF14] transition-colors placeholder:text-zinc-400 shadow-sm"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#39FF14] text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                            <Send size={14} />
                        </button>
                    </div>
                </div>

                {/* 4. Sama Menu du Jour */}
                <div className="col-span-1 lg:col-span-4 rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm relative group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setActiveTab('week')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sama Menu</p>
                    </div>

                    <div className="space-y-3">
                        {/* Repas 1 */}
                        <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 hover:border-[#39FF14]/50 transition-colors">
                            <div className="w-16 h-16 bg-zinc-200 rounded-xl shrink-0 overflow-hidden relative">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781222471/Bouillie_de_mil_r2zihq.jpg" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Petit-Déj • 08:00</p>
                                <p className="text-sm font-black text-black mt-0.5">Fondé & Lait</p>
                            </div>
                        </div>

                        {/* Repas 2 */}
                        <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 hover:border-[#39FF14]/50 transition-colors">
                            <div className="w-16 h-16 bg-zinc-200 rounded-xl shrink-0 overflow-hidden relative">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781221768/Thiebou_dieune_1_hftdhm.jpg" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Déjeuner • 13:30</p>
                                <p className="text-sm font-black text-black mt-0.5 line-clamp-1">Thiéboudienne</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Extrait Communauté */}
                <div className="col-span-1 lg:col-span-3 rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm flex flex-col relative group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setActiveTab('community')}>
                    <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 shrink-0">Communauté</p>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {/* Post 1 */}
                        <div className="border-b border-zinc-100 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white">AM</div>
                                    <div>
                                        <p className="text-xs font-bold text-black">Amina Fall</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-600 mb-3 leading-relaxed line-clamp-3">J'ai atteint mon objectif de pas aujourd'hui ! Le menu guidé m'aide tellement à ne pas craquer le soir.</p>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400"><Heart size={12}/> 24</button>
                                <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400"><MessageSquare size={12}/> 5</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
`;
    bentoContent += correctBentoGrid;
    console.log("Replaced BentoDashboardView Grid.");
}
fs.writeFileSync('src/components/dashboard/BentoDashboardView.tsx', bentoContent);
