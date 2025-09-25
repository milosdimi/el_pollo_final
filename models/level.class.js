class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_end_x = 719 * 3; // 4 Bildschirme lang

    constructor(enemies, clouds, coins, bottles, backgroundObjects) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.coins = coins;
        this.bottles = bottles;
        this.backgroundObjects = backgroundObjects;
    }

}
