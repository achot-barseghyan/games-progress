// Variables globales pour l'UI
let currentCategory = '';
let sectionOrder = ['not-played', 'currently-playing', 'finished', 'next-to-play'];
let sectionsLocked = false;
let minimizedSections = new Set();
let currentTheme = 'steam';
let isCompactView = false;
let searchTimeout = null;

// Fonction debounce pour limiter les appels
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fonctions de gestion des thèmes
function changeTheme() {
    const selector = document.getElementById('themeSelector');
    currentTheme = selector.value;
    applyTheme(currentTheme);
    saveData();
}

function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
}

function updateThemeSelector() {
    const selector = document.getElementById('themeSelector');
    if (selector) {
        selector.value = currentTheme;
    }
}

// Fonctions de gestion de la vue
function toggleView() {
    isCompactView = !isCompactView;
    applyViewMode();
    updateViewToggleButton();
    saveData();
}

function applyViewMode() {
    const gamesLists = document.querySelectorAll('.games-list');
    gamesLists.forEach(list => {
        if (isCompactView) {
            list.classList.add('compact');
        } else {
            list.classList.remove('compact');
        }
    });
}

function updateViewToggleButton() {
    const viewBtn = document.getElementById('viewToggleBtn');
    const viewIcon = viewBtn.querySelector('.view-icon');
    const viewText = viewBtn.querySelector('.view-text');

    if (isCompactView) {
        viewBtn.classList.add('compact');
        viewIcon.textContent = '📋';
        viewText.textContent = 'Vue Liste';
        viewBtn.title = 'Basculer vers vue cartes';
    } else {
        viewBtn.classList.remove('compact');
        viewIcon.textContent = '🗂️';
        viewText.textContent = 'Vue Cartes';
        viewBtn.title = 'Basculer vers vue liste';
    }
}

// Fonction pour basculer la minimisation d'une section
function toggleMinimize(categoryId) {
    const section = document.querySelector(`[data-category="${categoryId}"]`);
    const minimizeBtn = section.querySelector('.minimize-btn');

    if (minimizedSections.has(categoryId)) {
        // Maximiser
        minimizedSections.delete(categoryId);
        section.classList.remove('minimized');
        minimizeBtn.textContent = '−';
        minimizeBtn.title = 'Minimiser';
    } else {
        // Minimiser
        minimizedSections.add(categoryId);
        section.classList.add('minimized');
        minimizeBtn.textContent = '+';
        minimizeBtn.title = 'Maximiser';
    }

    saveData();
}

// Appliquer l'état de minimisation à toutes les sections
function applyMinimizedStates() {
    minimizedSections.forEach(categoryId => {
        const section = document.querySelector(`[data-category="${categoryId}"]`);
        const minimizeBtn = section.querySelector('.minimize-btn');
        if (section && minimizeBtn) {
            section.classList.add('minimized');
            minimizeBtn.textContent = '+';
            minimizeBtn.title = 'Maximiser';
        }
    });
}

// Fonction pour basculer le verrouillage des sections
function toggleSectionLock() {
    sectionsLocked = !sectionsLocked;
    updateLockUI();
    updateSectionDraggability();
    saveData();
}

// Mettre à jour l'interface du bouton de verrouillage
function updateLockUI() {
    const lockBtn = document.getElementById('lockToggleBtn');
    const lockIcon = lockBtn.querySelector('.lock-icon');
    const lockText = lockBtn.querySelector('.lock-text');

    if (sectionsLocked) {
        lockBtn.classList.add('locked');
        lockIcon.textContent = '🔒';
        lockText.textContent = 'Sections verrouillées';
    } else {
        lockBtn.classList.remove('locked');
        lockIcon.textContent = '🔓';
        lockText.textContent = 'Sections déplaçables';
    }
}

// Mettre à jour la capacité de déplacement des sections
function updateSectionDraggability() {
    const sections = document.querySelectorAll('.category');
    sections.forEach(section => {
        if (sectionsLocked) {
            section.draggable = false;
            section.classList.add('sections-locked');
        } else {
            section.draggable = true;
            section.classList.remove('sections-locked');
        }
    });
}

