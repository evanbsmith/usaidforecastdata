var app = app || {};

app.MapChartView = Backbone.View.extend({
	el: '#statsBox',
	template: _.template($('#mapChartStatsTemplate').html()),

	initialize: function(){
		_.bindAll(this, 'render', 'sectorToggle','getTooltipData');
		this.listenTo(this.collection,'filtered',this.render);
		$(window).on("resize", _.debounce(this.render,300));
		this.addRegionChart();
		this.addSectorChart();
		$('#sectorToggle a').click(this.sectorToggle);
	},

	addRegionChart: function(){
		this.$regionContainer = this.$el.parent().find('#chartBox1');

		var margin = {top:10, right:5, bottom:45, left:43},
			width = this.$regionContainer.width() - margin.left - margin.right,
			height = this.$regionContainer.height() - this.$regionContainer.find('h4').outerHeight(true) - margin.top - margin.bottom,
			colors = d3.scale.ordinal().range(["#36B2C1","#AADADC"]);

		this.regionParams = {
			margin: margin,
			width: width,
			height: height,
			colors: colors
		};

		var regionChart = d3.select("div#chartBox1").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		regionChart.append("g")
      		.attr("class", "x axis")
      		.attr("transform", "translate(0," + height + ")");

      	regionChart.append("g")
		    .attr("class", "y axis")
		    .attr("y", 2)
		    .attr("x", 15)
		    .attr("dy", ".71em");

		var regionLegend = regionChart.append("g")
			.attr("class", "region-legend")
			.attr("transform", "translate(" + (width/2 - (75+8)) + "," + (height + margin.bottom*0.75) + ")");

		var legendItems = ["Projects","Dollars"];

		regionLegend.selectAll("text")
			.data(legendItems).enter().append("text")
        	.attr("x",function(d,i){ return 8 + i*75;})
        	.text(function(d) { ;return d});

        regionLegend.selectAll("circle")
        	.data(legendItems).enter().append("circle")
        	.attr("cy",-5)
        	.attr("cx",function(d,i){ return i*75;})
        	.attr("r","0.4em")
        	.style("fill",function(d) {return colors(d);})
	},

	getTooltipData: function(d,i){
		console.log("tip data:");
		console.log(d);
		console.log("this.count: " + this.count);
		console.log("this.dollars: " + this.dollars);
		console.log("this test");
		console.log(this);
		return d.key === 'count' ? Math.round(d.value * this.count) + ' projects' : toMillions(d.value * this.dollars);
	},

	updateRegionChart: function(regionData){

		// Define visualization variables

		var margin = this.regionParams.margin,
			width = this.$regionContainer.width() - margin.left - margin.right,
			height = this.$regionContainer.height() - this.$regionContainer.find('h4').outerHeight(true) - margin.top - margin.bottom,
			x0 = d3.scale.ordinal().domain(regionData.map(function(d){return d.key;})).rangeRoundBands([0, width], .05),
			x1 = d3.scale.ordinal().domain(["count","dollars"]).rangeRoundBands([0,x0.rangeBand()]),
			yDomainMax = _.chain(regionData).pluck('normalValues').flatten().pluck('value').max().value(),
			y = d3.scale.linear().domain([0,yDomainMax]).range([height,0]).nice(),
			color = d3.scale.ordinal().range(["#36B2C1","#AADADC"]);

		var xAxis = d3.svg.axis()
			.scale(x0)
			.tickSize(0)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.outerTickSize(0)
			.ticks(4)
			.orient("left")
			.tickFormat(function(d){
				var format = d3.format("f");
				return format(d*100) + '%';
			});

		var currentCount = this.count;
		var currentDollars = this.dollars;

		var tip = d3.tip()
				.attr('class','tooltip top fade')
				.html(this.getTooltipData)
				.direction('n');

		var time = 750; // transition duration
		var regionSVG = d3.select('div#chartBox1 > svg');
		var regionChart = d3.select('div#chartBox1 > svg > g');

		regionSVG.call(tip);

		// Transition size of chart for resize

		regionSVG.transition().duration(time)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);



		var region = regionChart.selectAll(".region")
  			.data(regionData, function(d){return d.key;})

  		// Update selection

  		region.transition().duration(time)
  			.attr("transform", function(d) {return "translate(" + x0(d.key) + ",0)";});

  		region.selectAll('rect')
  			.data(function(d){return d.normalValues;})
  			.transition().duration(time)
  				.attr("width", x1.rangeBand())
		    	.attr("x", function(d) { return x1(d.key); })
		    	.attr("y", function(d) { return y(d.value); })
		    	.attr("height", function(d,i) {return height - y(d.value); });

      	// Enter selection

      	var regionEnter = region.enter().append("g")
      		.attr("class", "region")
      		.attr("transform", function(d) {return "translate(" + x0(d.key) + ",0)";});

      	regionEnter.selectAll("rect")
		    .data(function(d) { return d.normalValues; })
		    .enter().append("rect")
		    .attr("class","regionBar")
		    .attr("fill-opacity", 1)
		    .attr("width", x1.rangeBand())
		    .attr("x", function(d) { return x1(d.key); })
		    .attr("y", function(d) { return height; })
		    .attr("height", function(d) { return 0; })
		    .style("fill", function(d) { return color(d.key); })
		    .on('mouseover.regionBar', tip.show)
  			.on('mouseout.regionBar', tip.hide)
		    .transition().duration(time)
				.attr("y", function(d) { return y(d.value); })
		    	.attr("height", function(d) { return height - y(d.value); });

      	// Exit selection

		// region.exit().selectAll('rect')
		// 	.transition().duration(time/3)
		// 		.attr("y", function(d) { return height; })
		// 		.attr("height", function(d) { return 0; })
		// 		// .attr("fill-opacity",0)
		// 		.remove();

		region.exit().remove();

		// Axes transition

		regionChart.select(".x.axis")
			.transition().duration(time)
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		regionChart.select(".y.axis")
			.transition().duration(time)
			.call(yAxis);

		regionChart.select(".region-legend")
			.transition().duration(time)
			.attr("transform", "translate(" + (width/2 - (75+8)) + "," + (height + margin.bottom*0.75) + ")");

		// regionChart.selectAll('rect')
		// 	.on('mouseover', console.log("mouseover"))
  // 			.on('mouseout', console.log("mouseout"));		
	},

	addSectorChart: function(){
		this.$sectorContainer = this.$el.parent().find('#chartBox2');

		var margin = {top:10, right:52, bottom:30, left:60},
			width = this.$sectorContainer.width() - margin.left - margin.right,
			height = this.$sectorContainer.height() - this.$sectorContainer.find('h4').outerHeight(true) - margin.top - margin.bottom;

		this.sectorParams = {
			margin: margin,
		};

		var sectorChart = d3.select("div#chartBox2").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// sectorChart.append("g")
  //     		.attr("class", "x axis")
  //     		.attr("transform", "translate(0," + height + ")");

		sectorChart.append("g")
      		.attr("class", "y axis")
      		.attr("y", 2)
		    .attr("x", 15);
	},

	updateSectorChart: function(data){

		var type = $('#sectorToggle span.active').data("chart");

		data = _.sortBy(data,function(d){
			return -d[type];
		});

		// Define visualization variables

		var margin = this.sectorParams.margin,
			width = this.$sectorContainer.width() - margin.left - margin.right,
			height = this.$sectorContainer.height() - this.$sectorContainer.find('h4').outerHeight(true) - margin.top - margin.bottom;

		var y = d3.scale.ordinal().domain(data.map(function(d){return d.key;})).rangeRoundBands([0, height], .2);

		var x = d3.scale.linear().domain([0,d3.max(data,function(d){return d[type]})]).range([0,width]).nice();

		var yAxis = d3.svg.axis()
			.scale(y)
			.tickSize(0)
			.orient("left")
			.tickFormat(function(d){return toSectorShort(d);});

		// var xAxis = d3.svg.axis()
		// 	.scale(x)
		// 	.ticks(5)
		// 	.orient("bottom");

		var time = 750; // transition duration

		var sectorSVG = d3.select('div#chartBox2 > svg');

		var sectorChart = d3.select('div#chartBox2 > svg > g');

		// Transition size of chart for resize

		sectorSVG.transition().duration(time)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

		// Transition chart data

		var sector = sectorChart.selectAll(".sectorBox").data(data, function(d){return d.key;});   		

		sector.selectAll(".sectorBar").datum(function(d,i){
			return _.find(data,function(item){return item.key === d.key;});
		});

		sector.selectAll(".sectorValue").datum(function(d,i){
			return _.find(data,function(item){return item.key === d.key;});
		});		

		// Update selection

		sector.transition().duration(time)
			.attr("transform", function(d){return "translate(0," + y(d.key) + ")";});

		sector.selectAll("rect")
			.transition().duration(time)
		    .attr("width",function(d){return x(d[type]);})
		    .attr("height", function(d){return y.rangeBand()});

		sector.selectAll("text")
			.transition().duration(time)
			.attr("x",function(d){return x(d[type]) + 4;})
			.attr("y",function(d){return y.rangeBand()/2})
			.attr("dy", ".35em")
			.attr("text-anchor", "start")
			.text(function(d){return type === "count" ? d[type] : toMillions(d[type]);});

		// Enter selection

		var sectorEnter = sector.enter().insert("g",".axis")
			.attr("class","sectorBox")
			.attr("transform", function(d){return "translate(0," + y(d.key) + ")";});

		sectorEnter.append("rect")
      		.attr("class","sectorBar")
		    .attr("width",function(d){return 0;})
		    .attr("height", function(d){return y.rangeBand();})
		    .style("fill", "#3ea67d")
		    .transition().duration(time)
		    	.attr("width",function(d){return x(d[type]);});

		sectorEnter.append("text")
			.attr("class","sectorValue")
			.attr("x",function(d){return 4;})
			.attr("y",function(d){return y.rangeBand()/2})
			.attr("dy", ".35em")
			.attr("text-anchor", "start")
			.text(function(d){return type === "count" ? d[type] : toMillions(d[type]);})
			.transition().duration(time)
				.attr("x",function(d){return x(d[type]) + 4;});

		// Exit selection

		sector.exit().remove();

		// Axes transition

		// sectorChart.select(".x.axis")
		// 	.transition().duration(time)
		// 	.call(xAxis);

		sectorChart.select(".y.axis")
			.transition().duration(time)
			.call(yAxis);
	},

	render: function(){
		this.dollars = parseInt(this.collection.aggregate('est_cost_min'),0);
		this.count = parseInt(this.collection.count(),0);
		var totalDollars = parseInt(this.collection.aggregate('est_cost_min'),0);
		var totalCount = parseInt(this.collection.count(),0);
		this.$el.html(this.template({
			value: toDollars(totalDollars,0),
			count: totalCount,
			average: toDollars(totalDollars/totalCount)
		}));

		var regionData = this.collection.summarize({nestField:"region", type:"array"});
		var regionKeys = d3.keys(regionData[0]).filter(function(key){return key !== "key"});
		regionData.forEach(function(d){
			d.normalValues = [{key: "count", value: d.count/totalCount},{key: "dollars",value: d.dollars/totalDollars}];
		});

		var sectorData = this.collection.summarize({nestField:"sector", type:"array"});

		this.updateRegionChart(regionData);
		this.updateSectorChart(sectorData);

	},

	sectorToggle: function(e){
		e.preventDefault();
		$(e.currentTarget).parents('#sectorToggle').find('span').removeClass('active label-primary').addClass('label-default');
		$(e.target).parent().removeClass('label-default').addClass('active label-primary');
		this.render();
	}
});

var mapChartView = new app.MapChartView({collection: forecastList});