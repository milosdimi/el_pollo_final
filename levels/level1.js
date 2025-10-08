const BIMG = [
  'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
  'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
];

function bottleAt(x, i) {
  return new Bottle(x, BIMG[i % 2]);
}

const SCREEN_W = 719;
const SCREENS = 4;

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

function makeEnemies() {
  const arr = [];
  for (let i = 0; i < 12; i++) arr.push(i % 2 ? new Chicken() : new SmallChicken());
  arr.push(new EndBoss());
  return arr;
}

function makeClouds(n = 4) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(new Cloud());
  return arr;
}

function makeCoins() {
  return [
    new Coin(300, 230), new Coin(450, 210), new Coin(500, 240),
    new Coin(700, 230), new Coin(850, 210), new Coin(1000, 250),
    new Coin(1350, 240), new Coin(1500, 260), new Coin(1700, 240),
    new Coin(1900, 260), new Coin(2100, 245)
  ];
}

function makeBottles() {
  const arr = [];
  for (let i = 0; i < 11; i++) arr.push(bottleAt(300 + i * 150, i));
  return arr;
}

function makeBackground() {
  const arr = [];
  for (let i = 0; i < SCREENS; i++) arr.push(...bgLayersAt(i));
  return arr;
}

const level1 = new Level(
  makeEnemies(),
  makeClouds(),
  makeCoins(),
  makeBottles(),
  makeBackground()
);
