const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const startIdx = content.indexOf(`{activeTab === 'today' && (`);
const endIdx = content.indexOf(`{/* Suggestions Boutique */}`, startIdx);

console.log(content.substring(startIdx, endIdx));
