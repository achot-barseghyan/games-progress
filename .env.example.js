// Template pour la configuration Firebase et Steam
// 1. Copie ce fichier vers config.js
// 2. Remplace les valeurs par tes vraies clés
// 3. Le fichier config.js contient tes secrets et ne sera PAS commité sur GitHub

// Configuration Firebase
window.FIREBASE_CONFIG = {
    apiKey: "AIzaSy...", // Obtenir depuis Firebase Console
    authDomain: "mon-projet.firebaseapp.com",
    projectId: "mon-projet",
    storageBucket: "mon-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef..."
};

// Configuration IGDB (pour la recherche de jeux)
window.IGDB_CONFIG = {
    clientId: "ton_client_id_igdb",
    secret: "ton_secret_igdb"
}

// Configuration Steam API (pour les heures de jeu)
window.STEAM_CONFIG = {
    apiKey: "TON_STEAM_API_KEY", // Obtenir depuis https://steamcommunity.com/dev/apikey
    baseUrl: "https://api.steampowered.com"
}

// Activer/désactiver Firebase
// true = utilise Firebase pour la sync cloud
// false = utilise seulement localStorage (mode hors ligne)
window.FIREBASE_ENABLED = true;