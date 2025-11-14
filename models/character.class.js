/**
 * @file character.class.js
 * @description Main player character (Pepe) – movement, jumping, animations.
 * @author
 */

class Character extends MovableObject {
    /**
     * Main player character.
     * Handles movement, jumping, idle/long-idle and combat reactions.
     * @extends MovableObject
     */
    height = 250;
    y = 80;
    speed = 10;

    lastActiveAt = Date.now();
    LONG_IDLE_AFTER_MS = 3000;
    stompLockUntil = 0;
    lastSnoreAt = 0;

    _jumpHeld = false;
    isJumping = false;

    offset = { top: 110, bottom: 30, left: 20, right: 30 };

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png'
    ];

    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/D-51.png',
        'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png',
        'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png',
        'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png'
    ];

    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/H-41.png',
        'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png'
    ];

    IMAGES_IDLE = [
        'img/2_character_pepe/1_idle/idle/I-1.png',
        'img/2_character_pepe/1_idle/idle/I-2.png',
        'img/2_character_pepe/1_idle/idle/I-3.png',
        'img/2_character_pepe/1_idle/idle/I-4.png',
        'img/2_character_pepe/1_idle/idle/I-5.png',
        'img/2_character_pepe/1_idle/idle/I-6.png',
        'img/2_character_pepe/1_idle/idle/I-7.png',
        'img/2_character_pepe/1_idle/idle/I-8.png',
        'img/2_character_pepe/1_idle/idle/I-9.png',
        'img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    IMAGES_LONG_IDLE = [
        'img/2_character_pepe/1_idle/long_idle/I-11.png',
        'img/2_character_pepe/1_idle/long_idle/I-12.png',
        'img/2_character_pepe/1_idle/long_idle/I-13.png',
        'img/2_character_pepe/1_idle/long_idle/I-14.png',
        'img/2_character_pepe/1_idle/long_idle/I-15.png',
        'img/2_character_pepe/1_idle/long_idle/I-16.png',
        'img/2_character_pepe/1_idle/long_idle/I-17.png',
        'img/2_character_pepe/1_idle/long_idle/I-18.png',
        'img/2_character_pepe/1_idle/long_idle/I-19.png',
        'img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    constructor() {
        super();
        this._loadSprites();
        this.applyGravity();
        this.animate();
    }

    /* ---------- Setup / Sprites ---------- */

    _loadSprites() {
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
    }

    /**
     * Starts movement and animation loops.
     */
    animate() {
        this._moveLoop = setInterval(
            () => this._moveStep(),
            1000 / 60
        );
        this._animLoop = setInterval(
            () => this.playAnimationLogic(),
            100
        );
    }

    /* ---------- Movement ---------- */

    _moveStep() {
        if (this.world?.isPaused || this.isDead()) return;

        const kb = this.world?.keyboard || {};
        const endX = this.world?.level?.level_end_x ?? 3000;
        const grounded = !this.isAboveGround();

        const moved = this._handleHorizontalMove(kb, endX);
        this._handleJumpInput(kb, grounded);
        this._handleWalkSound(moved, grounded);

        if (this.world) {
            this.world.setCameraX(-this.x + 100);
        }
    }

    _handleHorizontalMove(kb, endX) {
        let moved = false;

        if (kb.RIGHT && this.x < endX) {
            this.moveRight();
            this.otherDirection = false;
            this.markActive();
            moved = true;
        }

        if (kb.LEFT && this.x > 0) {
            this.moveLeft();
            this.otherDirection = true;
            this.markActive();
            moved = true;
        }

        return moved;
    }

    _handleJumpInput(kb, grounded) {
        if (!kb.SPACE) {
            this._jumpHeld = false;
            return;
        }
        if (!grounded || this._jumpHeld) return;

        this._performJump();
        this._jumpHeld = true;
    }

    _performJump() {
        sfx?.jump();
        this.jump();
        this.markActive();
    }

    _handleWalkSound(moved, grounded) {
        if (moved && grounded && !this.isHurt()) {
            sfx?.startWalk();
        } else {
            sfx?.stopWalk?.();
        }
    }

    /* ---------- Jump / Air ---------- */

    /**
     * Starts a jump if character is on the ground.
     */
    jump() {
        if (this.isAboveGround() || this.world?.isPaused) return;
        this.speedY = 30;
        this._startJumpAnim(); // immediately show jump sprite
    }

    _startJumpAnim() {
        this.isJumping = true;
        this.currentImage = 0;
        const first = this.IMAGES_JUMPING[0];
        const img = this.imageCache[first];
        if (img) this.img = img;
    }

    /* ---------- Animation Logic ---------- */

    /**
     * Chooses and plays the correct animation based on state.
     */
    playAnimationLogic() {
        if (this.world?.isPaused) return;

        if (this.isDead()) {
            this._playDeadAnim();
            return;
        }
        if (this.isHurt()) {
            this._playHurtAnim();
            return;
        }

        // Jump animation while jumping OR in the air
        if (this.isJumping || this.isAboveGround()) {
            this._playJumpOrLandAnim();
            return;
        }

        this._playGroundAnim();
    }

    _playDeadAnim() {
        this.playAnimation(this.IMAGES_DEAD);
    }

    _playHurtAnim() {
        this.playAnimation(this.IMAGES_HURT);
    }

    /**
     * Handles jump animation and transition back to ground state.
     */
    _playJumpOrLandAnim() {
        const inAir = this.isAboveGround();
        const fallingOrDown = this.speedY <= 0;

        // Landed: back on ground, no upward speed
        if (!inAir && fallingOrDown) {
            this.isJumping = false;
            this._playGroundAnim();
            return;
        }

        if (!this.isJumping) {
            this._startJumpAnim();
        }
        this.playAnimation(this.IMAGES_JUMPING);
    }

    _playGroundAnim() {
        // Make sure we leave jump state when on ground
        if (this.isJumping) {
            this.isJumping = false;
        }

        if (this.isMovingKeyDown()) {
            this.playAnimation(this.IMAGES_WALKING);
            this.markActive();
            return;
        }

        const idleFor = Date.now() - this.lastActiveAt;
        const images =
            idleFor >= this.LONG_IDLE_AFTER_MS
                ? this.IMAGES_LONG_IDLE
                : this.IMAGES_IDLE;

        this.playAnimation(images);

        if (idleFor >= this.LONG_IDLE_AFTER_MS) {
            this._maybeSnore();
        }
    }

    _maybeSnore() {
        const now = Date.now();
        if (now - (this.lastSnoreAt || 0) <= 2500) return;
        sfx?.snore();
        this.lastSnoreAt = now;
    }

    /* ---------- Helpers / State ---------- */

    /**
     * Checks if any movement key (LEFT/RIGHT) is pressed.
     * @returns {boolean}
     */
    isMovingKeyDown() {
        const kb = this.world?.keyboard;
        return !!(kb && (kb.RIGHT || kb.LEFT));
    }

    /**
     * Marks character as active (used for idle/long-idle timing).
     */
    markActive() {
        this.lastActiveAt = Date.now();
    }

    /* ---------- Stomp (landing on enemies) ---------- */

    /**
     * Checks if this character is stomping on the given enemy.
     * @param {MovableObject} enemy
     * @returns {boolean}
     */
    isStomping(enemy) {
        if (!enemy || enemy.dead || enemy.isBoss || enemy.removeMe) return false;
        if (!this.isColliding(enemy)) return false;
        if (this.speedY >= 0) return false; // only while falling

        const enemyTop = enemy.y + (enemy.offset?.top || 0);
        const bottomPrev =
            (this.prevY ?? this.y) +
            this.height -
            (this.offset?.bottom || 0);

        const bottomNow =
            this.y +
            this.height -
            (this.offset?.bottom || 0);

        const crossedTop =
            bottomPrev <= enemyTop &&
            bottomNow >= enemyTop;

        const overlapX =
            Math.min(this.x + this.width, enemy.x + enemy.width) -
            Math.max(this.x, enemy.x);

        const MIN_OVERLAP_X = 20;
        return crossedTop && overlapX >= MIN_OVERLAP_X;
    }

    /* ---------- Bounce / Knockback ---------- */

    /**
     * Small bounce used after stomping an enemy.
     */
    bounce() {
        this.speedY = 12;
        this.stompLockUntil = Date.now() + 250;
    }

    /**
     * Knockback when the character gets hit.
     * @param {number} fromX X-position of the attacker.
     */
    applyKnockBack(fromX) {
        const dir = this.x < fromX ? -1 : 1;
        this.x += dir * 35;
        this.speedY = 14;
        this.stompLockUntil = Date.now() + 500;
        this.x = Math.max(0, this.x);
    }

    /* ---------- Cleanup ---------- */

    /**
     * Stops all timers and cleans up the character.
     */
    destroy() {
        if (this._moveLoop) clearInterval(this._moveLoop);
        if (this._animLoop) clearInterval(this._animLoop);
    }
}