// Fonctions de rendu
function renderSections() {
    const container = document.getElementById('categories-container');
    const sections = sectionOrder.map(category => {
        return container.querySelector(`[data-category="${category}"]`);
    }).filter(section => section !== null);

    // Réorganiser les sections selon l'ordre sauvegardé
    sections.forEach(section => {
        container.appendChild(section);
    });
}

function renderAllGames() {
    Object.keys(games).forEach(category => {
        renderCategory(category);
    });
}

function renderCategory(category) {
    const container = document.getElementById(`${category}-list`);
    container.innerHTML = '';

    games[category].forEach(game => {
        const gameCard = createGameCard(game);
        container.appendChild(gameCard);
    });
}

function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.draggable = true;
    card.dataset.gameId = game.id;

    // Créer l'élément image avec gestion d'erreur avancée
    const imageElement = createImageElement(game);

    // Structure différente pour vue compacte vs normale
    if (isCompactView) {
        card.innerHTML = `
            ${imageElement}
            <div class="game-info">
                <div class="game-title">${game.title}</div>
                <div class="game-subtitle">${game.subtitle}</div>
            </div>
            <div class="game-card-actions">
                <button class="action-btn edit-btn" onclick="editGame(${game.id})" title="Modifier">✏️</button>
                <button class="action-btn delete-btn" onclick="deleteGame(${game.id})" title="Supprimer">🗑️</button>
            </div>
            ${game.launchUrl ? `<button class="play-btn" onclick="launchGame('${game.launchUrl}')" title="Lancer le jeu">▶ Play</button>` : ''}
        `;
    } else {
        card.innerHTML = `
            <div class="game-card-actions">
                <button class="action-btn edit-btn" onclick="editGame(${game.id})" title="Modifier">✏️</button>
                <button class="action-btn delete-btn" onclick="deleteGame(${game.id})" title="Supprimer">🗑️</button>
            </div>
            ${imageElement}
            <div class="game-title">${game.title}</div>
            <div class="game-subtitle">${game.subtitle}</div>
            ${game.launchUrl ? `<button class="play-btn" onclick="launchGame('${game.launchUrl}')" title="Lancer le jeu">▶ Play</button>` : ''}
        `;
    }

    // Double-clic pour éditer
    card.addEventListener('dblclick', function (e) {
        e.preventDefault();
        editGame(game.id);
    });

    return card;
}

function createImageElement(game) {
    // Si pas d'image ou image par défaut, créer un placeholder
    if (!game.image || game.image.includes('data:image/svg+xml')) {
        return `
            <div class="image-placeholder">
                <div class="game-icon">🎮</div>
                <div>${game.title}</div>
            </div>
        `;
    }

    // Sinon, essayer de charger l'image avec fallback
    return `
        <img src="${game.image}"
             alt="${game.title}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
             style="display: block;">
        <div class="image-placeholder" style="display: none;">
            <div class="game-icon">🎮</div>
            <div>${game.title}</div>
        </div>
    `;
}

// Fonction pour déplacer une section à une position
function moveSectionToPosition(categoryId, newIndex) {
    const currentIndex = sectionOrder.indexOf(categoryId);

    if (currentIndex !== -1 && currentIndex !== newIndex) {
        // Retirer la section de sa position actuelle
        sectionOrder.splice(currentIndex, 1);

        // Ajuster l'index si nécessaire
        let insertIndex = newIndex;
        if (currentIndex < newIndex) {
            insertIndex = newIndex - 1;
        }

        // Insérer à la nouvelle position
        sectionOrder.splice(insertIndex, 0, categoryId);

        // Re-rendre les sections et sauvegarder
        renderSections();
        saveData();
    }
}

