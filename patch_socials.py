import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# I need to insert social buttons right after the "Suivre" button wrapper inside the flex gap-2 container for the user's name
# <div className="flex items-center gap-2"> ... </div>

# Currently:
#                                             <div className="flex items-center gap-2">
#                                                 <p className="font-black text-sm text-black flex items-center gap-1">{post.client || 'Membre'} <CheckCircle size={12} className="text-[#39FF14] fill-[#39FF14] text-black"/></p>
#                                                 {post.client_id && post.client_id !== clientProfile?.id && (
#                                                     followedUsers.includes(post.client_id) ? (
#                                                         <span className="text-[10px] font-bold text-zinc-400">✓ Abonné</span>
#                                                     ) : (
#                                                         <button onClick={() => handleFollowUser(post.client_id)} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-[#39FF14] px-2 py-0.5 rounded-full font-poppins-bold hover:bg-[#39FF14] hover:text-black transition-all shadow-sm">+ Suivre</button>
#                                                     )
#                                                 )}
#                                             </div>

social_icons_html = """
                                                {/* Socials & DM (Future) */}
                                                {post.client_id && post.client_id !== clientProfile?.id && (
                                                    <div className="flex items-center gap-1 ml-2">
                                                        <button className="text-zinc-400 hover:text-[#39FF14] transition-colors" title="Message Privé" onClick={() => alert("La messagerie privée arrive bientôt !")}>
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>
                                                )}
"""

search_str = '''                                                    )
                                                )}
                                            </div>'''

replace_str = '''                                                    )
                                                )}
                                                {post.client_id && post.client_id !== clientProfile?.id && (
                                                    <div className="flex items-center gap-1 ml-2">
                                                        <button className="text-zinc-400 hover:text-[#39FF14] transition-colors" title="Message Privé" onClick={() => alert("La messagerie privée arrive bientôt !")}>
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>'''

content = content.replace(search_str, replace_str)

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)
