/**
 * ГОЙДАБЛОКС - World Generator
 * Generates the game world with buildings, roads, and environment
 */

import * as THREE from 'three';
import { CONFIG, COLORS, BUILDING_TYPES, VEHICLE_TYPES } from '../config/GameConfig.js';
import { BuildingFactory } from './BuildingFactory.js';
import { RoadNetwork } from './RoadNetwork.js';
import { EnvironmentObjects } from './EnvironmentObjects.js';

export class WorldGenerator {
    constructor(game) {
        this.game = game;
        
        // World objects
        this.buildings = [];
        this.roads = [];
        this.objects = [];
        this.interactables = [];
        
        // Factories
        this.buildingFactory = new BuildingFactory(game);
        this.roadNetwork = new RoadNetwork(game);
        this.environmentObjects = new EnvironmentObjects(game);
        
        // Ground
        this.ground = null;
        
        console.log('🌍 WorldGenerator initialized');
    }
    
    /**
     * Generate the complete world
     */
    async generate() {
        console.log('🏗️ Generating world...');
        
        // Create ground
        this.createGround();
        
        // Create sky
        this.createSky();
        
        // Generate road network
        this.generateRoads();
        
        // Generate districts
        this.generateCityCenter();
        this.generateResidentialDistrict();
        this.generateIndustrialDistrict();
        this.generateParkArea();
        this.generateOutskirts();
        
        // Generate special buildings
        this.generateSpecialBuildings();
        
        // Generate environment
        this.generateEnvironment();
        
        // Spawn vehicles
        this.spawnVehicles();
        
        console.log('✅ World generated!');
        console.log(`   Buildings: ${this.buildings.length}`);
        console.log(`   Interactables: ${this.interactables.length}`);
    }
    
