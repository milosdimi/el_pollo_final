class Coin extends MovableObject {
    height = 90;
    width = 90;

    offset = { top: 30, bottom: 60, left: 20, right: 35 };

    IMAGES_COIN = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png'
    ];

    constructor(x, y) {
        super().loadImage(this.IMAGES_COIN[0]);
        this.x = x;
        this.y = y;
        this.loadImages(this.IMAGES_COIN);


        setInterval(() => {
            this.playAnimation(this.IMAGES_COIN);
        }, 1000 / 3);
    }
}
