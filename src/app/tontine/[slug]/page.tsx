"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';

function SlugPageContent({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchTontineIdAndRedirect = async () => {
      if (!params.slug) return;

      const { data, error } = await supabase
        .from('tontines')
        .select('id')
        .eq('slug', params.slug)
        .single();

      if (data?.id) {
        router.replace(`/tontine/membre?id=${data.id}`);
      } else {
        console.error("Tontine non trouvée pour le slug:", params.slug, error);
        setHasError(true);
      }
    };

    fetchTontineIdAndRedirect();
  }, [params.slug, router]);

  if (hasError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Tontine introuvable</h1>
        <p className="text-zinc-400">Le lien que vous avez suivi est invalide ou la tontine n'existe plus.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-12 h-12 animate-spin text-[#39FF14]" />
      <p className="mt-4 font-bold uppercase tracking-widest">Chargement de la tontine...</p>
    </div>
  );
}

export default function Page({ params }: { params: { slug: string } }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-900 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white" /></div>}>
            <SlugPageContent params={params} />
        </Suspense>
    );
}
