/**
 * Status bar displaying the Endboss health (0–100%).
 * Uses 6 image steps: 0, 20, 40, 60, 80, 100 %.
 * @extends DrawableObject
 */
class StatusbarBoss extends DrawableObject {
    /** Sprite images for each percentage step. */
    IMAGES_BOSS = [
        'img/7_statusbars/2_statusbar_endboss/green/green0.png',
        'img/7_statusbars/2_statusbar_endboss/green/green20.png',
        'img/7_statusbars/2_statusbar_endboss/green/green40.png',
        'img/7_statusbars/2_statusbar_endboss/green/green60.png',
        'img/7_statusbars/2_statusbar_endboss/green/green80.png',
        'img/7_statusbars/2_statusbar_endboss/green/green100.png'
    ];

    /** Current percentage value (0–100). */
    percentage = 100;

    constructor() {
        super();
        this._initPosition();
        this._loadSprites();
        this.setPercentage(100);
    }

    /** Places the bar in the top-right corner. */
    _initPosition() {
        this.x = 590;
        this.y = 5;
        this.width = 120;
        this.height = 40;
    }

    /** Loads all sprite images. */
    _loadSprites() {
        this.loadImage(this.IMAGES_BOSS[5]);
        this.loadImages(this.IMAGES_BOSS);
    }

    /**
     * Sets the status bar to a percentage (0–100).
     * @param {number} p New percentage.
     */
    setPercentage(p) {
        this.percentage = Math.max(0, Math.min(100, Math.round(p)));
        const index = this._resolveIndex(this.percentage);
        const img = this.imageCache[this.IMAGES_BOSS[index]];
        if (img) this.img = img;
    }

    /**
     * Adds a positive/negative delta.
     * @param {number} delta Change in percentage.
     */
    add(delta) {
        this.setPercentage(this.percentage + delta);
    }

    /**
     * Sets percentage based on custom max health.
     * @param {number} current Current HP.
     * @param {number} max Max HP.
     */
    setEnergy(current, max = 100) {
        const p = max > 0 ? (current / max) * 100 : 0;
        this.setPercentage(p);
    }

    /**
     * Maps percentage to sprite index.
     * @param {number} p Percentage.
     * @returns {number} Index in IMAGES_BOSS array.
     */
    _resolveIndex(p) {
        if (p > 80) return 5;
        if (p > 60) return 4;
        if (p > 40) return 3;
        if (p > 20) return 2;
        if (p > 0)  return 1;
        return 0;
    }
}
