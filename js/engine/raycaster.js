export class Raycaster {
  constructor(map){
    this.map = map;
    this.fov = Math.PI / 3; // 60deg
    this.numRays = 160; // vertical slices
    this.maxDepth = 20;
  }

  castAll(px, py, dir){
    const rays = [];
    const halfFov = this.fov / 2;
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
    while(!hit && distance < this.maxDepth){
      distance += 0.05;
      const testX = px + cos * distance;
      const testY = py + sin * distance;
      const tx = Math.floor(testX);
      const ty = Math.floor(testY);
      tile = this.map.layout[ty] && this.map.layout[ty][tx];
      if (tile === undefined) { tile = 1; hit = true; }
      else if (tile === 1) { hit = true; hitX = testX; hitY = testY; }
    }
    return { distance, angle, hitX, hitY, tile };
  }

  canSeeTile(px, py, dir, tx, ty){
    // cast a single ray to center of tile
    const cx = tx + 0.5;
    const cy = ty + 0.5;
    const dx = cx - px;
    const dy = cy - py;
    const angle = Math.atan2(dy, dx);
    const r = this.cast(px, py, angle);
    // if distance to tile center is less than hit distance + small epsilon, visible
    const distToCenter = Math.hypot(dx, dy);
    return distToCenter < r.distance + 0.1;
  }
}
