const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// See if there's any missed generic macro texts without icons
const proteinsCheck = pageCode.match(/<span className="[^"]*">Protéines<\/span>/);
const carbsCheck = pageCode.match(/<span className="[^"]*">Glucides<\/span>/);
const fatsCheck = pageCode.match(/<span className="[^"]*">Lipides<\/span>/);

console.log('Missed Text:', proteinsCheck, carbsCheck, fatsCheck);
