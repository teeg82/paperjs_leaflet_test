define([
  
], function(){
  const CONDITIONS = ['IB', 'IC', 'IV', 'MB', 'MC', 'MV', 'VC', 'VU', 'NULL'];
  const CHANCE_SIGNIFICANT = 0.1;
  const METAR_COUNT = 3000;
  const TAF_COUNT = 0;
  const NORTH_EAST = {lat: 71.41317683396566, lng: -19.16015625};
  const SOUTH_WEST = {lat: 26.509904531413927, lng: -187.11914062500003};
  const HIT_OPTIONS = { // Trigger hit only on 'fill' part of the path with 0 tolerance
    segments: false,
    stroke: false,
    fill: true,
    tolerance: 0
  };
  // const DEFAULT_TILE_URL = 'https://www.cfps.halc/static/tiles/base/{z}/{x}/{y}.png';
  const DEFAULT_TILE_URL = 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  return {
    conditions: CONDITIONS,
    chanceSignificant: CHANCE_SIGNIFICANT,
    metarCount: METAR_COUNT,
    tafCount: TAF_COUNT,
    northEast: NORTH_EAST,
    southWest: SOUTH_WEST,
    hitOptions: HIT_OPTIONS,
    defaultTileUrl: DEFAULT_TILE_URL,
    createSymbols: function createSymbols(){
      var icons = document.querySelectorAll("div#icons > img");
      var symbols = {};
      for(var i = 0; i < icons.length; i++){
        var icon = icons[i];
        var id = icon.id;
        var definition = new paper.Raster(icon);
        var symbol = new paper.Symbol(definition);
        symbols[id] = symbol;
      }
      return symbols;
    },
    createBulletin: function createBulletin(type, id){
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
    }
  }
});