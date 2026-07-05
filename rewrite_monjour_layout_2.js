const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// The layout right now:
// Left Col:
// 2981-                   </div>
// 2982-                </div>
// 2983-
// 2984-                </div>
// 2985-
// 2986:              {/* COLONNE DROITE (2/3) */}
// 2987-              <div className="lg:col-span-2 flex flex-col gap-6">
// 2988-                {/* 1. Le grand widget "Refaire mon diagnostic" au sommet */}

// Let's extract the diagnostic widget block completely
const redoDiagRegex = /\{\/\* 1\. Le grand widget "Refaire mon diagnostic" au sommet \*\/\}\s*\{\/\* 2\. Le grand widget "Refaire mon diagnostic" en dessous des repas \*\/\}\s*<button\s*onClick=\{\(\) => setShowRedoDiagModal\(true\)\}[\s\S]*?Ajuster mes objectifs et mes mensurations\s*<\/p>\s*<\/div>\s*<\/button>\s*/;

const matchRedoDiag = pageCode.match(redoDiagRegex);
if(matchRedoDiag) {
    let redoDiagJSX = matchRedoDiag[0];
    pageCode = pageCode.replace(redoDiagRegex, '');

    // adjust classes for left column
    redoDiagJSX = redoDiagJSX.replace('h-40 md:h-48', 'h-48 w-full').replace(/\{\/\* [12]\. Le grand widget.*?\*\/\}\s*/g, '');

    // Now insert it into the left column
    const leftColEndRegex = /<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* COLONNE DROITE \(2\/3\) \*\/\}/;
    pageCode = pageCode.replace(leftColEndRegex, `</div>\n                </div>\n                {/* 2. Refaire mon diagnostic (Bas de colonne gauche) */}\n                ${redoDiagJSX}\n              </div>\n\n              {/* COLONNE DROITE (2/3) */}`);
    console.log("Moved diagnostic to left col successfully");
} else {
    console.log("Could not find diagnostic widget");
}

fs.writeFileSync(pagePath, pageCode, 'utf8');
