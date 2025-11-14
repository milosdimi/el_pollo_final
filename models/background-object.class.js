/**
 * Background image object for the side-scrolling level.
 * Fills the full canvas height and is aligned to the bottom.
 * @extends DrawableObject
 */
class BackgroundObject extends DrawableObject {
    width = 720;
    height = 480;

    /**
     * Creates a new background object.
     * @param {string} imagePath Path to the background image.
     * @param {number} [x=0] X-position of the background tile.
     */
    constructor(imagePath, x = 0) {
        super();
        if (imagePath) {
            this.loadImage(imagePath);
        }
        this.x = x;
        this.alignToBottom(480);
    }

    /**
     * Aligns the background object to the bottom of the canvas.
     * @param {number} [canvasHeight=480] Current canvas height.
     */
    alignToBottom(canvasHeight = 480) {
        this.y = canvasHeight - this.height;
    }
}
