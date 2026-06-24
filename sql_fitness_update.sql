-- Ajout de la colonne pour le cross-selling (Lien avec un produit de la boutique)
ALTER TABLE public.nutrition_fitness_courses
ADD COLUMN IF NOT EXISTS linked_product_id UUID; -- ou VARCHAR si vos IDs produits sont en texte

-- Exemple d'insertion de catégories recommandées (si vous avez une table catégories, sinon c'est géré en front)
-- 'Woyofal Cardio', 'Renforcement Doux', 'Objectif Ventre Plat', 'Mobilité & Étirements', 'Express 10 Min'
