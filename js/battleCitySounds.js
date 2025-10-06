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
        // Battle City NES style fanfare (approx.)
        const melody = [
            { f: 523.25, t: 0.00, d: 0.12 }, // C5
            { f: 659.25, t: 0.14, d: 0.12 }, // E5
            { f: 783.99, t: 0.28, d: 0.20 }, // G5
            { f: 1046.50, t: 0.52, d: 0.25 }, // C6
            { f: 783.99, t: 0.82, d: 0.16 }, // G5
            { f: 987.77, t: 1.02, d: 0.18 }, // B5
            { f: 1174.66, t: 1.24, d: 0.22 }, // D6
            { f: 1318.51, t: 1.50, d: 0.28 }, // E6
            { f: 1046.50, t: 1.84, d: 0.20 }, // C6
            { f: 1318.51, t: 2.08, d: 0.28 }, // E6
            { f: 1567.98, t: 2.40, d: 0.36 }, // G6
            { f: 1046.50, t: 2.80, d: 0.40 }  // C6 sustain end
        ];

        melody.forEach(n => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = n.f;
            gain.gain.setValueAtTime(0.18, now + n.t);
            gain.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + n.t);
            osc.stop(now + n.t + n.d);
        });

        return 3200;
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

