/**
 * ГОЙДАБЛОКС - NPC Manager
 * Manages non-player characters in the game world
 */

import * as THREE from 'three';
import { CONFIG, NPC_TYPES } from '../config/GameConfig.js';

export class NPCManager {
    constructor(game) {
        this.game = game;
        this.npcs = [];
        this.maxNPCs = CONFIG.npc.maxCount;
        
        // Spawn initial NPCs
        this.spawnInitialNPCs();
        
        console.log('👥 NPCManager initialized');
    }
    
    /**
     * Spawn initial NPCs
     */
    spawnInitialNPCs() {
        // Spawn various NPC types around the city
        const spawnPoints = [
            { x: 10, z: 20, type: NPC_TYPES.GOPNIK },
            { x: -15, z: 30, type: NPC_TYPES.BABUSHKA },
            { x: 25, z: -10, type: NPC_TYPES.BUSINESSMAN },
            { x: -30, z: -20, type: NPC_TYPES.WORKER },
            { x: 50, z: 40, type: NPC_TYPES.GOPNIK },
            { x: -40, z: 50, type: NPC_TYPES.BABUSHKA },
            { x: 60, z: -30, type: NPC_TYPES.POLICE },
            { x: -20, z: -50, type: NPC_TYPES.WORKER },
        ];
        
        for (const spawn of spawnPoints) {
            this.spawnNPC(spawn.type, new THREE.Vector3(spawn.x, 0, spawn.z));
        }
    }
    
    /**
     * Spawn an NPC
     */
    spawnNPC(type, position) {
        if (this.npcs.length >= this.maxNPCs) return null;
        
        const npc = new NPC(this.game, type, position);
        this.npcs.push(npc);
        return npc;
    }
    
    /**
     * Remove an NPC
     */
    removeNPC(npc) {
        const index = this.npcs.indexOf(npc);
        if (index > -1) {
            this.npcs.splice(index, 1);
            npc.dispose();
        }
    }
    
    /**
     * Update all NPCs
     */
    update(delta) {
        const playerPos = this.game.player?.position;
        if (!playerPos) return;
        
        for (const npc of this.npcs) {
            // Update NPC
            npc.update(delta, playerPos);
            
            // Despawn if too far
            const dist = npc.position.distanceTo(playerPos);
            if (dist > CONFIG.npc.despawnRadius) {
                // Respawn at new location
                this.respawnNPC(npc, playerPos);
            }
        }
        
        // Spawn new NPCs if needed
        if (this.npcs.length < 20) {
            this.trySpawnNearPlayer(playerPos);
        }
    }
    
    /**
     * Respawn NPC at new location
     */
    respawnNPC(npc, playerPos) {
        const angle = Math.random() * Math.PI * 2;
        const dist = CONFIG.npc.spawnRadius * 0.8;
        
        npc.position.set(
            playerPos.x + Math.cos(angle) * dist,
            0,
            playerPos.z + Math.sin(angle) * dist
        );
        
        npc.resetBehavior();
    }
    
    /**
     * Try to spawn NPC near player
     */
    trySpawnNearPlayer(playerPos) {
        if (Math.random() > 0.01) return; // Low chance per frame
        
        const angle = Math.random() * Math.PI * 2;
        const dist = CONFIG.npc.spawnRadius * (0.5 + Math.random() * 0.5);
        
        const position = new THREE.Vector3(
            playerPos.x + Math.cos(angle) * dist,
            0,
            playerPos.z + Math.sin(angle) * dist
        );
        
        const types = Object.values(NPC_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.spawnNPC(type, position);
    }
    
    /**
     * Get NPCs near position
     */
    getNPCsNear(position, radius) {
        return this.npcs.filter(npc => 
            npc.position.distanceTo(position) < radius
        );
    }
    
    /**
     * Dispose all NPCs
     */
    dispose() {
        for (const npc of this.npcs) {
            npc.dispose();
        }
        this.npcs = [];
    }
}

/**
 * Individual NPC class
 */
class NPC {
    constructor(game, type, position) {
        this.game = game;
        this.type = type;
        this.position = position.clone();
        this.rotation = new THREE.Euler(0, Math.random() * Math.PI * 2, 0);
        this.velocity = new THREE.Vector3();
        
        // Behavior state
        this.state = 'idle'; // idle, walking, talking
        this.targetPosition = null;
        this.stateTimer = 0;
        this.walkSpeed = CONFIG.npc.walkSpeed;
        
        // Animation
        this.walkCycle = 0;
        
        // Create mesh
        this.mesh = this.createMesh();
        this.game.scene.add(this.mesh);
        
        // Start with random behavior
        this.resetBehavior();
    }
    
