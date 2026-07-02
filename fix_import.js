const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The issue was "MoreHorizontal is not defined" because I didn't import it in `page.tsx`.
if (!content.includes("MoreHorizontal,")) {
    content = content.replace("lucide-react\";", "MoreHorizontal, \n} from \"lucide-react\";");
    fs.writeFileSync('src/app/nutrition/page.tsx', content);
    console.log("Imported MoreHorizontal");
}
