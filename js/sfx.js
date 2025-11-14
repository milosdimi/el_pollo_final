/**
 * Central sound manager for all game audio.
 * Handles volumes, mute state, cloned playback and music loops.
 */
class Sfx {
    /**
     * @param {Object<string,{src:string,loop?:boolean,vol?:number}>} map Sound definitions.
     * @param {Object<string,number>} volumes Default volume overrides (0–1).
     */
    constructor(map, volumes) {
        this.sounds = {};
        this.vol = volumes || {};
        this.lastWalk = 0;
        this.walkGap = 260;

        this._addAll(map);
        this._initMutedState();
    }

    /* ------------------------------------
     * Setup & Mute State
     * ------------------------------------ */

    _addAll(map) {
        for (const k in map) {
            const def = map[k];
            const a = new Audio(def.src);
            a.loop = !!def.loop;
            a.volume = this.vol[k] ?? def.vol ?? 1;
            this.sounds[k] = a;
        }
    }

    _initMutedState() {
        const saved = localStorage.getItem('sfx.muted');
        this._muted = (saved === null) ? true : saved === '1';
        localStorage.setItem('sfx.muted', this._muted ? '1' : '0');
        this._applyMutedFlag();
    }

    _applyMutedFlag() {
        const m = !!this._muted;
        for (const k in this.sounds) {
            const a = this.sounds[k];
            a.muted = m;
            if (m && a.loop) {
                try { a.pause(); a.currentTime = 0; } catch { }
            }
        }
    }

    /* ------------------------------------
     * Public Control
     * ------------------------------------ */

    /** @returns {boolean} True if muted. */
    isMuted() { return !!this._muted; }

    /**
     * Enables or disables sound globally.
     * @param {boolean} m New mute flag.
     */
    setMuted(m) {
        this._muted = !!m;
        localStorage.setItem('sfx.muted', m ? '1' : '0');
        this._applyMutedFlag();

        if (m) {
            this.pauseMusic();
            this.stopWalk?.();
        } else {
            this.sounds.music?.play()?.catch(() => { });
        }
    }

    /** Toggles mute on/off. */
    toggleMute() { this.setMuted(!this._muted); }

    /**
     * Sets volume for a specific sound.
     * @param {string} name Sound key.
     * @param {number} v Volume (0–1).
     */
    setVolume(name, v) {
        const x = Math.max(0, Math.min(1, v));
        this.vol[name] = x;
        if (this.sounds[name]) this.sounds[name].volume = x;
    }

    /* ------------------------------------
     * Low-Level Playback
     * ------------------------------------ */

    _playRaw(name) {
        const s = this.sounds[name];
        if (!s || this._muted) return;

        if (s.loop) {
            s.play()?.catch(() => { });
            return;
        }

        const n = s.cloneNode();
        n.volume = s.volume;
        n.muted = this._muted;
        n.play()?.catch(() => { });
    }

    /* ------------------------------------
     * Music & Walk
     * ------------------------------------ */

    startMusic() {
        if (!this._muted) {
            this.sounds.music?.play()?.catch(() => { });
        }
    }

    pauseMusic() { this.sounds.music?.pause?.(); }

    stopAll() {
        for (const k in this.sounds) {
            const a = this.sounds[k];
            try { a.pause(); a.currentTime = 0; } catch { }
        }
    }

    startWalk() {
        const a = this.sounds.walk;
        if (!a || this._muted) return;
        if (a.paused) {
            try { a.currentTime = 0; a.play()?.catch(() => { }); } catch { }
        }
    }

    stopWalk() {
        const a = this.sounds.walk;
        if (!a) return;
        try { a.pause(); a.currentTime = 0; } catch { }
    }

    /* ------------------------------------
     * High-Level Event Sounds
     * ------------------------------------ */

    coin() { this._playRaw('coin'); }
    bottle() { this._playRaw('bottle'); }
    bossHit() { this._playRaw('bossHit'); }
    jump() { this._playRaw('jump'); }
    chicken() { this._playRaw('chicken'); }
    hurt() { this._playRaw('hurt'); }
    snore() { this._playRaw('snore'); }
    bossAlert() { this._playRaw('bossAlert'); }
    win() { this._playRaw('win'); }
    gameOver() { this._playRaw('gameOver'); }

    /** Plays throw sound (fallback to bottle if missing). */
    throw() {
        const key = this.sounds.throw ? 'throw' : 'bottle';
        this._playRaw(key);
    }
}

/* --------------------------------------------
 * Global Singleton Instance
 * -------------------------------------------- */
window.sfx = window.sfx || new Sfx(
    {
        coin: { src: 'audio/coinRecievedEffect.mp3' },
        bottle: { src: 'audio/bottleCollectedEffect.mp3' },
        bossHit: { src: 'audio/bossHit.mp3' },
        music: { src: 'audio/background-music.mp3', loop: true, vol: 0.2 },
        walk: { src: 'audio/walkEffect.mp3', vol: 0.8, loop: true },
        jump: { src: 'audio/jump.mp3' },
        chicken: { src: 'audio/chicken-noise-196746.mp3' },
        hurt: { src: 'audio/auah.mp3' },
        snore: { src: 'audio/snorking.mp3', vol: 0.4 },
        bossAlert: { src: 'audio/watch-out.mp3' },
        win: { src: 'audio/win.mp3' },
        gameOver: { src: 'audio/game_over.mp3' },
        throw: { src: 'audio/throw.mp3' },
    },
    {
        music: 0.3, walk: 0.8, snore: 0.4,
        coin: 0.1, bottle: 0.4, bossHit: 0.8, jump: 0.05,
        chicken: 0.5, hurt: 0.2, bossAlert: 0.9,
        win: 0.9, gameOver: 0.9
    });
