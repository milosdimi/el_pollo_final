class Bottle extends DrawableObject {
    height = 100;
    width = 80;

    offset = { top: 20, bottom: 20, left: 35, right: 50 };

    constructor(x, image) {
        super();
        this.loadImage(image);
        this.x = x + 200 + Math.random() * 1000;
        this.y = 330;
    }

    
}