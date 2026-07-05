const fs = require('fs');
const file = 'src/app/nutrition/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const additionalCards = `

                        {/* Bottom Recipes */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white flex flex-col h-[280px]">
                            <h3 className="text-sm font-black text-black mb-3 px-2">Recipes</h3>
                            <div className="relative flex-grow rounded-2xl overflow-hidden mb-3">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783286332/IMG-20250820-WA0117_iegikb.jpg" alt="Recipe of the day" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                    <p className="text-white text-xs font-bold leading-tight">{trackingMode === 'guided' ? "Recette de votre plan" : "Recette minceur recommandée"}</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveTab('favorites')} className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 text-black font-black uppercase text-[10px] py-2.5 rounded-xl transition-colors shadow-sm tracking-widest">View Recipes</button>
                        </div>

                        {/* Bottom Fitness */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white flex flex-col h-[280px]">
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
  '                                    </div>\n                                )}\n                            </div>\n                        </div>\n                    </div>\n                </div>',
  '                                    </div>\n                                )}\n                            </div>\n                        </div>' + additionalCards + '\n                    </div>\n                </div>'
);

fs.writeFileSync(file, content);
console.log('Update complete');
