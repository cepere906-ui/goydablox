/**
 * ГОЙДАБЛОКС - Player Entity
 * Player character with movement, camera, and interaction systems
 */

import * as THREE from 'three';
import { CONFIG } from '../config/GameConfig.js';

export class Player {
    constructor(game) {
        this.game = game;
        
        // Position and physics
        this.position = new THREE.Vector3(0, 2, 0);
        this.velocity = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0);
        
        // Camera control
        this.yaw = 0;
        this.pitch = 0;
        this.cameraMode = 'thirdPerson'; // 'firstPerson', 'thirdPerson'
        this.cameraDistance = CONFIG.camera.thirdPersonDistance;
        this.cameraOffset = new THREE.Vector3();
        
        // State
        this.isGrounded = false;
        this.isSprinting = false;
        this.isCrouching = false;
        this.isInVehicle = false;
        this.currentVehicle = null;
        this.health = 100;
        this.stamina = 100;
        this.interactionTarget = null;
        
        // Animation
        this.animationState = 'idle';
        this.walkCycle = 0;
        
        // Create mesh
        this.mesh = this.createPlayerMesh();
        this.game.scene.add(this.mesh);
        
        // Physics body
        this.physicsBody = {
            position: this.position,
            velocity: this.velocity,
            collider: {
                type: 'capsule',
                radius: CONFIG.player.radius,
                height: CONFIG.player.height,
                halfSize: new THREE.Vector3(
                    CONFIG.player.radius,
                    CONFIG.player.height / 2,
                    CONFIG.player.radius
                )
            },
            mass: 80,
            friction: 0.9,
            grounded: false
        };
        
        this.game.physicsEngine.addBody(this.physicsBody);
        
