import { Euler, Object3D, Quaternion, Vector3 } from 'three'

import { Matrix2D } from '../vendor/easeljs/Matrix2D'

const __p = new Vector3()
const __q = new Quaternion()
const __s = new Vector3()
const __e = new Euler()

export class Matrix2DUniformInterface {
  readonly uniformVec3a: Vector3
  readonly uniformVec3b: Vector3
  readonly matrix: Matrix2D
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
    this.updateUniforms()
    return this
  }
  fromObject3D(node:Object3D) {
    node.matrix.decompose(__p, __q, __s)
    __e.setFromQuaternion(__q)
    this.matrix.appendTransform(
      __p.x,
      __p.y,
      __s.x,
      __s.y,
      __e.z / Math.PI * 180,
      0,
      0,
      0,
      0
    )
    return this
  }
  updateUniforms() {
    this.uniformVec3a.set(this.matrix.a, this.matrix.b, this.matrix.tx)
    this.uniformVec3b.set(this.matrix.c, this.matrix.d, this.matrix.ty)
  }
}
