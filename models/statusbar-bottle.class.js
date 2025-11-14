/**
 * Status bar displaying collected bottles (0–100%).
 * Uses 6 image steps: 0, 20, 40, 60, 80, 100.
 * @extends DrawableObject
 */
class StatusbarBottles extends DrawableObject {
  /** Bottle bar sprite images. */
  IMAGES_BOTTLES_SB = [
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
  ];

  /** Current percentage value (0–100). */
  percentage = 0;

  constructor() {
    super();
    this._initPosition();
    this._loadSprites();
    this.setPercentage(0);
  }

  /** Places the bar on the left side under the coin bar. */
  _initPosition() {
    this.x = 20;
    this.y = 84;
    this.width = 120;
    this.height = 40;
  }

  /** Loads the bottle bar images. */
  _loadSprites() {
    this.loadImage(this.IMAGES_BOTTLES_SB[0]);
    this.loadImages(this.IMAGES_BOTTLES_SB);
  }

  /**
   * Sets the bottle percentage (0–100).
   * @param {number} p New percentage.
   */
  setPercentage(p) {
    this.percentage = Math.max(0, Math.min(100, Math.round(p)));
    const i = this._resolveIndex();
    const img = this.imageCache[this.IMAGES_BOTTLES_SB[i]];
    if (img) this.img = img;
  }

  /**
   * Increases or decreases the bottle bar.
   * @param {number} delta Percentage change.
   */
  add(delta) {
    this.setPercentage(this.percentage + delta);
  }

  /**
   * Returns the index matching the current percentage.
   * @returns {number} Image index.
   */
  _resolveIndex() {
    const p = this.percentage;
    if (p > 80) return 5;
    if (p > 60) return 4;
    if (p > 40) return 3;
    if (p > 20) return 2;
    if (p > 0) return 1;
    return 0;
  }
}
