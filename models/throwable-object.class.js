class ThrowableObject extends MovableObject {
    width = 60;
    height = 60;
    offset = { top: 20, bottom: 20, left: 15, right: 15 };

    IMAGES_ROTATE = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];
    IMAGES_SPLASH = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

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

    _loadSprites() {
        this.loadImage(this.IMAGES_ROTATE[0]);
        this.loadImages(this.IMAGES_ROTATE);
        this.loadImages(this.IMAGES_SPLASH);
    }

    _startLoops() {
        this._flyLoop = setInterval(() => {
            if (!this.world?.isPaused) this.x += this.throwVx;
        }, 1000 / 60);

        this._spinLoop = setInterval(() => {
            if (!this.world?.isPaused) this.playAnimation(this.IMAGES_ROTATE);
        }, 1000 / 20);
    }

    splash() {
        if (this.splashed) return;
        this.splashed = true;
        this.throwVx = 0;
        this.speedY = 0;
        this._stopLoops();

        const frames = this.IMAGES_SPLASH;
        if (!frames?.length) { this.removeMe = true; return; }

        let i = 0;
        this._splashLoop = setInterval(() => {
            if (this.world?.isPaused) return;
            const path = frames[i++];
            const img = this.imageCache?.[path];
            if (img) this.img = img;
            if (i >= frames.length) { clearInterval(this._splashLoop); this.removeMe = true; }
        }, 1000 / 14);
    }

    isAboveGround() {
        if (this.splashed) return false;
        return this.getBottomY() < this.getGroundLevel() || this.speedY > 0;
    }

    _stopLoops() {
        if (this._flyLoop) clearInterval(this._flyLoop);
        if (this._spinLoop) clearInterval(this._spinLoop);
    }

    destroy() {
        this._stopLoops();
        if (this._splashLoop) clearInterval(this._splashLoop);
    }
}
