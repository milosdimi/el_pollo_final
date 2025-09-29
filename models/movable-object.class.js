class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;


    applyGravity() {
        setInterval(() => {
            const was = this.y;
            if (this.isAboveGround() || this.speedY > 0) {
                this.prevY = was;
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            } else {
                this.prevY = was;
            }
        }, 1000 / 25);
    }



    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < 180;
        }
    }



    isColliding(mo) {
        const a = this.getHitBox();
        const b = (mo.getHitBox ? mo.getHitBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height });
        return a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y;
    }

    isPickupColliding(mo, pad = 8) {
        const a = this.getHitBox();
        const b = mo.getHitBox ? mo.getHitBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return (a.x < b.x + b.w + pad) && (a.x + a.w + pad > b.x) &&
            (a.y < b.y + b.h + pad) && (a.y + a.h + pad > b.y);
    }


    hit() {
        this.energy -= 5;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        let t = new Date().getTime() - this.lastHit;
        return (t / 1000) < 0.35;
    }


    isDead() {
        return this.energy == 0;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 30;
    }

}
