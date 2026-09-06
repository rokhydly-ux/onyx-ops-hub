# Documentation Technique : Modules Fitness & Blog (PWA React / Next.js)

Ce document décrit l'architecture, la modélisation des données (Supabase), et la logique métier des espaces **Fitness** et **Blog** existants dans l'application PWA. Il est conçu comme un guide de référence pour recréer, migrer ou adapter ces fonctionnalités dans un autre environnement React.

---

## 1. Espace Fitness

L'espace Fitness permet aux utilisateurs de générer un programme sportif hebdomadaire sur-mesure (5 jours d'entraînement, 2 jours de repos) basé sur un catalogue d'exercices vidéo.

### A. Modélisation des données (Supabase)

Le système repose sur 4 tables principales :

**1. `nutrition_fitness_courses` (Catalogue des exercices)**
*   `id` (UUID, Primary Key)
*   `title` (VARCHAR) : Nom de l'exercice
*   `description` (TEXT) : Description détaillée
*   `video_url` (TEXT) : Lien YouTube ou vidéo hébergée
*   `thumbnail_url` (TEXT) : Miniature de la vidéo
*   `duration_minutes` (INTEGER) : Durée de l'exercice
*   `benefits` (TEXT) : Bienfaits de l'exercice
*   `equipment_needed` (VARCHAR) : Matériel requis (ex: 'Aucun', 'Haltères')
*   `difficulty` (VARCHAR) : 'Débutant', 'Intermédiaire', 'Pro'
*   `category` (VARCHAR) : Lié aux catégories de la taxonomie
*   `calories_burned_est` (INTEGER) : Estimation des calories brûlées
*   `linked_product_id` (UUID/VARCHAR) : *Pour le cross-selling boutique*

**2. `nutrition_fitness_programs` (Programmes générés pour les utilisateurs)**
*   `id` (UUID, Primary Key)
*   `client_id` (UUID) : Clé étrangère vers la table `clients`
*   `tenant_id` (VARCHAR) : Pour la gestion multi-tenant si applicable
*   `course_id` (UUID) : Clé étrangère vers `nutrition_fitness_courses` (On Delete Cascade)
*   `program_name` (VARCHAR) : Ex: "Programme Automatique - Gainage"
*   `day_of_week` (VARCHAR) : Représentation du jour ('0' pour Lundi, ..., '6' pour Dimanche)
*   `is_active` (BOOLEAN) : Programme en cours (Défaut : true)
*   `is_completed` (BOOLEAN) : Exercice terminé par l'utilisateur (Défaut : false)
*   `completed_at` (TIMESTAMP) : Date et heure de complétion

**3. `nutrition_fitness_program_exercises` (Pour des séances multi-exercices / Optionnel actuellement)**
*   Permet d'ordonner plusieurs exercices (`course_id`) dans une même séance (`program_id`) avec `sets`, `reps`, `rest_time_seconds`.

**4. `nutrition_fitness_categories` (Taxonomie)**
*   `id` (UUID, Primary Key)
*   `name` (VARCHAR) : Ex: 'Woyofal Cardio', 'Renforcement Doux', 'Objectif Ventre Plat', etc.

**Sécurité (RLS)**
*   Lecture (`SELECT`) sur les cours et catégories : Accessible à tous les utilisateurs.
*   Lecture (`SELECT`) sur les programmes : Restreint aux programmes où `auth.uid() = client_id`.
*   Écriture : Seuls les admins peuvent ajouter des cours ; les clients peuvent `INSERT`/`UPDATE` leurs propres programmes.

### B. Architecture Composants React

