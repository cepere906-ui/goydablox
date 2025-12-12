// ==================== INTERACTION SYSTEM ====================
import { CONFIG } from '../config.js';
import { GameState } from '../state.js';
import { Player } from '../entities/player.js';
import { Buildings } from '../world/buildings.js';
import { Input } from '../engine/input.js';
import { UI } from '../ui/ui.js';

class InteractionSystem {
    constructor() {
        this.nearestInteractable = null;
        this.vehicles = [];
        this.currentDialog = null;
    }
    
    init() {
        // Подписка на события
        Input.on('interact', () => this.onInteract());
        Input.on('vehicle', () => this.onVehicleAction());
        
        return this;
    }
    
    setVehicles(vehicles) {
        this.vehicles = vehicles;
    }
    
    update(delta) {
        if (GameState.player.inVehicle) {
            this.hideInteractionPrompt();
            return;
        }
        
        // Найти ближайший интерактивный объект
        this.findNearestInteractable();
        
        // Показать/скрыть подсказку
        if (this.nearestInteractable) {
            this.showInteractionPrompt(this.nearestInteractable);
        } else {
            this.hideInteractionPrompt();
        }
    }
    
    findNearestInteractable() {
        const playerPos = Player.getPosition();
        const interactDist = CONFIG.player.interactDistance;
        
        let nearest = null;
        let nearestDist = interactDist;
        
        // Проверка зданий
        const buildingInteractables = Buildings.getInteractables();
        for (const inter of buildingInteractables) {
            const dist = playerPos.distanceTo(inter.position);
            if (dist < nearestDist && dist < inter.radius + interactDist) {
                nearestDist = dist;
                nearest = inter;
            }
        }
        
        // Проверка транспорта
        for (const vehicle of this.vehicles) {
            if (vehicle.isOccupied) continue;
            
            const dist = playerPos.distanceTo(vehicle.getInteractionPosition());
            if (dist < nearestDist && dist < vehicle.getInteractionRadius() + interactDist) {
                nearestDist = dist;
                nearest = {
                    type: 'vehicle',
                    vehicle: vehicle,
                    name: vehicle.config.name,
                    position: vehicle.getInteractionPosition()
                };
            }
        }
        
        this.nearestInteractable = nearest;
    }
    
    showInteractionPrompt(interactable) {
        const prompt = document.getElementById('interaction-prompt');
        const text = document.getElementById('prompt-text');
        
        if (prompt && text) {
            let promptText = '';
            
            switch (interactable.type) {
                case 'vehicle':
                    promptText = `Сесть в ${interactable.name}`;
                    break;
                case 'shop':
                case 'food':
                    promptText = `${interactable.name} - Купить`;
                    break;
                case 'military':
                    promptText = 'Военкомат - Узнать о контракте';
                    break;
                case 'fertility':
                    promptText = 'Узнать о программах';
                    break;
                case 'gas':
                    promptText = 'Заправиться';
                    break;
                case 'bank':
                    promptText = `${interactable.name} - Войти`;
                    break;
                default:
                    promptText = interactable.name || 'Взаимодействовать';
            }
            
            text.textContent = promptText;
            prompt.classList.remove('hidden');
        }
    }
    
