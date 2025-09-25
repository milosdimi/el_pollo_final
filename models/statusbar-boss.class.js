class StatusbarBoss extends DrawableObject {
  IMAGES_BOSS = [
    'img/7_statusbars/2_statusbar_endboss/green/green0.png',
    'img/7_statusbars/2_statusbar_endboss/green/green20.png',
    'img/7_statusbars/2_statusbar_endboss/green/green40.png',
    'img/7_statusbars/2_statusbar_endboss/green/green60.png',
    'img/7_statusbars/2_statusbar_endboss/green/green80.png',
    'img/7_statusbars/2_statusbar_endboss/green/green100.png'
  ];

  percentage = 100;

  constructor() {
    super();
    this.loadImages(this.IMAGES_BOSS);
    this.x = 590;
    this.y = 5;          
    this.width = 120;
    this.height = 40;
    this.setPercentage(100);
  }

  setPercentage(p) {
    this.percentage = Math.max(0, Math.min(100, p));
    const path = this.IMAGES_BOSS[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  resolveImageIndex() {
    if (this.percentage === 100) return 5;
    if (this.percentage > 80) return 4;
    if (this.percentage > 60) return 3;
    if (this.percentage > 40) return 2;
    if (this.percentage > 20) return 1;
    return 0;
  }

}
