const fs = require('fs');

function verifyModifiers(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if Grossesse gives +400/+500 kcal
    if (!content.includes('healthProfile === "Grossesse"')) {
        let replacePregnancy = content.replace(
            `if (healthProfile === "Allaitement") {`,
            `if (healthProfile === "Allaitement" || healthProfile === "Grossesse") {`
        );
        fs.writeFileSync(filePath, replacePregnancy, 'utf8');
        console.log(`Updated Pregnancy modifier in ${filePath}`);
    }
}

verifyModifiers('src/app/solutions/onyx-nutritionafricaine/page.tsx');
verifyModifiers('src/app/nutrition/page.tsx');
