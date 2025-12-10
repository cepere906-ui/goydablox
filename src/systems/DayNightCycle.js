/**
 * ГОЙДАБЛОКС - Day/Night Cycle System
 * Realistic day/night cycle with seasonal variations
 */

import * as THREE from 'three';
import { CONFIG } from '../config/GameConfig.js';

// Time constants
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const REAL_SECONDS_PER_GAME_MINUTE = 1; // 1 real second = 1 game minute
const GAME_MINUTES_PER_REAL_SECOND = 1 / REAL_SECONDS_PER_GAME_MINUTE;

// Seasons
const SEASONS = {
    SPRING: 'spring',
    SUMMER: 'summer',
    AUTUMN: 'autumn',
    WINTER: 'winter'
};

// Season data (Moscow-like climate)
const SEASON_DATA = {
    [SEASONS.SPRING]: {
        sunriseHour: 5.5,
        sunsetHour: 20,
        baseTemperature: 10,
        dayLength: 14.5,
        months: [3, 4, 5]
    },
    [SEASONS.SUMMER]: {
        sunriseHour: 4,
        sunsetHour: 22,
        baseTemperature: 22,
        dayLength: 18,
        months: [6, 7, 8]
    },
    [SEASONS.AUTUMN]: {
        sunriseHour: 6.5,
        sunsetHour: 18.5,
        baseTemperature: 8,
        dayLength: 12,
        months: [9, 10, 11]
    },
    [SEASONS.WINTER]: {
        sunriseHour: 9,
        sunsetHour: 16,
        baseTemperature: -8,
        dayLength: 7,
        months: [12, 1, 2]
    }
};

export class DayNightCycle {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        
        // Time state
        this.gameTime = 12 * 60; // Start at noon (minutes from midnight)
        this.gameDay = 1;
        this.gameMonth = 6; // June
        this.gameYear = 2024;
        
        // Speed control
        this.timeScale = 1; // 1 = normal, 2 = 2x speed, etc.
        this.paused = false;
        
        // Lighting
        this.sunLight = null;
        this.moonLight = null;
        this.ambientLight = null;
        this.hemisphereLight = null;
        
        // Sky colors
        this.currentSkyColor = new THREE.Color(0x87CEEB);
        this.targetSkyColor = new THREE.Color(0x87CEEB);
        
        // Initialize lights
        this.createLights();
        
        // Update initial state
        this.updateLighting();
        
