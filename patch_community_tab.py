import re

with open('src/components/nutrition/tabs/CommunityTab.tsx', 'r') as f:
    content = f.read()

# 1. Add replyToCommentId state to CommunityTab
import_react = 'export default function CommunityTab({ ...tabProps }: any) {\n  const [activeFeedFilter, setActiveFeedFilter] = React.useState("all");\n'
new_import_react = 'export default function CommunityTab({ ...tabProps }: any) {\n  const [activeFeedFilter, setActiveFeedFilter] = React.useState("all");\n  const [replyToCommentId, setReplyToCommentId] = React.useState<string | null>(null);\n'
content = content.replace(import_react, new_import_react)

# 2. Add handleViewerSkipForward / handleViewerSkipBackward and handleCloseViewer from page.tsx (they are in tabProps)
# they are destructured in the big list, let's verify if they are destructured.
# We don't need to add it, they are in the huge destructuring.

# Let's fix the comment section first.
old_comment_input = """                                         <div className="flex items-center gap-3">
                                             <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Moi')}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 object-cover shrink-0" alt="Moi"/>
                                             <input type="text" value={newCommentText} onChange={e => setNewCommentText(e.target.value)} placeholder="Écrire un commentaire..." className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-[#39FF14] transition-shadow placeholder:text-zinc-400" onKeyDown={e => e.key === 'Enter' && handlePostComment(post.id)} />
                                             <button onClick={() => handlePostComment(post.id)} disabled={!newCommentText.trim() || isSaving} className="p-2 bg-black text-[#39FF14] rounded-full hover:scale-105 transition-transform disabled:opacity-50"><Send size={16}/></button>
                                         </div>"""

new_comment_input = """                                         <div className="flex items-center gap-3">
                                             <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Moi')}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 object-cover shrink-0" alt="Moi"/>
                                             <div className="flex-1 flex flex-col relative">
                                                {replyToCommentId && (
                                                    <div className="text-[10px] text-zinc-500 mb-1 flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-t-xl -mb-2 z-0 pt-2 pb-3">
                                                        <span>En réponse à un commentaire</span>
                                                        <button onClick={() => { setReplyToCommentId(null); setNewCommentText(""); }} className="hover:text-red-500 font-bold">Annuler</button>
                                                    </div>
                                                )}
                                                <input type="text" value={newCommentText} onChange={e => setNewCommentText(e.target.value)} placeholder="Écrire un commentaire..." className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-[#39FF14] transition-shadow placeholder:text-zinc-400 z-10" onKeyDown={e => { if (e.key === 'Enter') { handlePostComment(post.id, newCommentText, replyToCommentId); setReplyToCommentId(null); setNewCommentText(""); } }} />
                                             </div>
                                             <button onClick={() => { handlePostComment(post.id, newCommentText, replyToCommentId); setReplyToCommentId(null); setNewCommentText(""); }} disabled={!newCommentText.trim() || isSaving} className="p-2 bg-black text-[#39FF14] rounded-full hover:scale-105 transition-transform disabled:opacity-50 shrink-0 mt-auto mb-1"><Send size={16}/></button>
                                         </div>"""
content = content.replace(old_comment_input, new_comment_input)

# Update comment render loop to account for replies (nested comments)
old_comment_loop = """                                             {postComments.length === 0 ? (
                                                 <p className="text-xs text-zinc-400 text-center py-4">Aucun commentaire pour l'instant. Soyez le premier !</p>
                                             ) : (
                                                 postComments.map((c: any, idx: number) => (
                                                     <div key={idx} className="flex gap-3">
                                                         <img src={c.clients?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.clients?.full_name || 'Utilisateur')}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 object-cover shrink-0" alt="Avatar"/>
                                                         <div className="flex-1">
                                                             <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl rounded-tl-none">
                                                                 <div className="flex justify-between items-start mb-1">
                                                                     <span className="text-xs font-bold text-black dark:text-white">{c.clients?.full_name || 'Membre NXA'}</span>
                                                                     <span className="text-[10px] text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                                                 </div>
                                                                 <p className="text-sm text-zinc-700 dark:text-zinc-300">{c.content}</p>
                                                             </div>
                                                             <div className="flex items-center gap-4 mt-2 px-2 text-[10px] font-black uppercase text-zinc-400">
                                                                 <button onClick={() => handleLikeComment(c.id, 'like')} className="hover:text-black transition-colors flex items-center gap-1">👍 {c.likes_count || 0}</button>
                                                                 <button onClick={() => handleLikeComment(c.id, 'dislike')} className="hover:text-black transition-colors flex items-center gap-1">👎 {c.dislikes_count || 0}</button>
                                                                 <button onClick={() => setNewCommentText(`@${c.clients?.full_name?.split(' ')[0]} `)} className="hover:text-black transition-colors">Répondre</button>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 ))
                                             )}"""

new_comment_loop = """                                             {postComments.length === 0 ? (
                                                 <p className="text-xs text-zinc-400 text-center py-4">Aucun commentaire pour l'instant. Soyez le premier !</p>
                                             ) : (
                                                 postComments.map((c: any, idx: number) => (
                                                     <div key={idx} className={`flex gap-3 ${c.parent_id ? 'ml-8 mt-2 border-l-2 border-zinc-100 dark:border-zinc-800 pl-3' : 'mt-4'}`}>
                                                         <img src={c.clients?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.clients?.full_name || 'Utilisateur')}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 object-cover shrink-0" alt="Avatar"/>
                                                         <div className="flex-1">
                                                             <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl rounded-tl-none">
                                                                 <div className="flex justify-between items-start mb-1">
                                                                     <span className="text-xs font-bold text-black dark:text-white">{c.clients?.full_name || 'Membre NXA'}</span>
                                                                     <span className="text-[10px] text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                                                 </div>
                                                                 <p className="text-sm text-zinc-700 dark:text-zinc-300">{c.content}</p>
                                                             </div>
                                                             <div className="flex items-center gap-4 mt-2 px-2 text-[10px] font-black uppercase text-zinc-400">
                                                                 <button onClick={() => handleLikeComment(c.id, 'like')} className="hover:text-black transition-colors flex items-center gap-1">👍 {c.likes_count || 0}</button>
                                                                 <button onClick={() => handleLikeComment(c.id, 'dislike')} className="hover:text-black transition-colors flex items-center gap-1">👎 {c.dislikes_count || 0}</button>
                                                                 {!c.parent_id && (
                                                                     <button onClick={() => { setReplyToCommentId(c.id); setNewCommentText(`@${c.clients?.full_name?.split(' ')[0]} `); }} className="hover:text-black transition-colors">Répondre</button>
                                                                 )}
                                                             </div>
                                                         </div>
                                                     </div>
                                                 ))
                                             )}"""
content = content.replace(old_comment_loop, new_comment_loop)

# Fix Story Preview CSS Bug
old_story_preview = """          {/* STORY PREVIEW MODAL */}
          <AnimatePresence>
            {storyPreviewUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
                <div className="bg-zinc-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative border border-zinc-800 flex flex-col">"""

new_story_preview = """          {/* STORY PREVIEW MODAL */}
          <AnimatePresence>
            {storyPreviewUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
                <div className="bg-zinc-900 rounded-[2rem] w-full max-w-md max-h-[90vh] overflow-y-auto overflow-hidden shadow-2xl relative border border-zinc-800 flex flex-col custom-scrollbar">"""
content = content.replace(old_story_preview, new_story_preview)


with open('src/components/nutrition/tabs/CommunityTab.tsx', 'w') as f:
    f.write(content)

print("CommunityTab.tsx updated!")