// API search function avec IGDB API - recherche complète
async function searchGamesAPI(query) {
    if (query.length < 2) return [];

    try {
        console.log(`🔍 Recherche IGDB pour: "${query}"`);

        // Utiliser la recherche avancée de l'API IGDB
        const games = await window.igdbApi.advancedSearch(query);
        console.log(`✅ IGDB search results:`, games.length, 'games');

        // Convertir les résultats au format attendu par l'interface
        const formattedResults = games.map(game => ({
            id: game.id,
            name: game.name,
            year: game.released ? new Date(game.released).getFullYear() : 'TBA',
            platforms: game.platforms.length > 0 ? game.platforms.slice(0, 3) : ['PC'],
            image: game.background_image || '',
            rating: Math.round((game.rating || 0) / 10) / 10, // IGDB rating est sur 100, on la convertit
            developer: game.developers.length > 0 ? game.developers[0] : 'Unknown',
            genre: game.genres.length > 0 ? game.genres[0] : 'Game',
            // Données supplémentaires d'IGDB
            summary: game.summary,
            screenshots: game.screenshots || []
        }));

        // Trier par pertinence (rating et nombre de votes)
        formattedResults.sort((a, b) => {
            // Prioriser les jeux avec des ratings élevés et des données complètes
            const scoreA = (a.rating * 10) + (a.image ? 5 : 0) + (a.developer !== 'Unknown' ? 3 : 0);
            const scoreB = (b.rating * 10) + (b.image ? 5 : 0) + (b.developer !== 'Unknown' ? 3 : 0);
            return scoreB - scoreA;
        });

        return formattedResults.slice(0, 15); // Limiter à 15 résultats

    } catch (error) {
        console.log('❌ IGDB API error:', error.message);
        return [];
    }
}

// Cette fonction n'est plus utilisée - tout se fait via IGDB API
// Conservée pour compatibilité mais vide
function searchGamesFromDatabase(query, database = []) {
    console.log('🚫 Local database search disabled - using IGDB API only');
    return [];
}

// Fonctions de gestion de la recherche
function setupGameSearch() {
    const searchInput = document.getElementById('gameSearch');
    const dropdown = document.getElementById('autocompleteDropdown');

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();

        clearTimeout(searchTimeout);

        if (query.length < 2) {
            hideAutocomplete();
            return;
        }

        dropdown.innerHTML = '<div class="autocomplete-loading">🔍 Recherche en cours...</div>';
        dropdown.classList.add('show');

        searchTimeout = setTimeout(async () => {
            const results = await searchGamesAPI(query);
            lastSearchResults = results; // Sauvegarder les résultats pour selectGame
            displaySearchResults(results);
        }, 300);
    });

    searchInput.addEventListener('keydown', function(e) {
        handleKeyboardNavigation(e);
    });

    // Fermer le dropdown quand on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            hideAutocomplete();
        }
    });
}

function displaySearchResults(results) {
    const dropdown = document.getElementById('autocompleteDropdown');

    if (results.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-no-results">❌ Aucun jeu trouvé</div>';
        return;
    }

    const html = results.map(game => {
        const releaseYear = game.year;
        const rating = `⭐ ${game.rating.toFixed(1)}`;
        const platforms = game.platforms.slice(0, 3).join(', ');

        return `
            <div class="autocomplete-item" data-game-id="${game.id}" onclick="selectGame('${game.id}')">
                <img src="${game.image || ''}" alt="${game.name}" onerror="this.style.display='none'">
                <div class="autocomplete-item-info">
                    <div class="autocomplete-item-title">${game.name}</div>
                    <div class="autocomplete-item-details">${releaseYear} • ${rating} • ${platforms}</div>
                </div>
            </div>
        `;
    }).join('');

    dropdown.innerHTML = html;
}

