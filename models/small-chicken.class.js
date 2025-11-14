/**
 * Small fast-moving chicken enemy.
 * Dies when stomped or hit by a bottle.
 * @extends MovableObject
 */
class SmallChicken extends MovableObject {
    y = 375;
    width = 60;
    height = 45;

    offset = { top: -30, bottom: 10, left: 8, right: 8 };

    harmful = true;
    dead = false;
    removeMe = false;

    IMAGES_WALK = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_small/2_dead/dead.png'
    ];

    /**
     * Creates a small chicken at a random spawn point.
     * @param {number} [x] Optional X position.
     * @param {number} [speed] Optional movement speed.
     */
    constructor(
        x = 300 + Math.random() * 2500,
        speed = 0.6 + Math.random() * 0.8
    ) {
        super();
        this._loadSprites();
        this.x = x;
        this.speed = speed;
        this.animate();
    }

    /** Loads walking and dead sprites. */
    _loadSprites() {
        this.loadImage(this.IMAGES_WALK[0]);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_DEAD);
    }

    /** Starts movement and walk animation loops. */
    animate() {
        this._startWalkLoop();
        this._startAnimLoop();
    }

    /** Moves the chicken left continuously. */
    _startWalkLoop() {
        this._walkLoop = setInterval(() => {
            if (this.world?.isPaused || this.dead) return;
            this.moveLeft();
        }, 1000 / 60);
    }

    /** Cycles through walk frames. */
    _startAnimLoop() {
        this._animLoop = setInterval(() => {
            if (this.world?.isPaused || this.dead) return;
            this.playAnimation(this.IMAGES_WALK);
        }, 160);
    }

    /**
     * Kills the chicken and plays death animation.
     * Called on stomp or bottle impact.
     */
    die() {
        if (this.dead) return;

        this.dead = true;
        this.harmful = false;
        this.speed = 0;

        sfx?.chicken?.();
        this._stopLoops();

        this.img = this.imageCache[this.IMAGES_DEAD[0]];
        setTimeout(() => (this.removeMe = true), 350);
    }

    /** Triggered when Pepe stomps the chicken. */
    onStomped() {
        this.die();
    }

    /** Stops all internal movement/animation loops. */
    _stopLoops() {
        if (this._walkLoop) clearInterval(this._walkLoop);
        if (this._animLoop) clearInterval(this._animLoop);
    }

    /** Cleanup call from world. */
    destroy() {
        this._stopLoops();
    }
}
