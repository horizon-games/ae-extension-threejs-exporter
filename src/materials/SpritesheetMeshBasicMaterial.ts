import {
  Color,
  RawShaderMaterial,
  ShaderMaterialParameters,
  Texture,
  Vector2,
  Vector3,
  Vector4
} from 'three'
import { Matrix2DUniformInterface } from '~/math/Matrix2DUniformInterface'

import { addTexture2DUniforms, addUniform } from '../utils/materials'
import { capitalize } from '../utils/strings';

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

export type SupportedEffects = 'channelMixer'
export type EffectProperties = Map<SupportedEffects, Map<string, number | Vector2 | Vector3 | Vector4 | Color>>

export interface SpritesheetMaterialOptions {
  mapTexture: Texture
  matrix: Matrix2DUniformInterface
  materialParams?: ShaderMaterialParameters,
  effectProperties?: EffectProperties
}

export class SpritesheetMeshBasicMaterial extends RawShaderMaterial {
  parameters: ShaderMaterialParameters
  mapTexture: Texture
  matrix2DInterface: Matrix2DUniformInterface
  constructor(options: SpritesheetMaterialOptions) {
    const uniforms = {}
    const defines = {}
    const parameters = {
      ...options.materialParams,
      fragmentShader,
      vertexShader,
      uniforms,
      defines
    }
    addTexture2DUniforms(uniforms, options.mapTexture, options.matrix, '')
    if(options.effectProperties) {
      options.effectProperties.forEach((effectProps, effectName) => {
        defines['USE_EFFECT_'+effectName.toUpperCase()] = true
        effectProps.forEach((effectPropValue, effectPropName) => {
          addUniform(uniforms, effectName + capitalize(effectPropName), effectPropValue)
        })
      })
    }
    super(parameters)
    this.parameters = parameters
    this.matrix2DInterface = options.matrix
    this.mapTexture = options.mapTexture
  }
}
