import {get} from './fetch.js';
//import Promise from 'promise-polyfill';

export class GameMap {
	constructor(jsonPath, render) {
		this.megaTilesArray = [];
		this.MEGATILE_W = 150;
		this.MEGATILE_H = 150;
		this.viewRectX0 = render.viewRectX0;
		this.viewRectY0 = render.viewRectY0;
		this.viewRectX1 = render.viewRectX1;
		this.viewRectY1 = render.viewRectY1;
		this.render = render;
		this.tiles = {};
		this.tilesets = [];
		this.mapa = get(jsonPath)
			.then( m => {
				this.tileW = m.tilewidth;
				this.tileH = m.tileheight; 
				this.layers = m.layers;
				this.w = m.tilewidth * m.width;
				this.h = m.tileheight * m.height;
				return m;
			});
		this.ready = this.mapa.then(this.parseTilesets.bind(this))
							  .then(this.cacheMegaTiles.bind(this));
	}

	cacheMegaTiles() {
		const nMegaTilesInX = 1 + Math.floor(this.w / this.MEGATILE_W);
		const nMegaTilesInY = 1 + Math.floor(this.h /this.MEGATILE_H);
		const nMegaTiles  = nMegaTilesInX * nMegaTilesInY;

		for(var yC = 0; yC < nMegaTilesInY; yC++) {
			for(var xC = 0; xC < nMegaTilesInX; xC++) {
				var mTile = new MegaTile(this.MEGATILE_W, this.MEGATILE_H);
				mTile.x = xC * mTile.w;
				mTile.y = yC * mTile.h;
				//draw this region of the map into this canvas
				this.fillMegaTile(mTile);
				this.megaTilesArray.push(mTile);
			}
		}
	}

	fillMegaTile(mtile) {
		var ctx2 = mtile.ctx;
		//clear the tile itself
		//ctx2.fillRect(0,0,mtile.w, mtile.h);
		//rect coordinates of megatile relative to world-space
		var x0 = mtile.x;
		var y0 = mtile.y;
		var x1 = mtile.x + mtile.w;
		var y1 = mtile.y + mtile.h;
		//for each layer...
		this.layers.reduce( (acc, layer, i) => {
			if (layer.type == 'imagelayer') { 
				/*
				if (layer.offsetx > mtile.w  + mtile.x) return acc;
				if (layer.offsetx + layer.w < mtile.x) return acc;
				if (layer.offsety > mtile.h  + mtile.y) return acc;
				if (layer.offsety + layer.h < mtile.y) return acc;
				*/
				var img = new Image();
				img.src = '/assets/tilesets/' +  layer.image.match(/\/([^\/]+)\/?$/)[1];
				return acc.then( _ => new Promise( r => img.onload = () => r(img) ))
					.then( img =>ctx2.drawImage(img, layer.offsetx - x0, layer.offsety - y0));
			}
			if (layer.type != "tilelayer") return acc;
			var dat = layer.data;
			//...find the small tile position for each tile and draw them 
			return acc.then( _ => dat.reduce( (acc, tId, i, a) => {
				if (tId == 0) return acc;
				//figure out the position of small tile in the world
				let worldX = Math.floor(i % layer.width) * this.tileW;
				let worldY = Math.floor(i / layer.width) * this.tileH;
				//figure out if the megatile rectangle intersects with the small tile
				var visible = GameMap.areIntersecting(y0, worldY, 
					y1, worldY + layer.tileheight,
					x0, worldX,
					x1, worldX + layer.tilewidth);
				if(!visible) return acc;
				let tile = this.findTileset(tId).findTile(tId);
				return acc.then( _ => tile.img.then( _ => ctx2.drawImage(tile.i,
					tile.x, tile.y,
					this.tileW, this.tileH,
					worldX - x0, // tiles are drawn in 
					worldY - y0, // rect (0, 0) , (mtile.w, mtile.h) canvas
					this.tileW, this.tileH)));
			}, Promise.resolve('first'), this));
		}, Promise.resolve('first'), this)
	}

