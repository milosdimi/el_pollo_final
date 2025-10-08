class World {
    character = new Character();
    level = level1;

    canvas; ctx; keyboard;
    camera_x = 0;
    alive = true;
    loopId = null;

    // HUD
    statusBarHealth = new StatusbarHealth();
    statusBarBoss = new StatusbarBoss();
    statusBarCoins = new StatusbarCoins();
    statusBarBottles = new StatusbarBottles();

    // Gameplay
    throwableObjects = [];
    bottlesCount = 0;
    coinsCount = 0;
    groundY = 400;

    // Throw debounce
    THROW_COOLDOWN_MS = 350;
    lastThrowAt = 0;
    throwHeld = false;

    // Pause
    isPaused = false;
    _pauseHeld = false;

    // Screen shake
    _shakeStart = 0;
    _shakeEnd = 0;
    _shakeMagStart = 0;
    _shakeX = 0;
    _shakeY = 0;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.setWorld();
        this.draw();
        this.run();
    }

    /* -------------- Pause -------------- */
    togglePause() { this.isPaused = !this.isPaused; }

    checkPauseToggle() {
        const k = this.keyboard || {};
        const req = k.P || k.ESC;
        if (req && !this._pauseHeld) { this.togglePause(); this._pauseHeld = true; }
        if (!req) this._pauseHeld = false;
    }

    /* ----------- End States ------------ */
    checkEndStates() {
        // Lose
        if (this.character?.isDead?.()) {
            this.isPaused = true;
            try { window.showEndOverlay && window.showEndOverlay('lose'); } catch { }
            return;
        }

        // Win NACH der Dead-Animation (+ Hold): erst wenn removeMe true ist
        if (this.endBoss && this.endBoss.dead && this.endBoss.removeMe) {
            this.isPaused = true;
            try { window.showEndOverlay && window.showEndOverlay('win'); } catch { }
        }
    }


    /* ---------- Screen Shake ----------- */
    triggerShake(ms = 220, mag = 10) {
        this._shakeStart = Date.now();
        this._shakeEnd = this._shakeStart + ms;
        this._shakeMagStart = mag;
    }

    computeShakeXY() {
        const now = Date.now();
        if (now >= this._shakeEnd) { this._shakeX = 0; this._shakeY = 0; return; }
        const dur = Math.max(this._shakeEnd - this._shakeStart, 1);
        const p = (this._shakeEnd - now) / dur;
        const m = this._shakeMagStart * p * p;
        this._shakeX = (Math.random() * 2 - 1) * m;
        this._shakeY = (Math.random() * 2 - 1) * (m * 0.6);
    }

    /* ------------ Game Loop ------------ */
    run() {
        this.loopId = setInterval(() => {
            this.checkPauseToggle();
            if (this.isPaused) return;
            this.checkEndStates();
            this.checkCollisions();
            this.checkThrowObjects();
            this.checkCoinPickup();
            this.checkBottlePickup();
            this.checkThrowableImpacts();
        }, 1000 / 25);
    }

    /* ----------- Throwables ------------ */
    checkThrowObjects() {
        const now = Date.now();
        if (!this.keyboard?.D) { this.throwHeld = false; return; }
        if (this.throwHeld) return;
        if (this.bottlesCount <= 0) return;
        if (now - this.lastThrowAt < this.THROW_COOLDOWN_MS) return;

        const spawn = this._getBottleSpawn();
        const b = new ThrowableObject(spawn.x, spawn.y, spawn.dir, this);
        b.bornAt = Date.now();
        this.throwableObjects.push(b);

        this.bottlesCount--;
        this.statusBarBottles?.add?.(-20);
        this.lastThrowAt = now;
        this.throwHeld = true;
        this.character.markActive?.();
    }

    _getBottleSpawn() {
        const dir = this.character.otherDirection ? -1 : 1;
        const hb = this.character.getHitBox
            ? this.character.getHitBox()
            : { x: this.character.x, y: this.character.y, w: this.character.width, h: this.character.height };

        const W = 60, H = 60, PAD_X = 16, PAD_GND = 8;
        const x = dir > 0 ? hb.x + hb.w + PAD_X : hb.x - PAD_X - W;
        const minY = hb.y + Math.min(Math.max(36, hb.h * 0.45), hb.h - H - 6);
        const y = Math.min(minY, this.groundY - H - PAD_GND);
        return { x, y, dir };
    }

    checkThrowableImpacts() {
        if (!this.throwableObjects.length) return;
        const enemies = this.level?.enemies || [];
        const boss = this.endBoss || null;

        this.throwableObjects.forEach(b => {
            if (b.splashed) return;

            const bossHit = !!(boss && b.isColliding(boss));
            const enemyHit = bossHit ? null : enemies.find(e => this._isHitByBottle(b, e));
            const justSpawned = (Date.now() - (b.bornAt || 0)) < 120;
            const groundHit = !justSpawned && (b.y + b.height) >= this.groundY;

            if (!(bossHit || enemyHit || groundHit)) return;

            if (bossHit) { boss.takeHit?.(25); this.triggerShake(220, 10); }
            if (enemyHit) enemyHit.die?.();
            b.splash();
        });

        this._cleanupObjects();
    }

    _isHitByBottle(b, e) {
        if (!e || e === this.endBoss) return false;
        if (e.isBoss || (typeof EndBoss !== 'undefined' && e instanceof EndBoss)) return false;
        return b.isColliding(e);
    }

    _cleanupObjects() {
        this.level.enemies = (this.level.enemies || []).filter(e => !e?.removeMe);
        this.throwableObjects = this.throwableObjects.filter(o => !o.removeMe);
    }

    /* ------------ Collisions ------------ */
    checkCollisions() {
        const enemies = this.level?.enemies || [];
        const hits = this._getHits(enemies);
        if (!hits.length) return;

        const a = this.character.getHitBox();
        const charBottom = a.y + a.h;

        const stomped = this._getStomped(hits, a, charBottom);
        if (stomped.length) { this._handleStomp(stomped, enemies); return; }

        this._applyHurt(hits, enemies);
    }

    /* --- helpers --- */
    _getHits(enemies) {
        return enemies.filter(e => !e?.dead && this.character.isColliding(e));
    }

    _getStomped(hits, a, charBottom) {
        return hits.filter(e => {
            if (e.isBoss) return false;
            const b = e.getHitBox();
            const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
            const inTop = charBottom <= b.y + b.h * 0.8 + 6;
            return overlapX > 2 && inTop;
        });
    }

    _handleStomp(stomped, enemies) {
        stomped.forEach(e => e.die?.());
        this.character.bounce();
        this.character.y -= 6;
        this.level.enemies = enemies.filter(e => !e.removeMe);
    }

    _applyHurt(hits, enemies) {
        const hitter = hits.find(e => e.harmful !== false);
        if (hitter && !this.character.isHurt()) {
            this.character.hit();
            this.statusBarHealth.setPercentage(this.character.energy);
            this.character.applyKnockBack?.(hitter.x);
        }
        this.level.enemies = enemies.filter(e => !e.removeMe);
    }

    _afterStomp() {
        this.character.bounce();
        this.character.y -= 6;
        this.level.enemies = (this.level.enemies || []).filter(e => !e.removeMe);
    }

    _applyHitFrom(enemy) {
        this.character.hit();
        this.statusBarHealth.setPercentage(this.character.energy);
        this.character.applyKnockBack?.(enemy.x);
    }

    /* -------------- Pickups -------------- */
    checkCoinPickup() {
        if (!this.level?.coins || !this.character) return;
        this.level.coins = this.level.coins.filter(c => {
            if (this.character.isPickupColliding(c, 8)) {
                this.coinsCount = (this.coinsCount || 0) + 1;
                this.statusBarCoins?.add?.(10);
                c.destroy?.();
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
                return false;
            }
            return true;
        });
    }

    /* ---------------- Draw ---------------- */
    draw() {
        if (!this.alive) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.computeShakeXY();
        this.ctx.translate(this.camera_x + this._shakeX, this._shakeY);

        this.addObjectsToMap(this.level?.backgroundObjects);
        this.addObjectsToMap(this.level?.clouds);
        this.addObjectsToMap(this.level?.bottles);
        this.addObjectsToMap(this.level?.coins);
        this.addObjectsToMap(this.level?.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addToMap(this.character);

        this.ctx.translate(-(this.camera_x + this._shakeX), -this._shakeY);

        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarBottles);
        this.addToMap(this.statusBarBoss);

        if (this.isPaused) this._drawPauseOverlay();
        if (this.alive) requestAnimationFrame(() => this.draw());
    }

    _drawPauseOverlay() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#fdcacaff';
        ctx.font = 'bold 28px WildMexico, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED — press P or ESC', this.canvas.width / 2, this.canvas.height / 2);
        ctx.restore();
    }

    dispose() {
        this.alive = false;
        if (this.loopId) { clearInterval(this.loopId); this.loopId = null; }
        this._destroyAll();
    }

    _destroyAll() {
        const kill = a => (a || []).forEach(o => o?.destroy?.());
        kill(this.level?.clouds);
        kill(this.level?.coins);
        kill(this.level?.enemies);
        kill(this.level?.bottles);
        kill(this.throwableObjects);
    }


    addObjectsToMap(objects) { (objects || []).forEach(o => this.addToMap(o)); }

    addToMap(mo) {
        if (!mo) return;
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame?.(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo) {
        this.ctx.restore();
        mo.x = mo.x * -1;
    }

    /* --------------- Wiring --------------- */
    setWorld() {
        this.character.world = this;
        const setW = arr => (arr || []).forEach(o => o.world = this);
        setW(this.level?.clouds);
        setW(this.level?.enemies);
        setW(this.level?.coins);
        setW(this.level?.bottles);

        this.endBoss = (this.level?.enemies || []).find(e =>
            (typeof EndBoss !== 'undefined' && e instanceof EndBoss) ||
            e?.constructor?.name === 'EndBoss' || e?.isBoss
        );
        if (this.endBoss) this.statusBarBoss.setPercentage(this.endBoss.energy);
    }
}
