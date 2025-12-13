// ============================================================
// ГОЙДАБЛОКС - ГЕНЕРАЦИЯ МИРА (ОПТИМИЗИРОВАННАЯ ВЕРСИЯ)
// ============================================================

const WorldGenerator = {
    // Кэш созданных чанков
    chunks: new Map(),
    loadedChunks: new Set(),
    
    // Основные дороги (глобальные координаты)
    mainRoads: [],
    
    // Общие материалы (переиспользуем)
    sharedMaterials: {},
    sharedGeometries: {},
    
    // Инициализация
    init() {
        // Определяем главные дороги (проходят через центр)
        this.mainRoads = [
            { axis: 'x', offset: 0 },  // Главная дорога по X через центр
            { axis: 'z', offset: 0 },  // Главная дорога по Z через центр
        ];
        
        // Создаём общие материалы
        this.initSharedResources();
    },
    
    // Инициализация общих ресурсов
    initSharedResources() {
        this.sharedMaterials = {
            road: new THREE.MeshLambertMaterial({ color: COLORS.road }),
            roadMarking: new THREE.MeshBasicMaterial({ color: COLORS.roadMarking }),
            sidewalk: new THREE.MeshLambertMaterial({ color: COLORS.sidewalk }),
            grass: new THREE.MeshLambertMaterial({ color: COLORS.grass }),
        };
        
        this.sharedGeometries = {
            roadMarkingH: new THREE.PlaneGeometry(3, 0.3),
            roadMarkingV: new THREE.PlaneGeometry(0.3, 3),
        };
    },
    
    // Получить или создать чанк
    getChunk(cx, cz) {
        const key = `${cx},${cz}`;
        
        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }
        
        const chunk = this.generateChunk(cx, cz);
        this.chunks.set(key, chunk);
        return chunk;
    },
    
    // Генерация чанка
    generateChunk(cx, cz) {
        const chunk = new THREE.Group();
        chunk.name = `chunk_${cx}_${cz}`;
        
        const worldX = cx * CONFIG.chunkSize;
        const worldZ = cz * CONFIG.chunkSize;
        const size = CONFIG.chunkSize;
        
        // Seed для детерминированной генерации
        const seed = Utils.hash(cx, cz);
        
        // Земля чанка
        this.generateGround(chunk, worldX, worldZ, size);
        
        // Дороги
        this.generateRoads(chunk, cx, cz, worldX, worldZ, size, seed);
        
        // Кремль в центральном чанке
        if (cx === 0 && cz === 0) {
            this.generateKremlin(chunk, worldX, worldZ);
        } else {
            // Здания
            this.generateBuildings(chunk, cx, cz, worldX, worldZ, size, seed);
        }
        
        // Декорации
        this.generateDecorations(chunk, cx, cz, worldX, worldZ, size, seed);
        
        // Транспорт
        this.generateVehicles(chunk, cx, cz, worldX, worldZ, size, seed);
        
        // NPC
        this.generateNPCs(chunk, cx, cz, worldX, worldZ, size, seed);
        
        chunk.userData = {
            cx: cx,
            cz: cz,
            worldX: worldX,
            worldZ: worldZ,
            loaded: false
        };
        
        return chunk;
    },
    
    // Генерация земли (оптимизированная)
    generateGround(chunk, worldX, worldZ, size) {
        // Используем простой цвет вместо текстуры для экономии памяти
        const groundGeom = new THREE.PlaneGeometry(size, size);
        const ground = new THREE.Mesh(groundGeom, this.sharedMaterials.grass);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(worldX + size / 2, 0, worldZ + size / 2);
        ground.receiveShadow = true;
        chunk.add(ground);
    },
    
    // Генерация дорог (оптимизированная - меньше разметки)
    generateRoads(chunk, cx, cz, worldX, worldZ, size, seed) {
        const roadWidth = CONFIG.roadWidth;
        
        // Дорога по X (горизонтальная)
        const roadGeomH = new THREE.PlaneGeometry(size, roadWidth);
        const roadH = new THREE.Mesh(roadGeomH, this.sharedMaterials.road);
        roadH.rotation.x = -Math.PI / 2;
        roadH.position.set(worldX + size / 2, 0.01, worldZ + size / 2);
        chunk.add(roadH);
        
        // Упрощённая разметка (меньше объектов)
        const numMarkings = Math.floor(size / 15); // Реже
        for (let i = 0; i < numMarkings; i++) {
            const mark = new THREE.Mesh(this.sharedGeometries.roadMarkingH, this.sharedMaterials.roadMarking);
            mark.rotation.x = -Math.PI / 2;
            mark.position.set(worldX + 7 + i * 15, 0.02, worldZ + size / 2);
            chunk.add(mark);
        }
        
        // Тротуары (упрощённые)
        const sidewalkGeomH = new THREE.BoxGeometry(size, 0.1, 2);
        [-roadWidth / 2 - 1, roadWidth / 2 + 1].forEach(offset => {
            const sidewalk = new THREE.Mesh(sidewalkGeomH, this.sharedMaterials.sidewalk);
            sidewalk.position.set(worldX + size / 2, 0.05, worldZ + size / 2 + offset);
            chunk.add(sidewalk);
        });
        
        // Дорога по Z (вертикальная) - только каждые 3 чанка (реже)
        if (cx % 3 === 0) {
            const roadGeomV = new THREE.PlaneGeometry(roadWidth, size);
            const roadV = new THREE.Mesh(roadGeomV, this.sharedMaterials.road);
            roadV.rotation.x = -Math.PI / 2;
            roadV.position.set(worldX + size / 2, 0.02, worldZ + size / 2);
            chunk.add(roadV);
            
            for (let i = 0; i < numMarkings; i++) {
                const mark = new THREE.Mesh(this.sharedGeometries.roadMarkingV, this.sharedMaterials.roadMarking);
                mark.rotation.x = -Math.PI / 2;
                mark.position.set(worldX + size / 2, 0.03, worldZ + 7 + i * 15);
                chunk.add(mark);
            }
        }
    },
    
    // Генерация Кремля (центральный чанк)
    generateKremlin(chunk, worldX, worldZ) {
        // Главная Спасская башня
        const mainTower = BuildingFactory.createKremlinTower();
        mainTower.position.set(worldX + 50, 0, worldZ + 50);
        chunk.add(mainTower);
        GameState.buildings.push(mainTower);
        GameState.interactables.push(mainTower);
        
        // Добавляем интерактивность
        mainTower.userData.interactable = {
            prompt: 'Нажмите E чтобы осмотреть Кремль',
            action: () => {
                DialogSystem.show('Экскурсовод', 
                    'Добро пожаловать в Московский Кремль! Спасская башня была построена в 1491 году. Высота - 71 метр. Куранты отбивают каждый час!',
                    [
                        { text: 'Удивительно!', callback: () => {
                            QuestSystem.complete('explore_kremlin');
                            GameState.playerMoney += 500;
                            NotificationSystem.success('Квест выполнен! +500₽');
                        }},
                        { text: 'Спасибо за экскурсию' }
                    ]
                );
            }
        };
        
        // Стены Кремля
        const wallLength = 60;
        
        // Северная стена
        const wallN = BuildingFactory.createKremlinWall(wallLength);
        wallN.position.set(worldX + 50, 0, worldZ + 20);
        chunk.add(wallN);
        
        // Южная стена
        const wallS = BuildingFactory.createKremlinWall(wallLength);
        wallS.position.set(worldX + 50, 0, worldZ + 80);
        chunk.add(wallS);
        
        // Западная стена
        const wallW = BuildingFactory.createKremlinWall(wallLength);
        wallW.rotation.y = Math.PI / 2;
        wallW.position.set(worldX + 20, 0, worldZ + 50);
        chunk.add(wallW);
        
        // Восточная стена
        const wallE = BuildingFactory.createKremlinWall(wallLength);
        wallE.rotation.y = Math.PI / 2;
        wallE.position.set(worldX + 80, 0, worldZ + 50);
        chunk.add(wallE);
        
        // Угловые башни (меньшего размера)
        const cornerPositions = [
            [worldX + 20, worldZ + 20],
            [worldX + 80, worldZ + 20],
            [worldX + 20, worldZ + 80],
            [worldX + 80, worldZ + 80]
        ];
        
        cornerPositions.forEach(([x, z]) => {
            const cornerTower = this.createCornerTower();
            cornerTower.position.set(x, 0, z);
            chunk.add(cornerTower);
        });
        
        // Красная площадь (площадка перед Кремлём)
        const squareGeom = new THREE.PlaneGeometry(40, 40);
        const squareMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const square = new THREE.Mesh(squareGeom, squareMat);
        square.rotation.x = -Math.PI / 2;
        square.position.set(worldX + 50, 0.01, worldZ + 10);
        square.receiveShadow = true;
        chunk.add(square);
        
        // Собор Василия Блаженного (упрощённый)
        const cathedral = this.createCathedral();
        cathedral.position.set(worldX + 30, 0, worldZ + 10);
        chunk.add(cathedral);
        
        // Мавзолей
        const mausoleum = this.createMausoleum();
        mausoleum.position.set(worldX + 50, 0, worldZ + 5);
        chunk.add(mausoleum);
        
        // Флаги
        [worldX + 35, worldX + 65].forEach(x => {
            const flag = DecorationFactory.createFlag(1.5);
            flag.position.set(x, 0, worldZ + 15);
            chunk.add(flag);
        });
        
        GameState.totalBuildings += 10;
    },
    
    // Угловая башня Кремля
    createCornerTower() {
        const tower = new THREE.Group();
        
        const wallMat = BuildingFactory.getMaterial(COLORS.kremlinRed);
        
        // Основание
        const baseGeom = new THREE.CylinderGeometry(4, 5, 15, 8);
        const base = new THREE.Mesh(baseGeom, wallMat);
        base.position.y = 7.5;
        base.castShadow = true;
        tower.add(base);
        
        // Зубцы
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const merlon = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 2, 1),
                wallMat
            );
            merlon.position.set(
                Math.cos(angle) * 4,
                16,
                Math.sin(angle) * 4
            );
            merlon.rotation.y = -angle;
            tower.add(merlon);
        }
        
        // Крыша
        const roofGeom = new THREE.ConeGeometry(4.5, 8, 8);
        const roofMat = BuildingFactory.getMaterial(0x228B22);
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 21;
        roof.castShadow = true;
        tower.add(roof);
        
        return tower;
    },
    
    // Собор Василия Блаженного
    createCathedral() {
        const cathedral = new THREE.Group();
        
        const whiteMat = BuildingFactory.getMaterial(0xEEEEDD);
        const redMat = BuildingFactory.getMaterial(0xCC3333);
        const blueMat = BuildingFactory.getMaterial(0x3333AA);
        const greenMat = BuildingFactory.getMaterial(0x33AA33);
        const goldMat = BuildingFactory.getMaterial(COLORS.kremlinGold);
        
        // Основание
        const baseGeom = new THREE.BoxGeometry(15, 6, 15);
        const base = new THREE.Mesh(baseGeom, whiteMat);
        base.position.y = 3;
        base.castShadow = true;
        cathedral.add(base);
        
        // Центральный купол
        const mainDome = this.createOnionDome(3, 8, goldMat);
        mainDome.position.set(0, 12, 0);
        cathedral.add(mainDome);
        
        // Боковые купола (разноцветные)
        const domeMats = [redMat, blueMat, greenMat, goldMat];
        const domePositions = [
            [-5, 10, 0], [5, 10, 0], [0, 10, -5], [0, 10, 5],
            [-4, 9, -4], [4, 9, -4], [-4, 9, 4], [4, 9, 4]
        ];
        
        domePositions.forEach((pos, i) => {
            const dome = this.createOnionDome(1.5, 5, domeMats[i % domeMats.length]);
            dome.position.set(...pos);
            cathedral.add(dome);
        });
        
        cathedral.userData = {
            type: 'building',
            buildingType: 'cathedral',
            collision: { width: 15, depth: 15, height: 20 }
        };
        
        return cathedral;
    },
    
    // Луковичный купол
    createOnionDome(radius, height, material) {
        const dome = new THREE.Group();
        
        // Барабан
        const drumGeom = new THREE.CylinderGeometry(radius * 0.8, radius * 0.8, height * 0.3, 16);
        const drum = new THREE.Mesh(drumGeom, BuildingFactory.getMaterial(0xEEEEDD));
        drum.position.y = height * 0.15;
        dome.add(drum);
        
        // Купол (луковица)
        const domeGeom = new THREE.SphereGeometry(radius, 16, 16);
        const domeMesh = new THREE.Mesh(domeGeom, material);
        domeMesh.scale.y = 1.5;
        domeMesh.position.y = height * 0.5;
        dome.add(domeMesh);
        
        // Шпиль
        const spireGeom = new THREE.ConeGeometry(radius * 0.15, height * 0.3, 8);
        const spire = new THREE.Mesh(spireGeom, BuildingFactory.getMaterial(COLORS.kremlinGold));
        spire.position.y = height * 0.85;
        dome.add(spire);
        
        // Крест
        BuildingFactory.addCross(dome, 0, height, 0, radius * 0.3);
        
        return dome;
    },
    
    // Мавзолей
    createMausoleum() {
        const mausoleum = new THREE.Group();
        
        const stoneMat = BuildingFactory.getMaterial(0x8B0000);
        const blackMat = BuildingFactory.getMaterial(0x1a1a1a);
        
        // Ступени
        for (let i = 0; i < 5; i++) {
            const stepGeom = new THREE.BoxGeometry(12 - i * 1.5, 0.8, 8 - i);
            const step = new THREE.Mesh(stepGeom, stoneMat);
            step.position.y = i * 0.8 + 0.4;
            mausoleum.add(step);
        }
        
        // Основное здание
        const bodyGeom = new THREE.BoxGeometry(6, 3, 5);
        const body = new THREE.Mesh(bodyGeom, stoneMat);
        body.position.y = 5.5;
        body.castShadow = true;
        mausoleum.add(body);
        
        // Надпись "ЛЕНИН"
        const signTexture = TextureGenerator.sign('ЛЕНИН', '#8B0000', '#000000');
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.6, 0.1),
            signMat
        );
        sign.position.set(0, 5.5, 2.55);
        mausoleum.add(sign);
        
        mausoleum.userData = {
            type: 'monument',
            collision: { width: 12, depth: 8, height: 7 }
        };
        
        return mausoleum;
    },
    
    // Генерация зданий (оптимизированная)
    generateBuildings(chunk, cx, cz, worldX, worldZ, size, seed) {
        const rng = (offset) => Utils.seededRandom(seed + offset);
        
        // Ограниченное количество зданий
        const numBuildings = Math.min(CONFIG.maxBuildingsPerChunk, 2 + Math.floor(rng(0) * 3));
        
        // Зоны для размещения (избегаем дорог)
        const zones = [
            { x: worldX + 20, z: worldZ + 20 },
            { x: worldX + 60, z: worldZ + 20 },
            { x: worldX + 20, z: worldZ + 60 },
            { x: worldX + 60, z: worldZ + 60 }
        ];
        
        // Специальные здания в некоторых чанках (реже)
        if ((cx + cz) % 7 === 0 && rng(100) > 0.6) {
            this.generateSpecialBuilding(chunk, cx, cz, worldX, worldZ, seed);
            return; // Только спец здание в этом чанке
        }
        
        // Обычные здания
        for (let i = 0; i < numBuildings && i < zones.length; i++) {
            const zone = zones[i];
            const x = zone.x + (rng(i * 20) - 0.5) * 15;
            const z = zone.z + (rng(i * 30) - 0.5) * 15;
            
            let building;
            const buildingType = rng(i * 40);
            
            if (buildingType < 0.5) {
                // Панелька (упрощённая)
                const floors = 5 + Math.floor(rng(i * 50) * 5);
                building = BuildingFactory.createPanelka(floors);
            } else if (buildingType < 0.7) {
                // Хрущёвка
                building = BuildingFactory.createKhrushchevka();
            } else if (buildingType < 0.85) {
                // Магазин
                const shopTypes = ['pyaterochka', 'shawarma'];
                building = BuildingFactory.createShop(shopTypes[Math.floor(rng(i * 60) * shopTypes.length)]);
                if (building.userData.interactable) {
                    GameState.interactables.push(building);
                }
            } else {
                // Простое здание
                building = BuildingFactory.createKhrushchevka();
            }
            
            if (building) {
                building.position.set(x, 0, z);
                building.rotation.y = Math.floor(rng(i * 70) * 4) * (Math.PI / 2);
                chunk.add(building);
                GameState.buildings.push(building);
                GameState.totalBuildings++;
            }
        }
    },
    
    // Генерация специальных зданий
    generateSpecialBuilding(chunk, cx, cz, worldX, worldZ, seed) {
        const rng = (offset) => Utils.seededRandom(seed + offset);
        const type = rng(500);
        
        let building;
        const x = worldX + 30 + rng(501) * 40;
        const z = worldZ + 30 + rng(502) * 40;
        
        if (type < 0.15) {
            building = BuildingFactory.createGasStation();
        } else if (type < 0.3) {
            building = BuildingFactory.createMilitaryOffice();
        } else if (type < 0.45) {
            building = BuildingFactory.createFertilityCenter();
        } else if (type < 0.6) {
            building = BuildingFactory.createShop('sberbank');
        } else if (type < 0.75) {
            building = BuildingFactory.createShop('mfc');
        } else if (type < 0.9) {
            building = BuildingFactory.createShop('pochta');
        } else {
            // Рекламный баннер СВО
            building = BuildingFactory.createSVOBanner();
        }
        
        if (building) {
            building.position.set(x, 0, z);
            building.rotation.y = Math.floor(rng(503) * 4) * (Math.PI / 2);
            chunk.add(building);
            
            if (building.userData && building.userData.interactable) {
                GameState.interactables.push(building);
            }
            
            GameState.buildings.push(building);
            GameState.totalBuildings++;
        }
    },
    
    // Генерация декораций (сильно оптимизированная)
    generateDecorations(chunk, cx, cz, worldX, worldZ, size, seed) {
        const rng = (offset) => Utils.seededRandom(seed + offset);
        let decorCount = 0;
        const maxDecor = CONFIG.maxDecorationsPerChunk;
        
        // Деревья (меньше)
        const numTrees = 2 + Math.floor(rng(200) * 4);
        for (let i = 0; i < numTrees && decorCount < maxDecor; i++) {
            const x = worldX + rng(210 + i) * size;
            const z = worldZ + rng(220 + i) * size;
            
            // Не ставить на дорогах
            const localX = x - worldX - size / 2;
            const localZ = z - worldZ - size / 2;
            if (Math.abs(localZ) < 10 || (cx % 3 === 0 && Math.abs(localX) < 10)) continue;
            
            const tree = DecorationFactory.createSimpleTree();
            tree.position.set(x, 0, z);
            chunk.add(tree);
            decorCount++;
        }
        
        // Фонари вдоль дорог (меньше)
        for (let i = 0; i < size && decorCount < maxDecor; i += 40) {
            const lamp = DecorationFactory.createStreetLamp();
            lamp.position.set(worldX + i, 0, worldZ + size / 2 + 8);
            chunk.add(lamp);
            decorCount++;
        }
        
        // Флаг (редко)
        if (rng(450) > 0.8 && decorCount < maxDecor) {
            const flag = DecorationFactory.createFlag();
            flag.position.set(worldX + 50, 0, worldZ + 50);
            chunk.add(flag);
            decorCount++;
        }
    },
    
    // Генерация транспорта (оптимизированная)
    generateVehicles(chunk, cx, cz, worldX, worldZ, size, seed) {
        const rng = (offset) => Utils.seededRandom(seed + offset);
        
        // Только 1 машина на чанк
        if (rng(600) > 0.5) {
            const vehicle = VehicleFactory.createSimpleLada();
            
            const x = worldX + 20 + rng(620) * 60;
            const z = worldZ + size / 2 + (rng(630) > 0.5 ? 4 : -4);
            const rotation = rng(630) > 0.5 ? 0 : Math.PI;
            
            vehicle.position.set(x, 0, z);
            vehicle.rotation.y = rotation;
            chunk.add(vehicle);
            GameState.vehicles.push(vehicle);
        }
    },
    
    // Генерация NPC (оптимизированная)
    generateNPCs(chunk, cx, cz, worldX, worldZ, size, seed) {
        const rng = (offset) => Utils.seededRandom(seed + offset);
        
        // Только 1 NPC на чанк (иногда 0)
        if (rng(700) > 0.3) {
            const npc = NPCFactory.createSimpleNPC();
            
            const x = worldX + 20 + rng(710) * 60;
            const z = worldZ + 20 + rng(720) * 60;
            
            npc.position.set(x, 0, z);
            npc.rotation.y = rng(730) * Math.PI * 2;
            chunk.add(npc);
            GameState.npcs.push(npc);
        }
    },
    
    // Загрузка чанков вокруг позиции
    updateChunks(playerPosition) {
        const playerChunk = Utils.getChunkCoords(playerPosition.x, playerPosition.z);
        const renderDist = CONFIG.renderDistance;
        
        const chunksToLoad = new Set();
        const chunksToKeep = new Set();
        
        // Определяем чанки для загрузки
        for (let dx = -renderDist; dx <= renderDist; dx++) {
            for (let dz = -renderDist; dz <= renderDist; dz++) {
                const cx = playerChunk.x + dx;
                const cz = playerChunk.z + dz;
                const key = `${cx},${cz}`;
                
                chunksToKeep.add(key);
                
                if (!this.loadedChunks.has(key)) {
                    chunksToLoad.add(key);
                }
            }
        }
        
        // Выгружаем далёкие чанки
        this.loadedChunks.forEach(key => {
            if (!chunksToKeep.has(key)) {
                this.unloadChunk(key);
            }
        });
        
        // Загружаем новые чанки
        chunksToLoad.forEach(key => {
            this.loadChunk(key);
        });
        
        return playerChunk;
    },
    
    // Загрузка чанка
    loadChunk(key) {
        const [cx, cz] = key.split(',').map(Number);
        const chunk = this.getChunk(cx, cz);
        
        if (!chunk.userData.loaded) {
            GameState.scene.add(chunk);
            chunk.userData.loaded = true;
            this.loadedChunks.add(key);
            GameState.totalChunksLoaded++;
        }
    },
    
    // Выгрузка чанка с очисткой памяти
    unloadChunk(key) {
        if (this.chunks.has(key)) {
            const chunk = this.chunks.get(key);
            
            // Удаляем из сцены
            if (chunk.userData.loaded) {
                GameState.scene.remove(chunk);
                chunk.userData.loaded = false;
            }
            
            // Удаляем связанные объекты из GameState
            chunk.children.forEach(child => {
                const idx = GameState.buildings.indexOf(child);
                if (idx > -1) GameState.buildings.splice(idx, 1);
                
                const vidx = GameState.vehicles.indexOf(child);
                if (vidx > -1) GameState.vehicles.splice(vidx, 1);
                
                const nidx = GameState.npcs.indexOf(child);
                if (nidx > -1) GameState.npcs.splice(nidx, 1);
                
                const iidx = GameState.interactables.indexOf(child);
                if (iidx > -1) GameState.interactables.splice(iidx, 1);
            });
            
            // Освобождаем память - удаляем геометрии и материалы
            this.disposeChunk(chunk);
            
            this.loadedChunks.delete(key);
            this.chunks.delete(key); // Удаляем из кэша для освобождения памяти
        }
    },
    
    // Освобождение ресурсов чанка
    disposeChunk(object) {
        if (object.geometry) {
            object.geometry.dispose();
        }
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => {
                    if (mat.map) mat.map.dispose();
                    mat.dispose();
                });
            } else {
                if (object.material.map) object.material.map.dispose();
                object.material.dispose();
            }
        }
        
        if (object.children) {
            object.children.forEach(child => this.disposeChunk(child));
        }
    },
    
    // Очистка всех чанков
    clearAll() {
        this.loadedChunks.forEach(key => {
            this.unloadChunk(key);
        });
        this.chunks.clear();
        GameState.buildings = [];
        GameState.vehicles = [];
        GameState.npcs = [];
        GameState.interactables = [];
        GameState.totalBuildings = 0;
        GameState.totalChunksLoaded = 0;
    }
};