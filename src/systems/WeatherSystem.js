/**
 * ГОЙДАБЛОКС - Weather System
 * Dynamic weather simulation for authentic Russian atmosphere
 */

import * as THREE from 'three';
import { CONFIG } from '../config/GameConfig.js';

// Weather types
const WEATHER_TYPES = {
    CLEAR: 'clear',
    CLOUDY: 'cloudy',
    OVERCAST: 'overcast',
    RAIN: 'rain',
    HEAVY_RAIN: 'heavy_rain',
    SNOW: 'snow',
    BLIZZARD: 'blizzard',
    FOG: 'fog'
};

// Seasonal weather probabilities
const SEASON_WEATHER = {
    spring: {
        [WEATHER_TYPES.CLEAR]: 0.3,
        [WEATHER_TYPES.CLOUDY]: 0.25,
        [WEATHER_TYPES.OVERCAST]: 0.2,
        [WEATHER_TYPES.RAIN]: 0.2,
        [WEATHER_TYPES.FOG]: 0.05
    },
    summer: {
        [WEATHER_TYPES.CLEAR]: 0.5,
        [WEATHER_TYPES.CLOUDY]: 0.25,
        [WEATHER_TYPES.RAIN]: 0.15,
        [WEATHER_TYPES.HEAVY_RAIN]: 0.1
    },
    autumn: {
        [WEATHER_TYPES.CLEAR]: 0.15,
        [WEATHER_TYPES.CLOUDY]: 0.25,
        [WEATHER_TYPES.OVERCAST]: 0.3,
        [WEATHER_TYPES.RAIN]: 0.2,
        [WEATHER_TYPES.FOG]: 0.1
    },
    winter: {
        [WEATHER_TYPES.CLEAR]: 0.2,
        [WEATHER_TYPES.CLOUDY]: 0.2,
        [WEATHER_TYPES.OVERCAST]: 0.2,
        [WEATHER_TYPES.SNOW]: 0.25,
        [WEATHER_TYPES.BLIZZARD]: 0.1,
        [WEATHER_TYPES.FOG]: 0.05
    }
};

export class WeatherSystem {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        
        // Current weather state
        this.currentWeather = WEATHER_TYPES.CLOUDY;
        this.targetWeather = WEATHER_TYPES.CLOUDY;
        this.weatherTransition = 0;
        this.weatherDuration = 0;
        
        // Weather parameters
        this.cloudCover = 0.5;
        this.precipitation = 0;
        this.fogDensity = 0;
        this.windSpeed = 2;
        this.windDirection = new THREE.Vector2(1, 0);
        this.temperature = 15; // Celsius
        
        // Particle systems
        this.rainParticles = null;
        this.snowParticles = null;
        
        // Effects
        this.fog = null;
        
        // Initialize
        this.createParticleSystems();
        this.createFog();
        
        // Set initial weather
        this.setWeather(WEATHER_TYPES.CLOUDY);
        
