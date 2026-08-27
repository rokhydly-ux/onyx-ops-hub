const fs = require('fs');

const content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// Get tabProps keys
const tabPropsMatch = content.match(/const tabProps = {([^}]*)}/s);
if (tabPropsMatch) {
    const keys = tabPropsMatch[1].split(',').map(s => s.trim()).filter(s => s);
    const missing = [];
    for (const key of keys) {
        // Simple regex to check if variable is defined via const/let/var or function or import
        // or destructured somewhere. It's tough to do statically with regex perfectly,
        // but we can look for basic declaration signatures.
        const regex1 = new RegExp(`\\b(const|let|var|function)\\s+${key}\\b`);
        const regex2 = new RegExp(`\\b(const|let|var)\\s+\\{[^}]*\\b${key}\\b[^}]*\\}`);
        const regex3 = new RegExp(`\\b(const|let|var)\\s+\\[[^]]*\\b${key}\\b[^]]*\\]`);
        const regex4 = new RegExp(`import\\s+.*?\\b${key}\\b`);
        // if it's not found in any of these, let's log it.

        if (!regex1.test(content) && !regex2.test(content) && !regex3.test(content) && !regex4.test(content)) {
            missing.push(key);
        }
    }
    console.log("Potentially missing variables:");
    console.log(missing.join(', '));
}
