class EndBoss extends MovableObject {
    height = 400;
    width = 250;
    y = 60;
    speed = 10;
    offset = { top: 40, bottom: 35, left: 25, right: 30 };

    // Timing / Verhalten
    ANIM_FPS = 9;
    ALERT_MS = 1600;
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

    // Boss Speed
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
        this.loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);

        this.x = 2500;
        this.speed = this.baseSpeed;

        this.aiLoop = setInterval(() => {
            if (!this.world?.isPaused) this.updateAI();
        }, 1000 / 20);

        this.animLoop = setInterval(() => {
            if (!this.world?.isPaused) this.playStateAnimation();
        }, 1000 / this.ANIM_FPS);
    }

    choose(frames, fallback = this.IMAGES_ALERT) {
        return (frames && frames.length) ? frames : fallback;
    }

    setState(s) {
        if (!this.dead && this.state !== s) this.state = s;
    }

    // State-to-Images Map
    getStateImages() {
        const states = {
            dead: this.IMAGES_DEAD,
            hurt: this.IMAGES_HURT,
            attack: this.IMAGES_ATTACK,
            alert: this.IMAGES_ALERT,
            walk: this.IMAGES_WALK
        };
        return states[this.state] || states.walk;
    }

    playStateAnimation() {
        const images = this.getStateImages();
        if (this.state === 'dead') {
            this.playAnimation(this.choose(images));
            return;
        }
        this.playAnimation(images);
    }

    isInView() {
        if (!this.world) return false;
        const left = -this.world.camera_x;
        const right = left + this.world.canvas.width;
        return this.x < right + 50 && (this.x + this.width) > left - 50;
    }

    _handleActivation() {
        if (this.activated) return;

        if (this.isInView()) {
            this.activated = true;
            this.setState('alert');
            this.alertUntil = Date.now() + this.ALERT_MS;
            setTimeout(() => {
                if (!this.dead && this.state === 'alert') this.setState('walk');
                this.alertUntil = null;
            }, this.ALERT_MS + 20);
        }
    }

    _handleChase() {
        const cx = this.world?.character?.x ?? this.x;
        const dx = cx - this.x;
        const absDx = Math.abs(dx);

        if (absDx <= this.ATTACK_DIST) this.setState('attack');
        else this.setState('walk');

        if (dx < 0) {
            this.otherDirection = false;
            this.moveLeft();
        } else {
            this.otherDirection = true;
            this.moveRight();
        }
    }

    updateAI() {
        if (this.dead || this.deadPlaying) return;

        if (this.alertUntil && Date.now() < this.alertUntil) return;
        if (this.state === 'hurt') return;

        this._handleActivation();
        if (!this.activated) return;

        this._handleChase();
    }

    takeHit(dmg = 25) {
        if (this.dead || this.deadPlaying) return;
        this.energy = Math.max(0, this.energy - dmg);
        this.speed = Math.min(this.speed + this.SPEED_HIT_BOOST, this.MAX_SPEED);
        this.setState('hurt');
        this.world?.statusBarBoss?.setPercentage?.(this.energy);

        setTimeout(() => {
            if (!this.dead) this.setState('attack');
        }, this.HURT_MS);

        if (this.energy === 0) this.die();
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.harmful = false;
        this.speed = 0;
        clearInterval(this.aiLoop);
        this.playDeadOnce();
    }

    playDeadOnce() {
        if (this.deadPlaying) return;
        this.deadPlaying = true;
        this.setState('dead');
        clearInterval(this.animLoop);

        const frames = this.choose(this.IMAGES_DEAD);
        let i = 0;
        const frameMs = this.DEAD_FRAME_MS;

        this._deadLoop = setInterval(() => {
            if (this.world?.isPaused) return;
            this.img = this.imageCache[frames[i++]];
            if (i >= frames.length) {
                clearInterval(this._deadLoop);
                setTimeout(() => { this.removeMe = true; }, this.DEAD_HOLD_MS);
            }
        }, frameMs);
    }
}