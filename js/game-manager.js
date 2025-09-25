// Variables globales
let games = {};
let gameIdCounter = 6;
let editingGame = null;
let selectedGame = null;
let selectedPlatform = null;
let lastSearchResults = [];

// Fonctions de sauvegarde et chargement
function saveData() {
    try {
        const dataToSave = {
            games: games,
            gameIdCounter: gameIdCounter,
            sectionOrder: sectionOrder,
            sectionsLocked: sectionsLocked,
            minimizedSections: Array.from(minimizedSections),
            currentTheme: currentTheme,
            isCompactView: isCompactView
        };
        localStorage.setItem('souls-like-tracker', JSON.stringify(dataToSave));
        console.log('📱 Données sauvegardées localement');
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde locale:', error);
    }
}

// Sauvegarde hybride (local + cloud)
async function saveData() {
    const dataToSave = {
        games: games,
        gameIdCounter: gameIdCounter,
        sectionOrder: sectionOrder,
        sectionsLocked: sectionsLocked,
        minimizedSections: Array.from(minimizedSections),
        currentTheme: currentTheme,
        isCompactView: isCompactView
    };

    // Toujours sauvegarder localement
    saveData();

    // Tenter la sauvegarde cloud si Firebase est configuré
    if (firebase_initialized && typeof saveToFirestore === 'function') {
        try {
            await saveToFirestore(dataToSave);
        } catch (error) {
            console.log('⚠️ Sauvegarde cloud échouée, données sauvées localement uniquement');
        }
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('souls-like-tracker');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            return parsedData;
        }
        return null;
    } catch (error) {
        console.error('❌ Erreur lors du chargement local:', error);
        return null;
    }
}

// Chargement hybride (cloud + local avec fallback)
async function loadData() {
    try {
        let loadedData = null;

        // Tenter de charger depuis le cloud d'abord
        if (firebase_initialized && typeof loadFromFirestore === 'function') {
            try {
                loadedData = await loadFromFirestore();
                if (loadedData) {
                    console.log('☁️ Données chargées depuis le cloud');
                }
            } catch (error) {
                console.log('⚠️ Chargement cloud échoué, tentative locale...');
            }
        }

        // Fallback sur le localStorage si pas de données cloud
        if (!loadedData) {
            loadedData = loadFromLocalStorage();
            if (loadedData) {
                console.log('📱 Données chargées depuis le stockage local');
            }
        }

        // Appliquer les données chargées ou utiliser les données par défaut
        if (loadedData) {
            games = loadedData.games || defaultGames;
            gameIdCounter = loadedData.gameIdCounter || 6;
            sectionOrder = loadedData.sectionOrder || ['not-played', 'currently-playing', 'finished', 'next-to-play'];
            sectionsLocked = loadedData.sectionsLocked || false;
            minimizedSections = new Set(loadedData.minimizedSections || []);
            currentTheme = loadedData.currentTheme || 'steam';
            isCompactView = loadedData.isCompactView || false;
        } else {
            // Première visite, utiliser les données par défaut
            games = JSON.parse(JSON.stringify(defaultGames));
            gameIdCounter = 6;
            sectionOrder = ['not-played', 'currently-playing', 'finished', 'next-to-play'];
            sectionsLocked = false;
            minimizedSections = new Set();
            currentTheme = 'steam';
            isCompactView = false;
            console.log('🆕 Première visite, utilisation des données par défaut');
        }

    } catch (error) {
        console.error('❌ Erreur critique lors du chargement:', error);
        // En cas d'erreur critique, utiliser les données par défaut
        games = JSON.parse(JSON.stringify(defaultGames));
        gameIdCounter = 6;
        sectionOrder = ['not-played', 'currently-playing', 'finished', 'next-to-play'];
        sectionsLocked = false;
        minimizedSections = new Set();
        currentTheme = 'steam';
        isCompactView = false;
    }
}

