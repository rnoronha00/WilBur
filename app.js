var builder = require("botbuilder");
var restify = require("restify");
var weatherModule = require("./weathermodule");
var forecastWeather = require("./forecastWeather");

//create server
var server = restify.createServer();

// //LUIS dialog
var model = "https://api.projectoxford.ai/luis/v1/application?id=c413b2ef-382c-45bd-8ff0-f76d60e2a821&subscription-key=ecede61eb8914220ad87d4e78e87a48d&q=";
var luisDialog = new builder.LuisDialog(model);

//var weatherBot = new builder.TextBot(userWelcomeMessage = "Hi! I'm a WeatherBot. But you can call me WilBur.");
var weatherBot = new builder.BotConnectorBot();
weatherBot.add("/", luisDialog);

luisDialog.onBegin(function(session) {

    if (!session.userData.name) {

        session.send("Hi! I'm a WeatherBot. But you can call me WilBur. What's your name?");
        session.beginDialog("/profile");
    } else {

        session.send("Hi " + session.userData.name +". How can I help you?");
    }
});

luisDialog.on("builtin.intent.weather.check_weather", [

    function (session, args, next) {

        var city = builder.EntityRecognizer.findEntity(args.entities, "builtin.weather.absolute_location");

        var weatherInfo = session.dialogData.weatherInfo = {

            city: city ? city.entity : null
        };

        next();
    },

    function (session, results, next) {

        var weatherInfo = session.dialogData.weatherInfo;

        if (results.response) {

            weatherInfo.city = results.response;

            //set up weather data
            var currentWeatherURL = "http://api.openweathermap.org/data/2.5/weather?q=" + weatherInfo.city + "&units=metric&APPID=8f1c42c03c445da3173a2614fd3ba64f";
            var forecastWeatherURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + weatherInfo.city + "&units=metric&APPID=8f1c42c03c445da3173a2614fd3ba64f";

            session.send("Getting weather in " + weatherInfo.city + "..........");
            weatherModule.setCurrentWeatherOptions("get", currentWeatherURL, false);
            forecastWeather.setForecastOptions("get", forecastWeatherURL, false);
        }

        next();
    },

    function (session) {

        var weatherInfo = session.dialogData.weatherInfo;

        if (weatherInfo.city) {

            var forecastData = require("./forecastData.json");
            var weatherData = require("./weatherData.json");

            session.send("The current temperature in " + weatherData.name + "," + weatherData.sys.country + " is " + weatherData.main.temp + " degrees Celcius, with " + weatherData.weather[0].description + ". The forecast in " + forecastData.city.name + " is " + forecastData.list[0].dt_txt + " is " + forecastData.list[0].main.temp + " degrees" +
                "\n\n\nWas there anything else that I could help you with?");

            //session.endDialog();
            session.beginDialog("/");

        } else {

            session.send("Didn't get the city");
        }
    }
]);

luisDialog.onDefault(function(session) {

    session.beginDialog("/userinput", session.message);
});

weatherBot.add("/userinput", new builder.CommandDialog()

    .matches("^help", function(session) {

        session.send("Hi " + session.userData.name + "! If you want to ask me the weather just type in ''What's the weather?'' or ''What's the forecast'' and I'll provide you with the weather information in " + session.userData.city + ".\n\n\n" +
            "For weather or forecast in another city just include the name of the city in your question\n\n\nWas there anything else I could help you with today?");

        //session.endDialog();
        session.beginDialog("/");
    })

    .matches("^bye", function(session) {

        session.send("Bye " + session.userData.name);
    })

    .matches("^hi", function(session) {

        session.beginDialog("/");
    })

    .onDefault(function(session) {

        session.send("Sorry " + session.userData.name + ". I didn't get that. Can you rephrase that?");
    })
);

weatherBot.add("/profile", [

    function (session) {

        builder.Prompts.text(session, "What's your name?");
    },

    function(session, results, next) {

        session.userData.name = results.response;
        next()
    },

    function(session) {

        builder.Prompts.text(session, "Nice to meet you " + session.userData.name + ". What city do you live in?");
    },

    function(session, results) {

        session.userData.city = results.response;
        session.send("My mother's second cousin twice removed just so happens to know a guy from " + session.userData.city + "! We have so much in common!\n\n\n" + "If you want to talk to me just include my name in your question. I can tell you the current weather or provide with a 5 day forecast for " +
            session.userData.city + " or any city in the world.\n\n\n" + "How can I help you out " + session.userData.name + "?");

        session.beginDialog("/");
    }
]);

server.use(weatherBot.verifyBotFramework({ appId: 'weatherbot', appSecret: 'weatherbot' }));
server.post('/api/messages', weatherBot.verifyBotFramework(), weatherBot.listen());

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

//weatherBot.listenStdin();