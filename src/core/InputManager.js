/**
 * ГОЙДАБЛОКС - Input Manager
 * Handles all keyboard, mouse, and gamepad input
 */

import { CONFIG } from '../config/GameConfig.js';

export class InputManager {
    constructor(game) {
        this.game = game;
        
        // Key states
        this.keys = {};
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        
        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: {},
            wheel: 0,
            locked: false
        };
        
        // Touch state
        this.touch = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            joystick: { x: 0, y: 0 }
        };
        
        // Gamepad state
        this.gamepad = null;
        this.gamepadAxes = [0, 0, 0, 0];
        this.gamepadButtons = [];
        
        // Input bindings
        this.bindings = {
            forward: ['KeyW', 'ArrowUp'],
            backward: ['KeyS', 'ArrowDown'],
            left: ['KeyA', 'ArrowLeft'],
            right: ['KeyD', 'ArrowRight'],
            jump: ['Space'],
            sprint: ['ShiftLeft', 'ShiftRight'],
            crouch: ['KeyC', 'ControlLeft'],
            interact: ['KeyE', 'KeyF'],
            inventory: ['KeyI', 'Tab'],
            map: ['KeyM'],
            pause: ['Escape'],
            vehicle_enter: ['KeyF'],
            vehicle_horn: ['KeyH'],
            vehicle_lights: ['KeyL'],
            attack: ['Mouse0'],
            aim: ['Mouse2'],
            reload: ['KeyR'],
            phone: ['KeyP'],
            quicksave: ['F5'],
            quickload: ['F9']
        };
        
        // Action states
        this.actions = {};
        Object.keys(this.bindings).forEach(action => {
            this.actions[action] = false;
        });
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize input listeners
     */
    init() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('wheel', (e) => this.onWheel(e));
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => this.onPointerLockError());
        
        // Touch events (mobile)
        document.addEventListener('touchstart', (e) => this.onTouchStart(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e));
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Gamepad events
        window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));
        
        console.log('🎮 InputManager initialized');
    }
    
    /**
     * Handle key down
     */
    onKeyDown(event) {
        const code = event.code;
        
        // Prevent default for game keys
        if (this.isGameKey(code)) {
            event.preventDefault();
        }
        
        // Track just pressed
        if (!this.keys[code]) {
            this.keysJustPressed[code] = true;
        }
        
        this.keys[code] = true;
        
        // Handle special keys
        this.handleSpecialKeys(code);
    }
    
    /**
     * Handle key up
     */
    onKeyUp(event) {
        const code = event.code;
        
        this.keys[code] = false;
        this.keysJustReleased[code] = true;
    }
    
    /**
     * Handle special key actions
     */
    handleSpecialKeys(code) {
        // Pause
        if (this.bindings.pause.includes(code)) {
            if (this.mouse.locked) {
                document.exitPointerLock();
                this.game.pause();
            } else if (this.game.isPaused) {
                this.game.resume();
            }
        }
        
        // Quicksave
        if (this.bindings.quicksave.includes(code)) {
            this.game.saveSystem?.quickSave();
        }
        
        // Quickload
        if (this.bindings.quickload.includes(code)) {
            this.game.saveSystem?.quickLoad();
        }
    }
    
    /**
     * Handle mouse move
     */
    onMouseMove(event) {
        if (this.mouse.locked) {
            this.mouse.deltaX = event.movementX;
            this.mouse.deltaY = event.movementY;
        } else {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
            this.mouse.deltaX = 0;
            this.mouse.deltaY = 0;
        }
    }
    
    /**
     * Handle mouse down
     */
    onMouseDown(event) {
        this.mouse.buttons[`Mouse${event.button}`] = true;
        
        // Request pointer lock on click if game is running
        if (!this.mouse.locked && this.game.isRunning && !this.game.isPaused) {
            this.requestPointerLock();
        }
    }
    
    /**
     * Handle mouse up
     */
    onMouseUp(event) {
        this.mouse.buttons[`Mouse${event.button}`] = false;
    }
    
    /**
     * Handle mouse wheel
     */
    onWheel(event) {
        this.mouse.wheel = Math.sign(event.deltaY);
    }
    
    /**
     * Handle pointer lock change
     */
    onPointerLockChange() {
        this.mouse.locked = document.pointerLockElement !== null;
        
        if (!this.mouse.locked && this.game.isRunning && !this.game.isPaused) {
            // Lost pointer lock unexpectedly
        }
    }
    
    /**
     * Handle pointer lock error
     */
    onPointerLockError() {
        console.error('Pointer lock failed');
    }
    
    /**
     * Handle touch start
     */
    onTouchStart(event) {
        this.touch.active = true;
        const touch = event.touches[0];
        this.touch.startX = touch.clientX;
        this.touch.startY = touch.clientY;
        this.touch.currentX = touch.clientX;
        this.touch.currentY = touch.clientY;
    }
    
    /**
     * Handle touch move
     */
    onTouchMove(event) {
        if (!this.touch.active) return;
        
        const touch = event.touches[0];
        this.touch.currentX = touch.clientX;
        this.touch.currentY = touch.clientY;
        
        // Calculate virtual joystick
        const dx = this.touch.currentX - this.touch.startX;
        const dy = this.touch.currentY - this.touch.startY;
        const maxDistance = 100;
        
        this.touch.joystick.x = Math.max(-1, Math.min(1, dx / maxDistance));
        this.touch.joystick.y = Math.max(-1, Math.min(1, dy / maxDistance));
    }
    
    /**
     * Handle touch end
     */
    onTouchEnd(event) {
        this.touch.active = false;
        this.touch.joystick.x = 0;
        this.touch.joystick.y = 0;
    }
    
    /**
     * Handle gamepad connected
     */
    onGamepadConnected(event) {
        console.log('🎮 Gamepad connected:', event.gamepad.id);
        this.gamepad = event.gamepad;
    }
    
    /**
     * Handle gamepad disconnected
     */
    onGamepadDisconnected(event) {
        console.log('🎮 Gamepad disconnected');
        this.gamepad = null;
    }
    
    /**
     * Request pointer lock
     */
    requestPointerLock() {
        const canvas = this.game.renderer?.domElement;
        if (canvas) {
            canvas.requestPointerLock();
        }
    }
    
    /**
     * Exit pointer lock
     */
    exitPointerLock() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    
    /**
     * Check if key code is a game key
     */
    isGameKey(code) {
        for (const action in this.bindings) {
            if (this.bindings[action].includes(code)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Update input states
     */
    update(delta) {
        // Update action states from bindings
        for (const action in this.bindings) {
            const keys = this.bindings[action];
            this.actions[action] = keys.some(key => {
                if (key.startsWith('Mouse')) {
                    return this.mouse.buttons[key];
                }
                return this.keys[key];
            });
        }
        
        // Update gamepad
        this.updateGamepad();
        
        // Clear just pressed/released states
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        this.mouse.wheel = 0;
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
    }
    
    /**
     * Update gamepad state
     */
    updateGamepad() {
        if (!this.gamepad) return;
        
        // Get fresh gamepad data
        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepad.index];
        if (!gp) return;
        
        // Update axes
        this.gamepadAxes = [...gp.axes];
        
        // Update buttons
        this.gamepadButtons = gp.buttons.map(b => b.pressed);
        
        // Map gamepad to actions
        if (Math.abs(this.gamepadAxes[0]) > 0.1) {
            this.touch.joystick.x = this.gamepadAxes[0];
        }
        if (Math.abs(this.gamepadAxes[1]) > 0.1) {
            this.touch.joystick.y = this.gamepadAxes[1];
        }
    }
    
    /**
     * Check if action is active
     */
    isAction(action) {
        return this.actions[action] || false;
    }
    
    /**
     * Check if action was just pressed
     */
    isActionJustPressed(action) {
        const keys = this.bindings[action];
        return keys.some(key => this.keysJustPressed[key]);
    }
    
    /**
     * Check if action was just released
     */
    isActionJustReleased(action) {
        const keys = this.bindings[action];
        return keys.some(key => this.keysJustReleased[key]);
    }
    
    /**
     * Get movement vector from input
     */
    getMovementVector() {
        let x = 0;
        let z = 0;
        
        // Keyboard input
        if (this.isAction('forward')) z -= 1;
        if (this.isAction('backward')) z += 1;
        if (this.isAction('left')) x -= 1;
        if (this.isAction('right')) x += 1;
        
        // Touch/gamepad input
        if (this.touch.joystick.x !== 0 || this.touch.joystick.y !== 0) {
            x = this.touch.joystick.x;
            z = this.touch.joystick.y;
        }
        
        // Normalize
        const length = Math.sqrt(x * x + z * z);
        if (length > 1) {
            x /= length;
            z /= length;
        }
        
        return { x, z };
    }
    
    /**
     * Get look delta from mouse/touch
     */
    getLookDelta() {
        return {
            x: this.mouse.deltaX * CONFIG.camera.mouseSensitivity,
            y: this.mouse.deltaY * CONFIG.camera.mouseSensitivity
        };
    }
    
    /**
     * Get scroll delta
     */
    getScrollDelta() {
        return this.mouse.wheel;
    }
    
    /**
     * Rebind an action
     */
    rebind(action, newKeys) {
        if (this.bindings[action]) {
            this.bindings[action] = Array.isArray(newKeys) ? newKeys : [newKeys];
        }
    }
    
    /**
     * Get current bindings
     */
    getBindings() {
        return { ...this.bindings };
    }
    
    /**
     * Check if pointer is locked
     */
    isPointerLocked() {
        return this.mouse.locked;
    }
    
    /**
     * Clean up
     */
    dispose() {
        // Remove event listeners would go here
        // In practice, we don't need to remove them since game lifetime = page lifetime
    }
}

export default InputManager;