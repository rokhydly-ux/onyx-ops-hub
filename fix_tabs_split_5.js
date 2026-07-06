const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// First, change the overall `activeTab === 'today'` (which holds the planner) to `activeTab === 'week'`
const todayStartIdx = content.indexOf(`{activeTab === 'today' && (\n          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">`);
if (todayStartIdx !== -1) {
    content = content.substring(0, todayStartIdx) + `{activeTab === 'week' && (\n          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 w-full">` + content.substring(todayStartIdx + 109);
    console.log("Changed wrapper to week");
}

// Rename Mon Jour to Sama Menu in the planner
content = content.replace(/<h2 className=\{`\$\{spaceGrotesk.className\} text-3xl font-black uppercase tracking-tighter text-black`\}>Mon Jour<\/h2>/g, `<h2 className={\`\${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black\`}>Sama Menu</h2>`);

// Now let's inject a new `activeTab === 'today'` block BEFORE the `week` block.
// The new block will be a copy of the planner, but ONLY showing today's menu, plus the Bilan section.
const todayTabBlock = `
        {activeTab === 'today' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 w-full">
            <div className="flex items-center gap-4 mb-8">
               <img src={MENU_ICONS.monJour} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Mon Jour" />
               <div>
                  <h2 className={\`\${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black\`}>Mon Jour</h2>
                  <p className="text-zinc-500 font-bold text-xs mt-1 max-w-lg leading-relaxed">
                    Enregistrez vos repas, suivez votre eau et complétez votre bilan de la journée.
                  </p>
               </div>
            </div>

            {/* Switch Mode Guidé / Flexible */}
            <div className="flex justify-center mb-8">
               <div className="bg-zinc-100 p-1.5 rounded-full inline-flex relative shadow-inner">
                  <button onClick={() => handleTrackingModeChange('guided')} className={\`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all \${trackingMode === 'guided' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-black'}\`}>Mode Guidé (Sama Menu)</button>
                  <button onClick={() => handleTrackingModeChange('flexible')} className={\`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all \${trackingMode === 'flexible' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-black'}\`}>Mode Libre (Flexible)</button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Repas du Jour */}
                {(() => {
                    const today = weeklyGeneratedMenu.find(d => d.day === formattedCurrentDay);
                    if (!today) return <div className="col-span-full p-8 text-center text-zinc-500 font-bold bg-zinc-50 rounded-3xl border border-zinc-200">Aucun menu généré pour aujourd'hui. Veuillez générer votre Sama Menu.</div>;

                    return (
                        <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95">
                           <div className="absolute top-4 left-4 bg-[#39FF14] text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest z-10 shadow-lg">
                              Aujourd'hui
                           </div>

                           <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                              <img src={today.meals?.['Déjeuner']?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'} alt="Repas" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                                 <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest mb-1">Déjeuner</p>
                                 <p className="text-white font-bold text-lg leading-tight line-clamp-1">{today.meals?.['Déjeuner']?.nom || 'Repas'}</p>
                              </div>
                           </div>

                           <div className="p-5 flex-1 flex flex-col gap-3">
                              {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                                 const recipe = today.meals?.[mealType];
                                 if(!recipe) return null;
                                 const isConsumed = consumedMeals.some((m: any) => m.name === recipe.nom && m.type === mealType);

                                 return (
                                    <div key={mealType} className={\`flex justify-between items-center p-4 rounded-2xl transition-all \${isConsumed ? 'bg-[#39FF14]/15 shadow-sm opacity-90 border border-[#39FF14]' : 'bg-zinc-50 hover:bg-white border border-zinc-100'}\`}>
                                       <div className="flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => handleMealClick(mealType, { type: mealType, meal: recipe.nom, cals: recipe.calories, proteins: recipe.proteins, carbs: recipe.carbs, fats: recipe.fats, recipe: recipe.recipe, bienfaits: recipe.bienfaits }, 'guided')}>
                                          <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">{mealType}</p>
                                          <p className={\`text-xs font-bold truncate \${isConsumed ? 'text-[#39FF14]' : 'text-black'}\`}>{recipe.nom} {isConsumed && '✅'}</p>
                                       </div>
                                       <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                          <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'}\`}>{recipe.calories || recipe.kcal || recipe.calorie || recipe.energy || "—"} kcal</span>
                                          {!isConsumed ? (
                                             <button onClick={(e) => { e.stopPropagation(); confirmMealLog(mealType, recipe.nom, recipe.calories, recipe.proteins, recipe.carbs, recipe.fats, { ux_unit: recipe.ux_unit }); setToastMessage('Ajouté !'); setTimeout(()=>setToastMessage(null), 3000); }} className="bg-[#39FF14] text-black px-2 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm hover:scale-105 transition-transform">➕ Loguer</button>
                                          ) : (
                                             <span className="bg-[#39FF14] text-black px-2 py-1 rounded-lg text-[9px] font-black uppercase shadow-sm">Validé ✅</span>
                                          )}
                                       </div>
                                    </div>
                                 )
                              })}
                           </div>
                        </div>
                    )
                })()}

                {/* Tracking Eau & Bilan */}
                <div className="space-y-6 flex flex-col">
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                           <Droplet size={32}/>
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

                    <div className="bg-[#39FF14] p-6 rounded-[2rem] border border-black shadow-sm flex flex-col justify-center items-center text-center mt-auto cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowDailyReport(true)}>
                        <CheckCircle size={32} className="text-black mb-3"/>
                        <h3 className="font-black text-xl uppercase tracking-tighter text-black mb-2">Bilan de la journée</h3>
                        <p className="text-black/70 font-bold text-xs">Clôturez votre journée pour gagner de l'XP et adapter le menu de demain.</p>
                    </div>
                </div>
            </div>

            {/* Suggestions Boutique */}
            <div className="bg-zinc-950 rounded-[2rem] p-8 mt-12 relative overflow-hidden">
               <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#39FF14]/20 rounded-full blur-3xl pointer-events-none"></div>
               <h3 className="text-xl font-black uppercase text-white mb-6 flex items-center gap-2"><Sparkles className="text-[#39FF14]"/> Pour booster vos résultats</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crossSellProducts.map((p: any) => (
                     <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('shop')}>
                        <img src={p.image_url} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                           <p className="text-sm font-bold text-white group-hover:text-[#39FF14] transition-colors">{p.nom}</p>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{p.prix_standard} FCFA</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex justify-center mt-8">
                <button onClick={() => setShowRedoDiagModal(true)} className="bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                   <Settings size={14}/> Refaire mon diagnostic
                </button>
            </div>
          </div>
        )}
`;

const weekTabStr = `{activeTab === 'week' && (\n          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 w-full">`;
content = content.replace(weekTabStr, todayTabBlock + "\n\n        " + weekTabStr);

fs.writeFileSync('src/app/nutrition/page.tsx', content);
