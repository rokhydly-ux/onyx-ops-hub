const fs = require('fs');
const path = require('path');

const bentoPath = path.join(__dirname, 'src/components/dashboard/BentoDashboardView.tsx');
let bentoCode = fs.readFileSync(bentoPath, 'utf8');

const importRegex = /import \{\s*Activity,\s*Droplet,\s*Moon,\s*Search,\s*Bell,\s*LogOut,\s*Settings,\s*User\s*as\s*UserIcon,\s*Send,\s*MoreHorizontal,\s*MessageSquare,\s*Heart\s*\}\s*from\s*'lucide-react';/;
if(importRegex.test(bentoCode)) {
    bentoCode = bentoCode.replace(importRegex, `import {\n    Activity, Droplet, Moon, Search, Bell, LogOut, Plus,\n    Settings, User as UserIcon, Send, MoreHorizontal, MessageSquare, Heart\n} from 'lucide-react';`);
    fs.writeFileSync(bentoPath, bentoCode, 'utf8');
    console.log("Added Plus import to BentoDashboardView");
} else {
    // If our regex didn't match perfectly, let's just do a simpler replacement
    const fallBackRegex = /import \{([\s\S]*?)\} from 'lucide-react';/;
    const match = bentoCode.match(fallBackRegex);
    if(match && !match[1].includes('Plus')) {
        bentoCode = bentoCode.replace(fallBackRegex, `import { Plus, $1 } from 'lucide-react';`);
        fs.writeFileSync(bentoPath, bentoCode, 'utf8');
        console.log("Added Plus import to BentoDashboardView with fallback");
    } else {
        console.log("Plus already imported or lucide-react not found");
    }
}
