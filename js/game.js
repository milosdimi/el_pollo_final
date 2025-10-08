let canvas;
let world;
const keyboard = new Keyboard();

/* Boot */
function boot() {
  keyboard.bind();
  setupMenu();
}
window.addEventListener('DOMContentLoaded', boot);

/* Startmenü */
function setupMenu() {
  const menu = document.getElementById('menuOverlay');
  if (!menu) { initGame(); return; }

  const btnPlay = document.getElementById('btnPlay');
  btnPlay && (btnPlay.onclick = startGame);

  bindMenuKeys(menu);
  setupEndButtons();
  ensureEndOverlay();
  menu.classList.remove('hidden');
}

function bindMenuKeys(menu) {
  window.addEventListener('keydown', (e) => {
    if (menu.classList.contains('hidden')) return;
    if (e.code === 'Enter' || e.code === 'Space') startGame();
  });
}

function setupEndButtons() {
  const end = document.getElementById('endOverlay');
  const btnBack = document.getElementById('btnBack');
  const btnRestart = document.getElementById('btnRestart');
  btnBack && (btnBack.onclick = () => location.reload());
  btnRestart && (btnRestart.onclick = () => location.reload());
}

function ensureEndOverlay() {
  if (window.showEndOverlay) return;
  const end = document.getElementById('endOverlay');
  const img = document.getElementById('endImg');
  window.showEndOverlay = (type) => {
    if (!end || !img) return;
    img.src = type === 'win'
      ? 'img/You won, you lost/You Won B.png'
      : 'img/You won, you lost/You lost.png';
    end.classList.remove('hidden');
  };
}

/* Start & Init */
function startGame() {
  const menu = document.getElementById('menuOverlay');
  if (menu) menu.classList.add('hidden');
  initGame();
  canvas?.focus?.();
}

function initGame() {
  canvas = document.getElementById('canvas');
  if (world) world.dispose();
  world = new World(canvas, keyboard);
  wireToolbar();
  ensureEndOverlay();
}

/* Toolbar (Pause/FS/Reload) */
function wireToolbar() {
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const btnPause = $('btnPause');
  const btnFS = $('btnFS');
  const btnReload = $('btnReload');

  function toggleFS() {
    try {
      if (!document.fullscreenElement) { stage?.requestFullscreen?.(); }
      else { document.exitFullscreen?.(); }
    } catch (e) { }
    updateToolbarState();
  }

  btnPause?.addEventListener('click', () => { world?.togglePause(); updateToolbarState(); });
  btnFS?.addEventListener('click', toggleFS);
  btnReload?.addEventListener('click', () => location.reload());

  function updateToolbarState() {
    const paused = !!world?.isPaused;
    if (btnPause) {
      btnPause.textContent = paused ? '▶' : '⏯';
      btnPause.classList.toggle('is-active', paused);
    }
    if (btnFS) btnFS.textContent = document.fullscreenElement ? '🡼' : '⛶';
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
