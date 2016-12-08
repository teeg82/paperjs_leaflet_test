define([
  'RenderingManager',
  'Meta',
  'PopupView',
  'Map'
], function(RenderingManager, Meta, PopupView, Map){

  var project = null;
  var tool = null;
  var icons = {};
  var selected = [];
  var lastPosition = new L.Point(0,0); // init this to zero to start
  var lastCenter = null;

/******* PRIVATE METHODS *******/
  var _createToolProperties = function createToolProperties(map){
    var toolProperties = {
      mapCenter: null,
      isMouseDown: false,
      bounds: null,
      // dragStart: null,
      // onMouseDrag: function onMouseDrag(event){
      //   var point = event.point;
      //   project.view.center = new paper.Point(project.view.center.x-(point.x - this.dragStart.x), project.view.center.y-(point.y-this.dragStart.y));
      //   project.view.draw();
      // },
      onMouseDown: function onMouseDown(event){
        this.dragStart = event.point;
        this.isMouseDown = true;
        var center = map.getCenter();
        this.mapCenter = leaflet.latLngToLayerPoint(center);
        this.bounds = project.view.getBounds();
      },
      onMouseUp: function(event){
        this.isMouseDown = false;
        // Don't re-render anything if the mouse was clicked without moving
        var center = map.getCenter();
        lastDelta = new L.Point(0,0);
        if(!this.mapCenter.equals(leaflet.latLngToLayerPoint(center))){
          render();
        }

        for(var index = 0; index < selected.length; index++){
          var item = selected[index];
          item.selected = false;
        }
        selected = [];

        var x = event.point.x;
        var y = event.point.y;

        var hitResult = project.hitTestAll(event.point, Meta.hitOptions); // isPointInPath
        if(hitResult.length){
          var uniqueItems = [];

          for(var index = 0; index < hitResult.length; index++){
            var result = hitResult[index];
            var item = result.item;
            if(item.data.bulletin){
              item.selected = true;
              selected.push(item);
              if(uniqueItems.indexOf(item.data.bulletin.id) < 0){
                uniqueItems.push(item.data.bulletin.id);
              }
            }else if(item.data.coords){
              console.log("Tile found for position " + item.data.coords + " with bounds: " + item.getBounds());
            }
          }

          console.log("Found " + hitResult.length + " (" + uniqueItems.length + " unique) items at coordinates: (" + x + "," + y + ")");
        }
      },
      onMouseMove: function(event){
        if(!this.isMouseDown){
          var x = event.point.x;
          var y = event.point.y;

          var hitResult = project.hitTestAll(event.point, Meta.hitOptions); // isPointInPath

          if (hitResult.length) {
            var result = hitResult[0];
            var item = result.item;
            var renderer = item.data.renderer;
            if(renderer){
              var bulletin = item.data.bulletin;
              var bulletinText = renderer.getBulletinText(bulletin);
              var override = !!PopupView.identifier && (bulletin.name !== PopupView.identifier);
              PopupView.show(bulletinText, {hoverEvent: event.event, width: 420}, override);
              PopupView.setDelegateAndIdentifier(this, item.name);

              console.log("found something!")
              map.setCursor("default");
            }else{
              PopupView.hide();
              map.setCursor('-webkit-grab');
            }
          } else {
            PopupView.hide();
            map.setCursor('-webkit-grab');
          }
        } else {
          this.hasMoved = true;
        }
      }
    };
    return toolProperties;
  };

  var preDrag = function preDrag(event){
    RenderingManager.rasterize();
    project.view.draw();
  }

  var canvasReset = function canvasReset(event){
    if(tool.isMouseDown){
      var delta = lastPosition.subtract(event.target._newPos);
      var newPosition = project.view.center.add(delta);

      project.view.setCenter(newPosition);
      project.view.update();
      lastPosition = event.target._newPos;
    }
  };

  var resizeCanvas = function resizeCanvas(event){
    var map = Map.getMap();
    var mapSize = map.getSize()

    project.view.setViewSize(new paper.Size(mapSize.x, mapSize.y));
    var mapCenter = map.latLngToLayerPoint(map.getCenter());
    project.view.setCenter(mapCenter);
    project.view.update();
  };


  var _initImages = function initImages(){
    var images = document.querySelectorAll("div#icons > img");
    for(var index = 0; index < images.length; index++){
      var image = images[index];
      icons[image.id] = image;
    }
  };


/******* PUBLIC METHODS *******/
  var initPaper = function initPaper(map){
    var mapSize = map.getSize();
    var canvas = paper.createCanvas(mapSize.x, mapSize.y);
    canvas.setAttribute('id', 'mapCanvas');

    paper.setup(canvas);
    project = paper.project;

    map.addCanvas(canvas);

    tool = new paper.Tool(_createToolProperties(map));

    // map.getMap().dragging._draggable.on("drag", canvasReset);
    map.on("resize", resizeCanvas);
    map.on("moveend", render, this);
    map.on("zoomstart", clear, this);
    map.on('zoomend', render, this);
    _initImages();
    PopupView.init();

    lastCenter = map.getMap().latLngToLayerPoint(map.getCenter());
  };
  
  var _calculateSize = function(){
    var map = Map.getMap();
    var p = 0.02;
    var size = map.getSize();
    var panePos = L.DomUtil.getPosition(map._mapPane);
    var min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p));
    var max = min.add(size.multiplyBy(1 + p*2));
    var width = max.x - min.x;
    var height = max.y - min.y;
    return {min: min, width: width, height: height};
  };

  // Sets the offset position and size of the canvas pane.
  // Resets the paper view's center position and view size.
  // This will cause the view to redraw
  var _updateViewport = function() {
    var size = _calculateSize();
    var map = Map.getMap();
    
    var min = size.min;
    var height = size.height;
    var width = size.width;
    
    var pane = map.getPane('canvas');
    L.DomUtil.setPosition(pane, min);
    pane.setAttribute('width', width);
    pane.setAttribute('height', height);

    var center = map.latLngToLayerPoint(map.getCenter());
    project.view.setCenter(center);
    // this.paperView.setViewSize(size.width, size.height);
  }

  var addRenderer = function addLayer(map, renderer){
    var layer = new paper.Layer({name: renderer.getLayerId()});
    renderer.setLayer(layer);
    RenderingManager.registerRenderer(renderer);
    return layer;
  };
  
  var render = function render(event){
    _updateViewport();
    RenderingManager.render();
    project.view.draw();
  };
  
  var clear = function clear(event){
    RenderingManager.clear();
  }

  return {
    initPaper: initPaper,
    addRenderer: addRenderer,
    canvasReset: canvasReset,
    render: render
  }
})