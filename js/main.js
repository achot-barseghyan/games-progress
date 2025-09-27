// Fonctions de drag and drop
function setupDragAndDrop() {
    let draggedElement = null;
    let placeholder = null;
    let sectionPlaceholder = null;
    let draggedSection = null;

    // Créer le placeholder pour les jeux
    function createPlaceholder() {
        const div = document.createElement('div');
        div.className = 'drop-placeholder';
        return div;
    }

    // Créer le placeholder pour les sections
    function createSectionPlaceholder() {
        const div = document.createElement('div');
        div.className = 'section-drop-placeholder';
        return div;
    }

    // Événements pour les cartes ET sections (drag)
    document.addEventListener('dragstart', function (e) {
        if (e.target.classList.contains('game-card')) {
            draggedElement = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.gameId);
            e.dataTransfer.setData('type', 'game');
            e.dataTransfer.effectAllowed = 'move';

            // Créer le placeholder pour les jeux
            placeholder = createPlaceholder();
        } else if (e.target.classList.contains('category') && !sectionsLocked) {
            draggedSection = e.target;
            e.target.classList.add('section-dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.category);
            e.dataTransfer.setData('type', 'section');
            e.dataTransfer.effectAllowed = 'move';

            // Créer le placeholder pour les sections
            sectionPlaceholder = createSectionPlaceholder();
            document.getElementById('categories-container').classList.add('section-drag-active');
        } else if (e.target.classList.contains('category') && sectionsLocked) {
            // Empêcher le drag si les sections sont verrouillées
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('dragend', function (e) {
        if (e.target.classList.contains('game-card')) {
            e.target.classList.remove('dragging');
            draggedElement = null;

            // Nettoyer tous les placeholders pour les jeux
            document.querySelectorAll('.drop-placeholder').forEach(p => p.remove());
            placeholder = null;
        } else if (e.target.classList.contains('category')) {
            e.target.classList.remove('section-dragging');
            draggedSection = null;

            // Nettoyer tous les placeholders pour les sections
            document.querySelectorAll('.section-drop-placeholder').forEach(p => p.remove());
            sectionPlaceholder = null;
            document.getElementById('categories-container').classList.remove('section-drag-active');
        }
    });

    // Empêcher le drag sur les boutons d'action
    document.addEventListener('mousedown', function (e) {
        if (e.target.classList.contains('action-btn') || e.target.classList.contains('play-btn') || e.target.classList.contains('add-game-btn') || e.target.classList.contains('minimize-btn')) {
            e.preventDefault();
            const card = e.target.closest('.game-card');
            const section = e.target.closest('.category');
            if (card) {
                card.draggable = false;
                setTimeout(() => {
                    card.draggable = true;
                }, 100);
            }
            if (section) {
                section.draggable = false;
                setTimeout(() => {
                    section.draggable = true;
                }, 100);
            }
        }
    });

    // Événements pour les catégories (drop)
    document.querySelectorAll('.category').forEach(category => {
        const gamesList = category.querySelector('.games-list');

        category.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        });

        category.addEventListener('dragleave', function (e) {
            if (!this.contains(e.relatedTarget)) {
                this.classList.remove('drag-over');
                // Cacher le placeholder
                if (placeholder && this.contains(placeholder)) {
                    placeholder.classList.remove('show');
                }
            }
        });

        category.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            const gameId = parseInt(e.dataTransfer.getData('text/plain'));
            const targetCategory = this.dataset.category;

            // Si on drop dans la même catégorie et qu'il y a un placeholder
            if (placeholder && this.contains(placeholder)) {
                const placeholderIndex = Array.from(gamesList.children).indexOf(placeholder);
                moveGameWithinCategory(gameId, targetCategory, placeholderIndex);
            } else {
                moveGame(gameId, targetCategory);
            }

            // Nettoyer le placeholder
            if (placeholder) {
                placeholder.remove();
                placeholder = null;
            }
        });

        // Gérer le drag over pour les listes de jeux horizontales
        if (gamesList) {
            gamesList.addEventListener('dragover', function (e) {
                e.preventDefault();

                if (!draggedElement || !placeholder) return;

                const afterElement = getDragAfterElement(gamesList, e.clientX);

                // Nettoyer les anciens placeholders
                document.querySelectorAll('.drop-placeholder').forEach(p => {
                    if (p !== placeholder) p.remove();
                });

                if (afterElement == null) {
                    gamesList.appendChild(placeholder);
                } else {
                    gamesList.insertBefore(placeholder, afterElement);
                }

                placeholder.classList.add('show');
            });
        }
    });

    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.game-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function getSectionAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.category:not(.section-dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Gestion du drag over pour le conteneur des sections
    const categoriesContainer = document.getElementById('categories-container');
    if (categoriesContainer) {
        categoriesContainer.addEventListener('dragover', function (e) {
            e.preventDefault();

            const dragType = e.dataTransfer.types.includes('type') ? 'section' : 'game';

            if (dragType === 'section' && draggedSection && sectionPlaceholder) {
                const afterElement = getSectionAfterElement(categoriesContainer, e.clientY);

                // Nettoyer les anciens placeholders
                document.querySelectorAll('.section-drop-placeholder').forEach(p => {
                    if (p !== sectionPlaceholder) p.remove();
                });

                if (afterElement == null) {
                    categoriesContainer.appendChild(sectionPlaceholder);
                } else {
                    categoriesContainer.insertBefore(sectionPlaceholder, afterElement);
                }

                sectionPlaceholder.classList.add('show');
            }
        });

        categoriesContainer.addEventListener('drop', function (e) {
            e.preventDefault();

            const dragType = e.dataTransfer.getData('type');

            if (dragType === 'section' && sectionPlaceholder && categoriesContainer.contains(sectionPlaceholder)) {
                const categoryId = e.dataTransfer.getData('text/plain');
                const placeholderIndex = Array.from(categoriesContainer.children).indexOf(sectionPlaceholder);

                moveSectionToPosition(categoryId, placeholderIndex);
            }

            // Nettoyer les placeholders
            if (sectionPlaceholder) {
                sectionPlaceholder.remove();
                sectionPlaceholder = null;
            }
            categoriesContainer.classList.remove('section-drag-active');
        });
    }
}

