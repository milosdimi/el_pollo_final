/**
 * Main game bootstrap and UI wiring.
 * Handles menu, levels, world instance and input.
 */

/** @type {HTMLCanvasElement|null} */
let canvas;
/** @type {World|null} */
let world;

/** Global keyboard instance shared with World. */
const keyboard = new Keyboard();

/**
 * Triggers a short vibration if supported.
 * @param {number} ms Duration in milliseconds.
 */
const buzz = (ms) => navigator.vibrate?.(ms);

/**
 * Checks if the main menu overlay is currently visible.
 * @returns {boolean} True if menu is open.
 */
const isMenuOpen = () =>
  !document
    .getElementById('menuOverlay')
    ?.classList.contains('hidden');

let _toolbarWired = false;
let _autoPauseWired = false;
let _pausedByInfo = false;

/* ---------- Level selection ---------- */

/**
 * Reads the preferred level from URL or localStorage.
 * @returns {'1'|'2'} Selected level id.
 */
function _readLevelPref() {
  const u = new URL(location.href);
  const q = u.searchParams.get('lvl');
  if (q === '1' || q === '2') return q;
  return localStorage.getItem('lvl') || '1';
}

let _selectedLevel = _readLevelPref();

/**
 * Returns a level builder function based on current selection.
 * @returns {(() => Level)|null} Level factory or null.
 */
function _getLevelBuilder() {
  if (_selectedLevel === '2' &&
    typeof buildLevel2 === 'function') {
    return buildLevel2;
  }
  if (typeof buildLevel1 === 'function') return buildLevel1;
  return null;
}

/* ---------- Boot ---------- */

/**
 * Boot entry point after DOMContentLoaded.
 * Binds keyboard and sets up menu/mobile controls.
 */
function boot() {
  keyboard.bind();
  setupMenu();
  wireMobileControls();
}

window.addEventListener('DOMContentLoaded', boot);

/* ---------- Start menu ---------- */

/**
 * Sets up the start menu and related overlays.
 * If no menu exists, the game starts directly.
 */
function setupMenu() {
  const menu = document.getElementById('menuOverlay');
  if (!menu) {
    initGame();
    return;
  }

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

/**
 * Wires the info popup (controls explanation).
 * Pauses/resumes the world while the popup is open.
 */
function wireInfoPopup() {
  const btn = document.getElementById('btnInfo');
  const overlay = document.getElementById('infoOverlay');
  const close = document.getElementById('btnInfoClose');
  if (!btn || !overlay) return;

  const open = () => {
    overlay.classList.remove('hidden');
    setPadEnabled(false);

    // Pause only if not already paused
    if (world && !world.isPaused) {
      _pausedByInfo = true;
      world.isPaused = true;
      sfx?.pauseMusic?.();
      sfx?.stopWalk?.();
    } else {
      _pausedByInfo = false;
    }
  };

  const hide = () => {
    overlay.classList.add('hidden');

    // Only resume if this popup actually paused the game
    if (_pausedByInfo && world) {
      world.isPaused = false;
      if (!sfx?.isMuted?.()) sfx?.startMusic?.();
    }
    syncPadToState();
  };

  btn.addEventListener('click', open);
  close?.addEventListener('click', hide);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hide();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
}

/**
 * Sets the active level, persists it and updates UI.
 * @param {'1'|'2'} n Level id.
 */
function setLevel(n) {
  if (n !== '1' && n !== '2') return;

  _selectedLevel = n;
  localStorage.setItem('lvl', n);

  const u = new URL(location.href);
  u.searchParams.set('lvl', n);
  history.replaceState(null, '', u.toString());

  const box = document.getElementById('levelPicker');
  if (!box) return;

  box.querySelectorAll('[data-lvl]').forEach(btn => {
    const active = btn.getAttribute('data-lvl') === n;
    btn.classList.toggle('is-active', active);
  });
}

/**
 * Wires the clickable level picker buttons.
 */
function wireLevelPicker() {
  const box = document.getElementById('levelPicker');
  if (!box) return;

  box.querySelectorAll('[data-lvl]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = btn.getAttribute('data-lvl');
      setLevel(lvl);
    });
  });

  setLevel(_selectedLevel);
}

