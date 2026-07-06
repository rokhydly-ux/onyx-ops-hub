const fs = require('fs');
let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const errRegex = /import \{ TrendingUp, Dumbbell, Send, TrendingDown, Bookmark \} from "MoreHorizontal, \n\} from "lucide-react";/;
if (content.match(errRegex)) {
    content = content.replace(errRegex, `import { TrendingUp, Dumbbell, Send, TrendingDown, Bookmark, MoreHorizontal } from "lucide-react";`);
    fs.writeFileSync('src/app/nutrition/page.tsx', content);
} else {
    // If not matching perfectly, just replace manually
    const lines = content.split('\n');
    lines[5] = `import { TrendingUp, Dumbbell, Send, TrendingDown, Bookmark, MoreHorizontal } from "lucide-react";`;
    lines.splice(6, 1); // remove '} from "lucide-react";' line
    fs.writeFileSync('src/app/nutrition/page.tsx', lines.join('\n'));
}