// Fonction pour rechercher automatiquement une image basée sur le titre
function findGameImage(title) {
    if (!title) return '';

    // Normaliser le titre pour la recherche (minuscules, suppression caractères spéciaux)
    const normalizedTitle = title.toLowerCase()
        .replace(/[®™©]/g, '') // Supprimer les marques commerciales
        .replace(/:\s*/, ' ') // Remplacer : par espace
        .replace(/\s+/g, ' ') // Remplacer espaces multiples par un seul
        .trim();

    // Recherche directe
    if (gameImages[normalizedTitle]) {
        return gameImages[normalizedTitle];
    }

    // Recherche partielle - chercher si le titre contient un des jeux de la base
    for (const [gameName, imageUrl] of Object.entries(gameImages)) {
        if (normalizedTitle.includes(gameName) || gameName.includes(normalizedTitle)) {
            return imageUrl;
        }
    }

    // Recherche par mots-clés
    const keywords = normalizedTitle.split(' ');
    for (const [gameName, imageUrl] of Object.entries(gameImages)) {
        const gameWords = gameName.split(' ');
        const matchCount = keywords.filter(keyword =>
            gameWords.some(gameWord => gameWord.includes(keyword) || keyword.includes(gameWord))
        ).length;

        // Si au moins 60% des mots correspondent
        if (matchCount >= Math.ceil(keywords.length * 0.6) && matchCount >= 1) {
            return imageUrl;
        }
    }

    return ''; // Aucune image trouvée
}

// Fonction pour mettre à jour automatiquement l'image quand le titre change
function autoFillImage() {
    const titleInput = document.getElementById('gameTitle');
    const imageInput = document.getElementById('gameImage');

    if (titleInput && imageInput && titleInput.value.trim()) {
        const foundImage = findGameImage(titleInput.value.trim());
        if (foundImage && !imageInput.value.trim()) {
            imageInput.value = foundImage;
            // Ajouter un feedback visuel
            imageInput.style.borderColor = '#28a745';
            setTimeout(() => {
                imageInput.style.borderColor = '';
            }, 1000);
        }
    }
}

// Fonction pour lancer un jeu
function launchGame(launchUrl) {
    if (!launchUrl) {
        alert('Aucune URL de lancement configurée pour ce jeu.');
        return;
    }

    // Vérifier si c'est un chemin local (non supporté)
    if (launchUrl.includes(':\\') || launchUrl.includes('.exe')) {
        alert('❌ Les chemins locaux (.exe) ne sont pas supportés dans les navigateurs.\n\n✅ Utilisez plutôt :\n• steam://run/[AppID]\n• epic://launch/[ProductId]\n• URL web du store\n\nTrouvez l\'App ID sur SteamDB.info');
        return;
    }

    try {
        // Ouvrir l'URL dans un nouvel onglet/fenêtre
        window.open(launchUrl, '_blank');
        console.log(`Lancement du jeu: ${launchUrl}`);

        // Message informatif selon le type d'URL
        if (launchUrl.startsWith('steam://')) {
            console.log('Steam devrait s\'ouvrir et lancer le jeu...');
        } else if (launchUrl.startsWith('epic://')) {
            console.log('Epic Games Launcher devrait s\'ouvrir...');
        } else {
            console.log('Ouverture de la page du jeu dans le navigateur...');
        }
    } catch (error) {
        console.error('Erreur lors du lancement du jeu:', error);
        alert('Impossible de lancer le jeu. Vérifiez que Steam ou le client approprié est installé.');
    }
}

// Fonctions de déplacement des jeux
function moveGame(gameId, targetCategory) {
    let game = null;
    let sourceCategory = null;

    // Trouver le jeu et sa catégorie source
    Object.keys(games).forEach(category => {
        const gameIndex = games[category].findIndex(g => g.id === gameId);
        if (gameIndex !== -1) {
            game = games[category][gameIndex];
            sourceCategory = category;
            games[category].splice(gameIndex, 1);
        }
    });

    if (game && sourceCategory !== targetCategory) {
        games[targetCategory].push(game);
        renderCategory(sourceCategory);
        renderCategory(targetCategory);
        saveData();
    }
}

