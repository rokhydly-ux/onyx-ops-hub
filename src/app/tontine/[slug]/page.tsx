"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { AlertTriangle } from 'lucide-react';

const win2kStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Tahoma&display=swap');
  .win2k-slug { font-family: Tahoma, 'MS Sans Serif', Arial, sans-serif; font-size: 11px; }
  .win-spinning {
    display: inline-block; width: 32px; height: 32px;
    border: 3px solid #808080; border-top-color: #000080; border-radius: 50%;
    animation: win-spin2 0.8s linear infinite;
  }
  @keyframes win-spin2 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

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
      <div
        className="win2k-slug"
        style={{
          minHeight: "100vh", background: "#008080",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <style>{win2kStyle}</style>
        {/* Win2000-style error dialog */}
        <div
          style={{
            background: "#D4D0C8",
            border: "2px solid",
            borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
            boxShadow: "2px 2px 0 0 #000",
            width: 360,
          }}
        >
          {/* Title bar */}
          <div
            style={{
              background: "linear-gradient(to right, #000080, #1084D0)",
              padding: "3px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>⚠️</span>
              <span style={{ color: "#FFF", fontWeight: "bold", fontSize: 11 }}>Erreur — Tontine introuvable</span>
            </div>
            <button
              style={{
                background: "#D4D0C8", border: "2px solid",
                borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
                width: 16, height: 16, fontSize: 9,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <AlertTriangle size={40} style={{ color: "#800000", flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>Tontine introuvable</p>
              <p style={{ fontSize: 11, color: "#444", lineHeight: 1.5 }}>
                Le lien que vous avez suivi est invalide ou la tontine n&apos;existe plus.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              borderTop: "1px solid #808080",
              padding: "8px 12px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => window.history.back()}
              style={{
                background: "#D4D0C8",
                border: "2px solid",
                borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
                padding: "3px 20px",
                fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
                fontSize: 11,
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "1px 1px 0 0 #000",
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="win2k-slug"
      style={{
        minHeight: "100vh", background: "#008080",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <style>{win2kStyle}</style>
      <div
        style={{
          background: "#D4D0C8",
          border: "2px solid",
          borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
          boxShadow: "2px 2px 0 0 #000",
          width: 320,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "linear-gradient(to right, #000080, #1084D0)",
            padding: "3px 6px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>💼</span>
          <span style={{ color: "#FFF", fontWeight: "bold", fontSize: 11 }}>Onyx Tontine — Chargement</span>
        </div>

        <div style={{ padding: "24px", textAlign: "center" }}>
          <div className="win-spinning" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontWeight: "bold", fontSize: 12 }}>Chargement de la tontine...</p>
          <p style={{ fontSize: 10, color: "#666", marginTop: 4 }}>Veuillez patienter.</p>
        </div>

        {/* Status bar */}
        <div
          style={{
            borderTop: "1px solid #808080",
            background: "#D4D0C8",
            padding: "2px 6px",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>Connexion à la base de données...</span>
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh", background: "#008080",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
          }}
        >
          <div
            style={{
              background: "#D4D0C8",
              border: "2px solid",
              borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
              padding: "24px 48px",
              textAlign: "center",
            }}
          >
            <p style={{ fontWeight: "bold", fontSize: 12 }}>Initialisation...</p>
          </div>
        </div>
      }
    >
      <SlugPageContent params={params} />
    </Suspense>
  );
}
