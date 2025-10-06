class Chicken extends MovableObject {
    y = 360;
    height = 60;
    width = 80;
    offset = { top: 10, bottom: 15, left: 12, right: 12 };

    IMAGES_WALKING_BIG_CHICKEN = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];
    IMAGES_DEAD_BIG_CHICKEN = [
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

    constructor(x = 200 + Math.random() * 2500, speed = 0.15 + Math.random() * 0.5) {
        super();
        this.loadImage(this.IMAGES_WALKING_BIG_CHICKEN[0]);
        this.loadImages(this.IMAGES_WALKING_BIG_CHICKEN);
        this.loadImages(this.IMAGES_DEAD_BIG_CHICKEN);
        this.x = x;
        this.speed = speed;
        this.harmful = true;
        this.animate();
    }

    animate() {
        this._walk = setInterval(() => {
            if (this.world?.isPaused || this.dead) return;
            this.moveLeft();
        }, 1000 / 60);

        this._anim = setInterval(() => {
            if (this.world?.isPaused || this.dead) return;
            this.playAnimation(this.IMAGES_WALKING_BIG_CHICKEN);
        }, 180);
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.harmful = false;
        this.speed = 0;
        clearInterval(this._walk);
        clearInterval(this._anim);
        this.img = this.imageCache[this.IMAGES_DEAD_BIG_CHICKEN[0]];
        setTimeout(() => { this.removeMe = true; }, 350);
    }
}