var Box2D = require('box2dweb-commonjs');

var Vec2 = Box2D.b2Vec2;
var BodyDef = Box2D.b2BodyDef;
var Body = Box2D.b2Body;
var FixtureDef = Box2D.b2FixtureDef;
var Fixture = Box2D.b2Fixture;
var World = Box2D.b2World;
var MassData = Box2D.b2MassData;
var PolygonShape = Box2D.b2PolygonShape;
var CircleShape = Box2D.b2CircleShape;
var DebugDraw = Box2D.b2DebugDraw;
var RevoluteJointDef = Box2D.b2RevoluteJointDef;

export class Physics {
	constructor(interval) {
		this.world = new World (new Vec2(0,0), false);
		this.interval = interval;
		this.listen();
	}

	update() {
		//var start = Date.now();
        this.world.Step(this.interval, 10, 10);
        this.world.ClearForces();
        //return(Date.now() - start);
	}


	createBody(entityDef) {
		var bodyDef = new BodyDef();

        var id = entityDef.id;

        if(entityDef.type == 'static') {
            bodyDef.type = Body.b2_staticBody;
        } else {
            bodyDef.type = Body.b2_dynamicBody;
        }

        bodyDef.position.x = entityDef.x;
        bodyDef.position.y = entityDef.y;
		if (entityDef.userData) 
			bodyDef.userData = entityDef.userData;

        var body = this.world.CreateBody(bodyDef);
        var fixtureDefinition = new FixtureDef();

        if(entityDef.useBouncyFixture) {
            fixtureDefinition.density = 1.0;
            fixtureDefinition.friction = 0;
            fixtureDefinition.restitution = 1.0;
        }

        // Now we define the shape of this object as a box
        fixtureDefinition.shape = new PolygonShape();
        fixtureDefinition.shape.SetAsBox(entityDef.halfWidth, entityDef.halfHeight);
        body.CreateFixture(fixtureDefinition);

        return body;
	}

	listen(callback) {
        var listener = new Box2D.Box2D.Dynamics.b2ContactListener();
		listener.PostSolve = function (contact, impulse) {
				var bodyA = contact.GetFixtureA().GetBody();
				var bodyB = contact.GetFixtureB().GetBody();
				var impulse = impulse.normalImpulses[0];
				var a = bodyA ? bodyA.GetUserData().ent : null;
                var b = bodyB ? bodyB.GetUserData().ent : null;
				a.onTouch(b, null, impulse);
				b.onTouch(a, null, impulse);
		};
		this.world.SetContactListener(listener);
	}

	removeBody(body) {
			this.world.DestroyBody(body);
	}

	static goRight() {
		return new Vec2(40,0);
	}

	static goDown() {
		return new Vec2(0,40);
	}

	static goUp() {
		return new Vec2(0,-40);
	}

	static stand() {
		return new Vec2(0,0);
	}

}

