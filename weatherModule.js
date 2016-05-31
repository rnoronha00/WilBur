var request = require("request");
var fs = require("fs");

var options;

module.exports.setCurrentWeatherOptions = function(httpMethod, apiURL, jsonTF) {

    options = {

        method: httpMethod,
        url: apiURL,
        json: jsonTF
    }

    function callback(error, response, body) {

        if (!error && response.statusCode == 200) {
            
            var weather = JSON.parse(body);
            fs.writeFile("weatherData.json", JSON.stringify(weather), "utf8");
        }
    }

    request(options, callback);
}

module.exports.getCurrentWeather = function () {
    
    
}