    hideInteractionPrompt() {
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            prompt.classList.add('hidden');
        }
    }
    
    onInteract() {
        if (!this.nearestInteractable || GameState.isPaused) return;
        
        const inter = this.nearestInteractable;
        
        switch (inter.type) {
            case 'vehicle':
                this.enterVehicle(inter.vehicle);
                break;
            case 'shop':
                this.openShop(inter);
                break;
            case 'food':
                this.buyFood(inter);
                break;
            case 'military':
                this.openMilitaryDialog();
                break;
            case 'fertility':
                this.openFertilityDialog();
                break;
            case 'bank':
                this.openBankDialog(inter);
                break;
            case 'gas':
                this.openGasStation();
                break;
            case 'hospital':
                this.openHospital();
                break;
            case 'government':
                this.showInfo(inter.name, inter.message);
                break;
            case 'monument':
            case 'church':
            case 'police':
                this.showInfo(inter.name, inter.message);
                break;
            case 'npc':
                this.talkToNPC(inter);
                break;
        }
    }
    
    onVehicleAction() {
        if (GameState.player.inVehicle) {
            this.exitVehicle();
        } else if (this.nearestInteractable?.type === 'vehicle') {
            this.enterVehicle(this.nearestInteractable.vehicle);
        }
    }
    
    enterVehicle(vehicle) {
        vehicle.enter(Player);
        Player.enterVehicle(vehicle);
        
        // Показать UI транспорта
        document.getElementById('vehicle-hud')?.classList.remove('hidden');
        document.getElementById('vehicle-name').textContent = vehicle.config.name;
        document.getElementById('controls-hint')?.classList.add('hidden');
        
        UI.notify('Управление машиной', 'WASD - движение, F - выйти', 'info');
    }
    
    exitVehicle() {
        const vehicle = GameState.player.currentVehicle;
        if (!vehicle) return;
        
        const exitPos = vehicle.exit();
        Player.exitVehicle(exitPos);
        
        // Скрыть UI транспорта
        document.getElementById('vehicle-hud')?.classList.add('hidden');
        document.getElementById('controls-hint')?.classList.remove('hidden');
    }
    
    openShop(shop) {
        UI.showShop(shop.name, [
            { id: 'bread', name: 'Хлеб', price: 50, icon: '🍞', effect: { hunger: 15 } },
            { id: 'milk', name: 'Молоко', price: 80, icon: '🥛', effect: { hunger: 10, health: 5 } },
            { id: 'sausage', name: 'Колбаса', price: 200, icon: '🌭', effect: { hunger: 30 } },
            { id: 'cheese', name: 'Сыр', price: 250, icon: '🧀', effect: { hunger: 25, mood: 5 } },
            { id: 'cake', name: 'Торт', price: 400, icon: '🎂', effect: { hunger: 20, mood: 20 } },
            { id: 'vodka', name: 'Водка', price: 350, icon: '🍾', effect: { mood: 30, health: -10 } }
        ], (item) => this.buyItem(item));
    }
    
    buyFood(food) {
        if (GameState.spendMoney(food.price)) {
            GameState.modifyStat('hunger', CONFIG.stats.foodRestore);
            GameState.modifyStat('mood', 10);
            GameState.statistics.foodEaten++;
            UI.notify('Покупка', `Вы купили ${food.name} за ${food.price}₽`, 'success');
        } else {
            UI.notify('Недостаточно денег', 'Вам не хватает денег', 'error');
        }
    }
    
    buyItem(item) {
        if (GameState.spendMoney(item.price)) {
            // Применить эффекты
            if (item.effect) {
                for (const [stat, value] of Object.entries(item.effect)) {
                    GameState.modifyStat(stat, value);
                }
            }
            
            // Добавить в инвентарь если не еда
            if (!item.effect?.hunger) {
                GameState.addToInventory(item);
            }
            
            UI.notify('Покупка', `Куплено: ${item.name}`, 'success');
            return true;
        } else {
            UI.notify('Недостаточно денег', `Нужно ${item.price}₽`, 'error');
            return false;
        }
    }
    
    openMilitaryDialog() {
        UI.showDialog({
            speaker: 'Офицер военкомата',
            portrait: '👮',
            text: 'Здравия желаю! Рассматриваете службу по контракту? Сейчас очень выгодные условия: единовременная выплата, достойная зарплата от 200000₽, социальные гарантии для всей семьи.',
            options: [
                { 
                    text: '📝 Подписать контракт', 
                    class: 'positive',
                    action: () => this.signMilitaryContract()
                },
                { 
                    text: '❓ Узнать подробнее', 
                    action: () => this.militaryInfo()
                },
                { 
                    text: '🚶 Уйти', 
                    class: 'negative',
                    action: () => UI.hideDialog()
                }
            ]
        }, 'military');
    }
    
    signMilitaryContract() {
        GameState.addMoney(200000);
        UI.hideDialog();
        UI.notify('Контракт подписан!', 'Получено 200000₽ единовременно', 'success');
        
        // Добавить достижение
        GameState.addAchievement({
            id: 'military_contract',
            name: 'Защитник Отечества',
            description: 'Подписал контракт на военную службу'
        });
    }
    
    militaryInfo() {
        UI.showDialog({
            speaker: 'Офицер военкомата',
            portrait: '👮',
            text: 'Условия контракта:\n• Единовременная выплата: 200000₽\n• Зарплата: от 200000₽/месяц\n• Социальные гарантии семье\n• Бесплатное жильё\n• Ранняя пенсия\n\nГотовы послужить Родине?',
            options: [
                { 
                    text: '📝 Подписать контракт', 
                    class: 'positive',
                    action: () => this.signMilitaryContract()
                },
                { 
                    text: '🚶 Подумаю', 
                    action: () => UI.hideDialog()
                }
            ]
        }, 'military');
    }
    
    openFertilityDialog() {
        UI.showDialog({
            speaker: 'Консультант центра',
            portrait: '👩‍⚕️',
            text: 'Добро пожаловать в Центр Повышения Рождаемости! Мы помогаем молодым семьям. Доступные программы:\n\n• Материнский капитал\n• Пособия при рождении\n• Льготная ипотека\n• Бесплатные консультации',
            options: [
                { 
                    text: '💰 Получить маткапитал', 
                    class: 'positive',
                    action: () => this.getMaternalCapital()
                },
                { 
                    text: '📋 Узнать о программах', 
                    action: () => this.fertilityPrograms()
                },
                { 
                    text: '🚶 Уйти', 
                    action: () => UI.hideDialog()
                }
            ]
        }, 'fertility');
    }
    
    getMaternalCapital() {
        if (!GameState.achievements.find(a => a.id === 'maternal_capital')) {
            GameState.addMoney(630000);
            GameState.addAchievement({
                id: 'maternal_capital',
                name: 'Материнский капитал',
                description: 'Получен материнский капитал'
            });
            UI.hideDialog();
            UI.notify('Материнский капитал', 'Получено 630000₽!', 'success');
        } else {
            UI.hideDialog();
            UI.notify('Уже получено', 'Вы уже получали материнский капитал', 'warning');
        }
    }
    
    fertilityPrograms() {
        UI.showDialog({
            speaker: 'Консультант центра',
            portrait: '👩‍⚕️',
            text: 'Наши программы поддержки:\n\n• Маткапитал: 630000₽ на первого ребёнка\n• Пособие при рождении: 23000₽\n• Ежемесячные выплаты\n• Льготная ипотека 6%\n• Бесплатный детский сад\n\nОбращайтесь в любое время!',
            options: [
                { text: '✓ Понятно', action: () => UI.hideDialog() }
            ]
        }, 'fertility');
    }
    
    openBankDialog(bank) {
        UI.showDialog({
            speaker: `Консультант ${bank.name}`,
            portrait: '🏦',
            text: `Добро пожаловать в ${bank.name}!\n\nВаш баланс: ${GameState.money.toLocaleString('ru-RU')}₽\n\nЧто желаете?`,
            options: [
                { 
                    text: '💳 Взять кредит 100000₽', 
                    action: () => this.takeLoan(100000)
                },
                { 
                    text: '💳 Взять кредит 500000₽', 
                    action: () => this.takeLoan(500000)
                },
                { 
                    text: '🚶 Уйти', 
                    action: () => UI.hideDialog()
                }
            ]
        }, 'bank');
    }
    
    takeLoan(amount) {
        GameState.addMoney(amount);
        UI.hideDialog();
        UI.notify('Кредит одобрен', `Получено ${amount.toLocaleString('ru-RU')}₽`, 'success');
    }
    
    openGasStation() {
        const vehicle = GameState.player.currentVehicle;
        
        if (!vehicle) {
            UI.notify('Нужна машина', 'Подъезжайте на автомобиле', 'warning');
            return;
        }
        
        const fuelNeeded = vehicle.config.fuelCapacity - vehicle.fuel;
        const cost = Math.ceil(fuelNeeded * CONFIG.economy.fuelPrice);
        
        UI.showDialog({
            speaker: 'Заправщик',
            portrait: '⛽',
            text: `Заправка ${vehicle.config.name}\n\nТопливо: ${vehicle.fuel.toFixed(1)}/${vehicle.config.fuelCapacity} л\nНужно: ${fuelNeeded.toFixed(1)} л\nСтоимость: ${cost}₽`,
            options: [
                { 
                    text: `⛽ Заправить полный бак (${cost}₽)`, 
                    class: 'positive',
                    action: () => this.refuelVehicle(vehicle, fuelNeeded, cost)
                },
                { 
                    text: '🚶 Уйти', 
                    action: () => UI.hideDialog()
                }
            ]
        }, 'shop');
    }
    
    refuelVehicle(vehicle, amount, cost) {
        if (GameState.spendMoney(cost)) {
            vehicle.refuel(amount);
            UI.hideDialog();
            UI.notify('Заправлено', `Полный бак!`, 'success');
        } else {
            UI.notify('Недостаточно денег', `Нужно ${cost}₽`, 'error');
        }
    }
    
    openHospital() {
        const healCost = Math.ceil((100 - GameState.stats.health) * 50);
        
        UI.showDialog({
            speaker: 'Врач',
            portrait: '👨‍⚕️',
            text: `Здравствуйте!\n\nВаше здоровье: ${Math.floor(GameState.stats.health)}%\n\nПолное лечение: ${healCost}₽`,
            options: [
                { 
                    text: `💊 Вылечиться (${healCost}₽)`, 
                    class: 'positive',
                    action: () => this.heal(healCost)
                },
                { 
                    text: '🚶 Уйти', 
                    action: () => UI.hideDialog()
                }
            ]
        });
    }
    
    heal(cost) {
        if (GameState.spendMoney(cost)) {
            GameState.stats.health = 100;
            UI.hideDialog();
            UI.notify('Вылечено', 'Здоровье полностью восстановлено!', 'success');
        } else {
            UI.notify('Недостаточно денег', `Нужно ${cost}₽`, 'error');
        }
    }
    
    showInfo(title, message) {
        UI.notify(title, message, 'info');
        
        // Отметить как обнаруженное
        if (GameState.discoverLocation(title)) {
            UI.notify('Новое место', `Обнаружено: ${title}`, 'success');
        }
    }
    
    talkToNPC(npc) {
        GameState.statistics.npcstalkedTo++;
        
        // Простой диалог
        const dialogues = [
            'Привет! Хорошая сегодня погода.',
            'Здравствуйте! Удачного дня!',
            'Ой, извините, тороплюсь...',
            'Говорят, в военкомате хорошие условия предлагают.',
            'Цены растут, а зарплата нет...',
            'Видели новый торговый центр? Там всё есть!',
            'В церкви сегодня служба, заходите.',
            'Лучшая шаурма - у памятника!'
        ];
        
        const text = dialogues[Math.floor(Math.random() * dialogues.length)];
        
        UI.showDialog({
            speaker: npc.name,
            portrait: '👤',
            text: text,
            options: [
                { text: '👋 До свидания', action: () => UI.hideDialog() }
            ]
        });
    }
}

export const Interaction = new InteractionSystem();