// Application principale - Gestionnaire de visualisations
let currentVisualization = null;
let currentRenderer = null;
let currentScene = null;
let currentCamera = null;
let animationId = null;
let currentEventListeners = [];

// Fonction pour nettoyer la visualisation actuelle
function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Supprimer les event listeners
    currentEventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    currentEventListeners = [];
    
    const container = document.getElementById('canvas-container');
    if (container) {
        container.innerHTML = '';
    }
    
    if (currentRenderer) {
        currentRenderer.dispose();
        currentRenderer = null;
    }
    
    currentVisualization = null;
    currentScene = null;
    currentCamera = null;
}

// Fonction pour charger une visualisation
function loadVisualization(name) {
    cleanup();
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('#navigation button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-${name}`).classList.add('active');
    
    // Charger la visualisation appropriée
    switch(name) {
        case 'solar':
            initSolarSystem();
            break;
        case 'dna':
            initDNA();
            break;
        case 'particles':
            initParticles();
            break;
        case 'galaxy':
            initGalaxy();
            break;
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Écouteurs d'événements pour les boutons
    document.getElementById('btn-solar').addEventListener('click', () => loadVisualization('solar'));
    document.getElementById('btn-dna').addEventListener('click', () => loadVisualization('dna'));
    document.getElementById('btn-particles').addEventListener('click', () => loadVisualization('particles'));
    document.getElementById('btn-galaxy').addEventListener('click', () => loadVisualization('galaxy'));

    // Charger le système solaire par défaut
    loadVisualization('solar');
});

