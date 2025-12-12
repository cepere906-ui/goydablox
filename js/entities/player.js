// ==================== PLAYER ====================
import { CONFIG } from '../config.js';
import { GameState } from '../state.js';
import { Renderer } from '../engine/renderer.js';
import { Input } from '../engine/input.js';
import { Physics } from '../engine/physics.js';

class PlayerController {
    constructor() {
        this.object = null;
        this.camera = null;
        this.velocity = new THREE.Vector3();
        this.rotation = { x: 0, y: 0 };
        this.onGround = true;
        this.jumpVelocity = 0;
    }
    
    init() {
        // Create player object
        this.object = new THREE.Object3D();
        this.object.position.set(0, CONFIG.player.height, 10);
        
        // Attach camera
        this.camera = Renderer.camera;
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.order = 'YXZ';
        this.object.add(this.camera);
        
        Renderer.add(this.object);
        
        // Sync with game state
        this.syncFromState();
        
        return this;
    }
    
    syncFromState() {
        if (GameState.player.position) {
            this.object.position.set(
                GameState.player.position.x,
                GameState.player.position.y,
                GameState.player.position.z
            );
        }
        if (GameState.player.rotation) {
            this.rotation.x = GameState.player.rotation.x;
            this.rotation.y = GameState.player.rotation.y;
        }
    }
    
    syncToState() {
        GameState.player.position.x = this.object.position.x;
        GameState.player.position.y = this.object.position.y;
        GameState.player.position.z = this.object.position.z;
        GameState.player.rotation.x = this.rotation.x;
        GameState.player.rotation.y = this.rotation.y;
        GameState.player.onGround = this.onGround;
    }
    
    update(delta) {
        if (GameState.player.inVehicle) {
            return; // Управление передано транспорту
        }
        
        // Обработка вращения камеры
        this.handleRotation();
        
        // Обработка движения
        this.handleMovement(delta);
        
        // Обработка гравитации и прыжков
        this.handleGravity(delta);
        
        // Синхронизация состояния
        this.syncToState();
    }
    
    handleRotation() {
        if (!Input.isPointerLocked) return;
        
        const sensitivity = CONFIG.camera.sensitivity * (GameState.settings.sensitivity / 5);
        const invertY = GameState.settings.invertY ? -1 : 1;
        
        this.rotation.y -= Input.mouse.dx * sensitivity;
        this.rotation.x -= Input.mouse.dy * sensitivity * invertY;
        
        // Clamp vertical rotation
        this.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.rotation.x));
        
        // Apply rotation
        this.object.rotation.y = this.rotation.y;
        this.camera.rotation.x = this.rotation.x;
        
        Input.resetMouseDelta();
    }
    
    handleMovement(delta) {
        const movement = Input.getMovementVector();
        
        if (movement.x === 0 && movement.z === 0) {
            // Friction
            this.velocity.x *= 0.85;
            this.velocity.z *= 0.85;
        } else {
            // Calculate speed
            const isRunning = Input.isRunning();
            const speed = isRunning ? CONFIG.player.runSpeed : CONFIG.player.walkSpeed;
            GameState.player.isRunning = isRunning;
            
            // Calculate direction based on camera
            const direction = new THREE.Vector3(movement.x, 0, movement.z);
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
            
            // Apply acceleration
            this.velocity.x += direction.x * speed * delta * 10;
            this.velocity.z += direction.z * speed * delta * 10;
            
            // Clamp velocity
            const maxSpeed = speed;
            const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
            if (currentSpeed > maxSpeed) {
                this.velocity.x = (this.velocity.x / currentSpeed) * maxSpeed;
                this.velocity.z = (this.velocity.z / currentSpeed) * maxSpeed;
            }
        }
        
        // Check collision before moving
        const newPosition = {
            x: this.object.position.x + this.velocity.x * delta,
            y: this.object.position.y,
            z: this.object.position.z + this.velocity.z * delta
        };
        
        const collision = Physics.checkPlayerCollision(newPosition, 0.4);
        
        if (collision.collided) {
            // Slide along wall
            this.velocity.x -= collision.normal.x * collision.penetration * 2;
            this.velocity.z -= collision.normal.z * collision.penetration * 2;
        }
        
        // Apply velocity
        this.object.position.x += this.velocity.x * delta;
        this.object.position.z += this.velocity.z * delta;
        
        // Track distance walked
        const distance = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z) * delta;
        GameState.statistics.distanceWalked += distance;
    }
    
    handleGravity(delta) {
        const groundHeight = Physics.getGroundHeight(this.object.position.x, this.object.position.z);
        const playerBottom = this.object.position.y - CONFIG.player.height;
        
        if (playerBottom > groundHeight) {
            // In air
            this.onGround = false;
            this.jumpVelocity -= CONFIG.player.gravity * delta;
        } else {
            // On ground
            if (!this.onGround) {
                // Just landed
                this.jumpVelocity = 0;
            }
            this.onGround = true;
            this.object.position.y = groundHeight + CONFIG.player.height;
            
            // Jump
            if (Input.isJumping() && this.onGround) {
                this.jumpVelocity = CONFIG.player.jumpForce;
                this.onGround = false;
            }
        }
        
        // Apply vertical velocity
        this.object.position.y += this.jumpVelocity * delta;
        
        // Prevent falling through ground
        if (this.object.position.y < groundHeight + CONFIG.player.height) {
            this.object.position.y = groundHeight + CONFIG.player.height;
            this.jumpVelocity = 0;
            this.onGround = true;
        }
    }
    
    getPosition() {
        return this.object.position.clone();
    }
    
    setPosition(x, y, z) {
        this.object.position.set(x, y, z);
        this.syncToState();
    }
    
    getForwardVector() {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
        return forward;
    }
    
    // Войти в транспорт
    enterVehicle(vehicle) {
        GameState.player.inVehicle = true;
        GameState.player.currentVehicle = vehicle;
        this.object.visible = false;
    }
    
    // Выйти из транспорта
    exitVehicle(position) {
        GameState.player.inVehicle = false;
        GameState.player.currentVehicle = null;
        this.object.visible = true;
        this.setPosition(position.x, position.y + CONFIG.player.height, position.z);
        this.velocity.set(0, 0, 0);
    }
}

export const Player = new PlayerController();