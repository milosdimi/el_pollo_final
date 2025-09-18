class MovableObject {
    x = 120;
    y = 400;
    img;
    speed = 0.15;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }



    moveRight() {
        console.log('move right');
    }

    moveLeft() {

    }
    

}
