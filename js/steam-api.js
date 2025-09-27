// Steam Web API integration pour récupérer les heures de jeu
class SteamAPI {
    constructor() {
        this.apiKey = window.STEAM_CONFIG?.apiKey;
        this.baseUrl = window.STEAM_CONFIG?.baseUrl || "https://api.steampowered.com";
        // Alternatives de proxy CORS
        this.proxyUrls = [
            "https://api.allorigins.win/raw?url=",
            "https://corsproxy.io/?",
            "https://api.codetabs.com/v1/proxy?quest=",
            "https://cors-anywhere.herokuapp.com/"
        ];
        this.currentProxyIndex = 0;
        this.steamUserId = localStorage.getItem('steamUserId') || null;
    }

    // Définir l'ID Steam de l'utilisateur
    setSteamUserId(steamId) {
        this.steamUserId = steamId;
        localStorage.setItem('steamUserId', steamId);
        console.log('🔧 Steam User ID configuré:', steamId);
    }

    // Récupérer l'ID Steam utilisateur
    getSteamUserId() {
        return this.steamUserId;
    }

    // Vérifier si l'API Steam est configurée
    isConfigured() {
        return this.apiKey && this.steamUserId;
    }

    // Récupérer les jeux possédés par l'utilisateur avec retry sur différents proxies
    async getOwnedGames() {
        if (!this.isConfigured()) {
            throw new Error('Steam API non configurée. Veuillez configurer votre Steam ID.');
        }

        const steamApiUrl = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${this.steamUserId}&format=json&include_appinfo=true&include_played_free_games=true`;

        for (let i = 0; i < this.proxyUrls.length; i++) {
            const proxyUrl = this.proxyUrls[(this.currentProxyIndex + i) % this.proxyUrls.length];
            const url = proxyUrl + encodeURIComponent(steamApiUrl);

            try {
                console.log(`🔄 Tentative avec proxy ${i + 1}: ${proxyUrl.substring(0, 30)}...`);

                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.warn(`⚠️ Proxy ${i + 1} failed: ${response.status}`);
                    continue;
                }

                const data = await response.json();

                // Vérifier si la réponse est valide
                if (data && data.response) {
                    console.log(`✅ Proxy ${i + 1} réussi!`);
                    this.currentProxyIndex = (this.currentProxyIndex + i) % this.proxyUrls.length;
                    return data.response?.games || [];
                }

                // Si c'est allorigins, la réponse peut être dans data directement
                if (data && data.games) {
                    console.log(`✅ Proxy ${i + 1} réussi (format alternatif)!`);
                    this.currentProxyIndex = (this.currentProxyIndex + i) % this.proxyUrls.length;
                    return data.games;
                }

                console.warn(`⚠️ Proxy ${i + 1} - réponse invalide`);
            } catch (error) {
                console.warn(`⚠️ Proxy ${i + 1} erreur:`, error.message);
                continue;
            }
        }

        throw new Error('Tous les proxies CORS ont échoué. Problème de connectivité ou Steam API inaccessible.');
    }

    // Récupérer les heures de jeu pour un jeu spécifique par App ID
    async getGamePlaytime(appId) {
        if (!this.isConfigured()) {
            console.warn('⚠️ Steam API non configurée');
            return null;
        }

        try {
            const games = await this.getOwnedGames();
            const game = games.find(g => g.appid.toString() === appId.toString());

            if (game) {
                // Debug: Log raw data from Steam API
                console.log(`🔍 Raw Steam data for ${game.name}:`, {
                    playtime_forever_minutes: game.playtime_forever,
                    playtime_forever_hours: Math.round(game.playtime_forever / 60 * 10) / 10,
                    playtime_2weeks_minutes: game.playtime_2weeks,
                    last_played: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null,
                    full_game_object: game
                });

                return {
                    appId: game.appid,
                    name: game.name,
                    playtimeForever: Math.round(game.playtime_forever / 60 * 10) / 10, // Convertir minutes en heures avec 1 décimale
                    playtime2Weeks: game.playtime_2weeks ? Math.round(game.playtime_2weeks / 60 * 10) / 10 : 0,
                    lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null,
                    // Ajouter les données brutes pour debug
                    rawPlaytimeMinutes: game.playtime_forever,
                    rawPlaytime2WeeksMinutes: game.playtime_2weeks || 0
                };
            }

            return null;
        } catch (error) {
            console.error(`❌ Erreur lors de la récupération du temps de jeu pour l'App ID ${appId}:`, error);
            return null;
        }
    }

    // Récupérer les heures de jeu pour un jeu par nom (recherche dans les App IDs connus)
    async getGamePlaytimeByName(gameName) {
        const appId = this.getAppIdFromName(gameName);
        if (appId) {
            return await this.getGamePlaytime(appId);
        }
        return null;
    }

    // Extraire l'App ID depuis une URL Steam
    extractAppIdFromUrl(steamUrl) {
        if (!steamUrl || typeof steamUrl !== 'string') return null;

        // Formats supportés:
        // steam://run/1245620
        // https://store.steampowered.com/app/1245620/
        const steamRunMatch = steamUrl.match(/steam:\/\/run\/(\d+)/);
        if (steamRunMatch) {
            return steamRunMatch[1];
        }

        const storeUrlMatch = steamUrl.match(/\/app\/(\d+)/);
        if (storeUrlMatch) {
            return storeUrlMatch[1];
        }

        return null;
    }

    // Obtenir l'App ID depuis le nom du jeu (utilise la base de données existante)
    getAppIdFromName(gameName) {
        if (typeof getSteamAppId === 'function') {
            return getSteamAppId(gameName);
        }
        return null;
    }

    // Récupérer les informations Steam pour un jeu
    async getSteamInfoForGame(game) {
        if (!game) return null;

        let appId = null;

        // 1. Essayer d'extraire l'App ID depuis l'URL de lancement
        if (game.launchUrl) {
            appId = this.extractAppIdFromUrl(game.launchUrl);
        }

        // 2. Si pas d'App ID, essayer de le trouver par nom
        if (!appId && game.title) {
            appId = this.getAppIdFromName(game.title);
        }

        // 3. Si App ID trouvé, récupérer les heures de jeu
        if (appId) {
            const playtimeData = await this.getGamePlaytime(appId);
            return {
                appId: appId,
                playtime: playtimeData
            };
        }

        return null;
    }

    // Mettre à jour les heures de jeu pour tous les jeux Steam
    async updateAllGamesPlaytime(games) {
        if (!this.isConfigured()) {
            console.warn('⚠️ Steam API non configurée - impossible de récupérer les heures de jeu');
            return games;
        }

        console.log('🎮 Mise à jour des heures de jeu Steam...');

        for (const category of Object.keys(games)) {
            for (const game of games[category]) {
                // Seulement pour les jeux Steam
                if (game.platform === 'Steam' || (game.launchUrl && game.launchUrl.includes('steam://'))) {
                    try {
                        const steamInfo = await this.getSteamInfoForGame(game);
                        if (steamInfo && steamInfo.playtime) {
                            game.steamPlaytime = steamInfo.playtime.playtimeForever;
                            game.steamPlaytime2Weeks = steamInfo.playtime.playtime2Weeks;
                            game.steamLastPlayed = steamInfo.playtime.lastPlayed;
                            game.steamAppId = steamInfo.appId;

                            console.log(`✅ ${game.title}: ${game.steamPlaytime}h de jeu`);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Impossible de récupérer les heures pour ${game.title}:`, error.message);
                    }
                }
            }
        }

        return games;
    }

    // Valider un Steam ID
    static isValidSteamId(steamId) {
        // Steam ID 64-bit format: 17 digits commençant par 76561
        const steamId64Regex = /^765611\d{11}$/;
        return steamId64Regex.test(steamId);
    }

    // Convertir Steam ID vers Steam ID 64-bit si nécessaire
    static normalizeSteamId(steamId) {
        if (typeof steamId !== 'string') return null;

        // Si déjà au format 64-bit
        if (this.isValidSteamId(steamId)) {
            return steamId;
        }

        // Si format STEAM_X:Y:Z, convertir vers 64-bit
        const legacyMatch = steamId.match(/^STEAM_([0-5]):([01]):(\d+)$/);
        if (legacyMatch) {
            const universe = parseInt(legacyMatch[1]);
            const authServer = parseInt(legacyMatch[2]);
            const accountId = parseInt(legacyMatch[3]);

            // Formule de conversion vers Steam ID 64-bit
            const steamId64 = BigInt(76561197960265728) + BigInt(accountId * 2) + BigInt(authServer);
            return steamId64.toString();
        }

        return null;
    }
}

// Instance globale de l'API Steam
window.steamAPI = new SteamAPI();

// Fonction utilitaire pour formater les heures de jeu
function formatPlaytime(hours) {
    if (!hours || hours === 0) return "Aucune heure enregistrée";

    if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes} min`;
    }

    if (hours < 100) {
        return `${hours}h`;
    }

    return `${Math.round(hours)}h`;
}

// Fonction utilitaire pour obtenir la couleur selon les heures de jeu
function getPlaytimeColor(hours) {
    if (!hours || hours === 0) return '#666';
    if (hours < 10) return '#28a745';    // Vert pour < 10h
    if (hours < 50) return '#ffc107';    // Jaune pour 10-50h
    if (hours < 100) return '#fd7e14';   // Orange pour 50-100h
    return '#dc3545';                    // Rouge pour 100h+
}

console.log('🎮 Steam API module chargé');