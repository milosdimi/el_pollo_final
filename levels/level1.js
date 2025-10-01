// --- helpers ----------------------------------------
const BIMG = [
  'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
  'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
];
const B = (x, i) => new Bottle(x, BIMG[i % 2]); // Bottle an x, Bild wechselt

// --- level -----------------------------------------------------------
const level1 = new Level(
  // Enemies
  [
    new Chicken(),
    new SmallChicken(),
    new Chicken(),
    new SmallChicken(),
    new Chicken(),
    new SmallChicken(),
    new Chicken(), 
    new SmallChicken(),
    new Chicken(),
    new SmallChicken(),
    new Chicken(),
    new SmallChicken(), 
    new EndBoss(),
  ],

  // Clouds
  [
    new Cloud(),
    new Cloud(),
    new Cloud(),
    new Cloud(),
  ],

  // Coins
  [
    new Coin(300, 230), new Coin(450, 210), new Coin(500, 240),
    new Coin(700, 230), new Coin(850, 210), new Coin(1000, 250),
    new Coin(1350, 240), new Coin(1500, 260), new Coin(1700, 240),
    new Coin(1900, 260), new Coin(2100, 245),
  ],

  // Bottles
  [
    B(350, 0),
    B(300, 1),
    B(400, 2),
    B(500, 3),
    B(600, 4),
    B(700, 5),
    B(950, 6),
    B(1250, 7),
    B(1550, 8),
    B(1850, 9),
    B(2150, 10),
  ],

  // Background
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
