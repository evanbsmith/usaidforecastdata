var app = app || {};

app.ForecastItem = Backbone.Model.extend({
	defaults: {
		active: true
	},
	activeOn: function(){
		this.set("active", true);
	},
	activeOff: function(){
		this.set("active", false);
	},
		activeToggle: function(){
		this.set("active", !this.get("active"));
	}
});