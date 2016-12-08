define([
  'Map'
], function(Map){
  var _getPosition = function getPosition(bulletin){
    var map = Map.getMap();
    var latLngPosition = new L.LatLng(bulletin.lat, bulletin.lng);
    var position = new paper.Point(map.latLngToLayerPoint(latLngPosition));
    return position;
  };

  // Given an integer, determine the nearest multiple of 5.
  // This function is typically used to determine appropiate wind barb icons.
  var _nearestFive = function(value) {
    if (!value) {
      return 0;
    }
    return 5 * Math.round(value / 5);
  };


  var _isWithinBounds = function isWithinBounds(bulletin, latLngPosition){
    var map = Map.getMap();
    var mapBounds = map.getBounds();
    return mapBounds.contains(latLngPosition);
  };


  var isWithinBounds = function isWithinBounds(bulletin){
    var latLngPosition = new L.LatLng(bulletin.lat, bulletin.lng);
    return _isWithinBounds(bulletin, latLngPosition);
  };


  var drawBulletin = function drawRaster(type, bulletin, symbols){
    var position = _getPosition(bulletin);
    var imageId = [type, bulletin.condition, bulletin.significant ? 'sig' : null].filter(function(i){return i != null});
    var symbol = symbols[imageId.join("_")];
    // var item = symbol.place(position);
    item = new paper.Raster(imageId.join("_"), position);
    item.name = bulletin.id;
    item.data = {bulletin: bulletin};

    return item;
  };

  var drawWindBarb = function drawWindBarb(type, bulletin, symbols){
    var pivotPosition = _getPosition(bulletin);
    var position = pivotPosition.clone();
    position = position.subtract(-7,46/2 + 14/2); // offset to the top of the 
    var imageId = "wind_barb_" + _nearestFive(bulletin.wind_speed);
    var symbol = symbols[imageId];
    // var item = symbol.place(position)
    var item = new paper.Raster(imageId, position);
    item.rotate(bulletin.wind_direction, pivotPosition);
    item.name = bulletin.id + ".wind";
    item.data = {bulletin:bulletin};
    return item;
  };

  var drawSiteLabel = function drawSiteLabel(type, bulletin){
    var position = _getPosition(bulletin);
    position = position.add(0, 14 + 7);
    var item = new paper.PointText(position);
    item.justification = 'center';
    item.content = bulletin.id;
    item.data = {bulletin: bulletin};
    return item;
  };

  return {
    drawBulletin: drawBulletin,
    drawWindBarb: drawWindBarb,
    drawSiteLabel: drawSiteLabel,
    isWithinBounds: isWithinBounds
  };
});