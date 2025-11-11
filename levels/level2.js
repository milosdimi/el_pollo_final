const L2_SCREEN_W = 719;
const L2_SCREENS  = 5;

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

function l2_makeBackground() {
  const arr = [];
  for (let i = 0; i < L2_SCREENS; i++) arr.push(...l2_bgLayersAt(i));
  return arr;
}

function l2_makeClouds(n = 6) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(new Cloud());
  return arr;
}

function l2_coinLine(x0, y, n, dx) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(new Coin(x0 + i * dx, y));
  return out;
}

function l2_coinArc(cx, cy, r, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (-Math.PI / 2) + (i / (n - 1)) * Math.PI;
    out.push(new Coin(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
  }
  return out;
}

function l2_makeCoins() {
  return [
    ...l2_coinLine(300, 230, 5, 90),
    ...l2_coinArc(1500, 240, 130, 7),
    ...l2_coinLine(2100, 230, 6, 80),
    ...l2_coinArc(3000, 240, 130, 7)
  ];
}

function l2_bottle(x, i) {
  const imgs = [
    'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
  ];
  return new Bottle(x, imgs[i % 2]);
}

function l2_makeBottles() {
  const arr = [];
  for (let i = 0; i < 10; i++) arr.push(l2_bottle(350 + i * 140, i));      
  for (let i = 0; i < 6; i++)  arr.push(l2_bottle(2400 + i * 160, i + 10)); 
  return arr;
}

function l2_makeEnemies() {
  const e = [];
  const spots = [
    600, 750, 900, 1100,
    1450, 1600, 1780,
    2050, 2200, 2380, 2520,
    2850, 2980, 3120
  ];
  for (let i = 0; i < spots.length; i++) {
    e.push(i % 3 === 0 ? new SmallChicken(spots[i]) : new Chicken(spots[i]));
  }
  const boss = new EndBoss();
  boss.x = L2_SCREEN_W * L2_SCREENS - 240;
  e.push(boss);
  return e;
}

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
