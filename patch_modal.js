const fs = require('fs');
let content = fs.readFileSync('src/components/nutrition/tabs/CommunityTab.tsx', 'utf8');

const regex = /(<div key=\{post\.id \|\| idx\} className="bg-white border border-zinc-200 rounded-\[2rem\] p-6 shadow-sm flex flex-col group">)/;

const replaceStr = `<React.Fragment key={post.id || idx}>
                                 {/* Injection Challenge Mobile tous les 4 posts */}
                                 {idx > 0 && idx % 4 === 0 && activeChallenge && (
                                     <div id={\`mobile-challenge-\${idx}\`} className="lg:hidden bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-0 shadow-xl relative overflow-hidden group transition-all mb-6 border border-zinc-800">
                                         <div className="h-48 relative bg-black cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }}>
                                             {activeChallenge.cover_url?.includes('.mp4') ? (
                                                 <video src={activeChallenge.cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
                                             ) : (
                                                 <img src={activeChallenge.cover_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg"} className="w-full h-full object-cover opacity-80" />
                                             )}
                                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                             <div className="absolute top-4 left-4 flex gap-2">
                                                 <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1"><Flame size={10} className="fill-black"/> Tendance</span>
                                                 <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">+{activeChallenge.reward_xp || 500} XP</span>
                                             </div>
                                             <div className="absolute bottom-4 left-4 right-4">
                                                 <h3 className="font-poppins-black text-white text-xl leading-tight line-clamp-2 mb-2">{activeChallenge.title}</h3>
                                                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }} className="w-full text-xs font-black uppercase tracking-widest text-black bg-[#39FF14] px-4 py-3 rounded-xl hover:scale-105 transition-transform shadow-[0_5px_15px_rgba(57,255,20,0.2)]">Rejoindre le challenge</button>
                                             </div>
                                         </div>
                                     </div>
                                 )}
$1`;

if (regex.test(content)) {
  content = content.replace(regex, replaceStr);
  const endRegex = /(<\/div>\n\s*\)\) \: \()/;
  if (endRegex.test(content)) {
      content = content.replace(endRegex, "</div></React.Fragment>\n                           )) : (");
  }
}

// Add the modal
const modalStr = `
          <AnimatePresence>
            {showChallengeModal && activeChallenge && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col relative border border-zinc-200 dark:border-zinc-800">

                  {/* Image / Video Cover */}
                  <div className="relative h-64 shrink-0 bg-black">
                     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowChallengeModal(false); }} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md">
                        <X size={20} />
                     </button>
                     {activeChallenge.cover_url?.includes('.mp4') ? (
                         <video src={activeChallenge.cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90" />
                     ) : (
                         <img src={activeChallenge.cover_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg"} className="w-full h-full object-cover opacity-90" />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                     <div className="absolute bottom-6 left-6 right-6">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md mb-3 inline-block">En cours</span>
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{activeChallenge.title}</h2>
                     </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">

                      <div className="flex flex-wrap gap-3 mb-6">
                          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl flex-1 min-w-[120px]">
                              <Users className="w-5 h-5 text-blue-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Participants</p>
                                  <p className="text-sm font-black text-black dark:text-white">{challengeParticipants}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl flex-1 min-w-[120px]">
                              <Clock className="w-5 h-5 text-orange-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Temps Restant</p>
                                  <p className="text-sm font-black text-black dark:text-white">{activeChallenge.end_date ? Math.ceil((new Date(activeChallenge.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0} jours</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl w-full">
                              <Trophy className="w-6 h-6 text-amber-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Récompense</p>
                                  <p className="text-base font-black text-amber-600 dark:text-amber-400">+{activeChallenge.reward_xp || 500} XP</p>
                              </div>
                          </div>
                      </div>

                      <div className="mb-6">
                          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2"><Target size={16}/> Objectif du challenge</h3>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">{activeChallenge.description}</p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl flex justify-between items-center mb-4">
                          <div className="text-center flex-1 border-r border-zinc-200 dark:border-zinc-700">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Début</p>
                              <p className="text-sm font-black text-black dark:text-white">{activeChallenge.start_date ? new Date(activeChallenge.start_date).toLocaleDateString('fr-FR') : 'Immédiat'}</p>
                          </div>
                          <div className="text-center flex-1">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Fin</p>
                              <p className="text-sm font-black text-black dark:text-white">{activeChallenge.end_date ? new Date(activeChallenge.end_date).toLocaleDateString('fr-FR') : 'Continu'}</p>
                          </div>
                      </div>

                  </div>

                  {/* Footer CTA */}
                  <div className="p-4 shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                      {isParticipating ? (
                          <button
                              disabled={isSaving}
                              onClick={async (e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  if (!activeChallenge || !clientProfile) return;
                                  setIsSaving(true);
                                  try {
                                      // Remove participation
                                      await supabase.from('nutrition_challenge_participants').delete().eq('challenge_id', activeChallenge.id).eq('client_id', clientProfile.id);

                                      // Anti-Cheat: Remove XP
                                      const xpToLose = activeChallenge.reward_xp || 500;
                                      const newXp = Math.max(0, (clientProfile.jongoma_xp || 0) - xpToLose);
                                      await supabase.from('clients').update({ jongoma_xp: newXp }).eq('id', clientProfile.id);
                                      setClientProfile({ ...clientProfile, jongoma_xp: newXp });
                                      setJongomaXP(newXp);

                                      setIsParticipating(false);
                                      setChallengeParticipants(prev => Math.max(0, prev - 1));
                                      setToastMessage({ type: 'success', text: \`Vous avez quitté le challenge et perdu \${xpToLose} XP.\` });
                                      setTimeout(() => setToastMessage(null), 3000);
                                      setShowChallengeModal(false);
                                  } catch (e) { console.error(e); }
                                  setIsSaving(false);
                              }}
                              className="w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                          >
                              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Quitter le challenge (-XP)"}
                          </button>
                      ) : (
                          <button
                              disabled={isSaving}
                              onClick={async (e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  if (!activeChallenge || !clientProfile) return;
                                  setIsSaving(true);
                                  try {
                                      // Add participation
                                      await supabase.from('nutrition_challenge_participants').insert({ challenge_id: activeChallenge.id, client_id: clientProfile.id });

                                      // Grant XP
                                      const xpToGain = activeChallenge.reward_xp || 500;
                                      const newXp = (clientProfile.jongoma_xp || 0) + xpToGain;
                                      await supabase.from('clients').update({ jongoma_xp: newXp }).eq('id', clientProfile.id);
                                      setClientProfile({ ...clientProfile, jongoma_xp: newXp });
                                      setJongomaXP(newXp);

                                      setIsParticipating(true);
                                      setChallengeParticipants(prev => prev + 1);
                                      setShowConfetti(true);
                                      setTimeout(() => setShowConfetti(false), 5000);
                                      setXpAnimation({ amount: xpToGain, reason: \`Inscription: \${activeChallenge.title}\`, id: Date.now() });
                                      setTimeout(() => setXpAnimation(null), 3000);
                                      setShowChallengeModal(false);
                                  } catch (e) { console.error(e); }
                                  setIsSaving(false);
                              }}
                              className="w-full bg-[#39FF14] hover:bg-[#32e612] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_10px_30px_rgba(57,255,20,0.3)] hover:shadow-[0_15px_40px_rgba(57,255,20,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
                          >
                              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Rejoindre le challenge"}
                          </button>
                      )}
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
`;
content = content.replace(/^    <\/>/m, modalStr + "\n    </>");

fs.writeFileSync('src/components/nutrition/tabs/CommunityTab.tsx', content, 'utf8');
