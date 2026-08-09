import React, { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useNutritionStore } from '@/store/useNutritionStore';

// Cloudinary Trash Icon for reference (to be used in rendering log list)
const TRASH_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786103561/TRASH_xo3mys.png";

interface SearchFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  dietMode: string;
  mealType: string;
  clientProfile: any;
  currentCalories: number;
  currentProteins: number;
  currentCarbs: number;
  currentFats: number;
  setCalories: (val: number) => void;
  setProteins: (val: number) => void;
  setCarbs: (val: number) => void;
  setFats: (val: number) => void;
  reportData: any;
  setReportData: (data: any) => void;
  waterGlasses: number;
  newlyCompletedGaugesCheck: (c?: number, p?: number, cb?: number, w?: number) => void; // Helper to run after optimistic updates
  editingMeal?: any;
}

export function SearchFoodModal({
  isOpen, onClose, dietMode, mealType, clientProfile,
  currentCalories, currentProteins, currentCarbs, currentFats,
  setCalories, setProteins, setCarbs, setFats, reportData, setReportData,
  waterGlasses, newlyCompletedGaugesCheck, editingMeal
}: SearchFoodModalProps) {
  const isExpert = dietMode === 'expert';
  const { addConsumedMeal, removeConsumedMeal } = useNutritionStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [gramQuantity, setGramQuantity] = useState<number | ''>(100);

  useEffect(() => {
    if (isOpen) {
      if (editingMeal) {
         setQuery("");
         setResults([]);
         // Fake a selected food structure
         setSelectedFood({
             nom: editingMeal.name,
             calories_100g: editingMeal.cals, // fallback logic
             proteins_100g: editingMeal.prots,
             carbs_100g: editingMeal.carbs,
             fats_100g: editingMeal.fats,
             image_url: editingMeal.photo_url,
             visual_equivalences: { portion: 100, default_measure: 'portion' }
         });
         // Try to parse quantity
         if (isExpert && typeof editingMeal.ux_unit === 'string' && editingMeal.ux_unit.includes('g')) {
             setGramQuantity(Number(editingMeal.ux_unit.replace('g', '')));
         } else {
             setQuantity(Number(editingMeal.ux_unit?.split(' ')[0]) || 1);
         }
      } else {
          setQuery("");
          setResults([]);
          setSelectedFood(null);
          setQuantity(1);
          setGramQuantity(100);
      }
    }
  }, [isOpen, editingMeal, isExpert]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    // Local DB Search
    const { data: dbData } = await supabase.from('nutrition_products').select('*').ilike('nom', `%${val}%`).limit(10);

    // OpenFoodFacts Search (Simplified for this task)
    let offData: any[] = [];
    try {
        const offRes = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${val}&search_simple=1&action=process&json=1&page_size=5`);
        const offJson = await offRes.json();
        offData = offJson.products.map((p: any) => ({
            id: `off_${p._id}`,
            nom: p.product_name || "Produit inconnu",
            calories_100g: p.nutriments?.['energy-kcal_100g'] || 0,
            proteins_100g: p.nutriments?.proteins_100g || 0,
            carbs_100g: p.nutriments?.carbohydrates_100g || 0,
            fats_100g: p.nutriments?.fat_100g || 0,
            image_url: p.image_url || null,
            is_from_off: true,
            visual_equivalences: { portion: 100, default_measure: 'portion' } // Default for OFF
        }));
    } catch(e) {}

    setResults([...(dbData || []), ...offData]);
    setIsSearching(false);
  };

  const calculateMacros = () => {
    if (!selectedFood) return { cals: 0, prots: 0, carbs: 0, fats: 0 };

    let multiplier = 1;
    let actualGrams = 0;

    if (isExpert) {
        actualGrams = Number(gramQuantity) || 0;
        multiplier = actualGrams / 100;
    } else {
        const eq = selectedFood.visual_equivalences || { portion: 100, default_measure: 'portion' };
        const defaultMeasure = eq.default_measure || 'portion';
        actualGrams = (eq[defaultMeasure] || 100) * quantity;
        multiplier = actualGrams / 100;
    }

    return {
        cals: Math.round((selectedFood.calories_100g || 0) * multiplier),
        prots: Math.round((selectedFood.proteins_100g || 0) * multiplier),
        carbs: Math.round((selectedFood.carbs_100g || 0) * multiplier),
        fats: Math.round((selectedFood.fats_100g || 0) * multiplier),
        actualGrams
    };
  };

  const handleAdd = async () => {
      if (!selectedFood) return;

      const { cals, prots, carbs, fats, actualGrams } = calculateMacros();
      const eq = selectedFood.visual_equivalences || { portion: 100, default_measure: 'portion' };
      const defaultMeasure = eq.default_measure || 'portion';

      const newConsumedItem = {
         id: Date.now(),
         type: mealType,
         name: selectedFood.nom,
         cals,
         prots,
         carbs,
         fats,
         time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
         ux_unit: isExpert ? `${actualGrams}g` : `${quantity} ${defaultMeasure}`,
         photo_url: selectedFood.image_url || null
      };

      // Optimistic UI Update
      let finalCals = currentCalories + cals;
      let finalProts = currentProteins + prots;
      let finalCarbs = currentCarbs + carbs;
      let finalFats = currentFats + fats;

      if (editingMeal) {
          removeConsumedMeal(editingMeal.id);
          finalCals = Math.max(0, finalCals - (editingMeal.cals || 0));
          finalProts = Math.max(0, finalProts - (editingMeal.prots || 0));
          finalCarbs = Math.max(0, finalCarbs - (editingMeal.carbs || 0));
          finalFats = Math.max(0, finalFats - (editingMeal.fats || 0));
      }

      addConsumedMeal(newConsumedItem);

      const newCals = finalCals;
      const newProts = finalProts;
      const newCarbs = finalCarbs;
      const newFats = finalFats;

      setCalories(newCals);
      setProteins(newProts);
      setCarbs(newCarbs);
      setFats(newFats);

      newlyCompletedGaugesCheck(newCals, newProts, newCarbs, waterGlasses); // Will check and update reportData/XP if needed

      onClose();

      // Background DB Insert
      const todayStr = new Date().toISOString().split('T')[0];

      // Upsert into nutrition_daily_logs
      // (This fetches current consumedMeals from store to safely save the array as well, or we just rely on page.tsx auto-save effect)

      // In this app, we need to explicitly save the array into reportData.consumedMeals,
      // but standard practice in this codebase is to let the upsert handle the full object.
      // We'll dispatch a background save.

      const storeState = useNutritionStore.getState();

      try {
        await supabase.from('nutrition_daily_logs').upsert({
            client_id: clientProfile.id,
            tenant_id: clientProfile.tenant_id || null,
            log_date: todayStr,
            calories_consumed: newCals,
            proteins_consumed: newProts,
            carbs_consumed: newCarbs,
            fats_consumed: newFats,
            water_glasses: waterGlasses,
            report_data: { ...reportData, consumedMeals: storeState.consumedMeals }
        }, { onConflict: 'client_id, log_date' });
      } catch (err) {
          console.error("Erreur de sauvegarde DB", err);
      }
  };

  if (!isOpen) return null;

  const { cals, prots, carbs, fats } = calculateMacros();

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors">
            <X size={20} />
        </button>
        <h2 className="text-2xl font-black uppercase mb-6 pr-10">{editingMeal ? 'Modifier un aliment' : 'Ajouter un aliment'}</h2>

        {!selectedFood ? (
            <>
               <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                     type="text"
                     placeholder="Rechercher un plat, ingrédient (ex: Riz, Fonio)..."
                     value={query}
                     onChange={e => handleSearch(e.target.value)}
                     className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition-colors"
                  />
               </div>

               <div className="space-y-2">
                  {isSearching && <p className="text-center text-sm font-bold text-zinc-400 py-4">Recherche en cours...</p>}
                  {!isSearching && results.map((r, i) => (
                      <div key={i} onClick={() => setSelectedFood(r)} className="flex items-center gap-4 p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl cursor-pointer transition-colors border border-zinc-100">
                          {r.image_url ? (
                              <img src={r.image_url} alt={r.nom} className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                              <div className="w-12 h-12 rounded-xl bg-zinc-200 flex items-center justify-center"><Search size={16} className="text-zinc-400"/></div>
                          )}
                          <div className="flex-1">
                              <p className="font-bold text-sm">{r.nom}</p>
                              <p className="text-[10px] uppercase font-black text-zinc-500">{r.is_from_off ? 'OpenFoodFacts' : 'Base Onyx'}</p>
                          </div>
                      </div>
                  ))}
               </div>
            </>
        ) : (
            <div className="space-y-6">
               <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                  {selectedFood.image_url && <img src={selectedFood.image_url} alt={selectedFood.nom} className="w-16 h-16 rounded-xl object-cover" />}
                  <div>
                      <p className="font-bold text-lg leading-tight">{selectedFood.nom}</p>
                      <button onClick={() => setSelectedFood(null)} className="text-[10px] font-black uppercase text-zinc-400 hover:text-black mt-1">← Changer d'aliment</button>
                  </div>
               </div>

               <div className="bg-white border-2 border-zinc-100 rounded-2xl p-6">
                   <h3 className="font-black uppercase text-xs text-zinc-500 mb-4 tracking-widest">Quantité consommée</h3>

                   {!isExpert ? (
                       <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl">
                          <span className="font-bold text-sm capitalize">{(selectedFood.visual_equivalences?.default_measure || 'portion') + '(s)'}</span>
                          <div className="flex items-center gap-4">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm font-black border border-zinc-200">-</button>
                              <span className="font-black text-xl w-8 text-center">{quantity}</span>
                              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-black text-[#39FF14] rounded-full flex items-center justify-center shadow-sm font-black">+</button>
                          </div>
                       </div>
                   ) : (
                       <div className="flex flex-col gap-2">
                           <div className="relative">
                               <input
                                   type="number"
                                   value={gramQuantity}
                                   onChange={e => setGramQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                                   className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-lg outline-none focus:border-black text-center"
                                   placeholder="Ex: 150"
                               />
                               <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-zinc-400">g</span>
                           </div>

                           {/* Live Macros Display for Expert */}
                           <div className="flex justify-between items-center bg-black text-white p-4 rounded-xl mt-4">
                               <div className="text-center">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">Kcal</p>
                                   <p className="font-black">{cals}</p>
                               </div>
                               <div className="text-center">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Prots</p>
                                   <p className="font-bold text-sm">{prots}g</p>
                               </div>
                               <div className="text-center">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Gluc</p>
                                   <p className="font-bold text-sm">{carbs}g</p>
                               </div>
                               <div className="text-center">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Lip</p>
                                   <p className="font-bold text-sm">{fats}g</p>
                               </div>
                           </div>
                       </div>
                   )}
               </div>

               <button onClick={handleAdd} className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">
                   <Plus size={18}/>{editingMeal ? 'Modifier ce repas' : 'Ajouter ce repas'}
               </button>
            </div>
        )}
      </div>
    </div>
  );
}