function selectGame(gameId) {
    let gameData = null;

    // D'abord, chercher dans les derniers résultats de recherche (pour les jeux API)
    gameData = lastSearchResults.find(game => game.id === gameId);

    // Si pas trouvé, chercher dans la base locale + additionalGames
    if (!gameData) {
        const additionalGames = [
            { id: 800, name: 'Minecraft', year: 2011, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Homepage_Discover-Minecraft_940x528.jpg', rating: 4.8, developer: 'Mojang', genre: 'Sandbox' },
            { id: 801, name: 'Fortnite', year: 2017, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://cdn2.unrealengine.com/fortnite-chapter-4-season-4-keyart-3840x2160-b268a25de7b0.jpg', rating: 4.1, developer: 'Epic Games', genre: 'Battle Royale' },
            { id: 802, name: 'League of Legends', year: 2009, platforms: ['PC'], image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg', rating: 4.3, developer: 'Riot Games', genre: 'MOBA' },
            { id: 803, name: 'Rocket League', year: 2015, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: '', rating: 4.4, developer: 'Psyonix', genre: 'Sports' },
            { id: 804, name: 'Terraria', year: 2011, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: '', rating: 4.7, developer: 'Re-Logic', genre: 'Sandbox' },
            { id: 805, name: 'Roblox', year: 2006, platforms: ['PC', 'Xbox'], image: 'https://tr.rbxcdn.com/5a7ee2ac5dd9a52b1fb6b3c01a6f2e72/768/432/Image/Png', rating: 3.8, developer: 'Roblox Corporation', genre: 'Platform' }
        ];
        const combinedDatabase = [...gamesDatabase, ...additionalGames];
        gameData = combinedDatabase.find(game => game.id === gameId);
    }

    if (!gameData) {
        console.error('Jeu non trouvé dans aucune source:', gameId);
        return;
    }

    selectedGame = {
        id: gameData.id,
        name: gameData.name,
        background_image: gameData.image || gameData.background_image, // Supporter les deux formats
        image: gameData.image || gameData.background_image,  // Compatibilité
        year: gameData.year,
        rating: gameData.rating,
        platforms: gameData.platforms,
        developer: gameData.developer,
        developers: gameData.developers,  // Support IGDB
        genre: gameData.genre,
        genres: gameData.genres,  // Support IGDB
        released: gameData.released,  // Pour la date de sortie
        summary: gameData.summary  // Résumé du jeu
    };

    console.log('✅ Jeu sélectionné:', selectedGame);
    displaySelectedGame();
    hideAutocomplete();
}

function displaySelectedGame() {
    const selectedGameInfo = document.getElementById('selectedGameInfo');
    const selectedGameDisplay = document.getElementById('selectedGameDisplay');
    const platformSelector = document.getElementById('platformSelector');

    const releaseYear = selectedGame.year;
    const rating = `⭐ ${selectedGame.rating.toFixed(1)}`;

    selectedGameDisplay.innerHTML = `
        <div style="font-size: 1.1rem; font-weight: 600; color: #c7d5e0;">${selectedGame.name}</div>
        <div style="font-size: 0.9rem; color: #8f98a0; margin-top: 4px;">${releaseYear} ${rating} • ${selectedGame.developer}</div>
    `;

    // Proposer toutes les plateformes PC au lieu des plateformes limitées du jeu
    const allPCPlatforms = Object.keys(platformMappings);

    platformSelector.innerHTML = `
        <div style="font-size: 0.85rem; color: #8f98a0; margin-bottom: 6px;">Choisissez votre plateforme PC :</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
            ${allPCPlatforms.map(platform => {
                const mapping = platformMappings[platform];
                return `<div class="platform-tag" onclick="selectPlatform('${platform}')" style="text-align: center; padding: 8px; cursor: pointer; border-radius: 4px; background: rgba(64, 95, 158, 0.2); border: 1px solid rgba(102, 192, 244, 0.3); transition: all 0.2s ease;" onmouseover="this.style.background='rgba(64, 95, 158, 0.4)'" onmouseout="this.style.background='rgba(64, 95, 158, 0.2)'">${mapping.icon} ${mapping.name}</div>`;
            }).join('')}
        </div>
    `;

    selectedGameInfo.style.display = 'block';
    document.getElementById('gameSearch').value = selectedGame.name;
}

function selectPlatform(platform) {
    selectedPlatform = platform;

    // Mettre à jour l'affichage des plateformes avec style visuel
    document.querySelectorAll('.platform-tag').forEach(tag => {
        tag.style.background = 'rgba(64, 95, 158, 0.2)';
        tag.style.border = '1px solid rgba(102, 192, 244, 0.3)';
        tag.style.transform = 'scale(1)';
    });

    // Mettre en évidence la plateforme sélectionnée
    event.target.style.background = 'rgba(107, 142, 35, 0.4)';
    event.target.style.border = '1px solid rgba(154, 205, 50, 0.8)';
    event.target.style.transform = 'scale(1.05)';

    // Remplir automatiquement tous les champs
    autoFillGameData();

    // Activer le bouton sauvegarder
    document.getElementById('saveButton').disabled = false;

    console.log('🎮 Plateforme sélectionnée:', platform);
}

function autoFillGameData() {
    if (!selectedGame || !selectedPlatform) return;

    // Remplir les champs cachés
    document.getElementById('gameTitle').value = selectedGame.name;

    // Créer un sous-titre avec les infos pertinentes
    const subtitle = [
        selectedGame.year,
        selectedPlatform !== 'PC' ? platformMappings[selectedPlatform].name : 'PC',
        selectedGame.developer
    ].filter(Boolean).join(' • ');

    document.getElementById('gameSubtitle').value = subtitle;
    document.getElementById('gameImage').value = selectedGame.image || '';

    // Générer l'URL de lancement automatiquement selon la plateforme
    let launchUrl = generateLaunchUrl(selectedGame.name, selectedPlatform);
    document.getElementById('gameLaunchUrl').value = launchUrl;
}

function hideAutocomplete() {
    document.getElementById('autocompleteDropdown').classList.remove('show');
}

function handleKeyboardNavigation(e) {
    const dropdown = document.getElementById('autocompleteDropdown');
    const items = dropdown.querySelectorAll('.autocomplete-item');

    if (items.length === 0) return;

    let currentIndex = -1;
    items.forEach((item, index) => {
        if (item.classList.contains('selected')) {
            currentIndex = index;
        }
    });

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, items.length - 1);
        selectSearchItem(nextIndex);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        selectSearchItem(prevIndex);
    } else if (e.key === 'Enter' && currentIndex >= 0) {
        e.preventDefault();
        const selectedItem = items[currentIndex];
        const gameId = selectedItem.dataset.gameId;
        if (gameId) selectGame(parseInt(gameId));
    } else if (e.key === 'Escape') {
        hideAutocomplete();
    }
}

function selectSearchItem(index) {
    const items = document.querySelectorAll('.autocomplete-item');
    items.forEach(item => item.classList.remove('selected'));
    if (items[index]) {
        items[index].classList.add('selected');
    }
}

// Fonctions de modal
function openModal(category) {
    currentCategory = category;
    editingGame = null;
    selectedGame = null;
    selectedPlatform = null;

    document.getElementById('modalTitle').textContent = 'Ajouter un nouveau jeu';
    document.getElementById('gameModal').style.display = 'flex';
    document.getElementById('selectedGameInfo').style.display = 'none';
    document.getElementById('saveButton').disabled = true;

    // Réinitialiser les onglets
    switchTab('search');

    // Nettoyer les champs
    document.getElementById('gameSearch').value = '';
    clearManualForm();
    hideAutocomplete();

    // Setup search functionality
    setupGameSearch();

    document.getElementById('gameSearch').focus();
}

// Fonction pour gérer le basculement entre onglets
function switchTab(tabName) {
    // Désactiver tous les onglets
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));

    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Activer l'onglet sélectionné
    document.getElementById(tabName + 'Tab').classList.add('active');
    document.getElementById(tabName + 'TabContent').classList.add('active');

    // Gérer l'état du bouton de sauvegarde
    updateSaveButtonState();

    // Focus sur le bon champ
    if (tabName === 'search') {
        document.getElementById('gameSearch').focus();
    } else if (tabName === 'manual') {
        document.getElementById('gameTitle').focus();
    }
}

