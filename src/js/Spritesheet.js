import {get} from './fetch.js';

export class Spritesheet {
	constructor(imgUri, jsonUri, renderer) {
		this.render = renderer;
		var json = get(jsonUri);
		this.img = new Image();
		this.img.src = imgUri;
		this.p = new Promise(r => this.img.onload = _ => r(_));
		this.ready = Promise.all([this.p, json])
			.then(this.parseSpritesheet.bind(this));
	}

	parseSpritesheet(json) {
		var sprites = json[1].frames;
		var l = sprites.length;
		for (var i=0;i<l;i++) {
			var sprite = sprites[i];
			var name = sprite.filename.match(/([^/]+$)/)[0];
			spriteDict[name] = new Sprite({
				name: name,
				w:  sprite.spriteSourceSize.w,
				h: sprite.spriteSourceSize.h,
				hh: sprite.spriteSourceSize.h/2,
				hw: sprite.spriteSourceSize.w/2,
				spriteX: sprite.frame.x,
				spriteY: sprite.frame.y,
				sheet: this.img,
				rdr: this.render
			});
		}
	}
}

export class SpriteNamesIterable {
	constructor(name, first, last, single) {
		this.speed = 1.0;
		this.last = last;
		this.sprites = [];
		this.single = single;
		for (;first < last + 1; first++) {
			this.sprites.push(name + first + '.png');
		}
	}

	__iter__(speed) {
		//if (this.single) return {next: _ => this.sprites[0]};
		speed = speed || 0.2;
		var idx = 0;
		var self = this;
		var upperBound = self.last;
		return {
			next: function() {
				//idx = idx % upperBound; //if idx equals upperBound, idx = 0
				idx = idx + speed;	
				idx = idx >= upperBound ? 0 : idx;
				return self.sprites[Math.floor(idx)];
			}
		}
	}
}

class Sprite {
	constructor(defaults) {
		this.name = null;
		this.spriteX = null;
		this.spriteY = null;
		this.sheet = null;
		this.hw = null;
		this.hh = null;
		this.w = null;
		this.h = null;
		var self = this;
		Object.keys(defaults).forEach( function(opt) {
			if (defaults.hasOwnProperty(opt)) self[opt] = defaults[opt];
		});
	}
	
	draw(x, y) {
		this.rdr.draw(this.sheet, this.spriteX, this.spriteY, this.w, this.h,
			x - this.hw, 
			y - this.hh);
	}
}

let spriteDict = {};

export const getSprite = function (name) {
	return spriteDict[name];	
}
