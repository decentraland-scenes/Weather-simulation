//// VALUES TO CONFIGURE ////////

// fakeWeather CONTROLS WHAT WEATHER CONDITION TO SHOW IN THE SCENE
// TRY THE FOLLOWING VALUES:
// `snow`
// `thunder`
// `heavy rain`
// `light rain`
// `cloudy`
let fakeWeather: string | null = `snow`

//////////////////////////////

// THESE VALUES WILL BE USEFUL WHEN HITTING THE WEATHER API (NOT CURRENTLY SUPPORTED)

//const lat: string = '-34.55'
//const lon: string = '-58.46'

const appId: string = 'bb6063b3'
const APIkey: string = '2e55a43d3e62d76f145f28aa7e3990e9'
const lat: string = '37'
const lon: string = '5'

const rainSpeed = 4
const snowSpeed = 1

////////////////////////////////
// CUSTOM TYPES

const callUrl: string =
  'http://api.weatherunlocked.com/api/current/' +
  lat +
  ',%20' +
  lon +
  '?app_id=' +
  appId +
  '&app_key=' +
  APIkey

export enum Weather {
  sun,
  clouds,
  rain,
  heavyRain,
  snow,
  storm
}

export enum PrecipType {
  drop,
  flake
}

////////////////////////
// CUSTOM COMPONENTS

@Component('nextPos')
export class NextPos {
  nextPos: Vector3
  constructor(nextPos: Vector3 = Vector3.Zero()) {
    this.nextPos = nextPos
  }
}