// Fonction pour nettoyer le formulaire manuel
function clearManualForm() {
    document.getElementById('gameTitle').value = '';
    document.getElementById('gameSubtitle').value = '';
    document.getElementById('gameImage').value = '';
    document.getElementById('gameLaunchUrl').value = '';
    document.getElementById('gamePlatform').selectedIndex = 0;
}

// Fonction pour mettre à jour l'état du bouton de sauvegarde
function updateSaveButtonState() {
    const searchTab = document.getElementById('searchTabContent');
    const manualTab = document.getElementById('manualTabContent');
    const saveButton = document.getElementById('saveButton');

    if (searchTab.classList.contains('active')) {
        // Mode recherche : bouton activé seulement si un jeu est sélectionné
        saveButton.disabled = !selectedGame;
    } else if (manualTab.classList.contains('active')) {
        // Mode manuel : bouton activé si le titre est rempli
        const gameTitle = document.getElementById('gameTitle').value.trim();
        saveButton.disabled = gameTitle === '';
    }
}

// Fonction pour initialiser les event listeners du formulaire manuel
function setupManualFormListeners() {
    // Event listener pour le champ titre (requis)
    const gameTitleInput = document.getElementById('gameTitle');
    if (gameTitleInput) {
        gameTitleInput.addEventListener('input', updateSaveButtonState);

        // Génération automatique de l'URL de lancement quand le titre change
        gameTitleInput.addEventListener('input', debounce(() => {
            const title = gameTitleInput.value.trim();
            const platform = document.getElementById('gamePlatform').value;
            const launchUrlInput = document.getElementById('gameLaunchUrl');

            if (title && !launchUrlInput.value.trim()) {
                const generatedUrl = generateLaunchUrl(title, platform);
                if (generatedUrl) {
                    launchUrlInput.value = generatedUrl;
                }
            }
        }, 500));
    }

    // Event listener pour le sélecteur de plateforme
    const platformSelect = document.getElementById('gamePlatform');
    if (platformSelect) {
        platformSelect.addEventListener('change', () => {
            const title = document.getElementById('gameTitle').value.trim();
            const launchUrlInput = document.getElementById('gameLaunchUrl');

            // Regénérer l'URL si elle était générée automatiquement
            if (title && (!launchUrlInput.value.trim() || launchUrlInput.dataset.autoGenerated === 'true')) {
                const generatedUrl = generateLaunchUrl(title, platformSelect.value);
                launchUrlInput.value = generatedUrl;
                launchUrlInput.dataset.autoGenerated = generatedUrl ? 'true' : 'false';
            }
        });
    }

    // Event listener pour détecter les modifications manuelles de l'URL
    const launchUrlInput = document.getElementById('gameLaunchUrl');
    if (launchUrlInput) {
        launchUrlInput.addEventListener('input', () => {
            // Marquer comme non auto-généré si l'utilisateur modifie manuellement
            launchUrlInput.dataset.autoGenerated = 'false';
        });
    }
}

