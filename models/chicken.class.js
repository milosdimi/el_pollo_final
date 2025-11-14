/**
 * Standard enemy chicken that walks left and can be stomped or killed.
 * Handles walking, animations, hitbox behavior and death.
 * @extends MovableObject
 */
class Chicken extends MovableObject {
    y = 360;
    width = 80;
    height = 60;
    offset = { top: -10, bottom: 15, left: 12, right: 12 };

    harmful = true;
    dead = false;
    removeMe = false;

    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

    /**
     * Creates a new walking chicken enemy.
     * @param {number} [x] Initial X position.
     * @param {number} [speed] Walking speed.
     */
    constructor(
        x = 200 + Math.random() * 2500,
        speed = 0.15 + Math.random() * 0.5
    ) {
        super();
        this._loadSprites();
        this._initPosition(x, speed);
        this._startLoops();
    }

    /* ---------- Setup ---------- */

    /**
     * Loads all necessary chicken sprites.
     */
    _loadSprites() {
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
    }

    /**
     * Sets initial spawn position and speed.
     * @param {number} x
     * @param {number} speed
     */
    _initPosition(x, speed) {
        this.x = x;
        this.speed = speed;
    }

    /**
     * Starts walking and animation loops.
     */
    _startLoops() {
        this._walkLoop = setInterval(() => {
            if (this._isInactive()) return;
            this.moveLeft();
        }, 1000 / 60);

        this._animLoop = setInterval(() => {
            if (this._isInactive()) return;
            this.playAnimation(this.IMAGES_WALKING);
        }, 180);
    }

    /**
     * Checks if the chicken should not update (paused or dead).
     * @returns {boolean}
     */
    _isInactive() {
        return this.world?.isPaused || this.dead;
    }

    /* ---------- Death ---------- */

    /**
     * Kills the chicken and schedules removal.
     */
    die() {
        if (this.dead) return;
        this.dead = true;

        sfx?.chicken();
        this.harmful = false;
        this.speed = 0;

        this._stopLoops();
        this._setDeadSprite();
        this._scheduleRemove();
    }

    /**
     * Sets the dead sprite image.
     */
    _setDeadSprite() {
        this.img = this.imageCache[this.IMAGES_DEAD[0]];
    }

    /**
     * Removes the chicken from the world after a delay.
     */
    _scheduleRemove() {
        setTimeout(() => {
            this.removeMe = true;
        }, 350);
    }

    /**
     * Called when the character stomps on the chicken.
     */
    onStomped() {
        this.die();
    }

    /* ---------- Cleanup ---------- */

    /**
     * Stops animation and movement loops.
     */
    _stopLoops() {
        if (this._walkLoop) clearInterval(this._walkLoop);
        if (this._animLoop) clearInterval(this._animLoop);
    }

    /**
     * Called when the object is removed from the world.
     */
    destroy() {
        this._stopLoops();
    }
}
