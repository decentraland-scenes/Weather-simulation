## Weather API

A scene that checks a weather API for the weather in a location and displays that weather condition, showing rain, thunder or snowflakes
Use real weather data from different locations by changing the coordinates, or change the value of the “fakeWeather” variable to see different weather conditions manifest.

![](screenshot/screenshot.png)

[Explore the scene](https://weather-yvahddfxgo.now.sh): this link takes you to a copy of the scene deployed to a remote server where you can interact with it just as if you were running `dcl start` locally.

**Install the CLI**

Download and install the Decentraland CLI by running the following command

```bash
npm i -g decentraland
```

For a more details, follow the steps in the [Installation guide](https://docs.decentraland.org/documentation/installation-guide/).


**Previewing the scene**

Once you've installed the CLI, download this example and navigate to its directory from your terminal or command prompt.

_from the scene directory:_

```
$:  dcl start
```

Any dependencies are installed and then the CLI will open the scene in a new browser tab automatically.

**Usage**

You need create an account on the the [Weather Unlocked API](http://www.weatherunlocked.com/products/weather-api/overview). Then, replace the values of the fields `appId` and `APIkey` with your own credentials.

You can also replace the values of `lat` and `lon` to access weather data from a different location. By default they're set to point to the city of Buenos Aires.

Modify the value of `fakeWeather` to see different weather conditions independently of what the real weather is. For example, if you set it to "snow" you will see snow. If `fakeWeather = null`, the scene will call the weather API with your credentials.

You can also modify `dropSpeed` and `flakeSpeed` to change the speed at which raindrops or snowflakes fall. This speed is the amount of milliseconds it takes them to fall.


Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.