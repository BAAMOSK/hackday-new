//state object
let s = {
	object : {},
  weather: [],

  weatherAPIKey: 'appid=22bb9867ef69b1e3bad17c9e2f85d1a1',
  geoKey: 'key=AIzaSyDaLi4kejMskpWXIeVQwXWMviWSoj-ZQOA',
  weatherIcons: {
    sunny: `<i class="wi wi-day-sunny "></i>`,
    cloudy: `<i class="wi wi-cloudy"></i>`,
    rainy: `<i class="wi wi-rain"></i>`,
    thunder: `<i class="wi wi-thunderstorm"></i>`,
    snow: `<i class="wi wi-snow"></i>`,
  },
	autoCompleteCity: ''
}

//state manipulation functions
sF = {
  self: this,
	getWeather: function(search){

		$.getJSON(`http://api.openweathermap.org/data/2.5/forecast?${search}&type=like&${s.weatherAPIKey}`,function(data){
				s.object = data.list;
        //console.log("test")
				sF.parseWeather(s.object);
        //populate boxes
        vF.populateWeatherBoxes()
		});
  },

	parseWeather: function(data) {
    s.weather = [];
		for(let i=4;i<40;i+=8){
			var day = {};
		day.id = data[i].weather[0].id;
    day.icon = data[i].weather[0].icon;
		day.weather = data[i].weather[0].main;
		day.farenheit = ((data[i].main.temp*(9/5))-459.67).toFixed(0);
		day.celsius = (data[i].main.temp-273.15).toFixed(0);
		day.windSpeed = data[i].wind.speed;
		day.day = data[i].dt_txt.slice(0,11);
		s.weather.push(day);
		}
	},

	geolocate: function() {
		let location = navigator.geolocation.getCurrentPosition(function(position) {
      console.log("Running geolocation");
			let lat = `lat=${position.coords.latitude}`;
			let lon = `lon=${position.coords.longitude}`;
			let input = `${lat}&${lon}`;
			sF.getWeather(input);
		});
	}	
	

};

//view manipulation functions
vF = {
  //populate the windows
  populateWeatherBoxes: function(){
    $('#heroLocation').html(`<p>${s.autoCompleteCity}</p>`);
    $('#heroBox').html(`<h2>${s.weather[0].day}</h2><img src='http://openweathermap.org/img/w/${s.weather[0].icon}.png'><br>${s.weather[0].weather}<br><span>Temperature: ${s.weather[0].farenheit}&deg;F</span><span> / ${s.weather[0].celsius}&deg;C</span><br>
                         <span>Wind Speed: ${s.weather[0].windSpeed}</span>`);
    
    $('#box1').html(`<h2>${s.weather[1].day}</h2><img src='http://openweathermap.org/img/w/${s.weather[1].icon}.png'><br>${s.weather[1].weather}`);
    $('#box2').html(`<h2>${s.weather[2].day}</h2><img src='http://openweathermap.org/img/w/${s.weather[2].icon}.png'><br>${s.weather[2].weather}`);
    $('#box3').html(`<h2>${s.weather[3].day}</h2><img src='http://openweathermap.org/img/w/${s.weather[3].icon}.png'><br>${s.weather[3].weather}`);
    $('#box4').html(`<h2>${s.weather[4].day}</h2><img src='http://openweathermap.org/img/w/${s.weather[4].icon}.png'><br>${s.weather[4].weather}`);
  }
}



$('#geoLocate').click(function(event) {
	sF.geolocate();
  event.preventDefault();

});
//
//Search field stuff
//
/*
$('#searchForm').submit(function(event){
  event.preventDefault();
  console.dir(event);
  //sF.getWeather('q='+$('#searchForm').val().toString())
})
*/

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