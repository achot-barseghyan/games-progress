// Solution alternative : Backend proxy Node.js simple pour Steam API
// Ce fichier peut être utilisé pour créer un proxy backend si nécessaire

const PROXY_SOLUTIONS = {
    // Solution 1: Utiliser un service backend personnel
    personalBackend: {
        name: "Backend personnel",
        url: "http://localhost:3000/api/steam/",
        description: "Créer un serveur Node.js local ou hébergé"
    },

    // Solution 2: Services proxy publics
    publicProxies: [
        {
            name: "AllOrigins",
            url: "https://api.allorigins.win/raw?url=",
            active: true
        },
        {
            name: "CORS Proxy",
            url: "https://corsproxy.io/?",
            active: true
        },
        {
            name: "CodeTabs Proxy",
            url: "https://api.codetabs.com/v1/proxy?quest=",
            active: true
        },
        {
            name: "CORS Anywhere",
            url: "https://cors-anywhere.herokuapp.com/",
            active: false,
            note: "Nécessite activation manuelle"
        }
    ],

    // Solution 3: Extension navigateur (pour développement local)
    browserExtension: {
        name: "CORS Unblock Extension",
        description: "Installer une extension pour désactiver CORS localement",
        chromeUrl: "https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino"
    }
};

// Fonction pour créer un simple serveur proxy Node.js
const NODE_PROXY_CODE = `
// server.js - Serveur proxy Steam simple
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Route proxy pour Steam API
app.get('/api/steam/*', async (req, res) => {
    try {
        const steamUrl = 'https://api.steampowered.com' + req.path.replace('/api/steam', '') + '?' + req.url.split('?')[1];

        const response = await fetch(steamUrl);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('🚀 Proxy Steam running on http://localhost:3000');
});
`;

// Instructions pour activer CORS Anywhere
const CORS_ANYWHERE_INSTRUCTIONS = `
Pour activer CORS Anywhere temporairement :

1. Visitez : https://cors-anywhere.herokuapp.com/corsdemo
2. Cliquez sur "Request temporary access to the demo server"
3. Attendez la confirmation
4. Retournez à l'application et testez à nouveau

Note: Cette solution est temporaire et pour développement uniquement.
`;

// Export des solutions
if (typeof window !== 'undefined') {
    window.STEAM_PROXY_SOLUTIONS = {
        PROXY_SOLUTIONS,
        NODE_PROXY_CODE,
        CORS_ANYWHERE_INSTRUCTIONS
    };
}

console.log('📋 Solutions proxy Steam chargées');