var app = app || {};

app.NavView = Backbone.View.extend({
	el: '#navBar',
	initialize: function(){
		this.$el.find('a').click(function(e){
			console.log("nav clicked!");
			console.log(e);
			console.log(this);
			$('#navBar li').removeClass('active');
			$(this).parent().addClass('active');
		});
	}
});

var navView = new app.NavView();