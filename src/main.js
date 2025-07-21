// src/main.js
import { Start } from './scenes/Start.js';
import { SlotMachineScene } from './scenes/SlotMachineScene.js';
import { AeroplaneScene } from './scenes/AeroplaneScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game-container',
    width: 720,
    height: 1280,
    backgroundColor: '#000',
    scene: [Start, SlotMachineScene, AeroplaneScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

export function createPhaserGame() {
    return new Phaser.Game(config);
}