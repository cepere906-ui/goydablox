// ============================================================
// ГОЙДАБЛОКС - ЗДАНИЯ И СТРОЕНИЯ
// ============================================================

const BuildingFactory = {
    // Материалы (кэширование)
    materials: {},
    
    getMaterial(color, options = {}) {
        const key = `${color}_${JSON.stringify(options)}`;
        if (!this.materials[key]) {
            this.materials[key] = new THREE.MeshLambertMaterial({ color, ...options });
        }
        return this.materials[key];
    },
    
    // ===== ПАНЕЛЬКА (типовая многоэтажка) =====
    createPanelka(floors = 9, width = 15, depth = 10) {
        const building = new THREE.Group();
        const height = floors * 3;
        
        // Основное здание
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const bodyMat = this.getMaterial(COLORS.panelka);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        building.add(body);
        
        // Окна
        const windowMat = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
        const windowDarkMat = new THREE.MeshBasicMaterial({ color: 0x444466 });
        const windowSize = 0.8;
        
        for (let floor = 0; floor < floors; floor++) {
            const wy = floor * 3 + 2;
            for (let wx = -width/2 + 1.5; wx < width/2 - 1; wx += 2.5) {
                const isLit = Math.random() > 0.4;
                const wMat = isLit ? windowMat : windowDarkMat;
                const windowGeom = new THREE.BoxGeometry(windowSize, windowSize * 1.3, 0.1);
                
                // Передняя стена
                const window1 = new THREE.Mesh(windowGeom, wMat);
                window1.position.set(wx, wy, depth/2 + 0.05);
                building.add(window1);
                
                // Задняя стена
                const window2 = new THREE.Mesh(windowGeom, wMat);
                window2.position.set(wx, wy, -depth/2 - 0.05);
                building.add(window2);
            }
        }
        
        // Подъезды
        const entranceGeom = new THREE.BoxGeometry(2.5, 2.8, 0.8);
        const entranceMat = this.getMaterial(0x444444);
        const doorMat = this.getMaterial(0x663300);
        
        const numEntrances = Math.floor(width / 5);
        for (let i = 0; i < numEntrances; i++) {
            const ex = -width/2 + (i + 0.5) * (width / numEntrances);
            const entrance = new THREE.Mesh(entranceGeom, entranceMat);
            entrance.position.set(ex, 1.4, depth/2 + 0.4);
            building.add(entrance);
            
            // Дверь
            const doorGeom = new THREE.BoxGeometry(1.4, 2.4, 0.1);
            const door = new THREE.Mesh(doorGeom, doorMat);
            door.position.set(ex, 1.2, depth/2 + 0.85);
            building.add(door);
            
            // Козырёк
            const roofGeom = new THREE.BoxGeometry(3, 0.1, 1.5);
            const roof = new THREE.Mesh(roofGeom, this.getMaterial(0x666666));
            roof.position.set(ex, 2.9, depth/2 + 0.75);
            building.add(roof);
        }
        
        // Крыша
        const roofTop = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.5, 0.3, depth + 0.5),
            this.getMaterial(0x555555)
        );
        roofTop.position.y = height + 0.15;
        building.add(roofTop);
        
        // Антенны
        for (let i = 0; i < 3; i++) {
            const antenna = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 2),
                this.getMaterial(0x333333)
            );
            antenna.position.set(
                Utils.random(-width/3, width/3),
                height + 1,
                Utils.random(-depth/3, depth/3)
            );
            building.add(antenna);
        }
        
        building.userData = {
            type: 'building',
            buildingType: 'panelka',
            collision: {
                width: width,
                depth: depth,
                height: height
            }
        };
        
        return building;
    },
    
    // ===== ХРУЩЁВКА (5-этажка) =====
    createKhrushchevka() {
        const building = this.createPanelka(5, 12, 8);
        building.userData.buildingType = 'khrushchevka';
        
        // Изменить цвет
        building.children[0].material = this.getMaterial(0xDDCCAA);
        
        return building;
    },
    
    // ===== СТАЛИНКА =====
    createStalinka() {
        const building = new THREE.Group();
        const width = 20;
        const depth = 12;
        const height = 18;
        
        // Основное здание
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const bodyMat = this.getMaterial(0xCCBB99);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        building.add(body);
        
        // Колонны
        const columnGeom = new THREE.CylinderGeometry(0.4, 0.5, height * 0.8, 8);
        const columnMat = this.getMaterial(0xEEDDBB);
        for (let i = 0; i < 6; i++) {
            const column = new THREE.Mesh(columnGeom, columnMat);
            column.position.set(-width/2 + 2 + i * 3.2, height * 0.4, depth/2 + 0.3);
            column.castShadow = true;
            building.add(column);
        }
        
        // Большие окна
        const windowMat = new THREE.MeshBasicMaterial({ color: 0xFFFFCC });
        for (let floor = 0; floor < 5; floor++) {
            const wy = floor * 3.5 + 2.5;
            for (let wx = -width/2 + 3; wx < width/2 - 2; wx += 4) {
                const windowGeom = new THREE.BoxGeometry(1.5, 2, 0.1);
                const window1 = new THREE.Mesh(windowGeom, windowMat);
                window1.position.set(wx, wy, depth/2 + 0.05);
                building.add(window1);
            }
        }
        
        // Карниз
        const corniceGeom = new THREE.BoxGeometry(width + 1, 0.5, depth + 1);
        const cornice = new THREE.Mesh(corniceGeom, columnMat);
        cornice.position.y = height + 0.25;
        building.add(cornice);
        
        // Декоративная башенка
        const towerGeom = new THREE.BoxGeometry(4, 3, 4);
        const tower = new THREE.Mesh(towerGeom, columnMat);
        tower.position.y = height + 1.5;
        building.add(tower);
        
        // Шпиль
        const spireGeom = new THREE.ConeGeometry(0.5, 4, 4);
        const spire = new THREE.Mesh(spireGeom, this.getMaterial(0xFFD700));
        spire.position.y = height + 5;
        building.add(spire);
        
        building.userData = {
            type: 'building',
            buildingType: 'stalinka',
            collision: { width, depth, height }
        };
        
        return building;
    },
    
    // ===== ЦЕРКОВЬ =====
    createChurch() {
        const church = new THREE.Group();
        
        // Основание
        const baseGeom = new THREE.BoxGeometry(12, 8, 15);
        const baseMat = this.getMaterial(0xEEEEDD);
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = 4;
        base.castShadow = true;
        church.add(base);
        
        // Центральный барабан
        const drumGeom = new THREE.CylinderGeometry(3, 3, 6, 16);
        const drum = new THREE.Mesh(drumGeom, baseMat);
        drum.position.y = 11;
        drum.castShadow = true;
        church.add(drum);
        
        // Главный купол
        const domeGeom = new THREE.SphereGeometry(3.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = this.getMaterial(COLORS.kremlinGold);
        const dome = new THREE.Mesh(domeGeom, domeMat);
        dome.position.y = 14;
        church.add(dome);
        
        // Крест на куполе
        this.addCross(church, 0, 18, 0, 2);
        
        // Боковые купола (маленькие)
        const smallDomePositions = [
            [-4, 10, -5], [4, 10, -5], [-4, 10, 5], [4, 10, 5]
        ];
        smallDomePositions.forEach(pos => {
            const smallDrum = new THREE.Mesh(
                new THREE.CylinderGeometry(1, 1, 3, 8),
                baseMat
            );
            smallDrum.position.set(pos[0], pos[1], pos[2]);
            church.add(smallDrum);
            
            const smallDome = new THREE.Mesh(
                new THREE.SphereGeometry(1.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                domeMat
            );
            smallDome.position.set(pos[0], pos[1] + 1.5, pos[2]);
            church.add(smallDome);
            
            this.addCross(church, pos[0], pos[1] + 4, pos[2], 0.8);
        });
        
        // Вход
        const entranceGeom = new THREE.BoxGeometry(4, 6, 3);
        const entrance = new THREE.Mesh(entranceGeom, baseMat);
        entrance.position.set(0, 3, 9);
        church.add(entrance);
        
        // Арка входа
        const archGeom = new THREE.TorusGeometry(1.5, 0.2, 8, 8, Math.PI);
        const arch = new THREE.Mesh(archGeom, this.getMaterial(0xAA8855));
        arch.position.set(0, 4, 10.5);
        arch.rotation.x = Math.PI / 2;
        church.add(arch);
        
        church.userData = {
            type: 'building',
            buildingType: 'church',
            collision: { width: 12, depth: 15, height: 18 }
        };
        
        return church;
    },
    
    // Добавить крест
    addCross(parent, x, y, z, scale = 1) {
        const crossMat = this.getMaterial(COLORS.kremlinGold);
        
        const vertical = new THREE.Mesh(
            new THREE.BoxGeometry(0.15 * scale, 1.5 * scale, 0.1 * scale),
            crossMat
        );
        vertical.position.set(x, y, z);
        parent.add(vertical);
        
        const horizontal = new THREE.Mesh(
            new THREE.BoxGeometry(0.8 * scale, 0.12 * scale, 0.1 * scale),
            crossMat
        );
        horizontal.position.set(x, y + 0.3 * scale, z);
        parent.add(horizontal);
    },
    
    // ===== КРЕМЛЬ (Спасская башня) =====
    createKremlinTower() {
        const tower = new THREE.Group();
        
        // Основание башни
        const baseGeom = new THREE.BoxGeometry(15, 25, 15);
        const wallMat = this.getMaterial(COLORS.kremlinRed);
        const base = new THREE.Mesh(baseGeom, wallMat);
        base.position.y = 12.5;
        base.castShadow = true;
        tower.add(base);
        
        // Зубцы
        for (let x = -6; x <= 6; x += 3) {
            for (let z = -6; z <= 6; z += 12) {
                const merlon = new THREE.Mesh(
                    new THREE.BoxGeometry(2, 3, 1.5),
                    wallMat
                );
                merlon.position.set(x, 26.5, z);
                tower.add(merlon);
            }
            if (x === -6 || x === 6) {
                for (let z = -3; z <= 3; z += 6) {
                    const merlon = new THREE.Mesh(
                        new THREE.BoxGeometry(1.5, 3, 2),
                        wallMat
                    );
                    merlon.position.set(x, 26.5, z);
                    tower.add(merlon);
                }
            }
        }
        
        // Второй ярус
        const mid1Geom = new THREE.BoxGeometry(12, 10, 12);
        const mid1 = new THREE.Mesh(mid1Geom, wallMat);
        mid1.position.y = 33;
        tower.add(mid1);
        
        // Третий ярус (с часами)
        const mid2Geom = new THREE.BoxGeometry(10, 8, 10);
        const mid2 = new THREE.Mesh(mid2Geom, this.getMaterial(0xEEDDCC));
        mid2.position.y = 42;
        tower.add(mid2);
        
        // Часы (4 стороны)
        const clockMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const clockGeom = new THREE.CircleGeometry(2.5, 32);
        [
            [0, 42, 5.1, 0],
            [0, 42, -5.1, Math.PI],
            [5.1, 42, 0, Math.PI / 2],
            [-5.1, 42, 0, -Math.PI / 2]
        ].forEach(([x, y, z, ry]) => {
            const clock = new THREE.Mesh(clockGeom, clockMat);
            clock.position.set(x, y, z);
            clock.rotation.y = ry;
            tower.add(clock);
            
            // Стрелки
            const hourHand = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 1.5, 0.05),
                new THREE.MeshBasicMaterial({ color: 0x000000 })
            );
            hourHand.position.set(x + Math.sin(ry) * 0.01, y + 0.5, z + Math.cos(ry) * 0.01);
            hourHand.rotation.y = ry;
            hourHand.rotation.z = Math.PI / 6;
            tower.add(hourHand);
            
            const minuteHand = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 2, 0.05),
                new THREE.MeshBasicMaterial({ color: 0x000000 })
            );
            minuteHand.position.set(x + Math.sin(ry) * 0.02, y + 0.7, z + Math.cos(ry) * 0.02);
            minuteHand.rotation.y = ry;
            minuteHand.rotation.z = -Math.PI / 3;
            tower.add(minuteHand);
        });
        
        // Шатёр
        const roofGeom = new THREE.ConeGeometry(7, 15, 8);
        const roofMat = this.getMaterial(0x228B22);
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 53.5;
        roof.castShadow = true;
        tower.add(roof);
        
        // Звезда
        const starGroup = new THREE.Group();
        const starMat = this.getMaterial(0xFF0000, { emissive: 0x330000 });
        
        // Создаём звезду из конусов
        for (let i = 0; i < 5; i++) {
            const point = new THREE.Mesh(
                new THREE.ConeGeometry(0.8, 3, 4),
                starMat
            );
            const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
            point.position.x = Math.cos(angle) * 1.2;
            point.position.y = Math.sin(angle) * 1.2;
            point.rotation.z = angle + Math.PI / 2;
            starGroup.add(point);
        }
        
        // Центр звезды
        const starCenter = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 8),
            starMat
        );
        starGroup.add(starCenter);
        
        starGroup.position.y = 63;
        starGroup.scale.set(1.5, 1.5, 1.5);
        tower.add(starGroup);
        
        // Ворота (арка)
        const gateGeom = new THREE.BoxGeometry(6, 8, 2);
        const gateMat = this.getMaterial(0x111111);
        const gate = new THREE.Mesh(gateGeom, gateMat);
        gate.position.set(0, 4, 8);
        tower.add(gate);
        
        tower.userData = {
            type: 'building',
            buildingType: 'kremlin_tower',
            collision: { width: 15, depth: 15, height: 65 },
            isKremlin: true
        };
        
        return tower;
    },
    
    // ===== СТЕНА КРЕМЛЯ =====
    createKremlinWall(length = 50) {
        const wall = new THREE.Group();
        
        const wallGeom = new THREE.BoxGeometry(length, 12, 4);
        const wallMat = this.getMaterial(COLORS.kremlinRed);
        const wallMesh = new THREE.Mesh(wallGeom, wallMat);
        wallMesh.position.y = 6;
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wall.add(wallMesh);
        
        // Зубцы
        const merlonW = 2;
        const merlonH = 2.5;
        for (let x = -length/2 + 1; x < length/2; x += merlonW * 2) {
            const merlon = new THREE.Mesh(
                new THREE.BoxGeometry(merlonW, merlonH, 4.5),
                wallMat
            );
            merlon.position.set(x, 13.25, 0);
            wall.add(merlon);
        }
        
        // Бойницы
        const slitMat = this.getMaterial(0x111111);
        for (let x = -length/2 + 5; x < length/2; x += 10) {
            const slit = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 2, 0.5),
                slitMat
            );
            slit.position.set(x, 8, 2.3);
            wall.add(slit);
        }
        
        wall.userData = {
            type: 'wall',
            collision: { width: length, depth: 4, height: 14 }
        };
        
        return wall;
    },
    
    // ===== МАГАЗИН =====
    createShop(type = 'pyaterochka') {
        const shop = new THREE.Group();
        
        const configs = {
            pyaterochka: { color: 0xDD0000, name: 'ПЯТЁРОЧКА', width: 20, height: 5 },
            magnit: { color: 0xDD0000, name: 'МАГНИТ', width: 18, height: 5 },
            sberbank: { color: 0x00AA00, name: 'СБЕРБАНК', width: 15, height: 6 },
            mfc: { color: 0x0039A6, name: 'МФЦ ГОСУСЛУГИ', width: 22, height: 7 },
            pochta: { color: 0x0044AA, name: 'ПОЧТА РОССИИ', width: 14, height: 5 },
            shawarma: { color: 0xFFA500, name: 'ШАУРМА 199₽', width: 5, height: 3.5 }
        };
        
        const cfg = configs[type] || configs.pyaterochka;
        
        // Здание
        const bodyGeom = new THREE.BoxGeometry(cfg.width, cfg.height, 12);
        const bodyMat = this.getMaterial(cfg.color);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = cfg.height / 2;
        body.castShadow = true;
        shop.add(body);
        
        // Вывеска
        const signTexture = TextureGenerator.sign(cfg.name, '#' + cfg.color.toString(16).padStart(6, '0'), '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(Math.min(cfg.width - 2, 12), 1.5, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, cfg.height + 1, 6.1);
        shop.add(sign);
        
        // Витрины
        const glassMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.6 });
        const windowGeom = new THREE.BoxGeometry(3, 2.5, 0.1);
        for (let x = -cfg.width/2 + 3; x < cfg.width/2 - 2; x += 5) {
            const window = new THREE.Mesh(windowGeom, glassMat);
            window.position.set(x, 2, 6.05);
            shop.add(window);
        }
        
        // Двери
        const doorGeom = new THREE.BoxGeometry(2.5, 3, 0.1);
        const doorMat = this.getMaterial(0x333333);
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 1.5, 6.1);
        shop.add(door);
        
        shop.userData = {
            type: 'building',
            buildingType: 'shop',
            shopType: type,
            collision: { width: cfg.width, depth: 12, height: cfg.height },
            interactable: this.getShopInteraction(type)
        };
        
        return shop;
    },
    
    getShopInteraction(type) {
        const interactions = {
            pyaterochka: {
                prompt: 'Нажмите E чтобы войти в Пятёрочку',
                action: () => {
                    DialogSystem.show('Кассир', 
                        'Добро пожаловать в Пятёрочку! Акция: гречка по 150₽!',
                        [
                            { text: 'Купить гречку (150₽, +25 HP)', callback: () => {
                                if (GameState.playerMoney >= 150) {
                                    GameState.playerMoney -= 150;
                                    GameState.playerHealth = Math.min(100, GameState.playerHealth + 25);
                                    NotificationSystem.success('Куплено! +25 HP');
                                } else {
                                    NotificationSystem.error('Денег нет, но вы держитесь!');
                                }
                            }},
                            { text: 'Купить водку (450₽)', callback: () => {
                                if (GameState.playerMoney >= 450) {
                                    GameState.playerMoney -= 450;
                                    NotificationSystem.info('Не злоупотребляйте!');
                                } else {
                                    NotificationSystem.error('Недостаточно средств!');
                                }
                            }},
                            { text: 'Выйти' }
                        ]
                    );
                }
            },
            sberbank: {
                prompt: 'Нажмите E для посещения банка',
                action: () => {
                    DialogSystem.show('Операционист', 
                        `Ваш баланс: ${Utils.formatMoney(GameState.playerMoney)}₽. Кредит под 25% годовых?`,
                        [
                            { text: 'Взять кредит 50000₽', callback: () => {
                                GameState.playerMoney += 50000;
                                NotificationSystem.success('+50000₽ (не забудьте вернуть!)');
                            }},
                            { text: 'Положить на депозит', callback: () => {
                                NotificationSystem.info('Ставка: 8% годовых');
                            }},
                            { text: 'Уйти' }
                        ]
                    );
                }
            },
            mfc: {
                prompt: 'Нажмите E для получения госуслуг',
                action: () => {
                    DialogSystem.show('Специалист МФЦ', 
                        'Какую услугу желаете получить?',
                        [
                            { text: 'Оформить паспорт (-300₽)', callback: () => {
                                if (GameState.playerMoney >= 300) {
                                    GameState.playerMoney -= 300;
                                    NotificationSystem.success('Паспорт будет готов через 30 дней');
                                } else {
                                    NotificationSystem.error('Недостаточно средств!');
                                }
                            }},
                            { text: 'Получить справку (-100₽)', callback: () => {
                                if (GameState.playerMoney >= 100) {
                                    GameState.playerMoney -= 100;
                                    NotificationSystem.success('Справка получена!');
                                } else {
                                    NotificationSystem.error('Недостаточно средств!');
                                }
                            }},
                            { text: 'Уйти' }
                        ]
                    );
                }
            },
            pochta: {
                prompt: 'Нажмите E (очередь ~2 часа)',
                action: () => {
                    const number = Math.floor(Math.random() * 200) + 50;
                    NotificationSystem.info(`Ваш номер в очереди: ${number}. Ожидайте...`);
                }
            },
            shawarma: {
                prompt: 'Нажмите E чтобы купить шаурму (199₽)',
                action: () => {
                    if (GameState.playerMoney >= 199) {
                        GameState.playerMoney -= 199;
                        GameState.playerHealth = Math.min(100, GameState.playerHealth + 35);
                        NotificationSystem.success('Вы съели шаурму! +35 HP');
                    } else {
                        NotificationSystem.error('Недостаточно денег!');
                    }
                }
            }
        };
        
        return interactions[type] || interactions.pyaterochka;
    },
    
    // ===== ЗАПРАВКА =====
    createGasStation() {
        const station = new THREE.Group();
        
        // Навес
        const roofGeom = new THREE.BoxGeometry(18, 0.5, 12);
        const roofMat = this.getMaterial(0xDD0000);
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 5;
        roof.castShadow = true;
        station.add(roof);
        
        // Колонны
        const pillarGeom = new THREE.BoxGeometry(0.5, 5, 0.5);
        const pillarMat = this.getMaterial(0xCCCCCC);
        [[-7, -5], [-7, 5], [7, -5], [7, 5]].forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(pillarGeom, pillarMat);
            pillar.position.set(px, 2.5, pz);
            station.add(pillar);
        });
        
        // Колонки
        const pumpGeom = new THREE.BoxGeometry(1.2, 2.2, 0.8);
        const pumpMat = this.getMaterial(0xFF6600);
        [-4, 0, 4].forEach(px => {
            const pump = new THREE.Mesh(pumpGeom, pumpMat);
            pump.position.set(px, 1.1, 0);
            pump.castShadow = true;
            station.add(pump);
            
            // Экран
            const screenGeom = new THREE.BoxGeometry(0.6, 0.4, 0.05);
            const screenMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
            const screen = new THREE.Mesh(screenGeom, screenMat);
            screen.position.set(px, 1.8, 0.43);
            station.add(screen);
        });
        
        // Вывеска ЛУКОЙЛ
        const signTexture = TextureGenerator.sign('ЛУКОЙЛ 54.99₽/л', '#FF0000', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(8, 2, 0.3);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, 7, 0);
        station.add(sign);
        
        // Магазин при заправке
        const shopGeom = new THREE.BoxGeometry(8, 4, 6);
        const shopMat = this.getMaterial(0xEEEEEE);
        const shopMesh = new THREE.Mesh(shopGeom, shopMat);
        shopMesh.position.set(12, 2, 0);
        shopMesh.castShadow = true;
        station.add(shopMesh);
        
        station.userData = {
            type: 'gas_station',
            collision: { width: 18, depth: 12, height: 6 },
            interactable: {
                prompt: 'Нажмите E чтобы заправиться',
                action: () => {
                    if (GameState.currentVehicle) {
                        const fuelNeeded = 100 - GameState.vehicleFuel;
                        const cost = Math.floor(fuelNeeded * 0.55 * 100);
                        if (GameState.playerMoney >= cost) {
                            GameState.playerMoney -= cost;
                            GameState.vehicleFuel = 100;
                            NotificationSystem.success(`Заправлено! -${cost}₽`);
                        } else {
                            NotificationSystem.error('Недостаточно денег!');
                        }
                    } else {
                        NotificationSystem.info('Сначала сядьте в машину!');
                    }
                }
            }
        };
        
        return station;
    },
    
    // ===== ВОЕНКОМАТ =====
    createMilitaryOffice() {
        const building = new THREE.Group();
        const width = 18;
        const depth = 12;
        const height = 6;
        
        // Здание
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const bodyMat = this.getMaterial(0x556B2F);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        building.add(body);
        
        // Вывеска
        const signTexture = TextureGenerator.sign('ВОЕНКОМАТ', '#556B2F', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(10, 1.5, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, height + 1, depth/2 + 0.1);
        building.add(sign);
        
        // Звезда над входом
        const starGroup = new THREE.Group();
        const starMat = this.getMaterial(0xD52B1E);
        for (let i = 0; i < 5; i++) {
            const point = new THREE.Mesh(
                new THREE.ConeGeometry(0.25, 0.8, 4),
                starMat
            );
            const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
            point.position.x = Math.cos(angle) * 0.4;
            point.position.y = Math.sin(angle) * 0.4;
            point.rotation.z = angle + Math.PI / 2;
            starGroup.add(point);
        }
        starGroup.position.set(0, height + 3, depth/2 + 0.2);
        building.add(starGroup);
        
        building.userData = {
            type: 'building',
            buildingType: 'military',
            collision: { width, depth, height },
            interactable: {
                prompt: 'Нажмите E для посещения Военкомата',
                action: () => {
                    DialogSystem.show('Военком', 
                        'Здравия желаю! Контракт на службу: 195 000₽ подъёмные + 200 000₽/месяц.',
                        [
                            { text: 'Подписать контракт (+195000₽)', callback: () => {
                                GameState.playerMoney += 195000;
                                NotificationSystem.success('Контракт подписан! +195000₽ подъёмные!');
                            }},
                            { text: 'Мне нужно подумать...', callback: () => {
                                NotificationSystem.info('Родина ждёт!');
                            }},
                            { text: 'Уйти' }
                        ]
                    );
                }
            }
        };
        
        return building;
    },
    
    // ===== ЦЕНТР РОЖДАЕМОСТИ =====
    createFertilityCenter() {
        const building = new THREE.Group();
        const width = 20;
        const depth = 15;
        const height = 8;
        
        // Здание
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const bodyMat = this.getMaterial(0xFFCCCC);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        building.add(body);
        
        // Вывеска
        const signTexture = TextureGenerator.sign('ЦЕНТР РОЖДАЕМОСТИ', '#FF69B4', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(12, 1.5, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, height + 1, depth/2 + 0.1);
        building.add(sign);
        
        // Аист на крыше
        const storkGroup = new THREE.Group();
        
        // Тело аиста
        const storkBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 8, 8),
            this.getMaterial(0xFFFFFF)
        );
        storkBody.scale.set(1, 0.8, 1.5);
        storkGroup.add(storkBody);
        
        // Голова
        const storkHead = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            this.getMaterial(0xFFFFFF)
        );
        storkHead.position.set(0, 0.3, 0.8);
        storkGroup.add(storkHead);
        
        // Клюв
        const beak = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.5, 4),
            this.getMaterial(0xFF6600)
        );
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 0.3, 1.3);
        storkGroup.add(beak);
        
        storkGroup.position.set(0, height + 2.5, 0);
        storkGroup.scale.set(2.5, 2.5, 2.5);
        building.add(storkGroup);
        
        building.userData = {
            type: 'building',
            buildingType: 'fertility',
            collision: { width, depth, height },
            interactable: {
                prompt: 'Нажмите E для посещения Центра Рождаемости',
                action: () => {
                    DialogSystem.show('Сотрудница Центра', 
                        'Добро пожаловать! Материнский капитал: 630 000₽ за второго ребёнка!',
                        [
                            { text: 'Получить консультацию (+2000₽)', callback: () => {
                                GameState.playerMoney += 2000;
                                NotificationSystem.success('Вы получили консультацию! +2000₽');
                            }},
                            { text: 'Взять буклет', callback: () => {
                                NotificationSystem.info('Вы взяли буклет "Счастливая семья"');
                            }},
                            { text: 'Уйти' }
                        ]
                    );
                }
            }
        };
        
        return building;
    },
    
    // ===== РЕКЛАМНЫЙ БАННЕР СВО =====
    createSVOBanner() {
        const banner = new THREE.Group();
        
        // Опоры
        const poleGeom = new THREE.CylinderGeometry(0.2, 0.2, 10);
        const poleMat = this.getMaterial(0x666666);
        
        [-4, 4].forEach(px => {
            const pole = new THREE.Mesh(poleGeom, poleMat);
            pole.position.set(px, 5, 0);
            banner.add(pole);
        });
        
        // Баннер
        const bannerTexture = TextureGenerator.banner('КОНТРАКТ НА СЛУЖБУ', '195 000₽ + 200 000₽/МЕС');
        const bannerGeom = new THREE.BoxGeometry(10, 5, 0.3);
        const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTexture });
        const bannerMesh = new THREE.Mesh(bannerGeom, bannerMat);
        bannerMesh.position.y = 7.5;
        banner.add(bannerMesh);
        
        // Z
        const zMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const zGeom = new THREE.BoxGeometry(1.5, 0.3, 0.35);
        
        const z1 = new THREE.Mesh(zGeom, zMat);
        z1.position.set(3.5, 9, 0.2);
        banner.add(z1);
        
        const z2 = new THREE.Mesh(zGeom, zMat);
        z2.position.set(3.5, 6, 0.2);
        banner.add(z2);
        
        const z3 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 0.35), zMat);
        z3.position.set(3.5, 7.5, 0.2);
        z3.rotation.z = -Math.PI / 4;
        banner.add(z3);
        
        return banner;
    }
};