const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');
// The "today" tab logic was incorrectly replaced or was actually named 'week' in the codebase.
// "Sama Menu" is activeTab === 'week'.
// "Mon Jour" should be activeTab === 'today'.
// The user says: "activeTab === 'today' affiche l'ancienne vue détaillée d'enregistrement des repas."
// The old view detailed was previously under "week" which was "Sama Menu".
// Let's change the string "activeTab === 'week'" to "activeTab === 'today'" for the detailed tracking.

pageContent = pageContent.replace(/\{activeTab === 'week' && \(/, "{activeTab === 'today' && (");

// Replace 'Sama Menu' with 'Mon Jour' in the header of that block
pageContent = pageContent.replace(/<h2 className=\{`\$\{spaceGrotesk.className\} text-3xl font-black uppercase tracking-tighter text-black`\}>Sama Menu<\/h2>/, '<h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Mon Jour</h2>');

fs.writeFileSync('src/app/nutrition/page.tsx', pageContent);

// NOW for BentoDashboardView.tsx bottom widgets
let bentoContent = fs.readFileSync('src/components/dashboard/BentoDashboardView.tsx', 'utf8');

// Add Water widget
const passWidgetRegex = /<div className="rounded-\[2rem\] bg-white border border-\[\#39FF14\]\/50 shadow-sm p-6 backdrop-blur-sm flex flex-col justify-between h-32">\s*<p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Activité<\/p>[\s\S]*?<\/div>/;

if (!bentoContent.includes("Eau / Objectif")) {
    const waterWidget = `
                    <div className="rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 backdrop-blur-sm flex flex-col justify-between h-32 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => handleMealClick?.('Water', null, 'water')}>
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hydratation</p>
                            <Droplet size={16} className="text-blue-500" />
                        </div>
                        <p className="text-3xl font-black text-black">4 <span className="text-sm text-zinc-500">/ 8 verres</span></p>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className={\`h-2 flex-1 rounded-sm \${i <= 4 ? 'bg-blue-500' : 'bg-zinc-100'}\`}></div>
                            ))}
                        </div>
                    </div>
    `;
    bentoContent = bentoContent.replace(/<div className="rounded-\[2rem\] bg-white border border-\[\#39FF14\]\/50 shadow-sm p-6 backdrop-blur-sm flex flex-col justify-between h-32">\s*<div className="flex justify-between items-start">\s*<p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sommeil<\/p>[\s\S]*?<\/div>\s*<\/div>/, "");
    bentoContent = bentoContent.replace(/<div className="rounded-\[2rem\] bg-white border border-\[\#39FF14\]\/50 shadow-sm p-6 backdrop-blur-sm flex flex-col justify-between h-32">\s*<div className="flex justify-between items-start">\s*<p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hydratation<\/p>[\s\S]*?<\/div>\s*<\/div>/, waterWidget);
}


// Replace the "Feed Communautaire" at the bottom with the 3 widgets (Galerie, Doc, Fitness)
const bottomWidgets = `
                {/* LIGNE 4 : Navigation Rapide */}
                <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Galerie Recettes */}
                    <div className="rounded-[2rem] bg-white border border-[#39FF14]/50 shadow-sm p-6 relative group cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between h-40" onClick={() => setActiveTab('favorites')}>
                        <button className="absolute top-6 right-6 text-zinc-400 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Galerie Recettes</p>
                            <p className="text-lg font-black text-black leading-tight">Découvre les nouveaux plats du mois</p>
                        </div>
                        <div className="flex gap-2">
                           <div className="w-10 h-10 bg-zinc-200 rounded-xl overflow-hidden"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781223916/Ndambe_qeq2d8.jpg" className="w-full h-full object-cover"/></div>
                           <div className="w-10 h-10 bg-zinc-200 rounded-xl overflow-hidden"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781221768/Thiebou_dieune_1_hftdhm.jpg" className="w-full h-full object-cover"/></div>
                        </div>
                    </div>

                    {/* La Minute Doc */}
                    <div className="rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-xl p-6 relative group cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between h-40" onClick={() => setActiveTab('minute-doc')}>
                        <button className="absolute top-6 right-6 text-zinc-500 group-hover:text-[#39FF14] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                        <div>
                            <p className="text-xs font-bold text-[#39FF14] uppercase tracking-widest mb-1">La Minute Doc</p>
                            <p className="text-lg font-black text-white leading-tight">Conseils du Dr. Thierno en vidéo</p>
                        </div>
                    </div>

                    {/* Fitness */}
                    <div className="rounded-[2rem] bg-[#39FF14] border border-[#39FF14] shadow-sm p-6 relative group cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between h-40" onClick={() => setActiveTab('fitness')}>
                        <button className="absolute top-6 right-6 text-black/50 group-hover:text-black transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
                        <div>
                            <p className="text-xs font-bold text-black/70 uppercase tracking-widest mb-1">Fitness & Sport</p>
                            <p className="text-lg font-black text-black leading-tight">Ton programme sportif t'attend !</p>
                        </div>
                    </div>
                </div>
`;

if (!bentoContent.includes("LIGNE 4 : Navigation Rapide")) {
    const communityFeedIdx = bentoContent.indexOf(`{/* 5. Extrait Communauté */}`);
    if (communityFeedIdx !== -1) {
        // Insert bottomWidgets after the community grid item
        bentoContent = bentoContent.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/, "</div>\n" + bottomWidgets + "\n            </div>\n        </div>\n    );\n}");
    }
}

fs.writeFileSync('src/components/dashboard/BentoDashboardView.tsx', bentoContent);
