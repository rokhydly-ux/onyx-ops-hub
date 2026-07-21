import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# Add social media links and DM button to the user's name area in the community feed.
# We need to find:
# <p className="font-black text-sm text-black flex items-center gap-1">{post.client || 'Membre'} <CheckCircle size={12} className="text-[#39FF14] fill-[#39FF14] text-black"/></p>
# Wait, do we have access to post.clients.instagram or post.nutrition_profiles.instagram?
# Let's check what `nutrition_community_posts` query fetches.
