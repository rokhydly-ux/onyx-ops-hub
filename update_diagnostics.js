const fs = require('fs');

const bentoStepsLanding = `{diagStep !== 10 ? (
                <form onSubmit={handleDiagSubmit} className="w-full">
                  {diagStep === 1 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel est votre sexe ?</h2>
                      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        {[{ id: 'Homme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_format_1_1_en_202606111044_rjknkg.jpg' }, { id: 'Femme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_1_1_en_gardant_202606111043_unmonc.jpg' }].map(option => (
                          <div key={option.id} onClick={() => { setDiagData({...diagData, gender: option.id}); setTimeout(() => setDiagStep(2), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 \${diagData.gender === option.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={option.img} alt={option.id} className="w-full aspect-square object-cover" />
                            <div className="absolute bottom-0 w-full bg-black/80 text-white py-4 font-black uppercase tracking-widest text-sm text-center backdrop-blur-md">{option.id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 2 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel est votre objectif principal ?</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {[
                          { id: 'Perte de poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544253/A_high-end_commercial_photorealistic_full-body_202606151657_cfq5fb.jpg', desc: 'Déficit calorique pour affiner le ventre' },
                          { id: 'Maintien du poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781542708/A_high-end_commercial_photorealistic_portrait_202606151658_noabp9.jpg', desc: 'Stabiliser et manger sainement au quotidien' },
                          { id: 'Prise de masse', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544091/rajoute_le_logo_sur_la_202606151721_aayo61.jpg', desc: 'Développer la masse musculaire' }
                        ].map(goal => (
                          <div key={goal.id} onClick={() => { setDiagData({...diagData, goalType: goal.id}); setTimeout(() => setDiagStep(3), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col \${diagData.goalType === goal.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={goal.img} alt={goal.id} className="w-full aspect-square object-cover" />
                            <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                              <span className="font-black uppercase tracking-widest text-xs md:text-sm mb-1 text-center">{goal.id}</span>
                              <span className="text-[10px] text-zinc-400 font-bold leading-tight text-center">{goal.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 3 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel âge avez-vous ?</h2>
                      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
                        <input type="number" required placeholder="Ex: 30" value={diagData.age} onChange={(e) => setDiagData({...diagData, age: e.target.value})} className="w-full p-5 bg-zinc-50 border-2 border-zinc-200 rounded-2xl font-black text-xl text-center outline-none focus:border-[#39FF14] transition-colors text-black" />
                        <button type="button" onClick={() => { if(diagData.age) setDiagStep(4); }} disabled={!diagData.age} className="w-full mt-6 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">Continuer</button>
                      </div>
                    </div>
                  )}

                  {diagStep === 4 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quelles sont vos mensurations ?</h2>
                      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Taille (cm)</label>
                          <input type="number" required placeholder="Ex: 170" value={diagData.height} onChange={(e) => setDiagData({...diagData, height: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Poids Actuel (kg)</label>
                          <input type="number" required placeholder="Ex: 75" value={diagData.currentWeight} onChange={(e) => setDiagData({...diagData, currentWeight: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <button type="button" onClick={() => setDiagStep(5)} disabled={!diagData.height || !diagData.currentWeight} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">Continuer</button>
                      </div>
                    </div>
                  )}

                  {diagStep === 5 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Avez-vous des conditions spécifiques ?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
                        {['Diabète', 'Hypertension', 'Préménopause ou Ménopause', 'Aucun problème'].map(condition => {
                          const isSelected = diagData.healthProfile === condition;
                          return (
                            <div key={condition} onClick={() => setDiagData({...diagData, healthProfile: condition})} className={\`cursor-pointer border-4 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 \${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}\`}>
                              <span className="font-bold text-sm md:text-base text-black">{condition}</span>
                              <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors \${isSelected ? 'border-[#39FF14] bg-[#39FF14]' : 'border-zinc-300'}\`}>{isSelected && <CheckCircle size={14} className="text-black" />}</div>
                            </div>
                          );
                        })}
                      </div>
                      <button type="button" onClick={() => setDiagStep(6)} disabled={!diagData.healthProfile} className="w-full max-w-lg bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">Continuer</button>
                    </div>
                  )}

                  {diagStep === 6 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Comment déjeunez-vous le midi ?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                        {[
                          { id: 'En solo au bureau', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/La_Gamelle_ywfy3t.jpg', desc: 'Avec ma gamelle / Tupperware' },
                          { id: 'À la maison', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Le_Bol_Commun_hb9fns.jpg', desc: 'Autour du grand bol familial commun' }
                        ].map(habit => (
                          <div key={habit.id} onClick={() => { setDiagData({...diagData, lunchHabit: habit.id}); setTimeout(() => setDiagStep(7), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col \${diagData.lunchHabit === habit.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={habit.img} alt={habit.id} className="w-full h-48 md:h-64 object-cover" />
                            <div className="flex-1 bg-black/90 text-white p-5 flex flex-col justify-center items-center backdrop-blur-md">
                              <span className="font-black uppercase tracking-widest text-sm mb-2 text-center">{habit.id}</span>
                              <span className="text-xs text-zinc-400 font-bold leading-relaxed text-center">{habit.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 7 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Pour qui préparez-vous les repas ?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                        {[
                          { id: 'Je cuisine uniquement pour moi seule', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_moi_seule_mfo6vw.jpg' },
                          { id: 'Je cuisine la marmite pour toute la famille', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_la_famille_qzlwke.jpg' }
                        ].map(habit => (
                          <div key={habit.id} onClick={() => { setDiagData({...diagData, cookingHabit: habit.id}); setTimeout(() => setDiagStep(8), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col \${diagData.cookingHabit === habit.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={habit.img} alt={habit.id} className="w-full h-48 md:h-64 object-cover" />
                            <div className="flex-1 bg-black/90 text-white p-5 flex flex-col justify-center items-center backdrop-blur-md">
                              <span className="font-black uppercase tracking-tight text-sm text-center">{habit.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 8 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel est votre budget courses par semaine ?</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {[
                          { id: 'Budget Serré', price: '8 000 F / semaine', desc: 'La base survie et efficacité', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630660/A_cute__highly_detailed_3D_202606161723_fcl8jj.jpg' },
                          { id: 'Budget Famille', price: '15 000 F / semaine', desc: 'Équilibre, goût et variété', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630665/A_cute__highly_detailed_3D_202606161723_1_rx6yry.jpg' },
                          { id: 'Budget Confort', price: '25 000 F / semaine', desc: 'Santé premium 100% locale', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630664/A_cute__highly_detailed_3D_202606161723_2_xxku54.jpg' }
                        ].map(budget => (
                          <div key={budget.id} onClick={() => { setDiagData({...diagData, weeklyBudget: budget.id}); setTimeout(() => setDiagStep(9), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col \${diagData.weeklyBudget === budget.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={budget.img} alt={budget.id} className="w-full aspect-square object-cover" />
                            <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                              <span className="font-black uppercase tracking-widest text-xs mb-1">{budget.id}</span>
                              <span className="text-[#39FF14] font-bold text-[10px] mb-2">{budget.price}</span>
                              <span className="text-zinc-400 text-[10px] text-center leading-tight">{budget.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 9 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Dernière étape pour finaliser</h2>
                      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 space-y-4">
                        <input type="text" required placeholder="Votre Prénom et Nom" value={diagData.name} onChange={(e) => setDiagData({...diagData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition-colors text-black" />
                        <input type="tel" required placeholder="Numéro WhatsApp" value={diagData.phone} onChange={(e) => setDiagData({...diagData, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition-colors text-black" />
                        <input type="password" required placeholder="Mot de passe" value={diagData.password} onChange={(e) => setDiagData({...diagData, password: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition-colors text-black" />
                        <input type="password" required maxLength={4} placeholder="Code PIN rapide (4 chiffres)" value={diagData.pin} onChange={(e) => setDiagData({...diagData, pin: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition-colors text-black text-center" />
                        <button type="submit" disabled={isSubmittingDiag || !diagData.name || !diagData.phone || !diagData.pin || !diagData.password} className="w-full mt-4 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2">{isSubmittingDiag ? "Calcul en cours..." : "Valider mon profil"} <ArrowRight size={18}/></button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-6 animate-in zoom-in">
                  <CheckCircle className="text-[#39FF14] w-24 h-24 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
                  <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 max-w-xl mx-auto mb-10 text-left shadow-sm">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-800 text-center">Calcul médical terminé. Votre corps a besoin de <strong className="font-black text-black text-3xl">{calculateDailyCalories(diagData)}</strong> kcal/jour.</p>
                    <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-800 mt-6 text-center">La bonne nouvelle ? Vous n'aurez <span className="underline decoration-[#39FF14] decoration-4 font-bold">plus jamais</span> à les compter. Suivez simplement nos portions en bols et cuillères.</p>
                  </div>
                  <button type="button" onClick={() => router.push('/nutrition?from=diagnostic')} className="w-full max-w-md mx-auto bg-[#39FF14] text-black py-6 rounded-2xl font-black uppercase md:text-lg tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(57,255,20,0.4)] animate-pulse flex justify-center items-center gap-2">Découvrir mon Sama Menu</button>
                </div>
              )}`;

