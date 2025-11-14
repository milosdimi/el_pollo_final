/**
 * Handles keyboard input and maps browser key events
 * to game-friendly boolean flags (LEFT, RIGHT, SPACE, etc.).
 */
class Keyboard {
    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;
    SPACE = false;
    D = false;
    M = false;
    P = false;
    ESC = false;

    /**
     * Binds keydown and keyup listeners.
     * @param {Window|HTMLElement} target 
     */
    bind(target = window) {
        this._onDown = (e) => this._updateKey(true, e);
        this._onUp = (e) => this._updateKey(false, e);

        target.addEventListener('keydown', this._onDown);
        target.addEventListener('keyup', this._onUp);
    }

    /**
     * Removes keyboard listeners.
     * @param {Window|HTMLElement} target 
     */
    unbind(target = window) {
        if (!this._onDown || !this._onUp) return;
        target.removeEventListener('keydown', this._onDown);
        target.removeEventListener('keyup', this._onUp);
        this._onDown = null;
        this._onUp = null;
    }

    /* ---------- Internal Helpers ---------- */

    /**
     * Updates boolean flags based on key event.
     * @param {boolean} flag Key state (true: down, false: up)
     * @param {KeyboardEvent} e 
     */
    _updateKey(flag, e) {
        const key = this._mapKey(e.code);
        if (!key) return;

        this[key] = flag;

        if (this._shouldPreventScroll(e.code)) {
            e.preventDefault();
        }
    }

    /**
     * Converts browser key codes to game property names.
     * @param {string} code KeyboardEvent.code
     * @returns {string|null}
     */
    _mapKey(code) {
        const map = {
            ArrowLeft: 'LEFT',
            ArrowRight: 'RIGHT',
            ArrowUp: 'UP',
            ArrowDown: 'DOWN',
            Space: 'SPACE',
            KeyD: 'D',
            KeyM: 'M',
            KeyP: 'P',
            Escape: 'ESC'
        };
        return map[code] || null;
    }

    /**
     * Stops the browser from scrolling the page on arrow keys / space.
     * @param {string} code KeyboardEvent.code
     * @returns {boolean}
     */
    _shouldPreventScroll(code) {
        return ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
            .includes(code);
    }
}
