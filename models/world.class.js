/**
 * Main game world.
 * Wires together character, level, enemies, HUD, game loop,
 * collisions, pickups and rendering.
 */
class World {
    /** Player character instance. */
    character = new Character();

    /** Active level (background, enemies, pickups, etc.). */
    level = null;

    /** Canvas and drawing context. */
    canvas;
    ctx;

    /** Keyboard input handler. */
    keyboard;

    /** Camera offset on X axis. */
    camera_x = 0;

    /** World is alive while true (draw loop runs). */
    alive = true;

    /** Interval ID for the main game loop. */
    loopId = null;

    // ------- HUD -------

    statusBarHealth = new StatusbarHealth();
    statusBarBoss = new StatusbarBoss();
    statusBarCoins = new StatusbarCoins();
    statusBarBottles = new StatusbarBottles();

    // ------- Gameplay -------

    /** Active thrown bottles. */
    throwableObjects = [];

    /** Collected bottles (ammo). */
    bottlesCount = 0;

    /** Collected coins. */
    coinsCount = 0;

    /** Total coins in level (for bar fill). */
    maxCoins = 0;

    /** Total bottles in level (for bar fill). */
    maxBottles = 0;

    /** Ground Y coordinate (collision baseline). */
    groundY = 400;

    // ------- Stomp / jump tuning -------

    STOMP_FEET_OFFSET = 30;
    STOMP_ENEMY_TOP_PAD = -2;
    STOMP_MIN_FALL = -2;
    STOMP_X_MIN = 20;

    // ------- Throw debounce -------

    THROW_COOLDOWN_MS = 350;
    lastThrowAt = 0;
    throwHeld = false;

    // ------- Pause -------

    isPaused = false;
    _pauseHeld = false;

    // ------- Screen shake -------

    _shakeStart = 0;
    _shakeEnd = 0;
    _shakeMagStart = 0;
    _shakeX = 0;
    _shakeY = 0;

    /**
     * Creates the world, binds level and starts loops.
     * @param {HTMLCanvasElement} canvas Render target.
     * @param {Keyboard} keyboard Input handler.
     * @param {Level} [level] Optional custom level.
     */
    constructor(canvas, keyboard, level) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;

        this.level = level || (
            typeof buildLevel1 === 'function'
                ? buildLevel1()
                : level1
        );

