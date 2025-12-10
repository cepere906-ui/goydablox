/**
 * ГОЙДАБЛОКС - Building Factory
 * Creates various types of buildings for the game world
 */

import * as THREE from 'three';
import { CONFIG, COLORS, BUILDING_TYPES } from '../config/GameConfig.js';

export class BuildingFactory {
    constructor(game) {
        this.game = game;
        
        // Shared materials
        this.materials = {
            concrete: new THREE.MeshLambertMaterial({ color: 0xCCCCBB }),
            brick: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            glass: new THREE.MeshBasicMaterial({ 
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.6
            }),
            windowLit: new THREE.MeshBasicMaterial({ color: 0xFFFF99 }),
            windowDark: new THREE.MeshBasicMaterial({ color: 0x333344 }),
            metal: new THREE.MeshStandardMaterial({ 
                color: 0x888888,
                metalness: 0.6,
                roughness: 0.4
            }),
            roof: new THREE.MeshLambertMaterial({ color: 0x444444 }),
            wood: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
        };
    }
    
    /**
     * Create a sign texture
     */
    createSignTexture(text, bgColor = '#FFFFFF', textColor = '#000000', width = 256, height = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = textColor;
        ctx.font = `bold ${Math.floor(height * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    /**
     * Add collision to building
     */
    addCollision(building, width, depth, height) {
        const position = building.position || building.mesh?.position || new THREE.Vector3();
        
        const collider = {
            position: position,
            collider: {
                type: 'box',
                halfSize: new THREE.Vector3(width / 2, height / 2, depth / 2)
            },
            mesh: building.mesh || building
        };
        
        this.game.physicsEngine.addStaticBody(collider);
        
        building.userData = {
            ...building.userData,
            minX: position.x - width / 2,
            maxX: position.x + width / 2,
            minZ: position.z - depth / 2,
            maxZ: position.z + depth / 2,
            height: height
        };
    }
    
    /**
     * Create Soviet panel building (Panelka)
     */
    createPanelBuilding(x, z, height = 15) {
        const group = new THREE.Group();
        const width = 40;
        const depth = 12;
        const floors = Math.floor(height / 3);
        
        // Main building
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const body = new THREE.Mesh(bodyGeom, this.materials.concrete);
        body.position.y = height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Windows
        const windowWidth = 1.2;
        const windowHeight = 1.5;
        const windowSpacingX = 3;
        const windowSpacingY = 3;
        
        for (let floor = 0; floor < floors; floor++) {
            for (let wx = -width / 2 + 2; wx < width / 2 - 1; wx += windowSpacingX) {
                const windowMat = Math.random() > 0.3 ? this.materials.windowLit : this.materials.windowDark;
                const windowGeom = new THREE.BoxGeometry(windowWidth, windowHeight, 0.1);
                
                // Front windows
                const windowFront = new THREE.Mesh(windowGeom, windowMat);
                windowFront.position.set(wx, floor * windowSpacingY + 2, depth / 2 + 0.05);
                group.add(windowFront);
                
                // Back windows
                const windowBack = new THREE.Mesh(windowGeom, windowMat);
                windowBack.position.set(wx, floor * windowSpacingY + 2, -depth / 2 - 0.05);
                group.add(windowBack);
            }
        }
        
        // Balconies
        const balconyGeom = new THREE.BoxGeometry(2, 0.1, 1);
        const balconyRailGeom = new THREE.BoxGeometry(2, 0.8, 0.05);
        const balconyMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
        
        for (let floor = 1; floor < floors; floor++) {
            for (let bx = -width / 2 + 5; bx < width / 2 - 3; bx += 9) {
                if (Math.random() > 0.3) {
                    const balcony = new THREE.Mesh(balconyGeom, balconyMat);
                    balcony.position.set(bx, floor * windowSpacingY + 1, depth / 2 + 0.5);
                    group.add(balcony);
                    
                    const rail = new THREE.Mesh(balconyRailGeom, balconyMat);
                    rail.position.set(bx, floor * windowSpacingY + 1.4, depth / 2 + 1);
                    group.add(rail);
                }
            }
        }
        
        // Roof
        const roofGeom = new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5);
        const roof = new THREE.Mesh(roofGeom, this.materials.roof);
        roof.position.y = height + 0.25;
        group.add(roof);
        
        // Entrance
        const entranceGeom = new THREE.BoxGeometry(3, 3, 1);
        const entranceMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const entrance = new THREE.Mesh(entranceGeom, entranceMat);
        entrance.position.set(0, 1.5, depth / 2 + 0.5);
        group.add(entrance);
        
        // Door
        const doorGeom = new THREE.BoxGeometry(1.5, 2.2, 0.1);
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x4A3728 });
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 1.1, depth / 2 + 1.05);
        group.add(door);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, width, depth, height);
        
        return { mesh: group, type: BUILDING_TYPES.RESIDENTIAL };
    }
    
    /**
     * Create Khrushchyovka (5-story Soviet building)
     */
    createKhrushchyovka(x, z) {
        const group = new THREE.Group();
        const width = 30;
        const depth = 10;
        const height = 15;
        
        // Main building - slightly yellowish concrete
        const khrushMat = new THREE.MeshLambertMaterial({ color: 0xD4C896 });
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const body = new THREE.Mesh(bodyGeom, khrushMat);
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Windows (uniform pattern)
        for (let floor = 0; floor < 5; floor++) {
            for (let wx = -width / 2 + 2; wx < width / 2 - 1; wx += 2.5) {
                const windowMat = Math.random() > 0.4 ? this.materials.windowLit : this.materials.windowDark;
                const windowGeom = new THREE.BoxGeometry(1, 1.3, 0.1);
                
                const window = new THREE.Mesh(windowGeom, windowMat);
                window.position.set(wx, floor * 3 + 2, depth / 2 + 0.05);
                group.add(window);
            }
        }
        
        // Flat roof
        const roofGeom = new THREE.BoxGeometry(width, 0.3, depth);
        const roof = new THREE.Mesh(roofGeom, this.materials.roof);
        roof.position.y = height + 0.15;
        group.add(roof);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, width, depth, height);
        
        return { mesh: group, type: BUILDING_TYPES.RESIDENTIAL };
    }
    
    /**
     * Create government building
     */
    createGovernmentBuilding(x, z, name) {
        const group = new THREE.Group();
        const width = 25;
        const depth = 15;
        const height = 12;
        
        // Main building
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x0039A6 });
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Windows (formal grid)
        for (let floor = 0; floor < 4; floor++) {
            for (let wx = -width / 2 + 2; wx < width / 2 - 1; wx += 3) {
                const windowGeom = new THREE.BoxGeometry(1.8, 2, 0.1);
                const window = new THREE.Mesh(windowGeom, this.materials.glass);
                window.position.set(wx, floor * 3 + 2.5, depth / 2 + 0.05);
                group.add(window);
            }
        }
        
        // Columns at entrance
        const columnGeom = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
        const columnMat = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        
        for (let i = -2; i <= 2; i++) {
            const column = new THREE.Mesh(columnGeom, columnMat);
            column.position.set(i * 2, 3, depth / 2 + 1);
            group.add(column);
        }
        
        // Portico roof
        const porticoGeom = new THREE.BoxGeometry(12, 0.5, 3);
        const portico = new THREE.Mesh(porticoGeom, columnMat);
        portico.position.set(0, 6.25, depth / 2 + 1);
        group.add(portico);
        
        // Sign
        const signTexture = this.createSignTexture(name, '#FFFFFF', '#0039A6');
        const signGeom = new THREE.BoxGeometry(8, 1.5, 0.1);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, height + 1, depth / 2 + 0.1);
        group.add(sign);
        
        // Russian flag
        this.addFlagToBuilding(group, 0, height + 2, 0);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, width, depth, height);
        
        return { 
            mesh: group, 
            position: group.position,
            type: BUILDING_TYPES.GOVERNMENT,
            interactionText: 'Войти в ' + name + ' [E]',
            onInteract: (player) => {
                this.game.uiManager?.showNotification('Добро пожаловать в ' + name + '!');
            }
        };
    }
    
    /**
     * Create commercial building with sign
     */
    createCommercialBuilding(x, z, name, color) {
        const group = new THREE.Group();
        const width = 15;
        const depth = 10;
        const height = 6;
        
        // Main building
        const bodyMat = new THREE.MeshLambertMaterial({ color: color });
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Large front windows
        const windowGeom = new THREE.BoxGeometry(width - 2, height - 2, 0.1);
        const window = new THREE.Mesh(windowGeom, this.materials.glass);
        window.position.set(0, height / 2, depth / 2 + 0.05);
        group.add(window);
        
        // Sign
        const signTexture = this.createSignTexture(name, '#FFFFFF', '#000000');
        const signGeom = new THREE.BoxGeometry(width - 1, 2, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, height + 1.2, depth / 2);
        group.add(sign);
        
        // Door
        const doorGeom = new THREE.BoxGeometry(2, 3, 0.1);
        const doorMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 1.5, depth / 2 + 0.1);
        group.add(door);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, width, depth, height);
        
        return { 
            mesh: group,
            position: group.position,
            type: BUILDING_TYPES.COMMERCIAL,
            name: name,
            interactionText: 'Войти в ' + name + ' [E]',
            onInteract: (player) => {
                this.game.uiManager?.showShopMenu({ name, type: 'store' });
            }
        };
    }
    
    /**
     * Create shopping center
     */
    createShoppingCenter(x, z) {
        const group = new THREE.Group();
        const width = 40;
        const depth = 30;
        const height = 12;
        
        // Main building
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xDDDDDD });
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Glass facade
        const glassGeom = new THREE.BoxGeometry(width - 2, height - 1, 0.2);
        const glass = new THREE.Mesh(glassGeom, this.materials.glass);
        glass.position.set(0, height / 2, depth / 2 + 0.1);
        group.add(glass);
        
        // Sign
        const signTexture = this.createSignTexture('ТЦ ГОЙДА', '#FF6600', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(15, 3, 0.3);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, height + 2, depth / 2);
        group.add(sign);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, width, depth, height);
        
        return { 
            mesh: group, 
            position: group.position,
            type: BUILDING_TYPES.COMMERCIAL,
            name: 'ТЦ ГОЙДА'
        };
    }
    
    /**
     * Create office building
     */
    createOfficeBuilding(x, z, height = 25) {
        const group = new THREE.Group();
        const width = 15;
        const depth = 15;
        
        // Main building
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x667788 });
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Glass windows in grid pattern
        const floors = Math.floor(height / 3);
        for (let floor = 0; floor < floors; floor++) {
            for (let side = 0; side < 4; side++) {
                for (let w = -2; w <= 2; w++) {
                    const windowGeom = new THREE.BoxGeometry(2, 2, 0.1);
                    const window = new THREE.Mesh(windowGeom, this.materials.glass);
                    
                    const y = floor * 3 + 2;
                    switch (side) {
                        case 0: window.position.set(w * 2.5, y, depth / 2 + 0.05); break;
                        case 1: window.position.set(w * 2.5, y, -depth / 2 - 0.05); break;
                        case 2: 
                            window.position.set(width / 2 + 0.05, y, w * 2.5);
                            window.rotation.y = Math.PI / 2;
                            break;
                        case 3:
                            window.position.set(-width / 2 - 0.05, y, w * 2.5);
                            window.rotation.y = Math.PI / 2;
                            break;
                    }
                    group.add(window);
                }
            }
        }
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, width, depth, height);
        
        return { mesh: group, type: BUILDING_TYPES.COMMERCIAL };
    }
    
    /**
     * Create monument
     */
    createMonument(x, z) {
        const group = new THREE.Group();
        
        // Base platform
        const baseGeom = new THREE.CylinderGeometry(8, 10, 1, 32);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = 0.5;
        group.add(base);
        
        // Steps
        for (let i = 0; i < 3; i++) {
            const stepGeom = new THREE.CylinderGeometry(6 - i, 6.5 - i, 0.3, 32);
            const step = new THREE.Mesh(stepGeom, baseMat);
            step.position.y = 1 + i * 0.3;
            group.add(step);
        }
        
        // Pedestal
        const pedestalGeom = new THREE.BoxGeometry(3, 4, 3);
        const pedestalMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
        pedestal.position.y = 4;
        group.add(pedestal);
        
        // Statue (abstract figure)
        const bronzeMat = new THREE.MeshStandardMaterial({
            color: 0xCD7F32,
            metalness: 0.7,
            roughness: 0.3
        });
        
        // Body
        const bodyGeom = new THREE.BoxGeometry(1.2, 3.5, 0.8);
        const body = new THREE.Mesh(bodyGeom, bronzeMat);
        body.position.y = 8;
        group.add(body);
        
        // Head
        const headGeom = new THREE.SphereGeometry(0.5, 16, 16);
        const head = new THREE.Mesh(headGeom, bronzeMat);
        head.position.y = 10;
        group.add(head);
        
        // Arm pointing forward
        const armGeom = new THREE.BoxGeometry(2, 0.3, 0.3);
        const arm = new THREE.Mesh(armGeom, bronzeMat);
        arm.position.set(1, 8.5, 0.4);
        arm.rotation.z = -0.3;
        group.add(arm);
        
        // Plaque
        const plaqueTexture = this.createSignTexture('ГОЙДА!', '#CD7F32', '#000000', 128, 32);
        const plaqueGeom = new THREE.BoxGeometry(2, 0.5, 0.1);
        const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTexture });
        const plaque = new THREE.Mesh(plaqueGeom, plaqueMat);
        plaque.position.set(0, 2.5, 1.55);
        group.add(plaque);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 6, 6, 11);
        
        return { mesh: group, type: BUILDING_TYPES.SPECIAL };
    }
    
    /**
     * Create shawarma stand
     */
    createShawarmaStand(x, z) {
        const group = new THREE.Group();
        
        // Main kiosk
        const kioskGeom = new THREE.BoxGeometry(4, 3, 3);
        const kioskMat = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
        const kiosk = new THREE.Mesh(kioskGeom, kioskMat);
        kiosk.position.y = 1.5;
        kiosk.castShadow = true;
        group.add(kiosk);
        
        // Window/counter
        const counterGeom = new THREE.BoxGeometry(2.5, 1.5, 0.1);
        const counterMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const counter = new THREE.Mesh(counterGeom, counterMat);
        counter.position.set(0, 1.8, 1.55);
        group.add(counter);
        
        // Counter shelf
        const shelfGeom = new THREE.BoxGeometry(2.5, 0.1, 0.5);
        const shelfMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const shelf = new THREE.Mesh(shelfGeom, shelfMat);
        shelf.position.set(0, 1, 1.75);
        group.add(shelf);
        
        // Sign
        const signTexture = this.createSignTexture('ШАУРМА 150₽', '#FF0000', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(3.5, 0.8, 0.1);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, 3.5, 1.5);
        group.add(sign);
        
        // Menu board
        const menuTexture = this.createSignTexture('МЕНЮ', '#FFFFFF', '#000000', 128, 128);
        const menuGeom = new THREE.BoxGeometry(0.8, 1, 0.05);
        const menuMat = new THREE.MeshBasicMaterial({ map: menuTexture });
        const menu = new THREE.Mesh(menuGeom, menuMat);
        menu.position.set(1.5, 2, 1.55);
        group.add(menu);
        
        // Döner spit representation
        const spitGeom = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8);
        const spitMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const spit = new THREE.Mesh(spitGeom, spitMat);
        spit.position.set(-1, 2, 0);
        group.add(spit);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 4, 3, 3);
        
        return { 
            mesh: group,
            position: group.position,
            type: 'shawarma',
            interactionText: 'Купить шаурму 150₽ [E]'
        };
    }
    
    /**
     * Create Fertility Enhancement Center
     */
    createFertilityCenter(x, z) {
        const group = new THREE.Group();
        const width = 20;
        const depth = 15;
        const height = 10;
        
        // Main building - pink/rose color
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Windows with heart patterns
        for (let floor = 0; floor < 3; floor++) {
            for (let wx = -width / 2 + 3; wx < width / 2 - 2; wx += 4) {
                const windowGeom = new THREE.BoxGeometry(2, 2.5, 0.1);
                const window = new THREE.Mesh(windowGeom, this.materials.glass);
                window.position.set(wx, floor * 3 + 2.5, depth / 2 + 0.05);
                group.add(window);
            }
        }
        
        // Main sign
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const ctx = signCanvas.getContext('2d');
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ЦЕНТР ПОВЫШЕНИЯ', 256, 45);
        ctx.fillText('РОЖДАЕМОСТИ', 256, 85);
        
        const signTexture = new THREE.CanvasTexture(signCanvas);
        const signGeom = new THREE.BoxGeometry(12, 3, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, height + 2, depth / 2);
        group.add(sign);
        
        // Heart decoration
        const heartShape = new THREE.Shape();
        const heartX = 0, heartY = 0;
        heartShape.moveTo(heartX + 0.5, heartY + 0.5);
        heartShape.bezierCurveTo(heartX + 0.5, heartY + 0.5, heartX + 0.4, heartY, heartX, heartY);
        heartShape.bezierCurveTo(heartX - 0.6, heartY, heartX - 0.6, heartY + 0.7, heartX - 0.6, heartY + 0.7);
        heartShape.bezierCurveTo(heartX - 0.6, heartY + 1.1, heartX - 0.3, heartY + 1.54, heartX + 0.5, heartY + 1.9);
        heartShape.bezierCurveTo(heartX + 1.2, heartY + 1.54, heartX + 1.6, heartY + 1.1, heartX + 1.6, heartY + 0.7);
        heartShape.bezierCurveTo(heartX + 1.6, heartY + 0.7, heartX + 1.6, heartY, heartX + 1, heartY);
        heartShape.bezierCurveTo(heartX + 0.7, heartY, heartX + 0.5, heartY + 0.5, heartX + 0.5, heartY + 0.5);
        
        const heartGeom = new THREE.ShapeGeometry(heartShape);
        const heartMat = new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide });
        const heart = new THREE.Mesh(heartGeom, heartMat);
        heart.scale.set(1.5, 1.5, 1);
        heart.rotation.z = Math.PI;
        heart.position.set(0, height + 5.5, depth / 2 + 0.1);
        group.add(heart);
        
        // Stork decoration (simplified)
        const storkBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
        );
        storkBody.position.set(5, height + 3, depth / 2);
        storkBody.scale.set(1, 1.5, 0.8);
        group.add(storkBody);
        
        // Entrance with columns
        const columnGeom = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
        const columnMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        
        const leftColumn = new THREE.Mesh(columnGeom, columnMat);
        leftColumn.position.set(-2.5, 2.5, depth / 2 + 0.5);
        group.add(leftColumn);
        
        const rightColumn = new THREE.Mesh(columnGeom, columnMat);
        rightColumn.position.set(2.5, 2.5, depth / 2 + 0.5);
        group.add(rightColumn);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, width, depth, height);
        
        return { 
            mesh: group,
            position: group.position,
            type: 'fertility_center',
            interactionText: 'Войти в Центр [E]',
            onInteract: (player) => {
                this.game.uiManager?.showFertilityCenter();
            }
        };
    }
    
    /**
     * Create Military Office with recruitment banners
     */
    createMilitaryOffice(x, z) {
        const group = new THREE.Group();
        const width = 18;
        const depth = 12;
        const height = 8;
        
        // Main building - military green
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x4A5D23 });
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = height / 2;
        body.castShadow = true;
        group.add(body);
        
        // Windows
        for (let floor = 0; floor < 2; floor++) {
            for (let wx = -width / 2 + 2; wx < width / 2 - 1; wx += 3) {
                const windowGeom = new THREE.BoxGeometry(1.5, 1.8, 0.1);
                const window = new THREE.Mesh(windowGeom, this.materials.glass);
                window.position.set(wx, floor * 3 + 2.5, depth / 2 + 0.05);
                group.add(window);
            }
        }
        
        // Main sign
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const ctx = signCanvas.getContext('2d');
        ctx.fillStyle = '#2F4F2F';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ВОЕНКОМАТ', 256, 50);
        ctx.font = '20px Arial';
        ctx.fillText('Пункт отбора на контракт', 256, 90);
        
        const signTexture = new THREE.CanvasTexture(signCanvas);
        const signGeom = new THREE.BoxGeometry(10, 2.5, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, height + 1.5, depth / 2);
        group.add(sign);
        
        // Recruitment banner 1
        const banner1Canvas = document.createElement('canvas');
        banner1Canvas.width = 256;
        banner1Canvas.height = 512;
        const ctx1 = banner1Canvas.getContext('2d');
        ctx1.fillStyle = '#006400';
        ctx1.fillRect(0, 0, 256, 512);
        ctx1.fillStyle = '#FFFFFF';
        ctx1.font = 'bold 28px Arial';
        ctx1.textAlign = 'center';
        ctx1.fillText('КОНТРАКТ', 128, 80);
        ctx1.fillText('НА СЛУЖБУ', 128, 120);
        ctx1.font = '24px Arial';
        ctx1.fillText('Достойная', 128, 200);
        ctx1.fillText('зарплата', 128, 235);
        ctx1.fillText('от 200 000₽', 128, 290);
        ctx1.font = 'bold 20px Arial';
        ctx1.fillText('8-800-222-22-22', 128, 400);
        
        // Add Russian flag stripes
        ctx1.fillStyle = '#FFFFFF';
        ctx1.fillRect(20, 430, 216, 20);
        ctx1.fillStyle = '#0039A6';
        ctx1.fillRect(20, 450, 216, 20);
        ctx1.fillStyle = '#D52B1E';
        ctx1.fillRect(20, 470, 216, 20);
        
        const banner1Texture = new THREE.CanvasTexture(banner1Canvas);
        const banner1Geom = new THREE.BoxGeometry(3, 6, 0.1);
        const banner1Mat = new THREE.MeshBasicMaterial({ map: banner1Texture });
        const banner1 = new THREE.Mesh(banner1Geom, banner1Mat);
        banner1.position.set(-width / 2 - 0.1, 4, 0);
        banner1.rotation.y = Math.PI / 2;
        group.add(banner1);
        
        // Recruitment banner 2
        const banner2Canvas = document.createElement('canvas');
        banner2Canvas.width = 256;
        banner2Canvas.height = 512;
        const ctx2 = banner2Canvas.getContext('2d');
        ctx2.fillStyle = '#8B0000';
        ctx2.fillRect(0, 0, 256, 512);
        ctx2.fillStyle = '#FFFFFF';
        ctx2.font = 'bold 32px Arial';
        ctx2.textAlign = 'center';
        ctx2.fillText('ЗАЩИТИ', 128, 80);
        ctx2.fillText('РОДИНУ', 128, 130);
        ctx2.font = '22px Arial';
        ctx2.fillText('Стань', 128, 220);
        ctx2.fillText('контрактником!', 128, 260);
        ctx2.font = 'bold 24px Arial';
        ctx2.fillStyle = '#FFD700';
        ctx2.fillText('РОССИЯ', 128, 380);
        ctx2.fillText('ЗОВЁТ!', 128, 420);
        
        const banner2Texture = new THREE.CanvasTexture(banner2Canvas);
        const banner2Mat = new THREE.MeshBasicMaterial({ map: banner2Texture });
        const banner2 = new THREE.Mesh(banner1Geom, banner2Mat);
        banner2.position.set(width / 2 + 0.1, 4, 0);
        banner2.rotation.y = -Math.PI / 2;
        group.add(banner2);
        
        // Russian flag
        this.addFlagToBuilding(group, 0, height + 4, 0);
        
        // Star decoration
        const starShape = new THREE.Shape();
        const starPoints = 5;
        const outerRadius = 1;
        const innerRadius = 0.4;
        
        for (let i = 0; i < starPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / starPoints - Math.PI / 2;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            
            if (i === 0) {
                starShape.moveTo(px, py);
            } else {
                starShape.lineTo(px, py);
            }
        }
        starShape.closePath();
        
        const starGeom = new THREE.ShapeGeometry(starShape);
        const starMat = new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide });
        const star = new THREE.Mesh(starGeom, starMat);
        star.position.set(0, height + 5, depth / 2 + 0.1);
        group.add(star);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, width, depth, height);
        
        return { 
            mesh: group,
            position: group.position,
            type: BUILDING_TYPES.GOVERNMENT,
            interactionText: 'Войти в военкомат [E]',
            onInteract: (player) => {
                this.game.uiManager?.showMilitaryOffice();
            }
        };
    }
    
    /**
     * Add Russian flag to building
     */
    addFlagToBuilding(group, x, y, z, scale = 1) {
        const poleGeom = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 4 * scale, 8);
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(poleGeom, poleMat);
        pole.position.set(x, y + 2 * scale, z);
        group.add(pole);
        
        const flagHeight = 0.4 * scale;
        const flagWidth = 1.5 * scale;
        
        // White stripe
        const whiteGeom = new THREE.BoxGeometry(flagWidth, flagHeight, 0.05);
        const whiteMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const white = new THREE.Mesh(whiteGeom, whiteMat);
        white.position.set(x + flagWidth / 2, y + 3.8 * scale, z);
        group.add(white);
        
        // Blue stripe
        const blueGeom = new THREE.BoxGeometry(flagWidth, flagHeight, 0.05);
        const blueMat = new THREE.MeshLambertMaterial({ color: 0x0039A6 });
        const blue = new THREE.Mesh(blueGeom, blueMat);
        blue.position.set(x + flagWidth / 2, y + 3.4 * scale, z);
        group.add(blue);
        
        // Red stripe
        const redGeom = new THREE.BoxGeometry(flagWidth, flagHeight, 0.05);
        const redMat = new THREE.MeshLambertMaterial({ color: 0xD52B1E });
        const red = new THREE.Mesh(redGeom, redMat);
        red.position.set(x + flagWidth / 2, y + 3 * scale, z);
        group.add(red);
    }
    
    /**
     * Create meme building (Скуфуслуги etc)
     */
    createMemeBuilding(x, z, name, color) {
        const building = this.createCommercialBuilding(x, z, name, color);
        building.type = BUILDING_TYPES.SPECIAL;
        return building;
    }
    
    /**
     * Create factory
     */
    createFactory(x, z) {
        const group = new THREE.Group();
        
        // Main building
        const bodyGeom = new THREE.BoxGeometry(50, 15, 30);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 7.5;
        body.castShadow = true;
        group.add(body);
        
        // Sawtooth roof
        for (let i = 0; i < 5; i++) {
            const roofGeom = new THREE.BoxGeometry(10, 3, 30);
            const roof = new THREE.Mesh(roofGeom, this.materials.roof);
            roof.position.set(-20 + i * 10, 16.5, 0);
            roof.rotation.z = 0.2;
            group.add(roof);
        }
        
        // Sign
        const signTexture = this.createSignTexture('ЗАВОД', '#333333', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(15, 3, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, 20, 15);
        group.add(sign);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 50, 30, 18);
        
        return { mesh: group, type: BUILDING_TYPES.INDUSTRIAL };
    }
    
    /**
     * Create warehouse
     */
    createWarehouse(x, z) {
        const group = new THREE.Group();
        
        const bodyGeom = new THREE.BoxGeometry(20, 8, 15);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B8B8B });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 4;
        body.castShadow = true;
        group.add(body);
        
        // Roller door
        const doorGeom = new THREE.BoxGeometry(6, 6, 0.1);
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 3, 7.55);
        group.add(door);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 20, 15, 8);
        
        return { mesh: group, type: BUILDING_TYPES.INDUSTRIAL };
    }
    
    /**
     * Create church
     */
    createChurch(x, z) {
        const group = new THREE.Group();
        
        // Main building
        const bodyGeom = new THREE.BoxGeometry(15, 12, 20);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFFFFF0 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 6;
        body.castShadow = true;
        group.add(body);
        
        // Onion dome
        const domeGeom = new THREE.SphereGeometry(3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            metalness: 0.8,
            roughness: 0.2
        });
        const dome = new THREE.Mesh(domeGeom, domeMat);
        dome.position.y = 15;
        group.add(dome);
        
        // Cross
        const crossVertGeom = new THREE.BoxGeometry(0.2, 2, 0.2);
        const crossHorGeom = new THREE.BoxGeometry(1, 0.2, 0.2);
        const crossMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const crossVert = new THREE.Mesh(crossVertGeom, crossMat);
        crossVert.position.y = 19;
        group.add(crossVert);
        
        const crossHor = new THREE.Mesh(crossHorGeom, crossMat);
        crossHor.position.y = 19.5;
        group.add(crossHor);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 15, 20, 15);
        
        return { mesh: group, type: BUILDING_TYPES.SPECIAL };
    }
    
    /**
     * Create school
     */
    createSchool(x, z) {
        const group = new THREE.Group();
        
        const bodyGeom = new THREE.BoxGeometry(40, 12, 20);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xF5DEB3 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 6;
        body.castShadow = true;
        group.add(body);
        
        // Windows
        for (let floor = 0; floor < 4; floor++) {
            for (let wx = -17; wx <= 17; wx += 3.4) {
                const windowGeom = new THREE.BoxGeometry(2, 1.8, 0.1);
                const window = new THREE.Mesh(windowGeom, this.materials.glass);
                window.position.set(wx, floor * 3 + 2, 10.05);
                group.add(window);
            }
        }
        
        // Sign
        const signTexture = this.createSignTexture('ШКОЛА №1', '#0039A6', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(8, 1.5, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, 13, 10);
        group.add(sign);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 40, 20, 12);
        
        return { mesh: group, type: BUILDING_TYPES.SPECIAL };
    }
    
    /**
     * Create hospital
     */
    createHospital(x, z) {
        const group = new THREE.Group();
        
        const bodyGeom = new THREE.BoxGeometry(30, 15, 20);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 7.5;
        body.castShadow = true;
        group.add(body);
        
        // Red cross
        const crossVertGeom = new THREE.BoxGeometry(1, 4, 0.2);
        const crossHorGeom = new THREE.BoxGeometry(4, 1, 0.2);
        const crossMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        
        const crossVert = new THREE.Mesh(crossVertGeom, crossMat);
        crossVert.position.set(0, 12, 10.1);
        group.add(crossVert);
        
        const crossHor = new THREE.Mesh(crossHorGeom, crossMat);
        crossHor.position.set(0, 12, 10.1);
        group.add(crossHor);
        
        // Sign
        const signTexture = this.createSignTexture('БОЛЬНИЦА', '#FFFFFF', '#FF0000');
        const signGeom = new THREE.BoxGeometry(10, 2, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, 16, 10);
        group.add(sign);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 30, 20, 15);
        
        return { 
            mesh: group, 
            position: group.position,
            type: BUILDING_TYPES.SPECIAL,
            interactionText: 'Войти в больницу [E]'
        };
    }
    
    /**
     * Create police station
     */
    createPoliceStation(x, z) {
        const group = new THREE.Group();
        
        const bodyGeom = new THREE.BoxGeometry(20, 10, 15);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 5;
        body.castShadow = true;
        group.add(body);
        
        // Sign
        const signTexture = this.createSignTexture('ПОЛИЦИЯ', '#0000AA', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(8, 2, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, 11, 7.5);
        group.add(sign);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 20, 15, 10);
        
        return { mesh: group, type: BUILDING_TYPES.GOVERNMENT };
    }
    
    /**
     * Create gas station
     */
    createGasStation(x, z) {
        const group = new THREE.Group();
        
        // Canopy
        const canopyGeom = new THREE.BoxGeometry(20, 0.5, 15);
        const canopyMat = new THREE.MeshLambertMaterial({ color: 0xDD0000 });
        const canopy = new THREE.Mesh(canopyGeom, canopyMat);
        canopy.position.y = 5;
        group.add(canopy);
        
        // Pillars
        const pillarGeom = new THREE.BoxGeometry(0.5, 5, 0.5);
        const pillarMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const pillarPositions = [[-9, -6], [-9, 6], [9, -6], [9, 6]];
        
        for (const pos of pillarPositions) {
            const pillar = new THREE.Mesh(pillarGeom, pillarMat);
            pillar.position.set(pos[0], 2.5, pos[1]);
            group.add(pillar);
        }
        
        // Fuel pumps
        const pumpGeom = new THREE.BoxGeometry(0.8, 2, 0.5);
        const pumpMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        
        for (let i = -1; i <= 1; i += 2) {
            const pump = new THREE.Mesh(pumpGeom, pumpMat);
            pump.position.set(i * 4, 1, 0);
            group.add(pump);
        }
        
        // Shop building
        const shopGeom = new THREE.BoxGeometry(10, 4, 8);
        const shopMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const shop = new THREE.Mesh(shopGeom, shopMat);
        shop.position.set(0, 2, -12);
        group.add(shop);
        
        // Sign
        const signTexture = this.createSignTexture('ЛУКОЙЛ', '#FF0000', '#FFFFFF');
        const signGeom = new THREE.BoxGeometry(8, 2, 0.2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, 6, 0);
        group.add(sign);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 20, 15, 6);
        
        return { 
            mesh: group, 
            position: group.position,
            type: BUILDING_TYPES.COMMERCIAL,
            interactionText: 'Заправиться [E]'
        };
    }
    
    /**
     * Create rural house
     */
    createRuralHouse(x, z) {
        const group = new THREE.Group();
        
        // Main house
        const bodyGeom = new THREE.BoxGeometry(8, 4, 6);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 2;
        body.castShadow = true;
        group.add(body);
        
        // Roof
        const roofGeom = new THREE.ConeGeometry(6, 3, 4);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 5.5;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);
        
        // Windows
        const windowGeom = new THREE.BoxGeometry(1, 1, 0.1);
        const windowMat = new THREE.MeshBasicMaterial({ color: 0x87CEEB });
        
        const window1 = new THREE.Mesh(windowGeom, windowMat);
        window1.position.set(-2, 2, 3.05);
        group.add(window1);
        
        const window2 = new THREE.Mesh(windowGeom, windowMat);
        window2.position.set(2, 2, 3.05);
        group.add(window2);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 8, 6, 6);
        
        return { mesh: group, type: BUILDING_TYPES.RESIDENTIAL };
    }
    
    /**
     * Create dacha (summer house)
     */
    createDacha(x, z) {
        const group = new THREE.Group();
        
        // Main structure
        const bodyGeom = new THREE.BoxGeometry(6, 3.5, 5);
        const colors = [0x228B22, 0x4169E1, 0x8B0000, 0xFFD700];
        const bodyMat = new THREE.MeshLambertMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)] 
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 1.75;
        body.castShadow = true;
        group.add(body);
        
        // Roof
        const roofGeom = new THREE.BoxGeometry(7, 0.3, 6);
        const roof = new THREE.Mesh(roofGeom, this.materials.roof);
        roof.position.y = 3.65;
        roof.rotation.x = 0.1;
        group.add(roof);
        
        group.position.set(x, 0, z);
        this.game.scene.add(group);
        this.addCollision(group, 6, 5, 4);
        
        return { mesh: group, type: BUILDING_TYPES.RESIDENTIAL };
    }
}

export default BuildingFactory;