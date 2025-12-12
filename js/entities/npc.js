// ==================== NPC ====================
import { CONFIG } from '../config.js';
import { Renderer } from '../engine/renderer.js';

export class NPC {
    constructor(options) {
        this.id = options.id || Math.random().toString(36).substr(2, 9);
        this.name = options.name || 'Житель';
        this.type = options.type || 'citizen';
        this.position = new THREE.Vector3(
            options.x || 0,
            0,
            options.z || 0
        );
        this.rotation = options.rotation || Math.random() * Math.PI * 2;
        
        this.mesh = null;
        this.isWalking = false;
        this.walkTarget = null;
        this.walkSpeed = CONFIG.npc.walkSpeed;
        this.idleTimer = 0;
        this.dialogue = options.dialogue || null;
        
        this.colors = {
            skin: [0xFFDBAC, 0xE8B88A, 0xC68642, 0x8D5524],
            hair: [0x090806, 0x2C222B, 0x71635A, 0xB7A69E, 0xD6C4C2],
            clothes: [0x1a1a1a, 0x2E4053, 0x7B241C, 0x1D8348, 0x2874A6, 0x6C3483]
        };
        
        this.create();
    }
    
    create() {
        this.mesh = new THREE.Group();
        
        const skinColor = this.colors.skin[Math.floor(Math.random() * this.colors.skin.length)];
        const hairColor = this.colors.hair[Math.floor(Math.random() * this.colors.hair.length)];
        const clothesColor = this.colors.clothes[Math.floor(Math.random() * this.colors.clothes.length)];
        
        const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
        const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });
        const clothesMat = new THREE.MeshLambertMaterial({ color: clothesColor });
        
        // Тело
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.9, 0.35),
            clothesMat
        );
        body.position.y = 1.1;
        body.castShadow = true;
        this.mesh.add(body);
        
        // Голова
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.45, 0.4),
            skinMat
        );
        head.position.y = 1.8;
        head.castShadow = true;
        this.mesh.add(head);
        
        // Волосы
        const hair = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.2, 0.42),
            hairMat
        );
        hair.position.y = 2;
        this.mesh.add(hair);
        
        // Ноги
        const legMat = new THREE.MeshLambertMaterial({ color: 0x2C3E50 });
        
        const leftLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.65, 0.25),
            legMat
        );
        leftLeg.position.set(-0.15, 0.35, 0);
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        this.leftLeg = leftLeg;
        
        const rightLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.65, 0.25),
            legMat
        );
        rightLeg.position.set(0.15, 0.35, 0);
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        this.rightLeg = rightLeg;
        
        // Руки
        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.6, 0.2),
            clothesMat
        );
        leftArm.position.set(-0.4, 1.1, 0);
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        this.leftArm = leftArm;
        
        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.6, 0.2),
            clothesMat
        );
        rightArm.position.set(0.4, 1.1, 0);
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        this.rightArm = rightArm;
        
        // Позиционирование
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
        
        Renderer.add(this.mesh);
    }
    
    update(delta) {
        if (this.isWalking && this.walkTarget) {
            this.walk(delta);
        } else {
            this.idle(delta);
        }
        
        // Анимация
        this.animate(delta);
    }
    
    idle(delta) {
        this.idleTimer += delta;
        
        // Случайно начать идти
        if (this.idleTimer > 3 + Math.random() * 5) {
            this.idleTimer = 0;
            
            if (Math.random() > 0.3) {
                this.startWalking();
            } else {
                // Повернуться
                this.rotation += (Math.random() - 0.5) * Math.PI;
                this.mesh.rotation.y = this.rotation;
            }
        }
    }
    
    startWalking() {
        // Случайная точка назначения
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 15;
        
        this.walkTarget = new THREE.Vector3(
            this.position.x + Math.cos(angle) * distance,
            0,
            this.position.z + Math.sin(angle) * distance
        );
        
        // Ограничение мира
        const limit = CONFIG.world.size * 0.8;
        this.walkTarget.x = Math.max(-limit, Math.min(limit, this.walkTarget.x));
        this.walkTarget.z = Math.max(-limit, Math.min(limit, this.walkTarget.z));
        
        this.isWalking = true;
    }
    
    walk(delta) {
        const direction = new THREE.Vector3()
            .subVectors(this.walkTarget, this.position);
        
        const distance = direction.length();
        
        if (distance < 0.5) {
            // Достигли цели
            this.isWalking = false;
            this.walkTarget = null;
            return;
        }
        
        direction.normalize();
        
        // Движение
        this.position.x += direction.x * this.walkSpeed * delta;
        this.position.z += direction.z * this.walkSpeed * delta;
        this.mesh.position.copy(this.position);
        
        // Поворот к цели
        this.rotation = Math.atan2(direction.x, direction.z);
        this.mesh.rotation.y = this.rotation;
    }
    
    animate(delta) {
        if (this.isWalking) {
            // Анимация ходьбы
            const walkCycle = Math.sin(Date.now() * 0.01) * 0.4;
            
            this.leftLeg.rotation.x = walkCycle;
            this.rightLeg.rotation.x = -walkCycle;
            this.leftArm.rotation.x = -walkCycle * 0.7;
            this.rightArm.rotation.x = walkCycle * 0.7;
        } else {
            // Сброс анимации
            this.leftLeg.rotation.x *= 0.9;
            this.rightLeg.rotation.x *= 0.9;
            this.leftArm.rotation.x *= 0.9;
            this.rightArm.rotation.x *= 0.9;
        }
    }
    
    getInteractionPosition() {
        return this.position.clone();
    }
    
    getInteractionRadius() {
        return CONFIG.npc.interactDistance;
    }
    
    interact() {
        // Остановиться
        this.isWalking = false;
        this.walkTarget = null;
        
        return {
            type: 'npc',
            name: this.name,
            npcType: this.type,
            dialogue: this.dialogue
        };
    }
    
    destroy() {
        Renderer.remove(this.mesh);
    }
}

