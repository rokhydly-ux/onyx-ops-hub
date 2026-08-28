#!/bin/bash
FILE="src/components/nutrition/tabs/CommunityTab.tsx"
PAGE="src/app/nutrition/page.tsx"

git restore $FILE
git restore $PAGE

# 1. Add activeFeedFilter state
sed -i -e '/const { today/i \  const [activeFeedFilter, setActiveFeedFilter] = React.useState("all");\n' "$FILE"

# 2. Update "Le Mur" button
sed -i 's/onClick={() => handleTabChange('"'"'community'"'"')}/onClick={(e) => { e.preventDefault(); handleTabChange('"'"'community'"'"'); setActiveFeedFilter('"'"'all'"'"'); }}/g' "$FILE"
sed -i 's/activeTab === '"'"'community'"'"'/activeTab === '"'"'community'"'"' \&\& activeFeedFilter === '"'"'all'"'"'/g' "$FILE"

# 3. Update "Recettes & Menus" button
sed -i 's/onClick={() => handleTabChange('"'"'samaMenu'"'"')}/onClick={(e) => { e.preventDefault(); setActiveFeedFilter('"'"'recipes'"'"'); }}/g' "$FILE"
sed -i 's/activeTab === '"'"'samaMenu'"'"'/activeFeedFilter === '"'"'recipes'"'"'/g' "$FILE"

# 4. Update "Challenges Tendance" button (target specifically lines for it)
sed -i '/{\/\* 3\. Bouton Challenges Tendance \*\/}/,/onClick={() => {/ s/onClick={() => {/onClick={(e) => {/' "$FILE"
sed -i 's/window.scrollTo(0, document.body.scrollHeight);/e.preventDefault(); document.getElementById('"'"'challenges-section'"'"')?.scrollIntoView({ behavior: '"'"'smooth'"'"' }); document.getElementById('"'"'mobile-challenge-4'"'"')?.scrollIntoView({ behavior: '"'"'smooth'"'"' });/g' "$FILE"

# 5. Update "Mon Profil" button
sed -i 's/onClick={() => handleTabChange('"'"'profile'"'"')}/onClick={(e) => { e.preventDefault(); handleTabChange('"'"'profile'"'"'); }}/g' "$FILE"

# 6. Add id="challenges-section" to the right column
sed -i '491s/className="hidden lg:flex lg:col-span-3 flex-col gap-6"/id="challenges-section" className="hidden lg:flex lg:col-span-3 flex-col gap-6"/g' "$FILE"

# 7. Update communityPosts.filter
sed -i 's/communityPosts\.filter(p => showSavedOnly ? p\._bookmarkedByMe : true)\.map/communityPosts.filter(p => showSavedOnly ? p._bookmarkedByMe : true).filter(p => activeFeedFilter === '"'"'recipes'"'"' ? (p.tags?.includes('"'"'recette'"'"') || p.tags?.includes('"'"'menu'"'"') || p.content?.toLowerCase().includes('"'"'recette'"'"') || p.content?.toLowerCase().includes('"'"'plat'"'"') || p.image_url) : true).map/g' "$FILE"

# 8. Update Détails button
sed -i 's/onClick={() => setShowChallengeModal(true)}/onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }}/g' "$FILE"

# 9. Fix page.tsx burger
sed -i 's/onClick={() => setShowMobileHub(true)}/onClick={() => { setShowMobileHub(true); setIsMobileMenuOpen(true); setIsSidebarOpen(true); }}/g' "$PAGE"

# 10. Fix Hub Club button in CommunityTab.tsx
sed -i 's/onClick={() => setShowMobileHub(true)}/onClick={(e) => { e.preventDefault(); setShowMobileHub(true); setIsMobileMenuOpen(true); setIsSidebarOpen(true); }}/g' "$FILE"
