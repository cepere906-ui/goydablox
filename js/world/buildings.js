// ==================== BUILDINGS ====================
import { CONFIG } from '../config.js';
import { Renderer } from '../engine/renderer.js';
import { Physics } from '../engine/physics.js';

class BuildingsManager {
    constructor() {
        this.buildings = [];
        this.interactables = [];
    }
    
    init() {
        this.createCityBuildings();
        this.createMonument();
        this.createBillboards();
        
        return this;
    }
    
    createCityBuildings() {
        // Государственные здания
        this.createGovernmentBuilding(55, -50, 'ГОСУСЛУГИ');
        this.createMilitaryOffice(90, -110);
        this.createFertilityCenter(-110, 110);
        this.createPoliceStation(-130, -55);
        
        // Магазины
        this.createShop(-65, -40, 'ПЯТЁРОЧКА', 0xDD0000);
        this.createShop(70, 55, 'МАГНИТ', 0xFF0066);
        this.createShop(-50, 85, 'ДИКСИ', 0xFF6600);
        this.createShop(95, -40, 'ПЕРЕКРЁСТОК', 0x00AA00);
        
        // Банки
        this.createBank(-60, -85, 'СБЕРБАНК', 0x00AA00);
        this.createBank(105, 85, 'ВТБ', 0x0044AA);
        
        // Торговый центр
        this.createMall(-90, 55);
        
        // Шаурма
        this.createShawarmaStand(22, 28);
        this.createShawarmaStand(-38, 58);
        this.createShawarmaStand(55, -25);
        
        // Заправка
        this.createGasStation(130, -160);
        
        // Больница
        this.createHospital(230, 75);
        
        // Церковь
        this.createChurch(190, 110);
        
        // Школа
        this.createSchool(-140, 210);
        
        // Жилые дома
        this.createResidentialArea();
    }
    
    createResidentialArea() {
        // Панельные дома
        const panelPositions = [
            [-150, -110], [-190, -110], [-150, -170], [-190, -170],
            [150, 130], [190, 130], [150, 190], [190, 190],
            [-160, 190], [-200, 190], [160, -170], [200, -170]
        ];
        
        panelPositions.forEach(([x, z]) => {
            this.createPanelBuilding(x, z);
        });
        
        // Хрущёвки
        const khrushPositions = [
            [-110, -210], [-170, -230], [110, 230], [170, 250]
        ];
        
        khrushPositions.forEach(([x, z]) => {
            this.createKhrushchyovka(x, z);
        });
    }
    
    // ==================== СОЗДАНИЕ ЗДАНИЙ ====================
    
