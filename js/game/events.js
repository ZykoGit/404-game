import { MapLoader } from '../engine/map.js';

export const EventManager = {
  triggered: new Set(),
  corruption: 0,
  handlers: {},

  init({audio, world}){
    this.audio = audio;
    this.world = world;
    this.handlers = {
      'jumpscare': (t) => this._jumpscare(t),
      'whisper': (t) => this._whisper(t),
      'chase_start': () => this._startChase()
    };
  },

  fireTrigger(map, trigger){
    if (!trigger || trigger.used) return;
    const id = trigger.id;
    if (this.triggered.has(id)) return;
    this.triggered.add(id);
    trigger.used = true;
    const handler = this.handlers[trigger.type];
    if (handler) handler(trigger);
    this._increaseCorruption(8);
  },

  _increaseCorruption(n){
    this.corruption = Math.min(100, this.corruption + n);
    const el = document.getElementById('corruptionVal');
    if (el) el.textContent = this.corruption;
  },

  _jumpscare(t){
    // visual flash via overlay
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    overlay.style.background = 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.95), rgba(255,255,255,0.0) 40%)';
    overlay.style.opacity = '1';
    this.audio.playJumpscare();
    setTimeout(()=> overlay.classList.add('hidden'), 400);
  },

  _whisper(t){
    this.audio.playWhisper();
  },

  _startChase(){
    if (this.chaseActive) return;
    this.chaseActive = true;
    this._increaseCorruption(20);
    this.audio.startChase();
    // world should handle spawning pursuer; we signal it
    if (this.world && this.world.onChaseStart) this.world.onChaseStart();
  }
};
