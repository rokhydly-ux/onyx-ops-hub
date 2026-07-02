const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The "BONJOUR LUCIOLE" text might be in the background. It was mentioned in the prompt.
// We should find it.
const ghostRegex = /BONJOUR.*?LUCIOLE|BONJOUR/gi;
let match;
while ((match = ghostRegex.exec(pageContent)) !== null) {
    const context = pageContent.substring(Math.max(0, match.index - 50), Math.min(pageContent.length, match.index + 50));
    console.log(`Found "${match[0]}" at ${match.index}: ...${context}...`);
}
