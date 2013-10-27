var app = app || {};

app.ForecastList = Backbone.Collection.extend({
	model: app.ForecastItem,
	url: 'https://spreadsheets.google.com/feeds/cells/0AmD09eT88oNKdHFFUDFCaUp3ZVZmUmU0am80MXlHWVE/od6/public/basic?alt=json-in-script',
	sync: function(method, model, options){
		var params = _.extend({
			dataType: 'jsonp',
			error: function(e, eText, eThrown){
				console.log("error");
				console.log(e);
				console.log(eText);
				console.log(eThrown);
			},
			processData: false,
			success: function(data){
				console.log("success");
				console.log(data);
			},
			type: 'GET',
			url: this.url
		},options);
		return $.ajax(params);
	},
	parse: function(response){	
		var rawData = response.feed.entry,
			data = [],
			rowTemp = {},
			keyRow = [],
			lastRow = 0;
		for (var i in rawData){  // could refactor to use forEach and make more efficient by knowing number of columns 
			var thisRow = parseInt(rawData[i].link[0].href.substring(rawData[i].link[0].href.lastIndexOf("R")+1, rawData[i].link[0].href.lastIndexOf("C")));
			var thisColumn = parseInt(rawData[i].link[0].href.substring(rawData[i].link[0].href.lastIndexOf("C")+1, rawData[i].link[0].href.length));
			if (thisRow > lastRow) { // If we begin a new row
				lastRow = thisRow;
				if(thisRow === 1) { // First Row - consists of column headers that will be keys for our data object 
					keyRow.push(rawData[i].content.$t);
				}
				else { // After First Row - keyRow is filled and useable
					var currentKey = keyRow[thisColumn - 1];
					
					if(thisRow === 2){ // Second Row - first instance of real data, start adding to our rowTemp variable
						rowTemp[currentKey] = rawData[i].content.$t;
					}
					else { // All other rows - the rowTemp variable will be full and we puch it to data, then reset it and start refilling
						data.push(rowTemp);
						rowTemp = new Object(); 
						rowTemp[currentKey] = rawData[i].content.$t;
					}
				}
			}
			else { // We are not starting a new row
				if(thisRow === 1){ // We are in the first row, and should add column headers to our keyRow variable
					keyRow.push(rawData[i].content.$t);
				}
				else { // We are dealing with values and rowTemp is not full, so we should add them to our rowTemp variable
					var currentKey = keyRow[thisColumn - 1];
					rowTemp[currentKey] = rawData[i].content.$t;
				}
			}
		}
		data.push(rowTemp); // After for loop rowTemp is still full with last rown of data. So we push it into data and are done.
		data = _.filter(data, function(row){return row.sector !== 'psc';});
		return data;
	},
	aggregate: function(field){ // aggregates active items by a given attribute field
		var currentList = this.filter(function(item){
			return item.get("active") === true;
		});

		var sum = 0;
		_.each(currentList, function(item){
			sum+=parseInt(item.attributes[field],0);
		});
		return sum;
	},
	count: function(){ // counts active items
		var currentList = this.filter(function(item){
			return item.get("active") === true;
		});
		return _.size(currentList);
	},
	summarize: function(options){ // utility function that summarizes collection by nestField and returns object or array
		var params = _.extend({ // use user-defined options if available 
			nestField: "map_location",
			type: "object",
			sort: "ascending" // Not implemented yet. May be more appropriate in View
		}, options);

		var currentList = this.filter(function(item){
				return item.get("active") === true;
			});

		if (params.type === "object"){
			var summaryListObject = _.countBy(currentList, function(item){
				return item.get(params.nestField);
			});
			return summaryListObject;
		}
		else if (params.type === "array"){
			currentList = _.groupBy(currentList,function(e){
				return e.attributes[params.nestField];
			});

			var summaryListArray = _.map(currentList,function(value, key, list){
				return {
					key: key,
					count: value.length,
					dollars: _.reduce(value,function(memo,item){
						return memo + parseInt(item.attributes.est_cost_min,0);
					},0)
				}
			});
			// console.log("Summary List");
			// console.log(summaryListArray);

			return _.sortBy(summaryListArray, function(item){return item.key;});
		}

		// return summaryList; // may need to transform this to an array
	},
	listCountries: function(){
		var list = this.pluck("map_location");
		var sortedList = _.toArray(list).sort();
		var uniqueList = _.uniq(sortedList);
		return uniqueList;
	},
	listDates: function(){
		var monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
		var list = this.pluck("date");
		var sortedList = _.toArray(list).sort();
		var uniqueList = _.uniq(sortedList);
		var datesArray = [];
		_.each(uniqueList,function(val,index){
			datesArray[index] = {
				value: val,
				date: new Date(val),
				shortHand: monthShort[new Date(val).getMonth()] + " " + new Date(val).getFullYear() 
			}
		});
		datesArray = datesArray.sort(function(a,b){return a.date-b.date;})
		return datesArray;
	},
	applyFilter: function(filters){
		var now1 = new Date();

		var filterFields = [];

		for(key in filters){
			if(filters[key].length > 0){
				filterFields.push(key);
			}
		}

		this.each(function(item){
			// console.log(item);
			var temp = [];
			for(var i = 0; i < filterFields.length; i++){
				var key = filterFields[i];
				temp[i] = _.find(filters[key],function(filter){
					return filter === item.get(key);
				});
				console.log("Process!");
			}
			if(_.compact(temp).length === filterFields.length){
				item.set("active", true);
				// console.log("Match!");
			}
			else{
				item.set("active", false);
			}
		});
		this.trigger("filtered");
		var now2 = new Date();
		console.log("timer");
		console.log(now2 - now1);
	}
});

var forecastList = new app.ForecastList;

forecastList.fetch();
