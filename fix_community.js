const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// I am going to replace the current Community Feed logic with the requested screenshot reference style.
// The user says:
// "je voudrais que longlet communautés ressemble a celui du screen avec les images le feed etc.. mais en faisant encore mieux et encore plus interactif pour mon application sa doit etre un espace qui pousse à rester un taux de rétention élévé"
// The screenshot provided shows:
// - Left column: "Favorites" list with avatars and names. "Community" list with avatars. "Following" list with avatars.
// - Center column: Posts with image, interaction bar (like, save, comments). Top of center has a search bar "Search Feed..."
// - Right column: "Show my Task" button. A calendar widget. A profile card (Makise Kurisu with followers, likes, posts). A "Notifications" section with reminders (Workout Reminder, Sleep Reminder, Time to hydrate).

// Let's create an incredible UI for the Community tab!
// The user wants a high retention space. We can add to the 3-column layout:
// - Left Col: Favorites (coach, active members), Groupes.
// - Center Col: Search feed, Create post widget, Feed with full images.
// - Right Col: Mini profile stats (XP, Niveau, Bilans), Notifications/Reminders (Hydration, Workout).

const communityStartIdx = content.indexOf(`{activeTab === 'community' && (\n          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">`);
const communityEndIdx = content.indexOf(`{/* MODALE LEADERBOARD */}`);
if (communityStartIdx !== -1 && communityEndIdx !== -1) {
    const newCommunityTab = `
        {activeTab === 'community' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 w-full">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                     <h2 className={\`\${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-3\`}><Heart className="text-[#39FF14] bg-black p-2 rounded-xl" size={40}/> Onyx Community</h2>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center bg-white border border-zinc-200 rounded-full px-4 py-2 flex-1 md:w-64 shadow-sm">
                            <Search size={16} className="text-zinc-400" />
                            <input type="text" placeholder="Search Feed..." className="bg-transparent border-none text-xs text-black outline-none w-full ml-2 placeholder:text-zinc-400" />
                        </div>
                     </div>
                 </div>

                 {/* Grille 3 Colonnes */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                     {/* Colonne Gauche : Favoris & Communauté (3 cols) */}
                     <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
                         <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
                             <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Favoris</p>
                             <div className="space-y-4">
                                 {['Coach Rokhy', 'Dr. Thierno', 'Amina Fall'].map((name, i) => (
                                     <div key={i} className="flex items-center justify-between cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-xl transition-colors group">
                                         <div className="flex items-center gap-3">
                                             <img src={\`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=random\`} className="w-10 h-10 rounded-full border border-zinc-200" alt={name} />
                                             <p className="text-xs font-bold text-black group-hover:text-[#39FF14] transition-colors">{name}</p>
                                         </div>
                                         <Heart size={14} className="text-red-500 fill-red-500" />
                                     </div>
                                 ))}
                             </div>
                         </div>

                         <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
                             <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Abonnements</p>
                             <div className="space-y-4">
                                 {['Sophie Diop', 'Marietou Sall', 'Ndeye Ndiaye'].map((name, i) => (
                                     <div key={i} className="flex items-center justify-between cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-xl transition-colors group">
                                         <div className="flex items-center gap-3">
                                             <img src={\`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=random\`} className="w-8 h-8 rounded-full border border-zinc-200 grayscale group-hover:grayscale-0 transition-all" alt={name} />
                                             <p className="text-xs font-bold text-black group-hover:text-[#39FF14] transition-colors">{name}</p>
                                         </div>
                                         <button className="text-[10px] font-black text-zinc-400 hover:text-black">Suivre</button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>

                     {/* Colonne Centrale : Feed (6 cols) */}
                     <div className="col-span-1 lg:col-span-6 space-y-6">
                        {/* Zone de Création */}
                        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm focus-within:border-[#39FF14]/50 transition-colors">
                           {newPostImage && (
                               <div className="relative w-full h-48 mb-4 rounded-2xl overflow-hidden border border-zinc-200">
                                  <img src={newPostImage} className="w-full h-full object-cover" />
                                  <button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500"><X size={14}/></button>
                               </div>
                           )}
                           <div className="flex items-start gap-4">
                               <img src={user?.avatar_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(user?.full_name || 'Membre')}&background=random\`} className="w-10 h-10 rounded-full border border-zinc-200 mt-1" alt="Moi" />
                               <div className="flex-1">
                                   <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Partagez votre dernier repas ou un accomplissement sportif..." className="w-full bg-transparent resize-none outline-none font-medium text-sm min-h-[60px] placeholder:text-zinc-400 mt-2" />
                               </div>
                           </div>
                           <div className="flex justify-between items-center mt-2 pt-4 border-t border-zinc-100">
                              <div className="flex gap-2">
                                  <label className="text-zinc-500 hover:text-black transition-colors p-2 cursor-pointer bg-zinc-50 hover:bg-zinc-100 rounded-xl flex items-center gap-2">
                                     <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                                     {uploadingImage ? <Activity size={16} className="animate-spin" /> : <Camera size={16}/>}
                                     <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Photo</span>
                                  </label>
                              </div>
                              <button onClick={handlePostCommunity} disabled={!newPostText.trim() && !newPostImage} className="bg-black text-[#39FF14] px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Publier</button>
                           </div>
                        </div>

                        {/* Le Feed */}
                        <div className="space-y-6">
                           {Array.isArray(communityPosts) && communityPosts.length > 0 ? communityPosts.map((post, idx) => (
                              <div key={post.id || idx} className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex flex-col group">
                                 <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-black text-[#39FF14] rounded-full flex items-center justify-center font-black text-xl shadow-inner">{post.client?.charAt(0) || 'M'}</div>
                                        <div>
                                            <p className="font-black text-sm text-black flex items-center gap-1">{post.client || 'Membre'} <CheckCircle size={12} className="text-[#39FF14] fill-[#39FF14] text-black"/></p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{post.created_at && !isNaN(new Date(post.created_at).getTime()) ? new Date(post.created_at).toLocaleString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : 'Récemment'}</p>
                                        </div>
                                     </div>
                                     <MoreHorizontal size={18} className="text-zinc-400 cursor-pointer hover:text-black transition-colors" />
                                 </div>

                                 <p className="text-sm font-medium text-zinc-700 mb-4 whitespace-pre-wrap leading-relaxed">{post.content || post.texte}</p>

                                 {post.image_url && (
                                     <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-zinc-100 bg-zinc-50 relative cursor-pointer" onClick={() => window.open(post.image_url, '_blank')}>
                                         <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" alt="Post" />
                                     </div>
                                 )}

                                 <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                     <div className="flex items-center gap-6">
                                         <button className={\`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors text-zinc-400 hover:text-red-500\`}>
                                             <Heart size={16} />
                                             {post.reactions?.top || post.reactions?.length || Math.floor(Math.random() * 50) + 1} Likes
                                         </button>
                                         <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                                             <MessageSquare size={16}/> {post.comments?.length || Math.floor(Math.random() * 10)} Réponses
                                         </button>
                                     </div>
                                     <button className="text-zinc-400 hover:text-black transition-colors">
                                         <Bookmark size={18} />
                                     </button>
                                 </div>
                              </div>
                           )) : (
                               <div className="text-center py-16 px-6 text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-[2rem] bg-white">
                                   <Camera size={40} className="mx-auto mb-4 text-zinc-300"/>
                                   Soyez le premier à partager votre assiette ! 📸
                               </div>
                           )}
                        </div>
                     </div>

                     {/* Colonne Droite : Mini Profil & Notifications (3 cols) */}
                     <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">

                         {/* Mini Profile Card */}
                         <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm relative">
                             <div className="h-24 bg-gradient-to-r from-black to-zinc-800 w-full relative">
                                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                             </div>
                             <div className="px-6 pb-6 relative flex flex-col items-center">
                                 <img src={user?.avatar_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(user?.full_name || 'Membre')}&background=random\`} className="w-20 h-20 rounded-full border-4 border-white shadow-md -mt-10 mb-3 bg-zinc-100 object-cover" alt="Moi" />
                                 <div className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm absolute top-4 left-4">Onyx Plus</div>

                                 <p className="text-sm font-black text-black text-center">{user?.full_name || 'Membre'}</p>
                                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1 mb-6 text-center">Niveau {lvlInfo.name}</p>

                                 <div className="grid grid-cols-3 w-full gap-4 text-center border-t border-zinc-100 pt-4 mb-6">
                                     <div>
                                         <p className="text-lg font-black text-black">{jongomaXP}</p>
                                         <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Score XP</p>
                                     </div>
                                     <div>
                                         <p className="text-lg font-black text-black">1.2k</p>
                                         <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Followers</p>
                                     </div>
                                     <div>
                                         <p className="text-lg font-black text-black">{(communityPosts.filter(p => p.client === user?.full_name).length) || 0}</p>
                                         <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Posts</p>
                                     </div>
                                 </div>

                                 <button onClick={openLeaderboard} className="w-full bg-black text-[#39FF14] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-md">
                                     Voir mon classement
                                 </button>
                             </div>
                         </div>

                         {/* Notifications / Reminders */}
                         <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex-1">
                             <div className="flex justify-between items-center mb-6">
                                 <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Notifications</p>
                                 <button className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest hover:text-black transition-colors">See All</button>
                             </div>

                             <div className="space-y-6">
                                 <div className="flex items-start gap-4">
                                     <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                         <Droplet size={14}/>
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-1">
                                             <p className="text-xs font-bold text-black">Time to hydrate!</p>
                                             <p className="text-[9px] text-zinc-400">1h ago</p>
                                         </div>
                                         <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">Il te manque encore {8 - waterGlasses} verres d'eau pour atteindre ton objectif du jour. Bois un verre maintenant !</p>
                                     </div>
                                 </div>

                                 <div className="flex items-start gap-4">
                                     <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                         <Activity size={14}/>
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-1">
                                             <p className="text-xs font-bold text-black">Workout Reminder</p>
                                             <p className="text-[9px] text-zinc-400">2h ago</p>
                                         </div>
                                         <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">Tu as une session "Cardio Intense" prévue dans 30 minutes. Prépare tes baskets !</p>
                                     </div>
                                 </div>

                                 <div className="flex items-start gap-4">
                                     <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                         <Moon size={14}/>
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-1">
                                             <p className="text-xs font-bold text-black">Sleep Reminder</p>
                                             <p className="text-[9px] text-zinc-400">Hier</p>
                                         </div>
                                         <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">Il est temps de se déconnecter des écrans pour un sommeil réparateur.</p>
                                     </div>
                                 </div>
                             </div>
                         </div>

                     </div>
                 </div>
          </div>
        )}
`;

    content = content.substring(0, communityStartIdx) + newCommunityTab + "\n\n" + content.substring(communityEndIdx);

    // Also, we need to import Bookmark icon from lucide-react
    if (!content.includes("Bookmark,")) {
        content = content.replace("lucide-react\";", "Bookmark, \n} from \"lucide-react\";");
    }

    fs.writeFileSync('src/app/nutrition/page.tsx', content);
    console.log("Replaced community feed with high-retention mock-up style.");
}
