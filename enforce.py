import re

with open("src/app/nutrition/page.tsx", "r") as f:
    content = f.read()

# 1. Enforce Backgrounds again
content = content.replace(
'''      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444564/A_cute__highly_detailed_3D_202606141342_yn2v23.jpg')"
  ];''',
'''      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444564/A_cute__highly_detailed_3D_202606141342_yn2v23.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1784458141/Dark_African_pattern_neon_lines_202607191030_dzkpqx.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1784458141/Dark_luxury_kitchen_countertop_s__202607191030_knxbcx.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1784458141/Woven_fabric_texture_charcoal_green_202607191031_hrc1bw.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1784458140/Baobab_leaves__hibiscus_flowers__2K_202607191031_gfkclt.jpg')"
  ];'''
)

# Replace the specific mapping of background styles
# We already used `style={backgroundImage: ...}` in a previous step, but let's double check it.

# 2. Re-apply reactions pointer down and z-index 50 (if they were reverted)
content = content.replace(
'''                                 <div className="flex items-center justify-between pt-4 border-t border-zinc-100 relative">
                                     <div className="flex items-center gap-6">
                                         <div className="relative" onMouseEnter={() => setActiveReactionPostId(post.id)} onMouseLeave={() => setActiveReactionPostId(null)}>
                                             {activeReactionPostId === post.id && (
                                                 <div className="absolute bottom-10 left-0 bg-white dark:bg-zinc-800 shadow-lg rounded-full p-2 flex gap-3 z-20 border border-zinc-100 dark:border-zinc-700 animate-in slide-in-from-bottom-2 fade-in">
                                                     <button onClick={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Like'); }} className="hover:scale-125 transition-transform" title="Like">👍</button>
                                                     <button onClick={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Amour'); }} className="hover:scale-125 transition-transform" title="Amour">❤️</button>
                                                     <button onClick={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Contane'); }} className="hover:scale-125 transition-transform" title="Contane">😄</button>
                                                     <button onClick={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Faché'); }} className="hover:scale-125 transition-transform" title="Faché">😡</button>
                                                     <button onClick={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Fier'); }} className="hover:scale-125 transition-transform" title="Fier">🔥</button>
                                                 </div>
                                             )}
                                             <button onClick={() => handleLikePost(post.id, 'Like')} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${post._likedByMe ? (post._myReaction?.color || 'text-blue-500') : 'text-zinc-400 hover:text-blue-500'}`}>''',
'''                                 <div className="flex items-center justify-between pt-4 border-t border-zinc-100 relative">
                                     <div className="flex items-center gap-6">
                                         <div className="relative" onMouseEnter={() => setActiveReactionPostId(post.id)} onMouseLeave={() => setActiveReactionPostId(null)}>
                                             {activeReactionPostId === post.id && (
                                                 <div className="absolute bottom-10 left-0 bg-white dark:bg-zinc-800 shadow-lg rounded-full p-2 flex gap-3 z-50 border border-zinc-100 dark:border-zinc-700 animate-in slide-in-from-bottom-2 fade-in">
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Like'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Like">👍</button>
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Amour'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Amour">❤️</button>
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Contane'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Contane">😄</button>
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Faché'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Faché">😡</button>
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Fier'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Fier">🔥</button>
                                                 </div>
                                             )}
                                             <button onClick={() => handleLikePost(post.id, 'Like')} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${post._likedByMe ? (post._myReaction?.color || 'text-blue-500') : 'text-zinc-400 hover:text-blue-500'}`}>'''
)

# 3. Add the Club icon
content = content.replace(
'''                     <h2 className={`${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-3`}><Heart className="text-[#39FF14] bg-black p-2 rounded-xl" size={40}/> Club des Lekkologues</h2>''',
'''                     <h2 className={`${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-3`}><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783098237/8_v1l6ms.png" alt="Lekkologue Icon" className="w-10 h-10 object-contain drop-shadow-md" /> Club des Lekkologues</h2>'''
)

