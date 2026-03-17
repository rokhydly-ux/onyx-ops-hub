import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onyx Jaay | Catalogue Digital WhatsApp",
  description: "Onyx Jaay est le 1er catalogue phygital au Sénégal pensé 100% pour WhatsApp. Transformez vos discussions interminables en commandes fermes.",
};

export default function JaayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}