import { CurrentWeather } from "./weather";
import { SpinVel } from "./flakeRotation";
import { fakeWeather, rainSpeed, snowSpeed, callUrl } from "../params";



export enum PrecipType {
    drop,
    flake
}

@Component('isPrecip')
export class IsPrecip {
  type: PrecipType
  constructor(type: PrecipType = PrecipType.drop) {
    this.type = type
  }
}

export const drops = engine.getComponentGroup(IsPrecip)


export class SpawnSystem implements ISystem {
    weather: CurrentWeather
    constructor(weather){
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



// Dropping for both raindrops and snowflakes
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


  // CREATE NEW RAINDROPS

// Define a reusable shape
let dropShape = new PlaneShape()
// Make the plane rotate to always face you in the Y axis
dropShape.billboard = BillboardMode.BILLBOARDMODE_Y

// DEFINE DROP MATERIALS

const dropMaterial = new BasicMaterial()
dropMaterial.texture = 'materials/drop.png'
dropMaterial.samplingMode = 0

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

// DEFINE FLAKE MATERIALS AS AN ARRAY OF BasicMaterial COMPONENTS

const flakeMaterial: BasicMaterial[] = []
for (let i = 1; i < 15; i++) {
  let material = new BasicMaterial()
  material.texture = 'materials/flake' + i + '.png'
  material.samplingMode = 0
  flakeMaterial.push(material)
}

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