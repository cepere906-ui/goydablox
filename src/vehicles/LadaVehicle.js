/**
 * ГОЙДАБЛОКС - Lada Vehicle
 * Full-featured Lada automobile with realistic driving physics
 */

import * as THREE from 'three';
import { CONFIG, COLORS } from '../config/GameConfig.js';

export class LadaVehicle {
    constructor(game, options = {}) {
        this.game = game;
        this.type = options.model || '2107';
        
        // Position and physics
        this.position = new THREE.Vector3();
        if (options.position) {
            this.position.copy(options.position);
        }
        
        this.rotation = new THREE.Euler(0, options.rotation || 0, 0);
        this.velocity = new THREE.Vector3();
        this.angularVelocity = 0;
        
        // Vehicle properties
        this.color = options.color || 0x1A5C1A;
        this.maxSpeed = CONFIG.vehicle.lada.maxSpeed;
        this.acceleration = CONFIG.vehicle.lada.acceleration;
        this.braking = CONFIG.vehicle.lada.braking;
        this.turnSpeed = CONFIG.vehicle.lada.turnSpeed;
        this.friction = CONFIG.vehicle.lada.friction;
        
        // State
        this.driver = null;
        this.engineRunning = false;
        this.currentSpeed = 0;
        this.steeringAngle = 0;
        this.throttle = 0;
        this.brake = 0;
        this.handbrake = false;
        this.headlightsOn = false;
        this.hornActive = false;
        
        // Wheel rotation
        this.wheelRotation = 0;
        this.wheels = [];
        
        // Create mesh
        this.mesh = this.createMesh();
        this.game.scene.add(this.mesh);
        
        // Add physics body
        this.physicsBody = {
            position: this.position,
            velocity: this.velocity,
            collider: {
                type: 'box',
                halfSize: new THREE.Vector3(1, 0.8, 2.2)
            },
            mass: CONFIG.vehicle.lada.mass,
            noGravity: false
        };
        
        // Add to physics
        this.game.physicsEngine.addStaticBody(this.physicsBody);
        
        // Sound
        this.engineSoundId = null;
    }
    
