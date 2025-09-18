let canvas;
let world;


function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas);
  


    console.log('My Character is', world.character);

}