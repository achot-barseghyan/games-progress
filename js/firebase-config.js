// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = window.FIREBASE_CONFIG || {
    // Fallback par défaut (non fonctionnel)
    apiKey: "CONFIGURE_YOUR_FIREBASE_CONFIG_IN_.env.js",
    authDomain: "CONFIGURE_YOUR_FIREBASE_CONFIG_IN_.env.js",
    projectId: "CONFIGURE_YOUR_FIREBASE_CONFIG_IN_.env.js",
    storageBucket: "CONFIGURE_YOUR_FIREBASE_CONFIG_IN_.env.js",
    messagingSenderId: "CONFIGURE_YOUR_FIREBASE_CONFIG_IN_.env.js",
    appId: "CONFIGURE_YOUR_FIREBASE_CONFIG_IN_.env.js"
};

// Variables globales Firebase
let firebase_initialized = false;
let db = null;

// Initialisation Firebase
function initFirebase() {
    try {
        // Vérifier si Firebase est désactivé
        if (window.FIREBASE_ENABLED === false) {
            console.log("🔒 Firebase désactivé via .env.js");
            return false;
        }

        // Vérifier si la config est celle par défaut (pas configurée)
        if (firebaseConfig.apiKey.includes("CONFIGURE_YOUR_FIREBASE")) {
            console.log("⚙️ Firebase non configuré - modifiez .env.js avec vos vraies clés");
            return false;
        }

        if (!firebase_initialized && typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebase_initialized = true;
            console.log("🔥 Firebase initialisé avec succès");
            console.log("🔐 Configuration chargée depuis .env.js (sécurisé)");
            return true;
        }
    } catch (error) {
        console.warn("⚠️ Firebase non configuré:", error.message);
        return false;
    }
    return firebase_initialized;
}

// Fonctions de sauvegarde et chargement Firestore
async function saveToFirestore(data) {
    if (!firebase_initialized || !db) {
        console.log("📦 Firebase non configuré, utilisation du localStorage");
        return false;
    }

    try {
        const userDoc = db.collection('game-libraries').doc('user-data');
        await userDoc.set({
            games: data,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("☁️ Données sauvegardées sur Firestore");
        return true;
    } catch (error) {
        console.error("❌ Erreur sauvegarde Firestore:", error);
        return false;
    }
}

async function loadFromFirestore() {
    if (!firebase_initialized || !db) {
        console.log("📦 Firebase non configuré, utilisation du localStorage");
        return null;
    }

    try {
        const userDoc = await db.collection('game-libraries').doc('user-data').get();
        if (userDoc.exists) {
            const data = userDoc.data();
            console.log("☁️ Données chargées depuis Firestore");
            return data.games;
        }
        console.log("📂 Aucune données trouvées sur Firestore");
        return null;
    } catch (error) {
        console.error("❌ Erreur chargement Firestore:", error);
        return null;
    }
}

// Synchronisation bidirectionnelle
async function syncData() {
    if (!firebase_initialized) {
        return false;
    }

    try {
        // Charger les données locales
        const localData = loadFromLocalStorage();

        // Charger les données cloud
        const cloudData = await loadFromFirestore();

        if (!cloudData) {
            // Pas de données cloud, sauvegarder les données locales
            if (localData && Object.keys(localData).length > 0) {
                await saveToFirestore(localData);
                console.log("⬆️ Données locales sauvegardées vers le cloud");
            }
            return true;
        }

        if (!localData || Object.keys(localData).length === 0) {
            // Pas de données locales, utiliser les données cloud
            saveToLocalStorage(cloudData);
            console.log("⬇️ Données cloud chargées localement");
            return true;
        }

        // Les deux existent - pour simplicité, on privilégie les données cloud
        // Dans une vraie app, on comparerait les timestamps
        saveToLocalStorage(cloudData);
        console.log("🔄 Synchronisation: données cloud utilisées");
        return true;

    } catch (error) {
        console.error("❌ Erreur de synchronisation:", error);
        return false;
    }
}