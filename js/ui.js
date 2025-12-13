// ============================================================
// ГОЙДАБЛОКС - ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС
// ============================================================

const UIManager = {
    minimapCanvas: null,
    minimapCtx: null,
    visitedChunks: new Set(),
    
    // Инициализация
    init() {
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Инициализация слотов инвентаря
        this.initInventory();
    },
    
    // Инициализация инвентаря
    initInventory() {
        const inventory = document.getElementById('inventory');
        inventory.innerHTML = '';
        
        const slots = ['📱', '🔑', '💳', '🍞', '🔧'];
        slots.forEach((item, i) => {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot' + (i === 0 ? ' active' : '');
            slot.innerHTML = `
                <span class="key-hint">${i + 1}</span>
                ${item}
            `;
            inventory.appendChild(slot);
        });
    },
    
    // Обновление UI
    update() {
        // Здоровье
        document.getElementById('health-fill').style.width = `${GameState.playerHealth}%`;
        
        // Выносливость
        document.getElementById('stamina-fill').style.width = `${GameState.playerStamina}%`;
        
        // Позиция
        document.getElementById('pos-x').textContent = Math.round(GameState.player.position.x);
        document.getElementById('pos-z').textContent = Math.round(GameState.player.position.z);
        
        // Чанк
        const chunk = Utils.getChunkCoords(GameState.player.position.x, GameState.player.position.z);
        document.getElementById('chunk-pos').textContent = `${chunk.x}, ${chunk.z}`;
        
        // Отслеживание посещённых чанков
        const chunkKey = `${chunk.x},${chunk.z}`;
        if (!this.visitedChunks.has(chunkKey)) {
            this.visitedChunks.add(chunkKey);
            QuestSystem.updateProgress('explore_world', this.visitedChunks.size);
        }
        
        // Время
        document.getElementById('game-time').textContent = Utils.formatTime(GameState.gameTime);
        
        // Деньги
        document.getElementById('money-amount').textContent = Utils.formatMoney(GameState.playerMoney);
        
        // Количество зданий
        document.getElementById('building-count').textContent = GameState.totalBuildings;
        
        // Квест заработка
        if (GameState.playerMoney >= 50000) {
            QuestSystem.complete('earn_money');
        }
        
        // Обновление миникарты
        this.updateMinimap();
        
        // FPS
        this.updateFPS();
    },
    
    // Обновление миникарты
    updateMinimap() {
        const ctx = this.minimapCtx;
        const w = this.minimapCanvas.width;
        const h = this.minimapCanvas.height;
        const scale = 0.5;
        
        // Очистка
        ctx.fillStyle = '#2a4a2a';
        ctx.fillRect(0, 0, w, h);
        
        // Центр = позиция игрока
        const px = GameState.player.position.x;
        const pz = GameState.player.position.z;
        
        // Дороги
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 4;
        
        // Горизонтальная дорога (всегда есть)
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        
        // Вертикальные дороги (каждые 2 чанка)
        const chunkX = Math.floor(px / CONFIG.chunkSize);
        for (let cx = chunkX - 3; cx <= chunkX + 3; cx++) {
            if (cx % 2 === 0) {
                const roadX = w / 2 + ((cx * CONFIG.chunkSize + CONFIG.chunkSize / 2) - px) * scale;
                if (roadX > -20 && roadX < w + 20) {
                    ctx.beginPath();
                    ctx.moveTo(roadX, 0);
                    ctx.lineTo(roadX, h);
                    ctx.stroke();
                }
            }
        }
        
        // Здания
        ctx.fillStyle = '#666';
        GameState.buildings.forEach(building => {
            const col = building.userData?.collision;
            if (!col) return;
            
            const bx = w / 2 + (building.position.x - px) * scale;
            const bz = h / 2 + (building.position.z - pz) * scale;
            const bw = col.width * scale;
            const bh = col.depth * scale;
            
            if (bx > -30 && bx < w + 30 && bz > -30 && bz < h + 30) {
                // Кремль - красный
                if (building.userData?.isKremlin) {
                    ctx.fillStyle = '#8B0000';
                } else if (building.userData?.buildingType === 'church') {
                    ctx.fillStyle = '#FFD700';
                } else {
                    ctx.fillStyle = '#666';
                }
                ctx.fillRect(bx - bw / 2, bz - bh / 2, bw, bh);
            }
        });
        
        // Машины
        ctx.fillStyle = '#0a0';
        GameState.vehicles.forEach(vehicle => {
            const vx = w / 2 + (vehicle.position.x - px) * scale;
            const vz = h / 2 + (vehicle.position.z - pz) * scale;
            
            if (vx > 0 && vx < w && vz > 0 && vz < h) {
                ctx.beginPath();
                ctx.arc(vx, vz, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // NPC
        ctx.fillStyle = '#ff0';
        GameState.npcs.forEach(npc => {
            const nx = w / 2 + (npc.position.x - px) * scale;
            const nz = h / 2 + (npc.position.z - pz) * scale;
            
            if (nx > 0 && nx < w && nz > 0 && nz < h) {
                ctx.beginPath();
                ctx.arc(nx, nz, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Игрок (центр)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Направление игрока
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        
        const angle = GameState.currentVehicle
            ? GameState.currentVehicle.rotation.y
            : GameState.player.rotation.y;
        
        ctx.lineTo(
            w / 2 + Math.sin(angle) * 12,
            h / 2 + Math.cos(angle) * 12
        );
        ctx.stroke();
        
        // Компас
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', w / 2, 12);
        ctx.fillText('S', w / 2, h - 4);
        ctx.fillText('W', 8, h / 2 + 4);
        ctx.fillText('E', w - 8, h / 2 + 4);
    },
    
    // FPS счётчик
    updateFPS() {
        GameState.frameCount++;
        const now = performance.now();
        
        if (now - GameState.lastFpsUpdate >= 1000) {
            GameState.fps = GameState.frameCount;
            GameState.frameCount = 0;
            GameState.lastFpsUpdate = now;
            
            // Можно добавить отображение FPS если нужно
            // document.getElementById('fps-counter').textContent = `FPS: ${GameState.fps}`;
        }
    },
    
    // Показать UI игры
    showGameUI() {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('hud').style.display = 'block';
        document.getElementById('minimap').style.display = 'block';
        document.getElementById('money-display').style.display = 'block';
        document.getElementById('quest-tracker').style.display = 'block';
        document.getElementById('crosshair').style.display = 'block';
        document.getElementById('instructions').style.display = 'block';
        document.getElementById('inventory').style.display = 'flex';
    },
    
    // Скрыть UI игры
    hideGameUI() {
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('hud').style.display = 'none';
        document.getElementById('minimap').style.display = 'none';
        document.getElementById('money-display').style.display = 'none';
        document.getElementById('quest-tracker').style.display = 'none';
        document.getElementById('crosshair').style.display = 'none';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('inventory').style.display = 'none';
        document.getElementById('vehicle-hud').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
    }
};

// ===== ЗАГРУЗЧИК =====
const Loader = {
    progress: 0,
    messages: [
        'Загрузка матушки России...',
        'Инициализация бесконечного мира...',
        'Возведение Кремля...',
        'Расстановка панелек...',
        'Заправка ЛАД...',
        'Выращивание берёз...',
        'Открытие Пятёрочек...',
        'Установка рекламных баннеров...',
        'Найм NPC...',
        'Настройка системы госуслуг...',
        'Проверка регистрации...',
        'Оптимизация чанков...',
        'Готово к запуску!'
    ],
    
    async load() {
        const bar = document.getElementById('loading-bar');
        const text = document.getElementById('loading-text');
        
        for (let i = 0; i < this.messages.length; i++) {
            text.textContent = this.messages[i];
            this.progress = (i + 1) / this.messages.length * 100;
            bar.style.width = `${this.progress}%`;
            await new Promise(r => setTimeout(r, 150 + Math.random() * 150));
        }
        
        await new Promise(r => setTimeout(r, 300));
        
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-menu').style.display = 'flex';
        
        // Инициализация игры в фоне
        Game.init();
    }
};

// ===== НАСТРОЙКИ =====
const SettingsManager = {
    init() {
        // Дальность прорисовки
        const renderDistSlider = document.getElementById('render-distance');
        const renderDistVal = document.getElementById('render-dist-val');
        
        renderDistSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            renderDistVal.textContent = value;
            CONFIG.renderDistance = value;
        });
        
        // Чувствительность мыши
        const mouseSensSlider = document.getElementById('mouse-sensitivity');
        const mouseSensVal = document.getElementById('mouse-sens-val');
        
        mouseSensSlider?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            mouseSensVal.textContent = value.toFixed(1);
        });
        
        // Качество теней
        const shadowSelect = document.getElementById('shadow-quality');
        shadowSelect?.addEventListener('change', (e) => {
            const quality = e.target.value;
            const sizes = { low: 1024, medium: 2048, high: 4096 };
            CONFIG.shadowMapSize = sizes[quality] || 2048;
            
            // Можно добавить перестроение теней
            NotificationSystem.info(`Качество теней: ${quality}`);
        });
        
        // Закрытие настроек
        document.getElementById('close-settings')?.addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
        });
    },
    
    show() {
        document.getElementById('settings-modal').style.display = 'block';
    },
    
    hide() {
        document.getElementById('settings-modal').style.display = 'none';
    }
};