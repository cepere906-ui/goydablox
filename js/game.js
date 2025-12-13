// ============================================================
// ГОЙДАБЛОКС - ИГРОВАЯ ЛОГИКА
// ============================================================

const Game = {
    // Инициализация игры
    init() {
        console.log('🇷🇺 ГОЙДАБЛОКС - Инициализация...');
        
        // Создание сцены
        GameState.scene = new THREE.Scene();
        GameState.scene.background = new THREE.Color(COLORS.skyDay);
        GameState.scene.fog = new THREE.Fog(COLORS.skyDay, CONFIG.fogNear, CONFIG.fogFar);
        
        // Создание камеры
        GameState.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Создание рендерера
        GameState.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        GameState.renderer.setSize(window.innerWidth, window.innerHeight);
        GameState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        GameState.renderer.shadowMap.enabled = true;
        GameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(GameState.renderer.domElement);
        
        // Освещение
        this.setupLighting();
        
        // Игрок
        GameState.player = PlayerFactory.createPlayer();
        GameState.player.position.set(50, 1, 50); // Начинаем рядом с Кремлём
        GameState.scene.add(GameState.player);
        
        // Инициализация velocity
        GameState.playerVelocity = new THREE.Vector3();
        
        // Инициализация генератора мира
        WorldGenerator.init();
        
        // Системы
        InputManager.init();
        NotificationSystem.init();
        DialogSystem.init();
        QuestSystem.init();
        UIManager.init();
        SettingsManager.init();
        
        // Часы
        GameState.clock = new THREE.Clock();
        GameState.lastFpsUpdate = performance.now();
        
        console.log('✅ Инициализация завершена');
    },
    
    // Настройка освещения
    setupLighting() {
        // Ambient light (рассеянный свет)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        GameState.scene.add(ambientLight);
        
        // Directional light (солнце)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(100, 150, 100);
        sunLight.castShadow = true;
        
        // Настройка теней
        sunLight.shadow.mapSize.width = CONFIG.shadowMapSize;
        sunLight.shadow.mapSize.height = CONFIG.shadowMapSize;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -150;
        sunLight.shadow.camera.right = 150;
        sunLight.shadow.camera.top = 150;
        sunLight.shadow.camera.bottom = -150;
        sunLight.shadow.bias = -0.0001;
        
        GameState.scene.add(sunLight);
        
        // Hemisphere light (небо/земля)
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4A7C2A, 0.3);
        GameState.scene.add(hemiLight);
    },
    
    // Старт игры
    start() {
        console.log('🎮 Запуск игры...');
        
        GameState.isPlaying = true;
        GameState.isPaused = false;
        
        // Показать UI
        UIManager.showGameUI();
        
        // Захват указателя
        document.getElementById('game-container').requestPointerLock();
        
        // Уведомление
        NotificationSystem.info('Добро пожаловать в ГОЙДАБЛОКС!');
        NotificationSystem.info('Кремль находится в центре мира (0, 0)');
        
        // Запуск игрового цикла
        this.animate();
    },
    
    // Главный игровой цикл
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Пропускаем обновление если игра на паузе
        if (!GameState.isPlaying) {
            GameState.renderer.render(GameState.scene, GameState.camera);
            return;
        }
        
        if (GameState.isPaused) {
            GameState.renderer.render(GameState.scene, GameState.camera);
            return;
        }
        
        // Вычисляем delta time
        const delta = Math.min(GameState.clock.getDelta(), 0.1);
        
        // Обновление чанков
        const playerChunk = WorldGenerator.updateChunks(GameState.player.position);
        
        // Физика и движение
        Physics.update(delta);
        
        // NPC
        NPCManager.update(delta);
        
        // Время суток
        TimeManager.update(delta);
        
        // UI
        UIManager.update();
        
        // Рендер
        GameState.renderer.render(GameState.scene, GameState.camera);
    },
    
    // Возврат в меню
    returnToMenu() {
        GameState.isPlaying = false;
        GameState.isPaused = false;
        
        // Выход из машины если нужно
        if (GameState.currentVehicle) {
            InputManager.exitVehicle();
        }
        
        // Скрыть UI
        UIManager.hideGameUI();
        
        // Разблокировать указатель
        document.exitPointerLock();
        
        console.log('📋 Возврат в главное меню');
    },
    
    // Сброс игры
    reset() {
        // Очистка мира
        WorldGenerator.clearAll();
        
        // Сброс состояния игрока
        GameState.player.position.set(50, 1, 50);
        GameState.playerHealth = CONFIG.maxHealth;
        GameState.playerStamina = CONFIG.maxStamina;
        GameState.playerMoney = 10000;
        GameState.playerVelocity.set(0, 0, 0);
        GameState.playerOnGround = true;
        
        // Сброс камеры
        GameState.cameraAngleX = 0;
        GameState.cameraAngleY = 0.4;
        GameState.targetCameraAngleX = 0;
        GameState.targetCameraAngleY = 0.4;
        
        // Сброс времени
        GameState.gameTime = 12 * 60;
        
        // Сброс квестов
        UIManager.visitedChunks.clear();
        
        console.log('🔄 Игра сброшена');
    }
};