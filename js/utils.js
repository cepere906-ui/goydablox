// ============================================================
// ГОЙДАБЛОКС - УТИЛИТЫ
// ============================================================

const Utils = {
    // Случайное число в диапазоне
    random: (min, max) => Math.random() * (max - min) + min,
    
    // Случайное целое число
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // Случайный элемент массива
    randomElement: (arr) => arr[Math.floor(Math.random() * arr.length)],
    
    // Расстояние между точками 2D
    distance: (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.z - b.z, 2)),
    
    // Расстояние между точками 3D
    distance3D: (a, b) => Math.sqrt(
        Math.pow(a.x - b.x, 2) + 
        Math.pow(a.y - b.y, 2) + 
        Math.pow(a.z - b.z, 2)
    ),
    
    // Интерполяция
    lerp: (a, b, t) => a + (b - a) * t,
    
    // Ограничение значения
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
    
    // Создание текстуры из канваса
    createCanvasTexture: (width, height, drawFn) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        drawFn(ctx, width, height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },
    
    // Форматирование времени
    formatTime: (minutes) => {
        const h = Math.floor(minutes / 60) % 24;
        const m = Math.floor(minutes % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    },
    
    // Форматирование денег
    formatMoney: (amount) => amount.toLocaleString('ru-RU'),
    
    // Хэш для seed-based генерации
    hash: (x, z) => {
        let h = x * 374761393 + z * 668265263;
        h = (h ^ (h >> 13)) * 1274126177;
        return h ^ (h >> 16);
    },
    
    // Детерминированный random на основе seed
    seededRandom: (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    },
    
    // Получить ID чанка из мировых координат
    getChunkId: (x, z) => {
        const cx = Math.floor(x / CONFIG.chunkSize);
        const cz = Math.floor(z / CONFIG.chunkSize);
        return `${cx},${cz}`;
    },
    
    // Получить координаты чанка
    getChunkCoords: (x, z) => ({
        x: Math.floor(x / CONFIG.chunkSize),
        z: Math.floor(z / CONFIG.chunkSize)
    }),
    
    // Получить локальные координаты внутри чанка
    getLocalCoords: (x, z) => ({
        x: ((x % CONFIG.chunkSize) + CONFIG.chunkSize) % CONFIG.chunkSize,
        z: ((z % CONFIG.chunkSize) + CONFIG.chunkSize) % CONFIG.chunkSize
    }),
    
    // Проверка видимости точки
    isInFrustum: (camera, position) => {
        const frustum = new THREE.Frustum();
        const matrix = new THREE.Matrix4().multiplyMatrices(
            camera.projectionMatrix,
            camera.matrixWorldInverse
        );
        frustum.setFromProjectionMatrix(matrix);
        return frustum.containsPoint(position);
    },
    
    // Нормализация угла
    normalizeAngle: (angle) => {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    },
    
    // Угол между двумя точками
    angleTo: (from, to) => {
        return Math.atan2(to.x - from.x, to.z - from.z);
    },
    
    // Преобразование hex в rgb
    hexToRgb: (hex) => {
        return {
            r: (hex >> 16) & 255,
            g: (hex >> 8) & 255,
            b: hex & 255
        };
    },
    
    // Смешивание цветов
    mixColors: (color1, color2, t) => {
        const c1 = Utils.hexToRgb(color1);
        const c2 = Utils.hexToRgb(color2);
        return (
            (Math.round(Utils.lerp(c1.r, c2.r, t)) << 16) |
            (Math.round(Utils.lerp(c1.g, c2.g, t)) << 8) |
            Math.round(Utils.lerp(c1.b, c2.b, t))
        );
    },
    
    // Perlin-подобный шум (упрощённый)
    noise2D: (x, z, scale = 1) => {
        const X = Math.floor(x * scale);
        const Z = Math.floor(z * scale);
        const fx = (x * scale) - X;
        const fz = (z * scale) - Z;
        
        const n00 = Utils.seededRandom(Utils.hash(X, Z));
        const n01 = Utils.seededRandom(Utils.hash(X, Z + 1));
        const n10 = Utils.seededRandom(Utils.hash(X + 1, Z));
        const n11 = Utils.seededRandom(Utils.hash(X + 1, Z + 1));
        
        const nx0 = Utils.lerp(n00, n10, fx);
        const nx1 = Utils.lerp(n01, n11, fx);
        
        return Utils.lerp(nx0, nx1, fz);
    },
    
    // Проверка столкновения AABB
    aabbCollision: (box1, box2) => {
        return (
            box1.minX < box2.maxX &&
            box1.maxX > box2.minX &&
            box1.minZ < box2.maxZ &&
            box1.maxZ > box2.minZ
        );
    },
    
    // Создание геометрии с LOD
    createLODGeometry: (geometries, distances) => {
        const lod = new THREE.LOD();
        geometries.forEach((geom, i) => {
            lod.addLevel(geom, distances[i] || 0);
        });
        return lod;
    }
};

