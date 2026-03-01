"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  FileText,
  Zap,
  Package,
  UtensilsCrossed,
  CalendarCheck,
  Menu,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Users,
  Infinity,
} from "lucide-react";
import { useState } from "react";

const SOLUTIONS = [
  {
    id: "catalog",
    name: "Catalog",
    icon: LayoutGrid,
    pain: "Vos clients vous demandent des photos sur WhatsApp à chaque commande.",
    solution:
      "Un catalogue élégant, toujours à jour, que vous partagez en un lien WhatsApp.",
  },
  {
    id: "devis",
    name: "Devis",
    icon: FileText,
    pain: "Devis faits à la main, erreurs de calcul et image peu professionnelle.",
    solution:
      "Des devis propres, chiffrés automatiquement et envoyés en un clic à vos clients.",
  },
  {
    id: "tiak",
    name: "Tiak",
    icon: Zap,
    pain: "Perte de cash au comptoir, aucune traçabilité des encaissements.",
    solution:
      "Une caisse digitale simple qui trace chaque encaissement et chaque vendeur.",
  },
  {
    id: "stock",
    name: "Stock",
    icon: Package,
    pain: "Ruptures surprises et surstocks qui bloquent votre trésorerie.",
    solution:
      "Un suivi temps réel de vos entrées / sorties pour décider avec confiance.",
  },
  {
    id: "menu",
    name: "Menu",
    icon: UtensilsCrossed,
    pain: "Menus papier illisibles, difficiles à mettre à jour et jamais à jour.",
    solution:
      "Un menu digital, scannable en QR et partageable sur WhatsApp en quelques secondes.",
  },
  {
    id: "booking",
    name: "Booking",
    icon: CalendarCheck,
    pain: "Rendez-vous oubliés, double réservations et planning brouillon.",
    solution:
      "Un agenda connecté où chaque créneau est réservé, confirmé et rappelé automatiquement.",
  },
];

const PLANS = [
  {
    name: "Essentiel",
    price: "7.500 F",
    description: "Idéal pour lancer votre digitalisation.",
    features: ["1 solution Onyx au choix", "Support WhatsApp en horaires ouvrés"],
  },
  {
    name: "Croissance",
    price: "17.500 F",
    description: "Pour les business qui accélèrent.",
    features: [
      "Jusqu'à 3 solutions Onyx",
      "Onboarding personnalisé",
      "Support prioritaire",
    ],
    highlighted: true,
  },
  {
    name: "Entreprise",
    price: "30.000 F",
    description: "Pilotage complet de vos opérations.",
    features: [
      "Toutes les solutions Onyx",
      "Multi-utilisateurs & multi-boutiques",
      "Accompagnement mensuel",
    ],
  },
  {
    name: "Premium",
    price: "75.000 F",
    description: "Pour les marques qui veulent scaler.",
    features: [
      "Personnalisation avancée",
      "Intégrations externes",
      "Account manager dédié",
    ],
    badge: "Cœur de gamme",
  },
];

