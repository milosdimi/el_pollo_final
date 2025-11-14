/**
 * Final boss of the game (giant chicken).
 * Handles activation, chasing, taking damage and dying.
 * @extends MovableObject
 */
class EndBoss extends MovableObject {
    height = 400;
    width = 250;
    y = 60;

    speed = 10;
    baseSpeed = 10;
    SPEED_HIT_BOOST = 10;
    MAX_SPEED = 15;

    offset = { top: 40, bottom: 35, left: 25, right: 30 };

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
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_WALK = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    state = 'idle';
    energy = 100;
    activated = false;
    harmful = true;
    isBoss = true;
    alertUntil = null;
    deadPlaying = false;
    alertPlayed = false;

    /**
     * Creates the boss, loads sprites and starts AI/animation loops.
     */
    constructor() {
        super();
        this._setupSprites();
        this._initPosition();
        this._setupLoops();
    }

    /* ---------- Setup / Init ---------- */

    _setupSprites() {
        this.loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
    }

    _initPosition() {
        this.x = 2500;
        this.speed = this.baseSpeed;
    }

    _setupLoops() {
        this.aiLoop = setInterval(
            () => { if (!this.world?.isPaused) this.updateAI(); },
            1000 / 20
        );
        this.animLoop = setInterval(
            () => { if (!this.world?.isPaused) this._animStep(); },
            1000 / this.ANIM_FPS
        );
    }

    /**
     * Cleans up the boss and stops all intervals.
     */
    destroy() {
        this._stopLoops();
    }

    _stopLoops() {
        clearInterval(this.aiLoop);
        clearInterval(this.animLoop);
        clearInterval(this._deadLoop);
    }

    /* ---------- State & Animation ---------- */

    /**
     * Sets the current state and jumps to the first frame of that state.
     * @param {'idle'|'walk'|'alert'|'attack'|'hurt'|'dead'} s New state
     */
    setState(s) {
        if (this.dead || this.state === s) return;
        this.state = s;
        this.currentImage = 0;
        const first = this._imagesForState()[0];
        if (first) this.img = this.imageCache[first];
    }

    _animStep() {
        const imgs = this._imagesForState();
        this.playAnimation(imgs);
    }

    _imagesForState() {
        if (this.state === 'dead') return this.IMAGES_DEAD;
        if (this.state === 'hurt') return this.IMAGES_HURT;
        if (this.state === 'attack') return this.IMAGES_ATTACK;
        if (this.state === 'alert') return this.IMAGES_ALERT;
        return this.IMAGES_WALK;
    }

    /* ---------- Visibility / Activation ---------- */

    /**
     * Checks if the boss is currently inside the camera view.
     * @returns {boolean} true if visible, otherwise false.
     */
    isInView() {
        if (!this.world) return false;

        const left = -this.world.camera_x;
        const right = left + this.world.canvas.width;
        const pad = 8;

        return this.x < right + pad &&
            (this.x + this.width) > left - pad;
    }

    /**
     * Main AI update: activation, alert phase and chasing the player.
     */
    updateAI() {
        if (this._isBusyOrDead()) return;

        this._handleActivation();
        if (!this._canChase()) return;

        this._handleChase();
    }

    _isBusyOrDead() {
        return this.dead ||
            this.deadPlaying ||
            this.state === 'hurt';
    }

    _canChase() {
        if (!this.activated) return false;
        if (!this.alertUntil) return true;
        return Date.now() >= this.alertUntil;
    }

    _handleActivation() {
        if (this.activated || !this.isInView()) return;

        this.activated = true;
        this.setState('alert');
        this._playAlertSoundOnce();
        this._scheduleEndAlert();
    }

    _playAlertSoundOnce() {
        if (this.alertPlayed) return;
        sfx?.bossAlert?.();
        this.alertPlayed = true;
    }

    _scheduleEndAlert() {
        this.alertUntil = Date.now() + this.ALERT_MS;

        setTimeout(() => {
            const stillAlert = this.state === 'alert';
            if (!this.dead && stillAlert) this.setState('walk');
            this.alertUntil = null;
        }, this.ALERT_MS + 20);
    }

    _handleChase() {
        const cx = this.world?.character?.x ?? this.x;
        const dx = cx - this.x;
        const adx = Math.abs(dx);

        this.setState(adx <= this.ATTACK_DIST ? 'attack' : 'walk');
        this._moveTowards(dx);
    }

    _moveTowards(dx) {
        if (dx < 0) {
            this.otherDirection = false;
            this.moveLeft();
        } else {
            this.otherDirection = true;
            this.moveRight();
        }
    }

    /* ---------- Hit / Death ---------- */

    /**
     * Handles a hit from a bottle (or other damage source).
     * Reduces energy and slightly increases speed.
     * @param {number} [dmg=17] Damage per hit.
     */
    takeHit(dmg = 17) {
        if (this.dead || this.deadPlaying) return;

        sfx?.bossHit?.();
        buzz(12);
        this._applyDamage(dmg);
        this._afterHit();
    }

    _applyDamage(dmg) {
        this.energy = Math.max(0, this.energy - dmg);
        this.speed = Math.min(
            this.speed + this.SPEED_HIT_BOOST,
            this.MAX_SPEED
        );
        this.setState('hurt');
        this.world?.statusBarBoss
            ?.setPercentage?.(this.energy);
    }

    _afterHit() {
        setTimeout(() => {
            if (!this.dead) this.setState('attack');
        }, this.HURT_MS);

        if (this.energy === 0) this.die();
    }

    /**
     * Kills the boss and starts the death animation sequence.
     */
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
        this._startDeadAnimLoop();
    }

    _startDeadAnimLoop() {
        const frames = this.IMAGES_DEAD;
        let i = 0;

        this._deadLoop = setInterval(() => {
            if (this.world?.isPaused) return;

            const img = this.imageCache[frames[i++]];
            if (img) this.img = img;

            if (i >= frames.length) {
                clearInterval(this._deadLoop);
                this._scheduleRemove();
            }
        }, this.DEAD_FRAME_MS);
    }

    _scheduleRemove() {
        setTimeout(() => {
            this.removeMe = true;
        }, this.DEAD_HOLD_MS);
    }
}
