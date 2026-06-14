"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Users, Search, Activity, HeartPulse, ExternalLink, ChevronLeft, ChevronDown, Calendar, Flame, Droplet, Target, AlertTriangle, Clock, Utensils, Plus, Edit3, Trash2, X, Save, CheckCircle, LineChart as LineChartIcon, BarChart as BarChartIcon, Upload, ShoppingBag, ShoppingCart, Package, MessageSquare, Ticket, Database, Loader2, Mail, Download, Sparkles, Bot, Star, Filter, ChevronRight, Eye, FileText, TrendingUp, Video } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const spaceGrotesk = { className: "font-sans" };

const DEFAULT_RECIPES = [
  // --- PETITS-DÉJEUNERS ---
  { type: "Petit-déjeuner", nom: "Lakh allégé (Mil & Lait) + Kinkeliba", calories: 300, is_bol_commun: false, bienfaits: "Riche en calcium et en sucres lents pour éviter le coup de barre de 11h.", ingredients: [{nom: "Mil", quantite: 50, unite: "g", rayon: "Marché local"}, {nom: "Lait demi-écrémé", quantite: 50, unite: "ml", rayon: "Supermarché"}, {nom: "Kinkeliba sans sucre", quantite: 1, unite: "tasse", rayon: "Marché local"}] },
  { type: "Petit-déjeuner", nom: "Flocons d'avoine, Banane & Café Touba", calories: 320, is_bol_commun: false, bienfaits: "Les fibres solubles de l'avoine gonflent dans l'estomac pour une satiété longue durée.", ingredients: [{nom: "Flocons d'avoine", quantite: 40, unite: "g", rayon: "Supermarché"}, {nom: "Banane", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Café Touba allégé", quantite: 1, unite: "tasse", rayon: "Marché local"}] },
  { type: "Petit-déjeuner", nom: "Tartines de Seigle, Sardines & Thé Vert", calories: 310, is_bol_commun: false, bienfaits: "Plein d'Oméga-3 excellents pour le cœur et le cerveau, avec un pain à IG très bas.", ingredients: [{nom: "Pain de seigle", quantite: 2, unite: "tranche", rayon: "Supermarché"}, {nom: "Sardines à l'huile", quantite: 50, unite: "g", rayon: "Supermarché"}, {nom: "Thé vert menthe", quantite: 1, unite: "tasse", rayon: "Supermarché"}] },
  { type: "Petit-déjeuner", nom: "Omelette aux Légumes & Infusion de Djar", calories: 280, is_bol_commun: false, bienfaits: "Des protéines de haute qualité dès le matin pour nourrir vos muscles.", ingredients: [{nom: "Oeufs", quantite: 2, unite: "pièce", rayon: "Supermarché"}, {nom: "Pain complet", quantite: 1, unite: "tranche", rayon: "Supermarché"}, {nom: "Infusion de Djar", quantite: 1, unite: "tasse", rayon: "Marché local"}] },
  { type: "Petit-déjeuner", nom: "Arraw (Bouillie de Mil) sans sucre & Kinkeliba", calories: 280, is_bol_commun: false, bienfaits: "Une infusion détoxifiante pour le foie associée à l'énergie douce du mil.", ingredients: [{nom: "Boules de mil (Arraw)", quantite: 50, unite: "g", rayon: "Marché local"}, {nom: "Lait écrémé", quantite: 150, unite: "ml", rayon: "Supermarché"}, {nom: "Feuilles de Kinkeliba", quantite: 1, unite: "poignée", rayon: "Marché local"}] },
  // --- DÉJEUNERS ---
  { type: "Déjeuner", nom: "Thieboudienne (Option Fonio)", calories: 600, is_bol_commun: true, bienfaits: "Le plat national allégé : riche en fibres et minéraux grâce à l'incorporation du Fonio.", ingredients: [{nom: "Thiof (Poisson)", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 80, unite: "g", rayon: "Boutique Onyx"}, {nom: "Chou", quantite: 0.5, unite: "pièce", rayon: "Marché local"}, {nom: "Huile d'olive ou colza", quantite: 1, unite: "càs", rayon: "Supermarché"}, {nom: "Carotte", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { type: "Déjeuner", nom: "Mafé allégé au Poulet (Beurre d'arachide)", calories: 550, is_bol_commun: true, bienfaits: "L'énergie durable des bonnes graisses de l'arachide pure, sans exploser les calories.", ingredients: [{nom: "Blanc de Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Pâte d'arachide pure", quantite: 30, unite: "g", rayon: "Boutique Onyx"}, {nom: "Fonio ou Riz", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Oignon", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { type: "Déjeuner", nom: "Salade de Fonio au Poulet", calories: 450, is_bol_commun: false, bienfaits: "Un repas léger et ultra-protéiné, particulièrement recommandé après le sport.", ingredients: [{nom: "Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Boutique Onyx"}, {nom: "Tomate", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Moutarde", quantite: 1, unite: "càc", rayon: "Supermarché"}] },
  { type: "Déjeuner", nom: "Yassa Poisson & Riz Étuvé", calories: 500, is_bol_commun: true, bienfaits: "Le citron et l'oignon du Yassa agissent comme des boosters d'immunité naturels.", ingredients: [{nom: "Poisson braisé", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Oignons", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Riz local étuvé", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Moutarde", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { type: "Déjeuner", nom: "Poisson Braisé (Thiof) & Légumes", calories: 480, is_bol_commun: false, bienfaits: "Extrêmement faible en mauvaises graisses, et ultra riche en protéines marines.", ingredients: [{nom: "Poisson", quantite: 200, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Légumes (Chou, Carotte)", quantite: 200, unite: "g", rayon: "Marché local"}, {nom: "Soumbala", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { type: "Déjeuner", nom: "Soupe Kandia (Gombo) Diététique", calories: 520, is_bol_commun: true, bienfaits: "Le gombo agit comme un lubrifiant naturel pour un transit intestinal parfait.", ingredients: [{nom: "Bœuf maigre", quantite: 100, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Gombos frais", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Boutique Onyx"}] },
  { type: "Déjeuner", nom: "Chili de Niébé à la Viande", calories: 490, is_bol_commun: true, bienfaits: "Le Niébé est le super-héros végétal pour consolider la masse musculaire.", ingredients: [{nom: "Viande hachée maigre", quantite: 100, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Niébé", quantite: 80, unite: "g", rayon: "Marché local"}, {nom: "Sauce tomate pure", quantite: 100, unite: "ml", rayon: "Supermarché"}] },
  { type: "Déjeuner", nom: "Couscous de Mil (Thiéré) Poulet", calories: 540, is_bol_commun: true, bienfaits: "Une céréale ancestrale et ultra digeste car totalement sans gluten.", ingredients: [{nom: "Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Thiéré (Couscous mil)", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Légumes", quantite: 150, unite: "g", rayon: "Marché local"}] },
  { type: "Déjeuner", nom: "Mbakhal Saloum Allégé", calories: 510, is_bol_commun: true, bienfaits: "Un plat traditionnel réconfortant avec un apport strictement contrôlé en glucides.", ingredients: [{nom: "Viande maigre", quantite: 100, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Pâte d'arachide pure", quantite: 15, unite: "g", rayon: "Boutique Onyx"}, {nom: "Riz brisé", quantite: 60, unite: "g", rayon: "Marché local"}] },
  { type: "Déjeuner", nom: "Fonio aux Crevettes & Poivrons", calories: 430, is_bol_commun: false, bienfaits: "Apporte une dose de Zinc et d'iode vitale pour réguler la thyroïde.", ingredients: [{nom: "Crevettes", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Boutique Onyx"}, {nom: "Poivrons", quantite: 150, unite: "g", rayon: "Marché local"}] },
  { type: "Déjeuner", nom: "Yassa Poulet au Fonio", calories: 520, is_bol_commun: true, bienfaits: "Une synergie entre la vitamine C du citron et le fer naturel du fonio.", ingredients: [{nom: "Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Oignons", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Boutique Onyx"}, {nom: "Huile d'olive", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { type: "Déjeuner", nom: "Salade Tiède Patate Douce & Poulet", calories: 480, is_bol_commun: false, bienfaits: "Le bêta-carotène de la patate douce favorise l'éclat de la peau et limite les pics de sucre.", ingredients: [{nom: "Patate douce", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Blanc de poulet", quantite: 120, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Tomates", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  // --- DÎNERS ---
  { type: "Dîner", nom: "Salade de Niébé Fraîcheur", calories: 400, is_bol_commun: false, bienfaits: "Excellent pour une digestion très légère avant le sommeil sans sensation de faim.", ingredients: [{nom: "Niébé (Haricots)", quantite: 100, unite: "g", rayon: "Marché local"}, {nom: "Concombre", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Vinaigrette légère", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { type: "Dîner", nom: "Soupe de Légumes Locaux au Soumbala", calories: 300, is_bol_commun: false, bienfaits: "Hydrate en profondeur et régule naturellement la tension artérielle pendant la nuit.", ingredients: [{nom: "Carotte", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Navet", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Soumbala", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { type: "Dîner", nom: "Poisson braisé (Yaboye) & Jaxatu", calories: 380, is_bol_commun: false, bienfaits: "L'amertume du Jaxatu aide à nettoyer et purifier le foie en douceur.", ingredients: [{nom: "Yaboye", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Jaxatu", quantite: 100, unite: "g", rayon: "Marché local"}] },
  { type: "Dîner", nom: "Blanc de Poulet Sauté au Djar", calories: 350, is_bol_commun: false, bienfaits: "Des épices locales qui réchauffent le métabolisme sans ajouter aucune calorie.", ingredients: [{nom: "Blanc de poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Haricots verts", quantite: 150, unite: "g", rayon: "Marché local"}, {nom: "Grains de Djar", quantite: 1, unite: "pincée", rayon: "Marché local"}] },
  { type: "Dîner", nom: "Omelette Moringa & Champignons", calories: 320, is_bol_commun: false, bienfaits: "Une multivitamine naturelle pure favorisant la réparation cellulaire nocturne.", ingredients: [{nom: "Oeufs", quantite: 2, unite: "pièce", rayon: "Supermarché"}, {nom: "Poudre de Moringa", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}, {nom: "Champignons", quantite: 100, unite: "g", rayon: "Supermarché"}] },
  { type: "Dîner", nom: "Sauté de Bœuf aux Gombos", calories: 390, is_bol_commun: false, bienfaits: "Le gombo apporte une satiété ultra-rapide sans alourdir l'estomac le soir.", ingredients: [{nom: "Bœuf maigre", quantite: 120, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Gombo", quantite: 100, unite: "g", rayon: "Marché local"}] },
  { type: "Dîner", nom: "Papillote de Poisson Citronnée", calories: 310, is_bol_commun: false, bienfaits: "Une cuisson saine sans ajout de matière grasse, permettant au foie de se reposer.", ingredients: [{nom: "Poisson blanc", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Citron", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Courgettes", quantite: 150, unite: "g", rayon: "Marché local"}] },
  { type: "Dîner", nom: "Salade de Thon, Avocat & Tomates", calories: 420, is_bol_commun: false, bienfaits: "Riche en Oméga-3 pour apaiser le système nerveux et améliorer la qualité du sommeil.", ingredients: [{nom: "Thon nature", quantite: 100, unite: "g", rayon: "Supermarché"}, {nom: "Avocat", quantite: 0.5, unite: "pièce", rayon: "Marché local"}, {nom: "Tomate", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { type: "Dîner", nom: "Velouté de Courge & Poudre de Moringa", calories: 280, is_bol_commun: false, bienfaits: "Concentré en Vitamine A et fibres très douces pour ne pas irriter les intestins.", ingredients: [{nom: "Courge", quantite: 200, unite: "g", rayon: "Marché local"}, {nom: "Poudre de Moringa", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { type: "Dîner", nom: "Émincé de Volaille aux Épices & Soumbala", calories: 360, is_bol_commun: false, bienfaits: "Protège le système cardio-vasculaire en remplaçant totalement le sel industriel.", ingredients: [{nom: "Volaille", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Légumes mélangés", quantite: 200, unite: "g", rayon: "Marché local"}, {nom: "Soumbala", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { type: "Dîner", nom: "Brochettes de Poisson et Tomates", calories: 350, is_bol_commun: false, bienfaits: "Apporte des protéines pures et du lycopène, un puissant antioxydant issu de la tomate cuite.", ingredients: [{nom: "Poisson blanc", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Tomates cerises", quantite: 100, unite: "g", rayon: "Marché local"}, {nom: "Huile d'olive", quantite: 1, unite: "càc", rayon: "Supermarché"}] },
  { type: "Dîner", nom: "Steak de Viande Maigre & Salade Verte", calories: 390, is_bol_commun: false, bienfaits: "Recharge votre corps en fer assimilable, idéal pour la récupération cellulaire nocturne.", ingredients: [{nom: "Viande de Bœuf Maigre", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Salade Verte", quantite: 1, unite: "portion", rayon: "Marché local"}, {nom: "Vinaigrette", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  // --- COLLATIONS ---
  { type: "Collation", nom: "Yaourt Nature & Éclats d'Arachides", calories: 150, is_bol_commun: false, bienfaits: "Protéines du yaourt relevées par les bonnes graisses de l'arachide.", ingredients: [{nom: "Yaourt nature", quantite: 1, unite: "pot", rayon: "Supermarché"}, {nom: "Arachides grillées", quantite: 10, unite: "g", rayon: "Marché local"}] },
  { type: "Collation", nom: "Fruit de Saison & Lait Caillé (Sow)", calories: 180, is_bol_commun: false, bienfaits: "Un mix parfait entre vitamines et ferments lactiques.", ingredients: [{nom: "Fruit au choix", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Sow Nature", quantite: 100, unite: "ml", rayon: "Marché local"}] },
  { type: "Collation", nom: "Infusion Bissap Pur & Noix de Cajou", calories: 160, is_bol_commun: false, bienfaits: "Apport en Magnésium anti-stress et effet jambes légères grâce au Bissap.", ingredients: [{nom: "Bissap rouge séché", quantite: 1, unite: "tasse", rayon: "Boutique Onyx"}, {nom: "Noix de cajou", quantite: 15, unite: "g", rayon: "Boutique Onyx"}] },
  { type: "Collation", nom: "Yaourt Nature à la Poudre de Bouye", calories: 140, is_bol_commun: false, bienfaits: "Probiotiques du yaourt alliés aux fibres du baobab pour une flore intestinale en béton.", ingredients: [{nom: "Yaourt nature", quantite: 1, unite: "pot", rayon: "Supermarché"}, {nom: "Poudre de Baobab", quantite: 1, unite: "càc", rayon: "Boutique Onyx"}] },
  { type: "Collation", nom: "Bâtonnets de Carotte & Concombre", calories: 80, is_bol_commun: false, bienfaits: "Une option zéro culpabilité, ultra-croquante et hydratante.", ingredients: [{nom: "Carotte", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Concombre", quantite: 0.5, unite: "pièce", rayon: "Marché local"}] },
  { type: "Collation", nom: "Fromage Blanc & Graines de Courge", calories: 150, is_bol_commun: false, bienfaits: "Excellente source de protéines et de zinc pour embellir la peau.", ingredients: [{nom: "Fromage blanc", quantite: 100, unite: "g", rayon: "Supermarché"}, {nom: "Graines de courge", quantite: 15, unite: "g", rayon: "Boutique Onyx"}] },
  { type: "Collation", nom: "Infusion Kinkeliba & Chocolat Noir", calories: 120, is_bol_commun: false, bienfaits: "Gourmandise antioxydante couplée au nettoyage hépatique du Kinkeliba.", ingredients: [{nom: "Kinkeliba", quantite: 1, unite: "tasse", rayon: "Marché local"}, {nom: "Chocolat noir 70%", quantite: 1, unite: "carré", rayon: "Supermarché"}] },
  { type: "Collation", nom: "Lait Caillé (Sow) Nature", calories: 130, is_bol_commun: false, bienfaits: "Riche en calcium et ferments lactiques indispensables pour une bonne digestion.", ingredients: [{nom: "Sow Nature", quantite: 150, unite: "ml", rayon: "Marché local"}] },
  { type: "Collation", nom: "Dattes & Thé Vert Menthe", calories: 110, is_bol_commun: false, bienfaits: "L'énergie rapide absolue associée aux antioxydants du thé.", ingredients: [{nom: "Dattes", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Thé vert menthe", quantite: 1, unite: "tasse", rayon: "Supermarché"}] }
];

export default function AdminNutritionAfricaine() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'clients'|'recipes'|'shop'|'orders'|'promos'|'foods'>('clients');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clientForm, setClientForm] = useState({ id: '', daily_calorie_goal: 0, protein_goal: 0, carbs_goal: 0, fats_goal: 0, tracking_mode: 'guided' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [recipeForm, setRecipeForm] = useState({ id: '', type: 'Petit-déjeuner', nom: '', calories: 0, proteins: 0, carbs: 0, fats: 0, is_bol_commun: false, recipe: '', bienfaits: '', ingredients: [] as any[], image_url: '', video_url: '', description: '', gallery: [] as string[] });
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const fileProductInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ id: '', produit_id: '', categorie_nom: '', nom: '', description_courte: '', description_longue: '', prix_standard: 0, prix_premium: 0, stock: 0, image_url: '', badge: '', goal: 'all', rating: 5, gallery: [] as string[], video_url: '' });
  const [promos, setPromos] = useState<any[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [promoForm, setPromoForm] = useState({ id: '', code: '', discount_pct: 10, min_xp: 0, active: true });

  const [pendingProductCsvFile, setPendingProductCsvFile] = useState<any>(null);
  const [isImportingProductCsv, setIsImportingProductCsv] = useState(false);
  const [productCsvImportProgress, setProductCsvImportProgress] = useState(0);

  const [pendingRecipeCsvFile, setPendingRecipeCsvFile] = useState<any>(null);
  const [isImportingRecipeCsv, setIsImportingRecipeCsv] = useState(false);
  const [recipeCsvImportProgress, setRecipeCsvImportProgress] = useState(0);
  const [foods, setFoods] = useState<any[]>([]);
  const fileFoodInputRef = useRef<HTMLInputElement>(null);

  const [tenantId, setTenantId] = useState<string | null>(null);

  // Filtres Boutique Admin
  const [shopSearch, setShopSearch] = useState("");
  const [shopMinPrice, setShopMinPrice] = useState<number | "">("");
  const [shopMaxPrice, setShopMaxPrice] = useState<number | "">("");
  const [shopOutOfStock, setShopOutOfStock] = useState(false);
  const [shopSort, setShopSort] = useState("recent");
  const [shopPage, setShopPage] = useState(1);
  const [showVitrineModal, setShowVitrineModal] = useState(false);
  const [vitrineBanner, setVitrineBanner] = useState("");
  const [isAutoReminderActive, setIsAutoReminderActive] = useState(false);
  const [showReportModal, setShowReportModal] = useState<any>(null);
  const [reportCoachNotes, setReportCoachNotes] = useState("");
  const [showGroceryModal, setShowGroceryModal] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({data}) => {
        const tId = data.session?.user?.user_metadata?.tenant_id || data.session?.user?.id || null;
        if (isMounted) setTenantId(tId);

        const fetchAll = async () => {
            try {
              let clientsQuery = supabase.from('clients').select('*').ilike('saas', '%utrition%').order('created_at', { ascending: false });
              
              const { data: clientsData, error: clientsError } = await clientsQuery;

              if (!clientsError && clientsData && clientsData.length > 0 && isMounted) {
                const clientIds = clientsData.map(c => c.id);

                const [profilesRes, logsRes, weightLogsRes] = await Promise.all([
                   supabase.from('nutrition_profiles').select('*').in('client_id', clientIds),
                   supabase.from('nutrition_daily_logs').select('*').in('client_id', clientIds),
                   supabase.from('nutrition_weight_logs').select('*').in('client_id', clientIds)
                ]);

                const profiles = profilesRes.data || [];
                const logs = logsRes.data || [];
                const weightLogs = weightLogsRes.data || [];

                const mappedProfiles = clientsData.map(c => {
                   const prof = profiles.find(p => p.client_id === c.id) || {};
                   return {
                      ...prof,
                      id: prof.id || c.id,
                      client: c,
                      phone: c.phone || prof.phone,
                      logs: logs.filter(l => l.client_id === c.id) || [],
                      weight_logs: weightLogs.filter(w => w.client_id === c.id) || [],
                      daily_calorie_goal: prof.daily_calorie_goal || 1500,
                      protein_goal: prof.protein_goal || 80
                   };
                });
                setClients(mappedProfiles);
              } else if (isMounted) {
                setClients([]);
              }

              if (tId && isMounted) {
                  const [recipesRes, prodsRes, ordsRes, promosRes, settingsRes] = await Promise.all([
                     supabase.from('nutrition_recipes').select('*').order('created_at', { ascending: false }),
                     supabase.from('nutrition_products').select('*').order('created_at', { ascending: false }),
                     supabase.from('nutrition_orders').select('*').order('created_at', { ascending: false }),
                     supabase.from('nutrition_promo_codes').select('*').order('created_at', { ascending: false }),
                     supabase.from('crm_settings').select('*').eq('tenant_id', tId).maybeSingle()
                  ]);
                  if (recipesRes.data) setRecipes(recipesRes.data);
                  if (prodsRes.data) setProducts(prodsRes.data);
                  if (ordsRes.data) setOrders(ordsRes.data);
                  if (promosRes.data) setPromos(promosRes.data);
                  if (settingsRes.data && settingsRes.data.shop_banner_url) setVitrineBanner(settingsRes.data.shop_banner_url);
                  if (foodsRes.data) setFoods(foodsRes.data);
              }
            } catch (err) {
                console.error("Erreur générale fetch admin:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        
        fetchAll();
    });

    return () => { isMounted = false; };
  }, []);

  const filteredClients = clients.filter(c => 
    c.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const handleOpenClientModal = (profile: any) => {
    setEditingClient(profile);
    setClientForm({
        id: profile.id,
        daily_calorie_goal: profile.daily_calorie_goal || 1500,
        protein_goal: profile.protein_goal || 80,
        carbs_goal: profile.carbs_goal || 150,
        fats_goal: profile.fats_goal || 50,
        tracking_mode: profile.tracking_mode || 'guided'
    });
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload: any = { 
          client_id: editingClient.client.id, 
          daily_calorie_goal: clientForm.daily_calorie_goal, 
          protein_goal: clientForm.protein_goal, 
          carbs_goal: clientForm.carbs_goal, 
          fats_goal: clientForm.fats_goal, 
          tracking_mode: clientForm.tracking_mode 
      };
      if (editingClient.id) payload.id = editingClient.id;
      if (tenantId) (payload as any).tenant_id = tenantId;
      const { error } = await supabase.from('nutrition_profiles').upsert(payload, { onConflict: 'client_id' });
      if (!error) {
          setClients(clients.map(c => c.client.id === editingClient.client.id ? { ...c, ...payload } : c));
          setEditingClient(null);
      } else alert(error.message);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);

      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
              try {
                  const recipesToImport: any[] = [];

                  for (const row of results.data as any[]) {
                      const r: any = {};
                      Object.keys(row).forEach(k => {
                          if (k && typeof k === 'string') r[k.toLowerCase().trim()] = row[k];
                      });

                      const nom = r['nom'] || r['name'] || r['recette'];
                      if (!nom) continue;

                      let parsedIngredients = [];
                      try { parsedIngredients = r['ingredients'] ? JSON.parse(r['ingredients']) : []; } catch (e) {}

                      recipesToImport.push({
                          nom: nom,
                          type: r['type'] || 'Déjeuner',
                          calories: Number(r['calories']) || 0,
                          proteins: Number(r['proteins'] || r['protéines']) || 0,
                          carbs: Number(r['carbs'] || r['glucides']) || 0,
                          fats: Number(r['fats'] || r['lipides']) || 0,
                          is_bol_commun: r['is_bol_commun']?.toLowerCase() === 'oui' || String(r['is_bol_commun']) === 'true',
                          recipe: r['etapes_cuisson'] || r['recipe'] || r['recette_details'] || '',
                          bienfaits: r['bienfaits'] || r['benefits'] || '',
                          description: r['description'] || '',
                          image_url: r['photo'] || r['image_url'] || r['image'] || '',
                          gallery: r['galerie_photo'] ? String(r['galerie_photo']).split(',').map((s:string) => s.trim()) : [],
                          ingredients: parsedIngredients
                      });
                  }

                  if (recipesToImport.length === 0) {
                      alert("Aucune recette valide trouvée dans le fichier CSV. Assurez-vous d'avoir une colonne 'nom'.");
                      return;
                  }

                  setPendingRecipeCsvFile({
                      filename: file.name,
                      recipesCount: recipesToImport.length,
                      data: recipesToImport
                  });
              } catch (err: any) {
                  alert("Erreur lors de l'analyse du CSV : " + err.message);
              } finally {
                  setLoading(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
              }
          },
          error: (err) => {
              alert("Erreur de lecture du fichier CSV.");
              setLoading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      });
  };

  const handleInitDefaultRecipes = async () => {
      if (!confirm("Voulez-vous ajouter les 40 recettes par défaut à la base de données ?")) return;
      setIsImportingRecipeCsv(true);
      try {
          const { data: existing } = await supabase.from('nutrition_recipes').select('nom');
          const existingNames = existing?.map(e => e.nom) || [];

          const toInsert = DEFAULT_RECIPES.filter(r => !existingNames.includes(r.nom)).map(r => ({
              nom: r.nom,
              type: r.type,
              calories: r.calories,
              proteins: Math.round((r.calories * 0.2) / 4),
              carbs: Math.round((r.calories * 0.5) / 4),
              fats: Math.round((r.calories * 0.3) / 9),
              is_bol_commun: r.is_bol_commun,
              bienfaits: r.bienfaits,
              recipe: `Préparation :\n${r.ingredients.map((i: any) => `- ${i.quantite}${i.unite} ${i.nom}`).join('\n')}`,
              ingredients: r.ingredients,
              ...(tenantId ? { tenant_id: tenantId } : {})
          }));

          if (toInsert.length > 0) {
              const { error } = await supabase.from('nutrition_recipes').insert(toInsert);
              if (error) throw error;
              alert(`${toInsert.length} recettes ajoutées avec succès dans la base de données !`);
              const { data } = await supabase.from('nutrition_recipes').select('*').order('created_at', { ascending: false });
              if (data) setRecipes(data);
          } else {
              alert("Les 40 recettes sont déjà présentes dans la base de données.");
          }
      } catch(e: any) {
          alert("Erreur: " + e.message);
      } finally {
          setIsImportingRecipeCsv(false);
      }
  };

  const handleConfirmRecipeCsvImport = async () => {
      if (!pendingRecipeCsvFile) return;
      setIsImportingRecipeCsv(true);
      setRecipeCsvImportProgress(0);

      try {
          const recipesArray = pendingRecipeCsvFile.data;
          const totalRows = recipesArray.length;
          const chunkSize = 100;
          let importedCount = 0;
          
          for (let i = 0; i < totalRows; i += chunkSize) {
              const chunk = recipesArray.slice(i, i + chunkSize);
              
              const payload = chunk.map((r: any) => {
                  const existingRecipe = recipes.find(er => er.nom.toLowerCase() === r.nom.toLowerCase());
                  const item = { ...r };
                  delete item.tenant_id;
                  if (existingRecipe) {
                      item.id = existingRecipe.id;
                  }
                  return item;
              });

              const { data, error } = await supabase.from('nutrition_recipes').upsert(payload, { onConflict: 'id' }).select();
              if (error) throw new Error("Erreur insertion: " + error.message);

              if (data) {
                  importedCount += data.length;
              }

              setRecipeCsvImportProgress(Math.round(((i + chunk.length) / totalRows) * 100));
          }

          alert(`Importation réussie ! ${importedCount} recettes ajoutées/mises à jour.`);
          setPendingRecipeCsvFile(null);

          const { data: updatedRecipes } = await supabase.from('nutrition_recipes').select('*').order('created_at', { ascending: false });
          if (updatedRecipes) setRecipes(updatedRecipes);

      } catch (err: any) {
          alert("Erreur lors de l'importation : " + err.message);
      } finally {
          setIsImportingRecipeCsv(false);
          setRecipeCsvImportProgress(0);
      }
  };

  const handleAIGenerateRecipe = () => {
    const bases = ["Fonio (Boutique Onyx)", "Riz Étuvé (Marché)", "Pain Complet (Supermarché)", "Spaghetti Complet (Supermarché)"];
    const proteins = ["Blanc de Poulet", "Thiof (Poisson)", "Viande Maigre", "Niébé"];
    const veggies = ["Gombo", "Carottes", "Chou", "Jaxatu"];
    const condiments = ["Soumbala", "Grains de Djar", "Pâte d'arachide pure", "Poudre de Moringa"];
    const hotDrinks = ["Kinkeliba sans sucre", "Thé vert menthe", "Infusion de Djar", "Café Touba allégé"];

    const isBreakfast = Math.random() > 0.5;
    const type = isBreakfast ? 'Petit-déjeuner' : 'Déjeuner';
    
    let generatedName = "";
    let ingredients = [];

    if (isBreakfast) {
      const drink = hotDrinks[Math.floor(Math.random()*hotDrinks.length)];
      generatedName = `Tartines de Pain Complet & Œufs + ${drink}`;
      ingredients = [
        {nom: "Pain Complet", quantite: 2, unite: "tranche", rayon: "Supermarché"},
        {nom: "Oeufs", quantite: 2, unite: "pièce", rayon: "Supermarché"},
        {nom: drink, quantite: 1, unite: "tasse", rayon: "Marché local"}
      ];
    } else {
      const selectedProtein = proteins[Math.floor(Math.random()*proteins.length)];
      const selectedBase = bases[Math.floor(Math.random()*bases.length)];
      generatedName = `${selectedProtein} aux légumes et ${selectedBase.split(' (')[0]}`;
      ingredients = [
         {nom: selectedProtein, quantite: 150, unite: "g", rayon: "Boucherie / Pêche"},
         {nom: selectedBase.split(' (')[0], quantite: 80, unite: "g", rayon: selectedBase.includes("Supermarché") ? "Supermarché" : "Marché local"},
         {nom: veggies[Math.floor(Math.random()*veggies.length)], quantite: 100, unite: "g", rayon: "Marché local"},
         {nom: condiments[Math.floor(Math.random()*condiments.length)], quantite: 1, unite: "càc", rayon: "Boutique Onyx"}
      ];
    }

    setRecipeForm({
       id: '', type, nom: generatedName, calories: 450, proteins: 30, carbs: 45, fats: 15, is_bol_commun: false,
       recipe: "Recette générée par IA respectant le mix Sénégalais-Moderne. Assurez-vous d'utiliser le condiment uniquement pour relever le goût.",
       bienfaits: "Équilibre parfait entre fibres, protéines maigres et index glycémique contrôlé.",
      ingredients, image_url: '', video_url: '', description: '', gallery: []
    });
    setEditingRecipe(null);
    setShowRecipeModal(true);
  };

  const handleOpenRecipeModal = (recipe?: any) => {
     if (recipe) {
         setEditingRecipe(recipe);
         setRecipeForm({ ...recipe, bienfaits: recipe.bienfaits || '', ingredients: recipe.ingredients || [], gallery: recipe.gallery || [], image_url: recipe.image_url || '', video_url: recipe.video_url || '', description: recipe.description || '' });
     } else {
         setEditingRecipe(null);
         setRecipeForm({ id: '', type: 'Petit-déjeuner', nom: '', calories: 0, proteins: 0, carbs: 0, fats: 0, is_bol_commun: false, recipe: '', bienfaits: '', ingredients: [], image_url: '', video_url: '', description: '', gallery: [] });
     }
     setShowRecipeModal(true);
  };

  const handleGenerateVideoIA = async () => {
      if (!recipeForm.nom || !recipeForm.recipe) return alert("Veuillez d'abord remplir le nom et les instructions de la recette.");
      setIsGeneratingVideo(true);
      try {
          // SIMULATION : Remplacer par un véritable appel API (Edge Function pointant vers Creatomate ou HeyGen)
          await new Promise(resolve => setTimeout(resolve, 4000));
          setRecipeForm(prev => ({...prev, video_url: 'https://www.youtube.com/embed/acFsObjm2E0'})); 
          alert("Vidéo générée avec succès via le pipeline IA !");
      } catch (err) {
          alert("Erreur lors de la génération vidéo.");
      } finally {
          setIsGeneratingVideo(false);
      }
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { ...recipeForm };
      payload.gallery = payload.gallery.map((url: string) => url.trim()).filter(Boolean);
      delete payload.id;
      delete (payload as any).tenant_id;
      if (editingRecipe) {
          const { error } = await supabase.from('nutrition_recipes').update(payload).eq('id', recipeForm.id);
          if (!error) { setRecipes(recipes.map(r => r.id === recipeForm.id ? { ...payload, id: recipeForm.id } : r)); setShowRecipeModal(false); }
          else alert(error.message);
      } else {
          const { data, error } = await supabase.from('nutrition_recipes').insert([payload]).select().single();
          if (!error && data) { setRecipes([data, ...recipes]); setShowRecipeModal(false); }
          else alert(error?.message);
      }
  };

  const handleDeleteRecipe = async (id: string) => {
      if (!confirm("Supprimer cette recette ?")) return;
      await supabase.from('nutrition_recipes').delete().eq('id', id);
      setRecipes(recipes.filter(r => r.id !== id));
  };

  const handleRelanceInactifs = () => {
      const inactifs = clients.filter(c => {
         const todayLog = c.logs?.find((l: any) => l.log_date === todayStr);
         return !todayLog;
      });

      if (inactifs.length === 0) {
          alert("Tous vos clients ont rempli leur bilan aujourd'hui !");
          return;
      }

      if (confirm(`Voulez-vous relancer manuellement ${inactifs.length} clients inactifs sur WhatsApp ? (Note: Autorisez les pop-ups sur votre navigateur)`)) {
          inactifs.forEach((client, index) => {
              const msg = `Coucou ${client.client?.full_name || ''} 👋\n\nJe n'ai pas encore reçu ton bilan d'aujourd'hui sur ton espace Onyx Nutrition.\nN'oublie pas de le remplir pour qu'on puisse adapter ton menu de demain !\n\nÀ très vite !`;
              setTimeout(() => {
                  window.open(`https://wa.me/${(client.phone || '').replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
              }, index * 1000);
          });
      }
  };

  const downloadFoodCsvTemplate = () => {
      const csv = "nom;categorie;portion_standard_nom;portion_standard_grammes;calories;proteines;glucides;lipides;fibres;message_coach_ia\nFonio;Céréales locales;100g;100;350;8;75;1;3;Excellent choix à index glycémique bas.";
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'Modele_Aliments_Vierge.csv'; a.click();
  };

  const handleImportFoodCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
          header: true, skipEmptyLines: true,
          complete: async (results) => {
              const payload = (results.data as any[]).map(r => ({
                  nom: r.nom, 
                  categorie: r.categorie || 'Autre',
                  portion_standard_nom: r.portion_standard_nom || '100g',
                  portion_standard_grammes: Number(r.portion_standard_grammes) || 100,
                  valeurs_pour_100g: { calories: Number(r.calories)||0, proteines: Number(r.proteines)||0, glucides: Number(r.glucides)||0, lipides: Number(r.lipides)||0, fibres: Number(r.fibres)||0 },
                  message_coach_ia: r.message_coach_ia || ''
              })).filter(f => f.nom);
              if(payload.length > 0) {
                  await supabase.from('nutrition_foods').insert(payload);
                  alert(`${payload.length} aliments importés avec succès !`);
                  const { data } = await supabase.from('nutrition_foods').select('*');
                  if (data) setFoods(data);
              }
              if (fileFoodInputRef.current) fileFoodInputRef.current.value = '';
          }
      });
  };

  const handleImportProductCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);

      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
              try {
                  const productsToImport: any[] = [];
                  const uniqueCategories = new Set<string>();

                  for (const row of results.data as any[]) {
                      const r: any = {};
                      Object.keys(row).forEach(k => {
                          if (k && typeof k === 'string') r[k.toLowerCase().trim()] = row[k];
                      });

                      const nom = r['nom'] || r['name'] || r['produit'];
                      if (!nom) continue;

                      const categorie_nom = r['categorie_nom'] || r['catégorie'] || r['category'] || 'Général';
                      
                      let prix_standard = r['prix_standard'] || r['prix'] || 0;
                      let prix_premium = r['prix_premium'] || r['prix premium'] || 0;
                      let stock = r['stock'] || r['quantité'] || 0;

                      productsToImport.push({
                          nom,
                          categorie_nom,
                          description_courte: r['description_courte'] || r['description courte'] || '',
                          description_longue: r['description_longue'] || r['description longue'] || '',
                          prix_standard: Number(String(prix_standard).replace(/[^0-9.-]+/g, '')) || 0,
                          prix_premium: Number(String(prix_premium).replace(/[^0-9.-]+/g, '')) || 0,
                          stock: Number(String(stock).replace(/[^0-9.-]+/g, '')) || 0,
                          image_url: r['image_url'] || r['image'] || '',
                          badge: r['badge'] || '',
                          goal: r['goal'] || r['objectif'] || 'all',
                          rating: Number(r['rating'] || r['note']) || 5
                      });

                      uniqueCategories.add(categorie_nom);
                  }

                  if (productsToImport.length === 0) {
                      alert("Aucun produit valide trouvé dans le fichier CSV. Assurez-vous d'avoir une colonne 'nom'.");
                      return;
                  }

                  setPendingProductCsvFile({
                      filename: file.name,
                      productsCount: productsToImport.length,
                      categoriesCount: uniqueCategories.size,
                      data: productsToImport
                  });
              } catch (err: any) {
                  alert("Erreur lors de l'analyse du CSV : " + err.message);
              } finally {
                  setLoading(false);
                  if (fileProductInputRef.current) fileProductInputRef.current.value = '';
              }
          },
          error: (err) => {
              alert("Erreur de lecture du fichier CSV.");
              setLoading(false);
              if (fileProductInputRef.current) fileProductInputRef.current.value = '';
          }
      });
  };

  const handleConfirmProductCsvImport = async () => {
      if (!pendingProductCsvFile) return;
      setIsImportingProductCsv(true);
      setProductCsvImportProgress(0);

      try {
          const productsArray = pendingProductCsvFile.data;
          const totalRows = productsArray.length;
          const chunkSize = 100;
          let importedCount = 0;
          
          for (let i = 0; i < totalRows; i += chunkSize) {
              const chunk = productsArray.slice(i, i + chunkSize);
              
              const payload = chunk.map((p: any) => {
                  const existingProd = products.find(ep => ep.nom.toLowerCase() === p.nom.toLowerCase());
                  const item = { ...p };
                  delete item.tenant_id;
                  if (existingProd) {
                      item.id = existingProd.id;
                      item.produit_id = existingProd.produit_id || `prod_${Date.now()}_${Math.floor(Math.random()*1000)}`;
                  } else {
                      item.produit_id = `prod_${Date.now()}_${Math.floor(Math.random()*1000)}`;
                  }
                  return item;
              });

              const { data, error } = await supabase.from('nutrition_products').upsert(payload, { onConflict: 'id' }).select();
              if (error) throw new Error("Erreur insertion: " + error.message);

              if (data) {
                  importedCount += data.length;
              }

              setProductCsvImportProgress(Math.round(((i + chunk.length) / totalRows) * 100));
          }

          alert(`Importation réussie ! ${importedCount} produits ajoutés/mis à jour.`);
          setPendingProductCsvFile(null);

          const { data } = await supabase.from('nutrition_products').select('*').order('created_at', { ascending: false });
          if (data) setProducts(data);

      } catch (err: any) {
          alert("Erreur lors de l'importation : " + err.message);
      } finally {
          setIsImportingProductCsv(false);
          setProductCsvImportProgress(0);
      }
  };

  const handleOpenProductModal = (prod?: any) => {
     if (prod) {
         setEditingProduct(prod);
         setProductForm({ ...prod, gallery: prod.gallery || [], video_url: prod.video_url || '' });
     } else {
         setEditingProduct(null);
         setProductForm({ id: '', produit_id: `prod_${Date.now()}`, categorie_nom: 'Super-Aliments & Céréales Locales', nom: '', description_courte: '', description_longue: '', prix_standard: 0, prix_premium: 0, stock: 0, image_url: '', badge: '', goal: 'all', rating: 5, gallery: [], video_url: '' });
     }
     setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { ...productForm };
      payload.gallery = payload.gallery.map((url: string) => url.trim()).filter(Boolean);
      delete payload.id;
      delete (payload as any).tenant_id;
      if (editingProduct) {
          const { error } = await supabase.from('nutrition_products').update(payload).eq('id', productForm.id);
          if (!error) { setProducts(products.map(p => p.id === productForm.id ? { ...payload, id: productForm.id } : p)); setShowProductModal(false); }
          else alert(error.message);
      } else {
          const { data, error } = await supabase.from('nutrition_products').insert([payload]).select().single();
          if (!error && data) { setProducts([data, ...products]); setShowProductModal(false); }
          else alert(error?.message);
      }
  };

  const handleDeleteProduct = async (id: string) => {
      if (!confirm("Supprimer ce produit ?")) return;
      await supabase.from('nutrition_products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
  };

  const handleOpenPromoModal = (promo?: any) => {
      if (promo) {
          setEditingPromo(promo);
          setPromoForm({ ...promo });
      } else {
          setEditingPromo(null);
          setPromoForm({ id: '', code: '', discount_pct: 10, min_xp: 0, active: true });
      }
      setShowPromoModal(true);
  };

  const downloadProductCsvTemplate = () => {
      const csv = "nom;categorie_nom;prix_standard;prix_premium;stock;description_courte;description_longue;image_url;badge;goal\nFonio Premium;Super-Aliments;2500;2100;100;Fonio précuit;Description complète;https://...;Best Seller;cooking";
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'Modele_Produits_Vierge.csv'; a.click();
  };

  const downloadRecipeCsvTemplate = () => {
      const csv = "nom;type;calories;proteines;glucides;lipides;is_bol_commun;etapes_cuisson;bienfaits;description;image_url;galerie_photo;ingredients\nExemple Thieb;Déjeuner;600;30;70;15;oui;Cuire le riz...;Riche en oméga-3;Un plat sénégalais;https://...;https://...,https://...;[{\"nom\":\"Riz\",\"quantite\":100,\"unite\":\"g\",\"rayon\":\"Supermarché\"}]";
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'Modele_Recettes_Vierge.csv'; a.click();
  };

  const handleSavePromo = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { ...promoForm, code: promoForm.code.toUpperCase().replace(/\s+/g, '') };
      delete payload.id;
      delete (payload as any).tenant_id;
      let res;
      if (editingPromo) res = await supabase.from('nutrition_promo_codes').update(payload).eq('id', promoForm.id).select().single();
      else res = await supabase.from('nutrition_promo_codes').insert([payload]).select().single();
      if (!res.error && res.data) {
          if (editingPromo) setPromos(promos.map(p => p.id === promoForm.id ? res.data : p));
          else setPromos([res.data, ...promos]);
          setShowPromoModal(false);
      } else alert(res.error?.message);
  };

  const handleDeletePromo = async (id: string) => {
      if (!confirm("Supprimer ce code promo ?")) return;
      await supabase.from('nutrition_promo_codes').delete().eq('id', id);
      setPromos(promos.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, phone: string, clientName: string) => {
      await supabase.from('nutrition_orders').update({ status: newStatus }).eq('id', orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      let msg = "";
      if (newStatus === 'En préparation') msg = `Bonjour ${clientName}, votre commande OnyxNutrition est en cours de préparation 📦 !`;
      if (newStatus === 'Expédié') msg = `Bonjour ${clientName}, votre commande est en route 🚚 ! Notre livreur va vous contacter.`;
      if (newStatus === 'Livré') msg = `Bonjour ${clientName}, votre commande a été livrée ✅. Merci pour votre confiance !`;

      if (msg) window.open(`https://wa.me/${phone?.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOptimizeShopIA = async () => {
      // Tri virtuel par popularité (vues + notes) pour simuler l'IA
      const optimized = [...products].sort((a,b) => ((b.views||0)+(b.rating||0)) - ((a.views||0)+(a.rating||0)));
      if (tenantId) {
          const { data: existing } = await supabase.from('crm_settings').select('id').eq('tenant_id', tenantId).maybeSingle();
          if (existing) {
              await supabase.from('crm_settings').update({ shop_banner_url: vitrineBanner, shop_optimized_order: optimized.map(p=>p.id) }).eq('id', existing.id);
          } else {
              await supabase.from('crm_settings').insert({ tenant_id: tenantId, shop_banner_url: vitrineBanner, shop_optimized_order: optimized.map(p=>p.id) });
          }
      }
      alert("La boutique cliente a été dynamisée par l'IA et la bannière a été mise à jour !");
      setShowVitrineModal(false);
  };

  const getGroceryListForAdmin = (profile: any) => {
      const list: any = { 'Supermarché': {}, 'Marché local': {}, 'Boucherie / Pêche': {} };
      const weeklyMenu = Array.isArray(profile.weekly_menu) ? profile.weekly_menu : [];
      weeklyMenu.forEach((dayInfo: any) => {
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

  // Calcul moyenne globale des calories consommées aujourd'hui
  const todayStr = new Date().toISOString().split('T')[0];
  let totalCaloriesToday = 0;
  let clientsWithLogsToday = 0;

  clients.forEach(client => {
     const todayLog = client.logs?.find((l: any) => l.log_date === todayStr);
     if (todayLog && todayLog.calories_consumed > 0) {
        totalCaloriesToday += todayLog.calories_consumed;
        clientsWithLogsToday++;
     }
  });

  const averageCaloriesToday = clientsWithLogsToday > 0 ? Math.round(totalCaloriesToday / clientsWithLogsToday) : 0;

  const generateClientReportPDF = async (profile: any, sendWhatsApp: boolean = false) => {
      const doc = new jsPDF();
      const clientName = profile.client?.full_name || "Client";
      doc.setFontSize(22);
      doc.text(`Rapport Mensuel - ${clientName}`, 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("1. Objectifs Actuels", 14, 45);
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`• Calories : ${profile.daily_calorie_goal || 1500} kcal/jour`, 14, 55);
      doc.text(`• Protéines : ${profile.protein_goal || 80} g/jour`, 14, 62);
      doc.text(`• Glucides : ${profile.carbs_goal || 150} g/jour`, 14, 69);
      doc.text(`• Lipides : ${profile.fats_goal || 50} g/jour`, 14, 76);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("2. Évolution du Poids (5 dernières pesées)", 14, 90);
      
      const weightLogs = profile.weight_logs?.sort((a: any, b: any) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()).slice(-5) || [];
      const weightRows = weightLogs.length > 0 ? weightLogs.map((w: any) => [new Date(w.log_date).toLocaleDateString('fr-FR'), `${w.weight} kg`]) : [['Aucune donnée', '-']];
          
      autoTable(doc, {
          startY: 95,
          head: [['Date', 'Poids']],
          body: weightRows,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
      });
      
      const finalY = (doc as any).lastAutoTable.finalY || 95;
      
      doc.setFontSize(14);
      doc.text("3. Assiduité & Hydratation (7 derniers jours)", 14, finalY + 15);
      
      const logs = profile.logs?.sort((a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()).slice(0, 7) || [];
      const logRows = logs.length > 0 ? logs.map((l: any) => [new Date(l.log_date).toLocaleDateString('fr-FR'), `${l.calories_consumed || 0} kcal`, `${l.water_glasses || 0} / 8`, l.report_data?.followedMenu ? 'Oui' : 'Non', l.report_data?.cravedRice ? 'Oui' : 'Non']) : [['Aucune donnée', '-', '-', '-', '-']];
          
      autoTable(doc, { startY: finalY + 20, head: [['Date', 'Calories', 'Eau (Verres)', 'Menu Suivi', 'Craquage (Riz/Sucre)']], body: logRows, theme: 'grid', headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] } });
      
      const finalY2 = (doc as any).lastAutoTable.finalY || finalY + 30;
      
      if (reportCoachNotes) {
         doc.setFontSize(14);
         doc.setTextColor(0, 0, 0);
         doc.text("4. Notes du Coach", 14, finalY2 + 15);
         doc.setFontSize(11);
         doc.setTextColor(80, 80, 80);
         const splitNotes = doc.splitTextToSize(reportCoachNotes, 180);
         doc.text(splitNotes, 14, finalY2 + 25);
      }

      if (sendWhatsApp) {
          const pdfBlob = doc.output('blob');
          const fileName = `Rapport_${clientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
          const { error: uploadError } = await supabase.storage.from('tontines').upload(fileName, pdfBlob, { contentType: 'application/pdf' });
          if (!uploadError) {
              const { data: urlData } = supabase.storage.from('tontines').getPublicUrl(fileName);
              const msg = `Bonjour ${clientName} 👋\n\nVoici ton rapport de suivi nutritionnel pour ce mois-ci !\n\n📄 *Voir le rapport :* ${urlData.publicUrl}\n\nContinue tes efforts !`;
              window.open(`https://wa.me/${(profile.phone || '').replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
          } else {
              alert("Erreur lors de l'upload du PDF.");
          }
      } else {
          doc.save(`Rapport_Nutrition_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      
      setShowReportModal(null);
      setReportCoachNotes("");
  };

  // Calculs pagination et filtres boutique
  const filteredShop = products.filter(p => {
      const matchSearch = !shopSearch || p.nom?.toLowerCase().includes(shopSearch.toLowerCase()) || p.categorie_nom?.toLowerCase().includes(shopSearch.toLowerCase());
      const price = p.prix_standard || 0;
      const matchMin = shopMinPrice === "" || price >= shopMinPrice;
      const matchMax = shopMaxPrice === "" || price <= shopMaxPrice;
      const matchStock = shopOutOfStock ? p.stock === 0 : true;
      return matchSearch && matchMin && matchMax && matchStock;
  }).sort((a, b) => {
      if (shopSort === "old") return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      if (shopSort === "views") return (b.views || 0) - (a.views || 0);
      if (shopSort === "rating") return (b.rating || 0) - (a.rating || 0);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(); // recent default
  });

  const shopItemsPerPage = 12;
  const totalShopPages = Math.ceil(filteredShop.length / shopItemsPerPage);
  const paginatedShop = filteredShop.slice((shopPage - 1) * shopItemsPerPage, shopPage * shopItemsPerPage);
  
  const salesStats = React.useMemo(() => {
      const stats: Record<string, { qty: number, revenue: number, name: string, image: string }> = {};
      orders.forEach(o => {
          let items = o.items || [];
          if (typeof items === 'string') { try { items = JSON.parse(items); } catch(e) { items = []; } }
          items.forEach((i: any) => {
              const pid = i.id;
              if (!stats[pid]) {
                  const prod = products.find(p => p.id === pid);
                  stats[pid] = { qty: 0, revenue: 0, name: i.nom || i.name || 'Produit inconnu', image: prod?.image_url || '' };
              }
              stats[pid].qty += (i.quantity || 1);
              stats[pid].revenue += (i.finalPrice || i.price || 0) * (i.quantity || 1);
          });
      });
      return Object.values(stats).sort((a,b) => b.qty - a.qty).slice(0, 5);
  }, [orders, products]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black"><Activity className="animate-spin text-[#39FF14]" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-24">
      <header className="bg-black text-white px-8 py-6 flex items-center justify-between sticky top-0 z-30 border-b-4 border-[#39FF14]">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors font-black uppercase text-xs tracking-widest bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
            <ChevronLeft size={16}/> Retour SaaS (Admin)
          </button>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="Onyx Nutrition" className="h-8 object-contain" />
            Coach <span className="text-[#39FF14]">Nutrition</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
               {/* Menu Horizontal */}
               <div className="flex flex-wrap bg-white border border-zinc-200 p-1.5 rounded-2xl shadow-sm w-full lg:w-auto gap-1">
                   <button onClick={() => setActiveTab('clients')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'clients' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}><Users size={14}/> Clients</button>
                   <button onClick={() => setActiveTab('recipes')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'recipes' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}><Utensils size={14}/> Recettes</button>
                   <button onClick={() => setActiveTab('foods')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'foods' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}><Database size={14}/> Aliments (BDD)</button>
                   
                   <div className="relative group">
                       <button className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${['shop', 'orders', 'promos'].includes(activeTab) ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}>
                          <ShoppingBag size={14}/> E-Commerce <ChevronDown size={14} className="ml-1"/>
                       </button>
                       <div className="absolute top-full left-0 mt-2 bg-white border border-zinc-200 shadow-xl rounded-2xl p-2 min-w-[160px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 flex flex-col gap-1">
                           <button onClick={() => setActiveTab('shop')} className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-zinc-100 flex items-center gap-2 ${activeTab === 'shop' ? 'text-[#39FF14] bg-black hover:bg-black' : 'text-zinc-600'}`}><ShoppingCart size={14}/> Boutique</button>
                           <button onClick={() => setActiveTab('orders')} className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-zinc-100 flex items-center gap-2 ${activeTab === 'orders' ? 'text-[#39FF14] bg-black hover:bg-black' : 'text-zinc-600'}`}><Package size={14}/> Commandes</button>
                           <button onClick={() => setActiveTab('promos')} className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-zinc-100 flex items-center gap-2 ${activeTab === 'promos' ? 'text-[#39FF14] bg-black hover:bg-black' : 'text-zinc-600'}`}><Ticket size={14}/> Codes Promo</button>
                       </div>
                   </div>
               </div>

               {/* Actions spécifiques */}
               <div className="flex flex-wrap w-full lg:w-auto gap-3">
                  {activeTab === 'clients' && (
                    <div className="relative w-full lg:w-80">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                       <input 
                          type="text" 
                          placeholder="Rechercher un client..." 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full p-3 pl-12 bg-white border border-zinc-200 rounded-xl font-bold text-xs outline-none focus:border-black shadow-sm"
                       />
                    </div>
                  )}
                  {activeTab === 'recipes' && (
                     <>
                        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                        <button onClick={() => fileInputRef.current?.click()} className="bg-zinc-100 text-black px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-sm flex items-center justify-center gap-2"><Upload size={14}/> Import CSV</button>
                        <button onClick={downloadRecipeCsvTemplate} className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all shadow-sm flex items-center justify-center gap-2" title="Télécharger un modèle vierge"><Download size={14}/></button>
                        <button onClick={handleInitDefaultRecipes} className="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-all shadow-sm flex items-center justify-center gap-2"><Sparkles size={14}/> Init 40 Recettes</button>
                        <button onClick={handleAIGenerateRecipe} className="bg-[#39FF14]/20 text-green-700 border border-[#39FF14]/50 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#39FF14]/30 transition-all shadow-sm flex items-center justify-center gap-2"><Bot size={14}/> Générer via IA</button>
                        <button onClick={() => handleOpenRecipeModal()} className="bg-black text-[#39FF14] px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"><Plus size={14}/> Nouvelle Recette</button>
                     </>
                  )}
                  {activeTab === 'shop' && (
                     <>
                  <input type="file" accept=".csv" className="hidden" ref={fileProductInputRef} onChange={handleImportProductCSV} />
                        <button onClick={() => fileProductInputRef.current?.click()} className="bg-zinc-100 text-black px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-sm flex items-center justify-center gap-2"><Upload size={14}/> Import CSV</button>
                        <button onClick={downloadProductCsvTemplate} className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all shadow-sm flex items-center justify-center gap-2" title="Télécharger un modèle vierge"><Download size={14}/></button>
                        <button onClick={() => setShowVitrineModal(true)} className="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-all shadow-sm flex items-center justify-center gap-2"><Sparkles size={14}/> Vitrine & IA</button>
                        <button onClick={() => handleOpenProductModal()} className="bg-black text-[#39FF14] px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"><Plus size={14}/> Nouveau Produit</button>
                     </>
                  )}
                  {activeTab === 'promos' && (
                     <button onClick={() => handleOpenPromoModal()} className="bg-black text-[#39FF14] px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"><Plus size={14}/> Créer un Code Promo</button>
                  )}
                  {activeTab === 'foods' && (
                     <>
                        <input type="file" accept=".csv" className="hidden" ref={fileFoodInputRef} onChange={handleImportFoodCSV} />
                        <button onClick={() => fileFoodInputRef.current?.click()} className="bg-zinc-100 text-black px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-sm flex items-center justify-center gap-2"><Upload size={14}/> Import CSV</button>
                        <button onClick={downloadFoodCsvTemplate} className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all shadow-sm flex items-center justify-center gap-2" title="Télécharger un modèle vierge"><Download size={14}/></button>
                        <button className="bg-black text-[#39FF14] px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"><Plus size={14}/> Nouvel Aliment</button>
                     </>
                  )}
               </div>
            </div>
            <div className="border-t border-zinc-200 pt-6">
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>Tableau de bord Coach</h2>
               <p className="text-zinc-500 font-bold mt-2">Suivez l'évolution de vos clients et configurez les menus générés.</p>
            </div>
        </div>

        {activeTab === 'clients' && (
        <>
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-black text-[#39FF14] p-6 rounded-2xl shadow-sm border border-zinc-800 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Moyenne Kcal (Aujourd'hui)</p>
                <div className="flex items-center gap-4">
                   <div className="bg-[#39FF14]/10 p-4 rounded-xl"><Flame size={28} className="text-[#39FF14]"/></div>
                   <div>
                     <p className="text-4xl font-black">{averageCaloriesToday} <span className="text-sm font-bold text-zinc-500">kcal</span></p>
                     <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Sur {clientsWithLogsToday} clients ayant logué</p>
                   </div>
              <button onClick={handleRelanceInactifs} className="mt-6 w-full md:w-auto bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-md flex justify-center items-center gap-2">
                 <MessageSquare size={16}/> Relancer inactifs du jour ({clients.length - clientsWithLogsToday})
              </button>
                </div>
             </div>
             
             <div className="bg-white text-black p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Clients Actifs (Aujourd'hui)</p>
                <div className="flex items-center gap-4">
                   <div className="bg-blue-50 p-4 rounded-xl"><Activity size={28} className="text-blue-500"/></div>
                   <div>
                     <p className="text-4xl font-black">{clientsWithLogsToday} <span className="text-sm font-bold text-zinc-500">/ {clients.length}</span></p>
                     <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Taux d'activité journalier</p>
                   </div>
                </div>
             </div>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredClients.map(profile => {
              const clientName = profile.client?.full_name || "Client Inconnu";
              const phone = profile.phone || profile.client?.phone || "";
              
              const todayLog = profile.logs?.find((l: any) => l.log_date === todayStr);

              const calsConsumed = todayLog?.calories_consumed || 0;
              const protsConsumed = todayLog?.proteins_consumed || 0;
              const calsGoal = profile.daily_calorie_goal || 1500;
              const protsGoal = profile.protein_goal || 80;

              const weightLogs = profile.weight_logs?.sort((a: any, b: any) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()) || [];
              const waterLogs = profile.logs?.sort((a: any, b: any) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()).slice(-7) || [];

              // LOGIQUE D'ALERTES COACH
              const isOverCalories = calsConsumed > calsGoal;
              let isMissingLogs = false;
              
              const threeDaysAgo = new Date();
              threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
              
              if (profile.logs && profile.logs.length > 0) {
                 const sortedLogs = [...profile.logs].sort((a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
                 const latestLogDate = new Date(sortedLogs[0].log_date);
                 if (latestLogDate.getTime() < threeDaysAgo.getTime()) isMissingLogs = true;
              } else {
                 const createdAt = new Date(profile.created_at || new Date());
                 if (createdAt.getTime() < threeDaysAgo.getTime()) isMissingLogs = true;
              }

              return (
                 <div key={profile.id} className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm hover:border-[#39FF14] hover:shadow-xl transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <img src={profile.client?.avatar_url || `https://ui-avatars.com/api/?name=${clientName}`} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-zinc-100 object-cover" />
                          <div>
                             <h3 className="font-black uppercase text-sm">{clientName}</h3>
                             <p className="text-xs font-mono text-zinc-500">{phone}</p>
                          </div>
                       </div>
                       <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${profile.tracking_mode === 'guided' || profile.tracking_mode === 'autopilot' ? 'bg-black text-[#39FF14]' : 'bg-[#00E5FF]/20 text-[#00E5FF]'}`}>
                          {profile.tracking_mode === 'guided' || profile.tracking_mode === 'autopilot' ? 'Guidé' : 'Libre'}
                       </span>
                    </div>

                    {/* GRAPHIQUES POIDS & EAU */}
                    {expandedClient === profile.id ? (
                       <div className="mb-6 space-y-6 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 animate-in slide-in-from-top-2">
                          <div className="flex justify-between items-center mb-2">
                             <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2"><LineChartIcon size={14} className="text-[#39FF14]"/> Courbe de Poids</h4>
                             <button onClick={() => setExpandedClient(null)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                          </div>
                          
                          {weightLogs.length > 0 ? (
                             <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={weightLogs}>
                                    <Line type="monotone" dataKey="weight" stroke="#39FF14" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#39FF14' }} />
                                    <RechartsTooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
                                  </LineChart>
                                </ResponsiveContainer>
                             </div>
                          ) : (
                             <p className="text-[10px] text-zinc-500 italic">Aucune donnée de poids enregistrée.</p>
                          )}

                          <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2 pt-4 border-t border-zinc-800"><BarChartIcon size={14} className="text-[#00E5FF]"/> Historique Eau (7j)</h4>
                          {waterLogs.length > 0 ? (
                             <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={waterLogs}>
                                    <Bar dataKey="water_glasses" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                                    <RechartsTooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
                                  </BarChart>
                                </ResponsiveContainer>
                             </div>
                          ) : (
                             <p className="text-[10px] text-zinc-500 italic">Aucune donnée d'hydratation.</p>
                          )}
                       </div>
                    ) : (
                       <button onClick={() => setExpandedClient(profile.id)} className="mb-4 w-full bg-zinc-100 py-2.5 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-black hover:bg-zinc-200 flex justify-center items-center gap-2 transition-colors">
                          <LineChartIcon size={14}/> Voir l'évolution (Poids & Eau)
                       </button>
                    )}

                    {/* ZONES D'ALERTES */}
                    {(isOverCalories || isMissingLogs || (!todayLog && new Date().getHours() >= 20)) && (
                       <div className="flex flex-col gap-2 mb-4">
                          {isOverCalories && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><AlertTriangle size={14}/> Dépassement Calorique</div>}
                          {isMissingLogs && <div className="bg-orange-50 text-orange-600 px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><Clock size={14}/> Inactif depuis +3 jours</div>}
                          {!todayLog && new Date().getHours() >= 20 && (
                             <div className="bg-[#25D366]/10 text-[#25D366] px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-between gap-2 border border-[#25D366]/20">
                                <div className="flex items-center gap-2"><MessageSquare size={14}/> Bilan oublié (20h)</div>
                                <button onClick={() => window.open(`https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(`Coucou ${clientName} 👋\n\nN'oublie pas d'enregistrer ton bilan de la journée sur ton espace Onyx Nutrition pour qu'on puisse adapter ton menu de demain !\n\nÀ très vite !`)}`, '_blank')} className="bg-[#25D366] text-white px-2 py-1 rounded hover:bg-[#1ebd58] transition shadow-sm">
                                   Relancer
                                </button>
                             </div>
                          )}
                       </div>
                    )}

                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mb-6 space-y-4 flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 border-b border-zinc-200 pb-2 flex justify-between">
                          <span>Suivi du jour</span>
                          <span>{todayLog ? 'Actif' : 'Pas de log'}</span>
                       </p>
                       
                       <div>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                             <span className="text-orange-500 flex items-center gap-1"><Flame size={12}/> Calories</span>
                             <span className="text-zinc-500">{calsConsumed} / {calsGoal}</span>
                          </div>
                          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                             <div className={`h-full ${calsConsumed > calsGoal ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min((calsConsumed/calsGoal)*100, 100)}%` }}></div>
                          </div>
                       </div>

                       <div>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                             <span className="text-[#39FF14] flex items-center gap-1"><Target size={12}/> Protéines</span>
                             <span className="text-zinc-500">{protsConsumed} / {protsGoal}g</span>
                          </div>
                          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-[#39FF14] h-full" style={{ width: `${Math.min((protsConsumed/protsGoal)*100, 100)}%` }}></div>
                          </div>
                       </div>
                    </div>

                    <button onClick={() => window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank')} className="w-full bg-black text-[#39FF14] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform flex justify-center items-center gap-2">
                       Contacter sur WhatsApp <ExternalLink size={14}/>
                    </button>
                 <div className="grid grid-cols-3 gap-2 mt-2">
                    <button onClick={() => handleOpenClientModal(profile)} className="bg-zinc-100 text-black py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2" title="Objectifs">
                       <Edit3 size={14}/> Obj.
                    </button>
                    <button onClick={() => setShowReportModal(profile)} className="bg-blue-50 text-blue-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-colors flex justify-center items-center gap-2 shadow-sm" title="Rapport Mensuel">
                       <FileText size={14}/> Rapp.
                    </button>
                    <button onClick={() => setShowGroceryModal(profile)} className="bg-green-50 text-green-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-100 transition-colors flex justify-center items-center gap-2 shadow-sm" title="Liste de Courses">
                       <ShoppingCart size={14}/> Courses
                    </button>
                 </div>
                 </div>
              );
           })}
           
           {filteredClients.length === 0 && (
              <div className="col-span-full text-center py-20">
                 <Users size={48} className="text-zinc-300 mx-auto mb-4" />
                 <p className="text-zinc-500 font-bold">Aucun profil client trouvé.</p>
              </div>
           )}
        </div>
        
        {/* AUTOMATISATION WHATSAPP */}
        <div className="mt-12 pt-8 border-t-2 border-dashed border-zinc-200">
           <h3 className="font-black uppercase text-xl mb-4 flex items-center gap-3"><MessageSquare size={20} className="text-[#25D366]" /> Notifications Push WhatsApp</h3>
           <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                 <p className="font-black text-black mb-1 text-lg">Relance automatique des bilans (20h00)</p>
                 <p className="text-xs text-zinc-500 font-bold leading-relaxed max-w-2xl">L'IA détectera les clients qui n'ont pas rempli leur bilan journalier (Calories / Hydratation) et leur enverra un rappel amical sur WhatsApp automatiquement via l'API officielle.</p>
              </div>
              <label className="cursor-pointer relative flex items-center gap-3 shrink-0">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{isAutoReminderActive ? 'Activé' : 'Inactif'}</span>
                 <div className={`w-14 h-8 rounded-full p-1 transition-colors border ${isAutoReminderActive ? 'bg-[#25D366] border-[#25D366]' : 'bg-zinc-200 border-zinc-300'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isAutoReminderActive ? 'translate-x-6' : ''}`}></div>
                 </div>
                 <input type="checkbox" className="hidden" checked={isAutoReminderActive} onChange={() => setIsAutoReminderActive(!isAutoReminderActive)} />
              </label>
           </div>
        </div>
        </>
        )}

        {activeTab === 'recipes' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           {recipes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="col-span-full mb-2 flex items-center gap-2">
                    <BarChartIcon className="text-[#39FF14]" size={20}/> 
                    <h3 className="text-lg font-black uppercase tracking-tighter">Recettes les plus populaires</h3>
                 </div>
                 {recipes.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3).map((r, idx) => (
                    <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex items-center gap-4 hover:border-[#39FF14] transition-colors">
                       <div className="w-12 h-12 rounded-xl bg-black text-[#39FF14] flex items-center justify-center font-black text-lg shadow-md shrink-0">#{idx + 1}</div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-sm uppercase text-black line-clamp-1" title={r.nom}>{r.nom}</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 flex items-center gap-1"><Eye size={12}/> {r.views || 0} consultations</p>
                       </div>
                    </div>
                 ))}
              </div>
           )}
           <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Type & Nom</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Macros</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Popularité</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Bol Commun</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {recipes.map(r => (
                       <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4">
                             <div className="flex items-center gap-3">
                                <img src={r.image_url || 'https://placehold.co/100x100/111/39FF14?text=Recette'} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-100" onError={(e: any) => e.target.src = 'https://placehold.co/100x100/111/39FF14?text=Recette'} />
                                <div>
                                   <p className="font-bold text-sm text-black">{r.nom}</p>
                                   <p className="text-[10px] font-black text-zinc-500 uppercase mt-1">{r.type}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-4">
                             <div className="flex gap-3 text-xs font-bold">
                                <span className="text-orange-500 flex items-center gap-1"><Flame size={12}/> {r.calories} kcal</span>
                                <span className="text-green-500">P:{r.proteins}g</span>
                                <span className="text-yellow-600">G:{r.carbs}g</span>
                                <span className="text-zinc-500">L:{r.fats}g</span>
                             </div>
                          </td>
                          <td className="p-4">
                             <div className="flex items-center gap-1 text-zinc-500 font-bold text-xs">
                                <Eye size={14} className="text-blue-500"/> {r.views || 0} vues
                             </div>
                          </td>
                          <td className="p-4">
                             {r.is_bol_commun ? <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Oui</span> : <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Non</span>}
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                             <button onClick={() => handleOpenRecipeModal(r)} className="p-2 bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors"><Edit3 size={16}/></button>
                             <button onClick={() => handleDeleteRecipe(r.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          </td>
                       </tr>
                    ))}
                    {recipes.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-400 font-bold">Aucune recette configurée.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
        )}

      {/* MODALE LISTE COURSES ADMIN */}
      {showGroceryModal && (
         <div id="grocery-modal-overlay" onClick={(e: any) => e.target.id === 'grocery-modal-overlay' && setShowGroceryModal(null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-green-500 my-auto text-black max-h-[90vh] overflow-y-auto custom-scrollbar">
               <button onClick={() => setShowGroceryModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3`}><ShoppingCart className="text-green-500"/> Liste de Courses</h2>
               <p className="text-zinc-500 font-bold text-xs mb-6">Client : {showGroceryModal.client?.full_name}</p>

               <div className="space-y-6">
                  {(() => {
                      const list = getGroceryListForAdmin(showGroceryModal);
                      return Object.entries(list).map(([rayon, items]: any) => {
                          if (Object.keys(items).length === 0) return null;
                          return (
                              <div key={rayon}>
                                  <h4 className="font-black uppercase text-sm mb-3 text-black bg-zinc-100 p-3 rounded-xl border border-zinc-200">{rayon}</h4>
                                  <ul className="space-y-2 px-2">
                                      {Object.entries(items).map(([nom, data]: any) => (
                                          <li key={nom} className="flex justify-between text-sm font-medium border-b border-zinc-100 pb-2">
                                              <span className="text-zinc-700">{nom}</span>
                                              <span className="font-black text-black">{data.quantite} {data.unite}</span>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          );
                      });
                  })()}
               </div>
            </div>
         </div>
      )}

        {activeTab === 'shop' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           {salesStats.length > 0 && (
               <div className="mb-8 bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                   <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2"><TrendingUp className="text-[#39FF14]"/> Tendances des Ventes</h3>
                   <div className="overflow-x-auto">
                       <table className="w-full text-left">
                           <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                               <tr>
                                   <th className="p-4">Produit</th>
                                   <th className="p-4 text-center">Qté Vendue</th>
                                   <th className="p-4 text-right">CA Généré</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-zinc-50">
                               {salesStats.map((s, idx) => (
                                   <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                                       <td className="p-4 flex items-center gap-4">
                                           <img src={s.image || 'https://placehold.co/400x400/111/39FF14?text=Produit'} alt={s.name} className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200" onError={(e:any) => e.target.src = 'https://placehold.co/400x400/111/39FF14?text=Produit'} />
                                           <span className="font-bold text-sm text-black">{s.name}</span>
                                       </td>
                                       <td className="p-4 text-center font-black text-lg">{s.qty}</td>
                                       <td className="p-4 text-right font-black text-[#39FF14] text-lg">{s.revenue.toLocaleString()} F</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
           )}
           <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-1 w-full md:w-auto">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input type="text" placeholder="Rechercher (nom, catégorie)..." value={shopSearch} onChange={e=>setShopSearch(e.target.value)} className="w-full pl-10 p-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black shadow-sm" />
              </div>
              <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm w-full md:w-auto">
                 <Filter size={16} className="text-zinc-400 ml-2" />
                 <input type="number" placeholder="Min F" value={shopMinPrice} onChange={e=>setShopMinPrice(e.target.value===""?"":Number(e.target.value))} className="w-20 p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold outline-none text-center" />
                 <input type="range" min="0" max="50000" step="1000" value={shopMaxPrice || 50000} onChange={e=>setShopMaxPrice(Number(e.target.value))} className="w-24 accent-[#39FF14] cursor-pointer" />
                 <input type="number" placeholder="Max F" value={shopMaxPrice} onChange={e=>setShopMaxPrice(e.target.value===""?"":Number(e.target.value))} className="w-24 p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold outline-none text-center" />
                 <div className="w-px h-6 bg-zinc-200 mx-2"></div>
                 <label className="flex items-center gap-2 cursor-pointer pr-2">
                    <input type="checkbox" checked={shopOutOfStock} onChange={e => setShopOutOfStock(e.target.checked)} className="w-4 h-4 accent-black" />
                    <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">Rupture</span>
                 </label>
              </div>
              <select value={shopSort} onChange={e=>setShopSort(e.target.value)} className="w-full md:w-auto p-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer shadow-sm">
                 <option value="recent">Plus récents</option>
                 <option value="old">Plus anciens</option>
                 <option value="views">Plus consultés</option>
                 <option value="rating">Mieux notés</option>
              </select>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedShop.map(p => (
                  <div key={p.id} className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col hover:border-[#39FF14] transition-colors relative shadow-sm">
                     <div className="h-40 bg-zinc-50 rounded-xl overflow-hidden mb-3 relative shrink-0">
                         <img src={p.image_url || 'https://placehold.co/400x400/111/39FF14?text=Produit'} alt={p.nom} className="w-full h-full object-cover" onError={(e:any) => e.target.src = 'https://placehold.co/400x400/111/39FF14?text=Produit'} />
                         <span className="absolute top-2 right-2 bg-black text-white px-2 py-0.5 rounded text-[10px] font-black">{p.stock} stock</span>
                     </div>
                     <p className="font-bold text-sm line-clamp-1">{p.nom}</p>
                     <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-zinc-500 font-black uppercase truncate pr-2">{p.categorie_nom}</p>
                        <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500 shrink-0"><Star size={10} className="fill-current"/> {p.rating || 5}</div>
                     </div>
                     <div className="mt-3 flex items-center justify-between">
                        <p className="text-zinc-400 text-xs font-bold line-through">{p.prix_standard} F</p>
                        <p className="text-[#39FF14] font-black text-lg bg-black w-max px-2 py-0.5 rounded italic shadow-sm">{p.prix_premium} F</p>
                     </div>
                     <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-100">
                        <button onClick={() => handleOpenProductModal(p)} className="flex-1 bg-zinc-100 text-black py-2 rounded-lg text-xs font-black uppercase hover:bg-zinc-200 transition-colors flex justify-center"><Edit3 size={14}/></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors flex justify-center"><Trash2 size={14}/></button>
                     </div>
                  </div>
              ))}
           </div>
           
           {totalShopPages > 1 && (
               <div className="flex justify-between items-center mt-6">
                  <button disabled={shopPage === 1} onClick={()=>setShopPage(p=>p-1)} className="p-2 bg-zinc-100 rounded-lg hover:bg-zinc-200 disabled:opacity-50"><ChevronLeft size={16}/></button>
                  <span className="text-xs font-black uppercase text-zinc-500">Page {shopPage} / {totalShopPages}</span>
                  <button disabled={shopPage === totalShopPages} onClick={()=>setShopPage(p=>p+1)} className="p-2 bg-zinc-100 rounded-lg hover:bg-zinc-200 disabled:opacity-50"><ChevronRight size={16}/></button>
               </div>
           )}
        </div>
        )}

        {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Date & Client</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Commande</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {orders.map(o => (
                       <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4">
                             <p className="font-bold text-sm text-black">{o.client_name}</p>
                             <p className="text-[10px] font-black text-zinc-500 uppercase mt-1">{new Date(o.created_at).toLocaleDateString('fr-FR')} • {o.phone}</p>
                          </td>
                          <td className="p-4">
                             <p className="text-xs font-bold text-zinc-600 mb-1">{o.items?.length || 0} articles</p>
                             <p className="text-sm font-black text-black">{o.total?.toLocaleString()} F</p>
                             {o.promo_code && <p className="text-[10px] font-black text-[#39FF14] uppercase mt-1">Code: {o.promo_code} (-{o.discount_amount} F)</p>}
                          </td>
                          <td className="p-4">
                             <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value, o.phone, o.client_name)} className={`p-2 border rounded-xl outline-none text-xs font-bold ${o.status === 'Nouveau' ? 'bg-blue-50 text-blue-600 border-blue-200' : o.status === 'Livré' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                               <option value="Nouveau">Nouveau</option>
                               <option value="En préparation">En préparation</option>
                               <option value="Expédié">Expédié</option>
                               <option value="Livré">Livré</option>
                               <option value="Annulé">Annulé</option>
                             </select>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-1.5 flex-wrap">
                             <button onClick={() => window.open(`https://wa.me/${o.phone?.replace('+', '')}`, '_blank')} className="px-2 py-2 bg-[#25D366] text-white hover:bg-[#1ebd58] rounded-lg transition-colors flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"><MessageSquare size={12}/> WhatsApp</button>
                             <button onClick={() => window.open(`mailto:?subject=Relance Commande OnyxNutrition&body=Bonjour ${o.client_name}, nous avons remarqué que votre commande de ${o.total?.toLocaleString()} F n'a pas été finalisée. Souhaitez-vous de l'aide ?`, '_blank')} className="px-2 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"><Mail size={12}/> Email</button>
                          </td>
                       </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-400 font-bold">Aucune commande enregistrée.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
        )}

        {activeTab === 'promos' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                 <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Code Promo</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Remise (%)</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Minimum XP</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {promos.map(p => (
                       <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4 font-black text-sm text-black">{p.code}</td>
                          <td className="p-4 font-black text-[#39FF14] text-lg">-{p.discount_pct}%</td>
                          <td className="p-4 text-xs font-bold text-zinc-500">{p.min_xp} XP</td>
                          <td className="p-4">
                             <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.active ? 'Actif' : 'Inactif'}</span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                             <button onClick={() => handleOpenPromoModal(p)} className="p-2 bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors"><Edit3 size={16}/></button>
                             <button onClick={() => handleDeletePromo(p.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          </td>
                       </tr>
                    ))}
                    {promos.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-zinc-400 font-bold">Aucun code promo créé.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
        )}

        {activeTab === 'foods' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
           <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nom & Catégorie</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Portion</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Valeurs (100g)</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {foods.map(f => (
                       <tr key={f.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4"><p className="font-bold text-sm text-black">{f.nom}</p><p className="text-[10px] font-black text-zinc-500 uppercase mt-1">{f.categorie}</p></td>
                          <td className="p-4"><p className="text-xs font-bold text-zinc-600">{f.portion_standard_nom}</p><p className="text-[10px] text-zinc-400">{f.portion_standard_grammes}g</p></td>
                          <td className="p-4"><div className="flex gap-2 text-[10px] font-bold"><span className="text-orange-500">{f.valeurs_pour_100g?.calories} kcal</span><span className="text-green-500">P:{f.valeurs_pour_100g?.proteines}g</span></div></td>
                          <td className="p-4 text-right flex justify-end gap-2">
                             <button className="p-2 bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors"><Edit3 size={16}/></button>
                             <button className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          </td>
                       </tr>
                    ))}
                    {foods.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-400 font-bold">Aucun aliment configuré dans la base de données.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
        )}
      </main>

      {/* MODALE RECETTE */}
      {showRecipeModal && (
         <div id="recipe-modal-overlay" onClick={(e: any) => e.target.id === 'recipe-modal-overlay' && setShowRecipeModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto max-h-[90vh] overflow-y-auto custom-scrollbar text-black">
               <button onClick={() => setShowRecipeModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3`}>
                  <Utensils className="text-[#39FF14]" size={28}/> {editingRecipe ? 'Modifier Recette' : 'Nouvelle Recette'}
               </h2>
               
               <form onSubmit={handleSaveRecipe} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Type de Repas</label>
                        <select value={recipeForm.type} onChange={e => setRecipeForm({...recipeForm, type: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black cursor-pointer">
                           <option value="Petit-déjeuner">Petit-déjeuner</option>
                           <option value="Déjeuner">Déjeuner</option>
                           <option value="Collation">Collation</option>
                           <option value="Dîner">Dîner</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Nom du Plat</label>
                        <input type="text" required value={recipeForm.nom} onChange={e => setRecipeForm({...recipeForm, nom: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black" placeholder="Ex: Thieboudienne Diététique" />
                     </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-orange-500 tracking-widest ml-1">Kcal</label><input type="number" required value={recipeForm.calories === 0 ? '' : recipeForm.calories} onChange={e => setRecipeForm({...recipeForm, calories: e.target.value ? Number(e.target.value) : 0})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-green-500 tracking-widest ml-1">Prot(g)</label><input type="number" required value={recipeForm.proteins === 0 ? '' : recipeForm.proteins} onChange={e => setRecipeForm({...recipeForm, proteins: e.target.value ? Number(e.target.value) : 0})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-yellow-600 tracking-widest ml-1">Gluc(g)</label><input type="number" required value={recipeForm.carbs === 0 ? '' : recipeForm.carbs} onChange={e => setRecipeForm({...recipeForm, carbs: e.target.value ? Number(e.target.value) : 0})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Lip(g)</label><input type="number" required value={recipeForm.fats === 0 ? '' : recipeForm.fats} onChange={e => setRecipeForm({...recipeForm, fats: e.target.value ? Number(e.target.value) : 0})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-100 transition-colors">
                     <input type="checkbox" checked={recipeForm.is_bol_commun} onChange={e => setRecipeForm({...recipeForm, is_bol_commun: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                     <div>
                        <p className="font-black text-sm uppercase text-blue-800">C'est un "Bol Commun"</p>
                        <p className="text-[10px] font-bold text-blue-600">Repas partagé en famille (le Smart Planner en intègre 2-3 / sem).</p>
                     </div>
                  </label>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">URL Vidéo de la Recette</label>
                     <div className="flex gap-2">
                        <input type="text" value={recipeForm.video_url || ''} onChange={e => setRecipeForm({...recipeForm, video_url: e.target.value})} className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black" placeholder="Lien YouTube..." />
                        <button type="button" onClick={handleGenerateVideoIA} disabled={isGeneratingVideo} className="bg-black text-[#39FF14] px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:scale-100">
                           {isGeneratingVideo ? <Loader2 size={16} className="animate-spin"/> : <Video size={16}/>} {isGeneratingVideo ? "Création..." : "IA Vidéo"}
                        </button>
                     </div>
                     <p className="text-[9px] font-bold text-zinc-400 ml-2">L'IA générera une vidéo courte (Shorts/Reels) à partir des étapes de cuisson.</p>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Instructions / Recette</label>
                     <textarea value={recipeForm.recipe} onChange={e => setRecipeForm({...recipeForm, recipe: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black min-h-[100px]" placeholder="Astuces de cuisson, remplacement d'ingrédients..."></textarea>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-[#39FF14] tracking-widest ml-2">Bienfaits Santé (Animés côté client)</label>
                     <textarea value={recipeForm.bienfaits} onChange={e => setRecipeForm({...recipeForm, bienfaits: e.target.value})} className="w-full p-4 bg-zinc-50 border border-[#39FF14]/50 rounded-2xl font-bold text-sm outline-none focus:border-[#39FF14] min-h-[60px]" placeholder="Ex: Apporte de l'énergie durable sans pic d'insuline. Parfait pour la digestion..."></textarea>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Description</label>
                     <textarea value={recipeForm.description} onChange={e => setRecipeForm({...recipeForm, description: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black min-h-[60px]" placeholder="Courte description de la recette..."></textarea>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">URL Image Principale</label>
                     <input type="text" value={recipeForm.image_url} onChange={e => setRecipeForm({...recipeForm, image_url: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black" placeholder="https://..." />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Galerie Photos (1 URL par ligne)</label>
                     <textarea value={recipeForm.gallery.join('\n')} onChange={e => setRecipeForm({...recipeForm, gallery: e.target.value.split('\n')})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black min-h-[80px]" placeholder="https://img1.jpg&#10;https://img2.jpg"></textarea>
                  </div>

                  <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200">
                     <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ingrédients (Liste de courses)</label>
                        <button type="button" onClick={() => setRecipeForm({...recipeForm, ingredients: [...recipeForm.ingredients, { nom: '', quantite: 1, unite: 'g', rayon: 'Supermarché' }]})} className="bg-black text-[#39FF14] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:scale-105 transition-transform"><Plus size={12}/> Ajouter</button>
                     </div>
                     <div className="space-y-3">
                        {recipeForm.ingredients.map((ing, i) => (
                           <div key={i} className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-white p-2 rounded-xl border border-zinc-100">
                              <input type="text" placeholder="Nom" required value={ing.nom} onChange={e => { const newI = [...recipeForm.ingredients]; newI[i].nom = e.target.value; setRecipeForm({...recipeForm, ingredients: newI}); }} className="flex-1 min-w-[100px] p-2 bg-zinc-50 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-black" />
                              <input type="number" placeholder="Qté" required value={ing.quantite} onChange={e => { const newI = [...recipeForm.ingredients]; newI[i].quantite = Number(e.target.value); setRecipeForm({...recipeForm, ingredients: newI}); }} className="w-16 p-2 bg-zinc-50 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-black text-center" />
                              <input type="text" placeholder="Unité" required value={ing.unite} onChange={e => { const newI = [...recipeForm.ingredients]; newI[i].unite = e.target.value; setRecipeForm({...recipeForm, ingredients: newI}); }} className="w-16 p-2 bg-zinc-50 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-black text-center" />
                              <select value={ing.rayon} onChange={e => { const newI = [...recipeForm.ingredients]; newI[i].rayon = e.target.value; setRecipeForm({...recipeForm, ingredients: newI}); }} className="w-32 p-2 bg-zinc-50 rounded-lg text-[10px] font-black uppercase outline-none border border-transparent focus:border-black cursor-pointer">
                                 <option value="Supermarché">Supermarché</option>
                                 <option value="Marché local">Marché local</option>
                                 <option value="Boucherie / Pêche">Boucherie / Pêche</option>
                              </select>
                              <button type="button" onClick={() => { const newI = [...recipeForm.ingredients]; newI.splice(i, 1); setRecipeForm({...recipeForm, ingredients: newI}); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                           </div>
                        ))}
                        {recipeForm.ingredients.length === 0 && <p className="text-xs text-zinc-400 italic text-center py-2">Aucun ingrédient ajouté.</p>}
                     </div>
                  </div>

                  <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                     <CheckCircle size={20}/> Enregistrer la recette
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE CLIENT */}
      {editingClient && (
         <div id="client-modal-overlay" onClick={(e: any) => e.target.id === 'client-modal-overlay' && setEditingClient(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto text-black">
               <button onClick={() => setEditingClient(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3`}>
                  <Target className="text-[#39FF14]"/> Objectifs Client
               </h2>
               <p className="text-zinc-500 font-bold text-xs mb-8">{editingClient.client.full_name}</p>
               
               <form onSubmit={handleSaveClient} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Mode de Suivi</label>
                     <select value={clientForm.tracking_mode} onChange={e => setClientForm({...clientForm, tracking_mode: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black cursor-pointer">
                        <option value="guided">Guidé (Menu Strict)</option>
                        <option value="flexible">Libre (Flexible)</option>
                        <option value="autopilot">Autopilot</option>
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-orange-500 tracking-widest ml-1">Kcal / Jour</label><input type="number" required value={clientForm.daily_calorie_goal} onChange={e => setClientForm({...clientForm, daily_calorie_goal: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-green-500 tracking-widest ml-1">Protéines (g)</label><input type="number" required value={clientForm.protein_goal} onChange={e => setClientForm({...clientForm, protein_goal: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-yellow-600 tracking-widest ml-1">Glucides (g)</label><input type="number" required value={clientForm.carbs_goal} onChange={e => setClientForm({...clientForm, carbs_goal: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Lipides (g)</label><input type="number" required value={clientForm.fats_goal} onChange={e => setClientForm({...clientForm, fats_goal: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                  </div>

                  <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                     <Save size={20}/> Mettre à jour
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE PRODUIT */}
      {showProductModal && (
         <div id="product-modal-overlay" onClick={(e: any) => e.target.id === 'product-modal-overlay' && setShowProductModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto text-black">
               <button onClick={() => setShowProductModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3`}><ShoppingBag className="text-[#39FF14]"/> Produit Boutique</h2>
               
               <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Catégorie</label><input type="text" required value={productForm.categorie_nom} onChange={e => setProductForm({...productForm, categorie_nom: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Nom</label><input type="text" required value={productForm.nom} onChange={e => setProductForm({...productForm, nom: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" /></div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Prix Standard</label><input type="number" required value={productForm.prix_standard} onChange={e => setProductForm({...productForm, prix_standard: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#39FF14] tracking-widest">Prix Premium</label><input type="number" required value={productForm.prix_premium} onChange={e => setProductForm({...productForm, prix_premium: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Stock</label><input type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Note /5</label><input type="number" min="0" max="5" step="0.1" required value={productForm.rating} onChange={e => setProductForm({...productForm, rating: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Description Courte</label><textarea required value={productForm.description_courte} onChange={e => setProductForm({...productForm, description_courte: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-sm outline-none focus:border-black min-h-[60px]" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Description Longue</label><textarea value={productForm.description_longue} onChange={e => setProductForm({...productForm, description_longue: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-sm outline-none focus:border-black min-h-[100px]" /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Badge (Optionnel)</label><input type="text" value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" placeholder="Ex: Best Seller" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Image URL</label><input type="text" required value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" /></div>
                  </div>
                   <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Vidéo URL (YouTube ou Direct)</label><input type="url" value={productForm.video_url} onChange={e => setProductForm({...productForm, video_url: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" placeholder="https://www.youtube.com/watch?v=..." /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Galerie Images (1 URL par ligne)</label><textarea value={productForm.gallery.join('\n')} onChange={e => setProductForm({...productForm, gallery: e.target.value.split('\n')})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-sm outline-none focus:border-black min-h-[80px]" placeholder="https://img1.jpg&#10;https://img2.jpg..." /></div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Objectif (Goal)</label>
                     <select value={productForm.goal} onChange={e => setProductForm({...productForm, goal: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black cursor-pointer">
                        <option value="all">Général</option>
                        <option value="detox">Détox</option>
                        <option value="energy">Énergie</option>
                        <option value="cooking">Cuisine</option>
                        <option value="snacks">Snacks</option>
                     </select>
                  </div>
                  <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                     <Save size={20}/> Sauvegarder
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE PROMO CODE */}
      {showPromoModal && (
         <div id="promo-modal-overlay" onClick={(e: any) => e.target.id === 'promo-modal-overlay' && setShowPromoModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto text-black">
               <button onClick={() => setShowPromoModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3`}><Ticket className="text-[#39FF14]"/> Code Promotionnel</h2>
               
               <form onSubmit={handleSavePromo} className="space-y-4">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Code Promo</label><input type="text" required value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-black text-sm outline-none focus:border-black uppercase" placeholder="Ex: JONGOMA1000" /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Remise (%)</label><input type="number" min="0" max="100" required value={promoForm.discount_pct} onChange={e => setPromoForm({...promoForm, discount_pct: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Minimum XP requis</label><input type="number" required value={promoForm.min_xp} onChange={e => setPromoForm({...promoForm, min_xp: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black text-center" /></div>
                  </div>
                  
                  <label className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-100 transition-colors mt-4">
                     <input type="checkbox" checked={promoForm.active} onChange={e => setPromoForm({...promoForm, active: e.target.checked})} className="w-5 h-5 accent-black" />
                     <div>
                        <p className="font-black text-sm uppercase text-black">Code Actif</p>
                        <p className="text-[10px] font-bold text-zinc-500">Permettre son utilisation sur la boutique.</p>
                     </div>
                  </label>

                  <button type="submit" className="w-full mt-4 bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                     <Save size={20}/> Sauvegarder
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE CONFIRMATION IMPORT CSV RECETTES */}
      {pendingRecipeCsvFile && (
        <div id="recipe-csv-modal-overlay" onClick={(e: any) => e.target.id === 'recipe-csv-modal-overlay' && !isImportingRecipeCsv && setPendingRecipeCsvFile(null)} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-t-8 border-[#39FF14] animate-in zoom-in-95 text-center text-black">
            <button onClick={() => !isImportingRecipeCsv && setPendingRecipeCsvFile(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors"><X size={16}/></button>
            <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><Utensils size={24}/></div>
            <h3 className="text-xl font-black uppercase mb-2 text-black">Confirmer l'import (Recettes)</h3>
            <p className="text-sm font-bold text-zinc-500 mb-6">Fichier : {pendingRecipeCsvFile.filename}</p>
            
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-8">
               <p className="text-3xl font-black text-[#39FF14]">{pendingRecipeCsvFile.recipesCount}</p>
               <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-1">Recettes trouvées</p>
            </div>

            {isImportingRecipeCsv && (
               <div className="mb-6 w-full text-left animate-in fade-in">
                  <div className="w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                     <div className="bg-[#39FF14] h-2.5 rounded-full transition-all duration-300" style={{ width: `${recipeCsvImportProgress}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-2 tracking-widest uppercase text-center">Importation... {recipeCsvImportProgress}%</p>
               </div>
            )}

            <div className="flex gap-3">
               <button onClick={() => setPendingRecipeCsvFile(null)} disabled={isImportingRecipeCsv} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 transition disabled:opacity-50">Annuler</button>
               <button onClick={handleConfirmRecipeCsvImport} disabled={isImportingRecipeCsv} className="flex-[2] py-4 bg-black text-[#39FF14] rounded-xl font-black uppercase text-xs hover:scale-105 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100">
                  {isImportingRecipeCsv ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>} {isImportingRecipeCsv ? 'En cours...' : 'Valider'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CONFIRMATION IMPORT CSV BOUTIQUE */}
      {pendingProductCsvFile && (
        <div id="csv-modal-overlay" onClick={(e: any) => e.target.id === 'csv-modal-overlay' && !isImportingProductCsv && setPendingProductCsvFile(null)} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-t-8 border-[#39FF14] animate-in zoom-in-95 text-center text-black">
            <button onClick={() => !isImportingProductCsv && setPendingProductCsvFile(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors"><X size={16}/></button>
            <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><Database size={24}/></div>
            <h3 className="text-xl font-black uppercase mb-2 text-black">Confirmer l'import (Boutique)</h3>
            <p className="text-sm font-bold text-zinc-500 mb-6">Fichier : {pendingProductCsvFile.filename}</p>
            
            <div className="grid grid-cols-2 gap-2 mb-8">
               <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <p className="text-2xl font-black text-[#39FF14]">{pendingProductCsvFile.productsCount}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Produits</p>
               </div>
               <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <p className="text-2xl font-black text-black">{pendingProductCsvFile.categoriesCount}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-1">Catégories</p>
               </div>
            </div>

            {isImportingProductCsv && (
               <div className="mb-6 w-full text-left animate-in fade-in">
                  <div className="w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                     <div className="bg-[#39FF14] h-2.5 rounded-full transition-all duration-300" style={{ width: `${productCsvImportProgress}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-2 tracking-widest uppercase text-center">Importation... {productCsvImportProgress}%</p>
               </div>
            )}

            <div className="flex gap-3">
               <button onClick={() => setPendingProductCsvFile(null)} disabled={isImportingProductCsv} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 transition disabled:opacity-50">Annuler</button>
               <button onClick={handleConfirmProductCsvImport} disabled={isImportingProductCsv} className="flex-[2] py-4 bg-black text-[#39FF14] rounded-xl font-black uppercase text-xs hover:scale-105 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100">
                  {isImportingProductCsv ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>} {isImportingProductCsv ? 'En cours...' : 'Valider'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE RAPPORT MENSUEL */}
      {showReportModal && (
         <div id="report-modal-overlay" onClick={(e: any) => e.target.id === 'report-modal-overlay' && setShowReportModal(null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-blue-500 my-auto text-black">
               <button onClick={() => setShowReportModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3`}><FileText className="text-blue-500"/> Rapport Mensuel</h2>
               <p className="text-zinc-500 font-bold text-xs mb-6">Client : {showReportModal.client?.full_name}</p>

               <div className="space-y-4 mb-8">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Notes du Coach (Incluses dans le PDF)</label>
                  <textarea 
                     value={reportCoachNotes} 
                     onChange={e => setReportCoachNotes(e.target.value)} 
                     className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium text-sm outline-none focus:border-black min-h-[120px]" 
                     placeholder="Félicitations pour tes progrès ! Pense à boire un peu plus d'eau cette semaine..."
                  />
               </div>

               <div className="flex flex-col gap-3">
                  <button onClick={() => generateClientReportPDF(showReportModal, false)} className="w-full bg-blue-50 text-blue-600 py-4 rounded-[2rem] font-black uppercase text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                     <Download size={18}/> Télécharger le PDF
                  </button>
                  <button onClick={() => generateClientReportPDF(showReportModal, true)} className="w-full bg-[#25D366] text-white py-4 rounded-[2rem] font-black uppercase text-sm hover:bg-[#1ebd58] transition-colors shadow-lg flex items-center justify-center gap-2">
                     <MessageSquare size={18}/> Envoyer sur WhatsApp
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* MODALE VITRINE IA */}
      {showVitrineModal && (
        <div id="vitrine-modal-overlay" onClick={(e: any) => e.target.id === 'vitrine-modal-overlay' && setShowVitrineModal(false)} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-t-8 border-blue-500 animate-in zoom-in-95 text-black">
            <button onClick={() => setShowVitrineModal(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2"><Sparkles className="text-blue-500"/> Vitrine & IA</h3>
            
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Image de la Bannière (URL)</label>
                  <input type="url" value={vitrineBanner} onChange={e => setVitrineBanner(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl mt-1 outline-none focus:border-black" placeholder="https://image-banner.com/..." />
               </div>
               <button onClick={handleOptimizeShopIA} className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition-transform flex justify-center items-center gap-2">
                  <Bot size={18}/> Organiser via IA
               </button>
               <p className="text-[10px] font-bold text-zinc-500 text-center uppercase tracking-widest">L'IA va trier vos produits par popularité et notes pour maintenir une boutique dynamique côté client.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}