/**
 * Disables toolbar buttons while the menu is open,
 * except ones explicitly allowed there (mute/info).
 * @param {boolean} menuOpen True if menu is visible.
 */
function _setToolbarDisabledWhileMenu(menuOpen) {
  const bar = document.querySelector('.toolbar');
  if (!bar) return;

  bar.querySelectorAll('.btns').forEach(btn => {
    const allow =
      btn.hasAttribute('data-active-in-menu') ||
      btn.id === 'btnMute' ||
      btn.id === 'btnInfo';

    const disable = menuOpen && !allow;
    btn.setAttribute(
      'aria-disabled',
      disable ? 'true' : 'false'
    );
  });
}

/**
 * Syncs toolbar state against current overlay visibility.
 */
function _syncUiForOverlays() {
  const menu = document.getElementById('menuOverlay');
  const menuOpen = !menu?.classList.contains('hidden');
  _setToolbarDisabledWhileMenu(menuOpen);
}

/**
 * Binds keyboard shortcuts for the start menu.
 * @param {HTMLElement} menu Menu overlay element.
 */
function bindMenuKeys(menu) {
  window.addEventListener('keydown', (e) => {
    if (menu.classList.contains('hidden')) return;

    if (e.code === 'Enter' || e.code === 'Space') {
      startGame();
    }
    if (e.code === 'Digit1') setLevel('1');
    if (e.code === 'Digit2') setLevel('2');
  });
}

/* ---------- Mobile pad state ---------- */

/**
 * Enables or disables the on-screen mobile pad.
 * @param {boolean} on True to enable pad.
 */
function setPadEnabled(on) {
  document
    .getElementById('mobilePad')
    ?.classList.toggle('is-off', !on);
}

/**
 * Syncs pad enabled state based on game/menu/visibility.
 */
function syncPadToState() {
  const menuOpen =
    !document
      .getElementById('menuOverlay')
      ?.classList.contains('hidden');

  const endOpen =
    !document
      .getElementById('endOverlay')
      ?.classList.contains('hidden');

  const infoOpen =
    !document
      .getElementById('infoOverlay')
      ?.classList.contains('hidden');

  const paused = !!world?.isPaused;
  const hidden = document.hidden;
  const playing =
    !menuOpen && !endOpen && !infoOpen && !paused && !hidden;

  setPadEnabled(playing);
}

/* ---------- End overlay ---------- */

/**
 * Wires the end screen buttons (back/restart).
 */
function setupEndButtons() {
  const end = document.getElementById('endOverlay');
  const btnBack = document.getElementById('btnBack');
  const btnRestart = document.getElementById('btnRestart');

  if (btnRestart) {
    btnRestart.onclick = () => restartGame();
  }

  if (btnBack) {
    btnBack.onclick = () => {
      end?.classList.add('hidden');
      const menu = document.getElementById('menuOverlay');
      if (menu) menu.classList.remove('hidden');
      _syncUiForOverlays();
      syncPadToState();
    };
  }
}

/**
 * Ensures a global showEndOverlay function exists.
 * Chooses win/lose image and shows the overlay.
 */
function ensureEndOverlay() {
  if (window.showEndOverlay) return;

  const end = document.getElementById('endOverlay');
  const img = document.getElementById('endImg');

  window.showEndOverlay = (type) => {
    if (!end || !img) return;

    img.src =
      type === 'win'
        ? 'img/You won, you lost/You Won B.png'
        : 'img/You won, you lost/You lost.png';

    img.classList.toggle('is-win', type === 'win');
    img.classList.toggle('is-lose', type !== 'win');

    end.classList.remove('hidden');
    setPadEnabled(false);
    _syncUiForOverlays();
  };
}

/* ---------- Start & init ---------- */

/**
 * Starts a new game from the start menu.
 * Hides menu, initializes world and focuses canvas.
 */
function startGame() {
  const menu = document.getElementById('menuOverlay');
  if (menu) menu.classList.add('hidden');

  initGame();
  _syncUiForOverlays();
  // tryFS(); // optional fullscreen
  canvas?.focus?.();
}

