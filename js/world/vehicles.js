// ==================== VEHICLE MANAGER ====================
import { Vehicle } from '../entities/vehicle.js';
import { CONFIG } from '../config.js';

class VehicleManager {
    constructor() {
        this.vehicles = [];
        this.maxVehicles = 30;
        this.spawnPoints = [];
    }
    
    init(scene) {
        this.scene = scene;
        this.generateSpawnPoints();
        this.spawnInitialVehicles();
        return this;
    }
    
    generateSpawnPoints() {
        // Точки спавна вдоль дорог
        const roadSpacing = CONFIG.world.blockSize;
        const gridSize = 4;
        
        for (let i = -gridSize; i <= gridSize; i++) {
            for (let j = -gridSize; j <= gridSize; j++) {
                // Вдоль вертикальных дорог
                this.spawnPoints.push({
                    x: i * roadSpacing + 8,
                    z: j * roadSpacing + Math.random() * 40 - 20,
                    rotation: Math.random() > 0.5 ? 0 : Math.PI
                });
                
                // Вдоль горизонтальных дорог
                this.spawnPoints.push({
                    x: i * roadSpacing + Math.random() * 40 - 20,
                    z: j * roadSpacing + 8,
                    rotation: Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2
                });
            }
        }
        
        // Парковки у зданий
        const parkingSpots = [
            // У администрации
            { x: -25, z: -55, rotation: 0 },
            { x: -20, z: -55, rotation: 0 },
            { x: -15, z: -55, rotation: 0 },
            
            // У военкомата
            { x: 55, z: -25, rotation: Math.PI / 2 },
            { x: 55, z: -20, rotation: Math.PI / 2 },
            
            // У центра рождаемости
            { x: -55, z: 25, rotation: -Math.PI / 2 },
            { x: -55, z: 30, rotation: -Math.PI / 2 },
            
            // У банков
            { x: 25, z: 55, rotation: Math.PI },
            { x: 30, z: 55, rotation: Math.PI },
            
            // Центральная площадь
            { x: 15, z: 15, rotation: Math.PI / 4 },
            { x: -15, z: 15, rotation: -Math.PI / 4 },
            { x: 15, z: -15, rotation: 3 * Math.PI / 4 },
            { x: -15, z: -15, rotation: -3 * Math.PI / 4 }
        ];
        
        this.spawnPoints.push(...parkingSpots);
    }
    
    spawnInitialVehicles() {
        // Спавн начальных машин
        const vehicleCount = Math.min(this.maxVehicles, 15);
        const usedPoints = new Set();
        
        for (let i = 0; i < vehicleCount; i++) {
            let pointIndex;
            let attempts = 0;
            
            do {
                pointIndex = Math.floor(Math.random() * this.spawnPoints.length);
                attempts++;
            } while (usedPoints.has(pointIndex) && attempts < 50);
            
            if (attempts >= 50) break;
            
            usedPoints.add(pointIndex);
            const point = this.spawnPoints[pointIndex];
            
            this.spawnVehicle(point.x, point.z, point.rotation);
        }
    }
    
    spawnVehicle(x, z, rotation = 0) {
        if (this.vehicles.length >= this.maxVehicles) return null;
        
        // Выбрать случайную модель
        const models = Object.keys(CONFIG.vehicles.ladaModels);
        const modelId = models[Math.floor(Math.random() * models.length)];
        
        const vehicle = new Vehicle(modelId);
        vehicle.init(this.scene);
        vehicle.setPosition(x, 0.5, z);
        vehicle.setRotation(rotation);
        
        // Случайный уровень топлива
        vehicle.fuel = 20 + Math.random() * 80;
        
        // Случайное состояние (некоторые машины повреждены)
        if (Math.random() < 0.2) {
            vehicle.health = 30 + Math.random() * 40;
        }
        
        this.vehicles.push(vehicle);
        return vehicle;
    }
    
    removeVehicle(vehicle) {
        const index = this.vehicles.indexOf(vehicle);
        if (index !== -1) {
            vehicle.destroy();
            this.vehicles.splice(index, 1);
        }
    }
    
    getNearestVehicle(position, maxDistance = 5) {
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (const vehicle of this.vehicles) {
            if (vehicle.isOccupied) continue;
            
            const dist = vehicle.getDistanceTo(position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = vehicle;
            }
        }
        
        return nearest;
    }
    
    getVehicleAt(position, radius = 3) {
        for (const vehicle of this.vehicles) {
            if (vehicle.getDistanceTo(position) < radius) {
                return vehicle;
            }
        }
        return null;
    }
    
    update(deltaTime) {
        for (const vehicle of this.vehicles) {
            vehicle.update(deltaTime);
        }
        
        // Респавн машин если их мало
        if (this.vehicles.length < 10 && Math.random() < 0.01) {
            const point = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
            
            // Проверить что точка свободна
            const occupied = this.vehicles.some(v => 
                v.getDistanceTo({ x: point.x, z: point.z }) < 5
            );
            
            if (!occupied) {
                this.spawnVehicle(point.x, point.z, point.rotation);
            }
        }
    }
    
    getAllVehicles() {
        return this.vehicles;
    }
    
    getVehicleData() {
        return this.vehicles.map(v => ({
            position: v.mesh.position,
            rotation: v.mesh.rotation.y,
            model: v.modelId
        }));
    }
}

export const Vehicles = new VehicleManager();