var app = app || {};

app.FilterView = Backbone.View.extend({
	el: '#filterModal',

	initialize: function(){
		_.bindAll(this, 'closeFilterModal');
		this.listenTo(this.collection,'sync',this.loadFilters);
		this.$el.on('hide.bs.modal', function(){
			console.log('current route');
			console.log(router.routes[Backbone.history.fragment]);
			router.navigate(router.previousRoute,{
				trigger: true
			});
		});
		this.listenTo(this.collection,'filtered',function(){
			var timeoutID = window.setTimeout(this.closeFilterModal,600);
		});
		this.$el.find('#filterSubmit').button();
	},

	closeFilterModal: function(){
		this.$el.find('button.close').trigger('click');
	},

	loadFilters: function(){
		var availableCountries = this.collection.listCountries();
		this.$el.find('#filterCountries').tagsInput({
			autocomplete_url:'',
			autocomplete: {
				source: availableCountries
			}
		});

		var datesArray = this.collection.listDates();
		this.$el.find('#filterSlider').slider({
			min: 0,
			max: datesArray.length - 1,
			values: [datesArray.length - 1, datesArray.length - 1],
			orientation: 'horizontal',
			range: true,
			slide: function(event, ui){
				$(this).find(".ui-slider-value:first").text(datesArray[ui.values[0]].shortHand);
				$(this).find(".ui-slider-value:last").text(datesArray[ui.values[1]].shortHand);
        	}
		}).addSliderSegments(this.$el.find('#filterSlider').slider("option").max);

		this.clear();
		
	}, 
	
	events: {
		'click #filterSubmit': 'filter',
		'click #filterClear': 'clear'
	},

	filter: function(e){
		//this.$el.find('#filterSubmit i').addClass('icon-spin');
		e.preventDefault();
		
		var filterData = {
			sector: [],
			date: [],
			map_location: [],
			region: [],
			est_cost_min: []
		};
		
		this.$el.find('#sectorOptions input:checked').each(function(i, el){
			filterData.sector[i] = $(el).val();
		});
		this.$el.find('#regionOptions input:checked').each(function(i, el){
			filterData.region[i] = $(el).val();
		});
		this.$el.find('#filterCountries_tagsinput span.tag').each(function(i,el){
			var text = $(el).text();
			filterData.map_location[i] = text.substring(0,text.length - 2);
		});

		var datesArray = this.collection.listDates();
		var sliderRange = this.$el.find('#filterSlider').slider("values");
		for(var i = sliderRange[0]; i <= sliderRange[1]; i++){
			filterData.date[i-sliderRange[0]] = datesArray[i].value;
		}

		this.collection.applyFilter(filterData);
		
	},

	clear: function(e){

		this.$el.find('input[type=checkbox]').each(function(i,el){
			$(el).prop("checked",false).parent(".checked").removeClass("checked");
		});

		this.$el.find("#filterCountries").importTags('');
		this.$el.find("#filterSlider .ui-slider-segment").remove();
		this.$el.find(".ui-slider-value").text('');
		this.$el.find("#filterSlider").slider("destroy");

		var datesArray = this.collection.listDates();
		this.$el.find('#filterSlider').slider({
			min: 0,
			max: datesArray.length - 1,
			values: [datesArray.length - 1, datesArray.length - 1],
			orientation: 'horizontal',
			range: true,
			slide: function(event, ui){
				$(this).find(".ui-slider-value:first").text(datesArray[ui.values[0]].shortHand);
				$(this).find(".ui-slider-value:last").text(datesArray[ui.values[1]].shortHand);
        	}
		}).addSliderSegments(this.$el.find('#filterSlider').slider("option").max);
		this.$el.find('#filterSubmit').trigger('click');

	},
	render: function(){

	}
});

var filterView = new app.FilterView({collection: forecastList});

