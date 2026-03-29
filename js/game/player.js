export class Player {
  constructor(map){
    this.map = map;
    this.x = map.spawn[0];
    this.y = map.spawn[1];
    this.dir = -Math.PI/2; // facing up
    this.speed = 2.2; // units per second
  }

  move(dx, dy){
    // simple collision: test new position against walls
    const nx = this.x + dx;
    const ny = this.y + dy;
    if (this._isWalkable(nx, this.y)) this.x = nx;
    if (this._isWalkable(this.x, ny)) this.y = ny;
  }

  _isWalkable(px, py){
    const tx = Math.floor(px);
    const ty = Math.floor(py);
    const tile = this.map.layout[ty] && this.map.layout[ty][tx];
    return tile !== 1;
  }
}
