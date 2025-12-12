// ==================== INPUT MANAGER ====================
import { CONFIG } from '../config.js';
import { GameState } from '../state.js';

class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, dx: 0, dy: 0 };
        this.isPointerLocked = false;
        this.listeners = {};
    }
    
    init() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('click', (e) => this.onClick(e));
        
        // Pointer lock
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => this.onPointerLockError());
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            if (this.isPointerLocked) e.preventDefault();
        });
        
        return this;
    }
    
    onKeyDown(e) {
        this.keys[e.code] = true;
        
        // Emit event
        this.emit('keydown', e.code);
        
        // Handle specific keys
        if (e.code === CONFIG.controls.pause && GameState.isRunning) {
            this.emit('pause');
        }
        
        if (e.code === CONFIG.controls.interact) {
            this.emit('interact');
        }
        
        if (e.code === CONFIG.controls.vehicle) {
            this.emit('vehicle');
        }
        
        if (e.code === CONFIG.controls.inventory) {
            this.emit('inventory');
        }
        
        if (e.code === CONFIG.controls.jump) {
            this.emit('jump');
        }
    }
    
    onKeyUp(e) {
        this.keys[e.code] = false;
        this.emit('keyup', e.code);
    }
    
    onMouseMove(e) {
        if (this.isPointerLocked) {
            this.mouse.dx = e.movementX;
            this.mouse.dy = e.movementY;
            this.emit('mousemove', { dx: e.movementX, dy: e.movementY });
        }
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }
    
    onMouseDown(e) {
        this.emit('mousedown', e.button);
    }
    
    onMouseUp(e) {
        this.emit('mouseup', e.button);
    }
    
    onClick(e) {
        // Request pointer lock on click if game is running
        if (GameState.isRunning && !GameState.isPaused && !this.isPointerLocked) {
            this.requestPointerLock();
        }
        this.emit('click', e.button);
    }
    
    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement !== null;
        this.emit('pointerlockchange', this.isPointerLocked);
        
        // Show/hide crosshair
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            crosshair.classList.toggle('hidden', !this.isPointerLocked);
        }
    }
    
    onPointerLockError() {
        console.error('Pointer lock error');
    }
    
    requestPointerLock() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.requestPointerLock();
        }
    }
    
    exitPointerLock() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    
    isKeyPressed(code) {
        return this.keys[code] === true;
    }
    
    isMovingForward() {
        return this.isKeyPressed(CONFIG.controls.forward);
    }
    
    isMovingBackward() {
        return this.isKeyPressed(CONFIG.controls.backward);
    }
    
    isMovingLeft() {
        return this.isKeyPressed(CONFIG.controls.left);
    }
    
    isMovingRight() {
        return this.isKeyPressed(CONFIG.controls.right);
    }
    
    isRunning() {
        return this.isKeyPressed(CONFIG.controls.run);
    }
    
    isJumping() {
        return this.isKeyPressed(CONFIG.controls.jump);
    }
    
    getMovementVector() {
        let x = 0, z = 0;
        
        if (this.isMovingForward()) z -= 1;
        if (this.isMovingBackward()) z += 1;
        if (this.isMovingLeft()) x -= 1;
        if (this.isMovingRight()) x += 1;
        
        // Normalize
        const length = Math.sqrt(x * x + z * z);
        if (length > 0) {
            x /= length;
            z /= length;
        }
        
        return { x, z };
    }
    
    resetMouseDelta() {
        this.mouse.dx = 0;
        this.mouse.dy = 0;
    }
    
    // Event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

export const Input = new InputManager();