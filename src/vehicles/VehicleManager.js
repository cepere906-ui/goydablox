/**
 * ГОЙДАБЛОКС - Vehicle Manager
 * Manages all vehicles in the game world
 */

import * as THREE from 'three';
import { CONFIG, VEHICLE_TYPES, COLORS } from '../config/GameConfig.js';
import { LadaVehicle } from './LadaVehicle.js';

export class VehicleManager {
    constructor(game) {
        this.game = game;
        this.vehicles = [];
        this.activeVehicle = null;
        
        console.log('🚗 VehicleManager initialized');
    }
    
    /**
     * Spawn a vehicle at position
     */
    spawnVehicle(type, position, rotation = 0) {
        let vehicle;
        
        switch (type) {
            case VEHICLE_TYPES.LADA_2107:
                vehicle = new LadaVehicle(this.game, {
                    model: '2107',
                    position: position,
                    rotation: rotation,
                    color: COLORS.vehicle.lada[Math.floor(Math.random() * COLORS.vehicle.lada.length)]
                });
                break;
                
            case VEHICLE_TYPES.LADA_2109:
                vehicle = new LadaVehicle(this.game, {
                    model: '2109',
                    position: position,
                    rotation: rotation,
                    color: COLORS.vehicle.lada[Math.floor(Math.random() * COLORS.vehicle.lada.length)]
                });
                break;
                
            case VEHICLE_TYPES.LADA_NIVA:
                vehicle = new LadaVehicle(this.game, {
                    model: 'niva',
                    position: position,
                    rotation: rotation,
                    color: COLORS.vehicle.lada[Math.floor(Math.random() * COLORS.vehicle.lada.length)]
                });
                break;
                
            default:
                vehicle = new LadaVehicle(this.game, {
                    model: '2107',
                    position: position,
                    rotation: rotation
                });
        }
        
        this.vehicles.push(vehicle);
        return vehicle;
    }
    
    /**
     * Remove a vehicle
     */
    removeVehicle(vehicle) {
        const index = this.vehicles.indexOf(vehicle);
        if (index > -1) {
            this.vehicles.splice(index, 1);
            vehicle.dispose();
        }
    }
    
    /**
     * Get nearest vehicle to position
     */
    getNearestVehicle(position, maxDistance = 10) {
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (const vehicle of this.vehicles) {
            if (vehicle.driver) continue; // Skip occupied vehicles
            
            const dist = position.distanceTo(vehicle.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = vehicle;
            }
        }
        
        return nearest;
    }
    
    /**
     * Update all vehicles
     */
    update(delta) {
        for (const vehicle of this.vehicles) {
            vehicle.update(delta);
        }
    }
    
    /**
     * Get all vehicle positions for minimap
     */
    getVehiclePositions() {
        return this.vehicles.map(v => ({
            position: v.position.clone(),
            rotation: v.rotation.y,
            type: v.type,
            occupied: !!v.driver
        }));
    }
    
    /**
     * Dispose all vehicles
     */
    dispose() {
        for (const vehicle of this.vehicles) {
            vehicle.dispose();
        }
        this.vehicles = [];
    }
}

export default VehicleManager;