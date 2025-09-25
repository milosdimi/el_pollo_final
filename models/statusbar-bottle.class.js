class StatusbarBottles extends DrawableObject {
  IMAGES_BOTTLES_SB = [
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
  ];
  percentage = 0;

  constructor() {
    super();
    this.loadImages(this.IMAGES_BOTTLES_SB);
    this.x = 20;     
    this.y = 84;     
    this.width = 120;
    this.height = 40;
    this.setPercentage(0);
  }

  setPercentage(p) {
    this.percentage = Math.max(0, Math.min(100, p));
    const path = this.IMAGES_BOTTLES_SB[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }
  add(delta) { this.setPercentage(this.percentage + delta); }

  resolveImageIndex() {
    if (this.percentage === 100) return 5;
    if (this.percentage > 80) return 4;
    if (this.percentage > 60) return 3;
    if (this.percentage > 40) return 2;
    if (this.percentage > 20) return 1;
    return 0;
  }
}