// ===== СИСТЕМА УВЕДОМЛЕНИЙ =====
const NotificationSystem = {
    container: null,
    
    init() {
        this.container = document.getElementById('notifications');
    },
    
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    },
    
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); },
};

// ===== СИСТЕМА ДИАЛОГОВ =====
const DialogSystem = {
    box: null,
    speaker: null,
    text: null,
    options: null,
    currentCallback: null,
    
    init() {
        this.box = document.getElementById('dialog-box');
        this.speaker = document.getElementById('dialog-speaker');
        this.text = document.getElementById('dialog-text');
        this.options = document.getElementById('dialog-options');
    },
    
    show(speakerName, dialogText, dialogOptions = []) {
        this.speaker.textContent = speakerName;
        this.text.textContent = dialogText;
        this.options.innerHTML = '';
        
        dialogOptions.forEach((opt, i) => {
            const btn = document.createElement('div');
            btn.className = 'option';
            btn.textContent = opt.text;
            btn.onclick = () => {
                if (opt.callback) opt.callback();
                if (!opt.keepOpen) this.hide();
            };
            this.options.appendChild(btn);
        });
        
        if (dialogOptions.length === 0) {
            const closeBtn = document.createElement('div');
            closeBtn.className = 'option';
            closeBtn.textContent = 'Закрыть';
            closeBtn.onclick = () => this.hide();
            this.options.appendChild(closeBtn);
        }
        
        this.box.style.display = 'block';
        GameState.currentDialog = true;
    },
    
    hide() {
        this.box.style.display = 'none';
        GameState.currentDialog = null;
    }
};

// ===== СИСТЕМА КВЕСТОВ =====
const QuestSystem = {
    quests: [],
    container: null,
    
    init() {
        this.container = document.getElementById('quest-list');
        
        // Начальные квесты
        this.add({
            id: 'explore_kremlin',
            title: 'Посетить Кремль',
            description: 'Найдите и осмотрите Кремль',
            completed: false
        });
        
        this.add({
            id: 'find_lada',
            title: 'Найти ЛАДУ',
            description: 'Найдите автомобиль ЛАДА и сядьте в него',
            completed: false
        });
        
        this.add({
            id: 'explore_world',
            title: 'Исследовать мир',
            description: 'Посетите 5 разных чанков',
            completed: false,
            progress: 0,
            target: 5
        });
        
        this.add({
            id: 'earn_money',
            title: 'Заработать 50000₽',
            description: 'Накопите 50000 рублей',
            completed: false
        });
    },
    
    add(quest) {
        this.quests.push(quest);
        this.updateUI();
    },
    
    complete(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest && !quest.completed) {
            quest.completed = true;
            NotificationSystem.success(`🏆 Квест выполнен: ${quest.title}`);
            GameState.playerMoney += 1000; // Награда
            this.updateUI();
        }
    },
    
    updateProgress(questId, progress) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest && !quest.completed) {
            quest.progress = progress;
            if (quest.target && progress >= quest.target) {
                this.complete(questId);
            }
            this.updateUI();
        }
    },
    
    updateUI() {
        this.container.innerHTML = '';
        this.quests.filter(q => !q.completed).forEach(quest => {
            const div = document.createElement('div');
            div.className = 'quest';
            let text = quest.title;
            if (quest.target) {
                text += ` (${quest.progress || 0}/${quest.target})`;
            }
            div.textContent = text;
            this.container.appendChild(div);
        });
    }
};

// ===== ПУЛЫ ОБЪЕКТОВ =====
const ObjectPool = {
    pools: {},
    
    create(name, factory, initialSize = 10) {
        this.pools[name] = {
            factory: factory,
            available: [],
            inUse: new Set()
        };
        
        for (let i = 0; i < initialSize; i++) {
            this.pools[name].available.push(factory());
        }
    },
    
    get(name) {
        const pool = this.pools[name];
        if (!pool) return null;
        
        let obj;
        if (pool.available.length > 0) {
            obj = pool.available.pop();
        } else {
            obj = pool.factory();
        }
        
        pool.inUse.add(obj);
        return obj;
    },
    
    release(name, obj) {
        const pool = this.pools[name];
        if (!pool) return;
        
        pool.inUse.delete(obj);
        pool.available.push(obj);
    },
    
    releaseAll(name) {
        const pool = this.pools[name];
        if (!pool) return;
        
        pool.inUse.forEach(obj => {
            pool.available.push(obj);
        });
        pool.inUse.clear();
    }
};