function moveGameWithinCategory(gameId, targetCategory, newIndex) {
    let game = null;
    let sourceCategory = null;
    let sourceIndex = -1;

    // Trouver le jeu et sa catégorie source
    Object.keys(games).forEach(category => {
        const gameIndex = games[category].findIndex(g => g.id === gameId);
        if (gameIndex !== -1) {
            game = games[category][gameIndex];
            sourceCategory = category;
            sourceIndex = gameIndex;
        }
    });

    if (game && sourceCategory === targetCategory) {
        // Déplacer dans la même catégorie
        games[sourceCategory].splice(sourceIndex, 1);

        // Ajuster l'index si nécessaire
        let insertIndex = newIndex;
        if (sourceIndex < newIndex) {
            insertIndex = newIndex - 1;
        }

        games[targetCategory].splice(insertIndex, 0, game);
        renderCategory(targetCategory);
        saveData();
    } else if (game && sourceCategory !== targetCategory) {
        // Déplacer vers une catégorie différente
        games[sourceCategory].splice(sourceIndex, 1);
        games[targetCategory].splice(newIndex, 0, game);
        renderCategory(sourceCategory);
        renderCategory(targetCategory);
        saveData();
    }
}

// Fonction pour éditer un jeu
function editGame(gameId) {
    // Trouver le jeu et sa catégorie
    let game = null;
    let category = null;

    Object.keys(games).forEach(cat => {
        const foundGame = games[cat].find(g => g.id === gameId);
        if (foundGame) {
            game = foundGame;
            category = cat;
        }
    });

    if (game) {
        editingGame = { id: gameId, category: category };
        currentCategory = category;

        // IMPORTANT: Réinitialiser selectedGame pour éviter les conflits
        selectedGame = null;

        // Masquer l'autocomplétion si elle est ouverte
        hideAutocomplete();

        // DEBUG: Vérifier les données du jeu
        console.log('🔍 Données du jeu à éditer:', {
            id: game.id,
            title: game.title,
            subtitle: game.subtitle,
            image: game.image,
            launchUrl: game.launchUrl,
            fullGame: game
        });

        // Remplir le formulaire avec les données existantes
        document.getElementById('modalTitle').textContent = 'Modifier le jeu';

        const titleInput = document.getElementById('gameTitle');
        const subtitleInput = document.getElementById('gameSubtitle');
        const imageInput = document.getElementById('gameImage');
        const launchUrlInput = document.getElementById('gameLaunchUrl');

        // Vérifier que les éléments existent
        if (!titleInput || !subtitleInput || !imageInput || !launchUrlInput) {
            console.error('❌ Éléments du formulaire introuvables!');
            return;
        }

        // Afficher le modal d'abord
        document.getElementById('gameModal').style.display = 'flex';

        // Masquer la section d'autocomplétion et afficher le formulaire manuel
        const searchSection = document.getElementById('gameSearchSection');
        if (searchSection) {
            searchSection.style.display = 'none';
        }

        const selectedGameInfo = document.getElementById('selectedGameInfo');
        if (selectedGameInfo) {
            selectedGameInfo.style.display = 'none';
        }

        const manualEditForm = document.getElementById('manualEditForm');
        if (manualEditForm) {
            manualEditForm.style.display = 'block';
        }

        // Utiliser setTimeout pour s'assurer que le DOM est mis à jour
        setTimeout(() => {
            // Remplir les champs du formulaire manuel
            titleInput.value = game.title || '';
            subtitleInput.value = game.subtitle || '';
            imageInput.value = game.image || '';
            launchUrlInput.value = game.launchUrl || '';

            // Détecter et sélectionner la plateforme actuelle
            const platformSelect = document.getElementById('gamePlatform');
            if (platformSelect && game.platform) {
                platformSelect.value = game.platform;
            } else if (platformSelect) {
                platformSelect.value = 'Steam'; // Par défaut
            }

            console.log('✅ Formulaire d\'édition rempli:', {
                title: titleInput.value,
                subtitle: subtitleInput.value,
                image: imageInput.value,
                launchUrl: launchUrlInput.value,
                platform: platformSelect.value
            });

            // Ajouter les écouteurs d'événements
            titleInput.addEventListener('blur', autoFillImage);
            titleInput.addEventListener('input', debounce(autoFillImage, 500));

            // Mettre à jour l'URL quand le titre change
            titleInput.addEventListener('input', debounce(updateLaunchUrl, 500));

            // Écouteur pour la plateforme
            platformSelect.addEventListener('change', function() {
                updateLaunchUrl();
            });

            // Activer le bouton de sauvegarde en mode édition
            const saveButton = document.getElementById('saveButton');
            if (saveButton) {
                saveButton.disabled = false;
            }

            console.log('🎮 Mode édition activé pour:', game.title);
            titleInput.focus();
        }, 100);
    }
}

