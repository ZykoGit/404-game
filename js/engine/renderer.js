export class Renderer {
  constructor(canvas, map){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.map = map;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(){
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.ctx.imageSmoothingEnabled = false;
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
    skyGrad.addColorStop(0, `rgba(${20+corruption},${20},${30},1)`);
    skyGrad.addColorStop(1, '#000');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0,0,w,h/2);

    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0,h/2,w,h/2);

    // vertical slices
    for(let i=0;i<rays.length;i++){
      const r = rays[i];
      // simple fish-eye correction
      const corrected = r.distance * Math.cos(r.angle - playerDir);
      const wallHeight = Math.min(h, (1 / Math.max(0.0001, corrected)) * (h/1.5));
      const x = Math.floor(i * sliceW);
      const y = Math.floor((h - wallHeight) / 2);

      // shade by distance and tile type
      const shade = Math.max(0, 255 - Math.floor(r.distance * 20) - corruption);
      const color = r.tile === 1 ? `rgb(${shade},${shade/1.2},${shade/1.5})` : `rgb(${shade/1.5},${shade},${shade/1.2})`;

      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, Math.ceil(sliceW)+1, Math.ceil(wallHeight));

      // simple static overlay on walls
      if (Math.random() < 0.02 + corruption/500) {
        this.ctx.fillStyle = `rgba(255,255,255,${0.02 + corruption/500})`;
        this.ctx.fillRect(x, y, Math.ceil(sliceW)+1, Math.ceil(wallHeight));
      }
    }

    // optional HUD crosshair
    this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
    this.ctx.fillRect(w/2 - 1, h/2 - 8, 2, 16);
    this.ctx.fillRect(w/2 - 8, h/2 - 1, 16, 2);
  }
}
