import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# Modify handlePostComment signature and content
old_handle_post_comment = """  const handlePostComment = async (postId: string) => {
      if (!newCommentText.trim() || !clientProfile) return;
      setIsSaving(true);
      try {
          const { data, error } = await supabase.from('nutrition_community_comments').insert({
              post_id: postId,
              client_id: clientProfile.id,
              content: newCommentText.trim()
          }).select('*, clients!client_id(full_name, avatar_url)').single();"""

new_handle_post_comment = """  const handlePostComment = async (postId: string, commentText: string, parentId?: string | null) => {
      if (!commentText.trim() || !clientProfile) return;
      setIsSaving(true);
      try {
          const payload: any = {
              post_id: postId,
              client_id: clientProfile.id,
              content: commentText.trim()
          };
          if (parentId) payload.parent_id = parentId;
          const { data, error } = await supabase.from('nutrition_community_comments').insert(payload).select('*, clients!client_id(full_name, avatar_url)').single();"""

content = content.replace(old_handle_post_comment, new_handle_post_comment)

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)

print("page.tsx updated!")
