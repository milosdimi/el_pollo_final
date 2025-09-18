let canvas;
let ctx;
let character = new MovableObject();


function initGame() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');


    console.log('My Character is', character);

}