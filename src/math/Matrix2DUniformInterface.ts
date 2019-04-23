import { Vector3 } from 'three'

import { Matrix2D } from '../vendor/easeljs/Matrix2D'

export class Matrix2DUniformInterface {
  readonly uniformVec3a: Vector3
  readonly uniformVec3b: Vector3
  private matrix: Matrix2D
  constructor() {
    this.uniformVec3a = new Vector3(1, 0, 0)
    this.uniformVec3b = new Vector3(0, 1, 0)
    this.matrix = new Matrix2D()
  }
  compose(
    x: number,
    y: number,
    scaleX: number,
    scaleY: number,
    rotation: number,
    regX: number,
    regY: number
  ) {
    this.matrix.prependTransform(
      x,
      y,
      scaleX,
      scaleY,
      rotation,
      0,
      0,
      regX,
      regY
    )
    this.uniformVec3a.set(this.matrix.a, this.matrix.b, this.matrix.tx)
    this.uniformVec3b.set(this.matrix.c, this.matrix.d, this.matrix.ty)
  }
}
