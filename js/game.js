let canvas;
let world;
let keyboard = new Keyboard();

function wireToolbar() {
    const $ = (id) => document.getElementById(id);
    const btnPause = $('btnPause');
    const btnMute = $('btnMute');
    const btnFS = $('btnFS');
    const btnReload = $('btnReload');
    const stage = $('stage');

    btnPause?.addEventListener('click', () => {
        if (window.world) world.togglePause();
        updateToolbarState();
    });

    btnMute?.addEventListener('click', () => {
        if (window.world) world.toggleMute();
        updateToolbarState();
    });

    btnFS?.addEventListener('click', async () => {
        try {
            if (!document.fullscreenElement) {
                await stage.requestFullscreen?.();
            } else {
                await document.exitFullscreen?.();
            }
        } catch (e) { }
        updateToolbarState();
    });

    btnReload?.addEventListener('click', () => location.reload());

    function updateToolbarState() {
        const paused = !!window.world?.isPaused;
        const muted = !!window.world?.isMuted;
        btnPause?.classList.toggle('is-active', paused);
        btnPause && (btnPause.textContent = paused ? '▶' : '⏯');

        btnMute?.classList.toggle('is-active', muted);
        btnMute && (btnMute.textContent = muted ? '🔇' : '🔊');

        const fs = !!document.fullscreenElement;
        btnFS && (btnFS.textContent = fs ? '🡼' : '⛶');
    }

    window.addEventListener('keydown', () => setTimeout(updateToolbarState, 0));
    document.addEventListener('fullscreenchange', updateToolbarState);

    updateToolbarState();

    setInterval(updateToolbarState, 300);
}

function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    wireToolbar();
}


window.addEventListener("keydown", (e) => {
    if (e.keyCode == 37) {
        keyboard.LEFT = true;
    }
    if (e.keyCode == 39) {
        keyboard.RIGHT = true;
    }
    if (e.keyCode == 38) {
        keyboard.UP = true;
    }
    if (e.keyCode == 40) {
        keyboard.DOWN = true;
    }
    if (e.keyCode == 32) {
        keyboard.SPACE = true;
    }
    if (e.keyCode == 68) {
        keyboard.D = true;
    }
    if (e.keyCode == 77) {
        keyboard.M = true;
    }
    if (e.keyCode == 80) {
        keyboard.P = true;
    }
    if (e.keyCode == 27) {
        keyboard.ESC = true;
    }
});

window.addEventListener("keyup", (e) => {
    if (e.keyCode == 37) {
        keyboard.LEFT = false;
    }
    if (e.keyCode == 39) {
        keyboard.RIGHT = false;
    }
    if (e.keyCode == 38) {
        keyboard.UP = false;
    }
    if (e.keyCode == 40) {
        keyboard.DOWN = false;
    }
    if (e.keyCode == 32) {
        keyboard.SPACE = false;
    }
    if (e.keyCode == 68) {
        keyboard.D = false;
    }
    if (e.keyCode == 77) {
        keyboard.M = false;
    }
    if (e.keyCode == 80) {
        keyboard.P = false;
    }
    if (e.keyCode == 27) {
        keyboard.ESC = false;
    }
});
