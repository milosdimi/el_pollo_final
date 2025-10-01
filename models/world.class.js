class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;

    // HUD
    statusBarHealth = new StatusbarHealth();
    statusBarBoss = new StatusbarBoss();
    statusBarCoins = new StatusbarCoins();
    statusBarBottles = new StatusbarBottles();

    // Gameplay
    throwableObjects = [];
    bottlesCount = 0;
    groundY = 420;

    // Throw debounce
    THROW_COOLDOWN_MS = 350;
    lastThrowAt = 0;
    throwHeld = false;

    // Audio (zentral)
    coinSfx = new Audio('audio/coinRecievedEffect.mp3');
    bottleSfx = new Audio('audio/bottleCollectedEffect.mp3');
    bossHitSfx = new Audio('audio/bossHit.mp3');
    music = new Audio('audio/background-music.mp3');
    walkSfx = new Audio('audio/walkEffect.mp3');
    jumpSfx = new Audio('audio/jump.mp3');

    // Mute
    isMuted = false;
    _muteHeld = false;

    // Screen shake
    _shakeStart = 0; _shakeEnd = 0; _shakeMagStart = 0;
    _shakeX = 0; _shakeY = 0;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;

        // Grundkonfig
        this.music.loop = true;
        this.walkSfx.loop = true;

        this.applyAudioMix();
        this.enableAudioOnFirstInput();

        this.draw();
        this.setWorld();
        this.run();
    }

    // ----------------- Audio Utils -----------------

    applyAudioMix() {
        const walkVol = 0.10;
        const jumpVol = 0.10;
        const sfxVol = 0.60;
        const bossVol = 0.80;
        const musicVol = 0.28;

        // Globale SFX
        if (this.coinSfx) this.coinSfx.volume = sfxVol;
        if (this.bottleSfx) this.bottleSfx.volume = sfxVol;
        if (this.bossHitSfx) this.bossHitSfx.volume = bossVol;

        // Player-SFX
        if (this.walkSfx) this.walkSfx.volume = walkVol;
        if (this.jumpSfx) this.jumpSfx.volume = jumpVol;

        // Musik
        if (this.music) this.music.volume = musicVol;
    }

    setMuted(flag) {
        this.isMuted = !!flag;
        const all = [
            this.coinSfx, this.bottleSfx, this.bossHitSfx, this.music,
            this.walkSfx, this.jumpSfx
        ];
        all.forEach(a => { if (a) a.muted = this.isMuted; });
    }
    toggleMute() { this.setMuted(!this.isMuted); }

    checkMuteToggle() {
        if (this.keyboard?.M) {
            if (!this._muteHeld) { this.toggleMute(); this._muteHeld = true; }
        } else {
            this._muteHeld = false;
        }
    }

    enableAudioOnFirstInput() {
        const start = () => {
            this.music?.play?.().catch(() => { });
            window.removeEventListener('keydown', start);
            window.removeEventListener('pointerdown', start);
        };
        window.addEventListener('keydown', start, { once: true });
        window.addEventListener('pointerdown', start, { once: true });
    }

    // Vom Character aufgerufen 
    onJump() {
        try { this.jumpSfx.currentTime = 0; this.jumpSfx.play(); } catch (e) { }
    }

    updateWalkSfx() {
        const k = this.keyboard || {};
        const moving = (k.LEFT || k.RIGHT);
        const onGround = !this.character.isAboveGround();
        const alive = !this.character.isDead?.();

        const shouldPlay = moving && onGround && alive;
        if (shouldPlay) {
            if (this.walkSfx.paused) { this.walkSfx.currentTime = 0; this.walkSfx.play().catch(() => { }); }
        } else {
            if (!this.walkSfx.paused) this.walkSfx.pause();
        }
    }

    // ----------------- Screen Shake -----------------

    triggerShake(ms = 220, mag = 10) {
        this._shakeStart = Date.now();
        this._shakeEnd = this._shakeStart + ms;
        this._shakeMagStart = mag;
    }

    computeShakeXY() {
        const now = Date.now();
        if (now >= this._shakeEnd) { this._shakeX = 0; this._shakeY = 0; return; }
        const dur = Math.max(this._shakeEnd - this._shakeStart, 1);
        const p = (this._shakeEnd - now) / dur;   // 1 → 0
        const m = this._shakeMagStart * p * p;    // ease-out
        this._shakeX = (Math.random() * 2 - 1) * m;
        this._shakeY = (Math.random() * 2 - 1) * (m * 0.6);
    }

    // ----------------- Game Loop -----------------

    run() {
        setInterval(() => {
            this.checkMuteToggle();
            this.updateWalkSfx();

            this.checkCollisions();
            this.checkThrowObjects();
            this.checkCoinPickup();
            this.checkBottlePickup();
            this.checkThrowableImpacts();
        }, 1000 / 25);
    }

    // ----------------- Throwables -----------------

    checkThrowObjects() {
        const now = Date.now();
        if (!this.keyboard.D) { this.throwHeld = false; return; }

        if (!this.throwHeld && this.bottlesCount > 0 &&
            (now - this.lastThrowAt) >= this.THROW_COOLDOWN_MS) {

            const dir = this.character.otherDirection ? -1 : 1;
            const hb = this.character.getHitBox
                ? this.character.getHitBox()
                : { x: this.character.x, y: this.character.y, w: this.character.width, h: this.character.height };

            const W = 60, H = 60, PAD_X = 16, PAD_GND = 8;

            const spawnX = (dir > 0) ? (hb.x + hb.w + PAD_X) : (hb.x - PAD_X - W);

            let spawnY = hb.y + Math.min(Math.max(36, hb.h * 0.45), hb.h - H - 6);
            const maxY = this.groundY - H - PAD_GND;
            if (spawnY > maxY) spawnY = maxY;

            const b = new ThrowableObject(spawnX, spawnY, dir, this);
            b.bornAt = Date.now(); // kurze Gnadenzeit gegen Sofort-Splash
            this.throwableObjects.push(b);

            this.bottlesCount--;
            this.statusBarBottles?.add?.(-20);
            this.lastThrowAt = now;
            this.throwHeld = true;

            this.character.markActive?.(); // Long-Idle sofort abbrechen
        }
    }

    checkThrowableImpacts() {
        if (!this.throwableObjects.length) return;
        const enemies = this.level.enemies || [];

        this.throwableObjects.forEach(b => {
            if (b.splashed) return;

            const boss = this.endBoss || null;
            const bossHit = !!(boss && b.isColliding(boss));

            let enemyHit = null;
            for (const e of enemies) {
                if (!e || e === boss || e.isBoss || e instanceof EndBoss) continue;
                if (b.isColliding(e)) { enemyHit = e; break; }
            }

            const justSpawned = (Date.now() - (b.bornAt || 0)) < 120;
            const groundHit = !justSpawned && (b.y + b.height) >= this.groundY;

            if (!(bossHit || enemyHit || groundHit)) return;

            if (bossHit) {
                boss.takeHit?.(25);                // genau 1x Schaden
                this.triggerShake(220, 10);
                if (this.bossHitSfx) { this.bossHitSfx.currentTime = 0; this.bossHitSfx.play(); }
            }
            if (enemyHit) enemyHit.die?.();

            b.splash();
        });

        // Aufräumen
        this.level.enemies = enemies.filter(e => !e?.removeMe);
        this.throwableObjects = this.throwableObjects.filter(o => !o.removeMe);
    }

    // ----------------- Collisions -----------------

    checkCollisions() {
        const enemies = this.level.enemies || [];

        for (const enemy of enemies) {
            if (enemy.dead) continue;
            if (!this.character.isColliding(enemy)) continue;

            // Stomp (fallend, oben drauf)
            if (this.character.isStomping(enemy)) {
                enemy.die?.();
                this.character.bounce();
                this.character.y -= 6; // entklemmen
                break;
            }

            // Seiten-/Frontal-Treffer (mit I-Frames)
            if (enemy.harmful !== false && !this.character.isHurt()) {
                this.character.hit();
                this.statusBarHealth.setPercentage(this.character.energy);
                this.character.applyKnockBack?.(enemy.x);
                break;
            }
        }

        this.level.enemies = enemies.filter(e => !e.removeMe);
    }

    // ----------------- Pickups -----------------

    checkCoinPickup() {
        if (!this.level?.coins || !this.character) return;
        this.level.coins = this.level.coins.filter(c => {
            if (this.character.isPickupColliding(c, 8)) {
                this.coinsCount = (this.coinsCount || 0) + 1;
                this.statusBarCoins?.add?.(10);
                if (this.coinSfx) { this.coinSfx.currentTime = 0; this.coinSfx.play(); }
                return false;
            }
            return true;
        });
    }

    checkBottlePickup() {
        if (!this.level?.bottles || !this.character) return;
        this.level.bottles = this.level.bottles.filter(b => {
            if (this.character.isPickupColliding(b, 8)) {
                this.bottlesCount++;
                this.statusBarBottles?.add?.(10);
                if (this.bottleSfx) { this.bottleSfx.currentTime = 0; this.bottleSfx.play(); }
                return false;
            }
            return true;
        });
    }

    // ----------------- Draw -----------------

    draw() {
        // Canvas leeren
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Shake berechnen
        this.computeShakeXY();

        // Welt verschieben: Kamera + Shake
        this.ctx.translate(this.camera_x + this._shakeX, this._shakeY);

        // Welt zeichnen
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        if (this.level.bottles) this.addObjectsToMap(this.level.bottles);
        if (this.level.coins) this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addToMap(this.character);

        // Welt-Translation rückgängig machen (inkl. Shake)
        this.ctx.translate(-(this.camera_x + this._shakeX), -this._shakeY);

        // HUD 
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarBottles);
        this.addToMap(this.statusBarBoss);

        // Nächstes Frame
        requestAnimationFrame(() => this.draw());
    }

    addObjectsToMap(objects) { (objects || []).forEach(o => this.addToMap(o)); }

    addToMap(mo) {
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    flipImage(mo) { this.ctx.save(); this.ctx.translate(mo.width, 0); this.ctx.scale(-1, 1); mo.x = mo.x * -1; }
    flipImageBack(mo) { this.ctx.restore(); mo.x = mo.x * -1; }

    // ----------------- Wiring -----------------

    setWorld() {
        this.character.world = this;
        const setW = arr => (arr || []).forEach(o => o.world = this);
        setW(this.level.clouds);
        setW(this.level.enemies);
        setW(this.level.coins);
        setW(this.level.bottles);

        this.endBoss = (this.level.enemies || []).find(e =>
            e instanceof EndBoss || e?.constructor?.name === 'EndBoss' || e?.isBoss
        );
        if (this.endBoss) this.statusBarBoss.setPercentage(this.endBoss.energy);
    }
}
