const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const updatedMenuIcons = {
  dashboard: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1783099228/Smart_home_icon_UI_UX_202607031719_w62euy.jpg",
  samaMenu: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_1_uvgqf0.jpg",
  monJour: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_2_akqmx4.jpg",
  fitness: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_3_punr1t.jpg",
  shop: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_4_erkmnd.jpg",
  profile: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781536233/A_cute__highly_detailed_3D_202606151510_uj9z5c.jpg",
  community: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1783098237/8_v1l6ms.png",
  minuteDoc: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781541191/A_cute__highly_detailed_3D_202606151632_qytnih.jpg",
  galerieRecettes: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444566/supprimer_le_frame__remplace_le_202606141341_ayzsoe.jpg",
  monPoids: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg",
  blog: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540516/remplacer_tittle_par_CONSEILS_NUTRITION_202606151619_tb8clu.jpg"
};

// Replace MENU_ICONS definition
const menuIconsMatch = code.match(/const MENU_ICONS = \{[\s\S]*?\};/);
if (menuIconsMatch) {
    let newMenuIcons = `const MENU_ICONS = {
  dashboard: "${updatedMenuIcons.dashboard}",
  samaMenu: "${updatedMenuIcons.samaMenu}",
  monJour: "${updatedMenuIcons.monJour}",
  fitness: "${updatedMenuIcons.fitness}",
  shop: "${updatedMenuIcons.shop}",
  profile: "${updatedMenuIcons.profile}",
  community: "${updatedMenuIcons.community}",
  minuteDoc: "${updatedMenuIcons.minuteDoc}",
  galerieRecettes: "${updatedMenuIcons.galerieRecettes}",
  monPoids: "${updatedMenuIcons.monPoids}",
  blog: "${updatedMenuIcons.blog}",
  coaching: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444564/A_cute__highly_detailed_3D_202606141342_yn2v23.jpg"
};`;
    code = code.replace(menuIconsMatch[0], newMenuIcons);
}

// Update TABS array
code = code.replace(/\{ id: 'dashboard', label: 'Dashboard', icon: ".*?" \}/g, `{ id: 'dashboard', label: 'Dashboard', icon: MENU_ICONS.dashboard }`);
code = code.replace(/\{ id: 'community', label: 'Communauté', icon: ".*?" \}/g, `{ id: 'community', label: 'Communauté', icon: MENU_ICONS.community }`);
code = code.replace(/\{ id: 'favorites', label: 'Galerie Recettes', icon: ".*?" \}/g, `{ id: 'favorites', label: 'Galerie Recettes', icon: MENU_ICONS.galerieRecettes }`);
code = code.replace(/\{ id: 'weight', label: 'Mon Poids', icon: ".*?" \}/g, `{ id: 'weight', label: 'Mon Poids', icon: MENU_ICONS.monPoids }`);

// Fix Sidebar Buttons
code = code.replace(/<Heart size=\{14\} className="text-red-500"\/> Communauté/g, `<img src={MENU_ICONS.community} className="w-5 h-5 rounded" alt=""/> Communauté`);
code = code.replace(/<Video size=\{14\} className="text-\[\#39FF14\]"\/> La Minute Doc/g, `<img src={MENU_ICONS.minuteDoc} className="w-5 h-5 rounded" alt=""/> La Minute Doc`);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed TABS, Sidebar Buttons, MENU_ICONS');
