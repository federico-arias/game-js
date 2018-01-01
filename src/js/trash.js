
			/*
			for (let tileIDX = 0; tileIDX < dat.length; tileIDX++) {
				let tID = dat[tileIDX];
				if (tID == 0) continue;
				//figure out the position of small tile in the world
				let worldX = Math.floor(tileIDX % layer.width) * this.tileW;
				let worldY = Math.floor(tileIDX / layer.width) * this.tileH;
				//figure out if the megatile rectangle intersects with the small tile
				var visible = GameMap.areIntersecting(y0, worldY, 
					y1, worldY + layer.tileheight,
					x0, worldX,
					x1, worldX + layer.tilewidth);
				if(!visible) continue;
				let tile = this.findTileset(tID).findTile(tID);
				tile.img.then ( _ => {
					ctx2.drawImage(tile.i,
						tile.x, tile.y,
						this.tileW, this.tileH,
						worldX - x0, // tiles are drawn in 
						worldY - y0, // rect (0, 0) , (mtile.w, mtile.h) canvas
						this.tileW, this.tileH);
				});
			}
			*/
