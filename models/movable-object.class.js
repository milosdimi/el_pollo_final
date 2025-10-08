class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    currentImage = 0;
    prevY = 0;

    getHitBox() {
        return super.getHitBox();
    }

    _getBox(obj) {
        return obj?.getHitBox?.() || { x: obj.x, y: obj.y, w: obj.width, h: obj.height };
    }

    getBottomY() {
        const bot = this.offset?.bottom || 0;
        return this.y + this.height - bot;
    }

    getGroundLevel() {
        return this.world?.groundY ?? 390;
    }

    _isThrowable() {
        return typeof ThrowableObject !== 'undefined' && this instanceof ThrowableObject;
    }

    applyGravity() {
        setInterval(() => {
            if (this.world?.isPaused) return;
            this.prevY = this.y;
            this._verticalStep();
            if (!this._isThrowable()) this._landOnGround();
        }, 1000 / 25);
    }

    _verticalStep() {
        if (this.isAboveGround() || this.speedY > 0) {
            this.y -= this.speedY;
            this.speedY -= this.acceleration;
        }
    }

    _landOnGround() {
        const ground = this.getGroundLevel();
        if (this.getBottomY() >= ground && this.speedY <= 0) {
            const bottom = this.offset?.bottom || 0;
            this.y = ground - (this.height - bottom);
            this.speedY = 0;
        }
    }

    isAboveGround() {
        if (this._isThrowable()) return true;
        return this.getBottomY() < this.getGroundLevel() - 1;
    }

    isColliding(mo) {
        const a = this._getBox(this);
        const b = this._getBox(mo);
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    isPickupColliding(mo, pad = 0) {
        const a = this._getBox(this);
        const b = this._getBox(mo);
        return a.x < b.x + b.w + pad &&
            a.x + a.w + pad > b.x &&
            a.y < b.y + b.h + pad &&
            a.y + a.h + pad > b.y;
    }

    hit() {
        this.energy = Math.max(0, this.energy - 5);
        if (this.energy > 0) this.lastHit = Date.now();
    }

    isHurt() {
        return Date.now() - this.lastHit < 450;
    }

    isDead() {
        return this.energy <= 0;
    }

    playAnimation(images) {
        if (!images?.length) return;
        const i = this.currentImage % images.length;
        const key = images[i];
        if (this.imageCache[key]) this.img = this.imageCache[key];
        this.currentImage++;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        if (!this.isAboveGround()) this.speedY = 30;
    }
}
