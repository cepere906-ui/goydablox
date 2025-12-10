/**
 * ГОЙДАБЛОКС - Quest Manager
 * Manages game quests and missions
 */

import { CONFIG } from '../config/GameConfig.js';

// Quest definitions
const QUESTS = {
    // Tutorial quests
    TUTORIAL_MOVE: {
        id: 'tutorial_move',
        title: 'Первые шаги',
        description: 'Научись ходить по городу. Используй WASD для движения.',
        objectives: [
            { type: 'walk', distance: 50, current: 0, description: 'Пройди 50 метров' }
        ],
        reward: { money: 100, xp: 10 },
        nextQuest: 'tutorial_car'
    },
    
    TUTORIAL_CAR: {
        id: 'tutorial_car',
        title: 'За рулём Лады',
        description: 'Найди машину и научись водить. Нажми E рядом с машиной.',
        objectives: [
            { type: 'enter_vehicle', current: false, description: 'Сядь в машину' },
            { type: 'drive', distance: 100, current: 0, description: 'Проедь 100 метров' }
        ],
        reward: { money: 200, xp: 25 },
        nextQuest: 'delivery_1'
    },
    
    // Delivery quests
    DELIVERY_1: {
        id: 'delivery_1',
        title: 'Доставка для бабушки',
        description: 'Помоги бабушке донести продукты до дома.',
        objectives: [
            { type: 'goto', target: 'market', current: false, description: 'Дойди до рынка' },
            { type: 'interact', target: 'babushka', current: false, description: 'Поговори с бабушкой' },
            { type: 'goto', target: 'apartment_block', current: false, description: 'Отнеси продукты домой' }
        ],
        reward: { money: 500, xp: 50 },
        nextQuest: 'gopnik_quest'
    },
    
    // Gopnik questline
    GOPNIK_QUEST: {
        id: 'gopnik_quest',
        title: 'Пацаны с района',
        description: 'Пообщайся с местными гопниками у подъезда.',
        objectives: [
            { type: 'goto', target: 'gopnik_spot', current: false, description: 'Найди гопников у подъезда' },
            { type: 'interact', target: 'gopnik', current: false, description: 'Поговори с гопниками' }
        ],
        reward: { money: 300, xp: 30 },
        choices: {
            join: { nextQuest: 'gopnik_job' },
            refuse: { nextQuest: 'honest_work' }
        }
    },
    
    GOPNIK_JOB: {
        id: 'gopnik_job',
        title: 'Семечки бизнес',
        description: 'Продай семечки у метро.',
        objectives: [
            { type: 'goto', target: 'metro', current: false, description: 'Дойди до метро' },
            { type: 'sell_items', item: 'semechki', count: 10, current: 0, description: 'Продай 10 пачек семечек' }
        ],
        reward: { money: 1000, xp: 100 },
        nextQuest: 'territory_war'
    },
    
    // Honest work path
    HONEST_WORK: {
        id: 'honest_work',
        title: 'Честный заработок',
        description: 'Найди работу в городе.',
        objectives: [
            { type: 'goto', target: 'job_center', current: false, description: 'Посети биржу труда' },
            { type: 'interact', target: 'clerk', current: false, description: 'Поговори с работником' }
        ],
        reward: { money: 200, xp: 20 },
        nextQuest: 'taxi_driver'
    },
    
    TAXI_DRIVER: {
        id: 'taxi_driver',
        title: 'Таксист',
        description: 'Работай таксистом и вози пассажиров.',
        objectives: [
            { type: 'pickup_passenger', count: 5, current: 0, description: 'Подвези 5 пассажиров' }
        ],
        reward: { money: 2000, xp: 150 },
        nextQuest: 'big_order'
    },
    
    // Military contract quest
    MILITARY_CONTRACT: {
        id: 'military_contract',
        title: 'Контракт СВО',
        description: 'Военкомат предлагает выгодный контракт.',
        objectives: [
            { type: 'goto', target: 'military_office', current: false, description: 'Посети военкомат' },
            { type: 'interact', target: 'recruiter', current: false, description: 'Поговори с вербовщиком' }
        ],
        reward: { money: 5000000, xp: 1000 },
        special: true
    },
    
    // Fertility center quest
    FERTILITY_QUEST: {
        id: 'fertility_quest',
        title: 'Демографическая миссия',
        description: 'Посети Центр Повышения Рождаемости.',
        objectives: [
            { type: 'goto', target: 'fertility_center', current: false, description: 'Найди Центр Рождаемости' },
            { type: 'interact', target: 'fertility_specialist', current: false, description: 'Поговори со специалистом' }
        ],
        reward: { money: 1000, xp: 50 },
        nextQuest: 'family_life'
    },
    
    // City exploration
    EXPLORER: {
        id: 'explorer',
        title: 'Исследователь',
        description: 'Исследуй все районы города.',
        objectives: [
            { type: 'discover', location: 'center', current: false, description: 'Центр города' },
            { type: 'discover', location: 'industrial', current: false, description: 'Промзона' },
            { type: 'discover', location: 'residential', current: false, description: 'Спальный район' },
            { type: 'discover', location: 'park', current: false, description: 'Парк' }
        ],
        reward: { money: 1500, xp: 100 }
    },
    
    // Racing quest
    STREET_RACER: {
        id: 'street_racer',
        title: 'Ночной гонщик',
        description: 'Выиграй уличную гонку на своей Ладе.',
        objectives: [
            { type: 'race_win', current: false, description: 'Победи в гонке' }
        ],
        reward: { money: 5000, xp: 200 },
        unlocks: ['tuning_shop']
    },
    
    // Big money quest
    OLIGARCH: {
        id: 'oligarch',
        title: 'Путь Олигарха',
        description: 'Заработай миллион рублей.',
        objectives: [
            { type: 'money', amount: 1000000, current: 0, description: 'Накопи 1,000,000 ₽' }
        ],
        reward: { money: 0, xp: 500, unlocks: ['luxury_car', 'mansion'] },
        special: true
    }
};

