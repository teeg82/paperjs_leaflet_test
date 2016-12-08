// const DEFAULT_TILE_URL = 'https://www.cfps.halc/static/tiles/base/{z}/{x}/{y}.png';
const DEFAULT_TILE_URL = 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_MAP_ID = "map";
const DEFAULT_MAP_OPTIONS = {
    center: [47.505, -40.09],
    zoom: 4,
    minZoom: 4,
    maxZoom: 10,
    worldCopyJump: true
};


const CONDITIONS = ['IB', 'IC', 'IV', 'MB', 'MC', 'MV', 'VC', 'VU', 'NULL'];
const CHANCE_SIGNIFICANT = 0.1;
const METAR_COUNT = 1000;
const TAF_COUNT = 1000;
const NORTH_EAST = {lat: 71.41317683396566, lng: -19.16015625};
const SOUTH_WEST = {lat: 26.509904531413927, lng: -187.11914062500003};


var metars = [];
var tafs = [];
function createBulletins(){
  var createBulletin = function(type, id){
    var randomLat = Math.random() * (NORTH_EAST.lat - SOUTH_WEST.lat) + SOUTH_WEST.lat;
    var randomLng = Math.random() * (NORTH_EAST.lng - SOUTH_WEST.lng) + SOUTH_WEST.lng;
    return {
      id: type + '_' + id,
      condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
      significant: Math.random() <= CHANCE_SIGNIFICANT,
      wind_direction: Math.floor(Math.random() * 361),
      wind_speed: Math.floor(Math.random() * 201),
      lat: randomLat,
      lng: randomLng
    };
  };

  for(var index = 0; index < METAR_COUNT; index++){
    metars.push(createBulletin('metar', index));
  }

  for(var index = 0; index < TAF_COUNT; index++){
    tafs.push(createBulletin('taf', index));
  }
  
  //45.4215° N, 75.6972° W
  metars.push({
    id: 'metar_' + (METAR_COUNT+1),
    condition: 'IB',
    significant: false,
    wind_direction:45,
    wind_speed: 90,
    lat: 45.4215,
    lng: -75.6972
  });
};

