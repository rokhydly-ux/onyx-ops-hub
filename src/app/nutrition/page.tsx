"use client";
import {X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, Image as ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf , Users} from 'lucide-react';

import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import { useCartStore } from '@/store/useCartStore';

import React, { useState, useEffect, useRef } from "react";

import DashboardTab1 from '@/components/nutrition/tabs/DashboardTab1';
import DashboardTab2 from '@/components/nutrition/tabs/DashboardTab2';
import TodayTab from '@/components/nutrition/tabs/TodayTab';
import WeekTab from '@/components/nutrition/tabs/WeekTab';
import CartTab from '@/components/nutrition/tabs/CartTab';
import OrdersTab1 from '@/components/nutrition/tabs/OrdersTab1';
import ProfileTab from '@/components/nutrition/tabs/ProfileTab';
import FavoritesTab from '@/components/nutrition/tabs/FavoritesTab';
import OrdersTab2 from '@/components/nutrition/tabs/OrdersTab2';
import ShopTab from '@/components/nutrition/tabs/ShopTab';
import HistoryTab from '@/components/nutrition/tabs/HistoryTab';
import BlogArticleTab from '@/components/nutrition/tabs/BlogArticleTab';
import BlogListTab from '@/components/nutrition/tabs/BlogListTab';
import CoachingTab from '@/components/nutrition/tabs/CoachingTab';
import WeightTab from '@/components/nutrition/tabs/WeightTab';
import FitnessTab from '@/components/nutrition/tabs/FitnessTab';
import CommunityTab from '@/components/nutrition/tabs/CommunityTab';
import MinuteDocTab from '@/components/nutrition/tabs/MinuteDocTab';

import Confetti from 'react-confetti';

import { useRouter, useSearchParams } from "next/navigation";
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";


