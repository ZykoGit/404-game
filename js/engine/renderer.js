import { TextureAtlas } from '../procedural/textures.js';

export class Renderer {
  constructor(canvas, map){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.map = map;
    TextureAtlas.init();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(){
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(2, Math.max(1, rawDpr));
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  clear(){
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
  }

  renderScene(rays, playerDir, corruption=0){
    this.clear();
    const w = this.canvas.width;
    const h = this.canvas.height;
    const sliceW = w / rays.length;

    // sky / floor
    const skyGrad = this.ctx.createLinearGradient(0,0,0,h/2);
    const skyR = Math.min(255, 20 + Math.floor(corruption * 0.6));
    skyGrad.addColorStop(0, `rgba(${skyR},${20},${30},1)`);
    skyGrad.addColorStop(1, '#000');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0,0,w,h/2);

    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0,h/2,w,h/2);

    // draw vertical slices with texture sampling
    for(let i=0;i<rays.length;i++){
      const r = rays[i];
      const corrected = r.distance * Math.cos(r.angle - playerDir);
      const wallHeight = Math.min(h, (1 / Math.max(0.0001, corrected)) * (h/1.5));
      const x = i * sliceW;
      const y = (h - wallHeight) / 2;

      // determine texture name from tile value via map textures mapping
      const tileVal = r.tile || 0;
      const texName = (this.map.textures && this.map.textures[tileVal]) ? this.map.textures[tileVal] : 'static';
      const texCanvas = TextureAtlas.get(texName);
      const texW = texCanvas.width;
      const texH = texCanvas.height;

      // compute source x in texture using texU from ray (0..1)
      const srcX = Math.floor(r.texU * texW);

      // draw a 1px wide column from texture scaled to slice
      // use drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh)
      try {
        this.ctx.drawImage(texCanvas, srcX, 0, 1, texH, x, y, sliceW + 1, wallHeight);
      } catch (e) {
        // fallback: fill with shaded color if drawImage fails
        const shade = Math.max(0, 255 - Math.floor(r.distance * 20) - corruption);
        this.ctx.fillStyle = `rgb(${shade},${shade/1.2},${shade/1.5})`;
        this.ctx.fillRect(x, y, sliceW + 1, wallHeight);
      }

      // subtle static overlay controlled by corruption
      if (Math.random() < 0.01 + corruption/800) {
        this.ctx.fillStyle = `rgba(255,255,255,${0.01 + corruption/800})`;
        this.ctx.fillRect(x, y, sliceW + 1, wallHeight);
      }
    }

    // HUD crosshair
    this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
    const cx = w / 2;
    const cy = h / 2;
    const ch = Math.max(8, Math.floor(h * 0.01));
    const cw = Math.max(8, Math.floor(w * 0.01));
    this.ctx.fillRect(cx - 1, cy - ch, 2, ch * 2);
    this.ctx.fillRect(cx - cw, cy - 1, cw * 2, 2);
  }
}
