let canvas;
let world;
const keyboard = new Keyboard();
const buzz = (ms) => navigator.vibrate?.(ms);
const isMenuOpen = () => !document.getElementById('menuOverlay')?.classList.contains('hidden');
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
  wireMobileControls();
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
  wireInfoPopup();
  wireToolbar();

  sfx.pauseMusic();

  setPadEnabled(false);
  menu.classList.remove('hidden');
  _syncUiForOverlays();
}


function wireInfoPopup() {
  const btn = document.getElementById('btnInfo');
  const overlay = document.getElementById('infoOverlay');
  const close = document.getElementById('btnInfoClose');
  if (!btn || !overlay) return;

  const open = () => { overlay.classList.remove('hidden'); setPadEnabled(false); };
  const hide = () => { overlay.classList.add('hidden'); syncPadToState(); };

  btn.addEventListener('click', open);
  close?.addEventListener('click', hide);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) hide(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}

function setLevel(n) {
  if (n !== '1' && n !== '2') return;
  _selectedLevel = n;
  localStorage.setItem('lvl', n);
  const u = new URL(location.href);
  u.searchParams.set('lvl', n);
  history.replaceState(null, '', u.toString());

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
  setLevel(_selectedLevel);
}

function _setToolbarDisabledWhileMenu(isMenuOpen) {
  const bar = document.querySelector('.toolbar');
  if (!bar) return;
  bar.querySelectorAll('.btns').forEach(btn => {
    const allow = btn.hasAttribute('data-active-in-menu') || btn.id === 'btnMute' || btn.id === 'btnInfo';
    const disable = isMenuOpen && !allow;
    btn.setAttribute('aria-disabled', disable ? 'true' : 'false');
  });
}


function _syncUiForOverlays() {
  const menuOpen = !document.getElementById('menuOverlay')?.classList.contains('hidden');
  _setToolbarDisabledWhileMenu(menuOpen);
}


function bindMenuKeys(menu) {
  window.addEventListener('keydown', (e) => {
    if (menu.classList.contains('hidden')) return;
    if (e.code === 'Enter' || e.code === 'Space') startGame();
    if (e.code === 'Digit1') setLevel('1');
    if (e.code === 'Digit2') setLevel('2');
  });
}

/* Pad-Enable */
function setPadEnabled(on) {
  document.getElementById('mobilePad')?.classList.toggle('is-off', !on);
}

/* Pad-Sync */
function syncPadToState() {
  const menuOpen = !document.getElementById('menuOverlay')?.classList.contains('hidden');
  const endOpen = !document.getElementById('endOverlay')?.classList.contains('hidden');
  const infoOpen = !document.getElementById('infoOverlay')?.classList.contains('hidden');
  const paused = !!world?.isPaused;
  const hidden = document.hidden;
  const playing = !menuOpen && !endOpen && !infoOpen && !paused && !hidden;
  setPadEnabled(playing);
}

/* End-Overlay */
function setupEndButtons() {
  const end = document.getElementById('endOverlay');
  const btnBack = document.getElementById('btnBack');
  const btnRestart = document.getElementById('btnRestart');

  if (btnRestart) btnRestart.onclick = () => restartGame();
  if (btnBack) btnBack.onclick = () => {
    end?.classList.add('hidden');
    const menu = document.getElementById('menuOverlay');
    if (menu) menu.classList.remove('hidden');
    _syncUiForOverlays();
    syncPadToState();
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

    img.classList.toggle('is-win', type === 'win');
    img.classList.toggle('is-lose', type !== 'win');

    end.classList.remove('hidden');
    setPadEnabled(false);
    _syncUiForOverlays();
  };
}


/* Start & Init */
function startGame() {
  const menu = document.getElementById('menuOverlay');
  if (menu) menu.classList.add('hidden');
  initGame();
  _syncUiForOverlays();
  //tryFS();
  canvas?.focus?.();
}

function initGame() {
  canvas = document.getElementById('canvas');
  if (world) world.dispose();

  const make = _getLevelBuilder();
  const lvl = make ? make() : null;

  world = new World(canvas, keyboard, lvl);
  wireToolbar();
  wireAutoPause();
  ensureEndOverlay();

  sfx.stopAll();
  if (!sfx.isMuted()) sfx.startMusic();

  syncPadToState();
}

