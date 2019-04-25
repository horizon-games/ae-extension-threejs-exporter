import {
  RawShaderMaterial,
  ShaderMaterialParameters,
  Texture
} from 'three'
import { Matrix2DUniformInterface } from '~/math/Matrix2DUniformInterface'

import { addTexture2DUniforms } from '../utils/materials'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

export interface SpritesheetMaterialOptions {
  mapTexture: Texture
  matrix: Matrix2DUniformInterface
  materialParams?: ShaderMaterialParameters
}

export class SpritesheetMeshBasicMaterial extends RawShaderMaterial {
  parameters: ShaderMaterialParameters
  mapTexture: Texture
  matrix2DInterface: Matrix2DUniformInterface
  constructor(options: SpritesheetMaterialOptions) {
    const uniforms = {}
    const parameters = {
      ...options.materialParams,
      fragmentShader,
      vertexShader,
      uniforms
    }
    addTexture2DUniforms(uniforms, options.mapTexture, options.matrix, '')
    super(parameters)
    this.parameters = parameters
    this.matrix2DInterface = options.matrix
    this.mapTexture = options.mapTexture
  }
}
