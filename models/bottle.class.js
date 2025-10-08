class Bottle extends DrawableObject {
  width = 80;
  height = 100;
  offset = { top: 10, bottom: 18, left: 10, right: 10 };

  constructor(x, imagePath) {
    super();
    if (imagePath) this.loadImage(imagePath);     
    this.x = x;
    this.y = 330 + (Math.random() * 12 - 6);      
  }
}
