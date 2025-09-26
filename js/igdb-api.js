// IGDB API Integration - API réelle uniquement
// Documentation: https://api-docs.igdb.com/

class IGDBApi {
    constructor() {
        this.clientId = window.IGDB_CONFIG.clientId;
        this.clientSecret = window.IGDB_CONFIG.secret;
        this.accessToken = null;
        this.tokenExpiry = null;

        // Utiliser Vercel Edge Functions comme proxy CORS
        this.proxyUrl = 'https://api.allorigins.win/raw?url=';
        this.baseUrl = 'https://api.igdb.com/v4';
        this.tokenUrl = 'https://id.twitch.tv/oauth2/token';
    }

    // Obtenir un token d'accès Twitch (requis pour IGDB)
    async getAccessToken() {
        // Vérifier si le token actuel est encore valide
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        console.log('🔑 Demande de token Twitch pour IGDB...');

        try {
            // Construire l'URL avec les paramètres pour éviter CORS
            const tokenParams = new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials'
            });

            const response = await fetch(this.proxyUrl + encodeURIComponent(`${this.tokenUrl}?${tokenParams.toString()}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            // Définir l'expiration à 90% de la durée réelle pour être sûr
            this.tokenExpiry = Date.now() + (data.expires_in * 900);

            console.log('✅ Token IGDB obtenu avec succès');
            return this.accessToken;
        } catch (error) {
            console.error('❌ Erreur lors de l\'obtention du token IGDB:', error);
            throw error;
        }
    }

    // Effectuer une requête à l'API IGDB via un proxy personnalisé
    async makeRequest(endpoint, body) {
        const token = await this.getAccessToken();

        console.log(`🌐 Requête IGDB: ${endpoint}`);

        try {
            // Utiliser un proxy personnalisé qui permet les headers CORS
            const proxyUrl = 'https://cors-proxy.fringe.zone/';
            const targetUrl = `${this.baseUrl}/${endpoint}`;

            const response = await fetch(proxyUrl + targetUrl, {
                method: 'POST',
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                },
                body: body
            });

            if (!response.ok) {
                // Si le proxy échoue, essayer avec allorigins en mode simple
                console.warn(`⚠️ Proxy principal échoué, essai avec fallback...`);
                return await this.makeRequestFallback(endpoint, body, token);
            }

            const result = await response.json();
            console.log(`✅ Réponse IGDB reçue: ${Array.isArray(result) ? result.length + ' items' : 'données'}`);
            return result;
        } catch (error) {
            console.warn(`⚠️ Erreur proxy principal, essai avec fallback:`, error.message);
            return await this.makeRequestFallback(endpoint, body, token);
        }
    }

    // Méthode de fallback avec un proxy différent
    async makeRequestFallback(endpoint, body, token) {
        try {
            const targetUrl = `${this.baseUrl}/${endpoint}`;

            // Utiliser un proxy CORS simple
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: 'POST',
                    headers: {
                        'Client-ID': this.clientId,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    },
                    body: body
                })
            });

            if (!response.ok) {
                throw new Error(`Fallback proxy failed: ${response.status}`);
            }

            const data = await response.json();
            const result = JSON.parse(data.contents);

            console.log(`✅ Réponse IGDB reçue (fallback): ${Array.isArray(result) ? result.length + ' items' : 'données'}`);
            return result;
        } catch (error) {
            console.error('❌ Tous les proxies ont échoué:', error);
            throw error;
        }
    }

    // Rechercher des jeux via l'API IGDB réelle
    async searchGames(query, limit = 10) {
        if (!query || query.length < 2) return [];

        console.log(`🔍 Recherche IGDB pour: "${query}"`);

        const searchBody = `
            fields name, summary, cover, first_release_date, platforms.name,
                   rating, rating_count, screenshots.image_id, genres.name,
                   involved_companies.company.name, involved_companies.developer;
            search "${query}";
            limit ${limit};
        `;

        try {
            const games = await this.makeRequest('games', searchBody);
            return this.formatGamesData(games);
        } catch (error) {
            console.error('❌ Erreur lors de la recherche de jeux IGDB:', error);
            return [];
        }
    }

    // Formater les données des jeux pour correspondre au format attendu
    formatGamesData(games) {
        if (!Array.isArray(games)) return [];

        return games.map(game => ({
            id: `igdb_${game.id}`,
            name: game.name || 'Titre inconnu',
            summary: game.summary || '',
            background_image: '',  // Les images seront gérées par l'endpoint /covers séparément
            released: game.first_release_date
                ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
                : null,
            rating: Math.round((game.rating || 0) * 10) / 10, // IGDB rating est sur 100, on la garde
            rating_count: game.rating_count || 0,
            platforms: game.platforms ? game.platforms.map(p => p.name) : [],
            genres: game.genres ? game.genres.map(g => g.name) : [],
            screenshots: game.screenshots ? game.screenshots.map(s =>
                `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${s.image_id}.jpg`
            ) : [],
            developers: game.involved_companies
                ? game.involved_companies
                    .filter(ic => ic.developer && ic.company)
                    .map(ic => ic.company.name)
                : []
        }));
    }

    // Recherche avancée avec plusieurs stratégies IGDB
    async advancedSearch(query) {
        try {
            console.log(`🎯 Recherche avancée IGDB pour: "${query}"`);

            // Stratégie 1: Recherche principale
            let results = await this.searchGames(query, 8);

            // Stratégie 2: Si peu de résultats, essayer avec des mots-clés individuels
            if (results.length < 3) {
                const words = query.split(' ').filter(word => word.length > 2);
                const additionalResults = new Set();

                for (const word of words) {
                    const wordResults = await this.searchGames(word, 5);
                    wordResults.forEach(game => {
                        // Ajouter seulement si pas déjà dans les résultats principaux
                        if (!results.find(r => r.id === game.id)) {
                            additionalResults.add(JSON.stringify(game));
                        }
                    });
                }

                // Ajouter les résultats supplémentaires
                Array.from(additionalResults).forEach(gameStr => {
                    results.push(JSON.parse(gameStr));
                });
            }

            // Stratégie 3: Recherche large si toujours insuffisant
            if (results.length < 5) {
                const broadSearchBody = `
                    fields name, summary, cover, first_release_date, platforms.name,
                           rating, rating_count, screenshots.image_id, genres.name,
                           involved_companies.company.name, involved_companies.developer;
                    where name ~ *"${query}"*;
                    limit 10;
                `;

                try {
                    const broadResults = await this.makeRequest('games', broadSearchBody);
                    const formattedBroad = this.formatGamesData(broadResults);

                    formattedBroad.forEach(game => {
                        if (!results.find(r => r.id === game.id)) {
                            results.push(game);
                        }
                    });
                } catch (broadError) {
                    console.warn('⚠️ Recherche large échouée:', broadError.message);
                }
            }

            // Trier les résultats par pertinence
            results.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const queryLower = query.toLowerCase();

                // Match exact prioritaire
                const aExact = aName === queryLower;
                const bExact = bName === queryLower;
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                // Match qui commence par la requête
                const aStarts = aName.startsWith(queryLower);
                const bStarts = bName.startsWith(queryLower);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                // Trier par rating et nombre de votes
                const aScore = (a.rating || 0) + (a.rating_count ? Math.log(a.rating_count) : 0);
                const bScore = (b.rating || 0) + (b.rating_count ? Math.log(b.rating_count) : 0);
                return bScore - aScore;
            });

            return results.slice(0, 15);
        } catch (error) {
            console.error('❌ Erreur lors de la recherche avancée IGDB:', error);
            return [];
        }
    }
}

// Instance globale
window.igdbApi = new IGDBApi();