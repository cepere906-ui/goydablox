// ============================================================
// ГОЙДАБЛОКС - ТРАНСПОРТ
// ============================================================

const VehicleFactory = {
    materials: {},
    
    getMaterial(color, options = {}) {
        const key = `${color}_${JSON.stringify(options)}`;
        if (!this.materials[key]) {
            this.materials[key] = new THREE.MeshLambertMaterial({ color, ...options });
        }
        return this.materials[key];
    },
    
    // ===== ЛАДА ГРАНТА =====
    createLada(color = COLORS.ladaGreen) {
        const car = new THREE.Group();
        car.name = 'lada';
        
        // Кузов
        const bodyGeom = new THREE.BoxGeometry(2.2, 0.8, 4.5);
        const bodyMat = this.getMaterial(color);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.6;
        body.castShadow = true;
        car.add(body);
        
        // Кабина
        const cabinGeom = new THREE.BoxGeometry(2, 0.7, 2.2);
        const cabin = new THREE.Mesh(cabinGeom, bodyMat);
        cabin.position.set(0, 1.25, -0.3);
        cabin.castShadow = true;
        car.add(cabin);
        
        // Скос капота
        const hoodGeom = new THREE.BoxGeometry(2, 0.3, 1.2);
        const hood = new THREE.Mesh(hoodGeom, bodyMat);
        hood.position.set(0, 0.95, 1.5);
        hood.rotation.x = -0.15;
        car.add(hood);
        
        // Скос багажника
        const trunkGeom = new THREE.BoxGeometry(2, 0.3, 0.8);
        const trunk = new THREE.Mesh(trunkGeom, bodyMat);
        trunk.position.set(0, 0.95, -1.8);
        trunk.rotation.x = 0.2;
        car.add(trunk);
        
        // Стёкла
        const glassMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.7 });
        
        // Лобовое стекло
        const frontGlassGeom = new THREE.BoxGeometry(1.8, 0.6, 0.1);
        const frontGlass = new THREE.Mesh(frontGlassGeom, glassMat);
        frontGlass.position.set(0, 1.3, 0.9);
        frontGlass.rotation.x = 0.25;
        car.add(frontGlass);
        
        // Заднее стекло
        const backGlass = new THREE.Mesh(frontGlassGeom, glassMat);
        backGlass.position.set(0, 1.3, -1.5);
        backGlass.rotation.x = -0.25;
        car.add(backGlass);
        
        // Боковые стёкла
        const sideGlassGeom = new THREE.BoxGeometry(0.1, 0.5, 1.8);
        [-1.05, 1.05].forEach(x => {
            const sideGlass = new THREE.Mesh(sideGlassGeom, glassMat);
            sideGlass.position.set(x, 1.3, -0.3);
            car.add(sideGlass);
        });
        
        // Колёса
        car.userData.wheels = [];
        const wheelPositions = [
            [-1.1, 0.35, 1.4],
            [1.1, 0.35, 1.4],
            [-1.1, 0.35, -1.4],
            [1.1, 0.35, -1.4]
        ];
        
        wheelPositions.forEach((pos, i) => {
            const wheelGroup = this.createWheel();
            wheelGroup.position.set(...pos);
            car.add(wheelGroup);
            car.userData.wheels.push(wheelGroup);
        });
        
        // Фары передние
        const headlightGeom = new THREE.BoxGeometry(0.35, 0.2, 0.1);
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });
        [-0.75, 0.75].forEach(x => {
            const headlight = new THREE.Mesh(headlightGeom, headlightMat);
            headlight.position.set(x, 0.55, 2.26);
            car.add(headlight);
        });
        
        // Фары задние
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xAA0000 });
        [-0.75, 0.75].forEach(x => {
            const taillight = new THREE.Mesh(headlightGeom, taillightMat);
            taillight.position.set(x, 0.55, -2.26);
            car.add(taillight);
        });
        
        // Поворотники
        const blinkerMat = new THREE.MeshBasicMaterial({ color: 0xFFAA00 });
        [-0.95, 0.95].forEach(x => {
            const blinker = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.15, 0.1),
                blinkerMat
            );
            blinker.position.set(x, 0.55, 2.26);
            car.add(blinker);
        });
        
        // Номерной знак
        const plateNum = TextureGenerator.generatePlateNumber();
        const plateTexture = TextureGenerator.licensePlate(plateNum);
        const plateGeom = new THREE.BoxGeometry(0.52, 0.11, 0.02);
        const plateMat = new THREE.MeshBasicMaterial({ map: plateTexture });
        
        const plateFront = new THREE.Mesh(plateGeom, plateMat);
        plateFront.position.set(0, 0.3, 2.26);
        car.add(plateFront);
        
        const plateBack = new THREE.Mesh(plateGeom, plateMat);
        plateBack.position.set(0, 0.3, -2.26);
        plateBack.rotation.y = Math.PI;
        car.add(plateBack);
        
        // Зеркала
        const mirrorMat = this.getMaterial(0x111111);
        [-1.15, 1.15].forEach(x => {
            const mirror = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, 0.15, 0.1),
                mirrorMat
            );
            mirror.position.set(x, 1.1, 0.5);
            car.add(mirror);
        });
        
        // Дверные ручки
        const handleMat = this.getMaterial(0x333333);
        [[-1.12, 1, 0.3], [1.12, 1, 0.3], [-1.12, 1, -0.5], [1.12, 1, -0.5]].forEach(pos => {
            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.08, 0.2),
                handleMat
            );
            handle.position.set(...pos);
            car.add(handle);
        });
        
        car.userData.type = 'vehicle';
        car.userData.vehicleType = 'lada';
        car.userData.fuel = 100;
        car.userData.maxSpeed = CONFIG.carMaxSpeed;
        car.userData.color = color;
        car.userData.plateNumber = plateNum;
        car.userData.collision = {
            width: 2.4,
            depth: 4.8,
            height: 2
        };
        
        return car;
    },
    
    // Создать колесо
    createWheel() {
        const wheelGroup = new THREE.Group();
        
        // Шина
        const tireGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
        const tireMat = this.getMaterial(0x222222);
        const tire = new THREE.Mesh(tireGeom, tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        wheelGroup.add(tire);
        
        // Диск
        const hubGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.26, 8);
        const hubMat = this.getMaterial(0xCCCCCC);
        const hub = new THREE.Mesh(hubGeom, hubMat);
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);
        
        // Спицы диска
        const spokeMat = this.getMaterial(0xAAAAAA);
        for (let i = 0; i < 5; i++) {
            const spoke = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 0.13, 0.15),
                spokeMat
            );
            const angle = (i / 5) * Math.PI * 2;
            spoke.position.x = 0.13;
            spoke.position.y = Math.cos(angle) * 0.1;
            spoke.position.z = Math.sin(angle) * 0.1;
            wheelGroup.add(spoke);
        }
        
        return wheelGroup;
    },
    
    // ===== ЛАДА НИВА =====
    createNiva(color = COLORS.ladaGreen) {
        const car = new THREE.Group();
        car.name = 'niva';
        
        // Кузов (внедорожник - выше)
        const bodyGeom = new THREE.BoxGeometry(1.9, 1.1, 3.8);
        const bodyMat = this.getMaterial(color);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.95;
        body.castShadow = true;
        car.add(body);
        
        // Крыша
        const roofGeom = new THREE.BoxGeometry(1.8, 0.5, 2);
        const roof = new THREE.Mesh(roofGeom, bodyMat);
        roof.position.set(0, 1.75, -0.3);
        roof.castShadow = true;
        car.add(roof);
        
        // Стёкла
        const glassMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.7 });
        
        const frontGlass = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.5, 0.1),
            glassMat
        );
        frontGlass.position.set(0, 1.6, 0.8);
        frontGlass.rotation.x = 0.2;
        car.add(frontGlass);
        
        const backGlass = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.4, 0.1),
            glassMat
        );
        backGlass.position.set(0, 1.6, -1.4);
        backGlass.rotation.x = -0.15;
        car.add(backGlass);
        
        // Колёса (больше чем у Гранты)
        car.userData.wheels = [];
        const wheelPositions = [
            [-0.95, 0.45, 1.2],
            [0.95, 0.45, 1.2],
            [-0.95, 0.45, -1.2],
            [0.95, 0.45, -1.2]
        ];
        
        wheelPositions.forEach((pos) => {
            const wheelGroup = this.createWheelOffroad();
            wheelGroup.position.set(...pos);
            car.add(wheelGroup);
            car.userData.wheels.push(wheelGroup);
        });
        
        // Фары
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });
        [-0.6, 0.6].forEach(x => {
            const headlight = new THREE.Mesh(
                new THREE.CircleGeometry(0.15, 8),
                headlightMat
            );
            headlight.position.set(x, 0.9, 1.91);
            car.add(headlight);
        });
        
        // Решётка радиатора
        const grillMat = this.getMaterial(0x222222);
        const grill = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.3, 0.05),
            grillMat
        );
        grill.position.set(0, 0.7, 1.91);
        car.add(grill);
        
        // Номерной знак
        const plateNum = TextureGenerator.generatePlateNumber();
        const plateTexture = TextureGenerator.licensePlate(plateNum);
        const plateMat = new THREE.MeshBasicMaterial({ map: plateTexture });
        
        const plate = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.11, 0.02),
            plateMat
        );
        plate.position.set(0, 0.45, 1.91);
        car.add(plate);
        
        // Запаска на двери багажника
        const spareTire = this.createWheelOffroad();
        spareTire.position.set(0, 1, -1.95);
        spareTire.rotation.y = Math.PI / 2;
        spareTire.scale.set(0.9, 0.9, 0.9);
        car.add(spareTire);
        
        car.userData.type = 'vehicle';
        car.userData.vehicleType = 'niva';
        car.userData.fuel = 100;
        car.userData.maxSpeed = CONFIG.carMaxSpeed * 0.85;
        car.userData.color = color;
        car.userData.collision = {
            width: 2.1,
            depth: 4,
            height: 2.2
        };
        
        return car;
    },
    
    // Колесо для внедорожника
    createWheelOffroad() {
        const wheelGroup = new THREE.Group();
        
        const tireGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16);
        const tireMat = this.getMaterial(0x1a1a1a);
        const tire = new THREE.Mesh(tireGeom, tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        wheelGroup.add(tire);
        
        const hubGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.31, 8);
        const hubMat = this.getMaterial(0x888888);
        const hub = new THREE.Mesh(hubGeom, hubMat);
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);
        
        return wheelGroup;
    },
    
    // ===== АВТОБУС =====
    createBus() {
        const bus = new THREE.Group();
        bus.name = 'bus';
        
        // Кузов
        const bodyGeom = new THREE.BoxGeometry(2.8, 2.8, 10);
        const bodyMat = this.getMaterial(0xFFCC00);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 1.8;
        body.castShadow = true;
        bus.add(body);
        
        // Синяя полоса
        const stripeGeom = new THREE.BoxGeometry(2.85, 0.4, 10.05);
        const stripeMat = this.getMaterial(0x0039A6);
        const stripe = new THREE.Mesh(stripeGeom, stripeMat);
        stripe.position.y = 1.5;
        bus.add(stripe);
        
        // Окна
        const glassMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.7 });
        for (let z = -3.5; z <= 3.5; z += 1.4) {
            [-1.41, 1.41].forEach(x => {
                const window = new THREE.Mesh(
                    new THREE.BoxGeometry(0.05, 1, 1),
                    glassMat
                );
                window.position.set(x, 2.3, z);
                bus.add(window);
            });
        }
        
        // Лобовое стекло
        const frontGlass = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 1.4, 0.1),
            glassMat
        );
        frontGlass.position.set(0, 2.4, 5.05);
        bus.add(frontGlass);
        
        // Колёса
        bus.userData.wheels = [];
        const wheelPositions = [
            [-1.2, 0.5, 3.5],
            [1.2, 0.5, 3.5],
            [-1.2, 0.5, -3],
            [1.2, 0.5, -3]
        ];
        
        wheelPositions.forEach((pos) => {
            const wheel = this.createBusWheel();
            wheel.position.set(...pos);
            bus.add(wheel);
            bus.userData.wheels.push(wheel);
        });
        
        // Двери
        const doorMat = this.getMaterial(0x333333);
        [2, -1.5].forEach(z => {
            const door = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 2, 1.2),
                doorMat
            );
            door.position.set(1.45, 1.4, z);
            bus.add(door);
        });
        
        // Маршрут
        const routeTexture = TextureGenerator.sign('МАРШРУТ 777', '#000000', '#FFD700');
        const routeMat = new THREE.MeshBasicMaterial({ map: routeTexture });
        const route = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.4, 0.05),
            routeMat
        );
        route.position.set(0, 3, 5.03);
        bus.add(route);
        
        bus.userData.type = 'vehicle';
        bus.userData.vehicleType = 'bus';
        bus.userData.fuel = 100;
        bus.userData.maxSpeed = CONFIG.carMaxSpeed * 0.6;
        bus.userData.collision = {
            width: 3,
            depth: 10.5,
            height: 3.5
        };
        
        return bus;
    },
    
    createBusWheel() {
        const wheelGroup = new THREE.Group();
        
        const tireGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
        const tireMat = this.getMaterial(0x111111);
        const tire = new THREE.Mesh(tireGeom, tireMat);
        tire.rotation.z = Math.PI / 2;
        wheelGroup.add(tire);
        
        const hubGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.41, 8);
        const hubMat = this.getMaterial(0x666666);
        const hub = new THREE.Mesh(hubGeom, hubMat);
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);
        
        return wheelGroup;
    },
    
    // ===== ПОЛИЦЕЙСКАЯ МАШИНА =====
    createPoliceCar() {
        const car = this.createLada(COLORS.white);
        car.name = 'police';
        car.userData.vehicleType = 'police';
        
        // Синяя полоса
        const stripeGeom = new THREE.BoxGeometry(2.25, 0.15, 4);
        const stripeMat = this.getMaterial(0x0039A6);
        const stripe = new THREE.Mesh(stripeGeom, stripeMat);
        stripe.position.set(0, 0.85, 0);
        car.add(stripe);
        
        // Мигалка
        const lightBarGeom = new THREE.BoxGeometry(1.2, 0.2, 0.5);
        const lightBarMat = this.getMaterial(0x333333);
        const lightBar = new THREE.Mesh(lightBarGeom, lightBarMat);
        lightBar.position.set(0, 1.7, -0.3);
        car.add(lightBar);
        
        // Синий маячок
        const blueLightGeom = new THREE.BoxGeometry(0.3, 0.15, 0.3);
        const blueLightMat = new THREE.MeshBasicMaterial({ color: 0x0000FF });
        const blueLight = new THREE.Mesh(blueLightGeom, blueLightMat);
        blueLight.position.set(-0.3, 1.85, -0.3);
        car.add(blueLight);
        car.userData.blueLight = blueLight;
        
        // Красный маячок
        const redLightMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const redLight = new THREE.Mesh(blueLightGeom, redLightMat);
        redLight.position.set(0.3, 1.85, -0.3);
        car.add(redLight);
        car.userData.redLight = redLight;
        
        // Надпись ДПС
        const dpsTexture = TextureGenerator.sign('ДПС', '#FFFFFF', '#0039A6');
        const dpsMat = new THREE.MeshBasicMaterial({ map: dpsTexture });
        
        [-1.12, 1.12].forEach(x => {
            const dps = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 0.25, 0.6),
                dpsMat
            );
            dps.position.set(x, 0.8, 0);
            car.add(dps);
        });
        
        return car;
    },
    
    // ===== СКОРАЯ ПОМОЩЬ =====
    createAmbulance() {
        const van = new THREE.Group();
        van.name = 'ambulance';
        
        // Кузов
        const bodyGeom = new THREE.BoxGeometry(2.2, 2.2, 5);
        const bodyMat = this.getMaterial(0xFFFFFF);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 1.4;
        body.castShadow = true;
        van.add(body);
        
        // Кабина
        const cabinGeom = new THREE.BoxGeometry(2.2, 1.3, 1.8);
        const cabin = new THREE.Mesh(cabinGeom, bodyMat);
        cabin.position.set(0, 1.15, 3.2);
        cabin.castShadow = true;
        van.add(cabin);
        
        // Красная полоса
        const stripeGeom = new THREE.BoxGeometry(2.25, 0.4, 5.05);
        const stripeMat = this.getMaterial(0xDD0000);
        const stripe = new THREE.Mesh(stripeGeom, stripeMat);
        stripe.position.set(0, 1.8, 0);
        van.add(stripe);
        
        // Крест
        const crossMat = this.getMaterial(0xDD0000);
        const crossV = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.8, 0.05),
            crossMat
        );
        crossV.position.set(0, 1.8, 2.53);
        van.add(crossV);
        
        const crossH = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.2, 0.05),
            crossMat
        );
        crossH.position.set(0, 1.8, 2.53);
        van.add(crossH);
        
        // Стёкла
        const glassMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.7 });
        const frontGlass = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.8, 0.1),
            glassMat
        );
        frontGlass.position.set(0, 1.4, 4.15);
        van.add(frontGlass);
        
        // Колёса
        van.userData.wheels = [];
        [[-1, 0.4, 2.8], [1, 0.4, 2.8], [-1, 0.4, -1.5], [1, 0.4, -1.5]].forEach(pos => {
            const wheel = this.createWheel();
            wheel.position.set(...pos);
            van.add(wheel);
            van.userData.wheels.push(wheel);
        });
        
        // Мигалка
        const sirenGeom = new THREE.BoxGeometry(0.8, 0.2, 0.4);
        const sirenMat = this.getMaterial(0xDD0000);
        const siren = new THREE.Mesh(sirenGeom, sirenMat);
        siren.position.set(0, 2, 3);
        van.add(siren);
        
        van.userData.type = 'vehicle';
        van.userData.vehicleType = 'ambulance';
        van.userData.fuel = 100;
        van.userData.maxSpeed = CONFIG.carMaxSpeed * 0.9;
        van.userData.collision = {
            width: 2.4,
            depth: 5.5,
            height: 2.5
        };
        
        return van;
    },
    
    // ===== ГРУЗОВИК КАМАЗ =====
    createKamaz() {
        const truck = new THREE.Group();
        truck.name = 'kamaz';
        
        // Кабина
        const cabinGeom = new THREE.BoxGeometry(2.5, 2.2, 2.5);
        const cabinMat = this.getMaterial(0xFF6600);
        const cabin = new THREE.Mesh(cabinGeom, cabinMat);
        cabin.position.set(0, 1.8, 4);
        cabin.castShadow = true;
        truck.add(cabin);
        
        // Кузов
        const cargoGeom = new THREE.BoxGeometry(2.6, 2, 6);
        const cargoMat = this.getMaterial(0x556B2F);
        const cargo = new THREE.Mesh(cargoGeom, cargoMat);
        cargo.position.set(0, 2, -0.5);
        cargo.castShadow = true;
        truck.add(cargo);
        
        // Рама
        const frameGeom = new THREE.BoxGeometry(2.4, 0.4, 9);
        const frameMat = this.getMaterial(0x333333);
        const frame = new THREE.Mesh(frameGeom, frameMat);
        frame.position.set(0, 0.5, 0.5);
        truck.add(frame);
        
        // Стекло кабины
        const glassMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.7 });
        const frontGlass = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 1, 0.1),
            glassMat
        );
        frontGlass.position.set(0, 2.3, 5.3);
        truck.add(frontGlass);
        
        // Колёса (6 колёс)
        truck.userData.wheels = [];
        const wheelPositions = [
            [-1.1, 0.6, 4], [1.1, 0.6, 4],  // Передние
            [-1.1, 0.6, -1], [1.1, 0.6, -1], // Средние
            [-1.1, 0.6, -2.5], [1.1, 0.6, -2.5] // Задние
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = this.createTruckWheel();
            wheel.position.set(...pos);
            truck.add(wheel);
            truck.userData.wheels.push(wheel);
        });
        
        // Выхлопные трубы
        const exhaustMat = this.getMaterial(0x333333);
        [-1, 1].forEach(x => {
            const exhaust = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 1.5),
                exhaustMat
            );
            exhaust.position.set(x * 1.3, 2.5, 2.8);
            truck.add(exhaust);
        });
        
        truck.userData.type = 'vehicle';
        truck.userData.vehicleType = 'kamaz';
        truck.userData.fuel = 100;
        truck.userData.maxSpeed = CONFIG.carMaxSpeed * 0.55;
        truck.userData.collision = {
            width: 2.8,
            depth: 9.5,
            height: 3
        };
        
        return truck;
    },
    
    createTruckWheel() {
        const wheelGroup = new THREE.Group();
        
        const tireGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
        const tireMat = this.getMaterial(0x111111);
        const tire = new THREE.Mesh(tireGeom, tireMat);
        tire.rotation.z = Math.PI / 2;
        wheelGroup.add(tire);
        
        const hubGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.51, 8);
        const hubMat = this.getMaterial(0x555555);
        const hub = new THREE.Mesh(hubGeom, hubMat);
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);
        
        return wheelGroup;
    },
    
    // Случайный транспорт
    createRandomVehicle() {
        const types = [
            { factory: 'createLada', weight: 40 },
            { factory: 'createNiva', weight: 20 },
            { factory: 'createPoliceCar', weight: 5 },
            { factory: 'createAmbulance', weight: 5 },
            { factory: 'createBus', weight: 10 },
            { factory: 'createKamaz', weight: 10 }
        ];
        
        const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const type of types) {
            random -= type.weight;
            if (random <= 0) {
                if (type.factory === 'createLada') {
                    const colors = [COLORS.ladaGreen, COLORS.ladaWhite, COLORS.ladaBlue, COLORS.ladaRed, COLORS.ladaBlack, COLORS.ladaYellow];
                    return this[type.factory](Utils.randomElement(colors));
                }
                if (type.factory === 'createNiva') {
                    const colors = [COLORS.ladaGreen, COLORS.ladaWhite, COLORS.ladaBlack];
                    return this[type.factory](Utils.randomElement(colors));
                }
                return this[type.factory]();
            }
        }
        
        return this.createLada();
    },
    
    // Упрощённая ЛАДА для оптимизации (меньше полигонов)
    createSimpleLada() {
        const car = new THREE.Group();
        car.name = 'lada';
        
        // Используем кэшированные материалы
        const bodyColor = [COLORS.ladaGreen, COLORS.ladaWhite, COLORS.ladaBlue, COLORS.ladaRed][Math.floor(Math.random() * 4)];
        const bodyMat = this.getMaterial(bodyColor);
        
        // Кузов - один блок
        const bodyGeom = new THREE.BoxGeometry(2.2, 1, 4.5);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.7;
        body.castShadow = true;
        car.add(body);
        
        // Кабина - один блок
        const cabinGeom = new THREE.BoxGeometry(2, 0.6, 2);
        const cabin = new THREE.Mesh(cabinGeom, bodyMat);
        cabin.position.set(0, 1.4, -0.2);
        cabin.castShadow = true;
        car.add(cabin);
        
        // Стёкла - только лобовое
        const glassMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.6 });
        const frontGlass = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.5, 0.1),
            glassMat
        );
        frontGlass.position.set(0, 1.35, 0.9);
        car.add(frontGlass);
        
        // Колёса - упрощённые (цилиндры без деталей)
        car.userData.wheels = [];
        const wheelGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 8);
        const wheelMat = this.getMaterial(0x222222);
        
        const wheelPositions = [
            [-1.1, 0.35, 1.4],
            [1.1, 0.35, 1.4],
            [-1.1, 0.35, -1.4],
            [1.1, 0.35, -1.4]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            car.add(wheel);
            car.userData.wheels.push(wheel);
        });
        
        // Фары - упрощённые
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });
        [-0.7, 0.7].forEach(x => {
            const headlight = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.15, 0.05),
                headlightMat
            );
            headlight.position.set(x, 0.55, 2.26);
            car.add(headlight);
        });
        
        car.userData.type = 'vehicle';
        car.userData.vehicleType = 'lada';
        car.userData.fuel = 100;
        car.userData.maxSpeed = CONFIG.carMaxSpeed;
        car.userData.color = bodyColor;
        car.userData.collision = {
            width: 2.4,
            depth: 4.8,
            height: 2
        };
        
        return car;
    }
    };