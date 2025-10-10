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
    IMAGES_DEAD = ['img/3_enemies_chicken/chicken_small/2_dead/dead.png'];

    constructor(x = 300 + Math.random() * 2500, speed = 0.6 + Math.random() * 0.8) {
        super();
        this._loadSprites();
        this.x = x;
        this.speed = speed;
        this.animate();
    }

    _loadSprites() {
        this.loadImage(this.IMAGES_WALK[0]);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_DEAD);
    }

    animate() {
        this._walkLoop = setInterval(() => {
            if (this.world?.isPaused || this.dead) return;
            this.moveLeft();
        }, 1000 / 60);

        this._animLoop = setInterval(() => {
            if (this.world?.isPaused || this.dead) return;
            this.playAnimation(this.IMAGES_WALK);
        }, 160);
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        sfx?.chicken();  
        this.harmful = false;
        this.speed = 0;
        this._stopLoops();
        this.img = this.imageCache[this.IMAGES_DEAD[0]];
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
