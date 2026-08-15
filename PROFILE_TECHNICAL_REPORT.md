# Rapport Technique : Section Profil (PWA vers React Native)

Ce document décrit en détail l'architecture, le design, la gestion de l'état et les interactions avec la base de données de la section **"Mon Profil"** de la PWA actuelle. Il servira de référence pour réécrire cette section à l'identique (ou s'en rapprochant) pour la future application React Native.

---

## 1. Architecture UI / UX et Design

La section Profil (`activeTab === 'profile'`) repose sur une disposition en grilles (`grid`) et sur le style "Bento" avec des cartes unifiées, des bordures subtiles et des halos néon.

### Correspondance des Styles (Tailwind -> React Native)
Voici les principes de design appliqués dans la PWA et leurs équivalences conceptuelles pour React Native (StyleSheet) :

* **Couleurs Globales :**
  * Fond principal : Blanc (`#FFFFFF`) / Dark Mode : Zinc-950 (`#09090b`).
  * Accent/Néon : Vert fluo (`#39FF14`).
  * Textes secondaires : Zinc-500 (`#71717a`).
* **Grande Carte Unifiée (Conteneur principal) :**
  * `borderRadius: 40` (équivalent de `rounded-[2.5rem]`).
  * `padding: 24` à `40` (équivalent de `p-6 sm:p-10`).
  * `backgroundColor: '#FFFFFF'`.
  * `shadowColor: '#39FF14'`, `shadowOpacity: 0.08`, `shadowRadius: 40` (effet de glow).
  * `borderColor: 'rgba(228, 228, 231, 0.8)'` (Zinc-200).
* **Bannière (Cover) & Avatar :**
  * **Bannière :** `height: 160` à `192` (`h-40 sm:h-48`), `borderRadius: 24` (`rounded-3xl`), `overflow: 'hidden'`. Image en `resizeMode="cover"`.
  * **Avatar :** Superposé (Absolute Positioning) en bas à gauche (`position: 'absolute', bottom: -24, left: 24`). `width: 96, height: 96`, `borderRadius: 48`. Une bordure blanche de `borderWidth: 4` sépare l'avatar de la bannière.
* **Champs de saisie (Inputs/TextAreas) :**
  * `borderRadius: 16` (`rounded-2xl`).
  * `borderWidth: 2`, `borderColor: '#e4e4e7'`. Focus condition : `borderColor: '#39FF14'`.
  * `backgroundColor: '#FFFFFF'` (ou `#fafafa` pour Zinc-50).
  * `padding: 16`.
* **Illustration NXA (Halo Néon) :**
  * L'image centrale de l'avatar 3D utilise une ombre portée verte : `shadowColor: '#39FF14', shadowOpacity: 0.5, shadowRadius: 25`.
  * Un arrière-plan lumineux pulse : `backgroundColor: 'rgba(57, 255, 20, 0.2)'`, `borderRadius: 9999`.

---

## 2. Gestion de l'État (State Management)

La page s'appuie principalement sur des états locaux React (`useState`) pour la gestion du formulaire, synchronisés avec les données globales de l'utilisateur (`clientProfile` et `user`).

### Hydratation Initiale
Lors de la récupération de l'utilisateur (`fetchProfile` ou équivalent à l'initialisation) :
* L'état `profileForm` (contenant `firstName`, `lastName`, `age`, `bio`, `startingWeight`, `currentWeight`, `goalWeight`, `height`, `waist`, `hips`, `avatar_url`, `cover_url`, réseaux sociaux) est initialisé.
* Le prénom et nom complet sont splittés depuis `full_name`.
* Les données de santé (poids, taille, etc.) proviennent de l'objet imbriqué `clientProfile.diagnostic_data`.

### Structure de l'état du formulaire (`profileForm`)
```javascript
const [profileForm, setProfileForm] = useState({
  firstName: "", lastName: "", age: "", bio: "",
  startingWeight: "", currentWeight: "", goalWeight: "",
  height: "", waist: "", hips: "",
  avatar_url: "", cover_url: "",
  instagram: "", facebook: "", twitter: ""
});
```

