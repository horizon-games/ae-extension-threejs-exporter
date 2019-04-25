import { Texture, Uniform } from 'three'
import { Matrix2DUniformInterface } from '~/math/Matrix2DUniformInterface'

import { prefixVarName } from './strings'

export function addTexture2DUniforms(
  uniforms: any,
  texture: Texture,
  matrix: Matrix2DUniformInterface,
  prefixName: string
) {
  addUniform(uniforms, prefixVarName(prefixName, 'mapTexture'), texture)
  addUniform(
    uniforms,
    prefixVarName(prefixName, 'mapUvMat23a'),
    matrix.uniformVec3a
  )
  addUniform(
    uniforms,
    prefixVarName(prefixName, 'mapUvMat23b'),
    matrix.uniformVec3b
  )
}

export function addUniform(uniforms: any, name: string, value: any) {
  uniforms[name] = new Uniform(value)
}
