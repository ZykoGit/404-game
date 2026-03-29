export class Raycaster {
  constructor(map){
    this.map = map;
    this.fov = Math.PI / 3; // 60deg
    this.numRays = 320; // horizontal resolution (tune for performance)
    this.maxDepth = 20;
    this.step = 0.02; // ray march step
  }

  castAll(px, py, dir){
    const rays = [];
    for(let i=0;i<this.numRays;i++){
      const rayScreenPos = (i / this.numRays) - 0.5;
      const rayAngle = dir + rayScreenPos * this.fov;
      const r = this.cast(px, py, rayAngle);
      rays.push(r);
    }
    return rays;
  }

  cast(px, py, angle){
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    let distance = 0;
    let hit = false;
    let hitX = 0, hitY = 0, tile = 0;
    let side = 'vertical'; // which side was hit (vertical/horizontal)
    while(!hit && distance < this.maxDepth){
      distance += this.step;
      const testX = px + cos * distance;
      const testY = py + sin * distance;
      const tx = Math.floor(testX);
      const ty = Math.floor(testY);
      tile = this.map.layout[ty] && this.map.layout[ty][tx];
      if (tile === undefined) { tile = 1; hit = true; hitX = testX; hitY = testY; }
      else if (tile === 1) {
        hit = true;
        hitX = testX;
        hitY = testY;
        // determine side: compare fractional distances to grid lines
        const fx = testX - tx;
        const fy = testY - ty;
        // if fx is closer to 0 or 1 than fy, we likely hit vertical wall
        if (Math.abs(fx - 0.5) > Math.abs(fy - 0.5)) side = 'vertical';
        else side = 'horizontal';
      }
    }
    // compute texture U coordinate (0..1) based on hit fractional position
    let texU = 0;
    if (hit) {
      if (side === 'vertical') {
        texU = hitY - Math.floor(hitY);
      } else {
        texU = hitX - Math.floor(hitX);
      }
      // normalize to 0..1
      texU = texU - Math.floor(texU);
      if (texU < 0) texU += 1;
    }
    return { distance, angle, hitX, hitY, tile, side, texU };
  }

  canSeeTile(px, py, dir, tx, ty){
    const cx = tx + 0.5;
    const cy = ty + 0.5;
    const dx = cx - px;
    const dy = cy - py;
    const angle = Math.atan2(dy, dx);
    const r = this.cast(px, py, angle);
    const distToCenter = Math.hypot(dx, dy);
    return distToCenter < r.distance + 0.1;
  }
}
