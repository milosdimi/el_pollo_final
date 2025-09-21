class MovableObject {
    x = 120;
    y = 280;
    img;
    height = 150;
    width = 100;
    speed = 0.15;
    imageCache = {};

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }


    /**
     * 
     * @param {Array} arr  - ['path1', 'path2', ...]
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = path;
        });
    }


    moveRight() {
        console.log('move right');
    }

    moveLeft() {

    }


}
