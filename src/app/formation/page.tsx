"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  PlayCircle, BookOpen, FileText, ChevronRight, 
  LogOut, Shield, Download, CheckCircle, Star, X, Save, Edit3, ArrowLeft, Maximize, Minimize, Lock, Send, MessageSquare, Trophy
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TYPES ---
type Course = { id: string; title: string; description: string; video_url: string; duration: string; order: number; pdf_url?: string; };

const DEFAULT_COURSES: Course[] = [
  { id: "1", title: "Le Protocole Andromeda (Structure)", description: "Les bases du marketing en Afrique. Comprendre son audience et structurer son offre.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18 min", order: 1 },
  { id: "2", title: "La Créa comme Ciblage (Hook & Filtrage)", description: "Créer des campagnes publicitaires rentables sans exploser son budget.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "24 min", order: 2 },
  { id: "3", title: "Conversion WhatsApp & Bot", description: "Maîtriser la création visuelle pour vos réseaux sociaux et vos offres.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15 min", order: 3 },
  { id: "4", title: "Scaling : Multiplier le budget sans crash", description: "Maîtriser l'augmentation du budget publicitaire de façon sereine.", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "20 min", order: 4 },
];

const QUIZ_DATA: Record<string, { question: string; options: string[]; correctAnswer: number; explanation: string }[]> = {
  "1": [
    { question: "Quelle est la première étape cruciale avant de lancer une publicité ?", options: ["Augmenter le budget", "Comprendre son audience cible et son besoin profond", "Copier les concurrents", "Créer un logo"], correctAnswer: 1, explanation: "Sans comprendre les frustrations de votre audience, aucune publicité ne fonctionnera." },
    { question: "Pourquoi l'offre est-elle plus importante que le budget publicitaire ?", options: ["Une excellente offre se vend même avec un petit budget", "C'est faux, seul le budget compte", "L'algorithme préfère les belles offres", "Pour payer moins de taxes"], correctAnswer: 0, explanation: "Une offre irrésistible convertit naturellement, le budget ne fait qu'amplifier ce qui marche." },
    { question: "Quel élément compose le 'Protocole Andromeda' ?", options: ["La structuration d'une offre irrésistible", "Un logiciel de montage", "Un hack secret Facebook", "Une technique de comptabilité"], correctAnswer: 0, explanation: "Le protocole Andromeda consiste à créer une offre tellement forte qu'elle devient stupide à refuser." },
    { question: "Sur quel canal de vente l'audience africaine est-elle la plus réactive ?", options: ["Les sites web classiques", "L'emailing", "WhatsApp", "Les SMS"], correctAnswer: 2, explanation: "WhatsApp est le canal de communication numéro 1, il permet de créer de la confiance et une discussion instantanée." }
  ],
  "2": [
    { question: "Quel est le rôle principal du 'Hook' dans une vidéo ?", options: ["Faire rire", "Capter l'attention dans les 3 premières secondes", "Montrer le logo de la marque", "Demander un abonnement"], correctAnswer: 1, explanation: "Si vous ne captez pas l'attention dans les 3 premières secondes, l'utilisateur continuera à scroller." },
    { question: "Pourquoi dit-on que 'la créa est le nouveau ciblage' ?", options: ["Les options de ciblage classiques ne marchent plus", "L'algorithme se sert du contenu visuel et textuel pour trouver la bonne audience", "Facebook a supprimé les ciblages", "C'est une métaphore sans fondement"], correctAnswer: 1, explanation: "L'IA analyse le contenu de votre vidéo pour la montrer aux personnes les plus susceptibles d'interagir." },
    { question: "Quelle erreur faut-il éviter lors de la création d'une publicité ?", options: ["Parler uniquement des caractéristiques du produit au lieu des bénéfices", "Utiliser du texte sur la vidéo", "Montrer des visages", "Mettre une musique de fond"], correctAnswer: 0, explanation: "Les clients achètent une transformation ou un bénéfice, pas juste des caractéristiques techniques." },
    { question: "Comment filtrer les 'curieux' via votre publicité ?", options: ["En ne mettant pas de lien", "En annonçant clairement le prix ou la cible directement dans la vidéo", "En bloquant les commentaires", "En réduisant le budget"], correctAnswer: 1, explanation: "Annoncer le prix d'entrée de jeu permet d'éviter les messages de personnes qui n'ont pas le budget." }
  ],
  "3": [
    { question: "Quel est le but principal de l'automatisation WhatsApp ?", options: ["Paraître plus professionnel", "Répondre instantanément et filtrer les prospects pour gagner du temps", "Envoyer du spam", "Remplacer totalement les humains"], correctAnswer: 1, explanation: "L'automatisation traite le volume et filtre les prospects chauds, avant que l'humain ne conclut la vente." },
    { question: "Qu'est-ce qui augmente drastiquement le taux de conversion en DM ?", options: ["La réactivité et la personnalisation de l'échange", "L'envoi de longs pavés de texte", "Mettre 2 jours à répondre pour créer la rareté", "Envoyer 10 photos d'un coup"], correctAnswer: 0, explanation: "Plus vous répondez vite de manière pertinente, plus le client est en confiance pour acheter." },
    { question: "Comment gérer efficacement les objections de prix sur WhatsApp ?", options: ["Ignorer le client", "Baisser le prix immédiatement", "En justifiant la valeur de l'offre avant de donner le prix", "S'énerver"], correctAnswer: 2, explanation: "La perception du prix dépend de la valeur perçue. Montez la valeur avant d'annoncer le montant." },
    { question: "Pourquoi intégrer un Bot de qualification ?", options: ["Pour faire moderne", "Pour récolter les informations de base du client (besoin, ville) avant que l'humain n'intervienne", "Pour bloquer les clients", "Pour envoyer des vidéos YouTube"], correctAnswer: 1, explanation: "Le bot fait le travail ingrat : il pose les questions répétitives pour que vous ne parliez qu'aux gens qualifiés." }
  ],
  "4": [
    { question: "Qu'est-ce que le 'Scaling' en publicité ?", options: ["Réduire son budget", "Augmenter le budget publicitaire tout en maintenant la rentabilité", "Changer de plateforme", "Supprimer ses campagnes"], correctAnswer: 1, explanation: "Le vrai challenge du scaling est de dépenser plus tout en gardant un coût par acquisition (CPA) rentable." },
    { question: "Quelle est la meilleure approche pour scaler sans crasher les résultats ?", options: ["Multiplier le budget par 10 d'un coup", "Augmenter le budget progressivement (15-20%) tous les 2-3 jours", "Dupliquer la campagne 50 fois", "Changer la vidéo tous les jours"], correctAnswer: 1, explanation: "Les augmentations brutales perturbent l'algorithme d'apprentissage. Allez-y par paliers." },
    { question: "Quand faut-il absolument couper ou modifier une campagne ?", options: ["Au bout de 2 heures", "Quand elle n'a pas de likes", "Quand le coût par acquisition dépasse la marge bénéficiaire tolérée", "Quand un concurrent fait mieux"], correctAnswer: 2, explanation: "La seule vraie métrique (KPI) qui compte est votre rentabilité (ROAS/CPA)." },
    { question: "Quelle métrique est la plus importante lors du scaling ?", options: ["Le Coût Par Clic (CPC)", "Le Taux de clic (CTR)", "Le Retour sur Investissement Publicitaire (ROAS) / CPA", "Les partages"], correctAnswer: 2, explanation: "Vous pouvez avoir des clics chers, mais si le ROAS est excellent, la campagne est gagnante." }
  ]
};

export default function OnyxFormationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Dashboard states
  const [coursesList, setCoursesList] = useState<Course[]>(DEFAULT_COURSES);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(DEFAULT_COURSES[0]);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Notes states
  const [courseNotes, setCourseNotes] = useState<Record<string, string>>({});
  
  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ full_name: "", phone: "", avatar_url: "" });

  // UX enhancements states
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [videoProgress, setVideoProgress] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xp, setXp] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  // Lika Chat states
  const [isLikaChatOpen, setIsLikaChatOpen] = useState(false);
  const [userReply, setUserReply] = useState("");
  const [likaMessages, setLikaMessages] = useState<{sender: 'bot'|'client', text: string}[]>([
    { sender: 'bot', text: "Salut ! Je suis Lika, ta Stratège. Pose-moi tes questions sur ce module, je suis là pour t'aider !" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- MESSAGE DYNAMIQUE POUR LIKA ---
  const getLikaMessage = (courseId: string) => {
    switch(courseId) {
      case "1": return "Prêt à dompter l'algorithme ? On pose les bases solides ici !";
      case "2": return "N'oublie pas, le Hook fait 80% du travail ! Concentre-toi sur les 3 premières secondes.";
      case "3": return "C'est ici qu'on transforme les clics en cash. Optimise tes réponses !";
      case "4": return "Ici la Stratège. On accélère ! Augmente le budget sans casser ton coût par acquisition.";
      default: return "Note tes meilleures idées ici, je veille au grain !";
    }
  };

  // --- YOUTUBE API & AUTO-PROGRESSION ---
  useEffect(() => {
    if (!selectedCourse) return;
    setVideoProgress(0);

    const handleVideoEnded = () => {
      setShowQuiz(true);
    };

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      
      playerRef.current = new (window as any).YT.Player("yt-player", {
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              // Tracking des vues pour les statistiques Admin
              const views = JSON.parse(localStorage.getItem('onyx_video_views') || '{}');
              views[selectedCourse.id] = (views[selectedCourse.id] || 0) + 1;
              localStorage.setItem('onyx_video_views', JSON.stringify(views));
              
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                if (playerRef.current?.getCurrentTime && playerRef.current?.getDuration) {
                  const current = playerRef.current.getCurrentTime();
                  const total = playerRef.current.getDuration();
                  if (total > 0) setVideoProgress((current / total) * 100);
                }
              }, 1000);
            } else {
              if (intervalRef.current) clearInterval(intervalRef.current);
            }

            if (event.data === (window as any).YT.PlayerState.ENDED) {
              handleVideoEnded();
            }
          }
        }
      });
    };

    if (!(window as any).YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      // Délai pour s'assurer que le nouvel iframe est monté dans le DOM
      setTimeout(initPlayer, 500);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedCourse]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [likaMessages, isLikaChatOpen]);

  const handleLikaSend = () => {
    if (!userReply.trim()) return;
    setLikaMessages(prev => [...prev, { sender: 'client', text: userReply }]);
    const currentReply = userReply;
    setUserReply("");
    
    setTimeout(() => {
       let botResponse = "C'est une excellente question ! Dans ce module, concentre-toi sur l'application pratique de la méthode. N'hésite pas à revoir la vidéo si un concept t'échappe.";
       const lowerReply = currentReply.toLowerCase();
       if (lowerReply.includes('hook') || lowerReply.includes('attention')) botResponse = "Le Hook fait 80% du travail ! Assure-toi que les 3 premières secondes de ta vidéo posent une question ou montrent un résultat choquant.";
       else if (lowerReply.includes('budget') || lowerReply.includes('scaling')) botResponse = "La règle d'or du scaling : n'augmente jamais ton budget de plus de 20% par jour pour ne pas casser l'algorithme de Facebook/TikTok !";
       else if (lowerReply.includes('bot') || lowerReply.includes('whatsapp')) botResponse = "Automatiser WhatsApp te permet de filtrer les curieux. Demande toujours le besoin et le budget avant qu'un humain ne prenne le relais !";
       
       setLikaMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  const handleCompleteModule = () => {
    if (!selectedCourse) return;
    setShowQuiz(false);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setCurrentQuizQuestion(0);
    
    // Attribution de points d'expérience (XP) pour gamifier la plateforme
    const earnedXp = 500 + (quizScore * 100);
    const newXp = xp + earnedXp;
    setXp(newXp);
    localStorage.setItem("onyx_course_xp", newXp.toString());
    
    setQuizScore(0);

    setProgress(prev => {
      const newProgress = { ...prev, [selectedCourse.id]: 100 };
      localStorage.setItem("onyx_course_progress", JSON.stringify(newProgress));
      return newProgress;
    });

    const currentIndex = DEFAULT_COURSES.findIndex(c => c.id === selectedCourse.id);
    if (currentIndex !== -1 && currentIndex < DEFAULT_COURSES.length - 1) {
      const nextCourse = DEFAULT_COURSES[currentIndex + 1];
      setSelectedCourse(nextCourse);
      setToastMessage(`Module complété ! Passage automatique à : ${nextCourse.title}`);
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      handleCourseCompletion();
    }
  };

  const handleCourseCompletion = async () => {
      setToastMessage("Félicitations, vous avez terminé la formation !");
      setShowCertificate(true);
      setShowConfetti(true);
      
      // Effet sonore ludique
      try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
          audio.volume = 0.5;
          audio.play().catch(()=>{});
      } catch(e) {}
      
      setTimeout(() => { setShowConfetti(false); setToastMessage(null); }, 8000);

      // 1. Envoi de l'email automatique avec le certificat PDF
      try {
          await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  to: user?.email,
                  subject: `🎓 Félicitations ${user?.full_name} ! Votre certificat Onyx Academy`,
                  text: `Bravo ! Vous avez terminé la formation avec succès. Connectez-vous à votre espace pour télécharger votre certificat officiel.`,
                  html: `<h2>Félicitations ${user?.full_name} !</h2><p>Vous venez de valider 100% de la formation Onyx Academy. Vous pouvez dès à présent télécharger votre certificat de réussite depuis votre espace personnel.</p>`
              })
          });
      } catch (err) { console.error("Erreur email", err); }

      // 2. Notification WhatsApp interactive
      if (user?.phone) {
          const waMsg = `Félicitations ${user?.full_name} ! 🎉\n\nVous venez de terminer brillamment la formation Onyx Academy. Votre certificat vous a été envoyé par email et est disponible dans votre espace.\n\nPrêt(e) à mettre en pratique vos nouvelles compétences ? 🚀`;
          window.open(`https://wa.me/${user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`, '_blank');
      }
  };

  useEffect(() => {
    const storedFormations = localStorage.getItem('onyx_formations');
    if (storedFormations) {
      const parsed = JSON.parse(storedFormations);
      if (parsed.length > 0 && parsed[0].modules) {
        const sortedModules = parsed[0].modules.sort((a: any, b: any) => a.order - b.order);
        setCoursesList(sortedModules);
        if (!selectedCourse) setSelectedCourse(sortedModules[0]);
      }
    } else {
      if (!selectedCourse) setSelectedCourse(DEFAULT_COURSES[0]);
    }
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
          setUser(JSON.parse(customSession));
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [router]);
  
  const logout = async () => {
    localStorage.removeItem('onyx_custom_session');
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    if(user) {
        setEditProfileForm({
            full_name: user.full_name || "",
            phone: user.phone || "",
            avatar_url: user.avatar_url || ""
          });
    }
    // Load local data
    const savedProgress = localStorage.getItem("onyx_course_progress");
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    
    const savedNotes = localStorage.getItem("onyx_course_notes");
    if (savedNotes) setCourseNotes(JSON.parse(savedNotes));

    const savedXp = localStorage.getItem("onyx_course_xp");
    if (savedXp) setXp(parseInt(savedXp));
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileModal(false);
        setShowQuiz(false);
        setIsLikaChatOpen(false);
        setShowCertificate(false);
        setShowLeaderboard(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('clients').select('id, full_name, avatar_url').limit(10);
    let mockData = (data || []).map((c, i) => ({...c, xp: 5000 - (i * 450) + Math.floor(Math.random() * 200)}));
    if (user) {
       mockData = mockData.filter((c: any) => c.id !== user.id);
       mockData.push({ id: user.id, full_name: user.full_name || 'Élève', avatar_url: user.avatar_url, xp: xp });
    }
    mockData.sort((a: any, b: any) => b.xp - a.xp);
    setLeaderboardData(mockData);
  };

  const openLeaderboard = () => {
    fetchLeaderboard();
    setShowLeaderboard(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const { error } = await supabase.from('clients').update({
        full_name: editProfileForm.full_name,
        phone: editProfileForm.phone,
        avatar_url: editProfileForm.avatar_url,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...editProfileForm };
      setUser(updatedUser);
      
      const customSession = localStorage.getItem('onyx_custom_session');
      if (customSession) {
          localStorage.setItem('onyx_custom_session', JSON.stringify(updatedUser));
      }

      setShowProfileModal(false);
      alert("Profil mis à jour avec succès !");
    } catch (err: any) {
      alert("Erreur lors de la mise à jour : " + (err.message || err));
    }
  };

  const toggleComplete = (courseId: string) => {
    const newProgress = { ...progress, [courseId]: progress[courseId] === 100 ? 0 : 100 };
    setProgress(newProgress);
    localStorage.setItem("onyx_course_progress", JSON.stringify(newProgress));
  };

  const saveNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedCourse) return;
    const newNotes = { ...courseNotes, [selectedCourse.id]: e.target.value };
    setCourseNotes(newNotes);
    localStorage.setItem("onyx_course_notes", JSON.stringify(newNotes));
  };

  const totalProgress = Math.round(coursesList.reduce((acc, c) => acc + (progress[c.id] || 0), 0) / coursesList.length);

  if (loading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#39FF14]" /></div>;
  }

  // --- VUE DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      {/* ANIMATION LUDIQUE DE CONFETTIS */}
      {showConfetti && (
        <div className="fixed inset-0 z-[500] pointer-events-none overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute top-[-10%] opacity-0 text-3xl md:text-5xl drop-shadow-lg"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `fall-${i % 2 === 0 ? 'left' : 'right'} ${2 + Math.random() * 3}s ease-in forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['🎓', '🎉', '🏆', '⭐'][i % 4]}
            </div>
          ))}
          <style dangerouslySetInnerHTML={{__html: `@keyframes fall-left { 0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg) translateX(-50px); opacity: 0; } } @keyframes fall-right { 0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(-360deg) translateX(50px); opacity: 0; } }`}} />
        </div>
      )}

      <header className="bg-zinc-950 border-b border-zinc-800 px-8 py-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/hub')} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors font-black uppercase text-xs tracking-widest bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
            <ArrowLeft size={16}/> Retour Hub
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic hidden md:block">ONYX<span className="text-[#39FF14]">FORMATION</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={openLeaderboard} className="hidden lg:flex items-center gap-2 bg-black border border-[#39FF14]/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:scale-105 transition-transform cursor-pointer">
             <Trophy className="text-yellow-400" size={16}/>
             <span className="font-black text-[#39FF14] text-xs">{xp} XP</span>
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-zinc-500">Progression</p>
            <div className="flex items-center gap-2">
               <div className="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-[#39FF14] transition-all shadow-[0_0_10px_#39FF14]" style={{ width: `${totalProgress}%` }}></div>
               </div>
               <p className="text-sm font-black text-[#39FF14]">{totalProgress}%</p>
            </div>
          </div>

      {/* MODALE LEADERBOARD */}
      {showLeaderboard && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowLeaderboard(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-950 p-8 rounded-[3rem] max-w-2xl w-full relative shadow-[0_0_50px_rgba(57,255,20,0.15)] border-t-[8px] border-yellow-400 animate-in zoom-in-95 my-auto max-h-[90vh] flex flex-col overflow-hidden">
            {/* EFFET D'ÉBLOUISSEMENT (FLASH SUCCESS) */}
            <div className="absolute inset-0 bg-yellow-400/30 mix-blend-overlay pointer-events-none animate-out fade-out zoom-out-110 duration-1000 z-50"></div>
            
            <button onClick={() => setShowLeaderboard(false)} className="absolute top-6 right-6 p-3 bg-zinc-900 rounded-full hover:bg-black hover:text-[#39FF14] transition-all text-zinc-400 z-[60]">
              <X size={20} />
            </button>
            <div className="text-center mb-8 shrink-0">
               <Trophy className="mx-auto mb-3 text-yellow-400" size={40} />
               <h3 className="text-3xl font-black uppercase text-white tracking-tighter">Leaderboard Elite</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Les meilleurs stratèges de l'Academy</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
               {/* PODIUM TOP 3 */}
               <div className="flex items-end justify-center gap-4 mb-10 pt-4">
                  {leaderboardData.length > 1 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="w-12 h-12 rounded-full border-2 border-zinc-400 overflow-hidden mb-2 relative">
                           <img src={leaderboardData[1].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[1].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-zinc-400 text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">2</div>
                        </div>
                        <div className="bg-zinc-800 w-20 h-24 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-zinc-400">
                           <span className="text-[10px] font-bold mt-1 text-zinc-300">{leaderboardData[1].xp} XP</span>
                        </div>
                        <p className="text-[10px] font-black uppercase mt-2 text-zinc-400 truncate max-w-[70px]">{leaderboardData[1].full_name.split(' ')[0]}</p>
                     </div>
                  )}
                  {leaderboardData.length > 0 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
                        <div className="w-16 h-16 rounded-full border-4 border-yellow-400 overflow-hidden mb-2 relative shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                           <img src={leaderboardData[0].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[0].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">1</div>
                        </div>
                        <div className="bg-gradient-to-t from-yellow-500/10 to-yellow-500/30 w-24 h-32 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-yellow-400">
                           <span className="text-xs font-black mt-1 text-yellow-500">{leaderboardData[0].xp} XP</span>
                        </div>
                        <p className="text-[11px] font-black uppercase mt-2 text-yellow-500 truncate max-w-[80px]">{leaderboardData[0].full_name.split(' ')[0]}</p>
                     </div>
                  )}
                  {leaderboardData.length > 2 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="w-12 h-12 rounded-full border-2 border-orange-500 overflow-hidden mb-2 relative">
                           <img src={leaderboardData[2].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[2].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">3</div>
                        </div>
                        <div className="bg-orange-900/30 w-20 h-20 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-orange-500">
                           <span className="text-[10px] font-bold mt-1 text-orange-400">{leaderboardData[2].xp} XP</span>
                        </div>
                        <p className="text-[10px] font-black uppercase mt-2 text-orange-500 truncate max-w-[70px]">{leaderboardData[2].full_name.split(' ')[0]}</p>
                     </div>
                  )}
               </div>

               {/* LISTE DES AUTRES */}
               <div className="space-y-2">
                  {leaderboardData.slice(3).map((student, idx) => (
                     <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border ${student.id === user?.id ? 'bg-[#39FF14]/10 border-[#39FF14]/30' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex items-center gap-3">
                           <span className="font-black text-zinc-600 w-4 text-xs">{idx + 4}</span>
                           <img src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.full_name}&background=random`} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-700 object-cover" />
                           <p className={`font-bold text-sm ${student.id === user?.id ? 'text-[#39FF14]' : 'text-white'}`}>{student.full_name} {student.id === user?.id ? '(Vous)' : ''}</p>
                        </div>
                        <span className="font-black text-zinc-300 text-xs">{student.xp} XP</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowProfileModal(true)}>
            <img src={user?.avatar_url || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover border-2 border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.3)] bg-zinc-800" alt="Profil" />
            <span className="font-black uppercase text-xs hidden md:block text-white">{user?.full_name}</span>
          </div>

          <button onClick={logout} className="p-3 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-500 hover:border-red-500/50 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className={`grid ${isFocusMode ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
          {/* COLONNE GAUCHE : LISTE DES MODULES */}
          {!isFocusMode && (
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4 pl-4">Programme de la formation</h3>
              {coursesList.map((c) => (
                <div key={c.id} onClick={() => setSelectedCourse(c)} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedCourse?.id === c.id ? "bg-black border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.15)] scale-[1.02]" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"}`}>
                  <div className="flex items-start justify-between">
                     <div>
                        <p className={`text-[10px] font-black uppercase mb-1 ${progress[c.id] === 100 ? "text-green-500" : "text-[#39FF14]"}`}>
                          {progress[c.id] === 100 ? "✓ Terminé" : `Module 0${c.order}`}
                        </p>
                        <h4 className="font-black text-sm uppercase leading-tight text-white">{c.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold mt-2 uppercase">{c.duration}</p>
                     </div>
                     {progress[c.id] === 100 && <CheckCircle className="text-green-500 flex-shrink-0" size={18}/>}
                  </div>
                </div>
              ))}
              
              <div className="mt-8">
                {totalProgress === 100 ? (
                  <div className="p-6 bg-zinc-900 border border-[#39FF14]/30 rounded-[2rem] text-center shadow-[0_0_20px_rgba(57,255,20,0.1)] relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowCertificate(true)}>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 blur-2xl rounded-full pointer-events-none"></div>
                     <Shield className="mx-auto mb-3 text-[#39FF14]" size={28}/>
                     <h4 className="text-sm font-black uppercase text-white mb-1">Certificat Obtenu</h4>
                     <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-4">Cliquez pour télécharger</p>
                     <button className="w-full py-3 bg-[#39FF14] text-black rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                        <Download size={14}/> Télécharger
                     </button>
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-[2rem] text-center opacity-50 cursor-not-allowed">
                     <Lock className="mx-auto mb-3 text-zinc-600" size={24}/>
                     <h4 className="text-xs font-black uppercase text-zinc-500 mb-1">Certificat Onyx Academy</h4>
                     <p className="text-[10px] font-bold text-zinc-600 mt-2">Complétez tous les modules pour déverrouiller</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COLONNE DROITE : LECTEUR VIDEO ET NOTES */}
          <div className={`${isFocusMode ? 'col-span-1' : 'lg:col-span-2'} flex flex-col gap-6`}>
            {selectedCourse && (
              <>
                <div className="bg-zinc-950 rounded-[3rem] border border-zinc-800 overflow-hidden shadow-sm animate-in fade-in">
                  <div className="aspect-video bg-black relative border-b border-zinc-800">
                    <div className="absolute top-4 right-4 z-10">
                       <button onClick={() => setIsFocusMode(!isFocusMode)} className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white hover:text-[#39FF14] transition-colors border border-zinc-800 hover:border-[#39FF14] shadow-lg">
                          {isFocusMode ? <Minimize size={14}/> : <Maximize size={14}/>} {isFocusMode ? 'Vue Classique' : 'Mode Focus'}
                       </button>
                    </div>
                    <iframe 
                      key={selectedCourse.id}
                      id="yt-player"
                      src={`${selectedCourse.video_url}${selectedCourse.video_url.includes('?') ? '&' : '?'}enablejsapi=1&rel=0`} 
                      className="absolute inset-0 w-full h-full" 
                      allowFullScreen 
                      title={selectedCourse.title} 
                    />
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-900 z-20">
                       <div className="h-full bg-[#39FF14] transition-all duration-1000 ease-linear shadow-[0_0_10px_#39FF14]" style={{ width: `${videoProgress}%` }}></div>
                    </div>
                  </div>
                  <div className="p-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{selectedCourse.title}</h2>
                    <p className="text-zinc-400 mt-4 leading-relaxed font-medium">{selectedCourse.description}</p>
                    
                    <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 border-t border-zinc-800 pt-8">
                      <button onClick={() => progress[selectedCourse.id] === 100 ? toggleComplete(selectedCourse.id) : setShowQuiz(true)} className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 ${progress[selectedCourse.id] === 100 ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30" : "bg-[#39FF14] text-black hover:bg-white hover:scale-105 shadow-[0_0_25px_#39FF14] border-2 border-[#39FF14] animate-pulse"}`}>
                        <CheckCircle size={16} /> 
                        {progress[selectedCourse.id] === 100 ? "Marqué comme terminé (Annuler)" : "Passer le Quizz pour valider"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUPPORT DE COURS PDF */}
                {selectedCourse.pdf_url && (
                  <div className="bg-zinc-950 rounded-[3rem] border border-zinc-800 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm mt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20"><FileText size={28}/></div>
                      <div>
                        <h3 className="font-black uppercase tracking-tighter text-lg text-white">Support de Cours</h3>
                        <p className="text-xs font-bold text-zinc-500 mt-1">Téléchargez le PDF pour suivre la leçon.</p>
                      </div>
                    </div>
                    <a href={selectedCourse.pdf_url} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#39FF14] hover:scale-105 transition-all shadow-lg">
                      <Download size={16} /> Télécharger
                    </a>
                  </div>
                )}

                {/* BLOC NOTES INTÉGRÉ */}
                <div className="bg-zinc-950 rounded-[3rem] border border-zinc-800 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="bg-[#39FF14]/10 text-[#39FF14] p-2 rounded-xl border border-[#39FF14]/20"><Edit3 size={18}/></div>
                     <h3 className="font-black uppercase tracking-tighter text-lg text-white">Mes Notes Personnelles</h3>
                  </div>
                  
                  <div className="relative">
                     <textarea 
                       value={courseNotes[selectedCourse.id] || ""} 
                       onChange={saveNote}
                       placeholder="Notez ici les idées clés, stratégies à appliquer, outils mentionnés..." 
                       className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 font-medium text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] transition-all resize-none placeholder:text-zinc-600"
                     />
                  </div>
                  <div className="mt-4 flex justify-end">
                     <button onClick={() => {
                         setToastMessage("Notes sauvegardées avec succès !");
                         setTimeout(() => setToastMessage(null), 3000);
                     }} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                        <Save size={16} /> Enregistrer mes notes
                     </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black border-t border-zinc-900 py-12 px-6 mt-20 text-center">
         <h2 className="font-black text-2xl tracking-tighter uppercase mb-2 text-white">ONYX<span className="text-[#39FF14]">OPS</span></h2>
         <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
            Onyx Hub - Academy<br/>
            © 2026 Onyx Ops Terminal v2.4
         </p>
      </footer>

      {/* MODALE QUIZ */}
      {showQuiz && selectedCourse && (
       <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-6 sm:p-10 max-w-2xl w-full shadow-[0_0_50px_rgba(57,255,20,0.15)] relative animate-in zoom-in-95 duration-200">
             <button onClick={() => setShowQuiz(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={20}/></button>

             {!quizFinished ? (
                <>
                  <div className="mb-8 text-center">
                     <div className="inline-flex items-center gap-2 bg-[#39FF14]/10 text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-[#39FF14]/20">
                        Question {currentQuizQuestion + 1} / 4
                     </div>
                     <h3 className="text-xl sm:text-2xl font-black text-white">{QUIZ_DATA[selectedCourse.id][currentQuizQuestion].question}</h3>
                  </div>

                  <div className="space-y-3 mb-8">
                     {QUIZ_DATA[selectedCourse.id][currentQuizQuestion].options.map((opt, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === QUIZ_DATA[selectedCourse.id][currentQuizQuestion].correctAnswer;
                        const isSubmitted = selectedAnswer !== null;

                        let btnClass = "bg-zinc-900 border-zinc-800 hover:border-[#39FF14] text-zinc-300 hover:text-white";
                        if (isSubmitted) {
                           if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                           else if (isSelected && !isCorrect) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                           else btnClass = "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50";
                        }

                        return (
                           <button 
                             key={index} 
                             disabled={isSubmitted}
                             onClick={() => {
                                setSelectedAnswer(index);
                                if (index === QUIZ_DATA[selectedCourse.id][currentQuizQuestion].correctAnswer) setQuizScore(prev => prev + 1);
                             }}
                             className={`w-full p-4 rounded-xl border-2 text-left font-bold text-sm transition-all ${btnClass}`}
                           >
                              {opt}
                           </button>
                        );
                     })}
                  </div>

                  {selectedAnswer !== null && (
                     <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className={`p-5 rounded-xl mb-6 text-sm font-medium ${selectedAnswer === QUIZ_DATA[selectedCourse.id][currentQuizQuestion].correctAnswer ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                           <span className="font-black uppercase tracking-widest text-[10px] block mb-2">
                              {selectedAnswer === QUIZ_DATA[selectedCourse.id][currentQuizQuestion].correctAnswer ? '✅ Bonne réponse' : '❌ Mauvaise réponse'}
                           </span>
                           {QUIZ_DATA[selectedCourse.id][currentQuizQuestion].explanation}
                        </div>
                        <button onClick={() => {
                              if (currentQuizQuestion < 3) { setCurrentQuizQuestion(prev => prev + 1); setSelectedAnswer(null); } 
                              else { setQuizFinished(true); }
                           }} 
                           className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                        >
                           {currentQuizQuestion < 3 ? 'Question suivante' : 'Voir les résultats'}
                        </button>
                     </div>
                  )}
                </>
             ) : (
                <div className="text-center animate-in zoom-in">
                   <div className="w-24 h-24 mx-auto bg-black border-4 border-[#39FF14] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(57,255,20,0.3)]">
                      <span className="text-4xl font-black text-[#39FF14]">{quizScore}/4</span>
                   </div>
                   <h3 className="text-3xl font-black uppercase text-white mb-2">
                      {quizScore === 4 ? 'Parfait !' : quizScore >= 3 ? 'Très bien !' : 'Module à revoir'}
                   </h3>
                   <p className="text-zinc-400 font-medium mb-8">
                      {quizScore >= 3 
                         ? "Vous avez validé les acquis de ce module avec brio. Vous pouvez passer à l'étape suivante." 
                         : "Il semblerait que certains concepts ne soient pas encore clairs. Nous vous conseillons de revoir la vidéo avant de valider le module."}
                   </p>
                   
                   <div className="flex gap-4">
                      {quizScore < 3 && (
                         <button onClick={() => { setShowQuiz(false); setQuizFinished(false); setCurrentQuizQuestion(0); setQuizScore(0); setSelectedAnswer(null); }} className="flex-1 bg-zinc-900 text-white py-4 rounded-xl font-black uppercase text-xs border border-zinc-800 hover:bg-zinc-800 transition-colors">
                            Revoir la vidéo
                         </button>
                      )}
                      <button onClick={handleCompleteModule} className="flex-1 bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-lg">
                         {quizScore >= 3 ? 'Valider et Continuer' : 'Forcer la validation'}
                      </button>
                   </div>
                </div>
             )}
          </div>
       </div>
      )}

      {/* FLOATING LIKA MASCOT */}
      {selectedCourse && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-right-8">
           <style dangerouslySetInnerHTML={{__html: `
              @keyframes float-lika {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-12px); }
                100% { transform: translateY(0px); }
              }
              .lika-float {
                animation: float-lika 3.5s ease-in-out infinite;
              }
           `}} />
           
           {isLikaChatOpen ? (
              <div className="bg-zinc-950 rounded-[2rem] shadow-2xl border-2 border-[#39FF14] p-0 mb-4 w-[340px] h-[450px] flex flex-col animate-in zoom-in duration-300 overflow-hidden pointer-events-auto">
                 <div className="bg-black p-4 flex justify-between items-center border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                       <div className="relative">
                          <img src="/lika-avatar.png" alt="Lika" onError={(e: any) => e.target.src = 'https://i.ibb.co/B5HhnTjw/La-mascotte-LIKA-202604121725.jpg'} className="w-10 h-10 rounded-full object-cover border border-[#39FF14]" />
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#39FF14] rounded-full border border-black animate-pulse"></div>
                       </div>
                       <div><p className="text-[#39FF14] font-black uppercase text-xs">Lika - Stratège</p></div>
                    </div>
                    <button onClick={() => setIsLikaChatOpen(false)} className="text-zinc-400 hover:text-white transition"><X size={18}/></button>
                 </div>
                 
                 <div className="flex-1 bg-zinc-900/50 p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
                    {likaMessages.map((msg, i) => (
                       <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                          <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-zinc-800 text-white border border-zinc-700 rounded-tl-none shadow-sm' : 'bg-[#39FF14] text-black rounded-tr-none shadow-md'}`}>
                             {msg.text}
                          </div>
                       </div>
                    ))}
                    <div ref={chatEndRef} />
                 </div>

                 <div className="p-3 bg-black border-t border-zinc-800 flex gap-2">
                    <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLikaSend()} placeholder="Poser une question..." className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 outline-none text-sm font-bold focus:border-[#39FF14] transition-colors" />
                    <button onClick={handleLikaSend} className="bg-[#39FF14] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
                 </div>
              </div>
           ) : (
              <div className="bg-white text-black p-4 rounded-2xl rounded-br-none shadow-2xl mb-4 max-w-xs relative border-2 border-[#39FF14] pointer-events-none">
                 <p className="text-xs font-black leading-relaxed">{getLikaMessage(selectedCourse.id)}</p>
                 <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-b-2 border-r-2 border-[#39FF14] transform rotate-45"></div>
              </div>
           )}
           
           {!isLikaChatOpen && (
             <button onClick={() => setIsLikaChatOpen(true)} className="lika-float relative group pointer-events-auto cursor-pointer focus:outline-none">
               <img src="/lika-avatar.png" alt="Lika" onError={(e: any) => e.target.src = 'https://i.ibb.co/B5HhnTjw/La-mascotte-LIKA-202604121725.jpg'} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#39FF14] shadow-[0_0_25px_rgba(57,255,20,0.5)] object-cover group-hover:scale-110 transition-transform" />
               <div className="absolute top-1 right-1 bg-red-500 w-5 h-5 rounded-full border-2 border-white animate-pulse shadow-md flex items-center justify-center">
                  <MessageSquare size={10} className="text-white" />
               </div>
             </button>
           )}
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] border border-[#39FF14]/30 px-6 py-3 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 z-[300] animate-in slide-in-from-bottom-5">
             <CheckCircle size={16}/> {toastMessage}
         </div>
      )}

      {/* MODALE CERTIFICAT IMPRIMABLE */}
      {showCertificate && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white p-12 border-[20px] border-zinc-100 shadow-2xl max-w-4xl w-full text-center relative print:m-0 print:border-0 print:shadow-none animate-in zoom-in" id="certificate-print">
            <button onClick={() => setShowCertificate(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-black print:hidden transition-colors bg-zinc-100 p-2 rounded-full"><X size={20}/></button>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-12 pointer-events-none"><Shield size={500}/></div>
            
            <h1 className="font-black text-4xl md:text-5xl uppercase tracking-[0.2em] mb-4 text-zinc-900 mt-8">Certificat de Réussite</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-16">Onyx Hub - Academy</p>
            
            <p className="text-zinc-500 italic mb-4 text-lg">Ce document officiel atteste que</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-black mb-10 underline decoration-[#39FF14] underline-offset-8">
              {user?.full_name}
            </h2>
            
            <p className="text-zinc-600 max-w-xl mx-auto leading-relaxed mb-16 text-lg font-medium">
              A validé avec succès l'ensemble des modules d'apprentissage intensif de la formation 
              <span className="font-black text-black"> MARKETING DIGITAL & ADS EXPERT</span>.
            </p>
            
            <div className="flex justify-between items-end mt-20 text-left border-t-2 border-zinc-100 pt-10">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Délivré le</p>
                <p className="font-black text-sm text-zinc-800">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Signature Officielle</p>
                <div className="font-serif italic text-3xl text-zinc-900 pr-4">Onyx Academy</div>
                <div className="w-48 h-0.5 bg-black mt-2"></div>
              </div>
            </div>
            
            <button onClick={() => window.print()} className="mt-16 bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs print:hidden hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg">
               <Download size={16}/> Imprimer / PDF
            </button>
          </div>
        </div>
      )}

      {/* MODALE DE PROFIL */}
      {showProfileModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowProfileModal(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 p-8 sm:p-12 rounded-[3.5rem] max-w-md w-full relative shadow-[0_0_50px_rgba(57,255,20,0.1)] border-t-[12px] border-[#39FF14] animate-in zoom-in-95 duration-200 my-auto">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-900 rounded-full hover:bg-black hover:text-[#39FF14] transition-all text-zinc-400">
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
               <div className="w-24 h-24 mx-auto mb-4 relative">
                  <img src={editProfileForm.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)] bg-zinc-800" />
               </div>
               <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Mon Profil</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Espace Onyx Academy</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Nom Complet</label>
                <input type="text" required value={editProfileForm.full_name} onChange={e => setEditProfileForm({...editProfileForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] font-bold text-sm text-white uppercase outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Numéro WhatsApp</label>
                <input type="tel" required value={editProfileForm.phone} onChange={e => setEditProfileForm({...editProfileForm, phone: e.target.value})} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] font-bold text-sm text-white outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Photo de profil (URL)</label>
                <input type="url" value={editProfileForm.avatar_url} onChange={e => setEditProfileForm({...editProfileForm, avatar_url: e.target.value})} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] font-bold text-sm text-white outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] transition-all placeholder:text-zinc-600" placeholder="https://..." />
              </div>

              <button type="submit" className="w-full mt-6 bg-[#39FF14] text-black py-5 rounded-[2rem] font-black uppercase text-xs hover:bg-white transition-all shadow-[0_10px_30px_rgba(57,255,20,0.3)] flex justify-center items-center gap-2">
                <Save size={18} /> Sauvegarder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
