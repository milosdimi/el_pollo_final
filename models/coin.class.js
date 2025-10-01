class Coin extends MovableObject {
    height = 90;
    width = 90;

    offset = { top: 28, bottom: 28, left: 28, right: 28 };

    IMAGES_COIN = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png'
    ];

    constructor(x, y) {
        super().loadImage(this.IMAGES_COIN[0]);
        this.x = x;
        this.y = y;
        this.loadImages(this.IMAGES_COIN);
        
        this.x += (Math.random() * 10) - 1;
        this.y += (Math.random() * 24) - 100;

        setInterval(() => this.playAnimation(this.IMAGES_COIN), 1000 / 3);
    }
}
