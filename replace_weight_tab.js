const fs = require('fs');
const file = 'src/app/nutrition/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update Chart Col Span
content = content.replace(
  '<div className="md:col-span-12 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col min-h-[300px]">',
  '<div className="col-span-12 lg:col-span-8 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col min-h-[300px]">'
);

// 2. Insert Community Card after Chart
const communityCard = `

                        {/* Top Right: Community */}
                        <div className="col-span-12 lg:col-span-4 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col min-h-[300px] justify-between">
                            <h3 className="text-sm font-black text-black mb-4">Community</h3>
                            <div className="flex-grow flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                                <div className="flex items-start gap-3 bg-zinc-50/80 p-3 rounded-2xl">
                                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1777038379/11_z46c3q.webp" alt="Aïssatou K." className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                                    <div className="bg-[#39FF14] text-black text-xs font-bold p-3 rounded-2xl rounded-tl-sm shadow-sm relative"><span className="absolute -left-2 top-0 text-[10px] bg-yellow-400 w-4 h-4 rounded-full flex items-center justify-center shadow-sm">1</span>Walcom, la broslen en rééquilibrage alimentaire?</div>
                                </div>
                                <div className="flex items-start gap-3 bg-zinc-50/80 p-3 rounded-2xl flex-row-reverse">
                                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1777038379/12_n3j04q.webp" alt="Penda D." className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                                    <div className="bg-[#39FF14] text-black text-xs font-bold p-3 rounded-2xl rounded-tr-sm shadow-sm relative"><span className="absolute -right-2 top-0 text-[10px] bg-zinc-300 w-4 h-4 rounded-full flex items-center justify-center shadow-sm">2</span>Droecane de rééquilibrage alimentaire comimoms.</div>
                                </div>
                                <div className="flex items-start gap-3 bg-zinc-50/80 p-3 rounded-2xl">
                                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1777038379/02_p5h94e.webp" alt="Amadou T." className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                                    <div className="bg-white border border-zinc-100 text-black text-xs font-bold p-3 rounded-2xl rounded-tl-sm shadow-sm relative"><span className="absolute -left-2 top-0 text-[10px] bg-amber-600 text-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm">3</span>What's so rééquilibrage alimentaire coammems?</div>
                                </div>
                            </div>
                            <button onClick={() => setActiveTab('community')} className="w-full mt-4 bg-[#39FF14] hover:bg-[#32e612] text-black font-black uppercase text-xs py-3 rounded-xl transition-colors shadow-sm tracking-widest">Join Discussion</button>
                        </div>
`;

content = content.replace(
  '                        {/* Bottom Left: Current vs Target Weight */}',
  communityCard + '                        {/* Bottom Left: Current vs Target Weight */}'
);


// 3. Update Current vs Target Col Span
content = content.replace(
  '<div className="md:col-span-6 lg:col-span-4 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col justify-between relative overflow-hidden">',
  '<div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col justify-between relative overflow-hidden cursor-pointer" onClick={() => setShowWeightModal(true)}>'
);

// 4. Update BMI Col Span
content = content.replace(
  '<div className="md:col-span-6 lg:col-span-8 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col">',
  '<div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col">'
);

// 5. Insert Recipes and Fitness after BMI Card
const additionalCards = `

                        {/* Bottom Recipes */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white flex flex-col h-[300px]">
                            <h3 className="text-sm font-black text-black mb-3 px-2">Recipes</h3>
                            <div className="relative flex-grow rounded-2xl overflow-hidden mb-3">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783286332/IMG-20250820-WA0117_iegikb.jpg" alt="Recipe of the day" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <p className="text-white text-xs font-bold leading-tight">{trackingMode === 'guided' ? "Recette de votre plan" : "Recette minceur recommandée"}</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveTab('favorites')} className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 text-black font-black uppercase text-[10px] py-2.5 rounded-xl transition-colors shadow-sm tracking-widest">View Recipes</button>
                        </div>

                        {/* Bottom Fitness */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white flex flex-col h-[300px]">
                            <h3 className="text-sm font-black text-black mb-3 px-2">Fitness</h3>
                            <div className="relative flex-grow rounded-2xl overflow-hidden group cursor-pointer" onClick={() => setActiveTab('fitness')}>
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783286277/Woman_wearing_workout_clothes_2K_202607052117_cn1ehb.jpg" alt="Fitness" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-x-3 bottom-3">
                                    <button className="w-full bg-[#39FF14] hover:bg-[#32e612] text-black font-black uppercase text-[10px] py-2.5 rounded-xl transition-colors shadow-md tracking-widest">Start Workout</button>
                                </div>
                            </div>
                        </div>
`;

content = content.replace(
  '                    </div>\n                </div>\n            </div>\n        )}',
  additionalCards + '                    </div>\n                </div>\n            </div>\n        )}'
);


fs.writeFileSync(file, content);
console.log('Update complete');
