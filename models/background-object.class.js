class BackgroundObject extends DrawableObject {
    width = 720;
    height = 480;

    constructor(imagePath, x) {
        super();
        if (imagePath) this.loadImage(imagePath);
        this.x = x || 0;
        this.alignToBottom(480);
    }

    alignToBottom(canvasHeight = 480) {
        this.y = canvasHeight - this.height;
    }
}