        this.setWorld();
        this.draw();
        this.run();
    }

    /* -------------- Pause -------------- */

    /** Toggles pause state and music. */
    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            sfx?.pauseMusic?.();
            sfx?.stopWalk?.();
        } else {
            sfx?.startMusic?.();
        }
    }

    /** Checks keyboard for pause toggle (P / ESC). */
    checkPauseToggle() {
        const k = this.keyboard || {};
        const req = k.P || k.ESC;

        if (req && !this._pauseHeld) {
            this.togglePause();
            this._pauseHeld = true;
        }
        if (!req) this._pauseHeld = false;
    }

    /* ----------- End States ------------ */

    /**
     * Checks for player death or boss defeat
     * and triggers end screens.
     */
    checkEndStates() {
        if (this.character?.isDead?.()) {
            this._onPlayerDead();
            return;
        }
        if (this._bossDefeated()) {
            this._onBossDefeated();
        }
    }

    /** @returns {boolean} True if boss is dead and removed. */
    _bossDefeated() {
        return this.endBoss &&
            this.endBoss.dead &&
            this.endBoss.removeMe;
    }

    /** Handles player death → lose screen + stop. */
    _onPlayerDead() {
        this.isPaused = true;
        sfx?.stopWalk?.();
        sfx?.gameOver?.();
        sfx?.pauseMusic?.();

        try {
            window.showEndOverlay &&
                window.showEndOverlay('lose');
        } catch { /* ignore overlay errors */ }
    }

    /** Handles boss defeat → win screen + stop. */
    _onBossDefeated() {
        this.isPaused = true;
        sfx?.stopWalk?.();
        sfx?.win?.();
        sfx?.pauseMusic?.();

        try {
            window.showEndOverlay &&
                window.showEndOverlay('win');
        } catch { /* ignore overlay errors */ }
    }

    /* ---------- Screen Shake ----------- */

    /**
     * Starts a short camera shake effect.
     * @param {number} [ms=220] Duration in ms.
     * @param {number} [mag=10] Shake intensity.
     */
    triggerShake(ms = 220, mag = 10) {
        this._shakeStart = Date.now();
        this._shakeEnd = this._shakeStart + ms;
        this._shakeMagStart = mag;
    }

    /** Computes current shake offset (_shakeX/_shakeY). */
    computeShakeXY() {
        const now = Date.now();

        if (now >= this._shakeEnd) {
            this._shakeX = 0;
            this._shakeY = 0;
            return;
        }

        const dur = Math.max(
            this._shakeEnd - this._shakeStart,
            1
        );
        const p = (this._shakeEnd - now) / dur;
        const m = this._shakeMagStart * p * p;

        this._shakeX = (Math.random() * 2 - 1) * m;
        this._shakeY = (Math.random() * 2 - 1) * (m * 0.6);
    }

    /* ------------ Game Loop ------------ */

    /**
     * Main logic loop (25 FPS):
     * pause, collisions, pickups, throws, impacts.
     */
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

    /** Handles keyboard input for throwing bottles. */
    checkThrowObjects() {
        const now = Date.now();
        if (!this._canThrowBottle(now)) return;

        const spawn = this._getBottleSpawn();
        this._spawnBottle(spawn);
        this._afterThrow(now);
    }

    /**
     * Checks if a new bottle may be thrown.
     * @param {number} now Current timestamp.
     * @returns {boolean}
     */
    _canThrowBottle(now) {
        if (!this.keyboard?.D) {
            this.throwHeld = false;
            return false;
        }
        if (this.throwHeld) return false;
        if (this.bottlesCount <= 0) return false;

        const tooSoon =
            now - this.lastThrowAt < this.THROW_COOLDOWN_MS;

        return !tooSoon;
    }

    /**
     * Computes initial spawn position for a thrown bottle.
     * @returns {{x:number, y:number, dir:number}}
     */
    _getBottleSpawn() {
        const dir = this.character.otherDirection ? -1 : 1;
        const hb = this.character.getHitBox
            ? this.character.getHitBox()
            : {
                x: this.character.x,
                y: this.character.y,
                w: this.character.width,
                h: this.character.height
            };

        const W = 60;
        const H = 60;
        const PAD_X = 16;
        const PAD_GND = 8;

        const x = dir > 0
            ? hb.x + hb.w + PAD_X
            : hb.x - PAD_X - W;

        const minY = hb.y + Math.min(
            Math.max(36, hb.h * 0.45),
            hb.h - H - 6
        );
        const y = Math.min(minY, this.groundY - H - PAD_GND);

        return { x, y, dir };
    }

    /**
     * Creates a ThrowableObject and registers it.
     * @param {{x:number,y:number,dir:number}} spawn
     */
    _spawnBottle(spawn) {
        const b = new ThrowableObject(
            spawn.x,
            spawn.y,
            spawn.dir,
            this
        );
        b.bornAt = Date.now();
        this.throwableObjects.push(b);
        sfx?.throw?.();
    }

    /**
     * Updates counters and flags after a successful throw.
     * @param {number} now Current timestamp.
     */
    _afterThrow(now) {
        this._changeBottleCount(-1);
        this.lastThrowAt = now;
        this.throwHeld = true;
        this.character.markActive?.();
    }

    /* ------ Throwable impacts --------- */

    /** Checks collisions between thrown bottles and enemies/boss/ground. */
    checkThrowableImpacts() {
        if (!this.throwableObjects.length) return;

        const enemies = this.level?.enemies || [];
        const boss = this.endBoss || null;

        this.throwableObjects.forEach(b =>
            this._handleThrowable(b, enemies, boss)
        );

        this._cleanupObjects();
    }

    /**
     * Handles a single throwable impact.
     * @param {ThrowableObject} b Bottle instance.
     * @param {MovableObject[]} enemies Enemies in level.
     * @param {EndBoss|null} boss Boss instance (if any).
     */
    _handleThrowable(b, enemies, boss) {
        if (b.splashed) return;

        const bossHit = !!(boss && b.isColliding(boss));
        const enemyHit = bossHit
            ? null
            : enemies.find(e => this._isHitByBottle(b, e));

        const justSpawned =
            (Date.now() - (b.bornAt || 0)) < 120;

        const groundHit =
            !justSpawned &&
            (b.y + b.height) >= this.groundY;

        if (!(bossHit || enemyHit || groundHit)) return;

        if (bossHit) this._onBossHitByBottle(boss);
        if (enemyHit) enemyHit.die?.();
        b.splash();
    }

    /** Applies boss damage and screen shake on bottle hit. */
    _onBossHitByBottle(boss) {
        boss.takeHit?.(17);
        this.triggerShake(220, 10);
    }

    /**
     * Checks if a bottle hit a non-boss enemy.
     * @param {ThrowableObject} b
     * @param {MovableObject} e
     * @returns {boolean}
     */
    _isHitByBottle(b, e) {
        if (!e || e === this.endBoss) return false;

        const isBossEnemy =
            e.isBoss ||
            (typeof EndBoss !== 'undefined' &&
                e instanceof EndBoss);

        if (isBossEnemy) return false;
        return b.isColliding(e);
    }

    /** Removes dead enemies and finished bottles. */
    _cleanupObjects() {
        const enemies = this.level?.enemies || [];

        this.level.enemies =
            enemies.filter(e => !e?.removeMe);

        this.throwableObjects =
            this.throwableObjects.filter(o => !o.removeMe);
    }

    /* ------------ Collisions ------------ */

    /**
     * Handles collisions between player and enemies:
     * stomps vs. damage.
     */
    checkCollisions() {
        const enemies = this.level?.enemies || [];
        const hits = this._getHits(enemies);
        if (!hits.length) return;

        const a = this.character.getHitBox();
        const charBottom = a.y + a.h;

        const stomped =
            this._getStomped(hits, a, charBottom);

        if (stomped.length) {
            this._handleStomp(stomped, enemies);
            return;
        }
        this._applyHurt(hits, enemies);
    }

    /**
     * Filters enemies that currently collide with the player.
     * @param {MovableObject[]} enemies
     * @returns {MovableObject[]}
     */
    _getHits(enemies) {
        return enemies.filter(e =>
            !e?.dead && this.character.isColliding(e)
        );
    }

    /**
     * Returns enemies that were stomped (player coming from above).
     * @param {MovableObject[]} hits Colliding enemies.
     * @param {{x:number,y:number,w:number,h:number}} a Player hitbox.
     * @returns {MovableObject[]}
     */
    _getStomped(hits, a) {
        const { feetPrev, feetNow } =
            this._computeFeetPositions();

        return hits.filter(e =>
            this._isValidStompTarget(e, a, feetPrev, feetNow)
        );
    }

    /** Computes player feet Y positions (previous vs current). */
    _computeFeetPositions() {
        const h = this.character.height;
        const offset = this.STOMP_FEET_OFFSET;

        const prev = (this.character.prevY ?? this.character.y)
            + h - offset;

        const now = this.character.y + h - offset;
        return { feetPrev: prev, feetNow: now };
    }

    /**
     * Checks if a stomp on this enemy is valid.
     * @param {MovableObject} e Enemy.
     * @param {{x:number,y:number,w:number,h:number}} a Player box.
     * @param {number} feetPrev
     * @param {number} feetNow
     * @returns {boolean}
     */
    _isValidStompTarget(e, a, feetPrev, feetNow) {
        if (e.isBoss) return false;

        const b = e.getHitBox();
        const overlapX =
            Math.min(a.x + a.w, b.x + b.w) -
            Math.max(a.x, b.x);

        if (overlapX <= this.STOMP_X_MIN) return false;

        const enemyTop = b.y + this.STOMP_ENEMY_TOP_PAD;
        const crossedTop =
            feetPrev <= enemyTop && feetNow >= enemyTop;

        const falling =
            this.character.speedY <= this.STOMP_MIN_FALL;

        return crossedTop && falling;
    }

    /**
     * Applies stomp result:
     * kill enemies and bounce player.
     */
    _handleStomp(stomped, enemies) {
        stomped.forEach(e => e.die?.());
        this.character.bounce();
        this.character.y -= 6;

        this.level.enemies =
            enemies.filter(e => !e.removeMe);
    }

    /**
     * Applies damage from an enemy hit to the player.
     * @param {MovableObject[]} hits
     * @param {MovableObject[]} enemies
     */
    _applyHurt(hits, enemies) {
        const hitter = hits.find(e => e.harmful !== false);
        if (hitter && !this.character.isHurt()) {
            this.character.hit();
            sfx?.hurt();
            buzz(40);

            this.statusBarHealth
                .setPercentage(this.character.energy);

            this.character.applyKnockBack?.(hitter.x);
        }

        this.level.enemies =
            enemies.filter(e => !e.removeMe);
    }

    /** Legacy helper (kept for compatibility, not used). */
    _afterStomp() {
        this.character.bounce();
        this.character.y -= 6;

        this.level.enemies =
            (this.level.enemies || [])
                .filter(e => !e.removeMe);
    }

    /** Legacy helper for applying hit from one enemy. */
    _applyHitFrom(enemy) {
        this.character.hit();
        this.statusBarHealth
            .setPercentage(this.character.energy);
        this.character.applyKnockBack?.(enemy.x);
    }

    /* --------- Camera / Scrolling -------- */

    /**
     * Sets camera_x with bounds based on level width.
     * @param {number} x Desired camera X.
     */
    setCameraX(x) {
        if (this._minCamX == null) {
            this._minCamX = this._computeMinCameraX();
        }
        const maxX = Math.min(0, x);
        this.camera_x = Math.max(this._minCamX, maxX);
    }

    /**
     * Computes the minimal camera X based on backgrounds
     * and level_end_x.
     * @returns {number}
     */
    _computeMinCameraX() {
        const bg = this.level?.backgroundObjects || [];
        let right = 0;

        for (let i = 0; i < bg.length; i++) {
            const r = (bg[i].x || 0) + (bg[i].width || 0);
            if (r > right) right = r;
        }

        const total = right ||
            (this.level?.level_end_x || 0) +
            (this.canvas?.width || 0);

        return -(total - (this.canvas?.width || 0));
    }

    /* -------------- Pickups -------------- */

    /** Checks and collects coins. */
    checkCoinPickup() {
        if (!this.level?.coins || !this.character) return;

        this.level.coins = this.level.coins.filter(c => {
            if (!this.character.isPickupColliding(c, 14)) {
                return true;
            }
            this._changeCoinCount(1);
            sfx?.coin();
            buzz(8);
            c.destroy?.();
            return false;
        });
    }

    /** Checks and collects bottles. */
    checkBottlePickup() {
        if (!this.level?.bottles || !this.character) return;

        this.level.bottles = this.level.bottles.filter(b => {
            if (!this.character.isPickupColliding(b, 8)) {
                return true;
            }
            this._changeBottleCount(1);
            sfx?.bottle();
            return false;
        });
    }

    /**
     * Updates coin count and HUD.
     * @param {number} delta Change in coins.
     */
    _changeCoinCount(delta) {
        this.coinsCount =
            Math.max(0, (this.coinsCount || 0) + delta);
        this._updateCoinBar();
    }

    /**
     * Updates bottle count and HUD.
     * @param {number} delta Change in bottles.
     */
    _changeBottleCount(delta) {
        this.bottlesCount =
            Math.max(0, (this.bottlesCount || 0) + delta);
        this._updateBottleBar();
    }

    /**
     * Calculates percentage fill for HUD bars.
     * @param {number} current Current value.
     * @param {number} max Maximum value.
     * @returns {number} Percentage [0–100].
     */
    _calcFill(current, max) {
        const safeMax = Math.max(1, max || 0);
        return (current / safeMax) * 100;
    }

    /** Updates coin status bar based on coinsCount/maxCoins. */
    _updateCoinBar() {
        const c = this.coinsCount;
        const m = Math.max(1, this.maxCoins || 0);
        let p = 0;

        if (c >= m) p = 100;
        else if (c >= m * 0.8) p = 80;
        else if (c >= m * 0.6) p = 60;
        else if (c >= m * 0.4) p = 40;
        else if (c >= m * 0.2) p = 20;

        this.statusBarCoins?.setPercentage?.(p);
    }


    /** Updates bottle status bar based on bottlesCount/maxBottles. */
    _updateBottleBar() {
        const c = this.bottlesCount;
        const m = Math.max(1, this.maxBottles || 0);
        let p = 0;

        if (c >= m) p = 100;
        else if (c >= m * 0.8) p = 80;
        else if (c >= m * 0.6) p = 60;
        else if (c >= m * 0.4) p = 40;
        else if (c >= m * 0.2) p = 20;

        this.statusBarBottles?.setPercentage?.(p);
    }


    /* ---------------- Draw ---------------- */

    /**
     * Main render loop:
     * clears, draws world, HUD, pause overlay.
     */
    draw() {
        if (!this.alive) return;

        this._clearCanvas();
        this.computeShakeXY();
        this._drawWorldLayer();
        this._drawHudLayer();

        if (this.isPaused) this._drawPauseOverlay();
        if (this.alive) {
            requestAnimationFrame(() => this.draw());
        }
    }

    /** Clears the whole canvas. */
    _clearCanvas() {
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    /** Draws background, enemies, throwables and character. */
    _drawWorldLayer() {
        this.ctx.translate(
            this.camera_x + this._shakeX,
            this._shakeY
        );

        this.addObjectsToMap(this.level?.backgroundObjects);
        this.addObjectsToMap(this.level?.clouds);
        this.addObjectsToMap(this.level?.bottles);
        this.addObjectsToMap(this.level?.coins);
        this.addObjectsToMap(this.level?.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addToMap(this.character);

        this.ctx.translate(
            -(this.camera_x + this._shakeX),
            -this._shakeY
        );
    }

    /** Draws HUD status bars. */
    _drawHudLayer() {
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarBottles);
        this.addToMap(this.statusBarBoss);
    }

    /** Renders a semi-transparent pause overlay with text. */
    _drawPauseOverlay() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        ctx.fillStyle = '#fdcacaff';
        ctx.font = 'bold 28px WildMexico, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            'PAUSED — press P or ESC',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        ctx.restore();
    }

    /* ------------- Cleanup -------------- */

    /**
     * Stops main loop and destroys all
     * level objects & references.
     */
    dispose() {
        this.alive = false;
        if (this.loopId) {
            clearInterval(this.loopId);
            this.loopId = null;
        }
        this._destroyAll();
    }

    /** Destroys character, enemies, clouds, pickups & throwables. */
    _destroyAll() {
        this.character?.destroy?.();

        const kill = arr =>
            (arr || []).forEach(o => o?.destroy?.());

        kill(this.level?.clouds);
        kill(this.level?.coins);
        kill(this.level?.enemies);
        kill(this.level?.bottles);
        kill(this.throwableObjects);

        if (this.level) {
            this.level.clouds = [];
            this.level.coins = [];
            this.level.enemies = [];
            this.level.bottles = [];
        }
        this.throwableObjects = [];
    }

    /* --------------- Drawing helpers --------------- */

    /**
     * Draws an array of drawable objects.
     * @param {DrawableObject[]} objects
     */
    addObjectsToMap(objects) {
        (objects || []).forEach(o => this.addToMap(o));
    }

    /**
     * Draws a single object, with optional mirroring.
     * @param {DrawableObject} mo
     */
    addToMap(mo) {
        if (!mo) return;

        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame?.(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    /**
     * Flips the drawing context horizontally
     * for right-to-left sprites.
     * @param {DrawableObject} mo
     */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /**
     * Restores context and original X position
     * after flipImage().
     * @param {DrawableObject} mo
     */
    flipImageBack(mo) {
        this.ctx.restore();
        mo.x = mo.x * -1;
    }

    /* --------------- Wiring --------------- */

    /**
     * Connects world to character, level objects,
     * boss and HUD counters.
     */
    setWorld() {
        this.character.world = this;
        this._minCamX = this._computeMinCameraX();

        const setW = arr =>
            (arr || []).forEach(o => o.world = this);

        setW(this.level?.clouds);
        setW(this.level?.enemies);
        setW(this.level?.coins);
        setW(this.level?.bottles);

        this._wireEndBoss();
        this._initHudAndCounts();
    }

    /** Finds the EndBoss instance in enemies and wires the boss health bar. */
    _wireEndBoss() {
        const enemies = this.level?.enemies || [];
        this.endBoss = enemies.find(e =>
            (typeof EndBoss !== 'undefined' &&
                e instanceof EndBoss) ||
            e?.constructor?.name === 'EndBoss' ||
            e?.isBoss
        );

        if (this.endBoss) {
            this.statusBarBoss
                .setPercentage(this.endBoss.energy);
        }
    }

    /** Initializes HUD counters and max values for coins & bottles. */
    _initHudAndCounts() {
        const coins = this.level?.coins || [];
        const bottles = this.level?.bottles || [];

        this.maxCoins = coins.length || 1;
        this.maxBottles = bottles.length || 1;
        this.coinsCount = 0;
        this.bottlesCount = 0;

        this._updateCoinBar();
        this._updateBottleBar();
    }
}