window.onload = function(){
  var icons = {};
  function initImages(){
    var images = document.querySelectorAll("div#icons > img");
    for(let index = 0; index < images.length; index++){
      var image = images[index];
      icons[image.id] = image;
    }
  };

  var map = null;
  function initMap(div, options){
    if(div === undefined) div = DEFAULT_MAP_ID;
    if(options === undefined) options = DEFAULT_MAP_OPTIONS;
    map = L.map(div, options);
    window.leaflet = map;
    var tiles = L.tileLayer(DEFAULT_TILE_URL, {})
    tiles.addTo(map);
    map.on('viewreset', canvasReset, this);
    map.on('move', canvasReset, this);
    map.on('resize', canvasReset, this);
    map.on('zoomend', drawBulletins)
  };


  var project1;
  var project1;
  var panStart = null;
  var mapMiddle = null;
  var project1ImageData = null;
  var project2ImageData = null;
  function initPaper(){
    var mapSize = map.getSize();
    var canvas1 = paper.createCanvas(mapSize.x, mapSize.y);
    var canvas2 = paper.createCanvas(mapSize.x, mapSize.y);
    canvas1.setAttribute("resize", true);
    canvas2.setAttribute("resize", true);

    canvas1.style.position = 'absolute';
    canvas1.style.top = 0;
    canvas1.style.left = 0;
    canvas1.setAttribute('id', 'canvas1');

    canvas2.style.position = 'absolute';
    canvas2.style.top = 0;
    canvas2.style.left = 0;
    canvas2.setAttribute('id', 'canvas2');
    
    if (!map._panes.staticPane) {
      map._panes.staticPane = map.createPane('leaflet-tile-pane', map._container);
      map._panes.staticPane.className += ' canvas-div';
    }

    map._panes.staticPane.appendChild(canvas1);
    map._panes.staticPane.appendChild(canvas2);

    project1 = new paper.Project(canvas1);
    project2 = new paper.Project(canvas2);
    
    var tool = new paper.Tool();
    tool.minDistance = 0;
    tool.onMouseDown =  function (event) {
      panStart = event.point;
      var center = leaflet.getCenter();
      mapMiddle = new paper.Point(leaflet.latLngToLayerPoint(center));
      console.log("MapMiddle is " + mapMiddle + ", panStart is: " + panStart);
      // console.log("Mouse down! PanStart is " + panStart);
    };

    tool.onMouseDrag = function (event) {
      // var delta = panStart.subtract(event.point);
      // var output = "D: " + delta;
      // var newPosition = delta.add(paper.view.center);
      // output += ", np: " + newPosition;
      //
      // var center = leaflet.getCenter();
      // var currentCenter = new paper.Point(leaflet.latLngToLayerPoint(center));
      //
      // var delta2 = mapMiddle.subtract(currentCenter);
      // output += ", d2: " + delta2;
      // var newPosition2 = paper.view.center.subtract(delta2);
      // output += ", np2: " + newPosition2;
      //
      // project1.view.setCenter(newPosition2);
      // project2.view.setCenter(newPosition2);
      // mapMiddle = currentCenter;
      // console.log(output);
    }

    var hitOptions = { // Trigger hit only on 'fill' part of the path with 0 tolerance
        segments: false,
        stroke: false,
        fill: true,
        tolerance: 0
    };
    tool.onMouseMove = function(event){
      var x = event.point.x;
      var y = event.point.y;

      console.log("Coordinates: (" + x + "," + y + ")");

      var hitResult1 = project1.hitTestAll(event.point, hitOptions); // isPointInPath
      // hitResult = project1.hitTestAll(event.point, hitOptions);
      var hitResult2 = project2.hitTestAll(event.point, hitOptions); // isPointInPath

      if (hitResult1.length || hitResult2.length) {
        console.log("found something!")
        map._container.style.cursor = "default";
      } else {
          map._container.style.cursor = '-webkit-grab';
      }
    }
    
    tool.onMouseUp = function(event){
      drawBulletins();
    }
  };
  
  var canvasReset = function canvasReset(event){
    var center = leaflet.getCenter();
    var currentCenter = new paper.Point(leaflet.latLngToLayerPoint(center));
    var delta = mapMiddle.subtract(currentCenter);
    var newPosition = paper.view.center.subtract(delta);
    project1.view.setCenter(newPosition);
    project2.view.setCenter(newPosition);
    mapMiddle = currentCenter;
  }

  var onMouseEnter = function onMouseEnter(event){
    // console.log("Found something at " + event.point + ", which came from image file '" + event.target.getSource() + "'");
    document.body.style.cursor="pointer";
  };

  var onMouseExit = function onMouseExit(event){
    console.log("Exiting...");
    document.body.style.cursor="default";
  };

  function getItemByPosition(project, position){
    return project.getItem({position: position});
  };

  function isDrawn(project, position){
    return getItemByPosition(project, position) != null;
  };

  function drawBulletins(){
    var mapBounds = map.getBounds();
    var drawBulletin = function (type, bulletin){
      var latLngPosition = new L.LatLng(bulletin.lat, bulletin.lng);
      var position = new paper.Point(map.latLngToLayerPoint(latLngPosition));

      var item = paper.project.getItem({data: function(itemData){
        return itemData && bulletin.id == itemData.id}
      });

      if(item){ // if the item exists
        if(mapBounds.contains(latLngPosition)){ // check whether its still within the drawable boundaries
          item.setPosition(position); // if so, reposition it to its proper location
        }else{ // if not, remove it
          item.remove();
        }
      }else if(mapBounds.contains(latLngPosition)){
        var imageId = [type, bulletin.condition, bulletin.significant ? 'sig' : null].filter(function(i){return i != null});
        var raster = new paper.Raster(imageId.join("_"), position);
        raster.data = {id: bulletin.id}
        // raster.onMouseEnter = onMouseEnter;
        // raster.onMouseExit = onMouseExit;
      }
    };

    project1.activate();
    for(let index = 0; index < metars.length; index++){
      var metar = metars[index];
      drawBulletin('metar', metar);
    }
    project1.view.draw();

    project2.activate();
    for(let index = 0; index < tafs.length; index++){
      var taf = tafs[index];
      drawBulletin('taf', taf);
    }
    project2.view.draw();
  };

  initMap();
  initPaper();
  createBulletins();
  drawBulletins();
}