/**
 * Collectible bottle item used for throwable attacks.
 * Spawns at a fixed ground height with slight random variation.
 * @extends DrawableObject
 */
class Bottle extends DrawableObject {
  width = 80;
  height = 100;
  offset = { top: 10, bottom: 18, left: 10, right: 10 };

  /**
   * Creates a bottle that the player can collect.
   * @param {number} x X-position where the bottle appears.
   * @param {string} imagePath Path to the bottle image.
   */
  constructor(x, imagePath) {
    super();
    this._loadBottleImage(imagePath);
    this._setSpawnPosition(x);
  }

  /**
   * Loads the bottle image if a path is provided.
   * @param {string} imagePath Image file path.
   */
  _loadBottleImage(imagePath) {
    if (imagePath) {
      this.loadImage(imagePath);
    }
  }

  /**
   * Places the bottle at ground height with slight Y variation.
   * @param {number} x X-position.
   */
  _setSpawnPosition(x) {
    this.x = x;
    this.y = 330 + (Math.random() * 12 - 6); // random wobble
  }
}
