/**
 * Throwable salsa bottle.
 * Flies in an arc, rotates in the air and plays a splash animation on impact.
 * @extends MovableObject
 */
class ThrowableObject extends MovableObject {
    width = 60;
    height = 60;

    offset = { top: 20, bottom: 20, left: 15, right: 15 };

    /** Rotation frames while the bottle is flying. */
    IMAGES_ROTATE = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];

    /** Splash animation frames after impact. */
    IMAGES_SPLASH = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    /**
     * Creates a new throwable bottle.
     * @param {number} x Start X position.
     * @param {number} y Start Y position.
     * @param {number} [dir=1] Direction: 1 = right, -1 = left.
     * @param {World} world World reference for pauses, ground, etc.
     */
    constructor(x, y, dir = 1, world) {
        super();
        this._loadSprites();

        this.world = world;
        this.x = x;
        this.y = y;

        this.bornAt = Date.now();
        this.splashed = false;

        this.throwVx = (dir >= 0 ? 1 : -1) * 8;
        this.speedY = 20;

        this.applyGravity();
        this._startLoops();
    }

    /** Loads all bottle sprites (rotation + splash). */
    _loadSprites() {
        this.loadImage(this.IMAGES_ROTATE[0]);
        this.loadImages(this.IMAGES_ROTATE);
        this.loadImages(this.IMAGES_SPLASH);
    }

    /** Starts flight and rotation intervals. */
    _startLoops() {
        this._startFlyLoop();
        this._startSpinLoop();
    }

    /** Moves the bottle horizontally while flying. */
    _startFlyLoop() {
        this._flyLoop = setInterval(() => {
            if (!this.world?.isPaused) {
                this.x += this.throwVx;
            }
        }, 1000 / 60);
    }

    /** Rotates the bottle sprite while airborne. */
    _startSpinLoop() {
        this._spinLoop = setInterval(() => {
            if (!this.world?.isPaused) {
                this.playAnimation(this.IMAGES_ROTATE);
            }
        }, 1000 / 20);
    }

    /**
     * Triggers the splash animation and stops movement.
     * Called when the bottle hits ground, enemy or boss.
     */
    splash() {
        if (this.splashed) return;

        this._prepareSplash();
        const frames = this.IMAGES_SPLASH;

        if (!frames?.length) {
            this.removeMe = true;
            return;
        }

        this._startSplashAnim(frames);
    }

    /** Stops movement and marks bottle as splashed. */
    _prepareSplash() {
        this.splashed = true;
        this.throwVx = 0;
        this.speedY = 0;
        this._stopLoops();
    }

    /**
     * Plays through all splash frames once,
     * then removes the object from the world.
     * @param {string[]} frames
     */
    _startSplashAnim(frames) {
        let i = 0;
        this._splashLoop = setInterval(() => {
            if (this.world?.isPaused) return;

            const path = frames[i++];
            const img = this.imageCache?.[path];
            if (img) this.img = img;

            if (i >= frames.length) {
                clearInterval(this._splashLoop);
                this.removeMe = true;
            }
        }, 1000 / 14);
    }

    /**
     * Overrides gravity check for throwable bottles.
     * Bottle keeps moving upwards while speedY > 0.
     * @returns {boolean}
     */
    isAboveGround() {
        if (this.splashed) return false;
        return this.getBottomY() < this.getGroundLevel()
            || this.speedY > 0;
    }

    /** Stops all internal intervals (flight + spin). */
    _stopLoops() {
        if (this._flyLoop) clearInterval(this._flyLoop);
        if (this._spinLoop) clearInterval(this._spinLoop);
    }

    /** Cleanup including splash loop. */
    destroy() {
        this._stopLoops();
        if (this._splashLoop) clearInterval(this._splashLoop);
    }
}
