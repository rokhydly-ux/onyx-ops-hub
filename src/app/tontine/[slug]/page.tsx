"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

function SlugPageContent({ params }: { params: { slug: string } }) {
  const router = useRouter();

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
        router.replace('/404'); // Redirige vers une page 404 si le slug est invalide
      }
    };

    fetchTontineIdAndRedirect();
  }, [params.slug, router]);

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

