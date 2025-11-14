/**
 * Base class for all movable in-game objects.
 * Adds velocity, gravity, collision helpers and simple animation.
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;

    speedY = 0;
    acceleration = 2.5;

    energy = 100;
    lastHit = 0;
    currentImage = 0;
    prevY = 0;

    /**
     * Returns the hitbox from the drawable base implementation.
     * @returns {{x:number,y:number,w:number,h:number}}
     */
    getHitBox() {
        return super.getHitBox();
    }

    /**
     * Safely gets a hitbox-like rectangle from an object.
     * @param {Object} obj
     * @returns {{x:number,y:number,w:number,h:number}}
     * @private
     */
    _getBox(obj) {
        return obj?.getHitBox?.()
            || { x: obj.x, y: obj.y, w: obj.width, h: obj.height };
    }

    /**
     * Returns the Y-coordinate of the bottom edge (including offset).
     * @returns {number}
     */
    getBottomY() {
        const bot = this.offset?.bottom || 0;
        return this.y + this.height - bot;
    }

    /**
     * Ground level for this object (world-specific or default).
     * @returns {number}
     */
    getGroundLevel() {
        return this.world?.groundY ?? 390;
    }

    /**
     * Checks if this object is a ThrowableObject.
     * @returns {boolean}
     * @private
     */
    _isThrowable() {
        return typeof ThrowableObject !== 'undefined'
            && this instanceof ThrowableObject;
    }

    /**
     * Starts a gravity loop that updates vertical movement.
     */
    applyGravity() {
        setInterval(() => {
            if (this.world?.isPaused) return;
            this.prevY = this.y;
            this._verticalStep();
            if (!this._isThrowable()) {
                this._landOnGround();
            }
        }, 1000 / 25);
    }

    /**
     * Applies vertical speed and acceleration.
     * @private
     */
    _verticalStep() {
        if (this.isAboveGround() || this.speedY > 0) {
            this.y -= this.speedY;
            this.speedY -= this.acceleration;
        }
    }

    /**
     * Snaps the object to the ground if it reached ground level.
     * @private
     */
    _landOnGround() {
        const ground = this.getGroundLevel();
        if (this.getBottomY() >= ground && this.speedY <= 0) {
            const bottom = this.offset?.bottom || 0;
            this.y = ground - (this.height - bottom);
            this.speedY = 0;
        }
    }

    /**
     * Returns true if the object is currently above the ground.
     * @returns {boolean}
     */
    isAboveGround() {
        if (this._isThrowable()) return true;
        return this.getBottomY() < this.getGroundLevel() - 1;
    }

    /**
     * Checks tight collision with another movable object.
     * @param {MovableObject|DrawableObject} mo
     * @returns {boolean}
     */
    isColliding(mo) {
        const a = this._getBox(this);
        const b = this._getBox(mo);
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    }

    /**
     * Collision check with an optional padding margin.
     * Used for collectables (coins, bottles, etc.).
     * @param {Object} mo
     * @param {number} [pad=0]
     * @returns {boolean}
     */
    isPickupColliding(mo, pad = 0) {
        const a = this._getBox(this);
        const b = this._getBox(mo);
        return (
            a.x < b.x + b.w + pad &&
            a.x + a.w + pad > b.x &&
            a.y < b.y + b.h + pad &&
            a.y + a.h + pad > b.y
        );
    }

    /**
     * Applies damage and stores the time of the hit.
     */
    hit() {
        this.energy = Math.max(0, this.energy - 20);
        if (this.energy > 0) {
            this.lastHit = Date.now();
        }
    }

    /**
     * Returns true for a short time window after being hit.
     * @returns {boolean}
     */
    isHurt() {
        return Date.now() - this.lastHit < 450;
    }

    /**
     * Returns true if energy reached zero.
     * @returns {boolean}
     */
    isDead() {
        return this.energy <= 0;
    }

    /**
     * Cycles through a sprite list for simple animations.
     * @param {string[]} images
     */
    playAnimation(images) {
        if (!images?.length) return;
        const i = this.currentImage % images.length;
        const key = images[i];
        if (this.imageCache[key]) {
            this.img = this.imageCache[key];
        }
        this.currentImage++;
    }

    /**
     * Moves the object to the right.
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * Moves the object to the left.
     */
    moveLeft() {
        this.x -= this.speed;
    }

    /**
     * Simple jump: sets upward vertical speed if on the ground.
     */
    jump() {
        if (!this.isAboveGround()) {
            this.speedY = 30;
        }
    }
}
