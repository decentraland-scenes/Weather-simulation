

@Component('spinVel')
export class SpinVel {
  dir: Vector3
  vel: number
  constructor(dir: Vector3 = Vector3.Zero(), vel: number = 1) {
    this.dir = dir
    this.vel = vel
  }
}

export const flakes = engine.getComponentGroup(SpinVel)

export class RotateSystem implements ISystem {
    update(dt: number) {
      for (let flake of flakes.entities) {
        const dir = flake.get(SpinVel).dir
        const vel = flake.get(SpinVel).vel
        flake.get(Transform).rotate(dir, vel)
      }
    }
  }