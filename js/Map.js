define([
  'Meta',
  'CanvasMapLayer',
], function(Meta, CanvasMapLayer){
  const DEFAULT_MAP_ID = "map";
  const DEFAULT_MAP_OPTIONS = {
    center: [45.4295, -75.6972],
    zoom: 4,
    minZoom: 4,
    maxZoom: 10,
    worldCopyJump: true,
    inertia: false
  };

  var mapManager = {
    _map: null,
    tileRendererEvents: [],
    initMap: function initMap(div, options, tileUrl){
      if(div === undefined) div = DEFAULT_MAP_ID;
      if(options === undefined) options = DEFAULT_MAP_OPTIONS;
      if(tileUrl === undefined) tileUrl = Meta.defaultTileUrl;

      this._map = L.map(div, options);
      this.tiles = new L.TileLayer(tileUrl, {})
      this.tiles.addTo(this._map);
      window.leaflet = this._map;
      return this;
    },
    
    createLayer: function createLayer(){
      // this.tiles = new CanvasMapLayer();
      // for(let index = 0; index < this.tileRendererEvents.length; index++){
      //   var event = this.tileRendererEvents[index];
      //   var type = event.type;
      //   var callback = event.callback;
      //   var context = event.context;
      //   this.tiles.on(type, callback, context);
      // }
      // this.tiles.addTo(this._map);
      // this._map.on("zoomend", this.tiles.render, this.tiles);
    },
    on: function on(type, callback, context){
      this._map.on(type, callback, context);
    },
    tileRendererOn: function tileRendererOn(type, callback, context){
      if(this.tiles == null){
        this.tileRendererEvents.push({type: type, callback: callback, context: context});
      }else{
        this.tiles.on(type, callback, context);
      }
    },
    getMap: function getMap(){
      return this._map;
    },
    getSize: function getSize(){
      return this._map.getSize();
    },
    addCanvas: function addCanvas(canvas){
      var canvasPane = this._map.getPane('canvas');
      if(!canvasPane){
        canvasPane = this._map.createPane('canvas');
      }

      canvasPane.appendChild(canvas);
    },
    setCursor: function setCursor(cursor){
      this._map._container.style.cursor = cursor;
    },
    getCenter: function getCenter(){
      return this._map.getCenter();
    }
  };
  
  return mapManager;
});