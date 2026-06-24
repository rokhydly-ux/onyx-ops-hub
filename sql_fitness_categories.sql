-- 4. Table des catégories de fitness (Taxonomie)
CREATE TABLE IF NOT EXISTS public.nutrition_fitness_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insérer les catégories par défaut
INSERT INTO public.nutrition_fitness_categories (name)
VALUES
    ('Woyofal Cardio'),
    ('Renforcement Doux'),
    ('Objectif Ventre Plat'),
    ('Mobilité & Étirements'),
    ('Express 10 Min')
ON CONFLICT (name) DO NOTHING;

-- Activer RLS
ALTER TABLE public.nutrition_fitness_categories ENABLE ROW LEVEL SECURITY;

-- Politiques pour les catégories (Lecture pour tous, Écriture pour les admins)
CREATE POLICY "Les catégories sont visibles par tous les utilisateurs" ON public.nutrition_fitness_categories
    FOR SELECT USING (true);
