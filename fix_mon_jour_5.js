const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// The widget starts at `{/* 2. Le grand widget "Refaire mon diagnostic" en dessous des repas */}`
// and ends with `</button>` before `</div>`

const widgetRegex = /\{\/\* 2\. Le grand widget "Refaire mon diagnostic" en dessous des repas \*\/\}\s*<button[\s\S]*?Ajuster mes objectifs et mes mensurations\s*<\/p>\s*<\/div>\s*<\/button>/;

const match = pageCode.match(widgetRegex);
if(match) {
    let widget = match[0];
    pageCode = pageCode.replace(widgetRegex, "");

    // Resize widget
    widget = widget.replace('h-48 md:h-56', 'h-40 md:h-48');

    // Find the right column start
    const rightColRegex = /\{\/\* COLONNE DROITE \(2\/3\) \*\/\}\s*<div className="lg:col-span-2 flex flex-col gap-6">/;

    pageCode = pageCode.replace(rightColRegex, `{/* COLONNE DROITE (2/3) */}\n              <div className="lg:col-span-2 flex flex-col gap-6">\n                {/* 1. Le grand widget "Refaire mon diagnostic" au sommet */}\n                ${widget}`);

    fs.writeFileSync(pagePath, pageCode, 'utf8');
    console.log("Moved widget successfully");
} else {
    console.log("Widget not found with regex");
}
