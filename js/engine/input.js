export class Input {
  constructor(canvas){
    this.canvas = canvas;
    this.keys = {};
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.pitch = 0;
    this.yaw = 0;
    this._bind();
  }

  _bind(){
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);

    this.canvas.addEventListener('click', async () => {
      if (!document.pointerLockElement) this.canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.canvas) {
        document.addEventListener('mousemove', this._onMouse);
      } else {
        document.removeEventListener('mousemove', this._onMouse);
      }
    });

    this._onMouse = (e) => {
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    };
  }

  consumeMouse(){
    const dx = this.mouseDX;
    const dy = this.mouseDY;
    this.mouseDX = 0;
    this.mouseDY = 0;
    return {dx, dy};
  }
}
