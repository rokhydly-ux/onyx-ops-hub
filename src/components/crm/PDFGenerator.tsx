"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGeneratorRef {
  generateCatalogPDF: (products: any[], templateType: string, clientName: string, logoUrl?: string) => Promise<void>;
}

const PDFGenerator = forwardRef<PDFGeneratorRef, {}>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfData, setPdfData] = useState<{ products: any[], templateType: string, clientName: string, logoUrl?: string } | null>(null);

  useImperativeHandle(ref, () => ({
    generateCatalogPDF: async (products, templateType, clientName, logoUrl) => {
      // Déclenche le rendu du template invisible
      setPdfData({ products, templateType, clientName, logoUrl });
      
      // Laisser le temps au DOM et aux images (CORS) de se charger complètement
      await new Promise(resolve => setTimeout(resolve, 800));

      if (containerRef.current) {
        try {
          const canvas = await html2canvas(containerRef.current, {
            scale: 2, // Pour une qualité HD (Retina)
            useCORS: true, // Autorise le chargement d'images d'autres domaines
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          // Ajuster la hauteur proportionnellement à l'image générée
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Catalogue_Onyx_${clientName ? clientName.replace(/\s+/g, '_') : 'Client'}.pdf`);
        } catch (error) {
          console.error("Erreur lors de la génération du PDF :", error);
        }
      }
      
      // Nettoyer le DOM après la génération
      setPdfData(null);
    }
  }));

  if (!pdfData) return null;

  // Calcul de la grille Tailwind selon le type de template
  let gridClass = 'grid-cols-2';
  if (pdfData.templateType === 'grid-6') gridClass = 'grid-cols-3';
  else if (pdfData.templateType === 'full' || pdfData.templateType === 'list') gridClass = 'grid-cols-1';

  return (
    <div className="absolute left-[-9999px] top-0 pointer-events-none opacity-0">
      {/* Format A4 approximatif: 794px width x 1123px height */}
      <div 
        ref={containerRef} 
        className="w-[794px] min-h-[1123px] bg-white text-black p-12 font-sans flex flex-col relative"
      >
        {/* Filigrane (Watermark) transparent */}
        {pdfData.logoUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0 overflow-hidden">
            <img src={pdfData.logoUrl} alt="Watermark" className="max-w-[70%] max-h-[70%] object-contain grayscale" crossOrigin="anonymous" />
          </div>
        )}

        {/* Header Premium */}
        <div className="flex justify-between items-end border-b-[4px] border-black pb-6 mb-10 shrink-0">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter">
              Onyx<span className="text-[#39FF14]">CRM</span>
            </h1>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">
              Sélection Exclusive
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black uppercase tracking-tight">{pdfData.clientName || 'Notre Client'}</p>
            <p className="text-sm font-bold text-zinc-400 mt-1">Édité le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        {/* Grille de Produits */}
        <div className={`grid ${gridClass} gap-8 flex-1 content-start`}>
          {pdfData.products.map((product, index) => (
            <div key={index} className="bg-zinc-50 border border-zinc-200 rounded-[2rem] p-5 flex flex-col">
              <div className={`w-full bg-zinc-200 rounded-[1.5rem] overflow-hidden mb-5 ${pdfData.templateType === 'full' ? 'h-80' : 'h-48'}`}>
                <img 
                  src={product.image_url || product.image || `https://placehold.co/400x400/1a1a1a/39FF14?text=Onyx`} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{product.category || 'Catégorie'} • Réf: {product.odoo_id || product.odooRef || 'N/A'}</p>
                <h3 className="text-xl font-black uppercase tracking-tight leading-tight line-clamp-2 mb-2">{product.name}</h3>
                <p className="text-xs font-medium text-zinc-500 line-clamp-3 mb-4 flex-1">{product.description || 'Produit de qualité supérieure.'}</p>
                
                {(product.variants?.sizes?.length > 0 || product.variants?.colors?.length > 0) && (
                  <div className="mb-4 space-y-1">
                    {product.variants?.sizes?.length > 0 && (
                      <p className="text-[9px] font-bold text-zinc-800"><span className="uppercase tracking-widest text-zinc-400 mr-1">Tailles:</span> {product.variants.sizes.map((s: any) => s.name || s).join(', ')}</p>
                    )}
                    {product.variants?.colors?.length > 0 && (
                      <p className="text-[9px] font-bold text-zinc-800"><span className="uppercase tracking-widest text-zinc-400 mr-1">Couleurs:</span> {product.variants.colors.map((c: any) => c.name || c).join(', ')}</p>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-zinc-200 flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Prix TTC</span>
                  <span className="text-2xl font-black text-[#39FF14]">{(product.price_ttc || product.price || 0).toLocaleString('fr-FR')} F</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-zinc-200 text-center shrink-0">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Généré par le Studio PDF OnyxOps</p>
          <p className="text-[9px] font-bold text-zinc-300 mt-1">© {new Date().getFullYear()} OnyxOps Elite. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
});

export default PDFGenerator;