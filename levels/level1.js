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
    new Coin(150, 230),  new Coin(300, 210),  new Coin(450, 240),
    new Coin(700, 230),  new Coin(850, 210),  new Coin(1000, 250),
    new Coin(1350, 240), new Coin(1500, 260), new Coin(1700, 240),
    new Coin(1900, 260), new Coin(2100, 245),
  ],

  // Bottles
  [
    B(500,0),  B(700,1),  B(900,2),
    B(1100,3), B(1300,4), B(1550,5),
    B(1800,6), B(2050,7), B(2250,8),
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
