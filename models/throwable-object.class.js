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
        super().loadImage(this.IMAGES_ROTATE[0]);
        this.loadImages(this.IMAGES_ROTATE);
        this.loadImages(this.IMAGES_SPLASH);

        this.world = world;
        this.x = x;
        this.y = y;
        this.bornAt = Date.now();

        this.throwVx = (dir >= 0 ? 1 : -1) * 8; // horizontal speed
        this.speedY = 20;                      // initial "jump"

        this.applyGravity(); 
        this.start();
    }

    start() {
        this._fly = setInterval(() => { if (!this.world?.isPaused) this.x += this.throwVx; }, 1000 / 60);
        this._spin = setInterval(() => { if (!this.world?.isPaused) this.playAnimation(this.IMAGES_ROTATE); }, 1000 / 20);
    }

    splash() {
        if (this.splashed) return;
        this.splashed = true;

        // Flug stoppen
        this.throwVx = 0;
        this.speedY = 0;
        clearInterval(this._fly);
        clearInterval(this._spin);

        const frames = this.IMAGES_SPLASH;
        if (!frames?.length) { this.removeMe = true; return; }

        let i = 0;
        this._splash = setInterval(() => {
            if (this.world?.isPaused) return;               // Splash-Frames bei Pause einfrieren
            const path = frames[i++];
            const img = this.imageCache?.[path];
            if (img) this.img = img;
            if (i >= frames.length) { clearInterval(this._splash); this.removeMe = true; }
        }, 1000 / 14);
    }

    // Bodenprüfung relativ zur Welt-Bodenlinie
    isAboveGround() {
        if (this.splashed) return false;
        const g = this.world?.groundY ?? 380;
        return this.y < g - this.height || this.speedY > 0;
    }
}
