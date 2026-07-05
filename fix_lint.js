const fs = require('fs');
const file = 'src/app/nutrition/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix unescaped apostrophes in community card
content = content.replace("What's so", "What&apos;s so");

fs.writeFileSync(file, content);
console.log('Fixed lint issue in page.tsx');
