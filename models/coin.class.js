class Coin extends MovableObject {
    height = 90;
    width = 90;

    offset = { top: 28, bottom: 28, left: 28, right: 28 };

    IMAGES_COIN = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png'
    ];

    constructor(x, y) {
        super();
        this.loadImage(this.IMAGES_COIN[0]);
        this.loadImages(this.IMAGES_COIN);
        this.x = x + (Math.random() * 10) - 5;
        this.y = y + (Math.random() * 24) - 12;

        this._anim = setInterval(() => {
            this.playAnimation(this.IMAGES_COIN);
        }, 1000 / 3);
    }
}