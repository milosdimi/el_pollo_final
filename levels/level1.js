/**
 * Bottle sprite variants used on the ground.
 * @type {string[]}
 */
const BIMG = [
  'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
  'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
];

/**
 * Creates a bottle at a given X position.
 * Alternates between the two ground bottle sprites.
 * @param {number} x World X position.
 * @param {number} i Index for sprite alternation.
 * @returns {Bottle}
 */
function bottleAt(x, i) {
  return new Bottle(x, BIMG[i % 2]);
}

/** Width of a background screen in pixels. */
const SCREEN_W = 719;

/** Number of repeated background screens. */
const SCREENS = 4;

/**
 * Creates all background layers for a given screen index.
 * @param {number} index Screen index (0-based).
 * @returns {BackgroundObject[]}
 */
function bgLayersAt(index) {
  const x = index * SCREEN_W;
  const v = (index % 2) + 1;

  return [
    new BackgroundObject('img/5_background/layers/air.png', x),
    new BackgroundObject(`img/5_background/layers/3_third_layer/${v}.png`, x),
    new BackgroundObject(`img/5_background/layers/2_second_layer/${v}.png`, x),
    new BackgroundObject(`img/5_background/layers/1_first_layer/${v}.png`, x)
  ];
}

/**
 * Creates all enemies for level 1:
 * a mix of big chickens, small chickens and one EndBoss.
 * @returns {(Chicken|SmallChicken|EndBoss)[]}
 */
function makeEnemies() {
  const arr = [];
  for (let i = 0; i < 12; i++) {
    const enemy = i % 2 ? new Chicken() : new SmallChicken();
    arr.push(enemy);
  }
  arr.push(new EndBoss());
  return arr;
}

/**
 * Creates moving clouds for the sky.
 * @param {number} [n=4] Number of clouds.
 * @returns {Cloud[]}
 */
function makeClouds(n = 4) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(new Cloud());
  }
  return arr;
}

/**
 * Creates all coin pickups for level 1.
 * Positions are tuned for jump paths.
 * @returns {Coin[]}
 */
function makeCoins() {
  return [
    new Coin(300, 230), new Coin(450, 210), new Coin(500, 240),
    new Coin(700, 230), new Coin(850, 210), new Coin(1000, 250),
    new Coin(1350, 240), new Coin(1500, 260), new Coin(1700, 240),
    new Coin(1900, 260)
  ];
}

/**
 * Creates all bottle pickups for level 1.
 * @returns {Bottle[]}
 */
function makeBottles() {
  const arr = [];
  for (let i = 0; i < 10; i++) {
    const x = 300 + i * 150;
    arr.push(bottleAt(x, i));
  }
  return arr;
}

/**
 * Creates all background segments for level 1.
 * @returns {BackgroundObject[]}
 */
function makeBackground() {
  const arr = [];
  for (let i = 0; i < SCREENS; i++) {
    arr.push(...bgLayersAt(i));
  }
  return arr;
}

/**
 * Builds Level 1 configuration:
 * enemies, clouds, coins, bottles and background.
 * @returns {Level}
 */
function buildLevel1() {
  return new Level(
    makeEnemies(),
    makeClouds(),
    makeCoins(),
    makeBottles(),
    makeBackground()
  );
}

/** Pre-built instance of Level 1 used by the game. */
const level1 = buildLevel1();
