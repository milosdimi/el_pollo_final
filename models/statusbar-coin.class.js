/**
 * Status bar showing collected coins (0–100%).
 * Uses 6 steps: 0, 20, 40, 60, 80, 100.
 * @extends DrawableObject
 */
class StatusbarCoins extends DrawableObject {
    /** Coin bar sprite images. */
    IMAGES_COINS = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
    ];

    /** Current fill percentage (0–100). */
    percentage = 0;

    constructor() {
        super();
        this._initPosition();
        this._loadSprites();
        this.setPercentage(0);
    }

    /** Places the bar above the bottle status bar. */
    _initPosition() {
        this.x = 20;
        this.y = 42;
        this.width = 120;
        this.height = 40;
    }

    /** Loads all sprite images for the coin bar. */
    _loadSprites() {
        this.loadImage(this.IMAGES_COINS[0]);
        this.loadImages(this.IMAGES_COINS);
    }

    /**
     * Sets the bar percentage and updates the displayed sprite.
     * @param {number} p New percentage.
     */
    setPercentage(p) {
        this.percentage = Math.max(0, Math.min(100, Math.round(p)));
        const img = this.imageCache[this.IMAGES_COINS[this._resolveIndex()]];
        if (img) this.img = img;
    }

    /**
     * Adds a delta value to the bar (positive or negative).
     * @param {number} delta Change value.
     */
    add(delta) {
        this.setPercentage(this.percentage + delta);
    }

    /**
     * Maps percentage to one of the 6 sprite indices.
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