        console.log('🌤️ WeatherSystem initialized');
    }
    
    /**
     * Create rain and snow particle systems
     */
    createParticleSystems() {
        // Rain particles
        const rainCount = 10000;
        const rainGeometry = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(rainCount * 3);
        const rainVelocities = new Float32Array(rainCount);
        
        for (let i = 0; i < rainCount; i++) {
            rainPositions[i * 3] = (Math.random() - 0.5) * 200;
            rainPositions[i * 3 + 1] = Math.random() * 100;
            rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            rainVelocities[i] = 15 + Math.random() * 10;
        }
        
        rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));
        
        const rainMaterial = new THREE.PointsMaterial({
            color: 0x8899AA,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.rainParticles = new THREE.Points(rainGeometry, rainMaterial);
        this.rainParticles.visible = false;
        this.scene.add(this.rainParticles);
        
        // Snow particles
        const snowCount = 5000;
        const snowGeometry = new THREE.BufferGeometry();
        const snowPositions = new Float32Array(snowCount * 3);
        const snowVelocities = new Float32Array(snowCount * 3);
        
        for (let i = 0; i < snowCount; i++) {
            snowPositions[i * 3] = (Math.random() - 0.5) * 200;
            snowPositions[i * 3 + 1] = Math.random() * 100;
            snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            
            // Snowflake drift
            snowVelocities[i * 3] = (Math.random() - 0.5) * 2;
            snowVelocities[i * 3 + 1] = 1 + Math.random() * 2;
            snowVelocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
        
        snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
        snowGeometry.setAttribute('velocity', new THREE.BufferAttribute(snowVelocities, 3));
        
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.3,
            transparent: true,
            opacity: 0.8,
            map: this.createSnowflakeTexture()
        });
        
        this.snowParticles = new THREE.Points(snowGeometry, snowMaterial);
        this.snowParticles.visible = false;
        this.scene.add(this.snowParticles);
    }
    
    /**
     * Create snowflake texture
     */
    createSnowflakeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw soft circle
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    /**
     * Create fog
     */
    createFog() {
        this.fog = new THREE.FogExp2(0x888888, 0.0);
        // Don't add fog yet - will be enabled when needed
    }
    
    /**
     * Set weather type
     */
    setWeather(weatherType, duration = 300) {
        this.targetWeather = weatherType;
        this.weatherDuration = duration;
        this.weatherTransition = 0;
        
        console.log(`Weather changing to: ${weatherType}`);
        this.game.ui?.showNotification(this.getWeatherMessage(weatherType), 'weather');
    }
    
    /**
     * Get weather display message
     */
    getWeatherMessage(weatherType) {
        const messages = {
            [WEATHER_TYPES.CLEAR]: '☀️ Ясная погода',
            [WEATHER_TYPES.CLOUDY]: '⛅ Переменная облачность',
            [WEATHER_TYPES.OVERCAST]: '☁️ Пасмурно',
            [WEATHER_TYPES.RAIN]: '🌧️ Идёт дождь',
            [WEATHER_TYPES.HEAVY_RAIN]: '⛈️ Сильный дождь',
            [WEATHER_TYPES.SNOW]: '❄️ Идёт снег',
            [WEATHER_TYPES.BLIZZARD]: '🌨️ Метель',
            [WEATHER_TYPES.FOG]: '🌫️ Туман'
        };
        return messages[weatherType] || 'Погода меняется';
    }
    
    /**
     * Get weather parameters for type
     */
    getWeatherParams(weatherType) {
        const params = {
            [WEATHER_TYPES.CLEAR]: {
                cloudCover: 0.1,
                precipitation: 0,
                fogDensity: 0,
                windSpeed: 2,
                skyColor: 0x87CEEB,
                ambientIntensity: 0.6
            },
            [WEATHER_TYPES.CLOUDY]: {
                cloudCover: 0.5,
                precipitation: 0,
                fogDensity: 0,
                windSpeed: 4,
                skyColor: 0xA0B0C0,
                ambientIntensity: 0.5
            },
            [WEATHER_TYPES.OVERCAST]: {
                cloudCover: 0.9,
                precipitation: 0,
                fogDensity: 0.001,
                windSpeed: 3,
                skyColor: 0x808890,
                ambientIntensity: 0.4
            },
            [WEATHER_TYPES.RAIN]: {
                cloudCover: 0.95,
                precipitation: 0.5,
                fogDensity: 0.002,
                windSpeed: 6,
                skyColor: 0x606870,
                ambientIntensity: 0.35
            },
            [WEATHER_TYPES.HEAVY_RAIN]: {
                cloudCover: 1.0,
                precipitation: 1.0,
                fogDensity: 0.005,
                windSpeed: 10,
                skyColor: 0x404850,
                ambientIntensity: 0.25
            },
            [WEATHER_TYPES.SNOW]: {
                cloudCover: 0.8,
                precipitation: 0.6,
                fogDensity: 0.003,
                windSpeed: 3,
                skyColor: 0xC0C8D0,
                ambientIntensity: 0.5
            },
            [WEATHER_TYPES.BLIZZARD]: {
                cloudCover: 1.0,
                precipitation: 1.0,
                fogDensity: 0.01,
                windSpeed: 15,
                skyColor: 0xA0A8B0,
                ambientIntensity: 0.3
            },
            [WEATHER_TYPES.FOG]: {
                cloudCover: 0.7,
                precipitation: 0,
                fogDensity: 0.02,
                windSpeed: 1,
                skyColor: 0x909090,
                ambientIntensity: 0.4
            }
        };
        
        return params[weatherType] || params[WEATHER_TYPES.CLOUDY];
    }
    
    /**
     * Update weather system
     */
    update(delta) {
        // Update weather transition
        if (this.currentWeather !== this.targetWeather) {
            this.weatherTransition += delta / 10; // 10 seconds transition
            
            if (this.weatherTransition >= 1) {
                this.currentWeather = this.targetWeather;
                this.weatherTransition = 0;
            }
        }
        
        // Update weather duration
        this.weatherDuration -= delta;
        if (this.weatherDuration <= 0) {
            this.changeWeatherRandomly();
        }
        
        // Get interpolated parameters
        const currentParams = this.getWeatherParams(this.currentWeather);
        const targetParams = this.getWeatherParams(this.targetWeather);
        
        // Interpolate values
        const t = this.weatherTransition;
        this.cloudCover = THREE.MathUtils.lerp(currentParams.cloudCover, targetParams.cloudCover, t);
        this.precipitation = THREE.MathUtils.lerp(currentParams.precipitation, targetParams.precipitation, t);
        this.fogDensity = THREE.MathUtils.lerp(currentParams.fogDensity, targetParams.fogDensity, t);
        this.windSpeed = THREE.MathUtils.lerp(currentParams.windSpeed, targetParams.windSpeed, t);
        
        // Update wind direction slowly
        const windRotation = delta * 0.1;
        this.windDirection.rotateAround(new THREE.Vector2(0, 0), windRotation);
        
        // Update scene fog
        if (this.fogDensity > 0) {
            this.scene.fog = this.fog;
            this.fog.density = this.fogDensity;
            
            // Interpolate fog color
            const fogColor = new THREE.Color(currentParams.skyColor);
            const targetFogColor = new THREE.Color(targetParams.skyColor);
            fogColor.lerp(targetFogColor, t);
            this.fog.color = fogColor;
        } else {
            this.scene.fog = null;
        }
        
        // Update sky color
        const skyColor = new THREE.Color(currentParams.skyColor);
        const targetSkyColor = new THREE.Color(targetParams.skyColor);
        skyColor.lerp(targetSkyColor, t);
        this.scene.background = skyColor;
        
        // Update ambient light
        if (this.game.ambientLight) {
            const intensity = THREE.MathUtils.lerp(
                currentParams.ambientIntensity,
                targetParams.ambientIntensity,
                t
            );
            this.game.ambientLight.intensity = intensity;
        }
        
        // Update particles
        this.updateParticles(delta);
    }
    
    /**
     * Update particle systems
     */
    updateParticles(delta) {
        const playerPos = this.game.player?.position || new THREE.Vector3();
        const isSnowing = this.targetWeather === WEATHER_TYPES.SNOW || 
                          this.targetWeather === WEATHER_TYPES.BLIZZARD;
        const isRaining = this.targetWeather === WEATHER_TYPES.RAIN || 
                          this.targetWeather === WEATHER_TYPES.HEAVY_RAIN;
        
        // Update rain
        if (isRaining && this.precipitation > 0) {
            this.rainParticles.visible = true;
            this.rainParticles.material.opacity = this.precipitation * 0.6;
            
            const positions = this.rainParticles.geometry.attributes.position.array;
            const velocities = this.rainParticles.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Fall down
                positions[i * 3 + 1] -= velocities[i] * delta;
                
                // Add wind
                positions[i * 3] += this.windDirection.x * this.windSpeed * delta * 0.5;
                positions[i * 3 + 2] += this.windDirection.y * this.windSpeed * delta * 0.5;
                
                // Reset if below ground
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3] = playerPos.x + (Math.random() - 0.5) * 200;
                    positions[i * 3 + 1] = 50 + Math.random() * 50;
                    positions[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 200;
                }
            }
            
            this.rainParticles.geometry.attributes.position.needsUpdate = true;
            
            // Play rain sound
            if (this.precipitation > 0.5) {
                this.game.audio?.playAmbient('heavy_rain');
            } else {
                this.game.audio?.playAmbient('light_rain');
            }
        } else {
            this.rainParticles.visible = false;
        }
        
        // Update snow
        if (isSnowing && this.precipitation > 0) {
            this.snowParticles.visible = true;
            this.snowParticles.material.opacity = this.precipitation * 0.8;
            
            const positions = this.snowParticles.geometry.attributes.position.array;
            const velocities = this.snowParticles.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Fall down with drift
                positions[i * 3] += velocities[i * 3] * delta + 
                                   this.windDirection.x * this.windSpeed * delta * 0.3;
                positions[i * 3 + 1] -= velocities[i * 3 + 1] * delta;
                positions[i * 3 + 2] += velocities[i * 3 + 2] * delta + 
                                       this.windDirection.y * this.windSpeed * delta * 0.3;
                
                // Reset if below ground
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3] = playerPos.x + (Math.random() - 0.5) * 200;
                    positions[i * 3 + 1] = 50 + Math.random() * 50;
                    positions[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 200;
                }
            }
            
            this.snowParticles.geometry.attributes.position.needsUpdate = true;
            
            // Play wind sound for blizzard
            if (this.targetWeather === WEATHER_TYPES.BLIZZARD) {
                this.game.audio?.playAmbient('blizzard');
            }
        } else {
            this.snowParticles.visible = false;
        }
    }
    
    /**
     * Change weather randomly based on season
     */
    changeWeatherRandomly() {
        const season = this.game.dayNight?.getSeason() || 'summer';
        const probabilities = SEASON_WEATHER[season];
        
        // Roll for new weather
        const roll = Math.random();
        let cumulative = 0;
        
        for (const [weather, probability] of Object.entries(probabilities)) {
            cumulative += probability;
            if (roll <= cumulative) {
                this.setWeather(weather, 120 + Math.random() * 360); // 2-8 minutes
                return;
            }
        }
        
        // Default to cloudy
        this.setWeather(WEATHER_TYPES.CLOUDY, 180);
    }
    
    /**
     * Get current weather
     */
    getCurrentWeather() {
        return this.currentWeather;
    }
    
    /**
     * Check if it's raining
     */
    isRaining() {
        return this.currentWeather === WEATHER_TYPES.RAIN || 
               this.currentWeather === WEATHER_TYPES.HEAVY_RAIN;
    }
    
    /**
     * Check if it's snowing
     */
    isSnowing() {
        return this.currentWeather === WEATHER_TYPES.SNOW || 
               this.currentWeather === WEATHER_TYPES.BLIZZARD;
    }
    
    /**
     * Get temperature (affected by weather)
     */
    getTemperature() {
        const baseTemp = this.game.dayNight?.getSeasonTemperature() || 15;
        
        let modifier = 0;
        switch (this.currentWeather) {
            case WEATHER_TYPES.CLEAR:
                modifier = 3;
                break;
            case WEATHER_TYPES.RAIN:
            case WEATHER_TYPES.HEAVY_RAIN:
                modifier = -5;
                break;
            case WEATHER_TYPES.SNOW:
                modifier = -2;
                break;
            case WEATHER_TYPES.BLIZZARD:
                modifier = -10;
                break;
        }
        
        return baseTemp + modifier;
    }
    
    /**
     * Save weather state
     */
    save() {
        return {
            currentWeather: this.currentWeather,
            weatherDuration: this.weatherDuration
        };
    }
    
    /**
     * Load weather state
     */
    load(data) {
        if (!data) return;
        
        this.setWeather(data.currentWeather, data.weatherDuration);
        this.currentWeather = data.currentWeather;
        this.weatherTransition = 1;
    }
    
    /**
     * Dispose
     */
    dispose() {
        if (this.rainParticles) {
            this.scene.remove(this.rainParticles);
            this.rainParticles.geometry.dispose();
            this.rainParticles.material.dispose();
        }
        
        if (this.snowParticles) {
            this.scene.remove(this.snowParticles);
            this.snowParticles.geometry.dispose();
            this.snowParticles.material.dispose();
        }
    }
}

export { WEATHER_TYPES };
export default WeatherSystem;