const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const oldFooterStart = `<footer className="bg-black text-white py-12 px-6 mt-20 text-center border-t border-zinc-800">`;
const oldFooterEnd = `</footer>`;

const footerStartIdx = pageContent.indexOf(oldFooterStart);
if (footerStartIdx !== -1) {
    const footerEndIdx = pageContent.indexOf(oldFooterEnd, footerStartIdx);
    if (footerEndIdx !== -1) {

        const newFooter = `<footer className="bg-black text-white py-16 mt-20 border-t-4 border-[#39FF14]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
           <div className="md:col-span-2">
              <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro Logo" className="h-16 w-auto mb-6 object-contain" />
              <p className="text-zinc-400 font-medium text-sm max-w-sm leading-relaxed mb-6">
                 La première application nutritionnelle 100% adaptée aux réalités africaines. Atteignez vos objectifs sans abandonner vos plats locaux préférés.
              </p>
              <div className="flex gap-4">
                 <button onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#39FF14] hover:text-black transition-colors text-zinc-400">
                    <MessageCircle size={20}/>
                 </button>
                 <button onClick={() => window.open('https://instagram.com/onyx', '_blank')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#39FF14] hover:text-black transition-colors text-zinc-400">
                    <Camera size={20}/>
                 </button>
                 <button onClick={() => window.open('https://tiktok.com/@onyx', '_blank')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#39FF14] hover:text-black transition-colors text-zinc-400">
                    <Video size={20}/>
                 </button>
              </div>
           </div>
           <div>
              <h4 className="font-black text-lg uppercase tracking-widest mb-6 flex items-center gap-2"><Globe className="text-[#39FF14]"/> Ressources</h4>
              <ul className="space-y-4 text-zinc-400 font-bold text-sm">
                 <li><button onClick={() => window.open('https://rokhydiallo.com', '_blank')} className="hover:text-[#39FF14] transition-colors flex items-center gap-2"><ArrowRight size={14}/> Notre Méthode</button></li>
                 <li><button onClick={() => window.open('https://rokhydiallo.com/boutique', '_blank')} className="hover:text-[#39FF14] transition-colors flex items-center gap-2"><ArrowRight size={14}/> Boutique Onyx</button></li>
                 <li><button onClick={() => window.open('https://rokhydiallo.com/contact', '_blank')} className="hover:text-[#39FF14] transition-colors flex items-center gap-2"><ArrowRight size={14}/> Espace Coaching</button></li>
              </ul>
           </div>
           <div>
              <h4 className="font-black text-lg uppercase tracking-widest mb-6 flex items-center gap-2"><Settings className="text-[#39FF14]"/> Légal & Aide</h4>
              <ul className="space-y-4 text-zinc-400 font-bold text-sm mb-8">
                 <li><button className="hover:text-[#39FF14] transition-colors flex items-center gap-2"><ArrowRight size={14}/> CGV / CGU</button></li>
                 <li><button className="hover:text-[#39FF14] transition-colors flex items-center gap-2"><ArrowRight size={14}/> Politique de Confidentialité</button></li>
                 <li><button className="hover:text-[#39FF14] transition-colors flex items-center gap-2"><ArrowRight size={14}/> Support Client (WhatsApp)</button></li>
              </ul>

              <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Disponible bientôt</p>
                 <div className="flex gap-3">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 opacity-50 grayscale cursor-not-allowed">
                       <Apple size={20}/>
                       <div>
                          <p className="text-[8px] uppercase font-bold text-zinc-400">Download on</p>
                          <p className="text-xs font-black">App Store</p>
                       </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 opacity-50 grayscale cursor-not-allowed">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" className="w-5 h-5"/>
                       <div>
                          <p className="text-[8px] uppercase font-bold text-zinc-400">Get it on</p>
                          <p className="text-xs font-black">Google Play</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-xs font-bold text-zinc-600">© {new Date().getFullYear()} Onyx Ops Elite. Tous droits réservés.</p>
           <p className="text-[10px] font-black tracking-widest uppercase text-zinc-700 bg-zinc-900 px-3 py-1.5 rounded-full">Designed in Senegal 🇸🇳</p>
        </div>
      </footer>`;

        pageContent = pageContent.substring(0, footerStartIdx) + newFooter + pageContent.substring(footerEndIdx + 9);
        fs.writeFileSync('src/app/nutrition/page.tsx', pageContent);
        console.log("Footer replaced.");
    }
} else {
    console.log("Old footer not found.");
}
