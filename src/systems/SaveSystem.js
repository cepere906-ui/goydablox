/**
 * ГОЙДАБЛОКС - Save System
 * Handles game state persistence using localStorage
 */

import { CONFIG } from '../config/GameConfig.js';

const SAVE_KEY = 'goydablox_save';
const AUTO_SAVE_INTERVAL = 60000; // 1 minute

export class SaveSystem {
    constructor(game) {
        this.game = game;
        this.autoSaveTimer = null;
        this.lastSaveTime = null;
        this.saveSlots = 5;
        
        // Start auto-save
        this.startAutoSave();
        
        console.log('💾 SaveSystem initialized');
    }
    
    /**
     * Start auto-save timer
     */
    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, AUTO_SAVE_INTERVAL);
    }
    
    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    /**
     * Auto-save to slot 0
     */
    autoSave() {
        this.saveGame(0, 'Автосохранение');
    }
    
    /**
     * Save game to slot
     */
    saveGame(slot = 0, name = null) {
        try {
            const saveData = this.collectSaveData(name);
            const saves = this.getAllSaves();
            
            saves[slot] = saveData;
            
            localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
            
            this.lastSaveTime = Date.now();
            
            this.game.ui?.showNotification('Игра сохранена', 'save');
            console.log(`Game saved to slot ${slot}`);
            
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            this.game.ui?.showNotification('Ошибка сохранения!', 'error');
            return false;
        }
    }
    
    /**
     * Load game from slot
     */
    loadGame(slot = 0) {
        try {
            const saves = this.getAllSaves();
            const saveData = saves[slot];
            
            if (!saveData) {
                this.game.ui?.showNotification('Сохранение не найдено', 'error');
                return false;
            }
            
            this.applySaveData(saveData);
            
            this.game.ui?.showNotification('Игра загружена', 'save');
            console.log(`Game loaded from slot ${slot}`);
            
            return true;
        } catch (error) {
            console.error('Load failed:', error);
            this.game.ui?.showNotification('Ошибка загрузки!', 'error');
            return false;
        }
    }
    
    /**
     * Collect all save data
     */
    collectSaveData(name) {
        const saveData = {
            version: CONFIG.version || '1.0.0',
            timestamp: Date.now(),
            name: name || `Сохранение ${new Date().toLocaleString('ru-RU')}`,
            
            // Player data
            player: this.game.player?.save() || null,
            
            // Economy
            economy: this.game.economy?.save() || null,
            
            // Quests
            quests: this.game.quests?.save() || null,
            
            // Day/Night cycle
            dayNight: this.game.dayNight?.save() || null,
            
            // Weather
            weather: this.game.weather?.save() || null,
            
            // Vehicles
            vehicles: this.saveVehicles(),
            
            // Statistics
            statistics: this.game.statistics || null,
            
            // Settings
            settings: this.saveSettings()
        };
        
        return saveData;
    }
    
    /**
     * Apply save data
     */
    applySaveData(saveData) {
        // Load player
        if (saveData.player && this.game.player) {
            this.game.player.load(saveData.player);
        }
        
        // Load economy
        if (saveData.economy && this.game.economy) {
            this.game.economy.load(saveData.economy);
        }
        
        // Load quests
        if (saveData.quests && this.game.quests) {
            this.game.quests.load(saveData.quests);
        }
        
        // Load day/night
        if (saveData.dayNight && this.game.dayNight) {
            this.game.dayNight.load(saveData.dayNight);
        }
        
        // Load weather
        if (saveData.weather && this.game.weather) {
            this.game.weather.load(saveData.weather);
        }
        
        // Load vehicles
        if (saveData.vehicles) {
            this.loadVehicles(saveData.vehicles);
        }
        
        // Load statistics
        if (saveData.statistics) {
            this.game.statistics = saveData.statistics;
        }
        
        // Load settings
        if (saveData.settings) {
            this.loadSettings(saveData.settings);
        }
    }
    
    /**
     * Save vehicle states
     */
    saveVehicles() {
        if (!this.game.vehicleManager) return [];
        
        return this.game.vehicleManager.vehicles.map(vehicle => ({
            type: vehicle.vehicleType,
            position: {
                x: vehicle.position.x,
                y: vehicle.position.y,
                z: vehicle.position.z
            },
            rotation: vehicle.rotation.y,
            health: vehicle.health,
            fuel: vehicle.fuel
        }));
    }
    
    /**
     * Load vehicle states
     */
    loadVehicles(vehiclesData) {
        if (!this.game.vehicleManager) return;
        
        // Clear existing vehicles
        this.game.vehicleManager.clearVehicles();
        
        // Spawn saved vehicles
        for (const vData of vehiclesData) {
            const vehicle = this.game.vehicleManager.spawnVehicle(
                vData.type,
                new THREE.Vector3(vData.position.x, vData.position.y, vData.position.z)
            );
            
            if (vehicle) {
                vehicle.rotation.y = vData.rotation;
                vehicle.health = vData.health;
                vehicle.fuel = vData.fuel;
            }
        }
    }
    
    /**
     * Save game settings
     */
    saveSettings() {
        return {
            musicVolume: this.game.audio?.musicVolume || 0.5,
            sfxVolume: this.game.audio?.sfxVolume || 0.7,
            mouseSensitivity: this.game.input?.mouseSensitivity || 0.002,
            graphicsQuality: this.game.graphicsQuality || 'medium',
            fullscreen: document.fullscreenElement !== null
        };
    }
    
    /**
     * Load game settings
     */
    loadSettings(settings) {
        if (this.game.audio) {
            this.game.audio.setMusicVolume(settings.musicVolume);
            this.game.audio.setSfxVolume(settings.sfxVolume);
        }
        
        if (this.game.input) {
            this.game.input.mouseSensitivity = settings.mouseSensitivity;
        }
        
        this.game.graphicsQuality = settings.graphicsQuality;
    }
    
    /**
     * Get all saves
     */
    getAllSaves() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to read saves:', error);
            return {};
        }
    }
    
    /**
     * Get save info (without full data)
     */
    getSaveInfo(slot) {
        const saves = this.getAllSaves();
        const save = saves[slot];
        
        if (!save) return null;
        
        return {
            name: save.name,
            timestamp: save.timestamp,
            date: new Date(save.timestamp).toLocaleString('ru-RU'),
            version: save.version,
            playerMoney: save.economy?.money || 0,
            gameDay: save.dayNight?.gameDay || 1,
            playTime: save.statistics?.playTime || 0
        };
    }
    
    /**
     * Get all save slots info
     */
    getAllSaveSlots() {
        const slots = [];
        for (let i = 0; i < this.saveSlots; i++) {
            slots.push({
                slot: i,
                info: this.getSaveInfo(i)
            });
        }
        return slots;
    }
    
    /**
     * Delete save
     */
    deleteSave(slot) {
        try {
            const saves = this.getAllSaves();
            delete saves[slot];
            localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
            
            this.game.ui?.showNotification('Сохранение удалено', 'save');
            return true;
        } catch (error) {
            console.error('Delete failed:', error);
            return false;
        }
    }
    
    /**
     * Clear all saves
     */
    clearAllSaves() {
        try {
            localStorage.removeItem(SAVE_KEY);
            this.game.ui?.showNotification('Все сохранения удалены', 'save');
            return true;
        } catch (error) {
            console.error('Clear failed:', error);
            return false;
        }
    }
    
    /**
     * Check if save exists
     */
    hasSave(slot = 0) {
        const saves = this.getAllSaves();
        return saves[slot] !== undefined;
    }
    
    /**
     * Export save to JSON string
     */
    exportSave(slot = 0) {
        const saves = this.getAllSaves();
        const save = saves[slot];
        
        if (!save) return null;
        
        return JSON.stringify(save, null, 2);
    }
    
    /**
     * Import save from JSON string
     */
    importSave(jsonString, slot = 0) {
        try {
            const saveData = JSON.parse(jsonString);
            
            // Validate save data
            if (!saveData.version || !saveData.timestamp) {
                throw new Error('Invalid save data');
            }
            
            const saves = this.getAllSaves();
            saves[slot] = saveData;
            localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
            
            this.game.ui?.showNotification('Сохранение импортировано', 'save');
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            this.game.ui?.showNotification('Ошибка импорта!', 'error');
            return false;
        }
    }
    
    /**
     * Download save file
     */
    downloadSave(slot = 0) {
        const saveJson = this.exportSave(slot);
        if (!saveJson) return;
        
        const blob = new Blob([saveJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `goydablox_save_${slot}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Upload and import save file
     */
    uploadSave(slot = 0) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.importSave(e.target.result, slot);
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    /**
     * Quick save (Ctrl+S)
     */
    quickSave() {
        this.saveGame(1, 'Быстрое сохранение');
    }
    
    /**
     * Quick load (Ctrl+L)
     */
    quickLoad() {
        this.loadGame(1);
    }
    
    /**
     * Get storage usage
     */
    getStorageUsage() {
        const data = localStorage.getItem(SAVE_KEY);
        if (!data) return 0;
        
        // Approximate size in bytes
        return new Blob([data]).size;
    }
    
    /**
     * Format storage size
     */
    formatStorageSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    
    /**
     * Dispose
     */
    dispose() {
        this.stopAutoSave();
    }
}

export default SaveSystem;