// ============================================================
// ГОЙДАБЛОКС - ИГРОК И NPC (ОПТИМИЗИРОВАННАЯ ВЕРСИЯ)
// ============================================================

// Кэш материалов для переиспользования
const SharedMaterials = {
    cache: new Map(),
    
    get(color) {
        const key = color.toString(16);
        if (!this.cache.has(key)) {
            this.cache.set(key, new THREE.MeshLambertMaterial({ color }));
        }
        return this.cache.get(key);
    }
};

const PlayerFactory = {
    materials: {},
    
    getMaterial(color) {
        if (!this.materials[color]) {
            this.materials[color] = new THREE.MeshLambertMaterial({ color });
        }
        return this.materials[color];
    },
    
    // ===== СОЗДАНИЕ ИГРОКА =====
    createPlayer() {
        const player = new THREE.Group();
        player.name = 'player';
        
        // Тело (куртка)
        const bodyGeom = new THREE.BoxGeometry(0.8, 1.2, 0.5);
        const bodyMat = this.getMaterial(0x2244AA);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.6;
        body.castShadow = true;
        player.add(body);
        
        // Голова
        const headGeom = new THREE.BoxGeometry(0.55, 0.55, 0.55);
        const headMat = this.getMaterial(0xFFDBB4);
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.5;
        head.castShadow = true;
        player.add(head);
        
        // Глаза
        const eyeGeom = new THREE.BoxGeometry(0.08, 0.08, 0.05);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeom, eyeMat);
            eye.position.set(x, 1.55, 0.28);
            player.add(eye);
        });
        
        // Рот
        const mouthGeom = new THREE.BoxGeometry(0.15, 0.04, 0.02);
        const mouth = new THREE.Mesh(mouthGeom, eyeMat);
        mouth.position.set(0, 1.4, 0.28);
        player.add(mouth);
        
        // Ушанка
        const ushankaGeom = new THREE.BoxGeometry(0.65, 0.25, 0.65);
        const ushankaMat = this.getMaterial(0x4A3728);
        const ushanka = new THREE.Mesh(ushankaGeom, ushankaMat);
        ushanka.position.y = 1.85;
        ushanka.castShadow = true;
        player.add(ushanka);
        
        // Верх ушанки
        const ushankaTopGeom = new THREE.BoxGeometry(0.55, 0.15, 0.55);
        const ushankaTop = new THREE.Mesh(ushankaTopGeom, ushankaMat);
        ushankaTop.position.y = 2.0;
        player.add(ushankaTop);
        
        // Уши ушанки
        const earGeom = new THREE.BoxGeometry(0.18, 0.35, 0.25);
        [-0.42, 0.42].forEach(x => {
            const ear = new THREE.Mesh(earGeom, ushankaMat);
            ear.position.set(x, 1.65, 0);
            player.add(ear);
        });
        
        // Звезда на ушанке
        const starMat = new THREE.MeshBasicMaterial({ color: 0xD52B1E });
        const star = new THREE.Mesh(
            new THREE.CircleGeometry(0.08, 5),
            starMat
        );
        star.position.set(0, 1.9, 0.33);
        player.add(star);
        
        // Руки
        player.userData.leftArm = this.createArm();
        player.userData.leftArm.position.set(-0.55, 0.6, 0);
        player.add(player.userData.leftArm);
        
        player.userData.rightArm = this.createArm();
        player.userData.rightArm.position.set(0.55, 0.6, 0);
        player.add(player.userData.rightArm);
        
        // Ноги
        player.userData.leftLeg = this.createLeg();
        player.userData.leftLeg.position.set(-0.2, 0, 0);
        player.add(player.userData.leftLeg);
        
        player.userData.rightLeg = this.createLeg();
        player.userData.rightLeg.position.set(0.2, 0, 0);
        player.add(player.userData.rightLeg);
        
        return player;
    },
    
    createArm() {
        const arm = new THREE.Group();
        
        // Рукав куртки
        const sleeveGeom = new THREE.BoxGeometry(0.22, 0.7, 0.22);
        const sleeveMat = this.getMaterial(0x2244AA);
        const sleeve = new THREE.Mesh(sleeveGeom, sleeveMat);
        sleeve.position.y = -0.1;
        sleeve.castShadow = true;
        arm.add(sleeve);
        
        // Кисть
        const handGeom = new THREE.BoxGeometry(0.15, 0.2, 0.15);
        const handMat = this.getMaterial(0xFFDBB4);
        const hand = new THREE.Mesh(handGeom, handMat);
        hand.position.y = -0.5;
        arm.add(hand);
        
        return arm;
    },
    
    createLeg() {
        const leg = new THREE.Group();
        
        // Штанина
        const legGeom = new THREE.BoxGeometry(0.28, 0.7, 0.28);
        const legMat = this.getMaterial(0x333333);
        const legMesh = new THREE.Mesh(legGeom, legMat);
        legMesh.position.y = -0.35;
        legMesh.castShadow = true;
        leg.add(legMesh);
        
        // Ботинок
        const bootGeom = new THREE.BoxGeometry(0.3, 0.15, 0.4);
        const bootMat = this.getMaterial(0x222222);
        const boot = new THREE.Mesh(bootGeom, bootMat);
        boot.position.set(0, -0.75, 0.05);
        leg.add(boot);
        
        return leg;
    },
    
    // Анимация ходьбы
    animateWalk(player, time, speed) {
        if (!player.userData.leftArm) return;
        
        const swing = Math.sin(time * speed * 10) * 0.5;
        
        player.userData.leftArm.rotation.x = swing;
        player.userData.rightArm.rotation.x = -swing;
        player.userData.leftLeg.rotation.x = -swing * 0.8;
        player.userData.rightLeg.rotation.x = swing * 0.8;
    },
    
    // Сброс анимации
    resetAnimation(player) {
        if (!player.userData.leftArm) return;
        
        player.userData.leftArm.rotation.x = 0;
        player.userData.rightArm.rotation.x = 0;
        player.userData.leftLeg.rotation.x = 0;
        player.userData.rightLeg.rotation.x = 0;
    }
};

