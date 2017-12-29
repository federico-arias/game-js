import {GameMap} from './GameMap.js';
import {Game} from './Game.js'; 
import {Render} from './Render.js';
import {Clock} from './Clock.js';
import {Physics} from './Physics.js';
import {Input} from './Input.js';
import {Player} from './PlayerEntity.js';
import {Spritesheet} from './Spritesheet.js';

const PHYSICS_INTERVAL = 1/60; // 0.16 s

var renderer = new Render(document.body, '600', '160');
//TODO no need for a spritesheet class
var ss = new Spritesheet('/assets/spritesheets/spritesheet.png', '/assets/spritesheet.json', renderer)
var map = new GameMap('/assets/atlas.json', renderer);
var physics = new Physics(PHYSICS_INTERVAL);
var input = new Input(renderer);
var player = new Player(12, 12, physics, input);
var clock = new Clock();

class RutaGame extends Game {
	constructor(map, physics, input, clock, player) {
		super(map, physics, input, clock);
		this.entities.push(player);
	}

	update() {
		this.physics.update();
		this.map.update();
		this.updateEntities();
	}

	draw() {
		this.map.draw();
		this.drawEntities();
	}
}

map.ready.then(_ => new RutaGame(map, physics, input, clock, player))
//window.setTimeout(_ => new RutaGame(map, physics, input, clock, player), 6000)