	parseTilesets(mapa) {
		mapa.tilesets.forEach( ts => this.tilesets.push(new Tileset(ts)));
		//order from biggest to smallest
		this.tilesets = this.tilesets.sort( (a, b) => a.fgid - b.fgid);
		return mapa;
	}

	static areIntersecting(top0, top1, bottom0, bottom1, left0, left1, right0, right1) {
		return !(left1 > right0 || 
           right1 < left0 || 
           top1 > bottom0 ||
           bottom1 < top0);
	}

	update() {
		this.viewRectX0 = this.render.viewRectX0;
		this.viewRectY0 = this.render.viewRectY0;
		this.viewRectX1 = this.render.viewRectX1;
		this.viewRectY1 = this.render.viewRectY1;
	}

	onmapdraw() {
		for(var q =0; q < this.megaTilesArray.length; q++) {
			var mtile = this.megaTilesArray[q];
			//TODO this is wrong
			if(mtile.isVisibleIn(this))
				this.render.drawIn(mtile.canvas, mtile.x, mtile.y);
		}
	}

	draw() {
		this.onmapdraw();
		
		/*
		this.layers.forEach( layer => {
			if (layer.type !== 'tilelayer') return;
			var cols = layer.width;
			layer.data.forEach( (d,i) => {
				var worldX = (i % cols) * this.tileW;
				var worldY = Math.floor(i / cols) * this.tileH;
				if (worldX + this.tileW < this.viewRectX0 ||
					worldY + this.tileH < this.viewRectY0 ||
					worldX > this.viewRectX1 ||
					worldY > this.viewRectY1) return; 
				var tileset = this.findTileset(d);
				if (tileset !== null) {
					var tile = tileset.findTile(d);
					tile.img
						.then(img => this.render.draw(img, tile.x, tile.y, 
										tile.w, tile.h, worldX, worldY));
				}
			}, this);
		}, this);
		
		*/
	
	}

	findTileset(gid) {
		if (gid === 0) return null;
		var idx = this.tilesets.length - 1;
		while (this.tilesets[idx].fgid > gid) {
			idx--;
		}
		return this.tilesets[idx];
	}
}

class MegaTile {
	constructor(width, height) {
		this.x = -1;
		this.y = -1;
		this.w = width;
		this.h = height;
		//create a brand new canvas object, which is NOT attached to the dop
		var can2 = document.createElement('canvas');
		can2.width = width;
		can2.height = height;
		this.canvas = can2;
		this.ctx = can2.getContext('2d');
	}
	
	isVisibleIn(r2) {
		var r1 = this;
		return GameMap.areIntersecting(r1.y, r2.y, 
									   r1.x, r2.x,
									   r1.x + r1.w, r2.x + r2.w,
									   r1.y + r1.h, r2.y + r2.h);
	}

}

class Tileset {
	constructor(tileset) {
		var self = this;
		this.tiles = {};
		this.fgid = tileset.firstgid;
		this.cols = tileset.columns;
		//this.max = tileset.tilecount;
		this.wFactor = tileset.tilewidth;
		this.hFactor = tileset.tileheight;
		this.img = new Image();
		this.img.src = '/assets/tilesets/' + tileset.image.match(/\/([^\/]+)\/?$/)[1];
		this.p = new Promise( r => self.img.onload = () => r(self.img))
	}

	findTile(gid) {
		if(this.tiles[gid] === undefined) {
			var n = gid - this.fgid;
			this.tiles[gid] = {
				x: (n % this.cols) * this.wFactor,
				y: Math.floor(n / this.cols) * this.hFactor,
				w: this.wFactor,
				h: this.hFactor,
				img:this.p,
				id:gid,
				i:this.img
			};
		}
		return this.tiles[gid];
	}
}