// ===== ФАБРИКА NPC =====
const NPCFactory = {
    materials: {},
    
    getMaterial(color) {
        if (!this.materials[color]) {
            this.materials[color] = new THREE.MeshLambertMaterial({ color });
        }
        return this.materials[color];
    },
    
    // Типы NPC
    types: {
        civilian: {
            bodyColor: 0x444444,
            skinColor: 0xFFDBB4,
            hasUshanka: false,
            dialogues: [
                'Привет, как дела?',
                'Хорошая погода сегодня!',
                'Видел новые цены в Пятёрочке?',
                'Говорят, скоро снег будет...',
                'А ты откуда?'
            ]
        },
        babushka: {
            bodyColor: 0x8B4513,
            skinColor: 0xE8C4A0,
            hasScarf: true,
            dialogues: [
                'Внучек, покушай пирожок!',
                'В моё время такого не было...',
                'Сынок, помоги сумку донести!',
                'Пенсию когда повысят?',
                'Ой, молодёжь пошла...'
            ]
        },
        police: {
            bodyColor: 0x000066,
            skinColor: 0xFFDBB4,
            hasCap: true,
            dialogues: [
                'Документы предъявите!',
                'Всё в порядке, проходите.',
                'Нарушаем?',
                'Штраф 500 рублей!',
                'Гражданин, пройдёмте!'
            ]
        },
        worker: {
            bodyColor: 0xFF6600,
            skinColor: 0xDDBB94,
            hasHelmet: true,
            dialogues: [
                'Работы много, отдыха мало...',
                'Эх, зарплату бы повыше!',
                'Осторожно, стройка!',
                'Перекур!',
                'До конца смены ещё долго...'
            ]
        },
        businessman: {
            bodyColor: 0x1a1a1a,
            skinColor: 0xFFDBB4,
            hasTie: true,
            dialogues: [
                'Время - деньги!',
                'У меня важная встреча.',
                'Инвестируй в криптовалюту!',
                'Биткоин упал? Покупаем!',
                'Бизнес есть бизнес.'
            ]
        },
        gopnik: {
            bodyColor: 0x222222,
            skinColor: 0xDDBB94,
            hasSquat: true,
            dialogues: [
                'Эй, братан, есть сигарета?',
                'Чё как? Жизнь бьёт?',
                'Семки будешь?',
                'На районе всё спокойно.',
                'Адидас - это не просто бренд, это стиль жизни!'
            ]
        }
    },
    
    // Создание NPC
    createNPC(type = 'civilian') {
        const npc = new THREE.Group();
        npc.name = 'npc';
        
        const config = this.types[type] || this.types.civilian;
        
        // Тело
        const bodyGeom = new THREE.BoxGeometry(0.6, 1, 0.4);
        const bodyMat = this.getMaterial(config.bodyColor);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 1;
        body.castShadow = true;
        npc.add(body);
        
        // Голова
        const headGeom = new THREE.BoxGeometry(0.45, 0.45, 0.45);
        const headMat = this.getMaterial(config.skinColor);
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.7;
        head.castShadow = true;
        npc.add(head);
        
        // Глаза
        const eyeGeom = new THREE.BoxGeometry(0.06, 0.06, 0.02);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.1, 0.1].forEach(x => {
            const eye = new THREE.Mesh(eyeGeom, eyeMat);
            eye.position.set(x, 1.75, 0.24);
            npc.add(eye);
        });
        
        // Волосы/головной убор
        if (config.hasUshanka) {
            this.addUshanka(npc);
        } else if (config.hasCap) {
            this.addPoliceCap(npc);
        } else if (config.hasHelmet) {
            this.addHelmet(npc);
        } else if (config.hasScarf) {
            this.addScarf(npc);
        } else {
            this.addHair(npc);
        }
        
        // Галстук для бизнесмена
        if (config.hasTie) {
            const tie = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.4, 0.05),
                this.getMaterial(0xAA0000)
            );
            tie.position.set(0, 0.9, 0.23);
            npc.add(tie);
        }
        
        // Ноги
        const legGeom = new THREE.BoxGeometry(0.22, 0.6, 0.22);
        const legMat = this.getMaterial(0x333333);
        [-0.15, 0.15].forEach(x => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(x, 0.3, 0);
            leg.castShadow = true;
            npc.add(leg);
        });
        
        // Настройки NPC
        npc.userData = {
            type: 'npc',
            npcType: type,
            walkTarget: null,
            walkSpeed: 1.5 + Math.random() * 1.5,
            idleTime: 0,
            dialogues: config.dialogues,
            interactable: {
                prompt: 'Нажмите E чтобы поговорить',
                action: () => this.interact(npc)
            }
        };
        
        return npc;
    },
    
    addHair(npc) {
        const hairGeom = new THREE.BoxGeometry(0.48, 0.15, 0.48);
        const hairMat = this.getMaterial(0x3D2314);
        const hair = new THREE.Mesh(hairGeom, hairMat);
        hair.position.y = 1.97;
        npc.add(hair);
    },
    
    addUshanka(npc) {
        const ushankaGeom = new THREE.BoxGeometry(0.55, 0.2, 0.55);
        const ushankaMat = this.getMaterial(0x4A3728);
        const ushanka = new THREE.Mesh(ushankaGeom, ushankaMat);
        ushanka.position.y = 1.95;
        npc.add(ushanka);
        
        // Уши
        const earGeom = new THREE.BoxGeometry(0.15, 0.25, 0.2);
        [-0.35, 0.35].forEach(x => {
            const ear = new THREE.Mesh(earGeom, ushankaMat);
            ear.position.set(x, 1.75, 0);
            npc.add(ear);
        });
    },
    
    addPoliceCap(npc) {
        const capGeom = new THREE.BoxGeometry(0.5, 0.12, 0.5);
        const capMat = this.getMaterial(0x000066);
        const cap = new THREE.Mesh(capGeom, capMat);
        cap.position.y = 1.97;
        npc.add(cap);
        
        // Козырёк
        const visorGeom = new THREE.BoxGeometry(0.3, 0.03, 0.2);
        const visor = new THREE.Mesh(visorGeom, this.getMaterial(0x111111));
        visor.position.set(0, 1.92, 0.3);
        npc.add(visor);
        
        // Кокарда
        const badge = new THREE.Mesh(
            new THREE.CircleGeometry(0.06, 8),
            new THREE.MeshBasicMaterial({ color: 0xFFD700 })
        );
        badge.position.set(0, 1.95, 0.26);
        npc.add(badge);
    },
    
    addHelmet(npc) {
        const helmetGeom = new THREE.SphereGeometry(0.28, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const helmetMat = this.getMaterial(0xFFAA00);
        const helmet = new THREE.Mesh(helmetGeom, helmetMat);
        helmet.position.y = 1.92;
        npc.add(helmet);
    },
    
    addScarf(npc) {
        // Платок бабушки
        const scarfGeom = new THREE.BoxGeometry(0.55, 0.35, 0.55);
        const scarfMat = this.getMaterial(0xAA4444);
        const scarf = new THREE.Mesh(scarfGeom, scarfMat);
        scarf.position.y = 1.88;
        npc.add(scarf);
        
        // Узел спереди
        const knotGeom = new THREE.BoxGeometry(0.15, 0.1, 0.1);
        const knot = new THREE.Mesh(knotGeom, scarfMat);
        knot.position.set(0, 1.6, 0.25);
        npc.add(knot);
    },
    
    // Взаимодействие с NPC
    interact(npc) {
        const dialogues = npc.userData.dialogues || ['...'];
        const randomDialogue = Utils.randomElement(dialogues);
        
        const typeNames = {
            civilian: 'Гражданин',
            babushka: 'Бабушка',
            police: 'Полицейский',
            worker: 'Рабочий',
            businessman: 'Бизнесмен',
            gopnik: 'Гопник'
        };
        
        const name = typeNames[npc.userData.npcType] || 'Незнакомец';
        
        DialogSystem.show(name, randomDialogue, [
            { text: 'Интересно...', callback: () => {
                NotificationSystem.info('Вы поговорили с NPC');
            }},
            { text: 'До свидания' }
        ]);
    },
    
    // Создание случайного NPC
    createRandomNPC() {
        const types = Object.keys(this.types);
        const weights = {
            civilian: 30,
            babushka: 15,
            police: 10,
            worker: 15,
            businessman: 10,
            gopnik: 20
        };
        
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const type of types) {
            random -= weights[type] || 10;
            if (random <= 0) {
                return this.createNPC(type);
            }
        }
        
        return this.createNPC('civilian');
    },
    
    // Обновление NPC
    updateNPC(npc, delta, playerPosition) {
        const data = npc.userData;
        
        // Проверка дистанции до игрока (не подходить слишком близко)
        const distToPlayer = Utils.distance(npc.position, playerPosition);
        if (distToPlayer < 3) {
            data.walkTarget = null;
            data.idleTime = 2;
        }
        
        // Пауза
        if (data.idleTime > 0) {
            data.idleTime -= delta;
            return;
        }
        
        // Новая цель
        if (!data.walkTarget || Utils.distance(npc.position, data.walkTarget) < 1) {
            data.walkTarget = {
                x: npc.position.x + (Math.random() - 0.5) * 40,
                z: npc.position.z + (Math.random() - 0.5) * 40
            };
            data.idleTime = 1 + Math.random() * 4;
            return;
        }
        
        // Движение к цели
        const dir = new THREE.Vector3(
            data.walkTarget.x - npc.position.x,
            0,
            data.walkTarget.z - npc.position.z
        ).normalize();
        
        npc.position.x += dir.x * data.walkSpeed * delta;
        npc.position.z += dir.z * data.walkSpeed * delta;
        
        // Поворот
        npc.rotation.y = Math.atan2(dir.x, dir.z);
        
        // Простая анимация ходьбы
        const time = Date.now() * 0.001;
        npc.children.forEach((child, i) => {
            if (i >= 4 && i <= 5) { // Ноги
                child.rotation.x = Math.sin(time * data.walkSpeed * 5 + (i === 4 ? 0 : Math.PI)) * 0.3;
            }
        });
    },
    
    // Упрощённый NPC для оптимизации
    createSimpleNPC() {
        const npc = new THREE.Group();
        npc.name = 'npc';
        
        // Тело - один блок
        const bodyGeom = new THREE.BoxGeometry(0.6, 1.6, 0.4);
        const bodyMat = SharedMaterials.get(0x444444);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.8;
        body.castShadow = true;
        npc.add(body);
        
        // Голова - один блок
        const headGeom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMat = SharedMaterials.get(0xFFDBB4);
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.8;
        npc.add(head);
        
        // Настройки NPC
        npc.userData = {
            type: 'npc',
            npcType: 'civilian',
            walkTarget: null,
            walkSpeed: 1.5 + Math.random() * 1.5,
            idleTime: 0,
            dialogues: ['Привет!', 'Как дела?'],
            interactable: {
                prompt: 'Нажмите E чтобы поговорить',
                action: () => {
                    DialogSystem.show('Гражданин', 'Привет! Хорошая погода сегодня!', [
                        { text: 'Да, отличная!' },
                        { text: 'До свидания' }
                    ]);
                }
            }
        };
        
        return npc;
    }
};

