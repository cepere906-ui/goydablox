// ==================== PHYSICS ====================
import { CONFIG } from '../config.js';

class PhysicsManager {
    constructor() {
        this.gravity = CONFIG.player.gravity;
        this.colliders = [];
    }
    
    init() {
        return this;
    }
    
    // Добавить коллайдер
    addCollider(collider) {
        this.colliders.push(collider);
    }
    
    // Удалить коллайдер
    removeCollider(collider) {
        const index = this.colliders.indexOf(collider);
        if (index > -1) {
            this.colliders.splice(index, 1);
        }
    }
    
    // Очистить все коллайдеры
    clearColliders() {
        this.colliders = [];
    }
    
    // Проверка коллизии с землёй (высота)
    getGroundHeight(x, z) {
        // По умолчанию земля на уровне 0
        return 0;
    }
    
    // Проверка коллизии игрока с объектами
    checkPlayerCollision(position, radius) {
        const result = {
            collided: false,
            normal: { x: 0, y: 0, z: 0 },
            penetration: 0
        };
        
        for (const collider of this.colliders) {
            if (!collider.enabled) continue;
            
            const collision = this.checkCollision(position, radius, collider);
            if (collision.collided) {
                result.collided = true;
                result.normal.x += collision.normal.x;
                result.normal.y += collision.normal.y;
                result.normal.z += collision.normal.z;
                result.penetration = Math.max(result.penetration, collision.penetration);
            }
        }
        
        // Нормализация
        const length = Math.sqrt(
            result.normal.x * result.normal.x +
            result.normal.y * result.normal.y +
            result.normal.z * result.normal.z
        );
        
        if (length > 0) {
            result.normal.x /= length;
            result.normal.y /= length;
            result.normal.z /= length;
        }
        
        return result;
    }
    
    // Проверка коллизии с конкретным объектом
    checkCollision(position, radius, collider) {
        const result = {
            collided: false,
            normal: { x: 0, y: 0, z: 0 },
            penetration: 0
        };
        
        switch (collider.type) {
            case 'box':
                return this.checkBoxCollision(position, radius, collider);
            case 'sphere':
                return this.checkSphereCollision(position, radius, collider);
            case 'cylinder':
                return this.checkCylinderCollision(position, radius, collider);
        }
        
        return result;
    }
    
    // Коллизия с боксом
    checkBoxCollision(position, radius, box) {
        const result = {
            collided: false,
            normal: { x: 0, y: 0, z: 0 },
            penetration: 0
        };
        
        // AABB collision
        const halfW = box.width / 2;
        const halfD = box.depth / 2;
        const halfH = box.height / 2;
        
        const closestX = Math.max(box.x - halfW, Math.min(position.x, box.x + halfW));
        const closestY = Math.max(box.y - halfH, Math.min(position.y, box.y + halfH));
        const closestZ = Math.max(box.z - halfD, Math.min(position.z, box.z + halfD));
        
        const dx = position.x - closestX;
        const dy = position.y - closestY;
        const dz = position.z - closestZ;
        
        const distSq = dx * dx + dy * dy + dz * dz;
        
        if (distSq < radius * radius) {
            result.collided = true;
            const dist = Math.sqrt(distSq);
            
            if (dist > 0) {
                result.normal.x = dx / dist;
                result.normal.y = dy / dist;
                result.normal.z = dz / dist;
                result.penetration = radius - dist;
            } else {
                // Inside the box
                result.normal.y = 1;
                result.penetration = radius;
            }
        }
        
        return result;
    }
    
    // Коллизия со сферой
    checkSphereCollision(position, radius, sphere) {
        const result = {
            collided: false,
            normal: { x: 0, y: 0, z: 0 },
            penetration: 0
        };
        
        const dx = position.x - sphere.x;
        const dy = position.y - sphere.y;
        const dz = position.z - sphere.z;
        
        const distSq = dx * dx + dy * dy + dz * dz;
        const totalRadius = radius + sphere.radius;
        
        if (distSq < totalRadius * totalRadius) {
            result.collided = true;
            const dist = Math.sqrt(distSq);
            
            if (dist > 0) {
                result.normal.x = dx / dist;
                result.normal.y = dy / dist;
                result.normal.z = dz / dist;
                result.penetration = totalRadius - dist;
            }
        }
        
        return result;
    }
    
