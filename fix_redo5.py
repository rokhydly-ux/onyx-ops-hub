import re

with open("src/app/nutrition/page.tsx", "r") as f:
    content = f.read()

# Fix `handleDiagSubmit` payload in `page.tsx`
search_diag_submit = """  const handleDiagSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      setIsSubmittingDiag(true);
      try {

      const calcResult = calculateDailyCalories(diagData);
      const dailyCalories = calcResult.calories;

      // Ratios standards
      let carbsRatio = 0.50;
      let proteinRatio = parseFloat(diagData.age) >= 50 ? 0.35 : 0.30;
      let fatsRatio = 1 - carbsRatio - proteinRatio;

      // Règle spécifique : Diabète (Limitation stricte des glucides à 40%)
      if (diagData.healthProfile === "Diabète") {
          carbsRatio = 0.40;
          proteinRatio = 0.35; // Hausse des protéines pour compenser
          fatsRatio = 0.25;    // Hausse des lipides sains
      }

      // Règle spécifique : SOPK
      if (diagData.femaleSpecific === "SOPK") {
          carbsRatio = 0.45;
          proteinRatio = 0.30;
          fatsRatio = 0.25;
      }

      // Calcul conditionnel intelligent pour la santé (Si pas géré par le fallback global)
      let calculatedBMR = Math.round(calcResult.tdee / 1.2);

      const results = {
          calories: dailyCalories,
          bmr: calculatedBMR,
          tdee: calcResult.tdee,
          protein: Math.round((dailyCalories * proteinRatio) / 4),
          carbs: Math.round((dailyCalories * carbsRatio) / 4),
          fats: Math.round((dailyCalories * fatsRatio) / 9)
      };"""

replace_diag_submit = """  const handleDiagSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      setIsSubmittingDiag(true);
      try {

      // On utilise le VRAI calculateur global qui intègre toutes les variables médicales
      const calcResult = calculateDailyCalories(diagData);
      const dailyCalories = calcResult.calories;

      const results = {
          calories: dailyCalories,
          bmr: Math.round(calcResult.tdee / 1.2), // Sera géré par le core engine
          tdee: calcResult.tdee,
          protein: calcResult.protein_goal || Math.round((dailyCalories * 0.20) / 4),
          carbs: calcResult.carbs_goal || Math.round((dailyCalories * 0.50) / 4),
          fats: calcResult.fats_goal || Math.round((dailyCalories * 0.30) / 9)
      };"""

start_idx = content.find("  const handleDiagSubmit = async (e: React.FormEvent) => {")
end_idx = content.find("setCalorieGoal(results.calories);", start_idx)

if start_idx != -1 and end_idx != -1:
    new_func = """  const handleDiagSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      setIsSubmittingDiag(true);
      try {

      // On utilise le VRAI calculateur global qui intègre toutes les variables médicales
      const calcResult = calculateDailyCalories(diagData);
      const dailyCalories = calcResult.calories;

      const results = {
          calories: dailyCalories,
          bmr: Math.round(calcResult.tdee / 1.2), // Sera géré par le core engine
          tdee: calcResult.tdee,
          protein: calcResult.protein_goal || Math.round((dailyCalories * 0.20) / 4),
          carbs: calcResult.carbs_goal || Math.round((dailyCalories * 0.50) / 4),
          fats: calcResult.fats_goal || Math.round((dailyCalories * 0.30) / 9)
      };

      """

    content = content[:start_idx] + new_func + content[end_idx:]
    with open("src/app/nutrition/page.tsx", "w") as f:
        f.write(content)
