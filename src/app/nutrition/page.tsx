"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ChevronLeft, Download, Lock, CheckCircle, Sun, Moon,
  Activity, Calendar, Clock, ArrowRight, Sparkles, HeartPulse, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, X, BarChart, Settings, Save, Award, MessageCircle, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, Image as ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, Share2, AlertTriangle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import jsPDF from "jspdf";

const spaceGrotesk = { className: "font-sans" };

const SHOP_DATA = [
  {
    "categorie_nom": "Super-Aliments & Céréales Locales",
    "slug": "super-aliments",
    "produits": [
      { "id": "prod_001", "nom": "Fonio Premium Pré-lavé (500g)", "description_courte": "Le miracle sans gluten à IG bas, prêt à cuire en 5 minutes.", "description_longue": "Issu de coopératives locales, notre Fonio est soigneusement lavé et débarrassé de tout résidu sableux. L'alternative parfaite au riz blanc pour vos déjeuners.", "prix_standard": 2500, "prix_premium": 2100, "stock": 100, "rating": 4.8, "image_url": "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781199255/A_premium_studio_shot_of_202606111733_kaohlz.jpg", "badge": "Best Seller", "goal": "cooking" },
      { "id": "prod_002", "nom": "Poudre de Moringa Bio (150g)", "description_courte": "La multivitamine naturelle d'Afrique pour booster votre métabolisme.", "description_longue": "Riche en fer, calcium et vitamines. Saupoudrez 1 cuillère par jour sur vos plats en fin de cuisson pour une énergie décuplée.", "prix_standard": 3500, "prix_premium": 2900, "stock": 50, "rating": 4.9, "image_url": "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563486/A_high-end_modern_cosmetic_promotional_202604301537_qqhvht.jpg", "badge": "Santé", "goal": "energy" },
      { "id": "prod_005", "nom": "Soumbala / Nététou Pur (100g)", "description_courte": "L'exhausteur de goût santé qui protège votre cœur.", "description_longue": "Le remplaçant idéal de vos bouillons cubes industriels. Donne une saveur profonde à vos plats tout en régulant la tension.", "prix_standard": 1500, "prix_premium": 1200, "stock": 120, "rating": 4.5, "image_url": "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563481/A_vibrant_and_appetizing_food_202604301533_dmp5uw.jpg", "badge": "Cuisine Saine", "goal": "cooking" }
    ]
  },
  {
    "categorie_nom": "Infusions & Détox (Zéro Sucre)",
    "slug": "infusions-detox",
    "produits": [
      { "id": "prod_006", "nom": "Bissap Rouge Séché (250g)", "description_courte": "Le diurétique naturel par excellence. Grandes fleurs de qualité.", "description_longue": "Infusez à froid ou à chaud sans sucre. Aide à combattre la rétention d'eau et à dégonfler le ventre rapidement.", "prix_standard": 2000, "prix_premium": 1600, "stock": 200, "rating": 4.9, "image_url": "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563472/A_high-end_modern_promotional_poster_202604301536_c7cpzr.jpg", "badge": "Détox", "goal": "detox" },
      { "id": "prod_009", "nom": "Thé Vert Ataya Spécial (200g)", "description_courte": "Les feuilles pures pour un Ataya brûle-graisse.", "description_longue": "Remplacez le thé bas de gamme. Un thé vert riche en antioxydants (EGCG) conçu pour être bu sans sucre.", "prix_standard": 3500, "prix_premium": 2900, "stock": 90, "rating": 4.6, "image_url": "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563485/A_futuristic_and_modern_graphic_202604301528_kon2vz.jpg", "badge": "Ventre Plat", "goal": "detox" }
    ]
  },
  {
    "categorie_nom": "Snacks & Oléagineux",
    "slug": "snacks",
    "produits": [
      { "id": "prod_011", "nom": "Pâte d'Arachide Pure (300g)", "description_courte": "100% arachide torréfiée. Zéro huile ajoutée, zéro sucre.", "description_longue": "Le goût de l'enfance, version saine. Idéale pour vos mafés diététiques ou sur vos pancakes d'avoine.", "prix_standard": 3000, "prix_premium": 2500, "stock": 70, "rating": 4.9, "image_url": "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563481/A_vibrant_and_appetizing_food_202604301533_dmp5uw.jpg", "badge": "Best Seller", "goal": "snacks" },
      { "id": "prod_012", "nom": "Noix de Cajou Grillées (250g)", "description_courte": "Le snack parfait pour calmer le stress du bureau.", "description_longue": "Riches en magnésium. Croquez-en une petite poignée à 16h pour éviter le piège des biscuits industriels.", "prix_standard": 5000, "prix_premium": 4200, "stock": 80, "rating": 4.8, "image_url": "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563489/A_luxurious_corporate_promotional_poster._202604301529_docu21.jpg", "badge": "Énergie", "goal": "snacks" }
    ]
  },
  {
    "categorie_nom": "Équipements",
    "slug": "equipements",
    "produits": [
      { "id": "prod_016", "nom": "Gourde Motivante 'Jongoma'", "description_courte": "Atteignez votre quota d'eau avec style (1.5L).", "description_longue": "Marqueurs de temps imprimés pour vous rappeler de boire de l'eau fraîche toute la journée. Design Vert Néon.", "prix_standard": 7000, "prix_premium": 5500, "stock": 150, "rating": 4.9, "image_url": "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563498/A_moody__high-end_luxury_promotional_202604301516_zoftg0.jpg", "badge": "Best Seller", "goal": "cooking" }
    ]
  }
];

const SHOP_GOALS = [
  { id: "detox", label: "Ventre Plat & Détox", icon: "✨" },
  { id: "energy", label: "Énergie & Anti-Fatigue", icon: "🔥" },
  { id: "cooking", label: "Cuisine Saine", icon: "🍳" },
  { id: "snacks", label: "Snacks Coupe-Faim", icon: "🥨" },
  { id: "saved", label: "Sauvegardés", icon: "❤️" }
];

const ALL_MENUS = [
  {
    week: 1,
    title: "Semaine 1 : Détox & Découverte",
    desc: "Commencez en douceur avec nos alternatives locales (Fonio, Mil) et nos astuces pour alléger vos plats.",
    meals: ["Lundi : Fonio au poulet (500 kcal)", "Mardi : Salade de Niébé (450 kcal)", "Mercredi : Thieboudienne revisité (600 kcal)"]
  },
  {
    week: 2,
    title: "Semaine 2 : L'Équilibre Africain",
    desc: "Votre corps s'habitue. On introduit des portions contrôlées pour vos plats familiaux.",
    meals: ["Lundi : Mafé allégé (550 kcal)", "Mardi : Poisson grillé et légumes locaux", "Mercredi : Couscous de mil (Thiéré)"]
  },
  {
    week: 3,
    title: "Semaine 3 : Accélération",
    desc: "La perte de poids s'accélère. Des menus spécifiques pour brûler les graisses résistantes.",
    meals: []
  },
  {
    week: 4,
    title: "Semaine 4 : Consolidation",
    desc: "Maintenez vos résultats sans effet yoyo et apprenez à stabiliser votre poids.",
    meals: []
  }
];

const DAILY_MENU = {
   autopilot: [
      { type: 'Petit-déjeuner', time: '08:00', meal: 'Bouillie de Mil (Lakh) allégée', cals: 300, proteins: 8, carbs: 50, fats: 5, recipe: "Faire bouillir 50g de mil avec de l'eau. Ajouter un filet de lait demi-écrémé et de la noix de muscade." },
      { type: 'Déjeuner', time: '13:30', meal: 'Thieboudienne Diététique', cals: 600, proteins: 35, carbs: 70, fats: 15, recipe: "Utiliser 1/4 d'assiette de riz brisé (ou de fonio). Beaucoup de légumes (chou, carotte). Morceau de poisson de 150g. Limiter l'huile à 1 cuillère à soupe par personne." },
      { type: 'Collation', time: '16:00', meal: 'Poignée d\'arachides', cals: 150, proteins: 5, carbs: 10, fats: 12, recipe: "Une petite poignée de cacahuètes grillées sans sel (environ 20g)." },
      { type: 'Dîner', time: '19:30', meal: 'Salade de Niébé', cals: 400, proteins: 20, carbs: 45, fats: 10, recipe: "Mélanger 100g de niébé cuit avec des tomates, concombres, oignons. Vinaigrette : 1 càc d'huile d'olive, citron, sel, poivre." },
   ],
   compass: [
      { type: 'Règle d\'Or', time: 'Toute la journée', meal: 'Limitez les féculents (Riz, Fonio, Mil) à 1/4 de votre assiette max.' },
      { type: 'Protéines', time: 'Repas principaux', meal: 'Assurez-vous d\'avoir une belle portion de poisson, poulet ou viande maigre.' },
      { type: 'Légumes', time: 'Repas principaux', meal: 'Remplissez la moitié de votre assiette avec des légumes locaux (carottes, choux, aubergines).' },
   ]
};

