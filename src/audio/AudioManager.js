/**
 * ГОЙДАБЛОКС - Audio Manager
 * Handles all game audio - sound effects, music, and ambient sounds
 */

export class AudioManager {
    constructor(game) {
        this.game = game;
        
        // Audio context
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        // Sound buffers
        this.sounds = new Map();
        this.music = new Map();
        
        // Currently playing
        this.activeSounds = new Map();
        this.currentMusic = null;
        this.ambientSounds = [];
        
        // State
        this.initialized = false;
        this.muted = false;
        
        // Generate procedural sounds
        this.generateSounds();
        
        console.log('🔊 AudioManager initialized');
    }
    
    /**
     * Initialize audio context (must be called after user interaction)
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Master gain
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.context.destination);
            
            // Music gain
            this.musicGain = this.context.createGain();
            this.musicGain.gain.value = 0.5;
            this.musicGain.connect(this.masterGain);
            
            // SFX gain
            this.sfxGain = this.context.createGain();
            this.sfxGain.gain.value = 0.8;
            this.sfxGain.connect(this.masterGain);
            
            this.initialized = true;
            console.log('🔊 Audio context initialized');
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    /**
     * Generate procedural sounds
     */
    generateSounds() {
        // Sound definitions (will be generated procedurally)
        this.soundDefinitions = {
            // Player sounds
            jump: { type: 'noise', duration: 0.15, frequency: 200, decay: 0.1 },
            land: { type: 'noise', duration: 0.1, frequency: 100, decay: 0.05 },
            footstep: { type: 'noise', duration: 0.08, frequency: 80, decay: 0.05 },
            hurt: { type: 'noise', duration: 0.3, frequency: 150, decay: 0.2 },
            
            // Interaction sounds
            interact: { type: 'sine', duration: 0.1, frequency: 440, decay: 0.05 },
            money: { type: 'sine', duration: 0.2, frequency: 880, decay: 0.1, harmonics: true },
            eat: { type: 'noise', duration: 0.3, frequency: 200, decay: 0.15 },
            error: { type: 'sine', duration: 0.2, frequency: 220, decay: 0.1 },
            
            // Vehicle sounds
            engine_start: { type: 'noise', duration: 0.8, frequency: 100, decay: 0.4 },
            engine_idle: { type: 'noise', duration: 2, frequency: 60, decay: 0.1, loop: true },
            horn: { type: 'square', duration: 0.5, frequency: 350, decay: 0.1 },
            car_door: { type: 'noise', duration: 0.2, frequency: 150, decay: 0.1 },
            
            // UI sounds
            click: { type: 'sine', duration: 0.05, frequency: 600, decay: 0.02 },
            hover: { type: 'sine', duration: 0.03, frequency: 800, decay: 0.01 },
            notification: { type: 'sine', duration: 0.15, frequency: 660, decay: 0.08 }
        };
    }
    
    /**
     * Generate a sound buffer from definition
     */
    generateSoundBuffer(definition) {
        if (!this.context) return null;
        
        const sampleRate = this.context.sampleRate;
        const duration = definition.duration;
        const length = sampleRate * duration;
        const buffer = this.context.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t / definition.decay);
            let sample = 0;
            
            switch (definition.type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * definition.frequency * t);
                    if (definition.harmonics) {
                        sample += Math.sin(4 * Math.PI * definition.frequency * t) * 0.5;
                        sample += Math.sin(6 * Math.PI * definition.frequency * t) * 0.25;
                    }
                    break;
                    
                case 'square':
                    sample = Math.sign(Math.sin(2 * Math.PI * definition.frequency * t));
                    break;
                    
                case 'sawtooth':
                    sample = 2 * (t * definition.frequency % 1) - 1;
                    break;
                    
                case 'noise':
                    sample = (Math.random() * 2 - 1) * 
                             Math.sin(2 * Math.PI * definition.frequency * t * 0.1);
                    break;
            }
            
            data[i] = sample * envelope * 0.5;
        }
        
        return buffer;
    }
    
    /**
     * Get or create sound buffer
     */
    getBuffer(name) {
        if (this.sounds.has(name)) {
            return this.sounds.get(name);
        }
        
        const definition = this.soundDefinitions[name];
        if (!definition) return null;
        
        const buffer = this.generateSoundBuffer(definition);
        if (buffer) {
            this.sounds.set(name, buffer);
        }
        
        return buffer;
    }
    
    /**
     * Play a sound effect
     */
    playSound(name, volume = 1, pitch = 1) {
        if (!this.initialized || this.muted) {
            this.init();
            if (!this.initialized) return null;
        }
        
        const buffer = this.getBuffer(name);
        if (!buffer) return null;
        
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = pitch;
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        source.start(0);
        
        const id = `${name}_${Date.now()}`;
        this.activeSounds.set(id, { source, gainNode });
        
        source.onended = () => {
            this.activeSounds.delete(id);
        };
        
        return id;
    }
    
    /**
     * Play a looping sound
     */
    playLoopSound(name, volume = 1) {
        if (!this.initialized || this.muted) {
            this.init();
            if (!this.initialized) return null;
        }
        
        const buffer = this.getBuffer(name);
        if (!buffer) return null;
        
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        source.start(0);
        
        const id = `${name}_loop_${Date.now()}`;
        this.activeSounds.set(id, { source, gainNode, isLoop: true });
        
        return id;
    }
    
    /**
     * Stop a specific sound
     */
    stopSound(id) {
        const sound = this.activeSounds.get(id);
        if (sound) {
            try {
                sound.source.stop();
            } catch (e) {
                // Already stopped
            }
            this.activeSounds.delete(id);
        }
    }
    
    /**
     * Set sound pitch
     */
    setSoundPitch(id, pitch) {
        const sound = this.activeSounds.get(id);
        if (sound) {
            sound.source.playbackRate.value = pitch;
        }
    }
    
    /**
     * Set sound volume
     */
    setSoundVolume(id, volume) {
        const sound = this.activeSounds.get(id);
        if (sound) {
            sound.gainNode.gain.value = volume;
        }
    }
    
    /**
     * Start ambient sounds
     */
    startAmbient() {
        // Could add ambient city sounds, birds, wind, etc.
    }
    
    /**
     * Stop ambient sounds
     */
    stopAmbient() {
        for (const sound of this.ambientSounds) {
            this.stopSound(sound);
        }
        this.ambientSounds = [];
    }
    
    /**
     * Play music
     */
    playMusic(name, volume = 0.5) {
        // Stop current music
        this.stopMusic();
        
        // Music would be loaded from files in a full implementation
        // For now, we'll generate simple procedural music
    }
    
    /**
     * Stop music
     */
    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.source.stop();
            } catch (e) {}
            this.currentMusic = null;
        }
    }
    
    /**
     * Pause all sounds
     */
    pauseAll() {
        if (this.context && this.context.state === 'running') {
            this.context.suspend();
        }
    }
    
    /**
     * Resume all sounds
     */
    resumeAll() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        if (this.musicGain) {
            this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        if (this.sfxGain) {
            this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    /**
     * Toggle mute
     */
    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 0.7;
        }
        return this.muted;
    }
    
    /**
     * Dispose audio manager
     */
    dispose() {
        // Stop all sounds
        for (const [id, sound] of this.activeSounds) {
            try {
                sound.source.stop();
            } catch (e) {}
        }
        this.activeSounds.clear();
        
        // Stop music
        this.stopMusic();
        
        // Stop ambient
        this.stopAmbient();
        
        // Close context
        if (this.context) {
            this.context.close();
        }
    }
}

export default AudioManager;