/**
 * ГОЙДАБЛОКС - Economy System
 * Manages money, transactions, and economic mechanics
 */

import { CONFIG } from '../config/GameConfig.js';

// Prices and rewards
const PRICES = {
    // Items
    semechki: 15,
    vodka: 250,
    cigarettes: 150,
    bread: 45,
    kvass: 80,
    shawarma: 200,
    
    // Services
    taxi_ride: 150,
    metro_ticket: 60,
    bus_ticket: 40,
    
    // Vehicles
    lada_2107: 150000,
    lada_2109: 200000,
    lada_priora: 350000,
    lada_vesta: 900000,
    lada_niva: 750000,
    
    // Property
    garage: 500000,
    apartment: 3000000,
    dacha: 2000000
};

const EARNINGS = {
    // Jobs
    taxi_per_km: 30,
    delivery_base: 200,
    gopnik_protection: 500,
    
    // Special
    military_contract_bonus: 5000000,
    fertility_bonus: 500000,
    
    // Passive
    rent_income: 10000 // per day
};

export class EconomySystem {
    constructor(game) {
        this.game = game;
        
        // Player money
        this.money = CONFIG.economy.startingMoney;
        this.totalEarned = 0;
        this.totalSpent = 0;
        
        // Transaction history
        this.transactions = [];
        this.maxTransactionHistory = 100;
        
        // Owned assets
        this.ownedVehicles = [];
        this.ownedProperties = [];
        this.inventory = {};
        
        // Jobs and income
        this.currentJob = null;
        this.jobEarnings = 0;
        
        // Debts
        this.debt = 0;
        this.debtInterest = 0.15; // 15% per game day
        
        console.log('💰 EconomySystem initialized');
    }
    
    /**
     * Add money
     */
    addMoney(amount, reason = 'unknown') {
        this.money += amount;
        this.totalEarned += amount;
        
        this.addTransaction({
            type: 'income',
            amount: amount,
            reason: reason,
            timestamp: Date.now()
        });
        
        // Update UI
        this.game.ui?.updateMoney(this.money);
        this.game.ui?.showMoneyChange(amount, true);
        
        // Play sound
        if (amount >= 10000) {
            this.game.audio?.playSound('money_big');
        } else {
            this.game.audio?.playSound('money');
        }
        
        // Check achievements
        this.checkMoneyAchievements();
        
        return true;
    }
    
    /**
     * Spend money
     */
    spendMoney(amount, reason = 'unknown') {
        if (this.money < amount) {
            this.game.ui?.showNotification('Недостаточно денег!', 'error');
            this.game.audio?.playSound('error');
            return false;
        }
        
        this.money -= amount;
        this.totalSpent += amount;
        
        this.addTransaction({
            type: 'expense',
            amount: amount,
            reason: reason,
            timestamp: Date.now()
        });
        
        // Update UI
        this.game.ui?.updateMoney(this.money);
        this.game.ui?.showMoneyChange(-amount, false);
        
        return true;
    }
    
