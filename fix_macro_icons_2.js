const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// The replacement missed the general lists since they were using different class structures or spacing.
// Let's use a very generic replace for the text `{prots}g prot` etc.

// 1. Calories (usually {cals} kcal or {recipe.calories || recipe.kcal || recipe.energy || 0} kcal)
pageCode = pageCode.replace(/<Flame size=\{[0-9]+\}.*?\/>/g, '<img src={CALS_ICON} className="w-3 h-3 rounded-full"/>');

// 2. Proteins
pageCode = pageCode.replace(/<Activity size=\{[0-9]+\}.*?\/>(?=\s*\{[a-zA-Z0-9_.\s||]+\}\s*g?\s*(prot)?)/gi, '<img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/>');

// 3. Carbs and Fats (both used Box previously, or nothing). We'll look for the strings
pageCode = pageCode.replace(/<Box size=\{[0-9]+\}.*?\/>/g, (match, offset, string) => {
    // Check context around Box to see if it's carbs or fats. If it has text-yellow, it's carbs. text-red is fats.
    if(match.includes('yellow') || match.includes('orange')) {
        return '<img src={CARBS_ICON} className="w-3 h-3 rounded-full"/>';
    } else if(match.includes('red')) {
        return '<img src={FATS_ICON} className="w-3 h-3 rounded-full"/>';
    } else {
        return match; // fallback
    }
});

// For text-based entries without Lucide icons (if any exist)
pageCode = pageCode.replace(/<span className="[^"]*">Protéines<\/span>/, '<span className="text-black uppercase tracking-widest text-[9px]"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Protéines</span>');
pageCode = pageCode.replace(/<span className="[^"]*">Glucides<\/span>/, '<span className="text-black uppercase tracking-widest text-[9px]"><img src={CARBS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Glucides</span>');
pageCode = pageCode.replace(/<span className="[^"]*">Lipides<\/span>/, '<span className="text-black uppercase tracking-widest text-[9px]"><img src={FATS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Lipides</span>');

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log('Fixed Macro Icons in lists part 2');