// ÉTAPE 3 : Base de données JSON (Aliments Locaux & Flags IA)
const FOOD_DATABASE = [
  {
    id: "food_001", nom: "Fonio entier (sec)", categorie: "Céréales & Féculents",
    portion_standard_nom: "1 Bol (cuit)", portion_standard_grammes: 150,
    valeurs_pour_100g: { calories: 345, glucides: 75, lipides: 1.2, proteines: 7, fibres: 3.8, sodium_mg: 5 },
    flags_ia: { is_local_senegal: true, ig_bas: true, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Excellent choix ! Le fonio ne fera pas exploser ton insuline."
  },
  {
    id: "food_002", nom: "Riz brisé local (Non étuvé)", categorie: "Céréales & Féculents",
    portion_standard_nom: "1 Louche", portion_standard_grammes: 80,
    valeurs_pour_100g: { calories: 350, glucides: 78, lipides: 0.6, proteines: 7, fibres: 1, sodium_mg: 2 },
    flags_ia: { is_local_senegal: true, ig_bas: false, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Le riz brisé est digéré très vite. Assure-toi d'avoir beaucoup de légumes (fibres) dans ton assiette pour compenser."
  },
  {
    id: "food_003", nom: "Cube de bouillon (Type Maggi/Jumbo)", categorie: "Condiments & Sauces",
    portion_standard_nom: "1/2 Cube", portion_standard_grammes: 5,
    valeurs_pour_100g: { calories: 170, glucides: 15, lipides: 5, proteines: 10, fibres: 0, sodium_mg: 52000 },
    flags_ia: { is_local_senegal: false, ig_bas: null, high_sodium: true, ultra_transforme: true },
    message_coach_ia: "Alerte ! Ces cubes favorisent la rétention d'eau et gonflent le ventre. Essaie les épices pures ou le Soumbala (Nététou)."
  },
  {
    id: "food_004", nom: "Thiof (Mérou blanc frais)", categorie: "Protéines",
    portion_standard_nom: "1 Tranche moyenne", portion_standard_grammes: 120,
    valeurs_pour_100g: { calories: 92, glucides: 0, lipides: 1, proteines: 20.5, fibres: 0, sodium_mg: 60 },
    flags_ia: { is_local_senegal: true, ig_bas: true, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Une protéine parfaite et ultra-maigre. Idéal pour construire du muscle sans stocker de gras."
  },
  {
    id: "food_005", nom: "Soumbala / Nététou", categorie: "Condiments & Sauces",
    portion_standard_nom: "1 Cuillère à café", portion_standard_grammes: 5,
    valeurs_pour_100g: { calories: 300, glucides: 16, lipides: 18, proteines: 35, fibres: 5, sodium_mg: 150 },
    flags_ia: { is_local_senegal: true, ig_bas: true, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Le secret de nos grands-mères ! Un exhausteur de goût naturel qui protège ton cœur."
  },
  {
    id: "food_006", nom: "Fleurs de Bissap Rouge (Infusion sans sucre)", categorie: "Boissons",
    portion_standard_nom: "1 Grand Verre", portion_standard_grammes: 250,
    valeurs_pour_100g: { calories: 0, glucides: 0, lipides: 0, proteines: 0, fibres: 0, sodium_mg: 2 },
    flags_ia: { is_local_senegal: true, ig_bas: true, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Excellent diurétique naturel. Parfait pour dégonfler, à condition de ne pas y ajouter de sucre blanc !"
  }
];

// ÉTAPE 4 : Base de Données des Recettes pour le Générateur
const RECIPES_DB = [
  { id: "r1", type: "Petit-déjeuner", nom: "Lakh allégé", calories: 300, is_bol_commun: false, ingredients: [{nom: "Mil", quantite: 50, unite: "g", rayon: "Marché local"}, {nom: "Lait demi-écrémé", quantite: 50, unite: "ml", rayon: "Supermarché"}, {nom: "Noix de muscade", quantite: 1, unite: "pincée", rayon: "Supermarché"}] },
  { id: "r2", type: "Petit-déjeuner", nom: "Flocons d'avoine & Banane", calories: 320, is_bol_commun: false, ingredients: [{nom: "Flocons d'avoine", quantite: 40, unite: "g", rayon: "Supermarché"}, {nom: "Banane", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "r3", type: "Déjeuner", nom: "Thieboudienne (Option Fonio)", calories: 600, is_bol_commun: true, ingredients: [{nom: "Thiof (Poisson)", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 80, unite: "g", rayon: "Marché local"}, {nom: "Chou", quantite: 0.5, unite: "pièce", rayon: "Marché local"}, {nom: "Huile de colza", quantite: 1, unite: "càs", rayon: "Supermarché"}, {nom: "Carotte", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "r4", type: "Déjeuner", nom: "Mafé allégé au Poulet", calories: 550, is_bol_commun: true, ingredients: [{nom: "Blanc de Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Pâte d'arachide", quantite: 30, unite: "g", rayon: "Supermarché"}, {nom: "Riz brisé", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Oignon", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "r5", type: "Déjeuner", nom: "Salade de Fonio au Poulet", calories: 450, is_bol_commun: false, ingredients: [{nom: "Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Tomate", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Moutarde", quantite: 1, unite: "càc", rayon: "Supermarché"}] },
  { id: "r6", type: "Dîner", nom: "Salade de Niébé fraîcheur", calories: 400, is_bol_commun: false, ingredients: [{nom: "Niébé (Haricots)", quantite: 100, unite: "g", rayon: "Marché local"}, {nom: "Concombre", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Vinaigre", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { id: "r7", type: "Dîner", nom: "Soupe de légumes locaux", calories: 300, is_bol_commun: false, ingredients: [{nom: "Carotte", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Navet", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Poireau", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "r8", type: "Collation", nom: "Poignée d'Arachides", calories: 150, is_bol_commun: false, ingredients: [{nom: "Arachides grillées", quantite: 30, unite: "g", rayon: "Marché local"}] },
  { id: "r9", type: "Collation", nom: "Fruit de saison", calories: 100, is_bol_commun: false, ingredients: [{nom: "Fruit au choix (Mangue, etc)", quantite: 1, unite: "pièce", rayon: "Marché local"}] }
];

const CircularProgress = ({ value, max, colorClass, label, icon: Icon, unit }: any) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
     <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-2">
           <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} className="stroke-zinc-200" strokeWidth="8" fill="transparent" />
              <motion.circle 
                 cx="50" cy="50" r={radius} 
                 className={colorClass} strokeWidth="8" fill="transparent" 
                 strokeDasharray={circumference} 
                 initial={{ strokeDashoffset: circumference }}
                 animate={{ strokeDashoffset: offset }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 strokeLinecap="round"
              />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center text-black">
              <Icon size={16} className={`mb-1`} />
              <span className="text-sm font-black">{value}</span>
           </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">{label}<br/><span className="text-xs font-bold normal-case text-black">/ {max} {unit}</span></p>
     </div>
  );
};

export default function NutritionDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  
  // Nouveaux états de l'application Nutrition
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'history' | 'profile' | 'weight' | 'community' | 'favorites' | 'coaching'>('today');
  const [trackingMode, setTrackingMode] = useState<'guided' | 'flexible'>('guided');
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [showRedoDiagModal, setShowRedoDiagModal] = useState(false);
  const [redoReason, setRedoReason] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  
  // Jauges quotidiennes
  const [calories, setCalories] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  
  // Bilan
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportData, setReportData] = useState({ followedMenu: false, cravedRice: false, drankWater: false });
  const [consumedMeals, setConsumedMeals] = useState<any[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [moodNotes, setMoodNotes] = useState<string>('');
  const [selectedMealModal, setSelectedMealModal] = useState<any>(null);
  
  // Moteur de recherche et portions
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedFoodDB, setSelectedFoodDB] = useState<any>(null);
  const [foodQuantity, setFoodQuantity] = useState(1);

  // Coach IA "Rokhy"
  const [rokhyMessage, setRokhyMessage] = useState<{title: string, text: string, type: 'warning'|'success'|'info'} | null>(null);

  // --- NOTIFICATIONS PUSH PWA ---
  const sendWaterReminderPush = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && navigator.serviceWorker) {
       Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
             navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("💧 C'est l'heure de s'hydrater !", {
                   body: "N'oublie pas de boire ton verre d'eau pour atteindre ton objectif aujourd'hui. Ton métabolisme te dira merci !",
                   icon: "https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png",
                   badge: "https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png",
                   vibrate: [200, 100, 200]
                });
             });
          }
       });
    }
  };

  // Gamification & Feed Communautaire
  const [jongomaXP, setJongomaXP] = useState(0);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [currentWeightInput, setCurrentWeightInput] = useState<number>(75);
  const [newPostText, setNewPostText] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<any[]>([]);
  const [favoriteSearchQuery, setFavoriteSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pdfHistory, setPdfHistory] = useState<any[]>([]);
  const [isSharingPDF, setIsSharingPDF] = useState(false);

  // Objectifs
  const [calorieGoal, setCalorieGoal] = useState(1500);
  const [proteinGoal, setProteinGoal] = useState(80);
  const [carbsGoal, setCarbsGoal] = useState(150);
  const [fatsGoal, setFatsGoal] = useState(50);
  
  // Smart Planner (Générateur)
  const [weeklyGeneratedMenu, setWeeklyGeneratedMenu] = useState<any[]>([]);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);

  const [profileForm, setProfileForm] = useState({ full_name: "", avatar_url: "", password: "" });
  const [showReminder, setShowReminder] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Boutique states
  const [selectedShopGoal, setSelectedShopGoal] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [shopCart, setShopCart] = useState<any[]>([]);
  const [savedShopProducts, setSavedShopProducts] = useState<any[]>([]);
  const [shopDataDB, setShopDataDB] = useState<any[]>([]);
  const [shopPromoCode, setShopPromoCode] = useState("");
  const [isShopPromoApplied, setIsShopPromoApplied] = useState(false);
  const [shopPromoCodesDB, setShopPromoCodesDB] = useState<any[]>([]);
  const [appliedPromoData, setAppliedPromoData] = useState<any>(null);
  const [showCartModal, setShowCartModal] = useState(false);

  // Shop dynamic additions
  const [shopBannerUrl, setShopBannerUrl] = useState("https://placehold.co/1200x300/111/39FF14?text=OFFRES+EXCLUSIVES");
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  const [shopMinPrice, setShopMinPrice] = useState<number | "">("");
  const [shopMaxPrice, setShopMaxPrice] = useState<number | "">("");

  const [emblaShopRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]);

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let finalUser = session?.user;

      if (!finalUser) {
        // Fallback pour localStorage si pas de session Supabase active
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
          finalUser = JSON.parse(customSession);
        } else {
          router.push('/login');
          return;
        }
      }

      setUser({ ...finalUser, full_name: finalUser.user_metadata?.full_name || finalUser.full_name || "Membre" });
      setProfileForm({
         full_name: finalUser.user_metadata?.full_name || finalUser.full_name || "",
         avatar_url: finalUser.user_metadata?.avatar_url || finalUser.avatar_url || "",
         password: ""
      });

      // Récupérer le profil client complet depuis la table 'clients'
      const phoneMatch = finalUser.email?.match(/^(\+?\d+)@clients\.onyxcrm\.com$/);
      const userPhone = phoneMatch ? phoneMatch[1] : finalUser.phone;

      if (userPhone) {
        const welcome = localStorage.getItem(`onyx_nutrition_welcome_${userPhone}`);
        if (welcome) setWelcomeMessage(welcome);

        const { data: profileData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', userPhone)
          .single();

        if (profileData) {
          setClientProfile(profileData);
          const trialEnds = profileData.trial_ends_at ? new Date(profileData.trial_ends_at).getTime() : (new Date(profileData.created_at || new Date()).getTime() + 14 * 24 * 60 * 60 * 1000);
          const now = new Date().getTime();
          
          if (window.innerWidth < 1024) setIsSidebarOpen(false);

          let diffDays = 0;
          if (!isNaN(trialEnds)) {
              diffDays = Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)));
          }
          
          if (profileData.plan_type === 'premium') {
             diffDays = 999;
          }
          setDaysLeft(diffDays);

          // Récupération de l'historique des logs journaliers
          const { data: logsData } = await supabase
            .from('nutrition_daily_logs')
            .select('*')
            .eq('client_id', profileData.id)
            .order('log_date', { ascending: true });

          if (logsData) {
            setDailyLogs(logsData);
            
            const todayStr = new Date().toISOString().split('T')[0];
            const todayLog = logsData.find(log => log.log_date === todayStr);
            if (todayLog) {
              setCalories(todayLog.calories_consumed || 0);
              setWaterGlasses(todayLog.water_glasses || 0);
              setProteins(todayLog.proteins_consumed || 0);
              setCarbs(todayLog.carbs_consumed || 0);
              setFats(todayLog.fats_consumed || 0);
              if (todayLog.report_data) setReportData(todayLog.report_data);
              if (todayLog.report_data?.consumedMeals && Array.isArray(todayLog.report_data.consumedMeals)) {
                  setConsumedMeals(todayLog.report_data.consumedMeals);
              }
              if (todayLog.report_data?.moods && Array.isArray(todayLog.report_data.moods)) {
                  setMoods(todayLog.report_data.moods);
              }
              if (todayLog.report_data?.moodNotes) setMoodNotes(todayLog.report_data.moodNotes);
            }
          }

          // Récupérer le profil nutritionnel (via Supabase ou localStorage)
          const { data: nutritionData } = await supabase
            .from('nutrition_profiles')
            .select('*')
            .eq('client_id', profileData.id)
            .maybeSingle();

          if (nutritionData) {
             setCalorieGoal(nutritionData.daily_calorie_goal || 1500);
             setProteinGoal(nutritionData.protein_goal || 80);
             setCarbsGoal(nutritionData.carbs_goal || 150);
             setFatsGoal(nutritionData.fats_goal || 50);
             setJongomaXP(nutritionData.jongoma_xp || 0);
             if (nutritionData.weekly_menu && Array.isArray(nutritionData.weekly_menu) && nutritionData.weekly_menu.length > 0) {
                 setWeeklyGeneratedMenu(nutritionData.weekly_menu);
             }
          }
          
          // Récupérer le poids
          const { data: wLogs } = await supabase.from('nutrition_weight_logs').select('*').eq('client_id', profileData.id).order('log_date', { ascending: true });
          if (wLogs) {
              setWeightLogs(wLogs);
              if (wLogs.length > 0) setCurrentWeightInput(wLogs[wLogs.length - 1].weight);
          } else {
             const localGoals = localStorage.getItem('onyx_nutrition_goals');
             if (localGoals) {
                try {
                   const parsed = JSON.parse(localGoals);
                   if (parsed && parsed.calories) setCalorieGoal(Math.round(parsed.calories));
                   if (parsed && parsed.protein) setProteinGoal(Math.round(parsed.protein));
                   if (parsed && parsed.carbs) setCarbsGoal(Math.round(parsed.carbs));
                   if (parsed && parsed.fats) setFatsGoal(Math.round(parsed.fats));
                } catch (e) {}
             }
          }

          const savedFavs = localStorage.getItem(`onyx_nutrition_favs_${profileData.id}`);
          if (savedFavs) {
             try { 
                const parsed = JSON.parse(savedFavs);
                if (Array.isArray(parsed)) setFavoriteMeals(parsed);
             } catch(e) {}
          }
          
          const savedPdfs = localStorage.getItem(`onyx_nutrition_pdfs_${profileData.id}`);
          if (savedPdfs) {
             try { 
                const parsed = JSON.parse(savedPdfs);
                if (Array.isArray(parsed)) setPdfHistory(parsed);
             } catch(e) {}
          }

          const savedShop = localStorage.getItem(`onyx_nutrition_saved_products_${profileData.id}`);
          if (savedShop) {
             try { 
                const parsed = JSON.parse(savedShop);
                if (Array.isArray(parsed)) setSavedShopProducts(parsed);
             } catch(e) {}
          }

          const savedExcluded = localStorage.getItem(`onyx_nutrition_excluded_ings_${profileData.id}`);
          if (savedExcluded) {
             try { 
                const parsed = JSON.parse(savedExcluded);
                if (Array.isArray(parsed)) setExcludedIngredients(parsed);
             } catch(e) {}
          }

          // Fetch DB Products
          const { data: dbProds } = await supabase.from('nutrition_products').select('*');
          if (dbProds && dbProds.length > 0) {
             const grouped = dbProds.reduce((acc: any, p: any) => {
                if (!acc[p.categorie_nom]) acc[p.categorie_nom] = { categorie_nom: p.categorie_nom, slug: p.slug || 'cat', produits: [] };
                acc[p.categorie_nom].produits.push(p);
                return acc;
             }, {});
             setShopDataDB(Object.values(grouped));
          }

          // Fetch Promo Codes
          const { data: dbPromos } = await supabase.from('nutrition_promo_codes').select('*').eq('active', true);
          if (dbPromos) setShopPromoCodesDB(dbPromos);
          
          // Fetch Community Posts
          const { data: cPosts } = await supabase.from('nutrition_community_posts').select('*, clients(full_name)').order('created_at', { ascending: false });
          if (cPosts) {
              setCommunityPosts(cPosts.map((p: any) => ({
                 ...p,
                 client: p.clients?.full_name || 'Membre'
              })));
          }

          // Load banner from settings specific to the coach
          if (profileData.tenant_id) {
              supabase.from('crm_settings').select('shop_banner_url').eq('tenant_id', profileData.tenant_id).maybeSingle()
                  .then(async ({data}) => { 
                      if (data?.shop_banner_url) setShopBannerUrl(data.shop_banner_url); 
                      else { const { data: fallback } = await supabase.from('crm_settings').select('shop_banner_url').neq('shop_banner_url', null).order('created_at', { ascending: false }).limit(1).maybeSingle(); if (fallback?.shop_banner_url) setShopBannerUrl(fallback.shop_banner_url); }
                  });
          } else {
              supabase.from('crm_settings').select('shop_banner_url').neq('shop_banner_url', null).order('created_at', { ascending: false }).limit(1).maybeSingle()
                  .then(({data}) => { if (data?.shop_banner_url) setShopBannerUrl(data.shop_banner_url); });
          }
        }
      }

      setLoading(false);
    };

    verifyAuth();

    // Afficher un message de bienvenue après le diagnostic
    if (searchParams.get('from') === 'diagnostic') {
      alert("Félicitations et bienvenue ! Votre espace personnel est prêt.");
      // Nettoyer l'URL
      router.replace('/nutrition', undefined);
    }

  }, [router, searchParams]);

  // S'assurer que le menu est généré si l'utilisateur vient d'arriver
  useEffect(() => {
      if (clientProfile && weeklyGeneratedMenu.length === 0) {
          generateWeeklyMenu();
      }
  }, [clientProfile, weeklyGeneratedMenu.length]);

  const updateXP = async (amount: number, reason: string) => {
      const newXP = jongomaXP + amount;
      setJongomaXP(newXP);
      if (clientProfile) {
         await supabase.from('nutrition_profiles').update({ jongoma_xp: newXP }).eq('client_id', clientProfile.id);
      }
      alert(`+${amount} XP ! (${reason})`);
  };

  const getJongomaLevel = (xp: number) => {
      if (xp >= 2000) return { name: "Star Nutrition", badge: "🌟", desc: "Code promo boutique débloqué !" };
      if (xp >= 500) return { name: "Adhérente", badge: "💎", desc: "Badge de profil débloqué" };
      return { name: "Novice", badge: "🌱", desc: "En apprentissage" };
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('nutrition_profiles')
      .select('jongoma_xp, client:clients(id, full_name, avatar_url)')
      .order('jongoma_xp', { ascending: false, nullsFirst: false })
      .limit(10);
      
    if (data && data.length > 0) {
        const formattedData = data.map(d => ({
            id: (d.client as any)?.id,
            full_name: (d.client as any)?.full_name || 'Membre',
            avatar_url: (d.client as any)?.avatar_url,
            xp: d.jongoma_xp || 0
        })).filter(d => d.id);
        
        if (clientProfile && !formattedData.some(d => d.id === clientProfile.id)) {
           formattedData.push({
               id: clientProfile.id,
               full_name: user?.full_name || 'Moi',
               avatar_url: user?.avatar_url,
               xp: jongomaXP
           });
           formattedData.sort((a: any, b: any) => b.xp - a.xp);
        }
        setLeaderboardData(formattedData);
    } else {
        const mockData = [
            { id: "1", full_name: "Fatou Diop", xp: 2450 },
            { id: "2", full_name: "Aïcha Sy", xp: 1800 },
            { id: "3", full_name: "Ndeye Ndiaye", xp: 1200 },
        ];
        if (user) mockData.push({ id: user.id || "4", full_name: user.full_name || "Moi", xp: jongomaXP });
        mockData.sort((a, b) => b.xp - a.xp);
        setLeaderboardData(mockData);
    }
  };

  const openLeaderboard = () => {
    fetchLeaderboard();
    setShowLeaderboard(true);
  };

  // Système de relance automatique (Notification à 20h00)
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hasLoggedToday = dailyLogs.some(log => log.log_date === todayStr && log.report_data);
      
      if (now.getHours() >= 20 && !hasLoggedToday) {
        setShowReminder(true);
      } else {
        setShowReminder(false);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000); // Vérification chaque minute
    return () => clearInterval(interval);
  }, [dailyLogs]);

  // Hook de relance d'hydratation
  useEffect(() => {
     const waterInterval = setInterval(() => {
        if (waterGlasses >= 0 && waterGlasses < 8) {
           sendWaterReminderPush();
        }
     }, 2 * 60 * 60 * 1000); // Déclenche toutes les 2 heures si la jauge n'est pas remplie
     return () => clearInterval(waterInterval);
  }, [waterGlasses]);

  // --- LOGIQUE SMART PLANNER ---
  const generateWeeklyMenu = async () => {
      let currentRecipes = RECIPES_DB;
      try {
          const { data } = await supabase.from('nutrition_recipes').select('*');
          if (data && data.length > 0) currentRecipes = data;
      } catch(e) {}
      
      let newMenu: any[] = [];
      let bolCommunCount = 0;
      const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      
      days.forEach(day => {
          const breakfasts = currentRecipes.filter(r => r.type === 'Petit-déjeuner');
          const lunches = currentRecipes.filter(r => r.type === 'Déjeuner');
          const dinners = currentRecipes.filter(r => r.type === 'Dîner');
          const snacks = currentRecipes.filter(r => r.type === 'Collation');

          let lunch;
          // S'assure d'intégrer 2-3 déjeuners "Bol Commun" dans la semaine
          if (bolCommunCount < 3 && Math.random() > 0.4) {
              const bcLunches = lunches.filter(r => r.is_bol_commun);
              lunch = bcLunches.length > 0 ? bcLunches[Math.floor(Math.random() * bcLunches.length)] : lunches[0];
              if (bcLunches.length > 0) bolCommunCount++;
          } else {
              const normalLunches = lunches.filter(r => !r.is_bol_commun);
              lunch = normalLunches.length > 0 ? normalLunches[Math.floor(Math.random() * normalLunches.length)] : lunches[0];
          }

          newMenu.push({
              day,
              meals: {
                  'Petit-déjeuner': breakfasts.length > 0 ? breakfasts[Math.floor(Math.random() * breakfasts.length)] : null,
                  'Déjeuner': lunch || null,
                  'Collation': snacks.length > 0 ? snacks[Math.floor(Math.random() * snacks.length)] : null,
                  'Dîner': dinners.length > 0 ? dinners[Math.floor(Math.random() * dinners.length)] : null
              }
          });
      });
      setWeeklyGeneratedMenu(newMenu);
      if (clientProfile) {
         const safeMenu = JSON.parse(JSON.stringify(newMenu));
         await supabase.from('nutrition_profiles').update({ weekly_menu: safeMenu }).eq('client_id', clientProfile.id);
      }
  };

  const handleSwapMeal = async (dayIndex: number, mealType: string, currentRecipeId: string) => {
      let currentRecipes = RECIPES_DB;
      try {
          const { data } = await supabase.from('nutrition_recipes').select('*');
          if (data && data.length > 0) currentRecipes = data;
      } catch(e) {}
      
      const alternatives = currentRecipes.filter(r => r.type === mealType && r.id !== currentRecipeId);
      if (alternatives.length > 0) {
          const newRecipe = alternatives[Math.floor(Math.random() * alternatives.length)];
          const updatedMenu = [...weeklyGeneratedMenu];
          updatedMenu[dayIndex].meals[mealType] = newRecipe;
          setWeeklyGeneratedMenu(updatedMenu);
          if (clientProfile) {
             const safeMenu = JSON.parse(JSON.stringify(updatedMenu));
             await supabase.from('nutrition_profiles').update({ weekly_menu: safeMenu }).eq('client_id', clientProfile.id);
          }
      } else {
          alert("Aucune alternative disponible pour ce type de repas dans la base de données.");
      }
  };

  const getGroceryList = () => {
      const list: any = { 'Supermarché': {}, 'Marché local': {}, 'Boucherie / Pêche': {} };
      const safeWeeklyMenu = Array.isArray(weeklyGeneratedMenu) ? weeklyGeneratedMenu : [];
      safeWeeklyMenu.forEach(dayInfo => {
          Object.values(dayInfo?.meals || {}).forEach((recipe: any) => {
              if (!recipe || !recipe.ingredients) return;
              recipe.ingredients.forEach((ing: any) => {
                  const rayon = ing.rayon || 'Supermarché';
                  if (!list[rayon]) list[rayon] = {};
                  if (list[rayon][ing.nom]) {
                      list[rayon][ing.nom].quantite += ing.quantite;
                  } else {
                      list[rayon][ing.nom] = { quantite: ing.quantite, unite: ing.unite };
                  }
              });
          });
      });
      return list;
  };

  const toggleExcludeIngredient = (nom: string) => {
      setExcludedIngredients(prev => {
          const newEx = prev.includes(nom) ? prev.filter(i => i !== nom) : [...prev, nom];
          if (clientProfile) {
              localStorage.setItem(`onyx_nutrition_excluded_ings_${clientProfile.id}`, JSON.stringify(newEx));
          }
          return newEx;
      });
  };

  const openProductModal = async (product: any) => {
      const newViews = (product.views || 0) + 1;
      setSelectedProduct({ ...product, views: newViews });
      setShopDataDB(prev => prev.map(cat => ({
          ...cat,
          produits: cat.produits.map((p: any) => p.id === product.id ? { ...p, views: newViews } : p)
      })));
      await supabase.from('nutrition_products').update({ views: newViews }).eq('id', product.id);
  };

  const handleShareProduct = (product: any) => {
      const url = `${window.location.origin}/solutions/onyx-nutritionafricaine?product=${product.id}`;
      const text = `Découvrez ${product.nom} sur la boutique OnyxNutrition !\n\n${product.description_courte || ''}\n\n👉 Achetez ici : ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareGroceryListWhatsApp = async () => {
      if (!clientProfile) return;
      setIsSharingPDF(true);
      try {
          const doc = new jsPDF();
          doc.setFontSize(22);
          doc.text("Liste de Courses - Onyx Nutrition", 14, 20);
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text(`Semaine du ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
          
          let y = 45;
          const list = getGroceryList();
          
          Object.entries(list).forEach(([rayon, items]: any) => {
              const activeItems = Object.entries(items).filter(([nom]) => !excludedIngredients.includes(nom));
              if (activeItems.length === 0) return;
              if (y > 260) { doc.addPage(); y = 20; }
              doc.setFontSize(14);
              doc.setTextColor(0, 0, 0);
              doc.setFont("helvetica", "bold");
              doc.text(rayon.toUpperCase(), 14, y);
              y += 8;
              doc.setFont("helvetica", "normal");
              doc.setFontSize(12);
              activeItems.forEach(([nom, data]: any) => {
                  if (y > 280) { doc.addPage(); y = 20; }
                  doc.text(`• ${nom}`, 20, y);
                  doc.text(`${data.quantite} ${data.unite}`, 190, y, { align: 'right' });
                  y += 7;
              });
              y += 10;
          });

          const pdfBlob = doc.output('blob');
          const fileName = `Liste_Courses_${clientProfile.id}_${Date.now()}.pdf`;
          
          const { error: uploadError } = await supabase.storage.from('tontines').upload(fileName, pdfBlob, { contentType: 'application/pdf' });
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from('tontines').getPublicUrl(fileName);
          const fileUrl = urlData.publicUrl;

          const newHistory = [{ date: new Date().toISOString(), type: 'Liste de Courses', url: fileUrl }, ...pdfHistory];
          setPdfHistory(newHistory);
          localStorage.setItem(`onyx_nutrition_pdfs_${clientProfile.id}`, JSON.stringify(newHistory));

          const text = `Bonjour ! Voici ma liste de courses de la semaine générée par OnyxNutrition 🛒🥦 :\n\n${fileUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      } catch (err: any) {
          alert("Erreur lors de la génération du lien : " + err.message);
      } finally {
          setIsSharingPDF(false);
      }
  };

  const downloadGroceryListPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Liste de Courses - Onyx Nutrition", 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Semaine du ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
      
      let y = 45;
      const list = getGroceryList();
      
      Object.entries(list).forEach(([rayon, items]: any) => {
          const activeItems = Object.entries(items).filter(([nom]) => !excludedIngredients.includes(nom));
          if (activeItems.length === 0) return;
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "bold");
          doc.text(rayon.toUpperCase(), 14, y);
          y += 8;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          activeItems.forEach(([nom, data]: any) => {
              if (y > 280) { doc.addPage(); y = 20; }
              doc.text(`• ${nom}`, 20, y);
              doc.text(`${data.quantite} ${data.unite}`, 190, y, { align: 'right' });
              y += 7;
          });
          y += 10;
      });
      doc.save(`Liste_Courses_Onyx_${new Date().toISOString().split('T')[0]}.pdf`);
      
      const newHistory = [{ date: new Date().toISOString(), type: 'Liste de Courses', url: null }, ...pdfHistory];
      setPdfHistory(newHistory);
      if (clientProfile) {
          localStorage.setItem(`onyx_nutrition_pdfs_${clientProfile.id}`, JSON.stringify(newHistory));
      }
  };

  const handleAddWater = async () => {
    if (!clientProfile) return;
    const newAmount = Math.min(waterGlasses + 1, 8);
    setWaterGlasses(newAmount);
    
    if (waterGlasses === 7 && newAmount === 8) {
        updateXP(5, "Objectif d'eau quotidien atteint !");
    }

    const todayStr = new Date().toISOString().split('T')[0];
    
    await supabase.from('nutrition_daily_logs').upsert({
      client_id: clientProfile.id,
      log_date: todayStr,
      water_glasses: newAmount,
      calories_consumed: calories,
      proteins_consumed: proteins
    }, { onConflict: 'client_id, log_date' });
    
    setDailyLogs(prev => {
      const filtered = prev.filter(l => l.log_date !== todayStr);
      const existing = prev.find(l => l.log_date === todayStr) || {};
      return [...filtered, { ...existing, client_id: clientProfile.id, log_date: todayStr, water_glasses: newAmount, calories_consumed: calories, proteins_consumed: proteins }];
    });
  };
  
  const handleMealClick = (mealType: string, plannedMeal: any) => {
      setFoodSearchQuery("");
      setSelectedFoodDB(null);
      setFoodQuantity(1);
      setSelectedMealModal({ type: mealType, meal: plannedMeal, mode: trackingMode });
  };

  const confirmMealLog = async (mealName: string, cals: number, prots: number, mealCarbs: number, mealFats: number, foodObj?: any) => {
      const calsRounded = Math.round(cals);
      const protsRounded = Math.round(prots);
      const carbsRounded = Math.round(mealCarbs);
      const fatsRounded = Math.round(mealFats);

      const newCals = calories + calsRounded;
      const newProts = proteins + protsRounded;
      const newCarbs = carbs + carbsRounded;
      const newFats = fats + fatsRounded;
      
      const newConsumedItem = {
         id: Date.now(),
         type: selectedMealModal.type,
         name: mealName,
         cals: calsRounded,
         prots: protsRounded,
         carbs: carbsRounded,
         fats: fatsRounded,
         time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      const updatedConsumedMeals = [...consumedMeals, newConsumedItem];

      setCalories(newCals);
      setProteins(newProts);
      setCarbs(newCarbs);
      setFats(newFats);
      setConsumedMeals(updatedConsumedMeals);
      
      if (updatedConsumedMeals.length === 3 && consumedMeals.length === 2) {
          updateXP(10, "3 repas logués aujourd'hui !");
      }

      setSelectedMealModal(null);
      
      // --- L'Intervention de l'Avatar IA (Rokhy) ---
      if (foodObj?.flags_ia?.high_sodium) {
         setRokhyMessage({ title: "Attention au sel !", text: foodObj.message_coach_ia, type: 'warning' });
      } else if (newFats > fatsGoal) {
         setRokhyMessage({ title: "Quota de lipides atteint", text: "Attention à l'huile pour le reste de la journée ! Privilégie une cuisson vapeur ou au four ce soir.", type: 'warning' });
      } else if (foodObj?.message_coach_ia) {
         setRokhyMessage({ title: "Bon choix", text: foodObj.message_coach_ia, type: 'success' });
      }

      if (clientProfile) {
          const todayStr = new Date().toISOString().split('T')[0];
          await supabase.from('nutrition_daily_logs').upsert({
            client_id: clientProfile.id,
            log_date: todayStr,
            calories_consumed: newCals,
            proteins_consumed: newProts,
            carbs_consumed: newCarbs,
            fats_consumed: newFats,
            report_data: { ...reportData, consumedMeals: updatedConsumedMeals }
          }, { onConflict: 'client_id, log_date' });
      }
  };

  const deleteMealLog = async (itemToDelete: any) => {
      const updatedConsumedMeals = consumedMeals.filter(m => m.id !== itemToDelete.id);
      
      const newCals = Math.max(0, calories - itemToDelete.cals);
      const newProts = Math.max(0, proteins - itemToDelete.prots);
      const newCarbs = Math.max(0, carbs - itemToDelete.carbs);
      const newFats = Math.max(0, fats - itemToDelete.fats);

      setCalories(newCals);
      setProteins(newProts);
      setCarbs(newCarbs);
      setFats(newFats);
      setConsumedMeals(updatedConsumedMeals);

      if (clientProfile) {
          const todayStr = new Date().toISOString().split('T')[0];
          await supabase.from('nutrition_daily_logs').upsert({
            client_id: clientProfile.id,
            log_date: todayStr,
            calories_consumed: newCals,
            proteins_consumed: newProts,
            carbs_consumed: newCarbs,
            fats_consumed: newFats,
            report_data: { ...reportData, consumedMeals: updatedConsumedMeals }
          }, { onConflict: 'client_id, log_date' });
      }
  };

  const handleProcessPayment = async () => {
     setShowPaymentModal(false);
     if (clientProfile) {
         const newDate = new Date();
         newDate.setDate(newDate.getDate() + 30);
         await supabase.from('clients').update({ trial_ends_at: newDate.toISOString(), plan_type: 'premium' }).eq('id', clientProfile.id);
         setDaysLeft(30);
         setClientProfile({...clientProfile, plan_type: 'premium', trial_ends_at: newDate.toISOString()});
         alert("Paiement validé ! Votre abonnement Premium est prolongé de 30 jours.");
     } else {
         alert("Simulation: Paiement validé.");
     }
  };

  const handleScanProduct = async () => {
     if (!barcodeInput) return;
     try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeInput}.json`);
        const data = await res.json();
        if (data.status === 1) {
           const product = data.product;
           const nutriments = product.nutriments;
           const newFood = {
              id: product._id,
              nom: product.product_name || "Produit Scanné",
              categorie: "Produit Scanné (API)",
              portion_standard_nom: "100g",
              portion_standard_grammes: 100,
              valeurs_pour_100g: {
                 calories: nutriments['energy-kcal_100g'] || 0,
                 glucides: nutriments.carbohydrates_100g || 0,
                 lipides: nutriments.fat_100g || 0,
                 proteines: nutriments.proteins_100g || 0,
                 fibres: nutriments.fiber_100g || 0,
                 sodium_mg: (nutriments.sodium_100g || 0) * 1000
              },
              flags_ia: { is_local_senegal: false, ig_bas: null, high_sodium: false, ultra_transforme: true },
              message_coach_ia: "Produit industriel scanné via l'API OpenFoodFacts. Ajoutez-le à votre journal."
           };
           setSelectedFoodDB(newFood);
           setFoodSearchQuery(product.product_name);
           setIsScanning(false);
           setBarcodeInput("");
           alert(`Produit trouvé : ${product.product_name}. Confirmez-vous l'ajout ?`);
        } else {
           alert("Produit introuvable dans la base de données OpenFoodFacts.");
        }
     } catch (e) {
        alert("Erreur lors de la recherche du produit via l'API.");
     }
  };

  const handleSaveWeight = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastLog = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
      
      if (lastLog) {
          const days = (new Date(todayStr).getTime() - new Date(lastLog.log_date).getTime()) / (1000 * 3600 * 24);
          if (days < 7 && lastLog.log_date !== todayStr) {
              alert(`Vous avez déjà enregistré votre poids cette semaine. On évite l'obsession ! Revenez dans ${Math.ceil(7 - days)} jours.`);
              return;
          }
      }
      
      const newWeight = currentWeightInput;
      const isLoss = lastLog ? newWeight < lastLog.weight : true;
      
      if (isLoss) {
          setRokhyMessage({ title: "Perte validée !", text: "Bravo ! Les efforts payent. On a brûlé la graisse, on continue sur cette lancée !", type: 'success' });
      } else {
          setRokhyMessage({ title: "Ne panique pas.", text: "Stop, ne panique pas. Le poids fluctue à cause de l'eau, du cycle hormonal ou du stress. Reste focus sur ton menu cette semaine, le processus fonctionne.", type: 'warning' });
      }
      
      const newLog = { log_date: todayStr, weight: newWeight };
      const updatedLogs = [...weightLogs.filter(l => l.log_date !== todayStr), newLog].sort((a,b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
      setWeightLogs(updatedLogs);
      
      if (clientProfile) {
          await supabase.from('nutrition_weight_logs').upsert({ client_id: clientProfile.id, log_date: todayStr, weight: newWeight }, { onConflict: 'client_id, log_date' });
      }
  };

  const handlePostCommunity = async () => {
      if (clientProfile?.plan_type !== 'premium' && daysLeft <= 0) return alert("La publication est réservée aux membres Premium pour garantir l'absence de spams.");
      if (!newPostText && !newPostImage) return;
      const newPost = { id: Date.now().toString(), client: user?.full_name || 'Membre', content: newPostText, image_url: newPostImage, reactions: { top: 0, sain: 0, courage: 0 }, created_at: new Date().toISOString() };
      setCommunityPosts([newPost, ...communityPosts]);
      setNewPostText("");
      setNewPostImage(null);
      updateXP(15, "Photo/Plat publié dans le Feed");
      if (clientProfile) await supabase.from('nutrition_community_posts').insert({ client_id: clientProfile.id, content: newPostText, image_url: newPostImage, reactions: { top: 0, sain: 0, courage: 0 } });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        setUploadingImage(true);
        const ext = file.name.split('.').pop();
        const fileName = `posts/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const { error, data: uploadData } = await supabase.storage.from('avatars').upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        setNewPostImage(data.publicUrl);
    } catch (err: any) {
        alert("Erreur d'upload : " + err.message + "\nAssurez-vous que le bucket 'avatars' est public et accepte les uploads.");
    } finally {
        setUploadingImage(false);
    }
  };
  const submitDailyReport = async () => {
    if (!clientProfile) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Valeurs simulées du menu respecté pour l'exemple
    let currentCals = calories;
    let currentProts = proteins;
    if (reportData.followedMenu && currentCals === 0) {
        currentCals = calorieGoal;
        currentProts = proteinGoal;
        setCalories(currentCals);
        setProteins(currentProts);
    }

    try {
       const { error } = await supabase.from('nutrition_daily_logs').upsert({
         client_id: clientProfile.id,
         log_date: todayStr,
         report_data: { ...reportData, consumedMeals, moods, moodNotes },
         water_glasses: waterGlasses,
         calories_consumed: currentCals || 0,
         proteins_consumed: currentProts || 0,
         carbs_consumed: carbs || 0,
         fats_consumed: fats || 0
       }, { onConflict: 'client_id, log_date' });

       if (error) throw error;

       alert("Bilan de la journée enregistré avec succès ! L'IA adaptera votre menu de demain.");
       setShowDailyReport(false);
       const updatedLog = { client_id: clientProfile.id, log_date: todayStr, report_data: { ...reportData, consumedMeals, moods, moodNotes }, water_glasses: waterGlasses, calories_consumed: currentCals, proteins_consumed: currentProts };
       setDailyLogs(prev => [...prev.filter(l => l.log_date !== todayStr), updatedLog]);
    } catch (err: any) {
       alert("Erreur lors de l'enregistrement : " + err.message + "\nVeuillez vérifier que les colonnes carbs_consumed et fats_consumed existent dans nutrition_daily_logs.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Mise à jour du mot de passe dans Supabase Auth (si renseigné)
      if (profileForm.password) {
        await supabase.auth.updateUser({ password: profileForm.password });
      }

      // 2. Mise à jour des métadonnées (photo et nom)
      await supabase.auth.updateUser({
        data: { full_name: profileForm.full_name, avatar_url: profileForm.avatar_url }
      });

      // 3. Mise à jour de la table clients
      if (clientProfile) {
        await supabase.from('clients').update({
          full_name: profileForm.full_name,
          avatar_url: profileForm.avatar_url
        }).eq('id', clientProfile.id);
      }

      setUser({ ...user, full_name: profileForm.full_name, avatar_url: profileForm.avatar_url });
      alert("Profil mis à jour avec succès !");
      setProfileForm({ ...profileForm, password: "" });
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentDayName = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const formattedCurrentDay = currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1);
  const safeWeeklyMenu = Array.isArray(weeklyGeneratedMenu) ? weeklyGeneratedMenu : [];
  const todayPlan = safeWeeklyMenu.find(d => d.day === formattedCurrentDay);

  const weeklyMenus = ALL_MENUS.map(menu => {
      let displayMeals = menu.meals;
      if (menu.week === 1 && safeWeeklyMenu.length > 0) {
          displayMeals = [
              `Lundi : ${safeWeeklyMenu.find(d => d.day === 'Lundi')?.meals?.['Déjeuner']?.nom || 'Repas'}`,
              `Mardi : ${safeWeeklyMenu.find(d => d.day === 'Mardi')?.meals?.['Déjeuner']?.nom || 'Repas'}`,
              `Mercredi : ${safeWeeklyMenu.find(d => d.day === 'Mercredi')?.meals?.['Déjeuner']?.nom || 'Repas'}`
          ];
      }
      return {
          ...menu,
          status: clientProfile?.plan_type === 'premium' || menu.week <= 2 ? 'unlocked' : 'locked',
          meals: displayMeals
      };
  });

  // --- GESTION ET SAUVEGARDE DU MODE DE SUIVI ---
  const handleTrackingModeChange = async (mode: 'guided' | 'flexible') => {
     setTrackingMode(mode);
     if (clientProfile && clientProfile.phone) {
        await supabase.from('nutrition_profiles').update({ tracking_mode: mode }).eq('phone', clientProfile.phone);
     } else {
        const { data: { user } } = await supabase.auth.getUser();
        const phone = user?.email?.match(/^(\+?\d+)@clients\.onyxcrm\.com$/)?.[1] || user?.phone;
        if (phone) await supabase.from('nutrition_profiles').update({ tracking_mode: mode }).eq('phone', phone);
     }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
  }
  
  const toggleFavorite = (meal: any) => {
      const mealName = meal.meal || meal.nom;
      const exists = favoriteMeals.find(f => (f.meal || f.nom) === mealName);
      let newFavs;
      if (exists) {
          newFavs = favoriteMeals.filter(f => (f.meal || f.nom) !== mealName);
      } else {
          newFavs = [...favoriteMeals, meal];
      }
      setFavoriteMeals(newFavs);
      if (clientProfile) {
          localStorage.setItem(`onyx_nutrition_favs_${clientProfile.id}`, JSON.stringify(newFavs));
      }
  };

  const targetCalories = calorieGoal || 1500;
  const targetCarbs = carbsGoal || 150;
  const targetProtein = proteinGoal || 80;
  const targetFats = fatsGoal || 50;
  
  const remainingCalories = Math.max(0, targetCalories - calories);
  const lvlInfo = getJongomaLevel(jongomaXP);

  const currentHour = new Date().getHours();
  const greetingText = currentHour < 18 ? "Bonjour" : "Bonsoir";
  const greetingSubtext = currentHour < 18 ? "Prête pour ta journée ?" : "Pense à t'hydrater ce soir.";

  // Calcul pour le badge de coaching (3 premiers jours)
  const createdDate = clientProfile?.created_at ? new Date(clientProfile.created_at) : new Date();
  const isNewUser = (new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24) <= 3;

  const menuItems = [
    { id: 'today', label: 'Mon Jour', icon: Calendar },
    { id: 'weight', label: 'Mon Poids', icon: Scale },
    { id: 'community', label: 'Communauté', icon: Camera },
    { id: 'shop', label: 'Boutique', icon: ShoppingBag },
    { id: 'week', label: 'Programme', icon: ListChecks },
    { id: 'favorites', label: 'Recettes', icon: HeartPulse },
    { id: 'coaching', label: 'Coaching', icon: Activity, dot: isNewUser },
    { id: 'history', label: 'Historique', icon: BarChart },
    { id: 'profile', label: 'Réglages', icon: Settings },
  ];

  const addToCart = (product: any) => {
    const isPremium = clientProfile?.plan_type === 'premium';
    const price = isPremium ? product.prix_premium : product.prix_standard;
    setShopCart([...shopCart, { ...product, finalPrice: price }]);
    setToastMessage(`Ajouté au panier : ${product.nom}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyShopPromo = () => {
     const codeObj = shopPromoCodesDB.find(c => c.code.toUpperCase() === shopPromoCode.toUpperCase());
     if (codeObj) {
         if (jongomaXP >= codeObj.min_xp) {
             setIsShopPromoApplied(true);
             setAppliedPromoData(codeObj);
             alert(`Code ${codeObj.code} appliqué (-${codeObj.discount_pct}%) !`);
         } else {
             alert(`Vous n'avez pas assez d'XP pour utiliser ce code (${codeObj.min_xp} XP requis).`);
         }
     } else {
         alert("Code promo invalide.");
     }
  };

  const toggleSaveProduct = (prod: any) => {
      const isSaved = savedShopProducts.some(p => p.id === prod.id);
      const newSaved = isSaved ? savedShopProducts.filter(p => p.id !== prod.id) : [...savedShopProducts, prod];
      setSavedShopProducts(newSaved);
      if (clientProfile) localStorage.setItem(`onyx_nutrition_saved_products_${clientProfile.id}`, JSON.stringify(newSaved));
  };

  const handleShopCheckout = async () => {
    if (shopCart.length === 0) return;

    const discountPct = isShopPromoApplied && appliedPromoData ? appliedPromoData.discount_pct : 0;
    const discountMultiplier = 1 - (discountPct / 100);
    
    const originalTotal = shopCart.reduce((acc, item) => acc + item.finalPrice, 0);
    const discountAmount = Math.round(originalTotal * (discountPct / 100));
    const total = Math.round(originalTotal * discountMultiplier);
    const cartText = shopCart.map(item => `- ${item.nom} (${Math.round(item.finalPrice * discountMultiplier)} F)`).join('\n');

    // Sauvegarde en DB
    if (clientProfile) {
       await supabase.from('nutrition_orders').insert({
          client_id: clientProfile.id,
          client_name: user?.full_name || 'Inconnu',
          phone: clientProfile.phone || '',
          items: shopCart,
          total: total,
          status: 'Nouveau',
          promo_code: isShopPromoApplied && appliedPromoData ? appliedPromoData.code : null,
          discount_amount: discountAmount
       });
    }

    let msg = `Bonjour ! Je souhaite commander les produits suivants sur la boutique Onyx Nutrition :\n\n${cartText}\n\n*Total : ${total} F*\n`;
    if (isShopPromoApplied && appliedPromoData) {
       msg += `\n🎁 *Promo VIP ${appliedPromoData.code} (-${appliedPromoData.discount_pct}%) appliquée !*\n`;
    }
    msg += `\nMon nom : ${user?.full_name}\nTéléphone : ${clientProfile?.phone || ''}`;

    window.open(`https://wa.me/221785338417?text=${encodeURIComponent(msg)}`, "_blank");
    setShopCart([]);
    setIsShopPromoApplied(false);
    setShopPromoCode("");
    setAppliedPromoData(null);
  };

  const handleSaveMoodNotes = async () => {
     if (!clientProfile) return;
     setIsSaving(true);
     try {
         const todayStr = new Date().toISOString().split('T')[0];
         await supabase.from('nutrition_daily_logs').upsert({
           client_id: clientProfile.id,
           log_date: todayStr,
           report_data: { ...reportData, consumedMeals, moods, moodNotes },
           water_glasses: waterGlasses,
           calories_consumed: calories,
           proteins_consumed: proteins,
           carbs_consumed: carbs,
           fats_consumed: fats
         }, { onConflict: 'client_id, log_date' });
         alert("Notes et humeurs du jour sauvegardées !");
     } catch(e) {
         alert("Erreur de sauvegarde.");
     } finally {
         setIsSaving(false);
     }
  };

  const handleChangeAvatar = async () => {
      const newUrl = prompt("Entrez l'URL de votre nouvelle photo de profil :");
      if (newUrl && newUrl.trim() !== "") {
          const updatedUser = { ...user, avatar_url: newUrl.trim() };
          setUser(updatedUser);
          setProfileForm(prev => ({ ...prev, avatar_url: newUrl.trim() }));
          if (clientProfile) {
              await supabase.from('clients').update({ avatar_url: newUrl.trim() }).eq('id', clientProfile.id);
          }
          await supabase.auth.updateUser({ data: { avatar_url: newUrl.trim() } });
          const customSession = localStorage.getItem('onyx_custom_session');
          if (customSession) localStorage.setItem('onyx_custom_session', JSON.stringify(updatedUser));
          alert("Photo de profil mise à jour avec succès !");
      }
  };

  const downloadHistoryPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Historique de Progression - Onyx", 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
      doc.text(`Client : ${user?.full_name || 'Membre'}`, 14, 38);

      let y = 50;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Évolution du Poids", 14, y);
      y += 10;
      if (weightLogs && weightLogs.length > 0) {
          weightLogs.forEach(log => {
              if (y > 270) { doc.addPage(); y = 20; }
              doc.setFontSize(12);
              doc.text(`• ${new Date(log.log_date).toLocaleDateString('fr-FR')} : ${log.weight} kg`, 20, y);
              y += 8;
          });
      } else {
          doc.setFontSize(12);
          doc.text("Aucune donnée de poids.", 20, y);
          y += 8;
      }

      y += 10;
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFontSize(16);
      doc.text("Bilans Quotidiens", 14, y);
      y += 10;
      const sortedLogs = [...dailyLogs].sort((a,b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
      if (sortedLogs.length > 0) {
          sortedLogs.forEach(log => {
              if (y > 270) { doc.addPage(); y = 20; }
              doc.setFontSize(12);
              doc.setFont("helvetica", "bold");
              doc.text(`${new Date(log.log_date).toLocaleDateString('fr-FR')} :`, 20, y);
              doc.setFont("helvetica", "normal");
              doc.text(`${log.calories_consumed || 0} kcal, ${log.water_glasses || 0}/8 eau`, 60, y);
              y += 8;
          });
      } else {
          doc.setFontSize(12);
          doc.text("Aucun bilan enregistré.", 20, y);
          y += 8;
      }

      doc.save(`Historique_Progression_${user?.full_name?.replace(/\s+/g, '_') || 'Client'}.pdf`);
  };

  const logoSrc = theme === 'dark' 
     ? 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png' 
     : 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781198743/Keep_the_exact_logo_from_202606111709_xocxye.jpg';

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-[#fafafa] text-zinc-900'} font-sans selection:bg-[#39FF14]/30 transition-colors duration-300`}>
      {/* SIDEBAR VERTICAL */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col ${theme === 'dark' ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'} transition-all duration-500 ease-in-out border-r lg:translate-x-0 ${isSidebarOpen ? 'w-72' : 'w-20'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
         <div className="p-6 flex items-center justify-between">
            <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'lg:hidden'}`}>
               <img src={logoSrc} alt="OnyxNutrition Logo" className="h-20 md:h-28 w-auto object-contain transition-all" />
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`hidden lg:flex p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-[#39FF14]' : 'hover:bg-zinc-100 text-zinc-500 hover:text-black'}`}>
               {isSidebarOpen ? <PanelLeftClose size={20}/> : <PanelLeftOpen size={20}/>}
            </button>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 hover:bg-zinc-800 rounded-xl transition-colors">
               <X size={24}/>
            </button>
         </div>

         <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item: any) => (
               <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1024) setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all group relative ${activeTab === item.id ? 'bg-[#39FF14] text-black shadow-[0_10px_20px_rgba(57,255,20,0.2)]' : (theme === 'dark' ? 'text-zinc-500 hover:bg-zinc-900 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black')}`}
               >
                  <item.icon size={20} className="shrink-0" />
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${!isSidebarOpen && 'lg:opacity-0 lg:absolute lg:left-20'}`}>{item.label}</span>
                  {item.dot && (
                     <span className="absolute top-4 right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                     </span>
                  )}
               </button>
            ))}
         </nav>

         <div className={`mt-auto p-4 shrink-0 transition-all duration-300 overflow-hidden ${!isSidebarOpen ? 'lg:h-0 lg:p-0 lg:opacity-0' : 'lg:h-auto lg:opacity-100'}`}>
            <div className="flex items-center gap-3 mb-4 px-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setActiveTab('profile'); if (window.innerWidth < 1024) setIsMobileMenuOpen(false); }}>
               <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Membre')}&background=random`} alt="Profil" className={`w-10 h-10 rounded-full border-2 border-[#39FF14] object-cover ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'} shadow-sm shrink-0 cursor-pointer`} onClick={(e) => { e.stopPropagation(); handleChangeAvatar(); }} title="Changer l'avatar" />
               <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase truncate text-black dark:text-white">{user?.full_name || 'Membre'}</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">Mon Profil</p>
               </div>
            </div>
            <div className={`p-4 rounded-[1.5rem] border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
               <p className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-2">XP Progression</p>
               <div className="flex items-center gap-3">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-zinc-200'}`}>
                     <div className="h-full bg-[#39FF14]" style={{ width: `${Math.min((jongomaXP / 2000) * 100, 100)}%` }}></div>
                  </div>
                  <span className="text-[10px] font-black text-black dark:text-white">{jongomaXP}</span>
               </div>
            </div>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
      {/* Header */}
      <div className="lg:hidden p-4 bg-black flex justify-between items-center">
         <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-[#39FF14]"><MenuIcon size={28}/></button>
         <img src={logoSrc} className="h-24 w-auto object-contain" alt="Logo" />
         <div className="w-10"></div>
      </div>

      <header className="bg-black text-white px-6 py-8 border-b-4 border-[#39FF14] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
             <button onClick={() => router.push('/hub')} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors font-black uppercase text-xs tracking-widest bg-zinc-900 w-max px-4 py-2 rounded-xl border border-zinc-800">
               <ChevronLeft size={16}/> Retour au Hub
             </button>
             
             <div className="flex items-center gap-3">
                 <button onClick={() => setShowCartModal(true)} className="relative flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                    <ShoppingCart size={16} /> 
                    <span className="text-xs font-black uppercase hidden sm:block">Panier</span>
                    {shopCart.length > 0 && (
                       <span className="absolute -top-2 -right-2 bg-[#39FF14] text-black w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black animate-pulse shadow-md">
                          {shopCart.length}
                       </span>
                    )}
                 </button>
                 <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-2 text-zinc-400 hover:text-yellow-500 transition-colors font-black uppercase text-xs tracking-widest bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                   {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>} <span className="hidden sm:block">{theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</span>
                 </button>
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <p className="text-[#39FF14] font-black tracking-widest text-xs uppercase mb-2">Espace Personnel</p>
              <div className="flex items-center gap-4">
                <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Membre')}&background=random`} alt="Profil" className="w-20 h-20 rounded-full object-cover hidden md:block mr-4 border-2 border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)] bg-zinc-800" />
                <div>
                  <h1 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase tracking-tighter`}>
                    {greetingText}, <span className="text-white">{user?.full_name?.split(' ')[0] || 'Membre'}</span> !
                  </h1>
                  <p className="text-[#39FF14] font-black tracking-widest text-xs uppercase mt-1">{greetingSubtext}</p>
                </div>
              </div>
            </div>
            
            {/* Bandeau Essai Gratuit */}
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-3 bg-zinc-900 p-2 pr-4 rounded-2xl border border-zinc-800 shadow-inner cursor-pointer hover:bg-zinc-800 transition-colors" title={lvlInfo.desc + " - Cliquez pour voir le classement"} onClick={openLeaderboard}>
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-xl shadow-md border border-zinc-700">{lvlInfo.badge}</div>
                  <div>
                     <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest">Niveau : {lvlInfo.name}</p>
                     <p className="text-white text-xs font-bold">{jongomaXP} XP</p>
                  </div>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-xl">
                 <div className="flex items-center gap-4">
                    <div className="bg-black border border-zinc-700 p-3 rounded-xl">
                       <Clock className={daysLeft > 0 ? "text-[#39FF14]" : "text-red-500"} size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Abonnement</p>
                       <p className="text-sm font-bold text-white"><strong className={daysLeft > 0 ? "text-[#39FF14]" : "text-red-500"}>{daysLeft > 0 ? `${daysLeft} jours restants` : 'Expiré'}</strong></p>
                    </div>
                 </div>
                 <button onClick={() => setShowPaymentModal(true)} className="w-full sm:w-auto bg-[#39FF14] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">Renouveler</button>
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-12">
        {activeTab === 'today' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* SÉLECTEUR DE MODE & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="bg-white border border-zinc-200 p-2 rounded-2xl flex items-center shadow-sm w-full md:w-auto">
                 <button onClick={() => handleTrackingModeChange('guided')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'guided' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}>
                    <Utensils size={16}/> Mode Guidé
                 </button>
                 <button onClick={() => handleTrackingModeChange('flexible')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'flexible' ? 'bg-black text-[#00E5FF] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}>
                    <Compass size={16}/> Mode Libre
                 </button>
               </div>
               
               <button onClick={() => setShowRedoDiagModal(true)} className="bg-zinc-100 text-black border border-zinc-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-2">
                 <RefreshCcw size={14}/> Refaire mon Diagnostic
               </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl text-sm font-medium">
               <p><strong>{trackingMode === 'guided' ? 'Mode Guidé (Menu Strict) :' : 'Mode Libre (Flexible) :'}</strong> {trackingMode === 'guided' ? "Idéal pour les 14 premiers jours. Suivez le menu généré à la lettre pour des résultats rapides." : "Vous êtes libre de composer vos repas ! Ajoutez ce que vous mangez via la barre de recherche."}</p>
            </div>

        {/* MESSAGE D'ONBOARDING */}
        {welcomeMessage && (
           <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm relative">
              <button onClick={() => { setWelcomeMessage(null); localStorage.removeItem('onyx_nutrition_welcome'); }} className="absolute top-4 right-4 text-blue-400 hover:text-blue-600"><X size={16}/></button>
              <div className="bg-blue-600 text-white p-2 rounded-full shrink-0"><MessageCircle size={20}/></div>
              <div className="pr-6">
                 <h3 className="font-black text-blue-800 uppercase text-sm mb-1">Message de ton Coach</h3>
                 <p className="text-blue-900 font-medium text-sm leading-relaxed">{welcomeMessage}</p>
              </div>
           </div>
        )}

            {/* JAUGES DU JOUR */}
            <div className="bg-black p-8 rounded-[2rem] border border-zinc-800 shadow-2xl text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 blur-[50px] rounded-full"></div>
               
               <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter text-white flex items-center justify-center gap-3 mb-6`}><Activity className="text-[#39FF14]"/> Synthèse Journalière</h2>
               
               {/* JAUGE CENTRALE (CALORIES) */}
               <div className="relative w-48 h-48 mx-auto mb-8">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-zinc-800" strokeWidth="6" fill="transparent" />
                      <motion.circle 
                         cx="50" cy="50" r="40" 
                         className="stroke-[#39FF14] text-[#39FF14]" strokeWidth="6" fill="transparent" 
                         strokeDasharray={2 * Math.PI * 40} 
                         strokeDashoffset={(2 * Math.PI * 40) - (Math.min(remainingCalories / targetCalories, 1) * (2 * Math.PI * 40))}
                         initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                         animate={{ strokeDashoffset: (2 * Math.PI * 40) - (Math.min(remainingCalories / targetCalories, 1) * (2 * Math.PI * 40)) }}
                         transition={{ duration: 1.5, ease: "easeOut" }}
                         strokeLinecap="round"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="text-4xl font-black">{remainingCalories}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Kcal Restantes</span>
                   </div>
               </div>

               {/* MINI-JAUGES MACROS */}
               <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                   <div className="text-left">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                         <span className="text-yellow-600">Glucides</span>
                         <span className="text-zinc-400">{carbs} / {carbsGoal}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                         <div className="bg-yellow-600 h-full" style={{ width: `${Math.min((carbs/targetCarbs)*100, 100)}%` }}></div>
                      </div>
                   </div>
                   <div className="text-left">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                         <span className="text-[#39FF14]">Protéines</span>
                         <span className="text-zinc-400">{proteins} / {proteinGoal}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                         <div className="bg-[#39FF14] h-full" style={{ width: `${Math.min((proteins/targetProtein)*100, 100)}%` }}></div>
                      </div>
                   </div>
                   <div className="text-left">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                         <span className="text-zinc-300">Lipides</span>
                         <span className="text-zinc-400">{fats} / {fatsGoal}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                         <div className="bg-zinc-300 h-full" style={{ width: `${Math.min((fats/targetFats)*100, 100)}%` }}></div>
                      </div>
                   </div>
               </div>
            </div>

            {/* SUIVI DE L'EAU & HUMEUR */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
               <div className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <h3 className="font-black text-lg uppercase mb-4 flex items-center gap-2"><Droplet className="text-blue-500"/> Suivi de l'eau</h3>
                  <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                     {[...Array(8)].map((_, i) => (
                        <button key={i} onClick={() => setWaterGlasses(i + 1)} className={`w-8 h-12 rounded-b-xl rounded-t-sm border-2 transition-all shrink-0 ${i < waterGlasses ? 'bg-blue-500 border-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}></button>
                     ))}
                  </div>
                  <p className="text-xs font-bold text-zinc-500">{waterGlasses} / 8 verres (2 Litres) - {waterGlasses >= 8 ? 'Objectif atteint ! 🎉' : 'Encore un petit effort !'}</p>
               </div>

               <div className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <h3 className="font-black text-lg uppercase mb-4">Mon Humeur & Notes</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                     {[{e:'😃',l:'Enjoué'}, {e:'🤩',l:'Motivé'}, {e:'🧘‍♀️',l:'Zen'}, {e:'🤔',l:'Pensif'}, {e:'😴',l:'Fatigué'}, {e:'😫',l:'Épuisé'}, {e:'😢',l:'Triste'}, {e:'😠',l:'Enervé'}, {e:'🤢',l:'Barbouillé'}, {e:'😭',l:'Critique'}].map(m => {
                        const isSelected = moods.includes(m.l);
                        return (
                        <button key={m.l} onClick={() => {
                           if (isSelected) setMoods(moods.filter(x => x !== m.l));
                           else if (moods.length < 3) setMoods([...moods, m.l]);
                           else { const newM = [...moods]; newM.shift(); newM.push(m.l); setMoods(newM); }
                        }} className={`p-2 text-2xl rounded-xl border-2 transition-all ${isSelected ? 'bg-zinc-100 border-[#39FF14] scale-110 shadow-md' : (theme === 'dark' ? 'bg-zinc-800 border-zinc-700 opacity-50 hover:opacity-100' : 'bg-white border-zinc-100 opacity-50 hover:opacity-100')}`} title={m.l}>{m.e}</button>
                     )})}
                  </div>
                  <textarea value={moodNotes} onChange={e => setMoodNotes(e.target.value)} placeholder="Comment vous sentez-vous aujourd'hui ? (Optionnel)" className={`w-full border rounded-xl p-4 text-sm outline-none focus:border-[#39FF14] min-h-[80px] custom-scrollbar resize-none ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-black placeholder-zinc-400'}`} />
                  <button onClick={handleSaveMoodNotes} disabled={isSaving} className="mt-3 w-full bg-black dark:bg-white text-[#39FF14] dark:text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"><Save size={14}/> {isSaving ? 'En cours...' : 'Enregistrer Notes'}</button>
               </div>
            </div>

            {/* GRAPHIQUE ÉVOLUTION POIDS (MON JOUR) */}
            {Array.isArray(weightLogs) && weightLogs.length > 0 && (
               <div className={`p-6 rounded-[2rem] border shadow-sm mt-6 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <h3 className="font-black text-lg uppercase mb-4 flex items-center gap-2"><Scale className="text-[#39FF14]"/> Évolution de mon poids</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightLogs.filter(l => l && l.log_date && !isNaN(new Date(l.log_date).getTime()))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis dataKey="log_date" tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})} stroke="#a1a1aa" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} stroke="#a1a1aa" fontSize={10} axisLine={false} tickLine={false} />
                        <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="weight" stroke="#39FF14" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#39FF14', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            )}

            {/* CORPS : LES REPAS */}
            <div className="grid md:grid-cols-2 gap-4">
                {['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner'].map((mealType) => {
                    const generatedMeal = todayPlan?.meals ? todayPlan.meals[mealType] : null;
                    const plannedMeal = generatedMeal ? {
                        type: mealType,
                        time: mealType === 'Petit-déjeuner' ? '08:00' : mealType === 'Déjeuner' ? '13:30' : mealType === 'Collation' ? '16:00' : '19:30',
                        meal: generatedMeal.nom,
                        cals: generatedMeal.calories,
                        proteins: Math.round((generatedMeal.calories * 0.2) / 4),
                        carbs: Math.round((generatedMeal.calories * 0.5) / 4),
                        fats: Math.round((generatedMeal.calories * 0.3) / 9),
                        recipe: generatedMeal.recipe || `Ingrédients : ${generatedMeal.ingredients?.map((i: any) => `${i.quantite}${i.unite} ${i.nom}`).join(', ') || ''}`
                    } : null;
                    
                    const safeConsumedMeals = Array.isArray(consumedMeals) ? consumedMeals : [];
                    const itemsForThisMeal = safeConsumedMeals.filter(m => m.type === mealType);
                    
                    return (
                       <div key={mealType} className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-500' : 'bg-white border-zinc-200 hover:border-black'} p-6 rounded-[2rem] border shadow-sm transition-colors flex flex-col`}>
                          <div className="flex justify-between items-center mb-4">
                             <span className="bg-zinc-100 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{mealType}</span>
                             {trackingMode === 'guided' && plannedMeal && (
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-1"><Clock size={12}/> {plannedMeal.time}</span>
                             )}
                          </div>
                          
                          <div className="flex-1">
                             {itemsForThisMeal.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                   {itemsForThisMeal.map((item, i) => (
                                      <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100'}`}>
                                         <div>
                                            <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{item.name}</p>
                                            <p className="text-[10px] font-black uppercase text-zinc-500">{item.cals} kcal • {item.prots}g prot</p>
                                         </div>
                                         <button onClick={() => deleteMealLog(item)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16}/>
                                         </button>
                                      </div>
                                   ))}
                                </div>
                             ) : trackingMode === 'guided' && plannedMeal ? (
                                <div onClick={() => handleMealClick(mealType, plannedMeal)} className="cursor-pointer">
                                   <p className={`font-black text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{plannedMeal.meal}</p>
                                   <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                                      <span className="flex items-center gap-1 text-orange-500"><Flame size={14}/> {plannedMeal.cals} kcal</span>
                                      <span className="flex items-center gap-1 text-[#39FF14]"><Target size={14}/> {plannedMeal.proteins}g prot</span>
                                   </div>
                                </div>
                             ) : null}
                          </div>

                          {(trackingMode === 'flexible' || (trackingMode === 'guided' && itemsForThisMeal.length === 0)) && (
                             <div onClick={() => handleMealClick(mealType, plannedMeal)} className={`mt-4 flex flex-col items-center justify-center py-4 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${theme === 'dark' ? 'border-zinc-700 hover:border-white hover:bg-zinc-800' : 'border-zinc-200 hover:border-black hover:bg-zinc-50'}`}>
                                <span className="text-2xl mb-1 text-zinc-300 leading-none">+</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{itemsForThisMeal.length > 0 ? "Ajouter autre chose" : "Ajouter un aliment"}</span>
                             </div>
                          )}
                       </div>
                    );
                })}
            </div>

            {/* BOUTON BILAN FIN DE JOURNÉE */}
            <button onClick={() => setShowDailyReport(true)} className="w-full bg-black text-[#39FF14] py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform shadow-2xl flex items-center justify-center gap-3">
               <ListChecks size={24} /> Bilan de fin de journée
            </button>

            {/* MODALE BILAN DE FIN DE JOURNÉE */}
            {showDailyReport && (
               <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowDailyReport(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-lg w-full relative shadow-2xl border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto">
                     <button onClick={() => setShowDailyReport(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
                     <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter mb-2`}>Bilan Quotidien</h2>
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Soyez honnête avec vous-même !</p>

                     <div className="space-y-4">
                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${reportData.followedMenu ? 'bg-[#39FF14]/10 border-[#39FF14]' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}>
                           <div>
                              <p className="font-black text-sm uppercase">J'ai suivi le menu du jour</p>
                              <p className="text-xs text-zinc-500 font-medium mt-1">À 80% ou plus.</p>
                           </div>
                           <input type="checkbox" checked={reportData.followedMenu} onChange={e => setReportData({...reportData, followedMenu: e.target.checked})} className="w-6 h-6 accent-black cursor-pointer" />
                        </label>

                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${reportData.drankWater ? 'bg-blue-50 border-blue-500' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}>
                           <div>
                              <p className="font-black text-sm uppercase">J'ai bu mon eau</p>
                              <p className="text-xs text-zinc-500 font-medium mt-1">Au moins 6 verres dans la journée.</p>
                           </div>
                           <input type="checkbox" checked={reportData.drankWater} onChange={e => setReportData({...reportData, drankWater: e.target.checked})} className="w-6 h-6 accent-blue-600 cursor-pointer" />
                        </label>

                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${reportData.cravedRice ? 'bg-red-50 border-red-500' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}>
                           <div>
                              <p className="font-black text-sm uppercase">J'ai craqué sur le riz/sucre</p>
                              <p className="text-xs text-zinc-500 font-medium mt-1">J'ai dépassé mes portions recommandées.</p>
                           </div>
                           <input type="checkbox" checked={reportData.cravedRice} onChange={e => setReportData({...reportData, cravedRice: e.target.checked})} className="w-6 h-6 accent-red-600 cursor-pointer" />
                        </label>
                     </div>

                     <button onClick={submitDailyReport} className="w-full mt-8 bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                        <CheckCircle size={20} /> Valider ma journée
                     </button>
                  </div>
               </div>
            )}

            {/* MODALE REPAS (LOGGING) */}
            {selectedMealModal && (
               <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setSelectedMealModal(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-md w-full relative shadow-2xl border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto">
                     <button onClick={() => setSelectedMealModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
                     <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter mb-2`}>{selectedMealModal.type}</h2>
                     
                     {selectedMealModal.mode === 'guided' && selectedMealModal.meal ? (
                         <>
                             <div className="flex justify-between items-start mb-6">
                                <p className="text-sm font-bold text-zinc-500">{selectedMealModal.meal.meal}</p>
                                <button onClick={() => toggleFavorite(selectedMealModal.meal)} className={`p-2 rounded-full transition-colors ${favoriteMeals.some(f => (f.meal || f.nom) === selectedMealModal.meal.meal) ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-400 hover:text-red-500'}`}>
                                   <HeartPulse size={18} className={favoriteMeals.some(f => (f.meal || f.nom) === selectedMealModal.meal.meal) ? "fill-current" : ""} />
                                </button>
                             </div>
                             <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 mb-6">
                                <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-2">Recette / Consignes</h4>
                                <p className="text-sm font-medium text-zinc-700 leading-relaxed">{selectedMealModal.meal.recipe}</p>
                             </div>
                             <div className="grid grid-cols-4 gap-2 mb-8 text-center">
                                <div className="bg-orange-50 p-2 rounded-xl border border-orange-100"><p className="text-[9px] font-black uppercase text-orange-400">Kcal</p><p className="font-black text-orange-600">{selectedMealModal.meal.cals}</p></div>
                                <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100"><p className="text-[9px] font-black uppercase text-yellow-500">Gluc</p><p className="font-black text-yellow-700">{selectedMealModal.meal.carbs}g</p></div>
                                <div className="bg-green-50 p-2 rounded-xl border border-green-100"><p className="text-[9px] font-black uppercase text-green-500">Prot</p><p className="font-black text-green-700">{selectedMealModal.meal.proteins}g</p></div>
                                <div className="bg-zinc-100 p-2 rounded-xl border border-zinc-200"><p className="text-[9px] font-black uppercase text-zinc-400">Lip</p><p className="font-black text-zinc-600">{selectedMealModal.meal.fats}g</p></div>
                             </div>
                             <button onClick={() => confirmMealLog(selectedMealModal.meal.meal, selectedMealModal.meal.cals, selectedMealModal.meal.proteins, selectedMealModal.meal.carbs, selectedMealModal.meal.fats)} className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                                <CheckCircle size={20} /> J'ai mangé ça !
                             </button>
                         </>
                     ) : (
                         <>
                             <div className="flex gap-2 mb-6">
                                 <div className="relative flex-1">
                                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18}/>
                                     <input 
                                        type="text" 
                                        placeholder="Rechercher (ex: Fonio, Thiof)..." 
                                        value={foodSearchQuery}
                                        onChange={e => { setFoodSearchQuery(e.target.value); setSelectedFoodDB(null); setIsScanning(false); }}
                                        className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black"
                                     />
                                 </div>
                                 <button onClick={() => setIsScanning(!isScanning)} className={`px-5 rounded-2xl flex items-center justify-center transition-colors ${isScanning ? 'bg-[#39FF14] text-black' : 'bg-black text-white hover:bg-zinc-800'}`} title="Scanner un produit">
                                     <ScanLine size={20} />
                                 </button>
                             </div>
                             
                             {isScanning && (
                                 <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 mb-6 flex flex-col gap-3 animate-in fade-in">
                                     <p className="text-xs font-bold text-blue-800 flex items-center gap-2"><ScanLine size={16}/> Scanner via OpenFoodFacts</p>
                                     <input type="text" placeholder="Entrez le code-barres (ex: 3017620422003)" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} className="w-full p-3 border border-blue-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 bg-white"/>
                                     <button onClick={handleScanProduct} className="bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-blue-700 transition-colors">Chercher le produit</button>
                                 </div>
                             )}
                             
                             {!selectedFoodDB && foodSearchQuery && (
                                <div className="max-h-60 overflow-y-auto space-y-2 mb-6 border border-zinc-100 rounded-xl p-2">
                                   {FOOD_DATABASE.filter(f => f.nom.toLowerCase().includes(foodSearchQuery.toLowerCase())).map(food => (
                                      <div key={food.id} onClick={() => setSelectedFoodDB(food)} className="p-3 bg-white hover:bg-zinc-50 rounded-lg cursor-pointer flex justify-between items-center transition-colors">
                                         <div>
                                            <p className="font-bold text-sm">{food.nom}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black">{food.categorie}</p>
                                         </div>
                                         <span className="text-xs font-black text-[#39FF14] bg-black px-2 py-1 rounded">+{food.valeurs_pour_100g.calories} kcal/100g</span>
                                      </div>
                                   ))}
                                   {FOOD_DATABASE.filter(f => f.nom.toLowerCase().includes(foodSearchQuery.toLowerCase())).length === 0 && (
                                      <p className="text-xs text-zinc-400 text-center p-4 font-bold">Aucun aliment trouvé. Essayez autre chose.</p>
                                   )}
                                </div>
                             )}

                             {selectedFoodDB && (
                                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-6 animate-in fade-in">
                                   <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-black text-lg">{selectedFoodDB.nom}</h4>
                                      <div className="flex gap-2 items-center">
                                         <button onClick={() => toggleFavorite(selectedFoodDB)} className={`p-2 rounded-full transition-colors ${favoriteMeals.some(f => (f.meal || f.nom) === selectedFoodDB.nom) ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-400 hover:text-red-500'}`}>
                                            <HeartPulse size={16} className={favoriteMeals.some(f => (f.meal || f.nom) === selectedFoodDB.nom) ? "fill-current" : ""} />
                                         </button>
                                         <button onClick={() => setSelectedFoodDB(null)} className="text-xs font-bold text-zinc-400 hover:text-black">Changer</button>
                                      </div>
                                   </div>
                                   
                                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Quantité consommée</label>
                                   <div className="flex items-center gap-4 mb-6">
                                      <select value={foodQuantity} onChange={e => setFoodQuantity(parseFloat(e.target.value))} className="w-24 p-3 bg-white border border-zinc-200 rounded-xl font-bold outline-none">
                                         <option value={0.5}>0.5</option>
                                         <option value={1}>1</option>
                                         <option value={1.5}>1.5</option>
                                         <option value={2}>2</option>
                                         <option value={3}>3</option>
                                      </select>
                                      <span className="text-sm font-bold text-zinc-600 flex-1">x {selectedFoodDB.portion_standard_nom} <br/><span className="text-xs text-zinc-400">({selectedFoodDB.portion_standard_grammes * foodQuantity}g)</span></span>
                                   </div>

                                   <div className="grid grid-cols-4 gap-2 text-center">
                                      <div className="bg-orange-50 p-2 rounded-xl border border-orange-100"><p className="text-[9px] font-black uppercase text-orange-400">Kcal</p><p className="font-black text-orange-600">{Math.round((selectedFoodDB.valeurs_pour_100g.calories * selectedFoodDB.portion_standard_grammes * foodQuantity) / 100)}</p></div>
                                      <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100"><p className="text-[9px] font-black uppercase text-yellow-500">Gluc</p><p className="font-black text-yellow-700">{Math.round((selectedFoodDB.valeurs_pour_100g.glucides * selectedFoodDB.portion_standard_grammes * foodQuantity) / 100)}g</p></div>
                                      <div className="bg-green-50 p-2 rounded-xl border border-green-100"><p className="text-[9px] font-black uppercase text-green-500">Prot</p><p className="font-black text-green-700">{Math.round((selectedFoodDB.valeurs_pour_100g.proteines * selectedFoodDB.portion_standard_grammes * foodQuantity) / 100)}g</p></div>
                                      <div className="bg-zinc-100 p-2 rounded-xl border border-zinc-200"><p className="text-[9px] font-black uppercase text-zinc-400">Lip</p><p className="font-black text-zinc-600">{Math.round((selectedFoodDB.valeurs_pour_100g.lipides * selectedFoodDB.portion_standard_grammes * foodQuantity) / 100)}g</p></div>
                                   </div>
                                </div>
                             )}

                             <button 
                                disabled={!selectedFoodDB}
                                onClick={() => {
                                   if(selectedFoodDB) {
                                      const factor = (selectedFoodDB.portion_standard_grammes * foodQuantity) / 100;
                                      confirmMealLog(
                                         selectedFoodDB.nom,
                                         selectedFoodDB.valeurs_pour_100g.calories * factor,
                                         selectedFoodDB.valeurs_pour_100g.proteines * factor,
                                         selectedFoodDB.valeurs_pour_100g.glucides * factor,
                                         selectedFoodDB.valeurs_pour_100g.lipides * factor,
                                         selectedFoodDB
                                      );
                                   }
                                }} 
                                className={`w-full py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl flex justify-center items-center gap-2 transition-all ${selectedFoodDB ? 'bg-black text-[#00E5FF] hover:scale-[1.02]' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                             >
                                <CheckCircle size={20} /> Ajouter au tracker
                             </button>
                         </>
                     )}
                  </div>
               </div>
            )}

          </div>
        )}

        {/* VUE COACHING */}
        {activeTab === 'coaching' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}><Activity className="text-[#39FF14] bg-black p-2 rounded-xl" size={36}/> Coaching Personnel</h2>
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8">
                   <h3 className="font-black text-lg text-blue-800 mb-2">Besoin d'un accompagnement sur-mesure ?</h3>
                   <p className="text-sm font-medium text-blue-700">Prenez rendez-vous avec l'un de nos experts en nutrition pour adapter votre programme, surmonter un blocage ou poser vos questions.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl flex flex-col justify-between hover:border-black transition-colors">
                      <div>
                         <div className="w-12 h-12 bg-black text-[#39FF14] rounded-full flex items-center justify-center mb-4"><Clock size={20}/></div>
                         <h4 className="font-black uppercase text-sm mb-2">Bilan 15 min (Gratuit)</h4>
                         <p className="text-xs text-zinc-500 font-medium mb-4">Inclus dans votre abonnement Premium. Idéal pour un ajustement rapide de votre plan.</p>
                      </div>
                      <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite réserver mon bilan gratuit de 15min avec un coach.', '_blank')} className="w-full bg-black text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors">Réserver</button>
                   </div>

                   <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden hover:border-[#39FF14] transition-colors">
                      <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Recommandé</div>
                      <div>
                         <div className="w-12 h-12 bg-black text-[#39FF14] rounded-full flex items-center justify-center mb-4"><Target size={20}/></div>
                         <h4 className="font-black uppercase text-sm mb-2">Consultation Complète (45 min)</h4>
                         <p className="text-xs text-zinc-500 font-medium mb-4">Analyse approfondie, refonte du plan alimentaire et stratégies avancées.</p>
                      </div>
                      <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite réserver une consultation complète de 45min (10.000F).', '_blank')} className="w-full bg-[#39FF14] text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">Réserver (10.000 F)</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
            
            {/* BADGES ET GAMIFICATION */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                  <h3 className="text-lg font-black uppercase text-black mb-2 flex items-center gap-2"><Award className="text-yellow-500" size={24}/> Badges & Récompenses</h3>
                  <p className="text-sm text-zinc-500 font-medium mb-4">Cumulez des jours parfaits (suivi du menu et hydratation) pour débloquer des trophées.</p>
                  <div className="flex gap-2">
                     {Array.from({length: 7}, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        const dateStr = d.toISOString().split('T')[0];
                        const log = (Array.isArray(dailyLogs) ? dailyLogs : []).find(l => l.log_date === dateStr);
                        const isPerfect = log?.report_data?.followedMenu && log?.water_glasses >= 6;
                        return (
                           <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${isPerfect ? 'bg-[#39FF14] text-black shadow-sm' : 'bg-zinc-100 text-zinc-400'}`}>
                              {d.toLocaleDateString('fr-FR', {weekday:'narrow'})}
                           </div>
                        );
                     })}
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center min-w-[120px] transition-all ${(Array.isArray(dailyLogs) ? dailyLogs : []).filter(l => l.report_data?.followedMenu && l.water_glasses >= 6).length >= 5 ? 'bg-yellow-50 border-yellow-400 text-yellow-600 shadow-md scale-105' : 'bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60'}`}>
                     <Award size={36} className="mb-2" />
                     <span className="text-[10px] font-black uppercase text-center leading-tight">Semaine<br/>Parfaite</span>
                  </div>
               </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-8`}>
                  <BarChart className="text-[#39FF14]" /> Évolution sur 7 jours
               </h2>
               
               <div className="grid md:grid-cols-2 gap-8">
                  {/* GRAPHIQUE : Hydratation */}
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                     <h3 className="text-sm font-black uppercase text-zinc-500 mb-6 flex items-center gap-2"><Droplet size={16}/> Hydratation (Verres)</h3>
                     <div className="flex items-end justify-between h-40 gap-2">
                        {Array.from({length: 7}, (_, i) => {
                           const d = new Date();
                           d.setDate(d.getDate() - (6 - i));
                           const dateStr = d.toISOString().split('T')[0];
                           const log = (Array.isArray(dailyLogs) ? dailyLogs : []).find(l => l.log_date === dateStr);
                           const count = log?.water_glasses || 0;
                           const heightPct = Math.min((count / 8) * 100, 100);
                           return (
                              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                 <div className="w-full max-w-[30px] bg-blue-500 rounded-t-lg transition-all duration-500 relative group-hover:bg-blue-400" style={{ height: `${heightPct}%`, minHeight: '4px' }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                       {count} verres
                                    </div>
                                 </div>
                                 <span className="mt-3 text-[10px] font-bold text-zinc-400 uppercase">{d.toLocaleDateString('fr-FR', {weekday:'short'})}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* GRAPHIQUE : Calories */}
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                     <h3 className="text-sm font-black uppercase text-zinc-500 mb-6 flex items-center gap-2"><Flame size={16}/> Calories Consommées</h3>
                     <div className="flex items-end justify-between h-40 gap-2">
                        {Array.from({length: 7}, (_, i) => {
                           const d = new Date();
                           d.setDate(d.getDate() - (6 - i));
                           const dateStr = d.toISOString().split('T')[0];
                           const log = (Array.isArray(dailyLogs) ? dailyLogs : []).find(l => l.log_date === dateStr);
                           const count = log?.calories_consumed || 0;
                           const target = calorieGoal;
                           const heightPct = count > 0 ? Math.min((count / target) * 100, 100) : 0;
                           return (
                              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                 <div className={`w-full max-w-[30px] rounded-t-lg transition-all duration-500 relative ${count > target ? 'bg-red-500 group-hover:bg-red-400' : 'bg-orange-500 group-hover:bg-orange-400'}`} style={{ height: `${heightPct}%`, minHeight: '4px' }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                       {count} kcal
                                    </div>
                                 </div>
                                 <span className="mt-3 text-[10px] font-bold text-zinc-400 uppercase">{d.toLocaleDateString('fr-FR', {weekday:'short'})}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>

            {/* LISTE DES BILANS */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                 <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3`}><ListChecks className="text-black"/> Historique des Bilans</h2>
                 <button onClick={downloadHistoryPDF} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md flex items-center gap-2">
                    <Download size={14}/> Exporter (PDF)
                 </button>
               </div>
               <div className="space-y-4">
                  {[...(Array.isArray(dailyLogs) ? dailyLogs : [])].filter(l => l && l.log_date && !isNaN(new Date(l.log_date).getTime())).sort((a,b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()).map((log, idx) => (
                     <div key={idx} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                           <p className="font-black text-sm text-black mb-1">{new Date(log.log_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                           <div className="flex flex-wrap gap-2 mt-2">
                              {log.report_data?.followedMenu ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">Menu suivi</span> : <span className="bg-zinc-200 text-zinc-600 px-2 py-1 rounded text-[10px] font-black uppercase">Non suivi</span>}
                              {log.report_data?.drankWater ? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase">Eau respectée</span> : null}
                              {log.report_data?.cravedRice ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black uppercase">Craquage</span> : null}
                           </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-bold text-zinc-500">
                           <span className="flex items-center gap-1"><Flame size={14}/> {log.calories_consumed || 0} kcal</span>
                           <span className="flex items-center gap-1"><Droplet size={14}/> {log.water_glasses || 0}/8</span>
                        </div>
                     </div>
                  ))}
                  {(!Array.isArray(dailyLogs) || dailyLogs.length === 0) && (
                     <p className="text-sm text-zinc-500 font-medium italic">Aucun bilan enregistré pour le moment.</p>
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'week' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            
            {/* SECTION SMART PLANNER (Générateur) */}
            <section>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-3">
                     <Calendar className="text-[#39FF14] bg-black p-2 rounded-lg" size={36} />
                     <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Smart Planner</h2>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={generateWeeklyMenu} className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 transition shadow-sm flex items-center gap-2">
                        <RefreshCcw size={14}/> Regénérer
                     </button>
                     <button onClick={() => setShowGroceryList(true)} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition shadow-sm flex items-center gap-2">
                        <ShoppingCart size={14}/> Liste de courses
                     </button>
                  </div>
               </div>

               {clientProfile?.plan_type !== 'premium' && daysLeft <= 0 ? (
                  <div className="bg-white border-2 border-dashed border-zinc-300 rounded-[2rem] p-12 text-center relative overflow-hidden">
                     <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={28} />
                     </div>
                     <h3 className="font-black uppercase text-xl text-black mb-2">Générateur Verrouillé</h3>
                     <p className="text-sm font-medium text-zinc-500 mb-6 max-w-md mx-auto">Votre période d'essai est terminée. Passez au plan Premium pour réactiver le Smart Planner et votre liste de courses automatique.</p>
                     <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite passer au plan Premium !', '_blank')} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 mx-auto">
                        <Sparkles size={16}/> Passer Premium
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {weeklyGeneratedMenu.map((dayPlan, dIdx) => (
                        <div key={dIdx} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition-colors group">
                           <h3 className="font-black uppercase tracking-widest text-sm mb-4 border-b border-zinc-100 pb-2 text-zinc-600">{dayPlan.day}</h3>
                           <div className="space-y-3">
                              {Object.entries(dayPlan?.meals || {}).map(([mealType, recipe]: any) => {
                                 if (!recipe) return null;
                                 return (
                                    <div key={mealType} className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 relative pr-10 hover:border-[#39FF14] transition-colors">
                                       <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">{mealType}</p>
                                       <p className="text-xs font-bold text-black leading-tight mb-1">{recipe.nom}</p>
                                       <div className="flex gap-2 items-center">
                                          <span className="text-[10px] font-bold text-orange-500">{recipe.calories} kcal</span>
                                          {recipe.is_bol_commun && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Bol Commun</span>}
                                       </div>
                                       <button onClick={() => handleSwapMeal(dIdx, mealType, recipe.id)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors p-1" title="Changer ce repas">
                                          <RefreshCcw size={14}/>
                                       </button>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>

            {/* SECTION MENUS DE LA SEMAINE */}
            <section className="mt-12">
               <div className="flex items-center gap-3 mb-8">
                  <Calendar className="text-[#39FF14] bg-black p-2 rounded-lg" size={36} />
                  <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Vos Menus Sur-Mesure</h2>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {weeklyMenus.map((menu: any, idx: number) => (
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       key={menu.week} 
                       className={`relative border-2 rounded-[2rem] p-8 transition-all overflow-hidden ${menu.status === 'unlocked' ? 'bg-white border-zinc-200 hover:border-black shadow-sm' : 'bg-zinc-100 border-dashed border-zinc-300'}`}
                     >
                        {menu.status === 'locked' && (
                           <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                              <div className="w-16 h-16 bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                 <Lock size={28} />
                              </div>
                              <h3 className="font-black uppercase text-lg text-black mb-2">Semaine Verrouillée</h3>
                              <p className="text-xs font-bold text-zinc-500 mb-6">Passez au plan Premium pour débloquer la suite de votre programme.</p>
                           </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 ${menu.status === 'unlocked' ? 'bg-[#39FF14]/20 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                 Semaine {menu.week}
                              </span>
                              <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase text-black`}>{menu.title}</h3>
                           </div>
                           {menu.status === 'unlocked' && <CheckCircle className="text-[#39FF14]" size={24} />}
                        </div>
                        
                        <p className="text-sm font-medium text-zinc-600 mb-6">{menu.desc}</p>
                        
                        {menu.status === 'unlocked' && (
                           <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-200 pb-2">Aperçu du menu</p>
                              <ul className="space-y-3">
                                 {menu.meals.map((meal: string, i: number) => (
                                    <li key={i} className="text-xs font-bold text-zinc-700 flex items-start gap-2">
                                       <span className="text-[#39FF14] mt-0.5">●</span> {meal}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        )}
                     </motion.div>
                  ))}
               </div>
            </section>

            {/* SECTION GUIDE PDF */}
            <section>
               <div className="bg-white border border-zinc-200 p-8 md:p-10 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:border-[#39FF14] transition-colors">
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="bg-[#39FF14]/10 text-[#39FF14] p-5 rounded-2xl border border-[#39FF14]/20 group-hover:scale-110 transition-transform">
                       <Download size={32} />
                    </div>
                    <div>
                       <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-1`}>Le Guide Complet</h2>
                       <p className="text-zinc-500 font-bold text-sm">Nutrition à l'Africaine : Vos astuces et recettes de base.</p>
                    </div>
                 </div>
                 <button className="w-full md:w-auto bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 relative z-10">
                    Télécharger mon guide (PDF)
                 </button>
               </div>
            </section>

          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-8`}><Settings className="text-black"/> Profil & Réglages</h2>
                
                <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
                   <div className="flex items-center gap-6 mb-8">
                      <img src={profileForm.avatar_url || "https://ui-avatars.com/api/?name=" + (profileForm.full_name || "M")} className="w-24 h-24 rounded-full object-cover border-4 border-zinc-100 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={handleChangeAvatar} title="Changer l'avatar par URL" />
                      <div className="flex-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">URL de la photo de profil</label>
                         <input type="url" value={profileForm.avatar_url} onChange={e => setProfileForm({...profileForm, avatar_url: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" placeholder="https://..." />
                      </div>
                   </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Nom complet</label>
                      <input type="text" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" required />
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Nouveau mot de passe</label>
                      <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" placeholder="Laissez vide pour ne pas modifier" />
                   </div>
                </div>

                   <button type="submit" className="bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition shadow-lg flex items-center gap-2">
                      <Save size={16} /> Enregistrer les modifications
                   </button>
                </form>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                   <h3 className="text-lg font-black uppercase text-black mb-4 flex items-center gap-2"><Target className="text-[#39FF14]"/> Mes Objectifs</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                         <span className="text-sm font-bold text-zinc-500">Objectif Calories</span>
                         <span className="font-black text-black">{calorieGoal} kcal / jour</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                         <span className="text-sm font-bold text-zinc-500">Objectif Protéines</span>
                         <span className="font-black text-black">{proteinGoal} g / jour</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-zinc-500">Hydratation</span>
                         <span className="font-black text-black">8 verres / jour</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                   <h3 className="text-lg font-black uppercase text-black mb-4 flex items-center gap-2"><MessageCircle className="text-blue-500"/> Échange & Support</h3>
                   <p className="text-sm font-medium text-zinc-600 mb-6">Rejoignez notre communauté bienveillante pour partager vos repas, vos victoires et vos questions avec les coachs.</p>
                   <div className="space-y-3">
                      <button onClick={() => window.open('https://chat.whatsapp.com/', '_blank')} className="w-full bg-[#25D366] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#1ebd58] transition shadow-md flex justify-center items-center gap-2">
                         Communauté WhatsApp
                      </button>
                      <button onClick={() => window.open('https://facebook.com/groups/', '_blank')} className="w-full bg-[#1877F2] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#155fc0] transition shadow-md flex justify-center items-center gap-2">
                         Groupe Facebook Privé
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm mt-8">
                <h3 className="text-lg font-black uppercase text-black mb-4 flex items-center gap-2"><Download className="text-[#39FF14]"/> Historique des Téléchargements PDF</h3>
                {Array.isArray(pdfHistory) && pdfHistory.length > 0 ? (
                   <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {pdfHistory.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                            <div>
                               <p className="font-bold text-sm text-black">{item.type}</p>
                               <p className="text-[10px] font-black uppercase text-zinc-500">{item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Date inconnue'}</p>
                            </div>
                            {item.url ? (
                               <a href={item.url} target="_blank" rel="noopener noreferrer" className="bg-black text-[#39FF14] px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-transform flex items-center gap-2 w-max">
                                  <ExternalLink size={14}/> Ouvrir
                               </a>
                            ) : (
                               <span className="bg-zinc-200 text-zinc-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase w-max">Local</span>
                            )}
                         </div>
                      ))}
                   </div>
                ) : (
                   <p className="text-sm font-medium text-zinc-500 italic">Aucun PDF téléchargé ou partagé pour le moment.</p>
                )}
             </div>
          </div>
        )}
      </div>

      {/* FLOATING REMINDER */}
      {showReminder && (
         <div className="fixed bottom-6 right-6 z-[100] bg-black text-white p-4 rounded-2xl shadow-2xl border-l-4 border-red-500 max-w-sm flex items-start gap-4 animate-in slide-in-from-right-8">
            <AlertCircle className="text-red-500 shrink-0" size={24} />
            <div>
               <h4 className="font-black uppercase text-sm mb-1">Bilan en attente !</h4>
               <p className="text-xs text-zinc-400 font-medium mb-3">Il est plus de 20h00, n'oubliez pas de remplir votre bilan de fin de journée pour adapter votre menu de demain.</p>
               <div className="flex gap-2">
                  <button onClick={() => { setShowReminder(false); setActiveTab('today'); setShowDailyReport(true); }} className="bg-[#39FF14] text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-transform hover:scale-105">Remplir maintenant</button>
                  <button onClick={() => setShowReminder(false)} className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg font-bold text-[10px] uppercase">Plus tard</button>
               </div>
            </div>
         </div>
      )}

      {/* MODALE LISTE DE COURSES */}
      {showGroceryList && (
         <div id="grocery-overlay" onClick={(e: any) => e.target.id === 'grocery-overlay' && setShowGroceryList(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-2xl w-full relative shadow-2xl border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
               <button onClick={() => setShowGroceryList(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter mb-2 flex items-center gap-3`}><ShoppingCart size={32} className="text-[#39FF14]" /> Liste de Courses</h2>
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Générée automatiquement d'après votre menu</p>

               <div className="space-y-8">
                  {Object.entries(getGroceryList()).map(([rayon, items]: any) => {
                     if (Object.keys(items).length === 0) return null;
                     return (
                        <div key={rayon}>
                           <h4 className="font-black uppercase text-sm mb-3 text-black bg-zinc-100 p-3 rounded-xl border border-zinc-200">{rayon}</h4>
                           <ul className="grid md:grid-cols-2 gap-x-6 gap-y-3 px-2">
                              {Object.entries(items).map(([nom, data]: any) => {
                                 const isExcluded = excludedIngredients.includes(nom);
                                 return (
                                 <li key={nom} className="flex items-center justify-between text-sm font-medium border-b border-zinc-100 pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                       <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isExcluded ? 'bg-[#39FF14] border-[#39FF14]' : 'bg-white border-zinc-300 group-hover:border-black'}`}>
                                          {isExcluded && <CheckCircle size={14} className="text-black" />}
                                       </div>
                                       <input type="checkbox" className="hidden" checked={isExcluded} onChange={() => toggleExcludeIngredient(nom)} />
                                       <span className={isExcluded ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-300'}>{nom}</span>
                                    </label>
                                    <span className={`font-black ${isExcluded ? 'text-zinc-400 line-through' : 'text-black dark:text-white'}`}>{data.quantite} {data.unite}</span>
                                 </li>
                              )})}
                           </ul>
                        </div>
                     );
                  })}
               </div>
               <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button onClick={downloadGroceryListPDF} className="flex-1 bg-zinc-100 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-colors shadow-sm flex items-center justify-center gap-2">
                     <Download size={18}/> Télécharger (Local)
                  </button>
                  <button onClick={shareGroceryListWhatsApp} disabled={isSharingPDF} className="flex-1 bg-[#25D366] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                     {isSharingPDF ? <Loader2 size={18} className="animate-spin"/> : <MessageCircle size={18}/>} Envoyer sur WhatsApp
                  </button>
               </div>
            </div>
         </div>
      )}

        {activeTab === 'favorites' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}><HeartPulse className="text-[#39FF14] bg-black p-2 rounded-xl" size={36}/> Recettes Enregistrées</h2>
                
                <div className="relative mb-6">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Rechercher une recette sauvegardée..." 
                      value={favoriteSearchQuery}
                      onChange={e => setFavoriteSearchQuery(e.target.value)}
                      className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition-colors"
                   />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                   {(Array.isArray(favoriteMeals) ? favoriteMeals : [])
                      .filter(fav => (fav.meal || fav.nom || '').toLowerCase().includes(favoriteSearchQuery.toLowerCase()))
                      .map((fav, i) => {
                       const isDBFood = !!fav.valeurs_pour_100g;
                       const name = fav.meal || fav.nom;
                       const cals = fav.cals || fav.calories || (isDBFood ? fav.valeurs_pour_100g.calories : 0);
                       const prots = fav.proteins || (isDBFood ? fav.valeurs_pour_100g.proteines : 0);
                       return (
                       <div key={i} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col justify-between hover:border-[#39FF14] transition-colors group">
                           <div>
                               <div className="flex justify-between items-start mb-2">
                                   <p className="font-bold text-sm text-black">{name}</p>
                                   <button onClick={() => toggleFavorite(fav)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={16}/></button>
                               </div>
                               <div className="flex gap-3 text-[10px] font-black uppercase text-zinc-500 mb-4">
                                   <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500"/> {cals} kcal</span>
                                   <span className="flex items-center gap-1"><Target size={12} className="text-[#39FF14]"/> {prots}g prot</span>
                               </div>
                           </div>
                           <button onClick={() => {
                               if(isDBFood) {
                                   setSelectedFoodDB(fav);
                                   setFoodSearchQuery(fav.nom);
                                   setActiveTab('today');
                                   setSelectedMealModal({ type: 'Collation', mode: 'flexible' });
                               } else {
                                   confirmMealLog(name, cals, prots, fav.carbs || 0, fav.fats || 0, fav);
                                   alert("Ajouté au tracker du jour !");
                               }
                           }} className="w-full bg-zinc-200 text-black py-3 rounded-xl text-[10px] font-black uppercase hover:bg-black hover:text-[#39FF14] transition-all flex justify-center items-center gap-2">
                               <CheckCircle size={14}/> Ajouter au menu du jour
                           </button>
                       </div>
                   )})}
                   {(!Array.isArray(favoriteMeals) || favoriteMeals.length === 0) ? (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                         <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Aucune recette sauvegardée.</p>
                         <p className="text-zinc-400 text-xs mt-1">Utilisez le bouton "Cœur" sur un plat pour le retrouver ici.</p>
                      </div>
                   ) : (favoriteMeals.filter(fav => (fav.meal || fav.nom || '').toLowerCase().includes(favoriteSearchQuery.toLowerCase())).length === 0) && (
                      <div className="col-span-full py-8 text-center text-zinc-500 font-bold">Aucune recette ne correspond à votre recherche.</div>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* VUE BOUTIQUE */}
        {activeTab === 'shop' && (
           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              {/* BANNIÈRE HORIZONTALE DYNAMIQUE */}
              <div className="w-full h-48 md:h-64 rounded-[2.5rem] overflow-hidden mb-12 shadow-xl relative border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                 <img src={shopBannerUrl} alt="Bannière Boutique" className="absolute inset-0 w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-10">
                     <h2 className={`${spaceGrotesk.className} text-white text-3xl md:text-5xl font-black uppercase tracking-tighter shadow-sm mb-2`}>Essentiels <span className="text-[#39FF14]">Nutrition</span></h2>
                     <p className="text-zinc-300 font-bold uppercase tracking-widest text-[10px] md:text-xs">Atteignez vos objectifs plus vite.</p>
                 </div>
                 {shopCart.length > 0 && (
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-3 z-10 bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                        <button onClick={() => setShowCartModal(true)} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition shadow-[0_0_40px_#39FF14] flex items-center gap-3">
                           <ShoppingCart size={20}/> Voir mon Panier ({shopCart.length})
                        </button>
                     </div>
                 )}
              </div>

              {/* CAROUSEL NOUVEAUTÉS */}
              <div className="mb-16">
                 <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2 text-black dark:text-white`}><Sparkles className="text-[#39FF14]"/> Nouveautés de la semaine</h3>
                 <div className="overflow-hidden" ref={emblaShopRef}>
                    <div className="flex gap-4">
                       {(Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || []).sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 6).map(product => (
                          <div key={product.id} onClick={() => openProductModal(product)} className={`flex-[0_0_auto] w-64 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border rounded-[2rem] p-4 cursor-pointer hover:border-[#39FF14] transition-all group shadow-sm mr-4`}>
                           <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-950 overflow-hidden mb-4 relative">
                              <img src={product.image_url} alt={product.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <span className="absolute top-2 right-2 bg-black text-[#39FF14] px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest shadow-lg">New</span>
                                 {product.stock <= 10 && <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">Quantité Limitée</span>}
                           </div>
                           <h4 className="font-black text-sm uppercase text-black dark:text-white line-clamp-1">{product.nom}</h4>
                           <p className="text-[#39FF14] font-black text-lg mt-2">{product.prix_premium.toLocaleString()} F</p>
                       </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* FILTRES & RECHERCHE */}
              <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
                 <div className="relative flex-1 w-full">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                     <input type="text" placeholder="Rechercher un produit..." value={shopSearchQuery} onChange={e=>setShopSearchQuery(e.target.value)} className={`w-full p-4 pl-12 rounded-2xl font-bold text-sm outline-none transition-colors border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#39FF14]' : 'bg-white border-zinc-200 text-black focus:border-black'}`} />
                 </div>
                 <div className={`flex gap-3 items-center p-2 px-4 rounded-2xl border w-full md:w-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                     <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Prix Max:</span>
                     <input type="range" min="0" max="50000" step="1000" value={shopMaxPrice || 50000} onChange={e=>setShopMaxPrice(Number(e.target.value))} className="w-24 md:w-32 accent-[#39FF14] cursor-pointer" />
                     <input type="number" placeholder="Max" value={shopMaxPrice} onChange={e=>setShopMaxPrice(e.target.value?Number(e.target.value):"")} className={`w-20 p-2 rounded-lg text-sm font-bold outline-none text-center ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`} />
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <button onClick={() => setSelectedShopGoal('all')} className={`p-2 rounded-xl border-2 font-black uppercase text-[8px] tracking-widest transition-all ${selectedShopGoal === 'all' ? 'bg-black text-[#39FF14] border-black' : 'bg-white border-zinc-100 text-zinc-400'}`}>Tous</button>
                 {SHOP_GOALS.map(goal => (
                    <button key={goal.id} onClick={() => setSelectedShopGoal(goal.id)} className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-black uppercase text-[8px] tracking-widest transition-all ${selectedShopGoal === goal.id ? 'bg-black text-[#39FF14] border-black shadow-xl' : 'bg-white border-zinc-100 text-zinc-400'}`}>
                       <span className="text-base">{goal.icon}</span> {goal.label}
                    </button>
                 ))}
              </div>

              <div id="shop-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {(Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || [])
                    .filter(p => {
                        const matchSearch = !shopSearchQuery || p.nom?.toLowerCase().includes(shopSearchQuery.toLowerCase());
                        const matchMin = shopMinPrice === "" || p.prix_standard >= shopMinPrice;
                        const matchMax = shopMaxPrice === "" || p.prix_standard <= shopMaxPrice;
                        const matchGoal = selectedShopGoal === 'all' || (selectedShopGoal === 'saved' ? savedShopProducts.some((sp: any) => sp.id === p.id) : p.goal === selectedShopGoal);
                        return matchSearch && matchMin && matchMax && matchGoal;
                    })
                    .map(product => (
                       <div key={product.id} className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border rounded-[2.5rem] p-6 flex flex-col hover:border-[#39FF14] transition-all hover:shadow-2xl group`}>
                          <div className="relative aspect-square rounded-[2rem] bg-zinc-50 overflow-hidden mb-6 cursor-pointer" onClick={() => openProductModal(product)}>
                             <img src={product.image_url} alt={product.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                             {product.badge && <span className="absolute top-4 right-4 bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">{product.badge}</span>}
                             {product.stock <= 10 && <span className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">Quantité Limitée</span>}
                          </div>
                          <h4 className="font-black text-lg uppercase text-black mb-4 line-clamp-1">{product.nom}</h4>
                          <div className="flex flex-col gap-1 mb-8">
                             <p className="text-zinc-400 text-sm font-bold line-through">{product.prix_standard.toLocaleString()} F</p>
                             <p className="text-2xl font-black text-[#39FF14] bg-black px-4 py-1 rounded-xl w-max italic">{product.prix_premium.toLocaleString()} F</p>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => addToCart(product)} className="flex-1 bg-black text-white hover:bg-[#39FF14] hover:text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2">
                                <ShoppingCart size={16}/> Au panier
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); toggleSaveProduct(product); }} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${savedShopProducts.some((sp: any) => sp.id === product.id) ? 'border-red-500 bg-red-50 text-red-500' : 'border-zinc-200 bg-white text-zinc-400 hover:border-red-500 hover:text-red-500'}`}>
                                <Heart size={18} className={savedShopProducts.some((sp: any) => sp.id === product.id) ? 'fill-current' : ''} />
                             </button>
                          </div>
                       </div>
                    ))}
              </div>

              <div className="mt-20 pt-12 border-t border-zinc-100">
                 <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3`}><BookOpen className="text-[#39FF14]"/> Nos Conseils Bien-être</h3>
                 <div className="grid md:grid-cols-2 gap-8">
                    {[
                      { title: "Réussir ses pancakes d'avoine ?", desc: "L'astuce pour une texture parfaite sans farine de blé. Idéal avec notre pâte d'arachide pure.", link: "prod_011" },
                      { title: "Pourquoi le Fonio est indispensable ?", desc: "Découvrez pourquoi cette céréale millénaire est le secret d'un ventre plat durable.", link: "prod_001" }
                    ].map((article, idx) => (
                       <div key={idx} className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col">
                          <h4 className="font-black text-lg uppercase mb-3 text-[#39FF14]">{article.title}</h4>
                          <p className="text-sm text-zinc-400 font-medium mb-6 flex-1">{article.desc}</p>
                          <button onClick={() => { setSelectedShopGoal('all'); document.getElementById('shop-grid')?.scrollIntoView({behavior:'smooth'}); }} className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-max hover:bg-[#39FF14] transition-colors">Acheter les ingrédients</button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* MODALE PRODUIT DÉTAILLÉ */}
        <AnimatePresence>
           {selectedProduct && (
              <div id="product-overlay" onClick={(e: any) => e.target.id === 'product-overlay' && setSelectedProduct(null)} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
                 <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
                    <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-20"><X size={20}/></button>
                    <div className="w-full md:w-1/2 bg-zinc-50 flex items-center justify-center p-12">
                       <img src={selectedProduct.image_url} alt={selectedProduct.nom} className="max-w-full h-auto object-contain drop-shadow-2xl" />
                    </div>
                    <div className="flex-1 p-10 flex flex-col text-black">
                       <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-max">Zoom Produit</span>
                       <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">{selectedProduct.nom}</h2>
                       <div className="flex items-center gap-4 mb-4 text-zinc-500 font-bold text-sm">
                           <span className="flex items-center gap-1"><Eye size={16}/> {selectedProduct.views || 0} vues</span>
                       </div>
                       <p className="text-zinc-500 font-medium leading-relaxed mb-8">{selectedProduct.description_longue}</p>
                       <div className="space-y-3 mb-10">
                          <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={18} className="text-[#39FF14]"/> 🌱 100% Naturel : Sans conservateurs.</div>
                          <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={18} className="text-[#39FF14]"/> 🇸🇳 Fabrication locale : Coopératives de femmes.</div>
                          <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={18} className="text-[#39FF14]"/> 📦 Livraison rapide : Dakar en 24h.</div>
                       </div>
                       <div className="mt-auto pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div>
                             <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Prix Premium</p>
                             <p className="text-4xl font-black text-black">{selectedProduct.prix_premium.toLocaleString()} F</p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                             <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-1 sm:flex-none bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><ShoppingCart size={18}/> Ajouter au panier</button>
                             <button onClick={() => handleShareProduct(selectedProduct)} className="bg-zinc-100 text-black p-5 rounded-2xl hover:bg-zinc-200 transition-colors shadow-sm"><Share2 size={18}/></button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

        {/* VUE TRACKER DE POIDS */}
        {activeTab === 'weight' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 max-w-4xl mx-auto">
             <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} p-8 sm:p-12 rounded-[2rem] border shadow-sm text-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 blur-[50px] rounded-full pointer-events-none"></div>
                <Scale size={32} className="mx-auto mb-4 text-[#39FF14]" />
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'} mb-2`}>Tracker de Poids</h2>
                <p className="text-zinc-500 font-bold mb-6 text-xs max-w-sm mx-auto">Une pesée par semaine, pas plus. La constance bat l'obsession. Ajustez le curseur et validez.</p>
                
                <div className={`max-w-md mx-auto ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100'} p-8 rounded-[2.5rem] border mb-10 shadow-inner`}>
                   <p className={`text-7xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'} mb-8 tracking-tighter`}>{currentWeightInput} <span className="text-2xl text-zinc-400">kg</span></p>
                   <input 
                      type="range" min="40" max="150" step="0.5" 
                      value={currentWeightInput} 
                      onChange={e => setCurrentWeightInput(parseFloat(e.target.value))}
                      className="w-full accent-[#39FF14] h-3 bg-zinc-300 dark:bg-zinc-600 rounded-full appearance-none cursor-pointer mb-8"
                   />
                   <button onClick={handleSaveWeight} className="w-full bg-black dark:bg-white text-[#39FF14] dark:text-black py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-xl">
                       Enregistrer ma pesée
                   </button>
                </div>

                {Array.isArray(weightLogs) && weightLogs.length > 0 && (
                   <div className="h-72 w-full mt-10 pt-8 border-t border-zinc-100">
                     <h3 className="text-left font-black uppercase text-sm text-zinc-400 tracking-widest mb-6">Évolution</h3>
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={weightLogs.filter(l => l && l.log_date && !isNaN(new Date(l.log_date).getTime()))}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                         <XAxis dataKey="log_date" tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})} stroke="#a1a1aa" fontSize={10} axisLine={false} tickLine={false} />
                         <YAxis domain={['auto', 'auto']} stroke="#a1a1aa" fontSize={10} axisLine={false} tickLine={false} />
                         <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                         <Line type="monotone" dataKey="weight" stroke="#39FF14" strokeWidth={4} dot={{ r: 6, fill: '#000', stroke: '#39FF14', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* VUE COMMUNAUTÉ (FEED) */}
        {activeTab === 'community' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-3xl mx-auto">
             <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                     <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3`}><Camera className="text-[#39FF14]" /> Le Mur des Assiettes</h2>
                     <p className="text-zinc-500 text-sm font-bold">Partagez vos repas sains avec la communauté Premium Onyx.</p>
                  </div>
                  <button onClick={openLeaderboard} className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-1 shadow-sm border border-yellow-200 shrink-0">
                     <Trophy size={14}/> Classement
                  </button>
                </div>
                
                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl focus-within:border-black transition-colors">
                   {newPostImage && (
                       <div className="relative w-24 h-24 mb-3 rounded-xl overflow-hidden border border-zinc-200">
                          <img src={newPostImage} className="w-full h-full object-cover" />
                          <button onClick={() => setNewPostImage(null)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500"><X size={12}/></button>
                       </div>
                   )}
                   <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Qu'y a-t-il dans votre assiette aujourd'hui ?" className="w-full bg-transparent resize-none outline-none font-medium text-sm min-h-[80px]" />
                   <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-200">
                      <label className="text-zinc-400 hover:text-black transition-colors p-2 cursor-pointer">
                         <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                         {uploadingImage ? <Activity size={20} className="animate-spin" /> : <ImageIcon size={20}/>}
                      </label>
                      <button onClick={handlePostCommunity} className="bg-black text-[#39FF14] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">Publier (+15 XP)</button>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                {(Array.isArray(communityPosts) ? communityPosts : []).map((post, idx) => (
                   <div key={post.id || idx} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 bg-black text-[#39FF14] rounded-full flex items-center justify-center font-black">{post.client?.charAt(0) || 'M'}</div>
                         <div>
                            <p className="font-bold text-sm text-black">{post.client}</p>
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{post.created_at && !isNaN(new Date(post.created_at).getTime()) ? new Date(post.created_at).toLocaleDateString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : 'Récemment'}</p>
                         </div>
                         {post.client === user?.full_name && <span className="ml-auto bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Premium</span>}
                      </div>
                      <p className="text-zinc-700 font-medium text-sm mb-4 leading-relaxed">{post.content}</p>
                      {post.image_url && <img src={post.image_url} alt="Plat" className="w-full h-64 object-cover rounded-2xl mb-4 border border-zinc-100" />}
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
                         <button className="flex items-center gap-1.5 bg-zinc-50 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 transition-colors">🔥 Top {post.reactions?.top > 0 && `(${post.reactions.top})`}</button>
                         <button className="flex items-center gap-1.5 bg-zinc-50 hover:bg-green-50 hover:text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 transition-colors">🥗 Sain {post.reactions?.sain > 0 && `(${post.reactions.sain})`}</button>
                         <button className="flex items-center gap-1.5 bg-zinc-50 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 transition-colors">💪 Courage {post.reactions?.courage > 0 && `(${post.reactions.courage})`}</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

      {/* MODALE LEADERBOARD */}
      {showLeaderboard && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowLeaderboard(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3rem] max-w-2xl w-full relative shadow-[0_0_50px_rgba(57,255,20,0.15)] border-t-[8px] border-yellow-400 animate-in zoom-in-95 my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <button onClick={() => setShowLeaderboard(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all text-zinc-500 z-[60]">
              <X size={20} />
            </button>
            <div className="text-center mb-8 shrink-0">
               <Trophy className="mx-auto mb-3 text-yellow-400" size={40} />
               <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter`}>Classement Jongoma XP</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Les membres les plus assidues de ce mois</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
               {/* PODIUM TOP 3 */}
               <div className="flex items-end justify-center gap-4 mb-10 pt-4">
                  {leaderboardData.length > 1 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="w-12 h-12 rounded-full border-2 border-zinc-300 overflow-hidden mb-2 relative">
                           <img src={leaderboardData[1].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[1].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-zinc-400 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">2</div>
                        </div>
                        <div className="bg-zinc-100 w-20 h-24 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-zinc-300">
                           <span className="text-[10px] font-bold mt-1 text-zinc-500">{leaderboardData[1].xp} XP</span>
                        </div>
                        <p className="text-[10px] font-black uppercase mt-2 text-zinc-600 truncate max-w-[70px]">{leaderboardData[1].full_name.split(' ')[0]}</p>
                     </div>
                  )}
                  {leaderboardData.length > 0 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
                        <div className="w-16 h-16 rounded-full border-4 border-yellow-400 overflow-hidden mb-2 relative shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                           <img src={leaderboardData[0].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[0].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">1</div>
                        </div>
                        <div className="bg-yellow-50 w-24 h-32 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-yellow-400">
                           <span className="text-xs font-black mt-1 text-yellow-600">{leaderboardData[0].xp} XP</span>
                        </div>
                        <p className="text-[11px] font-black uppercase mt-2 text-yellow-600 truncate max-w-[80px]">{leaderboardData[0].full_name.split(' ')[0]}</p>
                     </div>
                  )}
                  {leaderboardData.length > 2 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="w-12 h-12 rounded-full border-2 border-orange-400 overflow-hidden mb-2 relative">
                           <img src={leaderboardData[2].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[2].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-orange-400 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">3</div>
                        </div>
                        <div className="bg-orange-50 w-20 h-20 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-orange-400">
                           <span className="text-[10px] font-bold mt-1 text-orange-600">{leaderboardData[2].xp} XP</span>
                        </div>
                        <p className="text-[10px] font-black uppercase mt-2 text-orange-500 truncate max-w-[70px]">{leaderboardData[2].full_name.split(' ')[0]}</p>
                     </div>
                  )}
               </div>

               {/* LISTE DES AUTRES */}
               <div className="space-y-2">
                  {(Array.isArray(leaderboardData) ? leaderboardData : []).slice(3).map((student, idx) => (
                     <div key={student.id || idx} className={`flex items-center justify-between p-3 rounded-xl border ${student.id === clientProfile?.id ? 'bg-[#39FF14]/10 border-[#39FF14]/50' : 'bg-zinc-50 border-zinc-100'}`}>
                        <div className="flex items-center gap-3">
                           <span className="font-black text-zinc-400 w-4 text-xs">{idx + 4}</span>
                           <img src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.full_name}&background=random`} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-200 object-cover" />
                           <p className={`font-bold text-sm ${student.id === clientProfile?.id ? 'text-[#39FF14]' : 'text-black'}`}>{student.full_name} {student.id === clientProfile?.id ? '(Vous)' : ''}</p>
                        </div>
                        <span className="font-black text-zinc-600 text-xs">{student.xp} XP</span>
                     </div>
                  ))}
               </div>
            </div>
            <div className="pt-6 border-t border-zinc-100 shrink-0">
               <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Salut ! Je te mets au défi de me battre sur le classement Jongoma XP de OnyxNutrition ! Rejoins-moi et voyons qui aura le plus de points cette semaine 🔥💪\n\nhttps://onyxlinks.com/nutrition")}`, '_blank')} className="w-full bg-[#25D366] text-white py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex justify-center items-center gap-2">
                  <MessageCircle size={18}/> Défier une amie sur WhatsApp
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE REFAIRE LE DIAGNOSTIC (ROKHY) */}
      {showRedoDiagModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowRedoDiagModal(false)} className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3rem] max-w-md w-full relative shadow-[0_0_50px_rgba(57,255,20,0.3)] border-t-[8px] border-[#39FF14] animate-in zoom-in-95">
            <button onClick={() => setShowRedoDiagModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
            
            <div className="flex items-center gap-4 mb-6 border-b border-zinc-100 pb-6">
              <div className="relative">
                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781176401/A_portrait_of_the_character_202606111113_jfaetc.jpg" alt="Rokhy" className="w-16 h-16 rounded-full border-2 border-[#39FF14]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#39FF14] border-2 border-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-black uppercase text-xl text-black leading-none">Rokhy</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Coach Nutrition</p>
              </div>
            </div>

            <p className="text-sm font-bold text-zinc-700 mb-6 leading-relaxed">
              Salut ! Je vois que tu souhaites refaire ton bilan. Avant de continuer, dis-moi pourquoi ?
            </p>

            <div className="space-y-3 mb-6">
              {["Je stagne dans ma perte de poids", "J'ai atteint mon objectif !", "Mes mensurations ont changé", "Je veux tester un autre mode"].map(reason => (
                <button key={reason} onClick={() => setRedoReason(reason)} className={`w-full text-left p-4 rounded-xl border-2 font-bold text-xs transition-all ${redoReason === reason ? 'bg-black text-[#39FF14] border-black shadow-md' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}>
                   {reason}
                </button>
              ))}
            </div>

            {redoReason && (
               <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest flex items-center gap-2 mb-1"><AlertTriangle size={14}/> Attention</p>
                  <p className="text-xs font-medium text-orange-800 leading-relaxed">
                     Refaire le diagnostic va <strong>réinitialiser ton plan actuel</strong> et recalculer tes objectifs caloriques. Es-tu sûre de vouloir continuer ?
                  </p>
               </div>
            )}

            <div className="flex gap-3">
               <button onClick={() => setShowRedoDiagModal(false)} className="flex-1 bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-sm">
                  Retour au Hub
               </button>
               <button disabled={!redoReason} onClick={() => router.push('/solutions/onyx-nutritionafricaine/diagnostic')} className="flex-1 bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Continuer <ArrowRight size={14} className="inline ml-1"/>
               </button>
            </div>
          </div>
        </div>
      )}
      {/* MODALE DE PAIEMENT WAVE / OM */}
      {showPaymentModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowPaymentModal(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3rem] max-w-md w-full relative shadow-[0_0_50px_rgba(57,255,20,0.15)] border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto flex flex-col overflow-hidden">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all text-zinc-500 z-[60]">
              <X size={20} />
            </button>
            <div className="text-center mb-8 shrink-0 mt-4">
               <div className="w-20 h-20 bg-black text-[#39FF14] rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-xl"><CreditCard size={32} /></div>
               <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter`}>Renouvellement Premium</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Paiement sécurisé via PayDunya</p>
            </div>
            
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mb-8">
               <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-sm">Abonnement Mensuel</span>
                  <span className="font-black text-xl">2 900 F</span>
               </div>
               <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Prolongez votre accès au Smart Planner, au générateur de listes de courses, et au réseau communautaire privé OnyxNutrition.
               </p>
            </div>

            <div className="space-y-3">
               <button onClick={() => {
                   window.open('https://pay.onyxlinks.com/renew-nutrition', '_blank');
                   if(confirm("Simulation: Avez-vous terminé le paiement Wave/OM ?")) { handleProcessPayment(); }
               }} className="w-full bg-[#1b74e4] text-white py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex justify-center items-center gap-2">
                  Payer avec Wave
               </button>
               <button onClick={() => {
                   window.open('https://pay.onyxlinks.com/renew-nutrition', '_blank');
                   if(confirm("Simulation: Avez-vous terminé le paiement Wave/OM ?")) { handleProcessPayment(); }
               }} className="w-full bg-[#ff6600] text-white py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex justify-center items-center gap-2">
                  Payer avec Orange Money
               </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERVENTION AVATAR ROKHY (IA) */}
      {rokhyMessage && (
         <div className="fixed bottom-6 left-6 z-[110] bg-white p-5 rounded-3xl shadow-2xl border border-zinc-100 max-w-sm flex gap-4 animate-in slide-in-from-bottom-8">
            <div className="relative shrink-0">
               <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781176401/A_portrait_of_the_character_202606111113_jfaetc.jpg" alt="Rokhy Coach IA" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#39FF14] border-2 border-white rounded-full"></div>
            </div>
            <div>
               <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-sm text-black flex items-center gap-2">Rokhy (Coach IA)</h4>
                  <button onClick={() => setRokhyMessage(null)} className="text-zinc-400 hover:text-black"><X size={14}/></button>
               </div>
               <p className={`text-xs font-bold ${rokhyMessage.type === 'warning' ? 'text-orange-600' : 'text-zinc-600'} leading-relaxed`}>{rokhyMessage.text}</p>
            </div>
         </div>
      )}
      
      {/* FOOTER ESPACE CLIENT */}
      <footer className="bg-black text-white py-12 px-6 mt-20 text-center border-t border-zinc-800">
         <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8 text-left">
            <div className="md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                  <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="Onyx Logo" className="h-12 w-auto object-contain opacity-80" />
               </div>
               <p className="text-zinc-500 text-sm max-w-sm mb-6">
                  Le premier écosystème digital pour votre santé. Rééquilibrez votre alimentation selon nos réalités africaines.
               </p>
               <div className="flex items-center gap-4">
                  <MessageCircle size={20} onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="text-zinc-400 hover:text-[#39FF14] cursor-pointer transition-colors"/>
               </div>
            </div>
            <div>
               <h4 className="font-black uppercase text-sm tracking-widest text-zinc-300 mb-6">Liens Utiles</h4>
               <ul className="space-y-4 text-sm text-zinc-500 font-bold">
                  <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#39FF14] transition-colors">Haut de page</button></li>
                  <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#39FF14] transition-colors">Boutique</button></li>
               </ul>
            </div>
         </div>
         <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed border-t border-zinc-800 pt-8">
            Onyx Hub - Nutrition<br/>
            © 2026 Onyx Ops Elite
         </p>
      </footer>

      {/* MODALE PANIER */}
      <AnimatePresence>
         {showCartModal && (
            <div id="cart-modal-overlay" onClick={(e: any) => e.target.id === 'cart-modal-overlay' && setShowCartModal(false)} className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex justify-end animate-in fade-in">
               <motion.div 
                 initial={{ x: '100%' }} 
                 animate={{ x: 0 }} 
                 exit={{ x: '100%' }} 
                 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                 className={`w-full max-w-md h-full ${theme === 'dark' ? 'bg-zinc-950 border-l border-zinc-800' : 'bg-white border-l border-zinc-200'} flex flex-col shadow-2xl relative`}
               >
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                     <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase flex items-center gap-2 text-black dark:text-white`}>
                        <ShoppingCart className="text-[#39FF14]" size={24}/> Mon Panier
                     </h2>
                     <button onClick={() => setShowCartModal(false)} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors">
                        <X size={16}/>
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                     {shopCart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                           <ShoppingBag size={48} className="mb-4 opacity-50"/>
                           <p className="font-bold uppercase tracking-widest text-xs">Votre panier est vide.</p>
                           <button onClick={() => { setShowCartModal(false); setActiveTab('shop'); }} className="mt-6 bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-md">
                              Découvrir la boutique
                           </button>
                        </div>
                     ) : (
                        shopCart.map((item, idx) => (
                           <div key={idx} className={`flex gap-4 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'} relative`}>
                              <div className="w-20 h-20 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800">
                                 <img src={item.image_url} alt={item.nom} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                 <h4 className="font-bold text-sm text-black dark:text-white line-clamp-1">{item.nom}</h4>
                                 <p className="text-[#39FF14] font-black text-sm mt-1">{item.finalPrice.toLocaleString()} F</p>
                              </div>
                              <button onClick={() => setShopCart(shopCart.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors">
                                 <Trash2 size={16}/>
                              </button>
                           </div>
                        ))
                     )}
                  </div>

                  {shopCart.length > 0 && (
                     <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex justify-between items-center mb-6">
                           <span className="font-black text-zinc-500 uppercase tracking-widest text-xs">Total Estimé</span>
                           <span className="font-black text-2xl text-black dark:text-white">
                              {shopCart.reduce((acc, item) => acc + item.finalPrice, 0).toLocaleString()} F
                           </span>
                        </div>
                        <button onClick={() => { setShowCartModal(false); handleShopCheckout(); }} className="w-full bg-black dark:bg-white text-[#39FF14] dark:text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                           <ShoppingCart size={16}/> Commander via WhatsApp
                        </button>
                        {isShopPromoApplied && appliedPromoData ? (
                           <p className="text-center text-[#39FF14] font-black uppercase tracking-widest text-[10px] mt-4">Code {appliedPromoData.code} appliqué !</p>
                        ) : (
                           <div className="mt-4 flex gap-2">
                              <input type="text" placeholder="Code Promo" value={shopPromoCode} onChange={e => setShopPromoCode(e.target.value)} className={`flex-1 p-3 rounded-xl border font-bold text-xs outline-none focus:border-[#39FF14] ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'}`} />
                              <button onClick={applyShopPromo} className="bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-4 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-[#39FF14] hover:text-black transition-colors">
                                 Appliquer
                              </button>
                           </div>
                        )}
                     </div>
                  )}
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </main>
    </div>
  );
}