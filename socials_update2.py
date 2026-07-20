import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# Add social icons next to the direct message icon in the feed.
search_str = """                                                {post.client_id && post.client_id !== clientProfile?.id && (
                                                    <div className="flex items-center gap-1 ml-2">
                                                        <button className="text-zinc-400 hover:text-[#39FF14] transition-colors" title="Message Privé" onClick={() => alert("La messagerie privée arrive bientôt !")}>
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>
                                                )}"""

replace_str = """                                                {post.client_id && post.client_id !== clientProfile?.id && (
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <button className="text-zinc-400 hover:text-[#39FF14] transition-colors" title="Message Privé" onClick={() => alert("La messagerie privée arrive bientôt !")}>
                                                            <MessageSquare size={14} />
                                                        </button>
                                                        {post.clients?.nutrition_profiles?.[0]?.diagnostic_data?.instagram && (
                                                            <a href={`https://instagram.com/${post.clients.nutrition_profiles[0].diagnostic_data.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors" title="Instagram">
                                                                <Instagram size={14} />
                                                            </a>
                                                        )}
                                                        {post.clients?.nutrition_profiles?.[0]?.diagnostic_data?.facebook && (
                                                            <a href={`https://facebook.com/${post.clients.nutrition_profiles[0].diagnostic_data.facebook.replace('/','')}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-500 transition-colors" title="Facebook">
                                                                <Facebook size={14} />
                                                            </a>
                                                        )}
                                                        {post.clients?.nutrition_profiles?.[0]?.diagnostic_data?.twitter && (
                                                            <a href={`https://twitter.com/${post.clients.nutrition_profiles[0].diagnostic_data.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-sky-500 transition-colors" title="Twitter / X">
                                                                <Twitter size={14} />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}"""

content = content.replace(search_str, replace_str)

# Ensure lucide-react has Instagram, Facebook, Twitter
if "Instagram, " not in content:
    content = content.replace("import { ", "import { Instagram, Facebook, Twitter, ")

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)