    /**
     * Create NPC mesh based on type
     */
    createMesh() {
        const group = new THREE.Group();
        
        // Get colors based on type
        const colors = this.getTypeColors();
        
        // Materials
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xFFDBB4 });
        const clothesMat = new THREE.MeshLambertMaterial({ color: colors.clothes });
        const pantsMat = new THREE.MeshLambertMaterial({ color: colors.pants });
        const hatMat = new THREE.MeshLambertMaterial({ color: colors.hat });
        
        // Body
        const bodyGeom = new THREE.BoxGeometry(0.7, 1.0, 0.45);
        const body = new THREE.Mesh(bodyGeom, clothesMat);
        body.position.y = 1.1;
        body.castShadow = true;
        group.add(body);
        this.body = body;
        
        // Head
        const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const head = new THREE.Mesh(headGeom, skinMat);
        head.position.y = 1.85;
        head.castShadow = true;
        group.add(head);
        
        // Eyes
        const eyeGeom = new THREE.BoxGeometry(0.07, 0.07, 0.04);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.1, 1.9, 0.25);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.1, 1.9, 0.25);
        group.add(rightEye);
        
        // Hat/Hair based on type
        if (this.type === NPC_TYPES.GOPNIK) {
            // Adidas cap
            const capGeom = new THREE.BoxGeometry(0.55, 0.15, 0.55);
            const cap = new THREE.Mesh(capGeom, hatMat);
            cap.position.y = 2.15;
            group.add(cap);
            
            const brimGeom = new THREE.BoxGeometry(0.2, 0.05, 0.3);
            const brim = new THREE.Mesh(brimGeom, hatMat);
            brim.position.set(0, 2.1, 0.35);
            group.add(brim);
        } else if (this.type === NPC_TYPES.BABUSHKA) {
            // Headscarf
            const scarfGeom = new THREE.SphereGeometry(0.3, 8, 8);
            const scarf = new THREE.Mesh(scarfGeom, hatMat);
            scarf.position.y = 2.0;
            scarf.scale.set(1, 0.8, 1);
            group.add(scarf);
        } else if (this.type === NPC_TYPES.POLICE) {
            // Police cap
            const capGeom = new THREE.CylinderGeometry(0.25, 0.28, 0.15, 8);
            const cap = new THREE.Mesh(capGeom, hatMat);
            cap.position.y = 2.15;
            group.add(cap);
        }
        
        // Arms
        const armGeom = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        
        const leftArm = new THREE.Mesh(armGeom, clothesMat);
        leftArm.position.set(-0.45, 1.1, 0);
        leftArm.castShadow = true;
        group.add(leftArm);
        this.leftArm = leftArm;
        
        const rightArm = new THREE.Mesh(armGeom, clothesMat);
        rightArm.position.set(0.45, 1.1, 0);
        rightArm.castShadow = true;
        group.add(rightArm);
        this.rightArm = rightArm;
        
        // Legs
        const legGeom = new THREE.BoxGeometry(0.25, 0.65, 0.25);
        
        const leftLeg = new THREE.Mesh(legGeom, pantsMat);
        leftLeg.position.set(-0.15, 0.35, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        this.leftLeg = leftLeg;
        
        const rightLeg = new THREE.Mesh(legGeom, pantsMat);
        rightLeg.position.set(0.15, 0.35, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        this.rightLeg = rightLeg;
        
        // Special items based on type
        if (this.type === NPC_TYPES.BABUSHKA) {
            // Shopping bag
            const bagGeom = new THREE.BoxGeometry(0.3, 0.4, 0.2);
            const bagMat = new THREE.MeshLambertMaterial({ color: 0x0066AA });
            const bag = new THREE.Mesh(bagGeom, bagMat);
            bag.position.set(-0.55, 0.8, 0.1);
            group.add(bag);
        }
        
        if (this.type === NPC_TYPES.GOPNIK) {
            // Semechki (sunflower seeds)
            const seedsGeom = new THREE.BoxGeometry(0.15, 0.1, 0.1);
            const seedsMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
            const seeds = new THREE.Mesh(seedsGeom, seedsMat);
            seeds.position.set(0.5, 0.9, 0.15);
            group.add(seeds);
        }
        
        // Position and add to scene
        group.position.copy(this.position);
        group.rotation.copy(this.rotation);
        
        return group;
    }
    
    /**
     * Get colors based on NPC type
     */
    getTypeColors() {
        switch (this.type) {
            case NPC_TYPES.GOPNIK:
                return {
                    clothes: 0x000000, // Black Adidas
                    pants: 0x000000,
                    hat: 0x000000
                };
            case NPC_TYPES.BABUSHKA:
                return {
                    clothes: 0x8B4513, // Brown coat
                    pants: 0x444444,
                    hat: 0xFF6B6B // Red headscarf
                };
            case NPC_TYPES.BUSINESSMAN:
                return {
                    clothes: 0x2F2F2F, // Dark suit
                    pants: 0x2F2F2F,
                    hat: 0x000000
                };
            case NPC_TYPES.POLICE:
                return {
                    clothes: 0x000066, // Blue uniform
                    pants: 0x000066,
                    hat: 0x000066
                };
            case NPC_TYPES.MILITARY:
                return {
                    clothes: 0x4B5320, // Army green
                    pants: 0x4B5320,
                    hat: 0x4B5320
                };
            case NPC_TYPES.WORKER:
                return {
                    clothes: 0xFF6600, // Orange vest
                    pants: 0x333333,
                    hat: 0xFFFF00 // Yellow helmet
                };
            default:
                return {
                    clothes: 0x666666,
                    pants: 0x333333,
                    hat: 0x444444
                };
        }
    }
    
    /**
     * Reset NPC behavior
     */
    resetBehavior() {
        this.state = 'idle';
        this.stateTimer = 2 + Math.random() * 3;
        this.targetPosition = null;
    }
    
    /**
     * Update NPC
     */
    update(delta, playerPos) {
        // Update state timer
        this.stateTimer -= delta;
        
        // State machine
        if (this.stateTimer <= 0) {
            this.changeState();
        }
        
        // Execute current state
        switch (this.state) {
            case 'idle':
                this.updateIdle(delta);
                break;
            case 'walking':
                this.updateWalking(delta);
                break;
            case 'talking':
                this.updateTalking(delta);
                break;
        }
        
        // Look at player if close
        const distToPlayer = this.position.distanceTo(playerPos);
        if (distToPlayer < 5 && this.state === 'idle') {
            this.lookAt(playerPos);
        }
        
        // Update mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        
        // Update animation
        this.updateAnimation(delta);
    }
    
    /**
     * Change to new state
     */
    changeState() {
        const rand = Math.random();
        
        if (this.state === 'idle') {
            if (rand < 0.7) {
                // Start walking
                this.state = 'walking';
                this.stateTimer = 3 + Math.random() * 5;
                this.setRandomTarget();
            } else {
                // Stay idle
                this.stateTimer = 2 + Math.random() * 4;
            }
        } else if (this.state === 'walking') {
            // Stop and idle
            this.state = 'idle';
            this.stateTimer = 2 + Math.random() * 4;
            this.targetPosition = null;
        }
    }
    
    /**
     * Set random walk target
     */
    setRandomTarget() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 20;
        
        this.targetPosition = new THREE.Vector3(
            this.position.x + Math.cos(angle) * dist,
            0,
            this.position.z + Math.sin(angle) * dist
        );
    }
    
    /**
     * Update idle state
     */
    updateIdle(delta) {
        // Occasionally look around
        if (Math.random() < delta * 0.5) {
            this.rotation.y += (Math.random() - 0.5) * 0.5;
        }
    }
    
    /**
     * Update walking state
     */
    updateWalking(delta) {
        if (!this.targetPosition) {
            this.state = 'idle';
            return;
        }
        
        // Calculate direction to target
        const direction = new THREE.Vector3()
            .subVectors(this.targetPosition, this.position)
            .normalize();
        
        // Move towards target
        const speed = this.walkSpeed;
        this.position.x += direction.x * speed * delta;
        this.position.z += direction.z * speed * delta;
        
        // Face movement direction
        this.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Check if reached target
        const dist = this.position.distanceTo(this.targetPosition);
        if (dist < 1) {
            this.state = 'idle';
            this.stateTimer = 2 + Math.random() * 3;
            this.targetPosition = null;
        }
        
        // Update walk cycle
        this.walkCycle += delta * 8;
    }
    
    /**
     * Update talking state
     */
    updateTalking(delta) {
        // Face talking partner, slight gestures
    }
    
    /**
     * Look at position
     */
    lookAt(position) {
        const direction = new THREE.Vector3()
            .subVectors(position, this.position);
        this.rotation.y = Math.atan2(direction.x, direction.z);
    }
    
    /**
     * Update animation
     */
    updateAnimation(delta) {
        if (this.state === 'walking') {
            // Walking animation
            const swing = Math.sin(this.walkCycle) * 0.4;
            
            this.leftArm.rotation.x = swing;
            this.rightArm.rotation.x = -swing;
            this.leftLeg.rotation.x = -swing;
            this.rightLeg.rotation.x = swing;
        } else {
            // Idle - return to neutral
            this.leftArm.rotation.x *= 0.9;
            this.rightArm.rotation.x *= 0.9;
            this.leftLeg.rotation.x *= 0.9;
            this.rightLeg.rotation.x *= 0.9;
        }
    }
    
    /**
     * Dispose NPC
     */
    dispose() {
        this.game.scene.remove(this.mesh);
        this.mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

export default NPCManager;