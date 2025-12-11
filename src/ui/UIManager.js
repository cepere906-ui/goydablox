/**
 * ГОЙДАБЛОКС - UI Manager
 * Manages all user interface elements
 */

import { CONFIG } from '../config/GameConfig.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        
        // UI elements
        this.container = null;
        this.hud = null;
        this.menu = null;
        this.pauseMenu = null;
        this.deathScreen = null;
        this.interactionPrompt = null;
        this.notifications = [];
        
        // State
        this.isMenuOpen = false;
        this.currentDialog = null;
        
        this.init();
        console.log('🖥️ UIManager initialized');
    }
    
    /**
     * Initialize UI
     */
    init() {
        this.createStyles();
        this.createHUD();
        this.createCrosshair();
        this.createInteractionPrompt();
        this.createPauseMenu();
        this.createDeathScreen();
        this.createNotificationContainer();
        this.createMiniMap();
        this.createVehicleHUD();
        this.createDialogBox();
        this.createShopMenu();
        this.createFertilityCenterUI();
        this.createMilitaryOfficeUI();
    }
    
    /**
     * Create CSS styles
     */
    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            
            .goyda-ui {
                font-family: 'Roboto', 'Arial Black', sans-serif;
                user-select: none;
                pointer-events: none;
            }
            
            .goyda-ui.interactive {
                pointer-events: auto;
            }
            
            .goyda-hud {
                position: fixed;
                top: 10px;
                left: 10px;
                color: #FFF;
                font-size: 14px;
                background: rgba(0, 0, 0, 0.75);
                padding: 15px;
                border-radius: 10px;
                border: 2px solid #0039A6;
                z-index: 100;
                min-width: 180px;
            }
            
            .goyda-hud-row {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
            }
            
            .goyda-hud-label {
                color: #AAA;
            }
            
            .goyda-hud-value {
                color: #FFF;
                font-weight: bold;
            }
            
            .goyda-health-bar, .goyda-stamina-bar {
                width: 100%;
                height: 8px;
                background: #333;
                border-radius: 4px;
                margin: 5px 0;
                overflow: hidden;
            }
            
            .goyda-health-fill {
                height: 100%;
                background: linear-gradient(90deg, #D52B1E, #FF4444);
                transition: width 0.3s;
            }
            
            .goyda-stamina-fill {
                height: 100%;
                background: linear-gradient(90deg, #0039A6, #4488FF);
                transition: width 0.3s;
            }
            
            .goyda-money {
                color: #FFD700;
                font-size: 18px;
                font-weight: bold;
            }
            
            .goyda-crosshair {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                z-index: 100;
            }
            
            .goyda-crosshair::before,
            .goyda-crosshair::after {
                content: '';
                position: absolute;
                background: rgba(255, 255, 255, 0.8);
            }
            
            .goyda-crosshair::before {
                width: 2px;
                height: 12px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .goyda-crosshair::after {
                width: 12px;
                height: 2px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .goyda-crosshair-dot {
                position: absolute;
                width: 4px;
                height: 4px;
                background: #FFF;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .goyda-interaction {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: #FFF;
                padding: 10px 20px;
                border-radius: 8px;
                border: 2px solid #0039A6;
                font-size: 16px;
                z-index: 100;
                display: none;
            }
            
            .goyda-interaction-key {
                background: #0039A6;
                padding: 2px 8px;
                border-radius: 4px;
                margin-right: 8px;
            }
            
            .goyda-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background: rgba(0, 0, 0, 0.85);
                color: #FFF;
                padding: 15px 25px;
                border-radius: 8px;
                border-left: 4px solid #0039A6;
                font-size: 14px;
                z-index: 150;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .goyda-notification.success {
                border-left-color: #00AA00;
            }
            
            .goyda-notification.error {
                border-left-color: #D52B1E;
            }
            
            .goyda-pause-menu {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                display: none;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                z-index: 200;
            }
            
            .goyda-pause-title {
                font-size: 48px;
                color: #FFF;
                margin-bottom: 40px;
                text-shadow: 2px 2px 0 #0039A6;
            }
            
            .goyda-menu-btn {
                padding: 15px 50px;
                font-size: 20px;
                margin: 10px;
                background: linear-gradient(180deg, #0039A6, #002266);
                border: 2px solid #FFF;
                border-radius: 8px;
                color: #FFF;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .goyda-menu-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 20px rgba(0, 57, 166, 0.5);
            }
            
            .goyda-death-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(139, 0, 0, 0.9);
                display: none;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                z-index: 250;
            }
            
            .goyda-death-title {
                font-size: 72px;
                color: #FFF;
                text-shadow: 4px 4px 0 #000;
            }
            
            .goyda-minimap {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 180px;
                height: 180px;
                background: rgba(0, 0, 0, 0.75);
                border: 2px solid #0039A6;
                border-radius: 10px;
                z-index: 100;
                overflow: hidden;
            }
            
            .goyda-minimap-canvas {
                width: 100%;
                height: 100%;
            }
            
            .goyda-flag-icon {
                position: fixed;
                top: 10px;
                right: 200px;
                width: 60px;
                height: 40px;
                background: linear-gradient(180deg, 
                    #FFFFFF 0%, #FFFFFF 33%, 
                    #0039A6 33%, #0039A6 66%, 
                    #D52B1E 66%, #D52B1E 100%);
                border: 2px solid #000;
                border-radius: 5px;
                z-index: 100;
            }
            
            .goyda-vehicle-hud {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                padding: 15px 30px;
                border-radius: 10px;
                border: 2px solid #0039A6;
                z-index: 100;
                display: none;
            }
            
            .goyda-speedometer {
                text-align: center;
            }
            
            .goyda-speed-value {
                font-size: 48px;
                color: #FFF;
                font-weight: bold;
            }
            
            .goyda-speed-unit {
                font-size: 16px;
                color: #AAA;
            }
            
            .goyda-instructions {
                position: fixed;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: #FFF;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 12px;
                z-index: 100;
            }
            
            .goyda-dialog {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                width: 600px;
                background: rgba(0, 0, 0, 0.9);
                border: 3px solid #0039A6;
                border-radius: 10px;
                padding: 20px;
                z-index: 150;
                display: none;
            }
            
            .goyda-dialog-speaker {
                color: #FFD700;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .goyda-dialog-text {
                color: #FFF;
                font-size: 16px;
                line-height: 1.5;
            }
            
            .goyda-dialog-options {
                margin-top: 15px;
            }
            
            .goyda-dialog-option {
                background: #0039A6;
                color: #FFF;
                padding: 8px 15px;
                margin: 5px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            
            .goyda-dialog-option:hover {
                background: #004ACC;
            }
            
            .goyda-shop-menu, .goyda-fertility-center, .goyda-military-office {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 500px;
                max-height: 80vh;
                background: rgba(0, 0, 0, 0.95);
                border: 3px solid #0039A6;
                border-radius: 15px;
                padding: 25px;
                z-index: 200;
                display: none;
                overflow-y: auto;
            }
            
            .goyda-menu-title {
                color: #FFF;
                font-size: 24px;
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #0039A6;
            }
            
            .goyda-shop-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
            }
            
            .goyda-shop-item-name {
                color: #FFF;
                font-size: 16px;
            }
            
            .goyda-shop-item-price {
                color: #FFD700;
                font-weight: bold;
            }
            
            .goyda-buy-btn {
                background: #00AA00;
                color: #FFF;
                padding: 8px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            
            .goyda-buy-btn:hover {
                background: #00CC00;
            }
            
            .goyda-close-btn {
                position: absolute;
                top: 10px;
                right: 15px;
                background: #D52B1E;
                color: #FFF;
                width: 30px;
                height: 30px;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
            }
            
            .goyda-fertility-info {
                color: #FFB6C1;
                text-align: center;
                margin: 20px 0;
                line-height: 1.6;
            }
            
            .goyda-fertility-btn {
                display: block;
                width: 100%;
                padding: 15px;
                margin: 10px 0;
                background: linear-gradient(90deg, #FF69B4, #FF1493);
                color: #FFF;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
            }
            
            .goyda-fertility-btn:hover {
                background: linear-gradient(90deg, #FF1493, #FF69B4);
            }
            
            .goyda-military-banner {
                background: linear-gradient(180deg, #006400, #004400);
                padding: 20px;
                border-radius: 10px;
                margin: 15px 0;
                text-align: center;
            }
            
            .goyda-military-title {
                color: #FFD700;
                font-size: 20px;
                font-weight: bold;
            }
            
            .goyda-military-text {
                color: #FFF;
                margin: 10px 0;
            }
            
            .goyda-military-salary {
                color: #00FF00;
                font-size: 24px;
                font-weight: bold;
            }
            
            .goyda-enlist-btn {
                background: #8B0000;
                color: #FFF;
                padding: 15px 40px;
                border: 2px solid #FFD700;
                border-radius: 8px;
                font-size: 18px;
                cursor: pointer;
                margin-top: 15px;
            }
            
            .goyda-enlist-btn:hover {
                background: #AA0000;
            }
            
            .goyda-fps {
                position: fixed;
                top: 10px;
                left: 200px;
                color: #0F0;
                font-size: 14px;
                background: rgba(0, 0, 0, 0.5);
                padding: 5px 10px;
                border-radius: 5px;
                z-index: 100;
            }
            
            .goyda-damage-flash {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 0, 0, 0.3);
                z-index: 300;
                pointer-events: none;
                animation: damageFlash 0.2s ease;
            }
            
            @keyframes damageFlash {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Create HUD
     */
    createHUD() {
        this.hud = document.createElement('div');
        this.hud.className = 'goyda-ui goyda-hud';
        this.hud.innerHTML = `
            <div class="goyda-hud-row">
                <span class="goyda-hud-label">💰</span>
                <span class="goyda-money" id="hud-money">${CONFIG.economy.startingMoney.toLocaleString()}₽</span>
            </div>
            <div class="goyda-hud-row">
                <span class="goyda-hud-label">❤️ Здоровье</span>
            </div>
            <div class="goyda-health-bar">
                <div class="goyda-health-fill" id="health-bar" style="width: 100%"></div>
            </div>
            <div class="goyda-hud-row">
                <span class="goyda-hud-label">⚡ Выносливость</span>
            </div>
            <div class="goyda-stamina-bar">
                <div class="goyda-stamina-fill" id="stamina-bar" style="width: 100%"></div>
            </div>
            <hr style="border-color: #333; margin: 10px 0;">
            <div class="goyda-hud-row">
                <span class="goyda-hud-label">📍 X:</span>
                <span class="goyda-hud-value" id="pos-x">0</span>
            </div>
            <div class="goyda-hud-row">
                <span class="goyda-hud-label">📍 Y:</span>
                <span class="goyda-hud-value" id="pos-y">0</span>
            </div>
            <div class="goyda-hud-row">
                <span class="goyda-hud-label">📍 Z:</span>
                <span class="goyda-hud-value" id="pos-z">0</span>
            </div>
        `;
        document.body.appendChild(this.hud);
        
        // FPS counter
        this.fpsDisplay = document.createElement('div');
        this.fpsDisplay.className = 'goyda-ui goyda-fps';
        this.fpsDisplay.textContent = 'FPS: 0';
        document.body.appendChild(this.fpsDisplay);
        
        // Flag icon
        this.flagIcon = document.createElement('div');
        this.flagIcon.className = 'goyda-ui goyda-flag-icon';
        document.body.appendChild(this.flagIcon);
        
        // Instructions
        this.instructions = document.createElement('div');
        this.instructions.className = 'goyda-ui goyda-instructions';
        this.instructions.innerHTML = 'WASD - движение | ПРОБЕЛ - прыжок | SHIFT - бег | E - взаимодействие | F - авто | ESC - пауза';
        document.body.appendChild(this.instructions);
    }
    
    /**
     * Create crosshair
     */
    createCrosshair() {
        this.crosshair = document.createElement('div');
        this.crosshair.className = 'goyda-ui goyda-crosshair';
        this.crosshair.innerHTML = '<div class="goyda-crosshair-dot"></div>';
        document.body.appendChild(this.crosshair);
    }
    
    /**
     * Create interaction prompt
     */
    createInteractionPrompt() {
        this.interactionPrompt = document.createElement('div');
        this.interactionPrompt.className = 'goyda-ui goyda-interaction';
        document.body.appendChild(this.interactionPrompt);
    }
    
    /**
     * Create pause menu
     */
    createPauseMenu() {
        this.pauseMenu = document.createElement('div');
        this.pauseMenu.className = 'goyda-ui interactive goyda-pause-menu';
        this.pauseMenu.innerHTML = `
            <div class="goyda-pause-title">🇷🇺 ПАУЗА 🇷🇺</div>
            <button class="goyda-menu-btn" id="btn-resume">▶ ПРОДОЛЖИТЬ</button>
            <button class="goyda-menu-btn" id="btn-save">💾 СОХРАНИТЬ</button>
            <button class="goyda-menu-btn" id="btn-settings">⚙ НАСТРОЙКИ</button>
            <button class="goyda-menu-btn" id="btn-quit">🚪 ВЫХОД</button>
        `;
        document.body.appendChild(this.pauseMenu);
        
        // Event listeners
        this.pauseMenu.querySelector('#btn-resume').onclick = () => this.game.resume();
        this.pauseMenu.querySelector('#btn-save').onclick = () => {
            this.game.saveSystem?.saveGame();
            this.showNotification('Игра сохранена!', 'success');
        };
    }
    
    /**
     * Create death screen
     */
    createDeathScreen() {
        this.deathScreen = document.createElement('div');
        this.deathScreen.className = 'goyda-ui goyda-death-screen';
        this.deathScreen.innerHTML = `
            <div class="goyda-death-title">💀 ВЫ ПОГИБЛИ 💀</div>
            <p style="color: #FFF; font-size: 20px;">Возрождение через 3 секунды...</p>
        `;
        document.body.appendChild(this.deathScreen);
    }
    
    /**
     * Create notification container
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }
    
    /**
     * Create minimap
     */
    createMiniMap() {
        this.miniMap = document.createElement('div');
        this.miniMap.className = 'goyda-ui goyda-minimap';
        
        this.miniMapCanvas = document.createElement('canvas');
        this.miniMapCanvas.className = 'goyda-minimap-canvas';
        this.miniMapCanvas.width = 180;
        this.miniMapCanvas.height = 180;
        this.miniMap.appendChild(this.miniMapCanvas);
        
        document.body.appendChild(this.miniMap);
        
        this.miniMapCtx = this.miniMapCanvas.getContext('2d');
    }
    
    /**
     * Create vehicle HUD
     */
    createVehicleHUD() {
        this.vehicleHUD = document.createElement('div');
        this.vehicleHUD.className = 'goyda-ui goyda-vehicle-hud';
        this.vehicleHUD.innerHTML = `
            <div class="goyda-speedometer">
                <div class="goyda-speed-value" id="speed-value">0</div>
                <div class="goyda-speed-unit">КМ/Ч</div>
            </div>
        `;
        document.body.appendChild(this.vehicleHUD);
    }
    
    /**
     * Create dialog box
     */
    createDialogBox() {
        this.dialogBox = document.createElement('div');
        this.dialogBox.className = 'goyda-ui interactive goyda-dialog';
        this.dialogBox.innerHTML = `
            <div class="goyda-dialog-speaker" id="dialog-speaker"></div>
            <div class="goyda-dialog-text" id="dialog-text"></div>
            <div class="goyda-dialog-options" id="dialog-options"></div>
        `;
        document.body.appendChild(this.dialogBox);
    }
    
    /**
     * Create shop menu
     */
    createShopMenu() {
        this.shopMenu = document.createElement('div');
        this.shopMenu.className = 'goyda-ui interactive goyda-shop-menu';
        this.shopMenu.innerHTML = `
            <button class="goyda-close-btn" id="shop-close">×</button>
            <div class="goyda-menu-title" id="shop-title">МАГАЗИН</div>
            <div id="shop-items"></div>
        `;
        document.body.appendChild(this.shopMenu);
        
        this.shopMenu.querySelector('#shop-close').onclick = () => this.hideShopMenu();
    }
    
    /**
     * Create fertility center UI
     */
    createFertilityCenterUI() {
        this.fertilityCenter = document.createElement('div');
        this.fertilityCenter.className = 'goyda-ui interactive goyda-fertility-center';
        this.fertilityCenter.innerHTML = `
            <button class="goyda-close-btn" id="fertility-close">×</button>
            <div class="goyda-menu-title">💕 ЦЕНТР ПОВЫШЕНИЯ РОЖДАЕМОСТИ 💕</div>
            <div class="goyda-fertility-info">
                <p>Добро пожаловать в Центр повышения рождаемости!</p>
                <p>Мы поможем вам в этом важном деле для Родины!</p>
                <p style="color: #FFD700; font-size: 20px;">Материнский капитал: 1 000 000₽</p>
            </div>
            <button class="goyda-fertility-btn">📋 Консультация (бесплатно)</button>
            <button class="goyda-fertility-btn">🏥 Медицинское обследование</button>
            <button class="goyda-fertility-btn">📄 Оформить материнский капитал</button>
            <button class="goyda-fertility-btn">👨‍👩‍👧‍👦 Программа поддержки семей</button>
        `;
        document.body.appendChild(this.fertilityCenter);
        
        this.fertilityCenter.querySelector('#fertility-close').onclick = () => this.hideFertilityCenter();
        
        const buttons = this.fertilityCenter.querySelectorAll('.goyda-fertility-btn');
        buttons[2].onclick = () => {
            this.game.addMoney(1000000);
            this.showNotification('Материнский капитал получен: +1 000 000₽!', 'success');
            this.hideFertilityCenter();
        };
    }
    
    /**
     * Create military office UI
     */
    createMilitaryOfficeUI() {
        this.militaryOffice = document.createElement('div');
        this.militaryOffice.className = 'goyda-ui interactive goyda-military-office';
        this.militaryOffice.innerHTML = `
            <button class="goyda-close-btn" id="military-close">×</button>
            <div class="goyda-menu-title">🎖️ ВОЕНКОМАТ - КОНТРАКТНАЯ СЛУЖБА 🎖️</div>
            <div class="goyda-military-banner">
                <div class="goyda-military-title">⭐ СЛУЖБА ПО КОНТРАКТУ ⭐</div>
                <div class="goyda-military-text">Защити Родину! Стань профессионалом!</div>
                <div class="goyda-military-salary">от 200 000₽/мес</div>
            </div>
            <div style="color: #FFF; margin: 15px 0;">
                <p>✓ Достойная заработная плата</p>
                <p>✓ Социальные гарантии</p>
                <p>✓ Бесплатное жильё</p>
                <p>✓ Военная ипотека</p>
                <p>✓ Ранняя пенсия</p>
            </div>
            <div style="text-align: center;">
                <button class="goyda-enlist-btn" id="enlist-btn">🇷🇺 ПОДПИСАТЬ КОНТРАКТ 🇷🇺</button>
            </div>
            <div style="color: #AAA; font-size: 12px; margin-top: 15px; text-align: center;">
                Горячая линия: 8-800-222-22-22
            </div>
        `;
        document.body.appendChild(this.militaryOffice);
        
        this.militaryOffice.querySelector('#military-close').onclick = () => this.hideMilitaryOffice();
        this.militaryOffice.querySelector('#enlist-btn').onclick = () => {
            this.game.addMoney(200000);
            this.showNotification('Контракт подписан! Получено: +200 000₽', 'success');
            this.hideMilitaryOffice();
        };
    }
    
    /**
     * Update UI
     */
    update(delta) {
        if (!this.game.player) return;
        
        const player = this.game.player;
        
        // Update position
        document.getElementById('pos-x').textContent = player.position.x.toFixed(1);
        document.getElementById('pos-y').textContent = player.position.y.toFixed(1);
        document.getElementById('pos-z').textContent = player.position.z.toFixed(1);
        
        // Update health
        document.getElementById('health-bar').style.width = `${player.health}%`;
        
        // Update stamina
        document.getElementById('stamina-bar').style.width = `${player.stamina}%`;
        
        // Update vehicle HUD
        if (player.isInVehicle && player.currentVehicle) {
            this.vehicleHUD.style.display = 'block';
            const speed = Math.abs(player.currentVehicle.currentSpeed);
            document.getElementById('speed-value').textContent = Math.round(speed);
            this.instructions.style.display = 'none';
        } else {
            this.vehicleHUD.style.display = 'none';
            this.instructions.style.display = 'block';
        }
        
        // Update minimap
        this.updateMiniMap();
    }
    
    /**
     * Update minimap
     */
    updateMiniMap() {
        const ctx = this.miniMapCtx;
        const size = 180;
        const scale = 0.3;
        
        // Clear
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, size, size);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < size; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }
        
        const player = this.game.player;
        if (!player) return;
        
        const px = player.position.x;
        const pz = player.position.z;
        
        // Draw roads (simplified)
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, size / 2);
        ctx.lineTo(size, size / 2);
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size / 2, size);
        ctx.stroke();
        
        // Draw vehicles
        const vehicles = this.game.vehicleManager?.getVehiclePositions() || [];
        for (const v of vehicles) {
            const vx = size / 2 + (v.position.x - px) * scale;
            const vz = size / 2 + (v.position.z - pz) * scale;
            
            if (vx > 0 && vx < size && vz > 0 && vz < size) {
                ctx.fillStyle = v.occupied ? '#FF0' : '#0F0';
                ctx.fillRect(vx - 3, vz - 3, 6, 6);
            }
        }
        
        // Draw player
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player direction
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 2);
        ctx.lineTo(
            size / 2 + Math.sin(player.yaw) * 10,
            size / 2 + Math.cos(player.yaw) * 10
        );
        ctx.stroke();
    }
    
    /**
     * Update FPS display
     */
    updateFPS(fps) {
        if (CONFIG.debug?.showFPS) {
            this.fpsDisplay.textContent = `FPS: ${fps}`;
            this.fpsDisplay.style.display = 'block';
        } else {
            this.fpsDisplay.style.display = 'none';
        }
    }
    
    /**
     * Update money display
     */
    updateMoney(amount) {
        document.getElementById('hud-money').textContent = `${amount.toLocaleString()}₽`;
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `goyda-ui goyda-notification ${type}`;
        notification.textContent = message;
        
        // Position based on existing notifications
        const offset = this.notifications.length * 60;
        notification.style.top = `${80 + offset}px`;
        
        document.body.appendChild(notification);
        this.notifications.push(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                    this.repositionNotifications();
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Reposition notifications
     */
    repositionNotifications() {
        this.notifications.forEach((n, i) => {
            n.style.top = `${80 + i * 60}px`;
        });
    }
    
    /**
     * Show interaction prompt
     */
    showInteractionPrompt(text) {
        this.interactionPrompt.innerHTML = `<span class="goyda-interaction-key">E</span> ${text}`;
        this.interactionPrompt.style.display = 'block';
    }
    
    /**
     * Hide interaction prompt
     */
    hideInteractionPrompt() {
        this.interactionPrompt.style.display = 'none';
    }
    
    /**
     * Show pause menu
     */
    showPauseMenu() {
        this.pauseMenu.style.display = 'flex';
        this.isMenuOpen = true;
    }
    
    /**
     * Hide pause menu
     */
    hidePauseMenu() {
        this.pauseMenu.style.display = 'none';
        this.isMenuOpen = false;
    }
    
    /**
     * Show death screen
     */
    showDeathScreen() {
        this.deathScreen.style.display = 'flex';
    }
    
    /**
     * Hide death screen
     */
    hideDeathScreen() {
        this.deathScreen.style.display = 'none';
    }
    
    /**
     * Show shop menu
     */
    showShopMenu(shop) {
        document.getElementById('shop-title').textContent = shop.name || 'МАГАЗИН';
        
        const itemsContainer = document.getElementById('shop-items');
        itemsContainer.innerHTML = `
            <div class="goyda-shop-item">
                <div>
                    <div class="goyda-shop-item-name">🥙 Шаурма</div>
                    <div style="color: #888; font-size: 12px;">Восстанавливает здоровье</div>
                </div>
                <div class="goyda-shop-item-price">150₽</div>
                <button class="goyda-buy-btn" onclick="game.player.buyShawarma()">Купить</button>
            </div>
            <div class="goyda-shop-item">
                <div>
                    <div class="goyda-shop-item-name">🥤 Квас</div>
                    <div style="color: #888; font-size: 12px;">Восстанавливает выносливость</div>
                </div>
                <div class="goyda-shop-item-price">50₽</div>
                <button class="goyda-buy-btn">Купить</button>
            </div>
            <div class="goyda-shop-item">
                <div>
                    <div class="goyda-shop-item-name">🍞 Хлеб</div>
                    <div style="color: #888; font-size: 12px;">Всему голова</div>
                </div>
                <div class="goyda-shop-item-price">30₽</div>
                <button class="goyda-buy-btn">Купить</button>
            </div>
        `;
        
        this.shopMenu.style.display = 'block';
        this.isMenuOpen = true;
    }
    
    /**
     * Hide shop menu
     */
    hideShopMenu() {
        this.shopMenu.style.display = 'none';
        this.isMenuOpen = false;
        this.game.inputManager?.requestPointerLock();
    }
    
    /**
     * Show fertility center
     */
    showFertilityCenter() {
        this.fertilityCenter.style.display = 'block';
        this.isMenuOpen = true;
    }
    
    /**
     * Hide fertility center
     */
    hideFertilityCenter() {
        this.fertilityCenter.style.display = 'none';
        this.isMenuOpen = false;
        this.game.inputManager?.requestPointerLock();
    }
    
    /**
     * Show military office
     */
    showMilitaryOffice() {
        this.militaryOffice.style.display = 'block';
        this.isMenuOpen = true;
    }
    
    /**
     * Hide military office
     */
    hideMilitaryOffice() {
        this.militaryOffice.style.display = 'none';
        this.isMenuOpen = false;
        this.game.inputManager?.requestPointerLock();
    }
    
    /**
     * Flash damage effect
     */
    flashDamage() {
        const flash = document.createElement('div');
        flash.className = 'goyda-damage-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
    }
    
    /**
     * Handle resize
     */
    onResize(width, height) {
        // Update any size-dependent UI elements
    }
    
    /**
     * Dispose UI
     */
    dispose() {
        // Remove all UI elements
        this.hud?.remove();
        this.crosshair?.remove();
        this.pauseMenu?.remove();
        this.deathScreen?.remove();
        this.miniMap?.remove();
        this.vehicleHUD?.remove();
        this.dialogBox?.remove();
        this.shopMenu?.remove();
        this.fertilityCenter?.remove();
        this.militaryOffice?.remove();
        this.fpsDisplay?.remove();
        this.flagIcon?.remove();
        this.instructions?.remove();
        this.interactionPrompt?.remove();
        
        for (const n of this.notifications) {
            n.remove();
        }
    }
}

export default UIManager;