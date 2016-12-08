define([
  'Meta',
  'RenderingHelper'
], function(Meta, RenderingHelper){
  

  var MetarRenderer = {
    layerId: "taf",
    layer: null,
    windBarbLayer: null,
    bulletins: null,
    symbols: {},
    _createBulletins: function _createBulletins(){
      this.bulletins = [];
      for(var index = 0; index < Meta.tafCount; index++){
        var bulletin = Meta.createBulletin(this.layerId, index);
        this.bulletins.push(bulletin);
      }
      // One extra for Ottawa
      //45.4215° N, 75.6972° W
      this.bulletins.push({
        id: this.layerId + (Meta.metarCount+1),
        condition: 'VC',
        significant: false,
        wind_direction:55,
        wind_speed: 40,
        lat: 45.4295,
        lng: -75.6972
      });
    },
    init: function init(symbols){
      this.symbols = symbols;
      this._createBulletins();
    },
    getLayerId: function(){
      return this.layerId;
    },
    clear: function clear(){
      this.windBarbLayer.removeChildren();
      this.siteLabelLayer.removeChildren();
      this.layer.removeChildren();
    },
    render: function render(){
      this.layer.addChild(this.windBarbLayer);
      this.layer.addChild(this.siteLabelLayer);

      for(var index = 0; index < this.bulletins.length; index++){
        var taf = this.bulletins[index];
        var item = RenderingHelper.drawBulletin(this.layerId, taf, this.symbols);
        item.data.renderer = this;
        
        if(taf.wind_speed > 2){
          var windBarb = RenderingHelper.drawWindBarb(this.layerId, taf, this.symbols);
          windBarb.data.renderer = this;
          this.windBarbLayer.addChild(windBarb);
        }

        var siteLabel = RenderingHelper.drawSiteLabel(this.layerId, taf);
        siteLabel.data.renderer = this;
        this.siteLabelLayer.addChild(siteLabel);
      }
    },
    getBulletinText: function getBulletinText(bulletin){
      return [bulletin.id, 
              bulletin.condition + (bulletin.significant ? "!" : ""), 
              bulletin.wind_direction + "/" + bulletin.wind_speed + "KT",
              bulletin.lat + ", " + bulletin.lng
             ].join(" ");
    },
    setLayer: function setView(layer){
      this.layer = layer;
      this.windBarbLayer = new paper.Layer();
      this.windBarbLayer.name = "wind_barb";

      this.siteLabelLayer = new paper.Layer();
      this.siteLabelLayer.name = "site_label";
    }
  };

  return MetarRenderer;
});