@Component('currentWeather')
export class CurrentWeather {
  weather: Weather
  dropsToAdd: number
  flakesToAdd: number
  spawnInterval: number
  currentSpawnInterval: number
  checkInterval: number = 0
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

@Component('isPrecip')
export class IsPrecip {
  type: PrecipType
  constructor(type: PrecipType = PrecipType.drop) {
    this.type = type
  }
}

@Component('spinVel')
export class SpinVel {
  dir: Vector3
  vel: number
  constructor(dir: Vector3 = Vector3.Zero(), vel: number = 1) {
    this.dir = dir
    this.vel = vel
  }
}

@Component('lightningTimer')
export class LightningTimer {
  count: number
  constructor(count: number = 10) {
    this.count = count
  }
}

//////////////////////////
// ENTITY LISTS

const drops = engine.getComponentGroup(Transform, IsPrecip)
const flakes = engine.getComponentGroup(Transform, IsPrecip, SpinVel)

///////////////////////////
// FUNCTIONS EXECUTED WHEN CALLING WEATHER

function getWeather() {
  let weather: Weather = Weather.sun
  if (fakeWeather) {
    weather = mapWeather(fakeWeather)
    setWeather(weather)
  } else {
    executeTask(async () => {
      try {
        log('getting new weather')
        let response = await fetch(callUrl)
        let json = await response.json()
        weather = mapWeather(json.wx_desc)
        setWeather(weather)
      } catch {
        log('failed to reach URL', error)
      }
    })
  }
}

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

function setWeather(newWeather: Weather) {
  let WeatherObject = weatherObject.get(CurrentWeather)
  if (newWeather == WeatherObject.weather) {
    return
  }
  WeatherObject.weather = newWeather
  switch (WeatherObject.weather) {
    case Weather.storm:
      WeatherObject.dropsToAdd = 100
      WeatherObject.flakesToAdd = 0
      WeatherObject.spawnInterval = rainSpeed / WeatherObject.dropsToAdd
      break
    case Weather.snow:
      WeatherObject.dropsToAdd = 0
      WeatherObject.flakesToAdd = 50
      WeatherObject.spawnInterval = (snowSpeed * 10) / WeatherObject.flakesToAdd
      break
    case Weather.heavyRain:
      WeatherObject.dropsToAdd = 50
      WeatherObject.flakesToAdd = 0
      WeatherObject.spawnInterval = rainSpeed / WeatherObject.dropsToAdd
      break
    case Weather.rain:
      WeatherObject.dropsToAdd = 10
      WeatherObject.flakesToAdd = 0
      WeatherObject.spawnInterval = rainSpeed / WeatherObject.dropsToAdd //(10/(0.033*rainSpeed)*30 ) /weather.dropsToAdd
      break
    case Weather.clouds:
      WeatherObject.dropsToAdd = 0
      WeatherObject.flakesToAdd = 0
      break
    case Weather.sun:
      WeatherObject.dropsToAdd = 0
      WeatherObject.flakesToAdd = 0
      break
  }
  setHouse()
  setClouds()
}

// CREATE NEW RAINDROPS

// Define a reusable shape
let dropShape = new PlaneShape()
// Make the plane rotate to always face you in the Y axis
dropShape.billboard = BillboardMode.BILLBOARDMODE_Y

function spawnRain() {
  const drop = new Entity()
  drop.set(new IsPrecip(PrecipType.drop))
  let pos = new Vector3(Math.random() * 8 + 1, 10, Math.random() * 8 + 1)
  drop.set(new Transform({
    position: pos,
    scale: new Vector3(0.15, 0.15, 0.15)
  }))
  // add predefined shape
  drop.set(dropShape)
  // Apply drop texture
  drop.set(dropMaterial)
  engine.addEntity(drop)
}

// CREATE NEW SNOWFLAKES

// Define a reusable shape
let flakeShape = new PlaneShape()

function spawnSnow() {
  const flake = new Entity()
  flake.set(new IsPrecip(PrecipType.flake))
  let pos = new Vector3(Math.random() * 8 + 1, 10, Math.random() * 8 + 1)
  flake.set(new Transform({
    position: pos,
    rotation: Quaternion.Euler(Math.random() * 180, Math.random() * 180, Math.random() * 180),
    scale: new Vector3(0.3, 0.3, 0.3)
  }))

  const flakeSpin = new Vector3(
    Math.random() * 30,
    Math.random() * 30,
    Math.random() * 30
  )

  const flakeSpeed = Math.random() * 2

  flake.set(new SpinVel(flakeSpin, flakeSpeed))

  flake.set(flakeShape)

  let materialIndex = Math.floor(Math.random() * 15)
  flake.set(flakeMaterial[materialIndex])

  engine.addEntity(flake)
}

///////////////////
// SYSTEMS (EXECUTE update() ON EACH FRAME)

export class CheckWeather implements ISystem {
  update(dt: number) {
    let weather = weatherObject.get(CurrentWeather)
    weather.checkInterval -= 1
    if (weather.checkInterval < 0) {
      getWeather()
      weather.checkInterval = 100000
    }
  }
}

export class SpawnSystem implements ISystem {
  update(dt: number) {
    const weather = weatherObject.get(CurrentWeather)
    if (weather.dropsToAdd > 1) {
      weather.currentSpawnInterval += dt
      if (weather.currentSpawnInterval >= weather.spawnInterval) {
        spawnRain()
        weather.dropsToAdd -= 1
        log('spawning rain')
        weather.currentSpawnInterval = 0
      }
    }
    if (weather.flakesToAdd > 1) {
      weather.currentSpawnInterval += dt
      if (weather.currentSpawnInterval >= weather.spawnInterval) {
        spawnSnow()
        weather.flakesToAdd -= 1
        log('spawning snow')
        weather.currentSpawnInterval = 0
      }
    }
  }
}

// For both raindrops and snowflakes
export class FallSystem implements ISystem {
  update(dt: number) {
    for (let drop of drops.entities) {
      let position = drop.get(Transform).position
      let type = drop.get(IsPrecip).type

      if (type == PrecipType.drop) {
        position.y = position.y - dt * rainSpeed
      } else if (type == PrecipType.flake) {
        position.y = position.y - dt * snowSpeed
      }
      if (position.y < 0) {
        position.x = Math.random() * 8 + 1
        position.y = 12
        position.z = Math.random() * 8 + 1
      }
    }
  }
}

// For snowflakes
export class RotateSystem implements ISystem {
  update(dt: number) {
    for (let flake of flakes.entities) {
      const dir = flake.get(SpinVel).dir
      const vel = flake.get(SpinVel).vel
      flake.get(Transform).rotate(dir, vel)
    }
  }
}

let cam = Camera.instance

cam.rotation.eulerAngles

// For thunder
export class LightningSystem implements ISystem {
  update() {
    if (weatherObject.has(LightningTimer)) {
      let timer = weatherObject.get(LightningTimer)
      timer.count -= 1
      //log("timer " + timer.count)
      if (timer.count < 0) {
        let lightningNum: number = Math.floor(Math.random() * 25) + 1
        if (lightningNum > 6) {
          if (lightning.has(GLTFShape)) {
            lightning.remove(GLTFShape)
            timer.count = Math.random() * 20
            return
          }
        }

        lightning.set(lightningModels[lightningNum])
        timer.count = Math.random() * 10
      }
    }
  }
}

// ADD SYSTEMS

engine.addSystem(new CheckWeather())
engine.addSystem(new FallSystem())
engine.addSystem(new RotateSystem())
engine.addSystem(new SpawnSystem())
engine.addSystem(new LightningSystem())

/////////////////

// SCENE FIXED ENTITIES

// WEATHER CONTROLLER SINGLETON

const weatherObject = new Entity()
weatherObject.set(new CurrentWeather())
engine.addEntity(weatherObject)

// DEFINE DROP MATERIALS

const dropMaterial = new BasicMaterial()
dropMaterial.texture = 'materials/drop.png'
dropMaterial.samplingMode = 0

// DEFINE FLAKE MATERIALS AS AN ARRAY OF BasicMaterial COMPONENTS

const flakeMaterial: BasicMaterial[] = []
for (let i = 1; i < 15; i++) {
  let material = new BasicMaterial()
  material.texture = 'materials/flake' + i + '.png'
  material.samplingMode = 0
  flakeMaterial.push(material)
}

// ADD HOUSE

const house = new Entity()
house.set(new Transform())
house.get(Transform).position.set(5, 0, 5)
house.set(new GLTFShape('models/house_dry.gltf'))

function setHouse() {
  let weather = weatherObject.get(CurrentWeather)
  switch (weather.weather) {
    case Weather.storm:
      house.set(new GLTFShape('models/house_wet.gltf'))
      break
    case Weather.snow:
      house.set(new GLTFShape('models/house_snow.gltf'))
      break
    case Weather.heavyRain:
      house.set(new GLTFShape('models/house_wet.gltf'))
      break
    case Weather.rain:
      house.set(new GLTFShape('models/house_wet.gltf'))
      break
  }
}

engine.addEntity(house)

// ADD CLOUDS

const clouds = new Entity()
clouds.set(new Transform())
clouds.get(Transform).position.set(5, 10, 5)
clouds.get(Transform).scale.setAll(5)

function setClouds() {
  let weather = weatherObject.get(CurrentWeather)
  switch (weather.weather) {
    case Weather.storm:
      clouds.set(new GLTFShape('models/dark-cloud.gltf'))
      weatherObject.set(new LightningTimer(30))
      break
    case Weather.snow:
      clouds.set(new GLTFShape('models/dark-cloud.gltf'))
      weatherObject.remove(LightningTimer)
      break
    case Weather.heavyRain:
      clouds.set(new GLTFShape('models/dark-cloud.gltf'))
      weatherObject.remove(LightningTimer)
      break
    case Weather.rain:
      clouds.set(new GLTFShape('models/clouds.gltf'))
      weatherObject.remove(LightningTimer)
      break
    case Weather.clouds:
      clouds.set(new GLTFShape('models/clouds.gltf'))
      weatherObject.remove(LightningTimer)
      break
    case Weather.sun:
      clouds.remove(GLTFShape)
      weatherObject.remove(LightningTimer)
      break
  }
}

engine.addEntity(clouds)

// DEFINE LIGHTNING COMPONENTS AS AN ARRAY OF GLTF COMPONENTS

const lightningModels: GLTFShape[] = []
for (let i = 1; i < 6; i++) {
  const modelPath = 'models/ln' + i + '.gltf'
  const lnModel = new GLTFShape(modelPath)
  lightningModels.push(lnModel)
}

// ADD LIGHTNING ENTITY

const lightning = new Entity()
lightning.set(new Transform())
lightning.get(Transform).position.set(5, 10, 5)
lightning.get(Transform).scale.setAll(5)
engine.addEntity(lightning)
