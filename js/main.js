// js/main.js
import { Renderer } from './engine/renderer.js';
import { Raycaster } from './engine/raycaster.js';
import { Input } from './engine/input.js';
import { AudioSys } from './engine/audio.js';
import { MapLoader } from './engine/map.js';
import { GameLoop } from './game/gameLoop.js';
import { EventManager } from './game/events.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const audio = new AudioSys();
const map = await MapLoader.load('/maps/level1.json');

const game = new GameLoop({ renderer, input, audio, map, eventManager: EventManager });
game.start();
