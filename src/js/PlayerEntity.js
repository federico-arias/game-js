import {Entity} from './Entity.js';
import {SpriteNamesIterable} from './Spritesheet.js';
import {Physics} from './Physics.js';

export class Player extends Entity {
	constructor (x, y, physics, input) {
		super(x, y)
		//defaults for this entity
		this.input = input;
		this.speed  = 1.0;
		this.lifetime = 3;
		this.isMoving = false;
		this.physics = physics;

		var entity = this;

        var entityDef = {
            id: 'Player',
            x: x,
            y: y,
            halfHeight: 16 * 0.5,
            halfWidth: 16 * 0.5,
            categories: ['player'],
            userData: {
                "id": 'Player',
                "ent": entity
            }
        };
        this.body = this.physics.createBody(entityDef);

		var walk = new SpriteNamesIterable('BossWalking_0', 1, 4);
		this.walkRightAnimation = walk.__iter__.bind(walk)();
		this.walkLeftAnimation = walk.__iter__.bind(walk)();
		this.currSpriteNamesIterator = this.walkRightAnimation;
		this.currSpriteName = this.currSpriteNamesIterator.next();
	}

    kill() {
        // Remove my physics body
        this.physics.removeBody(this.body);
        this.body = null;

        // Destroy me as an entity
        this._killed = true;
    }

	update() {
		this.x = this.body.GetPosition().x;
		this.y = this.body.GetPosition().y;
		this.isMoving = true;
		switch (this.input.getStateName()) {
			case 'move-right':
				this.currSpriteNamesIterator = this.walkRightAnimation;
				this.body.SetLinearVelocity(Physics.goRight());
				break;
			case 'move-down':
				this.currSpriteNamesIterator = this.walkRightAnimation;
				this.body.SetLinearVelocity(Physics.goDown());
				break;
			case 'move-up':
				this.currSpriteNamesIterator = this.walkRightAnimation;
				this.body.SetLinearVelocity(Physics.goUp());
				break;
			default:
				this.isMoving = false;
				this.body.SetLinearVelocity(Physics.stand());
		}
		//move iterator forward
		if (this.isMoving) 
			this.currSpriteName = this.currSpriteNamesIterator.next();
	}

	onTouch(otherBody, point, impulse) {
        if(!this.body) return false;
        if(!otherBody.GetUserData()) return false;

        var physOwner = otherBody.GetUserData().ent;
        
        if (physOwner !== null) {
            if(physOwner._killed) return false;
            this.markForDeath = true;
        }

        return true;
    }
}
