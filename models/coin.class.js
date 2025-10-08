class Coin extends MovableObject {
  width = 90;
  height = 90;
  offset = { top: 28, bottom: 28, left: 28, right: 28 };

  IMAGES_COIN = [
    'img/8_coin/coin_1.png',
    'img/8_coin/coin_2.png'
  ];

  constructor(x, y) {
    super();
    this._loadSprites();
    this.x = x + (Math.random() * 10 - 5);
    this.y = y + (Math.random() * 24 - 12);
    this._startAnim();
  }

  _loadSprites() {
    this.loadImage(this.IMAGES_COIN[0]);
    this.loadImages(this.IMAGES_COIN);
  }

  _startAnim() {
    this._animLoop = setInterval(() => {
      if (!this.world?.isPaused) this.playAnimation(this.IMAGES_COIN);
    }, 1000 / 3);
  }

  destroy() {
    if (this._animLoop) clearInterval(this._animLoop);
  }
}
