var app = app || {};

app.ListView = Backbone.View.extend({
	el: '#listView',
	template: _.template($('#listViewTemplate').html()),
	initialize: function(){
		this.listenTo(this.collection,'filtered',this.render);
	},
	render: function(){
		var columns = ["mission_bureau", "oaa_contact","place_of_performance","region_long","award_title","award_description","partner_incumbent","est_cost_range","award_type","usaid_sector_long","date"];
		var rows = this.collection.where({active: true});
		console.log(rows);

		this.$el.html(this.template({
			columns: columns,
			rows: rows
		}));
	},
	test: function(){
		console.log("listViewCall heard");
	},
	visible: function(){
		this.$el.css('display', 'block').addClass('in');
		this.render();
	}
});

var listView = new app.ListView({collection: forecastList});