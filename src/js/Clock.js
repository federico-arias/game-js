export class Clock {
	constructor() {
		this.time = Date.now();
		this.minStep = 50; // 50 ms
		this.before = Date.now();
	}

	/*update() {
		//presupposes a tick() call to update time
		var delta = GlobalTimer.time - this.last;
		this.last = GlobalTimer.time;
		return delta ;
	}
	*/
	
	tick() {
		var now = Date.now();
		var delta = now - this.before;
		//time advances no more than 50 ms (minStep)
		this.time += Math.min(this.minStep, delta)
		this.before = now;
		return delta / 1000;
	}

} 

