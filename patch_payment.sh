sed -i '/{showRedoDiagModal && (/i \
      {/* MODALE DE PAIEMENT */}\
      {showPaymentModal && (\
        <div id="payment-modal-overlay" onClick={(e: any) => { if(e.target.id === "payment-modal-overlay") setShowPaymentModal(false); }} className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">\
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full relative shadow-[0_0_50px_rgba(57,255,20,0.3)] border-t-[8px] border-[#39FF14] animate-in zoom-in-95 flex flex-col items-center text-center">\
             <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>\
             <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6 relative">\
                 <CreditCard size={40} className="text-black" />\
             </div>\
             <h3 className="text-2xl font-black uppercase text-black mb-2 tracking-tighter">Abonnement</h3>\
             <p className="text-sm font-bold text-zinc-500 mb-8">Prolonge ton abonnement Premium pour continuer à profiter de toutes les fonctionnalités de l\&apos;application !</p>\
             <div className="w-full space-y-3">\
                 <button onClick={handleProcessPayment} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(57,255,20,0.4)] animate-pulse flex justify-center items-center gap-2">\
                     Payer 30 jours\
                 </button>\
             </div>\
          </div>\
        </div>\
      )}\
\
' src/app/nutrition/page.tsx
