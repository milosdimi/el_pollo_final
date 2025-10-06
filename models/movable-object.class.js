class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    currentImage = 0;
    prevY = 0;

    // Standard-Hitbox (überschreibbar in Subklassen)
    getHitBox() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    // Hilfsfunktion für Box-Berechnung (vermeidet Duplikation)
    _getBox(obj) {
        return obj?.getHitBox?.() || { x: obj.x, y: obj.y, w: obj.width, h: obj.height };
    }

    // Hilfsfunktion für Boden-Position
    getBottomY() {
        const botOff = this.offset?.bottom || 0;
        return this.y + this.height - botOff;
    }

    getGroundLevel() {
        return this.world?.groundY ?? 390;
    }

    applyGravity() {
        setInterval(() => {
            if (this.world?.isPaused) return;

            const was = this.y;

            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }

            if (!(this instanceof ThrowableObject)) {
                const ground = this.getGroundLevel();
                const bottom = this.getBottomY();
                if (bottom >= ground && this.speedY <= 0) {
                    this.y = ground - (this.height - (this.offset?.bottom || 0));
                    this.speedY = 0;
                }
            }

            this.prevY = was;
        }, 1000 / 25);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) return true;
        return this.getBottomY() < this.getGroundLevel() - 1;
    }

    isColliding(mo) {
        const a = this._getBox(this);
        const b = this._getBox(mo);
        const pad = 0; 
        return a.x < b.x + b.w + pad && a.x + a.w - pad > b.x &&
            a.y < b.y + b.h + pad && a.y + a.h - pad > b.y;
    }

    isPickupColliding(mo, pad = 0) { 
        const a = this._getBox(this);
        const b = this._getBox(mo);
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

    isDead() {
        return this.energy <= 0;
    }

    playAnimation(images) {
        const i = this.currentImage % images.length;
        this.img = this.imageCache[images[i]];
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