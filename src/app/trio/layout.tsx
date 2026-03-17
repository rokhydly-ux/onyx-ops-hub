import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pack Trio | Vente, Stock & Logistique | OnyxOps",
  description: "Le Pack Trio combine la puissance d'Onyx Jaay (Vente), Onyx Stock et Onyx Tiak (Logistique). Tracez chaque franc CFA et sécurisez votre Cash-Flow.",
  openGraph: {
    title: "Pack Trio | L'Arme Ultime pour les E-commerçants",
    description: "Vente + Stock + Logistique. Suivez vos livreurs, maîtrisez vos encaissements et ne tombez plus jamais en rupture de stock.",
    url: "https://onyx-ops-hub.vercel.app/trio",
    siteName: "OnyxOps",
    images: [
      {
        url: "https://placehold.co/1200x630/000000/39FF14?text=Pack+Trio", // N'oubliez pas de remplacer par le lien de votre vraie image
        width: 1200,
        height: 630,
        alt: "Aperçu du Pack Trio",
      },
    ],
    locale: "fr_SN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pack Trio | Vente, Stock & Logistique | OnyxOps",
    description: "Sécurisez votre Cash-Flow avec notre suite d'outils 100% WhatsApp.",
    images: ["https://placehold.co/1200x630/000000/39FF14?text=Pack+Trio"], // Même image ici
  },
};

export default function TrioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}