// Fonction pour supprimer un jeu
function deleteGame(gameId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce jeu ?')) {
        Object.keys(games).forEach(category => {
            const gameIndex = games[category].findIndex(g => g.id === gameId);
            if (gameIndex !== -1) {
                games[category].splice(gameIndex, 1);
                renderCategory(category);
                saveData();
            }
        });
    }
}

// Fonction pour sauvegarder un jeu
function saveGame() {
    const title = document.getElementById('gameTitle').value.trim();
    const subtitle = document.getElementById('gameSubtitle').value.trim();
    let image = document.getElementById('gameImage').value.trim();
    const launchUrl = document.getElementById('gameLaunchUrl').value.trim();

    // En mode édition, utiliser le sélecteur du formulaire
    // En mode ajout, utiliser la plateforme sélectionnée depuis l'autocomplétion
    const platform = editingGame
        ? (document.getElementById('gamePlatform')?.value || 'Steam')
        : (selectedPlatform || 'Steam');

    // Si aucune image n'est fournie, essayer de la trouver automatiquement
    if (!image && title) {
        image = findGameImage(title);
    }

    if (title) {
        if (editingGame) {
            // Mode édition : mettre à jour le jeu existant
            const game = games[editingGame.category].find(g => g.id === editingGame.id);
            if (game) {
                game.title = title;
                game.subtitle = subtitle || 'No subtitle';
                game.image = image || '';
                game.launchUrl = launchUrl || '';
                game.platform = platform || 'Steam';
                renderCategory(editingGame.category);
                saveData();
            }
        } else {
            // Mode ajout : créer un nouveau jeu
            const newGame = {
                id: gameIdCounter++,
                title: title,
                subtitle: subtitle || 'No subtitle',
                image: image || '',
                launchUrl: launchUrl || '',
                platform: platform || 'Steam'
            };

            games[currentCategory].push(newGame);
            renderCategory(currentCategory);
            saveData();
        }

        closeModal();
    }
}

// Base de données élargie des App IDs Steam
function getSteamAppId(gameName) {
    const steamAppIds = {
        // === SOULS-LIKE ===
        'dark souls': '211420',
        'dark souls ii': '236430',
        'dark souls iii': '374320',
        'elden ring': '1245620',
        'sekiro': '814380',
        'sekiro shadows die twice': '814380',
        'bloodborne': null, // PlayStation exclusive
        'hollow knight': '367520',
        'lies of p': '1627720',
        'blasphemous': '1350760',
        'blasphemous 2': '2114740',
        'salt and sanctuary': '283640',
        'nioh': '485510',
        'nioh 2': '1325200',

        // === ACTION/ADVENTURE ===
        'the witcher 3': '292030',
        'witcher 3': '292030',
        'god of war': '1593500',
        'red dead redemption 2': '1174180',
        'cyberpunk 2077': '1091500',
        'assassins creed valhalla': '2208920',

        // === SHOOTERS ===
        'call of duty modern warfare ii': '1938090',
        'valorant': null, // Riot launcher only
        'overwatch 2': null, // Battle.net only
        'counter-strike 2': '730',
        'cs2': '730',
        'apex legends': '1172470',

        // === INDIE ===
        'hades': '1145360',
        'celeste': '504230',
        'dead cells': '588650',
        'stardew valley': '413150',
        'among us': '945360',
        'subnautica': '264710',
        'the forest': '242760',
        'ori and the will of the wisps': '1057090',
        'pizza tower': '1748720',
        'a hat in time': '253230',

        // === HORROR ===
        'resident evil 4': '2050650',
        'dead space': '1693980',
        'phasmophobia': '739630',

        // === STRATEGY ===
        'civilization vi': '289070',
        'total war warhammer iii': '1142710',
        'age of empires iv': '1466860',

        // === RACING ===
        'forza horizon 5': '1551360',

        // === SPORTS ===
        'rocket league': '252950',
        'fifa 24': '2195250',
        'nba 2k24': '2338770',

        // === FIGHTING ===
        'street fighter 6': '1364780',
        'tekken 8': '1778820',
        'mortal kombat 1': '1971870',

        // === PUZZLE ===
        'portal 2': '620',
        'tetris effect': '1003590',
        'fall guys': '1097150',

        // === CLASSICS ===
        'grand theft auto san andreas': '12120',
        'gta san andreas': '12120',
        'half-life 2': '220',
        'mass effect legendary edition': '1328670',
        'diablo ii resurrected': '1666780',

        // === SIMULATION ===
        'microsoft flight simulator': '1250410',
        'cities skylines': '255710',
        'the sims 4': '1222670',

        // === POPULAIRES ===
        'terraria': '105600',
        'minecraft': null, // Minecraft Launcher
        'fortnite': null, // Epic Games only
        'league of legends': null, // Riot launcher
        'roblox': null // Roblox launcher
    };

    // Normalisation plus flexible
    const normalized = gameName.toLowerCase()
        .replace(/[®™©:]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Recherche exacte d'abord
    if (steamAppIds[normalized]) {
        return steamAppIds[normalized];
    }

    // Recherche partielle pour les variantes
    for (const [key, appId] of Object.entries(steamAppIds)) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return appId;
        }
    }

    return null;
}

