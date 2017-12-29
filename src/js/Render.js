export class Render {
	constructor(parent, w, h) {
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('width', w);
		this.canvas.setAttribute('height', h);
		this.ctx = this.canvas.getContext('2d');
		parent.appendChild(this.canvas);
		//visible portion of the map
		this.viewRectX0 = 0;
		this.viewRectY0 = 0;
		this.viewRectX1 = parseInt(w);
		this.viewRectY1 = parseInt(h);
	}

	draw(image, sx, sy, w, h, wx, wy) {
		this.ctx.drawImage(image, sx, sy, w, h, this.x(wx), this.y(wy), w, h);
	}

	draw2x(image, sx, sy, w, h, wx, wy) {
		this.ctx.drawImage(image, sx, sy, w, h, this.x(wx), this.y(wy), 1.2 * w, 1.2 * h);
	}

	//returns the x coordinate in canvas from the physics world x coordinate
	x(physX) {
		return physX - this.viewRectX0;
	}

	y(physY) {
		return physY - this.viewRectX0;
	}

	getState() {
		return this;
	}
		
}

