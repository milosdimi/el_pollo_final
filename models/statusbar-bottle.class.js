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
    this.x = 20; this.y = 84;
    this.width = 120; this.height = 40;
    this.loadImage(this.IMAGES_BOTTLES_SB[0]);   
    this.loadImages(this.IMAGES_BOTTLES_SB);
    this.setPercentage(0);
  }

  setPercentage(p) {
    this.percentage = Math.max(0, Math.min(100, Math.round(p)));
    const idx = this._resolveIndex();
    const img = this.imageCache[this.IMAGES_BOTTLES_SB[idx]];
    if (img) this.img = img;                    
  }

  add(delta) {
    this.setPercentage(this.percentage + delta);
  }

  _resolveIndex() {
    const p = this.percentage;
    if (p === 100) return 5;
    if (p >= 80) return 4;  
    if (p >= 60) return 3;
    if (p >= 40) return 2;
    if (p >= 20) return 1;
    return 0;
  }
}
