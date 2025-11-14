/**
 * Width of a level-2 background screen in pixels.
 * @type {number}
 */
const L2_SCREEN_W = 719;

/**
 * Number of repeated background screens in level 2.
 * @type {number}
 */
const L2_SCREENS = 5;

/**
 * Creates all background layers for a given level-2 screen index.
 * @param {number} i Screen index (0-based).
 * @returns {BackgroundObject[]} Background layers for this segment.
 */
function l2_bgLayersAt(i) {
  const x = i * L2_SCREEN_W;
  const v = (i % 2) + 1;

  return [
    new BackgroundObject('img/5_background/layers/air.png', x),
    new BackgroundObject(`img/5_background/layers/3_third_layer/${v}.png`, x),
    new BackgroundObject(`img/5_background/layers/2_second_layer/${v}.png`, x),
    new BackgroundObject(`img/5_background/layers/1_first_layer/${v}.png`, x)
  ];
}

/**
 * Builds the full parallax background for level 2.
 * @returns {BackgroundObject[]} All background segments.
 */
function l2_makeBackground() {
  const arr = [];
  for (let i = 0; i < L2_SCREENS; i++) {
    arr.push(...l2_bgLayersAt(i));
  }
  return arr;
}

/**
 * Creates moving clouds for level 2.
 * @param {number} [n=6] Number of clouds to spawn.
 * @returns {Cloud[]} Cloud instances.
 */
function l2_makeClouds(n = 6) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(new Cloud());
  }
  return arr;
}

/**
 * Creates a straight line of coins.
 * @param {number} x0 Start X position.
 * @param {number} y Y position for all coins.
 * @param {number} n Number of coins.
 * @param {number} dx X distance between coins.
 * @returns {Coin[]} Coin line.
 */
function l2_coinLine(x0, y, n, dx) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(new Coin(x0 + i * dx, y));
  }
  return out;
}

/**
 * Creates an arc of coins (half circle).
 * @param {number} cx Center X.
 * @param {number} cy Center Y.
 * @param {number} r Radius of the arc.
 * @param {number} n Number of coins.
 * @returns {Coin[]} Coin arc.
 */
function l2_coinArc(cx, cy, r, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (-Math.PI / 2) + (i / (n - 1)) * Math.PI;
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;
    out.push(new Coin(x, y));
  }
  return out;
}

/**
 * Creates all coin pickups for level 2.
 * Combines lines and arcs for variety.
 * @returns {Coin[]} Coins for this level.
 */
function l2_makeCoins() {
  return [
    ...l2_coinLine(300, 230, 5, 90),
    ...l2_coinArc(1500, 240, 130, 7),
    ...l2_coinLine(2100, 230, 6, 80),
    ...l2_coinArc(3000, 240, 130, 7)
  ];
}

/**
 * Creates a bottle pickup at a given X position.
 * Alternates between the two ground bottle sprites.
 * @param {number} x World X position.
 * @param {number} i Index for sprite alternation.
 * @returns {Bottle}
 */
function l2_bottle(x, i) {
  const imgs = [
    'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
  ];
  return new Bottle(x, imgs[i % 2]);
}

/**
 * Creates all bottle pickups for level 2.
 * @returns {Bottle[]} Bottle pickups.
 */
function l2_makeBottles() {
  const arr = [];

  // Early game bottles
  for (let i = 0; i < 10; i++) {
    const x = 350 + i * 140;
    arr.push(l2_bottle(x, i));
  }

  // Late game bottles near the boss area
  for (let i = 0; i < 6; i++) {
    const x = 2400 + i * 160;
    arr.push(l2_bottle(x, i + 10));
  }

  return arr;
}

/**
 * Creates all enemies for level 2, including the EndBoss.
 * Uses predefined spawn positions for chickens.
 * @returns {(Chicken|SmallChicken|EndBoss)[]} Enemies list.
 */
function l2_makeEnemies() {
  const e = [];
  const spots = [
    600, 750, 900, 1100,
    1450, 1600, 1780,
    2050, 2200, 2380, 2520,
    2850, 2980, 3120
  ];

  for (let i = 0; i < spots.length; i++) {
    const x = spots[i];
    const enemy = (i % 3 === 0)
      ? new SmallChicken(x)
      : new Chicken(x);
    e.push(enemy);
  }

  const boss = new EndBoss();
  boss.x = L2_SCREEN_W * L2_SCREENS - 240;
  e.push(boss);

  return e;
}

/**
 * Builds Level 2 configuration:
 * enemies, clouds, coins, bottles and background.
 * @returns {Level}
 */
function buildLevel2() {
  const lvl = new Level(
    l2_makeEnemies(),
    l2_makeClouds(),
    l2_makeCoins(),
    l2_makeBottles(),
    l2_makeBackground()
  );

  lvl.level_end_x = L2_SCREEN_W * L2_SCREENS - 1;
  return lvl;
}
