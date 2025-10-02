class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;

    applyGravity() {
        setInterval(() => {
            if (this.world?.isPaused) return;

            const was = this.y;          

            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }

            if (!(this instanceof ThrowableObject)) {
                const ground = this.world?.groundY ?? 390;
                const botOff = this.offset?.bottom || 0;
                const bottom = this.y + this.height - botOff;
                if (bottom >= ground && this.speedY <= 0) {
                    this.y = ground - (this.height - botOff);
                    this.speedY = 0;
                }
            }

            this.prevY = was;            
        }, 1000 / 25);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) return true;

        const ground = this.world?.groundY ?? 390;
        const botOff = this.offset?.bottom || 0;
        const bottom = this.y + this.height - botOff;
        return bottom < ground - 1; // kleiner Puffer, damit nichts „klebt“
    }

    // präzise AABB mit Offsets
    isColliding(mo) {
        const a = this.getHitBox ? this.getHitBox() : { x: this.x, y: this.y, w: this.width, h: this.height };
        const b = mo?.getHitBox ? mo.getHitBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    // leicht „magnetisch“ für Pickups
    isPickupColliding(mo, pad = 8) {
        const a = this.getHitBox ? this.getHitBox() : { x: this.x, y: this.y, w: this.width, h: this.height };
        const b = mo?.getHitBox ? mo.getHitBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return (a.x < b.x + b.w + pad) && (a.x + a.w + pad > b.x) &&
            (a.y < b.y + b.h + pad) && (a.y + a.h + pad > b.y);
    }

    hit() {
        this.energy = Math.max(0, this.energy - 5);
        if (this.energy > 0) this.lastHit = Date.now();
    }

    isHurt() {
        return (Date.now() - this.lastHit) < 450;
    }

    isDead() { return this.energy <= 0; }

    playAnimation(images) {
        const i = this.currentImage % images.length;
        this.img = this.imageCache[images[i]];
        this.currentImage++;
    }

    moveRight() { this.x += this.speed; }
    moveLeft() { this.x -= this.speed; }
    jump() { this.speedY = 30; }
}
