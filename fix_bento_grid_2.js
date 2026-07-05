const fs = require('fs');
const path = require('path');

const bentoPath = path.join(__dirname, 'src/components/dashboard/BentoDashboardView.tsx');
let bentoCode = fs.readFileSync(bentoPath, 'utf8');

// Update Grid Column Spans
bentoCode = bentoCode.replace(/<div className="col-span-1 md:col-span-2 lg:col-span-7 rounded-\[\2rem\] bg-white/g, `<div className="col-span-1 md:col-span-2 lg:col-span-6 rounded-[2rem] bg-white`);
bentoCode = bentoCode.replace(/<div className="col-span-1 lg:col-span-5 rounded-\[\2rem\] bg-white/g, `<div className="col-span-1 lg:col-span-3 rounded-[2rem] bg-white`);


// Insert the Hydration Card
const hydrationCardJSX = `
                {/* 3. Hydratation (NEW) */}
                <div className="col-span-1 lg:col-span-3 bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col justify-between h-full min-h-[300px] group cursor-pointer relative" onClick={() => handleUpdateWater(1)}>
                  {/* Image de fond avec masque de dégradé (L'image de la femme qui boit) */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783099524/Woman_drinking_clear_water_2K_202607031724_wuqqco.jpg"
                      className="w-full h-full object-cover opacity-40"
                      alt="Hydratation"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
                  </div>

                  {/* Contenu z-10 */}
                  <div className="relative z-10 p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hydratation</p>
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shadow-sm">
                        <Droplet size={14} className="text-blue-500" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-3xl font-black text-black">{waterGlasses}</span>
                        <span className="text-xs font-bold text-zinc-500 mb-1">/ 8 verres</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: \`\${(waterGlasses / 8) * 100}%\` }}></div>
                      </div>
                      <p className="text-[9px] font-bold text-blue-600 mt-3 uppercase tracking-widest flex items-center gap-1">
                        <Plus size={10}/> Clic pour ajouter
                      </p>
                    </div>
                  </div>
                </div>

                {/* LIGNE 2 : Nutrition & Programme */}`;

bentoCode = bentoCode.replace(/\{\/\* LIGNE 2 : Nutrition & Programme \*\/\}/g, hydrationCardJSX);

fs.writeFileSync(bentoPath, bentoCode, 'utf8');
console.log('Fixed Bento Grid Layout');
