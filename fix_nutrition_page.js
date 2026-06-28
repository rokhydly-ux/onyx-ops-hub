const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf-8');
content = content.replace(/activeTab === 'library'/g, "activeTab === 'profile'");
content = content.replace(/if \(diff !== null\) {/g, 'if (diff !== null) {\n                                    diff = diff;');
content = content.replace(/let diff = null;/g, 'let diff: number | null = null;');
fs.writeFileSync('src/app/nutrition/page.tsx', content);
