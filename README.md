## Weather API

A scene that checks a weather API for the weather in a location and displays that weather condition, showing rain, thunder or snowflakes
Use real weather data from different locations by changing the coordinates, or change the value of the “fakeWeather” variable to see different weather conditions manifest.

![](screenshot/screenshot.png)

This scene shows you:

- How to call a REST API and parse a JSON response
- How to conditionally render different scenarios based on the API's responses
- How to simulate rain by moving multiple entities down and recycling them
- How to sumulate snow by slowly moving arnd rotating multiple entities down and recyling them


## Try it out

**Install the CLI**

Download and install the Decentraland CLI by running the following command:

```bash
npm i -g decentraland
```

**Previewing the scene**

Download this example and navigate to its directory, then run:

```
$:  dcl start
```

Any dependencies are installed and then the CLI opens the scene in a new browser tab.

**Scene Usage**

You need create an account on the the [Weather Unlocked API](http://www.weatherunlocked.com/products/weather-api/overview). Then, replace the values of the fields `appId` and `APIkey` with your own credentials.

You can also replace the values of `lat` and `lon` to access weather data from a different location. By default they're set to point to the city of Buenos Aires.

Modify the value of `fakeWeather` to see different weather conditions independently of what the real weather is. For example, if you set it to "snow" you will see snow. If `fakeWeather = null`, the scene will call the weather API with your credentials.

You can also modify `dropSpeed` and `flakeSpeed` to change the speed at which raindrops or snowflakes fall. This speed is the amount of milliseconds it takes them to fall.


Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.

If something doesn’t work, please [file an issue](https://github.com/decentraland-scenes/Awesome-Repository/issues/new).

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.
