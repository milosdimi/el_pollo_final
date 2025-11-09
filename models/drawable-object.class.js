class DrawableObject {
  x = 120;
  y = 280;
  width = 100;
  height = 150;

  img = null;
  imageCache = {};
  currentImage = 0;

  offset = { top: 0, bottom: 0, left: 0, right: 0 };
  debug = false; // debug box on/off

  loadImage(path) {
    const image = new Image();
    image.src = path;
    this.img = image;
  }

  loadImages(arr) {
    const list = Array.isArray(arr) ? arr : [];
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const image = new Image();
      image.src = p;
      this.imageCache[p] = image;
    }
  }

  useCached(path) {
    if (!this.imageCache[path]) return;
    this.img = this.imageCache[path];
  }

  draw(ctx) {
    if (!ctx || !this.img) return;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
  }

  setOffset(o) {
    const d = o || {};
    this.offset = {
      top: d.top || 0,
      bottom: d.bottom || 0,
      left: d.left || 0,
      right: d.right || 0,
    };
  }

  getHitBox() {
    const o = this.offset || { top: 0, bottom: 0, left: 0, right: 0 };
    const w = Math.max(8, this.width - o.left - o.right);
    const h = Math.max(8, this.height - o.top - o.bottom);
    return { x: this.x + o.left, y: this.y + o.top, w, h };
  }

  overlaps(other) {
    if (!other || typeof other !== 'object') return false;
    const a = this.getHitBox();
    const b = other.getHitBox ? other.getHitBox() : {
      x: other.x, y: other.y, w: other.width, h: other.height
    };
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  centerX() {
    return this.x + this.width / 2;
  }

  centerY() {
    return this.y + this.height / 2;
  }

  _isDebugRelevant() {
    const name = this.constructor && this.constructor.name;
    return ['Character', 'Chicken', 'SmallChicken', 'Endboss', 'Coin', 'Bottle', 'ThrowableObject'].includes(name);
  }

  drawFrame(ctx) {
    const globalFlag = typeof window !== 'undefined' && window.DEBUG_HITBOX;
    const worldFlag = this.world && this.world.debugHitboxes;
    const enabled = this.debug || globalFlag || worldFlag;
    if (!enabled || !this._isDebugRelevant() || !ctx) return;

    ctx.save();

    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(0, 102, 255, .9)';
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    const hb = this.getHitBox();
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255, 0, 0, .95)';
    ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);

    ctx.restore();
  }
}