    createGovernmentBuilding(x, z, name) {
        const group = new THREE.Group();
        const width = 30, depth = 18, height = 15;
        
        // Основное здание
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0x0039A6 })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Окна
        this.addWindows(group, width, height, depth, 5);
        
        // Колонны
        this.addColumns(group, 6, depth/2 + 1, 8);
        
        // Вывеска
        this.addSign(group, name, width - 6, 0, height + 2, depth/2);
        
        // Флаг
        this.addFlag(group, 0, height + 6, 0);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        // Коллайдер
        this.addBuildingCollider(x, z, width, height, depth);
        
        // Интерактивная зона
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + depth/2 + 3),
            radius: 5,
            type: 'government',
            name: name,
            message: 'Государственные услуги и оформление документов.'
        });
    }
    
    createMilitaryOffice(x, z) {
        const group = new THREE.Group();
        const width = 26, depth = 16, height = 12;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0x4A5D23 })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        this.addWindows(group, width, height, depth, 4);
        this.addSign(group, 'ВОЕНКОМАТ', width - 8, 0, height + 2, depth/2);
        
        // Звезда
        this.addRedStar(group, 0, height + 5, depth/2);
        
        // Баннеры
        this.addRecruitmentBanner(group, -width/2 - 0.1, 6, 0, Math.PI/2);
        this.addRecruitmentBanner(group, width/2 + 0.1, 6, 0, -Math.PI/2);
        
        this.addFlag(group, 0, height + 7, 0);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + depth/2 + 3),
            radius: 5,
            type: 'military',
            name: 'Военкомат',
            message: 'Пункт отбора на военную службу по контракту. Зарплата от 200000₽!',
            action: 'military'
        });
    }
    
    createFertilityCenter(x, z) {
        const group = new THREE.Group();
        const width = 28, depth = 18, height = 13;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0xFFB6C1 })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        this.addWindows(group, width, height, depth, 4, 0xFFE4E1);
        
        // Вывеска
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const ctx = signCanvas.getContext('2d');
        ctx.fillStyle = '#FF1493';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ЦЕНТР ПОВЫШЕНИЯ', 256, 50);
        ctx.fillText('РОЖДАЕМОСТИ', 256, 100);
        
        const signTex = new THREE.CanvasTexture(signCanvas);
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(18, 4.5, 0.2),
            new THREE.MeshBasicMaterial({ map: signTex })
        );
        sign.position.set(0, height + 3, depth/2);
        group.add(sign);
        
        // Сердце
        this.addHeart(group, 0, height + 7, depth/2);
        
        // Колонны
        this.addColumns(group, 2, depth/2 + 1, 7, 4);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + depth/2 + 3),
            radius: 5,
            type: 'fertility',
            name: 'Центр Повышения Рождаемости',
            message: 'Государственная программа поддержки семей. Материнский капитал, пособия, консультации.',
            action: 'fertility'
        });
    }
    
    createPoliceStation(x, z) {
        const group = new THREE.Group();
        const width = 24, depth = 14, height = 10;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0x4169E1 })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        this.addWindows(group, width, height, depth, 3);
        this.addSign(group, 'ПОЛИЦИЯ', width - 6, 0, height + 1.5, depth/2);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + depth/2 + 3),
            radius: 4,
            type: 'police',
            name: 'Полиция',
            message: 'Отделение полиции. Для подачи заявлений и консультаций.'
        });
    }
    
    createShop(x, z, name, color) {
        const group = new THREE.Group();
        const width = 20, depth = 14, height = 7;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: color })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Витрина
        const window = new THREE.Mesh(
            new THREE.BoxGeometry(width - 4, height - 2.5, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.5 })
        );
        window.position.set(0, height/2 + 0.5, depth/2 + 0.05);
        group.add(window);
        
        // Дверь
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(3, 4, 0.1),
            new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        door.position.set(0, 2, depth/2 + 0.1);
        group.add(door);
        
        this.addSign(group, name, width - 3, 0, height + 1.5, depth/2);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + depth/2 + 2.5),
            radius: 4,
            type: 'shop',
            name: name,
            message: 'Продуктовый магазин. Купите еды!',
            action: 'shop'
        });
    }
    
    createBank(x, z, name, color) {
        const group = new THREE.Group();
        const width = 22, depth = 16, height = 11;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: color })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        this.addWindows(group, width, height, depth, 3);
        this.addSign(group, name, width - 5, 0, height + 2, depth/2);
        this.addColumns(group, 4, depth/2 + 0.8, 6, 2.5);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + depth/2 + 2.5),
            radius: 4,
            type: 'bank',
            name: name,
            message: 'Банк. Кредиты, вклады, переводы.',
            action: 'bank'
        });
    }
    
    createMall(x, z) {
        const group = new THREE.Group();
        const width = 55, depth = 40, height = 18;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0xDDDDDD })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Стеклянный фасад
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(width - 5, height - 4, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.4 })
        );
        glass.position.set(0, height/2, depth/2 + 0.1);
        group.add(glass);
        
        // Вывеска
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 256;
        signCanvas.height = 64;
        const ctx = signCanvas.getContext('2d');
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ТЦ ГОЙДА', 128, 48);
        
        const signTex = new THREE.CanvasTexture(signCanvas);
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(25, 6, 0.3),
            new THREE.MeshBasicMaterial({ map: signTex })
        );
        sign.position.set(0, height + 4, depth/2);
        group.add(sign);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + depth/2 + 3),
            radius: 6,
            type: 'mall',
            name: 'ТЦ ГОЙДА',
            message: 'Торговый центр. Магазины, кафе, развлечения.',
            action: 'mall'
        });
    }
    
    createShawarmaStand(x, z) {
        const group = new THREE.Group();
        
        const kiosk = new THREE.Mesh(
            new THREE.BoxGeometry(5.5, 4, 4.5),
            new THREE.MeshLambertMaterial({ color: 0xFFA500 })
        );
        kiosk.position.y = 2;
        kiosk.castShadow = true;
        group.add(kiosk);
        
        // Окно
        const window = new THREE.Mesh(
            new THREE.BoxGeometry(3.5, 2, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x333333 })
        );
        window.position.set(0, 2.5, 2.3);
        group.add(window);
        
        this.addSign(group, 'ШАУРМА 200₽', 5, 0, 4.5, 2.25);
        
        // Вертел
        const spit = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.4, 1.6, 8),
            new THREE.MeshLambertMaterial({ color: 0x8B4513 })
        );
        spit.position.set(-1.8, 2.5, 0);
        group.add(spit);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + 3),
            radius: 3,
            type: 'food',
            name: 'Шаурма',
            price: 200,
            message: 'Свежая шаурма! Цена: 200₽',
            action: 'food'
        });
    }
    
    createGasStation(x, z) {
        const group = new THREE.Group();
        
        // Навес
        const canopy = new THREE.Mesh(
            new THREE.BoxGeometry(25, 0.6, 18),
            new THREE.MeshLambertMaterial({ color: 0xDD0000 })
        );
        canopy.position.y = 6;
        group.add(canopy);
        
        // Опоры
        const pillarMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        [[-10, -7], [-10, 7], [10, -7], [10, 7]].forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 6, 0.6),
                pillarMat
            );
            pillar.position.set(px, 3, pz);
            pillar.castShadow = true;
            group.add(pillar);
        });
        
        // Колонки
        for (let i = -1; i <= 1; i += 2) {
            const pump = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2.5, 0.7),
                new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
            );
            pump.position.set(i * 6, 1.25, 0);
            pump.castShadow = true;
            group.add(pump);
        }
        
        // Магазин
        const shop = new THREE.Mesh(
            new THREE.BoxGeometry(14, 5, 10),
            new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
        );
        shop.position.set(0, 2.5, -15);
        shop.castShadow = true;
        group.add(shop);
        
        this.addSign(group, 'ЛУКОЙЛ', 12, 0, 7.5, 0);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + 10),
            radius: 5,
            type: 'gas',
            name: 'АЗС ЛУКОЙЛ',
            message: `Заправка. Топливо: ${CONFIG.economy.fuelPrice}₽/л`,
            action: 'gas'
        });
    }
    
    createHospital(x, z) {
        const group = new THREE.Group();
        const width = 38, depth = 24, height = 20;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        this.addWindows(group, width, height, depth, 6);
        
        // Красный крест
        const crossMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 0.2), crossMat);
        crossV.position.set(0, 16, depth/2 + 0.1);
        group.add(crossV);
        
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 0.2), crossMat);
        crossH.position.set(0, 16, depth/2 + 0.1);
        group.add(crossH);
        
        this.addSign(group, 'БОЛЬНИЦА', 14, 0, height + 2, depth/2);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + depth/2 + 3),
            radius: 5,
            type: 'hospital',
            name: 'Больница',
            message: 'Городская больница. Лечение и медицинские услуги.',
            action: 'hospital'
        });
    }
    
    createChurch(x, z) {
        const group = new THREE.Group();
        
        // Основное здание
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(18, 16, 25),
            new THREE.MeshLambertMaterial({ color: 0xFFFFF0 })
        );
        body.position.y = 8;
        body.castShadow = true;
        group.add(body);
        
        // Купол
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(5, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 })
        );
        dome.position.y = 19;
        group.add(dome);
        
        // Крест
        const crossMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), crossMat);
        crossV.position.y = 26;
        group.add(crossV);
        
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.4), crossMat);
        crossH.position.y = 26.8;
        group.add(crossH);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, 18, 16, 25);
        
        this.interactables.push({
            position: new THREE.Vector3(x, 0, z + 15),
            radius: 5,
            type: 'church',
            name: 'Храм',
            message: 'Православный храм. Место молитвы и покоя.'
        });
    }
    
    createSchool(x, z) {
        const group = new THREE.Group();
        const width = 55, depth = 25, height = 15;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0xF5DEB3 })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        this.addWindows(group, width, height, depth, 5);
        this.addSign(group, 'ШКОЛА №1', 14, 0, height + 2, depth/2);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
    }
    
    createPanelBuilding(x, z) {
        const group = new THREE.Group();
        const width = 48, depth = 15;
        const floors = 5 + Math.floor(Math.random() * 4);
        const height = floors * 3;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0xCCCCBB })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Окна
        const winLit = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
        const winDark = new THREE.MeshBasicMaterial({ color: 0x334455 });
        
        for (let floor = 0; floor < floors; floor++) {
            for (let wx = -width/2 + 3; wx < width/2 - 2; wx += 4) {
                const isLit = Math.random() > 0.4;
                const win = new THREE.Mesh(
                    new THREE.BoxGeometry(1.8, 2, 0.1),
                    isLit ? winLit : winDark
                );
                win.position.set(wx, floor * 3 + 2.5, depth/2 + 0.05);
                group.add(win);
            }
        }
        
        // Балконы
        for (let floor = 1; floor < floors; floor++) {
            for (let bx = -width/2 + 7; bx < width/2 - 5; bx += 12) {
                if (Math.random() > 0.4) {
                    const balc = new THREE.Mesh(
                        new THREE.BoxGeometry(2.8, 0.15, 1.5),
                        new THREE.MeshLambertMaterial({ color: 0x999999 })
                    );
                    balc.position.set(bx, floor * 3 + 1.2, depth/2 + 0.75);
                    group.add(balc);
                }
            }
        }
        
        // Крыша
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.6, 0.6, depth + 0.6),
            new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        roof.position.y = height + 0.3;
        group.add(roof);
        
        // Подъезд
        const entrance = new THREE.Mesh(
            new THREE.BoxGeometry(4.5, 4.5, 1.8),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        entrance.position.set(0, 2.25, depth/2 + 0.9);
        group.add(entrance);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
    }
    
    createKhrushchyovka(x, z) {
        const group = new THREE.Group();
        const width = 38, depth = 13, height = 15;
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({ color: 0xD4C896 })
        );
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Окна
        const winLit = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
        const winDark = new THREE.MeshBasicMaterial({ color: 0x334455 });
        
        for (let floor = 0; floor < 5; floor++) {
            for (let wx = -width/2 + 2.5; wx < width/2 - 1.5; wx += 3.2) {
                const isLit = Math.random() > 0.5;
                const win = new THREE.Mesh(
                    new THREE.BoxGeometry(1.4, 1.7, 0.1),
                    isLit ? winLit : winDark
                );
                win.position.set(wx, floor * 3 + 2.2, depth/2 + 0.05);
                group.add(win);
            }
        }
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.addBuildingCollider(x, z, width, height, depth);
    }
    
    createMonument() {
        const group = new THREE.Group();
        
        // База
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(9, 10, 1.8, 32),
            new THREE.MeshLambertMaterial({ color: 0x555555 })
        );
        base.position.y = 0.9;
        base.receiveShadow = true;
        group.add(base);
        
        // Пьедестал
        const pedestal = new THREE.Mesh(
            new THREE.BoxGeometry(5, 6, 5),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        pedestal.position.y = 4.8;
        pedestal.castShadow = true;
        group.add(pedestal);
        
        // Статуя
        const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xCD7F32, metalness: 0.7, roughness: 0.3 });
        
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 4, 12), bronzeMat);
        body.position.y = 10;
        body.castShadow = true;
        group.add(body);
        
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), bronzeMat);
        head.position.y = 12.8;
        group.add(head);
        
        // Рука вверх
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3, 8), bronzeMat);
        arm.position.set(0.6, 11, 0.4);
        arm.rotation.z = -0.6;
        arm.rotation.x = 0.4;
        group.add(arm);
        
        // Табличка
        this.addSign(group, 'СЛАВА ГОЙДЕ!', 7, 0, 2.5, 5.1);
        
        // Флагшток
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 12, 8),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
        );
        pole.position.set(14, 6, 0);
        group.add(pole);
        
        // Флаг России
        const flagColors = [0xFFFFFF, 0x0039A6, 0xD52B1E];
        for (let i = 0; i < 3; i++) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(5, 1, 0.05),
                new THREE.MeshLambertMaterial({ color: flagColors[i], side: THREE.DoubleSide })
            );
            stripe.position.set(16.5, 11 - i * 1, 0);
            group.add(stripe);
        }
        
        group.position.set(0, 0, 0);
        Renderer.add(group);
        this.buildings.push(group);
        
        this.interactables.push({
            position: new THREE.Vector3(0, 0, 0),
            radius: 12,
            type: 'monument',
            name: 'Памятник "СЛАВА ГОЙДЕ!"',
            message: 'Величественный памятник в центре города. Место встреч и праздников.'
        });
    }
    
    createBillboards() {
        this.createBillboard(45, 75, 0, 'КОНТРАКТ', '8-800-222-22-22', '#006400');
        this.createBillboard(-75, 50, Math.PI/2, 'ЗАЩИТИ РОДИНУ', 'РОССИЯ ЗОВЁТ', '#8B0000');
        this.createBillboard(115, -75, Math.PI, 'СЛУЖБА', 'ОТ 200000₽', '#00008B');
        this.createBillboard(-50, -100, -Math.PI/2, 'МАТЕРИНСКИЙ', 'КАПИТАЛ', '#FF1493');
    }
    
    createBillboard(x, z, rot, text, subtext, bgColor) {
        const group = new THREE.Group();
        
        // Опоры
        const postMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        for (let side = -1; side <= 1; side += 2) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 8, 8), postMat);
            post.position.set(side * 3.5, 4, 0);
            post.castShadow = true;
            group.add(post);
        }
        
        // Рекламный щит
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 512, 256);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, 504, 248);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 256, 100);
        
        ctx.font = '36px Arial';
        ctx.fillText(subtext, 256, 165);
        
        // Флаг
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 216, 512, 13);
        ctx.fillStyle = '#0039A6';
        ctx.fillRect(0, 229, 512, 13);
        ctx.fillStyle = '#D52B1E';
        ctx.fillRect(0, 242, 512, 14);
        
        const tex = new THREE.CanvasTexture(canvas);
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(8, 4, 0.3),
            new THREE.MeshBasicMaterial({ map: tex })
        );
        panel.position.y = 6.5;
        group.add(panel);
        
        // Задняя панель
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(8, 4, 0.2),
            new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        back.position.set(0, 6.5, -0.25);
        group.add(back);
        
        group.position.set(x, 0, z);
        group.rotation.y = rot;
        Renderer.add(group);
        this.buildings.push(group);
    }
    
    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
    
    addWindows(group, width, height, depth, floors, glassColor = 0x87CEEB) {
        const glassMat = new THREE.MeshBasicMaterial({ 
            color: glassColor, 
            transparent: true, 
            opacity: 0.6 
        });
        
        for (let floor = 0; floor < floors; floor++) {
            for (let wx = -width/2 + 3; wx < width/2 - 2; wx += 4.5) {
                const win = new THREE.Mesh(
                    new THREE.BoxGeometry(2.2, 2.5, 0.1),
                    glassMat
                );
                win.position.set(wx, floor * (height/floors) + height/(floors*2), depth/2 + 0.05);
                group.add(win);
            }
        }
    }
    
    addColumns(group, count, zOffset, height, spacing = 2) {
        const colMat = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        
        const totalWidth = (count - 1) * spacing;
        for (let i = 0; i < count; i++) {
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, height, 12),
                colMat
            );
            col.position.set(-totalWidth/2 + i * spacing, height/2, zOffset);
            col.castShadow = true;
            group.add(col);
        }
    }
    
    addSign(group, text, width, x, y, z) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 256, 64);
        
        const tex = new THREE.CanvasTexture(canvas);
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(width, 2, 0.15),
            new THREE.MeshBasicMaterial({ map: tex })
        );
        sign.position.set(x, y, z);
        group.add(sign);
    }
    
    addFlag(group, x, y, z) {
        // Флагшток
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 6, 8),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
        );
        pole.position.set(x, y + 3, z);
        group.add(pole);
        
        // Флаг России
        const flagColors = [0xFFFFFF, 0x0039A6, 0xD52B1E];
        for (let i = 0; i < 3; i++) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 0.5, 0.05),
                new THREE.MeshLambertMaterial({ color: flagColors[i], side: THREE.DoubleSide })
            );
            stripe.position.set(x + 1.25, y + 5.5 - i * 0.5, z);
            group.add(stripe);
        }
    }
    
    addRedStar(group, x, y, z) {
        const starShape = new THREE.Shape();
        const outerRadius = 1.8;
        const innerRadius = 0.7;
        
        for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const innerAngle = outerAngle + Math.PI / 5;
            
            if (i === 0) {
                starShape.moveTo(
                    Math.cos(outerAngle) * outerRadius,
                    Math.sin(outerAngle) * outerRadius
                );
            } else {
                starShape.lineTo(
                    Math.cos(outerAngle) * outerRadius,
                    Math.sin(outerAngle) * outerRadius
                );
            }
            
            starShape.lineTo(
                Math.cos(innerAngle) * innerRadius,
                Math.sin(innerAngle) * innerRadius
            );
        }
        starShape.closePath();
        
        const star = new THREE.Mesh(
            new THREE.ShapeGeometry(starShape),
            new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide })
        );
        star.position.set(x, y, z + 0.1);
        group.add(star);
    }
    
    addHeart(group, x, y, z) {
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0, -0.3, -0.5, -0.8, -1, -0.8);
        heartShape.bezierCurveTo(-1.5, -0.8, -2, -0.3, -2, 0.3);
        heartShape.bezierCurveTo(-2, 1, -1, 1.8, 0, 2.5);
        heartShape.bezierCurveTo(1, 1.8, 2, 1, 2, 0.3);
        heartShape.bezierCurveTo(2, -0.3, 1.5, -0.8, 1, -0.8);
        heartShape.bezierCurveTo(0.5, -0.8, 0, -0.3, 0, 0);
        
        const heart = new THREE.Mesh(
            new THREE.ShapeGeometry(heartShape),
            new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide })
        );
        heart.scale.set(0.9, 0.9, 1);
        heart.rotation.z = Math.PI;
        heart.position.set(x, y, z + 0.1);
        group.add(heart);
    }
    
    addRecruitmentBanner(group, x, y, z, rot) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#1a4d1a';
        ctx.fillRect(0, 0, 128, 256);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeRect(5, 5, 118, 246);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('КОНТРАКТ', 64, 35);
        ctx.fillText('НА СЛУЖБУ', 64, 60);
        
        ctx.font = '14px Arial';
        ctx.fillText('ЗАРПЛАТА', 64, 100);
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.fillText('от 200000₽', 64, 130);
        
        // Флаг
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(14, 200, 100, 16);
        ctx.fillStyle = '#0039A6';
        ctx.fillRect(14, 216, 100, 16);
        ctx.fillStyle = '#D52B1E';
        ctx.fillRect(14, 232, 100, 16);
        
        const tex = new THREE.CanvasTexture(canvas);
        const banner = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 5.5, 2.8),
            new THREE.MeshBasicMaterial({ map: tex })
        );
        banner.position.set(x, y, z);
        banner.rotation.y = rot;
        group.add(banner);
    }
    
    addBuildingCollider(x, z, width, height, depth) {
        Physics.addCollider({
            type: 'box',
            x: x,
            y: height / 2,
            z: z,
            width: width,
            height: height,
            depth: depth,
            enabled: true
        });
    }
    
    getInteractables() {
        return this.interactables;
    }
    
    destroy() {
        this.buildings.forEach(building => Renderer.remove(building));
        this.buildings = [];
        this.interactables = [];
    }
}

export const Buildings = new BuildingsManager();