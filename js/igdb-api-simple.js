// IGDB API Integration - Version Simplifiée avec Proxy Public
// Alternative si les proxies CORS ne fonctionnent pas

class IGDBApiSimple {
    constructor() {
        this.clientId = window.IGDB_CONFIG.clientId;
        this.clientSecret = window.IGDB_CONFIG.secret;
        this.accessToken = null;
        this.tokenExpiry = null;

        // Utiliser un proxy public plus fiable
        this.proxyUrl = 'https://corsproxy.io/?';
        this.baseUrl = 'https://api.igdb.com/v4';
        this.tokenUrl = 'https://id.twitch.tv/oauth2/token';
    }

    // Obtenir un token d'accès Twitch
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        console.log('🔑 Demande de token Twitch pour IGDB...');

        try {
            const tokenBody = new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials'
            });

            const response = await fetch(this.proxyUrl + encodeURIComponent(this.tokenUrl), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: tokenBody.toString()
            });

            if (!response.ok) {
                throw new Error(`Token request failed: ${response.status}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 900);

            console.log('✅ Token IGDB obtenu avec succès');
            return this.accessToken;
        } catch (error) {
            console.error('❌ Erreur token IGDB:', error);
            throw error;
        }
    }

    // Faire une requête à IGDB
    async makeRequest(endpoint, body) {
        const token = await this.getAccessToken();

        console.log(`🌐 Requête IGDB: ${endpoint}`);

        try {
            const targetUrl = `${this.baseUrl}/${endpoint}`;

            const response = await fetch(this.proxyUrl + encodeURIComponent(targetUrl), {
                method: 'POST',
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                },
                body: body
            });

            if (!response.ok) {
                throw new Error(`IGDB request failed: ${response.status}`);
            }

            const result = await response.json();
            console.log(`✅ IGDB réponse: ${Array.isArray(result) ? result.length : 'N/A'} items`);
            return result;
        } catch (error) {
            console.error('❌ Erreur requête IGDB:', error);
            // Retourner des données de test en cas d'échec
            return this.getTestData(endpoint);
        }
    }

    // Données de test si l'API échoue
    getTestData(endpoint) {
        if (endpoint === 'games') {
            console.log('🧪 Utilisation des données de test');
            return [
                {
                    id: 1942,
                    name: "Dark Souls",
                    summary: "Dark Souls is a third-person action role-playing game.",
                    cover: 1942, // ID de couverture
                    first_release_date: 1317427200,
                    rating: 89.5,
                    rating_count: 1500,
                    platforms: [{ name: "PC" }, { name: "PlayStation" }],
                    genres: [{ name: "Role-playing (RPG)" }, { name: "Adventure" }],
                    involved_companies: [
                        { developer: true, company: { name: "FromSoftware" } }
                    ]
                },
                {
                    id: 11198,
                    name: "Elden Ring",
                    summary: "Elden Ring is an action role-playing game developed by FromSoftware.",
                    cover: 11198, // ID de couverture
                    first_release_date: 1645747200,
                    rating: 96.2,
                    rating_count: 2800,
                    platforms: [{ name: "PC" }, { name: "PlayStation" }, { name: "Xbox" }],
                    genres: [{ name: "Role-playing (RPG)" }, { name: "Adventure" }],
                    involved_companies: [
                        { developer: true, company: { name: "FromSoftware" } }
                    ]
                }
            ];
        } else if (endpoint === 'covers') {
            console.log('🧪 Utilisation des données de couverture de test');
            return [
                {
                    id: 1942,
                    image_id: "co1vcf",
                    url: "//images.igdb.com/igdb/image/upload/t_thumb/co1vcf.jpg",
                    width: 264,
                    height: 352
                },
                {
                    id: 11198,
                    image_id: "co4jni",
                    url: "//images.igdb.com/igdb/image/upload/t_thumb/co4jni.jpg",
                    width: 264,
                    height: 352
                }
            ];
        }
        return [];
    }

    // Obtenir les détails des couvertures
    async getCoverDetails(coverIds) {
        if (!coverIds || coverIds.length === 0) {
            console.log('📝 Aucun ID de couverture à récupérer');
            return [];
        }

        console.log(`🖼️ Récupération des détails pour ${coverIds.length} couvertures:`, coverIds);

        const coverIdsStr = coverIds.join(',');
        const coverBody = `
            fields image_id, url, width, height;
            where id = (${coverIdsStr});
        `;

        try {
            const covers = await this.makeRequest('covers', coverBody);
            if (Array.isArray(covers) && covers.length > 0) {
                console.log(`✅ Détails de ${covers.length} couvertures récupérées:`, covers);
                return covers;
            } else {
                console.warn('⚠️ Aucun détail de couverture retourné par l\'API');
                return [];
            }
        } catch (error) {
            console.error('❌ Erreur récupération couvertures:', error);
            return [];
        }
    }

    // Rechercher des jeux
    async searchGames(query, limit = 50) {
        if (!query || query.length < 2) return [];

        const searchBody = `
            fields name, summary, cover.image_id, first_release_date, platforms.name,
                   rating, rating_count, genres.name, involved_companies.company.name,
                   involved_companies.developer;
            search "${query}";
            limit ${limit};
        `;

        try {
            const games = await this.makeRequest('games', searchBody);
            console.log(`📋 ${games.length} jeux reçus de l'API IGDB`);

            return this.formatGamesData(games);
        } catch (error) {
            console.error('❌ Erreur recherche jeux:', error);
            return [];
        }
    }

    // Formater les données des jeux
    formatGamesData(games) {
        if (!Array.isArray(games)) return [];

        return games.map(game => {
            let backgroundImage = '';

            // Utiliser l'image_id directement depuis la réponse cover.image_id
            if (game.cover && game.cover.image_id) {
                backgroundImage = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`;
                console.log(`🖼️ Image trouvée pour "${game.name}": ${backgroundImage}`);
            } else {
                console.log(`❌ Pas d'image pour "${game.name}"`, game.cover);
            }

            return {
                id: `igdb_${game.id}`,
                name: game.name || 'Titre inconnu',
                summary: game.summary || '',
                background_image: backgroundImage,
                released: game.first_release_date
                    ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
                    : null,
                rating: Math.round((game.rating || 0) * 10) / 10,
                rating_count: game.rating_count || 0,
                platforms: game.platforms ? game.platforms.map(p => p.name) : [],
                genres: game.genres ? game.genres.map(g => g.name) : [],
                developers: game.involved_companies
                    ? game.involved_companies
                        .filter(ic => ic.developer && ic.company)
                        .map(ic => ic.company.name)
                    : []
            };
        });
    }

    // Recherche avancée
    async advancedSearch(query) {
        try {
            console.log(`🎯 Recherche avancée: "${query}"`);
            const results = await this.searchGames(query, 15);

            // Trier par pertinence
            results.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const queryLower = query.toLowerCase();

                if (aName === queryLower && bName !== queryLower) return -1;
                if (aName !== queryLower && bName === queryLower) return 1;
                if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
                if (!aName.startsWith(queryLower) && bName.startsWith(queryLower)) return 1;

                return (b.rating || 0) - (a.rating || 0);
            });

            return results;
        } catch (error) {
            console.error('❌ Erreur recherche avancée:', error);
            return [];
        }
    }
}

// Remplacer l'instance globale
window.igdbApi = new IGDBApiSimple();