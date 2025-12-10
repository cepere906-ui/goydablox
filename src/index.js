/**
 * ГОЙДАБЛОКС - Main Entry Point
 * Russian Roblox Parody Game
 * 
 * Построй свой путь в этой суровой российской действительности!
 */

import * as THREE from 'three';
import { Game } from './core/Game.js';
import { CONFIG } from './config/GameConfig.js';

// Global game instance
let game = null;

/**
 * Initialize the game
 */
async function init() {
    console.log(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║   ██████╗  ██████╗ ██╗   ██╗██████╗  █████╗                  ║
    ║  ██╔════╝ ██╔═══██╗╚██╗ ██╔╝██╔══██╗██╔══██╗                 ║
    ║  ██║  ███╗██║   ██║ ╚████╔╝ ██║  ██║███████║                 ║
    ║  ██║   ██║██║   ██║  ╚██╔╝  ██║  ██║██╔══██║                 ║
    ║  ╚██████╔╝╚██████╔╝   ██║   ██████╔╝██║  ██║                 ║
    ║   ╚═════╝  ╚═════╝    ╚═╝   ╚═════╝ ╚═╝  ╚═╝                 ║
    ║                                                               ║
    ║   ██████╗ ██╗      ██████╗ ██╗  ██╗███████╗                  ║
    ║   ██╔══██╗██║     ██╔═══██╗╚██╗██╔╝██╔════╝                  ║
    ║   ██████╔╝██║     ██║   ██║ ╚███╔╝ ███████╗                  ║
    ║   ██╔══██╗██║     ██║   ██║ ██╔██╗ ╚════██║                  ║
    ║   ██████╔╝███████╗╚██████╔╝██╔╝ ██╗███████║                  ║
    ║   ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝                  ║
    ║                                                               ║
    ║                    Version ${CONFIG.version || '1.0.0'}                          ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    `);
    
    // Show loading screen
    showLoadingScreen();
    
    try {
        // Check WebGL support
        if (!checkWebGLSupport()) {
            showError('WebGL не поддерживается вашим браузером!');
            return;
        }
        
        // Update loading progress
        updateLoadingProgress(10, 'Инициализация Three.js...');
        
        // Create game instance
        game = new Game();
        
        updateLoadingProgress(30, 'Загрузка мира...');
        
        // Initialize game
        await game.init();
        
        updateLoadingProgress(70, 'Создание игрока...');
        
        // Setup event listeners
        setupEventListeners();
        
        updateLoadingProgress(90, 'Финальная подготовка...');
        
        // Hide loading screen and show main menu
        await hideLoadingScreen();
        
        // Show main menu
        showMainMenu();
        
        console.log('🎮 Game initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError(`Ошибка инициализации: ${error.message}`);
    }
}

/**
 * Check WebGL support
 */
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

/**
 * Hide loading screen
 */
async function hideLoadingScreen() {
    return new Promise(resolve => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resolve();
            }, 500);
        } else {
            resolve();
        }
    });
}

/**
 * Update loading progress
 */
function updateLoadingProgress(percent, message) {
    const progressBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');
    
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
    
    if (loadingText) {
        loadingText.textContent = message;
    }
}

/**
 * Show error screen
 */
function showError(message) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="error-container">
                <h1>❌ Ошибка</h1>
                <p>${message}</p>
                <button onclick="location.reload()">Перезагрузить</button>
            </div>
        `;
    }
}

/**
 * Show main menu
 */
function showMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        mainMenu.style.display = 'flex';
        mainMenu.style.opacity = '0';
        setTimeout(() => {
            mainMenu.style.opacity = '1';
        }, 100);
    }
}

/**
 * Hide main menu
 */
function hideMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        mainMenu.style.opacity = '0';
        setTimeout(() => {
            mainMenu.style.display = 'none';
        }, 300);
    }
}

/**
 * Start new game
 */
function startNewGame() {
    hideMainMenu();
    
    if (game) {
        game.newGame();
        game.start();
    }
}

/**
 * Continue game
 */
function continueGame() {
    if (game && game.saveSystem?.hasSave(0)) {
        hideMainMenu();
        game.saveSystem.loadGame(0);
        game.start();
    }
}

/**
 * Load game menu
 */
function showLoadMenu() {
    if (game?.ui) {
        game.ui.showLoadMenu();
    }
}

/**
 * Show settings menu
 */
function showSettings() {
    if (game?.ui) {
        game.ui.showSettings();
    }
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => {
        if (game) {
            game.onResize();
        }
    });
    
    // Before unload - auto save
    window.addEventListener('beforeunload', (e) => {
        if (game && game.isRunning) {
            game.saveSystem?.autoSave();
        }
    });
    
    // Visibility change - pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (game) {
            if (document.hidden) {
                game.pause();
            } else {
                game.resume();
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Quick save (F5)
        if (e.key === 'F5') {
            e.preventDefault();
            game?.saveSystem?.quickSave();
        }
        
        // Quick load (F9)
        if (e.key === 'F9') {
            e.preventDefault();
            game?.saveSystem?.quickLoad();
        }
        
        // Fullscreen (F11)
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
    });
    
    // Setup menu buttons
    setupMenuButtons();
}

/**
 * Setup main menu buttons
 */
function setupMenuButtons() {
    const newGameBtn = document.getElementById('new-game-btn');
    const continueBtn = document.getElementById('continue-btn');
    const loadBtn = document.getElementById('load-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    if (newGameBtn) {
        newGameBtn.addEventListener('click', startNewGame);
    }
    
    if (continueBtn) {
        continueBtn.addEventListener('click', continueGame);
        
        // Enable/disable based on save existence
        if (game?.saveSystem?.hasSave(0)) {
            continueBtn.disabled = false;
            continueBtn.classList.remove('disabled');
        } else {
            continueBtn.disabled = true;
            continueBtn.classList.add('disabled');
        }
    }
    
    if (loadBtn) {
        loadBtn.addEventListener('click', showLoadMenu);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen not supported:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Export for global access
window.GOYDABLOX = {
    game: () => game,
    startNewGame,
    continueGame,
    showLoadMenu,
    showSettings,
    toggleFullscreen
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { game };