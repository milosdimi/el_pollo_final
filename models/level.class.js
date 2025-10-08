class Level {
    // ca. 4 Bildschirme
    level_end_x = 719 * 3;

    constructor(enemies = [], clouds = [], coins = [], bottles = [], backgroundObjects = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.coins = coins;
        this.bottles = bottles;
        this.backgroundObjects = backgroundObjects;
    }
}