        console.log('👤 Player created');
    }
    
    /**
     * Create player character mesh
     */
    createPlayerMesh() {
        const group = new THREE.Group();
        
        // Materials
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xFFDBB4 });
        const shirtMat = new THREE.MeshLambertMaterial({ color: 0x2244AA });
        const pantsMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const ushankaMat = new THREE.MeshLambertMaterial({ color: 0x4A3728 });
        const furMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        
        // Body (torso)
        const torsoGeom = new THREE.BoxGeometry(0.8, 1.0, 0.5);
        const torso = new THREE.Mesh(torsoGeom, shirtMat);
        torso.position.y = 1.2;
        torso.castShadow = true;
        group.add(torso);
        this.torso = torso;
        
        // Head
        const headGeom = new THREE.BoxGeometry(0.55, 0.55, 0.55);
        const head = new THREE.Mesh(headGeom, skinMat);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);
        this.head = head;
        
        // Eyes
        const eyeGeom = new THREE.BoxGeometry(0.08, 0.08, 0.05);
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.12, 2.05, 0.27);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.12, 2.05, 0.27);
        group.add(rightEye);
        
        // Ushanka (Russian fur hat)
        const ushankaBase = new THREE.BoxGeometry(0.65, 0.25, 0.65);
        const ushanka = new THREE.Mesh(ushankaBase, ushankaMat);
        ushanka.position.y = 2.4;
        group.add(ushanka);
        
        // Fur trim
        const furTrimGeom = new THREE.BoxGeometry(0.7, 0.1, 0.7);
        const furTrim = new THREE.Mesh(furTrimGeom, furMat);
        furTrim.position.y = 2.28;
        group.add(furTrim);
        
        // Ear flaps
        const earFlapGeom = new THREE.BoxGeometry(0.15, 0.3, 0.2);
        const leftFlap = new THREE.Mesh(earFlapGeom, furMat);
        leftFlap.position.set(-0.35, 2.15, 0);
        group.add(leftFlap);
        
        const rightFlap = new THREE.Mesh(earFlapGeom, furMat);
        rightFlap.position.set(0.35, 2.15, 0);
        group.add(rightFlap);
        
        // Arms
        const armGeom = new THREE.BoxGeometry(0.22, 0.7, 0.22);
        
        const leftArm = new THREE.Mesh(armGeom, shirtMat);
        leftArm.position.set(-0.51, 1.15, 0);
        leftArm.castShadow = true;
        group.add(leftArm);
        this.leftArm = leftArm;
        
        const rightArm = new THREE.Mesh(armGeom, shirtMat);
        rightArm.position.set(0.51, 1.15, 0);
        rightArm.castShadow = true;
        group.add(rightArm);
        this.rightArm = rightArm;
        
        // Hands
        const handGeom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
        
        const leftHand = new THREE.Mesh(handGeom, skinMat);
        leftHand.position.set(-0.51, 0.72, 0);
        group.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeom, skinMat);
        rightHand.position.set(0.51, 0.72, 0);
        group.add(rightHand);
        
        // Legs
        const legGeom = new THREE.BoxGeometry(0.28, 0.7, 0.28);
        
        const leftLeg = new THREE.Mesh(legGeom, pantsMat);
        leftLeg.position.set(-0.18, 0.35, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        this.leftLeg = leftLeg;
        
        const rightLeg = new THREE.Mesh(legGeom, pantsMat);
        rightLeg.position.set(0.18, 0.35, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        this.rightLeg = rightLeg;
        
        // Shoes
        const shoeGeom = new THREE.BoxGeometry(0.25, 0.12, 0.35);
        
        const leftShoe = new THREE.Mesh(shoeGeom, shoeMat);
        leftShoe.position.set(-0.18, 0.06, 0.05);
        group.add(leftShoe);
        
        const rightShoe = new THREE.Mesh(shoeGeom, shoeMat);
        rightShoe.position.set(0.18, 0.06, 0.05);
        group.add(rightShoe);
        
        return group;
    }
    
    /**
     * Update player
     */
    update(delta) {
        if (this.isInVehicle) {
            this.updateInVehicle(delta);
        } else {
            this.updateMovement(delta);
            this.updateCamera(delta);
            this.updateAnimation(delta);
        }
        
        this.updateInteraction(delta);
        this.updateStamina(delta);
        
        // Sync mesh position
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.yaw;
        
        // Hide mesh in first person
        this.mesh.visible = this.cameraMode !== 'firstPerson';
    }
    
    /**
     * Update movement
     */
    updateMovement(delta) {
        const input = this.game.inputManager;
        const moveVector = input.getMovementVector();
        
        // Check sprint
        this.isSprinting = input.isAction('sprint') && this.stamina > 0 && moveVector.z < 0;
        
        // Check crouch
        this.isCrouching = input.isAction('crouch');
        
        // Calculate speed
        let speed = CONFIG.player.walkSpeed;
        if (this.isSprinting) {
            speed = CONFIG.player.runSpeed;
        }
        if (this.isCrouching) {
            speed *= 0.5;
        }
        
        // Calculate movement direction relative to camera
        const moveAngle = Math.atan2(moveVector.x, moveVector.z);
        const magnitude = Math.sqrt(moveVector.x * moveVector.x + moveVector.z * moveVector.z);
        
        if (magnitude > 0.1) {
            const worldAngle = this.yaw + moveAngle;
            
            this.velocity.x = Math.sin(worldAngle) * speed * magnitude;
            this.velocity.z = Math.cos(worldAngle) * speed * magnitude;
            
            // Update animation state
            this.animationState = this.isSprinting ? 'running' : 'walking';
        } else {
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
            this.animationState = 'idle';
        }
        
        // Jump
        if (input.isActionJustPressed('jump') && this.physicsBody.grounded) {
            this.velocity.y = CONFIG.player.jumpForce;
            this.physicsBody.grounded = false;
            this.game.audioManager?.playSound('jump');
        }
        
        // Apply physics
        this.physicsBody.velocity.copy(this.velocity);
        this.isGrounded = this.physicsBody.grounded;
        
        // Sync position from physics
        this.position.copy(this.physicsBody.position);
        
        // Keep velocity Y from physics
        this.velocity.y = this.physicsBody.velocity.y;
    }
    
    /**
     * Update camera
     */
    updateCamera(delta) {
        const input = this.game.inputManager;
        const lookDelta = input.getLookDelta();
        
        // Update yaw (horizontal rotation)
        this.yaw -= lookDelta.x;
        
        // Update pitch (vertical rotation)
        this.pitch -= lookDelta.y;
        this.pitch = Math.max(
            CONFIG.camera.minPitch,
            Math.min(CONFIG.camera.maxPitch, this.pitch)
        );
        
        // Camera zoom with scroll
        const scroll = input.getScrollDelta();
        if (scroll !== 0) {
            if (this.cameraMode === 'thirdPerson') {
                this.cameraDistance = Math.max(
                    2,
                    Math.min(15, this.cameraDistance + scroll * 0.5)
                );
            }
        }
        
        // Toggle camera mode with V key
        if (input.keysJustPressed['KeyV']) {
            this.cameraMode = this.cameraMode === 'firstPerson' ? 'thirdPerson' : 'firstPerson';
        }
        
        // Calculate camera position
        const camera = this.game.camera;
        const playerCenter = this.position.clone().add(new THREE.Vector3(0, CONFIG.player.cameraHeight, 0));
        
        if (this.cameraMode === 'firstPerson') {
            // First person - camera at eye level
            camera.position.copy(playerCenter);
            
            // Look direction
            const lookDir = new THREE.Vector3(
                Math.sin(this.yaw) * Math.cos(this.pitch),
                Math.sin(this.pitch),
                Math.cos(this.yaw) * Math.cos(this.pitch)
            );
            camera.lookAt(playerCenter.clone().add(lookDir));
            
        } else {
            // Third person - camera behind and above player
            const cameraOffset = new THREE.Vector3(
                Math.sin(this.yaw) * this.cameraDistance * Math.cos(this.pitch),
                this.cameraDistance * Math.sin(this.pitch) + 2,
                Math.cos(this.yaw) * this.cameraDistance * Math.cos(this.pitch)
            );
            
            const targetPosition = playerCenter.clone().add(cameraOffset);
            
            // Smooth camera movement
            camera.position.lerp(targetPosition, 1 - Math.pow(0.001, delta));
            
            // Look at player
            camera.lookAt(playerCenter);
        }
    }
    
    /**
     * Update when in vehicle
     */
    updateInVehicle(delta) {
        if (!this.currentVehicle) return;
        
        // Camera follows vehicle
        const vehiclePos = this.currentVehicle.position;
        const vehicleRot = this.currentVehicle.rotation.y;
        
        const input = this.game.inputManager;
        const lookDelta = input.getLookDelta();
        
        // Update camera angle around vehicle
        this.yaw -= lookDelta.x;
        this.pitch -= lookDelta.y;
        this.pitch = Math.max(-0.5, Math.min(0.8, this.pitch));
        
        const camera = this.game.camera;
        const distance = 12;
        
        const cameraOffset = new THREE.Vector3(
            Math.sin(this.yaw) * distance * Math.cos(this.pitch),
            distance * Math.sin(this.pitch) + 4,
            Math.cos(this.yaw) * distance * Math.cos(this.pitch)
        );
        
        const targetPosition = vehiclePos.clone().add(cameraOffset);
        camera.position.lerp(targetPosition, 1 - Math.pow(0.001, delta));
        camera.lookAt(vehiclePos.clone().add(new THREE.Vector3(0, 1.5, 0)));
        
        // Update player position to vehicle
        this.position.copy(vehiclePos);
    }
    
    /**
     * Update animation
     */
    updateAnimation(delta) {
        if (this.animationState === 'walking' || this.animationState === 'running') {
            const speed = this.animationState === 'running' ? 12 : 8;
            this.walkCycle += delta * speed;
            
            // Arm swing
            const armSwing = Math.sin(this.walkCycle) * 0.5;
            this.leftArm.rotation.x = armSwing;
            this.rightArm.rotation.x = -armSwing;
            
            // Leg swing
            const legSwing = Math.sin(this.walkCycle) * 0.6;
            this.leftLeg.rotation.x = -legSwing;
            this.rightLeg.rotation.x = legSwing;
            
            // Slight body bob
            this.torso.position.y = 1.2 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
            
        } else {
            // Reset to idle
            this.leftArm.rotation.x *= 0.9;
            this.rightArm.rotation.x *= 0.9;
            this.leftLeg.rotation.x *= 0.9;
            this.rightLeg.rotation.x *= 0.9;
            this.torso.position.y = 1.2;
        }
    }
    
    /**
     * Update stamina
     */
    updateStamina(delta) {
        if (this.isSprinting && this.animationState === 'running') {
            this.stamina = Math.max(0, this.stamina - delta * 15);
        } else {
            this.stamina = Math.min(100, this.stamina + delta * 10);
        }
    }
    
    /**
     * Update interaction
     */
    updateInteraction(delta) {
        const input = this.game.inputManager;
        
        // Find nearest interactable
        this.interactionTarget = this.findNearestInteractable();
        
        // Show interaction prompt
        if (this.interactionTarget) {
            this.game.uiManager?.showInteractionPrompt(
                this.interactionTarget.interactionText || 'Взаимодействовать [E]'
            );
        } else {
            this.game.uiManager?.hideInteractionPrompt();
        }
        
        // Handle interaction
        if (input.isActionJustPressed('interact')) {
            this.interact();
        }
        
        // Vehicle enter/exit
        if (input.isActionJustPressed('vehicle_enter')) {
            if (this.isInVehicle) {
                this.exitVehicle();
            } else {
                this.enterNearbyVehicle();
            }
        }
    }
    
    /**
     * Find nearest interactable object
     */
    findNearestInteractable() {
        const interactables = this.game.worldGenerator?.getInteractables() || [];
        let nearest = null;
        let nearestDist = CONFIG.player.interactionDistance;
        
        for (const obj of interactables) {
            const dist = this.position.distanceTo(obj.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = obj;
            }
        }
        
        return nearest;
    }
    
    /**
     * Interact with target
     */
    interact() {
        if (!this.interactionTarget) return;
        
        const target = this.interactionTarget;
        
        if (target.onInteract) {
            target.onInteract(this);
        }
        
        // Built-in interaction types
        if (target.type === 'shawarma') {
            this.buyShawarma(target);
        } else if (target.type === 'shop') {
            this.game.uiManager?.showShopMenu(target);
        } else if (target.type === 'quest_giver') {
            this.game.questManager?.startDialogue(target);
        } else if (target.type === 'fertility_center') {
            this.game.uiManager?.showFertilityCenter(target);
        }
        
        this.game.audioManager?.playSound('interact');
    }
    
    /**
     * Buy shawarma
     */
    buyShawarma(stand) {
        const price = CONFIG.economy.shawarmaPrice;
        
        if (this.game.spendMoney(price)) {
            this.health = Math.min(100, this.health + 20);
            this.stamina = 100;
            this.game.gameState.statistics.shawarmasEaten++;
            this.game.uiManager?.showNotification('Шаурма съедена! +20 HP');
            this.game.audioManager?.playSound('eat');
        } else {
            this.game.uiManager?.showNotification('Недостаточно денег!');
        }
    }
    
    /**
     * Enter nearby vehicle
     */
    enterNearbyVehicle() {
        const vehicle = this.game.vehicleManager?.getNearestVehicle(this.position, 4);
        
        if (vehicle) {
            this.isInVehicle = true;
            this.currentVehicle = vehicle;
            vehicle.setDriver(this);
            this.mesh.visible = false;
            this.game.audioManager?.playSound('car_door');
            console.log('🚗 Entered vehicle');
        }
    }
    
    /**
     * Exit current vehicle
     */
    exitVehicle() {
        if (!this.currentVehicle) return;
        
        // Find exit position
        const exitOffset = new THREE.Vector3(2, 0, 0);
        exitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentVehicle.rotation.y);
        
        this.position.copy(this.currentVehicle.position).add(exitOffset);
        this.position.y = 2;
        
        this.currentVehicle.setDriver(null);
        this.currentVehicle = null;
        this.isInVehicle = false;
        this.mesh.visible = true;
        
        this.game.audioManager?.playSound('car_door');
        console.log('🚶 Exited vehicle');
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.game.audioManager?.playSound('hurt');
        this.game.uiManager?.flashDamage();
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Handle death
     */
    die() {
        console.log('💀 Player died');
        this.game.uiManager?.showDeathScreen();
        // Respawn after delay
        setTimeout(() => this.respawn(), 3000);
    }
    
    /**
     * Respawn player
     */
    respawn() {
        this.position.set(0, 2, 0);
        this.health = 100;
        this.stamina = 100;
        this.velocity.set(0, 0, 0);
        this.game.uiManager?.hideDeathScreen();
    }
    
    /**
     * Teleport to position
     */
    teleport(position) {
        this.position.copy(position);
        this.velocity.set(0, 0, 0);
        this.physicsBody.position.copy(position);
        this.physicsBody.velocity.set(0, 0, 0);
    }
    
    /**
     * Get player data for saving
     */
    getSaveData() {
        return {
            position: this.position.toArray(),
            rotation: this.yaw,
            health: this.health,
            stamina: this.stamina
        };
    }
    
    /**
     * Load player data
     */
    loadSaveData(data) {
        if (data.position) {
            this.position.fromArray(data.position);
        }
        if (data.rotation !== undefined) {
            this.yaw = data.rotation;
        }
        if (data.health !== undefined) {
            this.health = data.health;
        }
        if (data.stamina !== undefined) {
            this.stamina = data.stamina;
        }
    }
    
    /**
     * Dispose
     */
    dispose() {
        this.game.scene.remove(this.mesh);
        this.mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

export default Player;