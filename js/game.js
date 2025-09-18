let canvas;
let ctx;

let world = new World();


function initGame() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');


    console.log('My Character is', world.character);

}