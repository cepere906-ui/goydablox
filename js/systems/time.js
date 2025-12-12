// ==================== TIME SYSTEM ====================
import { CONFIG, MONTHS, WEATHER_ICONS, LIGHTING } from '../config.js';
import { GameState } from '../state.js';
import { Renderer } from '../engine/renderer.js';

class TimeSystem {
    constructor() {
        this.sunLight = null;
        this.moonLight = null;
        this.ambientLight = null;
        this.skyColors = {};
        this.weatherTimer = 0;
    }
    
    init() {
        this.createLighting();
        this.updateTimeDisplay();
        this.updateWeatherDisplay();
        
        return this;
    }
    
    createLighting() {
        // Sun
        this.sunLight = new THREE.DirectionalLight(0xFFFFEE, 1.2);
        this.sunLight.position.set(100, 150, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = CONFIG.graphics.shadowMapSize;
        this.sunLight.shadow.mapSize.height = CONFIG.graphics.shadowMapSize;
        this.sunLight.shadow.camera.near = 10;
        this.sunLight.shadow.camera.far = 400;
        this.sunLight.shadow.camera.left = -180;
        this.sunLight.shadow.camera.right = 180;
        this.sunLight.shadow.camera.top = 180;
        this.sunLight.shadow.camera.bottom = -180;
        this.sunLight.shadow.bias = -0.001;
        Renderer.add(this.sunLight);
        
        // Moon
        this.moonLight = new THREE.DirectionalLight(0x8888FF, 0);
        this.moonLight.position.set(-50, 100, -50);
        Renderer.add(this.moonLight);
        
        // Ambient
        this.ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        Renderer.add(this.ambientLight);
        
        // Hemisphere
        this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3D5C3D, 0.4);
        Renderer.add(this.hemiLight);
    }
    
    update(delta) {
        // Update game time
        this.updateGameTime(delta);
        
        // Update lighting based on time
        this.updateLighting();
        
        // Update weather
        this.updateWeather(delta);
        
        // Update player stats decay
        this.updateStatsDecay(delta);
    }
    
    updateGameTime(delta) {
        // Calculate how many game minutes pass per real second
        const minutesPerSecond = (24 * 60) / CONFIG.time.dayLength;
        
        GameState.time.totalMinutes += delta * minutesPerSecond;
        GameState.time.minute += delta * minutesPerSecond;
        
        // Handle minute overflow
        while (GameState.time.minute >= 60) {
            GameState.time.minute -= 60;
            GameState.time.hour++;
            
            // Handle hour overflow
            if (GameState.time.hour >= 24) {
                GameState.time.hour = 0;
                GameState.time.day++;
                
                // Handle day overflow (simplified month)
                if (GameState.time.day > 30) {
                    GameState.time.day = 1;
                    GameState.time.month++;
                    
                    if (GameState.time.month >= 12) {
                        GameState.time.month = 0;
                        GameState.time.year++;
                    }
                }
            }
        }
        
        // Update display
        this.updateTimeDisplay();
    }
    
    updateTimeDisplay() {
        const timeEl = document.getElementById('game-time');
        const dateEl = document.getElementById('game-date');
        
        if (timeEl) {
            const h = Math.floor(GameState.time.hour).toString().padStart(2, '0');
            const m = Math.floor(GameState.time.minute).toString().padStart(2, '0');
            timeEl.textContent = `${h}:${m}`;
        }
        
        if (dateEl) {
            dateEl.textContent = `${GameState.time.day} ${MONTHS[GameState.time.month]}`;
        }
    }
    
    updateLighting() {
        const hour = GameState.time.hour;
        let lighting;
        let t;
        
        // Determine time of day and interpolation
        if (hour >= 5 && hour < 8) {
            // Dawn
            t = (hour - 5) / 3;
            lighting = this.lerpLighting(LIGHTING.night, LIGHTING.dawn, t);
        } else if (hour >= 8 && hour < 10) {
            // Morning
            t = (hour - 8) / 2;
            lighting = this.lerpLighting(LIGHTING.dawn, LIGHTING.day, t);
        } else if (hour >= 10 && hour < 18) {
            // Day
            lighting = LIGHTING.day;
        } else if (hour >= 18 && hour < 20) {
            // Evening
            t = (hour - 18) / 2;
            lighting = this.lerpLighting(LIGHTING.day, LIGHTING.dusk, t);
        } else if (hour >= 20 && hour < 22) {
            // Dusk
            t = (hour - 20) / 2;
            lighting = this.lerpLighting(LIGHTING.dusk, LIGHTING.night, t);
        } else {
            // Night
            lighting = LIGHTING.night;
        }
        
        // Apply lighting
        this.sunLight.color.setHex(lighting.sun);
        this.sunLight.intensity = lighting.intensity;
        this.ambientLight.color.setHex(lighting.ambient);
        
        // Update sky color
        Renderer.setSkyColor(lighting.sky);
        Renderer.setFog(lighting.sky, CONFIG.graphics.fogNear, CONFIG.graphics.fogFar);
        
        // Moon at night
        const isNight = hour >= 20 || hour < 6;
        this.moonLight.intensity = isNight ? 0.3 : 0;
        
        // Update sun position
        const sunAngle = ((hour - 6) / 12) * Math.PI;
        this.sunLight.position.set(
            Math.cos(sunAngle) * 150,
            Math.sin(sunAngle) * 150,
            50
        );
    }
    