function restartGame() {
  if (world) world.dispose();
  document.getElementById('endOverlay')?.classList.add('hidden');
  sfx.stopAll();

  const make = _getLevelBuilder();
  const lvl = make ? make() : null;

  world = new World(canvas, keyboard, lvl);
  wireToolbar();
  canvas?.focus?.();

  if (!sfx.isMuted()) sfx.startMusic();
  syncPadToState();
}

// on mobile --> fullscreen
async function tryFS() {
  const el = document.getElementById('stage');
  if (!document.fullscreenElement) {
    try { await el?.requestFullscreen?.(); } catch { }
  }
}


/* Auto-Pause */
function wireAutoPause() {
  if (_autoPauseWired) return;
  _autoPauseWired = true;

  const pauseAll = () => {
    if (world) world.isPaused = true;
    sfx?.pauseMusic?.();
    sfx?.stopWalk?.();
    syncPadToState();
  };

  window.addEventListener('blur', pauseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAll(); });
}

/* Toolbar (Pause/FS/Reload/Mute) */
function wireToolbar() {
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const btnPause = $('btnPause');
  const btnFS = $('btnFS');
  const btnReload = $('btnReload');
  const btnMute = $('btnMute');

  const updateUI = () => {
    const paused = !!world?.isPaused;
    if (btnPause) {
      btnPause.textContent = paused ? '▶' : '⏯';
      btnPause.classList.toggle('is-active', paused);
    }
    if (btnFS) btnFS.textContent = document.fullscreenElement ? '🡼' : '⛶';
    if (btnMute) btnMute.textContent = sfx?.isMuted?.() ? '🔇' : '🔊';
  };

  const toggleFS = () => {
    try {
      if (!document.fullscreenElement) stage?.requestFullscreen?.();
      else document.exitFullscreen?.();
    } catch { }
    updateUI();
  };

  const tick = () => {
    updateUI();
    syncPadToState();
    _syncUiForOverlays();
  };

  if (_toolbarWired) { tick(); return; }
  _toolbarWired = true;

  // Clicks
  btnPause?.addEventListener('click', () => { world?.togglePause(); tick(); });
  btnFS?.addEventListener('click', toggleFS);
  btnReload?.addEventListener('click', () => restartGame());
  btnMute?.addEventListener('click', () => {
    sfx?.toggleMute?.();
    if (isMenuOpen()) {
      sfx.pauseMusic();
    } else {
      sfx.isMuted() ? sfx.pauseMusic() : sfx.startMusic();
    }
    updateUI();
  });

  // System events
  document.addEventListener('fullscreenchange', tick);
  window.addEventListener('keydown', () => setTimeout(tick, 0));

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const code = e.code || `Key${String.fromCharCode(e.keyCode || 0)}`;
    const menuOpen = isMenuOpen();

    if (menuOpen) {
      if (code === 'KeyM' || e.keyCode === 77) {
        sfx?.toggleMute?.();
        sfx.pauseMusic();     // im Menü stumm bleiben
        updateUI();
      }
      return;
    }

    if (code === 'KeyF' || e.keyCode === 70) toggleFS();
    if (code === 'KeyR' || e.keyCode === 82) restartGame();
    if (code === 'KeyM' || e.keyCode === 77) {
      sfx?.toggleMute?.();
      sfx.isMuted() ? sfx.pauseMusic() : sfx.startMusic();
      updateUI();
    }
  });

  setInterval(tick, 300);
  tick();
}



/* Mobile-Controls */
function wireMobileControls() {
  const pad = document.getElementById('mobilePad');
  if (!pad) return;

  const press = (k) => { if (keyboard) keyboard[k] = true; };
  const release = (k) => { if (keyboard) keyboard[k] = false; };
  const down = (k) => (e) => { e.preventDefault(); press(k); };
  const up = (k) => (e) => { e.preventDefault(); release(k); };

  pad.querySelectorAll('[data-k]').forEach(btn => {
    const key = btn.getAttribute('data-k');
    btn.addEventListener('touchstart', down(key), { passive: false });
    btn.addEventListener('touchend', up(key));
    btn.addEventListener('touchcancel', up(key));
    btn.addEventListener('mousedown', down(key));
    btn.addEventListener('mouseup', up(key));
    btn.addEventListener('mouseleave', up(key));
  });
}
