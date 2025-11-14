/**
 * Health status bar (0–100%).
 * Shows the player's remaining HP in 6 steps.
 * @extends DrawableObject
 */
class StatusbarHealth extends DrawableObject {
    /** Health bar sprite images. */
    IMAGES_HEALTH = [
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
    ];

    /** Current health percentage (0–100). */
    percentage = 100;

    constructor() {
        super();
        this._initPosition();
        this._loadSprites();
        this.setPercentage(100);
    }

    /** Position of the bar (top-left area). */
    _initPosition() {
        this.x = 20;
        this.y = 0;
        this.width = 120;
        this.height = 40;
    }

    /** Loads all health bar images. */
    _loadSprites() {
        this.loadImage(this.IMAGES_HEALTH[5]);   // Start image = 100%
        this.loadImages(this.IMAGES_HEALTH);
    }

    /**
     * Sets the bar percentage and updates the displayed sprite.
     * @param {number} p New percentage value.
     */
    setPercentage(p) {
        this.percentage = Math.max(0, Math.min(100, Math.round(p)));
        const idx = this._resolveIndex();
        const img = this.imageCache[this.IMAGES_HEALTH[idx]];
        if (img) this.img = img;
    }

    /**
     * Adds a percentage delta (damage or heal).
     * @param {number} delta Change in percentage.
     */
    add(delta) {
        this.setPercentage(this.percentage + delta);
    }

    /**
     * Maps the percentage to a sprite index.
     * @returns {number} Image index.
     */
    _resolveIndex() {
        const p = this.percentage;
        if (p > 80) return 5;
        if (p > 60) return 4;
        if (p > 40) return 3;
        if (p > 20) return 2;
        if (p > 0)  return 1;
        return 0;
    }
}
