/**
 * ГОЙДАБЛОКС - Road Network
 * Creates roads, sidewalks, and railroad crossings
 */

import * as THREE from 'three';
import { COLORS } from '../config/GameConfig.js';

export class RoadNetwork {
    constructor(game) {
        this.game = game;
        this.roads = [];
        this.railroads = [];
        
        // Materials
        this.materials = {
            road: new THREE.MeshLambertMaterial({ color: COLORS.road }),
            roadMarking: new THREE.MeshBasicMaterial({ color: COLORS.roadMarking }),
            sidewalk: new THREE.MeshLambertMaterial({ color: COLORS.sidewalk }),
            railroad: new THREE.MeshLambertMaterial({ color: 0x444444 }),
            rail: new THREE.MeshStandardMaterial({ 
                color: 0x888888,
                metalness: 0.8,
                roughness: 0.3
            }),
            wood: new THREE.MeshLambertMaterial({ color: 0x8B4513 })
        };
    }
    
    /**
     * Create a road between two points
     */
    createRoad(start, end, width = 6) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const angle = Math.atan2(direction.x, direction.z);
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        
        const road = new THREE.Group();
        
        // Main road surface
        const roadGeom = new THREE.PlaneGeometry(width, length);
        const roadMesh = new THREE.Mesh(roadGeom, this.materials.road);
        roadMesh.rotation.x = -Math.PI / 2;
        roadMesh.rotation.z = angle;
        roadMesh.position.set(center.x, 0.01, center.z);
        roadMesh.receiveShadow = true;
        road.add(roadMesh);
        
        // Center line markings (dashed)
        const numMarkings = Math.floor(length / 6);
        for (let i = 0; i < numMarkings; i++) {
            const markGeom = new THREE.PlaneGeometry(0.2, 2);
            const mark = new THREE.Mesh(markGeom, this.materials.roadMarking);
            mark.rotation.x = -Math.PI / 2;
            mark.rotation.z = angle;
            
            const t = (i + 0.5) / numMarkings;
            const markPos = new THREE.Vector3().lerpVectors(start, end, t);
            mark.position.set(markPos.x, 0.02, markPos.z);
            road.add(mark);
        }
        
        // Edge lines (solid)
        const edgeOffset = (width / 2) - 0.3;
        for (let side = -1; side <= 1; side += 2) {
            const edgeGeom = new THREE.PlaneGeometry(0.15, length);
            const edge = new THREE.Mesh(edgeGeom, this.materials.roadMarking);
            edge.rotation.x = -Math.PI / 2;
            edge.rotation.z = angle;
            
            const offset = new THREE.Vector3(
                Math.cos(angle) * side * edgeOffset,
                0,
                -Math.sin(angle) * side * edgeOffset
            );
            edge.position.set(center.x + offset.x, 0.02, center.z + offset.z);
            road.add(edge);
        }
        
        // Sidewalks on both sides
        const sidewalkWidth = 2;
        const sidewalkOffset = (width / 2) + sidewalkWidth / 2;
        
        for (let side = -1; side <= 1; side += 2) {
            const sidewalkGeom = new THREE.PlaneGeometry(sidewalkWidth, length);
            const sidewalk = new THREE.Mesh(sidewalkGeom, this.materials.sidewalk);
            sidewalk.rotation.x = -Math.PI / 2;
            sidewalk.rotation.z = angle;
            
            const offset = new THREE.Vector3(
                Math.cos(angle) * side * sidewalkOffset,
                0,
                -Math.sin(angle) * side * sidewalkOffset
            );
            sidewalk.position.set(center.x + offset.x, 0.015, center.z + offset.z);
            sidewalk.receiveShadow = true;
            road.add(sidewalk);
            
            // Curb
            const curbGeom = new THREE.BoxGeometry(0.2, 0.15, length);
            const curbMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
            const curb = new THREE.Mesh(curbGeom, curbMat);
            curb.rotation.y = angle;
            
            const curbOffset = new THREE.Vector3(
                Math.cos(angle) * side * (width / 2 + 0.1),
                0.075,
                -Math.sin(angle) * side * (width / 2 + 0.1)
            );
            curb.position.set(center.x + curbOffset.x, curbOffset.y, center.z + curbOffset.z);
            road.add(curb);
        }
        
        this.game.scene.add(road);
        this.roads.push(road);
        
