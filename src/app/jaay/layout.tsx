import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onyx Jaay | Catalogue Digital WhatsApp",
  description: "Onyx Jaay est le 1er catalogue phygital au Sénégal pensé 100% pour WhatsApp. Transformez vos discussions interminables en commandes fermes.",
  openGraph: {
    title: "Onyx Jaay | Catalogue Digital WhatsApp",
    description: "Transformez vos discussions interminables en commandes fermes avec le 1er catalogue phygital 100% WhatsApp.",
    url: "https://onyx-ops-hub.vercel.app/jaay",
    siteName: "OnyxOps",
    images: [
      {
        url: "https://placehold.co/1200x630/1a1a1a/39FF14?text=Onyx+Jaay", // Remplacez par le vrai lien de votre image
        width: 1200,
        height: 630,
        alt: "Aperçu de Onyx Jaay",
      },
    ],
    locale: "fr_SN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onyx Jaay | Catalogue Digital WhatsApp",
    description: "Le 1er catalogue phygital au Sénégal pensé 100% pour WhatsApp.",
    images: ["https://placehold.co/1200x630/1a1a1a/39FF14?text=Onyx+Jaay"], // Remplacez par le vrai lien de votre image
  },
};

export default function JaayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}