export default function OnyxOpsLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-white text-black">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.15]"
        style={{
          backgroundImage:
            "url('https://i.ibb.co/chCcXT7p/back-site.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
        }}
      />

      <div className="relative">
        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
          <nav className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#39FF14]/40 bg-black shadow-[0_0_18px_rgba(57,255,20,0.4)] md:h-11 md:w-11">
                <Image
                  src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png"
                  alt="OnyxOps Logo"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium tracking-[0.12em] uppercase text-gray-500">
                  OnyxOps
                </span>
                <span className="text-xs md:text-[13px] text-gray-500">
                  Générateur de revenus
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-10 text-sm font-medium md:flex">
              <Link
                href="#solutions"
                className="transition-colors hover:text-[#39FF14]"
              >
                Solutions
              </Link>
              <Link
                href="#tarifs"
                className="transition-colors hover:text-[#39FF14]"
              >
                Tarifs
              </Link>
              <Link
                href="#partenaires"
                className="transition-colors hover:text-[#39FF14]"
              >
                Partenaires
              </Link>
              <Link
                href="#tarifs"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black text-xs font-semibold uppercase tracking-[0.16em] text-white px-5 py-2 hover:bg-[#39FF14] hover:text-black transition-colors"
              >
                Voir les offres
                <ArrowRight className="h-4 w-4 text-[#39FF14]" />
              </Link>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/60 p-2 md:hidden"
              aria-label="Ouvrir le menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </nav>

          {menuOpen && (
            <div className="md:hidden border-t border-black/5 bg-white/95 backdrop-blur">
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm">
                <Link
                  href="#solutions"
                  onClick={() => setMenuOpen(false)}
                  className="py-2"
                >
                  Solutions
                </Link>
                <Link
                  href="#tarifs"
                  onClick={() => setMenuOpen(false)}
                  className="py-2"
                >
                  Tarifs
                </Link>
                <Link
                  href="#partenaires"
                  onClick={() => setMenuOpen(false)}
                  className="py-2"
                >
                  Partenaires
                </Link>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="grid gap-10 py-16 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:py-24 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-medium text-gray-600 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[#39FF14]" />
                Suite Micro‑SaaS pour entrepreneurs sénégalais
              </div>
              <h1 className="mt-6 text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl lg:text-[3.2rem] lg:leading-[1.05] tracking-tight">
                Digitalisez votre{" "}
                <span className="underline decoration-[#39FF14] decoration-[4px] underline-offset-8">
                  Business
                </span>{" "}
                en un clic.
              </h1>
              <p className="mt-5 max-w-xl text-sm sm:text-base text-gray-600">
                OnyxOps réunit vos ventes, devis, stocks, menus et réservations
                dans une suite simple à piloter, pensée pour WhatsApp et les
                réalités du terrain au Sénégal.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="#tarifs"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#39FF14] px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-black shadow-[0_0_30px_rgba(57,255,20,0.6)] transition hover:shadow-[0_0_40px_rgba(57,255,20,0.8)]"
                >
                  Découvrir les offres
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-xs sm:text-sm text-gray-500">
                  100% en ligne • Activation en moins de 24h
                </span>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur">
                  <p className="flex items-center gap-2 font-medium text-gray-900">
                    <CheckCircle2 className="h-4 w-4 text-[#39FF14]" />
                    Pensé pour WhatsApp
                  </p>
                  <p className="mt-2 text-gray-600">
                    Chaque outil est conçu pour transformer vos conversations
                    en chiffre d&apos;affaires mesurable.
                  </p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur">
                  <p className="flex items-center gap-2 font-medium text-gray-900">
                    <Users className="h-4 w-4 text-[#39FF14]" />
                    Créé à Dakar
                  </p>
                  <p className="mt-2 text-gray-600">
                    Une équipe locale qui comprend vos clients, vos vendeurs et
                    vos marges.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-5">
              <div className="relative overflow-hidden rounded-3xl border border-[#39FF14]/30 bg-black text-white shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="absolute -inset-[1px] bg-[radial-gradient(circle_at_top,_rgba(57,255,20,0.5),_transparent_55%)] opacity-70" />
                <div className="relative space-y-5 px-6 py-6 sm:px-7 sm:py-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#39FF14]/70">
                        Vue Business
                      </p>
                      <p className="mt-1 text-sm font-medium text-white/90">
                        Résumé temps réel de vos flux
                      </p>
                    </div>
                    <Infinity className="h-6 w-6 text-[#39FF14]" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">
                        Ventes du jour
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#39FF14]">
                        +18,4%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">
                        Tickets moyens
                      </p>
                      <p className="mt-2 text-lg font-semibold">+4.200 F</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">
                        No-shows
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#39FF14]">
                        -32%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-gray-300">
                    <span>OnyxOps synchronise vos flux Catalog, Tiak, Stock…</span>
                    <span className="rounded-full border border-[#39FF14]/60 px-2 py-0.5 text-[10px] text-[#39FF14]">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="solutions" className="py-16 md:py-20">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                  Suite Onyx
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Chaque douleur business a sa solution Onyx.
                </h2>
              </div>
              <p className="hidden max-w-md text-xs text-gray-500 md:block">
                Nous partons de vos pertes de cash, de temps et d&apos;image,
                puis nous dessinons la brique SaaS minimale qui corrige
                réellement le problème.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {SOLUTIONS.map((solution) => {
                const Icon = solution.icon;
                return (
                  <article
                    key={solution.id}
                    className="group flex h-full flex-col rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur transition hover:-translate-y-1.5 hover:border-[#39FF14]/60 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/5 px-3 py-1 text-xs font-medium">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-[#39FF14]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {solution.name}
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                        Micro‑SaaS
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50/70 px-3 py-3 text-red-800">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                            Douleur
                          </p>
                          <p className="mt-1 text-[13px] leading-relaxed">
                            {solution.pain}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 rounded-2xl border border-[#39FF14]/40 bg-white px-3 py-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#39FF14]" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-700">
                            Solution Onyx
                          </p>
                          <p className="mt-1 text-[13px] leading-relaxed text-gray-700">
                            {solution.solution}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="tarifs" className="py-16 md:py-20">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                Tarifs OnyxOps
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                4 offres claires, aucune surprise.
              </h2>
              <p className="mt-4 text-sm text-gray-600">
                Les montants sont exprimés en Franc CFA (F) et facturés
                mensuellement, sans engagement longue durée.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex h-full flex-col rounded-3xl border bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur ${
                    plan.highlighted || plan.badge
                      ? "border-[#39FF14]/70 shadow-[0_0_40px_rgba(57,255,20,0.25)]"
                      : "border-black/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {plan.description}
                      </p>
                    </div>
                    {(plan.highlighted || plan.badge) && (
                      <span className="rounded-full border border-[#39FF14]/50 bg-[#39FF14]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39FF14]">
                        {plan.badge ?? "Recommandé"}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-[#39FF14]">
                      {plan.price}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                      / mois
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-[3px] inline-flex h-1.5 w-1.5 rounded-full bg-[#39FF14]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="#partenaires"
                    className="mt-6 inline-flex items-center justify-center rounded-full border border-black/10 bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#39FF14] hover:text-black transition-colors"
                  >
                    Discuter avec Onyx
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section
            id="partenaires"
            className="mb-20 rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur md:mb-24 md:p-8"
          >
            <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                  Programme Partenaire
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Gagnez avec OnyxOps, à chaque client que vous apportez.
                </h2>
                <p className="mt-4 text-sm text-gray-600">
                  Que vous soyez agence, freelance, consultant ou simple
                  apporteur d&apos;affaires, OnyxOps partage la valeur créée
                  avec vous grâce à un modèle simple et lisible.
                </p>

                <div className="mt-6 grid gap-4 text-xs sm:text-sm md:grid-cols-3">
                  <div className="rounded-2xl border border-black/5 bg-black text-white px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-300">
                      À la signature
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#39FF14]">
                      30%
                    </p>
                    <p className="mt-1 text-[13px] text-gray-200">
                      de la première mensualité versés immédiatement après
                      activation.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#39FF14]/50 bg-[#39FF14]/5 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-700">
                      Tous les mois
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#39FF14]">
                      10%
                    </p>
                    <p className="mt-1 text-[13px] text-gray-700">
                      de la mensualité payée, tant que le client reste actif.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-white px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-700">
                      Transparence
                    </p>
                    <p className="mt-2 text-[13px] text-gray-600">
                      Accès à un tableau de bord partenaires pour suivre vos
                      commissions en temps réel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 rounded-full border border-black/5 bg-black/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-700">
                  <Users className="h-4 w-4 text-[#39FF14]" />
                  Comment devenir partenaire ?
                </div>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 text-[11px] font-semibold">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        Présentez OnyxOps à votre réseau.
                      </p>
                      <p className="text-[13px]">
                        Nous vous fournissons un kit de présentation WhatsApp
                        et email prêt à l&apos;emploi.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 text-[11px] font-semibold">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        OnyxOps s&apos;occupe du closing.
                      </p>
                      <p className="text-[13px]">
                        Notre équipe fait la démo, adapte l&apos;offre et
                        gère l&apos;onboarding client.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 text-[11px] font-semibold">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        Vous encaissez vos 30% + 10%.
                      </p>
                      <p className="text-[13px]">
                        Paiement sécurisé, récap mensuel détaillé, zéro charge
                        opérationnelle pour vous.
                      </p>
                    </div>
                  </li>
                </ol>

                <Link
                  href="#"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#39FF14]/60 bg-[#39FF14]/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-colors"
                >
                  Rejoindre le programme partenaires
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-black/5 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-gray-500 sm:flex-row sm:px-6 lg:px-8">
            <a
              href="tel:+221"
              className="inline-flex items-center gap-2 hover:text-[#39FF14]"
            >
              <span>Contact Dakar : (+221)</span>
            </a>
            <p>© 2026 OnyxOps. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
