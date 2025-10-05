class BattleCitySounds {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.enabled = true;
        this.initAudio();
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

    playStartMusic() {
        if (!this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const melody = [
            { freq: 659.25, time: 0.0, duration: 0.12 },
            { freq: 659.25, time: 0.14, duration: 0.12 },
            { freq: 659.25, time: 0.28, duration: 0.12 },
            { freq: 523.25, time: 0.42, duration: 0.09 },
            { freq: 659.25, time: 0.53, duration: 0.12 },
            { freq: 783.99, time: 0.67, duration: 0.24 },
            { freq: 392.00, time: 0.93, duration: 0.24 },
            { freq: 523.25, time: 1.19, duration: 0.18 },
            { freq: 392.00, time: 1.39, duration: 0.18 },
            { freq: 329.63, time: 1.59, duration: 0.18 },
            { freq: 440.00, time: 1.79, duration: 0.15 },
            { freq: 493.88, time: 1.96, duration: 0.15 },
            { freq: 466.16, time: 2.13, duration: 0.09 },
            { freq: 440.00, time: 2.24, duration: 0.18 },
            { freq: 392.00, time: 2.44, duration: 0.12 },
            { freq: 659.25, time: 2.58, duration: 0.12 },
            { freq: 783.99, time: 2.72, duration: 0.12 },
            { freq: 880.00, time: 2.86, duration: 0.18 },
            { freq: 698.46, time: 3.06, duration: 0.09 },
            { freq: 783.99, time: 3.17, duration: 0.18 },
            { freq: 659.25, time: 3.37, duration: 0.12 },
            { freq: 523.25, time: 3.51, duration: 0.12 },
            { freq: 587.33, time: 3.65, duration: 0.12 },
            { freq: 493.88, time: 3.79, duration: 0.24 }
        ];

        melody.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.value = note.freq;
            
            gain.gain.setValueAtTime(0.15, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });
        
        return 4000;
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
        if (!this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const notes = [
            { freq: 440, time: 0.0, duration: 0.2 },
            { freq: 392, time: 0.2, duration: 0.2 },
            { freq: 349.23, time: 0.4, duration: 0.2 },
            { freq: 293.66, time: 0.6, duration: 0.4 }
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.value = note.freq;
            
            gain.gain.setValueAtTime(0.15, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });
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
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

window.BattleCitySounds = BattleCitySounds;

