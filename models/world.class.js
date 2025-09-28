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
    groundY = 390;

    THROW_COOLDOWN_MS = 350;
    lastThrowAt = 0;
    throwHeld = false;

    coinSfx = new Audio('audio/coinRecievedEffect.mp3');
    bottleSfx = new Audio('audio/bottleCollectedEffect.mp3');

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.coinSfx.volume = 0.6;
        this.bottleSfx.volume = 0.6;
        this.draw();
        this.setWorld();
        this.run();
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

    // ── THROW: one per press + cooldown ───────────────────────────────
    checkThrowObjects() {
        const now = Date.now();
        if (this.keyboard.D) {
            if (!this.throwHeld && this.bottlesCount > 0 && now - this.lastThrowAt >= this.THROW_COOLDOWN_MS) {
                const dir = this.character.otherDirection ? -1 : 1;
                const b = new ThrowableObject(this.character.x + 60, this.character.y + 80, dir, this);
                this.throwableObjects.push(b);
                this.bottlesCount--;
                this.statusBarBottles?.add?.(-20);
                this.lastThrowAt = now;
                this.throwHeld = true;
            }
        } else {
            this.throwHeld = false;
        }
    }

    // ── IMPACTS: boss takeHit, enemy die, ground splash ───────────────
    checkThrowableImpacts() {
        if (!this.throwableObjects.length) return;

        this.throwableObjects.forEach(b => {
            if (b.splashed) return;

            const bossHit = this.endBoss && b.isColliding(this.endBoss);
            const enemyHit = (this.level.enemies || []).find(
                e => !(e instanceof EndBoss) && b.isColliding(e)   // ❗ Boss explizit ausschließen
            );
            const groundHit = b.y + b.height >= this.groundY;

            if (!(bossHit || enemyHit || groundHit)) return;

            if (bossHit) this.endBoss.takeHit?.(25);  // Speed-Up + Hurt-Anim
            if (enemyHit) enemyHit.die?.();            // Chicken sterben
            b.splash();
        });

        this.level.enemies = (this.level.enemies || []).filter(e => !e.removeMe);
        this.throwableObjects = this.throwableObjects.filter(o => !o.removeMe);
    }


    checkCollisions() {
        const enemies = this.level.enemies || [];

        enemies.forEach(enemy => {
            if (enemy.dead) return;
            if (!this.character.isColliding(enemy)) return;

            if (this.character.isStomping(enemy)) {
                enemy.die?.();
                this.character.bounce();
                this.character.y -= 6;
                return;
            }

            if (enemy.harmful !== false && !this.character.isHurt()) {
                this.character.hit();
                this.statusBarHealth.setPercentage(this.character.energy);
                this.character.applyKnockback?.(enemy.x);
            }
        });

        this.level.enemies = enemies.filter(e => !e.removeMe);
    }

    checkCoinPickup() {
        if (!this.level?.coins || !this.character) return;
        this.level.coins = this.level.coins.filter(c => {
            if (this.character.isPickupColliding(c, 6)) {
                this.coinsCount = (this.coinsCount || 0) + 1;
                this.statusBarCoins?.add?.(10);
                this.coinSfx && (this.coinSfx.currentTime = 0, this.coinSfx.play());
                return false;
            }
            return true;
        });
    }

    checkBottlePickup() {
        if (!this.level?.bottles || !this.character) return;
        this.level.bottles = this.level.bottles.filter(b => {
            if (this.character.isPickupColliding(b, 6)) {
                this.bottlesCount++;
                this.statusBarBottles?.add?.(10);
                this.bottleSfx && (this.bottleSfx.currentTime = 0, this.bottleSfx.play());
                return false;
            }
            return true;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        if (this.level.bottles) this.addObjectsToMap(this.level.bottles);
        if (this.level.coins) this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addToMap(this.character);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarBottles);
        this.addToMap(this.statusBarBoss);

        requestAnimationFrame(() => this.draw());
    }

    addObjectsToMap(objects) { objects.forEach(o => this.addToMap(o)); }

    addToMap(mo) {
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    flipImage(mo) { this.ctx.save(); this.ctx.translate(mo.width, 0); this.ctx.scale(-1, 1); mo.x = mo.x * -1; }
    flipImageBack(mo) { this.ctx.restore(); mo.x = mo.x * -1; }

    setWorld() {
        this.character.world = this;
        const setW = arr => (arr || []).forEach(o => o.world = this);
        setW(this.level.clouds);
        setW(this.level.enemies);
        setW(this.level.coins);
        setW(this.level.bottles);

        this.endBoss = (this.level.enemies || []).find(e =>
            e instanceof EndBoss || e?.constructor?.name === 'EndBoss'
        );
        if (this.endBoss) this.statusBarBoss.setPercentage(this.endBoss.energy);
    }
}
