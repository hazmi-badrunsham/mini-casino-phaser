// src/AeroplaneScene.js

export class AeroplaneScene extends Phaser.Scene {
    constructor() {
        super('AeroplaneScene');
        this.multiplier = 1.0;
        this.betAmount = 10;
        this.isGameRunning = false;
        this.hasCashedOut = false;
    }

    preload() {
        this.load.image('background', 'assets/aeroplane/bg.jpg');
        this.load.image('plane', 'assets/aeroplane/airplane.png');
        this.load.image('crash', 'assets/aeroplane/airplanecrash.png');
        this.load.font('myFont', './assets/font/fonnts.com-Greycliff_CF_Regular.otf');
        this.load.audio('bgfx', 'assets/aeroplane/Music_fx_airport_lofi.wav');
        this.load.audio('flyfx', 'assets/aeroplane/flyfx.mp3');
    }

    create() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        this.bgMusic = this.sound.add('bgfx', { loop: true });
        this.flyfx = this.sound.add('flyfx');

        // Create all necessary game elements
        this._createBackground();
        this._createPlane();
        this._createUI();

        this.resetGame();

        // Set up keyboard input for direct text entry
        this.input.keyboard.on('keydown', this._handleKeyInput, this);

        // Listen for global coin updates
        window.addEventListener('coinsUpdated', (event) => {
            this.updateCoinDisplay(event.detail.coins);
        });
        this.updateCoinDisplay(window.getCoins());
    }

    /**
     * Creates and positions all UI text and buttons.
     */
    _createUI() {
        const textStyle = {
            fontFamily: 'myFont',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000',
                blur: 5,
                fill: true
            }
        };

        // Multiplier Text
        this.multiplierText = this.add.text(this.gameWidth / 2, this.gameHeight * 0.2, '1.00x', {
            ...textStyle,
            fontSize: '64px',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Coin Display
        this.coinText = this.add.text(this.gameWidth / 2.5 , this.gameHeight * 0.05, `💰 Coins: ${window.getCoins()}`, {
            ...textStyle,
            fontSize: '30px',
            fill: '#FFD700',
            strokeThickness: 2,
            shadow: { fill: false, stroke: false }
        }).setOrigin(0);

        // Message Box
        this.messageBox = this.add.text(this.gameWidth / 2, this.gameHeight * 0.5, '', {
            ...textStyle,
            fontSize: '32px',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
            shadow: { fill: false, stroke: false }
        }).setOrigin(0.5).setVisible(false);

        // Current Payout Text
        this.currentPayoutText = this.add.text(this.gameWidth / 2, this.gameHeight * 0.82, `Payout: 0 coins`, {
            ...textStyle,
            fontSize: '28px',
            fill: '#00FF00',
        }).setOrigin(0.5).setVisible(false);

        // Bet Input Display and Controls
        this._createBetInput();

        // Start and Cash Out Buttons
        const buttonY = this.gameHeight * 0.9;
        this.startButton = this.add.text(this.gameWidth / 2, buttonY, '✈️ START', {
            ...textStyle,
            fontSize: '34px',
            fill: '#ffffff',
            backgroundColor: '#0000aa',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', this._handleStartButtonClick, this)
            .on('pointerover', () => this.startButton.setStyle({ backgroundColor: '#0000cc' }))
            .on('pointerout', () => this.startButton.setStyle({ backgroundColor: '#0000aa' }));

        this.cashOutButton = this.add.text(this.gameWidth / 2, buttonY, '💸 CASH OUT', {
            ...textStyle,
            fontSize: '36px',
            fill: '#ffffff',
            backgroundColor: '#00aa00',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false)
            .on('pointerdown', this._handleCashOutButtonClick, this)
            .on('pointerover', () => this.cashOutButton.setStyle({ backgroundColor: '#00cc00' }))
            .on('pointerout', () => this.cashOutButton.setStyle({ backgroundColor: '#00aa00' }));
    }

    /**
     * Creates a simple bet input system with direct text input capability.
     */
    _createBetInput() {
        const textStyle = {
            fontFamily: 'myFont',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        };

        const betY = this.gameHeight * 0.83;

        // Bet label
        this.betLabel = this.add.text(this.gameWidth / 2, betY - 50, 'Bet Amount', {
            ...textStyle,
            fontSize: '20px',
            fill: '#000000ff',

        }).setOrigin(0.5);

        // Bet amount display (clickable for direct input)
        this.betDisplay = this.add.text(this.gameWidth / 2, betY, `${this.betAmount}`, {
            ...textStyle,
            fontSize: '28px',
            backgroundColor: '#2c3e50',
            padding: { x: 30, y: 10 },
            fill: '#ffffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this._enableDirectInput());

        // Decrease bet button
        this.decreaseBetButton = this.add.text(this.gameWidth / 2 - 100, betY, '➖', {
            ...textStyle,
            fontSize: '22px',
            backgroundColor: '#e74c3c',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this._changeBetAmount(-1))
            .on('pointerover', () => this.decreaseBetButton.setStyle({ backgroundColor: '#c0392b' }))
            .on('pointerout', () => this.decreaseBetButton.setStyle({ backgroundColor: '#e74c3c' }));

        // Increase bet button
        this.increaseBetButton = this.add.text(this.gameWidth / 2 + 100, betY, '➕', {
            ...textStyle,
            fontSize: '22px',
            backgroundColor: '#27ae60',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this._changeBetAmount(1))
            .on('pointerover', () => this.increaseBetButton.setStyle({ backgroundColor: '#229954' }))
            .on('pointerout', () => this.increaseBetButton.setStyle({ backgroundColor: '#27ae60' }));

        // Input state
        this.isInputActive = false;
        this.inputBuffer = '';
    }

    /**
     * Changes the bet amount by the specified increment.
     */
    _changeBetAmount(increment) {
        if (this.isGameRunning || this.isInputActive) return;

        if (increment > 0) {
            // Increase bet (but don't exceed available coins)
            const maxBet = window.getCoins();
            this.betAmount = Math.min(this.betAmount + increment, maxBet);
        } else {
            // Decrease bet (but don't go below 1)
            this.betAmount = Math.max(this.betAmount + increment, 1);
        }

        this._updateBetDisplay();
    }

    /**
     * Enables direct input mode for typing bet amounts.
     */
    _enableDirectInput() {
        if (this.isGameRunning) return;

        this.isInputActive = true;
        this.inputBuffer = this.betAmount.toString();
        this.betDisplay.setStyle({
            backgroundColor: '#34495e',
            fill: '#f39c12'
        });
        this.betDisplay.setText(`${this.inputBuffer}|`);
        this.betLabel.setText('Type amount and press Enter:');
    }

    /**
     * Handles keyboard input for direct bet amount entry.
     */
    _handleKeyInput(event) {
        if (!this.isInputActive) return;

        if (event.key === 'Enter') {
            this._confirmInput();
        } else if (event.key === 'Escape') {
            this._cancelInput();
        } else if (event.key === 'Backspace') {
            this.inputBuffer = this.inputBuffer.slice(0, -1);
            this.betDisplay.setText(`${this.inputBuffer || '0'}|`);
        } else if (event.key >= '0' && event.key <= '9' && this.inputBuffer.length < 6) {
            this.inputBuffer += event.key;
            this.betDisplay.setText(`${this.inputBuffer}|`);
        }
    }

    /**
     * Confirms the input and updates the bet amount.
     */
    _confirmInput() {
        const newAmount = parseInt(this.inputBuffer) || 1;
        const maxBet = window.getCoins();
        
        this.betAmount = Math.max(1, Math.min(newAmount, maxBet));
        this._disableInput();
    }

    /**
     * Cancels the input and reverts to the previous bet amount.
     */
    _cancelInput() {
        this._disableInput();
    }

    /**
     * Disables input mode and returns to normal display.
     */
    _disableInput() {
        this.isInputActive = false;
        this.inputBuffer = '';
        this.betDisplay.setStyle({
            backgroundColor: '#2c3e50',
            fill: '#3498db'
        });
        this.betLabel.setText('Bet Amount (Click to edit):');
        this._updateBetDisplay();
    }

    /**
     * Updates the bet display text.
     */
    _updateBetDisplay() {
        if (this.betDisplay && !this.isInputActive) {
            this.betDisplay.setText(`${this.betAmount}`);
        }
    }

    _createBackground() {
        const bg = this.add.image(0, 0, 'background').setOrigin(0);
        const scale = Math.max(this.cameras.main.width / bg.width, this.cameras.main.height / bg.height);
        bg.setScale(scale).setOrigin(0.5).setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
    }

    _createPlane() {
        this.plane = this.add.image(this.gameWidth / 2, this.gameHeight * 0.65, 'plane').setScale(0.5);
    }

    /**
     * Resets the game state and UI to their initial conditions.
     */
    resetGame() {
        this.multiplier = 1.0;
        this.isGameRunning = false;
        this.hasCashedOut = false;
        
        this.stopTimers();

        if (this.plane) this.plane.setTexture('plane').setScale(0.5).setPosition(this.gameWidth / 2, this.gameHeight * 0.65);
        if (this.multiplierText) this.multiplierText.setText('1.00x').setColor('#ffffff');
        if (this.startButton) this.startButton.setVisible(true).setInteractive({ useHandCursor: true }).setStyle({ backgroundColor: '#0000aa' });
        if (this.cashOutButton) this.cashOutButton.setVisible(false).disableInteractive();
        if (this.messageBox) this.messageBox.setVisible(false);
        if (this.currentPayoutText) this.currentPayoutText.setVisible(false);

        // Show bet input controls
        this._showBetControls(true);
    }

    /**
     * Shows or hides the bet input controls.
     */
    _showBetControls(show) {
        const elements = [
            this.betLabel,
            this.betDisplay,
            this.decreaseBetButton,
            this.increaseBetButton
        ];

        elements.forEach(element => {
            if (element) {
                element.setVisible(show);
                if (show) {
                    element.setInteractive({ useHandCursor: true });
                } else {
                    element.disableInteractive();
                }
            }
        });

        // If hiding controls, also disable any active input
        if (!show && this.isInputActive) {
            this._cancelInput();
        }
    }

    _handleStartButtonClick() {
        if (this.isGameRunning) return;

        if (this.betAmount <= 0 || !window.deductCoins(this.betAmount)) {
            this.showMessage('❌ Invalid bet amount or insufficient coins!', 'error');
            return;
        }

        this.startButton.disableInteractive().setStyle({ backgroundColor: '#7F8C8D' });
        this._showBetControls(false);

        this.startCountdown(3);
    }

    startCountdown(count) {
        if (count > 0) {
            this.showMessage(`Game starts in ${count}...`, 'info');
            this.time.delayedCall(1000, () => this.startCountdown(count - 1), [], this);
        } else {
            this.showMessage('GO!', 'info');
            this.startGame();
        }
    }

    startGame() {
        this.isGameRunning = true;
        this.hasCashedOut = false;
        this.cashOutButton.setVisible(true).setInteractive({ useHandCursor: true });
        this.currentPayoutText.setVisible(true);

        this.tweens.add({
            targets: this.plane,
            y: this.gameHeight * 0.2,
            scaleX: 0.7,
            scaleY: 0.7,
            duration: 10000,
            ease: 'Sine.easeInOut'
        });

        this.gameTimer = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                this.multiplier += 0.01 + (this.multiplier * 0.005);
                this.multiplierText.setText(`${this.multiplier.toFixed(2)}x`);
                const currentWin = Math.floor(this.multiplier * this.betAmount);
                this.currentPayoutText.setText(`Payout: ${currentWin} coins`);
            }
        });

        const crashTime = Phaser.Math.Between(3000, 15000);
        this.crashTimer = this.time.delayedCall(crashTime, this.crash, [], this);
    }

    _handleCashOutButtonClick() {
        if (!this.isGameRunning || this.hasCashedOut) return;

        this.hasCashedOut = true;
        this.stopTimers();

        const winAmount = Math.floor(this.multiplier * this.betAmount);
        window.addCoins(winAmount);

        this.cashOutButton.disableInteractive().setStyle({ backgroundColor: '#7F8C8D' });
        this.currentPayoutText.setVisible(false);
        this.showMessage(`✅ Cashed out at ${this.multiplier.toFixed(2)}x! You won +${winAmount} coins`, 'success');

        this.time.delayedCall(3000, () => this.scene.restart());
    }

    crash() {
        if (this.hasCashedOut) return;

        this.stopTimers();

        this.plane.setTexture('crash').setScale(0.6);
        this.multiplierText.setColor('#FF0000');
        this.cashOutButton.disableInteractive().setStyle({ backgroundColor: '#7F8C8D' });
        this.currentPayoutText.setVisible(false);

        this.showMessage(`💥 CRASHED at ${this.multiplier.toFixed(2)}x. You lost your bet.`, 'error');

        this.time.delayedCall(3000, () => this.scene.restart());
    }

    stopTimers() {
        if (this.gameTimer) {
            this.gameTimer.remove();
        }
        if (this.crashTimer) {
            this.crashTimer.remove();
        }
    }

    updateCoinDisplay(newCoins) {
        if (this.coinText) {
            this.coinText.setText(`💰 Coins: ${newCoins}`);
        }
    }

    showMessage(message, type = 'info') {
        if (!this.messageBox) return;

        let [bgColor, textColor, duration] = ['#333333', '#FFFFFF', 2000];

        switch (type) {
            case 'success':
                [bgColor, textColor, duration] = ['#27AE60', '#FFFFFF', 3000];
                break;
            case 'error':
                [bgColor, textColor, duration] = ['#E74C3C', '#FFFFFF', 3000];
                break;
        }

        this.messageBox.setText(message).setVisible(true).setStyle({
            backgroundColor: bgColor,
            fill: textColor,
            padding: { x: 20, y: 10 }
        });

        this.time.delayedCall(duration, () => this.messageBox.setVisible(false));
    }

    shutdown() {
        // Clean up timers
        this.stopTimers();
    }
}