import {getSprite} from './Spritesheet.js';

export class Entity {
	constructor(x,y) {	
		this.x = x;
		this.y = y;
		this.w = 0;
		this.h = 0;
		this.currSpriteName = null;
		this.zIndex = 0;
		this.isDead = false;
		this.body = null;
		this.entitiyDef = null;
		//inheriting classes do 'this.body = physics.createBody(entityDef);'
	}

	update() {
		this.x = this.body.GetPosition().x;
		this.y = this.body.GetPosition().y;
	}

	draw() {
		if (this.currSpriteName)
			getSprite(this.currSpriteName).draw(this.x, this.y);
	}
	
	//called by physics engine	
	onTouch(entity,_, impulse) {

	}
}