    // Коллизия с цилиндром
    checkCylinderCollision(position, radius, cylinder) {
        const result = {
            collided: false,
            normal: { x: 0, y: 0, z: 0 },
            penetration: 0
        };
        
        // Горизонтальная проверка (круг)
        const dx = position.x - cylinder.x;
        const dz = position.z - cylinder.z;
        const horizontalDistSq = dx * dx + dz * dz;
        const totalRadius = radius + cylinder.radius;
        
        // Вертикальная проверка
        const halfH = cylinder.height / 2;
        const inVerticalRange = position.y >= cylinder.y - halfH - radius &&
                               position.y <= cylinder.y + halfH + radius;
        
        if (horizontalDistSq < totalRadius * totalRadius && inVerticalRange) {
            result.collided = true;
            const horizontalDist = Math.sqrt(horizontalDistSq);
            
            if (horizontalDist > 0) {
                result.normal.x = dx / horizontalDist;
                result.normal.z = dz / horizontalDist;
                result.penetration = totalRadius - horizontalDist;
            }
        }
        
        return result;
    }
    
    // Применить гравитацию
    applyGravity(velocity, delta) {
        velocity.y -= this.gravity * delta;
        return velocity;
    }
    
    // Raycast для проверки линии видимости
    raycast(origin, direction, maxDistance) {
        // Simplified raycast
        const result = {
            hit: false,
            distance: maxDistance,
            point: null,
            collider: null
        };
        
        for (const collider of this.colliders) {
            if (!collider.enabled) continue;
            
            // Simple ray-box intersection
            if (collider.type === 'box') {
                const hit = this.rayBoxIntersection(origin, direction, collider, maxDistance);
                if (hit && hit.distance < result.distance) {
                    result.hit = true;
                    result.distance = hit.distance;
                    result.point = hit.point;
                    result.collider = collider;
                }
            }
        }
        
        return result;
    }
    
    rayBoxIntersection(origin, direction, box, maxDistance) {
        const halfW = box.width / 2;
        const halfD = box.depth / 2;
        const halfH = box.height / 2;
        
        const minX = box.x - halfW;
        const maxX = box.x + halfW;
        const minY = box.y - halfH;
        const maxY = box.y + halfH;
        const minZ = box.z - halfD;
        const maxZ = box.z + halfD;
        
        let tmin = 0;
        let tmax = maxDistance;
        
        // X
        if (Math.abs(direction.x) < 0.0001) {
            if (origin.x < minX || origin.x > maxX) return null;
        } else {
            const t1 = (minX - origin.x) / direction.x;
            const t2 = (maxX - origin.x) / direction.x;
            tmin = Math.max(tmin, Math.min(t1, t2));
            tmax = Math.min(tmax, Math.max(t1, t2));
            if (tmin > tmax) return null;
        }
        
        // Y
        if (Math.abs(direction.y) < 0.0001) {
            if (origin.y < minY || origin.y > maxY) return null;
        } else {
            const t1 = (minY - origin.y) / direction.y;
            const t2 = (maxY - origin.y) / direction.y;
            tmin = Math.max(tmin, Math.min(t1, t2));
            tmax = Math.min(tmax, Math.max(t1, t2));
            if (tmin > tmax) return null;
        }
        
        // Z
        if (Math.abs(direction.z) < 0.0001) {
            if (origin.z < minZ || origin.z > maxZ) return null;
        } else {
            const t1 = (minZ - origin.z) / direction.z;
            const t2 = (maxZ - origin.z) / direction.z;
            tmin = Math.max(tmin, Math.min(t1, t2));
            tmax = Math.min(tmax, Math.max(t1, t2));
            if (tmin > tmax) return null;
        }
        
        return {
            distance: tmin,
            point: {
                x: origin.x + direction.x * tmin,
                y: origin.y + direction.y * tmin,
                z: origin.z + direction.z * tmin
            }
        };
    }
}

export const Physics = new PhysicsManager();