/**
 * Collectible coin item. 
 * Slight random spawn offset and looping animation.
 * @extends MovableObject
 */
class Coin extends MovableObject {
  width = 90;
  height = 90;
  offset = { top: 28, bottom: 28, left: 28, right: 28 };

  IMAGES_COIN = [
    'img/8_coin/coin_1.png',
    'img/8_coin/coin_2.png'
  ];

  /**
   * Creates a spinning coin collectible.
   * @param {number} x Base X position.
   * @param {number} y Base Y position.
   */
  constructor(x, y) {
    super();
    this._loadSprites();
    this._setSpawnPosition(x, y);
    this._startAnimLoop();
  }

  /* ---------- Setup ---------- */

  /**
   * Preloads all coin sprite frames.
   */
  _loadSprites() {
    this.loadImage(this.IMAGES_COIN[0]);
    this.loadImages(this.IMAGES_COIN);
  }

  /**
   * Places coin with small random offset (more organic look).
   */
  _setSpawnPosition(x, y) {
    this.x = x + (Math.random() * 10 - 5);
    this.y = y + (Math.random() * 24 - 12);
  }

  /* ---------- Animation ---------- */

  /**
   * Starts the looping spin animation.
   */
  _startAnimLoop() {
    this._animLoop = setInterval(() => {
      if (!this.world?.isPaused) {
        this.playAnimation(this.IMAGES_COIN);
      }
    }, 1000 / 3);
  }

  /* ---------- Cleanup ---------- */

  /**
   * Stops the animation loop.
   */
  destroy() {
    if (this._animLoop) clearInterval(this._animLoop);
  }
}