import { supabase } from "@/lib/supabaseClient";
import {YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const VISUAL_EQUIVALENCES = {
  louche: { grams: 70, label: "louche" },
  bol: { grams: 350, label: "bol" },
  cuillere_soupe: { grams: 15, label: "c. à soupe" },
  morceau: { grams: 100, label: "morceau" },
  poignee: { grams: 30, label: "poignée" }
};

const formatVisualPortion = (grams: number, unit: keyof typeof VISUAL_EQUIVALENCES) => {
  if (!grams || !VISUAL_EQUIVALENCES[unit]) return "1 portion";
  const rawValue = grams / VISUAL_EQUIVALENCES[unit].grams;
  const roundedValue = Math.round(rawValue * 2) / 2; // Arrondi au 0.5 près
  return `${roundedValue} ${VISUAL_EQUIVALENCES[unit].label}${roundedValue > 1 && !VISUAL_EQUIVALENCES[unit].label.endsWith('s') ? 's' : ''}`;
};

const guessVisualPortion = (cals: number, mealType: string) => {
   // Fallback pour convertir les calories totales en portions simples
   const totalGrams = cals / 1.5; // Approximation grossière 150kcal = 100g
   if (mealType === 'Petit-déjeuner' || mealType === 'Collation') {
       return formatVisualPortion(totalGrams, 'poignee');
   } else {
       if (totalGrams > 300) return formatVisualPortion(totalGrams, 'bol');
       return formatVisualPortion(totalGrams, 'louche');
   }
};
import jsPDF from "jspdf";

const spaceGrotesk = { className: "font-sans" };

const FATS_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375735/A_cute__highly_detailed_3D_202606131826_jbhb58.jpg";
const WATER_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375733/A_cute__highly_detailed_3D_202606131825_3_jyrhrd.jpg";
const PROTEINS_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375734/A_cute__highly_detailed_3D_202606131825_2_roav76.jpg";
const CARBS_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375738/A_cute__highly_detailed_3D_202606131825_1_epyark.jpg";
const CALS_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375768/A_cute__highly_detailed_3D_202606131825_mxabkm.jpg";

const MENU_ICONS = {
  dashboard: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_ytie6s.jpg",
  samaMenu: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_1_uvgqf0.jpg",
  monJour: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_2_akqmx4.jpg",
  fitness: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_3_punr1t.jpg",
  shop: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_4_erkmnd.jpg",
  profile: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781536233/A_cute__highly_detailed_3D_202606151510_uj9z5c.jpg",
  favorites: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540350/A_cute__highly_detailed_3D_202606151617_hk2xbf.jpg",
  community: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781804851/camera_ohydou.jpg",
  weight: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg",
  minuteDoc: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781541191/A_cute__highly_detailed_3D_202606151632_qytnih.jpg",
  blog: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540516/remplacer_tittle_par_CONSEILS_NUTRITION_202606151619_tb8clu.jpg",
  coaching: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540692/A_cute__highly_detailed_3D_202606151624_lzxhup.jpg"
};

const RECIPE_FILTERS = [
  { id: 'Tous', label: 'Toutes les Recettes', icon: null },
  { id: 'Favoris', label: 'Mes Favoris', icon: null },
  { id: 'Populaire', label: 'Top Recettes', icon: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781443964/A_cute__highly_detailed_3D_202606141332_ggiubt.jpg' },
  { id: 'Low Calories', label: 'Ventre Plat / Woyof', icon: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444369/A_cute__highly_detailed_3D_202606141339_gqzmei.jpg' },
  { id: 'Desserts', label: 'Collations Saines', icon: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444566/supprimer_le_frame__remplace_le_202606141341_ayzsoe.jpg' },
  { id: 'Healthy', label: 'Fraîcheur / Détox', icon: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444564/A_cute__highly_detailed_3D_202606141342_yn2v23.jpg' },
  { id: 'Main Course', label: 'Plats de Résistance', icon: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444638/A_cute__highly_detailed_3D_202606141343_zsz5mp.jpg' }
];

const DEFAULT_SEED_POSTS = [
  {
    id: 'seed-1',
    client_id: 'coach-rokhy',
    content: '🔥 Alhamdoulillah ! Regardez la transformation incroyable d\'Amina après seulement 4 semaines sur le programme Mode Guidé. Thiéboudienne revisité et zéro sucre raffiné. Qui relève le défi ce mois-ci ? 👇',
    image_url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg',
    reactions: { top: 24, sain: 0, courage: 0 },
    comments_count: 8,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    client: 'Coach Rokhy',
    clients: { id: 'coach-rokhy', full_name: 'Coach Rokhy', avatar_url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784209735/557516971_10235324002253110_1070574324835198049_n_ch9we7.jpg' }
  },
  {
    id: 'seed-2',
    client_id: 'chef-kofi',
    content: '🍳 Astuce du Chef : Pour un Fufu léger et digeste, remplacez la moitié de la farine de manioc par de la purée de chou-fleur ou d\'avoine fine. Testé et approuvé par tout le studio ! #Lekkologue #Santé',
    image_url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781221768/Thiebou_dieune_1_hftdhm.jpg',
    reactions: { top: 42, sain: 0, courage: 0 },
    comments_count: 15,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    client: 'Chef Kofi',
    clients: { id: 'chef-kofi', full_name: 'Chef Kofi', avatar_url: 'https://ui-avatars.com/api/?name=Chef+Kofi&background=39FF14&color=000' }
  },
  {
    id: 'seed-3',
    client_id: 'dr-fatima',
    content: '💧 Rappel hydratation : Boire 2 grands verres d\'eau 15 minutes avant votre Thiéboudienne augmente la satiété et facilite la digestion. Combien de verres au compteur aujourd\'hui ?',
    image_url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1783099524/Woman_drinking_clear_water_2K_202607031724_wuqqco.jpg',
    reactions: { top: 19, sain: 0, courage: 0 },
    comments_count: 4,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    client: 'Dr. Fatima',
    clients: { id: 'dr-fatima', full_name: 'Dr. Fatima', avatar_url: 'https://ui-avatars.com/api/?name=Dr+Fatima&background=000&color=39FF14' }
  }
];

const DEFAULT_SEED_STORIES = [
  {
      id: 'story-seed-1',
      client_id: 'coach-rokhy',
      media_url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1783286332/IMG-20250820-WA0117_iegikb.jpg',
      media_type: 'image',
      caption: 'Préparation du batch cooking du dimanche 🥘',
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      clients: { id: 'coach-rokhy', full_name: 'Coach Rokhy', avatar_url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784209735/557516971_10235324002253110_1070574324835198049_n_ch9we7.jpg' },
      nutrition_story_views: []
  },
  {
      id: 'story-seed-2',
      client_id: 'chef-kofi',
      media_url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781221768/Thiebou_dieune_1_hftdhm.jpg',
      media_type: 'image',
      caption: 'Test de recette : Yassa allégé, vous validez ?',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      clients: { id: 'chef-kofi', full_name: 'Chef Kofi', avatar_url: 'https://ui-avatars.com/api/?name=Chef+Kofi&background=39FF14&color=000' },
      nutrition_story_views: []
  },
  {
      id: 'story-seed-3',
      client_id: 'dr-fatima',
      media_url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1783099524/Woman_drinking_clear_water_2K_202607031724_wuqqco.jpg',
      media_type: 'image',
      caption: 'Un esprit sain dans un corps sain ✨',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      clients: { id: 'dr-fatima', full_name: 'Dr. Fatima', avatar_url: 'https://ui-avatars.com/api/?name=Dr+Fatima&background=000&color=39FF14' },
      nutrition_story_views: []
  }
];

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

const DEFAULT_RECIPES = [
  { id: "def_1", type: "Petit-déjeuner", nom: "Lakh allégé (Mil & Lait) + Kinkeliba", calories: 300, is_bol_commun: false, bienfaits: "Riche en calcium et en sucres lents pour éviter le coup de barre de 11h.", ingredients: [{nom: "Mil", quantite: 50, unite: "g", rayon: "Marché local"}, {nom: "Lait demi-écrémé", quantite: 50, unite: "ml", rayon: "Supermarché"}, {nom: "Kinkeliba sans sucre", quantite: 1, unite: "tasse", rayon: "Marché local"}] },
  { id: "def_2", type: "Petit-déjeuner", nom: "Flocons d'avoine, Banane & Café Touba", calories: 320, is_bol_commun: false, bienfaits: "Les fibres solubles de l'avoine gonflent dans l'estomac pour une satiété longue durée.", ingredients: [{nom: "Flocons d'avoine", quantite: 40, unite: "g", rayon: "Supermarché"}, {nom: "Banane", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Café Touba allégé", quantite: 1, unite: "tasse", rayon: "Marché local"}] },
  { id: "def_3", type: "Petit-déjeuner", nom: "Tartines de Seigle, Sardines & Thé Vert", calories: 310, is_bol_commun: false, bienfaits: "Plein d'Oméga-3 excellents pour le cœur et le cerveau, avec un pain à IG très bas.", ingredients: [{nom: "Pain de seigle", quantite: 2, unite: "tranche", rayon: "Supermarché"}, {nom: "Sardines à l'huile", quantite: 50, unite: "g", rayon: "Supermarché"}, {nom: "Thé vert menthe", quantite: 1, unite: "tasse", rayon: "Supermarché"}] },
  { id: "def_4", type: "Petit-déjeuner", nom: "Omelette aux Légumes & Infusion de Djar", calories: 280, is_bol_commun: false, bienfaits: "Des protéines de haute qualité dès le matin pour nourrir vos muscles.", ingredients: [{nom: "Oeufs", quantite: 2, unite: "pièce", rayon: "Supermarché"}, {nom: "Pain complet", quantite: 1, unite: "tranche", rayon: "Supermarché"}, {nom: "Infusion de Djar", quantite: 1, unite: "tasse", rayon: "Marché local"}] },
  { id: "def_5", type: "Petit-déjeuner", nom: "Arraw (Bouillie de Mil) sans sucre & Kinkeliba", calories: 280, is_bol_commun: false, bienfaits: "Une infusion détoxifiante pour le foie associée à l'énergie douce du mil.", ingredients: [{nom: "Boules de mil (Arraw)", quantite: 50, unite: "g", rayon: "Marché local"}, {nom: "Lait écrémé", quantite: 150, unite: "ml", rayon: "Supermarché"}, {nom: "Feuilles de Kinkeliba", quantite: 1, unite: "poignée", rayon: "Marché local"}] },
  { id: "def_6", type: "Déjeuner", nom: "Thieboudienne (Option Fonio)", calories: 600, is_bol_commun: true, bienfaits: "Le plat national allégé : riche en fibres et minéraux grâce à l'incorporation du Fonio.", ingredients: [{nom: "Thiof (Poisson)", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 80, unite: "g", rayon: "Boutique Onyx"}, {nom: "Chou", quantite: 0.5, unite: "pièce", rayon: "Marché local"}, {nom: "Huile d'olive ou colza", quantite: 1, unite: "càs", rayon: "Supermarché"}, {nom: "Carotte", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "def_7", type: "Déjeuner", nom: "Mafé allégé au Poulet (Beurre d'arachide)", calories: 550, is_bol_commun: true, bienfaits: "L'énergie durable des bonnes graisses de l'arachide pure, sans exploser les calories.", ingredients: [{nom: "Blanc de Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Pâte d'arachide pure", quantite: 30, unite: "g", rayon: "Boutique Onyx"}, {nom: "Fonio ou Riz", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Oignon", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "def_8", type: "Déjeuner", nom: "Salade de Fonio au Poulet", calories: 450, is_bol_commun: false, bienfaits: "Un repas léger et ultra-protéiné, particulièrement recommandé après le sport.", ingredients: [{nom: "Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Boutique Onyx"}, {nom: "Tomate", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Moutarde", quantite: 1, unite: "càc", rayon: "Supermarché"}] },
  { id: "def_9", type: "Déjeuner", nom: "Yassa Poisson & Riz Étuvé", calories: 500, is_bol_commun: true, bienfaits: "Le citron et l'oignon du Yassa agissent comme des boosters d'immunité naturels.", ingredients: [{nom: "Poisson braisé", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Oignons", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Riz local étuvé", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Moutarde", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { id: "def_10", type: "Déjeuner", nom: "Poisson Braisé (Thiof) & Légumes", calories: 480, is_bol_commun: false, bienfaits: "Extrêmement faible en mauvaises graisses, et ultra riche en protéines marines.", ingredients: [{nom: "Poisson", quantite: 200, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Légumes (Chou, Carotte)", quantite: 200, unite: "g", rayon: "Marché local"}, {nom: "Soumbala", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { id: "def_11", type: "Déjeuner", nom: "Soupe Kandia (Gombo) Diététique", calories: 520, is_bol_commun: true, bienfaits: "Le gombo agit comme un lubrifiant naturel pour un transit intestinal parfait.", ingredients: [{nom: "Bœuf maigre", quantite: 100, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Gombos frais", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Boutique Onyx"}] },
  { id: "def_12", type: "Déjeuner", nom: "Chili de Niébé à la Viande", calories: 490, is_bol_commun: true, bienfaits: "Le Niébé est le super-héros végétal pour consolider la masse musculaire.", ingredients: [{nom: "Viande hachée maigre", quantite: 100, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Niébé", quantite: 80, unite: "g", rayon: "Marché local"}, {nom: "Sauce tomate pure", quantite: 100, unite: "ml", rayon: "Supermarché"}] },
  { id: "def_13", type: "Déjeuner", nom: "Couscous de Mil (Thiéré) Poulet", calories: 540, is_bol_commun: true, bienfaits: "Une céréale ancestrale et ultra digeste car totalement sans gluten.", ingredients: [{nom: "Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Thiéré (Couscous mil)", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Légumes", quantite: 150, unite: "g", rayon: "Marché local"}] },
  { id: "def_14", type: "Déjeuner", nom: "Mbakhal Saloum Allégé", calories: 510, is_bol_commun: true, bienfaits: "Un plat traditionnel réconfortant avec un apport strictement contrôlé en glucides.", ingredients: [{nom: "Viande maigre", quantite: 100, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Pâte d'arachide pure", quantite: 15, unite: "g", rayon: "Boutique Onyx"}, {nom: "Riz brisé", quantite: 60, unite: "g", rayon: "Marché local"}] },
  { id: "def_15", type: "Déjeuner", nom: "Fonio aux Crevettes & Poivrons", calories: 430, is_bol_commun: false, bienfaits: "Apporte une dose de Zinc et d'iode vitale pour réguler la thyroïde.", ingredients: [{nom: "Crevettes", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Boutique Onyx"}, {nom: "Poivrons", quantite: 150, unite: "g", rayon: "Marché local"}] },
  { id: "def_16", type: "Déjeuner", nom: "Yassa Poulet au Fonio", calories: 520, is_bol_commun: true, bienfaits: "Une synergie entre la vitamine C du citron et le fer naturel du fonio.", ingredients: [{nom: "Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Oignons", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Boutique Onyx"}, {nom: "Huile d'olive", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { id: "def_17", type: "Déjeuner", nom: "Salade Tiède Patate Douce & Poulet", calories: 480, is_bol_commun: false, bienfaits: "Le bêta-carotène de la patate douce favorise l'éclat de la peau et limite les pics de sucre.", ingredients: [{nom: "Patate douce", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Blanc de poulet", quantite: 120, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Tomates", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "def_18", type: "Dîner", nom: "Salade de Niébé Fraîcheur", calories: 400, is_bol_commun: false, bienfaits: "Excellent pour une digestion très légère avant le sommeil sans sensation de faim.", ingredients: [{nom: "Niébé (Haricots)", quantite: 100, unite: "g", rayon: "Marché local"}, {nom: "Concombre", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Vinaigrette légère", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { id: "def_19", type: "Dîner", nom: "Soupe de Légumes Locaux au Soumbala", calories: 300, is_bol_commun: false, bienfaits: "Hydrate en profondeur et régule naturellement la tension artérielle pendant la nuit.", ingredients: [{nom: "Carotte", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Navet", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Soumbala", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { id: "def_20", type: "Dîner", nom: "Poisson braisé (Yaboye) & Jaxatu", calories: 380, is_bol_commun: false, bienfaits: "L'amertume du Jaxatu aide à nettoyer et purifier le foie en douceur.", ingredients: [{nom: "Yaboye", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Jaxatu", quantite: 100, unite: "g", rayon: "Marché local"}] },
  { id: "def_21", type: "Dîner", nom: "Blanc de Poulet Sauté au Djar", calories: 350, is_bol_commun: false, bienfaits: "Des épices locales qui réchauffent le métabolisme sans ajouter aucune calorie.", ingredients: [{nom: "Blanc de poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Haricots verts", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Grains de Djar", quantite: 1, unite: "pincée", rayon: "Marché local"}] },
  { id: "def_22", type: "Dîner", nom: "Omelette Moringa & Champignons", calories: 320, is_bol_commun: false, bienfaits: "Une multivitamine naturelle pure favorisant la réparation cellulaire nocturne.", ingredients: [{nom: "Oeufs", quantite: 2, unite: "pièce", rayon: "Supermarché"}, {nom: "Poudre de Moringa", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}, {nom: "Champignons", quantite: 100, unite: "g", rayon: "Supermarché"}] },
  { id: "def_23", type: "Dîner", nom: "Sauté de Bœuf aux Gombos", calories: 390, is_bol_commun: false, bienfaits: "Le gombo apporte une satiété ultra-rapide sans alourdir l'estomac le soir.", ingredients: [{nom: "Bœuf maigre", quantite: 120, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Gombo", quantite: 100, unite: "g", rayon: "Marché local"}] },
  { id: "def_24", type: "Dîner", nom: "Papillote de Poisson Citronnée", calories: 310, is_bol_commun: false, bienfaits: "Une cuisson saine sans ajout de matière grasse, permettant au foie de se reposer.", ingredients: [{nom: "Poisson blanc", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Citron", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Courgettes", quantite: 150, unite: "g", rayon: "Marché local"}] },
  { id: "def_25", type: "Dîner", nom: "Salade de Thon, Avocat & Tomates", calories: 420, is_bol_commun: false, bienfaits: "Riche en Oméga-3 pour apaiser le système nerveux et améliorer la qualité du sommeil.", ingredients: [{nom: "Thon nature", quantite: 100, unite: "g", rayon: "Supermarché"}, {nom: "Avocat", quantite: 0.5, unite: "pièce", rayon: "Marché local"}, {nom: "Tomate", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "def_26", type: "Dîner", nom: "Velouté de Courge & Poudre de Moringa", calories: 280, is_bol_commun: false, bienfaits: "Concentré en Vitamine A et fibres très douces pour ne pas irriter les intestins.", ingredients: [{nom: "Courge", quantite: 200, unite: "g", rayon: "Marché local"}, {nom: "Poudre de Moringa", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { id: "def_27", type: "Dîner", nom: "Émincé de Volaille aux Épices & Soumbala", calories: 360, is_bol_commun: false, bienfaits: "Protège le système cardio-vasculaire en remplaçant totalement le sel industriel.", ingredients: [{nom: "Volaille", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Légumes mélangés", quantite: 200, unite: "g", rayon: "Marché local"}, {nom: "Soumbala", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { id: "def_28", type: "Dîner", nom: "Brochettes de Poisson et Tomates", calories: 350, is_bol_commun: false, bienfaits: "Apporte des protéines pures et du lycopène, un puissant antioxydant issu de la tomate cuite.", ingredients: [{nom: "Poisson blanc", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Tomates cerises", quantite: 100, unite: "g", rayon: "Marché local"}, {nom: "Huile d'olive", quantite: 1, unite: "càc", rayon: "Supermarché"}] },
  { id: "def_29", type: "Dîner", nom: "Steak de Viande Maigre & Salade Verte", calories: 390, is_bol_commun: false, bienfaits: "Recharge votre corps en fer assimilable, idéal pour la récupération cellulaire nocturne.", ingredients: [{nom: "Viande de Bœuf Maigre", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Salade Verte", quantite: 1, unite: "portion", rayon: "Marché local"}, {nom: "Vinaigrette", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { id: "def_30", type: "Collation", nom: "Yaourt Nature & Éclats d'Arachides", calories: 150, is_bol_commun: false, bienfaits: "Protéines du yaourt relevées par les bonnes graisses de l'arachide.", ingredients: [{nom: "Yaourt nature", quantite: 1, unite: "pot", rayon: "Supermarché"}, {nom: "Arachides grillées", quantite: 10, unite: "g", rayon: "Marché local"}] },
  { id: "def_31", type: "Collation", nom: "Fruit de Saison & Lait Caillé (Sow)", calories: 180, is_bol_commun: false, bienfaits: "Un mix parfait entre vitamines et ferments lactiques.", ingredients: [{nom: "Fruit au choix", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Sow Nature", quantite: 100, unite: "ml", rayon: "Marché local"}] },
  { id: "def_32", type: "Collation", nom: "Infusion Bissap Pur & Noix de Cajou", calories: 160, is_bol_commun: false, bienfaits: "Apport en Magnésium anti-stress et effet jambes légères grâce au Bissap.", ingredients: [{nom: "Bissap rouge séché", quantite: 1, unite: "tasse", rayon: "Boutique Onyx"}, {nom: "Noix de cajou", quantite: 15, unite: "g", rayon: "Boutique Onyx"}] },
  { id: "def_33", type: "Collation", nom: "Yaourt Nature à la Poudre de Bouye", calories: 140, is_bol_commun: false, bienfaits: "Probiotiques du yaourt alliés aux fibres du baobab pour une flore intestinale en béton.", ingredients: [{nom: "Yaourt nature", quantite: 1, unite: "pot", rayon: "Supermarché"}, {nom: "Poudre de Baobab", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { id: "def_34", type: "Collation", nom: "Bâtonnets de Carotte & Concombre", calories: 80, is_bol_commun: false, bienfaits: "Une option zéro culpabilité, ultra-croquante et hydratante.", ingredients: [{nom: "Carotte", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Concombre", quantite: 0.5, unite: "pièce", rayon: "Marché local"}] },
  { id: "def_35", type: "Collation", nom: "Fromage Blanc & Graines de Courge", calories: 150, is_bol_commun: false, bienfaits: "Excellente source de protéines et de zinc pour embellir la peau.", ingredients: [{nom: "Fromage blanc", quantite: 100, unite: "g", rayon: "Supermarché"}, {nom: "Graines de courge", quantite: 15, unite: "g", rayon: "Boutique Onyx"}] },
  { id: "def_36", type: "Collation", nom: "Infusion Kinkeliba & Chocolat Noir", calories: 120, is_bol_commun: false, bienfaits: "Gourmandise antioxydante couplée au nettoyage hépatique du Kinkeliba.", ingredients: [{nom: "Kinkeliba", quantite: 1, unite: "tasse", rayon: "Marché local"}, {nom: "Chocolat noir 70%", quantite: 1, unite: "carré", rayon: "Supermarché"}] },
  { id: "def_37", type: "Collation", nom: "Lait Caillé (Sow) Nature", calories: 130, is_bol_commun: false, bienfaits: "Riche en calcium et ferments lactiques indispensables pour une bonne digestion.", ingredients: [{nom: "Sow Nature", quantite: 150, unite: "ml", rayon: "Marché local"}] },
  { id: "def_38", type: "Collation", nom: "Dattes & Thé Vert Menthe", calories: 110, is_bol_commun: false, bienfaits: "L'énergie rapide absolue associée aux antioxydants du thé.", ingredients: [{nom: "Dattes", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Thé vert menthe", quantite: 1, unite: "tasse", rayon: "Supermarché"}] }
].map(r => ({
   ...r,
   proteins: Math.round((r.calories * 0.2) / 4),
   carbs: Math.round((r.calories * 0.5) / 4),
   fats: Math.round((r.calories * 0.3) / 9)
}));

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

const buildDynamicRecipes = async (foodDatabase: any[]) => {
    let dynamicRecipes: any[] = [];
    try {
        const { data: products } = await supabase.from('nutrition_products').select('*');
        if (products && products.length > 0) {
                const validStandaloneProducts = products.filter((p: any) => {
                    const cat = p.categorie_nom?.toLowerCase() || '';
                    const nom = p.nom?.toLowerCase() || '';

                    // RÈGLE 2 : Exclusion Totale (Non-Alimentaire, Packs & Condiments purs isolés)
                    if (cat.includes('équipement') || cat.includes('accessoire') || cat.includes('pack')) return false;
                    if (nom.includes('gourde') || nom.includes('blender') || nom.includes('t-shirt') || nom.includes('tote bag')) return false;
                    if (nom.includes('pâte') || nom.includes('beurre de cajou') || nom.includes('soumbala') || nom.includes('nététou') || nom.includes('djar') || nom.includes('gingembre') || nom.includes('moringa') || nom.includes('bouye') || nom.includes('bissap')) return false;

                    // Exclusion stricte des ingrédients seuls (graines, feuilles, céréales)
                    const exclNames = ['fonio', 'riz', 'pain', 'mil', 'avoine', 'quinoa', 'graine', 'graines', 'feuille', 'feuilles', 'farine', 'couscous', 'thiéré', 'arraw', 'poudre', 'kinkeliba', 'bissap', 'moringa', 'djar'];
                    if (exclNames.some(e => nom === e || nom.startsWith(e + ' '))) {
                        if (!nom.includes('salade') && !nom.includes('poulet') && !nom.includes('viande') && !nom.includes('poisson')) return false;
                    }

                    return true;
                });

                dynamicRecipes = validStandaloneProducts.map((p: any) => {
                let mType = 'Déjeuner';
                if (p.goal === 'snacks') mType = 'Collation';
                else if (p.goal === 'energy' || p.categorie_nom?.toLowerCase().includes('infusion')) mType = 'Petit-déjeuner';
                else if (p.goal === 'detox') mType = 'Dîner';

                return {
                    id: `gen_prod_${p.id}`,
                    type: mType,
                    nom: `Recette : ${p.nom}`,
                    calories: 350,
                    proteins: 15,
                    carbs: 40,
                    fats: 10,
                    is_boutique: true,
                    image_url: p.image_url,
                    is_bol_commun: false,
                    bienfaits: p.description_courte || "Une recette savoureuse et bénéfique.",
                    budget_tier: p.budget_tier || 'Famille 15k',
                    recipe: `Préparez une portion de ${p.nom}. ${p.description_courte || ''}`,
                    ingredients: [{ nom: p.nom, quantite: 1, unite: "portion", rayon: "Boutique Onyx" }]
                };
            });
        }
    } catch(e) {}

    const validStandaloneFoods = foodDatabase.filter((f: any) => {
        const cat = f.categorie?.toLowerCase() || '';
        const nom = f.nom?.toLowerCase() || '';
        if (cat.includes('condiment') || cat.includes('pâte')) return false;
        if (cat.includes('céréale') || cat.includes('graine') || cat.includes('féculent')) return false;
        if (nom.includes('pâte d\'arachide') || nom.includes('beurre de cajou') || nom.includes('soumbala') || nom.includes('nététou') || nom.includes('djar') || nom.includes('gingembre') || nom.includes('moringa') || nom.includes('bouye') || nom.includes('bissap')) return false;
        const exclNames = ['fonio', 'riz', 'pain', 'mil', 'avoine', 'quinoa', 'graine', 'graines', 'feuille', 'feuilles', 'farine', 'couscous', 'thiéré', 'arraw', 'poudre', 'kinkeliba', 'bissap', 'moringa', 'djar'];
        if (exclNames.some(e => nom.includes(e))) return false;
        return true;
    });

    const foodDbRecipes = validStandaloneFoods.map((f: any) => ({
        id: `gen_food_${f.id}`,
        type: f.categorie === 'Boissons' ? 'Collation' : f.categorie === 'Protéines' ? 'Dîner' : 'Déjeuner',
        nom: `Préparation de ${f.nom}`,
        calories: f.valeurs_pour_100g.calories,
        proteins: f.valeurs_pour_100g.proteines,
        carbs: f.valeurs_pour_100g.glucides,
        fats: f.valeurs_pour_100g.lipides,
        is_bol_commun: false,
        budget_tier: f.budget_tier || 'Famille 15k',
        bienfaits: f.message_coach_ia || "Excellent pour un rééquilibrage nutritionnel africain.",
        recipe: `Cuisinez ${f.portion_standard_grammes}g de ${f.nom} avec un minimum d'huile.`,
        ingredients: [{ nom: f.nom, quantite: f.portion_standard_grammes, unite: "g", rayon: "Marché / Supermarché" }]
    }));

    return [...dynamicRecipes, ...foodDbRecipes];
};

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

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  // Convertit automatiquement un lien YouTube classique en lien "embed" lisible dans une iframe
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};

export default function NutritionDashboard() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;



  const router = useRouter();
  const searchParams = useSearchParams();
  const [emblaShopRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]);
  const [emblaNewArrivalsRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]);
  const [emblaBlogRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]);
  const [user, setUser] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  const [theme, setTheme] = useState<'light'|'dark'>('light');

  // Nouveaux états de l'application Nutrition
  const [activeTab, setActiveTab] = useState<any>('week');
  const [blogCategory, setBlogCategory] = useState('Tous');
  const [blogSearch, setBlogSearch] = useState('');
  const [trackingMode, setTrackingMode] = useState<'guided' | 'flexible'>('guided');
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [showRedoDiagModal, setShowRedoDiagModal] = useState(false);
  const [redoReason, setRedoReason] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPhotoScanning, setIsPhotoScanning] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Jauges quotidiennes
  const [calories, setCalories] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [bmr, setBmr] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);

  // Bilan
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [selectedReportDate, setSelectedReportDate] = useState<string>(todayStr);
  const [showExitIntentModal, setShowExitIntentModal] = useState(false);
  const [intendedTab, setIntendedTab] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>({ followedMenu: false, cravedRice: false, drankWater: false });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [consumedMeals, setConsumedMeals] = useState<any[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [moodNotes, setMoodNotes] = useState<string>('');
  const [selectedMealModal, setSelectedMealModal] = useState<any>(null);
  const [selectedMealPhoto, setSelectedMealPhoto] = useState<string | null>(null);
  const mealPhotoInputRef = useRef<HTMLInputElement>(null);

  // Moteur de recherche et portions
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [offResults, setOffResults] = useState<any[]>([]);
  const [isSearchingOFF, setIsSearchingOFF] = useState(false);
  const [selectedFoodDB, setSelectedFoodDB] = useState<any>(null);
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [foodDatabaseDB, setFoodDatabaseDB] = useState<any[]>([]);
  const [foodUnit, setFoodUnit] = useState("portion");
  const [allRecipesDB, setAllRecipesDB] = useState<any[]>([]);
  const [recipeFilter, setRecipeFilter] = useState("Tous");

  // Immersive Recipe Modal
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<any>(null);
  const [recipeDetailTab, setRecipeDetailTab] = useState<'apercu'|'ingredients'|'preparation'|'avis'>('apercu');
  const [recipeReviews, setRecipeReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // Coach IA "Rokhy"
  const [rokhyMessage, setRokhyMessage] = useState<{title: string, text: string, type: 'warning'|'success'|'info'} | null>(null);

  // Coach IA "Thierno" (Médecin)
  const [isThiernoChatOpen, setIsThiernoChatOpen] = useState(false);
  const [isThiernoDismissed, setIsThiernoDismissed] = useState(false);
  const [thiernoUserReply, setThiernoUserReply] = useState("");
  const [coachingChatStep, setCoachingChatStep] = useState(0);
  const thiernoChatEndRef = useRef<HTMLDivElement>(null);
  const [thiernoMessages, setThiernoMessages] = useState<any[]>([
    { sender: 'bot', text: "Bonjour ! Je suis le Dr. Thierno. As-tu des questions sur la nutrition, tes portions ou comment adapter tes plats locaux (Mix Sénégalo-Moderne) ?" }
  ]);

  // Voice Integration Coach Thierno
  const [isThiernoVoiceEnabled, setIsThiernoVoiceEnabled] = useState(false);
  const thiernoVoiceRef = useRef(false);
  const sidebarTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    thiernoChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thiernoMessages, isThiernoChatOpen]);

  const toggleThiernoVoice = () => {
     const newVal = !isThiernoVoiceEnabled;
     setIsThiernoVoiceEnabled(newVal);
     thiernoVoiceRef.current = newVal;
  };

  const speakText = (text: string) => {
     if (!thiernoVoiceRef.current || !('speechSynthesis' in window)) return;
     window.speechSynthesis.cancel();
     const utterance = new SpeechSynthesisUtterance(text);
     utterance.lang = 'fr-FR';
     window.speechSynthesis.speak(utterance);
  };

  const processThiernoReply = (reply: string) => {
    if (!reply.trim()) return;
    setThiernoMessages(prev => [...prev, { sender: 'client', text: reply }]);
    setThiernoUserReply("");

    setTimeout(() => {
        let botResponse = "C'est une très bonne question. N'oublie pas de consulter notre boutique pour découvrir nos super-aliments (Fonio, Moringa, Soumbala) qui t'aideront à atteindre ton objectif plus vite !";
        const lowerReply = reply.toLowerCase();

        if (lowerReply.includes('riz') || lowerReply.includes('thieb')) {
            botResponse = "Le riz brisé a un index glycémique élevé. Je te recommande fortement notre Fonio Premium disponible dans la boutique. Il est parfait pour remplacer le riz tout en gardant le ventre plat !";
        } else if (lowerReply.includes('sucre') || lowerReply.includes('fatigue') || lowerReply.includes('boost')) {
            botResponse = "La fatigue vient souvent des pics de sucre. Essaye notre Poudre de Moringa Bio ou notre Thé Vert Ataya Spécial pour une énergie décuplée sans calorie !";
        } else if (lowerReply.includes('huile') || lowerReply.includes('mafé') || lowerReply.includes('yassa') || lowerReply.includes('bouillon')) {
            botResponse = "Attention aux bouillons industriels et à l'excès d'huile. Je te conseille d'utiliser notre Soumbala pur comme exhausteur de goût santé, et notre Pâte d'Arachide 100% pure pour tes mafés !";
        } else if (lowerReply.includes('jeûne') || lowerReply.includes('matin') || lowerReply.includes('boire') || lowerReply.includes('eau')) {
            botResponse = "Pour bien t'hydrater, notre Gourde Motivante 'Jongoma' (1.5L) est un must. Tu peux aussi infuser notre Bissap Rouge Séché sans sucre pour un effet détox garanti dès le matin !";
        } else if (lowerReply.includes('faim') || lowerReply.includes('snack') || lowerReply.includes('arachide') || lowerReply.includes('cajou')) {
            botResponse = "En cas de petite faim, évite les biscuits industriels. Nos Noix de Cajou Grillées sont le snack sain idéal pour te caler jusqu'au prochain repas !";
        }

        setThiernoMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        speakText(botResponse);
    }, 1000);
  };

  // Diagnostic Interne (Redo)
  const [diagStep, setDiagStep] = useState(0);
  const [isSubmittingDiag, setIsSubmittingDiag] = useState(false);
  const [diagData, setDiagData] = useState({
  gender: "",
  age: "",
  goal: "",
  height: "",
  currentWeight: "",
  targetWeight: "",
  targetDate: "",
  sleepHours: "",
  dailyCommute: "",
  healthProfile: "",
  femaleSpecific: "",
  waterIntake: "",
  pastDiets: "",
  cookingFats: [] as string[],
  mainMealElement: "",
  eveningMeal: "",
  lunchHabit: "",
  cookingHabit: "",
  weeklyBudget: "",
  name: "",
  phone: ""
});
  const [forceTarget, setForceTarget] = useState(false);

  // --- NOTIFICATIONS PUSH PWA ---
  const sendWaterReminderPush = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
       navigator.serviceWorker.ready.then(registration => {
          registration.showNotification("💧 C'est l'heure de s'hydrater !", {
             body: "N'oublie pas de boire ton verre d'eau pour atteindre ton objectif aujourd'hui. Ton métabolisme te dira merci !",
             icon: "https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png",
             badge: "https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png",
             vibrate: [200, 100, 200]
          });
       });
    }
  };

  // Gamification & Feed Communautaire
  const [jongomaXP, setJongomaXP] = useState(0);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [currentWeightInput, setCurrentWeightInput] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean | string>(false);
  const [weightCoachMessage, setWeightCoachMessage] = useState<{title: string, text: string, type: 'warning'|'success'|'info'} | null>(null);
  const [coachFeedback, setCoachFeedback] = useState<{ type: 'success' | 'warning' | 'neutral'; text: string } | null>(null);
  const [newPostText, setNewPostText] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostVideo, setNewPostVideo] = useState<string | null>(null);
  const [postMode, setPostMode] = useState<'normal' | 'text_only'>('normal');
  const [textBgIndex, setTextBgIndex] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  // Stories States
  const [stories, setStories] = useState<any[]>([]);
  const [groupedStories, setGroupedStories] = useState<any[]>([]);
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [storyPreviewFile, setStoryPreviewFile] = useState<File | null>(null);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState("");
  const storyInputRef = useRef<HTMLInputElement>(null);

  const [viewerActiveGroupIndex, setViewerActiveGroupIndex] = useState<number | null>(null);
  const [viewerActiveStoryIndex, setViewerActiveStoryIndex] = useState<number>(0);
  const [isViewerPaused, setIsViewerPaused] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const [viewerProgress, setViewerProgress] = useState(0); // Progress for image stories (0 to 100)

  const [favoriteMeals, setFavoriteMeals] = useState<any[]>([]);
  const [favoriteSearchQuery, setFavoriteSearchQuery] = useState("");
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [challengeParticipants, setChallengeParticipants] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pdfHistory, setPdfHistory] = useState<any[]>([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showCommentsPostId, setShowCommentsPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSharingPDF, setIsSharingPDF] = useState(false);

  const [xpAnimation, setXpAnimation] = useState<{ amount: number; reason: string; id: number } | null>(null);
  const [showFirstBadgeModal, setShowFirstBadgeModal] = useState(false);
  const [showSecondBadgeModal, setShowSecondBadgeModal] = useState(false);

  // Objectifs
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [proteinGoal, setProteinGoal] = useState(0);
  const [carbsGoal, setCarbsGoal] = useState(0);
  const [fatsGoal, setFatsGoal] = useState(0);
  const [isFastingMode, setIsFastingMode] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);

  // Smart Planner (Générateur)
  const [weeklyGeneratedMenu, setWeeklyGeneratedMenu] = useState<any[]>([]);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);

  const [profileForm, setProfileForm] = useState({
      firstName: "",
      lastName: "",
      age: "",
      bio: "",
      startingWeight: "",
      currentWeight: "",
      goalWeight: "",
      height: "",
      waist: "",
      hips: "",
      avatar_url: "",
      cover_url: "",
      instagram: "",
      facebook: "",
      twitter: ""
  });
  const [showReminder, setShowReminder] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileHub, setShowMobileHub] = useState(false);
  const [myFollowersCount, setMyFollowersCount] = useState(0);

  // Boutique states
  const [selectedShopGoal, setSelectedShopGoal] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const {
    shopCart, addToCart: storeAddToCart,
    savedShopProducts, toggleSavedProduct: storeToggleSavedProduct, setGlobalShopProducts,
    setSavedShopProducts
  } = useCartStore();

  const [shopDataDB, setShopDataDB] = useState<any[]>([]);

  useEffect(() => {
      const allProducts = (Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(c => c.produits || []);
      setGlobalShopProducts(allProducts);
  }, [shopDataDB, setGlobalShopProducts]);

  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [createdOrderRef, setCreatedOrderRef] = useState("");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [shopPromoCodesDB, setShopPromoCodesDB] = useState<any[]>([]);

  const [productMediaView, setProductMediaView] = useState<'image' | 'video'>('image');
  const [productActiveImage, setProductActiveImage] = useState<string>('');
  const [showZoneSuggestions, setShowZoneSuggestions] = useState(false);
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [hasTriggeredCartExit, setHasTriggeredCartExit] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [scratchedBlocks, setScratchedBlocks] = useState<number[]>([]);

  // Shop dynamic additions
  const [shopBannerUrl, setShopBannerUrl] = useState("https://placehold.co/1200x300/111/39FF14?text=OFFRES+EXCLUSIVES");
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  const [shopMinPrice, setShopMinPrice] = useState<number | "">("");
  const [shopMaxPrice, setShopMaxPrice] = useState<number | "">("");

  // Blog States
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const handleArticleClick = async (article: any) => {
    setSelectedArticle(article);
    try {
      // Optimistically update the UI
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, views_count: (a.views_count || 0) + 1 } : a));

      const { error } = await supabase.rpc('increment_article_views', { article_id: article.id });
      if (error) {
        console.error("Error incrementing views:", error);
      }
    } catch (err) {
      console.error("Error calling increment_article_views RPC:", err);
    }
  };

  const [pushEnabled, setPushEnabled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);



  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
       setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const togglePushNotifications = () => {
     if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
           alert("Pour désactiver les notifications, veuillez modifier les paramètres de votre navigateur.");
        } else if (Notification.permission !== 'denied') {
           Notification.requestPermission().then(permission => {
              setPushEnabled(permission === 'granted');
              if (permission === 'granted') {
                  setToastMessage("Notifications activées avec succès !");
                  setTimeout(() => setToastMessage(null), 3000);
              }
           });
        } else {
           alert("Les notifications sont bloquées par votre navigateur. Veuillez les autoriser dans les paramètres.");
        }
     } else {
        alert("Votre navigateur ne supporte pas les notifications.");
     }
  };

  const imcValue = clientProfile?.diagnostic_data ? (() => {
      const h = parseFloat(clientProfile.diagnostic_data.height) / 100;
      const w = parseFloat(clientProfile.diagnostic_data.currentWeight);
      if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
      return "0";
  })() : 0;



  useEffect(() => {
    if (!clientProfile?.id) return;

    const realtimeChannel = supabase.channel('custom-daily-logs-channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'nutrition_daily_logs',
                filter: `client_id=eq.${clientProfile.id}`
            },
            (payload: any) => {
                const newData = payload.new;

                if (newData && newData.log_date === todayStr) {
                    setCalories(newData.calories_consumed || 0);
                    setProteins(newData.proteins_consumed || 0);
                    setCarbs(newData.carbs_consumed || 0);
                    setFats(newData.fats_consumed || 0);
                    setWaterGlasses(newData.water_glasses || 0);

                    if (newData.report_data) {
                        setReportData(newData.report_data);
                        if (newData.report_data.consumedMeals) {
                            setConsumedMeals(newData.report_data.consumedMeals);
                        }
                        if (newData.report_data.moods) {
                            setMoods(newData.report_data.moods);
                        }
                        if (newData.report_data.moodNotes) {
                            setMoodNotes(newData.report_data.moodNotes);
                        }
                    }
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(realtimeChannel);
    };
  }, [clientProfile?.id, todayStr]);

  useEffect(() => {
    // Gestion PWA Hors-Ligne & Sync
    const handleOnline = async () => {
       setIsOffline(false);
       const offlineLogs = JSON.parse(localStorage.getItem('onyx_offline_daily_logs') || '[]');
       if (offlineLogs.length > 0) {
           for (const log of offlineLogs) {
              await supabase.from('nutrition_daily_logs').upsert(log, { onConflict: 'client_id, log_date' });
           }
           localStorage.removeItem('onyx_offline_daily_logs');
           setToastMessage("Mode PWA : Vos bilans hors-ligne ont été synchronisés !");
           setTimeout(() => setToastMessage(null), 4000);
       }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    if (navigator.onLine) {
       handleOnline();
    }

    return () => {
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
        const fetchCatalogue = async () => {
            try {
                // Fetch DB Products
                const prodQuery = supabase.from('nutrition_products').select('*');
                const { data: dbProds } = await prodQuery;
                if (dbProds && dbProds.length > 0) {
                    const grouped = dbProds.reduce((acc: any, p: any) => {
                        if (!acc[p.categorie_nom]) acc[p.categorie_nom] = { categorie_nom: p.categorie_nom, slug: p.slug || 'cat', produits: [] };
                        acc[p.categorie_nom].produits.push(p);
                        return acc;
                    }, {});
                    setShopDataDB(Object.values(grouped));
                } else {
                    const grouped = SHOP_DATA.reduce((acc: any, p: any) => {
                        if (!acc[p.categorie_nom]) acc[p.categorie_nom] = { categorie_nom: p.categorie_nom, slug: p.slug || 'cat', produits: [] };
                        p.produits.forEach((prod: any) => acc[p.categorie_nom].produits.push(prod));
                        return acc;
                    }, {});
                    setShopDataDB(Object.values(grouped));
                }

                // Fetch Promo Codes
                const promoQuery = supabase.from('nutrition_promo_codes').select('*').eq('active', true);
                const { data: dbPromos } = await promoQuery;
                if (dbPromos) setShopPromoCodesDB(dbPromos);

                // Fetch Community Posts
                const { data: cPosts } = await supabase.from('nutrition_community_posts').select('*, clients!client_id(id, full_name, avatar_url)').order('created_at', { ascending: false });
                if (cPosts && cPosts.length > 0) {
                    setCommunityPosts(cPosts.map((p: any) => ({
                        ...p,
                        client: p.clients?.full_name || 'Membre'
                    })));
                } else {
                    setCommunityPosts(DEFAULT_SEED_POSTS);
                }

                // Fetch Stories actives
                const { data: rawStories } = await supabase
                    .from('nutrition_community_stories')
                    .select('*, clients!client_id(id, full_name, avatar_url), nutrition_story_views(viewer_id)')
                    .order('created_at', { ascending: true });
                if (rawStories && rawStories.length > 0) {
                    // Fusionner avec les seed stories pour ne jamais avoir un mur vide, en évitant les doublons
                    const mergedStories = [...rawStories];
                    DEFAULT_SEED_STORIES.forEach(seed => {
                        if (!mergedStories.some(s => s.id === seed.id)) {
                            mergedStories.push(seed);
                        }
                    });
                    setStories(mergedStories);
                } else {
                    setStories(DEFAULT_SEED_STORIES);
                }

                // Fetch Active Challenge
                const { data: challenges, error: challengesError } = await supabase
                    .from('nutrition_challenges')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (challengesError) {
                    console.error("Supabase Error fetching challenges:", challengesError.message);
                }

                if (challenges && challenges.length > 0) {
                    setActiveChallenge(challenges[0]);
                    const { count } = await supabase
                        .from('nutrition_challenge_participants')
                        .select('*', { count: 'exact', head: true })
                        .eq('challenge_id', challenges[0].id);
                    setChallengeParticipants(count || 0);
                } else {
                    // Fallback Seed Challenge
                    setActiveChallenge({
                        id: 'seed-challenge-1',
                        title: '30 Jours Détox Sans Sucre',
                        description: 'Rejoignez-nous pour éliminer le sucre raffiné de notre alimentation pendant un mois.',
                        badge_name: 'Jongoma Détox',
                        cover_url: 'https://res.cloudinary.com/dtr2wtoty/video/upload/v1783098522/pexels-kelly-18069166_2_o207f2.mp4',
                        end_date: new Date(Date.now() + 12 * 24 * 3600000).toISOString(),
                        xp_reward: 100
                    });
                    setChallengeParticipants(27450);
                }

                // Fetch Foods
                const { data: dbFoods } = await supabase.from('nutrition_foods').select('*');
                if (dbFoods) setFoodDatabaseDB(dbFoods);

                // Fetch All Recipes for Gallery
                const recipeQuery = supabase.from('nutrition_recipes').select('*');
                const { data: dbRecipes } = await recipeQuery;
                if (dbRecipes && dbRecipes.length > 0) setAllRecipesDB(dbRecipes);
                else setAllRecipesDB(DEFAULT_RECIPES);

                // Fetch Articles
                const { data: articlesData } = await supabase.from('marketing_articles').select('*').order('created_at', { ascending: false });
                if (articlesData) setArticles(articlesData);
            } catch (err) {
                console.error("Erreur de chargement du catalogue :", err);
            }
        };

        fetchCatalogue();
    }, []);

    useEffect(() => {
    const verifyAuth = async () => {
      try {
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

      const rawFullName = finalUser?.user_metadata?.full_name || finalUser?.full_name || "Membre";
      const nameParts = rawFullName.split(' ');
      const rawFirstName = nameParts[0];
      const rawLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";

      setUser({ ...finalUser, full_name: rawFullName });
      setProfileForm(prev => ({
         ...prev,
         firstName: rawFirstName,
         lastName: rawLastName,
         avatar_url: finalUser?.user_metadata?.avatar_url || finalUser?.avatar_url || ""
      }));

      // Récupérer le profil client complet depuis la table 'clients'
      const phoneMatch = finalUser?.email?.match(/^(\+?\d+)@clients\.onyxcrm\.com$/);
      const userPhone = phoneMatch ? phoneMatch[1] : (finalUser?.user_metadata?.phone || finalUser?.phone);

      let query = supabase.from('clients').select('*');
      if (userPhone) {
        query = query.eq('phone', userPhone);
      } else if (finalUser?.id && String(finalUser?.id).includes('-')) {
        query = query.eq('id', finalUser?.id);
      } else {
        setLoading(false);
        return;
      }

      const { data: profileData, error } = await query.maybeSingle();

      let activeProfile = profileData || finalUser;
      if (activeProfile) {
        if (userPhone) {
          const welcome = localStorage.getItem(`onyx_nutrition_welcome_${userPhone}`);
          if (welcome) setWelcomeMessage(welcome);
        }

          // === HYDRATATION ET FALLBACK (Friction Zéro) ===
          // On s'assure que toutes les données nécessaires sont présentes
          if (activeProfile) {
              if (!activeProfile.diagnostic_data) {
                  activeProfile.diagnostic_data = { goal: 'perte_poids', currentWeight: 0, targetWeight: 0 };
              }
              if (!activeProfile.daily_macros) {
                  activeProfile.daily_macros = { calorieGoal: activeProfile.daily_calorie_goal || 0, proteinGoal: 100, fatsGoal: 50 };
              }
          } else {
             // Profil manquant, création d'un profile factice en mémoire
             activeProfile = {
                 diagnostic_data: { goal: 'maintien', currentWeight: 0, targetWeight: 0 },
                 daily_macros: { calorieGoal: activeProfile.daily_calorie_goal || 0, proteinGoal: 100, fatsGoal: 50 },
                 expert_mode: false,
                 jongoma_xp: 0
             };
          }

          setClientProfile(activeProfile);
          const trialEnds = activeProfile.expiration_date ? new Date(activeProfile.expiration_date).getTime() : (new Date(activeProfile.created_at || new Date()).getTime() + 14 * 24 * 60 * 60 * 1000);
          const now = new Date().getTime();

          if (window.innerWidth < 1024) setIsSidebarOpen(false);

          let diffDays = 0;
          if (!isNaN(trialEnds)) {
              diffDays = Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)));
          }

          // Hydrater les états du formulaire profil avec le contenu DB
          setProfileForm(prev => ({
              ...prev,
              bio: activeProfile.bio || "",
              cover_url: activeProfile.cover_url || "",
              instagram: activeProfile.instagram || "",
              facebook: activeProfile.facebook || "",
              twitter: activeProfile.twitter || ""
          }));

          // Fetch follower count & related notifications conditionally
          if (activeProfile.id) {
              const { data: myNotifs } = await supabase.from('nutrition_notifications').select('*, clients!actor_id(id, full_name, avatar_url)').eq('client_id', activeProfile.id).order('created_at', { ascending: false }).limit(20);
              if (myNotifs) setNotifications(myNotifs);
          }

          if (activeProfile.plan_type === 'premium') {
             diffDays = 999;
          }
          setDaysLeft(diffDays);

          // Récupération de l'historique des logs journaliers
          if (activeProfile.id) {
          const { data: logsData } = await supabase
            .from('nutrition_daily_logs')
            .select('*')
            .eq('client_id', activeProfile.id)
            .order('log_date', { ascending: true });

          if (logsData) {
            setDailyLogs(logsData);

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
            } else { // Si aucun log n'est trouvé pour aujourd'hui, réinitialiser les états
                setCalories(0);
                setWaterGlasses(0);
                setProteins(0);
                setCarbs(0);
                setFats(0);
                setConsumedMeals([]);
                setReportData({ followedMenu: false, cravedRice: false, drankWater: false });
                setMoods([]);
                setMoodNotes('');
            }
          }

          // Removed unused nutrition_profiles fetch to avoid 400 error as per user instructions
          let nutritionData = null;
          try {
             const { data } = await supabase
               .from('nutrition_profiles')
               .select('*')
               .eq('client_id', activeProfile.id)
               .maybeSingle();
             nutritionData = data;
          } catch(e) {
             console.error('Ignored nutrition_profiles fetch error', e);
          }

          if (nutritionData) {
             setClientProfile(prev => ({
                ...prev,
                diagnostic_data: nutritionData.diagnostic_data,
                expert_mode: nutritionData.expert_mode,
                weekly_budget_tier: nutritionData.weekly_budget_tier || 'famille_15k'
             }));
             setBmr(nutritionData.bmr || 0);
             setCalorieGoal(nutritionData.daily_calorie_goal || 0);
             setProteinGoal(nutritionData.protein_goal || 0);
             setCarbsGoal(nutritionData.carbs_goal || 0);
             setFatsGoal(nutritionData.fats_goal || 0);
             setIsExpertMode(nutritionData.expert_mode || false);
             setJongomaXP(nutritionData.jongoma_xp || 0);
             setIsFastingMode(nutritionData.diagnostic_data?.fasting_mode || false);
             if (nutritionData.weekly_menu && Array.isArray(nutritionData.weekly_menu) && nutritionData.weekly_menu.length > 0) {
                 setWeeklyGeneratedMenu(nutritionData.weekly_menu);
             }

             // Update profile form stats
             if (nutritionData.diagnostic_data) {
                 setProfileForm(prev => ({
                     ...prev,
                     startingWeight: nutritionData.diagnostic_data.startingWeight || "",
                     currentWeight: nutritionData.diagnostic_data.currentWeight || "",
                     goalWeight: nutritionData.diagnostic_data.targetWeight || nutritionData.diagnostic_data.goalWeight || "",
                     height: nutritionData.diagnostic_data.height || "",
                     waist: nutritionData.diagnostic_data.waist || "",
                     hips: nutritionData.diagnostic_data.hips || ""
                 }));
             }
          }

          // Récupérer le poids
          const { data: wLogs } = await supabase.from('nutrition_weight_logs').select('*').eq('client_id', activeProfile.id).order('log_date', { ascending: true });

          let fetchedLogs = wLogs || [];
          const diagCurrentWeight = nutritionData?.diagnostic_data?.currentWeight;

          if (fetchedLogs.length === 0 && diagCurrentWeight) {
              const initialWeight = parseFloat(diagCurrentWeight);
              const initialDate = activeProfile.created_at ? new Date(activeProfile.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
              if (!isNaN(initialWeight)) {
                 fetchedLogs = [{ log_date: initialDate, weight: initialWeight }];
              }
          }

          setWeightLogs(fetchedLogs);
          if (fetchedLogs.length > 0) {
              setCurrentWeightInput(fetchedLogs[fetchedLogs.length - 1].weight);
          } else if (diagCurrentWeight && !isNaN(parseFloat(diagCurrentWeight))) {
              setCurrentWeightInput(parseFloat(diagCurrentWeight));
          } else {
              setCurrentWeightInput(0);
          }

          if (nutritionData) {
              setFavoriteMeals(nutritionData.favorite_meals || []);
              setPdfHistory(nutritionData.pdf_history || []);
              setSavedShopProducts(nutritionData.saved_shop_products || []);
              setExcludedIngredients(nutritionData.excluded_ingredients || []);
          }

          if (activeProfile.address) setDeliveryAddress(activeProfile.address);

          // Fetch des commandes du client
          const { data: ordersData } = await supabase.from('nutrition_orders').select('*').eq('client_id', activeProfile.id).order('created_at', { ascending: false });
          if (ordersData) setClientOrders(ordersData);
          } // Fin if (activeProfile.id)



          // Load banner from settings specific to the coach
          if (activeProfile.tenant_id) {
              try {
                      const { data } = await supabase.from('crm_settings').select('shop_banner_url').eq('tenant_id', activeProfile.tenant_id).maybeSingle();
                      if (data?.shop_banner_url) setShopBannerUrl(data.shop_banner_url);
              } catch (e) {}
          } else {
              try {
                      const { data } = await supabase.from('crm_settings').select('shop_banner_url').limit(1).maybeSingle();
                      if (data?.shop_banner_url) setShopBannerUrl(data.shop_banner_url);
              } catch (e) {}
          }
      }
      } catch (err) {
        console.error("Erreur de chargement auth/profil :", err);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();

    // Afficher un message de bienvenue après le diagnostic
    if (searchParams.get('from') === 'diagnostic') {
      alert("Félicitations et bienvenue ! Votre espace personnel est prêt.");
      // Nettoyer l'URL
      router.replace('/nutrition');
    }

    // Gérer la redirection depuis le panier vide
    const tabParam = searchParams.get('tab');
    if (tabParam) {
        setActiveTab(tabParam);
        // Nettoyer l'URL pour ne pas rester bloqué sur l'onglet
        router.replace('/nutrition');
    }

  }, [router, searchParams]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && shopCart.length > 0 && !hasTriggeredCartExit) {
        // setShowCartExitIntent(true);
        setHasTriggeredCartExit(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [shopCart.length, hasTriggeredCartExit]);

  // S'assurer que le menu est généré si l'utilisateur vient d'arriver
  useEffect(() => {
      if (!loading && clientProfile && weeklyGeneratedMenu.length === 0) {
          generateWeeklyMenu();
      }
  }, [loading, clientProfile, weeklyGeneratedMenu.length]);

  // Synchronisation en temps réel (Supabase Realtime) des données journalières
  useEffect(() => {
    if (!clientProfile?.id) return;

    const channel = supabase
      .channel(`realtime_logs_${clientProfile.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nutrition_daily_logs',
        filter: `client_id=eq.${clientProfile.id}`
      }, (payload) => {
        const newLog = payload.new as any;
        if (!newLog || Object.keys(newLog).length === 0) return;

        // Mettre à jour l'état si le log concerne aujourd'hui
        if (newLog.log_date === todayStr) {
          setCalories(newLog.calories_consumed || 0);
          setWaterGlasses(newLog.water_glasses || 0);
          setProteins(newLog.proteins_consumed || 0);
          setCarbs(newLog.carbs_consumed || 0);
          setFats(newLog.fats_consumed || 0);
          setReportData(newLog.report_data || { followedMenu: false, cravedRice: false, drankWater: false });
          setConsumedMeals(newLog.report_data?.consumedMeals || []);
          setMoods(newLog.report_data?.moods || []);
          setMoodNotes(newLog.report_data?.moodNotes || '');
        }

        setDailyLogs(prev => {
          const filtered = prev.filter(l => l.log_date !== newLog.log_date);
          return [...filtered, newLog].sort((a,b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientProfile?.id]);

  const updateXP = async (amount: number, reason: string) => {
      const newXP = jongomaXP + amount;
      let leveledUp = false;

      // Vérification des déblocages de badges pour que le coach IA (Rokhy) réagisse
      if (jongomaXP < 500 && newXP >= 500) {
          leveledUp = true;
          setRokhyMessage({ title: "Nouveau Badge Débloqué ! ", text: "Félicitations ! Tu viens de débloquer le badge Adhérente ! Continue comme ça, tes efforts paient !", type: 'success' });
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 8000);
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
          audio.volume = 0.5;
          audio.play().catch(()=>{});
          setShowFirstBadgeModal(true);

          setShowSecondBadgeModal(true);
      }

      setJongomaXP(newXP);
      if (clientProfile) {
         await supabase.from('nutrition_profiles').update({ jongoma_xp: newXP }).eq('client_id', clientProfile.id);
      }
      setXpAnimation({ amount, reason, id: Date.now() });

      // Effet sonore de gain d'XP (sauf si on vient de level up pour ne pas superposer les sons)
      if (!leveledUp) {
          const xpAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3");
          xpAudio.volume = 0.4;
          xpAudio.play().catch(()=>{});
      }
  };

  const getJongomaLevel = (xp: number) => {
      if (xp >= 1000) return { name: "Légende", badgeUrl: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493019/LEGENDE_z4ipny.png", desc: "Niveau maximal atteint !" };
      if (xp >= 500) return { name: "Lekkologue Or", badgeUrl: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493019/LEKKOLOGUE_OR_a0znxt.png", desc: "Badge de profil débloqué" };
      if (xp >= 100) return { name: "Maître du Fonio", badgeUrl: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493020/MAITRE_DU_FONIO_emczhf.png", desc: "Progression solide !" };
      return { name: "Force Baobab", badgeUrl: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493020/FORCE_BAOBAB_ltcuer.png", desc: "Le début de l'aventure" };
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

  // Moteur de recherche hybride (Local + OpenFoodFacts)
  useEffect(() => {
     if (foodSearchQuery.length >= 3) {
        const fetchOFF = async () => {
           setIsSearchingOFF(true);
           try {
              const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodSearchQuery)}&search_simple=1&action=process&json=1&page_size=5`);
              const data = await res.json();
              if (data && data.products) {
                 const mapped = data.products.map((p:any) => ({
                    id: p._id,
                    nom: p.product_name || "Produit inconnu",
                    categorie: "Produit Industriel (OpenFoodFacts)",
                    portion_standard_nom: "100g",
                    portion_standard_grammes: 100,
                    valeurs_pour_100g: { calories: p.nutriments?.['energy-kcal_100g'] || 0, glucides: p.nutriments?.carbohydrates_100g || 0, lipides: p.nutriments?.fat_100g || 0, proteines: p.nutriments?.proteins_100g || 0, fibres: p.nutriments?.fiber_100g || 0 },
                    flags_ia: { ultra_transforme: p.nova_group === 4 || true },
                    isFood: true,
                    is_from_off: true,
                    message_coach_ia: (p.nutriments?.sugars_100g > 15) ? `Alerte Sucre (${p.nutriments.sugars_100g}g/100g) ! Attention aux pics d'insuline. Privilégiez des alternatives naturelles.` :
                                      (p.nutriments?.sodium_100g > 0.6) ? `Trop salé ! Risque de rétention d'eau. Remplacez-le par du Soumbala brut.` :
                                      (p.nova_group === 4) ? `Produit ultra-transformé. À limiter fortement pour garder un ventre plat.` :
                                      (p.nutriments?.proteins_100g > 15) ? `Excellente source de protéines (${p.nutriments.proteins_100g}g) pour la satiété !` :
                                      `Produit industriel. Essaie de trouver une alternative brute (ex: fruits frais, oléagineux locaux).`
                 })).filter((p:any) => p.nom !== "Produit inconnu");
                 setOffResults(mapped);
              }
           } catch(e) { console.error(e); }
           setIsSearchingOFF(false);
        };
        const delay = setTimeout(fetchOFF, 800);
        return () => clearTimeout(delay);
     } else {
        setOffResults([]);
     }
  }, [foodSearchQuery]);

  // STORY VIEWER LOGIC
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
      let interval: NodeJS.Timeout;

      const handleNextStory = () => {
          if (viewerActiveGroupIndex === null) return;
          const currentGroup = groupedStories[viewerActiveGroupIndex];

          if (viewerActiveStoryIndex < currentGroup.stories.length - 1) {
              setViewerActiveStoryIndex(prev => prev + 1);
          } else if (viewerActiveGroupIndex < groupedStories.length - 1) {
              setViewerActiveGroupIndex(prev => prev! + 1);
              setViewerActiveStoryIndex(0);
          } else {
              setViewerActiveGroupIndex(null); // Close viewer
          }
          setViewerProgress(0);
      };

      if (viewerActiveGroupIndex !== null && !isViewerPaused) {
          const currentGroup = groupedStories[viewerActiveGroupIndex];
          const currentStory = currentGroup?.stories[viewerActiveStoryIndex];

          if (currentStory) {
              // Log view automatically when story shows
              const viewerId = clientProfile?.id || user?.id;
              if (viewerId) {
                  // Background async call
                  supabase.from('nutrition_story_views').insert({
                      story_id: currentStory.id,
                      viewer_id: viewerId
                  }).then(({ error }) => {
                      if (error && error.code !== '23505') { // Ignore PK duplicate error
                          console.warn("View tracking failed", error);
                      }
                  });
              }

              // Handle video pause/play
              if (currentStory.media_type === 'video' && videoRef.current) {
                  videoRef.current.play().catch(() => {});
              }

              // Auto-advance for images only (videos are handled by onEnded)
              if (currentStory.media_type === 'image') {
                  const duration = 5000; // 5 seconds
                  const step = 50; // update every 50ms

                  interval = setInterval(() => {
                      setViewerProgress(prev => prev + (step / duration) * 100);
                  }, step);
              }
          }
      } else if (isViewerPaused) {
           const currentGroup = groupedStories[viewerActiveGroupIndex || 0];
           const currentStory = currentGroup?.stories[viewerActiveStoryIndex];
           if (currentStory?.media_type === 'video' && videoRef.current) {
               videoRef.current.pause();
           }
      }

      return () => {
          if (interval) clearInterval(interval);
      };
  }, [viewerActiveGroupIndex, viewerActiveStoryIndex, isViewerPaused, groupedStories, clientProfile?.id, user?.id]);

  useEffect(() => {
      if (viewerProgress >= 100) {
          if (viewerActiveGroupIndex === null) return;
          const currentGroup = groupedStories[viewerActiveGroupIndex];

          if (viewerActiveStoryIndex < currentGroup.stories.length - 1) {
              setViewerActiveStoryIndex(prev => prev + 1);
          } else if (viewerActiveGroupIndex < groupedStories.length - 1) {
              setViewerActiveGroupIndex(prev => prev! + 1);
              setViewerActiveStoryIndex(0);
          } else {
              setViewerActiveGroupIndex(null); // Close viewer
          }
          setViewerProgress(0);
      }
  }, [viewerProgress, viewerActiveGroupIndex, viewerActiveStoryIndex, groupedStories]);

  const handleViewerSkipForward = () => {
      if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
      }
      if (viewerActiveGroupIndex === null) return;
      const currentGroup = groupedStories[viewerActiveGroupIndex];

      if (viewerActiveStoryIndex < currentGroup.stories.length - 1) {
          setViewerActiveStoryIndex(prev => prev + 1);
      } else if (viewerActiveGroupIndex < groupedStories.length - 1) {
          setViewerActiveGroupIndex(prev => prev! + 1);
          setViewerActiveStoryIndex(0);
      } else {
          setViewerActiveGroupIndex(null);
      }
      setViewerProgress(0);
  };

  const handleViewerSkipBackward = () => {
      if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
      }
      if (viewerActiveGroupIndex === null) return;

      if (viewerActiveStoryIndex > 0) {
          setViewerActiveStoryIndex(prev => prev - 1);
      } else if (viewerActiveGroupIndex > 0) {
          setViewerActiveGroupIndex(prev => prev! - 1);
          setViewerActiveStoryIndex(groupedStories[viewerActiveGroupIndex - 1].stories.length - 1);
      }
      setViewerProgress(0);
  };

  // Regroupement des stories par utilisateur
  useEffect(() => {
      if (!stories || stories.length === 0) {
          setGroupedStories([]);
          return;
      }
      const groups: Record<string, any> = {};

      stories.forEach((story: any) => {
          if (!story.clients) return;
          const uId = story.clients.id;
          if (!groups[uId]) {
              groups[uId] = {
                  client: story.clients,
                  stories: [],
                  allViewed: true // on assume vrai, on mettra false si on trouve une non-vue
              };
          }
          groups[uId].stories.push(story);

          // Vérifier si l'utilisateur actuel (clientProfile?.id) a vu cette story
          const myId = clientProfile?.id || user?.id;
          const hasViewed = story.nutrition_story_views?.some((v: any) => v.viewer_id === myId);
          if (!hasViewed) {
              groups[uId].allViewed = false;
          }
      });

      // Convertir en tableau et trier (ceux avec des non-vues en premier, puis par date de création de la dernière story)
      const groupArray = Object.values(groups).sort((a: any, b: any) => {
          if (a.allViewed === b.allViewed) {
             const aLast = new Date(a.stories[a.stories.length-1].created_at).getTime();
             const bLast = new Date(b.stories[b.stories.length-1].created_at).getTime();
             return bLast - aLast; // plus récent en premier
          }
          return a.allViewed ? 1 : -1;
      });

      setGroupedStories(groupArray);
  }, [stories, clientProfile?.id, user?.id]);

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
  const generateWeeklyMenu = async (fastingOverride?: boolean) => {
      const activeFastingMode = fastingOverride !== undefined ? fastingOverride : isFastingMode;
      let currentRecipes: any[] = [];
      try {
          const recipeQuery = supabase.from('nutrition_recipes').select('*');
          const { data } = await recipeQuery;
          if (data && data.length > 0) {
              currentRecipes = data;
          } else {
              currentRecipes = DEFAULT_RECIPES;
          }

          // MISSION : Incorporer les produits et aliments dans la génération de menu
          const dynamicRecs = await buildDynamicRecipes(foodDatabaseDB);
          currentRecipes = [...currentRecipes, ...dynamicRecs];

      } catch(e) {
          currentRecipes = DEFAULT_RECIPES;
      }

      // RÈGLES DES CONDIMENTS (Exclusion stricte des produits non-complets)
      currentRecipes = currentRecipes.filter(r => {
          const cat = r.categorie?.toLowerCase() || '';
          const nom = r.nom?.toLowerCase() || '';
          if (cat.includes('équipement') || cat.includes('accessoire') || cat.includes('pack')) return false;
          if (nom.includes('gourde') || nom.includes('blender') || nom.includes('t-shirt') || nom.includes('tote bag')) return false;
          if (nom.includes('pâte d\'arachide pure') || nom.includes('soumbala') || nom.includes('nététou') || nom.includes('épice')) return false;
          return true;
      });

      const newMenu: any[] = [];
      let bolCommunCount = 0;
      const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

      // FILTRAGE ALLERGIES (RULE 5)
      const allergies = clientProfile?.diagnostic_data?.allergies?.toLowerCase() || '';
      let safeRecipes = currentRecipes;
      if (allergies && allergies !== 'aucune' && allergies !== 'non') {
          const allergyList = allergies.split(/[,;\s]+/).filter(Boolean);
          safeRecipes = currentRecipes.filter(r => {
             return !r.ingredients?.some((ing: any) => allergyList.some(al => ing.nom.toLowerCase().includes(al)));
          });
      }

      // FILTRAGE BUDGET (MISSION)
      const userBudgetTier = clientProfile?.weekly_budget_tier || 'famille_15k';
      const budgetMapping: Record<string, string[]> = {
          'serre_8k': ['Serré 8k'],
          'famille_15k': ['Serré 8k', 'Famille 15k'],
          'confort_25k': ['Serré 8k', 'Famille 15k', 'Confort 25k']
      };
      const allowedTiers = budgetMapping[userBudgetTier] || budgetMapping['famille_15k'];
      safeRecipes = safeRecipes.filter(r => !r.budget_tier || allowedTiers.includes(r.budget_tier));

      // RATIOS CALORIQUES MODE GUIDÉ (RULE 4)
      const targetDailyCals = calorieGoal || 0;
      const mealTargets: Record<string, number> = activeFastingMode ? {
         'Déjeuner': targetDailyCals * 0.45,
         'Collation': targetDailyCals * 0.20,
         'Dîner': targetDailyCals * 0.35
      } : {
         'Petit-déjeuner': targetDailyCals * 0.25,
         'Déjeuner': targetDailyCals * 0.40,
         'Collation': targetDailyCals * 0.10,
         'Dîner': targetDailyCals * 0.25
      };

      const scaleRecipe = (recipe: any, targetCals: number) => {
          if (!recipe) return null;
          const originalCals = recipe.calories || recipe.kcal || recipe.energy || (recipe.nutrition && recipe.nutrition.calories) || targetCals;
          const ratio = targetCals / originalCals;
          return {
              ...recipe,
              calories: Math.round(targetCals),
              kcal: Math.round(targetCals),
              proteins: Math.round((recipe.proteins || recipe.prots || recipe.protein || 0) * ratio),
              carbs: Math.round((recipe.carbs || recipe.glucides || 0) * ratio),
              fats: Math.round((recipe.fats || recipe.lipides || recipe.fat || 0) * ratio),
              ingredients: recipe.ingredients?.map((ing: any) => ({
                  ...ing,
                  quantite: typeof ing.quantite === 'number' ? Number((ing.quantite * ratio).toFixed(1)) : ing.quantite
              })) || []
          };
      };

      const recentMeals: Record<string, string[]> = {
          'Petit-déjeuner': [],
          'Déjeuner': [],
          'Collation': [],
          'Dîner': []
      };

      days.forEach(day => {
          const getAvailable = (type: string) => {
              let available = safeRecipes.filter(r => r.type === type && !recentMeals[type].slice(-2).includes(r.id));
              if (available.length === 0) available = safeRecipes.filter(r => r.type === type && !recentMeals[type].slice(-1).includes(r.id));
              if (available.length === 0) available = safeRecipes.filter(r => r.type === type);

              // MISSION : Prioritisation "Serré 8k" pour budgets restreints
              if (userBudgetTier !== 'confort_25k') {
                  const tightBudgetRecipes = available.filter(r => r.budget_tier === 'Serré 8k');
                  // 70% de chance de ne proposer que du budget serré si disponible
                  if (tightBudgetRecipes.length > 0 && Math.random() > 0.3) {
                      available = tightBudgetRecipes;
                  }
              }

              if (type === 'Petit-déjeuner') {
                  const withHotDrinks = available.filter(r => r.ingredients?.some((ing: any) => ['kinkeliba', 'thé vert', 'djar', 'café touba'].some(drink => ing.nom.toLowerCase().includes(drink))));
                  if (withHotDrinks.length > 0) available = withHotDrinks;
              }
              return available;
          };

          const breakfasts = activeFastingMode ? [] : getAvailable('Petit-déjeuner');
          const lunches = getAvailable('Déjeuner');
          const dinners = getAvailable('Dîner');
          const snacks = getAvailable('Collation');

          let bestCombination: any = null;
          let minDiff = Infinity;
          const bcLunches = lunches.filter(r => r.is_bol_commun);
          const normalLunches = lunches.filter(r => !r.is_bol_commun);

          // Recherche intelligente d'une combinaison approchant le quota dynamique (+/- 50 kcal)
          for (let i = 0; i < 30; i++) {
              let lunchCandidate;
              if (bolCommunCount < 3 && Math.random() > 0.4 && bcLunches.length > 0) {
                  lunchCandidate = bcLunches[Math.floor(Math.random() * bcLunches.length)];
              } else {
                  lunchCandidate = normalLunches.length > 0 ? normalLunches[Math.floor(Math.random() * normalLunches.length)] : lunches[Math.floor(Math.random() * lunches.length)];
              }

              const cBf = breakfasts.length > 0 ? breakfasts[Math.floor(Math.random() * breakfasts.length)] : null;
              const cL = lunchCandidate || null;
              const cSn = snacks.length > 0 ? snacks[Math.floor(Math.random() * snacks.length)] : null;
              const cD = dinners.length > 0 ? dinners[Math.floor(Math.random() * dinners.length)] : null;

              const getCals = (r: any) => r?.calories || r?.kcal || r?.energy || (r?.nutrition && r?.nutrition?.calories) || 0;
              const totalCals = getCals(cBf) + getCals(cL) + getCals(cSn) + getCals(cD);
              const diff = Math.abs(totalCals - targetDailyCals);

              if (diff < minDiff) {
                  minDiff = diff;
                  bestCombination = { rawBf: cBf, rawL: cL, rawSn: cSn, rawD: cD, isBc: cL?.is_bol_commun };
              }
              if (diff <= 50) break;
          }

          if (bestCombination?.isBc) bolCommunCount++;
          const { rawBf, rawL, rawSn, rawD } = bestCombination || {};

          const safeMeal = (meal: any) => {
              if (!meal) return meal;
              const cals = meal.calories || meal.kcal || meal.energy || (meal.nutrition && meal.nutrition.calories) || 0;
              return { ...meal, calories: cals, kcal: cals };
          };

          const dayMeals: any = {
              'Déjeuner': trackingMode === 'guided' ? scaleRecipe(rawL, mealTargets['Déjeuner']) : safeMeal(rawL),
              'Collation': trackingMode === 'guided' ? scaleRecipe(rawSn, mealTargets['Collation']) : safeMeal(rawSn),
              'Dîner': trackingMode === 'guided' ? scaleRecipe(rawD, mealTargets['Dîner']) : safeMeal(rawD)
          };

          if (!activeFastingMode) {
              dayMeals['Petit-déjeuner'] = trackingMode === 'guided' ? scaleRecipe(rawBf, mealTargets['Petit-déjeuner']) : safeMeal(rawBf);
          }

          if (dayMeals['Petit-déjeuner']) recentMeals['Petit-déjeuner'].push(dayMeals['Petit-déjeuner'].id);
          if (dayMeals['Déjeuner']) recentMeals['Déjeuner'].push(dayMeals['Déjeuner'].id);
          if (dayMeals['Collation']) recentMeals['Collation'].push(dayMeals['Collation'].id);
          if (dayMeals['Dîner']) recentMeals['Dîner'].push(dayMeals['Dîner'].id);

          newMenu.push({ day, meals: dayMeals });
      });
      setWeeklyGeneratedMenu(newMenu);
      if (clientProfile) {
         const safeMenu = JSON.parse(JSON.stringify(newMenu));
         await supabase.from('nutrition_profiles').update({ weekly_menu: safeMenu }).eq('client_id', clientProfile.id);
      }
  };

  const handleSwapMeal = async (dayIndex: number, mealType: string, currentRecipeId: string) => {
      // Force dayIndex to match today when swapping from the Mon Jour view or if dayIndex points to the wrong day due to displayMenu sorting
      const realDayIndex = weeklyGeneratedMenu.findIndex(d => d.day === formattedCurrentDay);
      if (realDayIndex !== -1 && dayIndex === 0) dayIndex = realDayIndex;

      let currentRecipes: any[] = [];
      try {
          const recipeQuery = supabase.from('nutrition_recipes').select('*');
          const { data } = await recipeQuery;
          if (data && data.length > 0) {
              currentRecipes = data;
          } else {
              currentRecipes = DEFAULT_RECIPES;
          }
      } catch(e) {
          currentRecipes = DEFAULT_RECIPES;
      }

      currentRecipes = currentRecipes.filter(r => {
          const cat = r.categorie?.toLowerCase() || '';
          const nom = r.nom?.toLowerCase() || '';
          if (cat.includes('équipement') || cat.includes('accessoire') || cat.includes('pack')) return false;
          if (nom.includes('gourde') || nom.includes('blender') || nom.includes('t-shirt') || nom.includes('tote bag')) return false;
          if (nom.includes('pâte d\'arachide pure') || nom.includes('soumbala') || nom.includes('nététou') || nom.includes('épice')) return false;
          return true;
      });

      const allergies = clientProfile?.diagnostic_data?.allergies?.toLowerCase() || '';
      if (allergies && allergies !== 'aucune' && allergies !== 'non') {
          const allergyList = allergies.split(/[,;\s]+/).filter(Boolean);
          currentRecipes = currentRecipes.filter(r => !r.ingredients?.some((ing: any) => allergyList.some(al => ing.nom.toLowerCase().includes(al))));
      }

      // FILTRAGE BUDGET (MISSION)
      const userBudgetTier = clientProfile?.weekly_budget_tier || 'famille_15k';
      const budgetMapping: Record<string, string[]> = {
          'serre_8k': ['Serré 8k'],
          'famille_15k': ['Serré 8k', 'Famille 15k'],
          'confort_25k': ['Serré 8k', 'Famille 15k', 'Confort 25k']
      };
      const allowedTiers = budgetMapping[userBudgetTier] || budgetMapping['famille_15k'];
      currentRecipes = currentRecipes.filter(r => !r.budget_tier || allowedTiers.includes(r.budget_tier));

      const prevDayRecipeId = dayIndex > 0 ? weeklyGeneratedMenu[dayIndex - 1].meals[mealType]?.id : null;
      const nextDayRecipeId = dayIndex < 6 ? weeklyGeneratedMenu[dayIndex + 1].meals[mealType]?.id : null;

      let alternatives = currentRecipes.filter(r => r.type === mealType && r.id !== currentRecipeId && r.id !== prevDayRecipeId && r.id !== nextDayRecipeId);

      if (alternatives.length === 0) {
           alternatives = currentRecipes.filter(r => r.type === mealType && r.id !== currentRecipeId);
      }

      if (alternatives.length > 0) {
          let newRecipe = alternatives[Math.floor(Math.random() * alternatives.length)];

          if (trackingMode === 'guided') {
              const targetDailyCals = calorieGoal || 0;
              const mealTargets: Record<string, number> = isFastingMode ? {
                 'Déjeuner': targetDailyCals * 0.45,
                 'Collation': targetDailyCals * 0.20,
                 'Dîner': targetDailyCals * 0.35
              } : {
                 'Petit-déjeuner': targetDailyCals * 0.25, 'Déjeuner': targetDailyCals * 0.40, 'Collation': targetDailyCals * 0.10, 'Dîner': targetDailyCals * 0.25
              };
              const ratio = mealTargets[mealType] / (newRecipe.calories || mealTargets[mealType]);
              newRecipe = {
                  ...newRecipe,
                  calories: Math.round(mealTargets[mealType]),
                  proteins: Math.round((newRecipe.proteins || 0) * ratio),
                  carbs: Math.round((newRecipe.carbs || 0) * ratio),
                  fats: Math.round((newRecipe.fats || 0) * ratio),
                  ingredients: newRecipe.ingredients?.map((ing: any) => ({
                      ...ing, quantite: typeof ing.quantite === 'number' ? Number((ing.quantite * ratio).toFixed(1)) : ing.quantite
                  })) || []
              };
          }

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


  const getHealthyDate = (currentW: number, targetW: number) => {
    const weightToLose = currentW - targetW;
    if (weightToLose <= 0) return null;

    // Perte saine = max 1% du poids corporel par semaine.
    // On prend une moyenne plus douce de 0.5kg à 0.8kg par semaine pour être réaliste.
    const weeklyLoss = Math.min(0.8, currentW * 0.01);
    const weeksNeeded = weightToLose / weeklyLoss;
    const daysNeeded = weeksNeeded * 7;

    const healthyDate = new Date();
    healthyDate.setDate(healthyDate.getDate() + daysNeeded);
    return healthyDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

  const calculateDailyCalories = (data: any) => {
    // Conversion stricte exigée (Number)
    const heightCm = Number(data.height);
    const currentWeight = Number(data.currentWeight);
    const targetWInput = Number(data.targetWeight);
    const age = Number(data.age);
    const isMale = data.gender === "Homme";

    // 1. Calcul du BMR (Mifflin-St Jeor)
    let bmr = (heightCm > 0 && currentWeight > 0 && age > 0) ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161) : 0;

    // 2. Modificateur Hormonal & Médical
    const hasSOPK = data.femaleSpecific === "SOPK";
    const hasMeno = data.femaleSpecific === "Périménopause / Ménopause";
    const hasHypo = data.healthProfile === "Hypothyroïdie";
    if (data.gender === "Femme" && (hasSOPK || hasMeno || hasHypo)) {
        bmr = bmr * 0.90; // Malus métabolique de -10%
    }

    // 3. Calcul du TDEE via le NAP
    let nap = 1.2;
    if (data.dailyCommute === "Marche/Activité légère") nap = 1.375;
    else if (data.dailyCommute === "Travail physique/Modérée") nap = 1.55;
    else if (data.dailyCommute === "Sport intense/Intense") nap = 1.725;
    let tdee = bmr * nap;

    // Grossesse / Allaitement
    if (data.gender === "Femme" && (data.femaleSpecific === "Allaitement" || data.femaleSpecific === "Grossesse")) {
        tdee += 400;
    }

    // 4. Historique Régimes stricts (Effet YoYo)
    const isYoYo = data.pastDiets && (data.pastDiets.includes("régimes stricts") || data.pastDiets.includes("Oui"));
    const maxSafeDeficit = isYoYo ? 250 : 500; // Si YoYo on limite fortement le déficit

    let rawCalories = tdee;
    if (data.goal === 'perte_poids') {
        const weightToLose = currentWeight - targetWInput;
        let requiredDailyDeficit = maxSafeDeficit; // Par défaut perte saine

        if (data.targetDate) {
            const userTargetDate = new Date(data.targetDate);
            const daysToTarget = Math.max(1, Math.ceil((userTargetDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
            if (weightToLose > 0) {
                const calculatedDeficit = (weightToLose * 7700) / daysToTarget;
                requiredDailyDeficit = Math.min(calculatedDeficit, maxSafeDeficit);
            }
        }

        rawCalories = tdee - requiredDailyDeficit;

    } else if (data.goal === 'prise_masse') {
        rawCalories = tdee + 300;
    }

    // 5. Plancher Médical Absolu (Anti-privation : Interdit de descendre sous BMR)
    const floorCalories = Math.round(bmr);
    const finalCalories = Math.max(floorCalories, Math.round(rawCalories));

    let carbRatio = 0.50;
    let proteinRatio = 0.20;
    let fatRatio = 0.30;

    if (data.healthProfile === "Diabète" || data.healthProfile === "Pré-diabète" || data.femaleSpecific === "SOPK") {
        carbRatio = 0.40;
        proteinRatio = 0.25;
        fatsRatio = 0.35;
    }

    return {
        calories: finalCalories,
        deficit: Math.round(tdee - finalCalories),
        tdee: Math.round(tdee),
        hitFloor: finalCalories === floorCalories,
        hitCeiling: false,
        carbs_goal: Math.round((finalCalories * carbRatio) / 4),
        protein_goal: Math.round((finalCalories * proteinRatio) / 4),
        fats_goal: Math.round((finalCalories * fatRatio) / 9)
    };
};  const handleDiagSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      setIsSubmittingDiag(true);
      try {

      // On utilise le VRAI calculateur global qui intègre toutes les variables médicales
      const calcResult = calculateDailyCalories(diagData);
      const dailyCalories = calcResult.calories;

      let carbsRatio = 0.50;
      let proteinRatio = 0.20;
      let fatsRatio = 0.30;

      if (diagData.healthProfile === "Diabète" || diagData.healthProfile === "Pré-diabète" || diagData.femaleSpecific === "SOPK") {
          carbsRatio = 0.40;
          proteinRatio = 0.25;
          fatsRatio = 0.35;
      }

      const results = {
          calories: dailyCalories,
          bmr: Math.round(calcResult.tdee / 1.2), // Sera géré par le core engine
          tdee: calcResult.tdee,
          protein: Math.round((dailyCalories * proteinRatio) / 4),
          carbs: Math.round((dailyCalories * carbsRatio) / 4),
          fats: Math.round((dailyCalories * fatsRatio) / 9)
      };

      setCalorieGoal(results.calories);
          setProteinGoal(results.protein);
          setCarbsGoal(results.carbs);
          setFatsGoal(results.fats);

          if (clientProfile && user) {
              // Extract phone from diagData so it doesn't get inserted into diagnostic_data column causing 500
              const { phone, ...cleanDiagData } = diagData;
              const payload = {
                  client_id: clientProfile.id,
                  daily_calorie_goal: results.calories,
                  carbs_goal: results.carbs,
                  protein_goal: results.protein,
                  fats_goal: results.fats,
                  diagnostic_data: {
                      ...cleanDiagData,
                      bmr: results.bmr,
                      tdee: results.tdee
                  }
              };
              console.log("Payload du diagnostic (Espace Client):", payload);
              const { error } = await supabase.from('nutrition_profiles').upsert(payload, { onConflict: 'client_id' });
              if (error) {
                 alert("Erreur SQL lors de l'enregistrement : " + error.message);
                 throw error;
              }

              setBmr(results.bmr);
              setCalorieGoal(dailyCalories);
              setProteinGoal(payload.protein_goal);
              setCarbsGoal(payload.carbs_goal);
              setFatsGoal(payload.fats_goal);

              alert("Succès");
              setShowRedoDiagModal(false);
          }

      } catch (err: any) {
          alert("Erreur lors de l'enregistrement du diagnostic: " + err.message);
      } finally {
          setIsSubmittingDiag(false);
      }
  };

  const getGroceryList = () => {
      const list: any = { 'Produits Locaux / Épices': {}, 'Glucides & Laitages': {}, 'Protéines Fraîches': {} };
      const safeWeeklyMenu = Array.isArray(weeklyGeneratedMenu) ? weeklyGeneratedMenu : [];
      const cookingMultiplier = clientProfile?.diagnostic_data?.cooking_mode === 'pour_toute_la_famille' ? 4 : 1;
      const stapleIngredients = ['riz', 'huile', 'oignon', 'tomate', 'légumes']; // à affiner

      safeWeeklyMenu.forEach(dayInfo => {
          Object.values(dayInfo?.meals || {}).forEach((recipe: any) => {
              if (!recipe || !Array.isArray(recipe.ingredients)) return;
              recipe.ingredients.forEach((ing: any) => {
                  let finalRayon = ing.rayon || 'Glucides & Laitages';
                  if (ing.rayon === 'Boutique Onyx' || ing.rayon === 'Marché local') finalRayon = 'Produits Locaux / Épices';
                  if (ing.rayon === 'Boucherie / Pêche') finalRayon = 'Protéines Fraîches';

                  if (!list[finalRayon]) list[finalRayon] = {};

                  const isStaple = stapleIngredients.some(staple => ing.nom.toLowerCase().includes(staple));
                  const finalQuantity = isStaple ? ing.quantite * cookingMultiplier : ing.quantite;

                  if (list[finalRayon][ing.nom]) {
                      list[finalRayon][ing.nom].quantite += finalQuantity;
                  } else {
                      list[finalRayon][ing.nom] = { quantite: finalQuantity, unite: ing.unite, price_cfa: ing.price_cfa || 0 };
                  }
              });
          });
      });

      // Ajout conditionnel pour l'hypertension
      if (clientProfile?.diagnostic_data?.health_conditions?.includes('hypertension')) {
          if (!list['Produits Locaux / Épices']) list['Produits Locaux / Épices'] = {};
          if (!list['Produits Locaux / Épices']['Nététou / Soumbala']) {
              list['Produits Locaux / Épices']['Nététou / Soumbala'] = { quantite: 1, unite: 'sachet', price_cfa: 500 };
          }
      }

      return list;
  };

  const toggleExcludeIngredient = (nom: string) => {
      setExcludedIngredients(prev => {
          const newEx = prev.includes(nom) ? prev.filter(i => i !== nom) : [...prev, nom];
          if (clientProfile) {
              supabase.from('nutrition_profiles').update({ excluded_ingredients: newEx }).eq('client_id', clientProfile.id);
          }
          return newEx;
      });
  };

  const openProductModal = async (product: any) => {
      const newViews = (product.views || 0) + 1;
      setSelectedProduct({ ...product, views: newViews });
      setProductActiveImage(product.image_url);
      setProductMediaView('image');
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
          await supabase.from('nutrition_profiles').update({ pdf_history: newHistory }).eq('client_id', clientProfile.id);

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
          supabase.from('nutrition_profiles').update({ pdf_history: newHistory }).eq('client_id', clientProfile.id);
      }
  };



  const handleUpdateWater = async (delta: number) => {
    if (!clientProfile) return;
    const newAmount = Math.max(0, Math.min(waterGlasses + delta, 8));
    if (newAmount === waterGlasses) return; // Pas de changement

    setWaterGlasses(newAmount);

    if (waterGlasses === 7 && newAmount === 8) {
        updateXP(5, "Objectif d'eau quotidien atteint !");
    }

    // Vérification de la complétion des jauges
    const isNowCompleted = (calorieGoal > 0) && calories >= (calorieGoal * 0.85) && proteins >= (proteinGoal * 0.8) && carbs >= (carbsGoal * 0.8) && newAmount >= 8;
    let newlyCompletedGauges = false;
    if (isNowCompleted && !reportData.gaugesCompletedXP) {
        newlyCompletedGauges = true;
        updateXP(50, "Toutes les jauges complétées ! 🎯");
        setReportData((prev: any) => ({ ...prev, gaugesCompletedXP: true }));
        setRokhyMessage({ title: "Journée Parfaite ! 🎯", text: "Incroyable ! Tu as rempli toutes tes jauges aujourd'hui (Eau + Macros). Ton corps te remercie ! Profite de tes 50 XP bien mérités.", type: 'success' });
    }

    const todayLog = dailyLogs.find(l => l.log_date === todayStr);

    await supabase.from('nutrition_daily_logs').upsert({
      ...(todayLog?.id ? { id: todayLog.id } : {}),
      client_id: clientProfile.id,
      tenant_id: clientProfile.tenant_id || null,
      log_date: todayStr,
      water_glasses: newAmount,
      calories_consumed: calories,
      proteins_consumed: proteins,
      carbs_consumed: carbs,
      fats_consumed: fats,
      report_data: { ...reportData, consumedMeals, moods, moodNotes, ...(newlyCompletedGauges ? { gaugesCompletedXP: true } : {}) }
    }, { onConflict: 'client_id, log_date' });

    setDailyLogs(prev => {
      const filtered = prev.filter(l => l.log_date !== todayStr);
      const existing = prev.find(l => l.log_date === todayStr) || {};
      return [...filtered, { ...existing, client_id: clientProfile.id, log_date: todayStr, water_glasses: newAmount, calories_consumed: calories, proteins_consumed: proteins, carbs_consumed: carbs, fats_consumed: fats }];
    });
  };

  const handleTabChange = (tab: string) => {
      // Exit intent logic: check if user hasn't filled report today and it's past 20:00
      const now = new Date();
      const hasLoggedToday = dailyLogs.some(log => log.log_date === todayStr && log.report_data);
      const isSwitchingAway = tab !== 'today' && tab !== 'history' && activeTab !== tab;

      if (isSwitchingAway && now.getHours() >= 20 && !hasLoggedToday) {
          setIntendedTab(tab);
          setShowExitIntentModal(true);
          return;
      }
      setActiveTab(tab);
  };

  const handleMealClick = async (mealType: string, plannedMeal: any, forceMode?: string) => {
      setFoodSearchQuery("");
      setSelectedFoodDB(null);
      setFoodQuantity(1);
      setFoodUnit("portion");
      setSelectedMealPhoto(null);
      setSelectedMealModal({ type: mealType, meal: plannedMeal, mode: forceMode || trackingMode });

      // Log analytics (Incrémenter le compteur de vues de la recette)
      if (plannedMeal && plannedMeal.meal) {
         try {
            const { data: rec } = await supabase.from('nutrition_recipes').select('id, views').eq('nom', plannedMeal.meal).maybeSingle();
            if (rec) {
                await supabase.from('nutrition_recipes').update({ views: (rec.views || 0) + 1 }).eq('id', rec.id);
            }
         } catch(e) {}
      }
  };

  const confirmMealLog = async (mealType: string, mealName: string, cals: number, prots: number, mealCarbs: number, mealFats: number, foodObj?: any) => {
      // Éviter les doublons exacts si l'utilisateur clique plusieurs fois rapidement
      if (consumedMeals.some(m => m.name === mealName && m.type === mealType)) {
          setSelectedMealModal(null);
          return;
      }

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
         type: mealType,
         name: mealName,
         cals: calsRounded,
         prots: protsRounded,
         carbs: carbsRounded,
         fats: fatsRounded,
         time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
         ux_unit: foodObj?.ux_unit || foodObj?.portion_standard_nom || '1 portion',
         photo_url: selectedMealPhoto || foodObj?.image_url || null
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

      // Vérification de la complétion des jauges
      const isNowCompleted = (calorieGoal > 0) && newCals >= (calorieGoal * 0.85) && newProts >= (proteinGoal * 0.8) && newCarbs >= (carbsGoal * 0.8) && waterGlasses >= 8;
      let newlyCompletedGauges = false;
      if (isNowCompleted && !reportData.gaugesCompletedXP) {
          newlyCompletedGauges = true;
          updateXP(50, "Toutes les jauges complétées ! 🎯");
          setReportData((prev: any) => ({ ...prev, gaugesCompletedXP: true }));
      }

      setSelectedMealModal(null);

      // Sauvegarde des produits OpenFoodFacts validés dans la DB locale Onyx (Auto-apprentissage)
      if (foodObj?.is_from_off) {
         const newFoodDB = {
             nom: foodObj.nom,
             categorie: foodObj.categorie,
             portion_standard_nom: foodObj.portion_standard_nom,
             portion_standard_grammes: foodObj.portion_standard_grammes,
             valeurs_pour_100g: foodObj.valeurs_pour_100g,
             message_coach_ia: foodObj.message_coach_ia
         };
         supabase.from('nutrition_foods').insert([newFoodDB]).then(({error}) => {
             if (!error) setFoodDatabaseDB(prev => [...prev, { ...foodObj, is_from_off: false }]);
         });
      }

      // --- L'Intervention de l'Avatar IA (Rokhy) Évoluée ---
      let alertTitle = "Conseil Nutrition 🍏";
      let alertText = foodObj?.message_coach_ia || "Excellent choix ! Tu peux accompagner ça de notre Poudre de Moringa pour booster encore plus ton métabolisme !";
      let alertType: 'warning' | 'success' | 'info' = 'success';

      if (foodObj?.flags_ia?.ultra_transforme) {
         alertTitle = "Produit Ultra-Transformé ⚠️";
         alertText = foodObj.message_coach_ia || "Ce produit industriel contient souvent des additifs. Remplaçons-le par nos super-aliments naturels (Fonio, Moringa) disponibles dans la boutique Onyx !";
         alertType = 'warning';
      } else if (newlyCompletedGauges) {
         alertTitle = "Journée Parfaite ! 🎯";
         alertText = "Incroyable ! Tu as rempli toutes tes jauges aujourd'hui (Eau + Macros). Ton corps te remercie ! Profite de tes 50 XP bien mérités.";
         alertType = 'success';
      } else if (calsRounded > 600) {
         alertTitle = "Repas très calorique 🔥";
         alertText = "Oula ! Ce repas est très riche en énergie. Pense à boire notre infusion de Bissap Rouge ou Thé Vert Ataya pour accélérer la digestion !";
         alertType = 'warning';
      } else if (carbsRounded > 60) {
         alertTitle = "Alerte Glucides (Sucre) 🍞";
         alertText = "Ce plat va provoquer un pic d'insuline. La prochaine fois, remplace le riz par notre Fonio Premium à IG bas pour un ventre plat !";
         alertType = 'warning';
      } else if (foodObj?.flags_ia?.high_sodium) {
         alertTitle = "Attention au sel ! 🧂";
         alertText = foodObj.message_coach_ia || "Ce plat est très salé ! Remplace tes bouillons industriels par notre Soumbala / Nététou pur pour donner du goût tout en protégeant ton cœur.";
         alertType = 'warning';
      } else if (newFats > fatsGoal) {
         alertTitle = "Quota de lipides atteint 🥑";
         alertText = "Attention aux huiles ! Pour tes besoins en bonnes graisses sans excès, nos Noix de Cajou ou notre Pâte d'Arachide Pure sont parfaites. N'en rajoute plus aujourd'hui.";
         alertType = 'warning';
      }

      setRokhyMessage({ title: alertTitle, text: alertText, type: alertType });

      if (clientProfile) {
          const todayLog = dailyLogs.find(l => l.log_date === todayStr);
          await supabase.from('nutrition_daily_logs').upsert({
            ...(todayLog?.id ? { id: todayLog.id } : {}),
            client_id: clientProfile.id,
            tenant_id: clientProfile.tenant_id || null,
            log_date: todayStr,
            calories_consumed: newCals,
            proteins_consumed: newProts,
            carbs_consumed: newCarbs,
            fats_consumed: newFats,
            water_glasses: waterGlasses,
            report_data: { ...reportData, consumedMeals: updatedConsumedMeals, moods, moodNotes, ...(newlyCompletedGauges ? { gaugesCompletedXP: true } : {}) }
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
          const todayLog = dailyLogs.find(l => l.log_date === todayStr);
          await supabase.from('nutrition_daily_logs').upsert({
            ...(todayLog?.id ? { id: todayLog.id } : {}),
            client_id: clientProfile.id,
            tenant_id: clientProfile.tenant_id || null,
            log_date: todayStr,
            calories_consumed: newCals,
            proteins_consumed: newProts,
            carbs_consumed: newCarbs,
            fats_consumed: newFats,
            water_glasses: waterGlasses,
            report_data: { ...reportData, consumedMeals: updatedConsumedMeals, moods, moodNotes }
          }, { onConflict: 'client_id, log_date' });
      }
  };

  const handleProcessPayment = async () => {
     setShowPaymentModal(false);
     if (clientProfile) {
         const newDate = new Date();
         newDate.setDate(newDate.getDate() + 30);
         await supabase.from('clients').update({ expiration_date: newDate.toISOString().split('T')[0], plan_type: 'premium' }).eq('id', clientProfile.id);
         setDaysLeft(30);
         setClientProfile({...clientProfile, plan_type: 'premium', expiration_date: newDate.toISOString().split('T')[0]});
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
              flags_ia: { is_local_senegal: false, ig_bas: (nutriments.carbohydrates_100g < 15), high_sodium: (nutriments.sodium_100g > 0.6), ultra_transforme: product.nova_group === 4 || true },
              message_coach_ia: (nutriments.sugars_100g > 15) ? `Alerte Sucre (${nutriments.sugars_100g}g/100g) ! Attention aux pics d'insuline. Privilégiez des alternatives naturelles.` :
                                (nutriments.sodium_100g > 0.6) ? `Trop salé ! Risque de rétention d'eau. Remplacez-le par du Soumbala brut.` :
                                (product.nova_group === 4) ? `Produit ultra-transformé. À limiter fortement pour garder un ventre plat.` :
                                (nutriments.proteins_100g > 15) ? `Excellente source de protéines (${nutriments.proteins_100g}g) pour la satiété !` :
                                `Produit industriel scanné via OpenFoodFacts. Ajoutez-le à votre journal.`
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsPhotoScanning(true);
      setToastMessage("Analyse du plat en cours par l'IA... 📸");

      try {
          // Upload de l'image sur Supabase Storage en premier
          let publicUrl = "";
          const ext = file.name.split('.').pop();
          const fileName = `meals/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
          const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
          if (!uploadError) {
              const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
              publicUrl = urlData.publicUrl;
              setSelectedMealPhoto(publicUrl);
          }

          // --- APPEL RÉEL À L'EDGE FUNCTION SUPABASE ---
          const formData = new FormData();
          formData.append('image', file);

          const { data, error } = await supabase.functions.invoke('analyze-food-vision', {
              body: formData,
          });

          if (error || data.error) throw new Error(error?.message || data.error);

          const aiResult = {
              id: 'ia_scan_' + Date.now(),
              nom: data.nom || "Plat Analysé par IA",
              categorie: "Analyse IA",
              portion_standard_nom: "1 portion",
              portion_standard_grammes: 350,
              valeurs_pour_100g: {
                 calories: data.calories || 0,
                 proteines: data.proteines || 0,
                 glucides: data.glucides || 0,
                 lipides: data.lipides || 0,
                 fibres: 0
              },
              isFood: true,
              image_url: publicUrl,
              message_coach_ia: data.message_coach_ia || "Estimation générée automatiquement d'après la photo."
          };

          setSelectedFoodDB(aiResult);
          setFoodQuantity(1);
          setFoodUnit("portion");
          setFoodSearchQuery("Plat scanné via IA");
      } catch (err) {
          alert("Erreur lors de l'analyse de l'image.");
      } finally {
          setIsPhotoScanning(false);
          if (photoInputRef.current) photoInputRef.current.value = '';
      }
  };

  const handleSaveWeight = async () => {
      const lastLog = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;

      const newWeightVal = parseFloat(newWeight);
      if (isNaN(newWeightVal) || newWeightVal <= 0) return alert("Veuillez saisir un poids valide.");

      const startWeight = weightLogs.length > 0 ? weightLogs[0].weight : parseFloat(clientProfile?.diagnostic_data?.currentWeight || "0");
      const prevWeight = lastLog ? lastLog.weight : startWeight;
      const targetW = parseFloat(clientProfile?.diagnostic_data?.targetWeight || "0");
      const wantsToLose = targetW < startWeight;

      let isGoalReached = false;
      if (targetW > 0 && startWeight > 0) {
         if (wantsToLose && newWeightVal <= targetW) isGoalReached = true;
         if (!wantsToLose && newWeightVal >= targetW) isGoalReached = true;
      }

      if (isGoalReached) {
          setShowConfetti('weight');
          setTimeout(() => setShowConfetti(false), 8000);
          setWeightCoachMessage({ title: "Objectif Atteint ! 🎉", text: "INCROYABLE ! Tu as atteint ton objectif de poids. Félicitations pour tous tes efforts, tu es une vraie championne !", type: 'success' });
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
          audio.volume = 0.5;
          audio.play().catch(()=>{});
      }

      const newLog = { log_date: todayStr, weight: newWeightVal };
      setWeightLogs(prev => {
          const filtered = prev.filter(log => log.log_date !== todayStr);
          return [...filtered, newLog].sort((a,b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
      });

      if (clientProfile) {
          const payload = {
            client_id: clientProfile.id,
            tenant_id: clientProfile.tenant_id,
            log_date: todayStr,
            weight: newWeight
          };
          const { error: insertErr } = await supabase.from('nutrition_weight_logs').upsert(payload as any, { onConflict: 'client_id, log_date' });

          if (insertErr) {
              alert("Erreur lors de la sauvegarde du poids : " + insertErr.message);
              return;
          }

          const updatedDiagData = {
              ...(clientProfile.diagnostic_data || {}),
              currentWeight: newWeight.toString()
          };
          await supabase.from('nutrition_profiles').update({ diagnostic_data: updatedDiagData }).eq('client_id', clientProfile.id);
          setClientProfile((prev: any) => prev ? { ...prev, diagnostic_data: updatedDiagData } : prev);
      }

      if (newWeight < prevWeight) {
          setCoachFeedback({ type: 'success', text: "🎉 Félicitations ! La méthode fonctionne, tes efforts paient de manière incroyable. Continue comme ça !" });
      } else if (newWeight > prevWeight) {
          setCoachFeedback({ type: 'warning', text: "🌱 Ne t'en fais pas ! Une légère hausse est souvent due à de la rétention d'eau. Zéro culpabilité, on garde le cap avec ton Sama Menu !" });
      } else {
          setCoachFeedback({ type: 'neutral', text: "⚖️ Stabilité parfaite ! Ton corps consolide ses acquis. Reste constante !" });
      }

      setToastMessage("Poids enregistré avec succès !");
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteWeight = async (logDate: string) => {
    if (!clientProfile || !confirm(`Voulez-vous vraiment supprimer la pesée du ${new Date(logDate).toLocaleDateString('fr-FR')} ? Cette action est irréversible.`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('nutrition_weight_logs')
            .delete()
            .eq('client_id', clientProfile.id)
            .eq('log_date', logDate);

        if (error) throw error;

        setWeightLogs(prev => prev.filter(log => log.log_date !== logDate));
        setToastMessage("Pesée supprimée avec succès.");
        setTimeout(() => setToastMessage(null), 3000);

    } catch (err: any) {
        alert("Erreur lors de la suppression : " + err.message);
    }
  };

  const handleStoryUpload = async () => {
      if (!storyPreviewFile || !clientProfile) return;
      setIsUploadingStory(true);
      try {
          const fileExt = storyPreviewFile.name.split('.').pop();
          const fileName = `${clientProfile.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
              .from('community-stories')
              .upload(fileName, storyPreviewFile);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from('community-stories').getPublicUrl(fileName);
          const mediaUrl = urlData.publicUrl;
          const mediaType = storyPreviewFile.type.startsWith('video/') ? 'video' : 'image';

          const { error: insertError } = await supabase.from('nutrition_community_stories').insert({
              client_id: clientProfile.id,
              media_url: mediaUrl,
              media_type: mediaType,
              caption: storyCaption || null
          });

          if (insertError) throw insertError;

          setToastMessage("Story publiée avec succès !");
          setTimeout(() => setToastMessage(null), 3000);

          // Re-fetch stories to ensure persistence and correct grouped IDs
          const { data: rawStories } = await supabase
              .from('nutrition_community_stories')
              .select('*, clients!client_id(id, full_name, avatar_url), nutrition_story_views(viewer_id)')
              .order('created_at', { ascending: true });
          if (rawStories && rawStories.length > 0) {
              const mergedStories = [...rawStories];
              DEFAULT_SEED_STORIES.forEach(seed => {
                  if (!mergedStories.some(s => s.id === seed.id)) {
                      mergedStories.push(seed);
                  }
              });
              setStories(mergedStories);
          }
      } catch (err: any) {
          alert("Erreur lors de l'upload de la story : " + err.message);
      } finally {
          setIsUploadingStory(false);
          setStoryPreviewFile(null);
          setStoryPreviewUrl(null);
          setStoryCaption("");
      }
  };

  const TEXT_BACKGROUNDS = [
      "bg-gradient-to-br from-yellow-400 to-orange-500",
      "bg-gradient-to-br from-blue-500 to-purple-600",
      "bg-gradient-to-br from-green-400 to-[#39FF14]",
      "bg-gradient-to-br from-pink-500 to-rose-500",
      "bg-gradient-to-br from-zinc-800 to-black",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1783286332/IMG-20250820-WA0117_iegikb.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1781221768/Thiebou_dieune_1_hftdhm.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1783099524/Woman_drinking_clear_water_2K_202607031724_wuqqco.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444564/A_cute__highly_detailed_3D_202606141342_yn2v23.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1784458141/Dark_African_pattern_neon_lines_202607191030_dzkpqx.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1784458141/Dark_luxury_kitchen_countertop_s__202607191030_knxbcx.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1784458141/Woven_fabric_texture_charcoal_green_202607191031_hrc1bw.jpg')",
      "url('https://res.cloudinary.com/dtr2wtoty/image/upload/v1784458140/Baobab_leaves__hibiscus_flowers__2K_202607191031_gfkclt.jpg')"
  ];

  const handlePostCommunity = async () => {
      if (clientProfile?.plan_type !== 'premium' && daysLeft <= 0) return alert("La publication est réservée aux membres Premium pour garantir l'absence de spams.");
      if (!newPostText && !newPostImage && !newPostVideo && postMode !== 'text_only') return;

      const mediaType = postMode === 'text_only' ? 'text_only' : newPostVideo ? 'video' : newPostImage ? 'image' : 'text_only';

      const payload = {
          client_id: clientProfile?.id || null,
          content: newPostText,
          image_url: newPostImage || newPostVideo || null,
          media_type: mediaType,
          reactions: { top: 0, sain: 0, courage: 0 },
          location_name: locationName || null,
          tagged_friends: taggedFriends.length > 0 ? taggedFriends : null,
          text_bg_index: postMode === 'text_only' ? textBgIndex : null
      };

      const newPostLocal = {
          id: Date.now().toString(),
          client: user?.full_name || 'Membre',
          clients: { full_name: user?.full_name, avatar_url: user?.avatar_url },
          ...payload,
          created_at: new Date().toISOString()
      };

      setCommunityPosts([newPostLocal, ...communityPosts]);

      setNewPostText("");
      setNewPostImage(null);
      setNewPostVideo(null);
      setLocationName("");
      setTaggedFriends([]);
      setPostMode('normal');
      updateXP(15, "Publication dans le Feed");

      if (clientProfile) {
          const { error } = await supabase.from('nutrition_community_posts').insert(payload);
          if (error) {
              console.error("Erreur lors de la publication :", error.message);
              alert("Erreur de publication. Veuillez vérifier les permissions de la base de données.");
          } else {
              // Re-fetch to ensure sync with real IDs and potential triggers
              const { data: cPosts } = await supabase.from('nutrition_community_posts').select('*, clients!client_id(id, full_name, avatar_url)').order('created_at', { ascending: false });
              if (cPosts && cPosts.length > 0) {
                  setCommunityPosts(cPosts.map((p: any) => ({
                      ...p,
                      client: p.clients?.full_name || 'Membre'
                  })));
              }
          }
      }
  };

  const handleLikePost = async (postId: string, reactionType: string = 'Like') => {
      // Mapping the reaction to display emoji/color
      const reactionIcons: Record<string, { icon: string, color: string }> = {
          'Like': { icon: '👍', color: 'text-blue-500' },
          'Amour': { icon: '❤️', color: 'text-red-500' },
          'Contane': { icon: '😄', color: 'text-yellow-500' },
          'Faché': { icon: '😡', color: 'text-orange-600' },
          'Fier': { icon: '🔥', color: 'text-orange-500' }
      };

      setCommunityPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
              const currentLikes = post.reactions?.top || 0;
              // If already liked, we might just be changing reaction. For simplicity, just increment if not liked.
              const isNewLike = !post._likedByMe;
              return {
                  ...post,
                  reactions: { ...post.reactions, top: isNewLike ? currentLikes + 1 : currentLikes },
                  _likedByMe: true,
                  _myReaction: reactionIcons[reactionType] || reactionIcons['Like']
              };
          }
          return post;
      }));
      setActiveReactionPostId(null); // Close palette

      // Background async update
      try {
          const postToUpdate = communityPosts.find(p => p.id === postId);
          if (postToUpdate && !postToUpdate.id.startsWith('seed-')) {
             const currentLikes = postToUpdate.reactions?.top || 0;
             await supabase.from('nutrition_community_posts')
                  .update({ reactions: { ...postToUpdate.reactions, top: currentLikes + 1 } })
                  .eq('id', postId);

             // Insert specific reaction type into the reactions table for accurate historical persistence
             if (clientProfile) {
                 await supabase.from('nutrition_reactions').upsert({
                     post_id: postId,
                     client_id: clientProfile.id,
                     reaction_type: reactionType
                 }, { onConflict: 'post_id, client_id' });

                 // Silent notification trigger
                 if (postToUpdate.client_id && postToUpdate.client_id !== clientProfile.id) {
                     await supabase.from('nutrition_notifications').insert({
                         client_id: postToUpdate.client_id,
                         actor_id: clientProfile.id,
                         type: 'like',
                         target_id: postId,
                         message: `a réagi "${reactionType}" à votre publication.`
                     });
                 }
             }
          }
      } catch (err) {
          console.warn("Could not sync like to DB", err);
      }
  };

  const handleJoinChallenge = async () => {
      if (!activeChallenge || !clientProfile) return;
      setIsParticipating(true);
      setChallengeParticipants(prev => prev + 1);
      updateXP(10, "Inscription au Challenge");
      try {
          await supabase.from('nutrition_challenge_participants').insert({
              challenge_id: activeChallenge.id,
              client_id: clientProfile.id
          });
      } catch (err) {
          console.warn("Erreur inscription challenge", err);
      }
  };

  const handleDeletePost = async (postId: string) => {
      if (!confirm("Voulez-vous vraiment supprimer cette publication ?")) return;
      try {
          await supabase.from('nutrition_community_posts').delete().eq('id', postId);
          setCommunityPosts(prev => prev.filter(p => p.id !== postId));
          setToastMessage("Publication supprimée.");
          setTimeout(() => setToastMessage(null), 3000);
      } catch(e) {
          console.error("Erreur suppression post", e);
      }
  };

  const handleBookmarkPost = async (postId: string) => {
      if (!clientProfile) return;
      try {
          setCommunityPosts(prevPosts => prevPosts.map(post => {
              if (post.id === postId) return { ...post, _bookmarkedByMe: !post._bookmarkedByMe };
              return post;
          }));
          const isCurrentlyBookmarked = communityPosts.find(p => p.id === postId)?._bookmarkedByMe;

          if (!isCurrentlyBookmarked) {
              await supabase.from('nutrition_saved_posts').insert({
                  client_id: clientProfile.id,
                  post_id: postId
              });
              setToastMessage("Publication sauvegardée !");
          } else {
              await supabase.from('nutrition_saved_posts').delete().match({ client_id: clientProfile.id, post_id: postId });
              setToastMessage("Publication retirée des favoris.");
          }
          setTimeout(() => setToastMessage(null), 3000);
      } catch(e) {}
  };

  const handleRepost = async (post: any) => {
      if (!clientProfile) return;
      if (!confirm("Voulez-vous repartager cette publication sur votre mur ?")) return;

      const repostPayload = {
          client_id: clientProfile.id,
          content: post.content,
          image_url: post.image_url,
          media_type: post.media_type,
          reactions: { top: 0, sain: 0, courage: 0 },
          location_name: post.location_name,
          text_bg_index: post.text_bg_index,
          is_repost: true,
          original_post_id: post.id
      };

      const newPostLocal = {
          id: Date.now().toString(),
          client: user?.full_name || 'Membre',
          clients: { full_name: user?.full_name, avatar_url: user?.avatar_url },
          ...repostPayload,
          original_author: post.clients?.full_name || post.client,
          created_at: new Date().toISOString()
      };

      setCommunityPosts([newPostLocal, ...communityPosts]);
      setToastMessage("Publication repartagée !");
      setTimeout(() => setToastMessage(null), 3000);

      try {
          await supabase.from('nutrition_community_posts').insert(repostPayload);

          // Silent notification trigger
          if (post.client_id && post.client_id !== clientProfile.id) {
               await supabase.from('nutrition_notifications').insert({
                   client_id: post.client_id,
                   actor_id: clientProfile.id,
                   type: 'repost',
                   target_id: post.id,
                   message: `a repartagé votre publication.`
               });
          }
      } catch (err) {
          console.warn("Erreur repost", err);
      }
  };

  const handleFollowUser = async (userIdToFollow: string) => {
      if (!userIdToFollow) return;
      if (followedUsers.includes(userIdToFollow)) return; // already followed

      setFollowedUsers(prev => [...prev, userIdToFollow]);
      setToastMessage("Vous suivez maintenant ce Lekkologue !");
      setTimeout(() => setToastMessage(null), 3000);

      if (clientProfile && !userIdToFollow.startsWith('coach-') && !userIdToFollow.startsWith('chef-') && !userIdToFollow.startsWith('dr-')) {
          try {
              // Removed nutrition_followers fetch block to avoid 400 error

              // Silent notification trigger
              await supabase.from('nutrition_notifications').insert({
                  client_id: userIdToFollow,
                  actor_id: clientProfile.id,
                  type: 'follow',
                  target_id: clientProfile.id,
                  message: `a commencé à vous suivre.`
              });
          } catch(e) {}
      }
  };

  const handleUploadMealPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          setUploadingImage(true);
          const ext = file.name.split('.').pop();
          const fileName = `meals/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
          const { error } = await supabase.storage.from('avatars').upload(fileName, file);
          if (error) throw error;
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
          setSelectedMealPhoto(data.publicUrl);
      } catch (err: any) {
          alert("Erreur d'upload : " + err.message);
      } finally {
          setUploadingImage(false);
          if (mealPhotoInputRef.current) mealPhotoInputRef.current.value = '';
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        setUploadingImage(true);
        const ext = file.name.split('.').pop();
        const fileName = `${clientProfile?.id || 'unknown'}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        const { error, data: uploadData } = await supabase.storage.from('community-images').upload(fileName, file);
        if (error) throw error;

        const { data } = supabase.storage.from('community-images').getPublicUrl(fileName);
        setNewPostImage(data.publicUrl);
    } catch (err: any) {
        console.error("Erreur d'upload image:", err);
        alert("Erreur d'upload : " + err.message + "\nAssurez-vous que le bucket 'community-images' existe et est public.");
    } finally {
        setUploadingImage(false);
    }
  };
  const submitDailyReport = async () => {
    if (!clientProfile) return;
    setIsSubmittingReport(true);

    // Valeurs simulées du menu respecté pour l'exemple
    let currentCals = calories;
    let currentProts = proteins;
    if (reportData.followedMenu && currentCals === 0) {
        currentCals = calorieGoal;
        currentProts = proteinGoal;
        setCalories(currentCals);
        setProteins(currentProts);
    }

    const targetLog = dailyLogs.find(l => l.log_date === selectedReportDate);

    const payload = {
       ...(targetLog?.id ? { id: targetLog.id } : {}),
       client_id: clientProfile.id,
       tenant_id: clientProfile.tenant_id || null,
       log_date: selectedReportDate,
       report_data: { ...reportData, consumedMeals, moods, moodNotes },
       water_glasses: waterGlasses,
       calories_consumed: currentCals || 0,
       proteins_consumed: currentProts || 0,
       carbs_consumed: carbs || 0,
       fats_consumed: fats || 0
    };

    if (!navigator.onLine) {
       const offlineLogs = JSON.parse(localStorage.getItem('onyx_offline_daily_logs') || '[]');
       offlineLogs.push(payload);
       localStorage.setItem('onyx_offline_daily_logs', JSON.stringify(offlineLogs));
       if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then(reg => { (reg as any).sync.register('sync-daily-logs').catch(()=>console.log('Sync err')); });
       }
       alert("Mode hors-ligne : Votre bilan a été sauvegardé localement. Il sera synchronisé dès le retour d'Internet.");
       setShowDailyReport(false);
       setDailyLogs(prev => [...prev.filter(l => l.log_date !== selectedReportDate), payload]);
       setIsSubmittingReport(false);
       return;
    }

    try {
       const { error } = await supabase.from('nutrition_daily_logs').upsert(payload, { onConflict: 'client_id, log_date' });

       if (error) throw error;

       alert("Bilan de la journée enregistré avec succès ! L'IA adaptera votre menu de demain.");
       // Effet sonore de succès (Level Up)
       const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
       audio.volume = 0.5;
       audio.play().catch(()=>{});
       setShowDailyReport(false);
       const updatedLog = { client_id: clientProfile.id, log_date: selectedReportDate, report_data: { ...reportData, consumedMeals, moods, moodNotes }, water_glasses: waterGlasses, calories_consumed: currentCals, proteins_consumed: currentProts };
       setDailyLogs(prev => [...prev.filter(l => l.log_date !== selectedReportDate), updatedLog]);
    } catch (err: any) {
       alert("Erreur lors de l'enregistrement : " + err.message + "\nVeuillez vérifier que les colonnes carbs_consumed et fats_consumed existent dans nutrition_daily_logs.");
    } finally {
       setIsSubmittingReport(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !clientProfile) return;

    setIsSaving(true);
    try {
      const full_name = `${profileForm.firstName} ${profileForm.lastName}`.trim();

      // 1. Mise à jour des métadonnées (photo et nom)
      await supabase.auth.updateUser({
        data: { full_name, avatar_url: profileForm.avatar_url }
      });

      // 2. Mise à jour de la table clients (Nom, Photo, Cover, BIO)
      await supabase.from('clients').update({
        full_name,
        bio: profileForm.bio,
        avatar_url: profileForm.avatar_url,
        cover_url: profileForm.cover_url,
        instagram: profileForm.instagram,
        facebook: profileForm.facebook,
        twitter: profileForm.twitter
      }).eq('id', clientProfile.id);

      // 3. Fusion sécurisée des mesures sans effacer le reste du diagnostic
      const updatedDiagData = {
          ...clientProfile.diagnostic_data,
          startingWeight: Number(profileForm.startingWeight),
          currentWeight: Number(profileForm.currentWeight),
          goalWeight: Number(profileForm.goalWeight),
          targetWeight: Number(profileForm.goalWeight),
          height: Number(profileForm.height),
          waist: Number(profileForm.waist),
          hips: Number(profileForm.hips)
      };

      await supabase.from('nutrition_profiles').update({
          diagnostic_data: updatedDiagData
      }).eq('client_id', clientProfile.id);

      // 4. Update local state
      setUser({ ...user, full_name, avatar_url: profileForm.avatar_url });
      setClientProfile({
          ...clientProfile,
          full_name,
          bio: profileForm.bio,
          avatar_url: profileForm.avatar_url,
          cover_url: profileForm.cover_url,
          diagnostic_data: updatedDiagData
      });

      setToastMessage("Profil mis à jour avec succès !");
      setTimeout(() => setToastMessage(null), 3000);

    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  const dayIndex = new Date().getDay();
  const daysArray = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const formattedCurrentDay = daysArray[dayIndex];
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
     // Note: `tracking_mode` might not be a real column in `nutrition_profiles`.
     // If it's part of diagnostic_data or just doesn't exist, we save it there.
     // Also `phone` column doesn't exist in `nutrition_profiles`. Use client_id.
     if (clientProfile?.id) {
         const updatedDiag = { ...(clientProfile.diagnostic_data || {}), tracking_mode: mode };
         await supabase.from('nutrition_profiles').update({ diagnostic_data: updatedDiag }).eq('client_id', clientProfile.id);
         setClientProfile((prev: any) => prev ? { ...prev, diagnostic_data: updatedDiag } : prev);
     }
  };

  const handleToggleFasting = async () => {
     const newMode = !isFastingMode;
     setIsFastingMode(newMode);
     if (clientProfile) {
         const newDiag = { ...clientProfile.diagnostic_data, fasting_mode: newMode };
         await supabase.from('nutrition_profiles').update({ diagnostic_data: newDiag }).eq('client_id', clientProfile.id);
     }
     alert(newMode ? "Mode Jeûne Intermittent activé. Votre menu va être recalculé sans petit-déjeuner." : "Mode Jeûne désactivé. Le petit-déjeuner est de retour !");
     generateWeeklyMenu(newMode);
  };

  const handleExpertModeChange = async (mode: boolean) => {
      setIsExpertMode(mode);
      if (clientProfile) await supabase.from('nutrition_profiles').update({ expert_mode: mode }).eq('client_id', clientProfile.id);
  };


  useEffect(() => {
    if (selectedRecipeDetail?.id) {
        const fetchReviews = async () => {
            const { data } = await supabase.from('nutrition_recipe_reviews').select('*, clients(full_name, avatar_url)').eq('recipe_id', selectedRecipeDetail.id).order('created_at', { ascending: false });
            if (data) {
                setRecipeReviews(data);
                const userReview = data.find(r => r.client_id === user?.id);
                if (userReview) {
                    setHasUserReviewed(true);
                    setUserRating(userReview.rating);
                    setUserComment(userReview.comment);
                } else {
                    setHasUserReviewed(false);
                    setUserRating(5);
                    setUserComment('');
                }
            }
        };
        fetchReviews();
    }
  }, [selectedRecipeDetail?.id, user?.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
  }

  const toggleFavorite = async (meal: any) => {
      const mealName = meal.meal || meal.nom;
      const exists = favoriteMeals.find(f => (f.meal || f.nom) === mealName);
      let newFavs;
      let increment = 0;

      if (exists) {
          newFavs = favoriteMeals.filter(f => (f.meal || f.nom) !== mealName);
          increment = -1;
      } else {
          newFavs = [...favoriteMeals, meal];
          increment = 1;
      }
      setFavoriteMeals(newFavs);

      setAllRecipesDB(prev => prev.map(r => r.nom === mealName ? { ...r, likes: Math.max(0, (r.likes || 0) + increment) } : r));

      if (clientProfile) {
          await supabase.from('nutrition_profiles').update({ favorite_meals: newFavs }).eq('client_id', clientProfile.id);
      }

      // Mise à jour du compteur global de likes en base de données
      if (meal.id && !String(meal.id).startsWith('def_') && !String(meal.id).startsWith('gen_')) {
          const { data: rec } = await supabase.from('nutrition_recipes').select('likes').eq('id', meal.id).maybeSingle();
          if (rec) {
              await supabase.from('nutrition_recipes').update({ likes: Math.max(0, (rec.likes || 0) + increment) }).eq('id', meal.id);
          }
      }
  };

  const targetCalories = calorieGoal || 0;
  const targetCarbs = carbsGoal || 150;
  const targetProtein = proteinGoal || 80;
  const targetFats = fatsGoal || 50;

  const remainingCalories = Math.max(0, targetCalories - calories);
  const lvlInfo = getJongomaLevel(jongomaXP);

  const submitReview = async () => {
      if (!userComment.trim() || !selectedRecipeDetail) return;
      setIsSubmittingReview(true);
      try {
          await supabase.from('nutrition_recipe_reviews').upsert({
              recipe_id: selectedRecipeDetail.id,
              client_id: user?.id,
              rating: userRating,
              comment: userComment
          }, { onConflict: 'recipe_id,client_id' });

          setHasUserReviewed(true);
          // Refetch reviews
          const { data } = await supabase.from('nutrition_recipe_reviews').select('*, clients(full_name, avatar_url)').eq('recipe_id', selectedRecipeDetail.id).order('created_at', { ascending: false });
          if (data) setRecipeReviews(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsSubmittingReview(false);
      }
  };
const currentHour = new Date().getHours();
  const greetingText = currentHour < 18 ? "Bonjour" : "Bonsoir";

  // Logic for contextual personalized subtext
  const hasPendingReport = !reportData || reportData.length === 0;
  const isMorning = currentHour < 12;
  const isAfternoon = currentHour >= 12 && currentHour < 18;
  const isEvening = currentHour >= 18;

  let greetingSubtext = "Prête pour ta journée ?";
  if (isMorning) {
    if (waterGlasses < 2) {
      greetingSubtext = "N'oublie pas de boire tes premiers verres d'eau ! 💧";
    } else {
      greetingSubtext = "Super début de journée ! Continue comme ça. ☀️";
    }
  } else if (isAfternoon) {
    if (waterGlasses < 4) {
      greetingSubtext = "Une petite pause ? Pense à t'hydrater. 🚰";
    } else {
      greetingSubtext = "En pleine forme pour cet après-midi ! 🔥";
    }
  } else if (isEvening) {
    if (hasPendingReport) {
       greetingSubtext = "N'oublie pas de remplir ton Bilan Quotidien ! 📝";
    } else {
       greetingSubtext = "Excellente soirée, pense à bien te reposer. 🌙";
    }
  }


  const subTotal = shopCart.reduce((acc, item) => acc + ((item.finalPrice || item.prix_premium || item.prix_standard || 0) * (item.quantity || 1)), 0);
  const freeShippingThreshold = 20000;
  const progressPct = Math.min((subTotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subTotal);
  const crossSellProducts = (Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || []).filter((p: any) => !shopCart.some((c: any) => c.id === p.id)).slice(0, 2);

  // Calcul pour le badge de coaching (3 premiers jours)
  const createdDate = clientProfile?.created_at ? new Date(clientProfile.created_at) : new Date();
  const isNewUser = (new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24) <= 3;

  // Variables pour simplifier les conditions liées aux données de diagnostic
  const missingDiagGender = !clientProfile?.diagnostic_data?.gender;
  const missingDiagAge = !clientProfile?.diagnostic_data?.age;
  const missingDiagBirthDate = !clientProfile?.diagnostic_data?.birthDate;

  // Active le point rouge (dot) sur l'historique si l'utilisateur a débloqué au moins le premier badge (500 XP) mais qu'il ne se trouve pas actuellement sur cet onglet.
  const hasUnseenBadges = jongomaXP >= 500 && activeTab !== 'history';

  const menuItems = [
    { id: 'week', label: 'Sama Menu', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_1_uvgqf0.jpg" },
    { id: 'today', label: 'Mon Jour', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_2_akqmx4.jpg" },
    { id: 'favorites', label: 'Galerie Recettes', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540350/A_cute__highly_detailed_3D_202606151617_hk2xbf.jpg" },
    { id: 'community', label: 'Communauté', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781804851/camera_ohydou.jpg" },
    { id: 'weight', label: 'Mon Poids', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg" },
    { id: 'fitness', label: 'Fitness', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_3_punr1t.jpg" },
    { id: 'minute-doc', label: 'La Minute Doc', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781541191/A_cute__highly_detailed_3D_202606151632_qytnih.jpg" },
    { id: 'shop', label: 'Boutique', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_4_erkmnd.jpg" },
    { id: 'orders', label: 'Mes Commandes', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540553/A_cute__highly_detailed_3D_202606151621_l47tzv.jpg" },
    { id: 'blog', label: 'Blog & Conseils', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540516/remplacer_tittle_par_CONSEILS_NUTRITION_202606151619_tb8clu.jpg" },
    { id: 'coaching', label: 'Coaching', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540692/A_cute__highly_detailed_3D_202606151624_lzxhup.jpg" },
    { id: 'history', label: 'Historique', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_ytie6s.jpg", dot: hasUnseenBadges },
    { id: 'profile', label: 'Réglages', icon: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781536233/A_cute__highly_detailed_3D_202606151510_uj9z5c.jpg" },
  ];

  const addToCart = (product: any) => {
    const isPremium = clientProfile?.plan_type === 'premium';
    const price = isPremium ? product.prix_premium : product.prix_standard;
    storeAddToCart({ ...product, finalPrice: price });
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 400);
    setToastMessage(`Ajouté au panier : ${product.nom}`);
    setTimeout(() => setToastMessage(null), 3000);

    // Effet sonore (Pop)
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3");
    audio.volume = 0.5;
    audio.play().catch(()=>{});
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setShopCart(prevCart => {
        const itemToUpdate = prevCart.find(item => item.id === productId);
        // Si la quantité devient 0 ou moins, on supprime l'article
        if (itemToUpdate && (itemToUpdate.quantity || 1) + delta < 1) {
            return prevCart.filter(item => item.id !== productId);
        }
        // Sinon, on met à jour la quantité
        return prevCart.map(item =>
            item.id === productId
                ? { ...item, quantity: (item.quantity || 1) + delta }
                : item
        );
    });
  };

  const applyShopPromo = () => {
     const codeInput = shopPromoCode.trim().toUpperCase();
     let codeObj = shopPromoCodesDB.find(c => c.code.toUpperCase() === codeInput);

     // Injection forcée pour CODE10 si non présent dans la DB
     if (!codeObj && codeInput === 'CODE10') {
         codeObj = { code: 'CODE10', discount_pct: 10, min_xp: 0, active: true };
     }

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
      storeToggleSavedProduct(prod);
  };

  const handleReorder = (order: any) => {
     const itemsToAdd = order.items || [];

     itemsToAdd.forEach((item: any) => {
        const fullProduct = (Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || []).find((p: any) => p.id === item.id) || item;
        storeAddToCart({ ...fullProduct, finalPrice: item.finalPrice || item.price || fullProduct.prix_standard }, item.quantity || 1);
     });

     handleTabChange('cart');
     setToastMessage("Commande ajoutée au panier !");
     setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveMoodNotes = async () => {
     if (!clientProfile) return;
     setIsSaving(true);
     try {
         const todayLog = dailyLogs.find(l => l.log_date === todayStr);
         await supabase.from('nutrition_daily_logs').upsert({
           ...(todayLog?.id ? { id: todayLog.id } : {}),
           client_id: clientProfile.id,
           tenant_id: clientProfile.tenant_id || null,
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

  const handleDownloadDiagnosticPDF = async (sendWhatsApp: boolean = false) => {
      setIsSharingPDF(true);
      try {
          const doc = new jsPDF();
          doc.setFontSize(22);
          doc.text("Bilan Nutritionnel - Onyx", 14, 20);
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text(`Client : ${user?.full_name || 'Membre'}`, 14, 30);
          doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 14, 38);

          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text("Vos Nouveaux Objectifs", 14, 55);

          doc.setFontSize(12);
          doc.text(`• Calories : ${calorieGoal} kcal/jour`, 20, 65);
          doc.text(`• Protéines : ${proteinGoal} g`, 20, 73);
          doc.text(`• Glucides : ${carbsGoal} g`, 20, 81);
          doc.text(`• Lipides : ${fatsGoal} g`, 20, 89);

          if (sendWhatsApp) {
              const pdfBlob = doc.output('blob');
              const fileName = `Diagnostic_${user?.full_name?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
              const { error: uploadError } = await supabase.storage.from('tontines').upload(fileName, pdfBlob, { contentType: 'application/pdf' });
              if (uploadError) throw uploadError;
              const { data: urlData } = supabase.storage.from('tontines').getPublicUrl(fileName);

              const text = `Bonjour le coach ! 👋\nVoici mon nouveau bilan nutritionnel Onyx Nutrition 🍏 :\n\n${urlData.publicUrl}\n\nPouvons-nous en discuter pour adapter mon programme ?`;
              window.open(`https://wa.me/221785338417?text=${encodeURIComponent(text)}`, '_blank');
          } else {
              doc.save(`Diagnostic_Nutrition_${user?.full_name?.replace(/\s+/g, '_') || 'Client'}.pdf`);
          }
      } catch (err: any) {
          alert("Erreur lors de la génération du PDF : " + err.message);
      } finally {
          setIsSharingPDF(false);
      }
  };

  const logoSrc = 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781198743/Modify_the_logo_from_the_202606111717_kftori.jpg';

// @ts-ignore
  const tabProps = {
    today,
    todayStr,
    router,
    searchParams,
    photoInputRef,
    mealPhotoInputRef,
    thiernoChatEndRef,
    thiernoVoiceRef,
    sidebarTimeoutRef,
    toggleThiernoVoice,
    speakText,
    processThiernoReply,
    sendWaterReminderPush,
    storyInputRef,
    handleArticleClick,
    togglePushNotifications,
    imcValue,
    user,
    setUser,
    clientProfile,
    setClientProfile,
    loading,
    setLoading,
    daysLeft,
    setDaysLeft,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    blogCategory,
    setBlogCategory,
    blogSearch,
    setBlogSearch,
    trackingMode,
    setTrackingMode,
    dailyLogs,
    setDailyLogs,
    showRedoDiagModal,
    setShowRedoDiagModal,
    redoReason,
    setRedoReason,
    showPaymentModal,
    setShowPaymentModal,
    isScanning,
    setIsScanning,
    barcodeInput,
    setBarcodeInput,
    toastMessage,
    setToastMessage,
    isPhotoScanning,
    setIsPhotoScanning,
    calories,
    setCalories,
    waterGlasses,
    setWaterGlasses,
    bmr,
    setBmr,
    proteins,
    setProteins,
    carbs,
    setCarbs,
    fats,
    setFats,
    showDailyReport,
    setShowDailyReport,
    selectedReportDate,
    setSelectedReportDate,
    showExitIntentModal,
    setShowExitIntentModal,
    intendedTab,
    setIntendedTab,
    reportData,
    setReportData,
    isSubmittingReport,
    setIsSubmittingReport,
    consumedMeals,
    setConsumedMeals,
    moods,
    setMoods,
    moodNotes,
    setMoodNotes,
    selectedMealModal,
    setSelectedMealModal,
    selectedMealPhoto,
    setSelectedMealPhoto,
    foodSearchQuery,
    setFoodSearchQuery,
    offResults,
    setOffResults,
    isSearchingOFF,
    setIsSearchingOFF,
    selectedFoodDB,
    setSelectedFoodDB,
    foodQuantity,
    setFoodQuantity,
    foodDatabaseDB,
    setFoodDatabaseDB,
    foodUnit,
    setFoodUnit,
    allRecipesDB,
    setAllRecipesDB,
    recipeFilter,
    setRecipeFilter,
    selectedRecipeDetail,
    setSelectedRecipeDetail,
    recipeDetailTab,
    setRecipeDetailTab,
    recipeReviews,
    setRecipeReviews,
    userRating,
    setUserRating,
    userComment,
    setUserComment,
    isSubmittingReview,
    setIsSubmittingReview,
    hasUserReviewed,
    setHasUserReviewed,
    rokhyMessage,
    setRokhyMessage,
    isThiernoChatOpen,
    setIsThiernoChatOpen,
    isThiernoDismissed,
    setIsThiernoDismissed,
    thiernoUserReply,
    setThiernoUserReply,
    coachingChatStep,
    setCoachingChatStep,
    thiernoMessages,
    setThiernoMessages,
    isThiernoVoiceEnabled,
    setIsThiernoVoiceEnabled,
    diagStep,
    setDiagStep,
    isSubmittingDiag,
    setIsSubmittingDiag,
    diagData,
    setDiagData,
    forceTarget,
    setForceTarget,
    jongomaXP,
    setJongomaXP,
    weightLogs,
    setWeightLogs,
    newWeight,
    setNewWeight,
    showWeightModal,
    setShowWeightModal,
    currentWeightInput,
    setCurrentWeightInput,
    showConfetti,
    setShowConfetti,
    weightCoachMessage,
    setWeightCoachMessage,
    coachFeedback,
    setCoachFeedback,
    newPostText,
    setNewPostText,
    showLeaderboard,
    setShowLeaderboard,
    leaderboardData,
    setLeaderboardData,
    newPostImage,
    setNewPostImage,
    newPostVideo,
    setNewPostVideo,
    postMode,
    setPostMode,
    textBgIndex,
    setTextBgIndex,
    locationName,
    setLocationName,
    taggedFriends,
    setTaggedFriends,
    uploadingImage,
    setUploadingImage,
    communityPosts,
    setCommunityPosts,
    stories,
    setStories,
    groupedStories,
    setGroupedStories,
    isUploadingStory,
    setIsUploadingStory,
    storyPreviewFile,
    setStoryPreviewFile,
    storyPreviewUrl,
    setStoryPreviewUrl,
    storyCaption,
    setStoryCaption,
    viewerActiveGroupIndex,
    setViewerActiveGroupIndex,
    viewerActiveStoryIndex,
    setViewerActiveStoryIndex,
    isViewerPaused,
    setIsViewerPaused,
    isVideoMuted,
    setIsVideoMuted,
    viewerProgress,
    setViewerProgress,
    favoriteMeals,
    setFavoriteMeals,
    favoriteSearchQuery,
    setFavoriteSearchQuery,
    activeReactionPostId,
    setActiveReactionPostId,
    followedUsers,
    setFollowedUsers,
    isSaving,
    setIsSaving,
    activeChallenge,
    setActiveChallenge,
    showChallengeModal,
    setShowChallengeModal,
    isParticipating,
    setIsParticipating,
    challengeParticipants,
    setChallengeParticipants,
    earnedBadges,
    setEarnedBadges,
    notifications,
    setNotifications,
    pdfHistory,
    setPdfHistory,
    activeMenuPostId,
    setActiveMenuPostId,
    showSavedOnly,
    setShowSavedOnly,
    showCommentsPostId,
    setShowCommentsPostId,
    postComments,
    setPostComments,
    newCommentText,
    setNewCommentText,
    isSharingPDF,
    setIsSharingPDF,
    xpAnimation,
    setXpAnimation,
    showFirstBadgeModal,
    setShowFirstBadgeModal,
    showSecondBadgeModal,
    setShowSecondBadgeModal,
    calorieGoal,
    setCalorieGoal,
    proteinGoal,
    setProteinGoal,
    carbsGoal,
    setCarbsGoal,
    fatsGoal,
    setFatsGoal,
    isFastingMode,
    setIsFastingMode,
    isExpertMode,
    setIsExpertMode,
    weeklyGeneratedMenu,
    setWeeklyGeneratedMenu,
    showGroceryList,
    setShowGroceryList,
    excludedIngredients,
    setExcludedIngredients,
    profileForm,
    setProfileForm,
    showReminder,
    setShowReminder,
    welcomeMessage,
    setWelcomeMessage,
    isSidebarOpen,
    setIsSidebarOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showMobileHub,
    setShowMobileHub,
    myFollowersCount,
    setMyFollowersCount,
    selectedShopGoal,
    setSelectedShopGoal,
    selectedProduct,
    setSelectedProduct,
    shopDataDB,
    setShopDataDB,
    showOrderSuccessModal,
    setShowOrderSuccessModal,
    createdOrderRef,
    setCreatedOrderRef,
    userOrders,
    setUserOrders,
    shopPromoCodesDB,
    setShopPromoCodesDB,
    productMediaView,
    setProductMediaView,
    productActiveImage,
    setProductActiveImage,
    showZoneSuggestions,
    setShowZoneSuggestions,
    clientOrders,
    setClientOrders,
    hasTriggeredCartExit,
    setHasTriggeredCartExit,
    isCartBouncing,
    setIsCartBouncing,
    scratchedBlocks,
    setScratchedBlocks,
    shopBannerUrl,
    setShopBannerUrl,
    shopSearchQuery,
    setShopSearchQuery,
    shopMinPrice,
    setShopMinPrice,
    shopMaxPrice,
    setShopMaxPrice,
    articles,
    setArticles,
    pushEnabled,
    setPushEnabled,
    isOffline,
    setIsOffline,
    shopCart,
    addToCart,
    savedShopProducts,
    setGlobalShopProducts,
    setSavedShopProducts,
    handleLogout,
    generateWeeklyMenu,
    handleDailyReportSubmit,
    handleRefreshMeal,
    calculateWaterGoal,
    calculateProgress,
    calculateMacroPercentage,
    getMenuForDay,
    formatPrice,
    handleOrder,
    addToCartCustom,
    handleCheckout,
    handleApplyPromoCode,
    handleProductClick,
    handleStoryClick,
    handleCloseViewer,
    handleNextStory,
    handlePrevStory,
    pauseStory,
    resumeStory,
    handleStoryMediaClick,
    handleLikePost,
    handlePostSubmit,
    handleCommentSubmit,
    handleDeletePost,
    handleFollowUser,
    fetchLeaderboard,
    handleStoryUpload,
    closeStoryPreview,
    publishStory,
    openMealModal,
    handleCloseMealModal,
    handleSearchFood,
    handleAddFood,
    handleMealPhotoUpload,
    analyzeMealPhoto,
    handleWeightSubmit,
    generatePDFMenu,
    handleSaveChallenge,
    handleJoinChallenge,
    handleOpenRecipe,
    handleCloseRecipe,
    handleRecipeReviewSubmit,
    addThiernoMessage,
    simulateThiernoResponse,
    handleThiernoVoiceInput,
    handleThiernoDismiss,
    handleClearHistory,
    handleRedoDiagnostic,
    handleOfflineStatus,
    fetchPosts,
    fetchStories,
    handleTabChange,
    greetingText,
    greetingSubtext,
    lvlInfo,
    openLeaderboard,
    handleUpdateWater,
    todayPlan,
    deleteMealLog,
    spaceGrotesk,
    toggleFavorite,
    CALS_ICON,
    PROTEINS_ICON,
    MENU_ICONS,
    downloadHistoryPDF,
    WATER_ICON,
    handleChangeAvatar,
    handleSaveProfile,
    emblaNewArrivalsRef,
    openProductModal,
    SHOP_GOALS,
    toggleSaveProduct,
    handleTrackingModeChange,
    remainingCalories,
    targetCalories,
    CARBS_ICON,
    FATS_ICON,
    formattedCurrentDay,
    confirmMealLog,
    handleSwapMeal,
    crossSellProducts,
    downloadGroceryListPDF,
    guessVisualPortion,
    getGroceryList,
    weeklyMenus,
    handleDeleteWeight,
    handleSaveWeight,
    clearCart,
    setShopPromoCode,
    handleToggleComments,
    handleLikeComment,
    handlePostComment,
    setSelectedArticle,
    selectedArticle,
    emblaBlogRef,
    TEXT_BACKGROUNDS,
    handleImageUpload,
    handlePostCommunity,
    handleRepost,
    handleBookmarkPost,
    supabase,
    setShowFoodSearch,
    updateCartQuantity,
    handleMealClick,
    removeFromCart,
    deliveryCost,
    deliveryAddress,
    setDeliveryAddress,
    loadRecipeReviews
  };

  return (
    <div className={`flex flex-col min-h-screen w-full overflow-x-hidden ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-[#f4f4f5] text-zinc-900'} font-sans selection:bg-[#39FF14]/30 transition-colors duration-300 pb-20 lg:pb-0`}>

      {/* IMMERSIVE RECIPE MODAL */}
      <AnimatePresence>
        {selectedRecipeDetail && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-6"
          >
            <div className="w-full sm:max-w-2xl bg-white dark:bg-zinc-950 h-[90vh] sm:h-[85vh] sm:rounded-[3rem] rounded-t-[3rem] overflow-hidden flex flex-col relative shadow-2xl">
              {/* Image Hero Section */}
              <div className="relative w-full h-1/3 sm:h-2/5 shrink-0">
                <img src={selectedRecipeDetail.image_url || 'https://placehold.co/800x600/111/39FF14?text=Recette'} alt={selectedRecipeDetail.nom} className="absolute inset-0 w-full h-full object-cover" />

                <button onClick={() => {
                    const shareText = `Je viens de découvrir la recette de ${selectedRecipeDetail.nom} sur l'app NutriAfro ! 🔥 Télécharge l'app pour voir les ingrédients et cuisiner avec moi : https://nutriafro.app`;
                    if (navigator.share) {
                        navigator.share({ title: selectedRecipeDetail.nom, text: shareText, url: 'https://nutriafro.app' }).catch(console.error);
                    } else {
                        navigator.clipboard.writeText(shareText);
                        alert("Lien de partage copié !");
                    }
                }} className="absolute top-6 right-20 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-md transition-all z-10 shadow-lg border border-white/50">
                  <Share2 size={20} />
                </button>

                <button onClick={() => setSelectedRecipeDetail(null)} className="absolute top-6 right-6 bg-black/50 hover:bg-black text-white p-3 rounded-full backdrop-blur-md transition-all z-10 shadow-lg">
                  <X size={20} />
                </button>
              </div>

              {/* Glassmorphism Container over Image */}
              <div className="flex-1 overflow-y-auto bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md rounded-t-[40px] -mt-10 relative z-10 p-8 flex flex-col custom-scrollbar pb-32 border-t border-white/20">
                <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0"></div>

                <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black dark:text-white mb-2 leading-none`}>{selectedRecipeDetail.nom}</h2>
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 mb-6">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-black dark:text-white"/> {selectedRecipeDetail.preparation_time || 15} min</span>
                    <span className="flex items-center gap-1.5"><Eye size={14} className="text-black dark:text-white"/> {selectedRecipeDetail.views || 0} vues</span>
                </div>

                {/* Macro Pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <span className="bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><img src={CALS_ICON} className="w-4 h-4"/> {selectedRecipeDetail.calories} kcal</span>
                    <span className="bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><img src={PROTEINS_ICON} className="w-4 h-4"/> {selectedRecipeDetail.proteins}g Prot</span>
                    <span className="bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><img src={CARBS_ICON} className="w-4 h-4"/> {selectedRecipeDetail.carbs || 0}g Gluc</span>
                    <span className="bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><img src={FATS_ICON} className="w-4 h-4"/> {selectedRecipeDetail.fats || 0}g Lip</span>
                </div>

                {/* Navigation Pills */}
                <div className="flex gap-2 mb-6 bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl">
                    {['apercu', 'ingredients', 'preparation', 'avis'].map((tab) => (
                        <button key={tab} onClick={() => setRecipeDetailTab(tab as any)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${recipeDetailTab === tab ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>
                            {tab === 'apercu' ? 'Aperçu' : tab === 'ingredients' ? 'Ingrédients' : tab === 'preparation' ? 'Préparation' : 'Avis'}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 animate-in fade-in">
                    {recipeDetailTab === 'apercu' && (
                        <div className="space-y-4">
                            <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                {selectedRecipeDetail.description_courte || "Une recette délicieuse et saine, parfaitement équilibrée pour vous aider à atteindre vos objectifs nutritionnels."}
                            </p>
                        </div>
                    )}

                    {recipeDetailTab === 'ingredients' && (
                        <div className="space-y-3">
                            {selectedRecipeDetail.ingredients && selectedRecipeDetail.ingredients.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedRecipeDetail.ingredients.map((ing: any, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl">
                                            <div className="w-2 h-2 bg-[#39FF14] rounded-full shrink-0"></div>
                                            <span className="text-sm font-bold text-black dark:text-white">{ing.nom || ing}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-zinc-500 italic text-sm">Liste détaillée des ingrédients à venir.</p>
                            )}
                        </div>
                    )}

                    {recipeDetailTab === 'preparation' && (
                        <div className="space-y-4">
                            {selectedRecipeDetail.instructions ? (
                                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-loose whitespace-pre-line bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem]">
                                    {selectedRecipeDetail.instructions}
                                </div>
                            ) : (
                                <p className="text-zinc-500 italic text-sm">Instructions de préparation à venir.</p>
                            )}
                        </div>
                    )}

                    {recipeDetailTab === 'avis' && (
                        <div className="space-y-6">
                            {/* Nouveau Avis */}
                            <div className="bg-zinc-50 p-4 rounded-2xl">
                                <h4 className="font-bold text-sm mb-3">Laisser un avis</h4>
                                <div className="flex items-center gap-2 mb-3">
                                    {[1,2,3,4,5].map(star => (
                                        <button key={star} onClick={() => setUserRating(star)} className="focus:outline-none">
                                            <Star className={`w-6 h-6 ${userRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={userComment}
                                    onChange={e => setUserComment(e.target.value)}
                                    placeholder="Partagez votre avis sur cette recette..."
                                    className="w-full bg-white border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#39FF14]"
                                    rows={3}
                                />
                                <button onClick={() => submitReview(selectedRecipeDetail.id)} disabled={isSubmittingReview} className="mt-3 w-full bg-black text-[#39FF14] font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                                    {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publier mon avis'}
                                </button>
                            </div>

                            {/* Liste Avis */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm flex items-center justify-between">
                                    Avis de la communauté
                                    <span className="text-zinc-500 font-normal">{recipeReviews.length} avis</span>
                                </h4>
                                {recipeReviews.length === 0 ? (
                                    <p className="text-zinc-500 text-sm italic">Soyez le premier à donner votre avis !</p>
                                ) : (
                                    recipeReviews.map(review => (
                                        <div key={review.id} className="border-b border-zinc-100 pb-4 last:border-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden">
                                                        <img src={review.clients?.avatar_url || 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg'} alt={review.clients?.prenom} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-bold text-sm">{review.clients?.prenom || 'Utilisateur'}</span>
                                                </div>
                                                <div className="flex">
                                                    {[1,2,3,4,5].map(star => (
                                                        <Star key={star} className={`w-3 h-3 ${review.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-sm text-zinc-600 pl-10">{review.comment}</p>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* Fixed Action Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-white/50 dark:bg-zinc-950/80 dark:border-zinc-800 z-50 pb-safe">
                  <button onClick={() => {
                      confirmMealLog(selectedRecipeDetail.type || 'Déjeuner', selectedRecipeDetail.nom, selectedRecipeDetail.calories || selectedRecipeDetail.cals || selectedRecipeDetail.kcal || 0, selectedRecipeDetail.proteins || selectedRecipeDetail.prots || 0, selectedRecipeDetail.carbs || 0, selectedRecipeDetail.fats || 0, selectedRecipeDetail);
                      alert("Ajouté au tracker du jour !");
                      setSelectedRecipeDetail(null);
                  }} className="w-full bg-black text-[#39FF14] py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 shadow-2xl">
                      <PlusCircle size={20}/> Ajouter au repas
                  </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 15px rgba(57,255,20,0.1)); transform: scale(1); }
          50% { opacity: 0.85; filter: drop-shadow(0 0 25px rgba(57,255,20,0.4)); transform: scale(1.02); }
        }
        .animate-gentle-pulse {
          animation: gentle-pulse 4s ease-in-out infinite;
        }
      `}} />

      {/* ANIMATION LUDIQUE DE CONFETTIS */}
      {showConfetti && (
        <div className="fixed inset-0 z-[500] pointer-events-none overflow-hidden">
          {[...Array(60)].map((_, i) => {
            const emojis = showConfetti === 'weight'
              ? ['🎉', '⚖️', '💪', '🔥', '🏆', '✨']
              : ['🎉', '✨', '🏆', '🥬', '🎯', '🥑'];
            return (
              <div
                key={i}
                className="absolute top-[-10%] opacity-0 text-3xl md:text-5xl drop-shadow-lg"
                style={{
                  left: `${Math.random() * 100}%`,
                  animation: `fall-${i % 2 === 0 ? 'left' : 'right'} ${2 + Math.random() * 3}s ease-in forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                {emojis[i % emojis.length]}
              </div>
            );
          })}
          <style dangerouslySetInnerHTML={{__html: `@keyframes fall-left { 0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg) translateX(-50px); opacity: 0; } } @keyframes fall-right { 0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(-360deg) translateX(50px); opacity: 0; } }`}} />
        </div>
      )}

      {/* SIDEBAR VERTICAL */}


      {/* NOUVEAU HEADER GLASSMORPHISM */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#39FF14]/30 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro" className="h-12 w-auto object-contain cursor-pointer" onClick={() => handleTabChange('dashboard')} />
        </div>

        {/* MÉGA-MENU (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => handleTabChange('dashboard')} className="flex items-center gap-2 font-black uppercase text-[11px] tracking-widest text-black hover:text-[#39FF14] transition-colors py-2 bg-zinc-50 px-4 rounded-full border border-zinc-200"><img src={MENU_ICONS.dashboard} className="w-5 h-5 rounded-full object-cover shadow-sm"/> Accueil</button>
            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <UserIcon size={14}/> Mon Espace <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => handleTabChange('today')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.monJour} className="w-5 h-5 rounded" alt="" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} /> Mon Jour</button>
                    <button onClick={() => handleTabChange('history')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.dashboard} className="w-5 h-5 rounded" alt="" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} /> Historique</button>
                    <button onClick={() => handleTabChange('profile')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><UserIcon size={14} className="text-[#39FF14]"/> Profil</button>
                </div>
            </div>

            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <TrendingUp size={14}/> Nutrition <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => handleTabChange('week')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.samaMenu} className="w-5 h-5 rounded" alt="" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} /> Sama Menu</button>
                    <button onClick={() => handleTabChange('favorites')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><BookOpen size={14} className="text-[#39FF14]"/> Galerie Recettes</button>
                </div>
            </div>

            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <MessageSquare size={14}/> Réseau <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => handleTabChange('community')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><Heart size={14} className="text-red-500"/> Communauté</button>
                    <button onClick={() => handleTabChange('coaching')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.coaching} className="w-5 h-5 rounded" alt="" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} /> Coaching</button>
                    <button onClick={() => handleTabChange('blog')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.blog} className="w-5 h-5 rounded" alt="" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} /> Doc & Astuces</button>
                    <button onClick={() => handleTabChange('fitness')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.fitness} className="w-5 h-5 rounded" alt="" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} /> Fitness</button>
                    <button onClick={() => handleTabChange('minute-doc')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><Video size={14} className="text-[#39FF14]"/> La Minute Doc</button>

                </div>
            </div>

<button onClick={() => handleTabChange('shop')} className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-sm">
                    <img src={MENU_ICONS.shop} className="w-4 h-4 rounded" alt="" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} /> Boutique
                </button>
        </div>

        {/* Actions Droite */}
        <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-white border border-zinc-200 rounded-full px-3 py-1.5 shadow-sm">
                <Search size={14} className="text-zinc-400" />
                <input type="text" placeholder="Chercher une recette, un membre..." className="bg-transparent border-none text-xs text-zinc-700 outline-none w-48 focus:w-64 transition-all ml-2 placeholder:text-zinc-400" />
            </div>

            {/* Toggles */}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-400 hover:text-yellow-500 transition-colors shadow-sm" title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}>
                {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
            </button>

            <button onClick={() => { setIsExpertMode(!isExpertMode); handleExpertModeChange(!isExpertMode); }} className={`p-2 rounded-full border transition-colors shadow-sm ${isExpertMode ? 'bg-[#39FF14]/10 border-[#39FF14] text-[#39FF14]' : 'bg-white border-zinc-200 text-zinc-400 hover:text-black'}`} title={isExpertMode ? "Mode Expert Actif" : "Mode Simple"}>
                {isExpertMode ? <Eye size={16}/> : <EyeOff size={16}/>}
            </button>

            {/* Cart */}
            <button onClick={() => handleTabChange('cart')} className={`relative p-2 rounded-full bg-white border transition-all shadow-sm ${isCartBouncing ? 'scale-125 border-[#39FF14] text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.5)] z-[100]' : 'border-zinc-200 text-zinc-400 hover:text-black'}`}>
                <ShoppingCart size={16} />
                {shopCart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#39FF14] text-black w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-black animate-pulse shadow-md">
                        {shopCart.length}
                    </span>
                )}
            </button>

            {/* Avatar Dropdown */}
            <div className="relative group ml-2">
                <button className="flex items-center gap-2 focus:outline-none">
                    <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Membre')}&background=random`} alt="Profil" className="w-9 h-9 rounded-full border-2 border-[#39FF14]/50 object-cover shadow-sm" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50 flex flex-col">
                    <button onClick={() => handleTabChange('profile')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><UserIcon size={14}/> Mon Profil</button>
                    <div className="h-px w-full bg-zinc-100"></div>
                    <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/nutriafro-login'; }} className="px-4 py-3 text-xs font-bold text-red-500 text-left hover:bg-red-50 flex items-center gap-2"><LogOut size={14}/> Déconnexion</button>
                </div>
            </div>

            {/* Theme Toggle */}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-full transition-colors hidden md:flex">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Mobile Menu Toggle */}
            <button onClick={() => setShowMobileHub(true)} className="lg:hidden p-2 text-zinc-700 z-50 cursor-pointer relative"><MenuIcon size={24}/></button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col min-w-0 overflow-x-hidden w-full transition-all duration-500 bg-gradient-to-br from-white to-[#39FF14]/5`}>

                {activeTab === 'minute-doc' && (<MinuteDocTab {...tabProps} />)}
                {activeTab === 'dashboard' && (<DashboardTab1 {...tabProps} />)}
                {activeTab === 'dashboard' && (<DashboardTab2 {...tabProps} />)}
                {activeTab === 'today' && (<TodayTab {...tabProps} />)}
                {activeTab === 'week' && (<WeekTab {...tabProps} />)}
                {activeTab === 'cart' && (<CartTab {...tabProps} />)}
                {activeTab === 'orders' && (<OrdersTab1 {...tabProps} />)}
                {activeTab === 'profile' && (<ProfileTab {...tabProps} />)}
                {activeTab === 'favorites' && (<FavoritesTab {...tabProps} />)}
                {activeTab === 'orders' && (<OrdersTab2 {...tabProps} />)}
                {activeTab === 'shop' && (<ShopTab {...tabProps} />)}
                {activeTab === 'history' && (<HistoryTab {...tabProps} />)}
                {activeTab === 'blog' && selectedArticle && (<BlogArticleTab {...tabProps} />)}
                {activeTab === 'blog' && !selectedArticle && (<BlogListTab {...tabProps} />)}
                {activeTab === 'coaching' && (<CoachingTab {...tabProps} />)}
                {activeTab === 'weight' && (<WeightTab {...tabProps} />)}
                {activeTab === 'fitness' && (<FitnessTab {...tabProps} />)}
                {activeTab === 'community' && (<CommunityTab {...tabProps} />)}

</main>

      {/* BOT THIERNO (COACH MÉDECIN) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        {isThiernoChatOpen && (
          <div className={`rounded-[2rem] shadow-2xl border-2 border-[#39FF14] p-0 mb-4 w-[calc(100vw-2rem)] md:w-[340px] h-[450px] max-h-[70vh] flex flex-col animate-in zoom-in duration-300 overflow-hidden ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}>
             <div className="bg-black p-4 flex justify-between items-center border-b border-zinc-800">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-[#39FF14] flex items-center justify-center text-xl overflow-hidden"><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781448403/A_photorealistic_portrait_of_the_202606141444_qcvy4q.jpg" alt="Dr. Thierno" className="w-full h-full object-cover" /></div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#39FF14] rounded-full border border-black animate-pulse"></div>
                   </div>
                   <div><p className="text-[#39FF14] font-black uppercase text-xs">Dr. Thierno</p><p className="text-zinc-400 text-[9px] uppercase font-bold tracking-widest">Coach Nutrition</p></div>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={toggleThiernoVoice} className={`p-2 rounded-full transition ${isThiernoVoiceEnabled ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`} title="Activer/Désactiver la voix">{isThiernoVoiceEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}</button>
                   <button onClick={() => setIsThiernoChatOpen(false)} className="text-zinc-400 hover:text-white transition"><X size={18}/></button>
                </div>
             </div>

             <div className={`flex-1 p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
                {thiernoMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                      <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? (theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-zinc-800 border-zinc-200') + ' border rounded-tl-none shadow-sm' : 'bg-black text-[#39FF14] rounded-tr-none shadow-md'}`}>
                         {msg.text}
                      </div>
                   </div>
                ))}
                <div ref={thiernoChatEndRef} />
             </div>

             <div className={`p-3 border-t flex gap-2 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <input type="text" value={thiernoUserReply} onChange={e => setThiernoUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processThiernoReply(thiernoUserReply)} placeholder="Poser une question..." className={`flex-1 rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-black ${theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-black'}`} />
                <button onClick={() => processThiernoReply(thiernoUserReply)} className="bg-black p-3 rounded-xl text-[#39FF14] hover:scale-105 transition"><CheckCircle size={18}/></button>
             </div>
          </div>
        )}

        {!isThiernoChatOpen && !isThiernoDismissed && (
           <div className="relative group animate-bounce flex items-center justify-center">
             <button
               onClick={(e) => { e.stopPropagation(); setIsThiernoDismissed(true); }}
               className="absolute -top-1 -right-1 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-black p-1 rounded-full z-10 transition-colors shadow-sm"
               aria-label="Fermer l'assistant"
             >
               <X size={14} />
             </button>
             <button onClick={() => setIsThiernoChatOpen(true)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#39FF14] hover:scale-110 transition-transform bg-black relative flex items-center justify-center text-3xl">
               <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781448403/A_photorealistic_portrait_of_the_202606141444_qcvy4q.jpg" alt="Dr. Thierno" className="w-full h-full object-cover" />
             </button>
           </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] px-6 py-3 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 z-[400] animate-in slide-in-from-bottom-5">
             <CheckCircle size={16}/> {toastMessage}
         </div>
      )}

      {/* BOTTOM NAVIGATION MOBILE */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-4 py-2 z-[100] pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
         <button onClick={() => { handleTabChange('week'); setShowMobileHub(false); }} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'week' ? 'opacity-100' : 'opacity-50'}`}><img src={MENU_ICONS.samaMenu} className="w-5 h-5 rounded-md object-cover"/><span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Sama Menu</span></button>
         <button onClick={() => { handleTabChange('today'); setShowMobileHub(false); }} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'today' ? 'opacity-100' : 'opacity-50'}`}><img src={MENU_ICONS.monJour} className="w-5 h-5 rounded-md object-cover"/><span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Mon Jour</span></button>
         <div className="flex-1 flex justify-center -mt-6">
            <button onClick={() => { handleMealClick('Collation', null, 'flexible'); setTimeout(() => setIsScanning(true), 300); }} className="bg-black text-[#39FF14] w-14 h-14 rounded-full shadow-[0_10px_20px_rgba(57,255,20,0.3)] border-4 border-[#f4f4f5] dark:border-zinc-950 flex items-center justify-center hover:scale-110 transition-transform"><ScanLine size={24}/></button>
         </div>
         <button onClick={() => { handleTabChange('shop'); setShowMobileHub(false); }} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'shop' ? 'opacity-100' : 'opacity-50'}`}><img src={MENU_ICONS.shop} className="w-5 h-5 rounded-md object-cover"/><span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Boutique</span></button>
         <button onClick={() => setShowMobileHub(true)} className={`flex flex-col items-center gap-1 flex-1 opacity-50`}><MenuIcon size={20} className="text-zinc-500"/><span className="text-[8px] font-black uppercase tracking-widest mt-0.5 text-zinc-500">Menu</span></button>
      </div>

    </div>
  );
}
