# Rapport Technique : Section Sama Menu (PWA vers React Native)

Ce document décrit en détail l'architecture, le design, et la gestion des données de la section **"Sama Menu"** (Planificateur Hebdomadaire) de la PWA actuelle. Il est conçu pour vous guider dans la réécriture de cette interface en React Native, sans nécessiter la modification du code existant.

---

## 1. Architecture UI / UX et Design

La section `Sama Menu` (`activeTab === 'week'`) est un planificateur de repas affiché sous forme de "cartes journalières" (Day Cards). L'UI est fortement visuelle, utilisant des images de couverture pour le déjeuner et des badges de statut.

### Disposition Globale (Layout)
* **Conteneur Principal :** Grille responsive (`grid-cols-1` sur mobile, s'étendant jusqu'à `grid-cols-5` sur les très grands écrans). En React Native, un `FlatList` horizontal (`horizontal={true}`) ou vertical (selon l'UX souhaitée sur mobile) est idéal pour les "Day Cards".
* **En-tête de section :** Titre "Sama Menu" avec icône dédiée (`MENU_ICONS.samaMenu`) arrondie, accompagné de boutons "Regénérer" et "Liste de courses".

### Design de la "Day Card" (Carte Journalière)
Chaque jour (`dayPlan`) est contenu dans une carte :
* **Conteneur (Card) :**
  * `borderRadius: 40` (`rounded-[2.5rem]`).
  * `backgroundColor: '#FFFFFF'`.
  * `shadowColor: '#000000'`, `shadowOpacity: 0.06`, `shadowRadius: 40`.
  * `overflow: 'hidden'`.
  * **Highlight du jour actuel :** Si `dayPlan.day === formattedCurrentDay`, la carte reçoit une bordure verte fluo (`borderWidth: 4, borderColor: '#39FF14'`). Sinon, elle est légèrement grisée (`opacity: 0.8, grayscale`).
* **Image de Couverture (Déjeuner) :**
  * Composant `Image` en entête de carte (`height: 192` soit `h-48`). `resizeMode="cover"`.
  * **Overlay (Gradient) :** Un `LinearGradient` de fond (`rgba(0,0,0,0.8)` vers transparent) est placé par-dessus l'image pour assurer la lisibilité du texte (Nom du déjeuner) placé en bas.
* **Badge du Jour :** Positionné en absolu en haut à gauche (`position: 'absolute', top: 16, left: 16`). Fond `#39FF14` et texte noir pour aujourd'hui, fond Noir et texte blanc pour les autres jours.

### Design des Lignes de Repas (Meal Rows)
À l'intérieur de la carte, chaque repas (Petit-déjeuner, Déjeuner, Collation, Dîner) est affiché sous forme de ligne :
* **Conteneur (Row) :** `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, `padding: 16`, `borderRadius: 16`.
  * **État "Consommé" (Validé) :** Si le repas a été enregistré aujourd'hui (`isConsumed`), la ligne devient verte claire (`backgroundColor: 'rgba(57, 255, 20, 0.15)'`, `borderColor: '#39FF14'`, `borderWidth: 1`).
  * **État Normal :** Fond gris clair (`backgroundColor: '#fafafa'` i.e. Zinc-50).
* **Affichage des Macros (Mode Expert vs Simple) :**
  * **Expert :** Affiche une ligne avec 4 blocs (Kcal, Protéines, Glucides, Lipides) accompagnés de mini-icônes (`CALS_ICON`, etc.).
  * **Simple :** Affiche une unité visuelle (ex: "1 louche", "1 portion") via `recipe.ux_unit` ou la fonction de fallback `guessVisualPortion`.
* **Actions :** Boutons d'action (Ajouter `➕`, Changer `🔄`, ou Badge "Validé ✅").

---

## 2. Gestion de l'État (State Management)

La page s'appuie sur le store global (Zustand ou context) et l'état local pour générer et manipuler le menu.

### Variables d'état principales
* `weeklyGeneratedMenu` (Array) : Contient le menu complet de la semaine. Chaque élément (`dayPlan`) a la structure :
  ```javascript
  {
    day: "Lundi 14 Oct", // formatted string
    meals: {
      "Petit-déjeuner": { nom: "...", calories: 300, proteins: 15, image_url: "..." },
      "Déjeuner": { nom: "...", calories: 600, proteins: 30, image_url: "..." },
      "Collation": { nom: "...", calories: 150, proteins: 5, image_url: "..." },
      "Dîner": { nom: "...", calories: 400, proteins: 20, image_url: "..." }
    }
  }
  ```
* `consumedMeals` (Array) : Liste des repas mangés aujourd'hui (utile pour déterminer le flag `isConsumed`).
* `isFastingMode` (Boolean) : Si `true`, le "Petit-déjeuner" est masqué de l'itération (`['Déjeuner', 'Collation', 'Dîner']`).
* `isExpertMode` (Boolean) : Détermine si on affiche les Macros (Kcal, P, G, L) ou les unités visuelles (portions).

---

## 3. Logiques de Génération et Interactions

### Tri de l'affichage (Priorité à Aujourd'hui)
Dans la vue grille, le code extrait le jour actuel (`today`) du tableau `weeklyGeneratedMenu`, et le place *en première position* du tableau `displayMenu` pour qu'il soit toujours visible en premier, suivi des autres jours de la semaine (`others`).

### Validation d'un repas (Log "Mon Jour")
Lorsqu'un utilisateur clique sur le bouton "➕ Ajouter" :
1. La fonction `confirmMealLog` est appelée.
2. Elle calcule et sécurise les valeurs manquantes via des ratios standards :
   ```javascript
   confirmMealLog(
     mealType,
     recipe.nom,
     recipe.calories,
     recipe.proteins || Math.round((recipe.calories * 0.2)/4), // 20% kcal des prot (1g=4kcal)
     recipe.carbs || Math.round((recipe.calories * 0.5)/4),    // 50% kcal des glucides
     recipe.fats || Math.round((recipe.calories * 0.3)/9),     // 30% kcal des lipides (1g=9kcal)
     { ux_unit: recipe.ux_unit || '1 portion' }
   )
   ```
3. Cela déclenche l'ajout optimiste dans `consumedMeals` et l'insertion en BDD (table `nutrition_logs`).

### Gestion du mode "Bol Commun" (lunch_context)
Si l'utilisateur a configuré son contexte de déjeuner comme "maison_bol_commun" (dans `clientProfile.diagnostic_data.lunch_context`), un bloc de conseil ("💡 Conseil Woyof") s'affiche *uniquement* sous le repas "Déjeuner".

### Swap (Changer de Repas)
Le bouton "🔄" déclenche la fonction `handleSwapMeal(dIdx, mealType, recipe.id)`. Cette fonction (implémentée ailleurs dans le fichier) demande au backend/algorithme de trouver une alternative de repas similaire (en termes de calories/macros) et met à jour l'état `weeklyGeneratedMenu` à l'index `dIdx` sans toucher au reste de la semaine.