    /**
     * Add transaction to history
     */
    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        
        // Limit history size
        if (this.transactions.length > this.maxTransactionHistory) {
            this.transactions.pop();
        }
    }
    
    /**
     * Buy item
     */
    buyItem(itemId, quantity = 1) {
        const price = PRICES[itemId];
        if (!price) {
            console.warn(`Unknown item: ${itemId}`);
            return false;
        }
        
        const totalCost = price * quantity;
        
        if (!this.spendMoney(totalCost, `buy_${itemId}`)) {
            return false;
        }
        
        // Add to inventory
        this.inventory[itemId] = (this.inventory[itemId] || 0) + quantity;
        
        this.game.ui?.showNotification(`Куплено: ${this.getItemName(itemId)} x${quantity}`, 'purchase');
        
        return true;
    }
    
    /**
     * Sell item
     */
    sellItem(itemId, quantity = 1) {
        if (!this.inventory[itemId] || this.inventory[itemId] < quantity) {
            this.game.ui?.showNotification('Нет товара для продажи!', 'error');
            return false;
        }
        
        const price = PRICES[itemId];
        if (!price) return false;
        
        // Sell at 70% of buy price
        const sellPrice = Math.floor(price * 0.7 * quantity);
        
        this.inventory[itemId] -= quantity;
        if (this.inventory[itemId] <= 0) {
            delete this.inventory[itemId];
        }
        
        this.addMoney(sellPrice, `sell_${itemId}`);
        
        // Update quest stats
        if (this.game.quests) {
            this.game.quests.stats.itemsSold += quantity;
        }
        
        return true;
    }
    
    /**
     * Buy vehicle
     */
    buyVehicle(vehicleId) {
        const price = PRICES[vehicleId];
        if (!price) {
            console.warn(`Unknown vehicle: ${vehicleId}`);
            return false;
        }
        
        if (!this.spendMoney(price, `buy_vehicle_${vehicleId}`)) {
            return false;
        }
        
        this.ownedVehicles.push({
            id: vehicleId,
            purchaseDate: Date.now(),
            condition: 100,
            upgrades: []
        });
        
        this.game.ui?.showNotification(`Куплено: ${this.getVehicleName(vehicleId)}!`, 'purchase');
        
        return true;
    }
    
    /**
     * Buy property
     */
    buyProperty(propertyId) {
        const price = PRICES[propertyId];
        if (!price) {
            console.warn(`Unknown property: ${propertyId}`);
            return false;
        }
        
        if (!this.spendMoney(price, `buy_property_${propertyId}`)) {
            return false;
        }
        
        this.ownedProperties.push({
            id: propertyId,
            purchaseDate: Date.now()
        });
        
        this.game.ui?.showNotification(`Куплено: ${this.getPropertyName(propertyId)}!`, 'purchase');
        
        return true;
    }
    
    /**
     * Take loan
     */
    takeLoan(amount) {
        const maxLoan = 1000000;
        
        if (this.debt + amount > maxLoan) {
            this.game.ui?.showNotification('Слишком большой долг!', 'error');
            return false;
        }
        
        this.debt += amount;
        this.addMoney(amount, 'loan');
        
        this.game.ui?.showNotification(`Взят кредит: ${this.formatMoney(amount)}`, 'warning');
        
        return true;
    }
    
    /**
     * Pay debt
     */
    payDebt(amount) {
        if (amount > this.debt) {
            amount = this.debt;
        }
        
        if (!this.spendMoney(amount, 'debt_payment')) {
            return false;
        }
        
        this.debt -= amount;
        
        this.game.ui?.showNotification(`Долг уменьшен на ${this.formatMoney(amount)}`, 'success');
        
        return true;
    }
    
    /**
     * Start job
     */
    startJob(jobId) {
        this.currentJob = {
            id: jobId,
            startTime: Date.now(),
            earnings: 0
        };
        
        this.game.ui?.showNotification(`Вы начали работу: ${this.getJobName(jobId)}`, 'job');
    }
    
    /**
     * End job and collect earnings
     */
    endJob() {
        if (!this.currentJob) return 0;
        
        const earnings = this.currentJob.earnings;
        this.addMoney(earnings, `job_${this.currentJob.id}`);
        
        this.game.ui?.showNotification(`Заработок: ${this.formatMoney(earnings)}`, 'job');
        
        const job = this.currentJob;
        this.currentJob = null;
        
        return earnings;
    }
    
    /**
     * Add job earnings
     */
    addJobEarnings(amount) {
        if (this.currentJob) {
            this.currentJob.earnings += amount;
            this.game.ui?.showNotification(`+${this.formatMoney(amount)}`, 'job');
        }
    }
    
    /**
     * Calculate taxi fare
     */
    calculateTaxiFare(distance) {
        const baseFare = 50;
        const perKm = EARNINGS.taxi_per_km;
        return Math.floor(baseFare + distance * perKm);
    }
    
    /**
     * Update economy (called each game day)
     */
    updateDaily() {
        // Apply debt interest
        if (this.debt > 0) {
            const interest = Math.floor(this.debt * this.debtInterest);
            this.debt += interest;
            this.game.ui?.showNotification(`Начислены проценты: ${this.formatMoney(interest)}`, 'warning');
        }
        
        // Collect rent from properties
        let rentIncome = 0;
        for (const property of this.ownedProperties) {
            if (property.id === 'apartment') {
                rentIncome += EARNINGS.rent_income;
            }
        }
        
        if (rentIncome > 0) {
            this.addMoney(rentIncome, 'rent_income');
        }
    }
    
    /**
     * Check money achievements
     */
    checkMoneyAchievements() {
        if (this.totalEarned >= 100000) {
            this.game.achievements?.unlock('first_100k');
        }
        if (this.totalEarned >= 1000000) {
            this.game.achievements?.unlock('millionaire');
        }
        if (this.money >= 1000000) {
            this.game.quests?.checkQuestProgress({ type: 'money', amount: 1000000 });
        }
    }
    
    /**
     * Get item name
     */
    getItemName(itemId) {
        const names = {
            semechki: 'Семечки',
            vodka: 'Водка',
            cigarettes: 'Сигареты',
            bread: 'Хлеб',
            kvass: 'Квас',
            shawarma: 'Шаурма'
        };
        return names[itemId] || itemId;
    }
    
    /**
     * Get vehicle name
     */
    getVehicleName(vehicleId) {
        const names = {
            lada_2107: 'ВАЗ-2107 "Семёрка"',
            lada_2109: 'ВАЗ-2109 "Девятка"',
            lada_priora: 'Lada Priora',
            lada_vesta: 'Lada Vesta',
            lada_niva: 'Lada Niva'
        };
        return names[vehicleId] || vehicleId;
    }
    
    /**
     * Get property name
     */
    getPropertyName(propertyId) {
        const names = {
            garage: 'Гараж',
            apartment: 'Квартира',
            dacha: 'Дача'
        };
        return names[propertyId] || propertyId;
    }
    
    /**
     * Get job name
     */
    getJobName(jobId) {
        const names = {
            taxi: 'Таксист',
            delivery: 'Курьер',
            gopnik: 'Крышевание',
            guard: 'Охранник'
        };
        return names[jobId] || jobId;
    }
    
    /**
     * Format money for display
     */
    formatMoney(amount) {
        return amount.toLocaleString('ru-RU') + ' ₽';
    }
    
    /**
     * Get current money
     */
    getMoney() {
        return this.money;
    }
    
    /**
     * Get price of item
     */
    getPrice(itemId) {
        return PRICES[itemId] || 0;
    }
    
    /**
     * Check if can afford
     */
    canAfford(amount) {
        return this.money >= amount;
    }
    
    /**
     * Save economy state
     */
    save() {
        return {
            money: this.money,
            totalEarned: this.totalEarned,
            totalSpent: this.totalSpent,
            debt: this.debt,
            ownedVehicles: this.ownedVehicles,
            ownedProperties: this.ownedProperties,
            inventory: this.inventory,
            transactions: this.transactions.slice(0, 20) // Save last 20
        };
    }
    
    /**
     * Load economy state
     */
    load(data) {
        if (!data) return;
        
        this.money = data.money || CONFIG.economy.startingMoney;
        this.totalEarned = data.totalEarned || 0;
        this.totalSpent = data.totalSpent || 0;
        this.debt = data.debt || 0;
        this.ownedVehicles = data.ownedVehicles || [];
        this.ownedProperties = data.ownedProperties || [];
        this.inventory = data.inventory || {};
        this.transactions = data.transactions || [];
        
        // Update UI
        this.game.ui?.updateMoney(this.money);
    }
}

export default EconomySystem;