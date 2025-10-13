class Sfx {
    constructor(map, volumes) {
        this.sounds = {};
        this.vol = volumes || {};
        this.lastWalk = 0;
        this.walkGap = 260;
        this._addAll(map);

        const saved = localStorage.getItem('sfx.muted');
        this._muted = (saved === null) ? true : (saved === '1');
        localStorage.setItem('sfx.muted', this._muted ? '1' : '0');
        this._applyMutedFlag();
    }

    _addAll(map) {
        for (const k in map) {
            const a = new Audio(map[k].src);
            a.loop = !!map[k].loop;
            a.volume = this.vol[k] != null ? this.vol[k] : (map[k].vol || 1);
            this.sounds[k] = a;
        }
    }

    _applyMutedFlag() {
        const m = !!this._muted;
        for (const k in this.sounds) {
            const a = this.sounds[k];
            a.muted = m;
            if (m && a.loop) { try { a.pause(); a.currentTime = 0; } catch { } }
        }
    }

    isMuted() { return !!this._muted; }

    setMuted(m) {
        this._muted = !!m;
        localStorage.setItem('sfx.muted', this._muted ? '1' : '0');
        this._applyMutedFlag();

        if (this._muted) {
            this.pauseMusic();
            this.stopWalk?.();
        } else {
            this.sounds.music?.play()?.catch(() => { });
        }
    }


    toggleMute() { this.setMuted(!this._muted); }

    _playRaw(name) {
        const s = this.sounds[name]; if (!s) return;
        if (this._muted) return; // absolute Ruhe bei Mute
        if (s.loop) { s.play()?.catch(() => { }); return; }
        const n = s.cloneNode();
        n.volume = s.volume;
        n.muted = this._muted;
        n.play()?.catch(() => { });
    }

    startMusic() {
        if (this._muted) return;
        this.sounds.music?.play()?.catch(() => { });
    }

    pauseMusic() { this.sounds.music?.pause?.(); }

    stopAll() {
        for (const k in this.sounds) {
            try { const a = this.sounds[k]; a.pause(); a.currentTime = 0; } catch { }
        }
    }

    setVolume(n, v) {
        const x = Math.max(0, Math.min(1, v));
        this.vol[n] = x;
        if (this.sounds[n]) this.sounds[n].volume = x;
    }

    // Events
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
    throw() { this._playRaw(this.sounds.throw ? 'throw' : 'bottle'); }

    startWalk() {
        const a = this.sounds.walk; if (!a || this._muted) return;
        if (a.paused) { try { a.currentTime = 0; a.play()?.catch(() => { }); } catch { } }
    }

    stopWalk() {
        const a = this.sounds.walk; if (!a) return;
        try { a.pause(); a.currentTime = 0; } catch { }
    }
}

// Singleton 
window.sfx = window.sfx || new Sfx({
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
}, {
    music: 0.3, walk: 0.8, snore: 0.4,
    coin: 0.1, bottle: 0.4, bossHit: 0.8, jump: 0.05,
    chicken: 0.5, hurt: 0.2, bossAlert: 0.9, win: 0.9, gameOver: 0.9
});