    /**
     * Create ground plane
     */
    createGround() {
        // Create procedural grass texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base grass color
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
        gradient.addColorStop(0, '#5A8C3A');
        gradient.addColorStop(0.5, '#4A7C2A');
        gradient.addColorStop(1, '#3A6C1A');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add grass detail
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const brightness = 60 + Math.random() * 40;
            ctx.fillStyle = `rgba(${brightness}, ${brightness + 40}, ${brightness - 20}, 0.3)`;
            ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 3);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);
        
        const groundGeom = new THREE.PlaneGeometry(
            CONFIG.world.size * 2,
            CONFIG.world.size * 2,
            50,
            50
        );
        
        // Add slight height variation
        const positions = groundGeom.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const noise = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5;
            positions.setZ(i, noise);
        }
        groundGeom.computeVertexNormals();
        
        const groundMat = new THREE.MeshLambertMaterial({ 
            map: texture,
            color: 0x88AA66
        });
        
        this.ground = new THREE.Mesh(groundGeom, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.game.scene.add(this.ground);
    }
    
    /**
     * Create sky dome
     */
    createSky() {
        const skyGeom = new THREE.SphereGeometry(CONFIG.world.size * 1.5, 32, 32);
        
        // Sky gradient texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#1E90FF');
        gradient.addColorStop(0.4, '#87CEEB');
        gradient.addColorStop(0.7, '#B0E0E6');
        gradient.addColorStop(1, '#F0F8FF');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 150;
            const w = 30 + Math.random() * 50;
            const h = 10 + Math.random() * 20;
            ctx.beginPath();
            ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const skyTexture = new THREE.CanvasTexture(canvas);
        
        const skyMat = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeom, skyMat);
        this.game.scene.add(sky);
        this.sky = sky;
    }
    
    /**
     * Generate road network
     */
    generateRoads() {
        // Main roads (grid pattern)
        const mainRoadSpacing = 60;
        const roadCount = Math.floor(CONFIG.world.size / mainRoadSpacing);
        
        for (let i = -roadCount; i <= roadCount; i++) {
            // Horizontal roads
            this.roadNetwork.createRoad(
                new THREE.Vector3(-CONFIG.world.size, 0, i * mainRoadSpacing),
                new THREE.Vector3(CONFIG.world.size, 0, i * mainRoadSpacing),
                8
            );
            
            // Vertical roads
            this.roadNetwork.createRoad(
                new THREE.Vector3(i * mainRoadSpacing, 0, -CONFIG.world.size),
                new THREE.Vector3(i * mainRoadSpacing, 0, CONFIG.world.size),
                8
            );
        }
        
        // Secondary roads
        const secondarySpacing = 30;
        for (let i = -roadCount * 2; i <= roadCount * 2; i++) {
            if (i % 2 !== 0) {
                this.roadNetwork.createRoad(
                    new THREE.Vector3(-CONFIG.world.size * 0.7, 0, i * secondarySpacing),
                    new THREE.Vector3(CONFIG.world.size * 0.7, 0, i * secondarySpacing),
                    5
                );
            }
        }
        
        // Diagonal roads
        this.roadNetwork.createRoad(
            new THREE.Vector3(-CONFIG.world.size * 0.8, 0, -CONFIG.world.size * 0.8),
            new THREE.Vector3(CONFIG.world.size * 0.8, 0, CONFIG.world.size * 0.8),
            6
        );
        
        this.roadNetwork.createRoad(
            new THREE.Vector3(-CONFIG.world.size * 0.8, 0, CONFIG.world.size * 0.8),
            new THREE.Vector3(CONFIG.world.size * 0.8, 0, -CONFIG.world.size * 0.8),
            6
        );
    }
    
    /**
     * Generate city center
     */
    generateCityCenter() {
        const centerX = 0;
        const centerZ = 0;
        const radius = 80;
        
        // Central plaza
        const plazaGeom = new THREE.CircleGeometry(30, 32);
        const plazaMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
        const plaza = new THREE.Mesh(plazaGeom, plazaMat);
        plaza.rotation.x = -Math.PI / 2;
        plaza.position.set(centerX, 0.02, centerZ);
        this.game.scene.add(plaza);
        
        // Central monument
        const monument = this.buildingFactory.createMonument(centerX, centerZ);
        this.buildings.push(monument);
        
        // Government buildings
        const govBuilding = this.buildingFactory.createGovernmentBuilding(
            centerX + 40, centerZ - 30, 'ГОСУСЛУГИ'
        );
        this.buildings.push(govBuilding);
        this.interactables.push(govBuilding);
        
        // Sberbank
        const bank = this.buildingFactory.createCommercialBuilding(
            centerX - 45, centerZ - 25, 'СБЕРБАНК', 0x00AA00
        );
        this.buildings.push(bank);
        this.interactables.push(bank);
        
        // Post office
        const post = this.buildingFactory.createCommercialBuilding(
            centerX + 50, centerZ + 35, 'ПОЧТА РОССИИ', 0x0044AA
        );
        this.buildings.push(post);
        this.interactables.push(post);
        
        // Shopping center
        const mall = this.buildingFactory.createShoppingCenter(
            centerX - 55, centerZ + 40
        );
        this.buildings.push(mall);
        this.interactables.push(mall);
        
        // Tall office buildings
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const dist = 50 + Math.random() * 20;
            const x = centerX + Math.cos(angle) * dist;
            const z = centerZ + Math.sin(angle) * dist;
            
            const height = 20 + Math.random() * 30;
            const building = this.buildingFactory.createOfficeBuilding(x, z, height);
            this.buildings.push(building);
        }
        
        // Flags around plaza
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * 25;
            const z = centerZ + Math.sin(angle) * 25;
            this.environmentObjects.createFlag(x, 0, z);
        }
    }
    
    /**
     * Generate residential district
     */
    generateResidentialDistrict() {
        const districtX = -150;
        const districtZ = -100;
        const size = 200;
        
        // Soviet panel buildings (panelki)
        const panelkiPositions = [
            { x: -120, z: -80 },
            { x: -160, z: -80 },
            { x: -200, z: -80 },
            { x: -120, z: -140 },
            { x: -160, z: -140 },
            { x: -200, z: -140 },
            { x: -240, z: -110 },
            { x: -80, z: -110 },
            { x: -140, z: -200 },
            { x: -180, z: -200 },
        ];
        
        for (const pos of panelkiPositions) {
            const height = 12 + Math.floor(Math.random() * 4) * 3; // 12, 15, 18, 21
            const building = this.buildingFactory.createPanelBuilding(
                pos.x,
                pos.z,
                height
            );
            this.buildings.push(building);
            
            // Add flag on some buildings
            if (Math.random() > 0.5) {
                this.environmentObjects.createFlag(pos.x, height, pos.z, 0.5);
            }
        }
        
        // Khrushchyovka (5-story buildings)
        for (let i = 0; i < 8; i++) {
            const x = districtX + (Math.random() - 0.5) * size;
            const z = districtZ + 50 + (Math.random() - 0.5) * 80;
            
            const building = this.buildingFactory.createKhrushchyovka(x, z);
            this.buildings.push(building);
        }
        
        // Playgrounds
        this.environmentObjects.createPlayground(-140, -110);
        this.environmentObjects.createPlayground(-180, -170);
        
        // Garages
        this.environmentObjects.createGarageComplex(-220, -170, 10);
    }
    
    /**
     * Generate industrial district
     */
    generateIndustrialDistrict() {
        const districtX = 180;
        const districtZ = -150;
        
        // Factory
        const factory = this.buildingFactory.createFactory(districtX, districtZ);
        this.buildings.push(factory);
        
        // Warehouses
        for (let i = 0; i < 4; i++) {
            const x = districtX + 50 + (i % 2) * 40;
            const z = districtZ - 30 + Math.floor(i / 2) * 50;
            const warehouse = this.buildingFactory.createWarehouse(x, z);
            this.buildings.push(warehouse);
        }
        
        // Smokestacks
        this.environmentObjects.createSmokestack(districtX + 20, districtZ + 20);
        this.environmentObjects.createSmokestack(districtX - 10, districtZ + 30);
        
        // Railroad crossing
        this.roadNetwork.createRailroad(
            new THREE.Vector3(districtX - 100, 0, districtZ),
            new THREE.Vector3(districtX + 100, 0, districtZ)
        );
    }
    
    /**
     * Generate park area
     */
    generateParkArea() {
        const parkX = 100;
        const parkZ = 150;
        const parkSize = 80;
        
        // Park path (circular)
        const pathGeom = new THREE.RingGeometry(25, 28, 32);
        const pathMat = new THREE.MeshLambertMaterial({ color: 0x666655 });
        const path = new THREE.Mesh(pathGeom, pathMat);
        path.rotation.x = -Math.PI / 2;
        path.position.set(parkX, 0.02, parkZ);
        this.game.scene.add(path);
        
        // Trees in park
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 10 + Math.random() * 35;
            const x = parkX + Math.cos(angle) * dist;
            const z = parkZ + Math.sin(angle) * dist;
            
            if (Math.random() > 0.5) {
                this.environmentObjects.createBirch(x, z);
            } else {
                this.environmentObjects.createPineTree(x, z);
            }
        }
        
        // Benches
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = parkX + Math.cos(angle) * 26;
            const z = parkZ + Math.sin(angle) * 26;
            this.environmentObjects.createBench(x, z, angle + Math.PI / 2);
        }
        
        // Fountain in center
        this.environmentObjects.createFountain(parkX, parkZ);
        
        // Park sign
        this.environmentObjects.createSign(
            parkX - 35, parkZ - 35,
            'ПАРК ПОБЕДЫ',
            Math.PI / 4
        );
    }
    
    /**
     * Generate outskirts
     */
    generateOutskirts() {
        // Scatter trees and objects around the edges
        const worldSize = CONFIG.world.size;
        
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = worldSize * 0.6 + Math.random() * worldSize * 0.35;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            
            // Mostly birch trees
            if (Math.random() > 0.3) {
                this.environmentObjects.createBirch(x, z);
            } else {
                this.environmentObjects.createPineTree(x, z);
            }
        }
        
        // Rural houses
        const ruralPositions = [
            { x: 300, z: 200 },
            { x: 320, z: 250 },
            { x: -300, z: 200 },
            { x: -280, z: 180 },
            { x: 250, z: -300 },
            { x: -250, z: -280 },
        ];
        
        for (const pos of ruralPositions) {
            const house = this.buildingFactory.createRuralHouse(pos.x, pos.z);
            this.buildings.push(house);
        }
        
        // Dachas (summer houses)
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = worldSize * 0.7 + Math.random() * worldSize * 0.2;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            
            const dacha = this.buildingFactory.createDacha(x, z);
            this.buildings.push(dacha);
        }
    }
    
    /**
     * Generate special buildings (including new ones)
     */
    generateSpecialBuildings() {
        // Fertility Enhancement Center (Центр повышения рождаемости)
        const fertilityCenter = this.buildingFactory.createFertilityCenter(-80, 80);
        this.buildings.push(fertilityCenter);
        this.interactables.push(fertilityCenter);
        
        // Military recruitment office with banners
        const militaryOffice = this.buildingFactory.createMilitaryOffice(60, -80);
        this.buildings.push(militaryOffice);
        this.interactables.push(militaryOffice);
        
        // Shawarma stands
        const shawarmaPositions = [
            { x: 15, z: 15 },
            { x: -25, z: 45 },
            { x: 55, z: -25 },
            { x: -70, z: -50 },
            { x: 120, z: 80 },
            { x: -130, z: -130 },
        ];
        
        for (const pos of shawarmaPositions) {
            const stand = this.buildingFactory.createShawarmaStand(pos.x, pos.z);
            this.interactables.push(stand);
        }
        
        // Pyaterochka stores
        const pyaterochkaPositions = [
            { x: -35, z: 70 },
            { x: 90, z: -60 },
            { x: -160, z: -60 },
        ];
        
        for (const pos of pyaterochkaPositions) {
            const store = this.buildingFactory.createCommercialBuilding(
                pos.x, pos.z, 'ПЯТЁРОЧКА', 0xDD0000
            );
            this.buildings.push(store);
            this.interactables.push(store);
        }
        
        // Magnit stores
        const magnitPositions = [
            { x: 70, z: 50 },
            { x: -90, z: -100 },
        ];
        
        for (const pos of magnitPositions) {
            const store = this.buildingFactory.createCommercialBuilding(
                pos.x, pos.z, 'МАГНИТ', 0xFF0066
            );
            this.buildings.push(store);
            this.interactables.push(store);
        }
        
        // Church
        const church = this.buildingFactory.createChurch(150, 80);
        this.buildings.push(church);
        
        // School
        const school = this.buildingFactory.createSchool(-100, 150);
        this.buildings.push(school);
        
        // Hospital
        const hospital = this.buildingFactory.createHospital(180, 50);
        this.buildings.push(hospital);
        this.interactables.push(hospital);
        
        // Police station
        const police = this.buildingFactory.createPoliceStation(-60, -150);
        this.buildings.push(police);
        
        // Gas station
        const gasStation = this.buildingFactory.createGasStation(100, -120);
        this.buildings.push(gasStation);
        this.interactables.push(gasStation);
        
        // Скуфуслуги (meme office)
        const skufuslugi = this.buildingFactory.createMemeBuilding(
            -30, -50, 'СКУФУСЛУГИ', 0x888888
        );
        this.buildings.push(skufuslugi);
        this.interactables.push(skufuslugi);
    }
    
    /**
     * Generate environment objects
     */
    generateEnvironment() {
        // Street lights along roads
        const lightSpacing = 25;
        for (let x = -CONFIG.world.size; x <= CONFIG.world.size; x += 60) {
            for (let z = -CONFIG.world.size; z <= CONFIG.world.size; z += lightSpacing) {
                if (Math.random() > 0.3) {
                    this.environmentObjects.createStreetLight(x + 4, z);
                }
            }
        }
        
        // Benches around the city
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
            const z = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
            this.environmentObjects.createBench(x, z, Math.random() * Math.PI * 2);
        }
        
        // Trash cans
        for (let i = 0; i < 40; i++) {
            const x = (Math.random() - 0.5) * CONFIG.world.size * 1.2;
            const z = (Math.random() - 0.5) * CONFIG.world.size * 1.2;
            this.environmentObjects.createTrashCan(x, z);
        }
        
        // Bus stops
        const busStopPositions = [
            { x: 0, z: 30 },
            { x: 60, z: 0 },
            { x: -60, z: 0 },
            { x: 0, z: -60 },
            { x: -120, z: -60 },
            { x: 120, z: 60 },
        ];
        
        for (const pos of busStopPositions) {
            this.environmentObjects.createBusStop(pos.x, pos.z);
        }
        
        // Advertising billboards (including military contract ads)
        this.createAdvertisingBillboards();
        
        // Random flags
        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - 0.5) * CONFIG.world.size * 1.6;
            const z = (Math.random() - 0.5) * CONFIG.world.size * 1.6;
            this.environmentObjects.createFlag(x, 0, z);
        }
    }
    
    /**
     * Create advertising billboards with military contract ads
     */
    createAdvertisingBillboards() {
        const billboardPositions = [
            { x: 30, z: 60, rot: 0 },
            { x: -50, z: 30, rot: Math.PI / 2 },
            { x: 80, z: -40, rot: Math.PI },
            { x: -100, z: -80, rot: -Math.PI / 4 },
            { x: 150, z: 100, rot: Math.PI / 3 },
            { x: -150, z: 50, rot: -Math.PI / 6 },
            { x: 0, z: -100, rot: 0 },
            { x: 200, z: -50, rot: Math.PI / 2 },
        ];
        
        const ads = [
            { text: 'КОНТРАКТ НА СЛУЖБУ', subtext: 'ЗВОНИ: 8-800-222-22-22', color: '#006400' },
            { text: 'ЗАЩИТИ РОДИНУ', subtext: 'СТАНЬ КОНТРАКТНИКОМ', color: '#8B0000' },
            { text: 'СЛУЖБА ПО КОНТРАКТУ', subtext: 'ДОСТОЙНАЯ ЗАРПЛАТА', color: '#00008B' },
            { text: 'ПРИСОЕДИНЯЙСЯ!', subtext: 'ВОЕННАЯ СЛУЖБА', color: '#2F4F4F' },
            { text: 'РОССИЯ ЗОВЁТ', subtext: 'КОНТРАКТНАЯ СЛУЖБА', color: '#4B0082' },
            { text: 'ШАУРМА 150₽', subtext: 'ВКУСНО И ТОЧКА', color: '#FF4500' },
            { text: 'ПЯТЁРОЧКА', subtext: 'ВЫГОДНО РЯДОМ', color: '#DD0000' },
            { text: 'СБЕРБАНК', subtext: 'ВСЕГДА РЯДОМ', color: '#00AA00' },
        ];
        
        for (let i = 0; i < billboardPositions.length; i++) {
            const pos = billboardPositions[i];
            const ad = ads[i % ads.length];
            this.environmentObjects.createBillboard(
                pos.x, pos.z, pos.rot,
                ad.text, ad.subtext, ad.color
            );
        }
    }
    
    /**
     * Spawn vehicles around the world
     */
    spawnVehicles() {
        const vehiclePositions = [
            { x: 10, z: 10, rot: Math.PI / 4 },
            { x: -20, z: 25, rot: Math.PI },
            { x: 40, z: 10, rot: -Math.PI / 2 },
            { x: -40, z: -40, rot: 0 },
            { x: 25, z: -55, rot: Math.PI / 3 },
            { x: -80, z: 30, rot: Math.PI / 6 },
            { x: 100, z: -30, rot: -Math.PI / 4 },
            { x: -120, z: -90, rot: Math.PI / 2 },
            { x: 70, z: 80, rot: 0 },
            { x: -60, z: 120, rot: Math.PI },
            { x: 150, z: 30, rot: -Math.PI / 3 },
            { x: -150, z: -50, rot: Math.PI / 4 },
            { x: 200, z: 100, rot: 0 },
            { x: -180, z: 80, rot: Math.PI / 2 },
            { x: 80, z: -150, rot: -Math.PI / 6 },
        ];
        
        const vehicleTypes = [
            VEHICLE_TYPES.LADA_2107,
            VEHICLE_TYPES.LADA_GRANTA,
            VEHICLE_TYPES.LADA_NIVA
        ];
        
        for (const pos of vehiclePositions) {
            const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
            this.game.vehicleManager.spawnVehicle(
                type,
                new THREE.Vector3(pos.x, 0.32, pos.z),
                pos.rot
            );
        }
    }
    
    /**
     * Get all interactable objects
     */
    getInteractables() {
        return this.interactables;
    }
    
    /**
     * Update world (LOD, streaming, etc.)
     */
    update(delta, playerPosition) {
        // Update environment animations
        this.environmentObjects.update(delta);
        
        // Could implement LOD or chunk loading here
    }
    
    /**
     * Dispose world
     */
    dispose() {
        // Dispose all buildings
        for (const building of this.buildings) {
            if (building.mesh) {
                this.game.scene.remove(building.mesh);
                building.mesh.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        }
        
        this.buildings = [];
        this.interactables = [];
        
        // Dispose roads
        this.roadNetwork.dispose();
        
        // Dispose environment
        this.environmentObjects.dispose();
    }
}

export default WorldGenerator;