/**
 * Floating cloud object for parallax background.
 * Random position, random sprite, constantly drifting left.
 * @extends MovableObject
 */
class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.1;

    IMAGES_CLOUDS = [
        'img/5_background/layers/4_clouds/1.png',
        'img/5_background/layers/4_clouds/2.png'
    ];

    /**
     * Creates a cloud with random spawn settings.
     */
    constructor() {
        super();
        this._loadSprites();
        this._setRandomSpawn();
        this._setRandomImage();
        this._startFloatingLoop();
    }

    /* ---------- Setup ---------- */

    /**
     * Loads all cloud sprites into the cache.
     */
    _loadSprites() {
        this.loadImage(this.IMAGES_CLOUDS[0]);
        this.loadImages(this.IMAGES_CLOUDS);
    }

    /**
     * Sets random spawn coordinates and speed.
     */
    _setRandomSpawn() {
        this.x = Math.random() * 2000;
        this.y = 10 + Math.random() * 120;
        this.speed = 0.06 + Math.random() * 0.10;
    }

    /**
     * Chooses a random cloud sprite from the cache.
     */
    _setRandomImage() {
        const index = Math.floor(Math.random() * this.IMAGES_CLOUDS.length);
        const img = this.imageCache[this.IMAGES_CLOUDS[index]];
        if (img) this.img = img;
    }

    /* ---------- Floating Movement ---------- */

    /**
     * Starts the smooth floating movement loop.
     */
    _startFloatingLoop() {
        this._floatLoop = setInterval(() => {
            if (this.world?.isPaused) return;
            this.moveLeft();
            this._repositionIfOffscreen();
        }, 1000 / 60);
    }

    /**
     * Repositions the cloud when it fully leaves the screen.
     */
    _repositionIfOffscreen() {
        if (!this.world) return;

        const left = -this.world.camera_x;
        const right = left + this.world.canvas.width;

        if (this.x + this.width < left) {
            this._respawnCloud(right);
        }
    }

    /**
     * Respawns the cloud just outside the right edge.
     * @param {number} rightEdge X coordinate of the visible right edge.
     */
    _respawnCloud(rightEdge) {
        this.x = rightEdge + Math.random() * 300;
        this.y = 10 + Math.random() * 120;
        this.speed = 0.06 + Math.random() * 0.10;
        this._setRandomImage();
    }

    /* ---------- Cleanup ---------- */

    /**
     * Stops the cloud's movement loop.
     */
    destroy() {
        if (this._floatLoop) clearInterval(this._floatLoop);
    }
}