        return road;
    }
    
    /**
     * Create an intersection
     */
    createIntersection(x, z, size = 12) {
        const intersection = new THREE.Group();
        
        // Main surface
        const surfaceGeom = new THREE.PlaneGeometry(size, size);
        const surface = new THREE.Mesh(surfaceGeom, this.materials.road);
        surface.rotation.x = -Math.PI / 2;
        surface.position.set(x, 0.01, z);
        intersection.add(surface);
        
        // Crosswalk markings
        const stripeWidth = 0.4;
        const stripeLength = 3;
        const numStripes = 6;
        
        for (let dir = 0; dir < 4; dir++) {
            const angle = (dir * Math.PI) / 2;
            
            for (let i = 0; i < numStripes; i++) {
                const stripeGeom = new THREE.PlaneGeometry(stripeWidth, stripeLength);
                const stripe = new THREE.Mesh(stripeGeom, this.materials.roadMarking);
                stripe.rotation.x = -Math.PI / 2;
                stripe.rotation.z = angle;
                
                const offset = (i - numStripes / 2 + 0.5) * stripeWidth * 1.5;
                const distance = size / 2 - stripeLength / 2 - 0.5;
                
                stripe.position.set(
                    x + Math.cos(angle + Math.PI / 2) * offset + Math.cos(angle) * distance,
                    0.02,
                    z + Math.sin(angle + Math.PI / 2) * offset + Math.sin(angle) * distance
                );
                intersection.add(stripe);
            }
        }
        
        this.game.scene.add(intersection);
        
        return intersection;
    }
    
    /**
     * Create railroad crossing
     */
    createRailroad(start, end) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const angle = Math.atan2(direction.x, direction.z);
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        
        const railroad = new THREE.Group();
        
        // Gravel bed
        const bedGeom = new THREE.PlaneGeometry(4, length);
        const bedMat = new THREE.MeshLambertMaterial({ color: 0x666655 });
        const bed = new THREE.Mesh(bedGeom, bedMat);
        bed.rotation.x = -Math.PI / 2;
        bed.rotation.z = angle;
        bed.position.set(center.x, 0.005, center.z);
        railroad.add(bed);
        
        // Rails
        const railSpacing = 1.5;
        for (let side = -1; side <= 1; side += 2) {
            const railGeom = new THREE.BoxGeometry(0.1, 0.15, length);
            const rail = new THREE.Mesh(railGeom, this.materials.rail);
            rail.rotation.y = angle;
            
            const offset = new THREE.Vector3(
                Math.cos(angle) * side * railSpacing / 2,
                0.1,
                -Math.sin(angle) * side * railSpacing / 2
            );
            rail.position.set(center.x + offset.x, offset.y, center.z + offset.z);
            rail.castShadow = true;
            railroad.add(rail);
        }
        
        // Wooden ties
        const numTies = Math.floor(length / 1);
        for (let i = 0; i < numTies; i++) {
            const tieGeom = new THREE.BoxGeometry(2.5, 0.15, 0.2);
            const tie = new THREE.Mesh(tieGeom, this.materials.wood);
            tie.rotation.y = angle;
            
            const t = i / numTies;
            const tiePos = new THREE.Vector3().lerpVectors(start, end, t);
            tie.position.set(tiePos.x, 0.05, tiePos.z);
            railroad.add(tie);
        }
        
        this.game.scene.add(railroad);
        this.railroads.push(railroad);
        
        return railroad;
    }
    
    /**
     * Create railroad crossing barrier
     */
    createRailroadCrossing(x, z, rotation = 0) {
        const crossing = new THREE.Group();
        
        // Crossing surface
        const surfaceGeom = new THREE.PlaneGeometry(8, 6);
        const surface = new THREE.Mesh(surfaceGeom, this.materials.road);
        surface.rotation.x = -Math.PI / 2;
        surface.position.y = 0.015;
        crossing.add(surface);
        
        // Warning signs
        const signMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        
        for (let side = -1; side <= 1; side += 2) {
            // Post
            const postGeom = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
            const postMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
            const post = new THREE.Mesh(postGeom, postMat);
            post.position.set(side * 4, 1.5, -3);
            crossing.add(post);
            
            // X sign
            const xSignGeom = new THREE.BoxGeometry(1.5, 0.2, 0.1);
            const xSign1 = new THREE.Mesh(xSignGeom, signMat);
            xSign1.position.set(side * 4, 2.8, -3);
            xSign1.rotation.z = Math.PI / 4;
            crossing.add(xSign1);
            
            const xSign2 = new THREE.Mesh(xSignGeom, signMat);
            xSign2.position.set(side * 4, 2.8, -3);
            xSign2.rotation.z = -Math.PI / 4;
            crossing.add(xSign2);
            
            // Barrier arm (could be animated)
            const armGeom = new THREE.BoxGeometry(0.1, 0.1, 5);
            const armMat = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
            const arm = new THREE.Mesh(armGeom, armMat);
            arm.position.set(side * 4, 1, -0.5);
            crossing.add(arm);
            
            // White stripes on arm
            for (let i = 0; i < 5; i++) {
                const stripeGeom = new THREE.BoxGeometry(0.12, 0.12, 0.3);
                const stripeMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
                const stripe = new THREE.Mesh(stripeGeom, stripeMat);
                stripe.position.set(side * 4, 1, -0.5 + i * 0.8 - 1.5);
                crossing.add(stripe);
            }
        }
        
        crossing.position.set(x, 0, z);
        crossing.rotation.y = rotation;
        this.game.scene.add(crossing);
        
        return crossing;
    }
    
    /**
     * Create parking lot
     */
    createParkingLot(x, z, width, depth, spots = 10) {
        const parking = new THREE.Group();
        
        // Surface
        const surfaceGeom = new THREE.PlaneGeometry(width, depth);
        const surface = new THREE.Mesh(surfaceGeom, this.materials.road);
        surface.rotation.x = -Math.PI / 2;
        surface.position.y = 0.01;
        surface.receiveShadow = true;
        parking.add(surface);
        
        // Parking lines
        const spotWidth = width / spots;
        for (let i = 0; i <= spots; i++) {
            const lineGeom = new THREE.PlaneGeometry(0.1, depth * 0.7);
            const line = new THREE.Mesh(lineGeom, this.materials.roadMarking);
            line.rotation.x = -Math.PI / 2;
            line.position.set(-width / 2 + i * spotWidth, 0.02, 0);
            parking.add(line);
        }
        
        parking.position.set(x, 0, z);
        this.game.scene.add(parking);
        
        return parking;
    }
    
    /**
     * Dispose all roads
     */
    dispose() {
        for (const road of this.roads) {
            this.game.scene.remove(road);
            road.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        this.roads = [];
        
        for (const railroad of this.railroads) {
            this.game.scene.remove(railroad);
            railroad.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        this.railroads = [];
    }
}

export default RoadNetwork;