const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');


const redoDiagRegexOld = /\{\/\* 2\. Le grand widget "Refaire mon diagnostic" en dessous des repas \*\/\}\s*<button\s*onClick=\{\(\) => setShowRedoDiagModal\(true\)\}\s*className="relative w-full rounded-\[\2rem\] overflow-hidden group shadow-lg h-48 md:h-56 flex items-center justify-center border-2 border-transparent hover:border-\[\#39FF14\] transition-all"\s*>\s*<img\s*src="https:\/\/res.cloudinary.com\/dtr2wtoty\/image\/upload\/v1783002400\/A_high-end__photorealistic_commercial_shot_202607021426_vutjqi.jpg"\s*className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"\s*alt="Refaire Diagnostic"\s*\/>\s*<div className="absolute inset-0 bg-gradient-to-t from-black\/90 via-black\/50 to-black\/40 backdrop-blur-\[2px\]"><\/div>\s*<div className="relative z-10 flex flex-col items-center gap-3">\s*<div className="bg-\[\#39FF14\] text-black p-3 rounded-full animate-pulse shadow-\[0_0_30px_rgba\(57,255,20,0\.6\)\]">\s*<Target size=\{24\} \/>\s*<\/div>\s*<h3 className=\{\`\$\{spaceGrotesk.className\} text-2xl md:text-3xl font-black uppercase text-white tracking-tighter drop-shadow-md\`\}>\s*Refaire mon diagnostic\s*<\/h3>\s*<p className="text-zinc-300 font-bold text-\[10px\] uppercase tracking-widest text-center">\s*Ajuster mes objectifs et mes mensurations\s*<\/p>\s*<\/div>\s*<\/button>/s;

let redoDiagJSX = "";
const redoDiagMatch = pageCode.match(redoDiagRegexOld);
if(redoDiagMatch) {
    redoDiagJSX = redoDiagMatch[0].replace('h-48 md:h-56', 'h-40 md:h-48');
    pageCode = pageCode.replace(redoDiagRegexOld, "");
}


// Replace the empty comment marker at the top of right col
const topMarker = /\{\/\* 1\. Le grand widget "Refaire mon diagnostic" au sommet \*\/\}\s*/;
if (topMarker.test(pageCode) && redoDiagJSX) {
    pageCode = pageCode.replace(topMarker, `{/* 1. Le grand widget "Refaire mon diagnostic" au sommet */}\n                ${redoDiagJSX}\n\n                `);
}

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log('Moved Redo Diagnostic to Top');
