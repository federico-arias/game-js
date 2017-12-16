var Map = Class.extend({
    // This is where we store the full parsed
    // JSON of the map.json file.
    jMap: null,

    // tilesets stores each individual tileset
    // from the map.json's 'tilesets' Array.
    // The structure of each entry of this
    // Array is explained below in the
    // parseAtlasDefinition method.
    tilesets: [],

    // This is where we store the width and
    // height of the map in tiles. This is
    // in the 'width' and 'height' fields
    // of map.json, respectively.
    // The values 100 here are just set
    // so these fields are initialized to
    // something, rather than null.
    numXTiles: 100,
    numYTiles: 100,

    // The size of each individual map
    // tile, in pixels. This is in the
    // 'tilewidth' and 'tileheight' fields
    // of map.json, respectively.
    // The values 64 here are just set
    // so these fields are initialized to
    // something, rather than null.
    tilePixelSize: {
        "x": 64,
        "y": 64
    },

    // The size of the entire map,
    // in pixels. This is calculated
    // based on the 'numXTiles', 'numYTiles',
    // and 'tileSize' parameters.
    // The values 64 here are just set
    // so these fields are initialized to
    // something, rather than null.
    pixelSize: {
        "x": 64,
        "y": 64
    },

    // Counter to keep track of how many tile
    // images we have successfully loaded.
    imgLoadCount: 0,

    // Boolean flag we set once our tile images
    // has finished loading.
    fullyLoaded: false,

	//-----------------------------------------
    // Load the json file at the url 'map' into
    // memory. This is similar to the requests
    // we've done in the past using
    // XMLHttpRequests.
    load: function (sMapURL) {

        // Perform an XMLHttpRequest to grab the
        // JSON file at url 'map'.
        var xhr = xhrGet(sMapURL, function (data) {
            // Once the XMLHttpRequest loads, call the
            // parseMapJSON method.
            console.log(xhr.responseText);
            gMap.parseMapJSON(xhr.responseText);
        });
    },

    //-----------------------------------------
    // Parses the map data from 'mapJSON', then
    // stores that data in a number of members
    // of our 'TILEDMapClass' that are defined
    // above.
    parseMapJSON: function (mapJSON) {
        // Call JSON.parse on 'mapJSON' and store
        // the resulting map data
        gMap.jMap = JSON.parse(mapJSON);

        var map = gMap.jMap;
      
        // Set 'numXTiles' and 'numYTiles' from the
        // 'width' and 'height' fields of our parsed
        // map data.
        gMap.numXTiles = map.width;
        gMap.numYTiles = map.height;
      
        // Set the 'tileSize.x' and 'tileSize.y' fields
        // from the 'tilewidth' and 'tileheight' fields
        // of our parsed map data.
        gMap.tilePixelSize.x = map.tilewidth;
        gMap.tilePixelSize.y = map.tileheight;
      
        // Set the 'pixelSize.x' and 'pixelSize.y' fields
        // by multiplying the number of tiles in our map
        // by the size of each tile in pixels.
        gMap.pixelSize.x = gMap.numXTiles * gMap.tilePixelSize.x;
        gMap.pixelSize.y = gMap.numYTiles * gMap.tilePixelSize.y;

        // Loop through 'map.tilesets', an Array...
        for(var i = 0; i < map.tilesets.length; i++) {

            // ...loading each of the provided tilesets as
            // Images...
            var img = new Image();
            img.onload = function () {
                // ...Increment the above 'imgLoadCount'
                // field of 'TILEDMap' as each tileset is 
                // loading...
                gMap.imgLoadCount++;
                if (gMap.imgLoadCount === map.tilesets.length) {
                    // ...Once all the tilesets are loaded, 
                    // set the 'fullyLoaded' flag to true...
                    gMap.fullyLoaded = true;
                }
            };

            // The 'src' value to load each new Image from is in
            // the 'image' property of the 'tilesets'.
            img.src = map.tilesets[i].image;

            // This is the javascript object we'll create for
            // the 'tilesets' Array above. First, fill in the
            // given fields with the corresponding fields from
            // the 'tilesets' Array in 'jMap'.
            var ts = {
                "firstgid": gMap.jMap.tilesets[i].firstgid,

                // 'image' should equal the Image object we
                // just created.

                "image": img,
                "imageheight": gMap.jMap.tilesets[i].imageheight,
                "imagewidth": gMap.jMap.tilesets[i].imagewidth,
                "name": gMap.jMap.tilesets[i].name,

                // These next two fields are tricky. You'll
                // need to calculate this data from the
                // width and height of the overall image and
                // the size of each individual tile.
                // 
                // Remember: This should be an integer, so you
                // might need to do a bit of manipulation after
                // you calculate it.

                "numXTiles": Math.floor(gMap.jMap.tilesets[i].imagewidth / gMap.tilePixelSize.x),
                "numYTiles": Math.floor(gMap.jMap.tilesets[i].imageheight / gMap.tilePixelSize.y)
            };

            // After that, push the newly created object into
            // the 'tilesets' Array above. Javascript Arrays
            // have a handy method called, appropriately, 'push'
            // that does exactly this. It takes the object
            // we'd like to put into the Array as a parameter.
            // 
            // YOUR CODE HERE
            gMap.tilesets.push(ts);
        }
    },

    //-----------------------------------------
    // Grabs a tile from our 'layer' data and returns
    // the 'pkt' object for the layer we want to draw.
    // It takes as a parameter 'tileIndex', which is
    // the id of the tile we'd like to draw in our
    // layer data.
    getTilePacket: function (tileIndex) {

        // We define a 'pkt' object that will contain
        // 
        // 1) The Image object of the given tile.
        // 2) The (x,y) values that we want to draw
        //    the tile to in map coordinates.
        var pkt = {
            "img": null,
            "px": 0,
            "py": 0
        };

        // The first thing we need to do is find the
        // appropriate tileset that we want to draw
        // from.
        //
        // Remember, if the tileset's 'firstgid'
        // parameter is less than the 'tileIndex'
        // of the tile we want to draw, then we know
        // that tile is not in the given tileset and
        // we can skip to the next one.
        var tilesetIndex = 0;
        for(tile = gMap.tilesets.length - 1; tilesetIndex >= 0; tilesetIndex--) {
            if(gMap.tilesets[tilesetIndex].firstgid <= tileIndex) break;
        }

        // Next, we need to set the 'img' parameter
        // in our 'pkt' object to the Image object
        // of the appropriate 'tileset' that we found
        // above.
        pkt.img = gMap.tilesets[tilesetIndex].image;


        // Finally, we need to calculate the position to
        // draw to based on:
        //
        // 1) The local id of the tile, calculated from the
        //    'tileIndex' of the tile we want to draw and
        //    the 'firstgid' of the tileset we found earlier.
        var localIdx = tileIndex - gMap.tilesets[tilesetIndex].firstgid;

        // 2) The (x,y) position of the tile in terms of the
        //    number of tiles in our tileset. This is based on
        //    the 'numXTiles' of the given tileset. Note that
        //    'numYTiles' isn't actually needed here. Think about
        //    how the tiles are arranged if you don't see this,
        //    It's a little tricky. You might want to use the 
        //    modulo and division operators here.
        var lTileX = Math.floor(localIdx % gMap.tilesets[tilesetIndex].numXTiles);
        var lTileY = Math.floor(localIdx / gMap.tilesets[tilesetIndex].numXTiles);

        // 3) the (x,y) pixel position in our tileset image of the
        //    tile we want to draw. This is based on the tile
        //    position we just calculated and the (x,y) size of
        //    each tile in pixels.
        pkt.px = (lTileX * gMap.tilePixelSize.x);
        pkt.py = (lTileY * gMap.tilePixelSize.y);


        return pkt;
    },

    //-----------------------------------------
    // Draws all of the map data to the passed-in
    // canvas context, 'ctx'.
    draw: function (ctx) {
        // First, we need to check if the map data has
        // already finished loading...
        if(!gMap.fullyLoaded) return;

        // ...Now, for every single layer in the 'layers' Array
        // of 'jMap'...
        for(var layerIdx = 0; layerIdx < gMap.jMap.layers.length; layerIdx++) {
            // Check if the 'type' of the layer is "tilelayer". If it isn't, we don't
            // care about drawing it...
            if(gMap.jMap.layers[layerIdx].type != "tilelayer") continue;

            // ...Grab the 'data' Array of the given layer...
            var dat = gMap.jMap.layers[layerIdx].data;

            // ...For each tileID in the 'data' Array...
            for(var tileIDX = 0; tileIDX < dat.length; tileIDX++) {
                // ...Check if that tileID is 0. Remember, we don't draw
                // draw those, so we can skip processing them...
                var tID = dat[tileIDX];
                if(tID === 0) continue;

                // ...If the tileID is not 0, then we grab the
                // packet data using getTilePacket.
                var oTile = gMap.getTilePacket(tID);

                // Now we need to calculate the (x,y) position we want to draw
                // to in our game world.
                //
                // We've performed a similar calculation in 'getTilePacket',
                // think about how to calculate this based on the tile id and
                // various tile properties that our TILEDMapClass has.
                //
                // YOUR CODE HERE
                var x = Math.floor(tileIDX % gMap.numXTiles) * gMap.tilePixelSize.x,
                    y = Math.floor(tileIDX / gMap.numXTiles) * gMap.tilePixelSize.y,
                    w = gMap.tilePixelSize.x,
                    h = gMap.tilePixelSize.y;

                // Now, we're finally drawing the map to our canvas! The 'drawImage'
                // method of our 'ctx' object takes nine arguments:
                //
                // 1) The Image object to draw,
                // 2) The source x coordinate in our Image,
                // 3) The source y coordinate in our Image,
                // 4) The source width of our tile,
                // 5) The source height of our tile,
                // 6) The canvas x coordinate to draw to,
                // 7) The canvas y coordinate to draw to,
                // 8) The destination width,
                // 9) The destination height
                //
                // Note that we don't want to stretch our tiles at all, so the
                // source height and width should be the same as the destination!
                //
                // YOUR CODE HERE
                ctx.drawImage(oTile.img, oTile.px, oTile.py, w, h,
                                         x, y, w, h);
            }
        }
    }

});

var gMap = new Map();
gMap.load('map.json');
ctx = document.getElementById('myCanvas').getContext('2d');
gMap.draw( ctx );
