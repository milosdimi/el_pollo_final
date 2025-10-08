class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.1;

    IMAGES_CLOUDS = [
        'img/5_background/layers/4_clouds/1.png',
        'img/5_background/layers/4_clouds/2.png'
    ];

    constructor() {
        super();
        this._loadSprites();
        this._randomizeStart();
        this.setRandomCloudImage();
        this.startFloating();
    }

    _loadSprites() {
        this.loadImage(this.IMAGES_CLOUDS[0]);
        this.loadImages(this.IMAGES_CLOUDS);
    }

    _randomizeStart() {
        this.x = Math.random() * 2000;
        this.y = 10 + Math.random() * 120;
        this.speed = 0.06 + Math.random() * 0.10;
    }

    setRandomCloudImage() {
        const i = Math.floor(Math.random() * this.IMAGES_CLOUDS.length);
        const img = this.imageCache[this.IMAGES_CLOUDS[i]];
        if (img) this.img = img;
    }

    startFloating() {
        this._floatLoop = setInterval(() => {
            if (this.world?.isPaused) return;
            this.moveLeft();
            this.repositionIfOffscreen();
        }, 1000 / 60);
    }

    repositionIfOffscreen() {
        if (!this.world) return;
        const left = -this.world.camera_x;
        const right = left + this.world.canvas.width;
        if (this.x + this.width < left) {
            this.x = right + Math.random() * 300;
            this.y = 10 + Math.random() * 120;
            this.speed = 0.06 + Math.random() * 0.10;
            this.setRandomCloudImage();
        }
    }

    destroy() {
        if (this._floatLoop) clearInterval(this._floatLoop);
    }
}