    /**
     * Create vehicle mesh
     */
    createMesh() {
        const group = new THREE.Group();
        
        // Materials
        const bodyMat = new THREE.MeshLambertMaterial({ color: this.color });
        const windowMat = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });
        const chromeMat = new THREE.MeshStandardMaterial({ 
            color: 0xCCCCCC,
            metalness: 0.9,
            roughness: 0.3
        });
        const blackMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const redMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const orangeMat = new THREE.MeshBasicMaterial({ color: 0xFF6600 });
        const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        // Main body
        const bodyGeom = new THREE.BoxGeometry(1.8, 0.7, 4.2);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.55;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Lower body (undercarriage area)
        const lowerGeom = new THREE.BoxGeometry(1.7, 0.25, 4.0);
        const lower = new THREE.Mesh(lowerGeom, blackMat);
        lower.position.y = 0.15;
        group.add(lower);
        
        // Cabin
        const cabinGeom = new THREE.BoxGeometry(1.6, 0.6, 2.2);
        const cabin = new THREE.Mesh(cabinGeom, bodyMat);
        cabin.position.set(0, 1.15, -0.2);
        cabin.castShadow = true;
        group.add(cabin);
        
        // Roof
        const roofGeom = new THREE.BoxGeometry(1.5, 0.1, 1.8);
        const roof = new THREE.Mesh(roofGeom, bodyMat);
        roof.position.set(0, 1.5, -0.2);
        roof.castShadow = true;
        group.add(roof);
        
        // Windshield (front)
        const windshieldGeom = new THREE.BoxGeometry(1.4, 0.5, 0.08);
        const windshield = new THREE.Mesh(windshieldGeom, windowMat);
        windshield.position.set(0, 1.1, 0.85);
        windshield.rotation.x = -0.3;
        group.add(windshield);
        
        // Rear window
        const rearWindowGeom = new THREE.BoxGeometry(1.3, 0.4, 0.08);
        const rearWindow = new THREE.Mesh(rearWindowGeom, windowMat);
        rearWindow.position.set(0, 1.1, -1.25);
        rearWindow.rotation.x = 0.2;
        group.add(rearWindow);
        
        // Side windows
        const sideWindowGeom = new THREE.BoxGeometry(0.08, 0.4, 1.6);
        
        const leftWindow = new THREE.Mesh(sideWindowGeom, windowMat);
        leftWindow.position.set(-0.82, 1.1, -0.2);
        group.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(sideWindowGeom, windowMat);
        rightWindow.position.set(0.82, 1.1, -0.2);
        group.add(rightWindow);
        
        // Hood
        const hoodGeom = new THREE.BoxGeometry(1.6, 0.15, 1.2);
        const hood = new THREE.Mesh(hoodGeom, bodyMat);
        hood.position.set(0, 0.85, 1.4);
        hood.castShadow = true;
        group.add(hood);
        
        // Trunk
        const trunkGeom = new THREE.BoxGeometry(1.5, 0.2, 0.8);
        const trunk = new THREE.Mesh(trunkGeom, bodyMat);
        trunk.position.set(0, 0.8, -1.7);
        trunk.castShadow = true;
        group.add(trunk);
        
        // Front bumper
        const frontBumperGeom = new THREE.BoxGeometry(1.7, 0.2, 0.15);
        const frontBumper = new THREE.Mesh(frontBumperGeom, chromeMat);
        frontBumper.position.set(0, 0.35, 2.15);
        group.add(frontBumper);
        
        // Rear bumper
        const rearBumperGeom = new THREE.BoxGeometry(1.7, 0.2, 0.15);
        const rearBumper = new THREE.Mesh(rearBumperGeom, chromeMat);
        rearBumper.position.set(0, 0.35, -2.15);
        group.add(rearBumper);
        
        // Grille
        const grilleGeom = new THREE.BoxGeometry(1.2, 0.25, 0.05);
        const grille = new THREE.Mesh(grilleGeom, chromeMat);
        grille.position.set(0, 0.55, 2.1);
        group.add(grille);
        
        // Headlights
        const headlightGeom = new THREE.BoxGeometry(0.25, 0.15, 0.1);
        
        this.leftHeadlight = new THREE.Mesh(headlightGeom, whiteMat);
        this.leftHeadlight.position.set(-0.6, 0.55, 2.12);
        group.add(this.leftHeadlight);
        
        this.rightHeadlight = new THREE.Mesh(headlightGeom, whiteMat);
        this.rightHeadlight.position.set(0.6, 0.55, 2.12);
        group.add(this.rightHeadlight);
        
        // Headlight glow (when on)
        const headlightGlowGeom = new THREE.SphereGeometry(0.3, 8, 8);
        const headlightGlowMat = new THREE.MeshBasicMaterial({
            color: 0xFFFF99,
            transparent: true,
            opacity: 0
        });
        
        this.leftHeadlightGlow = new THREE.Mesh(headlightGlowGeom, headlightGlowMat.clone());
        this.leftHeadlightGlow.position.set(-0.6, 0.55, 2.3);
        group.add(this.leftHeadlightGlow);
        
        this.rightHeadlightGlow = new THREE.Mesh(headlightGlowGeom, headlightGlowMat.clone());
        this.rightHeadlightGlow.position.set(0.6, 0.55, 2.3);
        group.add(this.rightHeadlightGlow);
        
        // Tail lights
        const taillightGeom = new THREE.BoxGeometry(0.2, 0.15, 0.05);
        
        const leftTaillight = new THREE.Mesh(taillightGeom, redMat);
        leftTaillight.position.set(-0.7, 0.6, -2.13);
        group.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(taillightGeom, redMat);
        rightTaillight.position.set(0.7, 0.6, -2.13);
        group.add(rightTaillight);
        
        // Turn signals
        const turnSignalGeom = new THREE.BoxGeometry(0.12, 0.1, 0.05);
        
        const leftFrontSignal = new THREE.Mesh(turnSignalGeom, orangeMat);
        leftFrontSignal.position.set(-0.85, 0.5, 2.1);
        group.add(leftFrontSignal);
        
        const rightFrontSignal = new THREE.Mesh(turnSignalGeom, orangeMat);
        rightFrontSignal.position.set(0.85, 0.5, 2.1);
        group.add(rightFrontSignal);
        
        // Door handles
        const handleGeom = new THREE.BoxGeometry(0.15, 0.05, 0.05);
        
        const leftHandle = new THREE.Mesh(handleGeom, chromeMat);
        leftHandle.position.set(-0.92, 0.75, 0.1);
        group.add(leftHandle);
        
        const rightHandle = new THREE.Mesh(handleGeom, chromeMat);
        rightHandle.position.set(0.92, 0.75, 0.1);
        group.add(rightHandle);
        
        // Side mirrors
        const mirrorGeom = new THREE.BoxGeometry(0.15, 0.1, 0.1);
        
        const leftMirror = new THREE.Mesh(mirrorGeom, blackMat);
        leftMirror.position.set(-0.95, 0.95, 0.6);
        group.add(leftMirror);
        
        const rightMirror = new THREE.Mesh(mirrorGeom, blackMat);
        rightMirror.position.set(0.95, 0.95, 0.6);
        group.add(rightMirror);
        
        // Wheels
        const wheelGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 16);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        
        const hubcapGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8);
        const hubcapMat = new THREE.MeshStandardMaterial({
            color: 0xAAAAAA,
            metalness: 0.8,
            roughness: 0.4
        });
        
        const wheelPositions = [
            { x: -0.85, y: 0.32, z: 1.3, steer: true },
            { x: 0.85, y: 0.32, z: 1.3, steer: true },
            { x: -0.85, y: 0.32, z: -1.3, steer: false },
            { x: 0.85, y: 0.32, z: -1.3, steer: false }
        ];
        
        wheelPositions.forEach((pos, index) => {
            const wheelGroup = new THREE.Group();
            
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            wheelGroup.add(wheel);
            
            const hubcap = new THREE.Mesh(hubcapGeom, hubcapMat);
            hubcap.rotation.z = Math.PI / 2;
            hubcap.position.x = index % 2 === 0 ? -0.12 : 0.12;
            wheelGroup.add(hubcap);
            
            wheelGroup.position.set(pos.x, pos.y, pos.z);
            wheelGroup.userData.steer = pos.steer;
            
            group.add(wheelGroup);
            this.wheels.push(wheelGroup);
        });
        
        // License plate (front)
        const plateGeom = new THREE.BoxGeometry(0.5, 0.12, 0.02);
        const plateMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        const frontPlate = new THREE.Mesh(plateGeom, plateMat);
        frontPlate.position.set(0, 0.35, 2.18);
        group.add(frontPlate);
        
        // License plate text
        this.createLicensePlate(group, 'А777АА 77', new THREE.Vector3(0, 0.35, 2.19));
        this.createLicensePlate(group, 'А777АА 77', new THREE.Vector3(0, 0.35, -2.19), Math.PI);
        
        // Exhaust pipe
        const exhaustGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
        const exhaust = new THREE.Mesh(exhaustGeom, chromeMat);
        exhaust.rotation.x = Math.PI / 2;
        exhaust.position.set(0.5, 0.15, -2.25);
        group.add(exhaust);
        
        // Interior details
        // Steering wheel
        const steeringGeom = new THREE.TorusGeometry(0.15, 0.02, 8, 16);
        const steeringMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const steering = new THREE.Mesh(steeringGeom, steeringMat);
        steering.position.set(-0.4, 0.95, 0.5);
        steering.rotation.x = Math.PI / 4;
        group.add(steering);
        this.steeringWheel = steering;
        
        // Seats
        const seatGeom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const seatMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        
        const driverSeat = new THREE.Mesh(seatGeom, seatMat);
        driverSeat.position.set(-0.4, 0.7, 0);
        group.add(driverSeat);
        
        const passengerSeat = new THREE.Mesh(seatGeom, seatMat);
        passengerSeat.position.set(0.4, 0.7, 0);
        group.add(passengerSeat);
        
        // Position the group
        group.position.copy(this.position);
        group.rotation.copy(this.rotation);
        
        return group;
    }
    
    /**
     * Create license plate text
     */
    createLicensePlate(group, text, position, rotationY = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 128, 32);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 16);
        
        // Russian flag stripe
        ctx.fillStyle = '#0039A6';
        ctx.fillRect(100, 5, 20, 7);
        ctx.fillStyle = '#D52B1E';
        ctx.fillRect(100, 19, 20, 7);
        
        const texture = new THREE.CanvasTexture(canvas);
        const plateMat = new THREE.MeshBasicMaterial({ map: texture });
        const plateGeom = new THREE.PlaneGeometry(0.45, 0.11);
        const plate = new THREE.Mesh(plateGeom, plateMat);
        
        plate.position.copy(position);
        plate.rotation.y = rotationY;
        group.add(plate);
    }
    
    /**
     * Set driver
     */
    setDriver(driver) {
        this.driver = driver;
        
        if (driver) {
            this.startEngine();
        } else {
            this.stopEngine();
        }
    }
    
    /**
     * Start engine
     */
    startEngine() {
        if (this.engineRunning) return;
        
        this.engineRunning = true;
        this.game.audioManager?.playSound('engine_start');
        
        // Start engine loop sound
        this.engineSoundId = this.game.audioManager?.playLoopSound('engine_idle');
    }
    
    /**
     * Stop engine
     */
    stopEngine() {
        if (!this.engineRunning) return;
        
        this.engineRunning = false;
        
        if (this.engineSoundId) {
            this.game.audioManager?.stopSound(this.engineSoundId);
            this.engineSoundId = null;
        }
    }
    
    /**
     * Toggle headlights
     */
    toggleHeadlights() {
        this.headlightsOn = !this.headlightsOn;
        
        const opacity = this.headlightsOn ? 0.8 : 0;
        this.leftHeadlightGlow.material.opacity = opacity;
        this.rightHeadlightGlow.material.opacity = opacity;
        
        // Add/remove spotlights for actual light
        if (this.headlightsOn && !this.headlightSpot) {
            this.headlightSpot = new THREE.SpotLight(0xFFFF99, 2, 50, Math.PI / 6, 0.5);
            this.headlightSpot.position.set(0, 0.6, 2.5);
            this.headlightSpot.target.position.set(0, 0, 10);
            this.mesh.add(this.headlightSpot);
            this.mesh.add(this.headlightSpot.target);
        } else if (!this.headlightsOn && this.headlightSpot) {
            this.mesh.remove(this.headlightSpot);
            this.mesh.remove(this.headlightSpot.target);
            this.headlightSpot.dispose();
            this.headlightSpot = null;
        }
    }
    
    /**
     * Honk horn
     */
    honk() {
        if (!this.hornActive) {
            this.hornActive = true;
            this.game.audioManager?.playSound('horn');
            setTimeout(() => { this.hornActive = false; }, 500);
        }
    }
    
    /**
     * Update vehicle
     */
    update(delta) {
        if (!this.driver) {
            // Vehicle is parked - just apply minimal physics
            this.applyParkedPhysics(delta);
            return;
        }
        
        // Get input
        this.handleInput(delta);
        
        // Apply physics
        this.applyDrivingPhysics(delta);
        
        // Update visuals
        this.updateVisuals(delta);
        
        // Update physics body position
        this.physicsBody.position.copy(this.position);
    }
    
    /**
     * Handle driving input
     */
    handleInput(delta) {
        const input = this.game.inputManager;
        
        // Throttle (W or up)
        if (input.isAction('forward')) {
            this.throttle = Math.min(1, this.throttle + delta * 3);
        } else {
            this.throttle = Math.max(0, this.throttle - delta * 5);
        }
        
        // Brake/Reverse (S or down)
        if (input.isAction('backward')) {
            if (this.currentSpeed > 1) {
                this.brake = Math.min(1, this.brake + delta * 4);
            } else {
                this.throttle = -Math.min(0.5, -this.throttle - delta * 2);
                this.brake = 0;
            }
        } else {
            this.brake = Math.max(0, this.brake - delta * 3);
        }
        
        // Steering (A/D or left/right)
        const targetSteering = (input.isAction('left') ? 1 : 0) - (input.isAction('right') ? 1 : 0);
        this.steeringAngle = THREE.MathUtils.lerp(
            this.steeringAngle,
            targetSteering * 0.5,
            delta * 5
        );
        
        // Handbrake (Space)
        this.handbrake = input.isAction('jump');
        
        // Horn (H)
        if (input.isActionJustPressed('vehicle_horn')) {
            this.honk();
        }
        
        // Lights (L)
        if (input.isActionJustPressed('vehicle_lights')) {
            this.toggleHeadlights();
        }
    }
    
    /**
     * Apply driving physics
     */
    applyDrivingPhysics(delta) {
        // Calculate forward direction
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
        
        // Engine force
        let engineForce = this.throttle * this.acceleration;
        
        // Braking force
        let brakingForce = this.brake * this.braking;
        
        // Handbrake
        if (this.handbrake) {
            brakingForce += this.braking * 0.5;
        }
        
        // Calculate speed change
        const speedChange = (engineForce - brakingForce) * delta;
        this.currentSpeed += speedChange;
        
        // Apply friction
        this.currentSpeed *= this.friction;
        
        // Clamp speed
        this.currentSpeed = THREE.MathUtils.clamp(
            this.currentSpeed,
            -this.maxSpeed * 0.3,
            this.maxSpeed
        );
        
        // Apply velocity
        this.velocity.copy(forward).multiplyScalar(this.currentSpeed * delta);
        this.position.add(this.velocity);
        
        // Steering (only when moving)
        if (Math.abs(this.currentSpeed) > 0.5) {
            const turnAmount = this.steeringAngle * this.turnSpeed * delta;
            const turnFactor = Math.min(1, Math.abs(this.currentSpeed) / 20);
            this.rotation.y += turnAmount * turnFactor * Math.sign(this.currentSpeed);
        }
        
        // Ground collision
        if (this.position.y < 0.32) {
            this.position.y = 0.32;
        }
        
        // Update mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        
        // Update engine sound pitch based on speed
        if (this.engineSoundId) {
            const pitch = 0.8 + (Math.abs(this.currentSpeed) / this.maxSpeed) * 0.8;
            this.game.audioManager?.setSoundPitch(this.engineSoundId, pitch);
        }
        
        // Update statistics
        if (this.driver === this.game.player) {
            this.game.gameState.statistics.distanceDriven += this.velocity.length();
        }
    }
    
    /**
     * Apply physics when parked
     */
    applyParkedPhysics(delta) {
        // Just ensure vehicle stays on ground
        if (this.position.y > 0.32) {
            this.position.y = Math.max(0.32, this.position.y - 9.8 * delta);
            this.mesh.position.y = this.position.y;
        }
    }
    
    /**
     * Update visual elements
     */
    updateVisuals(delta) {
        // Wheel rotation based on speed
        this.wheelRotation += this.currentSpeed * delta * 3;
        
        for (const wheel of this.wheels) {
            // Rotate wheel based on movement
            wheel.children[0].rotation.x = this.wheelRotation;
            wheel.children[1].rotation.x = this.wheelRotation;
            
            // Steer front wheels
            if (wheel.userData.steer) {
                wheel.rotation.y = this.steeringAngle * 0.6;
            }
        }
        
        // Rotate steering wheel
        if (this.steeringWheel) {
            this.steeringWheel.rotation.z = -this.steeringAngle * 1.5;
        }
        
        // Body roll based on steering
        const targetRoll = -this.steeringAngle * 0.05 * Math.min(1, Math.abs(this.currentSpeed) / 30);
        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, targetRoll, delta * 5);
        
        // Pitch based on acceleration
        const targetPitch = -this.throttle * 0.02 + this.brake * 0.03;
        this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, targetPitch, delta * 3);
    }
    
    /**
     * Get vehicle info for UI
     */
    getInfo() {
        return {
            type: this.type,
            speed: Math.abs(this.currentSpeed),
            maxSpeed: this.maxSpeed,
            fuel: 100, // TODO: implement fuel system
            damage: 0,
            headlights: this.headlightsOn
        };
    }
    
    /**
     * Dispose vehicle
     */
    dispose() {
        this.stopEngine();
        
        this.game.scene.remove(this.mesh);
        
        this.mesh.traverse(child => {
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

export default LadaVehicle;