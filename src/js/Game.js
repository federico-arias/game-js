export class Game {
	constructor(map, physics, input, clock) {
		this.map = map;
		this.input = input;
		this.physics = physics;
		this.clock = clock;
		this.entities = [];
		this.morituri = [];
	}
	
	start() {
		window.requestAnimationFrame(this.frame.bind(this));
	}

	frame() {
		var delta = this.clock.tick();
		//if more than 0.16 s have elapsed, perform extra updates
		this.update(delta);	
		if (delta > 0.16) { //TODO replace with PHYSICS_INTERVAL
			this.physics.update(delta);	
			delta -= 0.16;
		}
		this.draw(delta);
		window.requestAnimationFrame(this.frame.bind(this));
	}

	updateEntities() {
        for (var i = 0; i < this.entities.length; i++) {
            var ent = this.entities[i];
            if(!ent._killed) {
				ent.update();
			} else {
				this.morituri.push(ent);
			}
        }
        for (var i = 0; i < this.morituri.length; i++) {
			this.entities = this.entities.filter( ent => ent !== this.morituri[i]);
			this.physics.removeBody(this.morituri.body);
        }
		this.morituri = [];
	}

	drawEntities() {
		var fudgeVariance = 128;
		var zIndex_array = [];
		var entities_bucketed_by_zIndex = {};
		this.entities.forEach(function(entity) {
			/*don't draw entities that are off screen
			if(entity.pos.x >= gMap.viewRect.x - fudgeVariance &&
				entity.pos.x < gMap.viewRect.x + gMap.viewRect.w + fudgeVariance &&
				entity.pos.y >= gMap.viewRect.y - fudgeVariance &&
				entity.pos.y < gMap.viewRect.y + gMap.viewRect.h + fudgeVariance) {
			}
			*/
			entity.draw();
		});
	}
}
