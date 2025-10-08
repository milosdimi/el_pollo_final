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
    this.x = 590; this.y = 5;
    this.width = 120; this.height = 40;
    this.loadImage(this.IMAGES_BOSS[5]);   // Startbild (100%)
    this.loadImages(this.IMAGES_BOSS);
    this.setPercentage(100);
  }

  setPercentage(p) {
    this.percentage = Math.max(0, Math.min(100, Math.round(p)));
    const idx = this._resolveIndex(this.percentage);
    const img = this.imageCache[this.IMAGES_BOSS[idx]];
    if (img) this.img = img;               // Guard, falls noch nicht im Cache
  }

  add(delta) {
    this.setPercentage(this.percentage + delta);
  }

  // optional: bequem Boss-Energie setzen
  setEnergy(current, max = 100) {
    const p = max > 0 ? (current / max) * 100 : 0;
    this.setPercentage(p);
  }

  _resolveIndex(p) {
    if (p === 100) return 5;
    if (p >= 80) return 4;
    if (p >= 60) return 3;
    if (p >= 40) return 2;
    if (p >= 20) return 1;
    return 0;
  }
}
