/**
 * ГОЙДАБЛОКС - Physics Engine
 * Simple physics simulation for player, vehicles, and objects
 */

import * as THREE from 'three';
import { CONFIG } from '../config/GameConfig.js';

export class PhysicsEngine {
    constructor(game) {
        this.game = game;
        
        // Physics bodies
        this.bodies = [];
        this.staticBodies = [];
        
        // Collision grid for optimization
        this.gridSize = 10;
        this.collisionGrid = new Map();
        
        // Raycaster for ground detection
        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);
        
        console.log('⚙️ PhysicsEngine initialized');
    }
    
    /**
     * Add a dynamic body
     */
    addBody(body) {
        if (!body.id) {
            body.id = `body_${this.bodies.length}_${Date.now()}`;
        }
        
        body.velocity = body.velocity || new THREE.Vector3();
        body.acceleration = body.acceleration || new THREE.Vector3();
        body.mass = body.mass || 1;
        body.friction = body.friction || CONFIG.physics.friction;
        body.restitution = body.restitution || 0.3;
        body.grounded = false;
        body.collider = body.collider || this.createBoxCollider(body);
        
        this.bodies.push(body);
        this.updateGridPosition(body);
        
        return body;
    }
    
    /**
     * Add a static body (buildings, terrain, etc.)
     */
    addStaticBody(body) {
        if (!body.id) {
            body.id = `static_${this.staticBodies.length}_${Date.now()}`;
        }
        
        body.collider = body.collider || this.createBoxCollider(body);
        
        this.staticBodies.push(body);
        this.updateGridPosition(body, true);
        
        return body;
    }
    
    /**
     * Remove a body
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
        
        const staticIndex = this.staticBodies.indexOf(body);
        if (staticIndex > -1) {
            this.staticBodies.splice(staticIndex, 1);
        }
    }
    
    /**
     * Create box collider from mesh or dimensions
     */
    createBoxCollider(body) {
        if (body.mesh) {
            const box = new THREE.Box3().setFromObject(body.mesh);
            return {
                type: 'box',
                min: box.min,
                max: box.max,
                halfSize: box.getSize(new THREE.Vector3()).multiplyScalar(0.5)
            };
        }
        
        return {
            type: 'box',
            halfSize: new THREE.Vector3(
                body.width / 2 || 0.5,
                body.height / 2 || 1,
                body.depth / 2 || 0.5
            )
        };
    }
    
    /**
     * Create sphere collider
     */
    createSphereCollider(radius) {
        return {
            type: 'sphere',
            radius: radius
        };
    }
    
    /**
     * Create capsule collider (for characters)
     */
    createCapsuleCollider(radius, height) {
        return {
            type: 'capsule',
            radius: radius,
            height: height
        };
    }
    
    /**
     * Update collision grid position
     */
    updateGridPosition(body, isStatic = false) {
        const pos = body.position || body.mesh?.position;
        if (!pos) return;
        
        const gridX = Math.floor(pos.x / this.gridSize);
        const gridZ = Math.floor(pos.z / this.gridSize);
        const key = `${gridX},${gridZ}`;
        
        if (!this.collisionGrid.has(key)) {
            this.collisionGrid.set(key, { dynamic: [], static: [] });
        }
        
        const cell = this.collisionGrid.get(key);
        const list = isStatic ? cell.static : cell.dynamic;
        
        if (!list.includes(body)) {
            list.push(body);
        }
        
        body.gridKey = key;
    }
    
    /**
     * Get nearby bodies for collision check
     */
    getNearbyBodies(position, radius = 1) {
        const nearby = [];
        const gridRadius = Math.ceil(radius / this.gridSize) + 1;
        const centerX = Math.floor(position.x / this.gridSize);
        const centerZ = Math.floor(position.z / this.gridSize);
        
        for (let dx = -gridRadius; dx <= gridRadius; dx++) {
            for (let dz = -gridRadius; dz <= gridRadius; dz++) {
                const key = `${centerX + dx},${centerZ + dz}`;
                const cell = this.collisionGrid.get(key);
                if (cell) {
                    nearby.push(...cell.static, ...cell.dynamic);
                }
            }
        }
        
        return nearby;
    }
    
    /**
     * Update physics simulation
     */
    update(delta) {
        // Update all dynamic bodies
        for (const body of this.bodies) {
            this.updateBody(body, delta);
        }
    }
    
    /**
     * Update a single body
     */
    updateBody(body, delta) {
        if (!body.position && !body.mesh) return;
        
        const position = body.position || body.mesh.position;
        const velocity = body.velocity;
        
        // Apply gravity
        if (!body.grounded && !body.noGravity) {
            velocity.y += CONFIG.physics.gravity * delta;
        }
        
        // Apply acceleration
        velocity.add(body.acceleration.clone().multiplyScalar(delta));
        
        // Apply friction
        if (body.grounded) {
            velocity.x *= body.friction;
            velocity.z *= body.friction;
        } else {
            velocity.x *= CONFIG.physics.airResistance;
            velocity.z *= CONFIG.physics.airResistance;
        }
        
        // Calculate new position
        const newPosition = position.clone().add(velocity.clone().multiplyScalar(delta));
        
        // Ground collision
        const groundHeight = this.getGroundHeight(newPosition);
        const bodyHeight = body.collider?.halfSize?.y || 1;
        
        if (newPosition.y - bodyHeight <= groundHeight) {
            newPosition.y = groundHeight + bodyHeight;
            velocity.y = 0;
            body.grounded = true;
        } else {
            body.grounded = false;
        }
        
        // Static body collisions
        const collision = this.checkStaticCollisions(body, newPosition);
        if (collision.hit) {
            // Push back
            newPosition.add(collision.normal.multiplyScalar(collision.depth));
            
            // Reflect velocity
            const dot = velocity.dot(collision.normal);
            if (dot < 0) {
                velocity.sub(collision.normal.multiplyScalar(dot * (1 + body.restitution)));
            }
        }
        
        // Apply new position
        position.copy(newPosition);
        
        // Update grid position
        this.updateGridPosition(body);
        
        // Reset acceleration
        body.acceleration.set(0, 0, 0);
    }
    
    /**
     * Get ground height at position
     */
    getGroundHeight(position) {
        // Default ground at y = 0
        // Could be extended for terrain heightmaps
        return 0;
    }
    
    /**
     * Check collisions with static bodies
     */
    checkStaticCollisions(body, newPosition) {
        const result = {
            hit: false,
            normal: new THREE.Vector3(),
            depth: 0,
            body: null
        };
        
        const nearby = this.getNearbyBodies(newPosition, 5);
        const bodyCollider = body.collider;
        
        for (const other of nearby) {
            if (other === body || !other.collider) continue;
            
            const collision = this.checkBoxBoxCollision(
                newPosition,
                bodyCollider,
                other.position || other.mesh?.position,
                other.collider
            );
            
            if (collision.hit && collision.depth > result.depth) {
                result.hit = true;
                result.normal.copy(collision.normal);
                result.depth = collision.depth;
                result.body = other;
            }
        }
        
        return result;
    }
    
    /**
     * Box-Box collision detection
     */
    checkBoxBoxCollision(posA, colliderA, posB, colliderB) {
        const result = {
            hit: false,
            normal: new THREE.Vector3(),
            depth: 0
        };
        
        if (!posA || !posB || !colliderA || !colliderB) return result;
        
        const halfA = colliderA.halfSize || new THREE.Vector3(0.5, 1, 0.5);
        const halfB = colliderB.halfSize || new THREE.Vector3(0.5, 1, 0.5);
        
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const dz = posA.z - posB.z;
        
        const overlapX = halfA.x + halfB.x - Math.abs(dx);
        const overlapY = halfA.y + halfB.y - Math.abs(dy);
        const overlapZ = halfA.z + halfB.z - Math.abs(dz);
        
        if (overlapX > 0 && overlapY > 0 && overlapZ > 0) {
            result.hit = true;
            
            // Find smallest overlap axis
            if (overlapX < overlapY && overlapX < overlapZ) {
                result.depth = overlapX;
                result.normal.set(dx > 0 ? 1 : -1, 0, 0);
            } else if (overlapZ < overlapY) {
                result.depth = overlapZ;
                result.normal.set(0, 0, dz > 0 ? 1 : -1);
            } else {
                result.depth = overlapY;
                result.normal.set(0, dy > 0 ? 1 : -1, 0);
            }
        }
        
        return result;
    }
    
    /**
     * Sphere-Sphere collision detection
     */
    checkSphereSphereCollision(posA, radiusA, posB, radiusB) {
        const result = {
            hit: false,
            normal: new THREE.Vector3(),
            depth: 0
        };
        
        const diff = new THREE.Vector3().subVectors(posA, posB);
        const distance = diff.length();
        const combinedRadius = radiusA + radiusB;
        
        if (distance < combinedRadius) {
            result.hit = true;
            result.depth = combinedRadius - distance;
            result.normal = diff.normalize();
        }
        
        return result;
    }
    
    /**
     * Raycast against static bodies
     */
    raycast(origin, direction, maxDistance = 100) {
        const results = [];
        
        this.raycaster.set(origin, direction);
        this.raycaster.far = maxDistance;
        
        // Check against all static body meshes
        const meshes = this.staticBodies
            .filter(b => b.mesh)
            .map(b => b.mesh);
        
        const intersects = this.raycaster.intersectObjects(meshes, true);
        
        for (const intersect of intersects) {
            results.push({
                point: intersect.point,
                normal: intersect.face?.normal || new THREE.Vector3(0, 1, 0),
                distance: intersect.distance,
                object: intersect.object
            });
        }
        
        return results;
    }
    
    /**
     * Check if point is inside any static body
     */
    pointInside(point) {
        const nearby = this.getNearbyBodies(point, 1);
        
        for (const body of nearby) {
            if (!body.collider) continue;
            
            const pos = body.position || body.mesh?.position;
            if (!pos) continue;
            
            const half = body.collider.halfSize;
            if (
                point.x >= pos.x - half.x && point.x <= pos.x + half.x &&
                point.y >= pos.y - half.y && point.y <= pos.y + half.y &&
                point.z >= pos.z - half.z && point.z <= pos.z + half.z
            ) {
                return body;
            }
        }
        
        return null;
    }
    
    /**
     * Apply impulse to body
     */
    applyImpulse(body, impulse) {
        if (body.velocity) {
            body.velocity.add(impulse.clone().divideScalar(body.mass || 1));
        }
    }
    
    /**
     * Apply force to body
     */
    applyForce(body, force) {
        if (body.acceleration) {
            body.acceleration.add(force.clone().divideScalar(body.mass || 1));
        }
    }
    
    /**
     * Clear all bodies
     */
    clear() {
        this.bodies = [];
        this.staticBodies = [];
        this.collisionGrid.clear();
    }
    
    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            dynamicBodies: this.bodies.length,
            staticBodies: this.staticBodies.length,
            gridCells: this.collisionGrid.size
        };
    }
    
    /**
     * Dispose
     */
    dispose() {
        this.clear();
    }
}

export default PhysicsEngine;