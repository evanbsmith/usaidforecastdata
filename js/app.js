$('#pageWidth').text("Width: " + $(window).width());
$(window).on('resize', function(){
  $('#pageWidth').text("Width: " + $(window).width());
});

var toSectorLong = function(sector){
    switch(sector){
      case "dg":
        return "Democracy, Rights, & Governance";
        break;
      case "ag":
        return "Agriculture & Food Security";
        break;
      case "ed":
        return "Education";
        break;
      case "gh":
        return "Global Health";
        break;
      case "eg":
        return "Economic Growth & Trade";
        break;
      case "cr":
        return "Crisis & Conflict";
        break;
      case "en":
        return "Environment & Climate Change";
        break;
      case "ot":
        return "Other";
        break;
      case "ws":
        return "Water & Sanitation";
        break;
      case "ge":
        return "Gender Equality & Empowerment";
        break;
    }
};

var toSectorShort = function(sector){
  switch(sector){
    case "dg":
      return "DRG";
      break;
    case "ag":
      return "Ag./FS";
      break;
    case "ed":
      return "Ed.";
      break;
    case "gh":
      return "Health";
      break;
    case "eg":
      return "Econ. Gr.";
      break;
    case "cr":
      return "Crisis";
      break;
    case "en":
      return "Env.";
      break;
    case "ot":
      return "Other";
      break;
    case "ws":
      return "Water";
      break;
    case "ge":
      return "Gender";
      break;
  }
};

var toDollars = function(num){
  var dollars = d3.format("$,f");
    return dollars(num);
};

var toMillions = function(num){
  return toDollars(Math.round(num/100000)/10) + "m";
};

(function($) {
	var toType = function(obj) {
	  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
	};

  

  // Add segments to a slider
  $.fn.addSliderSegments = function (amount) {
    return this.each(function () {
      var segmentGap = 100 / (amount) + "%",
      	  segment = "<div class='ui-slider-segment' style='margin-left: " + segmentGap + ";'></div>",
          fullSegment = "";
        for(var i=0;i<amount-1;i++){
        	fullSegment = fullSegment + segment;
        }
      $(this).prepend(fullSegment);
    });
  };
 })(jQuery);