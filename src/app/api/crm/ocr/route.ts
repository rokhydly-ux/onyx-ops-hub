import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Récupération du FormData et du fichier envoyé (image)
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image'); // Support des deux clés courantes

    if (!file) {
      return NextResponse.json(
        { error: "Aucune image ou fichier fourni pour l'analyse OCR." },
        { status: 400 }
      );
    }

    // Simulation du temps d'analyse de l'IA (2000 millisecondes)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Renvoi des données extraites fictives (Mock)
    return NextResponse.json({
      extractedName: "Client WhatsApp OCR",
      extractedPhone: "+221 77 000 00 00",
      detectedProduct: "Four Pro Inox"
    }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur de traitement OCR :", error.message);
    return NextResponse.json({ error: "Erreur interne du serveur lors de l'analyse." }, { status: 500 });
  }
}