/**
 * ГОЙДАБЛОКС - Game Configuration
 * Central configuration file for all game constants and settings
 */

// Game version
export const VERSION = '1.0.0';

// Color palette
export const COLORS = {
    road: 0x2f2f2f,
    roadMarking: 0xffffff,
    sidewalk: 0x9a9a9a,
    white: 0xffffff,
    blue: 0x1a4d99,
    red: 0xc62828,
    sky: {
        day: 0x87ceeb,
        night: 0x0b0d1b
    },
    vehicle: {
        lada: [
            0xffffff,
            0xb71c1c,
            0x1e88e5,
            0x2e7d32,
            0xf9a825,
            0x424242
        ]
    }
};

// NPC Types
export const NPC_TYPES = {
    GOPNIK: 'gopnik',
    BABUSHKA: 'babushka',
    BUSINESSMAN: 'businessman',
    POLICE: 'police',
    MILITARY: 'military',
    WORKER: 'worker'
};

// Building Types
export const BUILDING_TYPES = {
    APARTMENT: 'apartment',
    KHRUSHCHEVKA: 'khrushchevka',
    SHOP: 'shop',
    OFFICE: 'office',
    FACTORY: 'factory',
    SCHOOL: 'school',
    HOSPITAL: 'hospital',
    CHURCH: 'church',
    MILITARY_OFFICE: 'military_office',
    FERTILITY_CENTER: 'fertility_center',
    MARKET: 'market',
    METRO: 'metro',
    GAS_STATION: 'gas_station'
};

// Vehicle Types
export const VEHICLE_TYPES = {
    LADA_2107: 'lada_2107',
    LADA_2109: 'lada_2109',
    LADA_PRIORA: 'lada_priora',
    LADA_VESTA: 'lada_vesta',
    LADA_NIVA: 'lada_niva',
    UAZ: 'uaz',
    KAMAZ: 'kamaz'
};

// Main configuration object
export const CONFIG = {
    // Version
    version: VERSION,
    
    // World settings
    world: {
        size: 2000,
        chunkSize: 100,
        viewDistance: 500,
        groundColor: 0x3D5C3D,
        roadColor: 0x333333,
        sidewalkColor: 0x888888
    },
    
    // Physics settings
    physics: {
        gravity: -20,
        friction: 0.95,
        airResistance: 0.99,
        groundFriction: 0.85,
        collisionIterations: 3
    },
    
    // Player settings
    player: {
        walkSpeed: 5,
        runSpeed: 10,
        jumpForce: 8,
        height: 1.8,
        width: 0.6,
        eyeHeight: 1.6,
        interactDistance: 3,
        stamina: 100,
        staminaRegen: 10,
        staminaDrain: 20
    },
    
    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 2000,
        nearPlane: 0.1,
        farPlane: 2000,
        thirdPersonDistance: 5,
        thirdPersonHeight: 2,
        firstPersonHeight: 1.6,
        mouseSensitivity: 0.002,
        smoothing: 0.1
    },
    
    // Vehicle settings
    vehicle: {
        maxSpeed: 40,
        acceleration: 15,
        brakeForce: 30,
        turnSpeed: 2.5,
        friction: 0.98,
        handbrakeMultiplier: 0.7,
        enterDistance: 3,
        fuelCapacity: 50,
        fuelConsumption: 0.01
    },
    
    // NPC settings
    npc: {
        maxCount: 50,
        spawnRadius: 100,
        despawnRadius: 150,
        walkSpeed: 2,
        interactDistance: 2
    },
    
    // Graphics settings
    graphics: {
        shadows: true,
        shadowMapSize: 2048,
        antialias: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        fogNear: 100,
        fogFar: 500
    },
    
    // Audio settings
    audio: {
        masterVolume: 1.0,
        musicVolume: 0.5,
        sfxVolume: 0.7,
        ambientVolume: 0.4
    },
    
    // Economy settings
    economy: {
        startingMoney: 5000,
        taxiRatePerKm: 30,
        deliveryBaseRate: 200
    },
    
    // UI settings
    ui: {
        hudOpacity: 0.9,
        minimapSize: 180,
        notificationDuration: 3000,
        dialogWidth: 400
    },
    
    // Controls
    controls: {
        forward: ['KeyW', 'ArrowUp'],
        backward: ['KeyS', 'ArrowDown'],
        left: ['KeyA', 'ArrowLeft'],
        right: ['KeyD', 'ArrowRight'],
        jump: ['Space'],
        run: ['ShiftLeft', 'ShiftRight'],
        interact: ['KeyE'],
        inventory: ['Tab', 'KeyI'],
        pause: ['Escape'],
        horn: ['KeyH'],
        lights: ['KeyL'],
        exitVehicle: ['KeyF'],
        cameraToggle: ['KeyV']
    },
    
    // Day/Night settings
    dayNight: {
        dayDuration: 1200, // seconds for full day
        startTime: 12 * 60, // noon
        sunriseHour: 6,
        sunsetHour: 20
    },
    
    // Weather settings
    weather: {
        changeInterval: 300, // seconds between weather changes
        rainIntensity: 1000,
        snowIntensity: 500
    },
    
    // Building configuration
    buildings: {
        apartmentHeight: 15,
        khrushchevkaHeight: 12,
        shopHeight: 4,
        officeHeight: 25,
        factoryHeight: 10
    },
    
    // Debug settings
    debug: {
        showFPS: true,
        showColliders: false,
        showGrid: false,
        logLevel: 'info'
    }
};

// Export default
export default CONFIG;