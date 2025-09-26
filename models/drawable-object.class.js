class DrawableObject {
    x = 120;
    y = 280;
    height = 150;
    width = 100;
    img;
    imageCache = {};
    currentImage = 0;

    offset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    }

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    draw(ctx) {
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

    drawFrame(ctx) {
        const show =
            this.debug ||
            this instanceof Character ||
            this instanceof Chicken ||
            this instanceof EndBoss ||
            this instanceof Coin ||
            this instanceof Bottle ||
            this instanceof ThrowableObject;

        if (!show) return;

        ctx.save();

        // 1) Roh-Sprite-Bounds (ohne Offset) – blau
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(0, 102, 255, .9)';
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 2) Offset-Hitbox – rot gestrichelt
        const hb = this.getHitBox ? this.getHitBox() : { x: this.x, y: this.y, w: this.width, h: this.height };
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(255, 0, 0, .95)';
        ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);

        ctx.restore();
    } // löschen am Ende des Projekts
}