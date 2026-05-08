"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  Sun, Moon, ArrowRight, Database, Users, ShieldCheck, 
  Settings, CheckCircle, ChevronRight, Zap, Briefcase, X, Send, MessageSquare
} from 'lucide-react';

export default function OnyxModernizePage() {
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const waNumber = "221785338417";
  const [refId, setRefId] = useState<string | null>(null);

  // Configuration Bot Fanta
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isBotDismissed, setIsBotDismissed] = useState(false);
  const [userReply, setUserReply] = useState("");
  const [botStep, setBotStep] = useState(0);
  const [botData, setBotData] = useState({ name: '', phone: '', city: '', business: '', question: '' });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { sender: 'bot', text: "👋 Bonjour ! Je suis Fanta, experte en intégration. Prêt à structurer votre écosystème digital ? Que voulez-vous savoir ?", options: ["Comment ça marche ?", "C'est quoi les tarifs ?", "Je veux un audit de modernisation 🚀"] }
  ]);

  // Gestion du scroll pour la navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('ref') || localStorage.getItem('onyx_ambassador_ref');
    if (ref) {
      setRefId(ref);
      localStorage.setItem('onyx_ambassador_ref', ref);
    }
    const timer = setTimeout(() => setIsBotOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [botMessages]);

  const processBotReply = (reply: string) => {
    if(!reply.trim()) return;
    const newMsgs = [...botMessages, { sender: 'client', text: reply }];
    setBotMessages(newMsgs);
    setUserReply("");

    setTimeout(async () => {
        let botResponse = "";
        let botOptions: string[] | undefined = undefined;
        let nextStep = botStep;
        let currentData = { ...botData };

        if (botStep === 0) {
            const lowerReply = reply.toLowerCase();
            if (lowerReply.includes('marche') || lowerReply.includes('comment')) {
                botResponse = "C'est notre offre VIP : on déploie l'intégralité de votre système digital, on migre vos données (Odoo, Excel) et on forme vos équipes sur le terrain. Prêt à moderniser votre entreprise ?";
                botOptions = ["Je veux un audit de modernisation 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('tarifs') || lowerReply.includes('prix') || lowerReply.includes('combien')) {
                botResponse = "L'intégration VIP Onyx Modernize est un forfait unique à partir de 300 000 F, avec un suivi complet. On se lance ?";
                botOptions = ["Je veux un audit de modernisation 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('audit') || lowerReply.includes('lance') || lowerReply.includes('oui') || lowerReply.includes('modernis')) {
                botResponse = "Génial ! 🚀 Pour préparer le chiffrage de votre déploiement, quel est votre prénom et nom ?";
                nextStep = 1;
            } else {
                botResponse = "Je vois ! Pour vous aider au mieux, quel est votre prénom et nom ?";
                currentData.question = reply;
                nextStep = 1;
            }
        }
        else if (botStep === 1) {
            currentData.name = reply;
            botResponse = `Enchantée ${reply.split(' ')[0]} ! Quel est votre numéro WhatsApp (ex: 77 123 45 67) ?`;
            nextStep = 2;
        }
        else if (botStep === 2) {
            currentData.phone = reply;
            botResponse = "Super. Dans quelle ville se trouve votre entreprise ?";
            nextStep = 3;
        }
        else if (botStep === 3) {
            currentData.city = reply;
            botResponse = "Dernière question : quel est le nom de votre entreprise ?";
            nextStep = 4;
        }
        else if (botStep === 4) {
            currentData.business = reply;
            botResponse = "Parfait ! J'ai toutes les infos. Je vous redirige vers notre équipe d'intégration sur WhatsApp ! 🚀";
            nextStep = 5;
            
            try {
                await supabase.from('leads').insert([{
                    full_name: currentData.name, phone: currentData.phone, city: currentData.city,
                    message: `Entreprise: ${currentData.business} | Note: ${currentData.question || 'Veut une intégration Modernize'}`,
                    intent: 'Je veux une intégration (Onyx Modernize)', source: 'Bot Fanta (Onyx Modernize)', status: 'Nouveau', saas: 'Onyx Modernize', ambassador_id: refId || undefined
                }]);
            } catch (err) {}

            const waMsg = `🚀 *Audit Onyx Modernize*\n\nJe souhaite structurer mon entreprise !\n\n*Nom:* ${currentData.name}\n*Entreprise:* ${currentData.business}\n*Ville:* ${currentData.city}\n\nComment on procède pour le déploiement ?`;
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`, "_blank"); }, 1500);
        }

        setBotData(currentData);
        setBotStep(nextStep);
        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);
    }, 1000);
  };

  const handleWaClick = () => {
    const message = "Bonjour l'équipe Onyx ! Je souhaite réserver un audit gratuit pour l'installation VIP Onyx Modernize de mon entreprise.";
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Thèmes de couleurs dynamiques
  const theme = {
    bg: isDark ? 'bg-[#050505]' : 'bg-zinc-50',
    text: isDark ? 'text-white' : 'text-zinc-900',
    cardBg: isDark ? 'bg-zinc-900/50' : 'bg-white',
    cardBorder: isDark ? 'border-zinc-800' : 'border-zinc-200',
    accentText: isDark ? 'text-zinc-400' : 'text-zinc-600',
    navBg: isDark ? 'bg-[#050505]/80' : 'bg-white/80',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans transition-colors duration-500 selection:bg-[#00E5FF] selection:text-black`}>
      
      {/* BACKGROUND ELEMENTS (Premium Glow) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00E5FF]/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b ${isScrolled ? (isDark ? 'border-zinc-800' : 'border-zinc-200') : 'border-transparent'} ${theme.navBg}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className={`w-8 h-8 ${isDark ? 'bg-white' : 'bg-black'} rounded-md flex items-center justify-center`}>
              <Briefcase size={18} className={isDark ? 'text-black' : 'text-white'} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">Onyx <span className="text-[#00E5FF]">Modernize</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'}`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleWaClick} className="hidden md:flex bg-[#00E5FF] text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              Demander un Audit
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className={`inline-flex items-center gap-2 ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'} border px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm`}>
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span> Service d'Intégration VIP
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1] uppercase">
          Vous dirigez. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-blue-600">Nous construisons la machine.</span>
        </h1>
        
        <p className={`text-lg md:text-xl font-bold max-w-2xl mx-auto mb-12 leading-relaxed ${theme.accentText}`}>
          Ne touchez à aucun code. Ne perdez aucune donnée. L'équipe Onyx déploie l'intégralité de votre infrastructure digitale, migre votre historique et forme vos employés sur le terrain. 
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button onClick={handleWaClick} className="w-full sm:w-auto bg-[#00E5FF] text-black px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_15px_40px_rgba(0,229,255,0.25)] flex justify-center items-center gap-2">
            Prendre RDV pour un chiffrage <ArrowRight size={18} />
          </button>
          <p className={`text-xs font-bold uppercase tracking-widest ${theme.accentText} sm:ml-4`}>
            Dès 300 000 FCFA <br className="hidden sm:block"/> (Paiement Unique)
          </p>
        </div>
      </main>

      {/* SECTION BÉNÉFICES - LE PROCESSUS VIP */}
      <section className={`py-24 border-t ${isDark ? 'border-zinc-900 bg-black/50' : 'border-zinc-200 bg-white/50'} relative z-10`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Le Service <span className="text-[#00E5FF]">Gant Blanc</span></h2>
            <p className={`font-bold ${theme.accentText}`}>On s'occupe de la technique. Vous vous occupez d'encaisser.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Carte 1 */}
            <div className={`${theme.cardBg} border ${theme.cardBorder} p-10 rounded-[2.5rem] hover:border-[#00E5FF]/50 transition-colors group shadow-xl`}>
              <div className="w-14 h-14 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">Migration des Données</h3>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${theme.accentText}`}>
                Vous utilisez déjà Odoo, Excel, ou des carnets de reçus ? Nous récupérons 100% de votre historique clients, de vos stocks et de vos factures pour les injecter proprement dans votre nouveau Hub Onyx. Zéro perte.
              </p>
            </div>

            {/* Carte 2 */}
            <div className={`${theme.cardBg} border ${theme.cardBorder} p-10 rounded-[2.5rem] hover:border-[#00E5FF]/50 transition-colors group shadow-xl`}>
              <div className="w-14 h-14 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Settings size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">Setup Technique & APIs</h3>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${theme.accentText}`}>
                Nous configurons OnyxCRM, vos catalogues, et connectons vos méthodes de paiement locales (Wave, Orange Money) directement sur votre infrastructure. Tout est prêt à l'emploi.
              </p>
            </div>

            {/* Carte 3 */}
            <div className={`${theme.cardBg} border ${theme.cardBorder} p-10 rounded-[2.5rem] hover:border-[#00E5FF]/50 transition-colors group shadow-xl md:col-span-2 lg:col-span-1`}>
              <div className="w-14 h-14 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">Formation sur le Terrain</h3>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${theme.accentText}`}>
                Un logiciel n'est puissant que si vos employés l'utilisent. Nos experts se déplacent dans vos locaux (Dakar et régions) pour former vos vendeurs, caissiers et livreurs à l'utilisation quotidienne des outils.
              </p>
            </div>

            {/* Carte 4 (Le secret) */}
            <div className={`${theme.cardBg} border ${theme.cardBorder} p-10 rounded-[2.5rem] hover:border-[#00E5FF]/50 transition-colors group shadow-xl md:col-span-2 lg:col-span-1`}>
              <div className="w-14 h-14 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">Confidentialité & Sécurité</h3>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${theme.accentText}`}>
                Vos données financières vous appartiennent. Nous mettons en place des rôles de sécurité stricts pour que vos vendeurs ne voient pas vos marges nettes, tout en assurant une sauvegarde cloud en temps réel.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CHECKLIST SECTION */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-[3rem] p-10 md:p-16 shadow-2xl`}>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-center">Inclus dans le déploiement</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Audit des processus actuels",
                "Nettoyage base de données Excel/Odoo",
                "Paramétrage complet Onyx CRM",
                "Création du Catalogue Digital VIP",
                "Intégration WhatsApp Business API",
                "Hiérarchie des accès (Patron vs Employés)",
                "Formation présentielle (1/2 journée)",
                "Suivi VIP 30 jours Post-Lancement"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="text-[#00E5FF] flex-shrink-0 mt-0.5" size={20} />
                  <span className={`font-bold text-sm ${theme.accentText}`}>{item}</span>
                </div>
              ))}
            </div>

            <div className={`mt-12 pt-8 border-t ${theme.cardBorder} text-center`}>
              <p className={`text-xs font-black uppercase tracking-widest mb-4 flex justify-center items-center gap-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                <Zap size={14} className="text-[#00E5FF]" /> Capacité Limitée
              </p>
              <p className={`text-sm font-bold max-w-lg mx-auto ${theme.accentText}`}>
                Pour garantir l'excellence de notre service d'intégration sur site, nous n'acceptons que <span className={isDark ? 'text-white' : 'text-black'}>4 nouveaux chantiers de modernisation par mois</span>. 
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-[#00E5FF] text-black text-center px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">Prêt à changer de dimension ?</h2>
        <p className="font-bold mb-10 max-w-xl mx-auto opacity-80">
          Arrêtez de gérer des problèmes techniques. Concentrez-vous sur la croissance de votre empire.
        </p>
        <button onClick={handleWaClick} className="bg-black text-[#00E5FF] px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 hover:bg-zinc-900 transition-all shadow-2xl flex justify-center items-center gap-3 mx-auto">
          Contacter la Direction Onyx <ChevronRight size={18} />
        </button>
      </section>

      {/* BOT FANTA FAQ ONYX MODERNIZE */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
        {isBotOpen && (
          <div className={`${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'} rounded-[2rem] shadow-2xl border-2 border-[#00E5FF] p-0 mb-4 w-[340px] h-[400px] flex flex-col animate-in zoom-in duration-300 overflow-hidden`}>
             <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'} p-4 flex justify-between items-center border-b`}>
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-zinc-900' : 'bg-white'} border border-[#00E5FF] flex items-center justify-center text-xl`}>👩🏾‍💻</div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00E5FF] rounded-full border border-black animate-pulse"></div>
                   </div>
                   <div><p className="text-[#00E5FF] font-black uppercase text-xs tracking-wider">Fanta - Experte Intégration</p></div>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="text-zinc-500 hover:text-[#00E5FF] transition"><X size={18}/></button>
             </div>
             
             <div className={`flex-1 ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-50'} p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar`}>
                {botMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                      <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? (isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border border-zinc-200 text-zinc-900') + ' rounded-tl-none shadow-sm' : 'bg-[#00E5FF] text-black rounded-tr-none shadow-md'}`}>
                         {msg.text}
                      </div>
                      {msg.options && (
                         <div className="flex flex-wrap gap-2 mt-2 w-full">
                            {msg.options.map((opt: string, idx: number) => (
                               <button key={idx} onClick={() => processBotReply(opt)} className={`${isDark ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-black hover:text-[#00E5FF]' : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:text-[#00E5FF]'} text-xs font-bold px-4 py-2 rounded-xl border shadow-sm transition-colors`}>{opt}</button>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <div className={`p-3 ${isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'} border-t flex gap-2`}>
                <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processBotReply(userReply)} placeholder="Poser une question..." className={`flex-1 ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-transparent text-zinc-900'} border rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-[#00E5FF]`} />
                <button onClick={() => processBotReply(userReply)} className="bg-[#00E5FF] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
             </div>
          </div>
        )}
        
        {!isBotOpen && !isBotDismissed && (
           <div className="relative group animate-bounce flex items-center justify-center">
             <button onClick={(e) => { e.stopPropagation(); setIsBotDismissed(true); }} className={`absolute -top-1 -right-1 ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-black'} border p-1 rounded-full z-10 transition-colors shadow-sm`}>
               <X size={14} />
             </button>
             <button onClick={() => setIsBotOpen(true)} className={`w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#00E5FF] hover:scale-110 transition-transform ${isDark ? 'bg-black' : 'bg-white'} relative flex items-center justify-center text-2xl`}>
               👩🏾‍💻
             </button>
           </div>
        )}
      </div>

    </div>
  );
}