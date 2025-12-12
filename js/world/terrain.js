// ==================== TERRAIN ====================
import { CONFIG } from '../config.js';
import { Renderer } from '../engine/renderer.js';

class TerrainManager {
    constructor() {
        this.ground = null;
        this.roads = [];
        this.decorations = [];
    }
    
    init() {
        this.createGround();
        this.createRoads();
        this.createCentralPlaza();
        this.createTrees();
        this.createStreetLights();
        
        return this;
    }
    
    createGround() {
        const size = CONFIG.world.size * 2;
        
        // Основная земля
        const groundGeo = new THREE.PlaneGeometry(size, size, 32, 32);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x4A7C2A });
        
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        
        Renderer.add(this.ground);
    }
    
    createRoads() {
        const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const markingMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        
        const worldSize = CONFIG.world.size;
        const roadWidth = CONFIG.world.roadWidth;
        const blockSize = CONFIG.world.blockSize;
        
        // Сетка дорог
        for (let i = -4; i <= 4; i++) {
            if (i === 0) continue;
            
            const offset = i * blockSize;
            
            // Горизонтальные дороги
            this.createRoad(0, offset, worldSize * 2, roadWidth, 0);
            
            // Вертикальные дороги
            this.createRoad(offset, 0, roadWidth, worldSize * 2, 0);
        }
        
        // Главные магистрали (центральные)
        this.createMainRoad(0, 0, worldSize * 2, roadWidth + 4, true);  // Горизонтальная
        this.createMainRoad(0, 0, roadWidth + 4, worldSize * 2, false); // Вертикальная
    }
    
    createRoad(x, z, width, depth, rotation) {
        const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const road = new THREE.Mesh(
            new THREE.PlaneGeometry(width, depth),
            roadMat
        );
        road.rotation.x = -Math.PI / 2;
        road.position.set(x, 0.01, z);
        road.receiveShadow = true;
        
        Renderer.add(road);
        this.roads.push(road);
    }
    
    createMainRoad(x, z, width, depth, horizontal) {
        const roadMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        const markingMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        // Дорожное полотно
        const road = new THREE.Mesh(
            new THREE.PlaneGeometry(width, depth),
            roadMat
        );
        road.rotation.x = -Math.PI / 2;
        road.position.set(x, 0.015, z);
        road.receiveShadow = true;
        Renderer.add(road);
        
        // Разметка (центральная линия)
        const markingLength = horizontal ? width : depth;
        const markingCount = Math.floor(markingLength / 12);
        
        for (let i = -markingCount / 2; i < markingCount / 2; i++) {
            const marking = new THREE.Mesh(
                new THREE.PlaneGeometry(horizontal ? 4 : 0.2, horizontal ? 0.2 : 4),
                markingMat
            );
            marking.rotation.x = -Math.PI / 2;
            
            if (horizontal) {
                marking.position.set(i * 12, 0.02, z);
            } else {
                marking.position.set(x, 0.02, i * 12);
            }
            
            Renderer.add(marking);
        }
        
        // Боковая разметка
        const sideOffset = (horizontal ? depth : width) / 2 - 0.5;
        
        for (let side = -1; side <= 1; side += 2) {
            const sideLine = new THREE.Mesh(
                new THREE.PlaneGeometry(horizontal ? width : 0.15, horizontal ? 0.15 : depth),
                markingMat
            );
            sideLine.rotation.x = -Math.PI / 2;
            
            if (horizontal) {
                sideLine.position.set(x, 0.02, z + side * sideOffset);
            } else {
                sideLine.position.set(x + side * sideOffset, 0.02, z);
            }
            
            Renderer.add(sideLine);
        }
    }
    
    createCentralPlaza() {
        // Круглая площадь
        const plazaGeo = new THREE.CircleGeometry(35, 48);
        const plazaMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
        
        const plaza = new THREE.Mesh(plazaGeo, plazaMat);
        plaza.rotation.x = -Math.PI / 2;
        plaza.position.y = 0.02;
        plaza.receiveShadow = true;
        Renderer.add(plaza);
        
        // Декоративное кольцо
        const ringGeo = new THREE.RingGeometry(30, 33, 48);
        const ringMat = new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.DoubleSide });
        
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.025;
        Renderer.add(ring);
        
        // Тротуарная плитка
        this.createPavingPattern(0, 0, 28);
        
        // Фонтан
        this.createFountain(0, 0);
    }
    
    createPavingPattern(x, z, radius) {
        const tileMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
        
        // Концентрические круги плитки
        for (let r = 5; r < radius; r += 4) {
            const segments = Math.floor(r * 2);
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                
                const tile = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 0.05, 1.5),
                    tileMat
                );
                tile.position.set(
                    x + Math.cos(angle) * r,
                    0.03,
                    z + Math.sin(angle) * r
                );
                tile.rotation.y = angle;
                
                Renderer.add(tile);
            }
        }
    }
    
    createFountain(x, z) {
        const group = new THREE.Group();
        
        // Основание
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(4, 4.5, 0.8, 24),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        base.position.y = 0.4;
        base.castShadow = true;
        group.add(base);
        
        // Чаша
        const bowl = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 3, 0.5, 24),
            new THREE.MeshLambertMaterial({ color: 0x555555 })
        );
        bowl.position.y = 1;
        group.add(bowl);
        
        // Вода
        const water = new THREE.Mesh(
            new THREE.CylinderGeometry(3.3, 3.3, 0.3, 24),
            new THREE.MeshBasicMaterial({ 
                color: 0x4488AA, 
                transparent: true, 
                opacity: 0.7 
            })
        );
        water.position.y = 1.1;
        group.add(water);
        
        // Центральная колонна
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 2, 12),
            new THREE.MeshLambertMaterial({ color: 0x777777 })
        );
        column.position.y = 2;
        column.castShadow = true;
        group.add(column);
        
        // Верхняя чаша
        const topBowl = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 0.8, 0.4, 16),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        topBowl.position.y = 3.2;
        group.add(topBowl);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
    }
    
    createTrees() {
        const treeCount = CONFIG.world.treeCount;
        
        for (let i = 0; i < treeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * (CONFIG.world.size - 80);
            
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            
            // Проверка, не на дороге ли
            if (this.isOnRoad(x, z)) continue;
            
            this.createTree(x, z);
        }
    }
    
    isOnRoad(x, z) {
        const blockSize = CONFIG.world.blockSize;
        const roadWidth = CONFIG.world.roadWidth;
        
        // Центральные дороги
        if (Math.abs(x) < roadWidth || Math.abs(z) < roadWidth) return true;
        
        // Сетка дорог
        for (let i = -4; i <= 4; i++) {
            if (i === 0) continue;
            const offset = i * blockSize;
            
            if (Math.abs(x - offset) < roadWidth / 2 || Math.abs(z - offset) < roadWidth / 2) {
                return true;
            }
        }
        
        return false;
    }
    
    createTree(x, z) {
        const group = new THREE.Group();
        
        const height = 6 + Math.random() * 6;
        const isBirch = Math.random() > 0.5;
        const isPine = !isBirch && Math.random() > 0.5;
        
        // Ствол
        const trunkColor = isBirch ? 0xF5F5DC : 0x8B4513;
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.35, height * 0.6, 8),
            new THREE.MeshLambertMaterial({ color: trunkColor })
        );
        trunk.position.y = height * 0.3;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Берёзовые полосы
        if (isBirch) {
            const stripeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
            for (let i = 0; i < height / 1.5; i++) {
                const stripe = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.22, 0.36 - i * 0.02, 0.1, 8),
                    stripeMat
                );
                stripe.position.y = 0.5 + i * 0.8;
                group.add(stripe);
            }
        }
        
        // Крона
        if (isPine) {
            // Ёлка
            const pineColor = 0x0B5A1A;
            for (let i = 0; i < 4; i++) {
                const radius = 2 - i * 0.4;
                const layer = new THREE.Mesh(
                    new THREE.ConeGeometry(radius, 2.5, 8),
                    new THREE.MeshLambertMaterial({ color: pineColor })
                );
                layer.position.y = height * 0.4 + i * 1.5;
                layer.castShadow = true;
                group.add(layer);
            }
        } else {
            // Лиственное дерево
            const leavesColor = isBirch ? 0x228B22 : 0x2E7D32;
            const leaves = new THREE.Mesh(
                new THREE.SphereGeometry(2.5 + Math.random(), 8, 8),
                new THREE.MeshLambertMaterial({ color: leavesColor })
            );
            leaves.position.y = height * 0.7;
            leaves.scale.y = 0.8;
            leaves.castShadow = true;
            group.add(leaves);
        }
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.decorations.push(group);
    }
    
    createStreetLights() {
        const blockSize = CONFIG.world.blockSize;
        const spacing = CONFIG.world.lampSpacing;
        
        // Вдоль дорог
        for (let i = -4; i <= 4; i++) {
            if (i === 0) continue;
            const offset = i * blockSize;
            
            for (let j = -CONFIG.world.size + 20; j < CONFIG.world.size - 20; j += spacing) {
                // Вдоль горизонтальных
                this.createStreetLight(j, offset + 7);
                // Вдоль вертикальных
                this.createStreetLight(offset + 7, j);
            }
        }
        
        // Вдоль центральных дорог
        for (let j = -CONFIG.world.size + 20; j < CONFIG.world.size - 20; j += spacing) {
            if (Math.abs(j) > 40) { // Не в центре площади
                this.createStreetLight(j, 10);
                this.createStreetLight(10, j);
            }
        }
    }
    
    createStreetLight(x, z) {
        const group = new THREE.Group();
        
        // Столб
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.12, 5, 8),
            new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        pole.position.y = 2.5;
        pole.castShadow = true;
        group.add(pole);
        
        // Рука
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.08, 0.08),
            new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        arm.position.set(0.75, 4.9, 0);
        group.add(arm);
        
        // Плафон
        const lamp = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.25, 0.35),
            new THREE.MeshBasicMaterial({ color: 0xFFFFAA })
        );
        lamp.position.set(1.5, 4.8, 0);
        group.add(lamp);
        
        // Свет
        const light = new THREE.PointLight(0xFFFFAA, 0.3, 15);
        light.position.set(1.5, 4.6, 0);
        group.add(light);
        
        group.position.set(x, 0, z);
        Renderer.add(group);
        this.decorations.push(group);
    }
    
    destroy() {
        if (this.ground) {
            Renderer.remove(this.ground);
        }
        
        this.roads.forEach(road => Renderer.remove(road));
        this.decorations.forEach(dec => Renderer.remove(dec));
        
        this.roads = [];
        this.decorations = [];
    }
}

export const Terrain = new TerrainManager();