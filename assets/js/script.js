var apiKey = "9ff9f663e00166a0cdb133e379c01b8d";

// Global variables
var cities = [];
var currentCityHeaderEl = document.querySelector("#current-city-header");
var fiveDayContainerEl = document.querySelector("#five-day-container");
var cityFormEl = document.querySelector("#city-search");
var cityListEl = document.querySelector("#city-list");

// Fetch weather data
var getWeatherData = function(city) {

    var apiURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=" + apiKey;

    // Get latitude and longitude of user-input city
    fetch(apiURL)
    .then(function(forecastResponse) {
        return forecastResponse.json(); 
    })
    .then(function(forecastData) {
        var lat = forecastData.city.coord.lat;
        var lon = forecastData.city.coord.lon;

        // Use the lat and long to get onecall
        var onecallURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=minutely,hourly&appid=7fc21c7de7016c8d72a7a8f065f6d9c4"
        return fetch(onecallURL)
    })
    
    .then(function(response) {
        return response.json();
    })
    // build page data
    .then(function(data) {
        printCurrentData(data, city);
        printFiveDay(data);
        saveCity(city);
    })

    // Error Message
    .catch(function(error) {
        alert("Weather must be bad we can't connect to the server. Please try again!");
    });
};

// Current city weather
var printCurrentData = function(data, city) {

    // Current city header
    var iconImgEl = getIcon(data.current.weather[0].icon, data.current.weather[0].description);
    var date = convertDate(data.current.dt);
    currentCityHeaderEl.textContent = city + " (" + date + ") ";
    currentCityHeaderEl.appendChild(iconImgEl);

    // Get current stats
    var temp = data.current.temp;
    var humidity = data.current.humidity;
    var windSpeed = data.current.wind_speed;
    var uvIndex = data.current.uvi;

    // Update current stats on screen (span elements available in HTML)
    document.querySelector("#temperature").textContent = temp;
    document.querySelector("#humidity").textContent = humidity;
    document.querySelector("#wind-speed").textContent = windSpeed;
    var uvIndexEl = document.querySelector("#uv-index");

    // Set data for UV Index
    uvIndexEl.textContent = uvIndex;
    if(uvIndex > 11) {
        uvIndexEl.classList = "bg-dark text-white p-2";
    }
    else if(uvIndex > 8) {
        uvIndexEl.classList = "bg-danger text-white p-2";
    }
    else if(uvIndex > 4) {
        uvIndexEl.classList = "bg-warning p-2";
    }
    else {
        uvIndexEl.classList = "bg-success text-white p-2";
    }
};

// Weather Cards
var printFiveDay = function(data) {

    // Clear the current data
    fiveDayContainerEl.innerHTML = "";

    // Loop through each day
    for(var i = 0; i < 5; i++) {
        buildCard(data.daily[i]);
    }
};

// Build card and Add to container
var buildCard = function(data) {

    var date = convertDate(data.dt);
    var iconImgEl = getIcon(data.weather[0].icon, data.weather[0].description);
    var temp = data.temp.day;
    var humidity = data.humidity;
    var cardEl = document.createElement("div");
    cardEl.classList = "col card text-white bg-primary p-3 m-1";

    // Build elements inside the card in DOM
    var titleEl = document.createElement("h4");
    titleEl.classList = "card-title";
    titleEl.textContent = date;
    iconImgEl.classList = "w-50 h-auto";
    var tempEl = document.createElement("p");
    tempEl.textContent = "Temp: " + temp + " °F"; 
    var humidityEl = document.createElement("p");
    humidityEl.textContent = "Humidity: " + humidity + "%";

    // Add elements to card container, then add card to 5 day container
    cardEl.appendChild(titleEl);
    cardEl.appendChild(iconImgEl);
    cardEl.appendChild(tempEl);
    cardEl.appendChild(humidityEl);
    fiveDayContainerEl.appendChild(cardEl);
}

// Adds city to the list of previous searches
var addCityToList = function(city) {

    // Build city element
    var cityEl = document.createElement("li");
    cityEl.classList = "list-group-item text-capitalize city-list-item";
    cityEl.textContent = city;

    // Add city to the list
    cityListEl.appendChild(cityEl);
}

// Retrieves cities from local storage on page load
var retrieveCities = function() {

    var storageObject = JSON.parse(localStorage.getItem("cities"));
    if(storageObject) {
        cities = storageObject;
    }

    // If no cities default to Cocoa Beach
    if(cities.length === 0) {
        getWeatherData("Cocoa Beach");
    }
    else {
        getWeatherData(cities[0]);
        for(var i = 0; i < cities.length; i++) {
            addCityToList(cities[i]);
        }
    }
}

// Save city to local storage
var saveCity = function(city) {
    city = city.toLowerCase();
    if(!cities.includes(city)) {
        cities.push(city);
        addCityToList(city);
        localStorage.setItem("cities", JSON.stringify(cities));
    }
}

// Get the weather icon
var getIcon = function(iconCode, description) {
    var iconImg = document.createElement("img");
    iconImg.setAttribute("src", "http://openweathermap.org/img/wn/" + iconCode + ".png")
    iconImg.setAttribute("alt", description)
    return iconImg;
}

// Helper method to format date
var convertDate = function(longDate) {
    var date = new Date(longDate * 1000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // get month returns month 0-11
    var day = date.getDate();
    return month + "/" + day + "/" + year;
}

// Submit the form
var formSubmitHandler = function(event) {
    event.preventDefault();
    cityInputEl = document.querySelector("#city")
    var city = cityInputEl.value.trim();

    if(city) {
        getWeatherData(city);
        cityInputEl.value = "";
    }
    else {
        alert("You must enter a city.");
    }
}

// Click on previously saved city
var cityClickHandler = function(event) {
    getWeatherData(event.target.textContent);
}

// Event listeners
cityFormEl.addEventListener("submit", formSubmitHandler);
cityListEl.addEventListener("click", cityClickHandler)

// On page load
retrieveCities();