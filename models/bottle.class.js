class Bottle extends DrawableObject {
    height = 100;
    width = 80;

    offset = { top: 10, bottom: 18, left: 10, right: 10 };

    constructor(x, image) {
        super();
        this.loadImage(image);
        this.x = x + 200 + Math.random() * 1000;
        this.y = 330;
    }


}