const fs = require('fs');

function fixRef(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace old calls to calculateMacrosAndCalories that still existed in PDF generation
    // Because I replaced the function definition with calculateDailyCalories, these old calls break.

    // In handleDownloadDiagnosticPDF or similar functions:
    let oldCode = `const results = calculateMacrosAndCalories(diagData);`;
    let newCode = `const calcResult = calculateDailyCalories(diagData);
      const dailyCalories = calcResult.calories;
      const ageNum = parseFloat(diagData.age) || 0;
      let carbsRatio = 0.50;
      let proteinRatio = ageNum >= 50 ? 0.35 : 0.30;
      let fatsRatio = 1 - carbsRatio - proteinRatio;
      if (diagData.healthProfile === "Diabète") {
          carbsRatio = 0.40;
          proteinRatio = 0.35;
          fatsRatio = 0.25;
      }
      const results = {
          calories: dailyCalories,
          carbs: Math.round((dailyCalories * carbsRatio) / 4),
          protein: Math.round((dailyCalories * proteinRatio) / 4),
          fats: Math.round((dailyCalories * fatsRatio) / 9),
          bmr: calcResult.tdee,
          tdee: calcResult.tdee
      };`;

    content = content.replace(oldCode, newCode);

    // There are 2 calls in the file based on grep. Replace them all if found.
    const occurrences = content.split('const results = calculateMacrosAndCalories(diagData);').length - 1;
    for(let i=0; i<occurrences; i++) {
        content = content.replace('const results = calculateMacrosAndCalories(diagData);', newCode);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

fixRef('src/app/solutions/onyx-nutritionafricaine/page.tsx');
