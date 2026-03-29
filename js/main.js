import { Renderer } from './engine/renderer.js';
import { Raycaster } from './engine/raycaster.js';
import { Input } from './engine/input.js';
import { AudioSys } from './engine/audio.js';
import { MapLoader } from './engine/map.js';
import { GameLoop } from './game/gameLoop.js';
import { EventManager } from './game/events.js';

const canvas = document.getElementById('gameCanvas');

async function boot(){
  const map = await MapLoader.load('./maps/level1.json');
  const renderer = new Renderer(canvas, map);
  const raycaster = new Raycaster(map);
  const input = new Input(canvas);
  const audio = new AudioSys();
  await audio.init();
  const game = new GameLoop({ renderer, raycaster, input, audio, map, eventManager: EventManager });
  game.start();
}

boot().catch(err => {
  console.error('Boot error', err);
  alert('Failed to start. Serve files via a static server (e.g., npx http-server).');
});
