"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle, AlertTriangle, Wallet, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Assurez-vous que votre clé publique Stripe est dans vos variables d'environnement
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.quoteId as string;

  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchQuoteAndTrack = async () => {
      if (!quoteId) {
        setError("Identifiant de devis manquant.");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Récupérer les détails du devis
        const { data: quoteData, error: quoteError } = await supabase
          .from('crm_quotes')
          .select('*, crm_contacts(full_name, phone)')
          .eq('id', quoteId)
          .single();

        if (quoteError || !quoteData) {
          throw new Error("Devis introuvable ou expiré.");
        }
        
        setQuote(quoteData);

        // 2. Suivi du clic (Tracking)
        await supabase.from('quote_events').insert({
          quote_id: quoteId,
          event_type: 'viewed'
        });

        // 3. Mettre à jour le statut du devis à 'viewed' s'il était 'sent'
        if (quoteData.status === 'sent') {
          await supabase.from('crm_quotes').update({ status: 'viewed' }).eq('id', quoteId);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuoteAndTrack();
  }, [quoteId]);

  const handlePayment = async () => {
    if (!quote) return;
    setIsProcessing(true);
    alert("La redirection vers le paiement n'est pas encore active dans cette démo. L'intégration Stripe est nécessaire.");
    setIsProcessing(false);
    // Le code ci-dessous est un exemple pour une future intégration Stripe
    /*
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.id, items: quote.items, totalAmount: quote.total_amount, customerName: quote.crm_contacts.full_name })
      });
      if (!response.ok) throw new Error("Le serveur de paiement a refusé la connexion.");
      const { sessionId } = await response.json();
      if (!sessionId) throw new Error("Impossible d'obtenir une session de paiement.");
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) throw new Error(error.message);
      } else {
        throw new Error("Stripe n'a pas pu être initialisé.");
      }
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
    */
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-zinc-100"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-zinc-200">
        {error ? (
          <div className="text-center">
            <AlertTriangle className="mx-auto w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-black text-red-600">Erreur</h2>
            <p className="text-zinc-600 mt-2">{error}</p>
            <button onClick={() => router.push('/')} className="mt-6 w-full bg-black text-white py-3 rounded-xl font-bold text-sm">Retour à l'accueil</button>
          </div>
        ) : quote && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black uppercase tracking-tighter">Récapitulatif du Devis</h1>
              <p className="text-sm font-bold text-zinc-500">Pour {quote.crm_contacts?.full_name || 'Client'}</p>
            </div>

            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {quote.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg">
                  <span className="text-sm font-bold text-zinc-700">{item.name} (x{item.qty})</span>
                  <span className="text-sm font-black text-black">{(item.unit_price * item.qty).toLocaleString('fr-FR')} F</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-200 mb-8">
              <span className="text-lg font-black uppercase">Total à Payer</span>
              <span className="text-3xl font-black text-[#39FF14]">{quote.total_amount.toLocaleString('fr-FR')} F</span>
            </div>
            
            {quote.status === 'paid' ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                    <CheckCircle size={20}/> Ce devis a déjà été payé.
                </div>
            ) : (
                <button 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Lock size={16} />}
                  Payer {quote.total_amount.toLocaleString('fr-FR')} F en ligne
                </button>
            )}

            <p className="text-center text-xs text-zinc-400 mt-4 flex items-center justify-center gap-1"><Lock size={12}/> Paiement sécurisé par Stripe</p>
          </div>
        )}
      </div>
    </div>
  );
}