    lerpLighting(a, b, t) {
        return {
            sun: this.lerpColor(a.sun, b.sun, t),
            ambient: this.lerpColor(a.ambient, b.ambient, t),
            sky: this.lerpColor(a.sky, b.sky, t),
            intensity: a.intensity + (b.intensity - a.intensity) * t
        };
    }
    
    lerpColor(colorA, colorB, t) {
        const rA = (colorA >> 16) & 255;
        const gA = (colorA >> 8) & 255;
        const bA = colorA & 255;
        
        const rB = (colorB >> 16) & 255;
        const gB = (colorB >> 8) & 255;
        const bB = colorB & 255;
        
        const r = Math.round(rA + (rB - rA) * t);
        const g = Math.round(gA + (gB - gA) * t);
        const b = Math.round(bA + (bB - bA) * t);
        
        return (r << 16) | (g << 8) | b;
    }
    
    updateWeather(delta) {
        this.weatherTimer += delta;
        
        // Change weather every 5-10 minutes game time
        if (this.weatherTimer > 300 + Math.random() * 300) {
            this.weatherTimer = 0;
            this.changeWeather();
        }
    }
    
    changeWeather() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [weather, data] of Object.entries(CONFIG.weather)) {
            cumulative += data.probability;
            if (rand < cumulative) {
                GameState.weather = weather;
                break;
            }
        }
        
        this.updateWeatherDisplay();
        this.applyWeatherEffects();
    }
    
    updateWeatherDisplay() {
        const weatherEl = document.getElementById('weather-icon');
        if (weatherEl) {
            weatherEl.textContent = WEATHER_ICONS[GameState.weather];
        }
    }
    
    applyWeatherEffects() {
        const weatherData = CONFIG.weather[GameState.weather];
        
        // Adjust fog based on weather
        const fogNear = CONFIG.graphics.fogNear * weatherData.fogDensity;
        const fogFar = CONFIG.graphics.fogFar * weatherData.fogDensity;
        
        // Will be applied in updateLighting
    }
    
    updateStatsDecay(delta) {
        const minuteFactor = delta / 60; // Convert to minutes
        
        // Hunger decay
        GameState.modifyStat('hunger', -CONFIG.stats.hungerDecay * minuteFactor);
        
        // Energy decay
        GameState.modifyStat('energy', -CONFIG.stats.energyDecay * minuteFactor);
        
        // Mood decay
        GameState.modifyStat('mood', -CONFIG.stats.moodDecay * minuteFactor);
        
        // Health regen if well-fed and rested
        if (GameState.stats.hunger > 50 && GameState.stats.energy > 50) {
            GameState.modifyStat('health', CONFIG.stats.healthRegen * minuteFactor);
        }
        
        // Damage from starvation
        if (GameState.stats.hunger <= 0) {
            GameState.modifyStat('health', -1 * minuteFactor);
        }
        
        // Update UI
        this.updateStatsDisplay();
    }
    
    updateStatsDisplay() {
        const stats = ['health', 'hunger', 'energy', 'mood'];
        
        stats.forEach(stat => {
            const bar = document.getElementById(`${stat}-bar`);
            const value = document.getElementById(`${stat}-value`);
            
            if (bar) {
                bar.style.width = `${GameState.stats[stat]}%`;
            }
            if (value) {
                value.textContent = Math.floor(GameState.stats[stat]);
            }
        });
        
        // Money
        const moneyEl = document.getElementById('money-value');
        if (moneyEl) {
            moneyEl.textContent = GameState.money.toLocaleString('ru-RU');
        }
    }
    
    // Set specific time
    setTime(hour, minute = 0) {
        GameState.time.hour = hour;
        GameState.time.minute = minute;
        this.updateTimeDisplay();
        this.updateLighting();
    }
    
    // Get time string
    getTimeString() {
        const h = Math.floor(GameState.time.hour).toString().padStart(2, '0');
        const m = Math.floor(GameState.time.minute).toString().padStart(2, '0');
        return `${h}:${m}`;
    }
    
    // Get formatted time (alias)
    getFormattedTime() {
        return this.getTimeString();
    }
    
    // Get formatted date
    getFormattedDate() {
        return `${GameState.time.day} ${MONTHS[GameState.time.month]}`;
    }
    
    // Get current time as decimal hour
    getCurrentTime() {
        return GameState.time.hour + GameState.time.minute / 60;
    }
    
    // Get weather icon
    getWeatherIcon() {
        return WEATHER_ICONS[GameState.weather] || '☀️';
    }
    
    // Check if night
    isNight() {
        return GameState.time.hour >= 21 || GameState.time.hour < 6;
    }
    
    destroy() {
        if (this.sunLight) Renderer.remove(this.sunLight);
        if (this.moonLight) Renderer.remove(this.moonLight);
        if (this.ambientLight) Renderer.remove(this.ambientLight);
        if (this.hemiLight) Renderer.remove(this.hemiLight);
    }
}

export const TimeSystem = new TimeSystem();