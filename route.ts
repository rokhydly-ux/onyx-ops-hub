import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  try {
    // 1. Définir les dates (Aujourd'hui et Demain)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 2. Récupérer les clients en période d'essai expirant bientôt
    const { data: expiringClients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('plan_type', 'trial')
      .gte('trial_ends_at', todayStr)
      .lte('trial_ends_at', tomorrowStr);

    if (error) throw error;

    let emailsSent = 0;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 3. Boucler sur les clients et envoyer la relance
    for (const client of expiringClients || []) {
      if (!client.email) continue; // Si le client n'a pas d'email, on ignore

      const emailHtml = `
        <h2>Bonjour ${client.full_name},</h2>
        <p>Votre période d'essai de 14 jours pour <strong>Nutrition à l'Africaine</strong> touche à sa fin !</p>
        <p>Pour continuer à accéder à vos menus personnalisés, votre Dashboard et votre suivi WhatsApp, veuillez passer à l'abonnement Premium.</p>
        <p><a href="https://wa.me/221785338417?text=Bonjour,%20je%20souhaite%20passer%20au%20plan%20Premium%20Nutrition">👉 Cliquez ici pour activer le plan Premium sur WhatsApp</a></p>
        <br/>
        <p>L'équipe Onyx.</p>
      `;

      await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: client.email, subject: "⏳ Votre essai Onyx Nutrition expire bientôt !", html: emailHtml, text: "Votre essai expire. Contactez-nous pour passer en Premium." })
      });
      emailsSent++;
    }

    return NextResponse.json({ success: true, message: `${emailsSent} emails de relance envoyés pour la fin d'essai.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}