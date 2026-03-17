import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";

export async function generateMetadata({ params }: { params: { shopSlug: string } }): Promise<Metadata> {
  const { shopSlug } = params;

  // 1. Récupérer les infos de la boutique depuis Supabase
  const { data: shop } = await supabase
    .from("shops")
    .select("name, description, logo_url")
    .eq("slug", shopSlug)
    .single();

  if (!shop) {
    return { title: "Boutique Introuvable | OnyxOps" };
  }

  // 2. Générer les balises Open Graph dynamiquement
  return {
    title: `${shop.name} | Boutique en ligne`,
    description: shop.description || `Découvrez le catalogue de ${shop.name} sur OnyxOps.`,
    openGraph: {
      title: `${shop.name} | Boutique en ligne`,
      description: shop.description || `Découvrez le catalogue de ${shop.name}.`,
      url: `https://onyx-ops-hub.vercel.app/${shopSlug}`,
      siteName: shop.name,
      images: [
        {
          url: shop.logo_url || "https://placehold.co/1200x630/1a1a1a/39FF14?text=Boutique", // Logo de la boutique
          width: 1200,
          height: 630,
          alt: `Logo de ${shop.name}`,
        },
      ],
      type: "website",
    },
  };
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}