// ===== ДЕКОРАЦИИ (деревья, скамейки и т.д.) =====
const DecorationFactory = {
    materials: {},
    
    getMaterial(color) {
        if (!this.materials[color]) {
            this.materials[color] = new THREE.MeshLambertMaterial({ color });
        }
        return this.materials[color];
    },
    
    // Берёза
    createBirch() {
        const tree = new THREE.Group();
        
        // Ствол
        const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 5, 8);
        const trunkMat = this.getMaterial(0xF5F5DC);
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Чёрные полосы
        const stripeMat = this.getMaterial(0x222222);
        for (let i = 0; i < 6; i++) {
            const stripeGeom = new THREE.CylinderGeometry(0.17, 0.23 - i * 0.01, 0.12, 8);
            const stripe = new THREE.Mesh(stripeGeom, stripeMat);
            stripe.position.y = 0.5 + i * 0.7;
            tree.add(stripe);
        }
        
        // Крона
        const leavesGeom = new THREE.SphereGeometry(2, 8, 8);
        const leavesMat = this.getMaterial(0x228B22);
        const leaves = new THREE.Mesh(leavesGeom, leavesMat);
        leaves.scale.set(1, 1.3, 1);
        leaves.position.y = 6;
        leaves.castShadow = true;
        tree.add(leaves);
        
        // Дополнительные ветви
        for (let i = 0; i < 3; i++) {
            const branchLeaves = new THREE.Mesh(
                new THREE.SphereGeometry(1.2, 6, 6),
                leavesMat
            );
            const angle = (i / 3) * Math.PI * 2;
            branchLeaves.position.set(
                Math.cos(angle) * 1.5,
                5 + Math.random(),
                Math.sin(angle) * 1.5
            );
            branchLeaves.castShadow = true;
            tree.add(branchLeaves);
        }
        
        return tree;
    },
    
    // Ёлка
    createSpruce() {
        const tree = new THREE.Group();
        
        // Ствол
        const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 2, 8);
        const trunkMat = this.getMaterial(0x4A3728);
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 1;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Ярусы хвои
        const leafMat = this.getMaterial(0x0B5345);
        for (let i = 0; i < 4; i++) {
            const coneGeom = new THREE.ConeGeometry(2 - i * 0.4, 2.5 - i * 0.3, 8);
            const cone = new THREE.Mesh(coneGeom, leafMat);
            cone.position.y = 2.5 + i * 1.8;
            cone.castShadow = true;
            tree.add(cone);
        }
        
        return tree;
    },
    
    // Скамейка
    createBench() {
        const bench = new THREE.Group();
        
        const woodMat = this.getMaterial(0x8B4513);
        const metalMat = this.getMaterial(0x333333);
        
        // Сиденье
        const seatGeom = new THREE.BoxGeometry(2.5, 0.1, 0.5);
        const seat = new THREE.Mesh(seatGeom, woodMat);
        seat.position.y = 0.5;
        seat.castShadow = true;
        bench.add(seat);
        
        // Спинка
        const backGeom = new THREE.BoxGeometry(2.5, 0.6, 0.08);
        const back = new THREE.Mesh(backGeom, woodMat);
        back.position.set(0, 0.85, -0.22);
        back.rotation.x = -0.1;
        back.castShadow = true;
        bench.add(back);
        
        // Ножки
        const legGeom = new THREE.BoxGeometry(0.12, 0.5, 0.5);
        [-1, 1].forEach(x => {
            const leg = new THREE.Mesh(legGeom, metalMat);
            leg.position.set(x, 0.25, 0);
            bench.add(leg);
        });
        
        // Подлокотники
        const armGeom = new THREE.BoxGeometry(0.08, 0.25, 0.4);
        [-1.25, 1.25].forEach(x => {
            const arm = new THREE.Mesh(armGeom, metalMat);
            arm.position.set(x, 0.65, -0.05);
            bench.add(arm);
        });
        
        return bench;
    },
    
    // Фонарь
    createStreetLamp() {
        const lamp = new THREE.Group();
        
        const metalMat = this.getMaterial(0x333333);
        
        // Столб
        const poleGeom = new THREE.CylinderGeometry(0.08, 0.1, 5, 8);
        const pole = new THREE.Mesh(poleGeom, metalMat);
        pole.position.y = 2.5;
        pole.castShadow = true;
        lamp.add(pole);
        
        // Изгиб
        const bendGeom = new THREE.BoxGeometry(0.08, 0.08, 0.8);
        const bend = new THREE.Mesh(bendGeom, metalMat);
        bend.position.set(0, 5, 0.35);
        lamp.add(bend);
        
        // Плафон
        const shadeGeom = new THREE.BoxGeometry(0.4, 0.25, 0.4);
        const shadeMat = this.getMaterial(0xFFFFAA);
        const shade = new THREE.Mesh(shadeGeom, shadeMat);
        shade.position.set(0, 4.85, 0.7);
        lamp.add(shade);
        
        // Источник света
        const light = new THREE.PointLight(0xFFFFAA, 0.5, 15);
        light.position.set(0, 4.7, 0.7);
        lamp.add(light);
        lamp.userData.light = light;
        
        return lamp;
    },
    
    // Мусорка
    createTrashBin() {
        const bin = new THREE.Group();
        
        const binGeom = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 8);
        const binMat = this.getMaterial(0x2F4F2F);
        const binMesh = new THREE.Mesh(binGeom, binMat);
        binMesh.position.y = 0.4;
        binMesh.castShadow = true;
        bin.add(binMesh);
        
        // Крышка
        const lidGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 8);
        const lid = new THREE.Mesh(lidGeom, binMat);
        lid.position.y = 0.84;
        bin.add(lid);
        
        return bin;
    },
    
    // Флаг России
    createFlag(scale = 1) {
        const flagGroup = new THREE.Group();
        
        // Флагшток
        const poleGeom = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 5 * scale, 8);
        const poleMat = this.getMaterial(0x888888);
        const pole = new THREE.Mesh(poleGeom, poleMat);
        pole.position.y = 2.5 * scale;
        flagGroup.add(pole);
        
        // Шар на верхушке
        const ballGeom = new THREE.SphereGeometry(0.1 * scale, 8, 8);
        const ballMat = this.getMaterial(0xFFD700);
        const ball = new THREE.Mesh(ballGeom, ballMat);
        ball.position.y = 5.1 * scale;
        flagGroup.add(ball);
        
        // Полосы флага
        const stripeHeight = 0.5 * scale;
        const stripeWidth = 2 * scale;
        
        const colors = [COLORS.white, COLORS.blue, COLORS.red];
        const yPositions = [4.75, 4.25, 3.75];
        
        colors.forEach((color, i) => {
            const stripeGeom = new THREE.BoxGeometry(stripeWidth, stripeHeight, 0.05 * scale);
            const stripeMat = this.getMaterial(color);
            const stripe = new THREE.Mesh(stripeGeom, stripeMat);
            stripe.position.set(stripeWidth / 2, yPositions[i] * scale, 0);
            stripe.castShadow = true;
            flagGroup.add(stripe);
        });
        
        return flagGroup;
    },
    
    // Памятник
    createMonument() {
        const monument = new THREE.Group();
        
        const stoneMat = this.getMaterial(0x666666);
        const bronzeMat = this.getMaterial(0xCD7F32);
        
        // База
        const baseGeom = new THREE.BoxGeometry(6, 0.5, 6);
        const base = new THREE.Mesh(baseGeom, stoneMat);
        base.position.y = 0.25;
        monument.add(base);
        
        // Постамент
        const pedestalGeom = new THREE.BoxGeometry(3, 3, 3);
        const pedestal = new THREE.Mesh(pedestalGeom, stoneMat);
        pedestal.position.y = 2;
        monument.add(pedestal);
        
        // Фигура
        const figureGeom = new THREE.BoxGeometry(1.2, 4, 0.6);
        const figure = new THREE.Mesh(figureGeom, bronzeMat);
        figure.position.y = 5.5;
        monument.add(figure);
        
        // Голова
        const headGeom = new THREE.SphereGeometry(0.5, 8, 8);
        const head = new THREE.Mesh(headGeom, bronzeMat);
        head.position.y = 8;
        monument.add(head);
        
        // Рука указывающая
        const armGeom = new THREE.BoxGeometry(2, 0.25, 0.25);
        const arm = new THREE.Mesh(armGeom, bronzeMat);
        arm.position.set(1.2, 6.5, 0.5);
        arm.rotation.z = -0.3;
        arm.rotation.y = 0.5;
        monument.add(arm);
        
        monument.userData = {
            type: 'monument',
            collision: { width: 6, depth: 6, height: 9 }
        };
        
        return monument;
    },
    
    // Остановка
    createBusStop() {
        const stop = new THREE.Group();
        
        const metalMat = this.getMaterial(0x666666);
        const glassMat = this.getMaterial(0x87CEEB, { transparent: true, opacity: 0.5 });
        
        // Опоры
        const poleGeom = new THREE.BoxGeometry(0.1, 3, 0.1);
        [[-1.5, -0.5], [1.5, -0.5]].forEach(([x, z]) => {
            const pole = new THREE.Mesh(poleGeom, metalMat);
            pole.position.set(x, 1.5, z);
            stop.add(pole);
        });
        
        // Крыша
        const roofGeom = new THREE.BoxGeometry(4, 0.15, 2);
        const roof = new THREE.Mesh(roofGeom, metalMat);
        roof.position.set(0, 3, 0);
        stop.add(roof);
        
        // Задняя стенка (стекло)
        const backGeom = new THREE.BoxGeometry(4, 2.5, 0.1);
        const back = new THREE.Mesh(backGeom, glassMat);
        back.position.set(0, 1.5, -0.9);
        stop.add(back);
        
        // Боковые стенки
        const sideGeom = new THREE.BoxGeometry(0.1, 2.5, 1.8);
        [-2, 2].forEach(x => {
            const side = new THREE.Mesh(sideGeom, glassMat);
            side.position.set(x, 1.5, 0);
            stop.add(side);
        });
        
        // Скамейка
        const benchGeom = new THREE.BoxGeometry(3, 0.1, 0.5);
        const bench = new THREE.Mesh(benchGeom, metalMat);
        bench.position.set(0, 0.5, -0.3);
        stop.add(bench);
        
        // Табличка с маршрутами
        const signTexture = TextureGenerator.sign('ОСТАНОВКА', '#0039A6', '#FFFFFF');
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.4, 0.05),
            signMat
        );
        sign.position.set(0, 2.7, -0.85);
        stop.add(sign);
        
        return stop;
    },
    
    // Упрощённое дерево для оптимизации (меньше полигонов)
    createSimpleTree() {
        const tree = new THREE.Group();
        
        // Ствол - простой цилиндр
        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.3, 4, 6);
        const trunkMat = SharedMaterials.get(0x8B4513);
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 2;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Крона - один конус (ёлка) или сфера (лиственное)
        const isConifer = Math.random() > 0.5;
        
        if (isConifer) {
            // Ёлка - один конус
            const coneGeom = new THREE.ConeGeometry(2, 5, 6);
            const coneMat = SharedMaterials.get(0x228B22);
            const cone = new THREE.Mesh(coneGeom, coneMat);
            cone.position.y = 5.5;
            cone.castShadow = true;
            tree.add(cone);
        } else {
            // Лиственное - одна сфера
            const leavesGeom = new THREE.SphereGeometry(2.5, 6, 6);
            const leavesMat = SharedMaterials.get(0x2E8B2E);
            const leaves = new THREE.Mesh(leavesGeom, leavesMat);
            leaves.position.y = 5;
            leaves.castShadow = true;
            tree.add(leaves);
        }
        
        return tree;
    }
};