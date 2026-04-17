import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Configuration Stripe manquante sur le serveur." }, { status: 500 });
  }

  // 1. Initialiser Stripe et Supabase à l'intérieur de la fonction
  // pour éviter les crashs lors de la compilation (Build) Next.js
  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16' as any,
  });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Vérification cryptographique que la requête vient bien de Stripe
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Erreur Webhook Stripe: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 3. Traiter l'événement de paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // On récupère l'ID du devis que nous aurons passé dans les "metadata" lors de la création de la session de paiement
    const quoteId = session.metadata?.quoteId;

    if (quoteId) {
      console.log(`✅ Paiement réussi pour le devis: ${quoteId}`);
      
      // Mettre à jour le statut du devis
      await supabaseAdmin.from('crm_quotes').update({ status: 'paid' }).eq('id', quoteId);
      
      // Tracer l'événement
      await supabaseAdmin.from('quote_events').insert({
        quote_id: quoteId,
        event_type: 'paid'
      });
    }
  }

  // Stripe exige un code 200 rapide pour confirmer la réception
  return NextResponse.json({ received: true }, { status: 200 });
}