const bentoStepsClient = `{diagStep !== 8 ? (
                <form onSubmit={handleDiagSubmit} className="w-full">
                  {diagStep === 1 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel est votre nouvel objectif ?</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {[
                          { id: 'Perte de poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544253/A_high-end_commercial_photorealistic_full-body_202606151657_cfq5fb.jpg', desc: 'Déficit calorique pour affiner le ventre' },
                          { id: 'Maintien du poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781542708/A_high-end_commercial_photorealistic_portrait_202606151658_noabp9.jpg', desc: 'Stabiliser et manger sainement au quotidien' },
                          { id: 'Prise de masse', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544091/rajoute_le_logo_sur_la_202606151721_aayo61.jpg', desc: 'Développer la masse musculaire' }
                        ].map(goal => (
                          <div key={goal.id} onClick={() => { setDiagData({...diagData, goalType: goal.id}); setTimeout(() => setDiagStep(2), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col \${diagData.goalType === goal.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={goal.img} alt={goal.id} className="w-full aspect-square object-cover" />
                            <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                              <span className="font-black uppercase tracking-widest text-xs md:text-sm mb-1 text-center">{goal.id}</span>
                              <span className="text-[10px] text-zinc-400 font-bold leading-tight text-center">{goal.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 2 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quelles sont vos mensurations actuelles ?</h2>
                      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Taille (cm)</label>
                          <input type="number" required placeholder="Ex: 170" value={diagData.height} onChange={(e) => setDiagData({...diagData, height: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Poids Actuel (kg)</label>
                          <input type="number" required placeholder="Ex: 75" value={diagData.currentWeight} onChange={(e) => setDiagData({...diagData, currentWeight: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <button type="button" onClick={() => setDiagStep(3)} disabled={!diagData.height || !diagData.currentWeight} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">Continuer</button>
                      </div>
                    </div>
                  )}

                  {diagStep === 3 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Vos conditions ont-elles changé ?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
                        {['Diabète', 'Hypertension', 'Préménopause ou Ménopause', 'Aucun problème'].map(condition => {
                          const isSelected = diagData.healthProfile === condition;
                          return (
                            <div key={condition} onClick={() => setDiagData({...diagData, healthProfile: condition})} className={\`cursor-pointer border-4 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 \${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}\`}>
                              <span className="font-bold text-sm md:text-base text-black">{condition}</span>
                              <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors \${isSelected ? 'border-[#39FF14] bg-[#39FF14]' : 'border-zinc-300'}\`}>{isSelected && <CheckCircle size={14} className="text-black" />}</div>
                            </div>
                          );
                        })}
                      </div>
                      <button type="button" onClick={() => setDiagStep(4)} disabled={!diagData.healthProfile} className="w-full max-w-lg bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">Continuer</button>
                    </div>
                  )}

                  {diagStep === 4 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Comment déjeunez-vous le midi ?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                        {[
                          { id: 'En solo au bureau', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/La_Gamelle_ywfy3t.jpg', desc: 'Avec ma gamelle / Tupperware' },
                          { id: 'À la maison', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Le_Bol_Commun_hb9fns.jpg', desc: 'Autour du grand bol familial commun' }
                        ].map(habit => (
                          <div key={habit.id} onClick={() => { setDiagData({...diagData, lunchHabit: habit.id}); setTimeout(() => setDiagStep(5), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col \${diagData.lunchHabit === habit.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={habit.img} alt={habit.id} className="w-full h-48 md:h-64 object-cover" />
                            <div className="flex-1 bg-black/90 text-white p-5 flex flex-col justify-center items-center backdrop-blur-md">
                              <span className="font-black uppercase tracking-widest text-sm mb-2 text-center">{habit.id}</span>
                              <span className="text-xs text-zinc-400 font-bold leading-relaxed text-center">{habit.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 5 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Pour qui préparez-vous les repas ?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                        {[
                          { id: 'Je cuisine uniquement pour moi seule', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_moi_seule_mfo6vw.jpg' },
                          { id: 'Je cuisine la marmite pour toute la famille', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_la_famille_qzlwke.jpg' }
                        ].map(habit => (
                          <div key={habit.id} onClick={() => { setDiagData({...diagData, cookingHabit: habit.id}); setTimeout(() => setDiagStep(6), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col \${diagData.cookingHabit === habit.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={habit.img} alt={habit.id} className="w-full h-48 md:h-64 object-cover" />
                            <div className="flex-1 bg-black/90 text-white p-5 flex flex-col justify-center items-center backdrop-blur-md">
                              <span className="font-black uppercase tracking-tight text-sm text-center">{habit.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 6 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Quel est votre budget courses par semaine ?</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {[
                          { id: 'Budget Serré', price: '8 000 F / semaine', desc: 'La base survie et efficacité', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630660/A_cute__highly_detailed_3D_202606161723_fcl8jj.jpg' },
                          { id: 'Budget Famille', price: '15 000 F / semaine', desc: 'Équilibre, goût et variété', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630665/A_cute__highly_detailed_3D_202606161723_1_rx6yry.jpg' },
                          { id: 'Budget Confort', price: '25 000 F / semaine', desc: 'Santé premium 100% locale', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630664/A_cute__highly_detailed_3D_202606161723_2_xxku54.jpg' }
                        ].map(budget => (
                          <div key={budget.id} onClick={() => { setDiagData({...diagData, weeklyBudget: budget.id}); setTimeout(() => setDiagStep(7), 300); }} className={\`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col \${diagData.weeklyBudget === budget.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}\`}>
                            <img src={budget.img} alt={budget.id} className="w-full aspect-square object-cover" />
                            <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                              <span className="font-black uppercase tracking-widest text-xs mb-1">{budget.id}</span>
                              <span className="text-[#39FF14] font-bold text-[10px] mb-2">{budget.price}</span>
                              <span className="text-zinc-400 text-[10px] text-center leading-tight">{budget.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagStep === 7 && (
                    <div className="text-center py-6 animate-in zoom-in">
                      <CheckCircle className="text-[#39FF14] w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-xl font-black uppercase mb-2 text-black">Analyse en cours...</h3>
                      <p className="text-zinc-600 font-medium mb-6">Validez pour générer vos nouveaux objectifs caloriques et votre menu adapté.</p>
                      <button type="submit" disabled={isSubmittingDiag} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase hover:scale-105 transition-transform flex justify-center items-center gap-2">
                        {isSubmittingDiag ? "Recalcul en cours..." : "Mettre à jour mon plan"} <ArrowRight size={18}/>
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-6 animate-in zoom-in">
                  <h3 className="text-2xl font-black uppercase mb-6 text-black">Votre Espace a été mis à jour !</h3>
                  <p className="text-zinc-600 font-medium mb-8">Les nouveaux menus ont été générés selon vos nouveaux paramètres, vous pouvez reprendre le suivi dès maintenant.</p>
                  
                  <div className="flex flex-col gap-3 mt-4">
                     <button onClick={() => setDiagStep(0)} type="button" className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg flex justify-center items-center gap-2">
                        Retourner au Tracker <ArrowRight size={18}/>
                     </button>
                  </div>
                </div>
              )}`;