export class QuestManager {
    constructor(game) {
        this.game = game;
        this.activeQuests = [];
        this.completedQuests = [];
        this.availableQuests = [];
        this.questProgress = {};
        
        // Stats for quest tracking
        this.stats = {
            distanceWalked: 0,
            distanceDriven: 0,
            moneyEarned: 0,
            itemsSold: 0,
            passengersDelivered: 0,
            racesWon: 0,
            locationsDiscovered: []
        };
        
        // Initialize with tutorial quest
        this.addAvailableQuest('tutorial_move');
        this.addAvailableQuest('explorer');
        
        console.log('📋 QuestManager initialized');
    }
    
    /**
     * Add quest to available list
     */
    addAvailableQuest(questId) {
        const quest = QUESTS[questId.toUpperCase()];
        if (!quest) {
            console.warn(`Quest not found: ${questId}`);
            return;
        }
        
        if (!this.availableQuests.includes(questId) && 
            !this.activeQuests.find(q => q.id === questId) &&
            !this.completedQuests.includes(questId)) {
            this.availableQuests.push(questId);
            this.game.ui?.showNotification(`Новое задание доступно: ${quest.title}`, 'quest');
        }
    }
    
    /**
     * Start a quest
     */
    startQuest(questId) {
        const questDef = QUESTS[questId.toUpperCase()];
        if (!questDef) return false;
        
        // Remove from available
        const availIndex = this.availableQuests.indexOf(questId);
        if (availIndex > -1) {
            this.availableQuests.splice(availIndex, 1);
        }
        
        // Create quest instance
        const quest = {
            ...questDef,
            objectives: questDef.objectives.map(obj => ({ ...obj })),
            startTime: Date.now()
        };
        
        this.activeQuests.push(quest);
        this.game.ui?.showNotification(`Задание начато: ${quest.title}`, 'quest');
        this.game.audio?.playSound('quest_start');
        
        return true;
    }
    
    /**
     * Update quest progress
     */
    update(delta) {
        // Update stats from player/game
        if (this.game.player) {
            // Track walking
            if (!this.game.player.inVehicle) {
                const speed = this.game.player.velocity?.length() || 0;
                this.stats.distanceWalked += speed * delta;
            }
            
            // Track driving
            if (this.game.player.currentVehicle) {
                const speed = this.game.player.currentVehicle.speed || 0;
                this.stats.distanceDriven += speed * delta;
            }
            
            // Track money
            this.stats.moneyEarned = this.game.economy?.totalEarned || 0;
        }
        
        // Check quest objectives
        for (const quest of this.activeQuests) {
            this.checkQuestProgress(quest);
        }
    }
    
    /**
     * Check progress of a quest
     */
    checkQuestProgress(quest) {
        let allComplete = true;
        
        for (const objective of quest.objectives) {
            if (this.isObjectiveComplete(objective)) {
                objective.complete = true;
            } else {
                allComplete = false;
            }
        }
        
        if (allComplete) {
            this.completeQuest(quest);
        }
    }
    
