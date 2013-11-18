var app = app || {};

app.ListView = Backbone.View.extend({
	el: '#listView',
	template: _.template($('#listViewTemplate').html()),
	initialize: function(){
		this.listenTo(this.collection,'filtered',this.render);
	},
	render: function(){
		var columns = [
			{
				field: "mission_bureau",
				label: "Mission/ Bureau",
				minWidth: "158px",
				hide: ""
			},
			{
				field: "oaa_contact",
				label:"OAA Contact",
				minWidth: "80px",
				hide: "all"
			},
			{
				field:"place_of_performance",
				label: "Place of Performance",
				minWidth: "158px",
				hide: ""
			},
			{
				field:"award_title",
				label: "Award Title",
				minWidth: "99px",
				hide: ""
			},
			{
				field:"award_description",
				label: "Description",
				minWidth: "97px",
				hide: "xs,sm,md,lg"
			},
			{
				field:"partner_incumbent",
				label: "Partner/ Incumbent",
				minWidth: "91px",
				hide: "all"
			},
			{
				field:"est_cost_range",
				label: "Total Est. Cost",
				minWidth: "69px",
				hide: ""
			},
			{
				field:"award_type",
				label: "Award Type",
				minWidth: "99px",
				hide: ""
			},
			{
				field:"usaid_sector_long",
				label: "Sector",
				minWidth: "70px",
				hide: ""
			},
			{
				field:"region_long",
				label: "Region",
				minWidth: "67px",
				hide: ""
			},
			{
				field:"date",
				label: "Forecast Date",
				minWidth: "70px",
				hide: "all"
			}
		];
		var rows = this.collection.where({active: true});

		this.$el.html(this.template({
			columns: columns,
			rows: rows
		}));

		this.$el.find('table').footable({
			breakpoints: {
				xs: 767,
				sm: 991,
				md: 1199,
				lg: 1400
			},
			classes: {
				toggle: 'icon-plus'
			}
		});
	},
	visible: function(){
		this.$el.css('display', 'block').addClass('in');
		this.render();
	}
});

var listView = new app.ListView({collection: forecastList});