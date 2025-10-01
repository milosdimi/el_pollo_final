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
  - [*] Charakter bounct leicht hoch (`speedY` z. B. 15)
  - [*] Seitenkollisionen verletzen weiterhin den Spieler
- [*] **Player hurt knockback**
  - [*] Bei `isHurt()`: kurzer horizontaler Rückstoß + Mini-Hop
  - [*] I-Frames (~0.2 s) bleiben aktiv
- [*] **Endboss AI + damage**
  - [*] Aktiviert bei Sichtkontakt/Viewport
  - [*] `moveLeft()` Richtung Spieler; Speed steigt pro Treffer
  - [*] Flaschen-Treffer reduzieren Boss-Energie (3–4 Hits total)
  - [*] `StatusbarBoss` bei Treffern updaten
  - [*] (Optional) Boss-Kontakt = sofortiger Tod
- [*] **Bottle throw rules**
  - [*] Wurf nur bei `bottlesCount > 0`
  - [*] Wurf-Cooldown (z. B. 300–500 ms)
  - [*] Count verringern + Bottle-Leiste aktualisieren

## P1 — Content & Balancing

- [*] **SmallChicken enemy**
  - [*] Neue Klasse `SmallChicken` (kleiner, schneller, weniger HP)
  - [*] Spawn-Mix in `level1.js` ergänzen
- [*] **Enemy speeds & counts**
  - [*] `speed`/Anzahl für Chicken/SmallChicken/Endboss feinjustieren
  - [*] Schwierigkeit kurvig statt spiky
- [ ] **Coins & Bottles placements**
  - [*] Positionen/Mengen so setzen, dass vor dem Boss genug Flaschen da sind

## P2 — UX & Quality

- [ ] **Audio polish**
  - [ ] SFX-Lautstärke balancieren; Mute-Toggle (Taste `M`)
- [ ] **Pause/Resume**
  - [ ] Taste `P`: Loops/Timer pausieren/fortsetzen ohne Reload
- [ ] **Clouds parallax**
  - [ ] Leicht unterschiedliche `speed` pro Wolke (Parallax-Gefühl)
- [ ] **Camera clamp**
  - [ ] Scrollen auf Levelgrenzen begrenzen
- [ ] **Performance**
  - [ ] Wo sinnvoll: von `setInterval` auf `requestAnimationFrame` takten
- [ ] **Asset preload**
  - [ ] Frames für Bottle/Coin/Boss vorladen (Image-Cache)

---

## Nice-to-have / Später

- [ ] Level 2 vorbereiten (neue Enemy-Mischung, Boss-Variante)
- [ ] Partikel/Hit-FX (Staub beim Landen, Treffer-Funken)
- [ ] Win/Lose-Screens (Restart ohne Reload)
