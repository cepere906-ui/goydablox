// ==================== UI MANAGER ====================
import { GameState } from '../state.js';

class UIManager {
    constructor() {
        this.currentShop = null;
        this.currentDialog = null;
    }
    
    init() {
        this.setupMinimap();
        return this;
    }
    
    setupMinimap() {
        this.minimapCanvas = document.getElementById('minimap-canvas');
        if (this.minimapCanvas) {
            this.minimapCtx = this.minimapCanvas.getContext('2d');
        }
    }
    
    // ==================== УВЕДОМЛЕНИЯ ====================
    
    notify(title, message, type = 'info') {
        const container = document.getElementById('notifications-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-text">${message}</div>
        `;
        
        container.appendChild(notification);
        
        // Автоудаление
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // ==================== ДИАЛОГИ ====================
    
    showDialog(dialog, type = '') {
        const dialogBox = document.getElementById('dialog-box');
        const speaker = document.getElementById('dialog-speaker');
        const portrait = document.getElementById('dialog-portrait');
        const text = document.getElementById('dialog-text');
        const options = document.getElementById('dialog-options');
        
        if (!dialogBox) return;
        
        // Установить тип
        dialogBox.className = type ? `dialog-${type}` : '';
        
        // Заполнить содержимое
        if (speaker) speaker.textContent = dialog.speaker || '';
        if (portrait) portrait.textContent = dialog.portrait || '👤';
        if (text) text.textContent = dialog.text || '';
        
        // Очистить и добавить опции
        if (options) {
            options.innerHTML = '';
            
            if (dialog.options) {
                dialog.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = `dialog-option ${opt.class || ''}`;
                    btn.textContent = opt.text;
                    btn.onclick = () => {
                        if (opt.action) opt.action();
                    };
                    options.appendChild(btn);
                });
            }
        }
        
        dialogBox.classList.remove('hidden');
        this.currentDialog = dialog;
        
        // Приостановить игру
        GameState.isPaused = true;
    }
    
    hideDialog() {
        const dialogBox = document.getElementById('dialog-box');
        if (dialogBox) {
            dialogBox.classList.add('hidden');
        }
        this.currentDialog = null;
        GameState.isPaused = false;
    }
    
    // ==================== МАГАЗИН ====================
    
    showShop(name, items, onBuy) {
        const shopMenu = document.getElementById('shop-menu');
        const shopTitle = document.getElementById('shop-title');
        const shopItems = document.getElementById('shop-items');
        const shopBalance = document.getElementById('shop-balance');
        
        if (!shopMenu) return;
        
        if (shopTitle) shopTitle.textContent = name;
        if (shopBalance) shopBalance.textContent = GameState.money.toLocaleString('ru-RU');
        
        // Заполнить товары
        if (shopItems) {
            shopItems.innerHTML = '';
            
            items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'shop-item';
                
                const canAfford = GameState.money >= item.price;
                
                itemEl.innerHTML = `
                    <span class="shop-item-icon">${item.icon || '📦'}</span>
                    <div class="shop-item-info">
                        <div class="shop-item-name">${item.name}</div>
                        <div class="shop-item-desc">${item.desc || ''}</div>
                    </div>
                    <span class="shop-item-price ${canAfford ? '' : 'expensive'}">${item.price}₽</span>
                `;
                
                itemEl.onclick = () => {
                    if (onBuy && onBuy(item)) {
                        // Обновить баланс
                        if (shopBalance) {
                            shopBalance.textContent = GameState.money.toLocaleString('ru-RU');
                        }
                        // Обновить цены
                        this.showShop(name, items, onBuy);
                    }
                };
                
                shopItems.appendChild(itemEl);
            });
        }
        
        shopMenu.classList.remove('hidden');
        this.currentShop = { name, items, onBuy };
        GameState.isPaused = true;
        
        // Кнопка закрытия
        const closeBtn = document.getElementById('shop-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hideShop();
        }
    }
    
    hideShop() {
        const shopMenu = document.getElementById('shop-menu');
        if (shopMenu) {
            shopMenu.classList.add('hidden');
        }
        this.currentShop = null;
        GameState.isPaused = false;
    }
    
    // ==================== ИНВЕНТАРЬ ====================
    
    showInventory() {
        const menu = document.getElementById('inventory-menu');
        const grid = document.getElementById('inventory-grid');
        
        if (!menu || !grid) return;
        
        grid.innerHTML = '';
        
        // Слоты инвентаря
        for (let i = 0; i < 24; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            const item = GameState.inventory[i];
            if (item) {
                slot.innerHTML = `
                    <span>${item.icon || '📦'}</span>
                    ${item.count > 1 ? `<span class="item-count">${item.count}</span>` : ''}
                `;
            } else {
                slot.classList.add('empty');
            }
            
            grid.appendChild(slot);
        }
        
        menu.classList.remove('hidden');
        GameState.isPaused = true;
        
        const closeBtn = document.getElementById('inventory-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hideInventory();
        }
    }
    
    hideInventory() {
        const menu = document.getElementById('inventory-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
        GameState.isPaused = false;
    }
    
    // ==================== НАСТРОЙКИ ====================
    
    showSettings() {
        const menu = document.getElementById('settings-menu');
        if (!menu) return;
        
        // Загрузить текущие настройки
        const shadowsEl = document.getElementById('setting-shadows');
        const distanceEl = document.getElementById('setting-render-distance');
        const sensitivityEl = document.getElementById('setting-sensitivity');
        const invertYEl = document.getElementById('setting-invert-y');
        const volumeEl = document.getElementById('setting-volume');
        const musicEl = document.getElementById('setting-music');
        
        if (shadowsEl) shadowsEl.value = GameState.settings.shadows;
        if (distanceEl) distanceEl.value = GameState.settings.renderDistance;
        if (sensitivityEl) sensitivityEl.value = GameState.settings.sensitivity;
        if (invertYEl) invertYEl.checked = GameState.settings.invertY;
        if (volumeEl) volumeEl.value = GameState.settings.volume;
        if (musicEl) musicEl.value = GameState.settings.music;
        
        menu.classList.remove('hidden');
        GameState.isPaused = true;
        
        const closeBtn = document.getElementById('settings-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hideSettings();
        }
        
        const applyBtn = document.getElementById('settings-apply');
        if (applyBtn) {
            applyBtn.onclick = () => this.applySettings();
        }
    }
    
    hideSettings() {
        const menu = document.getElementById('settings-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
        GameState.isPaused = false;
    }
    
    applySettings() {
        const shadowsEl = document.getElementById('setting-shadows');
        const distanceEl = document.getElementById('setting-render-distance');
        const sensitivityEl = document.getElementById('setting-sensitivity');
        const invertYEl = document.getElementById('setting-invert-y');
        const volumeEl = document.getElementById('setting-volume');
        const musicEl = document.getElementById('setting-music');
        
        if (shadowsEl) GameState.settings.shadows = shadowsEl.value;
        if (distanceEl) GameState.settings.renderDistance = parseInt(distanceEl.value);
        if (sensitivityEl) GameState.settings.sensitivity = parseInt(sensitivityEl.value);
        if (invertYEl) GameState.settings.invertY = invertYEl.checked;
        if (volumeEl) GameState.settings.volume = parseInt(volumeEl.value);
        if (musicEl) GameState.settings.music = parseInt(musicEl.value);
        
        this.notify('Настройки', 'Настройки применены', 'success');
        this.hideSettings();
    }
    
    // ==================== МЕНЮ ПАУЗЫ ====================
    
    showPauseMenu() {
        const menu = document.getElementById('pause-menu');
        if (menu) {
            menu.classList.remove('hidden');
        }
        GameState.isPaused = true;
    }
    
    hidePauseMenu() {
        const menu = document.getElementById('pause-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
        GameState.isPaused = false;
    }
    
    // ==================== МИНИКАРТА ====================
    
    updateMinimap(playerPos, playerRot, buildings, vehicles) {
        if (!this.minimapCtx) return;
        
        const ctx = this.minimapCtx;
        const size = 200;
        const scale = 0.3; // Масштаб карты
        
        // Очистить
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(0, 0, size, size);
        
        // Центр карты = позиция игрока
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Нарисовать дороги
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 3;
        
        // Центральные дороги
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(size, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, size);
        ctx.stroke();
        
        // Сетка дорог
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        for (let i = -4; i <= 4; i++) {
            if (i === 0) continue;
            const offset = i * 70 * scale;
            
            ctx.beginPath();
            ctx.moveTo(0, centerY + offset);
            ctx.lineTo(size, centerY + offset);
            ctx.moveTo(centerX + offset, 0);
            ctx.lineTo(centerX + offset, size);
            ctx.stroke();
        }
        
        // Нарисовать здания
        ctx.fillStyle = '#666';
        if (buildings) {
            buildings.forEach(b => {
                const bx = centerX + (b.x - playerPos.x) * scale;
                const bz = centerY + (b.z - playerPos.z) * scale;
                
                if (bx > -20 && bx < size + 20 && bz > -20 && bz < size + 20) {
                    ctx.fillRect(bx - 4, bz - 4, 8, 8);
                }
            });
        }
        
        // Нарисовать машины
        ctx.fillStyle = '#f00';
        if (vehicles) {
            vehicles.forEach(v => {
                const vx = centerX + (v.position.x - playerPos.x) * scale;
                const vz = centerY + (v.position.z - playerPos.z) * scale;
                
                if (vx > 0 && vx < size && vz > 0 && vz < size) {
                    ctx.beginPath();
                    ctx.arc(vx, vz, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
        
        // Нарисовать центр (памятник)
        const monX = centerX - playerPos.x * scale;
        const monZ = centerY - playerPos.z * scale;
        if (monX > 0 && monX < size && monZ > 0 && monZ < size) {
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(monX, monZ, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Нарисовать игрока (треугольник)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-playerRot);
        
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-5, 5);
        ctx.lineTo(5, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // ==================== ОБНОВЛЕНИЕ VEHICLE HUD ====================
    
    updateVehicleHUD(vehicle) {
        if (!vehicle) return;
        
        const speedEl = document.getElementById('speed-value');
        const fuelBar = document.getElementById('fuel-bar');
        
        if (speedEl) {
            speedEl.textContent = vehicle.getSpeed();
        }
        
        if (fuelBar) {
            fuelBar.style.width = `${vehicle.getFuelPercent()}%`;
        }
    }
    
    // ==================== КВЕСТЫ ====================
    
    updateQuestTracker() {
        const titleEl = document.getElementById('quest-title');
        const objectiveEl = document.getElementById('quest-objective');
        const progressEl = document.getElementById('quest-progress');
        
        if (GameState.quests && GameState.quests.current) {
            const quest = GameState.quests.active?.find(q => q.id === GameState.quests.current);
            
            if (quest && titleEl && objectiveEl) {
                titleEl.textContent = quest.title;
                
                // Найти текущую цель
                const currentObjective = quest.objectives?.find(obj => {
                    const progress = quest.progress?.[obj.id] || 0;
                    return progress < obj.target;
                });
                
                if (currentObjective) {
                    const progress = quest.progress?.[currentObjective.id] || 0;
                    objectiveEl.textContent = `${currentObjective.text} (${progress}/${currentObjective.target})`;
                    
                    if (progressEl) {
                        progressEl.style.width = `${(progress / currentObjective.target) * 100}%`;
                    }
                }
            }
        } else {
            if (titleEl) titleEl.textContent = 'Нет активных заданий';
            if (objectiveEl) objectiveEl.textContent = 'Исследуйте город';
            if (progressEl) progressEl.style.width = '0%';
        }
    }
    
    // ==================== СКРЫТЬ/ПОКАЗАТЬ HUD ====================
    
    showHUD() {
        document.getElementById('game-hud')?.classList.remove('hidden');
        document.getElementById('crosshair')?.classList.remove('hidden');
    }
    
    hideHUD() {
        document.getElementById('game-hud')?.classList.add('hidden');
        document.getElementById('crosshair')?.classList.add('hidden');
    }
}

export const UI = new UIManager();