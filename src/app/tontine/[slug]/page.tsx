"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';

function SlugPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchTontineIdAndRedirect = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('tontines')
        .select('id')
        .eq('slug', slug)
        .single();

      if (data?.id) {
        router.replace(`/tontine/membre?id=${data.id}`);
      } else {
        console.error("Tontine non trouvée pour le slug:", slug, error);
        setHasError(true);
      }
    };

    fetchTontineIdAndRedirect();
  }, [slug, router]);

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

export default function Page({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const [slug, setSlug] = useState<string | null>(null);
    
    useEffect(() => {
        // Permet de gérer la compatibilité entre Next.js 14 (params normaux) et Next.js 15 (params asynchrones)
        Promise.resolve(params).then((resolvedParams) => {
            setSlug(resolvedParams.slug);
        });
    }, [params]);

    if (!slug) {
        return <div className="min-h-screen bg-zinc-900 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
    }

    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-900 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white" /></div>}>
            <SlugPageContent slug={slug} />
        </Suspense>
    );
}
