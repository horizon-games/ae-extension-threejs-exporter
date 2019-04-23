import {
  RawShaderMaterial,
  ShaderMaterialParameters,
  Texture,
  Uniform
} from 'three'
import { Matrix2DUniformInterface } from '~/math/Matrix2DUniformInterface'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

export interface SpritesheetMaterialParameters
  extends ShaderMaterialParameters {
  mapTexture: Texture
  matrix: Matrix2DUniformInterface
}

export class SpritesheetMeshBasicMaterial extends RawShaderMaterial {
  constructor(parameters: SpritesheetMaterialParameters) {
    parameters.fragmentShader = fragmentShader
    parameters.vertexShader = vertexShader
    parameters.uniforms = {
      mapTexture: new Uniform('mapTexture', parameters.mapTexture),
      mapUvMat23a: new Uniform('mapUvMat23a', parameters.matrix.uniformVec3a),
      mapUvMat23b: new Uniform('mapUvMat23b', parameters.matrix.uniformVec3b)
    }
    super(parameters)
  }
}
