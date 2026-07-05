const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');


const pieChartRegex = /\{\/\* COLONNE GAUCHE \(1\/3\) \*\/\}\s*<div className="lg:col-span-1 flex flex-col gap-6">\s*\{\/\* 1\. Le Pie Chart \(Calories\/Macros\) ici \*\/\}\s*<div className="bg-white p-6 rounded-\[\2rem\] border border-zinc-200 shadow-sm flex flex-col items-center">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* COLONNE DROITE \(2\/3\) \*\/\}/;

const redoDiagRegex = /\{\/\* 1\. Le grand widget "Refaire mon diagnostic" au sommet \*\/\}\s*<button\s*onClick=\{\(\) => setShowRedoDiagModal\(true\)\}[\s\S]*?Ajuster mes objectifs et mes mensurations\s*<\/p>\s*<\/div>\s*<\/button>\s*/;

const matchRedoDiag = pageCode.match(redoDiagRegex);
const matchPieChart = pageCode.match(pieChartRegex);

if(matchRedoDiag && matchPieChart) {
    const redoDiagJSX = matchRedoDiag[0];

    // Remove redo diag from right column
    pageCode = pageCode.replace(redoDiagRegex, '');

    // the matchPieChart string ends with `</div> </div> </div> {/* COLONNE DROITE (2/3) */}`
    // Let's replace the last `</div> </div> {/* COLONNE DROITE (2/3) */}` with `\n ${redoDiagJSX} \n </div> \n {/* COLONNE DROITE (2/3) */}`

    pageCode = pageCode.replace(/<\/div>\s*<\/div>\s*\{\/\* COLONNE DROITE \(2\/3\) \*\/\}/, `</div>\n                ${redoDiagJSX.replace('h-40 md:h-48', 'h-48 w-full')}\n              </div>\n\n              {/* COLONNE DROITE (2/3) */}`);

    console.log("Moved redo diag to left column.");
} else {
    console.log("Regex not matching perfectly.");
}

// Bilan OnClick Check
const bilanButtonRegex = /<button(?:(?!onClick)[^>])*className="bg-\[\#39FF14\] p-6 rounded-\[\2rem\] border border-black shadow-\[0_0_25px_rgba\(57,255,20,0\.4\)\] flex flex-col justify-center items-center text-center cursor-pointer hover:scale-\[1\.02\] transition-transform animate-gentle-pulse">/;
const matchBilan = pageCode.match(bilanButtonRegex);
if(matchBilan) {
    pageCode = pageCode.replace(bilanButtonRegex, matchBilan[0].replace('<button', '<button onClick={() => setShowDailyReport(true)}'));
    console.log("Fixed Bilan OnClick");
} else {
    // If it already has onClick, this is fine
    console.log("Bilan OnClick might already be there.");
}

fs.writeFileSync(pagePath, pageCode, 'utf8');
