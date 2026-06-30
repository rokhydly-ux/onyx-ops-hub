const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const target2 = `    const verifyAuth = async () => {`;

const replacement2 = `  useEffect(() => {
    const verifyAuth = async () => {`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/app/nutrition/page.tsx', content);
