import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Configuration du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration du client Supabase (côté Serveur)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Privilégiez la clé SERVICE_ROLE pour un accès bypassant les RLS (sécurité) en backend.
// Si vous n'en avez pas sous la main, l'ANON_KEY fonctionnera si le bucket est public.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 });
    }

    // 1. Génération de l'image via DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1792", // Format vertical 9:16 (standard DALL-E 3)
      response_format: "url",
    });

    const openAiImageUrl = response.data[0].url;
    if (!openAiImageUrl) throw new Error("Aucune image générée par OpenAI.");

    // 2. Téléchargement de l'image générée en mémoire
    const imageRes = await fetch(openAiImageUrl);
    if (!imageRes.ok) throw new Error("Impossible de télécharger l'image depuis OpenAI.");
    const arrayBuffer = await imageRes.arrayBuffer(); 

    // Optimisation et réduction de la taille avec Sharp (Conversion en WebP)
    const optimizedBuffer = await sharp(arrayBuffer)
      .webp({ quality: 80 }) // Conversion en WebP avec 80% de qualité
      .toBuffer();

    // 3. Upload vers le bucket Supabase ("tontines")
    const fileName = `affiches/affiche_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
    
    const { error: uploadError } = await supabase.storage
      .from('tontines')
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 4. Récupération du lien public et renvoi au Frontend
    const { data: publicUrlData } = supabase.storage.from('tontines').getPublicUrl(fileName);

    return NextResponse.json({ imageUrl: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error('Erreur API Generate Image:', error);
    return NextResponse.json({ error: error.message || 'Une erreur est survenue lors de la génération.' }, { status: 500 });
  }
}