let canvas;
let world;
let keyboard = new Keyboard();

/* =========================
   Boot: Startmenü
   ========================= */
function setupMenu() {
  const menuOverlay = document.getElementById('menuOverlay');
  if (!menuOverlay) {
    initGame();
    return;
  }

  const btnPlay = document.getElementById('btnPlay');
  const endOverlay = document.getElementById('endOverlay');
  const endImg = document.getElementById('endImg');
  const btnBack = document.getElementById('btnBack');
  const btnRestart = document.getElementById('btnRestart');

  // Startscreen sichtbar
  menuOverlay.classList.remove('hidden');
  if (endOverlay) endOverlay.classList.add('hidden');

  // Play-Button
  btnPlay && (btnPlay.onclick = startGame);

  // Enter/Space starten auch (nur wenn Menü sichtbar)
  window.addEventListener('keydown', (e) => {
    if (menuOverlay.classList.contains('hidden')) return;
    if (e.code === 'Enter' || e.code === 'Space') startGame();
  });

  // End-Overlay Buttons
  btnRestart && (btnRestart.onclick = () => location.reload());
  btnBack && (btnBack.onclick = () => {
    // Zurück zum Startscreen 
    location.reload();
  });

  // Globale Hook-Funktion, die World bei Win/Lose aufruft
  window.showEndOverlay = (type) => {
    if (!endOverlay || !endImg) return;
    endImg.src = (type === 'win')
      ? 'img/You won, you lost/You Won B.png'
      : 'img/You won, you lost/You lost.png';
    endOverlay.classList.remove('hidden');
  };
}

function startGame() {
  const menuOverlay = document.getElementById('menuOverlay');
  if (menuOverlay) menuOverlay.classList.add('hidden');
  initGame();
  canvas?.focus?.();
  try { world?.music?.play?.(); } catch { }
}

/* =========================
   Spiel initialisieren
   ========================= */
function initGame() {
  canvas = document.getElementById('canvas');
  world = new World(canvas, keyboard);
  wireToolbar();

  if (!window.showEndOverlay) {
    window.showEndOverlay = (type) => {
      const endOverlay = document.getElementById('endOverlay');
      const endImg = document.getElementById('endImg');
      if (!endOverlay || !endImg) return;
      endImg.src = (type === 'win')
        ? 'img/You won, you lost/You Won B.png'
        : 'img/You won, you lost/You lost.png';
      endOverlay.classList.remove('hidden');
    };
  }
}

/* =========================
   Toolbar (Pause/Mute/FS/Reload) + Hotkeys F/R
   ========================= */
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
        await stage?.requestFullscreen?.();
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

    if (btnPause) {
      btnPause.textContent = paused ? '▶' : '⏯';
      btnPause.classList.toggle('is-active', paused);
    }
    if (btnMute) {
      btnMute.textContent = muted ? '🔇' : '🔊';
      btnMute.classList.toggle('is-active', muted);
    }
    if (btnFS) {
      btnFS.textContent = document.fullscreenElement ? '🡼' : '⛶';
    }
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

/* =========================
   Keyboard (Pfeile/Space/D/M/P/ESC)
   ========================= */
window.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 37: keyboard.LEFT = true; break;
    case 39: keyboard.RIGHT = true; break;
    case 38: keyboard.UP = true; break;
    case 40: keyboard.DOWN = true; break;
    case 32: keyboard.SPACE = true; break;
    case 68: keyboard.D = true; break; // Throw
    case 77: keyboard.M = true; break; // Mute
    case 80: keyboard.P = true; break; // Pause
    case 27: keyboard.ESC = true; break; // Pause
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.keyCode) {
    case 37: keyboard.LEFT = false; break;
    case 39: keyboard.RIGHT = false; break;
    case 38: keyboard.UP = false; break;
    case 40: keyboard.DOWN = false; break;
    case 32: keyboard.SPACE = false; break;
    case 68: keyboard.D = false; break;
    case 77: keyboard.M = false; break;
    case 80: keyboard.P = false; break;
    case 27: keyboard.ESC = false; break;
  }
});
