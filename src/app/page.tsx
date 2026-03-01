"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid,
  FileText,
  Zap,
  Package,
  UtensilsCrossed,
  CalendarCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const MICRO_SAAS = [
  {
    id: "catalog",
    name: "Catalog",
    description: "Catalogue produits digital et partageable",
    icon: LayoutGrid,
  },
  {
    id: "devis",
    name: "Devis",
    description: "Génération et envoi de devis professionnels",
    icon: FileText,
  },
  {
    id: "tiak",
    name: "Tiak",
    description: "Gestion de caisse et paiements",
    icon: Zap,
  },
  {
    id: "stock",
    name: "Stock",
    description: "Suivi d'inventaire en temps réel",
    icon: Package,
  },
  {
    id: "menu",
    name: "Menu",
    description: "Menus digitaux pour restaurants",
    icon: UtensilsCrossed,
  },
  {
    id: "booking",
    name: "Booking",
    description: "Réservations et prises de rendez-vous",
    icon: CalendarCheck,
  },
];

const TARIFS = [
  { nom: "Starter", prix: "7.500 F", features: ["1 solution", "Support email"] },
  {
    nom: "Business",
    prix: "17.500 F",
    features: ["3 solutions", "Support prioritaire", "Formation incluse"],
  },
  {
    nom: "Enterprise",
    prix: "30.000 F",
    features: ["Toutes les solutions", "Support dédié", "Personnalisation"],
  },
];

export default function OnyxOpsLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shrink-0 bg-black flex items-center justify-center">
                {logoError ? (
                  <span className="text-[#39FF14] font-bold text-lg md:text-xl">
                    O
                  </span>
                ) : (
                  <Image
                    src="/LOGO ONYX.jpg"
                    alt="OnyxOps Logo"
                    fill
                    className="object-cover"
                    sizes="48px"
                    onError={() => setLogoError(true)}
                  />
                )}
              </div>
              <span className="text-lg md:text-xl font-semibold tracking-tight">
                OnyxOps
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#solutions"
                className="text-sm font-medium hover:text-[#39FF14] transition-colors"
              >
                Solutions
              </Link>
              <Link
                href="#tarifs"
                className="text-sm font-medium hover:text-[#39FF14] transition-colors"
              >
                Tarifs
              </Link>
              <Link
                href="#acces"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-black text-white hover:bg-[#39FF14] hover:text-black transition-all duration-300"
              >
                Accès Client
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <Link
                  href="#solutions"
                  onClick={() => setMenuOpen(false)}
                  className="font-medium hover:text-[#39FF14] transition-colors"
                >
                  Solutions
                </Link>
                <Link
                  href="#tarifs"
                  onClick={() => setMenuOpen(false)}
                  className="font-medium hover:text-[#39FF14] transition-colors"
                >
                  Tarifs
                </Link>
                <Link
                  href="#acces"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 font-semibold rounded-lg bg-black text-white text-center hover:bg-[#39FF14] hover:text-black transition-all"
                >
                  Accès Client
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              PILOTEZ VOTRE BUSINESS EN TOUTE SIMPLICITÉ
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              La digitalisation de votre entreprise via WhatsApp au Sénégal.
              Catalogues, devis, stocks, réservations — tout au bout des doigts
              de vos clients.
            </p>
            <Link
              href="#tarifs"
              className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-bold uppercase tracking-wider bg-[#39FF14] text-black rounded-lg shadow-[0_0_20px_rgba(57,255,20,0.5)] hover:shadow-[0_0_35px_rgba(57,255,20,0.7)] transition-all duration-300"
            >
              DÉMARRER GRATUITEMENT
            </Link>
          </div>
        </section>

        {/* Micro-SaaS Grid */}
        <section id="solutions" className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Nos Solutions
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
              Des Micro-SaaS pensés pour les entrepreneurs sénégalais
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {MICRO_SAAS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="group bg-white border border-gray-200 rounded-xl p-6 md:p-8 transition-all duration-300 hover:border-[#39FF14] hover:shadow-[0_0_25px_rgba(57,255,20,0.15)] hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#39FF14]/10 transition-colors">
                      <Icon
                        className="w-6 h-6 md:w-7 md:h-7 text-[#39FF14]"
                        strokeWidth={2}
                      />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tarifs Section */}
        <section id="tarifs" className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Tarifs
            </h2>
            <p className="text-gray-600 text-center mb-12">
              Des offres adaptées à chaque étape de votre croissance
            </p>

            <div className="overflow-x-auto">
              <div className="min-w-[280px] grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {TARIFS.map((offer) => (
                  <div
                    key={offer.nom}
                    className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 text-center hover:border-gray-300 transition-colors"
                  >
                    <h3 className="text-lg font-semibold mb-2">{offer.nom}</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#39FF14] mb-6">
                      {offer.prix}
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {offer.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                    <Link
                      href="#acces"
                      className="mt-6 inline-block w-full py-3 px-4 text-sm font-semibold rounded-lg border-2 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all duration-300"
                    >
                      Choisir
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="acces" className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gray-50/50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Accès Client
            </h2>
            <p className="text-gray-600 mb-8">
              Connectez-vous à votre espace pour gérer vos solutions
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold uppercase tracking-wider bg-black text-white rounded-lg hover:bg-[#39FF14] hover:text-black transition-all duration-300"
            >
              Se connecter
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <a
            href="tel:+221"
            className="text-sm text-gray-600 hover:text-[#39FF14] transition-colors"
          >
            Contact Dakar : (+221)
          </a>
          <p className="text-sm text-gray-500">
            © 2026 OnyxOps. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
