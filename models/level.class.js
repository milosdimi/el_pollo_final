/**
 * Represents a full game level containing all objects:
 * enemies, clouds, coins, bottles and background layers.
 */
class Level {
    /**
     * Horizontal end limit of the level (approx. 4 screens).
     * @type {number}
     */
    level_end_x = 719 * 3;

    /**
     * Creates a level instance.
     * @param {MovableObject[]} enemies
     * @param {MovableObject[]} clouds
     * @param {MovableObject[]} coins
     * @param {MovableObject[]} bottles
     * @param {DrawableObject[]} backgroundObjects
     */
    constructor(
        enemies = [],
        clouds = [],
        coins = [],
        bottles = [],
        backgroundObjects = []
    ) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.coins = coins;
        this.bottles = bottles;
        this.backgroundObjects = backgroundObjects;
    }
}
