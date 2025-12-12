// ==================== VEHICLE ====================
import { CONFIG } from '../config.js';
import { GameState } from '../state.js';
import { Renderer } from '../engine/renderer.js';
import { Input } from '../engine/input.js';

export class Vehicle {
    constructor(type, position, rotation = 0) {
        this.type = type;
        this.config = CONFIG.ladaModels[type];
        this.mesh = null;
        this.velocity = 0;
        this.steerAngle = 0;
        this.fuel = this.config.fuelCapacity;
        this.isOccupied = false;
        
        this.position = new THREE.Vector3(position.x, 0.4, position.z);
        this.rotation = rotation;
        
        this.create();
    }
    
    create() {
        this.mesh = new THREE.Group();
        
        // Корпус
        const bodyGeo = new THREE.BoxGeometry(2, 0.8, 4.2);
        const bodyMat = new THREE.MeshLambertMaterial({ color: this.config.color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        body.castShadow = true;
        body.receiveShadow = true;
        this.mesh.add(body);
        
        // Кабина
        const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2);
        const cabinMat = new THREE.MeshLambertMaterial({ color: this.config.color });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 1.2, -0.3);
        cabin.castShadow = true;
        this.mesh.add(cabin);
        
        // Окна
        const glassMat = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB, 
            transparent: true, 
            opacity: 0.6 
        });
        
        // Лобовое стекло
        const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), glassMat);
        windshield.position.set(0, 1.2, 0.75);
        windshield.rotation.x = -0.2;
        this.mesh.add(windshield);
        
        // Заднее стекло
        const rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), glassMat);
        rearWindow.position.set(0, 1.2, -1.35);
        rearWindow.rotation.x = 0.2;
        rearWindow.rotation.y = Math.PI;
        this.mesh.add(rearWindow);
        
        // Боковые окна
        const sideWindowGeo = new THREE.PlaneGeometry(1.8, 0.5);
        const leftWindow = new THREE.Mesh(sideWindowGeo, glassMat);
        leftWindow.position.set(-0.91, 1.2, -0.3);
        leftWindow.rotation.y = Math.PI / 2;
        this.mesh.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(sideWindowGeo, glassMat);
        rightWindow.position.set(0.91, 1.2, -0.3);
        rightWindow.rotation.y = -Math.PI / 2;
        this.mesh.add(rightWindow);
        
        // Колёса
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const hubMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        
        const wheelPositions = [
            { x: -0.9, z: 1.2 },
            { x: 0.9, z: 1.2 },
            { x: -0.9, z: -1.2 },
            { x: 0.9, z: -1.2 }
        ];
        
        this.wheels = [];
        wheelPositions.forEach((pos, i) => {
            const wheelGroup = new THREE.Group();
            
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheelGroup.add(wheel);
            
            // Колпак
            const hub = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.26, 8),
                hubMat
            );
            hub.rotation.z = Math.PI / 2;
            wheelGroup.add(hub);
            
            wheelGroup.position.set(pos.x, 0.35, pos.z);
            this.mesh.add(wheelGroup);
            this.wheels.push(wheelGroup);
        });
        
        // Фары
        const headlightGeo = new THREE.CircleGeometry(0.12, 8);
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });
        
        const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
        leftHeadlight.position.set(-0.6, 0.6, 2.11);
        this.mesh.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
        rightHeadlight.position.set(0.6, 0.6, 2.11);
        this.mesh.add(rightHeadlight);
        
        // Задние фонари
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        
        const leftTaillight = new THREE.Mesh(headlightGeo, taillightMat);
        leftTaillight.position.set(-0.6, 0.6, -2.11);
        leftTaillight.rotation.y = Math.PI;
        this.mesh.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(headlightGeo, taillightMat);
        rightTaillight.position.set(0.6, 0.6, -2.11);
        rightTaillight.rotation.y = Math.PI;
        this.mesh.add(rightTaillight);
        
        // Номерной знак
        this.createLicensePlate();
        
        // Позиционирование
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
        
        Renderer.add(this.mesh);
    }
    
    createLicensePlate() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 128, 32);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        
        const letters = 'АВЕКМНОРСТУХ';
        const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
        const randomNum = () => Math.floor(Math.random() * 10);
        
        const plateText = `${randomLetter()}${randomNum()}${randomNum()}${randomNum()}${randomLetter()}${randomLetter()}`;
        ctx.fillText(plateText, 64, 22);
        
        // Регион
        ctx.font = 'bold 12px Arial';
        ctx.fillText('77', 110, 12);
        
        // Флаг
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(100, 16, 24, 4);
        ctx.fillStyle = '#0039A6';
        ctx.fillRect(100, 20, 24, 4);
        ctx.fillStyle = '#D52B1E';
        ctx.fillRect(100, 24, 24, 4);
        
        const texture = new THREE.CanvasTexture(canvas);
        const plateMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.12),
            new THREE.MeshBasicMaterial({ map: texture })
        );
        plateMesh.position.set(0, 0.4, -2.12);
        plateMesh.rotation.y = Math.PI;
        this.mesh.add(plateMesh);
        
        // Передний номер
        const frontPlate = plateMesh.clone();
        frontPlate.position.set(0, 0.4, 2.12);
        frontPlate.rotation.y = 0;
        this.mesh.add(frontPlate);
    }
    
    update(delta) {
        if (!this.isOccupied) return;
        
        // Обработка управления
        this.handleInput(delta);
        
        // Обновление физики
        this.updatePhysics(delta);
        
        // Обновление камеры
        this.updateCamera();
        
        // Вращение колёс
        this.updateWheels(delta);
        
        // Расход топлива
        this.consumeFuel(delta);
    }
    
    handleInput(delta) {
        const maxSpeed = this.config.maxSpeed;
        const acceleration = this.config.acceleration;
        const brakeForce = CONFIG.vehicle.brakeForce;
        const turnSpeed = CONFIG.vehicle.turnSpeed;
        
        // Газ/тормоз
        if (Input.isMovingForward()) {
            if (this.velocity < 0) {
                // Тормозим при движении назад
                this.velocity += brakeForce * delta;
            } else {
                this.velocity += acceleration * delta;
            }
        } else if (Input.isMovingBackward()) {
            if (this.velocity > 0) {
                // Тормозим при движении вперёд
                this.velocity -= brakeForce * delta;
            } else {
                this.velocity -= acceleration * 0.5 * delta;
            }
        } else {
            // Трение
            this.velocity *= CONFIG.vehicle.friction;
        }
        
        // Ограничение скорости
        this.velocity = Math.max(-CONFIG.vehicle.reverseSpeed, Math.min(maxSpeed, this.velocity));
        
        // Руление (только при движении)
        if (Math.abs(this.velocity) > 0.5) {
            const turnMultiplier = Math.min(1, Math.abs(this.velocity) / 10);
            
            if (Input.isMovingLeft()) {
                this.steerAngle += turnSpeed * turnMultiplier * delta * (this.velocity > 0 ? 1 : -1);
            }
            if (Input.isMovingRight()) {
                this.steerAngle -= turnSpeed * turnMultiplier * delta * (this.velocity > 0 ? 1 : -1);
            }
        }
        
        // Возврат руля
        this.steerAngle *= 0.92;
        
        // Ограничение угла поворота
        this.steerAngle = Math.max(-0.6, Math.min(0.6, this.steerAngle));
    }
    
    updatePhysics(delta) {
        // Поворот
        this.rotation += this.steerAngle * delta * Math.abs(this.velocity) * 0.1;
        
        // Движение
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        this.position.x += forward.x * this.velocity * delta;
        this.position.z += forward.z * this.velocity * delta;
        
        // Ограничение мира
        const worldLimit = CONFIG.world.size - 10;
        this.position.x = Math.max(-worldLimit, Math.min(worldLimit, this.position.x));
        this.position.z = Math.max(-worldLimit, Math.min(worldLimit, this.position.z));
        
        // Применение к мешу
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
        
        // Статистика
        GameState.statistics.distanceDriven += Math.abs(this.velocity) * delta;
    }
    
    updateCamera() {
        const camera = Renderer.camera;
        
        // Позиция камеры сзади машины
        const cameraOffset = new THREE.Vector3(0, 4, -8);
        cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        const targetCameraPos = this.position.clone().add(cameraOffset);
        camera.position.lerp(targetCameraPos, 0.1);
        
        // Смотрим на машину
        const lookTarget = this.position.clone();
        lookTarget.y += 1;
        camera.lookAt(lookTarget);
    }
    
    updateWheels(delta) {
        const wheelRotation = this.velocity * delta * 2;
        
        this.wheels.forEach((wheel, i) => {
            // Вращение колеса
            wheel.children[0].rotation.x += wheelRotation;
            wheel.children[1].rotation.x += wheelRotation;
            
            // Поворот передних колёс
            if (i < 2) {
                wheel.rotation.y = this.steerAngle * 0.5;
            }
        });
    }
    
    consumeFuel(delta) {
        if (Math.abs(this.velocity) > 0.5) {
            this.fuel -= CONFIG.vehicle.fuelConsumption * Math.abs(this.velocity) * delta;
            
            if (this.fuel <= 0) {
                this.fuel = 0;
                this.velocity *= 0.95; // Замедление без топлива
            }
        }
    }
    
    enter(player) {
        this.isOccupied = true;
        GameState.player.inVehicle = true;
        GameState.player.currentVehicle = this;
        
        // Переключить камеру
        Renderer.camera.position.set(0, 4, -8);
        this.mesh.add(Renderer.camera);
    }
    
    exit() {
        this.isOccupied = false;
        GameState.player.inVehicle = false;
        GameState.player.currentVehicle = null;
        
        // Вернуть камеру игроку
        this.mesh.remove(Renderer.camera);
        
        // Позиция выхода
        const exitOffset = new THREE.Vector3(-2.5, 0, 0);
        exitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        
        return {
            x: this.position.x + exitOffset.x,
            y: 0,
            z: this.position.z + exitOffset.z
        };
    }
    
    getSpeed() {
        return Math.abs(this.velocity * 3.6).toFixed(0); // км/ч
    }
    
    getFuelPercent() {
        return (this.fuel / this.config.fuelCapacity) * 100;
    }
    
    refuel(amount) {
        this.fuel = Math.min(this.config.fuelCapacity, this.fuel + amount);
    }
    
    getInteractionPosition() {
        return this.position.clone();
    }
    
    getInteractionRadius() {
        return 3;
    }
    
    destroy() {
        Renderer.remove(this.mesh);
    }
}