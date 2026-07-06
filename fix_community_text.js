const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The user states: "pour l'onglet community supprimer toute mention d'Onyx Cest le club des Lekkologues"
// This means we need to replace "Onyx Community" or "Communauté Onyx" with "Club des Lekkologues" inside the activeTab === 'community' block.

const communityStartIdx = content.indexOf(`{activeTab === 'community' && (`);
const communityEndIdx = content.indexOf(`{/* MODALE LEADERBOARD */}`);

if (communityStartIdx !== -1) {
    let communityBlock = content.substring(communityStartIdx, communityEndIdx);

    // Replace Onyx Community / Espace Communauté with Club des Lekkologues
    communityBlock = communityBlock.replace(/Onyx Community/gi, "Club des Lekkologues");
    communityBlock = communityBlock.replace(/Espace Communauté/gi, "Club des Lekkologues");

    // The user also mentioned "Onyx Plus" in the profile.
    communityBlock = communityBlock.replace(/Onyx Plus/gi, "Lekkologue Pro");

    content = content.substring(0, communityStartIdx) + communityBlock + content.substring(communityEndIdx);
    fs.writeFileSync('src/app/nutrition/page.tsx', content);
    console.log("Renamed Onyx to Club des Lekkologues in Community tab.");
}
