import { create } from 'zustand';

interface NutritionState {
  consumedMeals: any[];
  setConsumedMeals: (meals: any[]) => void;
  addConsumedMeal: (meal: any) => void;
  removeConsumedMeal: (mealId: number) => void;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  consumedMeals: [],
  setConsumedMeals: (meals) => set({ consumedMeals: meals }),
  addConsumedMeal: (meal) => set((state) => ({ consumedMeals: [...state.consumedMeals, meal] })),
  removeConsumedMeal: (mealId) => set((state) => ({ consumedMeals: state.consumedMeals.filter(m => m.id !== mealId) })),
}));
