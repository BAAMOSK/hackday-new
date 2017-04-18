//state object
let s = {
	//object is what is returned from getJSON request
  object : {},
	//weather is parsed result
  weather: [],
  weatherAPIKey: 'appid=22bb9867ef69b1e3bad17c9e2f85d1a1',
  autoCompleteCity: ''
};

//state manipulation functions
sF = {
  getWeather: function(search){
    $.getJSON(`http://api.openweathermap.org/data/2.5/forecast?${search}&type=like&${s.weatherAPIKey}`, function(data){
		  //api return object
			//set state object to data
      s.object = data.list;
			//separates data into properties
			//makes data easier to use
      s.weather = sF.parseWeather(s.object);
      sortedArr = sF.sortByDay(s.weather);

			//Generate HTML to render, then renders
      vF.populateWeatherBoxes(vF.makeWeatherStuff(sortedArr));
    });
  },
	//Cleans input data for easier use
  parseWeather: function(data) {
    let weather = [];
    for(let i=0; i < data.length; i++){
      var day = {};
      day.id = data[i].weather[0].id;
      day.icon = data[i].weather[0].icon;
      day.weather = data[i].weather[0].main;
      day.farenheit = ((data[i].main.temp*(9/5))-459.67).toFixed(0);
      day.celsius = (data[i].main.temp-273.15).toFixed(0);
      day.windSpeed = (data[i].wind.speed * 2.236).toFixed(2);
      day.day = data[i].dt_txt.slice(0,11);
      day.hour = data[i].dt_txt.slice(11);
      weather.push(day);
    }
    return weather;
  },
	//used to locate user's position
  geolocate: function() {
    let location = navigator.geolocation.getCurrentPosition(function(position) {
      let lat = `lat=${position.coords.latitude}`;
      let lon = `lon=${position.coords.longitude}`;
      let input = `${lat}&${lon}`;
			//separate call for geolocate()
      sF.getWeather(input);
    });
  },
	//uses underscore.js to group weather objects by their day
	//returns an array
  sortByDay: function(weather){
		//sorts into object by key
    let sortedObject = _.groupBy(weather,'day');
		//divides object by keys into array
    let returnArr= [];
    Object.keys(sortedObject).forEach(function(key){
      returnArr.push(sortedObject[key]);
    });
    return returnArr;
  }
};

//view manipulation functions
vF = {
  populateWeatherBoxes: function(arrOfStrings){
    var city = `<h2>${s.autoCompleteCity}</h2>`;
    $('#heroBox').html(city + arrOfStrings[0]);
    $('#box1').html(arrOfStrings[1]);
    $('#box2').html(arrOfStrings[2]);
    $('#box3').html(arrOfStrings[3]);
    $('#box4').html(arrOfStrings[4]);
  },
  //takes sorted weather arrays
	//creates HTML elements for render
	//adds into array and returns it
  makeWeatherStuff: function(arr){
		//replaces original array with string representing that arrays elements
    arr = arr.map(function(holderArray){
      let returnString = `<div class = "card-block"><h3>${holderArray[0].day}</h3>`;
      holderArray.forEach(function(val,index){
        returnString += `<h4><img src='http://openweathermap.org/img/w/${val.icon}.png'>${val.hour}</h4>` +
												`<span class = "underline">Weather: <span class='float-right'>${val.weather}</span</span><br>` +
												`<span class = "underline">Temperature: <span class='float-right'>${val.farenheit}F</span></span><br>` +
												`<span class = "underline">windSpeed: <span class='float-right'>${val.windSpeed}mph</span></span>`;
      });
      returnString += '</div>';
      return returnString;
    });
    return arr;
  }
};

//EVENT HANDLERS

$('#geoLocate').click(function(event) {
  sF.geolocate();
  event.preventDefault();
});

//Listens for enter press
$('#search-field').keypress(function(event){
  if(event.charCode=='13'){
    event.preventDefault();
    sF.getWeather('q='+$(this).val().toString());
  }
});


//CRAZY EXPERIMENTAL DROPDOWN NONSENSE
$('#search-field').autocomplete({
	//min length of string before function runs
  minLength: 3,
  //source determines where the autocomplete data comes from.  It then packages the resulting data in the response
  source: function (request, response) {
    $.getJSON(`http://gd.geobytes.com/AutoCompleteCity?callback=?&q=${request.term}`,function(data){
      if(data.length > 0) {
			//sets autoCompleteCity to most likely city as long as match
        s.autoCompleteCity = data[0];
      }
      response(data);
	 });
  },

 //jQuery UI stuff.  UI is the item selected in the dropdown.
 //Then we make the search field = the selected item
  select: function (event, ui) {
    var selectedObj = ui.item;
    s.autoCompleteCity = selectedObj.value;
  	sF.getWeather('q=' + selectedObj.value.toString());
  }
});
