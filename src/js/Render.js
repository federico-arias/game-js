export class Render {
	constructor(parent, w, h) {
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('width', w + 'px');
		this.canvas.setAttribute('height', h + 'px');
		this.ctx = this.canvas.getContext('2d');
		parent.appendChild(this.canvas);
		//visible portion of the map
		this.viewRectX0 = 0;
		this.viewRectY0 = 480;
		this.viewRectX1 = parseInt(w);
		this.viewRectY1 = parseInt(h);
	}

	moveUp(y) {
		this.viewRectY0 -= y;
	}

	draw(image, sx, sy, w, h, wx, wy) {
		this.ctx.drawImage(image, sx, sy, w, h, this.x(wx), this.y(wy), w, h);
	}

	drawIn(image, dx, dy) {
		this.ctx.drawImage(image, this.x(dx), this.y(dy));
	}

	draw2x(image, sx, sy, w, h, wx, wy) {
		this.ctx.drawImage(image, sx, sy, w, h, this.x(wx), this.y(wy), 1.2 * w, 1.2 * h);
	}

	//returns the x coordinate in canvas from the world x coordinate
	x(worldX) {
		return worldX - this.viewRectX0;
	}

	y(worldY) {
		return worldY - this.viewRectY0;
	}

	getState() {
		return this;
	}
		
}

