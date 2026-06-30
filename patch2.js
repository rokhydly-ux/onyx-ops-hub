const fs = require('fs');
const content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const matchToReplace = `                {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map((mealType) => {
                    const generatedMeal = todayPlan?.meals ? todayPlan.meals[mealType] : null;
                    const plannedMeal = generatedMeal ? {
                        type: mealType,
                        time: mealType === 'Petit-déjeuner' ? '08:00' : mealType === 'Déjeuner' ? '13:30' : mealType === 'Collation' ? '16:00' : '19:30',
                        meal: generatedMeal.nom,
                        cals: generatedMeal.calories,
                        proteins: generatedMeal.proteins !== undefined ? generatedMeal.proteins : Math.round((generatedMeal.calories * 0.2) / 4),
                        carbs: generatedMeal.carbs !== undefined ? generatedMeal.carbs : Math.round((generatedMeal.calories * 0.5) / 4),
                        fats: generatedMeal.fats !== undefined ? generatedMeal.fats : Math.round((generatedMeal.calories * 0.3) / 9),
                        ux_unit: (generatedMeal as any).ux_unit || "1 portion",
                        recipe: generatedMeal.recipe || \`Ingrédients : \${generatedMeal.ingredients?.map((i: any) => \`\${i.quantite}\${i.unite} \${i.nom}\`).join(', ') || ''}\`
                    } : null;`;

const replacement = `                {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map((mealType) => {
                    const generatedMeal = todayPlan?.meals ? todayPlan.meals[mealType] : null;
                    const baseCalories = generatedMeal ? (generatedMeal.calories || generatedMeal.kcal || generatedMeal.energy || 0) : 0;
                    const plannedMeal = generatedMeal ? {
                        type: mealType,
                        time: mealType === 'Petit-déjeuner' ? '08:00' : mealType === 'Déjeuner' ? '13:30' : mealType === 'Collation' ? '16:00' : '19:30',
                        meal: generatedMeal.nom,
                        cals: baseCalories || "—",
                        proteins: generatedMeal.proteins !== undefined ? generatedMeal.proteins : (baseCalories ? Math.round((baseCalories * 0.2) / 4) : 0),
                        carbs: generatedMeal.carbs !== undefined ? generatedMeal.carbs : (baseCalories ? Math.round((baseCalories * 0.5) / 4) : 0),
                        fats: generatedMeal.fats !== undefined ? generatedMeal.fats : (baseCalories ? Math.round((baseCalories * 0.3) / 9) : 0),
                        ux_unit: (generatedMeal as any).ux_unit || "1 portion",
                        recipe: generatedMeal.recipe || \`Ingrédients : \${generatedMeal.ingredients?.map((i: any) => \`\${i.quantite}\${i.unite} \${i.nom}\`).join(', ') || ''}\`
                    } : null;`;


const newContent = content.replace(matchToReplace, replacement);

fs.writeFileSync('src/app/nutrition/page.tsx', newContent);