function closeModal() {
    document.getElementById('gameModal').style.display = 'none';

    // Nettoyer TOUS les champs
    document.getElementById('gameSearch').value = '';
    clearManualForm();

    // Remettre le titre du modal par défaut
    document.getElementById('modalTitle').textContent = 'Ajouter un jeu';

    // Revenir à l'onglet de recherche par défaut
    switchTab('search');

    // Masquer les infos du jeu sélectionné
    const selectedGameInfo = document.getElementById('selectedGameInfo');
    if (selectedGameInfo) {
        selectedGameInfo.style.display = 'none';
    }

    // Désactiver le bouton de sauvegarde par défaut
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.disabled = true;
    }

    // Masquer l'autocomplétion
    hideAutocomplete();

    // Nettoyer les écouteurs d'événements
    const titleInput = document.getElementById('gameTitle');
    if (titleInput) {
        titleInput.removeEventListener('blur', autoFillImage);
        titleInput.removeEventListener('input', debounce(autoFillImage, 500));
        titleInput.removeEventListener('input', debounce(updateLaunchUrl, 500));
    }

    const platformSelect = document.getElementById('gamePlatform');
    if (platformSelect) {
        platformSelect.removeEventListener('change', updateLaunchUrl);
        platformSelect.value = 'Steam'; // Reset par défaut
    }

    // Réinitialiser les variables d'état
    editingGame = null;
    selectedGame = null;

    console.log('📝 Modal fermé et complètement réinitialisé');
}