/**
 * Creates a new world instance and wires UI.
 */
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

/**
 * Restarts the game from scratch in the same level.
 */
function restartGame() {
  if (world) world.dispose();

  document
    .getElementById('endOverlay')
    ?.classList.add('hidden');

  sfx.stopAll();

  const make = _getLevelBuilder();
  const lvl = make ? make() : null;

  world = new World(canvas, keyboard, lvl);
  wireToolbar();
  canvas?.focus?.();

  if (!sfx.isMuted()) sfx.startMusic();
  syncPadToState();
}

/**
 * Tries to enter fullscreen on mobile.
 * Used for better experience on small screens.
 */
async function tryFS() {
  const el = document.getElementById('stage');
  if (!document.fullscreenElement) {
    try { await el?.requestFullscreen?.(); } catch { }
  }
}

/* ---------- Auto pause ---------- */

/**
 * Auto-pause wiring: pauses on blur/hidden tab once.
 */
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
  document.addEventListener(
    'visibilitychange',
    () => { if (document.hidden) pauseAll(); }
  );
}

/* ---------- Toolbar (pause / FS / reload / mute) ---------- */

/**
 * Wires the top toolbar buttons and keyboard shortcuts.
 * Uses a small periodic tick to keep UI & pad in sync.
 */
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
    if (btnFS) {
      btnFS.textContent =
        document.fullscreenElement ? '🡼' : '⛶';
    }
    if (btnMute) {
      btnMute.textContent =
        sfx?.isMuted?.() ? '🔇' : '🔊';
    }
  };

  const toggleFS = () => {
    try {
      if (!document.fullscreenElement) {
        stage?.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    } catch { }
    updateUI();
  };

  const tick = () => {
    updateUI();
    syncPadToState();
    _syncUiForOverlays();
  };

  if (_toolbarWired) {
    tick();
    return;
  }
  _toolbarWired = true;

  // Button clicks
  btnPause?.addEventListener('click', () => {
    world?.togglePause();
    tick();
  });

  btnFS?.addEventListener('click', toggleFS);

  btnReload?.addEventListener('click', () => {
    restartGame();
  });

  btnMute?.addEventListener('click', () => {
    sfx?.toggleMute?.();
    if (isMenuOpen()) {
      sfx.pauseMusic();
    } else {
      sfx.isMuted() ? sfx.pauseMusic() : sfx.startMusic();
    }
    updateUI();
  });

  // System events → keep UI/pad in sync
  document.addEventListener('fullscreenchange', tick);

  window.addEventListener('keydown', () => {
    setTimeout(tick, 0);
  });

  // Keyboard shortcuts (F/R/M) + menu-safe mute
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const code = e.code ||
      `Key${String.fromCharCode(e.keyCode || 0)}`;
    const menuOpen = isMenuOpen();

    if (menuOpen) {
      if (code === 'KeyM' || e.keyCode === 77) {
        sfx?.toggleMute?.();
        sfx.pauseMusic(); // stay muted in menu
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

/* ---------- Mobile controls ---------- */

/**
 * Wires the on-screen mobile pad to keyboard flags.
 * Supports both touch and mouse input.
 */
function wireMobileControls() {
  const pad = document.getElementById('mobilePad');
  if (!pad) return;

  const press = (k) => { if (keyboard) keyboard[k] = true; };
  const release = (k) => { if (keyboard) keyboard[k] = false; };
  const down = (k) => (e) => { e.preventDefault(); press(k); };
  const up = (k) => (e) => { e.preventDefault(); release(k); };

  // Disable context menu on the whole pad
  pad.addEventListener('contextmenu', (e) => e.preventDefault());

  pad.querySelectorAll('[data-k]').forEach(btn => {
    const key = btn.getAttribute('data-k');
    btn.addEventListener('touchstart', down(key), { passive: false });
    btn.addEventListener('touchend', up(key));
    btn.addEventListener('touchcancel', up(key));
    btn.addEventListener('mousedown', down(key));
    btn.addEventListener('mouseup', up(key));
    btn.addEventListener('mouseleave', up(key));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}

