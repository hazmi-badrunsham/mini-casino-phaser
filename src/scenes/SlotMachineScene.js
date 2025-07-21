// SlotMachineScene.js - Simplified Version

export class SlotMachineScene extends Phaser.Scene {
    constructor() {
        super('SlotMachineScene');
        this.symbols = ['🍒', '🍋', '💰', '💎'];
        this.payouts = { '🍒': 5, '🍋': 10, '💰': 50, '💎': 1000 };
        this.weights = [10, 8, 5, 2]; // Probability weights for each symbol
        this.isSpinning = false;
        this.reels = [];
        this.results = ['?', '?', '?'];
    }

    preload() {
        this.load.font('myFont', './assets/font/fonnts.com-Greycliff_CF_Regular.otf');
        this.load.image('background', './assets/slotmachine/bg.jpg');
        this.load.audio('bgMusic', 'assets/slotmachine/Music_fx_lofi_casino.wav');
        this.load.audio('spinsfx', 'assets/slotmachine/Music_fx_slot_machine_spinning.wav');
        this.load.audio('winsfx', 'assets/slotmachine/winsfx.mp3');

    }

    create() {
        const { width, height } = this.sys.game.config;
        
        // Background
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(width, height);
        
        // Audio
        this.bgMusic = this.sound.add('bgMusic', { loop: true });
        this.bgMusic.play();
        this.spinSfx = this.sound.add('spinsfx');
        this.winsfx = this.sound.add('winsfx');

        
        // UI Elements
        this.createUI(width, height);
        this.createReels(width, height);
        this.createPayoutTable(width);
        
        // Listen for coin updates
        window.addEventListener('coinsUpdated', (e) => 
            this.coinText.setText(`💰 Coins: ${e.detail.coins}`)
        );
    }

    createUI(width, height) {
        const style = { fontSize: '32px', fontFamily: 'myFont', fill: '#FFFFFF' };
        
        // Title
        this.add.text(width / 2, 80, '🎰 Slot Machine', {
            ...style, fontSize: '48px', fill: '#5f5728ff'
        }).setOrigin(0.5);
        
        // Coins display
        this.coinText = this.add.text(width / 2, 150, `💰 Coins: ${window.getCoins()}`, {
            ...style, fill: '#073507ff'
        }).setOrigin(0.5);
        
        // Spin button
        this.spinButton = this.add.text(width / 2, height - 100, 'SPIN (Cost: 10)', {
            ...style, fontSize: '36px', backgroundColor: '#E74C3C', padding: { x: 30, y: 15 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.spin())
        .on('pointerover', () => this.spinButton.setStyle({ backgroundColor: '#C0392B' }))
        .on('pointerout', () => this.spinButton.setStyle({ backgroundColor: '#E74C3C' }));
        
        // Message box
        this.messageBox = this.add.text(width / 2, height - 200, '', {
            fontSize: '24px', fill: '#FFFFFF', backgroundColor: '#333333',
            padding: { x: 20, y: 10 }, fontFamily: 'myFont'
        }).setOrigin(0.5).setVisible(false);
    }

    createReels(width, height) {
        const spacing = 162;
        const startX = width / 2 - spacing;
        
        for (let i = 0; i < 3; i++) {
            const reel = this.add.text(startX + (i * spacing), height / 2, '?', {
                fontSize: '50px', fontFamily: 'myFont', fill: '#FFFFFF',
                backgroundColor: '#45494c', padding: { x: 20, y: 10 }
            }).setOrigin(0.5);
            this.reels.push(reel);
        }
    }

    createPayoutTable(width) {
        const x = width / 3;
        const y = 215;
        
        // Background
        this.add.graphics().fillStyle(0x000000, 0.7).fillRoundedRect(x, y, 250, 235, 10);
        this.add.graphics().fillStyle(0x000000, 1).fillRoundedRect(x, y, 250, 45, 10);

        // Title
        this.add.text(x + 125, y + 7, 'Payouts', {
            fontSize: '24px', fontFamily: 'myFont', fill: '#FFFFFF'
        }).setOrigin(0.5, 0);
        
        // Headers
        this.add.text(x + 70, y + 55, 'Symbol', { fontSize: '20px', fontFamily: 'myFont', fill: '#FFFFFF' }).setOrigin(0.5, 0);
        this.add.text(x + 180, y + 55, 'Multiplier', { fontSize: '20px', fontFamily: 'myFont', fill: '#FFFFFF' }).setOrigin(0.5, 0);
        
        // Payout rows
        this.symbols.forEach((symbol, i) => {
            const rowY = y + 85 + (i * 35);
            this.add.text(x + 75, rowY, symbol, { fontSize: '20px', fontFamily: 'myFont', fill: '#a6ffceff' }).setOrigin(0.5, 0);
            this.add.text(x + 175, rowY, `x${this.payouts[symbol]}`, { fontSize: '20px', fontFamily: 'myFont', fill: '#a6ffceff' }).setOrigin(0.5, 0);
        });
    }

    spin() {
        if (this.isSpinning || !window.deductCoins(10)) {
            this.showMessage(this.isSpinning ? "Already spinning!" : "Need 10 coins!");
            return;
        }
        
        this.isSpinning = true;
        this.spinSfx.play();
        this.time.delayedCall(2500, () => {
        this.spinSfx.stop(); // Force stop after 3s
        });
        this.showMessage("Spinning...");
        this.spinButton.disableInteractive().setStyle({ backgroundColor: '#7F8C8D' });
        
        // Animate each reel with staggered stops
        this.reels.forEach((reel, i) => {
            this.tweens.add({
                targets: { progress: 0 },
                progress: 1,
                duration: 2000 + (i * 300),
                ease: 'Cubic.easeOut',
                onUpdate: () => reel.setText(Phaser.Utils.Array.GetRandom(this.symbols)),
                onComplete: () => {
                    this.results[i] = this.getWeightedSymbol();
                    reel.setText(this.results[i]);
                    if (i === 2) this.checkWin(); // Last reel
                }
            });
        });
    }

    getWeightedSymbol() {
        const totalWeight = this.weights.reduce((sum, w) => sum + w, 0);
        let random = Phaser.Math.Between(1, totalWeight);
        
        for (let i = 0; i < this.symbols.length; i++) {
            random -= this.weights[i];
            if (random <= 0) return this.symbols[i];
        }
        return this.symbols[0];
    }

    checkWin() {
        this.isSpinning = false;
        this.spinButton.setInteractive({ useHandCursor: true }).setStyle({ backgroundColor: '#E74C3C' });
        
        const [a, b, c] = this.results;
        if (a === b && b === c) {
            const winAmount = this.payouts[a] * 10;
            this.winsfx.play();
            this.time.delayedCall(2500, () => {
            this.winsfx.stop(); // Force stop after 3s
            });
            window.addCoins(winAmount);
            this.showMessage(`BIG WIN! You won ${winAmount} coins!`, true);
        } else {
            this.showMessage("No win. Try again!");
        }
    }

    showMessage(text, isWin = false) {
        const style = isWin 
            ? { backgroundColor: '#27AE60', fontSize: '32px', padding: { x: 30, y: 15 } }
            : { backgroundColor: '#333333', fontSize: '24px', padding: { x: 20, y: 10 } };
        
        this.messageBox.setText(text).setStyle(style).setVisible(true);
        
        this.time.delayedCall(isWin ? 20000 : 5000, () => {
            this.messageBox.setVisible(false);
        });
    }
}