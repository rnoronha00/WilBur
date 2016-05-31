var request = require("request");
var fs = require("fs");

var options;

function callback(error, response, body) {

    if (!error && response.statusCode == 200) {
        
        var forecast = JSON.parse(body);
        fs.writeFile("forecastData.json", JSON.stringify(forecast), "utf8");
    }
}

module.exports.setForecastOptions = function(httpMethod, apiURL, jsonTF) {

    options = {

        method: httpMethod,
        url: apiURL,
        json: jsonTF
    }
    
    request(options, callback);
}

module.exports.getForecastData = function () {
    
   
}