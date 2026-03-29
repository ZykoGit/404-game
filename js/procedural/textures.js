// Procedural texture atlas: generates small canvases for each named texture.
// No external assets. Each texture is a canvas you can sample from.
export const TextureAtlas = {
  textures: {},

  // call once to create textures
  init() {
    if (Object.keys(this.textures).length) return;
    this.textures['concrete'] = this._makeConcrete(64);
    this.textures['brick'] = this._makeBrick(64);
    this.textures['static'] = this._makeStatic(64);
    this.textures['floor'] = this._makeFloor(64);
    this.textures['exit'] = this._makeExit(64);
  },

  get(name) {
    this.init();
    return this.textures[name] || this.textures['static'];
  },

  _makeCanvas(size) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    return c;
  },

  _noise(size, intensity = 0.12) {
    const c = this._makeCanvas(size);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const v = Math.floor((Math.random() * 255) * intensity + (255 * (1 - intensity) * 0.5));
      img.data[i * 4 + 0] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  },

  _makeConcrete(size) {
    const c = this._makeCanvas(size);
    const ctx = c.getContext('2d');
    // base gradient
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, '#3a3a3a');
    g.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // overlay noise
    const noise = this._noise(size, 0.25);
    ctx.globalAlpha = 0.25;
    ctx.drawImage(noise, 0, 0);
    ctx.globalAlpha = 1;
    // subtle cracks
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      const sx = Math.random() * size;
      const sy = Math.random() * size;
      ctx.moveTo(sx, sy);
      for (let j = 0; j < 6; j++) {
        ctx.lineTo(sx + (Math.random() - 0.5) * size * 0.3, sy + (Math.random() - 0.5) * size * 0.3);
      }
      ctx.stroke();
    }
    return c;
  },

  _makeBrick(size) {
    const c = this._makeCanvas(size);
    const ctx = c.getContext('2d');
    // brick color
    ctx.fillStyle = '#6b2f2f';
    ctx.fillRect(0, 0, size, size);
    // mortar lines
    ctx.fillStyle = '#2b2b2b';
    const brickH = Math.floor(size / 4);
    for (let y = 0; y < size; y += brickH) {
      ctx.fillRect(0, y + brickH - 2, size, 2);
      // staggered bricks
      const cols = 4;
      const brickW = Math.floor(size / cols);
      for (let x = 0; x < size; x += brickW) {
        const offset = ((y / brickH) % 2) ? brickW / 2 : 0;
        ctx.fillStyle = '#6b2f2f';
        ctx.fillRect((x + offset) % size, y + 2, brickW - 4, brickH - 6);
        ctx.fillStyle = '#2b2b2b';
      }
    }
    // add noise
    const noise = this._noise(size, 0.18);
    ctx.globalAlpha = 0.12;
    ctx.drawImage(noise, 0, 0);
    ctx.globalAlpha = 1;
    return c;
  },

  _makeStatic(size) {
    // high-contrast noise
    const c = this._makeCanvas(size);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const v = Math.random() > 0.5 ? 255 : 0;
      img.data[i * 4 + 0] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  },

  _makeFloor(size) {
    const c = this._makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, size, size);
    const noise = this._noise(size, 0.12);
    ctx.globalAlpha = 0.2;
    ctx.drawImage(noise, 0, 0);
    ctx.globalAlpha = 1;
    return c;
  },

  _makeExit(size) {
    const c = this._makeCanvas(size);
    const ctx = c.getContext('2d');
    // glowing vertical stripes
    const g = ctx.createLinearGradient(0, 0, size, 0);
    g.addColorStop(0, '#0ff');
    g.addColorStop(0.5, '#0ff');
    g.addColorStop(1, '#004');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // add subtle noise
    const noise = this._noise(size, 0.2);
    ctx.globalAlpha = 0.08;
    ctx.drawImage(noise, 0, 0);
    ctx.globalAlpha = 1;
    return c;
  }
};
