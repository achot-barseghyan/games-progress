// Template pour la configuration Firebase
// 1. Copie ce fichier vers .env.js
// 2. Remplace les valeurs par tes vraies clés Firebase
// 3. Le fichier .env.js ne sera pas commité (sécurité)

window.FIREBASE_CONFIG = {
    apiKey: "AIzaSy...", // Obtenir depuis Firebase Console
    authDomain: "mon-projet.firebaseapp.com",
    projectId: "mon-projet",
    storageBucket: "mon-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef..."
};

// Activer/désactiver Firebase
// true = utilise Firebase pour la sync cloud
// false = utilise seulement localStorage (mode hors ligne)
window.FIREBASE_ENABLED = true;