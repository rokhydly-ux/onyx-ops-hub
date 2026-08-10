Salut Jules, j'ai fixé le bug du filtrage. Apparemment, certaines recettes n'ont pas d'instructions/ingredients remplis dans la DB, ce qui faisait que mon filtre strict éliminait toutes les données et rendait la galerie vide. J'ai assoupli cette condition : `!r.instructions && !r.ingredients && !r.type`.

De plus, pour répondre à ta demande, voici le code SQL à exécuter dans Supabase pour créer la table des avis et le Trigger qui mettra à jour la note moyenne :

```sql
-- Run this in your Supabase SQL Editor

-- 1. Create the new table
CREATE TABLE IF NOT EXISTS public.nutrition_recipe_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id BIGINT REFERENCES public.nutrition_recipes(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(recipe_id, client_id)
);

-- 2. Add aggregation columns to nutrition_recipes if they don't exist
ALTER TABLE public.nutrition_recipes ADD COLUMN IF NOT EXISTS avg_rating NUMERIC DEFAULT 0;
ALTER TABLE public.nutrition_recipes ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

-- 3. Set up RLS
ALTER TABLE public.nutrition_recipe_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
    ON public.nutrition_recipe_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own reviews"
    ON public.nutrition_recipe_reviews FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own reviews"
    ON public.nutrition_recipe_reviews FOR UPDATE
    USING (auth.uid() = client_id);

-- 4. Create trigger to update avg_rating and review_count automatically
CREATE OR REPLACE FUNCTION update_recipe_ratings()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.nutrition_recipes
    SET
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.nutrition_recipe_reviews WHERE recipe_id = NEW.recipe_id), 0),
      review_count = (SELECT COUNT(*) FROM public.nutrition_recipe_reviews WHERE recipe_id = NEW.recipe_id)
    WHERE id = NEW.recipe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.nutrition_recipes
    SET
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.nutrition_recipe_reviews WHERE recipe_id = OLD.recipe_id), 0),
      review_count = (SELECT COUNT(*) FROM public.nutrition_recipe_reviews WHERE recipe_id = OLD.recipe_id)
    WHERE id = OLD.recipe_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_recipe_ratings_trigger ON public.nutrition_recipe_reviews;
CREATE TRIGGER update_recipe_ratings_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.nutrition_recipe_reviews
FOR EACH ROW EXECUTE FUNCTION update_recipe_ratings();
```
