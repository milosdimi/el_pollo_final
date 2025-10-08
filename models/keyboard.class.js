class Keyboard {
    LEFT = false; RIGHT = false; UP = false; DOWN = false;
    SPACE = false; D = false; M = false; P = false; ESC = false;

    bind(target = window) {
        this._onDown = (e) => this._set(true, e);
        this._onUp = (e) => this._set(false, e);
        target.addEventListener('keydown', this._onDown);
        target.addEventListener('keyup', this._onUp);
    }

    unbind(target = window) {
        if (!this._onDown || !this._onUp) return;
        target.removeEventListener('keydown', this._onDown);
        target.removeEventListener('keyup', this._onUp);
        this._onDown = null; this._onUp = null;
    }

    _set(flag, e) {
        const key = this._mapKey(e.code);
        if (!key) return;
        this[key] = flag;
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    }

    _mapKey(code) {
        if (code === 'ArrowLeft') return 'LEFT';
        if (code === 'ArrowRight') return 'RIGHT';
        if (code === 'ArrowUp') return 'UP';
        if (code === 'ArrowDown') return 'DOWN';
        if (code === 'Space') return 'SPACE';
        if (code === 'KeyD') return 'D';
        if (code === 'KeyM') return 'M';
        if (code === 'KeyP') return 'P';
        if (code === 'Escape') return 'ESC';
        return null;
    }
}
