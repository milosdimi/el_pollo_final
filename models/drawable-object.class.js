/**
 * Base class for all drawable in-game objects.
 * Handles sprites, hitboxes, and optional debug drawing.
 */
class DrawableObject {
  x = 120;
  y = 280;
  width = 100;
  height = 150;

  img = null;
  imageCache = {};
  currentImage = 0;

  offset = { top: 0, bottom: 0, left: 0, right: 0 };
  debug = false; // enables debug hitbox visualization

  /* ---------- Sprite Loading ---------- */

  /**
   * Loads a single image and assigns it as current sprite.
   * @param {string} path Image file path.
   */
  loadImage(path) {
    const image = new Image();
    image.src = path;
    this.img = image;
  }

  /**
   * Preloads multiple images into cache.
   * @param {string[]} arr Array of image paths.
   */
  loadImages(arr) {
    const list = Array.isArray(arr) ? arr : [];
    list.forEach(path => {
      const image = new Image();
      image.src = path;
      this.imageCache[path] = image;
    });
  }

  /**
   * Sets the current image from the cache.
   * @param {string} path Key of image in cache.
   */
  useCached(path) {
    if (this.imageCache[path]) {
      this.img = this.imageCache[path];
    }
  }

  /* ---------- Drawing ---------- */

  /**
   * Draws the object sprite on the canvas.
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    if (ctx && this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  /* ---------- Position / Size ---------- */

  /**
   * Sets X/Y position of the object.
   * @param {number} x 
   * @param {number} y 
   */
  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Sets object width and height.
   * @param {number} w 
   * @param {number} h 
   */
  setSize(w, h) {
    this.width = w;
    this.height = h;
  }

  /**
   * Applies hitbox offset values.
   * @param {{top:number,bottom:number,left:number,right:number}} o 
   */
  setOffset(o) {
    this.offset = {
      top: o?.top || 0,
      bottom: o?.bottom || 0,
      left: o?.left || 0,
      right: o?.right || 0
    };
  }

  /* ---------- Hitbox ---------- */

  /**
   * Returns the object's hitbox rectangle.
   * @returns {{x:number,y:number,w:number,h:number}}
   */
  getHitBox() {
    const o = this.offset;
    const w = Math.max(8, this.width - o.left - o.right);
    const h = Math.max(8, this.height - o.top - o.bottom);
    return { x: this.x + o.left, y: this.y + o.top, w, h };
  }

  /**
   * Checks AABB collision with another object.
   * @param {Object} other 
   * @returns {boolean}
   */
  overlaps(other) {
    if (!other) return false;

    const a = this.getHitBox();
    const b = other.getHitBox
      ? other.getHitBox()
      : { x: other.x, y: other.y, w: other.width, h: other.height };

    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  /* ---------- Helpers ---------- */

  centerX() { return this.x + this.width / 2; }
  centerY() { return this.y + this.height / 2; }

  _isDebugRelevant() {
    const name = this.constructor?.name;
    return [
      'Character', 'Chicken', 'SmallChicken', 'EndBoss',
      'Coin', 'Bottle', 'ThrowableObject'
    ].includes(name);
  }

  /* ---------- Debug Drawing ---------- */

  /**
   * Draws debug hitbox + bounding box if enabled.
   * @param {CanvasRenderingContext2D} ctx 
   */
  drawFrame(ctx) {
    if (!ctx || !this._debugEnabled()) return;

    ctx.save();
    this._drawOuterBox(ctx);
    this._drawHitBox(ctx);
    ctx.restore();
  }

  _debugEnabled() {
    const global = typeof window !== 'undefined' && window.DEBUG_HITBOX;
    const world = this.world?.debugHitboxes;
    return this.debug || global || world;
  }

  _drawOuterBox(ctx) {
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(0, 102, 255, .9)';
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  _drawHitBox(ctx) {
    const hb = this.getHitBox();
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255, 0, 0, .95)';
    ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
  }
}
