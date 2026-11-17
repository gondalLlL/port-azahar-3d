export class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { left: false, x: 0, y: 0, clicked: false };
    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyM') {
        window.dispatchEvent(new CustomEvent('toggle-audio'));
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.left = true;
        this.mouse.clicked = true;
        window.dispatchEvent(new CustomEvent('user-gesture'));
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.left = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  isDown(code) {
    return !!this.keys[code];
  }

  consumeClick() {
    const clicked = this.mouse.clicked;
    this.mouse.clicked = false;
    return clicked;
  }
}
