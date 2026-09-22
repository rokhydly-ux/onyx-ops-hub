import re

with open('src/components/nutrition/tabs/CommunityTab.tsx', 'r') as f:
    content = f.read()

old_reactions = """                {/* Footer Actions (Reaction Bar) */}
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
                </div>"""

new_reactions = """                {/* Footer Actions (Reaction Bar) */}
                <div className="absolute bottom-0 left-0 w-full p-4 z-50 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4">
                    <input type="text" placeholder="Répondre..." className="flex-1 bg-black/40 border border-white/30 rounded-full px-4 py-3 text-white text-sm outline-none placeholder:text-white/50 focus:border-white transition-colors backdrop-blur-md" onClick={(e) => { e.stopPropagation(); setToastMessage("Réponses en DM bientôt !"); }} />
                    <button onClick={async (e) => {
                        e.stopPropagation();
                        if(clientProfile && groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex]) {
                            try {
                                await supabase.from('nutrition_story_reactions').insert({
                                    story_id: groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].id,
                                    client_id: clientProfile.id,
                                    reaction_type: 'heart'
                                });
                                setToastMessage("❤️ Réaction envoyée !");
                            } catch(err) { console.error(err); }
                        }
                        }} className="p-3 text-white hover:text-red-500 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md">
                        <Heart size={28} />
                    </button>
                    <button onClick={async (e) => {
                        e.stopPropagation();
                        if(clientProfile && groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex]) {
                            try {
                                await supabase.from('nutrition_story_reactions').insert({
                                    story_id: groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].id,
                                    client_id: clientProfile.id,
                                    reaction_type: 'fire'
                                });
                                setToastMessage("🔥 Réaction envoyée !");
                            } catch(err) { console.error(err); }
                        }
                        }} className="p-3 text-white hover:text-orange-500 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md">
                        <Flame size={28} />
                    </button>
                    <button onClick={async (e) => {
                        e.stopPropagation();
                        if(clientProfile && groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex]) {
                            try {
                                await supabase.from('nutrition_story_reactions').insert({
                                    story_id: groupedStories[viewerActiveGroupIndex].stories[viewerActiveStoryIndex].id,
                                    client_id: clientProfile.id,
                                    reaction_type: 'laugh'
                                });
                                setToastMessage("😂 Réaction envoyée !");
                            } catch(err) { console.error(err); }
                        }
                        }} className="p-3 text-white hover:text-yellow-500 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md text-2xl leading-none">
                        😂
                    </button>
                </div>"""
content = content.replace(old_reactions, new_reactions)

with open('src/components/nutrition/tabs/CommunityTab.tsx', 'w') as f:
    f.write(content)

print("Story reactions updated!")
