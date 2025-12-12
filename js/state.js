// ==================== ИГРОВОЕ СОСТОЯНИЕ ====================
import { CONFIG } from './config.js';

class GameStateManager {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.isLoading = true;
        
        // Состояние игрока
        this.player = {
            position: { x: 0, y: CONFIG.player.height, z: 10 },
            rotation: { x: 0, y: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            onGround: true,
            isRunning: false,
            inVehicle: false,
            currentVehicle: null
        };
        
        // Статы
        this.stats = {
            health: 100,
            hunger: 100,
            energy: 100,
            mood: 100
        };
        
        // Экономика
        this.money = CONFIG.economy.startMoney;
        this.inventory = [];
        this.ownedVehicles = [];
        
        // Время
        this.time = {
            day: 1,
            month: 5, // Июнь (0-indexed)
            year: 2024,
            hour: CONFIG.time.startHour,
            minute: 0,
            totalMinutes: 0
        };
        
        // Погода
        this.weather = 'clear';
        this.weatherTimer = 0;
        
        // Квесты
        this.quests = {
            active: [],
            completed: [],
            current: null
        };
        
        // Достижения
        this.achievements = [];
        
        // Статистика
        this.statistics = {
            distanceWalked: 0,
            distanceDriven: 0,
            moneyEarned: 0,
            moneySpent: 0,
            questsCompleted: 0,
            npcstalkedTo: 0,
            foodEaten: 0,
            timePlayed: 0
        };
        
        // Отношения с NPC
        this.relationships = {};
        
        // Обнаруженные локации
        this.discoveredLocations = new Set();
        
        // Настройки
        this.settings = {
            shadows: 'medium',
            renderDistance: 300,
            sensitivity: 5,
            invertY: false,
            volume: 70,
            music: 50
        };
    }
    
    // Сохранение игры
    save() {
        const saveData = {
            version: '2.0',
            timestamp: Date.now(),
            player: this.player,
            stats: this.stats,
            money: this.money,
            inventory: this.inventory,
            ownedVehicles: this.ownedVehicles,
            time: this.time,
            weather: this.weather,
            quests: this.quests,
            achievements: this.achievements,
            statistics: this.statistics,
            relationships: this.relationships,
            discoveredLocations: Array.from(this.discoveredLocations),
            settings: this.settings
        };
        
        try {
            localStorage.setItem('goydablox_save', JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Ошибка сохранения:', e);
            return false;
        }
    }
    
    // Загрузка игры
    load() {
        try {
            const saveData = localStorage.getItem('goydablox_save');
            if (!saveData) return false;
            
            const data = JSON.parse(saveData);
            
            // Проверка версии
            if (data.version !== '2.0') {
                console.warn('Устаревшее сохранение');
            }
            
            // Восстановление данных
            this.player = data.player || this.player;
            this.stats = data.stats || this.stats;
            this.money = data.money ?? this.money;
            this.inventory = data.inventory || [];
            this.ownedVehicles = data.ownedVehicles || [];
            this.time = data.time || this.time;
            this.weather = data.weather || 'clear';
            this.quests = data.quests || this.quests;
            this.achievements = data.achievements || [];
            this.statistics = data.statistics || this.statistics;
            this.relationships = data.relationships || {};
            this.discoveredLocations = new Set(data.discoveredLocations || []);
            this.settings = { ...this.settings, ...data.settings };
            
            return true;
        } catch (e) {
            console.error('Ошибка загрузки:', e);
            return false;
        }
    }
    
    // Проверка наличия сохранения
    hasSave() {
        return localStorage.getItem('goydablox_save') !== null;
    }
    
    // Удаление сохранения
    deleteSave() {
        localStorage.removeItem('goydablox_save');
    }
    
    // Модификация денег
    addMoney(amount) {
        this.money += amount;
        if (amount > 0) {
            this.statistics.moneyEarned += amount;
        } else {
            this.statistics.moneySpent -= amount;
        }
        return this.money;
    }
    
    // Проверка денег
    canAfford(amount) {
        return this.money >= amount;
    }
    
    // Трата денег
    spendMoney(amount) {
        if (this.canAfford(amount)) {
            this.money -= amount;
            this.statistics.moneySpent += amount;
            return true;
        }
        return false;
    }
    
    // Модификация статов
    modifyStat(stat, amount) {
        if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat] = Math.max(0, Math.min(100, this.stats[stat] + amount));
            return this.stats[stat];
        }
        return null;
    }
    
    // Добавить в инвентарь
    addToInventory(item) {
        const existing = this.inventory.find(i => i.id === item.id);
        if (existing && item.stackable) {
            existing.count = (existing.count || 1) + (item.count || 1);
        } else {
            this.inventory.push({ ...item, count: item.count || 1 });
        }
    }
    
    // Удалить из инвентаря
    removeFromInventory(itemId, count = 1) {
        const index = this.inventory.findIndex(i => i.id === itemId);
        if (index === -1) return false;
        
        const item = this.inventory[index];
        if (item.count > count) {
            item.count -= count;
        } else {
            this.inventory.splice(index, 1);
        }
        return true;
    }
    
    // Обнаружить локацию
    discoverLocation(locationId) {
        if (!this.discoveredLocations.has(locationId)) {
            this.discoveredLocations.add(locationId);
            return true;
        }
        return false;
    }
    
    // Начать квест
    startQuest(quest) {
        if (!this.quests.active.find(q => q.id === quest.id)) {
            this.quests.active.push({
                ...quest,
                startTime: Date.now(),
                progress: {}
            });
            if (!this.quests.current) {
                this.quests.current = quest.id;
            }
            return true;
        }
        return false;
    }
    
    // Обновить прогресс квеста
    updateQuestProgress(questId, objectiveId, value) {
        const quest = this.quests.active.find(q => q.id === questId);
        if (quest) {
            quest.progress[objectiveId] = value;
            return true;
        }
        return false;
    }
    
    // Завершить квест
    completeQuest(questId) {
        const index = this.quests.active.findIndex(q => q.id === questId);
        if (index !== -1) {
            const quest = this.quests.active.splice(index, 1)[0];
            this.quests.completed.push({
                ...quest,
                completedTime: Date.now()
            });
            this.statistics.questsCompleted++;
            
            if (this.quests.current === questId) {
                this.quests.current = this.quests.active[0]?.id || null;
            }
            return quest;
        }
        return null;
    }
    
    // Добавить достижение
    addAchievement(achievement) {
        if (!this.achievements.find(a => a.id === achievement.id)) {
            this.achievements.push({
                ...achievement,
                unlockedTime: Date.now()
            });
            return true;
        }
        return false;
    }
}

// Singleton
export const GameState = new GameStateManager();