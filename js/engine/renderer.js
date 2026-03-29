export class Renderer {
  constructor(canvas, map){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.map = map;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(){
    // cap DPR to balance sharpness and performance
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(2, Math.max(1, rawDpr)); // 1..2 recommended
    // set backing buffer size
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    // keep CSS size at viewport so layout doesn't change
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    // smoothing for subpixel drawing
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

    // vertical slices (use fractional positions to allow smoothing)
    for(let i=0;i<rays.length;i++){
      const r = rays[i];
      // fish-eye correction
      const corrected = r.distance * Math.cos(r.angle - playerDir);
      const wallHeight = Math.min(h, (1 / Math.max(0.0001, corrected)) * (h/1.5));
      const x = i * sliceW;
      const y = (h - wallHeight) / 2;

      // shade by distance and tile type
      const shade = Math.max(0, 255 - Math.floor(r.distance * 20) - corruption);
      const rCol = Math.floor(shade);
      const gCol = Math.floor(r.tile === 1 ? shade / 1.2 : shade);
      const bCol = Math.floor(r.tile === 1 ? shade / 1.5 : shade / 1.2);
      const color = `rgb(${rCol},${gCol},${bCol})`;

      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, sliceW + 1, wallHeight);

      // subtle procedural static overlay on walls
      if (Math.random() < 0.02 + corruption/500) {
        this.ctx.fillStyle = `rgba(255,255,255,${0.02 + corruption/500})`;
        this.ctx.fillRect(x, y, sliceW + 1, wallHeight);
      }
    }

    // HUD crosshair (scaled to backing buffer)
    this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
    const cx = w / 2;
    const cy = h / 2;
    const ch = Math.max(8, Math.floor(h * 0.01));
    const cw = Math.max(8, Math.floor(w * 0.01));
    this.ctx.fillRect(cx - 1, cy - ch, 2, ch * 2);
    this.ctx.fillRect(cx - cw, cy - 1, cw * 2, 2);
  }
}
