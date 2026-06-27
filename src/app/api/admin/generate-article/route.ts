import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
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

    const { title, voice } = await request.json();

    if (!title || !voice) {
      return NextResponse.json({ error: 'Title and voice are required' }, { status: 400 });
    }

    let systemPrompt = "";
    if (voice === "rokhy_educatrice") {
        systemPrompt = "Agis en tant que Rokhy, experte passionnée de nutrition africaine et fondatrice de boutique. Écris dans un style ultra-humaniste, chaleureux et bienveillant. Interdiction d'utiliser des phrases stéréotypées d'IA ('En conclusion', 'De nos jours'). Structure obligatoire : 1/ Une anecdote humaine, 2/ Explication scientifique sur les vertus des aliments africains avec des chiffres, 3/ Solution pratique intégrant un lien fluide vers un produit de ma boutique.";
    } else if (voice === "rokhy_grande_soeur") {
        systemPrompt = "Agis en tant que Rokhy. Écris un article ultra-chaleureux pour déculpabiliser tes lectrices face aux idées reçues (ex: 'les plats africains font grossir'). Utilise le 'je'. Structure : 1/ Le mythe culpabilisant, 2/ Le cas concret d'une cliente, 3/ La vérité scientifique, 4/ L'action simple avec un lien naturel vers un produit de la boutique.";
    } else if (voice === "dr_thierno_consultation") {
        systemPrompt = "Agis en tant que Dr. Thierno, médecin. Ton empathique mais rigueur scientifique. Structure : 1/ L'histoire d'un patient avec un symptôme précis, 2/ Explication médicale simple, 3/ Solution par l'alimentation africaine avec données cliniques, 4/ Recommandation médicale avec backlink vers la boutique.";
    } else if (voice === "dr_thierno_publique") {
        systemPrompt = "Agis en tant que Dr. Thierno. Article de fond sur la prévention (diabète, hypertension). Structure : 1/ Un chiffre fort de santé publique, 2/ Pourquoi nos ancêtres étaient protégés, 3/ La science moderne, 4/ Conclusion invitant à la prévention avec lien vers la boutique.";
    } else {
        return NextResponse.json({ error: 'Invalid voice selected' }, { status: 400 });
    }

    // OpenAI Integration
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback for demo/development if no API key is provided
      await new Promise(r => setTimeout(r, 1500));
      return NextResponse.json({
        content: `[Généré via IA simulée - Voix: ${voice}]\n\nTitre: ${title}\n\nVoici le contenu généré. Assurez-vous d'ajouter votre clé OPENAI_API_KEY dans l'environnement pour utiliser la véritable IA.`
      });
    }

    // Real OpenAI Call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective model
        messages: [
          {
            role: "system",
            content: systemPrompt + " Règle absolue: NE GÉNÈRE AUCUN ASTÉRISQUE MARKDOWN (**). N'utilise jamais les balises bold ou italic. Rédige le texte de manière fluide."
          },
          {
            role: "user",
            content: `Rédige un article complet sur le sujet suivant: "${title}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "OpenAI API Error");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Safety fallback just in case the AI ignores the instruction
    content = content.replace(/\*\*/g, '');

    return NextResponse.json({ content });

  } catch (error: any) {
    console.error('Error generating article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
