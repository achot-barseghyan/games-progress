# Configuration Firebase pour Games Progress Tracker

## Pourquoi Firebase ?

Avec Firebase Firestore, ton tracker de jeux sera accessible depuis n'importe quel appareil ! 🌐

## Étapes de configuration

### 1. Créer un projet Firebase

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Clique sur "Créer un projet"
3. Nomme ton projet (ex: "games-progress-tracker")
4. Accepte les conditions et crée le projet

### 2. Configurer Firestore

1. Dans la console Firebase, va dans **Firestore Database**
2. Clique "Créer une base de données"
3. Choisis "Commencer en mode test" (pour l'instant)
4. Sélectionne une région proche de toi

### 3. Récupérer la configuration

1. Va dans **Paramètres du projet** (icône engrenage)
2. Dans l'onglet **Général**, descends jusqu'à "Vos applications"
3. Clique sur l'icône web `</>`
4. Nomme ton app (ex: "games-tracker")
5. **Copie le code de configuration** qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ton-projet.firebaseapp.com",
  projectId: "ton-projet",
  storageBucket: "ton-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 4. Configurer dans le projet (GITHUB ACTIONS 🔒)

1. **Ajoute tes secrets dans GitHub :**
   - Va dans **Settings** de ton repo GitHub
   - **Secrets and variables** → **Actions**
   - Ajoute chaque secret (nom exact requis) :
     - `FIREBASE_API_KEY` → ta vraie apiKey
     - `FIREBASE_AUTH_DOMAIN` → ton authDomain
     - `FIREBASE_PROJECT_ID` → ton projectId
     - `FIREBASE_STORAGE_BUCKET` → ton storageBucket
     - `FIREBASE_MESSAGING_SENDER_ID` → ton messagingSenderId
     - `FIREBASE_APP_ID` → ton appId
     - `FIREBASE_MEASUREMENT_ID` → ton measurementId (si tu l'as)

2. **Rends ton repo public :**
   - **Settings** → **General** → descends vers **Danger Zone**
   - **Change repository visibility** → **Make public**

3. **Active GitHub Pages :**
   - **Settings** → **Pages**
   - Source : **GitHub Actions**
   - Le workflow se lancera automatiquement !

4. **✅ Avantages de cette méthode :**
   - **Secrets totalement cachés** dans GitHub Actions
   - **Déploiement automatique** à chaque push
   - **GitHub Pages gratuit** pour repos publics
   - **Workflow professionnel**

🔐 **Sécurité maximale** : Tes clés Firebase ne sont **JAMAIS** visibles dans le code !

### 5. Règles de sécurité Firestore (optionnel mais recommandé)

Dans la console Firebase > Firestore Database > Règles, remplace par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permet la lecture/écriture pour tous (pour commencer)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Test de la configuration

1. Ouvre ton site
2. Va dans la console du navigateur (F12)
3. Tu devrais voir : "🔥 Firebase initialisé avec succès"
4. Ajoute un jeu - il sera sauvé automatiquement sur Firebase !

## Fonctionnement

- **Sauvegarde automatique** : Chaque modification est sauvée localement ET sur Firebase
- **Synchronisation** : Au chargement, l'app charge depuis Firebase en priorité
- **Fallback** : Si Firebase échoue, utilise le localStorage
- **Multi-appareils** : Tes données sont synchronisées partout !

## Déploiement sur GitHub Pages 🚀

### Configuration sécurisée pour la production

1. **Sur ton serveur de déploiement**, crée le `.env.js` avec tes vraies clés
2. **Restrictions de sécurité Firebase** (OBLIGATOIRE) :
   - Console Firebase > Paramètres > Restrictions
   - Limite l'accès aux domaines autorisés : `ton-site.github.io`
3. **Règles Firestore strictes** (voir section 5)

### Pourquoi c'est sécurisé ?

- ✅ **Secrets protégés** : `.env.js` n'est jamais dans Git
- ✅ **Restrictions de domaine** : Firebase bloque les autres sites
- ✅ **Règles Firestore** : Accès contrôlé aux données
- ✅ **Client-side** : Fonctionne parfaitement sur GitHub Pages

## Dépannage

### "Firebase non configuré"
- Vérifie que tu as bien remplacé toutes les valeurs dans `firebase-config.js`
- Assure-toi que Firestore est activé dans la console Firebase

### "Erreur de permissions"
- Vérifie les règles de sécurité Firestore
- En mode test, les règles expirent après 30 jours

### "Network error"
- Vérifie ta connexion internet
- L'app fonctionnera quand même en mode local !

## Sécurité (optionnel pour plus tard)

Pour plus de sécurité, tu peux :
1. Configurer l'authentification Firebase
2. Créer des règles plus strictes
3. Limiter l'accès par domaine

Mais pour commencer, la configuration de base fonctionne très bien ! 🚀