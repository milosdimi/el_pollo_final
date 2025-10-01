class DrawableObject {
    x = 120;
    y = 280;
    height = 150;
    width = 100;
    img;
    imageCache = {};
    currentImage = 0;

    offset = { top: 0, bottom: 0, left: 0, right: 0 };

    // Optional per-Instance Toggle
    debug = false;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    draw(ctx) {
        if (!this.img) return;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    getHitBox() {
        const o = this.offset || { top: 0, bottom: 0, left: 0, right: 0 };
        return {
            x: this.x + o.left,
            y: this.y + o.top,
            w: Math.max(8, this.width - o.left - o.right),
            h: Math.max(8, this.height - o.top - o.bottom),
        };
    }

    // Debug-Rahmen (no-op, wenn Flag aus)
    drawFrame(ctx) {
        // Globales Flag (z. B. in game.js: window.DEBUG_HITBOX = false;)
        const globalFlag = (typeof window !== 'undefined') && window.DEBUG_HITBOX;
        const worldFlag = this.world && this.world.debugHitboxes;
        const enabled = this.debug || globalFlag || worldFlag;
        if (!enabled) return;

        // Nur für relevante Klassen zeichnen
        const isInteresting =
            this.constructor?.name === 'Character' ||
            this.constructor?.name === 'Chicken' ||
            this.constructor?.name === 'SmallChicken' ||
            this.constructor?.name === 'EndBoss' ||
            this.constructor?.name === 'Coin' ||
            this.constructor?.name === 'Bottle' ||
            this.constructor?.name === 'ThrowableObject';

        if (!isInteresting) return;

        ctx.save();

        // Roh-Sprite-Bounds – blau
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(0, 102, 255, .9)';
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Offset-Hitbox – rot gestrichelt
        const hb = this.getHitBox();
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(255, 0, 0, .95)';
        ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);

        ctx.restore();
    } // Am Projektende einfach Flag aus 
}
