import { Player } from './player.js';
import { MapLoader } from '../engine/map.js';

export class GameLoop {
  constructor({ renderer, raycaster, input, audio, map, eventManager }){
    this.renderer = renderer;
    this.raycaster = raycaster;
    this.input = input;
    this.audio = audio;
    this.map = map;
    this.eventManager = eventManager;
    this.player = new Player(map);
    this.last = performance.now();
    this.running = false;
    this.world = {
      onChaseStart: () => { this.chase = { active:true, speed: 1.6 }; }
    };
    this.eventManager.init({ audio: this.audio, world: this.world });
    this.chase = { active:false };
  }

  start(){
    this.running = true;
    requestAnimationFrame(this._tick.bind(this));
  }

  _tick(now){
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this._update(dt);
    this._render();
    if (this.running) requestAnimationFrame(this._tick.bind(this));
  }

  _update(dt){
    // input -> player
    const {keys} = this.input;
    const moveSpeed = this.player.speed * dt;
    const turnSpeed = 0.003 * dt * 1000;
    const m = {x:0,y:0};
    if (keys['w']) { m.x += Math.cos(this.player.dir) * moveSpeed; m.y += Math.sin(this.player.dir) * moveSpeed; }
    if (keys['s']) { m.x -= Math.cos(this.player.dir) * moveSpeed; m.y -= Math.sin(this.player.dir) * moveSpeed; }
    if (keys['a']) { m.x += Math.cos(this.player.dir - Math.PI/2) * moveSpeed; m.y += Math.sin(this.player.dir - Math.PI/2) * moveSpeed; }
    if (keys['d']) { m.x += Math.cos(this.player.dir + Math.PI/2) * moveSpeed; m.y += Math.sin(this.player.dir + Math.PI/2) * moveSpeed; }
    this.player.move(m.x, m.y);

    // mouse look
    const mdelta = this.input.consumeMouse();
    this.player.dir += mdelta.dx * 0.002;

    // tile triggers
    const tx = Math.floor(this.player.x);
    const ty = Math.floor(this.player.y);
    const trigger = MapLoader.triggerAt(this.map, tx, ty);
    if (trigger && !trigger.used) this.eventManager.fireTrigger(this.map, trigger);

    // sight-based chase: if player can see exit tile center, start chase
    if (!this.eventManager.chaseActive){
      const ex = Math.floor(this.map.exit[0]);
      const ey = Math.floor(this.map.exit[1]);
      if (this.raycaster.canSeeTile(this.player.x, this.player.y, this.player.dir, ex, ey)){
        this.eventManager.handlers['chase_start']();
      }
    }

    // audio update: feed position and corruption
    this.audio.update(this.player.x, this.player.y, this.eventManager.corruption);
  }

  _render(){
    const rays = this.raycaster.castAll(this.player.x, this.player.y, this.player.dir);
    this.renderer.renderScene(rays, this.player.dir, this.eventManager.corruption);
  }
}
