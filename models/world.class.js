class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBarHealth = new StatusbarHealth();
    statusBarBoss = new StatusbarBoss();
    statusBarCoins = new StatusbarCoins();
    statusBarBottles = new StatusbarBottles();
    throwableObjects = [];
    bottlesCount = 0;
    groundY = 420;
    // Wurf-Entprellung
    THROW_COOLDOWN_MS = 350;
    lastThrowAt = 0;
    throwHeld = false;

    // SFX
    coinSfx = new Audio('audio/coinRecievedEffect.mp3');
    bottleSfx = new Audio('audio/bottleCollectedEffect.mp3');
    bossHitSfx = new Audio('audio/bossHit.mp3');

    _shakeStart = 0;
    _shakeEnd = 0;
    _shakeMagStart = 0;
    _shakeX = 0;
    _shakeY = 0;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;

        this.coinSfx.volume = 0.6;
        this.bottleSfx.volume = 0.6;
        this.bossHitSfx.volume = 0.8;

        this.draw();
        this.setWorld();
        this.run();
    }

    triggerShake(ms = 220, mag = 10) {
        this._shakeStart = Date.now();
        this._shakeEnd = this._shakeStart + ms;
        this._shakeMagStart = mag;
    }

    computeShakeXY() {
        const now = Date.now();
        if (now >= this._shakeEnd) { this._shakeX = 0; this._shakeY = 0; return; }
        const dur = Math.max(this._shakeEnd - this._shakeStart, 1);
        const p = (this._shakeEnd - now) / dur;        // 1 → 0
        const m = this._shakeMagStart * p * p;         // ease-out
        this._shakeX = (Math.random() * 2 - 1) * m;
        this._shakeY = (Math.random() * 2 - 1) * (m * 0.6);
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
            this.checkCoinPickup();
            this.checkBottlePickup();
            this.checkThrowableImpacts();
        }, 1000 / 25);
    }

    // — THROW: one per press + cooldown —
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

            const spawnX = (dir > 0) ? (hb.x + hb.w + PAD_X)
                : (hb.x - PAD_X - W);

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

    // — IMPACTS: boss takeHit, enemy die, ground splash —
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

            if (bossHit) boss.takeHit?.(10);
            if (enemyHit) enemyHit.die?.();
            if (bossHit) {
                boss.takeHit?.(10);
                this.triggerShake(220, 10);
                if (this.bossHitSfx) { this.bossHitSfx.currentTime = 0; this.bossHitSfx.play(); } // <-- NEU: SFX
            }

            b.splash();
        });

        // Aufräumen
        this.level.enemies = enemies.filter(e => !e?.removeMe);
        this.throwableObjects = this.throwableObjects.filter(o => !o.removeMe);
    }

    checkCollisions() {
        const enemies = this.level.enemies || [];

        for (const enemy of (this.level.enemies || [])) {
            if (enemy.dead) continue;
            if (!this.character.isColliding(enemy)) continue;

            if (this.character.isStomping(enemy)) {
                enemy.die?.();
                this.character.bounce();
                this.character.y -= 6;
                break;
            }

            if (enemy.harmful !== false && !this.character.isHurt()) {
                this.character.hit();
                this.statusBarHealth.setPercentage(this.character.energy);
                this.character.applyKnockBack?.(enemy.x);
                break;
            }
        }

        this.level.enemies = enemies.filter(e => !e.removeMe);
    }


    // — Pickups —
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

    // — Draw —
    draw() {
        // Canvas leeren
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Shake berechnen (setzt this._shakeX / this._shakeY)
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

        // HUD (fix, ohne Wackeln)
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

    // Welt-Referenzen setzen + Boss merken
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
