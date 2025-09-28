class EndBoss extends MovableObject {
    height = 400;
    width = 250;
    y = 60;
    offset = { top: 40, bottom: 35, left: 25, right: 30 };

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png',
    ];
    IMAGES_WALK = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png',
    ];
    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png',
    ];
    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png',
    ];
    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png',
    ];

    state = 'idle';
    energy = 100;
    baseSpeed = 0.45;
    speed = 0.45;
    activated = false;
    harmful = true;

    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);

        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALK);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);

        this.x = 2500;

        // Loops
        this.aiLoop = setInterval(() => this.updateAI(), 1000 / 20); // 50ms
        this.animLoop = setInterval(() => this.playStateAnimation(), 1000 / 10); // 100ms
    }

    // --- Helpers ---
    choose(frames, fallback = this.IMAGES_ALERT) {
        return (frames && frames.length) ? frames : fallback;
    }
    setState(s) { if (!this.dead && this.state !== s) this.state = s; }

    // --- Animation ---
    playStateAnimation() {
        if (this.state === 'dead') { this.playAnimation(this.choose(this.IMAGES_DEAD)); return; }
        if (this.state === 'hurt') { this.playAnimation(this.choose(this.IMAGES_HURT)); return; }
        if (this.state === 'attack') { this.playAnimation(this.choose(this.IMAGES_ATTACK)); return; }
        if (this.state === 'alert') { this.playAnimation(this.IMAGES_ALERT); return; }
        this.playAnimation(this.choose(this.IMAGES_WALK)); // default: walk
    }

    // --- Sichtprüfung (Boss erst aktiv, wenn im Bild) ---
    isInView() {
        if (!this.world) return false;
        const left = -this.world.camera_x;
        const right = left + this.world.canvas.width;
        return this.x < right + 50 && this.x + this.width > left - 50;
    }

    // --- AI / Bewegung ---
    updateAI() {
        if (this.dead) return;
        if (this.state === 'hurt') return;

        if (!this.activated) {
            if (this.isInView()) {
                this.activated = true;
                this.setState('alert');
                setTimeout(() => { if (!this.dead && this.state === 'alert') this.setState('walk'); }, 600);
            }
            return;
        }

        const cx = this.world?.character?.x ?? this.x;
        const dx = cx - this.x;
        const near = Math.abs(dx) < 120;

        if (near) { this.setState('attack'); return; }

        this.setState('walk');
        if (dx < 0) { this.otherDirection = false; this.moveLeft(); }
        else { this.otherDirection = true; this.moveRight(); }
    }


    // --- Treffer / Speedup / Death ---
    takeHit(dmg = 25) {
        if (this.dead) return;
        this.energy = Math.max(0, this.energy - dmg);
        this.speed = Math.min(this.speed + 0.25, 3.0); // pro Treffer schneller
        this.setState('hurt');
        this.world?.statusBarBoss?.setPercentage?.(this.energy);
        setTimeout(() => { if (!this.dead) this.setState('attack'); }, 250);
        if (this.energy === 0) this.die();
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.harmful = false;
        this.speed = 0;
        this.setState('dead');
        clearInterval(this.aiLoop);
        clearInterval(this.animLoop);
        setTimeout(() => this.removeMe = true, 900);
    }
}
