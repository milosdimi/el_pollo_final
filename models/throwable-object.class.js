class ThrowableObject extends MovableObject {
    bottleSound = new Audio('audio/bottleCollectedEffect.mp3');

    constructor(x, y) {
        super().loadImage('img/6_salsa_bottle/salsa_bottle.png');
        this.x = x;
        this.y = y;
        this.height = 60;
        this.width = 50;
        
        this.trow(100, 150);
        this.bottleSound.play();
    }

    trow() {
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.x += 10;
        }, 25);
    }
    

}