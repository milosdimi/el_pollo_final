class SmallChicken extends MovableObject {
    y = 375;
    height = 45;
    width = 60;
    offset = { top: 8, bottom: 10, left: 8, right: 8 };

    IMAGES_WALK = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];
    IMAGES_DEAD = ['img/3_enemies_chicken/chicken_small/2_dead/dead.png'];

    constructor() {
        super().loadImage(this.IMAGES_WALK[0]);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 300 + Math.random() * 900;
        this.speed = 0.6 + Math.random() * 0.8; // schneller als großes Huhn
        this.animate();
    }

    animate() {
        this._walk = setInterval(() => this.moveLeft(), 1000 / 60);
        this._anim = setInterval(() => this.playAnimation(this.IMAGES_WALK), 160);
    }

    die() {
        if (this.dead) return;
        this.dead = true; this.harmful = false; this.speed = 0;
        clearInterval(this._walk); clearInterval(this._anim);
        this.img = this.imageCache[this.IMAGES_DEAD[0]];
        setTimeout(() => this.removeMe = true, 350);
    }
}

