const fs = require('fs');
const path = require('path');

const bentoPath = path.join(__dirname, 'src/components/dashboard/BentoDashboardView.tsx');
let bentoCode = fs.readFileSync(bentoPath, 'utf8');

bentoCode = bentoCode.replace(/onClick=\{\(\) => setActiveTab\('history'\)\}/, "onClick={() => setActiveTab('today')}");
bentoCode = bentoCode.replace(/onClick=\{\(e\) => \{ e.stopPropagation\(\); setActiveTab\('history'\); \}\}/, "onClick={(e) => { e.stopPropagation(); setActiveTab('today'); }}");

fs.writeFileSync(bentoPath, bentoCode, 'utf8');
console.log("Fixed bento routing to Mon Jour");
