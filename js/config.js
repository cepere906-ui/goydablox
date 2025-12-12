// ==================== КОНФИГУРАЦИЯ ИГРЫ ====================
export const CONFIG = {
    // Мир
    world: {
        size: 600,
        roadWidth: 12,
        blockSize: 70,
        treeCount: 200,
        lampSpacing: 35
    },
    
    // Игрок
    player: {
        walkSpeed: 8,
        runSpeed: 16,
        jumpForce: 12,
        height: 1.8,
        eyeHeight: 1.65,
        interactDistance: 4,
        gravity: 25
    },
    
    // Транспорт
    vehicle: {
        maxSpeed: 40,
        acceleration: 18,
        brakeForce: 35,
        reverseSpeed: 12,
        turnSpeed: 2.8,
        friction: 0.98,
        fuelConsumption: 0.02
    },
    
    // Камера
    camera: {
        fov: 75,
        near: 0.1,
        far: 800,
        sensitivity: 0.002,
        vehicleSensitivity: 0.003
    },
    
    // Графика
    graphics: {
        shadowMapSize: 2048,
        fogNear: 80,
        fogFar: 400,
        antialias: true
    },
    
    // Время
    time: {
        dayLength: 600, // секунд реального времени = 1 игровой день
        startHour: 8,
        sunriseHour: 6,
        sunsetHour: 21
    },
    
    // Экономика
    economy: {
        startMoney: 5000,
        salaryBase: 500,
        foodPrices: {
            shawarma: 200,
            grocery: 150,
            restaurant: 500
        },
        fuelPrice: 55,
        taxiPrice: 100
    },
    
    // Статы игрока
    stats: {
        hungerDecay: 0.5,      // в минуту
        energyDecay: 0.3,       // в минуту
        moodDecay: 0.2,         // в минуту
        healthRegen: 0.1,       // в минуту (если сытый и отдохнувший)
        foodRestore: 30,
        sleepRestore: 100,
        entertainmentRestore: 25
    },
    
    // NPC
    npc: {
        count: 20,
        walkSpeed: 2,
        viewDistance: 15,
        interactDistance: 3
    },
    
    // Автомобили Лада
    ladaModels: {
        '2109': {
            name: 'ЛАДА 2109 "Девятка"',
            color: 0x8B0000,
            maxSpeed: 35,
            acceleration: 14,
            fuelCapacity: 43,
            price: 150000
        },
        '2107': {
            name: 'ЛАДА 2107 "Семёрка"',
            color: 0x1a1a1a,
            maxSpeed: 32,
            acceleration: 12,
            fuelCapacity: 39,
            price: 100000
        },
        'granta': {
            name: 'ЛАДА Гранта',
            color: 0x4169E1,
            maxSpeed: 42,
            acceleration: 16,
            fuelCapacity: 50,
            price: 600000
        },
        'vesta': {
            name: 'ЛАДА Веста',
            color: 0xC0C0C0,
            maxSpeed: 45,
            acceleration: 18,
            fuelCapacity: 55,
            price: 1200000
        },
        'niva': {
            name: 'ЛАДА Нива',
            color: 0x556B2F,
            maxSpeed: 30,
            acceleration: 15,
            fuelCapacity: 42,
            price: 800000
        }
    },
    
    // Квесты
    quests: {
        introQuest: {
            id: 'intro',
            title: 'Первые шаги',
            objectives: [
                { id: 'explore', text: 'Осмотрите город', type: 'explore', target: 3 },
                { id: 'talk', text: 'Поговорите с жителем', type: 'interact', target: 1 },
                { id: 'earn', text: 'Заработайте 1000₽', type: 'money', target: 1000 }
            ],
            reward: { money: 2000, exp: 100 }
        }
    },
    
    // Здания
    buildings: {
        government: { color: 0x0039A6, height: 14 },
        military: { color: 0x4A5D23, height: 11 },
        fertility: { color: 0xFFB6C1, height: 12 },
        shop: { color: 0xDD0000, height: 6 },
        bank: { color: 0x00AA00, height: 10 },
        mall: { color: 0xDDDDDD, height: 16 },
        hospital: { color: 0xFFFFFF, height: 18 },
        church: { color: 0xFFFFF0, height: 22 },
        residential: { color: 0xCCCCBB, height: 18 },
        khrushchyovka: { color: 0xD4C896, height: 15 }
    },
    
    // Погода
    weather: {
        clear: { probability: 0.5, fogDensity: 1 },
        cloudy: { probability: 0.25, fogDensity: 0.8 },
        rain: { probability: 0.15, fogDensity: 0.6 },
        snow: { probability: 0.1, fogDensity: 0.5 }
    },
    
    // Управление
    controls: {
        forward: 'KeyW',
        backward: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
        run: 'ShiftLeft',
        jump: 'Space',
        interact: 'KeyE',
        vehicle: 'KeyF',
        inventory: 'KeyI',
        pause: 'Escape'
    },
    
    // Отладка
    debug: {
        enabled: false,
        showFPS: true,
        showPosition: false,
        noclip: false
    }
};

// Названия месяцев
export const MONTHS = [
    'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
];

// Иконки погоды
export const WEATHER_ICONS = {
    clear: '☀️',
    cloudy: '☁️',
    rain: '🌧️',
    snow: '❄️'
};

// Цвета освещения по времени суток
export const LIGHTING = {
    dawn: {
        sun: 0xFFAA66,
        ambient: 0x445566,
        sky: 0xFF9966,
        intensity: 0.6
    },
    day: {
        sun: 0xFFFFEE,
        ambient: 0x8899AA,
        sky: 0x87CEEB,
        intensity: 1.2
    },
    dusk: {
        sun: 0xFF6644,
        ambient: 0x334455,
        sky: 0xFF6633,
        intensity: 0.5
    },
    night: {
        sun: 0x223344,
        ambient: 0x111122,
        sky: 0x0a0a1a,
        intensity: 0.1
    }
};