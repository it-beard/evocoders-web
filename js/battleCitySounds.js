class BattleCitySounds {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.enabled = true;
        this.audioElements = {};
        this.initAudio();
        this.loadSounds();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
        } catch (e) {
            console.warn('Web Audio API not supported', e);
            this.enabled = false;
        }
    }

    loadSounds() {
        const sounds = {
            stageStart: 'sounds/stage_start.mp3',
            gameOver: 'sounds/game_over.mp3'
        };

        for (const [key, url] of Object.entries(sounds)) {
            const audio = new Audio(url);
            audio.volume = 0.3;
            audio.preload = 'auto';
            this.audioElements[key] = audio;
        }
    }

    playAudioFile(audioKey) {
        if (!this.enabled || !this.audioElements[audioKey]) return 0;

        const audio = this.audioElements[audioKey];
        audio.currentTime = 0;
        audio.play().catch(e => console.warn(`Failed to play sound: ${audioKey}`, e));

        return Math.round(audio.duration * 1000) || 4000;
    }

    playStartMusic() {
        return this.playAudioFile('stageStart');
    }

    playShootSound() {
        if (!this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.1);
        
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playMoveSound() {
        if (!this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        noise.buffer = buffer;
        noise.loop = false;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 200;
        filter.Q.value = 0.5;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.03;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + 0.05);
    }

    playExplosionSound() {
        if (!this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + 0.3);
    }

    playHitWallSound() {
        if (!this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }

    playGameOverSound() {
        return this.playAudioFile('gameOver');
    }

    playLevelCompleteSound() {
        if (!this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const notes = [
            { freq: 523.25, time: 0.0, duration: 0.1 },
            { freq: 659.25, time: 0.1, duration: 0.1 },
            { freq: 783.99, time: 0.2, duration: 0.1 },
            { freq: 1046.50, time: 0.3, duration: 0.3 }
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.value = note.freq;
            
            gain.gain.setValueAtTime(0.2, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });
    }

    setVolume(volume) {
        const vol = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = vol;
        }
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = vol;
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            Object.values(this.audioElements).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        }
        return this.enabled;
    }
}

window.BattleCitySounds = BattleCitySounds;

