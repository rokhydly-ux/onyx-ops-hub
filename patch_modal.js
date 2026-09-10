const fs = require('fs');

const file = 'src/app/nutrition/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const modalCode = `
      {/* MODALE DE DÉTAILS DE COMMANDE (À PLACER À LA FIN DE page.tsx) */}
      {showOrderDetailsModal && selectedOrderDetails && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#151515] w-full max-w-md rounded-[2rem] p-6 relative shadow-2xl overflow-hidden">

                  {/* BOUTON FERMER */}
                  <button
                      onClick={() => setShowOrderDetailsModal(false)}
                      className="absolute top-4 right-4 bg-gray-100 dark:bg-white/10 p-2 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                      ✕
                  </button>

                  {/* EN-TÊTE MODALE */}
                  <h3 className="font-black text-xl mb-1 dark:text-white">Détails Commande</h3>
                  <p className="text-sm text-gray-500 mb-6 uppercase">
                      #{selectedOrderDetails.id?.substring(0, 8) || 'N/A'}
                  </p>

                  {/* CONTENU (RÉCAPITULATIF) */}
                  <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-500 font-bold">Statut :</span>
                              <span className="text-xs font-black px-3 py-1 bg-[#39FF14]/20 text-[#2db30f] rounded-full uppercase">
                                  {selectedOrderDetails.status || 'Nouveau'}
                              </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-500 font-bold">Total :</span>
                              <span className="text-lg font-black dark:text-white">
                                  {selectedOrderDetails.total || selectedOrderDetails.total_amount} FCFA
                              </span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                              <span className="text-xs text-gray-500 font-bold block mb-1">Informations :</span>
                              <span className="text-sm dark:text-white block">{selectedOrderDetails.address || 'Aucune adresse renseignée.'}</span>
                          </div>
                      </div>
                  </div>

                  {/* BOUTON D'ACTION */}
                  <button
                      onClick={() => setShowOrderDetailsModal(false)}
                      className="w-full bg-[#39FF14] text-black font-black py-4 rounded-full active:scale-95 transition-transform"
                  >
                      Fermer
                  </button>
              </div>
          </div>
      )}
`;

content = content.replace("      {/* BOTTOM NAVIGATION MOBILE */}", modalCode + "\n      {/* BOTTOM NAVIGATION MOBILE */}");
fs.writeFileSync(file, content);
