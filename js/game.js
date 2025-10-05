let canvas;
let world;
let keyboard = new Keyboard();

function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    wireToolbar();
}

function wireToolbar() {
    const $ = (id) => document.getElementById(id);
    const stage = $('stage');
    const btnPause = $('btnPause');
    const btnMute = $('btnMute');
    const btnFS = $('btnFS');
    const btnReload = $('btnReload');

    const toggleFS = async () => {
        try {
            if (!document.fullscreenElement) {
                await stage.requestFullscreen?.();
            } else {
                await document.exitFullscreen?.();
            }
        } catch { }
        updateToolbarState();
    };

    btnPause?.addEventListener('click', () => { world?.togglePause(); updateToolbarState(); });
    btnMute?.addEventListener('click', () => { world?.toggleMute(); updateToolbarState(); });
    btnFS?.addEventListener('click', toggleFS);
    btnReload?.addEventListener('click', () => location.reload());

    function updateToolbarState() {
        const paused = !!world?.isPaused;
        const muted = !!world?.isMuted;
        btnPause && (btnPause.textContent = paused ? '▶' : '⏯');
        btnPause?.classList.toggle('is-active', paused);
        btnMute && (btnMute.textContent = muted ? '🔇' : '🔊');
        btnMute?.classList.toggle('is-active', muted);
        btnFS && (btnFS.textContent = document.fullscreenElement ? '🡼' : '⛶');
    }

    window.addEventListener('keydown', () => setTimeout(updateToolbarState, 0));
    document.addEventListener('fullscreenchange', updateToolbarState);
    setInterval(updateToolbarState, 300);
    updateToolbarState();

    window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        if (e.code === 'KeyF' || e.keyCode === 70) toggleFS();
        if (e.code === 'KeyR' || e.keyCode === 82) location.reload();
    });
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
