-- ==========================================
-- MODULE FITNESS - SCHÉMA DE BASE DE DONNÉES
-- ==========================================

-- 1. Table des exercices/cours (fitness_courses)
CREATE TABLE IF NOT EXISTS public.nutrition_fitness_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT, -- Lien YouTube ou fichier
    thumbnail_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    benefits TEXT,
    equipment_needed VARCHAR(255) DEFAULT 'Aucun', -- 'Aucun', 'Haltères', 'Tapis', etc.
    difficulty VARCHAR(50) DEFAULT 'Débutant', -- 'Débutant', 'Intermédiaire', 'Pro'
    category VARCHAR(100) DEFAULT 'Cardio', -- 'Cardio', 'Musculation', 'Yoga', etc.
    calories_burned_est INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des programmes utilisateurs (fitness_programs)
CREATE TABLE IF NOT EXISTS public.nutrition_fitness_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL, -- Référence à la table clients/utilisateurs
    program_name VARCHAR(255) NOT NULL, -- Ex: "Semaine 1 - Perte de poids"
    day_of_week VARCHAR(20) NOT NULL, -- 'Lundi', 'Mardi', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table de liaison (Programme <-> Exercices) pour ordonner la séance
CREATE TABLE IF NOT EXISTS public.nutrition_fitness_program_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID NOT NULL REFERENCES public.nutrition_fitness_programs(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.nutrition_fitness_courses(id) ON DELETE CASCADE,
    exercise_order INTEGER NOT NULL DEFAULT 1,
    sets INTEGER DEFAULT 3,
    reps VARCHAR(50) DEFAULT '10 reps', -- Ou temps "45 sec"
    rest_time_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- POLITIQUES RLS (Row Level Security)
-- ==========================================

-- Activer RLS
ALTER TABLE public.nutrition_fitness_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_fitness_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_fitness_program_exercises ENABLE ROW LEVEL SECURITY;

-- Politiques pour les cours (Lecture pour tous les authentifiés, Écriture pour les admins)
CREATE POLICY "Les cours sont visibles par tous les utilisateurs" ON public.nutrition_fitness_courses
    FOR SELECT USING (true); -- À adapter avec auth.role() = 'authenticated'

-- Politiques pour les programmes (Un utilisateur ne voit que ses programmes)
CREATE POLICY "Les utilisateurs peuvent voir leurs programmes" ON public.nutrition_fitness_programs
    FOR SELECT USING (true); -- En production: auth.uid() = client_id ou admin

CREATE POLICY "Les utilisateurs peuvent voir les exercices de leurs programmes" ON public.nutrition_fitness_program_exercises
    FOR SELECT USING (true);

-- Allow INSERT, UPDATE, DELETE for all authenticated users (or anonymous for testing/demo)
CREATE POLICY "Allow ALL on courses" ON public.nutrition_fitness_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on programs" ON public.nutrition_fitness_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on program_exercises" ON public.nutrition_fitness_program_exercises FOR ALL USING (true) WITH CHECK (true);
