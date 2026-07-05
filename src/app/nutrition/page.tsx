"use client";
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Dumbbell, Send, TrendingDown, Bookmark, MoreHorizontal } from "lucide-react";
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";


import { supabase } from "@/lib/supabaseClient";
import { 
  ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Sun, Moon, Activity, Calendar, Clock, ArrowRight, Sparkles, HeartPulse, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, X, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, MessageCircle, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, Image as ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, Share2, AlertTriangle, Package, Minus, Plus, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3
, PartyPopper } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, ReferenceLine, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import jsPDF from "jspdf";

const spaceGrotesk = { className: "font-sans" };

const FATS_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375735/A_cute__highly_detailed_3D_202606131826_jbhb58.jpg";
const WATER_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375733/A_cute__highly_detailed_3D_202606131825_3_jyrhrd.jpg";
const PROTEINS_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375734/A_cute__highly_detailed_3D_202606131825_2_roav76.jpg";
const CARBS_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375738/A_cute__highly_detailed_3D_202606131825_1_epyark.jpg";
const CALS_ICON = "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781375768/A_cute__highly_detailed_3D_202606131825_mxabkm.jpg";

const MENU_ICONS = {
  dashboard: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1783099228/Smart_home_icon_UI_UX_202607031719_w62euy.jpg",
  samaMenu: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_1_uvgqf0.jpg",
  monJour: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_2_akqmx4.jpg",
  fitness: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_3_punr1t.jpg",
  shop: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535958/A_cute__highly_detailed_3D_202606151505_4_erkmnd.jpg",
  profile: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781536233/A_cute__highly_detailed_3D_202606151510_uj9z5c.jpg",
  community: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1783098237/8_v1l6ms.png",
  minuteDoc: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781541191/A_cute__highly_detailed_3D_202606151632_qytnih.jpg",
  galerieRecettes: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444566/supprimer_le_frame__remplace_le_202606141341_ayzsoe.jpg",
  monPoids: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg",
  blog: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781540516/remplacer_tittle_par_CONSEILS_NUTRITION_202606151619_tb8clu.jpg",
  coaching: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444564/A_cute__highly_detailed_3D_202606141342_yn2v23.jpg"
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
  const [user, setUser] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  
  // Nouveaux états de l'application Nutrition
  const [activeTab, setActiveTab] = useState<any>('dashboard');
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

  // Coach IA "Rokhy"
  const [rokhyMessage, setRokhyMessage] = useState<{title: string, text: string, type: 'warning'|'success'|'info'} | null>(null);

  // Coach IA "Thierno" (Médecin)
  const [isThiernoChatOpen, setIsThiernoChatOpen] = useState(false);
  const [isThiernoDismissed, setIsThiernoDismissed] = useState(false);
  const [thiernoUserReply, setThiernoUserReply] = useState("");
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
  const [currentWeightInput, setCurrentWeightInput] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean | string>(false);
  const [weightCoachMessage, setWeightCoachMessage] = useState<{title: string, text: string, type: 'warning'|'success'|'info'} | null>(null);
  const [coachFeedback, setCoachFeedback] = useState<{ type: 'success' | 'warning' | 'neutral'; text: string } | null>(null);
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
  const [emblaShopRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]);
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

  const [profileForm, setProfileForm] = useState({ full_name: "", avatar_url: "", password: "" });
  const [showReminder, setShowReminder] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  const [productMediaView, setProductMediaView] = useState<'image' | 'video'>('image');
  const [productActiveImage, setProductActiveImage] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [appliedPromoData, setAppliedPromoData] = useState<any>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartExitIntent, setShowCartExitIntent] = useState(false);
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

  const [emblaNewArrivalsRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]);

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
                let prodQuery = supabase.from('nutrition_products').select('*');
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
                let promoQuery = supabase.from('nutrition_promo_codes').select('*').eq('active', true);
                const { data: dbPromos } = await promoQuery;
                if (dbPromos) setShopPromoCodesDB(dbPromos);

                // Fetch Community Posts
                const { data: cPosts } = await supabase.from('nutrition_community_posts').select('*, clients(full_name)').order('created_at', { ascending: false });
                if (cPosts) {
                    setCommunityPosts(cPosts.map((p: any) => ({
                        ...p,
                        client: p.clients?.full_name || 'Membre'
                    })));
                }

                // Fetch Foods
                const { data: dbFoods } = await supabase.from('nutrition_foods').select('*');
                if (dbFoods) setFoodDatabaseDB(dbFoods);

                // Fetch All Recipes for Gallery
                let recipeQuery = supabase.from('nutrition_recipes').select('*');
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

      setUser({ ...finalUser, full_name: finalUser?.user_metadata?.full_name || finalUser?.full_name || "Membre" });
      setProfileForm({
         full_name: finalUser?.user_metadata?.full_name || finalUser?.full_name || "",
         avatar_url: finalUser?.user_metadata?.avatar_url || finalUser?.avatar_url || "",
         password: ""
      });

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

          // Récupérer le profil nutritionnel (via Supabase ou localStorage)
          const { data: nutritionData } = await supabase
            .from('nutrition_profiles')
            .select('*')
            .eq('client_id', activeProfile.id)
            .maybeSingle();

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

  }, [router, searchParams]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && shopCart.length > 0 && !hasTriggeredCartExit) {
        setShowCartExitIntent(true);
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
      } else if (jongomaXP < 2000 && newXP >= 2000) {
          leveledUp = true;
          setRokhyMessage({ title: "Nouveau Badge Débloqué ! 🌟", text: "Incroyable ! Tu as atteint le niveau Star Nutrition ! Un grand bravo pour ta régularité, c'est exceptionnel !", type: 'success' });
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 8000);
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
          audio.volume = 0.5;
          audio.play().catch(()=>{});
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
          let recipeQuery = supabase.from('nutrition_recipes').select('*');
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

      let newMenu: any[] = [];
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
              proteins: Math.round((recipe.proteins || 0) * ratio),
              carbs: Math.round((recipe.carbs || 0) * ratio),
              fats: Math.round((recipe.fats || 0) * ratio),
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

          let breakfasts = activeFastingMode ? [] : getAvailable('Petit-déjeuner');
          let lunches = getAvailable('Déjeuner');
          let dinners = getAvailable('Dîner');
          let snacks = getAvailable('Collation');

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
      let currentRecipes: any[] = [];
      try {
          let recipeQuery = supabase.from('nutrition_recipes').select('*');
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
    const heightCm = parseFloat(data.height) || 0;
    const currentWeight = parseFloat(data.currentWeight) || 0;
    const targetWInput = parseFloat(data.targetWeight) || 0;
    const age = parseFloat(data.age) || 0;
    const isMale = data.gender === "Homme";

    // 1. Calcul du BMR (Mifflin-St Jeor)
    let bmr = (heightCm > 0 && currentWeight > 0 && age > 0) ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161) : 0;

    // 2. Modificateur Hormonal (SOPK / Ménopause / Hypothyroïdie)
    if (data.gender === "Femme" && (data.femaleSpecific === "SOPK" || data.femaleSpecific === "Périménopause / Ménopause" || data.healthProfile === "Hypothyroïdie")) {
        bmr = bmr * 0.90; // Malus métabolique de -10%
    }

    // 3. Calcul du TDEE via le NAP
    let nap = 1.2;
    if (data.dailyCommute === "Marche/Activité légère") nap = 1.375;
    else if (data.dailyCommute === "Travail physique/Modérée") nap = 1.55;
    else if (data.dailyCommute === "Sport intense/Intense") nap = 1.725;
    let tdee = bmr * nap;

    // 4. Bonus Allaitement / Grossesse
    if (data.gender === "Femme" && (data.femaleSpecific === "Allaitement" || data.femaleSpecific === "Grossesse")) {
        tdee += 400; // Bonus énergétique vital pour la maman
    }

    // 5. Calcul du déficit (selon la date cible)
    let requiredDailyDeficit = 0;
    const userTargetDate = data.targetDate ? new Date(data.targetDate) : new Date();
    const now = new Date();
    const daysToTarget = Math.max(1, Math.ceil((userTargetDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
    const weightToLose = currentWeight - targetWInput;

    if (data.goal === 'perte_poids' && weightToLose > 0) {
        requiredDailyDeficit = (weightToLose * 7700) / daysToTarget;
    }

    // 6. Plafond du déficit (Max 1000 kcal/jour pour éviter la fonte musculaire)
    if (requiredDailyDeficit > 1000) {
        requiredDailyDeficit = 1000;
    }

    let rawCalories = tdee;
    if (data.goal === 'perte_poids') rawCalories = tdee - requiredDailyDeficit;
    else if (data.goal === 'prise_masse') rawCalories = tdee + 300;
    // Si Maintien, rawCalories = tdee

    // 7. Plancher Médical (Anti-privation : Interdit de descendre sous 1200/1500)
    const floorCalories = isMale ? 1500 : 1200;
    const finalCalories = Math.max(floorCalories, rawCalories);

    return {
        calories: Math.round(finalCalories),
        deficit: Math.round(tdee - finalCalories),
        tdee: Math.round(tdee),
        hitFloor: finalCalories === floorCalories,
        hitCeiling: requiredDailyDeficit === 1000
    };
};




  const handleDiagSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      setIsSubmittingDiag(true);
      try {

      const calcResult = calculateDailyCalories(diagData);
      const dailyCalories = calcResult.calories;

      // Ratios standards
      let carbsRatio = 0.50;
      let proteinRatio = parseFloat(diagData.age) >= 50 ? 0.35 : 0.30;
      let fatsRatio = 1 - carbsRatio - proteinRatio;

      // Règle spécifique : Diabète (Limitation stricte des glucides à 40%)
      if (diagData.healthProfile === "Diabète") {
          carbsRatio = 0.40;
          proteinRatio = 0.35; // Hausse des protéines pour compenser
          fatsRatio = 0.25;    // Hausse des lipides sains
      }

      const carbs = Math.round((dailyCalories * carbsRatio) / 4);
      const protein = Math.round((dailyCalories * proteinRatio) / 4);
      const fats = Math.round((dailyCalories * fatsRatio) / 9);

      const results = {
          calories: dailyCalories,
          carbs: carbs,
          protein: protein,
          fats: fats,
          bmr: calcResult.tdee,
          tdee: calcResult.tdee,
          isCapped: calcResult.hitFloor || calcResult.deficit >= 1000,
          healthyDate: diagData.targetDate
      };


          localStorage.setItem('onyx_nutrition_goals', JSON.stringify({
              calories: results.calories,
              carbs: results.carbs,
              protein: results.protein,
              fats: results.fats
          }));
          setCalorieGoal(results.calories);
          setProteinGoal(results.protein);
          setCarbsGoal(results.carbs);
          setFatsGoal(results.fats);

          if (clientProfile && user) {
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
          const { error: insertErr } = await supabase.from('nutrition_weight_logs').upsert(payload, { onConflict: ['client_id', 'log_date'] });

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

    const todayLog = dailyLogs.find(l => l.log_date === todayStr);

    const payload = {
       ...(todayLog?.id ? { id: todayLog.id } : {}),
       client_id: clientProfile.id,
       tenant_id: clientProfile.tenant_id || null,
       log_date: todayStr,
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
       setDailyLogs(prev => [...prev.filter(l => l.log_date !== todayStr), payload]);
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
       const updatedLog = { client_id: clientProfile.id, log_date: todayStr, report_data: { ...reportData, consumedMeals, moods, moodNotes }, water_glasses: waterGlasses, calories_consumed: currentCals, proteins_consumed: currentProts };
       setDailyLogs(prev => [...prev.filter(l => l.log_date !== todayStr), updatedLog]);
    } catch (err: any) {
       alert("Erreur lors de l'enregistrement : " + err.message + "\nVeuillez vérifier que les colonnes carbs_consumed et fats_consumed existent dans nutrition_daily_logs.");
    } finally {
       setIsSubmittingReport(false);
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

  const currentHour = new Date().getHours();
  const greetingText = currentHour < 18 ? "Bonjour" : "Bonsoir";
  const greetingSubtext = currentHour < 18 ? "Prête pour ta journée ?" : "Pense à t'hydrater ce soir.";

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
    { id: 'favorites', label: 'Galerie Recettes', icon: MENU_ICONS.galerieRecettes },
    { id: 'community', label: 'Communauté', icon: MENU_ICONS.community },
    { id: 'weight', label: 'Mon Poids', icon: MENU_ICONS.monPoids },
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
    const existingItem = shopCart.find(item => item.id === product.id);
    if (existingItem) {
        setShopCart(shopCart.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item));
    } else {
        const isPremium = clientProfile?.plan_type === 'premium';
        const price = isPremium ? product.prix_premium : product.prix_standard;
        setShopCart([...shopCart, { ...product, finalPrice: price, quantity: 1 }]);
    }
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
    if (shopCart.length === 0) return alert("Votre panier est vide.");
    if (!deliveryAddress.trim()) {
        alert("Veuillez renseigner votre adresse de livraison dans le panier avant de commander.");
        setShowCartModal(true);
        return;
    }

    const discountPct = isShopPromoApplied && appliedPromoData ? appliedPromoData.discount_pct : 0;
    const discountMultiplier = 1 - (discountPct / 100);
    
    const originalTotal = shopCart.reduce((acc, item) => acc + ((item.finalPrice || item.prix_premium || item.prix_standard || 0) * (item.quantity || 1)), 0);
    const discountAmount = Math.round(originalTotal * (discountPct / 100));
    const total = Math.round(originalTotal * discountMultiplier);
    const cartText = shopCart.map(item => `- ${item.quantity}x ${item.nom} (${((item.finalPrice || item.prix_premium || item.prix_standard || 0) * item.quantity).toLocaleString()} F)`).join('\n');

    // Sauvegarde en DB
    if (clientProfile) {
       const tenantIdToUse = shopCart[0]?.tenant_id || clientProfile.tenant_id || '';
       const { data, error } = await supabase.from('nutrition_orders').insert({
          client_id: clientProfile.id,
          tenant_id: tenantIdToUse || null,
          client_name: user?.full_name || 'Inconnu',
          phone: clientProfile.phone || '',
          items: shopCart.map(p => ({ id: p.id, nom: p.nom, quantity: p.quantity, finalPrice: p.finalPrice })),
          total: total,
          status: 'Nouveau',
          promo_code: isShopPromoApplied && appliedPromoData ? appliedPromoData.code : null,
          discount_amount: discountAmount,
          address: deliveryAddress
       }).select();
       
       if (error) {
           console.error("Erreur commande:", error);
           alert("Oups, impossible de sauvegarder la commande dans l'historique. Erreur : " + error.message);
       } else if (data && data.length > 0) {
           setClientOrders([data[0], ...clientOrders]);
           await supabase.from('clients').update({ address: deliveryAddress }).eq('id', clientProfile.id);
       }
    }

    let msg = `Bonjour ! Je souhaite commander les produits suivants sur la boutique Onyx Nutrition :\n\n${cartText}\n\n*Total : ${total} F*\n`;
    if (isShopPromoApplied && appliedPromoData) {
       msg += `\n *Promo VIP ${appliedPromoData.code} (-${appliedPromoData.discount_pct}%) appliquée !*\n`;
    }
    msg += `\nMon nom : ${user?.full_name}\nTéléphone : ${clientProfile?.phone || ''}\n\n*Adresse de livraison :* ${deliveryAddress}`;

    window.open(`https://wa.me/221785338417?text=${encodeURIComponent(msg)}`, "_blank");
    setShopCart([]);
    setIsShopPromoApplied(false);
    setShopPromoCode("");
    setAppliedPromoData(null);
  };

  const handleReorder = (order: any) => {
     let updatedCart = [...shopCart];
     const itemsToAdd = order.items || [];
     
     itemsToAdd.forEach((item: any) => {
        const fullProduct = (Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || []).find((p: any) => p.id === item.id) || item;
        const existing = updatedCart.find(c => c.id === item.id);
        if (existing) {
           existing.quantity += (item.quantity || 1);
        } else {
           updatedCart.push({ ...fullProduct, quantity: item.quantity || 1, finalPrice: item.finalPrice || item.price || fullProduct.prix_standard });
        }
     });
     
     setShopCart(updatedCart);
     setShowCartModal(true);
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

  return (
    <div className={`flex flex-col min-h-screen w-full overflow-x-hidden ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-[#f4f4f5] text-zinc-900'} font-sans selection:bg-[#39FF14]/30 transition-colors duration-300 pb-20 lg:pb-0`}>
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
            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro" className="h-12 w-auto object-contain cursor-pointer" onClick={() => setActiveTab('dashboard')} />
        </div>

        {/* MÉGA-MENU (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 font-black uppercase text-[11px] tracking-widest text-black hover:text-[#39FF14] transition-colors py-2 bg-zinc-50 px-4 rounded-full border border-zinc-200"><img src={MENU_ICONS.dashboard} className="w-5 h-5 rounded-full object-cover shadow-sm"/> Accueil</button>
            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <UserIcon size={14}/> Mon Espace <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => setActiveTab('today')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.monJour} className="w-5 h-5 rounded" alt=""/> Mon Jour</button>
                    <button onClick={() => setActiveTab('history')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.dashboard} className="w-5 h-5 rounded" alt=""/> Historique</button>
                    <button onClick={() => setActiveTab('profile')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><UserIcon size={14} className="text-[#39FF14]"/> Profil</button>
                </div>
            </div>

            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <TrendingUp size={14}/> Nutrition <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => setActiveTab('week')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.samaMenu} className="w-5 h-5 rounded" alt=""/> Sama Menu</button>
                    <button onClick={() => setActiveTab('favorites')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.galerieRecettes} className="w-5 h-5 rounded" alt=""/> Galerie Recettes</button>
                </div>
            </div>

            <div className="relative group">
                <button className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                    <MessageSquare size={14}/> Réseau <ChevronDown size={12}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
                    <button onClick={() => setActiveTab('community')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.community} className="w-5 h-5 rounded" alt=""/> Communauté</button>
                    <button onClick={() => setActiveTab('coaching')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.coaching} className="w-5 h-5 rounded" alt=""/> Coaching</button>
                    <button onClick={() => setActiveTab('blog')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.blog} className="w-5 h-5 rounded" alt=""/> Doc & Astuces</button>
                    <button onClick={() => setActiveTab('fitness')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.fitness} className="w-5 h-5 rounded" alt=""/> Fitness</button>
                    <button onClick={() => setActiveTab('minute-doc')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><img src={MENU_ICONS.minuteDoc} className="w-5 h-5 rounded" alt=""/> La Minute Doc</button>

                </div>
            </div>

<button onClick={() => setActiveTab('shop')} className="bg-white border border-[#39FF14] text-zinc-700 hover:bg-[#39FF14] hover:text-black rounded-full px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-sm">
                    <img src={MENU_ICONS.shop} className="w-4 h-4 rounded" alt=""/> Boutique
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

            <button onClick={() => handleExpertModeChange(!isExpertMode)} className={`p-2 rounded-full border transition-colors shadow-sm ${isExpertMode ? 'bg-[#39FF14]/10 border-[#39FF14] text-[#39FF14]' : 'bg-white border-zinc-200 text-zinc-400 hover:text-black'}`} title="Toggle Kcal">
                <Eye size={16}/>
            </button>

            {/* Cart */}
            <button onClick={() => setShowCartModal(true)} className={`relative p-2 rounded-full bg-white border transition-all shadow-sm ${isCartBouncing ? 'scale-125 border-[#39FF14] text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.5)] z-[100]' : 'border-zinc-200 text-zinc-400 hover:text-black'}`}>
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
                    <button onClick={() => setActiveTab('profile')} className="px-4 py-3 text-xs font-bold text-zinc-700 text-left hover:bg-zinc-50 flex items-center gap-2"><UserIcon size={14}/> Mon Profil</button>
                    <div className="h-px w-full bg-zinc-100"></div>
                    <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/nutriafro-login'; }} className="px-4 py-3 text-xs font-bold text-red-500 text-left hover:bg-red-50 flex items-center gap-2"><LogOut size={14}/> Déconnexion</button>
                </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-zinc-700"><MenuIcon size={24}/></button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col min-w-0 overflow-x-hidden w-full transition-all duration-500 bg-gradient-to-br from-white to-[#39FF14]/5`}>
      {/* Header */}


      <div className="w-full max-w-7xl mx-auto px-6 mt-12 space-y-12">
{/* GREETING INJECTED */}

{activeTab === 'minute-doc' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
             <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-6 w-full">
                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781541191/A_cute__highly_detailed_3D_202606151632_qytnih.jpg" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0 shadow-lg" alt="La Minute Doc" />
                <div>
                   <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter text-black dark:text-white flex items-center flex-wrap gap-3 mb-2`}>
                      La Minute Doc <span className="bg-black text-[#39FF14] text-[12px] px-3 py-1 rounded-full shadow-sm">Par Dr. Thierno</span>
                   </h2>
                   <p className="text-zinc-500 font-bold text-sm">Découvrez nos podcasts et vidéos explicatives pour mieux comprendre votre corps et votre alimentation.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: "1", title: "Le Fonio fait-il vraiment maigrir ?", videoUrl: "https://www.youtube.com/embed/acFsObjm2E0", duration: "12:05" },
                  { id: "2", title: "Comment remplacer le cube Maggi ?", videoUrl: "https://www.youtube.com/embed/acFsObjm2E0", duration: "08:30" },
                  { id: "3", title: "Le danger des jus locaux trop sucrés", videoUrl: "https://www.youtube.com/embed/acFsObjm2E0", duration: "15:20" },
                  { id: "4", title: "L'attaya et la perte de poids", videoUrl: "https://www.youtube.com/embed/acFsObjm2E0", duration: "10:45" },
                  { id: "5", title: "Jeûne intermittent & plats africains", videoUrl: "https://www.youtube.com/embed/acFsObjm2E0", duration: "18:10" }
                ].map((podcast, idx) => (
                   <div key={idx} className="bg-zinc-950 p-4 rounded-[2rem] border border-zinc-800 shadow-xl flex flex-col group hover:border-[#39FF14] transition-colors">
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-zinc-900 border border-zinc-800">
                         <iframe src={`${podcast.videoUrl}?controls=1&rel=0`} className="w-full h-full border-0" allowFullScreen></iframe>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                         <h3 className="text-white font-black uppercase leading-tight mb-2 group-hover:text-[#39FF14] transition-colors">{podcast.title}</h3>
                         <div className="flex justify-between items-center mt-2">
                             <span className="bg-white/10 text-zinc-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> {podcast.duration}</span>
                             <button onClick={() => window.open(podcast.videoUrl, '_blank')} className="text-zinc-500 hover:text-white p-2 transition-colors"><ExternalLink size={16}/></button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4">
            <div>
              {isOffline && (
                 <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md w-max mb-2"><WifiOff size={10}/> Mode Hors-ligne</span>
              )}
              <h1 className={`${spaceGrotesk.className} text-[2.5rem] md:text-4xl font-black uppercase tracking-tighter text-black`}>
                {greetingText}, <span className="text-zinc-600">{user?.full_name?.split(' ')[0] || 'Membre'}</span> !
              </h1>
              <p className="text-zinc-500 font-bold text-sm mt-1">{greetingSubtext}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className={`flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border ${xpAnimation ? 'border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'border-zinc-200 shadow-sm'} cursor-pointer hover:border-[#39FF14] transition-all duration-300`} title={lvlInfo.desc + " - Cliquez pour voir le classement"} onClick={openLeaderboard}>
                  <div className={`w-10 h-10 bg-black rounded-xl flex items-center justify-center text-xl shadow-md border ${xpAnimation ? 'border-[#39FF14] animate-pulse' : 'border-zinc-800'}`}>{lvlInfo.badge}</div>
                  <div>
                     <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Niveau : <span className="text-zinc-800">{lvlInfo.name}</span></p>
                     <p className="text-black text-xs font-black">{jongomaXP} XP</p>
                  </div>
               </div>
               <div className="bg-white border border-zinc-200 p-2 pr-4 rounded-2xl flex items-center gap-3 shadow-sm cursor-pointer hover:border-[#39FF14] transition-colors" onClick={() => setShowPaymentModal(true)}>
                 <div className="bg-black border border-zinc-800 p-2.5 rounded-xl flex items-center justify-center">
                    <Clock className={daysLeft > 0 ? "text-[#39FF14]" : "text-red-500"} size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Abonnement</p>
                    <p className="text-xs font-black text-black"><strong className={daysLeft > 0 ? "text-green-600" : "text-red-500"}>{daysLeft > 0 ? `${daysLeft} jours restants` : 'Expiré'}</strong></p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <BentoDashboardView
              user={user}


              jongomaXP={jongomaXP}
              clientProfile={clientProfile}
              setActiveTab={setActiveTab}
              handleMealClick={handleMealClick}
           waterGlasses={waterGlasses} handleUpdateWater={handleUpdateWater} />
        )}




        {activeTab === 'today' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div className="flex items-center gap-4">
                  <img src={MENU_ICONS.monJour} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Mon Jour" />
                  <div>
                     <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Mon Jour</h2>
                     <p className="text-zinc-500 font-bold text-xs mt-1 max-w-lg leading-relaxed">
                       Enregistrez vos repas, suivez votre eau et complétez votre bilan de la journée.
                     </p>
                  </div>
               </div>

               {/* Switch Mode Guidé / Flexible */}
               <div className="bg-zinc-100 p-1.5 rounded-full inline-flex relative shadow-inner shrink-0 h-fit">
                  <button onClick={() => handleTrackingModeChange('guided')} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'guided' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-400 hover:text-black'}`}>Mode Guidé</button>
                  <button onClick={() => handleTrackingModeChange('flexible')} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'flexible' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-400 hover:text-black'}`}>Mode Libre</button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* COLONNE GAUCHE (1/3) */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* 1. Le Pie Chart (Calories/Macros) ici */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center">
                   <div className="relative w-40 h-40 shrink-0 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie data={[{name: 'Consommé', value: calories}, {name: 'Restant', value: remainingCalories}]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" startAngle={90} endAngle={-270}>
                               <Cell key="cell-0" fill="#39FF14" />
                               <Cell key="cell-1" fill="#f4f4f5" />
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                         <p className="text-2xl font-black text-black leading-none">{calories}</p>
                         <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">/ {targetCalories} kcal</p>
                      </div>
                   </div>

                   <div className="w-full space-y-4">
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Protéines</span>
                            <span className="text-zinc-500 text-[9px]">{proteins} / {proteinGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min((proteins / proteinGoal) * 100, 100)}%` }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]"><img src={CARBS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Glucides</span>
                            <span className="text-zinc-500 text-[9px]">{carbs} / {carbsGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${Math.min((carbs / carbsGoal) * 100, 100)}%` }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]"><img src={FATS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Lipides</span>
                            <span className="text-zinc-500 text-[9px]">{fats} / {fatsGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${Math.min((fats / fatsGoal) * 100, 100)}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>
                {/* 2. Refaire mon diagnostic (Bas de colonne gauche) */}
                <button
                  onClick={() => setShowRedoDiagModal(true)}
                  className="relative w-full rounded-[2rem] overflow-hidden group shadow-lg h-48 w-full flex items-center justify-center border-2 border-transparent hover:border-[#39FF14] transition-all"
                >
                  <img
                    src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783002400/A_high-end__photorealistic_commercial_shot_202607021426_vutjqi.jpg"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Refaire Diagnostic"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40 backdrop-blur-[2px]"></div>

                  <div className="relative z-10 flex flex-col items-center gap-3">
                     <div className="bg-[#39FF14] text-black p-3 rounded-full animate-pulse shadow-[0_0_30px_rgba(57,255,20,0.6)]">
                       <Target size={24} />
                     </div>
                     <h3 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase text-white tracking-tighter drop-shadow-md`}>
                       Refaire mon diagnostic
                     </h3>
                     <p className="text-zinc-300 font-bold text-[10px] uppercase tracking-widest text-center">
                       Ajuster mes objectifs et mes mensurations
                     </p>
                  </div>
                </button>

              </div>

              {/* COLONNE DROITE (2/3) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* 1. Le grand widget "Refaire mon diagnostic" au sommet */}

                {/* 1. La liste des repas (Sama Menu ou Mode Libre) */}
                {trackingMode === 'guided' ? (
                   (() => {
                       const todayMenu = weeklyGeneratedMenu.find(d => d.day === formattedCurrentDay);
                       if (!todayMenu) return <div className="bg-white border border-zinc-200 p-8 text-center text-zinc-500 font-bold rounded-[2.5rem] shadow-sm">Aucun menu généré pour aujourd'hui. Veuillez générer votre Sama Menu.</div>;

                       return (
                           <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden flex flex-col relative">
                              <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                                 <img src={todayMenu.meals?.['Déjeuner']?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'} alt="Repas" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                                    <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest mb-1">Déjeuner</p>
                                    <p className="text-white font-bold text-lg leading-tight line-clamp-1">{todayMenu.meals?.['Déjeuner']?.nom || 'Repas'}</p>
                                 </div>
                              </div>

                              <div className="p-5 flex-1 flex flex-col gap-3">
                                 {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                                    const recipe = todayMenu.meals?.[mealType];
                                    if(!recipe) return null;
                                    const isConsumed = consumedMeals.some((m: any) => m.name === recipe.nom && m.type === mealType);

                                    return (
                                       <div key={mealType} className={`flex justify-between items-center p-4 rounded-2xl transition-all ${isConsumed ? 'bg-[#39FF14]/15 shadow-sm opacity-90 border border-[#39FF14]' : 'bg-zinc-50 hover:bg-white border border-zinc-100'}`}>
                                          <div className="flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => handleMealClick(mealType, { type: mealType, meal: recipe.nom, cals: recipe.calories, proteins: recipe.proteins, carbs: recipe.carbs, fats: recipe.fats, recipe: recipe.recipe, bienfaits: recipe.bienfaits }, 'guided')}>
                                             <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">{mealType}</p>
                                             <p className={`text-xs font-bold truncate ${isConsumed ? 'text-[#39FF14]' : 'text-black'}`}>{recipe.nom} {isConsumed && '✅'}</p>
                                          </div>
                                          <div className="text-right shrink-0 flex flex-col items-end gap-1">

                                             <div className="flex gap-2">
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {recipe.calories || recipe.kcal || recipe.energy || "—"} kcal</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {recipe.proteins || 0}g</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {recipe.carbs || 0}g</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {recipe.fats || 0}g</span>
                                             </div>

                                             {!isConsumed ? (
                                                <button onClick={(e) => { e.stopPropagation(); confirmMealLog(mealType, recipe.nom, recipe.calories, recipe.proteins, recipe.carbs, recipe.fats, { ux_unit: recipe.ux_unit }); setToastMessage('Ajouté !'); setTimeout(()=>setToastMessage(null), 3000); }} className="bg-[#39FF14] text-black px-2 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm hover:scale-105 transition-transform">➕ Loguer</button>
                                             ) : (
                                                <span className="bg-[#39FF14] text-black px-2 py-1 rounded-lg text-[9px] font-black uppercase shadow-sm">Validé ✅</span>
                                             )}
                                          </div>
                                       </div>
                                    )
                                 })}
                              </div>
                           </div>
                       )
                   })()
                ) : (
                   /* MODE LIBRE */
                   <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm flex-1">
                     <div className="mb-4">
                        <h3 className="font-black text-lg text-black uppercase tracking-tighter">Menu Libre</h3>
                        <p className="text-zinc-500 text-xs font-bold">Composez votre assiette avec vos propres repas.</p>
                     </div>
                     {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                         const loggedMeals = consumedMeals.filter((m: any) => m.type === mealType);
                         return (
                           <div key={mealType} className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-black transition-colors cursor-pointer" onClick={() => { handleMealClick(mealType, null, 'flexible'); setTimeout(() => setIsScanning(true), 300); }}>
                             <div className="flex justify-between items-center">
                                 <p className="text-xs font-black uppercase text-zinc-500">{mealType}</p>
                                 <button className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={14}/> Ajouter un repas
                                 </button>
                             </div>
                             {loggedMeals.length > 0 && (
                                 <div className="mt-2 space-y-1">
                                    {loggedMeals.map((m: any, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100">
                                           <span className="text-xs font-bold text-[#39FF14] truncate">{m.name}</span>

                                           <div className="flex items-center gap-2 shrink-0">
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {m.calories || 0} kcal</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {m.prots || 0}g</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {m.carbs || 0}g</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {m.fats || 0}g</span>
                                           </div>

                                        </div>
                                    ))}
                                 </div>
                             )}
                           </div>
                         )
                     })}
                   </div>
                )}
                {/* 3. Section Bas Droite (Eau & Bilan) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">

                {/* Nouveau Widget Hydratation */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">

                  {/* En-tête du Widget */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Objectif Eau</p>
                      <h4 className="text-2xl font-black text-black">{waterGlasses} <span className="text-xs font-bold text-zinc-500">/ 8 bouteilles (1.5L)</span></h4>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center shadow-inner">
                      <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png" alt="Eau" className="w-6 h-6 object-contain" />
                    </div>
                  </div>

                  {/* Grille des 8 Petites Bouteilles Interactives */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-4 py-3 bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
                    {Array.from({ length: 8 }, (_, i) => {
                      const isDrunk = i < waterGlasses;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            // Si on clique sur la bouteille 3, ça règle le quota à 3 (ou désactive si on reclique dessus)
                            const nextVal = i + 1 === waterGlasses ? i : i + 1;
                            handleUpdateWater(nextVal - waterGlasses);
                          }}
                          className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-300 ${
                            isDrunk
                              ? 'bg-[#39FF14]/20 border border-[#39FF14] scale-105 shadow-sm'
                              : 'hover:bg-zinc-200/60 opacity-30 grayscale hover:opacity-60'
                          }`}
                          title={`Bouteille ${i + 1}`}
                        >
                          <img
                            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png"
                            alt="Bouteille"
                            className={`w-7 h-8 object-contain transition-transform ${isDrunk ? 'animate-pulse drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]' : ''}`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Astuce Santé Pertinente */}
                  <div className="bg-black text-white p-3.5 rounded-xl flex items-center gap-3 mt-2 border border-zinc-800">
                    <span className="text-lg shrink-0">💡</span>
                    <p className="text-[10px] font-medium leading-relaxed text-zinc-300">
                      <strong className="text-[#39FF14] uppercase font-black">Le saviez-vous ?</strong> Boire 500ml d'eau augmente le métabolisme de près de <span className="text-white font-bold">30%</span> dans l'heure qui suit !
                    </p>
                  </div>

                </div>

                {/* Bilan de la journée */}
                <button onClick={() => setShowDailyReport(true)} className="bg-[#39FF14] p-6 rounded-[2rem] border border-black shadow-[0_0_25px_rgba(57,255,20,0.4)] flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] transition-transform animate-gentle-pulse">
                    <CheckCircle size={32} className="text-black mb-3"/>
                    <h3 className="font-black text-lg uppercase tracking-tighter text-black mb-1">Bilan du jour</h3>
                    <p className="text-black/70 font-bold text-xs">Clôturez pour gagner de l'XP et évaluer vos progrès.</p>
                </button>
                </div>


              </div>
            </div>

            {/* Suggestions Boutique */}
            <div className="bg-white border border-zinc-200 shadow-sm rounded-[2rem] p-8 mt-12 relative overflow-hidden">
               <h3 className="text-xl font-black uppercase text-black mb-6 flex items-center gap-2"><ShoppingCart className="text-[#39FF14] bg-black p-1.5 rounded-lg" size={24}/> La Boutique Onyx</h3>
               <p className="text-zinc-500 font-bold text-sm mb-6">Boostez vos résultats avec nos produits 100% naturels.</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {crossSellProducts.slice(0,3).map((p: any) => (
                     <div key={p.id} className="bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden flex flex-col group cursor-pointer hover:border-[#39FF14] transition-colors" onClick={() => setActiveTab('shop')}>
                        <div className="h-40 w-full relative">
                            <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                           <p className="text-sm font-black text-black group-hover:text-[#39FF14] transition-colors line-clamp-1">{p.nom}</p>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 mb-4">{p.prix_standard} FCFA</p>
                           <button className="mt-auto w-full bg-black text-[#39FF14] py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                              Voir le produit
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'week' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
            {/* SECTION SMART PLANNER (Générateur) */}
            <section>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                     <img src={MENU_ICONS.samaMenu} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Sama Menu" />
                     <div>
                        <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Sama Menu</h2>
                        <p className="text-zinc-500 font-bold text-xs mt-1 max-w-lg leading-relaxed">
                          Votre programme quotidien visuel. Suivez ces recommandations sans tracas. Loguez vos plats ici.
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => generateWeeklyMenu()} className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 transition shadow-sm flex items-center gap-2">
                        <RefreshCcw size={14}/> Regénérer
                     </button>
                     <button onClick={() => setShowGroceryList(true)} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition shadow-sm flex items-center gap-2">
                        <ShoppingCart size={14}/> Liste de courses
                     </button>
                     <button onClick={downloadGroceryListPDF} className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 transition shadow-sm flex items-center gap-2 hidden sm:flex">
                        <Download size={14}/> PDF
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
                     {(() => {
                         const today = weeklyGeneratedMenu.find(d => d.day === formattedCurrentDay);
                         const others = weeklyGeneratedMenu.filter(d => d.day !== formattedCurrentDay);
                         const displayMenu = today ? [today, ...others] : weeklyGeneratedMenu;
                         return displayMenu.map((dayPlan, dIdx) => {
                             const isToday = dayPlan.day === formattedCurrentDay;
                             return (
                        <div key={`${dIdx}-${dayPlan.meals?.['Déjeuner']?.id || 'empty'}`} className={`bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] border-0 overflow-hidden flex flex-col group relative animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ${isToday ? 'ring-4 ring-[#39FF14]' : 'opacity-80 grayscale-[20%] hover:grayscale-0 hover:opacity-100 transition-all'}`} style={{ animationFillMode: 'both', animationDelay: `${dIdx * 100}ms` }}>
                           <div className={`absolute top-4 left-4 ${isToday ? 'bg-[#39FF14] text-black' : 'bg-black text-white'} px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest z-10 shadow-lg`}>
                              {dayPlan.day} {isToday && '(Auj.)'}
                           </div>
                           
                           <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                              <img src={dayPlan.meals?.['Déjeuner']?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'} alt="Repas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                                 <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest mb-1">Déjeuner</p>
                                 <p className="text-white font-bold text-lg leading-tight line-clamp-1">{dayPlan.meals?.['Déjeuner']?.nom || 'Repas'}</p>
                                 {dayPlan.meals?.['Déjeuner']?.is_boutique && <span className="absolute top-4 right-4 bg-[#39FF14] text-black px-2 py-1 rounded text-[9px] font-black uppercase shadow-md">Boutique</span>}
                              </div>
                           </div>
                           
                           <div className="p-5 flex-1 flex flex-col gap-3">
                              {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                                 const recipe = dayPlan.meals?.[mealType];
                                 if(!recipe) return null;
                                 const isToday = dayPlan.day === formattedCurrentDay;
                                 const isConsumed = isToday && consumedMeals.some((m: any) => m.name === recipe.nom && m.type === mealType);
                                 const isBolCommun = clientProfile?.diagnostic_data?.lunch_context === 'maison_bol_commun' && mealType === 'Déjeuner';

                                 console.log("🔍 OBJET MEAL COMPLET :", JSON.stringify(recipe, null, 2));
                                 return (
                                    <React.Fragment key={mealType}>
                                    <div className={`flex justify-between items-center p-4 rounded-2xl transition-all ${isConsumed ? 'bg-[#39FF14]/15 shadow-sm opacity-90 border border-[#39FF14]' : 'bg-zinc-50 hover:bg-white hover:shadow-md'}`}>
                                       <div className="flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => handleMealClick(mealType, { type: mealType, meal: recipe.nom, cals: recipe.calories, proteins: recipe.proteins, carbs: recipe.carbs, fats: recipe.fats, recipe: recipe.recipe, bienfaits: recipe.bienfaits }, 'guided')} title="Voir la recette">
                                          <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">{mealType}</p>
                                          <p className={`text-xs font-bold truncate ${isConsumed ? 'text-[#39FF14]' : 'text-black'}`}>{recipe.nom} {isConsumed && '✅'}</p>
                                       </div>
                                       <div className="text-right shrink-0 flex flex-col items-end gap-1 relative">

                                          {isExpertMode ? (
                                             <div className="flex gap-2">
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {recipe.calories || recipe.kcal || recipe.energy || "—"} kcal</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {recipe.proteins || 0}g</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {recipe.carbs || 0}g</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {recipe.fats || 0}g</span>
                                             </div>
                                          ) : (
                                             <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'}`}>{recipe.ux_unit || "1 portion"}</span>
                                          )}

                                          <div className="flex items-center gap-1 mt-0.5">
                                             {isToday && !isConsumed && (
                                               <button onClick={(e) => { e.stopPropagation(); confirmMealLog(mealType, recipe.nom, recipe.calories, recipe.proteins || Math.round((recipe.calories * 0.2)/4), recipe.carbs || Math.round((recipe.calories * 0.5)/4), recipe.fats || Math.round((recipe.calories * 0.3)/9), { ux_unit: recipe.ux_unit || '1 portion' }); setToastMessage('Ajouté à Mon Jour !'); setTimeout(()=>setToastMessage(null), 3000); }} className="bg-[#39FF14] text-black px-1.5 py-1 rounded text-[8px] font-black uppercase shadow-sm hover:bg-black hover:text-[#39FF14] transition-colors" title="Ajouter à Mon Jour">➕ Ajouter</button>
                                             )}
                                             {isConsumed && (
                                                <span className="bg-[#39FF14] text-black px-2 py-0.5 rounded text-[8px] font-black uppercase shadow-sm">Validé ✅</span>
                                             )}
                                             {!isConsumed && !isToday && (
                                                <span className="bg-zinc-200 text-zinc-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">Prévu</span>
                                             )}
                                             {!isConsumed && isToday && (
                                                <button onClick={(e) => { e.stopPropagation(); handleSwapMeal(dIdx, mealType, recipe.id); }} className="bg-zinc-200 text-zinc-600 px-1.5 py-1 rounded text-[8px] font-black uppercase shadow-sm hover:bg-black hover:text-white transition-colors" title="Changer ce repas">🔄</button>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                    {isBolCommun && (
                                      <div className="bg-zinc-100 border-2 border-[#39FF14] p-4 rounded-xl mt-1 mb-2">
                                         <p className="text-xs font-medium text-black leading-relaxed">
                                           💡 <strong>Conseil Woyof :</strong> Servez votre part dans une petite assiette creuse avant de rejoindre la famille, ou limitez votre espace de riz à la taille de votre poing dans le grand bol.
                                         </p>
                                      </div>
                                    )}
                                    </React.Fragment>
                                 )
                              })}
                           </div>
                        </div>
                     )
                 })
             })()}
                  </div>
               )}
               {/* BOUTON GÉNÉRER LISTE COURSES EN BAS */}
               {(clientProfile?.plan_type === 'premium' || daysLeft > 0) && weeklyGeneratedMenu.length > 0 && (
                  <div className="mt-12 text-center">
                     <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => setShowGroceryList(true)} className="bg-black text-[#39FF14] px-10 py-5 rounded-[2.5rem] font-black uppercase text-sm md:text-base tracking-widest hover:scale-105 transition-transform shadow-[0_15px_40px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3">
                           <ShoppingCart size={24}/> Voir ma liste de courses
                        </button>
                     {(() => {
                        const list = getGroceryList();
                        const totalCost = Object.values(list).flatMap(rayon => Object.values(rayon as any)).reduce((acc: number, item: any) => acc + (item.price_cfa * item.quantite), 0);
                        return (
                           <p className="text-xs font-bold text-zinc-500 mt-2">Coût estimé pour la semaine : {totalCost.toLocaleString('fr-FR')} FCFA (Marché Sandaga/Auchan)</p>
                        );
                     })()}
                        <button onClick={downloadGroceryListPDF} className="bg-white text-black border-2 border-zinc-200 px-8 py-5 rounded-[2.5rem] font-black uppercase text-sm md:text-base tracking-widest hover:scale-105 transition-transform shadow-sm flex items-center justify-center gap-3">
                           <Download size={24}/> Télécharger PDF
                        </button>
                     </div>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-4">Calculée automatiquement d'après votre Sama Menu</p>
                  </div>
               )}
            </section>

            {/* SECTION MENUS DE LA SEMAINE */}
            <section className="mt-12">
               <div className="flex items-center gap-3 mb-8">
                  <img src={MENU_ICONS.samaMenu} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="Sama Menu" />
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
                                 {todayPlan?.meals?.['Déjeuner']?.budget_tier === 'Serré 8k' && (
                                    <li className="text-xs font-bold text-green-700 flex items-start gap-2 mt-4">
                                       <PartyPopper size={16} className="text-green-500"/> Recette priorisée pour votre budget serré !
                                    </li>
                                 )}
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

        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}><Package className="text-[#39FF14] bg-black p-2 rounded-xl" size={36}/> Mes Commandes</h2>
                
                <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl mb-8">
                   <h3 className="font-black text-sm uppercase mb-4">Mes Coordonnées de livraison</h3>
                   <div className="flex flex-col sm:flex-row items-end gap-4">
                      <div className="flex-1 w-full">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Adresse complète</label>
                         <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full p-3 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-[#39FF14] transition" placeholder="Ex: Dakar, Sicap Amitié 2..." />
                      </div>
                      <button onClick={async () => {
                         if (clientProfile) {
                            setIsSaving(true);
                            await supabase.from('clients').update({ address: deliveryAddress }).eq('id', clientProfile.id);
                            setIsSaving(false);
                            alert("Adresse de facturation mise à jour !");
                         }
                      }} disabled={isSaving} className="w-full sm:w-auto bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black text-xs uppercase hover:scale-105 transition shadow-md h-[46px] flex items-center justify-center">
                         {isSaving ? "En cours..." : "Sauvegarder"}
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   {clientOrders.map(order => (
                      <div key={order.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-black transition-colors">
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                               <span className="text-xs font-black text-zinc-500 uppercase">#{String(order.id).substring(0,8)}</span>
                               <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${order.status === 'Nouveau' ? 'bg-blue-100 text-blue-700' : order.status === 'Livré' ? 'bg-green-100 text-green-700' : order.status === 'Annulé' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {order.status}
                               </span>
                            </div>
                            <p className="text-sm font-bold text-black mb-1">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-xs font-medium text-zinc-500">
                               {order.items?.length || 0} article(s) • Livré à : {order.address || 'Non spécifié'}
                            </p>
                         </div>
                         <div className="text-left md:text-right flex flex-col items-start md:items-end">
                            <p className="text-2xl font-black text-[#39FF14]">{order.total?.toLocaleString()} F</p>
                            {order.promo_code && <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Code : {order.promo_code}</p>}
                            <button onClick={() => handleReorder(order)} className="mt-3 bg-zinc-100 text-black px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#39FF14] transition-colors flex items-center justify-center gap-1 shadow-sm w-full md:w-auto">
                               <RefreshCcw size={12}/> Recommander
                            </button>
                         </div>
                      </div>
                   ))}
                   {clientOrders.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                         <Package size={40} className="mx-auto text-zinc-300 mb-4"/>
                         <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Vous n'avez pas encore passé de commande.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
             <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm text-center mb-8">
                <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black dark:text-white flex justify-center items-center gap-3 mb-2`}><FileText className="text-[#39FF14] bg-black p-2 rounded-xl" size={40}/> Blog & Conseils</h2>
                <p className="text-zinc-500 font-bold text-sm">Découvrez nos astuces nutrition, nos conseils bien-être et les bienfaits de nos produits locaux.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {articles.map((article: any) => (
                  <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-[#39FF14] transition-all cursor-pointer flex flex-col h-full group">
                     {article.image_url && (
                        <div className="overflow-hidden rounded-2xl mb-6">
                           <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                     )}
                     <div className="flex gap-2 mb-4">
                        <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{article.category || 'Nutrition'}</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Clock size={10}/> {article.readTime || `${Math.max(1, Math.ceil(((article.content || article.desc || '').split(' ').length) / 200))} min`}</span>
                     </div>
                     <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase mb-3 leading-tight text-black dark:text-white group-hover:text-[#39FF14] transition-colors`}>{article.title}</h2>
                     <p className="text-zinc-500 text-xs font-medium mb-6 flex-1 line-clamp-3">{article.desc}</p>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white mt-auto">
                        LIRE L'ARTICLE <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform text-[#39FF14]"/>
                     </div>
                  </div>
               ))}
               {articles.length === 0 && (
                  <div className="col-span-full py-16 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                     Aucun article publié pour le moment.
                  </div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>

            {/* BADGES ET GAMIFICATION */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                  <h3 className="text-lg font-black uppercase text-black mb-2 flex items-center gap-2"><Award className="text-yellow-500" size={24}/> Badges & Récompenses</h3>
                  <p className="text-sm text-zinc-500 font-medium mb-4">Cumulez de l'XP et des jours parfaits pour débloquer des trophées.</p>
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
               <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                  <div className="p-4 rounded-xl border-2 flex flex-col items-center justify-center min-w-[100px] transition-all bg-green-50 border-green-400 text-green-600 shadow-md">
                     <span className="text-2xl mb-2">🌱</span>
                     <span className="text-[10px] font-black uppercase text-center leading-tight">Novice<br/><span className="text-[8px] text-green-700/70">0 XP</span></span>
                  </div>
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center min-w-[100px] transition-all relative ${jongomaXP >= 500 ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-md scale-105' : 'bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60 grayscale'}`}>
                     {jongomaXP < 500 && <Lock size={12} className="absolute top-2 right-2 text-zinc-300"/>}
                     <span className="text-2xl mb-2">💎</span>
                     <span className="text-[10px] font-black uppercase text-center leading-tight">Adhérente<br/><span className="text-[8px] opacity-70">500 XP</span></span>
                  </div>
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center min-w-[100px] transition-all relative ${jongomaXP >= 2000 ? 'bg-yellow-50 border-yellow-400 text-yellow-600 shadow-md scale-105' : 'bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60 grayscale'}`}>
                     {jongomaXP < 2000 && <Lock size={12} className="absolute top-2 right-2 text-zinc-300"/>}
                     <span className="text-2xl mb-2">🌟</span>
                     <span className="text-[10px] font-black uppercase text-center leading-tight">Star Nutrition<br/><span className="text-[8px] opacity-70">2000 XP</span></span>
                  </div>
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center min-w-[100px] transition-all relative ${(Array.isArray(dailyLogs) ? dailyLogs : []).filter(l => l.report_data?.followedMenu && l.water_glasses >= 6).length >= 5 ? 'bg-orange-50 border-orange-400 text-orange-600 shadow-md scale-105' : 'bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60 grayscale'}`}>
                     {((Array.isArray(dailyLogs) ? dailyLogs : []).filter(l => l.report_data?.followedMenu && l.water_glasses >= 6).length < 5) && <Lock size={12} className="absolute top-2 right-2 text-zinc-300"/>}
                     <Award size={28} className="mb-2" />
                     <span className="text-[10px] font-black uppercase text-center leading-tight">Semaine<br/>Parfaite</span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-8`}>
                  <BarChartIcon className="text-[#39FF14]" /> Évolution sur 7 jours
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
                     <h3 className="text-sm font-black uppercase text-zinc-500 mb-6 flex items-center gap-2"><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> Calories Consommées</h3>
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
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <h2 className={`${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-4`}><img src={MENU_ICONS.dashboard} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Historique" /> Historique des Bilans</h2>
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
                                           <span className="flex items-center gap-1 text-zinc-600"><img src={CALS_ICON} className="w-4 h-4 rounded-full shadow-sm"/> {log.calories_consumed || 0} kcal</span>
                                           <span className="flex items-center gap-1 text-zinc-600"><img src={WATER_ICON} className="w-4 h-4 rounded-full shadow-sm"/> {log.water_glasses || 0}/8</span>
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

        {activeTab === 'coaching' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
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

        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
             <div className="bg-white p-8 rounded-[24px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-4 mb-8`}><img src={MENU_ICONS.profile} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Profil" /> Profil & Réglages</h2>
                
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

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="col-span-2 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col justify-center">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Métabolisme de base (BMR)</span>
                  <div className="text-4xl font-black text-black">{clientProfile?.diagnostic_data?.bmr || 0} <span className="text-sm font-bold text-zinc-400">kcal / jour</span></div>
                </div>

                <div className="col-span-1 bg-[#39FF14]/10 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">Mon IMC</span>
                  <div className="text-3xl font-black text-green-700">{imcValue}</div>
                </div>

                <div className="col-span-1 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Score XP</span>
                  <div className="text-3xl font-black text-yellow-500">{jongomaXP}</div>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[24px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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

             <div className="bg-white p-8 rounded-[24px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
                <h3 className="text-lg font-black uppercase text-black mb-4 flex items-center gap-2"><Bell className="text-orange-500"/> Notifications & Rappels</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl gap-4">
                   <div>
                       <p className="font-bold text-sm text-black">Rappels d'hydratation (Eau)</p>
                       <p className="text-[10px] font-black uppercase text-zinc-500 mt-1">Toutes les 2 heures si objectif non atteint</p>
                   </div>
                   <div className="flex items-center gap-3">
                       <button onClick={sendWaterReminderPush} className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase underline">Tester</button>
                       <button onClick={togglePushNotifications} className={`px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-colors ${pushEnabled ? 'bg-green-100 text-green-700' : 'bg-black text-[#39FF14] hover:bg-zinc-800'}`}>
                           {pushEnabled ? 'Activé' : 'Activer'}
                       </button>
                   </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[24px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
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
                     let subtitle = "";
                     if (rayon === 'Produits Locaux / Épices') subtitle = "Acheter au marché ou commander sur la boutique Onyx";
                     else if (rayon === 'Glucides & Laitages') subtitle = "Acheter au supermarché (Auchan, Casino)";
                     else if (rayon === 'Protéines Fraîches') subtitle = "Acheter chez le boucher / poissonnier";

                     return (
                        <div key={rayon} className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                           <h4 className="font-black uppercase text-sm text-black mb-1">{rayon}</h4>
                           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">{subtitle}</p>
                           <ul className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                              {Object.entries(items).map(([nom, data]: any) => {
                                 const isExcluded = excludedIngredients.includes(nom);
                                 return (
                                 <li key={nom} className="flex items-center justify-between text-sm font-medium border-b border-zinc-200 pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                       <div className={`w-6 h-6 rounded-xl flex items-center justify-center border-2 transition-colors ${isExcluded ? 'bg-[#39FF14] border-[#39FF14]' : 'bg-white border-zinc-300 group-hover:border-black'}`}>
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
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm w-full">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}><BookOpen className="text-[#39FF14] bg-black p-2 rounded-xl" size={36}/> Galerie de Recettes</h2>
                
                <div className="relative mb-6">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Rechercher une recette ou macro (ex: Thieboudienne, 300 kcal, 20g)..." 
                      value={favoriteSearchQuery}
                      onChange={e => setFavoriteSearchQuery(e.target.value)}
                      className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition-colors"
                   />
                </div>
                
                <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide w-full gap-4 pb-6 mb-4 custom-scrollbar">
                   {RECIPE_FILTERS.map(filter => (
                      <button 
                         key={filter.id} 
                         onClick={() => setRecipeFilter(filter.id)} 
                         className={`shrink-0 px-5 py-2.5 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 border-2 ${recipeFilter === filter.id ? 'bg-black text-[#39FF14] border-black shadow-xl scale-105 opacity-100' : 'bg-zinc-50 text-zinc-500 border-zinc-200 opacity-60 hover:opacity-100 hover:bg-zinc-100 hover:scale-105'}`}
                      >
                         {filter.icon && <img src={filter.icon} alt={filter.label} className="w-8 h-8 rounded-full object-cover shadow-sm" />}
                         {filter.label}
                      </button>
                   ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                   {(() => {
                      const top10RecipeIds = [...allRecipesDB].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10).map(r => r.id);
                      let filteredRecipes = allRecipesDB.filter(r => {
                         const query = favoriteSearchQuery.toLowerCase();
                         const numericQuery = query.replace(/\D/g, '');
                         const matchSearch = r.nom?.toLowerCase().includes(query) || 
                                             (numericQuery !== "" && r.calories?.toString().includes(numericQuery)) || 
                                             (numericQuery !== "" && r.proteins?.toString().includes(numericQuery));
                         if (!matchSearch) return false;
                         if (recipeFilter === 'Favoris') return favoriteMeals.some(f => (f.meal || f.nom) === r.nom);
                         if (recipeFilter === 'Populaire') return true;
                         if (recipeFilter === 'Main Course') return r.type === 'Déjeuner' || r.type === 'Dîner';
                         if (recipeFilter === 'Healthy') return r.carbs <= 40 && r.fats <= 15;
                         if (recipeFilter === 'Low Calories') return r.calories <= 350;
                         if (recipeFilter === 'Desserts') return r.type === 'Collation' || r.type === 'Petit-déjeuner';
                         return true;
                      });
                      
                      if (recipeFilter === 'Populaire') {
                         filteredRecipes = filteredRecipes.sort((a, b) => (b.views || 0) - (a.views || 0));
                      }
                      
                      return filteredRecipes.map((fav, i) => {
                       const name = fav.nom;
                       const cals = fav.calories;
                       const prots = fav.proteins;
                       const isFav = favoriteMeals.some(f => (f.meal || f.nom) === name);
                       const isTop10 = top10RecipeIds.includes(fav.id);
                       
                       const tags = [];
                       if (prots >= 20) tags.push("Protéiné");
                       if (fav.carbs <= 30) tags.push("Low Carb");
                       if (cals <= 350) tags.push("Léger");
                       if (fav.fats <= 15) tags.push("Low Fat");
                       
                       return (
                       <div key={fav.id || i} className="w-full flex flex-col bg-zinc-50 p-5 rounded-2xl border border-zinc-100 justify-between hover:border-[#39FF14] transition-colors group">
                           <div className="w-full">
                               {fav.image_url && <img src={fav.image_url} alt={name} className="w-full h-32 object-cover rounded-xl mb-3" />}
                               <div className="flex justify-between items-start mb-2">
                                   <div className="flex flex-col">
                                       <p className="font-bold text-sm text-black line-clamp-1" title={name}>{name}</p>
                                       <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 mt-0.5"><Eye size={12}/> {fav.views || 0} vues</p>
                                       <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 mt-0.5"><Heart size={12} className={isFav ? "text-red-500 fill-current" : ""}/> {fav.likes || 0} likes</p>
                                       <p className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${(fav.preparation_time || 15) > 45 ? 'text-red-500' : 'text-zinc-500'}`}><Clock size={12}/> {fav.preparation_time || 15} min</p>
                                   </div>
                                   <button onClick={() => toggleFavorite(fav)} className={`transition-colors ${isFav ? 'text-red-500 hover:text-red-700' : 'text-zinc-300 hover:text-red-500'} shrink-0`}><HeartPulse size={18} className={isFav ? "fill-current" : ""}/></button>
                               </div>
                               <div className="flex flex-wrap gap-1 mb-3">
                                   {isTop10 && <span className="bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm"><Trophy size={10}/> Top 10</span>}
                                   {tags.map(t => <span key={t} className="bg-black text-[#39FF14] px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{t}</span>)}
                                   {fav.budget_tier && (
                                       <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm ${
                                           fav.budget_tier === 'Serré 8k' ? 'bg-green-500 text-white' :
                                           fav.budget_tier === 'Famille 15k' ? 'bg-orange-500 text-white' :
                                           'bg-purple-600 text-white'
                                       }`}>
                                           {fav.budget_tier === 'Serré 8k' ? '💰 Serré' : 
                                            fav.budget_tier === 'Famille 15k' ? '🥗 Famille' : '💎 Confort'}
                                       </span>
                                   )}
                               </div>
                               <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase text-zinc-500 mb-4">
                                   <span className="flex items-center gap-1 text-zinc-600"><img src={CALS_ICON} className="w-3 h-3 rounded-full shadow-sm"/> {cals} kcal</span>
                                   <span className="flex items-center gap-1 text-zinc-600"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full shadow-sm"/> {prots}g prot</span>
                                   <span className="flex items-center gap-1 text-zinc-600"><img src={CARBS_ICON} className="w-3 h-3 rounded-full shadow-sm"/> {fav.carbs || 0}g</span>
                                   <span className="flex items-center gap-1 text-zinc-600"><img src={FATS_ICON} className="w-3 h-3 rounded-full shadow-sm"/> {fav.fats || 0}g</span>
                               </div>
                           </div>
                           <button onClick={() => {
                               confirmMealLog(fav.type || 'Déjeuner', name, cals, prots, fav.carbs || 0, fav.fats || 0, fav);
                               alert("Ajouté au tracker du jour !");
                           }} className="w-full bg-zinc-200 text-black py-3 rounded-xl text-[10px] font-black uppercase hover:bg-black hover:text-[#39FF14] transition-all flex justify-center items-center gap-2">
                               <CheckCircle size={14}/> Ajouter au menu du jour
                           </button>
                       </div>
                   )});
                   })()}
                   {allRecipesDB.length === 0 && (
                      <div className="col-span-full py-8 text-center text-zinc-500 font-bold">Aucune recette disponible.</div>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* VUE BOUTIQUE */}
        {activeTab === 'shop' && (
           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
              {/* BANNIÈRE HORIZONTALE DYNAMIQUE */}
              <div className="flex items-center gap-4 mb-8">
                 <img src={MENU_ICONS.shop} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Boutique" />
                 <div>
                    <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter text-black dark:text-white`}>Boutique Onyx</h2>
                    <p className="text-zinc-500 font-bold text-sm mt-1">Super-aliments & Équipements</p>
                 </div>
              </div>

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

              {/* TICKET À GRATTER (SCRATCH CARD) */}
              <div className={`flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] mb-12 shadow-sm border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                 <div>
                    <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-2 flex items-center gap-2"><Sparkles className="text-yellow-500"/> Ticket Surprise</h3>
                    <p className="text-sm font-medium text-zinc-500 max-w-sm mb-4">Grattez la zone grise ci-contre (survolez ou touchez) pour révéler votre code promo exclusif du jour.</p>
                 </div>
                 <div className="shrink-0 relative w-64 h-32 rounded-2xl overflow-hidden shadow-inner border-4 border-[#39FF14] bg-black select-none touch-none">
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-0 p-4">
                       <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Code Promo</p>
                       <p className="text-3xl font-black text-[#39FF14] tracking-widest">CODE10</p>
                       <p className="text-[9px] text-zinc-500 uppercase mt-1">-10% de réduction immédiate</p>
                    </div>
                    <div className={`absolute inset-0 grid grid-cols-8 grid-rows-4 z-10 transition-opacity duration-1000 ${scratchedBlocks.length > 16 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        {Array.from({ length: 32 }).map((_, i) => (
                           <div 
                              key={i} 
                              onMouseEnter={() => {
                                 if (!scratchedBlocks.includes(i)) {
                                    setScratchedBlocks(prev => {
                                       const next = [...prev, i];
                                       if (next.length === 17) {
                                          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");
                                          audio.volume = 0.6;
                                          audio.play().catch(()=>{});
                                       }
                                       return next;
                                    });
                                 }
                              }}
                              onTouchStart={() => {
                                 if (!scratchedBlocks.includes(i)) {
                                    setScratchedBlocks(prev => {
                                       const next = [...prev, i];
                                       if (next.length === 17) {
                                          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");
                                          audio.volume = 0.6;
                                          audio.play().catch(()=>{});
                                       }
                                       return next;
                                    });
                                 }
                              }}
                              className={`bg-zinc-300 dark:bg-zinc-600 transition-opacity duration-300 border-[0.5px] border-zinc-400 dark:border-zinc-500 ${scratchedBlocks.includes(i) ? 'opacity-0' : 'opacity-100'}`}
                              style={{ cursor: "crosshair" }}
                           ></div>
                        ))}
                    </div>
                    {scratchedBlocks.length <= 16 && (
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center opacity-90">
                           <p className="font-black text-white uppercase text-lg rotate-[-10deg] drop-shadow-lg bg-black/40 px-3 py-1 rounded-xl border border-white/20 backdrop-blur-sm">Grattez-moi !</p>
                        </div>
                    )}
                 </div>
              </div>

              {/* CAROUSEL NOUVEAUTÉS */}
              <div className="mb-16">
                 <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2 text-black dark:text-white`}><Sparkles className="text-[#39FF14]"/> Nouveautés de la semaine</h3>
                 <div className="overflow-hidden" ref={emblaNewArrivalsRef}>
                    <div className="flex gap-4">
                       {(Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || []).sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 6).map(product => (
                          <div key={product.id} onClick={() => openProductModal(product)} className={`flex-[0_0_auto] w-64 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border rounded-[2rem] p-4 cursor-pointer hover:border-[#39FF14] transition-all group shadow-sm mr-4`}>
                           <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-950 overflow-hidden mb-4 relative">
                              <img src={product.image_url} alt={product.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <span className="absolute top-2 right-2 bg-black text-[#39FF14] px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest shadow-lg">New</span>
                                 {product.stock <= 10 && <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">Quantité Limitée</span>}
                           </div>
                           <h4 className="font-black text-sm uppercase text-black dark:text-white line-clamp-1">{product.nom}</h4>
                           <div className="flex items-center justify-between mt-2">
                               <p className="text-[#39FF14] font-black text-lg">{product.prix_premium.toLocaleString()} F</p>
                               <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="bg-black text-[#39FF14] p-2 rounded-xl hover:bg-[#39FF14] hover:text-black transition-colors shadow-sm" title="Ajouter au panier">
                                   <Plus size={16} />
                               </button>
                           </div>
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

              <div id="shop-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                 {(Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || [])
                    .filter(p => {
                        const matchSearch = !shopSearchQuery || p.nom?.toLowerCase().includes(shopSearchQuery.toLowerCase());
                        const matchMin = shopMinPrice === "" || p.prix_standard >= shopMinPrice;
                        const matchMax = shopMaxPrice === "" || p.prix_standard <= shopMaxPrice;
                        const matchGoal = selectedShopGoal === 'all' || (selectedShopGoal === 'saved' ? savedShopProducts.some((sp: any) => sp.id === p.id) : p.goal === selectedShopGoal);
                        return matchSearch && matchMin && matchMax && matchGoal;
                    })
                    .map((product, index) => (
                       <div key={product.id} className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border rounded-3xl p-4 flex flex-col hover:border-[#39FF14] transition-all hover:shadow-2xl group animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700`} style={{ animationFillMode: 'both', animationDelay: `${index * 100}ms` }}>
                          <div className="relative aspect-square rounded-2xl bg-zinc-50 overflow-hidden mb-4 cursor-pointer" onClick={() => openProductModal(product)}>
                            <img src={product.image_url || 'https://placehold.co/400x400/111/39FF14?text=Produit'} alt={product.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e: any) => e.target.src = 'https://placehold.co/400x400/111/39FF14?text=Produit'} />
                             {product.badge && <span className="absolute top-2 right-2 bg-black text-[#39FF14] px-2 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl">{product.badge}</span>}
                             {product.stock <= 10 && <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">Qté Limitée</span>}
                          </div>
                          <h4 className="font-black text-xs sm:text-sm uppercase text-black mb-2 line-clamp-2 leading-tight">{product.nom}</h4>
                          <div className="flex items-center gap-1 mb-3">
                             {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < (product.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300'} />)}
                             <span className="text-[10px] font-bold text-zinc-500 ml-1">({product.reviews || 0} avis)</span>
                          </div>
                          <div className="flex flex-col gap-1 mb-4 mt-auto">
                             <p className="text-zinc-400 text-sm font-bold line-through">{product.prix_standard.toLocaleString()} F</p>
                             <p className="text-sm sm:text-lg font-black text-[#39FF14] bg-black px-3 py-1 rounded-lg w-max italic">{product.prix_premium.toLocaleString()} F</p>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => addToCart(product)} className="flex-1 bg-black text-white hover:bg-[#39FF14] hover:text-black py-2.5 rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm">
                                <Plus size={14}/> Ajouter
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); toggleSaveProduct(product); }} className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-center justify-center ${savedShopProducts.some((sp: any) => sp.id === product.id) ? 'border-red-500 bg-red-50 text-red-500' : 'border-zinc-200 bg-white text-zinc-400 hover:border-red-500 hover:text-red-500'}`}>
                                <Heart size={16} className={savedShopProducts.some((sp: any) => sp.id === product.id) ? 'fill-current' : ''} />
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
              <div id="product-overlay" onClick={(e: any) => e.target.id === 'product-overlay' && setSelectedProduct(null)} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in overflow-y-auto">
                 <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col md:flex-row relative shadow-2xl my-auto">
                    <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-20"><X size={20}/></button>
                    <div className="w-full md:w-1/2 bg-zinc-50 flex flex-col items-center justify-center p-6 relative shrink-0 min-h-[300px]">
                       {productMediaView === 'image' || !selectedProduct.video_url ? (
                           <div className="relative w-full h-full flex items-center justify-center group/mainimg">
                               <img src={productActiveImage || selectedProduct.image_url} alt={selectedProduct.nom} className="max-w-full h-auto max-h-[60vh] object-contain drop-shadow-2xl rounded-2xl" />
                               {selectedProduct.gallery?.length > 0 && (
                                  <>
                                     <button onClick={(e) => {
                                         e.stopPropagation();
                                         const images = [selectedProduct.image_url, ...(selectedProduct.gallery || [])].filter(Boolean);
                                         const currentIndex = images.indexOf(productActiveImage || selectedProduct.image_url);
                                         const prevIndex = (currentIndex - 1 + images.length) % images.length;
                                         setProductActiveImage(images[prevIndex]);
                                     }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors opacity-0 group-hover/mainimg:opacity-100"><ChevronLeft size={20}/></button>
                                     <button onClick={(e) => {
                                         e.stopPropagation();
                                         const images = [selectedProduct.image_url, ...(selectedProduct.gallery || [])].filter(Boolean);
                                         const currentIndex = images.indexOf(productActiveImage || selectedProduct.image_url);
                                         const nextIndex = (currentIndex + 1) % images.length;
                                         setProductActiveImage(images[nextIndex]);
                                     }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors opacity-0 group-hover/mainimg:opacity-100"><ChevronRight size={20}/></button>
                                  </>
                               )}
                           </div>
                       ) : (
                           <iframe src={getEmbedUrl(selectedProduct.video_url)} className="w-full aspect-video rounded-2xl shadow-xl" allowFullScreen></iframe>
                       )}
                       
                       {(selectedProduct.gallery?.length > 0 || selectedProduct.video_url) && (
                           <div className="flex gap-2 mt-4 overflow-x-auto custom-scrollbar w-full pb-2">
                               <button onClick={() => { setProductMediaView('image'); setProductActiveImage(selectedProduct.image_url); }} className={`w-16 h-16 rounded-xl border-2 shrink-0 ${productMediaView === 'image' && (productActiveImage === selectedProduct.image_url || !productActiveImage) ? 'border-[#39FF14]' : 'border-transparent'}`}>
                                  <img src={selectedProduct.image_url || 'https://placehold.co/400x400/111/39FF14?text=Produit'} className="w-full h-full object-cover rounded-lg bg-zinc-200" onError={(e: any) => e.target.src = 'https://placehold.co/400x400/111/39FF14?text=Produit'} />
                               </button>
                               {selectedProduct.gallery?.map((img: string, idx: number) => (
                                   <button key={idx} onClick={() => { setProductMediaView('image'); setProductActiveImage(img); }} className={`w-16 h-16 rounded-xl border-2 shrink-0 ${productMediaView === 'image' && productActiveImage === img ? 'border-[#39FF14]' : 'border-transparent'}`}>
                                       <img src={img} className="w-full h-full object-cover rounded-lg bg-zinc-200" />
                                   </button>
                               ))}
                               {selectedProduct.video_url && (
                                   <button onClick={() => setProductMediaView('video')} className={`w-16 h-16 rounded-xl border-2 shrink-0 flex items-center justify-center bg-zinc-200 transition-colors ${productMediaView === 'video' ? 'border-[#39FF14]' : 'border-transparent hover:bg-zinc-300'}`}>
                                       <Video size={20} className="text-zinc-500" />
                                   </button>
                               )}
                           </div>
                       )}
                    </div>
                    <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col text-black shrink-0">
                       <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-max">Zoom Produit</span>
                       <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">{selectedProduct.nom}</h2>
                       <div className="flex items-center gap-1 mb-4">
                           {[...Array(5)].map((_, i) => (
                               <Star key={i} size={16} className={i < (selectedProduct.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300'} />
                           ))}
                           <span className="text-xs font-bold text-zinc-500 ml-2">({selectedProduct.rating || 5}/5) - {selectedProduct.views || 0} vues</span>
                       </div>
                       <p className="text-zinc-500 font-medium leading-relaxed mb-8">{selectedProduct.description_longue}</p>
                       <div className="space-y-3 mb-10">
                          <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={18} className="text-[#39FF14]"/> 🌱 100% Naturel : Sans conservateurs.</div>
                          <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={18} className="text-[#39FF14]"/> 🇸🇳 Fabrication locale : Coopératives de femmes.</div>
                          <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={18} className="text-[#39FF14]"/> 📦 Livraison rapide : Dakar en 24h.</div>
                       </div>
                       <div className="mt-auto pt-8 border-t border-zinc-100 flex flex-col gap-6">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                              <div>
                                 <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Prix Premium</p>
                                 <p className="text-4xl font-black text-black">{selectedProduct.prix_premium.toLocaleString()} F</p>
                              </div>
                              <div className="flex flex-col gap-2 w-full sm:w-auto">
                                 <div className="flex items-center gap-2">
                                   <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-1 bg-[#39FF14] text-black px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><Plus size={18}/> Ajouter au panier</button>
                                   <button onClick={() => handleShareProduct(selectedProduct)} className="bg-zinc-100 text-black p-4 rounded-2xl hover:bg-zinc-200 transition-colors shadow-sm shrink-0"><Share2 size={18}/></button>
                                 </div>
                                 <div className="flex gap-2">
                                    <button onClick={() => { setShowCartModal(true); setSelectedProduct(null); }} className="flex-1 bg-black text-white px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><ShoppingCart size={16}/> Mon panier</button>
                                    <button onClick={() => setSelectedProduct(null)} className="flex-1 bg-zinc-100 text-black px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-zinc-200 transition-colors flex items-center justify-center">Continuer</button>
                                 </div>
                              </div>
                          </div>
                          
                          {(() => {
                              const similarShopProducts = (Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || []).filter((p: any) => p.categorie_nom === selectedProduct.categorie_nom && p.id !== selectedProduct.id && p.stock !== 0).slice(0, 3);
                              if (similarShopProducts.length > 0) {
                                  return (
                                     <div className="pt-6 border-t border-zinc-100">
                                         <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Souvent acheté ensemble</p>
                                         <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                             {similarShopProducts.map((simProd: any) => (
                                                 <div key={simProd.id} onClick={() => setSelectedProduct(simProd)} className="flex items-center gap-3 bg-zinc-50 p-2 rounded-xl border border-zinc-100 cursor-pointer hover:border-[#39FF14] transition-colors shrink-0 w-64">
                                                     <img src={simProd.image_url || 'https://placehold.co/400x400/111/39FF14?text=Produit'} alt={simProd.nom} className="w-12 h-12 rounded-lg object-cover bg-zinc-200" onError={(e: any) => e.target.src = 'https://placehold.co/400x400/111/39FF14?text=Produit'} />
                                                     <div className="flex-1 min-w-0">
                                                         <p className="font-bold text-xs truncate text-black">{simProd.nom}</p>
                                                         <p className="text-[#39FF14] font-black text-xs mt-0.5">{simProd.prix_premium.toLocaleString()} F</p>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                  );
                              }
                              return null;
                          })()}
                       </div>
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

        {/* VUE TRACKER DE POIDS */}
        {activeTab === 'weight' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
                {/* Header de la section poids */}
                <div className="flex justify-between items-center bg-zinc-50 p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm w-full">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <Scale size={20} className="text-black"/> Mon Poids
                        </h2>
                    </div>
                </div>

                {/* Dashboard principal */}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-200 shadow-xl relative overflow-hidden">
                    {/* Décoration de fond */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-black/[0.02] to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        {/* Colonne gauche : Saisie */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200 shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                                    <Activity size={16}/> Saisie du jour
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={newWeight}
                                            onChange={(e) => setNewWeight(e.target.value)}
                                            placeholder="Ex: 75.5"
                                            className="flex-1 w-full text-4xl font-black p-4 border-2 border-zinc-200 rounded-2xl bg-white focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-black"
                                        />
                                        <span className="text-2xl font-black text-zinc-400">KG</span>
                                    </div>
                                    <button onClick={handleSaveWeight} className="w-full md:w-auto px-10 py-4 bg-black text-[#39FF14] rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all duration-300 flex items-center justify-center gap-2">
                                        <CheckCircle size={20}/> Enregistrer mon poids
                                    </button>
                                    {coachFeedback && (
                                       <div className="mt-6 w-full p-5 rounded-2xl border border-[#39FF14]/20 bg-[#39FF14]/5 flex items-start gap-4">
                                          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-[#39FF14] shrink-0 border border-[#39FF14]/30"><Dumbbell size={20}/></div>
                                          <div>
                                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Coach virtuel</p>
                                             <p className={`text-sm font-bold ${coachFeedback.type === 'success' ? 'text-green-600' : coachFeedback.type === 'warning' ? 'text-orange-500' : 'text-zinc-700'}`}>
                                                {coachFeedback.text}
                                             </p>
                                          </div>
                                       </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats rapides */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Objectif</span>
                                    <div className="flex items-end gap-1">
                                        <span className="text-2xl font-black text-black">{clientProfile?.diagnostic_data?.targetWeight || '--'}</span>
                                        <span className="text-xs font-bold text-zinc-500 mb-1">KG</span>
                                    </div>
                                </div>
                                <div className="bg-black p-5 rounded-3xl shadow-lg flex flex-col justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[#39FF14]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-1 relative z-10">Progrès Total</span>
                                    <div className="flex items-end gap-1 relative z-10">
                                        <span className="text-2xl font-black text-white">
                                            {weightLogs.length > 0 && clientProfile?.diagnostic_data?.targetWeight ?
                                                (() => {
                                                    const firstWeight = parseFloat(weightLogs[0].weight);
                                                    const currentWeight = parseFloat(weightLogs[weightLogs.length - 1].weight);
                                                    const diff = firstWeight - currentWeight;
                                                    return diff > 0 ? `-${diff.toFixed(1)}` : `+${Math.abs(diff).toFixed(1)}`;
                                                })() : '--'
                                            }
                                        </span>
                                        <span className="text-xs font-bold text-zinc-400 mb-1">KG</span>
                                    </div>
                                    <TrendingDown size={32} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-hover:scale-110 transition-transform"/>
                                </div>
                            </div>
                        </div>

                        {/* Colonne droite : Graphique */}
                        <div className="flex-1 w-full flex flex-col h-full min-h-[300px] bg-zinc-50 rounded-3xl p-6 border border-zinc-200 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2"><LineChartIcon size={16}/> Évolution</span>
                                <span className="text-[9px] bg-white px-2 py-1 rounded-md border border-zinc-200 shadow-sm">30 Derniers Jours</span>
                            </h3>
                            <div className="flex-1 w-full min-h-[200px]">
                                {weightLogs.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={[...weightLogs].reverse()}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                            <XAxis
                                                dataKey="log_date"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}}
                                                dy={10}
                                            />
                                            <YAxis
                                                domain={['dataMin - 2', 'dataMax + 2']}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}}
                                                dx={-10}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{borderRadius: '16px', border: '1px solid #e4e4e7', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', fontSize: '12px'}}
                                                itemStyle={{color: '#000', fontWeight: '900'}}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                formatter={(value) => [`${value} kg`, 'Poids']}
                                            />
                                            {clientProfile?.diagnostic_data?.targetWeight && (
                                               <ReferenceLine y={parseFloat(clientProfile.diagnostic_data.targetWeight)} stroke="#39FF14" strokeDasharray="5 5" label={{ position: 'top', value: 'Objectif', fill: '#39FF14', fontSize: 10, fontWeight: 'bold' }} />
                                            )}
                                            <Line
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#000000"
                                                strokeWidth={4}
                                                dot={{r: 4, fill: "#000", strokeWidth: 2, stroke: "#fff"}}
                                                activeDot={{r: 8, fill: "#39FF14", strokeWidth: 0}}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                                        <LineChartIcon size={48} className="opacity-20"/>
                                        <p className="text-sm font-bold text-center max-w-xs">Enregistrez votre premier poids pour voir votre graphique d'évolution.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historique liste */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center justify-between">
                        Historique détaillé
                        <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px]">{weightLogs.length} entrées</span>
                    </h3>
                    {weightLogs.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {[...weightLogs].reverse().map((log, idx, arr) => {
                                const currentWeight = parseFloat(log.weight);
                                const prevLog = arr[idx + 1]; // Dans la liste inversée (du plus récent au plus ancien), l'élément suivant (idx+1) est chronologiquement "avant"
                                const prevWeight = prevLog ? parseFloat(prevLog.weight) : null;
                                let diff: number | null = null;
                                if (prevWeight) {
                                    diff = currentWeight - prevWeight;
                                }

                                return (
                                    <div key={log.log_date} className="flex justify-between items-center p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-colors">
                                                <Calendar size={16}/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-black">{new Date(log.log_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                {diff !== null && (
                                                    <p className={`text-[10px] font-black tracking-widest uppercase flex items-center gap-1 ${diff < 0 ? 'text-green-500' : diff > 0 ? 'text-orange-500' : 'text-zinc-400'}`}>
                                                        {diff < 0 ? <TrendingDown size={10}/> : diff > 0 ? <TrendingUp size={10}/> : <Minus size={10}/>}
                                                        {Math.abs(diff).toFixed(1)} kg
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-xl font-black text-black bg-zinc-100 px-4 py-2 rounded-xl group-hover:bg-[#39FF14] group-hover:text-black transition-colors">{log.weight} <span className="text-xs text-zinc-500 group-hover:text-black/60">kg</span></span>
                                            <button onClick={() => handleDeleteWeight(log.log_date)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-3xl">
                            Aucun historique disponible.
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* VUE COMMUNAUTÉ (FEED) */}

        {activeTab === 'community' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l'accueil</button>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                     <h2 className={`${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-4`}><img src={MENU_ICONS.community} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Communauté" /> Club des Lekkologues</h2>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center bg-white border border-zinc-200 rounded-full px-4 py-2 flex-1 md:w-64 shadow-sm">
                            <Search size={16} className="text-zinc-400" />
                            <input type="text" placeholder="Search Feed..." className="bg-transparent border-none text-xs text-black outline-none w-full ml-2 placeholder:text-zinc-400" />
                        </div>
                     </div>
                 </div>

                 {/* Grille 3 Colonnes */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                     {/* Colonne Gauche : Favoris & Communauté (3 cols) */}
                     <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
                         <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
                             <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Favoris</p>
                             <div className="space-y-4">
                                 {['Coach Rokhy', 'Dr. Thierno', 'Amina Fall'].map((name, i) => (
                                     <div key={i} className="flex items-center justify-between cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-xl transition-colors group">
                                         <div className="flex items-center gap-3">
                                             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} className="w-10 h-10 rounded-full border border-zinc-200" alt={name} />
                                             <p className="text-xs font-bold text-black group-hover:text-[#39FF14] transition-colors">{name}</p>
                                         </div>
                                         <Heart size={14} className="text-red-500 fill-red-500" />
                                     </div>
                                 ))}
                             </div>
                         </div>

                         <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
                             <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Abonnements</p>
                             <div className="space-y-4">
                                 {['Sophie Diop', 'Marietou Sall', 'Ndeye Ndiaye'].map((name, i) => (
                                     <div key={i} className="flex items-center justify-between cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-xl transition-colors group">
                                         <div className="flex items-center gap-3">
                                             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 grayscale group-hover:grayscale-0 transition-all" alt={name} />
                                             <p className="text-xs font-bold text-black group-hover:text-[#39FF14] transition-colors">{name}</p>
                                         </div>
                                         <button className="text-[10px] font-black text-zinc-400 hover:text-black">Suivre</button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>

                     {/* Colonne Centrale : Feed (6 cols) */}
                     <div className="col-span-1 lg:col-span-6 space-y-6">
                        {/* Zone de Création */}
                        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm focus-within:border-[#39FF14]/50 transition-colors">
                           {newPostImage && (
                               <div className="relative w-full h-48 mb-4 rounded-2xl overflow-hidden border border-zinc-200">
                                  <img src={newPostImage} className="w-full h-full object-cover" />
                                  <button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500"><X size={14}/></button>
                               </div>
                           )}
                           <div className="flex items-start gap-4">
                               <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Membre')}&background=random`} className="w-10 h-10 rounded-full border border-zinc-200 mt-1" alt="Moi" />
                               <div className="flex-1">
                                   <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Partagez votre dernier repas ou un accomplissement sportif..." className="w-full bg-transparent resize-none outline-none font-medium text-sm min-h-[60px] placeholder:text-zinc-400 mt-2" />
                               </div>
                           </div>
                           <div className="flex justify-between items-center mt-2 pt-4 border-t border-zinc-100">
                              <div className="flex gap-2">
                                  <label className="text-zinc-500 hover:text-black transition-colors p-2 cursor-pointer bg-zinc-50 hover:bg-zinc-100 rounded-xl flex items-center gap-2">
                                     <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                                     {uploadingImage ? <Activity size={16} className="animate-spin" /> : <Camera size={16}/>}
                                     <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Photo</span>
                                  </label>
                              </div>
                              <button onClick={handlePostCommunity} disabled={!newPostText.trim() && !newPostImage} className="bg-black text-[#39FF14] px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Publier</button>
                           </div>
                        </div>

                        {/* Le Feed */}
                        <div className="space-y-6">
                           {Array.isArray(communityPosts) && communityPosts.length > 0 ? communityPosts.map((post, idx) => (
                              <div key={post.id || idx} className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex flex-col group">
                                 <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-black text-[#39FF14] rounded-full flex items-center justify-center font-black text-xl shadow-inner">{post.client?.charAt(0) || 'M'}</div>
                                        <div>
                                            <p className="font-black text-sm text-black flex items-center gap-1">{post.client || 'Membre'} <CheckCircle size={12} className="text-[#39FF14] fill-[#39FF14] text-black"/></p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{post.created_at && !isNaN(new Date(post.created_at).getTime()) ? new Date(post.created_at).toLocaleString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : 'Récemment'}</p>
                                        </div>
                                     </div>
                                     <MoreHorizontal size={18} className="text-zinc-400 cursor-pointer hover:text-black transition-colors" />
                                 </div>

                                 <p className="text-sm font-medium text-zinc-700 mb-4 whitespace-pre-wrap leading-relaxed">{post.content || post.texte}</p>

                                 {post.image_url && (
                                     <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-zinc-100 bg-zinc-50 relative cursor-pointer" onClick={() => window.open(post.image_url, '_blank')}>
                                         <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" alt="Post" />
                                     </div>
                                 )}

                                 <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                     <div className="flex items-center gap-6">
                                         <button className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors text-zinc-400 hover:text-red-500`}>
                                             <Heart size={16} />
                                             {post.reactions?.top || post.reactions?.length || Math.floor(Math.random() * 50) + 1} Likes
                                         </button>
                                         <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                                             <MessageSquare size={16}/> {post.comments?.length || Math.floor(Math.random() * 10)} Réponses
                                         </button>
                                     </div>
                                     <button className="text-zinc-400 hover:text-black transition-colors">
                                         <Bookmark size={18} />
                                     </button>
                                 </div>
                              </div>
                           )) : (
                               <div className="text-center py-16 px-6 text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-[2rem] bg-white">
                                   <Camera size={40} className="mx-auto mb-4 text-zinc-300"/>
                                   Soyez le premier à partager votre assiette ! 📸
                               </div>
                           )}
                        </div>
                     </div>

                     {/* Colonne Droite : Mini Profil & Notifications (3 cols) */}
                     <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">

                         {/* Mini Profile Card */}
                         <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm relative">
                             <div className="h-24 bg-gradient-to-r from-black to-zinc-800 w-full relative">
                                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                             </div>
                             <div className="px-6 pb-6 relative flex flex-col items-center">
                                 <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Membre')}&background=random`} className="w-20 h-20 rounded-full border-4 border-white shadow-md -mt-10 mb-3 bg-zinc-100 object-cover" alt="Moi" />
                                 <div className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm absolute top-4 left-4">Lekkologue Pro</div>

                                 <p className="text-sm font-black text-black text-center">{user?.full_name || 'Membre'}</p>
                                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1 mb-6 text-center">Niveau {lvlInfo.name}</p>

                                 <div className="grid grid-cols-3 w-full gap-4 text-center border-t border-zinc-100 pt-4 mb-6">
                                     <div>
                                         <p className="text-lg font-black text-black">{jongomaXP}</p>
                                         <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Score XP</p>
                                     </div>
                                     <div>
                                         <p className="text-lg font-black text-black">1.2k</p>
                                         <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Followers</p>
                                     </div>
                                     <div>
                                         <p className="text-lg font-black text-black">{(communityPosts.filter(p => p.client === user?.full_name).length) || 0}</p>
                                         <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Posts</p>
                                     </div>
                                 </div>

                                 <button onClick={openLeaderboard} className="w-full bg-black text-[#39FF14] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-md">
                                     Voir mon classement
                                 </button>
                             </div>
                         </div>

                         {/* Notifications / Reminders */}
                         <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex-1">
                             <div className="flex justify-between items-center mb-6">
                                 <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Notifications</p>
                                 <button className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest hover:text-black transition-colors">See All</button>
                             </div>

                             <div className="space-y-6">
                                 <div className="flex items-start gap-4">
                                     <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                         <Droplet size={14}/>
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-1">
                                             <p className="text-xs font-bold text-black">Time to hydrate!</p>
                                             <p className="text-[9px] text-zinc-400">1h ago</p>
                                         </div>
                                         <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">Il te manque encore {8 - waterGlasses} verres d'eau pour atteindre ton objectif du jour. Bois un verre maintenant !</p>
                                     </div>
                                 </div>

                                 <div className="flex items-start gap-4">
                                     <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                         <Activity size={14}/>
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-1">
                                             <p className="text-xs font-bold text-black">Workout Reminder</p>
                                             <p className="text-[9px] text-zinc-400">2h ago</p>
                                         </div>
                                         <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">Tu as une session "Cardio Intense" prévue dans 30 minutes. Prépare tes baskets !</p>
                                     </div>
                                 </div>

                                 <div className="flex items-start gap-4">
                                     <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                         <Moon size={14}/>
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-1">
                                             <p className="text-xs font-bold text-black">Sleep Reminder</p>
                                             <p className="text-[9px] text-zinc-400">Hier</p>
                                         </div>
                                         <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">Il est temps de se déconnecter des écrans pour un sommeil réparateur.</p>
                                     </div>
                                 </div>
                             </div>
                         </div>

                     </div>
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
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowRedoDiagModal(false)} className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] max-w-md w-full relative shadow-[0_0_50px_rgba(57,255,20,0.3)] border-t-[8px] border-[#39FF14] animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">
            <button onClick={() => setShowRedoDiagModal(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all z-50"><X size={20}/></button>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pb-4 pr-2 mt-4 sm:mt-0">
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
            </div>

            <div className="flex gap-3">
               <button onClick={() => setShowRedoDiagModal(false)} className="flex-1 bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-sm">
                  Retour au Hub
               </button>
               <button disabled={!redoReason} onClick={() => { 
                   setShowRedoDiagModal(false); 
                   if (clientProfile?.diagnostic_data) {
                       setDiagData(prev => ({...prev, ...clientProfile.diagnostic_data}));
                       if (clientProfile.diagnostic_data.gender === 'Femme') {
                           setDiagStep(1); // Permet la modification du profil hormonal/santé
                       } else {
                           setDiagStep(2); // Les hommes passent l'étape 1 directement
                       }
                   } else {
                       setDiagStep(1); 
                   }
               }} className="flex-1 bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Continuer <ArrowRight size={14} className="inline ml-1"/>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DIAGNOSTIC INTERNE (REDO) */}
      {diagStep > 0 && (
        <div id="diag-modal-overlay" onClick={(e: any) => e.target.id === 'diag-modal-overlay' && setDiagStep(0)} className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-[2rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 text-black max-h-[90vh] overflow-hidden">
            <button onClick={() => setDiagStep(0)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/20 text-white rounded-full hover:bg-black hover:text-[#39FF14] transition z-50"><X size={20}/></button>

            <div className="bg-black text-white p-6 sm:p-8 text-center relative rounded-t-[2rem] shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${(diagStep / 4) * 100}%` }}></div>
              </div>
              <Activity className="text-[#39FF14] mx-auto mb-2" size={28} />
              <h2 className={`${spaceGrotesk.className} text-xl md:text-3xl font-black uppercase tracking-tighter`}>
                {diagStep === 5 ? "Nouveau Plan Prêt !" : "Bilan Nutritionnel"}
              </h2>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar pb-10">
              {diagStep !== 8 ? (
                <form onSubmit={handleDiagSubmit} className="w-full">

                  {/* ETAPE 1: Sexe & Âge */}
                  {diagStep === 1 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full max-w-lg mx-auto">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 1 : Sexe & Âge</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel est votre sexe ?</label>
                        <div className="grid grid-cols-2 gap-4 w-full mb-8">
                          {[
                            { id: 'Homme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_format_1_1_en_202606111044_rjknkg.jpg' },
                            { id: 'Femme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_1_1_en_gardant_202606111043_unmonc.jpg' }
                          ].map(option => (
                            <div key={option.id} onClick={() => setDiagData({...diagData, gender: option.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 ${diagData.gender === option.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}`}>
                              <img src={option.img} alt={option.id} className="w-full aspect-square object-cover" />
                              <div className="absolute bottom-0 w-full bg-black/80 text-white py-4 font-black uppercase tracking-widest text-sm text-center backdrop-blur-md">{option.id}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel âge avez-vous ?</label>
                        <input type="number" required placeholder="Ex: 35" value={diagData.age} onChange={(e) => setDiagData({...diagData, age: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                      </div>
                    </div>
                  )}

                  {/* ETAPE 2: Objectifs physiques */}
                  {diagStep === 2 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full max-w-lg mx-auto">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 2 : Vos objectifs</h2>

                      <div className="w-full text-left mb-6">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel est votre objectif principal ?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
                          {[
                            { id: 'perte_poids', label: 'Perte de poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544253/A_high-end_commercial_photorealistic_full-body_202606151657_cfq5fb.jpg', desc: 'Déficit calorique' },
                            { id: 'maintien', label: 'Maintien du poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781542708/A_high-end_commercial_photorealistic_portrait_202606151658_noabp9.jpg', desc: 'Stabiliser sainement' },
                            { id: 'prise_masse', label: 'Prise de masse', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544091/rajoute_le_logo_sur_la_202606151721_aayo61.jpg', desc: 'Développer le muscle' }
                          ].map(goal => (
                            <div key={goal.id} onClick={() => setDiagData({...diagData, goal: goal.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col ${diagData.goal === goal.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}`}>
                              <img src={goal.img} alt={goal.label} className="w-full aspect-square object-cover" />
                              <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                                <span className="font-black uppercase tracking-widest text-xs md:text-sm mb-1 text-center">{goal.label}</span>
                                <span className="text-[10px] text-zinc-400 font-bold leading-tight text-center">{goal.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Taille (cm)</label>
                          <input type="number" required placeholder="Ex: 170" value={diagData.height} onChange={(e) => setDiagData({...diagData, height: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Poids actuel (kg)</label>
                          <input type="number" required placeholder="Ex: 75" value={diagData.currentWeight} onChange={(e) => setDiagData({...diagData, currentWeight: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Poids cible (kg)</label>
                          <input type="number" required placeholder="Ex: 65" value={diagData.targetWeight} onChange={(e) => setDiagData({...diagData, targetWeight: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Date cible</label>
                          <input type="date" required value={diagData.targetDate} onChange={(e) => setDiagData({...diagData, targetDate: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-sm outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 3: Mode de vie */}
                  {diagStep === 3 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 3 : Mode de vie</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675093/3_topvyj.png" className="w-8 h-8"/>
                           Combien d'heures de sommeil avez-vous chaque nuit ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Moins de 5h', '6-7h', '8h ou plus'].map(hours => (
                             <div key={hours} onClick={() => setDiagData({...diagData, sleepHours: hours})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.sleepHours === hours ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black">{hours}</span>
                                {diagData.sleepHours === hours && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675092/5_olxege.png" className="w-8 h-8"/>
                            Comment décririez-vous vos déplacements au quotidien ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                          {['Voiture/Sédentaire', 'Marche/Activité légère', 'Travail physique/Modérée', 'Sport intense/Intense'].map(commute => (
                             <div key={commute} onClick={() => setDiagData({...diagData, dailyCommute: commute})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.dailyCommute === commute ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{commute}</span>
                                {diagData.dailyCommute === commute && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 4: Profil Santé */}
                  {diagStep === 4 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 4 : Profil Santé</h2>

                      <div className="w-full mb-6 text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Avez-vous des conditions médicales ?</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                            {['Diabète', 'Hypertension', 'Aucun problème'].map(condition => {
                                const isSelected = diagData.healthProfile === condition;
                                return (
                                  <div key={condition} onClick={() => setDiagData({...diagData, healthProfile: condition})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                    <div className="flex flex-col items-center gap-2 text-center"><HeartPulse size={24} className="text-zinc-400 mb-1"/><span className="font-bold text-black text-sm">{condition}</span></div>
                                    {isSelected && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                                  </div>
                                );
                            })}
                          </div>
                      </div>

                      {diagData.gender === 'Femme' && (
                          <div className="w-full text-left animate-in fade-in slide-in-from-top-2">
                              <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Spécificités féminines :</label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                                {['Allaitement', 'Grossesse', 'SOPK', 'Périménopause/Ménopause', 'Aucune'].map(condition => {
                                    const isSelected = diagData.femaleSpecific === condition;
                                    return (
                                      <div key={condition} onClick={() => setDiagData({...diagData, femaleSpecific: condition})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                        <span className="font-bold text-black">{condition}</span>
                                        {isSelected && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                                      </div>
                                    );
                                })}
                              </div>
                          </div>
                      )}
                    </div>
                  )}

                  {/* ETAPE 5: Nutrition & Hydratation */}
                  {diagStep === 5 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 5 : Nutrition & Hydratation</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png" className="w-8 h-8"/>
                           Quelle quantité d'eau consommez-vous ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Moins de 50cl', '1L', 'Plus de 1.5L'].map(vol => (
                             <div key={vol} onClick={() => setDiagData({...diagData, waterIntake: vol})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.waterIntake === vol ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black">{vol}</span>
                                {diagData.waterIntake === vol && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">
                           Avez-vous enchaîné les régimes restrictifs par le passé ?
                        </label>
                        <div className="grid grid-cols-2 gap-4 w-full">
                          {['Oui', 'Non'].map(ans => (
                             <div key={ans} onClick={() => setDiagData({...diagData, pastDiets: ans})} className={`flex-1 cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.pastDiets === ans ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-lg">{ans}</span>
                                {diagData.pastDiets === ans && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675094/4_uk6ui2.png" className="w-8 h-8"/>
                            Quelles matières grasses utilisez-vous principalement pour la cuisson ?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          {['Huile de palme/Arachide', 'Huile d\'olive/Tournesol', 'Beurre/Karité', 'Je cuisine sans huile'].map(fat => (
                              <div key={fat} onClick={() => {
                                  const fats = diagData.cookingFats.includes(fat) ? diagData.cookingFats.filter(f => f !== fat) : [...diagData.cookingFats, fat];
                                  setDiagData({...diagData, cookingFats: fats});
                              }} className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 ${diagData.cookingFats.includes(fat) ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${diagData.cookingFats.includes(fat) ? 'bg-[#39FF14] border-[#39FF14]' : 'border-zinc-300'}`}>
                                  {diagData.cookingFats.includes(fat) && <CheckCircle size={14} className="text-black"/>}
                                </div>
                                <span className="font-bold text-black text-xs sm:text-sm leading-tight">{fat}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 6: Rythme Africain */}
                  {diagStep === 6 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 6 : Rythme Africain</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675091/sauce_gmyero.png" className="w-8 h-8"/>
                           Quel est l'élément principal de vos repas ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                          {['Féculents lourds (Foufou, Tô)', 'Riz/Céréales', 'Sauces riches', 'Protéines/Légumes'].map(element => (
                             <div key={element} onClick={() => setDiagData({...diagData, mainMealElement: element})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.mainMealElement === element ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{element}</span>
                                {diagData.mainMealElement === element && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675094/4_uk6ui2.png" className="w-8 h-8"/>
                            Le soir à la maison, votre dîner est généralement :
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Très copieux', 'Léger', 'Je grignote'].map(meal => (
                             <div key={meal} onClick={() => setDiagData({...diagData, eveningMeal: meal})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.eveningMeal === meal ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{meal}</span>
                                {diagData.eveningMeal === meal && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 7: Pratique familiale */}
                  {diagStep === 7 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 7 : Pratique Familiale</h2>
                      <div className="space-y-10 w-full max-w-2xl">
                        {/* GRILLE 1 : DÉJEUNER */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Comment déjeunez-vous le midi ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                              { id: 'En solo au bureau', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/La_Gamelle_ywfy3t.jpg', desc: 'Avec ma gamelle / Tupperware' },
                              { id: 'À la maison', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Le_Bol_Commun_hb9fns.jpg', desc: 'Autour du grand bol familial' }
                            ].map(habit => (
                              <div key={habit.id} onClick={() => setDiagData({...diagData, lunchHabit: habit.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.lunchHabit === habit.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={habit.img} className="w-full h-40 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-sm mb-1 text-center">{habit.id}</span>
                                  <span className="text-[10px] text-zinc-400 text-center">{habit.desc}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GRILLE 2 : POUR QUI JE CUISINE */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Pour qui préparez-vous les repas ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                              { id: 'Je cuisine uniquement pour moi seule', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_moi_seule_mfo6vw.jpg' },
                              { id: 'Je cuisine la marmite pour toute la famille', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_la_famille_qzlwke.jpg' }
                            ].map(habit => (
                              <div key={habit.id} onClick={() => setDiagData({...diagData, cookingHabit: habit.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.cookingHabit === habit.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={habit.img} className="w-full h-40 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-xs text-center leading-tight">{habit.id}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GRILLE 3 : BUDGET */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Budget courses par semaine ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { id: 'Budget Serré', price: '8 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630660/A_cute__highly_detailed_3D_202606161723_fcl8jj.jpg' },
                              { id: 'Budget Famille', price: '15 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630665/A_cute__highly_detailed_3D_202606161723_1_rx6yry.jpg' },
                              { id: 'Budget Confort', price: '25 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630664/A_cute__highly_detailed_3D_202606161723_2_xxku54.jpg' }
                            ].map(budget => (
                              <div key={budget.id} onClick={() => setDiagData({...diagData, weeklyBudget: budget.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.weeklyBudget === budget.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={budget.img} className="w-full h-24 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-3 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-[10px] mb-1">{budget.id}</span>
                                  <span className="text-[#39FF14] font-bold text-[9px]">{budget.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <button type="submit" id="hidden-submit-btn" style={{display:"none"}}></button>

                  {diagStep < 10 && (
                    <div className="flex gap-4 pt-6 mt-8 border-t border-zinc-100">
                        {diagStep > 1 && (
                            <button type="button" onClick={() => setDiagStep(s => s - 1)} className="px-8 py-4 bg-zinc-100 rounded-xl font-bold text-sm text-black hover:bg-zinc-200 transition">
                                Retour
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setDiagStep(s => s === 7 ? 10 : s + 1)}
                            disabled={
                                (diagStep === 1 && (!diagData.gender || !diagData.age)) ||
                                (diagStep === 2 && (!diagData.goal || !diagData.height || !diagData.currentWeight || !diagData.targetWeight || !diagData.targetDate)) ||
                                (diagStep === 3 && (!diagData.sleepHours || !diagData.dailyCommute)) ||
                                (diagStep === 4 && (!diagData.healthProfile || (diagData.gender === 'Femme' && !diagData.femaleSpecific))) ||
                                (diagStep === 5 && (!diagData.waterIntake || !diagData.pastDiets || diagData.cookingFats.length === 0)) ||
                                (diagStep === 6 && (!diagData.mainMealElement || !diagData.eveningMeal)) ||
                                (diagStep === 7 && (!diagData.lunchHabit || !diagData.cookingHabit || !diagData.weeklyBudget))
                            }
                            className="flex-1 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase flex justify-center items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant <ChevronRight size={18}/>
                        </button>
                    </div>
                  )}

{/* ETAPE 10: BILAN VISUEL */}
                  {diagStep === 10 && (
    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full bg-white p-6 md:p-8 rounded-[2rem] shadow-xl">
        {(() => {
            const profile = calculateDailyCalories(diagData);
            const currentW = parseFloat(diagData.currentWeight) || 0;
            const targetW = parseFloat(diagData.targetWeight) || 0;
            const weightToLose = currentW - targetW;

            // Calcul de l'IMC
            const hM = (parseFloat(diagData.height) || 0) / 100;
            const imcVal = hM > 0 ? currentW / (hM * hM) : 0;
            const imc = imcVal.toFixed(1);

            let imcBadge = "bg-green-100 text-green-700";
            let imcText = "Normal";
            if (imcVal < 18.5) { imcBadge = "bg-blue-100 text-blue-600"; imcText = "Maigreur"; }
            else if (imcVal >= 25 && imcVal < 30) { imcBadge = "bg-orange-100 text-orange-600"; imcText = "Surpoids"; }
            else if (imcVal >= 30) { imcBadge = "bg-red-100 text-red-600"; imcText = "Obésité"; }

            // Calcul de l'angle de l'aiguille (Min IMC 15 = 0°, Max IMC 40 = 180°)
            const clampedImc = Math.max(15, Math.min(imcVal, 40));
            const needleRotation = ((clampedImc - 15) / 25) * 180;

            return (
                <div className="w-full">
                    <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 text-black">Vos Objectifs Validés</h2>
                    <p className="text-sm font-medium text-zinc-500 mb-8 max-w-lg mx-auto">Voici l'analyse complète de votre profil de départ.</p>

                    {/* Grille Principale à 4 Colonnes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                        {/* Carte 1 : Jauge IMC Demi-Cercle (Speedometer) */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Indice de Masse Corporelle</p>

                            <div className="relative w-32 h-16 mt-2 overflow-visible">
                                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                    {/* Arc de cercle avec dégradé fonctionnel */}
                                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#speedometerGradient)" strokeWidth="12" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="35%" stopColor="#22c55e" />
                                            <stop offset="70%" stopColor="#eab308" />
                                            <stop offset="100%" stopColor="#ef4444" />
                                        </linearGradient>
                                    </defs>
                                    {/* Aiguille rotative pivotant sur l'axe central inférieur (50,50) */}
                                    <g style={{ transform: `rotate(${needleRotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 1.5s ease-out' }}>
                                        <polygon points="48,50 50,12 52,50" fill="#18181b" />
                                        <circle cx="50" cy="50" r="5" fill="#18181b" />
                                    </g>
                                </svg>
                            </div>

                            <div className="text-center mt-2">
                                <p className="text-2xl font-black text-black">{imc}</p>
                                <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 ${imcBadge}`}>{imcText}</span>
                            </div>
                        </div>

                        {/* Carte 2 : Calories Cibles */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Apport Énergétique</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781443964/A_cute__highly_detailed_3D_202606141332_ggiubt.jpg" className="w-12 h-12 rounded-full object-cover" alt="Calories" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-black">{profile.calories} <span className="text-sm font-bold text-zinc-500">kcal</span></p>
                                {profile.hitFloor && <span className="text-red-600 font-bold text-[8px] uppercase tracking-wider block mt-1">Plancher de sécurité activé</span>}
                            </div>
                        </div>

                        {/* Carte 3 : Objectif Poids */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Poids Cible</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg" className="w-12 h-12 rounded-full object-cover" alt="Poids" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-black">{targetW} <span className="text-sm font-bold text-zinc-500">kg</span></p>
                                {weightToLose > 0 && <p className="text-[10px] font-bold text-zinc-500 mt-1">-{weightToLose.toFixed(1)} kg à éliminer</p>}
                            </div>
                        </div>

                        {/* Carte 4 : Date Cible */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Date Prévue</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_1_uvgqf0.jpg" className="w-12 h-12 rounded-full object-cover" alt="Date" />
                            <p className="text-xl font-black text-black capitalize leading-tight">
                                {diagData.targetDate ? new Date(diagData.targetDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>

                    <button onClick={handleDiagSubmit} disabled={isSubmittingDiag} className="w-full bg-black text-[#39FF14] py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl hover:scale-[1.01] transition-transform">
                        {isSubmittingDiag ? "Enregistrement en cours..." : "Valider mes objectifs"}
                    </button>
                </div>
            );
        })()}
    </div>
)}
</form>
              ) : (
                <div className="text-center py-6 animate-in zoom-in">
                  <h3 className="text-2xl font-black uppercase mb-6 text-black">Votre Espace a été mis à jour !</h3>
                  <p className="text-zinc-600 font-medium mb-8">Les nouveaux menus ont été générés selon vos nouveaux paramètres, vous pouvez reprendre le suivi dès maintenant.</p>
                  
                  <div className="flex flex-col gap-3 mt-4">
                     <button onClick={() => setDiagStep(0)} type="button" className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg flex justify-center items-center gap-2">
                        Retourner au Tracker <ArrowRight size={18}/>
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODALE DE PAIEMENT WAVE / OM */}
      {showPaymentModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowPaymentModal(false)} className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3rem] max-w-md w-full relative shadow-[0_0_50px_rgba(57,255,20,0.15)] border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto flex flex-col overflow-hidden">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all text-zinc-500 z-[60]">
              <X size={20} />
            </button>
            <div className="text-center mb-8 shrink-0 mt-4">
               <div className="w-20 h-20 bg-black text-[#39FF14] rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-xl"><CreditCard size={32} /></div>
               <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter`}>Renouvellement Premium</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Paiement sécurisé via PayDunya</p>
            </div>
            
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mb-6">
               <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-sm">Abonnement Mensuel</span>
                  <span className="font-black text-xl">2 900 F</span>
               </div>
               <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-4">
                  Prolongez votre accès au Smart Planner, au générateur de listes de courses, et au réseau communautaire privé OnyxNutrition.
               </p>
               <div className="pt-4 border-t border-zinc-200">
                  <p className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-3 flex items-center gap-1"><Sparkles size={12}/> Débloquez la Galerie Complète :</p>
                  <div className="flex flex-wrap gap-2">
                      <span className="bg-[#39FF14]/20 text-green-800 border border-[#39FF14]/50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">📉 Low Carb</span>
                      <span className="bg-[#39FF14]/20 text-green-800 border border-[#39FF14]/50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">💪 Protéinés</span>
                      <span className="bg-[#39FF14]/20 text-green-800 border border-[#39FF14]/50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">⚡ Low Fat</span>
                      <span className="bg-[#39FF14]/20 text-green-800 border border-[#39FF14]/50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">🔥 Peu Calorique</span>
                      <span className="bg-[#39FF14]/20 text-green-800 border border-[#39FF14]/50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">🌅 Ndekki Santé</span>
                  </div>
               </div>
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

      {/* XP GAIN ANIMATION */}
      <AnimatePresence>
        {xpAnimation && (
          <motion.div
            key={xpAnimation.id}
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            onAnimationComplete={() => setTimeout(() => setXpAnimation(null), 3000)}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed bottom-24 left-6 z-[120] bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-3 border-2 border-white/50"
          >
            <Sparkles size={24} />
            <div className="flex flex-col">
              <span className="text-2xl font-black leading-none">+{xpAnimation.amount} XP</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{xpAnimation.reason}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <footer className="bg-black text-white py-16 mt-20 border-t-4 border-[#39FF14]">
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
              <h4 className="font-black text-lg uppercase tracking-widest mb-6 flex items-center gap-2"><Compass className="text-[#39FF14]"/> Ressources</h4>
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
                     <div className="flex items-center gap-4">
                        {shopCart.length > 0 && (
                            <button onClick={() => { if(confirm("Voulez-vous vraiment vider votre panier ?")) setShopCart([]); }} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center gap-1">
                               <Trash2 size={14}/> Vider
                            </button>
                        )}
                        <button onClick={() => setShowCartModal(false)} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors">
                           <X size={16}/>
                        </button>
                     </div>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                     {remainingForFreeShipping > 0 ? (
                         <p className="text-xs font-bold text-black dark:text-white mb-2 text-center">Plus que <span className="text-[#39FF14] font-black">{remainingForFreeShipping.toLocaleString()} F</span> pour la livraison gratuite !</p>
                     ) : (
                         <p className="text-xs font-bold text-[#39FF14] mb-2 text-center flex items-center justify-center gap-1"><CheckCircle size={14}/> Livraison gratuite débloquée !</p>
                     )}
                     <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                         <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                     </div>
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
                                 <img src={item.image_url || 'https://placehold.co/400x400/111/39FF14?text=Produit'} alt={item.nom} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/400x400/111/39FF14?text=Produit'} />
                              </div>
                              <div className="flex-1 flex flex-col justify-center min-w-0">
                                 <h4 className="font-bold text-sm text-black dark:text-white line-clamp-1">{item.nom}</h4>
                                 <p className="text-[#39FF14] font-black text-sm mt-1">{((item.finalPrice || item.prix_premium || item.prix_standard || 0) * (item.quantity || 1)).toLocaleString()} F</p>
                                 <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 mt-2 w-max">
                                     <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 text-zinc-500 hover:text-black dark:hover:text-white transition"><Minus size={14}/></button>
                                     <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                                     <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 text-zinc-500 hover:text-black dark:hover:text-white transition"><Plus size={14}/></button>
                                 </div>
                              </div>
                              <button onClick={() => setShopCart(shopCart.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors">
                                 <Trash2 size={16}/>
                              </button>
                           </div>
                        ))
                     )}

                     {crossSellProducts.length > 0 && shopCart.length > 0 && (
                         <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles size={14} className="text-yellow-500"/> Complétez votre panier</p>
                             <div className="space-y-2">
                                 {crossSellProducts.map((p: any) => (
                                     <div key={p.id} className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                         <img src={p.image_url || 'https://placehold.co/400x400/111/39FF14?text=Produit'} className="w-10 h-10 rounded-lg object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/400x400/111/39FF14?text=Produit'} />
                                         <div className="flex-1 min-w-0">
                                             <p className="font-bold text-xs truncate text-black dark:text-white">{p.nom}</p>
                                             <p className="text-[#39FF14] font-black text-xs">{(p.prix_standard || 0).toLocaleString()} F</p>
                                         </div>
                                         <button onClick={() => addToCart(p)} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-lg hover:bg-[#39FF14] hover:text-black dark:hover:text-black transition-colors">
                                             <Plus size={14}/>
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}
                  </div>

                  {shopCart.length > 0 && (
                     <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="mb-4">
                           <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Adresse de livraison</label>
                           <input type="text" placeholder="Ex: Cité Keur Gorgui, Villa 24B" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className={`mt-1 w-full p-3 rounded-xl border font-bold text-xs outline-none focus:border-[#39FF14] ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'}`} />
                        </div>
                        <div className="flex justify-between items-center mb-6">
                           <span className="font-black text-zinc-500 uppercase tracking-widest text-xs">Total Estimé</span>
                           <span className="font-black text-2xl text-black dark:text-white">
                              {shopCart.reduce((acc, item) => acc + ((item.finalPrice || item.prix_premium || item.prix_standard || 0) * (item.quantity || 1)), 0).toLocaleString()} F
                           </span>
                        </div>
                        <button onClick={() => { setShowCartModal(false); handleShopCheckout(); }} className="w-full bg-black dark:bg-white text-[#39FF14] dark:text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                           <ShoppingCart size={16}/> Commander via WhatsApp
                        </button>

                        <button 
                           onClick={async () => {
                               let shareMsg = `👋 Bonjour ! Je souhaite sauvegarder mon panier pour plus tard sur Onyx Nutrition :\n\n`;
                               shopCart.forEach(item => { shareMsg += `- ${item.nom} (x${item.quantity}) : ${((item.finalPrice || item.prix_premium || item.prix_standard || 0) * item.quantity).toLocaleString()} F\n`; });
                               shareMsg += `\n*Total provisoire : ${subTotal.toLocaleString()} F*\n\nPouvez-vous me garder ces articles au chaud ? 🙏`;
                               
                               try {
                                   await supabase.from('leads').insert([{
                                       source: 'Panier Onyx Nutrition',
                                       intent: 'Sauvegarde Panier WhatsApp',
                                       message: shareMsg,
                                       status: 'Nouveau',
                                       saas: 'Onyx Nutrition'
                                   }]);
                               } catch (e) {}

                               window.open(`https://wa.me/221785338417?text=${encodeURIComponent(shareMsg)}`, '_blank');
                           }}
                           className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 mt-3 shadow-lg"
                        >
                           <MessageSquare size={16}/> M'envoyer mon panier (WhatsApp)
                        </button>

                        <button 
                           onClick={() => { if(confirm("Voulez-vous vraiment vider votre panier ?")) { setShopCart([]); setIsShopPromoApplied(false); setAppliedPromoData(null); setShopPromoCode(""); setShowCartModal(false); } }} 
                           className="w-full bg-red-50 text-red-500 border border-red-100 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 mt-3 shadow-sm"
                        >
                           <Trash2 size={14}/> Vider mon panier
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

      {/* --- EXIT INTENT PANIER --- */}
      {showCartExitIntent && (
        <div id="cart-exit-overlay" onClick={(e: any) => e.target.id === 'cart-exit-overlay' && setShowCartExitIntent(false)} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 border-t-8 border-[#39FF14] rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 text-center">
                <button onClick={() => setShowCartExitIntent(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
                <div className="w-20 h-20 bg-black text-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
                    <Gift size={32} />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">Attendez !</h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-6">Vous allez laisser vos articles ? Voici <span className="font-black text-black dark:text-white">10% de réduction immédiate</span> pour valider votre panier maintenant.</p>
                <div className="bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 mb-6">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Votre code promo</p>
                    <p className="text-2xl font-black text-[#39FF14] tracking-widest">CODE10</p>
                </div>
                <button onClick={() => {
                    setShopPromoCode('CODE10');
                    if (!shopPromoCodesDB.some(c => c.code === 'CODE10')) {
                        setShopPromoCodesDB(prev => [...prev, { id: 999, code: 'CODE10', discount_pct: 10, min_xp: 0, active: true }]);
                    }
                    setShowCartExitIntent(false);
                    setShowCartModal(true);
                    setAppliedPromoData({ id: 999, code: 'CODE10', discount_pct: 10, min_xp: 0, active: true } as any);
                    setIsShopPromoApplied(true);
                    alert("Code promo de 10% appliqué avec succès !");
                }} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-lg">
                    Appliquer le code & Commander
                </button>
                <button onClick={() => setShowCartExitIntent(false)} className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition">Non merci, je quitte</button>
            </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] px-6 py-3 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 z-[400] animate-in slide-in-from-bottom-5">
             <CheckCircle size={16}/> {toastMessage}
         </div>
      )}
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
         <button onClick={() => { setActiveTab('week'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'week' ? 'opacity-100' : 'opacity-50'}`}><img src={MENU_ICONS.samaMenu} className="w-5 h-5 rounded-md object-cover"/><span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Sama Menu</span></button>
         <button onClick={() => { setActiveTab('today'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'today' ? 'opacity-100' : 'opacity-50'}`}><img src={MENU_ICONS.monJour} className="w-5 h-5 rounded-md object-cover"/><span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Mon Jour</span></button>
         <div className="flex-1 flex justify-center -mt-6">
            <button onClick={() => { handleMealClick('Collation', null, 'flexible'); setTimeout(() => setIsScanning(true), 300); }} className="bg-black text-[#39FF14] w-14 h-14 rounded-full shadow-[0_10px_20px_rgba(57,255,20,0.3)] border-4 border-[#f4f4f5] dark:border-zinc-950 flex items-center justify-center hover:scale-110 transition-transform"><ScanLine size={24}/></button>
         </div>
         <button onClick={() => { setActiveTab('shop'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'shop' ? 'opacity-100' : 'opacity-50'}`}><img src={MENU_ICONS.shop} className="w-5 h-5 rounded-md object-cover"/><span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Boutique</span></button>
         <button onClick={() => setIsMobileMenuOpen(true)} className={`flex flex-col items-center gap-1 flex-1 opacity-50`}><MenuIcon size={20} className="text-zinc-500"/><span className="text-[8px] font-black uppercase tracking-widest mt-0.5 text-zinc-500">Menu</span></button>
      </div>

    </div>
  );
} 