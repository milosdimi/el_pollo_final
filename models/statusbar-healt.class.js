class StatusbarHealth extends DrawableObject {
  IMAGES_HEALTH = [
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
  ];
  percentage = 100;

  constructor() {
    super();
    this.x = 20; this.y = 0;
    this.width = 120; this.height = 40;
    this.loadImage(this.IMAGES_HEALTH[5]);
    this.loadImages(this.IMAGES_HEALTH);
    this.setPercentage(100);
  }

  setPercentage(p) {
    this.percentage = Math.max(0, Math.min(100, Math.round(p)));
    const idx = this._resolveIndex(this.percentage);
    const path = this.IMAGES_HEALTH[idx];
    const img = this.imageCache[path];
    if (img) this.img = img;
  }

  add(delta) {
    this.setPercentage(this.percentage + delta);
  }

  _resolveIndex(p) {
    if (p > 80) return 5;
    if (p > 60) return 4;
    if (p > 40) return 3;
    if (p > 20) return 2;
    if (p > 0) return 1;
    return 0;
  }
}
