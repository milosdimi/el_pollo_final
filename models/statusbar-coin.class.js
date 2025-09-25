class StatusbarCoins extends DrawableObject {
    IMAGES_COINS = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
    ];
    percentage = 0;

    constructor() {
        super();
        this.loadImages(this.IMAGES_COINS);
        this.x = 20;
        this.y = 42;
        this.width = 120;
        this.height = 40;
        this.setPercentage(0);
    }

    setPercentage(percentage) {
        // clamp 0..100
        this.percentage = Math.max(0, Math.min(100, percentage));
        const path = this.IMAGES_COINS[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    add(delta) { this.setPercentage(this.percentage + delta); } // was ist das?

    resolveImageIndex() {
        if (this.percentage === 100) return 5;
        else if (this.percentage > 80) return 4;
        else if (this.percentage > 60) return 3;
        else if (this.percentage > 40) return 2;
        else if (this.percentage > 20) return 1;
        else return 0;
    }

}