/**
 * ГОЙДАБЛОКС - Main Game Class
 * Core game engine and lifecycle management
 */

import * as THREE from 'three';
import { CONFIG, COLORS } from '../config/GameConfig.js';
import { InputManager } from './InputManager.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { Player } from '../entities/Player.js';
import { WorldGenerator } from '../world/WorldGenerator.js';
import { UIManager } from '../ui/UIManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { VehicleManager } from '../vehicles/VehicleManager.js';
import { NPCManager } from '../entities/NPCManager.js';
import { QuestManager } from '../systems/QuestManager.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { DayNightCycle } from '../systems/DayNightCycle.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class Game {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        this.isPaused = false;
        
        // Core systems
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Game systems
        this.inputManager = null;
        this.physicsEngine = null;
        this.player = null;
        this.worldGenerator = null;
        this.uiManager = null;
        this.audioManager = null;
        this.vehicleManager = null;
        this.npcManager = null;
        this.questManager = null;
        this.economySystem = null;
        this.weatherSystem = null;
        this.dayNightCycle = null;
        this.saveSystem = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;
        
        // Game state
        this.gameState = {
            money: CONFIG.economy.startingMoney,
            reputation: 0,
            completedQuests: [],
            ownedVehicles: [],
            currentVehicle: null,
            statistics: {
                playTime: 0,
                distanceWalked: 0,
                distanceDriven: 0,
                shawarmasEaten: 0,
                questsCompleted: 0
            }
        };
    }
    
    /**
     * Initialize the game engine and all subsystems
     */
    async init(container) {
        console.log('🎮 Initializing ГОЙДАБЛОКС...');
        
        try {
            // Initialize Three.js core
            this.initRenderer(container);
            this.initScene();
            this.initCamera();
            this.initLighting();
            
            // Initialize game systems
            this.inputManager = new InputManager(this);
            this.physicsEngine = new PhysicsEngine(this);
            this.audioManager = new AudioManager(this);
            this.uiManager = new UIManager(this);
            this.economySystem = new EconomySystem(this);
            this.saveSystem = new SaveSystem(this);
            
            // Initialize world
            this.worldGenerator = new WorldGenerator(this);
            await this.worldGenerator.generate();
            
            // Initialize entities
            this.player = new Player(this);
            this.vehicleManager = new VehicleManager(this);
            this.npcManager = new NPCManager(this);
            
            // Initialize dynamic systems
            this.questManager = new QuestManager(this);
            this.weatherSystem = new WeatherSystem(this);
            this.dayNightCycle = new DayNightCycle(this);
            
            // Setup event handlers
            this.setupEventHandlers();
            
            // Load saved game if exists
            this.saveSystem.loadGame();
            
            this.isInitialized = true;
            console.log('✅ ГОЙДАБЛОКС initialized successfully!');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            throw error;
        }
    }
    
    /**
     * Initialize WebGL renderer
     */
    initRenderer(container) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: CONFIG.graphics.antialias,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(CONFIG.graphics.pixelRatio);
        this.renderer.shadowMap.enabled = CONFIG.graphics.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        container.appendChild(this.renderer.domElement);
    }
    
    /**
     * Initialize scene
     */
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(COLORS.sky.day);
        this.scene.fog = new THREE.Fog(
            COLORS.sky.day,
            CONFIG.world.fogNear,
            CONFIG.world.fogFar
        );
    }
    
    /**
     * Initialize camera
     */
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.nearPlane,
            CONFIG.camera.farPlane
        );
        this.camera.position.set(0, 10, 20);
    }
    
    /**
     * Initialize lighting system
     */
    initLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;
        
        // Hemisphere light for sky/ground color blending
        const hemisphereLight = new THREE.HemisphereLight(
            0x87CEEB, // sky color
            0x4A7C2A, // ground color
            0.3
        );
        this.scene.add(hemisphereLight);
        this.hemisphereLight = hemisphereLight;
        
        // Main directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        sunLight.position.set(100, 100, 50);
        sunLight.castShadow = true;
        
        // Shadow camera setup
        const shadowCamSize = 150;
        sunLight.shadow.camera.left = -shadowCamSize;
        sunLight.shadow.camera.right = shadowCamSize;
        sunLight.shadow.camera.top = shadowCamSize;
        sunLight.shadow.camera.bottom = -shadowCamSize;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.mapSize.width = CONFIG.graphics.shadowMapSize;
        sunLight.shadow.mapSize.height = CONFIG.graphics.shadowMapSize;
        sunLight.shadow.bias = -0.0001;
        
        this.scene.add(sunLight);
        this.sunLight = sunLight;
    }
    
    /**
     * Setup window and document event handlers
     */
    setupEventHandlers() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Visibility change (tab focus)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            }
        });
        
        // Before unload - save game
        window.addEventListener('beforeunload', () => {
            this.saveSystem.saveGame();
        });
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        if (this.uiManager) {
            this.uiManager.onResize(width, height);
        }
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (!this.isInitialized) {
            console.error('Game not initialized!');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.clock.start();
        
        // Request pointer lock for FPS controls
        this.inputManager.requestPointerLock();
        
        // Start audio
        this.audioManager.startAmbient();
        
        // Begin animation loop
        this.animate();
        
        console.log('🎮 Game started!');
    }
    
    /**
     * Pause the game
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isPaused = true;
        this.clock.stop();
        this.audioManager.pauseAll();
        this.uiManager.showPauseMenu();
        
        console.log('⏸️ Game paused');
    }
    
    /**
     * Resume the game
     */
    resume() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.clock.start();
        this.audioManager.resumeAll();
        this.uiManager.hidePauseMenu();
        this.inputManager.requestPointerLock();
        
        console.log('▶️ Game resumed');
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        // Calculate delta time
        const delta = Math.min(this.clock.getDelta(), 0.1);
        
        // Update FPS counter
        this.updateFPS();
        
        // Skip updates if paused
        if (this.isPaused) {
            this.renderer.render(this.scene, this.camera);
            return;
        }
        
        // Update all systems
        this.update(delta);
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Update all game systems
     */
    update(delta) {
        // Update input
        this.inputManager.update(delta);
        
        // Update physics
        this.physicsEngine.update(delta);
        
        // Update player
        this.player.update(delta);
        
        // Update vehicles
        this.vehicleManager.update(delta);
        
        // Update NPCs
        this.npcManager.update(delta);
        
        // Update world (LOD, streaming)
        this.worldGenerator.update(delta, this.player.position);
        
        // Update dynamic systems
        this.dayNightCycle.update(delta);
        this.weatherSystem.update(delta);
        this.questManager.update(delta);
        
        // Update UI
        this.uiManager.update(delta);
        
        // Update statistics
        this.gameState.statistics.playTime += delta;
    }
    
    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            if (this.uiManager) {
                this.uiManager.updateFPS(this.fps);
            }
        }
    }
    
    /**
     * Get current player position
     */
    getPlayerPosition() {
        return this.player ? this.player.position.clone() : new THREE.Vector3();
    }
    
    /**
     * Add money to player
     */
    addMoney(amount) {
        this.gameState.money += amount;
        this.uiManager.updateMoney(this.gameState.money);
        this.audioManager.playSound('money');
    }
    
    /**
     * Spend money if player has enough
     */
    spendMoney(amount) {
        if (this.gameState.money >= amount) {
            this.gameState.money -= amount;
            this.uiManager.updateMoney(this.gameState.money);
            return true;
        }
        this.audioManager.playSound('error');
        return false;
    }
    
    /**
     * Clean up and destroy game
     */
    destroy() {
        this.isRunning = false;
        
        // Save game
        this.saveSystem.saveGame();
        
        // Dispose all systems
        this.inputManager?.dispose();
        this.audioManager?.dispose();
        this.uiManager?.dispose();
        this.worldGenerator?.dispose();
        this.vehicleManager?.dispose();
        this.npcManager?.dispose();
        
        // Dispose Three.js resources
        this.renderer?.dispose();
        
        // Clear scene
        while (this.scene?.children.length > 0) {
            const child = this.scene.children[0];
            this.scene.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
        
        console.log('🎮 Game destroyed');
    }
}

export default Game;