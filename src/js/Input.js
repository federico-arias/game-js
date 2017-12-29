export class Input {
	constructor(render) {
		this.bindings = {};
		this.actions = {};
		this.setBinding('w', 'move-up');
		this.setBinding('a', 'move-left');
		this.setBinding('s', 'move-down');
		this.setBinding('d', 'move-right');
		var c = render.canvas;
		document.addEventListener('keydown', this.onKeyDown.bind(this));
		document.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	onKeyDown(ev) {
		var action = this.bindings[ev.key];
		if (typeof action != 'undefined')
			this.actions[action] = true;
	}

	onKeyUp(ev) {
		var action = this.bindings[ev.key];
		if (action)  this.actions[action] = false;
	}

	getState() {
		return this.actions;	
	}

	getStateName() {
		return Object.keys(this.actions).filter(action => this.actions[action])[0];
	}

	setBinding(key, action) {
		this.bindings[key] = action;
	}
}

