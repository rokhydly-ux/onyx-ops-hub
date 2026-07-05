const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Ensure ChevronLeft is imported
if (!pageCode.includes('ChevronLeft')) {
    pageCode = pageCode.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, `import { ChevronLeft, $1 } from 'lucide-react';`);
}

const breadcrumbJSX = `<button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>`;

// List of all non-dashboard tabs to inject the breadcrumb into
const tabs = ['today', 'week', 'favorites', 'weight', 'fitness', 'minute-doc', 'shop', 'orders', 'blog', 'history', 'coaching', 'community', 'profile'];

let injectionCount = 0;

for (const tab of tabs) {
    const regex = new RegExp(`(\\{activeTab === '${tab}' && \\([\\s]*<div className="[^"]*animate-in[^"]*">)`);
    // Need to handle both "space-y-8 animate-in" and "space-y-6 animate-in" etc
    const looseRegex = new RegExp(`(\\{activeTab === '${tab}' && \\([\\s\\S]*?<div className="[^"]*animate-in[^"]*">)`);

    const match = pageCode.match(looseRegex);

    if (match) {
        pageCode = pageCode.replace(looseRegex, `$1\n            ${breadcrumbJSX}`);
        injectionCount++;
    }
}

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log(`Injected breadcrumbs into ${injectionCount} tabs.`);