// Fonction globale pour générer l'URL de lancement
function generateLaunchUrl(gameName, platform) {
    const platformData = platformMappings[platform];
    if (!platformData || !platformData.launchPrefix) return '';

    const normalizedName = gameName.toLowerCase().replace(/[®™©:\s]/g, '');

    switch (platform) {
        case 'Steam':
            // Essayer de trouver l'App ID Steam connu
            const steamAppId = getSteamAppId(gameName);
            if (steamAppId) {
                return `steam://run/${steamAppId}`;
            } else {
                // Si pas trouvé, laisser l'utilisateur saisir l'App ID manuellement
                return `steam://run/[ENTRER_APP_ID_ICI]`;
            }

        case 'Epic Games':
            return `com.epicgames.launcher://apps/${normalizedName}?action=launch&silent=true`;

        case 'GOG':
            return `goggalaxy://openGameView/${normalizedName}`;

        case 'Battle.net':
            // Pour Blizzard games
            const blizzardGames = {
                'worldofwarcraft': 'wow',
                'wow': 'wow',
                'diablo': 'diablo4',
                'overwatch': 'pro',
                'hearthstone': 'hearthstone',
                'starcraft': 's1'
            };
            const gameKey = Object.keys(blizzardGames).find(key => normalizedName.includes(key));
            return gameKey ? `battlenet://${blizzardGames[gameKey]}` : '';

        case 'Ubisoft Connect':
            return `uplay://launch/0/${normalizedName}`;

        case 'Origin/EA':
            return `origin://launchgame/${normalizedName}`;

        case 'PC Standalone':
            return ''; // L'utilisateur devra saisir le chemin manuel

        default:
            return platformData.launchPrefix + normalizedName;
    }
}

// Fonction globale pour mettre à jour l'URL de lancement
function updateLaunchUrl() {
    const titleInput = document.getElementById('gameTitle');
    const platformSelect = document.getElementById('gamePlatform');
    const launchUrlInput = document.getElementById('gameLaunchUrl');

    if (!titleInput || !platformSelect || !launchUrlInput) return;

    const gameName = titleInput.value.trim();
    const selectedPlatform = platformSelect.value;

    if (gameName && selectedPlatform) {
        const newLaunchUrl = generateLaunchUrl(gameName, selectedPlatform);
        launchUrlInput.value = newLaunchUrl;

        console.log('🔗 URL mise à jour:', {
            game: gameName,
            platform: selectedPlatform,
            url: newLaunchUrl
        });
    }
}