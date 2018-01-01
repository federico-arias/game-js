import {GameMap} from './GameMap.js';
import {Game} from './Game.js'; 
import {Render} from './Render.js';
import {Clock} from './Clock.js';
import {Physics} from './Physics.js';
import {Input} from './Input.js';
import {Player} from './PlayerEntity.js';
import {Spritesheet} from './Spritesheet.js';

const PHYSICS_INTERVAL = 1/60; // 0.16 s
//var renderer = new Render(document.getElementById('plan-de-carrera'), '600', '160');
var renderer = new Render(document.body, '600', '160');
var ss = new Spritesheet('/assets/spritesheets/spritesheet.png', '/assets/spritesheet.json', renderer) 
var map = new GameMap('/assets/atlas.json', renderer);
var physics = new Physics(PHYSICS_INTERVAL);
var input = new Input();
var player = new Player(220, 370, physics, input);
var clock = new Clock();

class RutaGame extends Game {
	constructor(map, physics, input, clock, player, renderer) {
		super(map, physics, input, clock);
		this.render = renderer;
		this.entities.push(player);
		this.player0 = player;
		this.start();
	}

	update() {
		this.physics.update();
		this.map.update();
		this.updateEntities();
		if (this.player0.y - this.render.viewRectY0 < 30) 
			this.render.moveUp(this.player0.speed);
	}

	draw() {
		this.map.draw();
		this.drawEntities();
	}
}

Promise.all([map.ready, ss.ready])
	   .then(_ => new RutaGame(map, physics, input, clock, player, renderer));
