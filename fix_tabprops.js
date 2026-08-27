const fs = require('fs');
const filePath = 'src/app/nutrition/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Find the start of tabProps declaration
const tabPropsStart = content.indexOf('// @ts-ignore\n  const tabProps = {');
if (tabPropsStart !== -1) {
    // Find the end of tabProps block. It ends with "  };\n"
    const tabPropsEnd = content.indexOf('};\n\n', tabPropsStart);
    if (tabPropsEnd !== -1) {
        // Extract the tabProps block
        const tabPropsBlock = content.substring(tabPropsStart, tabPropsEnd + 3);

        // Remove it from the current position
        content = content.substring(0, tabPropsStart) + content.substring(tabPropsEnd + 3);

        // Now, we need to insert it inside NutritionDashboard, right after todayStr declaration
        const insertPosition = content.indexOf('const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, \'0\')}-${String(today.getDate()).padStart(2, \'0\')}`;');

        if (insertPosition !== -1) {
            const endOfInsertPosition = content.indexOf('\n', insertPosition) + 1;
            content = content.substring(0, endOfInsertPosition) + '\n' + tabPropsBlock + '\n' + content.substring(endOfInsertPosition);

            fs.writeFileSync(filePath, content, 'utf8');
            console.log("Successfully moved tabProps declaration inside NutritionDashboard component.");
        } else {
            console.log("Could not find insert position.");
        }
    } else {
        console.log("Could not find end of tabProps block.");
    }
} else {
    console.log("Could not find tabProps declaration.");
}
