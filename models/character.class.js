class Character extends MovableObject {
    height = 250;
    y = 80;
    speed = 10;

    lastActiveAt = Date.now();
    LONG_IDLE_AFTER_MS = 3000;
    stompLockUntil = 0;

    offset = { top: 110, bottom: 30, left: 50, right: 50 };

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

    _loadSprites() {
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
    }

    animate() {
        this._moveLoop = setInterval(() => this._moveStep(), 1000 / 60);
        this._animLoop = setInterval(() => this._animStep(), 100);
    }

    _moveStep() {
        if (this.world?.isPaused || this.isDead()) return;
        const kb = this.world?.keyboard || {};
        const endX = this.world?.level?.level_end_x ?? 3000;

        if (kb.RIGHT && this.x < endX) { this.moveRight(); this.otherDirection = false; this.markActive(); }
        if (kb.LEFT && this.x > 0) { this.moveLeft(); this.otherDirection = true; this.markActive(); }
        if (kb.SPACE && !this.isAboveGround()) { this.jump(); this.markActive(); }

        if (this.world) this.world.setCameraX(-this.x + 100);
    }

    _animStep() {
        if (this.world?.isPaused) return;
        if (this.isDead()) return this.playAnimation(this.IMAGES_DEAD);
        if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
        if (this.isAboveGround()) return this.playAnimation(this.IMAGES_JUMPING);
        if (this.isMovingKeyDown()) return this.playAnimation(this.IMAGES_WALKING);

        const idleFor = Date.now() - this.lastActiveAt;
        const imgs = idleFor >= this.LONG_IDLE_AFTER_MS ? this.IMAGES_LONG_IDLE : this.IMAGES_IDLE;
        this.playAnimation(imgs);
    }

    isMovingKeyDown() {
        const kb = this.world?.keyboard;
        return !!(kb && (kb.RIGHT || kb.LEFT));
    }

    markActive() {
        this.lastActiveAt = Date.now();
    }

    isStomping(enemy) {
        if (!enemy || enemy.dead || enemy.isBoss) return false;
        if (!this.isColliding(enemy)) return false;

        const b = enemy.getHitBox();
        const botPrev = (this.prevY ?? this.y) + this.height - (this.offset?.bottom || 0);
        const botNow = this.y + this.height - (this.offset?.bottom || 0);

        return this.speedY < 0 && botPrev <= b.y && botNow >= b.y;
    }

    bounce() {
        this.speedY = 12;
        this.stompLockUntil = Date.now() + 250;
    }

    applyKnockBack(fromX) {
        const dir = this.x < fromX ? -1 : 1;
        this.x += dir * 35;
        this.speedY = 14;
        this.stompLockUntil = Date.now() + 500;
        this.x = Math.max(0, this.x);  
    }


    destroy() {
        if (this._moveLoop) clearInterval(this._moveLoop);
        if (this._animLoop) clearInterval(this._animLoop);
    }
}
