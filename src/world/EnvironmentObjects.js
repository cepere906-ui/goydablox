/**
 * ГОЙДАБЛОКС - Environment Objects
 * Trees, benches, flags, street lights, and other environmental objects
 */

import * as THREE from 'three';
import { COLORS } from '../config/GameConfig.js';

export class EnvironmentObjects {
    constructor(game) {
        this.game = game;
        this.objects = [];
        this.animatedObjects = [];
        
        // Shared materials
        this.materials = {
            trunk: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            birchTrunk: new THREE.MeshLambertMaterial({ color: 0xF5F5DC }),
            birchStripe: new THREE.MeshLambertMaterial({ color: 0x222222 }),
            leaves: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
            pineLeaves: new THREE.MeshLambertMaterial({ color: 0x0B5A1A }),
            wood: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            metal: new THREE.MeshLambertMaterial({ color: 0x666666 }),
            concrete: new THREE.MeshLambertMaterial({ color: 0x888888 }),
            flagWhite: new THREE.MeshLambertMaterial({ color: COLORS.white }),
            flagBlue: new THREE.MeshLambertMaterial({ color: COLORS.blue }),
            flagRed: new THREE.MeshLambertMaterial({ color: COLORS.red })
        };
    }
    
    /**
     * Create birch tree
     */
    createBirch(x, z) {
        const tree = new THREE.Group();
        const height = 5 + Math.random() * 3;
        
        // Trunk
        const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, height, 8);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.birchTrunk);
        trunk.position.y = height / 2;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Black stripes on trunk
        const numStripes = Math.floor(height / 0.8);
        for (let i = 0; i < numStripes; i++) {
            const stripeGeom = new THREE.CylinderGeometry(
                0.17 - i * 0.005,
                0.27 - i * 0.01,
                0.08,
                8
            );
            const stripe = new THREE.Mesh(stripeGeom, this.materials.birchStripe);
            stripe.position.y = 0.5 + i * 0.8;
            tree.add(stripe);
        }
        
        // Leaves (multiple cone layers)
        for (let i = 0; i < 3; i++) {
            const radius = 2 - i * 0.4;
            const coneHeight = 2.5 - i * 0.3;
            const leavesGeom = new THREE.ConeGeometry(radius, coneHeight, 8);
            const leaves = new THREE.Mesh(leavesGeom, this.materials.leaves);
            leaves.position.y = height - 1 + i * 1.2;
            leaves.castShadow = true;
            tree.add(leaves);
        }
        
        tree.position.set(x, 0, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        this.game.scene.add(tree);
        this.objects.push(tree);
        
        return tree;
    }
    
    /**
     * Create pine tree
     */
    createPineTree(x, z) {
        const tree = new THREE.Group();
        const height = 6 + Math.random() * 4;
        
        // Trunk
        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.35, height * 0.6, 8);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = height * 0.3;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Pine layers (cones)
        const layers = 4;
        for (let i = 0; i < layers; i++) {
            const radius = 2.5 - i * 0.5;
            const coneHeight = 2.5 - i * 0.3;
            const y = height * 0.4 + i * 1.5;
            
            const leavesGeom = new THREE.ConeGeometry(radius, coneHeight, 8);
            const leaves = new THREE.Mesh(leavesGeom, this.materials.pineLeaves);
            leaves.position.y = y;
            leaves.castShadow = true;
            tree.add(leaves);
        }
        
        tree.position.set(x, 0, z);
        this.game.scene.add(tree);
        this.objects.push(tree);
        
        return tree;
    }
    
    /**
     * Create Russian flag
     */
    createFlag(x, y, z, scale = 1) {
        const flag = new THREE.Group();
        
        // Pole
        const poleGeom = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 4 * scale, 8);
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(poleGeom, poleMat);
        pole.position.y = 2 * scale;
        pole.castShadow = true;
        flag.add(pole);
        
        // Flag stripes
        const stripeHeight = 0.4 * scale;
        const stripeWidth = 1.5 * scale;
        const stripeDepth = 0.02 * scale;
        
        // White
        const whiteGeom = new THREE.BoxGeometry(stripeWidth, stripeHeight, stripeDepth);
        const white = new THREE.Mesh(whiteGeom, this.materials.flagWhite);
        white.position.set(stripeWidth / 2, 3.8 * scale, 0);
        flag.add(white);
        
        // Blue
        const blueGeom = new THREE.BoxGeometry(stripeWidth, stripeHeight, stripeDepth);
        const blue = new THREE.Mesh(blueGeom, this.materials.flagBlue);
        blue.position.set(stripeWidth / 2, 3.4 * scale, 0);
        flag.add(blue);
        
        // Red
        const redGeom = new THREE.BoxGeometry(stripeWidth, stripeHeight, stripeDepth);
        const red = new THREE.Mesh(redGeom, this.materials.flagRed);
        red.position.set(stripeWidth / 2, 3 * scale, 0);
        flag.add(red);
        
        // Ball on top
        const ballGeom = new THREE.SphereGeometry(0.08 * scale, 8, 8);
        const ballMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            metalness: 0.8,
            roughness: 0.2
        });
        const ball = new THREE.Mesh(ballGeom, ballMat);
        ball.position.y = 4.1 * scale;
        flag.add(ball);
        
        flag.position.set(x, y, z);
        this.game.scene.add(flag);
        this.objects.push(flag);
        
        // Add to animated objects for waving effect
        this.animatedObjects.push({
            object: flag,
            type: 'flag',
            parts: { white, blue, red },
            time: Math.random() * 100
        });
        
        return flag;
    }
    
    /**
     * Create bench
     */
    createBench(x, z, rotation = 0) {
        const bench = new THREE.Group();
        
        // Seat slats
        const slatGeom = new THREE.BoxGeometry(2, 0.08, 0.15);
        for (let i = 0; i < 3; i++) {
            const slat = new THREE.Mesh(slatGeom, this.materials.wood);
            slat.position.set(0, 0.45, -0.15 + i * 0.15);
            bench.add(slat);
        }
        
        // Back slats
        const backGeom = new THREE.BoxGeometry(2, 0.08, 0.12);
        for (let i = 0; i < 3; i++) {
            const slat = new THREE.Mesh(backGeom, this.materials.wood);
            slat.position.set(0, 0.65 + i * 0.15, -0.28);
            slat.rotation.x = 0.2;
            bench.add(slat);
        }
        
        // Legs
        const legGeom = new THREE.BoxGeometry(0.08, 0.45, 0.4);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const leftLeg = new THREE.Mesh(legGeom, legMat);
        leftLeg.position.set(-0.8, 0.225, -0.1);
        bench.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeom, legMat);
        rightLeg.position.set(0.8, 0.225, -0.1);
        bench.add(rightLeg);
        
        // Armrests
        const armGeom = new THREE.BoxGeometry(0.08, 0.08, 0.5);
        
        const leftArm = new THREE.Mesh(armGeom, legMat);
        leftArm.position.set(-0.96, 0.6, -0.05);
        bench.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeom, legMat);
        rightArm.position.set(0.96, 0.6, -0.05);
        bench.add(rightArm);
        
        bench.position.set(x, 0, z);
        bench.rotation.y = rotation;
        bench.castShadow = true;
        this.game.scene.add(bench);
        this.objects.push(bench);
        
        return bench;
    }
    
    /**
     * Create street light
     */
    createStreetLight(x, z) {
        const light = new THREE.Group();
        
        // Pole
        const poleGeom = new THREE.CylinderGeometry(0.08, 0.12, 6, 8);
        const pole = new THREE.Mesh(poleGeom, this.materials.metal);
        pole.position.y = 3;
        pole.castShadow = true;
        light.add(pole);
        
        // Arm
        const armGeom = new THREE.BoxGeometry(1.5, 0.1, 0.1);
        const arm = new THREE.Mesh(armGeom, this.materials.metal);
        arm.position.set(0.6, 5.8, 0);
        light.add(arm);
        
        // Lamp housing
        const housingGeom = new THREE.BoxGeometry(0.4, 0.25, 0.3);
        const housingMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const housing = new THREE.Mesh(housingGeom, housingMat);
        housing.position.set(1.2, 5.65, 0);
        light.add(housing);
        
        // Light bulb (emissive)
        const bulbGeom = new THREE.BoxGeometry(0.3, 0.1, 0.2);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
        const bulb = new THREE.Mesh(bulbGeom, bulbMat);
        bulb.position.set(1.2, 5.5, 0);
        light.add(bulb);
        
        // Actual light source
        const pointLight = new THREE.PointLight(0xFFFF99, 0.5, 15);
        pointLight.position.set(1.2, 5.4, 0);
        light.add(pointLight);
        
        light.position.set(x, 0, z);
        this.game.scene.add(light);
        this.objects.push(light);
        
        return light;
    }
    
    /**
     * Create trash can
     */
    createTrashCan(x, z) {
        const trash = new THREE.Group();
        
        // Can body
        const canGeom = new THREE.CylinderGeometry(0.25, 0.2, 0.8, 12);
        const canMat = new THREE.MeshLambertMaterial({ color: 0x006400 });
        const can = new THREE.Mesh(canGeom, canMat);
        can.position.y = 0.4;
        can.castShadow = true;
        trash.add(can);
        
        // Lid
        const lidGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 12);
        const lid = new THREE.Mesh(lidGeom, canMat);
        lid.position.y = 0.84;
        trash.add(lid);
        
        // Pole mount
        const poleGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
        const pole = new THREE.Mesh(poleGeom, this.materials.metal);
        pole.position.y = 0.6;
        trash.add(pole);
        
        trash.position.set(x, 0, z);
        this.game.scene.add(trash);
        this.objects.push(trash);
        
        return trash;
    }
    
    /**
     * Create bus stop
     */
    createBusStop(x, z, rotation = 0) {
        const stop = new THREE.Group();
        
        // Back panel
        const backGeom = new THREE.BoxGeometry(4, 2.5, 0.1);
        const glassMat = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.5
        });
        const back = new THREE.Mesh(backGeom, glassMat);
        back.position.set(0, 1.5, -0.8);
        stop.add(back);
        
        // Side panels
        const sideGeom = new THREE.BoxGeometry(0.1, 2.5, 1.6);
        
        const leftSide = new THREE.Mesh(sideGeom, glassMat);
        leftSide.position.set(-2, 1.5, 0);
        stop.add(leftSide);
        
        const rightSide = new THREE.Mesh(sideGeom, glassMat);
        rightSide.position.set(2, 1.5, 0);
        stop.add(rightSide);
        
        // Roof
        const roofGeom = new THREE.BoxGeometry(4.5, 0.15, 2);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.set(0, 2.8, -0.1);
        roof.castShadow = true;
        stop.add(roof);
        
        // Bench inside
        const benchGeom = new THREE.BoxGeometry(3.5, 0.1, 0.4);
        const bench = new THREE.Mesh(benchGeom, this.materials.wood);
        bench.position.set(0, 0.5, -0.4);
        stop.add(bench);
        
        // Sign
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 128;
        signCanvas.height = 64;
        const ctx = signCanvas.getContext('2d');
        ctx.fillStyle = '#0066AA';
        ctx.fillRect(0, 0, 128, 64);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('АВТОБУС', 64, 40);
        
        const signTexture = new THREE.CanvasTexture(signCanvas);
        const signGeom = new THREE.BoxGeometry(1, 0.5, 0.05);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeom, signMat);
        sign.position.set(0, 3.2, -0.8);
        stop.add(sign);
        
        stop.position.set(x, 0, z);
        stop.rotation.y = rotation;
        this.game.scene.add(stop);
        this.objects.push(stop);
        
        return stop;
    }
    
    /**
     * Create fountain
     */
    createFountain(x, z) {
        const fountain = new THREE.Group();
        
        // Base pool
        const poolGeom = new THREE.CylinderGeometry(4, 4.5, 0.5, 24);
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const pool = new THREE.Mesh(poolGeom, stoneMat);
        pool.position.y = 0.25;
        fountain.add(pool);
        
        // Inner pool (water)
        const waterGeom = new THREE.CylinderGeometry(3.5, 3.5, 0.4, 24);
        const waterMat = new THREE.MeshBasicMaterial({
            color: 0x4488FF,
            transparent: true,
            opacity: 0.7
        });
        const water = new THREE.Mesh(waterGeom, waterMat);
        water.position.y = 0.3;
        fountain.add(water);
        
        // Center column
        const columnGeom = new THREE.CylinderGeometry(0.3, 0.4, 2, 12);
        const column = new THREE.Mesh(columnGeom, stoneMat);
        column.position.y = 1.25;
        fountain.add(column);
        
        // Top bowl
        const bowlGeom = new THREE.CylinderGeometry(1, 0.5, 0.3, 12);
        const bowl = new THREE.Mesh(bowlGeom, stoneMat);
        bowl.position.y = 2.4;
        fountain.add(bowl);
        
        // Water spout (simplified)
        const spoutGeom = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const spoutMat = new THREE.MeshBasicMaterial({
            color: 0x88CCFF,
            transparent: true,
            opacity: 0.5
        });
        const spout = new THREE.Mesh(spoutGeom, spoutMat);
        spout.position.y = 3;
        fountain.add(spout);
        
        fountain.position.set(x, 0, z);
        this.game.scene.add(fountain);
        this.objects.push(fountain);
        
        // Add to animated for water effect
        this.animatedObjects.push({
            object: fountain,
            type: 'fountain',
            parts: { spout, water },
            time: 0
        });
        
        return fountain;
    }
    
    /**
     * Create billboard
     */
    createBillboard(x, z, rotation, text, subtext, bgColor) {
        const billboard = new THREE.Group();
        
        // Posts
        const postGeom = new THREE.CylinderGeometry(0.15, 0.15, 6, 8);
        const postMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        
        const leftPost = new THREE.Mesh(postGeom, postMat);
        leftPost.position.set(-2.5, 3, 0);
        billboard.add(leftPost);
        
        const rightPost = new THREE.Mesh(postGeom, postMat);
        rightPost.position.set(2.5, 3, 0);
        billboard.add(rightPost);
        
        // Billboard panel
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 512, 256);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, 504, 248);
        
        // Main text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 256, 100);
        
        // Subtext
        ctx.font = '32px Arial';
        ctx.fillText(subtext, 256, 180);
        
        // Russian flag stripe at bottom
        const stripeHeight = 20;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 236 - stripeHeight * 2, 512, stripeHeight);
        ctx.fillStyle = '#0039A6';
        ctx.fillRect(0, 236 - stripeHeight, 512, stripeHeight);
        ctx.fillStyle = '#D52B1E';
        ctx.fillRect(0, 236, 512, stripeHeight);
        
        const texture = new THREE.CanvasTexture(canvas);
        const panelGeom = new THREE.BoxGeometry(6, 3, 0.2);
        const panelMat = new THREE.MeshBasicMaterial({ map: texture });
        const panel = new THREE.Mesh(panelGeom, panelMat);
        panel.position.y = 5;
        billboard.add(panel);
        
        // Back panel
        const backGeom = new THREE.BoxGeometry(6, 3, 0.1);
        const backMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const back = new THREE.Mesh(backGeom, backMat);
        back.position.set(0, 5, -0.15);
        billboard.add(back);
        
        billboard.position.set(x, 0, z);
        billboard.rotation.y = rotation;
        this.game.scene.add(billboard);
        this.objects.push(billboard);
        
        return billboard;
    }
    
    /**
     * Create sign post
     */
    createSign(x, z, text, rotation = 0) {
        const sign = new THREE.Group();
        
        // Post
        const postGeom = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
        const post = new THREE.Mesh(postGeom, this.materials.metal);
        post.position.y = 1.25;
        sign.add(post);
        
        // Sign board
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0066AA';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 42);
        
        const texture = new THREE.CanvasTexture(canvas);
        const boardGeom = new THREE.BoxGeometry(2, 0.5, 0.05);
        const boardMat = new THREE.MeshBasicMaterial({ map: texture });
        const board = new THREE.Mesh(boardGeom, boardMat);
        board.position.y = 2.3;
        sign.add(board);
        
        sign.position.set(x, 0, z);
        sign.rotation.y = rotation;
        this.game.scene.add(sign);
        this.objects.push(sign);
        
        return sign;
    }
    
    /**
     * Create playground
     */
    createPlayground(x, z) {
        const playground = new THREE.Group();
        
        // Rubber surface
        const surfaceGeom = new THREE.PlaneGeometry(15, 15);
        const surfaceMat = new THREE.MeshLambertMaterial({ color: 0xCC6633 });
        const surface = new THREE.Mesh(surfaceGeom, surfaceMat);
        surface.rotation.x = -Math.PI / 2;
        surface.position.y = 0.01;
        playground.add(surface);
        
        // Swing set
        const swingFrame = new THREE.Group();
        
        // Frame poles
        const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
        const poleMat = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        
        for (let side = -1; side <= 1; side += 2) {
            const leftPole = new THREE.Mesh(poleGeom, poleMat);
            leftPole.position.set(side * 2, 1.5, -1);
            leftPole.rotation.z = side * 0.2;
            swingFrame.add(leftPole);
            
            const rightPole = new THREE.Mesh(poleGeom, poleMat);
            rightPole.position.set(side * 2, 1.5, 1);
            rightPole.rotation.z = side * 0.2;
            swingFrame.add(rightPole);
        }
        
        // Top bar
        const topBarGeom = new THREE.CylinderGeometry(0.05, 0.05, 5, 8);
        const topBar = new THREE.Mesh(topBarGeom, poleMat);
        topBar.position.y = 3;
        topBar.rotation.z = Math.PI / 2;
        swingFrame.add(topBar);
        
        // Swing seat
        const seatGeom = new THREE.BoxGeometry(0.5, 0.05, 0.3);
        const seatMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const seat = new THREE.Mesh(seatGeom, seatMat);
        seat.position.y = 0.8;
        swingFrame.add(seat);
        
        // Chains
        const chainGeom = new THREE.CylinderGeometry(0.01, 0.01, 2.2, 4);
        const chainMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        
        const leftChain = new THREE.Mesh(chainGeom, chainMat);
        leftChain.position.set(-0.2, 1.9, 0);
        swingFrame.add(leftChain);
        
        const rightChain = new THREE.Mesh(chainGeom, chainMat);
        rightChain.position.set(0.2, 1.9, 0);
        swingFrame.add(rightChain);
        
        swingFrame.position.set(-3, 0, 0);
        playground.add(swingFrame);
        
        // Slide
        const slideGroup = new THREE.Group();
        
        // Slide surface
        const slideGeom = new THREE.BoxGeometry(1, 0.05, 4);
        const slideMat = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
        const slide = new THREE.Mesh(slideGeom, slideMat);
        slide.position.set(0, 1.5, 0);
        slide.rotation.x = 0.4;
        slideGroup.add(slide);
        
        // Slide sides
        const sideGeom = new THREE.BoxGeometry(0.05, 0.3, 4);
        const leftSide = new THREE.Mesh(sideGeom, slideMat);
        leftSide.position.set(-0.52, 1.6, 0);
        leftSide.rotation.x = 0.4;
        slideGroup.add(leftSide);
        
        const rightSide = new THREE.Mesh(sideGeom, slideMat);
        rightSide.position.set(0.52, 1.6, 0);
        rightSide.rotation.x = 0.4;
        slideGroup.add(rightSide);
        
        // Platform
        const platformGeom = new THREE.BoxGeometry(1.5, 0.1, 1.5);
        const platform = new THREE.Mesh(platformGeom, poleMat);
        platform.position.set(0, 2.8, -2.5);
        slideGroup.add(platform);
        
        // Ladder
        for (let i = 0; i < 5; i++) {
            const rungGeom = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
            const rung = new THREE.Mesh(rungGeom, chainMat);
            rung.position.set(0, 0.5 + i * 0.5, -3.2 - i * 0.2);
            rung.rotation.z = Math.PI / 2;
            slideGroup.add(rung);
        }
        
        slideGroup.position.set(4, 0, 0);
        playground.add(slideGroup);
        
        // Sandbox
        const sandboxGeom = new THREE.BoxGeometry(3, 0.3, 3);
        const sandboxMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const sandbox = new THREE.Mesh(sandboxGeom, sandboxMat);
        sandbox.position.set(0, 0.15, 4);
        playground.add(sandbox);
        
        // Sand
        const sandGeom = new THREE.BoxGeometry(2.8, 0.25, 2.8);
        const sandMat = new THREE.MeshLambertMaterial({ color: 0xF4D03F });
        const sand = new THREE.Mesh(sandGeom, sandMat);
        sand.position.set(0, 0.2, 4);
        playground.add(sand);
        
        playground.position.set(x, 0, z);
        this.game.scene.add(playground);
        this.objects.push(playground);
        
        return playground;
    }
    
    /**
     * Create garage complex
     */
    createGarageComplex(x, z, count = 5) {
        const garages = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            const garage = new THREE.Group();
            
            // Body
            const bodyGeom = new THREE.BoxGeometry(4, 2.5, 6);
            const colors = [0x666666, 0x888888, 0x555555, 0x777777];
            const bodyMat = new THREE.MeshLambertMaterial({
                color: colors[Math.floor(Math.random() * colors.length)]
            });
            const body = new THREE.Mesh(bodyGeom, bodyMat);
            body.position.y = 1.25;
            body.castShadow = true;
            garage.add(body);
            
            // Door
            const doorGeom = new THREE.BoxGeometry(3, 2, 0.1);
            const doorMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const door = new THREE.Mesh(doorGeom, doorMat);
            door.position.set(0, 1, 3.05);
            garage.add(door);
            
            // Door handle
            const handleGeom = new THREE.BoxGeometry(0.3, 0.1, 0.1);
            const handle = new THREE.Mesh(handleGeom, this.materials.metal);
            handle.position.set(1, 1, 3.1);
            garage.add(handle);
            
            garage.position.x = i * 4.5;
            garages.add(garage);
        }
        
        garages.position.set(x, 0, z);
        this.game.scene.add(garages);
        this.objects.push(garages);
        
        return garages;
    }
    
    /**
     * Create smokestack
     */
    createSmokestack(x, z) {
        const stack = new THREE.Group();
        
        // Main chimney
        const chimneyGeom = new THREE.CylinderGeometry(2, 3, 25, 16);
        const chimneyMat = new THREE.MeshLambertMaterial({ color: 0x884444 });
        const chimney = new THREE.Mesh(chimneyGeom, chimneyMat);
        chimney.position.y = 12.5;
        chimney.castShadow = true;
        stack.add(chimney);
        
        // Red/white stripes
        for (let i = 0; i < 5; i++) {
            const stripeGeom = new THREE.CylinderGeometry(
                2.1 - i * 0.05,
                2.6 - i * 0.1,
                2.5,
                16
            );
            const stripeMat = new THREE.MeshLambertMaterial({
                color: i % 2 === 0 ? 0xFF0000 : 0xFFFFFF
            });
            const stripe = new THREE.Mesh(stripeGeom, stripeMat);
            stripe.position.y = 2.5 + i * 5;
            stack.add(stripe);
        }
        
        // Smoke particles (simplified)
        const smokeGeom = new THREE.SphereGeometry(1.5, 8, 8);
        const smokeMat = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.4
        });
        
        for (let i = 0; i < 3; i++) {
            const smoke = new THREE.Mesh(smokeGeom, smokeMat.clone());
            smoke.position.set(
                Math.random() * 2 - 1,
                26 + i * 3,
                Math.random() * 2 - 1
            );
            smoke.scale.setScalar(0.5 + i * 0.3);
            stack.add(smoke);
            
            this.animatedObjects.push({
                object: smoke,
                type: 'smoke',
                initialY: smoke.position.y,
                time: Math.random() * 10
            });
        }
        
        stack.position.set(x, 0, z);
        this.game.scene.add(stack);
        this.objects.push(stack);
        
        return stack;
    }
    
    /**
     * Update animated objects
     */
    update(delta) {
        for (const anim of this.animatedObjects) {
            anim.time += delta;
            
            if (anim.type === 'flag') {
                // Simple wave animation
                const wave = Math.sin(anim.time * 3) * 0.05;
                if (anim.parts.white) anim.parts.white.rotation.y = wave;
                if (anim.parts.blue) anim.parts.blue.rotation.y = wave * 0.9;
                if (anim.parts.red) anim.parts.red.rotation.y = wave * 0.8;
            }
            
            if (anim.type === 'fountain') {
                // Water animation
                if (anim.parts.spout) {
                    anim.parts.spout.scale.y = 0.8 + Math.sin(anim.time * 5) * 0.2;
                }
            }
            
            if (anim.type === 'smoke') {
                // Smoke rising
                anim.object.position.y = anim.initialY + Math.sin(anim.time) * 2;
                anim.object.position.x = Math.sin(anim.time * 0.5) * 2;
                anim.object.material.opacity = 0.3 + Math.sin(anim.time * 2) * 0.1;
            }
        }
    }
    
    /**
     * Dispose all objects
     */
    dispose() {
        for (const obj of this.objects) {
            this.game.scene.remove(obj);
            obj.traverse(child => {
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
        this.objects = [];
        this.animatedObjects = [];
    }
}

export default EnvironmentObjects;