---

## 3. Interactions Base de Données (Supabase)

La sauvegarde du profil, déclenchée par la fonction `handleSaveProfile`, s'effectue en trois étapes clés pour éviter les erreurs d'écrasement (notamment sur la colonne JSONB de santé).

### A. Mise à jour de l'authentification
Mise à jour des métadonnées basiques (nom et avatar) dans Auth :
```javascript
await supabase.auth.updateUser({
  data: { full_name, avatar_url: profileForm.avatar_url }
});
```

### B. Mise à jour de la table `clients`
Mise à jour des informations publiques/profil.
* **Table :** `clients`
* **Condition :** `eq('id', clientProfile.id)`
* **Payload :**
```javascript
{
  full_name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
  bio: profileForm.bio,
  avatar_url: profileForm.avatar_url,
  cover_url: profileForm.cover_url,
  instagram: profileForm.instagram,
  facebook: profileForm.facebook,
  twitter: profileForm.twitter
}
```

### C. Fusion sécurisée des données de santé (`nutrition_profiles`)
Les données corporelles sont stockées dans la colonne JSONB `diagnostic_data`.
**Règle stricte :** Il faut *toujours* faire un spread (`...`) de l'ancien `diagnostic_data` avant d'écraser les nouvelles valeurs, sinon le métabolisme de base (BMR) et d'autres données vitales seront supprimés.

* **Table :** `nutrition_profiles`
* **Condition :** `eq('client_id', clientProfile.id)`
* **Payload complet (JSONB) :**
```javascript
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
```

---

## 4. Logiques Spécifiques à implémenter en Front-End

### A. Calcul et Affichage de l'IMC
Le front-end calcule automatiquement l'IMC à partir des données profilées (affiché dans le "Bottom Bento" sous le formulaire).
```javascript
const imcValue = clientProfile?.diagnostic_data ? (() => {
    const h = parseFloat(clientProfile.diagnostic_data.height) / 100;
    const w = parseFloat(clientProfile.diagnostic_data.currentWeight);
    if (!h || !w || h === 0) return '--';
    return (w / (h * h)).toFixed(1);
})() : '--';
```

### B. Badges d'Expérience (Gamification)
Les badges "Jongoma XP" (ou Score XP) se débloquent en fonction du total d'XP de l'utilisateur.
* **Variable d'XP cible :** `currentXP = clientProfile?.jongoma_xp || clientProfile?.nutrition_profiles?.jongoma_xp || 0`
* **Logique de validation :** `const unlocked = currentXP >= badge.xpReq`
* **Affichage conditionnel :**
  * Si `unlocked === false` : Superposer un layout d'opacité avec une icône Cadenas (`Lock`), et appliquer le filtre `grayscale opacity-40` sur l'image du badge.
  * Si `unlocked === true` : Affichage couleur complète avec fond doré/or (`bg-gradient-to-br from-yellow-50 to-orange-50`).

### C. Notifications Push & Rappels d'eau
Le paramétrage des notifications inclut une interface pour activer/désactiver les notifications Push, et un bouton "Tester" (`sendWaterReminderPush`) pour envoyer un message push immédiat de test pour le rappel d'hydratation.
En React Native, cela nécessitera l'intégration d'une librairie native type `expo-notifications` ou Firebase Cloud Messaging (FCM) pour relier ce toggle d'état aux permissions du téléphone.

---

**Note pour le développeur React Native :**
Lors du portage, les champs de type "URL" pour l'avatar (`avatar_url`) nécessiteront probablement un composant de type `ImagePicker` (Galerie du téléphone) qui uploade le fichier vers un Storage Supabase ("community-images" ou "avatars") et qui retourne l'URL publique, car saisir des URLs manuelles sur mobile n'est pas ergonomique.