1.  **`FitnessTab.tsx` (Conteneur principal)**
    *   Composant wrapper de l'espace. Il gère l'en-tête, le bouton "Retour à l'accueil" (qui modifie l'état global via `handleTabChange('dashboard')`) et intègre le composant métier principal.

2.  **`ClientFitnessView.tsx` (Logique Métier)**
    *   **États principaux :** `courses` (catalogue), `weeklyProgram` (programme de l'utilisateur), `currentDayIndex` (jour affiché dans le carrousel).
    *   **Récupération (Fetch) :** Au chargement, il fetch les exercices actifs (ceux ayant une `video_url` non nulle) et le programme hebdomadaire de l'utilisateur.
    *   **Générateur de Semaine (`generateMyWeek`) :**
        *   Efface le programme existant (`delete().eq('client_id', clientId)`).
        *   Vérifie qu'au moins 5 exercices sont disponibles.
        *   Sélectionne aléatoirement 5 exercices (`[...courses].sort(() => 0.5 - Math.random()).slice(0, 5)`).
        *   Assigne ces 5 exercices aux indices `0` à `4` (Lundi à Vendredi). Les indices `5` et `6` (Samedi/Dimanche) sont implicitement considérés comme "Jours de repos" lors du rendu UI.
        *   Insère les 5 lignes dans `nutrition_fitness_programs`.
    *   **Validation (`markAsCompleted`) :** Met à jour la colonne `is_completed` à `true` et `completed_at` avec la date courante.

---

## 2. Espace Blog (Marketing & Éducation)

L'espace Blog présente des articles générés ou rédigés manuellement. Il comprend un système de génération d'articles par IA depuis le panel d'administration, adoptant différentes "voix" de la marque.

### A. Modélisation des données (Supabase)

**Table : `marketing_articles`**
*   `id` (UUID, Primary Key)
*   `title` (VARCHAR) : Titre de l'article
*   `desc` (TEXT) : Courte description (utilisée pour l'aperçu)
*   `content` (TEXT) : Contenu complet de l'article (au format HTML/Texte structuré)
*   `image_url` (TEXT) : Lien de l'image de couverture (généralement hébergée sur Cloudinary)
*   `category` (VARCHAR) : Catégorie (Nutrition, Santé, Astuces, Témoignages)
*   `author_name` (VARCHAR) : Nom de l'auteur (ex: "Coach Rokhy")
*   `views_count` (INTEGER) : Compteur de vues
*   `estimated_read_time` (VARCHAR) / `readTime` : Temps de lecture estimé
*   `created_at` (TIMESTAMP)

### B. Architecture Composants React (Frontend PWA)

1.  **`BlogListTab.tsx` (Liste des articles)**
    *   **Affichage à la une :** Un carrousel (Embla ou CSS standard) affiche les 3 articles les plus récents/vus avec de grandes images de fond en header.
    *   **Filtres et Recherche :**
        *   Catégories (`blogCategory`) : 'Tous', 'Nutrition', 'Santé', 'Astuces', 'Témoignages'.
        *   Barre de recherche textuelle (`blogSearch`) filtrant sur `title` et `desc`.
    *   **Interaction :** Le clic sur un article déclenche la fonction passée en prop `handleArticleClick(article)`, qui stocke l'article dans un état global (`selectedArticle`) et masque la vue liste au profit de la vue article.

2.  **`BlogArticleTab.tsx` (Détail de l'article)**
    *   **Contenu principal :** Affiche l'image de couverture, le titre, et injecte le contenu de l'article via `dangerouslySetInnerHTML` après l'avoir scindé en paragraphes (`textToRender.split(/\n+/)`).
    *   **Parsing d'IA :** Un code spécifique extrait les notes d'IA potentielles présentes dans le texte (ex: `[Généré via IA simulée...]`) pour les afficher dans un petit encart de désistement/italic à la fin du texte.
    *   **Sidebar :** Affiche une carte Auteur (Coach Rokhy) et un encart "Top Trending" listant les autres articles triés par `views_count`.
    *   **Navigation :** Un bouton "Retour au blog" vide l'état `selectedArticle`.

### C. Génération d'articles par IA (Backend / API)

L'administration possède un endpoint backend (`/api/admin/generate-article/route.ts`) pour générer du contenu via OpenAI (`gpt-4o-mini`).

**Logique du Endpoint :**
*   Vérifie l'authentification Supabase via le token Bearer.
*   Accepte un JSON contenant `title` (le sujet) et `voice` (le persona).
*   **Personas (Prompts Système) :**
    *   **`rokhy_educatrice` :** Style humaniste et chaleureux, axé sur les vertus des aliments africains avec des chiffres concrets, concluant sur une solution produit.
    *   **`rokhy_grande_soeur` :** Ton déculpabilisant, brisant les mythes ("les plats africains font grossir"), basé sur des cas pratiques.
    *   **`dr_thierno_consultation` :** Ton empathique mais rigoureux/médical. Structure basée sur un symptôme, explication clinique simple, et solution par l'alimentation locale.
    *   **`dr_thierno_publique` :** Axé sur la santé publique et la prévention (diabète, hypertension) avec une perspective ancestrale vs science moderne.
*   **Contrainte Forte IA :** Le prompt interdit formellement à l'IA d'utiliser le Markdown (les astérisques `**`) et force une structure en étapes fluides.
*   **Fallback :** Si aucune clé `OPENAI_API_KEY` n'est fournie en `.env`, l'API renvoie un texte factice formaté.

---
*Fin de la documentation technique*
