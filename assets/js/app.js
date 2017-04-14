//state object
let s = {
	//object is what is returned from getJSON request 
	object : {},
	//weather is parsed result
  weather: [],
  weatherAPIKey: 'appid=22bb9867ef69b1e3bad17c9e2f85d1a1',
	autoCompleteCity: ''
}

//state manipulation functions
sF = {
  self: this,
	getWeather: function(search){

		$.getJSON(`http://api.openweathermap.org/data/2.5/forecast?${search}&type=like&${s.weatherAPIKey}`, function(data){
				s.object = data.list;
        //console.log("test")
				sF.parseWeather(s.object);
				sortedArr = sF.sortByDay(s.weather);
				//console.log('sortedArr is: ')
				//console.log(sortedArr);
				let cleanedWeather = vF.makeWeatherStuff(sortedArr);
				console.log("cleaned array is: ")
				console.log(cleanedWeather)
        //populate boxes
        vF.populateWeatherBoxes(cleanedWeather);
		});
  },

	parseWeather: function(data) {
    s.weather = [];
		for(let i=0;i<40;i++){
			var day = {};
		day.id = data[i].weather[0].id; 
    day.icon = data[i].weather[0].icon;
		day.weather = data[i].weather[0].main;
		day.farenheit = ((data[i].main.temp*(9/5))-459.67).toFixed(0);
		day.celsius = (data[i].main.temp-273.15).toFixed(0);
		day.windSpeed = data[i].wind.speed;
		day.day = data[i].dt_txt.slice(0,11);
		day.hour = data[i].dt_txt.slice(11);
		s.weather.push(day);
		}
	},

	geolocate: function() {
		let location = navigator.geolocation.getCurrentPosition(function(position) {
      //console.log("Running geolocation");
			let lat = `lat=${position.coords.latitude}`;
			let lon = `lon=${position.coords.longitude}`;
			let input = `${lat}&${lon}`;
			sF.getWeather(input);
		});
	},
	sortByDay: function(weather){
		let sortedObject = _.groupBy(weather,'day');
		let returnArr= [];
		Object.keys(sortedObject).forEach(function(key){
			returnArr.push(sortedObject[key])
		});
		//console.log(returnArr);
		return returnArr;
	}


};

//view manipulation functions
vF = {
  //populate the windows
  populateWeatherBoxes: function(arrOfStrings){
    //$('#heroLocation').html(`<p>${s.autoCompleteCity}</p>`);
		var city = `<h2>Weather in ${s.autoCompleteCity}</h2>`;
    $('#heroBox').html(city + arrOfStrings[0]);
    $('#box1').html(arrOfStrings[1]);
    $('#box2').html(arrOfStrings[2]);
    $('#box3').html(arrOfStrings[3]);
    $('#box4').html(arrOfStrings[4]);
  },

	makeWeatherStuff: function(arr){
		arr = arr.map(function(holderArray){
			let returnString = `<div class = "card-block"><h3>${holderArray[0].day}</h3>`;
			holderArray.forEach(function(val,index){
				returnString += `

				<h4><img src='http://openweathermap.org/img/w/${val.icon}.png'>${val.hour}</h4>
				<span class = "underline">Weather: <span class='float-right'>${val.weather}</span</span><br>
				<span class = "underline">Temperature: <span class='float-right'>${val.farenheit}</span></span><br>
				<span class = "underline">windSpeed: <span class='float-right'>${val.windSpeed}</span></span>
				`

			});
			returnString += `</div>`
			return returnString;
		});
		return arr;
	}
}




$('#geoLocate').click(function(event) {
	sF.geolocate();
  event.preventDefault();

});

$('#search-field').keypress(function(event){
  //console.log(event.charCode);
  if(event.charCode=='13'){
    event.preventDefault();
    sF.getWeather('q='+$(this).val().toString());
		console.log(s.autoCompleteCity);
  }
})


//CRAZY EXPERIMENTAL DROPDOWN NONSENSE
$("#search-field").autocomplete({
 minLength: 3,
 //source determines where the autocomplete data comes from.  It then packages the resulting data in the response
 source: function (request, response) {
  $.getJSON(`http://gd.geobytes.com/AutoCompleteCity?callback=?&q=${request.term}`,function(data){
		if(data.length > 0) {
			s.autoCompleteCity = data[0];
		}
		//console.log(data);
		response(data); }
  );
 },
 //jQuery UI stuff.  UI is the item selected in the dropdown.
 //Then we make the search field = the selected item
 select: function (event, ui) {
  var selectedObj = ui.item;
	s.autoCompleteCity = selectedObj.value;
  sF.getWeather('q=' + selectedObj.value.toString())
}
});
