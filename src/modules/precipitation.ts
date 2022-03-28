import { CurrentWeather } from './weather'
import { SpinVel } from './flakeRotation'
import { fakeWeather, rainSpeed, snowSpeed, callUrl } from '../params'

// types of precipitation
export enum PrecipType {
  drop,
  flake
}

// flag an entity as drop or flake
@Component('isPrecip')
export class IsPrecip {
  type: PrecipType
  constructor(type: PrecipType = PrecipType.drop) {
    this.type = type
  }
}

// component group to hold all drops and flakes
export const drops = engine.getComponentGroup(IsPrecip)

// create drops and flakes evenly spread out in time as they fall
export class SpawnSystem implements ISystem {
  weather: CurrentWeather
  constructor(weather) {
    this.weather = weather
  }
  update(dt: number) {
    if (this.weather.dropsToAdd > 1) {
      this.weather.currentSpawnInterval += dt
      if (this.weather.currentSpawnInterval >= this.weather.spawnInterval) {
        spawnRain()
        this.weather.dropsToAdd -= 1
        log('spawning rain')
        this.weather.currentSpawnInterval = 0
      }
    }
    if (this.weather.flakesToAdd > 1) {
      this.weather.currentSpawnInterval += dt
      if (this.weather.currentSpawnInterval >= this.weather.spawnInterval) {
        spawnSnow()
        this.weather.flakesToAdd -= 1
        log('spawning snow')
        this.weather.currentSpawnInterval = 0
      }
    }
  }
}

// drop and reposition for both raindrops and snowflakes
export class FallSystem implements ISystem {
  update(dt: number) {
    for (const drop of drops.entities) {
      const position = drop.getComponent(Transform).position
      const type = drop.getComponent(IsPrecip).type

      if (type === PrecipType.drop) {
        position.y = position.y - dt * rainSpeed
      } else if (type === PrecipType.flake) {
        position.y = position.y - dt * snowSpeed
      }
      if (position.y < 0) {
        position.x = Math.random() * 8 + 4
        position.y = 12
        position.z = Math.random() * 8 + 4
      }
    }
  }
}

// CREATE NEW RAINDROPS

// Define a reusable shape
const dropShape = new PlaneShape()

const billboard = new Billboard(false, true, false)

// define reusable drop material
const dropTexture = new Texture('materials/drop.png', {
  hasAlpha: true,
  samplingMode: 1
})
const dropMaterial = new BasicMaterial()
dropMaterial.texture = dropTexture

// create drop entity
function spawnRain() {
  const drop = new Entity()
  drop.addComponent(new IsPrecip(PrecipType.drop))
  const pos = new Vector3(Math.random() * 8 + 4, 10, Math.random() * 8 + 4)
  drop.addComponent(
    new Transform({
      position: pos,
      scale: new Vector3(0.15, 0.15, 0.15)
    })
  )
  // add predefined shape
  drop.addComponent(dropShape)

  // Make drop rotate to always face you in the Y axis
  drop.addComponent(billboard)

  // Apply drop texture
  drop.addComponent(dropMaterial)

  engine.addEntity(drop)
}

// CREATE NEW SNOWFLAKES

// define flake materials as an array oF BasicMaterial components

const flakeMaterial: BasicMaterial[] = []
for (let i = 1; i < 5; i++) {
  const texture = new Texture('materials/flake' + i + '.png', {
    hasAlpha: true,
    samplingMode: 1
  })
  const material = new BasicMaterial()
  material.texture = texture
  flakeMaterial.push(material)
}

// Define a reusable shape
const flakeShape = new PlaneShape()

// create flake entity
function spawnSnow() {
  const flake = new Entity()
  flake.addComponent(new IsPrecip(PrecipType.flake))
  const pos = new Vector3(Math.random() * 8 + 4, 10, Math.random() * 8 + 4)
  flake.addComponent(
    new Transform({
      position: pos,
      rotation: Quaternion.Euler(
        Math.random() * 180,
        Math.random() * 180,
        Math.random() * 180
      ),
      scale: new Vector3(0.3, 0.3, 0.3)
    })
  )

  const flakeSpin = new Vector3(
    Math.random() * 30,
    Math.random() * 30,
    Math.random() * 30
  )

  const flakeSpeed = Math.random() * 2

  flake.addComponent(new SpinVel(flakeSpin, flakeSpeed))

  flake.addComponent(flakeShape)

  const materialIndex = Math.floor(Math.random() * 4)
  flake.addComponent(flakeMaterial[materialIndex])

  engine.addEntity(flake)
}
