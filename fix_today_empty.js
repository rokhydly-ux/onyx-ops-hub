const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The `activeTab === 'today'` got completely deleted! Let's insert it right before `{activeTab === 'week' && (`

const insertIdx = content.indexOf(`        {activeTab === 'week' && (`);

const newTodayBlock = `
        {activeTab === 'today' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div className="flex items-center gap-4">
                  <img src={MENU_ICONS.monJour} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Mon Jour" />
                  <div>
                     <h2 className={\`\${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black\`}>Mon Jour</h2>
                     <p className="text-zinc-500 font-bold text-xs mt-1 max-w-lg leading-relaxed">
                       Enregistrez vos repas, suivez votre eau et complétez votre bilan de la journée.
                     </p>
                  </div>
               </div>

               {/* Switch Mode Guidé / Flexible */}
               <div className="bg-zinc-100 p-1.5 rounded-full inline-flex relative shadow-inner shrink-0 h-fit">
                  <button onClick={() => handleTrackingModeChange('guided')} className={\`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all \${trackingMode === 'guided' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-400 hover:text-black'}\`}>Mode Guidé</button>
                  <button onClick={() => handleTrackingModeChange('flexible')} className={\`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all \${trackingMode === 'flexible' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-400 hover:text-black'}\`}>Mode Libre</button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* COLONNE GAUCHE (1/3) */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* 1. Le Pie Chart (Calories/Macros) ici */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center">
                   <div className="relative w-40 h-40 shrink-0 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie data={[{name: 'Consommé', value: calories}, {name: 'Restant', value: remainingCalories}]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" startAngle={90} endAngle={-270}>
                               <Cell key="cell-0" fill="#39FF14" />
                               <Cell key="cell-1" fill="#f4f4f5" />
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                         <p className="text-2xl font-black text-black leading-none">{calories}</p>
                         <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">/ {targetCalories} kcal</p>
                      </div>
                   </div>

                   <div className="w-full space-y-4">
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]">Protéines</span>
                            <span className="text-zinc-500 text-[9px]">{proteins} / {proteinGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: \`\${Math.min((proteins / proteinGoal) * 100, 100)}%\` }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]">Glucides</span>
                            <span className="text-zinc-500 text-[9px]">{carbs} / {carbsGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: \`\${Math.min((carbs / carbsGoal) * 100, 100)}%\` }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]">Lipides</span>
                            <span className="text-zinc-500 text-[9px]">{fats} / {fatsGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: \`\${Math.min((fats / fatsGoal) * 100, 100)}%\` }}></div>
                         </div>
                      </div>
                   </div>
                </div>

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
                {/* 1. La liste des repas (Sama Menu ou Mode Libre) */}
                {trackingMode === 'guided' ? (
                   (() => {
                       const todayMenu = weeklyGeneratedMenu.find(d => d.day === formattedCurrentDay);
                       if (!todayMenu) return <div className="bg-white border border-zinc-200 p-8 text-center text-zinc-500 font-bold rounded-[2.5rem] shadow-sm">Aucun menu généré pour aujourd'hui. Veuillez générer votre Sama Menu.</div>;

                       return (
                           <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden flex flex-col relative">
                              <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                                 <img src={todayMenu.meals?.['Déjeuner']?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'} alt="Repas" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                                    <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest mb-1">Déjeuner</p>
                                    <p className="text-white font-bold text-lg leading-tight line-clamp-1">{todayMenu.meals?.['Déjeuner']?.nom || 'Repas'}</p>
                                 </div>
                              </div>

                              <div className="p-5 flex-1 flex flex-col gap-3">
                                 {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                                    const recipe = todayMenu.meals?.[mealType];
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
                   })()
                ) : (
                   /* MODE LIBRE */
                   <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm flex-1">
                     <div className="mb-4">
                        <h3 className="font-black text-lg text-black uppercase tracking-tighter">Menu Libre</h3>
                        <p className="text-zinc-500 text-xs font-bold">Composez votre assiette avec vos propres repas.</p>
                     </div>
                     {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                         const loggedMeals = consumedMeals.filter((m: any) => m.type === mealType);
                         return (
                           <div key={mealType} className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-black transition-colors cursor-pointer" onClick={() => { handleMealClick(mealType, null, 'flexible'); setTimeout(() => setIsScanning(true), 300); }}>
                             <div className="flex justify-between items-center">
                                 <p className="text-xs font-black uppercase text-zinc-500">{mealType}</p>
                                 <button className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={14}/> Ajouter un repas
                                 </button>
                             </div>
                             {loggedMeals.length > 0 && (
                                 <div className="mt-2 space-y-1">
                                    {loggedMeals.map((m: any, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100">
                                           <span className="text-xs font-bold text-[#39FF14] truncate">{m.name}</span>
                                           <span className="text-[10px] font-bold text-zinc-500 shrink-0">{m.calories} kcal</span>
                                        </div>
                                    ))}
                                 </div>
                             )}
                           </div>
                         )
                     })}
                   </div>
                )}

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
                     <p className="text-zinc-300 font-bold text-[10px] uppercase tracking-widest text-center">
                       Ajuster mes objectifs et mes mensurations
                     </p>
                  </div>
                </button>
              </div>
            </div>

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
          </div>
        )}

`;

if (insertIdx !== -1) {
    content = content.substring(0, insertIdx) + newTodayBlock + content.substring(insertIdx);
    fs.writeFileSync('src/app/nutrition/page.tsx', content);
    console.log("Restored activeTab === 'today'");
}