// ==================== NPC MANAGER ====================
class NPCManagerClass {
    constructor() {
        this.npcs = [];
    }
    
    init() {
        this.createNPCs();
        return this;
    }
    
    createNPCs() {
        const npcData = [
            // Жители
            { name: 'Бабушка Зина', type: 'citizen', x: 30, z: 40, dialogue: 'babushka' },
            { name: 'Дядя Коля', type: 'citizen', x: -20, z: 60, dialogue: 'citizen' },
            { name: 'Молодой парень', type: 'citizen', x: 50, z: -30, dialogue: 'citizen' },
            { name: 'Девушка', type: 'citizen', x: -40, z: 30, dialogue: 'citizen' },
            
            // Работники
            { name: 'Продавец', type: 'vendor', x: -60, z: -35, dialogue: 'vendor' },
            { name: 'Продавец шаурмы', type: 'vendor', x: 20, z: 25, dialogue: 'shawarma' },
            
            // Госслужащие
            { name: 'Госслужащий', type: 'official', x: 50, z: -45, dialogue: 'official' },
            { name: 'Офицер', type: 'military', x: 80, z: -100, dialogue: 'military' },
            
            // Случайные NPC
            ...this.generateRandomNPCs(12)
        ];
        
        npcData.forEach(data => {
            const npc = new NPC(data);
            this.npcs.push(npc);
        });
    }
    
    generateRandomNPCs(count) {
        const names = [
            'Иван', 'Петр', 'Сергей', 'Андрей', 'Дмитрий',
            'Мария', 'Анна', 'Елена', 'Ольга', 'Наталья'
        ];
        
        const npcs = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 150;
            
            npcs.push({
                name: names[Math.floor(Math.random() * names.length)],
                type: 'citizen',
                x: Math.cos(angle) * dist,
                z: Math.sin(angle) * dist,
                dialogue: 'citizen'
            });
        }
        
        return npcs;
    }
    
    update(delta) {
        this.npcs.forEach(npc => npc.update(delta));
    }
    
    getNearestNPC(position, maxDistance) {
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (const npc of this.npcs) {
            const dist = position.distanceTo(npc.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = npc;
            }
        }
        
        return nearest;
    }
    
    destroy() {
        this.npcs.forEach(npc => npc.destroy());
        this.npcs = [];
    }
}

export const NPCManager = new NPCManagerClass();