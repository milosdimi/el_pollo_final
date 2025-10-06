// --- Helpers ----------------------------------------
const BIMG = [
  'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
  'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
];
const B = (x, i) => new Bottle(x, BIMG[i % 2]);

// Background-Layer-Helper (vermeidet Duplikate)
const createBgLayers = (startX) => [
  new BackgroundObject('img/5_background/layers/air.png', startX),
  new BackgroundObject(`img/5_background/layers/3_third_layer/${(startX / 719) % 2 + 1}.png`, startX),
  new BackgroundObject(`img/5_background/layers/2_second_layer/${(startX / 719) % 2 + 1}.png`, startX),
  new BackgroundObject(`img/5_background/layers/1_first_layer/${(startX / 719) % 2 + 1}.png`, startX)
];

// --- Level -----------------------------------------------------------
const level1 = new Level(
  // Enemies (alternierend Chicken/SmallChicken, EndBoss am Ende)
  [...Array(12).keys()].flatMap((i, idx) =>
    idx < 12 ? [new (i % 2 ? Chicken : SmallChicken)()] : []
  ).concat(new EndBoss()),

  // Clouds
  [...Array(4)].map(() => new Cloud()),

  // Coins
  [
    new Coin(300, 230), new Coin(450, 210), new Coin(500, 240),
    new Coin(700, 230), new Coin(850, 210), new Coin(1000, 250),
    new Coin(1350, 240), new Coin(1500, 260), new Coin(1700, 240),
    new Coin(1900, 260), new Coin(2100, 245),
  ],

  // Bottles
  [...Array(11)].map((_, i) => B(300 + i * 150, i)),

  // Background (Layers für 4 Screens)
  [...Array(4)].flatMap((_, i) => createBgLayers(i * 719))
);