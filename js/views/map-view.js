var app = app || {};

app.MapView = Backbone.View.extend({
	el: '#mapView',

	initialize: function(){
		_.bindAll(this, 'setActive', 'setInactive');
		this.listenTo(this.collection,'filtered',this.updateMap);
	},

	loadMap: function(){
		this.countryIndex = {};
		this.countrySum = this.collection.summarize({nestField: "country_code"});
		this.map = L.mapbox.map('mapView', 'evanbsmith.map-ek636bqf',{
			maxZoom: 6,
			minZoom: 3,
			maxBounds:[[-75,-200],[80,200]]
		}).setView([-1.4062,11.8674,3], 3);

		this.countryLayer = new L.geoJson(countries50m2,{
			style: this.initStyle
		});
		this.map.addLayer(this.countryLayer);
		
		var countryIndex = {};
		_.each(this.countryLayer._layers, function(val, key, list){
			countryIndex[val.feature.properties.iso_a3] = val._leaflet_id;
		});

		this.countryIndex = countryIndex;
	},

	getColor: function(total){
		return total > 9 ? '#78030F' :
	   		total > 7  ? '#AA3129' :
	   		total > 4  ? '#D3604C' :
	   		total > 1  ? '#EE9479' : 
	   		total > 0  ? '#F6CDB1' : '#EEEEEE';
	},

	initStyle: function(feature){
		return {
			weight: 1,
			opacity: 1,
			color: '#4d4d4d',
			fillOpacity: 0,
			fillColor:  'none'
		};
	},

	setActive: function(layer,index,array){
		layer.bindPopup(layer.feature.properties.name + ": " + this.countrySum[layer.feature.properties.iso_a3]);
		layer.setStyle({
			fillOpacity: 0.8,
			fillColor:  this.getColor(this.countrySum[layer.feature.properties.iso_a3])
		});
		if(layer._layers !== undefined){
			_.each(layer._layers,function(layer,index,array){
				if(layer._path !== undefined){layer._path.setAttribute('class', 'leaflet-clickable');}
			});
		}
		else{
			if(layer._path !== undefined){layer._path.setAttribute('class', 'leaflet-clickable');}
		}
	},

	setInactive: function(layer,index,array){
		if(layer._layers !== undefined){
			_.each(layer._layers,function(layer,index,list){
				if (layer._popup) {
                    layer._popup = null;
                    layer.off('click', layer._openPopup).off('remove', layer.closePopup);
                    layer._popupHandlersAdded = false;
                }
				if(layer._path !== undefined){layer._path.setAttribute('class', 'leaflet-notclickable');}
				layer.setStyle({
					fillOpacity: 0,
					fillColor:  '#EEEEEE',
					clickable: false
				});
			});
		}
		else{
			if (layer._popup) {
                layer._popup = null;
                layer.off('click', layer._openPopup).off('remove', layer.closePopup);
                layer._popupHandlersAdded = false;
            }
			if(layer._path !== undefined){layer._path.setAttribute('class', 'leaflet-notclickable');}
			layer.setStyle({
				fillOpacity: 0,
				fillColor:  'none'
			});
		}
	},

	updateMap: function(){
		if(!this.map){
			this.loadMap();
		}

		this.countrySum = this.collection.summarize({nestField: "country_code"});
		var countrySum = this.countrySum;
		// console.log('countrySum');
		// console.log(countrySum);

		var countryIndex = this.countryIndex;
		var countryLayer = this.countryLayer;
		var allLayers = countryLayer.getLayers(),
			activeLayers = [],
			inactiveLayers = [];

		_.each(this.countrySum,function(e,i,list){
			activeLayers.push(countryLayer.getLayer(countryIndex[i]));
		});

		inactiveLayers = _.difference(allLayers,activeLayers);
		
		_.each(activeLayers,this.setActive);
		_.each(inactiveLayers,this.setInactive);

		this.collection.trigger("mapUpdated");
	},

	render: function(){
		this.map.invalidateSize();
	}
});

 var mapView = new app.MapView({collection: forecastList});