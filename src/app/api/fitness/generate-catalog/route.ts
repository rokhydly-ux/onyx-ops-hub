import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Pour éviter les erreurs au build si OPENAI_API_KEY n'est pas définie
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });
        const { data: { user }, error: authError } = await authClient.auth.getUser();
        if (authError || !user) {
             return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key_for_build') {
             throw new Error("Clé API OpenAI manquante sur le serveur.");
        }

        const { count = 15 } = await req.json();

        const prompt = `
Tu es un expert fitness africain. Génère un catalogue de ${count} exercices de sport sans équipement (à faire à la maison).
Le format de sortie doit être EXCLUSIVEMENT un JSON valide contenant un tableau nommé "exercises".

Chaque exercice doit avoir cette structure exacte :
{
  "title": "Nom de l'exercice (court et motivant)",
  "category": "Choisir PARMI : 'Woyofal Cardio', 'Renforcement Doux', 'Objectif Ventre Plat', 'Mobilité & Étirements', 'Express 10 Min'",
  "difficulty": "Choisir PARMI : 'Débutant', 'Intermédiaire', 'Avancé'",
  "duration_minutes": un nombre entier entre 5 et 30,
  "benefits": "Description courte (max 2 phrases) expliquant les bienfaits."
}

Veille à varier les catégories et les difficultés.
Ne retourne que le JSON, aucun autre texte.
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;

        if (!content) {
             throw new Error("L'API OpenAI a renvoyé un contenu vide.");
        }

        const data = JSON.parse(content);

        if (!data.exercises || !Array.isArray(data.exercises)) {
             throw new Error("Format de réponse invalide. Le tableau 'exercises' est manquant.");
        }

        // Ajouter les champs par défaut
        const formattedExercises = data.exercises.map((ex: any) => ({
            ...ex,
            video_url: null,
            thumbnail_url: null,
            linked_product_id: null
        }));

        return NextResponse.json({ exercises: formattedExercises });

    } catch (error: any) {
        console.error('Erreur API Generate Catalog:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
