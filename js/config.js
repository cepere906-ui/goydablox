// ============================================================
// ГОЙДАБЛОКС - КОНФИГУРАЦИЯ
// ============================================================

const CONFIG = {
    // Мир и чанки
    chunkSize: 100,           // Размер одного чанка в метрах
    renderDistance: 3,        // Количество чанков в каждом направлении
    unloadDistance: 5,        // Расстояние для выгрузки чанков
    
    // Физика
    gravity: -25,
    jumpForce: 10,
    walkSpeed: 8,
    runSpeed: 16,
    
    // Камера
    mouseSensitivity: 0.002,
    cameraDistance: 8,
    cameraHeight: 3,
    cameraSmoothing: 0.1,
    cameraMinAngleY: 0.1,
    cameraMaxAngleY: Math.PI / 2 - 0.1,
    
    // Транспорт
    carMaxSpeed: 120,
    carAcceleration: 30,
    carBraking: 50,
    carTurnSpeed: 2.5,
    fuelConsumption: 0.05,
    
    // Игрок
    maxHealth: 100,
    maxStamina: 100,
    staminaDrain: 20,
    staminaRegen: 15,
    playerRadius: 0.5,
    playerHeight: 2,
    
    // Графика
    shadowMapSize: 2048,
    fogNear: 150,
    fogFar: 400,
    
    // Время
    dayLength: 600, // секунд на полный день
    
    // Генерация мира
    roadWidth: 10,
    sidewalkWidth: 3,
    buildingMinHeight: 8,
    buildingMaxHeight: 45,
    treeChance: 0.15,
    npcPerChunk: 2,
    vehiclePerChunk: 1,
    
    // Специальные здания
    kremlinChunk: { x: 0, z: 0 }, // Кремль в центре
};

// ===== ЦВЕТА =====
const COLORS = {
    // Флаг России
    white: 0xFFFFFF,
    blue: 0x0039A6,
    red: 0xD52B1E,
    
    // Небо
    skyDay: 0x87CEEB,
    skyNight: 0x0a0a2a,
    skySunset: 0xFF7F50,
    
    // Окружение
    grass: 0x4A7C2A,
    grassDark: 0x3A6C1A,
    road: 0x333333,
    roadMarking: 0xFFFFFF,
    sidewalk: 0x999999,
    
    // Здания
    panelka: 0xCCCCBB,
    panelkaDark: 0xAAAA99,
    brick: 0xAA5533,
    brickDark: 0x884422,
    concrete: 0x888888,
    glass: 0x87CEEB,
    
    // Кремль
    kremlinRed: 0x8B0000,
    kremlinGold: 0xFFD700,
    kremlinWall: 0xAA3333,
    
    // Транспорт
    ladaGreen: 0x1A5C1A,
    ladaWhite: 0xEEEEEE,
    ladaBlue: 0x2244AA,
    ladaRed: 0xAA2222,
    ladaBlack: 0x222222,
    ladaYellow: 0xFFCC00,
    
    // UI
    gold: 0xFFD700,
    danger: 0xD52B1E,
    success: 0x00AA00,
};

// ===== ТИПЫ ЗДАНИЙ =====
const BUILDING_TYPES = {
    PANELKA: 'panelka',
    STALINKA: 'stalinka',
    KHRUSHCHEVKA: 'khrushchevka',
    MODERN: 'modern',
    OFFICE: 'office',
    SHOP: 'shop',
    CHURCH: 'church',
    FACTORY: 'factory',
    GOVERNMENT: 'government',
    KREMLIN: 'kremlin'
};

// ===== ИГРОВОЕ СОСТОЯНИЕ =====
const GameState = {
    // Three.js
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    
    // Игрок
    player: null,
    playerVelocity: null,
    playerOnGround: false,
    playerHealth: CONFIG.maxHealth,
    playerStamina: CONFIG.maxStamina,
    playerMoney: 10000,
    playerInventory: [],
    
    // Управление
    keys: {},
    mouse: { x: 0, y: 0 },
    cameraAngleX: 0,
    cameraAngleY: 0.4,
    targetCameraAngleX: 0,
    targetCameraAngleY: 0.4,
    
    // Транспорт
    currentVehicle: null,
    vehicleSpeed: 0,
    vehicleFuel: 100,
    
    // Мир
    chunks: new Map(),
    buildings: [],
    vehicles: [],
    npcs: [],
    interactables: [],
    
    // Игровой процесс
    isPlaying: false,
    isPaused: false,
    gameTime: 12 * 60, // минуты (начало в 12:00)
    currentDialog: null,
    quests: [],
    
    // Интерактивные объекты
    nearbyInteractable: null,
    
    // Статистика
    totalBuildings: 0,
    totalChunksLoaded: 0,
    
    // FPS
    fps: 0,
    frameCount: 0,
    lastFpsUpdate: 0,
};