    /**
     * Check if objective is complete
     */
    isObjectiveComplete(objective) {
        switch (objective.type) {
            case 'walk':
                objective.current = this.stats.distanceWalked;
                return objective.current >= objective.distance;
                
            case 'drive':
                objective.current = this.stats.distanceDriven;
                return objective.current >= objective.distance;
                
            case 'enter_vehicle':
                return this.game.player?.inVehicle || false;
                
            case 'goto':
                return this.isAtLocation(objective.target);
                
            case 'interact':
                return this.questProgress[`interact_${objective.target}`] || false;
                
            case 'sell_items':
                objective.current = this.stats.itemsSold;
                return objective.current >= objective.count;
                
            case 'pickup_passenger':
                objective.current = this.stats.passengersDelivered;
                return objective.current >= objective.count;
                
            case 'discover':
                return this.stats.locationsDiscovered.includes(objective.location);
                
            case 'race_win':
                return this.stats.racesWon > 0;
                
            case 'money':
                objective.current = this.game.economy?.money || 0;
                return objective.current >= objective.amount;
                
            default:
                return objective.current || false;
        }
    }
    
    /**
     * Check if player is at location
     */
    isAtLocation(locationId) {
        // Get player position
        const playerPos = this.game.player?.position;
        if (!playerPos) return false;
        
        // Get location bounds from world
        const location = this.game.world?.getLocationBounds(locationId);
        if (!location) return false;
        
        // Check if player is within bounds
        return playerPos.x >= location.minX && playerPos.x <= location.maxX &&
               playerPos.z >= location.minZ && playerPos.z <= location.maxZ;
    }
    
    /**
     * Complete a quest
     */
    completeQuest(quest) {
        // Remove from active
        const index = this.activeQuests.indexOf(quest);
        if (index > -1) {
            this.activeQuests.splice(index, 1);
        }
        
        // Add to completed
        this.completedQuests.push(quest.id);
        
        // Give rewards
        if (quest.reward) {
            if (quest.reward.money) {
                this.game.economy?.addMoney(quest.reward.money, 'quest_reward');
            }
            if (quest.reward.xp) {
                this.game.player?.addXP(quest.reward.xp);
            }
            if (quest.reward.unlocks) {
                for (const unlock of quest.reward.unlocks) {
                    this.game.unlock(unlock);
                }
            }
        }
        
        // Show completion
        this.game.ui?.showNotification(`Задание выполнено: ${quest.title}`, 'quest_complete');
        this.game.ui?.showQuestComplete(quest);
        this.game.audio?.playSound('quest_complete');
        
        // Unlock next quest
        if (quest.nextQuest) {
            this.addAvailableQuest(quest.nextQuest);
        }
    }
    
    /**
     * Make a quest choice
     */
    makeChoice(questId, choice) {
        const questDef = QUESTS[questId.toUpperCase()];
        if (!questDef || !questDef.choices) return;
        
        const choiceData = questDef.choices[choice];
        if (choiceData && choiceData.nextQuest) {
            this.addAvailableQuest(choiceData.nextQuest);
        }
    }
    
    /**
     * Record interaction
     */
    recordInteraction(target) {
        this.questProgress[`interact_${target}`] = true;
    }
    
    /**
     * Discover location
     */
    discoverLocation(locationId) {
        if (!this.stats.locationsDiscovered.includes(locationId)) {
            this.stats.locationsDiscovered.push(locationId);
            this.game.ui?.showNotification(`Новое место: ${this.getLocationName(locationId)}`, 'discovery');
        }
    }
    
    /**
     * Get location display name
     */
    getLocationName(locationId) {
        const names = {
            'center': 'Центр города',
            'industrial': 'Промышленный район',
            'residential': 'Спальный район',
            'park': 'Городской парк',
            'market': 'Рынок',
            'metro': 'Метро'
        };
        return names[locationId] || locationId;
    }
    
    /**
     * Get active quests
     */
    getActiveQuests() {
        return this.activeQuests;
    }
    
    /**
     * Get available quests
     */
    getAvailableQuests() {
        return this.availableQuests.map(id => QUESTS[id.toUpperCase()]);
    }
    
    /**
     * Get quest by ID
     */
    getQuest(questId) {
        return QUESTS[questId.toUpperCase()];
    }
    
    /**
     * Save quest state
     */
    save() {
        return {
            activeQuests: this.activeQuests.map(q => q.id),
            completedQuests: this.completedQuests,
            availableQuests: this.availableQuests,
            questProgress: this.questProgress,
            stats: this.stats
        };
    }
    
    /**
     * Load quest state
     */
    load(data) {
        if (!data) return;
        
        this.completedQuests = data.completedQuests || [];
        this.availableQuests = data.availableQuests || [];
        this.questProgress = data.questProgress || {};
        this.stats = { ...this.stats, ...data.stats };
        
        // Restore active quests
        this.activeQuests = [];
        for (const questId of (data.activeQuests || [])) {
            this.startQuest(questId);
        }
    }
}

export default QuestManager;