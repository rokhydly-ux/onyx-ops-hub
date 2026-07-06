const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The Pie Chart was missing. Let's add it back in the 'today' tab where it shows the current day's meals.
const pieChartStr = `
            {/* GRAPHIQUE CALORIQUE */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-8 mb-8">
               <div className="relative w-48 h-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={[{name: 'Consommé', value: calories}, {name: 'Restant', value: remainingCalories}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" startAngle={90} endAngle={-270}>
                           <Cell key="cell-0" fill="#39FF14" />
                           <Cell key="cell-1" fill="#f4f4f5" />
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                     <p className="text-3xl font-black text-black leading-none">{calories}</p>
                     <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">/ {targetCalories} kcal</p>
                  </div>
               </div>

               <div className="flex-1 w-full space-y-5">
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-black uppercase tracking-widest">Protéines</span>
                        <span className="text-zinc-500">{proteins} / {proteinGoal}g</span>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: \`\${Math.min((proteins / proteinGoal) * 100, 100)}%\` }}></div>
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-black uppercase tracking-widest">Glucides</span>
                        <span className="text-zinc-500">{carbs} / {carbsGoal}g</span>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: \`\${Math.min((carbs / carbsGoal) * 100, 100)}%\` }}></div>
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-black uppercase tracking-widest">Lipides</span>
                        <span className="text-zinc-500">{fats} / {fatsGoal}g</span>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: \`\${Math.min((fats / fatsGoal) * 100, 100)}%\` }}></div>
                     </div>
                  </div>
               </div>
            </div>
`;

// Insert the pie chart into `today` just after the tracking mode switch
content = content.replace(/\{(\/\* Repas du Jour \*\/)/, pieChartStr + "\n                {$1");

// Replace water icon
content = content.replace(/<Droplet size=\{32\}\/>/, `<img src={WATER_ICON} className="w-10 h-10 object-contain mx-auto mb-2" />`);

// Refaire diagnostic button
const refaireBtnRegex = /<div className="flex justify-center mt-8">\s*<button onClick=\{\(\) => setShowRedoDiagModal\(true\)\} className="bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">\s*<Settings size=\{14\}\/> Refaire mon diagnostic\s*<\/button>\s*<\/div>/;
const newRefaireBtn = `<button onClick={() => setShowRedoDiagModal(true)} className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.4)] animate-pulse flex justify-center items-center gap-2 mb-6">
                           <Target size={16}/> Refaire mon diagnostic
                        </button>`;
content = content.replace(refaireBtnRegex, "");
content = content.replace(/\{(\/\* Tracking Eau & Bilan \*\/)/, newRefaireBtn + "\n                {$1");

// Tracking Mode Logic for Flexible
// "Si trackingMode === 'flexible', la liste ne doit pas mapper le todayPlan.meals. Elle doit afficher 4 blocs vides avec un bouton '+ Ajouter un repas'"
const trackingModeLogic = `
                           <div className="p-5 flex-1 flex flex-col gap-3">
                              {trackingMode === 'flexible' ? (
                                 (isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                                    const isConsumed = consumedMeals.some((m: any) => m.type === mealType);
                                    const loggedMeal = consumedMeals.find((m: any) => m.type === mealType);
                                    return (
                                       <div key={mealType} className={\`flex justify-between items-center p-4 rounded-2xl transition-all \${isConsumed ? 'bg-[#39FF14]/15 shadow-sm opacity-90 border border-[#39FF14]' : 'bg-zinc-50 border border-zinc-100 border-dashed'}\`}>
                                          <div className="flex-1 min-w-0 pr-2">
                                             <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">{mealType}</p>
                                             {isConsumed ? (
                                                <p className="text-xs font-bold text-[#39FF14] truncate">{loggedMeal.name} ✅</p>
                                             ) : (
                                                <p className="text-xs font-bold text-zinc-400 italic">Libre</p>
                                             )}
                                          </div>
                                          <div className="text-right shrink-0">
                                             {!isConsumed ? (
                                                <button onClick={(e) => { e.stopPropagation(); handleMealClick(mealType, null, 'flexible'); setTimeout(() => setIsScanning(true), 300); }} className="bg-black text-[#39FF14] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm hover:scale-105 transition-transform flex items-center gap-1"><Search size={10}/> Ajouter</button>
                                             ) : (
                                                <span className="text-[10px] font-bold text-[#39FF14]">{loggedMeal.calories} kcal</span>
                                             )}
                                          </div>
                                       </div>
                                    )
                                 })
                              ) : (
                                 (isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
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
                                 })
                              )}
                           </div>
`;
content = content.replace(/<div className="p-5 flex-1 flex flex-col gap-3">[\s\S]*?<\/div>\s*<\/div>\s*\)\s*\}\)\(\)\}/, trackingModeLogic + "\n                        </div>\n                    )\n                })()}");

fs.writeFileSync('src/app/nutrition/page.tsx', content);

// Boutique in BentoDashboardView bottom row has already been replaced by Galerie Recettes, Minute Doc, Fitness.
// The user asks for Boutique section in `activeTab === 'today'`
const boutiqueGrid = `
            {/* Suggestions Boutique */}
            <div className="bg-white border border-zinc-200 shadow-sm rounded-[2rem] p-8 mt-12 relative overflow-hidden">
               <h3 className="text-xl font-black uppercase text-black mb-6 flex items-center gap-2"><ShoppingCart className="text-[#39FF14] bg-black p-1.5 rounded-lg" size={24}/> La Boutique Onyx</h3>
               <p className="text-zinc-500 font-bold text-sm mb-6">Boostez vos résultats avec nos produits 100% naturels.</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {crossSellProducts.slice(0,3).map((p: any) => (
                     <div key={p.id} className="bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden flex flex-col group cursor-pointer hover:border-[#39FF14] transition-colors" onClick={() => setActiveTab('shop')}>
                        <div className="h-40 w-full relative">
                            <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                           <p className="text-sm font-black text-black group-hover:text-[#39FF14] transition-colors line-clamp-1">{p.nom}</p>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 mb-4">{p.prix_standard} FCFA</p>
                           <button className="mt-auto w-full bg-black text-[#39FF14] py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                              Voir le produit
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
`;
content = content.replace(/\{\/\* Suggestions Boutique \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/, boutiqueGrid + "\n          </div>\n        )}");
fs.writeFileSync('src/app/nutrition/page.tsx', content);
