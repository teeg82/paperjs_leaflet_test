define([
  'Map',
  'Meta'
], function(Map, Meta){
  var opacityAnimation = function(){
    if(this.opacity < 1){
      this.opacity += 0.1;
    }else{
      this.detach("onFrame", opacityAnimation);
    }
  };
  
  var CanvasMapLayer = L.TileLayer.extend({
    layerId: "map",
    layer: null,
    rasterTileLayer: null,
    measurementLayer: null,
    tileLayer: null,
    renderedOnce: null,
    tileCount: 0,
    initialize: function init(options){
      L.TileLayer.prototype.initialize.call(this, Meta.defaultTileUrl, options);
      
      // this._url = Meta.defaultTileUrl;

      this.layer = new paper.Layer({name: this.layerId});
      this.layer.sendToBack();

      this.rasterTileLayer = new paper.Layer({name: "rasterTileLayer"});
      this.layer.addChild(this.rasterTileLayer);

      this.measurementLayer = new paper.Layer({name: "measurementLayer"});
      this.layer.addChild(this.measurementLayer);
    },
    onAdd: function onAdd(){
      this._map.on("zoomstart", this.clear, this);
      this.on('tileload', this.onTileLoad, this);
      L.TileLayer.prototype.onAdd.call(this);
    },
    getLayerId: function getLayerId(){
      return this.layerId;
    },
    _addTile: function(coords, container){
      // Overriding the container argument, which is normally a DOM object, so we can hook in some special actions
      L.TileLayer.prototype._addTile.call(this, coords, this);
    },
    appendChild: function appendChild(tile){
      // Overriding this function so leaflet doesn't try to append our non-DOM image object
    },
    clear: function clear(){
      this.rasterTileLayer.removeChildren();
      this.measurementLayer.removeChildren();
    },
    render: function render(){
      console.log("repositioning map tiles...");
      for(var i = 0; i < this.rasterTileLayer.children.length; i++){
        var child = this.rasterTileLayer.children[i];
        var coords = child.data.coords;
        var position = this._getTilePos(coords).add(this.getTileSize().divideBy(2));
        child.position = position;
      }
    },
    onTileLoad: function onTileLoadStart(tileInfo){
      var tileImage = tileInfo.tile;
      // var tilePosition = tileImage._leaflet_pos;
      var tilePosition = this._getTilePos(tileInfo.coords);

      var rasterTile = new paper.Raster(tileImage);
      rasterTile.position = tilePosition.add(this.getTileSize().divideBy(2));
      rasterTile.name = this._tileCoordsToKey(tileInfo.coords);
      rasterTile.data.coords = tileInfo.coords
      rasterTile.opacity = 0;
      rasterTile.onFrame = opacityAnimation;

      this.rasterTileLayer.addChild(rasterTile);
    }
  });
  return CanvasMapLayer;
});