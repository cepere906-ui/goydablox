// ==================== MAIN ENTRY POINT ====================
// ГОЙДАБЛОКС - Симулятор жизни в России

import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { Renderer } from './engine/renderer.js';
import { Input } from './engine/input.js';
import { Physics } from './engine/physics.js';
import { Player } from './entities/player.js';
import { NPCManager } from './entities/npc.js';
import { Terrain } from './world/terrain.js';
import { Buildings } from './world/buildings.js';
import { Vehicles } from './world/vehicles.js';
import { TimeSystem } from './systems/time.js';
import { Interaction } from './systems/interaction.js';
import { UI } from './ui/ui.js';

class Game {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.currentFPS = 0;
    }
    
    async init() {
        console.log('🎮 ГОЙДАБЛОКС - Инициализация...');
        
        try {
            // Показать экран загрузки
            this.showLoading('Инициализация движка...');
            
            // Инициализация рендера
            await this.initRenderer();
            this.showLoading('Создание мира...', 20);
            
            // Инициализация мира
            await this.initWorld();
            this.showLoading('Загрузка объектов...', 50);
            
            // Инициализация игрока и NPC
            await this.initEntities();
            this.showLoading('Настройка систем...', 70);
            
            // Инициализация систем
            await this.initSystems();
            this.showLoading('Подготовка интерфейса...', 90);
            
            // Инициализация UI
            await this.initUI();
            this.showLoading('Готово!', 100);
            
            // Скрыть загрузку
            setTimeout(() => {
                this.hideLoading();
                this.showMainMenu();
            }, 500);
            
            console.log('✅ Игра инициализирована');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showError(error.message);
        }
    }
    
    async initRenderer() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            throw new Error('Canvas не найден');
        }
        
        Renderer.init(canvas);
        
        // Настройка освещения
        this.setupLighting();
        
        // Настройка тумана
        Renderer.scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);
    }
    
    setupLighting() {
        const scene = Renderer.scene;
        
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambient);
        
        // Directional light (солнце)
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(100, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 400;
        sun.shadow.camera.left = -200;
        sun.shadow.camera.right = 200;
        sun.shadow.camera.top = 200;
        sun.shadow.camera.bottom = -200;
        scene.add(sun);
        
        this.sunLight = sun;
        
        // Hemisphere light
        const hemi = new THREE.HemisphereLight(0x87CEEB, 0x3d5c3d, 0.3);
        scene.add(hemi);
    }
    
    async initWorld() {
        const scene = Renderer.scene;
        
        // Terrain
        Terrain.init(scene);
        
        // Buildings
        Buildings.init(scene);
        
        // Vehicles
        Vehicles.init(scene);
        
        // Skybox
        this.createSkybox();
    }
    
    createSkybox() {
        const geometry = new THREE.SphereGeometry(500, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        
        this.skybox = new THREE.Mesh(geometry, material);
        Renderer.scene.add(this.skybox);
    }
    
    async initEntities() {
        const scene = Renderer.scene;
        
        // Player
        Player.init(scene);
        
        // Привязать камеру к игроку
        Player.attachCamera(Renderer.camera);
        
        // NPCs
        NPCManager.init(scene);
        
        // Добавить коллизии
        Physics.addCollidables(Buildings.getBuildingMeshes());
        Physics.addCollidables(Vehicles.getAllVehicles().map(v => v.mesh));
    }
    
    async initSystems() {
        // Input
        Input.init();
        
        // Time system
        TimeSystem.init();
        
        // Interaction
        Interaction.init(Renderer.scene);
        
        // События ввода
        this.setupInputEvents();
    }
    
    setupInputEvents() {
        // Прыжок
        Input.on('jump', () => {
            if (!GameState.isPaused) {
                Player.jump();
            }
        });
        
        // Взаимодействие
        Input.on('interact', () => {
            if (!GameState.isPaused) {
                Interaction.tryInteract(Player.getPosition(), Player.getRotation());
            }
        });
        
        // Инвентарь
        Input.on('inventory', () => {
            if (UI.currentShop || UI.currentDialog) return;
            UI.showInventory();
        });
        
        // Пауза
        Input.on('pause', () => {
            this.togglePause();
        });
        
        // Выход из машины
        Input.on('exit_vehicle', () => {
            if (GameState.currentVehicle) {
                this.exitVehicle();
            }
        });
    }
    
    async initUI() {
        UI.init();
        
        // Привязать кнопки меню
        this.setupMenuButtons();
    }
    
    setupMenuButtons() {
        // Главное меню
        document.getElementById('btn-new-game')?.addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('btn-continue')?.addEventListener('click', () => {
            this.continueGame();
        });
        
        document.getElementById('btn-settings')?.addEventListener('click', () => {
            UI.showSettings();
        });
        
        // Меню паузы
        document.getElementById('btn-resume')?.addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('btn-pause-settings')?.addEventListener('click', () => {
            UI.hidePauseMenu();
            UI.showSettings();
        });
        
        document.getElementById('btn-main-menu')?.addEventListener('click', () => {
            this.returnToMainMenu();
        });
        
        document.getElementById('btn-save')?.addEventListener('click', () => {
            GameState.save();
            UI.notify('Игра', 'Игра сохранена', 'success');
        });
    }
    
    showLoading(text, progress = 0) {
        const screen = document.getElementById('loading-screen');
        const textEl = document.getElementById('loading-text');
        const bar = document.getElementById('loading-progress');
        
        if (screen) screen.classList.remove('hidden');
        if (textEl) textEl.textContent = text;
        if (bar) bar.style.width = `${progress}%`;
    }
    
    hideLoading() {
        const screen = document.getElementById('loading-screen');
        if (screen) screen.classList.add('hidden');
    }
    
    showMainMenu() {
        const menu = document.getElementById('main-menu');
        if (menu) menu.classList.remove('hidden');
        
        // Показать кнопку продолжить если есть сохранение
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            continueBtn.style.display = GameState.hasSave() ? 'block' : 'none';
        }
        
        UI.hideHUD();
    }
    
    hideMainMenu() {
        const menu = document.getElementById('main-menu');
        if (menu) menu.classList.add('hidden');
    }
    
    showError(message) {
        this.hideLoading();
        alert('Ошибка: ' + message);
    }
    
    startNewGame() {
        GameState.reset();
        this.hideMainMenu();
        UI.showHUD();
        this.start();
        
        // Приветственное сообщение
        setTimeout(() => {
            UI.notify('Добро пожаловать!', 'Добро пожаловать в ГОЙДАБЛОКС!', 'info');
        }, 1000);
    }
    
    continueGame() {
        if (GameState.load()) {
            this.hideMainMenu();
            UI.showHUD();
            
            // Восстановить позицию игрока
            Player.setPosition(GameState.position.x, GameState.position.y, GameState.position.z);
            
            this.start();
        } else {
            this.startNewGame();
        }
    }
    
    returnToMainMenu() {
        this.stop();
        GameState.save();
        UI.hidePauseMenu();
        UI.hideHUD();
        this.showMainMenu();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        GameState.isPaused = false;
        this.lastTime = performance.now();
        
        // Захватить курсор
        Renderer.canvas.requestPointerLock();
        
        this.gameLoop();
        console.log('🎮 Игра запущена');
    }
    
    stop() {
        this.isRunning = false;
        document.exitPointerLock();
    }
    
    togglePause() {
        if (UI.currentShop || UI.currentDialog) return;
        
        if (GameState.isPaused) {
            UI.hidePauseMenu();
            GameState.isPaused = false;
            Renderer.canvas.requestPointerLock();
        } else {
            UI.showPauseMenu();
            GameState.isPaused = true;
            document.exitPointerLock();
        }
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // FPS counter
        this.frameCount++;
        this.fpsTime += deltaTime;
        if (this.fpsTime >= 1) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = 0;
            this.updateDebugInfo();
        }
        
        if (!GameState.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Ограничить deltaTime
        const dt = Math.min(deltaTime, 0.1);
        
        // Input
        const input = Input.getState();
        
        // Обновление игрока/машины
        if (GameState.currentVehicle) {
            GameState.currentVehicle.updateControls(input, dt);
            Player.updateInVehicle(GameState.currentVehicle);
            UI.updateVehicleHUD(GameState.currentVehicle);
        } else {
            Player.update(input, dt);
        }
        
        // Обновление мира
        Vehicles.update(dt);
        NPCManager.update(dt);
        
        // Системы
        TimeSystem.update(dt);
        this.updateDayNight();
        
        // UI
        UI.updateMinimap(
            Player.getPosition(),
            Player.getRotation(),
            Buildings.getBuildingPositions(),
            Vehicles.getVehicleData()
        );
        
        UI.updateQuestTracker();
        this.updateStatsUI();
        
        // Сохранить позицию
        const pos = Player.getPosition();
        GameState.position = { x: pos.x, y: pos.y, z: pos.z };
    }
    
    updateDayNight() {
        const time = TimeSystem.getCurrentTime();
        const hour = Math.floor(time);
        
        // Цвет неба
        let skyColor, sunIntensity, ambientIntensity;
        
        if (hour >= 6 && hour < 8) {
            // Рассвет
            const t = (hour - 6 + (time - hour)) / 2;
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(0x1a1a2e),
                new THREE.Color(0x87CEEB),
                t
            );
            sunIntensity = 0.3 + t * 0.7;
            ambientIntensity = 0.2 + t * 0.3;
        } else if (hour >= 8 && hour < 18) {
            // День
            skyColor = new THREE.Color(0x87CEEB);
            sunIntensity = 1;
            ambientIntensity = 0.5;
        } else if (hour >= 18 && hour < 20) {
            // Закат
            const t = (hour - 18 + (time - hour)) / 2;
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(0x87CEEB),
                new THREE.Color(0xFF6B35),
                t
            );
            sunIntensity = 1 - t * 0.5;
            ambientIntensity = 0.5 - t * 0.2;
        } else if (hour >= 20 && hour < 22) {
            // Сумерки
            const t = (hour - 20 + (time - hour)) / 2;
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(0xFF6B35),
                new THREE.Color(0x1a1a2e),
                t
            );
            sunIntensity = 0.5 - t * 0.4;
            ambientIntensity = 0.3 - t * 0.15;
        } else {
            // Ночь
            skyColor = new THREE.Color(0x1a1a2e);
            sunIntensity = 0.1;
            ambientIntensity = 0.15;
        }
        
        // Применить
        if (this.skybox) {
            this.skybox.material.color = skyColor;
        }
        
        if (this.sunLight) {
            this.sunLight.intensity = sunIntensity;
        }
        
        if (Renderer.scene.fog) {
            Renderer.scene.fog.color = skyColor;
        }
    }
    
    updateStatsUI() {
        // Health
        const healthBar = document.getElementById('health-bar');
        if (healthBar) {
            healthBar.style.width = `${GameState.stats.health}%`;
        }
        
        // Hunger
        const hungerBar = document.getElementById('hunger-bar');
        if (hungerBar) {
            hungerBar.style.width = `${GameState.stats.hunger}%`;
        }
        
        // Energy
        const energyBar = document.getElementById('energy-bar');
        if (energyBar) {
            energyBar.style.width = `${GameState.stats.energy}%`;
        }
        
        // Money
        const moneyEl = document.getElementById('money-value');
        if (moneyEl) {
            moneyEl.textContent = GameState.money.toLocaleString('ru-RU');
        }
        
        // Time
        const timeEl = document.getElementById('game-time');
        const dateEl = document.getElementById('game-date');
        const weatherEl = document.getElementById('weather-icon');
        if (timeEl) {
            timeEl.textContent = TimeSystem.getFormattedTime();
        }
        if (dateEl) {
            dateEl.textContent = TimeSystem.getFormattedDate();
        }
        if (weatherEl) {
            weatherEl.textContent = TimeSystem.getWeatherIcon();
        }
    }
    
    updateDebugInfo() {
        const fpsEl = document.getElementById('fps-counter');
        if (fpsEl) {
            fpsEl.textContent = `FPS: ${this.currentFPS}`;
        }
    }
    
    render() {
        Renderer.render();
    }
    
    enterVehicle(vehicle) {
        if (!vehicle || vehicle.isOccupied) return;
        
        vehicle.enter();
        GameState.currentVehicle = vehicle;
        
        // Показать спидометр
        document.getElementById('vehicle-hud')?.classList.remove('hidden');
        
        UI.notify('Транспорт', `Вы сели в ${vehicle.getModelName()}`, 'info');
    }
    
    exitVehicle() {
        const vehicle = GameState.currentVehicle;
        if (!vehicle) return;
        
        // Найти точку выхода
        const exitPos = vehicle.getExitPosition();
        Player.setPosition(exitPos.x, exitPos.y, exitPos.z);
        
        vehicle.exit();
        GameState.currentVehicle = null;
        
        // Скрыть спидометр
        document.getElementById('vehicle-hud')?.classList.add('hidden');
    }
}

// ==================== ЗАПУСК ИГРЫ ====================

const game = new Game();

// Ждём загрузки Three.js
function waitForThree() {
    if (typeof THREE !== 'undefined') {
        game.init();
    } else {
        setTimeout(waitForThree, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForThree);
} else {
    waitForThree();
}

// Экспорт для доступа из консоли
window.game = game;
window.GameState = GameState;