const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// The Bilan button should already have onClick, let's verify and force it if not.
const bilanRegex = /<button(?:(?!onClick)[^>])*className="bg-\[\#39FF14\] p-6 rounded-\[\2rem\] border border-black shadow-\[0_0_25px_rgba\(57,255,20,0\.4\)\] flex flex-col justify-center items-center text-center cursor-pointer hover:scale-\[1\.02\] transition-transform animate-gentle-pulse">/;
const matchBilan = pageCode.match(bilanRegex);
if(matchBilan) {
    pageCode = pageCode.replace(bilanRegex, matchBilan[0].replace('<button', '<button onClick={() => setShowDailyReport(true)}'));
    fs.writeFileSync(pagePath, pageCode, 'utf8');
    console.log("Fixed Bilan OnClick");
} else {
    console.log("Bilan OnClick might already be there.");
}
