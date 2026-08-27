const fs = require('fs');
const filePath = 'src/app/nutrition/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('const today = new Date();') || !content.includes('const todayStr = ')) {
    const tabPropsMatch = content.match(/const tabProps = {/);
    if (tabPropsMatch) {
        const replacement = `
  const today = new Date();
  const todayStr = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;

  const tabProps = {`;

        content = content.replace(/const tabProps = {/, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Successfully inserted today and todayStr declarations.");
    } else {
        console.log("Could not find tabProps declaration.");
    }
} else {
    console.log("today and todayStr already exist.");
}
