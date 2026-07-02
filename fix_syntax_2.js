const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');
content = content.replace(`import { TrendingUp, Dumbbell, Send, TrendingDown } from "Bookmark, \n} from "lucide-react";`, `import { TrendingUp, Dumbbell, Send, TrendingDown, Bookmark } from "lucide-react";`);

fs.writeFileSync('src/app/nutrition/page.tsx', content);
