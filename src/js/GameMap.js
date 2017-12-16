import {get} from './fetch.js';
import Promise from 'promise-polyfill';

export class GameMap {
	constructor(jsonPath, ctx) {
		this.tiles = {};
		this.tilesets = [];
		this.ctx = ctx;
		this.mapa = get(jsonPath)
			.then( m => {this.w = m.tilewidth;this.h=m.tileheight; return m});
		this.mapa.then(this.parseTilesets.bind(this));
		this.mapa.then(this.parseLayer.bind(this));
	}

	parseTilesets(mapa) {
		mapa.tilesets.forEach( ts => this.tilesets.push(new Tileset(ts)));
	}

	parseLayer(mapa) {
		mapa.layers.forEach(this.drawData.bind(this));
	}

	drawData(layer) {
		var cols = layer.width;
		layer.data.forEach( (d,i) => {
			var tile = this.findTile(d);
			if (tile !== null)
			this.drawTile(tile, this._getMatrix(i, cols));
		});
	}

	_getMatrix(idx, ncols) {
		return {
			x:(idx % ncols) * this.w,
			y:Math.floor(idx / ncols) * this.h,
			w:this.w,
			h:this.h
		};
	}

	findTile(gid) {
		if (gid === 0) return null;
		return this.tilesets.filter( ts => ts.fgid <= gid && gid < ts.max)[0].findTile(gid);
	}

	drawTile(tile, coor) {
		tile.img.then( img => {
			this.ctx.drawImage(img, tile.x, tile.y, tile.w, tile.h, coor.x, coor.y, coor.w, coor.h)
		}
		)
	}
}

class Tileset {
	constructor(tileset) {
		var self = this;
		this.tiles = {};
		this.fgid = tileset.firstgid;
		this.cols = tileset.columns;
		this.max = tileset.tilecount;
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
				img:this.p
			};
		}
		return this.tiles[gid];
	}
}

