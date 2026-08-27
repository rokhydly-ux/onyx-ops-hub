const fs = require('fs');
const filePath = 'src/app/nutrition/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

const tabPropsStart = content.indexOf('// @ts-ignore\n  const tabProps = {');
if (tabPropsStart === -1) {
    console.log("Could not find tabProps start");
    process.exit(1);
}

// Find the end of tabProps block
const tabPropsEnd = content.indexOf('};\n', tabPropsStart);
if (tabPropsEnd === -1) {
    console.log("Could not find tabProps end");
    process.exit(1);
}

const tabPropsBlock = content.substring(tabPropsStart, tabPropsEnd + 3);

// Remove tabProps from current location
content = content.substring(0, tabPropsStart) + content.substring(tabPropsEnd + 3);

// Find the return statement of NutritionDashboard
const returnStart = content.indexOf('  return (\n    <div className={`flex flex-col min-h-screen w-full overflow-x-hidden ${theme === \'dark\' ? \'bg-zinc-950 text-white\' : \'bg-[#f4f4f5] text-zinc-900\'} font-sans selection:bg-[#39FF14]/30 transition-colors duration-300 pb-20 lg:pb-0`}>');

if (returnStart === -1) {
    console.log("Could not find return statement");
    process.exit(1);
} else {
    content = content.substring(0, returnStart) + tabPropsBlock + '\n' + content.substring(returnStart);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully moved tabProps to right before return.");
}
