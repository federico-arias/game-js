import {GameMap} from './GameMap.js';

var canvas = document.createElement('canvas');
canvas.setAttribute('width', '1000px');
canvas.setAttribute('height', '300px');
document.body.appendChild(canvas);

var map = new GameMap('/json/mapa.json', canvas.getContext('2d'));

