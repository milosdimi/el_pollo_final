let canvas;
let world;
const keyboard = new Keyboard();

let _toolbarWired = false;
let _autoPauseWired = false;

/* Level-Picker */
function _readLevelPref() {
  const u = new URL(location.href);
  const q = u.searchParams.get('lvl');
  if (q === '1' || q === '2') return q;
  return localStorage.getItem('lvl') || '1';
}
let _selectedLevel = _readLevelPref();

function _getLevelBuilder() {
  if (_selectedLevel === '2' && typeof buildLevel2 === 'function') return buildLevel2;
  if (typeof buildLevel1 === 'function') return buildLevel1;
  return null;
}

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
  if (btnPlay) btnPlay.onclick = startGame;

  bindMenuKeys(menu);
  setupEndButtons();
  ensureEndOverlay();
  wireLevelPicker();
  menu.classList.remove('hidden');
}

function setLevel(n) {
  if (n !== '1' && n !== '2') return;
  _selectedLevel = n;
  localStorage.setItem('lvl', n);

  // URL aktualisieren (ohne Reload), damit Leiste stimmt
  const u = new URL(location.href);
  u.searchParams.set('lvl', n);
  history.replaceState(null, '', u.toString());

  // Buttons optisch updaten
  const box = document.getElementById('levelPicker');
  if (!box) return;
  box.querySelectorAll('[data-lvl]').forEach(b => {
    b.classList.toggle('is-active', b.getAttribute('data-lvl') === n);
  });
}

function wireLevelPicker() {
  const box = document.getElementById('levelPicker');
  if (!box) return;
  box.querySelectorAll('[data-lvl]').forEach(b => {
    b.addEventListener('click', () => setLevel(b.getAttribute('data-lvl')));
  });
  setLevel(_selectedLevel); // initial sync
}


function bindMenuKeys(menu) {
  window.addEventListener('keydown', (e) => {
    if (menu.classList.contains('hidden')) return;
    if (e.code === 'Enter' || e.code === 'Space') startGame();
    if (e.code === 'Digit1') setLevel('1');
    if (e.code === 'Digit2') setLevel('2');
  });
}



function setupEndButtons() {
  const end = document.getElementById('endOverlay');
  const btnBack = document.getElementById('btnBack');
  const btnRestart = document.getElementById('btnRestart');

  if (btnRestart) btnRestart.onclick = () => restartGame();

  if (btnBack) btnBack.onclick = () => {
    end?.classList.add('hidden');
    const menu = document.getElementById('menuOverlay');
    if (menu) menu.classList.remove('hidden');
  };
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

  const make = _getLevelBuilder();
  const lvl = make ? make() : null;

  world = new World(canvas, keyboard, lvl);   // <— Level direkt mitgeben
  wireToolbar();
  wireAutoPause();
  ensureEndOverlay();

  sfx.stopAll();
  if (!document.hidden) sfx.startMusic();
}

function restartGame() {
  if (world) world.dispose();
  document.getElementById('endOverlay')?.classList.add('hidden');
  sfx.stopAll();

  const make = _getLevelBuilder();
  const lvl = make ? make() : null;

  world = new World(canvas, keyboard, lvl);   // <— Level direkt mitgeben
  wireToolbar();
  canvas?.focus?.();

  if (!document.hidden) sfx.startMusic();
}


/* Auto-Pause */
function wireAutoPause() {
  if (_autoPauseWired) return;
  _autoPauseWired = true;

  window.addEventListener('blur', () => {
    if (world) world.isPaused = true;
    sfx?.pauseMusic?.();
    sfx?.stopWalk?.();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (world) world.isPaused = true;
      sfx?.pauseMusic?.();
      sfx?.stopWalk?.();
    }
  });
}

/* Toolbar (Pause/FS/Reload/Mute) */
function wireToolbar() {
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const btnPause = $('btnPause');
  const btnFS = $('btnFS');
  const btnReload = $('btnReload');
  const btnMute = $('btnMute');

  function updateToolbarState() {
    const paused = !!world?.isPaused;
    if (btnPause) {
      btnPause.textContent = paused ? '▶' : '⏯';
      btnPause.classList.toggle('is-active', paused);
    }
    if (btnFS) btnFS.textContent = document.fullscreenElement ? '🡼' : '⛶';
    if (btnMute) btnMute.textContent = sfx?.isMuted?.() ? '🔇' : '🔊';
  }

  if (_toolbarWired) { updateToolbarState(); return; }
  _toolbarWired = true;

  function toggleFS() {
    try {
      if (!document.fullscreenElement) { stage?.requestFullscreen?.(); }
      else { document.exitFullscreen?.(); }
    } catch { }
    updateToolbarState();
  }

  btnPause?.addEventListener('click', () => { world?.togglePause(); updateToolbarState(); });
  btnFS?.addEventListener('click', toggleFS);
  btnReload?.addEventListener('click', () => restartGame());
  btnMute?.addEventListener('click', () => { sfx?.toggleMute?.(); updateToolbarState(); });

  window.addEventListener('keydown', () => setTimeout(updateToolbarState, 0));
  document.addEventListener('fullscreenchange', updateToolbarState);
  setInterval(updateToolbarState, 300);
  updateToolbarState();

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'KeyF' || e.keyCode === 70) toggleFS();
    if (e.code === 'KeyR' || e.keyCode === 82) restartGame();
    if (e.code === 'KeyM' || e.keyCode === 77) { sfx?.toggleMute?.(); updateToolbarState(); }
  });
}
