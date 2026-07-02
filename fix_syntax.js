const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');
const errStart = content.indexOf(`{trackingMode === 'guided' ? (\n                   (() => {`);

if(errStart !== -1) {
    const errEnd = content.indexOf(`})()`, errStart);
    let slice = content.substring(errStart, errEnd + 4);
    // Replace `})()` with `})()` because it's inside `? ( ... ) :`
    // Actually the syntax should be `(() => { ... })()` inside a JSX expression block `{ ... }`.
    // We already have `{ trackingMode === 'guided' ? (() => { ... })() : ( ... ) }`
    // Let's check what it actually is in the file.
}
