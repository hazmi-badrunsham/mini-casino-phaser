// src/gameSelector.js

const hub = document.getElementById('game-hub-container');
const game = document.getElementById('phaser-game-container');
const backBtn = document.getElementById('back-to-hub-btn');

// Phaser game instance
let phaserGame = null;

const slotBtn = document.getElementById('play-slot-btn');
slotBtn?.addEventListener('click', () => {
    launchGame('SlotMachineScene');
});

const aeroplaneBtn = document.getElementById('play-aeroplane-btn');
aeroplaneBtn?.addEventListener('click', () => {
    launchGame('AeroplaneScene');
});

backBtn?.addEventListener('click', () => {
    if (phaserGame) {
        phaserGame.destroy(true);
        phaserGame = null;
    }
    game.style.display = 'none';
    hub.style.display = 'block';
});

function launchGame(targetScene) {
    hub.style.display = 'none';
    game.style.display = 'block';

    if (!phaserGame) {
        import('./main.js').then((module) => {
            phaserGame = module.createPhaserGame();
            // Start the target scene immediately
            phaserGame.scene.start(targetScene);
        });
    } else {
        // If game already exists, just switch to the target scene
        phaserGame.scene.stop(phaserGame.scene.getScenes(true));
        phaserGame.scene.start(targetScene);
    }
}