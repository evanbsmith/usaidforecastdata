var app = app || {};

app.Router = Backbone.Router.extend({
	initialize: function(){
		this.currentRoute = '';
		this.previousRoute = '';
		this.on('route',this.updatePrevious);
	},
	routes: {
		'filter' : 'openFilterModal',
		'list' : 'toggleListView',
		'' : 'index' 
	},
	index: function(){
		console.log("Index route");
		$('#filterModal').modal("hide");
		$('#listView').removeClass('in').css('display', 'none');
		$('#navBar li').removeClass('active').first().addClass('active');
	},
	openFilterModal: function(e){
		console.log("Filter route");
		$('#filterModal').modal("show");
	},
	toggleListView: function(){
		console.log("List route");
		listView.visible();
	},
	updatePrevious: function(){
		this.previousRoute = this.currentRoute;
		this.currentRoute = this.routes[Backbone.history.fragment];
	}
});

var router = new app.Router();
Backbone.history.start();
