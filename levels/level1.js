const level1 = new Level(
    [
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new EndBoss(),
    ],
    [
        new Cloud(),
    ],
    [
        new Coin(150, 230),
        new Coin(150 * 2, 210),
        new Coin(150 * 3, 250),
        new Coin(150 * 4, 240),
        new Coin(150 * 5, 260),
        new Coin(150 * 6, 250),
        new Coin(150 * 7, 210),
        new Coin(150 * 8, 250),
        new Coin(150 * 9, 240),
        new Coin(150 * 10, 260),
        new Coin(150 * 11, 250),
    ],
    [
    new BackgroundObject('img/5_background/layers/air.png', -719),
    new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -719),
    new BackgroundObject('img/5_background/layers/2_second_layer/2.png', -719),
    new BackgroundObject('img/5_background/layers/1_first_layer/1.png', -719),

    new BackgroundObject('img/5_background/layers/air.png', 0),
    new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
    new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
    new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 0),
    new BackgroundObject('img/5_background/layers/air.png', 719),
    new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 719),
    new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 719),
    new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 719),

    new BackgroundObject('img/5_background/layers/air.png', 719 * 2),
    new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 719 * 2),
    new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 719 * 2),
    new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 719 * 2),
    new BackgroundObject('img/5_background/layers/air.png', 719 * 3),
    new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 719 * 3),
    new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 719 * 3),
    new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 719 * 3),
    ]
);
