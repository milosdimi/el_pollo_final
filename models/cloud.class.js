class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.15;

    IMAGES_CLOUDS = [
        'img/5_background/layers/4_clouds/1.png',
        'img/5_background/layers/4_clouds/2.png'
    ];

    constructor() {
        super();
        this.loadImages(this.IMAGES_CLOUDS);

        this.x = Math.random() * 2000; // zufällige Position
        this.y = Math.random() * 120;  // zufällige Höhe
        this.setRandomCloudImage();
        this.startFloating();
    }

    setRandomCloudImage() {
        const i = Math.floor(Math.random() * this.IMAGES_CLOUDS.length);
        const path = this.IMAGES_CLOUDS[i];
        this.img = this.imageCache[path];
    }

    startFloating() {
        setInterval(() => {
            this.moveLeft();
            this.repositionIfOffscreen();
        }, 1000 / 60);
    }
    repositionIfOffscreen() {
        const camLeft = this.world ? this.world.camera_x : 0;
        const screenW = this.world ? this.world.canvas.width : 720;


        if (this.x + this.width < camLeft) {
            this.x = camLeft + screenW + Math.random() * 300; // rechts wieder rein
            this.y = 10 + Math.random() * 120;
            this.setRandomCloudImage(); // motiv wechseln
            this.speed = 0.06 + Math.random() * 0.08;
        }
    }

}