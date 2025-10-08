class EndBoss extends MovableObject {
    height = 400;
    width = 250;
    y = 60;
    speed = 10;
    offset = { top: 40, bottom: 35, left: 25, right: 30 };

    // Verhalten / Zeiten
    ANIM_FPS = 9;
    ALERT_MS = 2000;
    HURT_MS = 450;
    DEAD_FRAME_MS = 140;
    DEAD_HOLD_MS = 800;

    ATTACK_DIST = 60;

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png',
    ];
    IMAGES_WALK = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png',
    ];
    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png',
    ];
    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png',
    ];
    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png',
    ];

    state = 'idle';
    energy = 100;

    baseSpeed = 10;
    SPEED_HIT_BOOST = 10;
    MAX_SPEED = 15;

    activated = false;
    harmful = true;
    isBoss = true;
    alertUntil = null;
    deadPlaying = false;

    constructor() {
        super();
        this._loadSprites();
        this.x = 2500;
        this.speed = this.baseSpeed;
        this._startLoops();
    }

    /* ---------- Setup / Cleanup ---------- */
    _loadSprites() {
        this.loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
    }

    _startLoops() {
        this.aiLoop = setInterval(() => { if (!this.world?.isPaused) this.updateAI(); }, 1000 / 20);
        this.animLoop = setInterval(() => { if (!this.world?.isPaused) this._animStep(); }, 1000 / this.ANIM_FPS);
    }

    _stopLoops() {
        if (this.aiLoop) clearInterval(this.aiLoop);
        if (this.animLoop) clearInterval(this.animLoop);
        if (this._deadLoop) clearInterval(this._deadLoop);
    }

    destroy() { this._stopLoops(); }

    /* --------------- State --------------- */
    setState(s) {
        if (this.dead || this.state === s) return;
        this.state = s;

        this.currentImage = 0;
        const first = (this._stateImages?.() || [])[0];
        const img = first ? this.imageCache[first] : null;
        if (img) this.img = img;
    }


    _animStep() {
        const imgs = this._stateImages();
        if (this.state === 'dead') return this.playAnimation(this._choose(imgs));
        this.playAnimation(imgs);
    }

    _stateImages() {
        if (this.state === 'dead') return this.IMAGES_DEAD;
        if (this.state === 'hurt') return this.IMAGES_HURT;
        if (this.state === 'attack') return this.IMAGES_ATTACK;
        if (this.state === 'alert') return this.IMAGES_ALERT;
        return this.IMAGES_WALK;
    }

    _choose(frames, fallback = this.IMAGES_ALERT) {
        return frames && frames.length ? frames : fallback;
    }

    /* --------------- Sicht --------------- */
    isInView() {
        if (!this.world) return false;
        const left = -this.world.camera_x;
        const right = left + this.world.canvas.width;
        const PAD = 8;
        return this.x < right + PAD && (this.x + this.width) > left - PAD;
    }

    /* ----------------- AI ---------------- */
    updateAI() {
        if (this.dead || this.deadPlaying) return;
        if (this.state === 'hurt') return;

        // WICHTIG: zuerst aktivieren...
        this._handleActivation();

        // ...und DANN die Alert-Phase respektieren (sofort zurück)
        if (this.alertUntil && Date.now() < this.alertUntil) return;

        if (!this.activated) return;
        this._handleChase();
    }


    _handleActivation() {
        if (this.activated || !this.isInView()) return;
        this.activated = true;
        this.setState('alert');
        this.alertUntil = Date.now() + this.ALERT_MS;
        setTimeout(() => { if (!this.dead && this.state === 'alert') this.setState('walk'); this.alertUntil = null; }, this.ALERT_MS + 20);
    }

    _handleChase() {
        const cx = this.world?.character?.x ?? this.x;
        const dx = cx - this.x;
        const adx = Math.abs(dx);

        if (adx <= this.ATTACK_DIST) this.setState('attack'); else this.setState('walk');

        // Behalte deine Blick-Logik bei (wie in deinem Original):
        if (dx < 0) { this.otherDirection = false; this.moveLeft(); }
        else { this.otherDirection = true; this.moveRight(); }
    }

    /* -------------- Treffer -------------- */
    takeHit(dmg = 25) {
        if (this.dead || this.deadPlaying) return;
        this.energy = Math.max(0, this.energy - dmg);
        this.speed = Math.min(this.speed + this.SPEED_HIT_BOOST, this.MAX_SPEED);
        this.setState('hurt');
        this.world?.statusBarBoss?.setPercentage?.(this.energy);
        setTimeout(() => { if (!this.dead) this.setState('attack'); }, this.HURT_MS);
        if (this.energy === 0) this.die();
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.harmful = false;
        this.speed = 0;
        this._stopLoops();
        this._playDeadOnce();
    }

    _playDeadOnce() {
        if (this.deadPlaying) return;
        this.deadPlaying = true;
        this.setState('dead');

        const frames = this._choose(this.IMAGES_DEAD);
        let i = 0;
        this._deadLoop = setInterval(() => {
            if (this.world?.isPaused) return;
            const img = this.imageCache[frames[i++]];
            if (img) this.img = img;
            if (i >= frames.length) {
                clearInterval(this._deadLoop);
                setTimeout(() => { this.removeMe = true; }, this.DEAD_HOLD_MS);
            }
        }, this.DEAD_FRAME_MS);
    }
}
