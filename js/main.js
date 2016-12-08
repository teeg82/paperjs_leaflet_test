define([
  'Map',
  'Meta',
  'PaperManager',
  'MetarRenderer',
  'TafRenderer'
], function(Map, Meta, PaperManager, MetarRenderer, TafRenderer, CanvasMapLayer){
  var map = Map.initMap();
  PaperManager.initPaper(map);
  map.createLayer();

  var symbols = Meta.createSymbols();

  MetarRenderer.init(symbols);
  PaperManager.addRenderer(map, MetarRenderer);

  TafRenderer.init(symbols);
  PaperManager.addRenderer(map, TafRenderer);

  PaperManager.render();
})