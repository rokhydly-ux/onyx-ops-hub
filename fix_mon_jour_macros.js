const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// The Guided Mode in Mon Jour currently renders calories but NO macros:
// <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'}\`}>{recipe.calories || recipe.kcal || recipe.calorie || recipe.energy || "—"} kcal</span>
// We will replace this to render all 4 macros using the icons

const guidedCalsRegex = /<span className=\{\`text-\[10px\] font-bold \$\{isConsumed \? 'text-\[\#39FF14\]' : 'text-zinc-500'\}\`\}>\{recipe\.calories \|\| recipe\.kcal \|\| recipe\.calorie \|\| recipe\.energy \|\| "—"\} kcal<\/span>/g;

const detailedMacrosGuided = `
                                             <div className="flex gap-2">
                                                <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1\`}><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {recipe.calories || recipe.kcal || recipe.energy || "—"} kcal</span>
                                                <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1\`}><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {recipe.proteins || 0}g</span>
                                                <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1\`}><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {recipe.carbs || 0}g</span>
                                                <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1\`}><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {recipe.fats || 0}g</span>
                                             </div>
`;

pageCode = pageCode.replace(guidedCalsRegex, detailedMacrosGuided);


// The Mode Libre currently renders:
// <span className="text-[10px] font-bold text-zinc-500 shrink-0">{m.calories} kcal</span>
// Let's add macros there too:
const libreCalsRegex = /<span className="text-\[10px\] font-bold text-zinc-500 shrink-0">\{m\.calories\} kcal<\/span>/g;
const detailedMacrosLibre = `
                                           <div className="flex items-center gap-2 shrink-0">
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {m.calories || 0} kcal</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {m.prots || 0}g</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {m.carbs || 0}g</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {m.fats || 0}g</span>
                                           </div>
`;
pageCode = pageCode.replace(libreCalsRegex, detailedMacrosLibre);

// Sama Menu
// The Sama menu currently renders:
// <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'}`}>{isExpertMode ? `${...} kcal` : ...}</span>
// Let's replace the whole span
const samaCalsRegex = /<span className=\{\`text-\[10px\] font-bold \$\{isConsumed \? 'text-\[\#39FF14\]' : 'text-zinc-500'\}\`\}>\{isExpertMode \? \`\$\{.*?\} kcal\` : \(recipe\.ux_unit \|\| "1 portion"\)\}<\/span>/g;
const detailedMacrosSama = `
                                          {isExpertMode ? (
                                             <div className="flex gap-2">
                                                <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1\`}><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {recipe.calories || recipe.kcal || recipe.energy || "—"} kcal</span>
                                                <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1\`}><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {recipe.proteins || 0}g</span>
                                                <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1\`}><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {recipe.carbs || 0}g</span>
                                                <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1\`}><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {recipe.fats || 0}g</span>
                                             </div>
                                          ) : (
                                             <span className={\`text-[10px] font-bold \${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'}\`}>{recipe.ux_unit || "1 portion"}</span>
                                          )}
`;
pageCode = pageCode.replace(samaCalsRegex, detailedMacrosSama);

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log("Added 3D macro icons for all 3 list types.");
