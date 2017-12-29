import {Entitiy} from './Entity.js';
import {engine} from './Physics.js';

class Engine {
	constructor() {
		this.entities = [];
		this.morituri = []; 
		this.physics = engine;
	}

	spawn(typeName) {
		var entity = Entity.spawn(typeName);
		this.entities.push(entity);
	}

	update() {
		this.physics.update();
	}
}
