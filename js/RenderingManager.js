define([
  'Map'
], function(Map){
  var renderers = [];

  var registerRenderer = function registerRenderer(renderer){
    renderers.push(renderer);
  };

  var clear = function clean(){
    for(var index in renderers){
      var renderer = renderers[index];
      renderer.layer.removeChildren();
    }
  };

  var render = function render(){
    for(var index in renderers){
      var renderer = renderers[index];
      renderer.clear();
      renderer.layer.activate();
      renderer.render();
    }
  };

  var rasterize = function rasterize(){
    for(var index in renderers){
      var renderer = renderers[index];
      var layerRaster = renderer.layer.rasterize(false);
      renderer.clear();
      renderer.layer.addChild(layerRaster);
    }
  }

  return {
    clear: clear,
    render: render,
    registerRenderer: registerRenderer,
    rasterize: rasterize
  }
});