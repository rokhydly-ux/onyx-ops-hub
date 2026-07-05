const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Also update the BentoDashboard macros list if it's there
const bentoPath = path.join(__dirname, 'src/components/dashboard/BentoDashboardView.tsx');
let bentoCode = fs.readFileSync(bentoPath, 'utf8');
if (bentoCode.includes('Protéines') && !bentoCode.includes('PROTEINS_ICON')) {
    // We'll inject hardcoded URLs directly into bento
    bentoCode = bentoCode.replace(/<span className="text-black">Protéines<\/span>/, `<span className="text-black flex items-center gap-1"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375734/A_cute__highly_detailed_3D_202606131825_2_roav76.jpg" className="w-3 h-3 rounded-full"/> Protéines</span>`);
    bentoCode = bentoCode.replace(/<span className="text-black">Glucides<\/span>/, `<span className="text-black flex items-center gap-1"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375738/A_cute__highly_detailed_3D_202606131825_1_epyark.jpg" className="w-3 h-3 rounded-full"/> Glucides</span>`);
    bentoCode = bentoCode.replace(/<span className="text-black">Lipides<\/span>/, `<span className="text-black flex items-center gap-1"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375735/A_cute__highly_detailed_3D_202606131826_jbhb58.jpg" className="w-3 h-3 rounded-full"/> Lipides</span>`);
    fs.writeFileSync(bentoPath, bentoCode, 'utf8');
}

// In page.tsx: Ensure "Sama Menu" macros also have them if missed (e.g. if they don't use Box/Flame).
// Look for macro rendering in Sama Menu. Sama Menu uses guided modal, or renders small text.
// We already replaced <Flame>, <Activity>, <Box>. Let's see if there are raw texts like "Protéines" left.
pageCode = pageCode.replace(/<span className="text-black uppercase tracking-widest text-\[9px\]">Protéines<\/span>/g, `<span className="text-black uppercase tracking-widest text-[9px] flex items-center gap-1"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full inline"/> Protéines</span>`);
pageCode = pageCode.replace(/<span className="text-black uppercase tracking-widest text-\[9px\]">Glucides<\/span>/g, `<span className="text-black uppercase tracking-widest text-[9px] flex items-center gap-1"><img src={CARBS_ICON} className="w-3 h-3 rounded-full inline"/> Glucides</span>`);
pageCode = pageCode.replace(/<span className="text-black uppercase tracking-widest text-\[9px\]">Lipides<\/span>/g, `<span className="text-black uppercase tracking-widest text-[9px] flex items-center gap-1"><img src={FATS_ICON} className="w-3 h-3 rounded-full inline"/> Lipides</span>`);

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log("Updated macros in Bento and raw texts");
