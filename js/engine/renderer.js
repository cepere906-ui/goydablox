// ==================== RENDERER ====================
import { CONFIG } from '../config.js';

class RendererManager {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.clock = null;
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, CONFIG.graphics.fogNear, CONFIG.graphics.fogFar);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: CONFIG.graphics.antialias,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = 'game-canvas';
        
        // Clock
        this.clock = new THREE.Clock();
        
        // Resize handler
        window.addEventListener('resize', () => this.onResize());
        
        return this;
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    getDelta() {
        return this.clock.getDelta();
    }
    
    getElapsed() {
        return this.clock.getElapsedTime();
    }
    
    add(object) {
        this.scene.add(object);
    }
    
    remove(object) {
        this.scene.remove(object);
    }
    
    setFog(color, near, far) {
        this.scene.fog.color.set(color);
        this.scene.fog.near = near;
        this.scene.fog.far = far;
    }
    
    setSkyColor(color) {
        this.scene.background.set(color);
    }
    
    updateShadowQuality(quality) {
        switch (quality) {
            case 'off':
                this.renderer.shadowMap.enabled = false;
                break;
            case 'low':
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.BasicShadowMap;
                break;
            case 'medium':
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFShadowMap;
                break;
            case 'high':
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
        }
    }
}

export const Renderer = new RendererManager();