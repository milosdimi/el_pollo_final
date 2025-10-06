# El Pollo Loco 2D — TODO

> Reihenfolge: P0 → P1 → P2. Häkchen setzen, wenn erledigt.  
> Dateien (typisch): `models/*.class.js`, `levels/level1.js`, `world.class.js`.

## P0 — Core Gameplay (Basis)

- [*] **Collision hitbox offsets**
  - [*] `MovableObject.isColliding()` nutzt `offset` von beiden Objekten
  - [*] Tests: Character↔Chicken, Bottle↔Boss, Character↔Bottle
- [*] **Throwable bottle: spin + splash**
  - [*] In-flight: Rotations-/Frame-Animation in `ThrowableObject`
  - [*] On hit(): `bottle_splash` animieren, danach Objekt entfernen
  - [*] (Optional) Bodenaufprall splasht (wenn `y` Boden erreicht)
- [*] **Stomp kill on chickens**
  - [*] Downward-Kontakt (fallend) ⇒ Chicken stirbt (Dead-Sprite/Remove)
  - [*] Charakter bounct leicht hoch
  - [*] Seitenkollisionen verletzen weiterhin den Spieler
- [*] **Player hurt knockback**
  - [*] Rückstoß + I-Frames (~0.2–0.5 s)
- [*] **Endboss AI + damage**
  - [*] Aktiviert bei Sichtkontakt/Viewport (Alert)
  - [*] Jagd den Spieler; Speed steigt pro Treffer
  - [*] Flaschen-Treffer reduzieren Boss-Energie
  - [*] `StatusbarBoss` updaten
- [*] **Bottle throw rules**
  - [*] Wurf nur bei `bottlesCount > 0`
  - [*] Cooldown
  - [*] Count verringern + Leiste aktualisieren

## P1 — Content & Balancing

- [*] **SmallChicken enemy** (kleiner, schneller)
- [*] **Enemy speeds & counts** (feinjustiert)
- [*] **Coins & Bottles placements** (genug Flaschen vor Boss)
- [*] **Boss-Alert-Sound** (watch-out) beim ersten Sichtkontakt

## P2 — UX & Quality

- [*] **Audio polish**
  - [*] Lautstärken balanciert
  - [ ] **Start-Delay der SFX beheben** (SFX ohne ⏱ Verzögerung direkt nach Spielstart)
  - [ ] **Mute-Status in `localStorage` persistieren** (wird beim Start übernommen)
- [*] **Pause/Resume**
  - [*] Taste `P`/`ESC` + Toolbar-Button
- [*] **Clouds parallax**
- [*] **Performance**
  - [*] Wo sinnvoll: von `setInterval` auf `requestAnimationFrame` takten
- [*] **Asset preload**
  - [*] Frames für Bottle/Coin/Boss im Image-Cache
- [ ] **Camera clamp**
  - [ ] Scrollen auf Levelgrenzen begrenzen
- [*] **Start-/End-Overlays**
  - [*] Startscreen (Play)
  - [*] Win/Lose-Bild + Aktionen
- [*] **Toolbar**
  - [*] Buttons (Pause/Mute/FS/Reload)
  - [*] **Kein Fokusklau** (Space toggelt nicht mehr Buttons)
  - [ ] **Soft-Reload** (nur Spiel neu starten, **ohne** Page-Refresh/Startscreen)
- [ ] **Controls/Info**
  - [ ] **Controls-Overlay** (Tasten/Touch-Controls anzeigen)
  - [ ] **Info-Popup** (kurze Hinweise)
  - [ ] **Kurzgeschichte/Story-Popup**
- [ ] **Responsive & Mobile**
  - [ ] **Mobile Steuerungs-Overlays** (Control-Images/Buttons)
  - [ ] **Responsive Optimierung** (Toolbar/Overlays/Canvas auf kleinen Screens)
- [ ] **Footer/Legal**
  - [ ] Footer mit **Impressum**, **Datenschutz**, optional **Cookie-Hinweis**

---

## Nice-to-have / Später

- [ ] **Level-Auswahl** (Startscreen) + **Level 2**
- [ ] Partikel/Hit-FX (Staub beim Landen, Treffer-Funken)
- [ ] Win/Lose-Screens mit Restart **ohne** Reload (Soft-Restart)

    // Audio
    coinSfx = new Audio('audio/coinRecievedEffect.mp3');
    bottleSfx = new Audio('audio/bottleCollectedEffect.mp3');
    bossHitSfx = new Audio('audio/bossHit.mp3');
    music = new Audio('audio/background-music.mp3');
    walkSfx = new Audio('audio/walkEffect.mp3');
    jumpSfx = new Audio('audio/jump.mp3');
    chickenSfx = new Audio('audio/chicken-noise-196746.mp3');
    hurtSfx = new Audio('audio/auah.mp3');
    snorkSfx = new Audio('audio/snorking.mp3');
    bossAlertSfx = new Audio('audio/watch-out.mp3');
    winSfx = new Audio('audio/win.mp3');
    gameOverSfx = new Audio('audio/game_over.mp3');
