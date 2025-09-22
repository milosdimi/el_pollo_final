let canvas;
let world;
let keyboard = new Keyboard();


function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas);
  


    console.log('My Character is', world.character);

}

window.addEventListener("keypress", (e) => {
    console.log(e);
});