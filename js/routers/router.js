var app = app || {};

app.Router = Backbone.Router.extend({
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
	}
});

var router = new app.Router();
Backbone.history.start();
