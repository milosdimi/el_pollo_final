class Chicken extends MovableObject {
    y = 360;
    width = 80;
    height = 60;
    offset = { top: -10, bottom: 15, left: 12, right: 12 };

    harmful = true;
    dead = false;
    removeMe = false;

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
        this._loadSprites();
        this.x = x;
        this.speed = speed;
        this.animate();
    }

    _loadSprites() {
        this.loadImage(this.IMAGES_WALKING_BIG_CHICKEN[0]);
        this.loadImages(this.IMAGES_WALKING_BIG_CHICKEN);
        this.loadImages(this.IMAGES_DEAD_BIG_CHICKEN);
    }

    animate() {
        this._walkLoop = setInterval(() => {
            if (this.world?.isPaused || this.dead) return;
            this.moveLeft();
        }, 1000 / 60);

        this._animLoop = setInterval(() => {
            if (this.world?.isPaused || this.dead) return;
            this.playAnimation(this.IMAGES_WALKING_BIG_CHICKEN);
        }, 180);
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        sfx?.chicken();                 
        this.harmful = false;
        this.speed = 0;
        this._stopLoops?.();
        this.img = this.imageCache[this.IMAGES_DEAD_BIG_CHICKEN[0]];
        setTimeout(() => { this.removeMe = true; }, 350);
    }

    onStomped() {
        this.die();
    }

    _stopLoops() {
        if (this._walkLoop) clearInterval(this._walkLoop);
        if (this._animLoop) clearInterval(this._animLoop);
    }

    destroy() {
        this._stopLoops();
    }
}
