const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');
pageContent = pageContent.replace(/<!-- GREETING INJECTED -->/g, '{/* GREETING INJECTED */}');
fs.writeFileSync('src/app/nutrition/page.tsx', pageContent);
