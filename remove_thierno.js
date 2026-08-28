const fs = require('fs');
let code = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The block to remove starts from BOT THIERNO comment and ends at the closing div
const startComment = '{/* BOT THIERNO (COACH MÉDECIN) */}';
const startIdx = code.indexOf(startComment);

if (startIdx !== -1) {
    // Find the end of the block. We'll look for the next comment tag to be safe, or just find the exact closing div.
    const endComment = '{/* TOAST NOTIFICATION */}';
    const endIdx = code.indexOf(endComment);

    if (endIdx !== -1) {
        code = code.substring(0, startIdx) + code.substring(endIdx);
        fs.writeFileSync('src/app/nutrition/page.tsx', code);
        console.log("Thierno bot removed!");
    } else {
        console.log("Could not find end comment");
    }
} else {
    console.log("Could not find start comment");
}