// Initialisation principale
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Initialisation de l\'application Games Progress Tracker');

    // Initialiser Firebase si configuré
    initFirebase();

    // Charger les données (cloud + local)
    await loadData();

    // Appliquer les paramètres
    applyTheme(currentTheme);
    updateThemeSelector();

    // Rendre l'interface
    renderSections();
    renderAllGames();

    // Configuration du drag & drop
    setupDragAndDrop();

    // Appliquer les états UI
    updateLockUI();
    updateSectionDraggability();
    applyMinimizedStates();
    applyViewMode();
    updateViewToggleButton();

    // Initialiser les event listeners pour le formulaire manuel
    setupManualFormListeners();

    // Initialiser la configuration Steam
    updateSteamConfigButton();

    // Auto-update des heures de jeu si configuré
    if (window.steamAPI.isConfigured() && localStorage.getItem('autoUpdatePlaytime') !== 'false') {
        console.log('🔄 Mise à jour automatique des heures de jeu Steam...');
        try {
            await window.steamAPI.updateAllGamesPlaytime(games);
            renderAllGames();
            saveData();
            console.log('✅ Heures de jeu mises à jour automatiquement');
        } catch (error) {
            console.warn('⚠️ Erreur lors de la mise à jour automatique des heures de jeu:', error.message);
        }
    }

    console.log('✅ Application initialisée avec succès');
});

// Événements globaux
// Fermer le modal en cliquant à l'extérieur
document.addEventListener('click', function(e) {
    const modal = document.getElementById('gameModal');
    if (modal && e.target === modal) {
        closeModal();
    }
});

// Support clavier pour le modal
document.addEventListener('keydown', function (e) {
    const modal = document.getElementById('gameModal');
    if (!modal) return;

    if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    } else if (e.key === 'Enter' && modal.style.display === 'flex') {
        // Seulement si un bouton de sauvegarde est disponible et activé
        const saveButton = document.getElementById('saveButton');
        if (saveButton && !saveButton.disabled) {
            saveGame();
        }
    }
});

// Gestion globale des erreurs
window.addEventListener('error', function(e) {
    console.error('Erreur globale détectée:', e.error);
});

// Sauvegarde automatique périodique (optionnelle)
setInterval(function() {
    // Sauvegarder automatiquement toutes les 5 minutes si des modifications ont été apportées
    if (typeof games !== 'undefined' && Object.keys(games).length > 0) {
        console.log('💾 Sauvegarde automatique');
        saveData();
    }
}, 300000); // 5 minutes

console.log('📋 Gestionnaire principal (main.js) chargé');