# 4. Challenge feed widget
content = content.replace(
'''                         {/* CHALENGES TENDANCE WIDGET */}
                         {activeChallenge && (
                             <div onClick={() => setShowChallengeModal(true)} className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-3xl group-hover:bg-[#39FF14]/10 transition-colors"></div>
                                 <div className="flex justify-between items-start mb-4 relative z-10">
                                     <div>
                                         <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">En cours</span>
                                         <h3 className="font-poppins-black text-black dark:text-white leading-tight">{activeChallenge.title}</h3>
                                     </div>
                                     <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center shrink-0">
                                         <Trophy className="text-orange-500 w-5 h-5"/>
                                     </div>
                                 </div>
                                 <p className="text-xs text-zinc-500 font-poppins mb-4 relative z-10 line-clamp-2">{activeChallenge.description}</p>
                                 <div className="flex justify-between items-center relative z-10">
                                     <span className="text-[10px] font-black uppercase text-zinc-400">{activeChallenge.end_date ? new Date(activeChallenge.end_date).toLocaleDateString('fr-FR') : ''}</span>
                                     <button className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] bg-black px-4 py-2 rounded-xl group-hover:scale-105 transition-transform">Voir le défi</button>
                                 </div>
                             </div>
                         )}''',
'''                         {/* CHALENGES TENDANCE WIDGET */}
                         {activeChallenge && (
                             <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-[2rem] p-0 shadow-sm relative overflow-hidden group transition-all">
                                 <div className="h-40 relative bg-black cursor-pointer" onClick={() => setShowChallengeModal(true)}>
                                     {activeChallenge.cover_url?.includes('.mp4') ? (
                                         <video src={activeChallenge.cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                     ) : (
                                         <img src={activeChallenge.cover_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg"} className="w-full h-full object-cover" />
                                     )}
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                     <div className="absolute top-4 left-4">
                                         <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">En cours</span>
                                     </div>
                                     <div className="absolute bottom-4 left-4 right-4">
                                         <h3 className="font-poppins-black text-white text-lg leading-tight line-clamp-2">{activeChallenge.title}</h3>
                                     </div>
                                 </div>
                                 <div className="p-5">
                                     <p className="text-xs text-zinc-500 font-poppins mb-4 line-clamp-2">{activeChallenge.description}</p>
                                     <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-zinc-500">
                                         <Users className="w-4 h-4 text-zinc-400" />
                                         {challengeParticipants} participants
                                     </div>
                                     <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl mb-4">
                                         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-orange-500 animate-pulse">
                                             <Clock className="w-4 h-4" />
                                             {activeChallenge.end_date ? Math.ceil((new Date(activeChallenge.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0} jours restants
                                         </div>
                                         <span className="text-[10px] font-bold text-zinc-400">{activeChallenge.end_date ? new Date(activeChallenge.end_date).toLocaleDateString('fr-FR') : ''}</span>
                                     </div>
                                     <div className="flex gap-2">
                                         <button onClick={() => setShowChallengeModal(true)} className="flex-1 text-[10px] font-black uppercase tracking-widest text-black bg-[#39FF14] px-4 py-3 rounded-xl hover:scale-105 transition-transform shadow-sm">Détails</button>
                                         {isParticipating && (
                                             <button onClick={async () => {
                                                 if (!activeChallenge || !clientProfile) return;
                                                 setIsSaving(true);
                                                 try {
                                                     await supabase.from('nutrition_challenge_participants').delete().eq('challenge_id', activeChallenge.id).eq('client_id', clientProfile.id);
                                                     setIsParticipating(false);
                                                     setChallengeParticipants(prev => Math.max(0, prev - 1));
                                                 } catch(e) { console.error(e); }
                                                 setIsSaving(false);
                                             }} disabled={isSaving} className="flex-1 text-[10px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl transition-colors flex items-center justify-center">
                                                 {isSaving ? <Activity className="animate-spin w-4 h-4"/> : "Se désinscrire"}
                                             </button>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         )}'''
)

# 5. Fix challenge modal UI
content = content.replace(
'''                      {isParticipating ? (
                          <div className="space-y-3">
                              <button disabled className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                                  <CheckCircle size={18} className="text-[#39FF14]" /> Déjà Inscrit
                              </button>
                          </div>
                      ) : (
                          <button onClick={() => { handleJoinChallenge(); setShowChallengeModal(false); }} disabled={isSaving} className="w-full bg-black text-[#39FF14] hover:bg-zinc-900 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_10px_40px_rgba(57,255,20,0.2)] hover:shadow-[0_10px_40px_rgba(57,255,20,0.4)] transition-all flex items-center justify-center gap-2">
                              {isSaving ? <Activity className="animate-spin"/> : <><Trophy size={18}/> Relever le défi</>}
                          </button>
                      )}''',
'''                      <div className="flex items-center gap-2 mb-6 text-sm font-black uppercase tracking-widest text-zinc-500 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl justify-center">
                          <Users className="w-5 h-5 text-[#39FF14]" />
                          {challengeParticipants} participants
                      </div>

                      {isParticipating ? (
                          <div className="space-y-3">
                              <div className="w-full bg-[#39FF14]/10 text-green-700 dark:text-[#39FF14] border border-[#39FF14]/30 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                  <CheckCircle size={18} className="text-[#39FF14]" /> Participation validée
                              </div>
                              <button onClick={async () => {
                                  if (!activeChallenge || !clientProfile) return;
                                  setIsSaving(true);
                                  try {
                                      await supabase.from('nutrition_challenge_participants').delete().eq('challenge_id', activeChallenge.id).eq('client_id', clientProfile.id);
                                      setIsParticipating(false);
                                      setChallengeParticipants(prev => Math.max(0, prev - 1));
                                  } catch(e) { console.error(e); }
                                  setIsSaving(false);
                              }} disabled={isSaving} className="w-full text-zinc-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors py-2 flex items-center justify-center gap-2">
                                  {isSaving ? <Activity className="animate-spin w-4 h-4"/> : "Se désinscrire"}
                              </button>
                          </div>
                      ) : (
                          <button onClick={() => { handleJoinChallenge(); setShowChallengeModal(false); }} disabled={isSaving} className="w-full bg-black text-[#39FF14] hover:bg-zinc-900 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_10px_40px_rgba(57,255,20,0.2)] hover:shadow-[0_10px_40px_rgba(57,255,20,0.4)] transition-all flex items-center justify-center gap-2">
                              {isSaving ? <Activity className="animate-spin"/> : <><Trophy size={18}/> Relever le défi</>}
                          </button>
                      )}'''
)

content = content.replace(
'''                              <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Temps restant</p>
                                  <p className="text-sm font-bold text-black dark:text-white">Se termine le {new Date(activeChallenge.end_date).toLocaleDateString('fr-FR')}</p>
                              </div>''',
'''                              <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Temps restant</p>
                                  <p className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                                      <span className="animate-pulse text-orange-500">{Math.ceil((new Date(activeChallenge.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} jours</span>
                                      <span className="text-zinc-400 text-xs">(Se termine le {new Date(activeChallenge.end_date).toLocaleDateString('fr-FR')})</span>
                                  </p>
                              </div>'''
)

with open("src/app/nutrition/page.tsx", "w") as f:
    f.write(content)
