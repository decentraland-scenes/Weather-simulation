import { fakeWeather, rainSpeed, snowSpeed, callUrl } from '../params'

// possible weather conditions
export enum Weather {
  sun,
  clouds,
  rain,
  heavyRain,
  snow,
  storm,
}

// object to store weather variables
export class CurrentWeather {
  weather: Weather
  dropsToAdd: number
  flakesToAdd: number
  spawnInterval: number
  currentSpawnInterval: number
  checkInterval: number = 0
  lightningCounter: number = 10
  clouds: Entity
  house: Entity
  constructor(
    weather: Weather = Weather.sun,
    dropsToAdd: number = 0,
    flakesToAdd: number = 0,
    interval: number = 100,
    currentInterval: number = 0
  ) {
    this.weather = weather
    this.dropsToAdd = dropsToAdd
    this.flakesToAdd = flakesToAdd
    this.spawnInterval = interval
    this.currentSpawnInterval = interval
  }
}

// system to regularly update weather conditions
export class CheckWeather implements ISystem {
  weather: CurrentWeather
  constructor(weather) {
    this.weather = weather
  }
  update(dt: number) {
    this.weather.checkInterval -= 1
    if (this.weather.checkInterval < 0) {
      getWeather(this.weather)
      this.weather.checkInterval = 100000
    }
  }
}

// system to flash lightning when stormy
export class LightningSystem implements ISystem {
  weather: CurrentWeather
  lightning: Entity
  lightningModels: GLTFShape[]
  constructor(weather, lightning, models) {
    this.weather = weather
    this.lightning = lightning
    this.lightningModels = models
  }
  update() {
    if (this.weather.weather === Weather.storm) {
      this.weather.lightningCounter -= 1
      //log("timer " + timer.count)
      if (this.weather.lightningCounter < 0) {
        const lightningNum: number = Math.floor(Math.random() * 25) + 1
        if (lightningNum >= this.lightningModels.length) {
          if (this.lightning.hasComponent(GLTFShape)) {
            this.lightning.removeComponent(GLTFShape)
            this.weather.lightningCounter = Math.random() * 20
            return
          }
        } else {
          this.lightning.addComponentOrReplace(
            this.lightningModels[lightningNum]
          )
          this.weather.lightningCounter = Math.random() * 10
        }
      }
    }
  }
}

// if no fake weather in params, check weather API
function getWeather(weather: CurrentWeather) {
  let newWeather: Weather = Weather.sun
  if (fakeWeather) {
    newWeather = mapWeather(fakeWeather)
    setWeather(weather, newWeather)
  } else {
    executeTask(async () => {
      try {
        log('getting new weather')
        const response = await fetch(callUrl)
        const json = await response.json()
        newWeather = mapWeather(json.wx_desc)
        setWeather(weather, newWeather)
      } catch {
        log('failed to reach URL', error)
      }
    }).catch((error) => log(error))
  }
}

// map verbose API responses to distinct possible values
function mapWeather(weather: string) {
  log(weather)
  let simpleWeather: Weather
  if (weather.match(/(thunder)/gi)) {
    simpleWeather = Weather.storm
  } else if (weather.match(/(snow|ice)/gi)) {
    simpleWeather = Weather.snow
  } else if (weather.match(/(heavy|torrential)/gi)) {
    simpleWeather = Weather.heavyRain
  } else if (weather.match(/(rain|drizzle|shower)/gi)) {
    simpleWeather = Weather.rain
  } else if (weather.match(/(cloud|cloudy|overcast|fog|mist)/gi)) {
    simpleWeather = Weather.clouds
  } else {
    simpleWeather = Weather.sun
  }
  return simpleWeather
}

// change values in weather object based on weather conditions
function setWeather(current: CurrentWeather, newWeather: Weather) {
  if (newWeather === current.weather) {
    return
  }
  current.weather = newWeather
  switch (current.weather) {
    case Weather.storm:
      current.dropsToAdd = 100
      current.flakesToAdd = 0
      current.spawnInterval = rainSpeed / current.dropsToAdd
      break
    case Weather.snow:
      current.dropsToAdd = 0
      current.flakesToAdd = 50
      current.spawnInterval = (snowSpeed * 10) / current.flakesToAdd
      break
    case Weather.heavyRain:
      current.dropsToAdd = 50
      current.flakesToAdd = 0
      current.spawnInterval = rainSpeed / current.dropsToAdd
      break
    case Weather.rain:
      current.dropsToAdd = 10
      current.flakesToAdd = 0
      current.spawnInterval = rainSpeed / current.dropsToAdd //(10/(0.033*rainSpeed)*30 ) /weather.dropsToAdd
      break
    case Weather.clouds:
      current.dropsToAdd = 0
      current.flakesToAdd = 0
      break
    case Weather.sun:
      current.dropsToAdd = 0
      current.flakesToAdd = 0
      break
  }
  setHouse(current)
  setClouds(current)
}

// show no clouds / white clouds / dark clouds
export function setClouds(weather: CurrentWeather) {
  const clouds = weather.clouds
  switch (weather.weather) {
    case Weather.storm:
      clouds.addComponentOrReplace(new GLTFShape('models/dark-cloud.gltf'))
      clouds.getComponent(Transform).position = new Vector3(8, 10, 8)
      break
    case Weather.snow:
      clouds.addComponentOrReplace(new GLTFShape('models/dark-cloud.gltf'))
      clouds.getComponent(Transform).position = new Vector3(8, 10, 8)
      break
    case Weather.heavyRain:
      clouds.addComponentOrReplace(new GLTFShape('models/dark-cloud.gltf'))
      clouds.getComponent(Transform).position = new Vector3(8, 10, 8)
      break
    case Weather.rain:
      clouds.addComponentOrReplace(new GLTFShape('models/clouds.gltf'))
      clouds.getComponent(Transform).position = new Vector3(5, 10, 12)
      break
    case Weather.clouds:
      clouds.addComponentOrReplace(new GLTFShape('models/clouds.gltf'))
      clouds.getComponent(Transform).position = new Vector3(5, 10, 12)
      break
    case Weather.sun:
      clouds.removeComponent(GLTFShape)
      break
  }
}

// show house model as dry / wet / snowy
export function setHouse(weather: CurrentWeather) {
  const house = weather.house
  switch (weather.weather) {
    case Weather.storm:
      house.addComponentOrReplace(new GLTFShape('models/house_wet.gltf'))
      break
    case Weather.snow:
      house.addComponentOrReplace(new GLTFShape('models/house_snow.gltf'))
      break
    case Weather.heavyRain:
      house.addComponentOrReplace(new GLTFShape('models/house_wet.gltf'))
      break
    case Weather.rain:
      house.addComponentOrReplace(new GLTFShape('models/house_wet.gltf'))
      break
  }
}
