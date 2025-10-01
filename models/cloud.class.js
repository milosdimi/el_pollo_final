class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.1; // Startwert, wird im ctor noch leicht variiert

    IMAGES_CLOUDS = [
        'img/5_background/layers/4_clouds/1.png',
        'img/5_background/layers/4_clouds/2.png'
    ];

    constructor() {
        super();
        this.loadImages(this.IMAGES_CLOUDS);

        // zufällige Startposition + sanfte Varianz in der Geschwindigkeit
        this.x = Math.random() * 2000;
        this.y = 10 + Math.random() * 120;
        this.speed = 0.06 + Math.random() * 0.10;

        this.setRandomCloudImage();
        this.startFloating();
    }

    setRandomCloudImage() {
        const i = Math.floor(Math.random() * this.IMAGES_CLOUDS.length);
        const path = this.IMAGES_CLOUDS[i];
        this.img = this.imageCache[path];
    }

    startFloating() {
        this._float = setInterval(() => {
            if (this.world?.isPaused) return; // ⬅️ Pause respektieren
            this.moveLeft();
            this.repositionIfOffscreen();
        }, 1000 / 60);
    }

    repositionIfOffscreen() {
        if (!this.world) return;

        const leftEdge = -this.world.camera_x;
        const rightEdge = leftEdge + this.world.canvas.width;

        // komplett links aus dem Bild? -> rechts neu „einschieben“
        if (this.x + this.width < leftEdge) {
            this.x = rightEdge + Math.random() * 300;
            this.y = 10 + Math.random() * 120;
            this.setRandomCloudImage();
            this.speed = 0.06 + Math.random() * 0.10; // kleine Varianz
        }
    }
}
