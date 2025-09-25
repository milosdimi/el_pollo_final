class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBarHealth = new StatusbarHealth();
    statusBarBoss = new StatusbarBoss();
    statusBarCoins = new StatusbarCoins();
    statusBarBottles = new StatusbarBottles();
    throwableObjects = [];
    bottlesCount = 0;


    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.run();
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
            this.checkCoinPickup();
            this.checkBottlePickup();
        }, 200);
    } 

    checkThrowObjects() {
        if (this.keyboard.D && this.bottlesCount > 0) {
            const bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
            this.throwableObjects.push(bottle);
            this.bottlesCount--;
            this.statusBarBottles.add(-20);
        }
    }


    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy)) {
                this.character.hit();
                this.statusBarHealth.setPercentage(this.character.energy);
            }
        });
    }

    checkCoinPickup() {
        if (!this.level?.coins || !this.character) return;

        this.level.coins = this.level.coins.filter(coin => {
            if (this.character.isColliding(coin)) {
                this.coinsCount = (this.coinsCount || 0) + 1;
                this.statusBarCoins.add(20); 
                return false;
            }
            return true;
        });
    }


    checkBottlePickup() {
        if (!this.level?.bottles || !this.character) return;

        this.level.bottles = this.level.bottles.filter(b => {
            if (this.character.isColliding(b)) {
                this.bottlesCount++;
                this.statusBarBottles.add(20);
                return false;
            }
            return true;
        });
    }


    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas

        this.ctx.translate(this.camera_x, 0); // camera movement
        this.addObjectsToMap(this.level.backgroundObjects);

        this.ctx.translate(-this.camera_x, 0); // reverse camera movement
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarBottles);
        this.addToMap(this.statusBarBoss);
        this.ctx.translate(this.camera_x, 0); // reverse camera movement


        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.throwableObjects);
        if (this.level.bottles) {
            this.addObjectsToMap(this.level.bottles);
        }
        if (this.level.coins) {
            this.addObjectsToMap(this.level.coins);
        }
        this.ctx.translate(-this.camera_x, 0); // reverse camera movement

        requestAnimationFrame(() => this.draw());
    }

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo) {
        this.ctx.restore();
        mo.x = mo.x * -1;
    }

    setWorld() {
        this.character.world = this;
    }
}
