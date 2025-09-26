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
        if (this instanceof Character || this instanceof Chicken || this instanceof EndBoss) {
            ctx.beginPath();
            ctx.lineWidth = '5';
            ctx.strokeStyle = 'blue';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    } // löschen am Ende des Projekts
}