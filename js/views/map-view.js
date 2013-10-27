var app = app || {};

app.MapView = Backbone.View.extend({
	el: '#mapView',

	initialize: function(){
		_.bindAll(this, 'getStyle', 'addPopup');
		//this.listenTo(this.collection,'sync',this.loadMap);
		this.listenTo(this.collection,'filtered',this.updateMap);
	},

	loadMap: function(){
		this.countrySum = this.collection.summarize({nestField: "country_code"});
		this.map = L.mapbox.map('mapView', 'evanbsmith.map-ek636bqf',{
			maxZoom: 6,
			minZoom: 3,
			maxBounds:[[-75,-200],[80,200]]
		}).setView([-1.4062,11.8674,3], 3);
		this.countryLayer = new L.geoJson(countries50m2,{
			style: this.getStyle,
			onEachFeature: this.addPopup
		});
		// console.log("Country Layer");
		// console.log(this.countryLayer);
		// console.log("Country Sum");
		// console.log(this.countrySum);
		this.map.addLayer(this.countryLayer);
	},

	addPopup: function(feature, layer){
		if(this.countrySum[feature.properties.iso_a3] > 0){
			layer.bindPopup(feature.properties.name + ": " + this.countrySum[feature.properties.iso_a3]);
		}
	},

	getStyle: function(feature) {
		return {
			weight: 1,
			opacity: 1,
			color: '#555561',
			fillOpacity: this.countrySum[feature.properties.iso_a3] > 0 ? 0.8 : 0,
			fillColor:  this.getColor(this.countrySum[feature.properties.iso_a3]),
			clickable: this.countrySum[feature.properties.iso_a3] > 0 ? true : false
		};
	},

	getColor: function(total){
		return total > 9 ? '#78030F' :
	   		total > 7  ? '#AA3129' :
	   		total > 4  ? '#D3604C' :
	   		total > 1  ? '#EE9479' : 
	   		total > 0  ? '#F6CDB1' : '#EEEEEE';
	},

	updateMap: function(){
		if(!this.map){
			this.loadMap();
		}

		this.countrySum = this.collection.summarize({nestField: "country_code"});
		this.countryLayer.clearLayers();
		this.countryLayer.addData(countries50m2);
		this.collection.trigger("mapUpdated");
	},

	render: function(){
		this.map.invalidateSize();
	}
});

 var mapView = new app.MapView({collection: forecastList});