function doReplace(filePath, startStr, endStr, replacement) {
  let text = fs.readFileSync(filePath, 'utf8');
  let sIdx = text.indexOf(startStr);
  let eIdx = text.indexOf(endStr, sIdx);
  if (sIdx > -1 && eIdx > -1) {
    let newText = text.substring(0, sIdx) + replacement + text.substring(eIdx);
    fs.writeFileSync(filePath, newText, 'utf8');
    console.log('Replaced successfully in ' + filePath);
  } else {
    console.log('Not found in ' + filePath);
  }
}

// FOR LANDING PAGE
doReplace('src/app/solutions/onyx-nutritionafricaine/page.tsx', '{diagStep !== 7 ? (', '{/* MODALE DE PAIEMENT WAVE / OM */}', bentoStepsLanding + '\n            </div>\n          </div>\n        </div>\n      )}\\n\n      {/* MODALE DE PAIEMENT WAVE / OM */}');

// FOR NUTRITION CLIENT SPACE
doReplace('src/app/nutrition/page.tsx', '{diagStep !== 5 ? (', '{/* MODALE DE PAIEMENT WAVE / OM */}', bentoStepsClient + '\n            </div>\n          </div>\n        </div>\n      )}\\n\n      {/* MODALE DE PAIEMENT WAVE / OM */}');
