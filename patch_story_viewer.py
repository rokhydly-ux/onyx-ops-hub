import re

with open('src/components/nutrition/tabs/CommunityTab.tsx', 'r') as f:
    content = f.read()

# Add Full Screen Story Viewer
viewer_jsx = """
          {/* STORY VIEWER FULL SCREEN */}
          <AnimatePresence>
            {viewerActiveGroupIndex !== null && groupedStories[viewerActiveGroupIndex] && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center touch-none">

                {/* Progress Bars */}
                <div className="absolute top-4 left-0 w-full px-4 flex gap-1 z-50">
                    {groupedStories[viewerActiveGroupIndex].stories.map((s: any, i: number) => (
                        <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className={`h-full bg-white transition-all duration-100 ease-linear ${i < viewerActiveStoryIndex ? 'w-full' : (i === viewerActiveStoryIndex ? 'w-[' + viewerProgress + '%]' : 'w-0')}`} style={{ width: i === viewerActiveStoryIndex ? `${viewerProgress}%` : (i < viewerActiveStoryIndex ? '100%' : '0%') }} />
                        </div>
                    ))}
                </div>

                {/* Header Profile */}
                <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <img src={groupedStories[viewerActiveGroupIndex].client.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(groupedStories[viewerActiveGroupIndex].client.full_name || 'Membre')}&background=random`} className="w-10 h-10 rounded-full border border-white" alt="Avatar" />
                       <div>
                           <p className="text-white font-bold text-sm leading-none drop-shadow-md">{groupedStories[viewerActiveGroupIndex].client.full_name}</p>
                           <p className="text-white/70 text-xs font-medium drop-shadow-md">{new Date(groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       </div>
                   </div>
                   <button onClick={handleCloseViewer} className="text-white p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors backdrop-blur-md">
                       <X size={24} />
                   </button>
                </div>

                {/* Tap Zones for Navigation */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-40" onClick={handlePrevStory} />
                <div className="absolute inset-y-0 right-0 w-1/3 z-40" onClick={handleNextStory} />

                {/* Hold to pause zone */}
                <div className="absolute inset-0 z-30" onPointerDown={pauseStory} onPointerUp={resumeStory} onPointerLeave={resumeStory} />

                {/* Main Media */}
                <div className="w-full h-full flex items-center justify-center max-w-lg mx-auto relative overflow-hidden bg-zinc-900">
                    {groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].media_type === 'video' ? (
                        <video src={groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].media_url} autoPlay playsInline muted={isVideoMuted} onEnded={handleNextStory} className="w-full h-full object-cover" />
                    ) : (
                        <img src={groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].media_url} alt="Story" className="w-full h-full object-contain" />
                    )}

                    {/* Caption Overlay */}
                    {groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].caption && (
                       <div className="absolute bottom-24 left-4 right-4 z-40 text-center">
                           <span className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium inline-block max-w-full break-words shadow-lg border border-white/10">
                               {groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].caption}
                           </span>
                       </div>
                    )}
                </div>

                {/* Footer Actions (Reaction Bar) */}
                <div className="absolute bottom-0 left-0 w-full p-4 z-50 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4">
                    <input type="text" placeholder="Répondre..." className="flex-1 bg-black/40 border border-white/30 rounded-full px-4 py-3 text-white text-sm outline-none placeholder:text-white/50 focus:border-white transition-colors backdrop-blur-md" onClick={(e) => { e.stopPropagation(); setToastMessage("Réponses en DM bientôt !"); }} />
                    <button onClick={(e) => { e.stopPropagation(); setToastMessage("❤️ Réaction envoyée !"); }} className="p-3 text-white hover:text-red-500 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md">
                        <Heart size={28} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setToastMessage("🔥 Réaction envoyée !"); }} className="p-3 text-white hover:text-orange-500 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md">
                        <Flame size={28} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setToastMessage("😂 Réaction envoyée !"); }} className="p-3 text-white hover:text-yellow-500 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md text-2xl leading-none">
                        😂
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
"""

# Insert before </> which is at the end
content = content.replace("    </>\n  );\n}", viewer_jsx + "\n    </>\n  );\n}")

with open('src/components/nutrition/tabs/CommunityTab.tsx', 'w') as f:
    f.write(content)

print("Story Viewer added!")