        console.log('🌅 DayNightCycle initialized');
    }
    
    /**
     * Create lighting system
     */
    createLights() {
        // Directional sun light
        this.sunLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        this.sunLight.position.set(100, 100, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.scene.add(this.sunLight);
        
        // Moon light (dimmer, blue-ish)
        this.moonLight = new THREE.DirectionalLight(0x4444AA, 0.1);
        this.moonLight.position.set(-50, 50, -25);
        this.scene.add(this.moonLight);
        
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);
        this.game.ambientLight = this.ambientLight;
        
        // Hemisphere light (sky/ground)
        this.hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3D5C3D, 0.3);
        this.scene.add(this.hemisphereLight);
    }
    
    /**
     * Update day/night cycle
     */
    update(delta) {
        if (this.paused) return;
        
        // Advance game time
        const gameMinutes = delta * GAME_MINUTES_PER_REAL_SECOND * this.timeScale;
        this.gameTime += gameMinutes;
        
        // Handle day change
        if (this.gameTime >= HOURS_PER_DAY * MINUTES_PER_HOUR) {
            this.gameTime -= HOURS_PER_DAY * MINUTES_PER_HOUR;
            this.advanceDay();
        }
        
        // Update lighting based on time
        this.updateLighting();
    }
    
    /**
     * Advance to next day
     */
    advanceDay() {
        this.gameDay++;
        
        // Days per month (simplified)
        const daysInMonth = 30;
        
        if (this.gameDay > daysInMonth) {
            this.gameDay = 1;
            this.gameMonth++;
            
            if (this.gameMonth > 12) {
                this.gameMonth = 1;
                this.gameYear++;
            }
        }
        
        // Notify game of new day
        this.game.onNewDay?.();
        
        // Update economy daily
        this.game.economy?.updateDaily();
        
        console.log(`📅 Day ${this.gameDay}, ${this.getMonthName()} ${this.gameYear}`);
    }
    
    /**
     * Update lighting based on time of day
     */
    updateLighting() {
        const hour = this.getHour();
        const season = this.getSeason();
        const seasonData = SEASON_DATA[season];
        
        // Calculate sun position
        const sunAngle = this.calculateSunAngle(hour, seasonData);
        const sunHeight = Math.sin(sunAngle);
        const sunHorizontal = Math.cos(sunAngle);
        
        // Update sun position
        this.sunLight.position.set(
            sunHorizontal * 100,
            Math.max(sunHeight * 100, -20),
            50
        );
        
        // Update moon position (opposite to sun)
        this.moonLight.position.set(
            -sunHorizontal * 50,
            Math.max(-sunHeight * 50, 10),
            -25
        );
        
        // Calculate light intensities based on sun height
        const dayProgress = this.getDayProgress(hour, seasonData);
        
        // Sun intensity
        let sunIntensity = 0;
        if (sunHeight > 0) {
            sunIntensity = Math.pow(sunHeight, 0.5) * 1.2;
        } else if (sunHeight > -0.2) {
            // Twilight
            sunIntensity = (sunHeight + 0.2) * 2.5;
        }
        this.sunLight.intensity = Math.max(0, sunIntensity);
        
        // Moon intensity (visible at night)
        const moonIntensity = sunHeight < 0 ? Math.min(0.15, -sunHeight * 0.5) : 0;
        this.moonLight.intensity = moonIntensity;
        
        // Ambient light
        const ambientIntensity = 0.2 + Math.max(0, sunHeight) * 0.4;
        this.ambientLight.intensity = ambientIntensity;
        
        // Update colors
        this.updateColors(hour, sunHeight, seasonData);
        
        // Update shadows
        this.sunLight.castShadow = sunHeight > 0;
    }
    
    /**
     * Calculate sun angle based on hour and season
     */
    calculateSunAngle(hour, seasonData) {
        const { sunriseHour, sunsetHour } = seasonData;
        const dayLength = sunsetHour - sunriseHour;
        
        if (hour < sunriseHour) {
            // Before sunrise
            return -Math.PI / 2;
        } else if (hour > sunsetHour) {
            // After sunset
            return -Math.PI / 2;
        } else {
            // During day
            const dayProgress = (hour - sunriseHour) / dayLength;
            return Math.sin(dayProgress * Math.PI) * Math.PI / 2;
        }
    }
    
    /**
     * Get day progress (0-1)
     */
    getDayProgress(hour, seasonData) {
        const { sunriseHour, sunsetHour } = seasonData;
        
        if (hour < sunriseHour) return 0;
        if (hour > sunsetHour) return 1;
        
        return (hour - sunriseHour) / (sunsetHour - sunriseHour);
    }
    
    /**
     * Update colors based on time
     */
    updateColors(hour, sunHeight, seasonData) {
        // Sky color
        let skyColor;
        
        if (sunHeight > 0.3) {
            // Day
            skyColor = new THREE.Color(0x87CEEB);
        } else if (sunHeight > 0) {
            // Golden hour
            const t = sunHeight / 0.3;
            skyColor = new THREE.Color(0xFF7700).lerp(new THREE.Color(0x87CEEB), t);
        } else if (sunHeight > -0.2) {
            // Twilight
            const t = (sunHeight + 0.2) / 0.2;
            skyColor = new THREE.Color(0x1a1a3a).lerp(new THREE.Color(0xFF7700), t);
        } else {
            // Night
            skyColor = new THREE.Color(0x0a0a1a);
        }
        
        // Seasonal color adjustments
        const season = this.getSeason();
        if (season === SEASONS.WINTER) {
            // Bluer, colder tones
            skyColor.lerp(new THREE.Color(0x8899AA), 0.3);
        } else if (season === SEASONS.AUTUMN) {
            // Warmer, hazier
            skyColor.lerp(new THREE.Color(0xAA9988), 0.2);
        }
        
        // Apply to scene
        this.targetSkyColor = skyColor;
        this.currentSkyColor.lerp(this.targetSkyColor, 0.02);
        this.scene.background = this.currentSkyColor;
        
        // Update sun light color
        if (sunHeight > 0.3) {
            this.sunLight.color.setHex(0xFFFFEE);
        } else if (sunHeight > 0) {
            this.sunLight.color.setHex(0xFFAA66);
        } else {
            this.sunLight.color.setHex(0xFFEEDD);
        }
        
        // Update hemisphere light
        this.hemisphereLight.color.copy(this.currentSkyColor);
    }
    
    /**
     * Get current hour (float)
     */
    getHour() {
        return this.gameTime / MINUTES_PER_HOUR;
    }
    
    /**
     * Get current hour (int)
     */
    getHourInt() {
        return Math.floor(this.getHour());
    }
    
    /**
     * Get current minute
     */
    getMinute() {
        return Math.floor(this.gameTime % MINUTES_PER_HOUR);
    }
    
    /**
     * Get formatted time string
     */
    getTimeString() {
        const hour = this.getHourInt();
        const minute = this.getMinute();
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    /**
     * Get current season
     */
    getSeason() {
        for (const [season, data] of Object.entries(SEASON_DATA)) {
            if (data.months.includes(this.gameMonth)) {
                return season;
            }
        }
        return SEASONS.SUMMER;
    }
    
    /**
     * Get season display name
     */
    getSeasonName() {
        const names = {
            [SEASONS.SPRING]: 'Весна',
            [SEASONS.SUMMER]: 'Лето',
            [SEASONS.AUTUMN]: 'Осень',
            [SEASONS.WINTER]: 'Зима'
        };
        return names[this.getSeason()];
    }
    
    /**
     * Get month display name
     */
    getMonthName() {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[this.gameMonth - 1];
    }
    
    /**
     * Get base temperature for current season
     */
    getSeasonTemperature() {
        const season = this.getSeason();
        return SEASON_DATA[season].baseTemperature;
    }
    
    /**
     * Check if it's daytime
     */
    isDaytime() {
        const hour = this.getHour();
        const season = this.getSeason();
        const data = SEASON_DATA[season];
        return hour >= data.sunriseHour && hour <= data.sunsetHour;
    }
    
    /**
     * Check if it's night
     */
    isNight() {
        return !this.isDaytime();
    }
    
    /**
     * Get time of day string
     */
    getTimeOfDay() {
        const hour = this.getHour();
        
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }
    
    /**
     * Get time of day display string
     */
    getTimeOfDayName() {
        const names = {
            'morning': 'Утро',
            'afternoon': 'День',
            'evening': 'Вечер',
            'night': 'Ночь'
        };
        return names[this.getTimeOfDay()];
    }
    
    /**
     * Set specific time
     */
    setTime(hour, minute = 0) {
        this.gameTime = hour * MINUTES_PER_HOUR + minute;
        this.updateLighting();
    }
    
    /**
     * Set date
     */
    setDate(day, month, year) {
        this.gameDay = day;
        this.gameMonth = month;
        this.gameYear = year;
        this.updateLighting();
    }
    
    /**
     * Set time scale
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, Math.min(100, scale));
    }
    
    /**
     * Pause time
     */
    pause() {
        this.paused = true;
    }
    
    /**
     * Resume time
     */
    resume() {
        this.paused = false;
    }
    
    /**
     * Skip to specific time
     */
    skipTo(targetHour) {
        const currentHour = this.getHour();
        
        if (targetHour > currentHour) {
            this.gameTime = targetHour * MINUTES_PER_HOUR;
        } else {
            // Skip to next day
            this.advanceDay();
            this.gameTime = targetHour * MINUTES_PER_HOUR;
        }
        
        this.updateLighting();
    }
    
    /**
     * Get full date string
     */
    getDateString() {
        return `${this.gameDay} ${this.getMonthName()} ${this.gameYear}`;
    }
    
    /**
     * Save state
     */
    save() {
        return {
            gameTime: this.gameTime,
            gameDay: this.gameDay,
            gameMonth: this.gameMonth,
            gameYear: this.gameYear,
            timeScale: this.timeScale
        };
    }
    
    /**
     * Load state
     */
    load(data) {
        if (!data) return;
        
        this.gameTime = data.gameTime || 12 * 60;
        this.gameDay = data.gameDay || 1;
        this.gameMonth = data.gameMonth || 6;
        this.gameYear = data.gameYear || 2024;
        this.timeScale = data.timeScale || 1;
        
        this.updateLighting();
    }
    
    /**
     * Dispose
     */
    dispose() {
        this.scene.remove(this.sunLight);
        this.scene.remove(this.moonLight);
        this.scene.remove(this.ambientLight);
        this.scene.remove(this.hemisphereLight);
    }
}

export { SEASONS };
export default DayNightCycle;