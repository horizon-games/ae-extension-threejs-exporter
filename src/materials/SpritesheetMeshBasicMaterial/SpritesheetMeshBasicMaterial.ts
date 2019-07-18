import {
  Color,
  DoubleSide,
  IUniform,
  RawShaderMaterial,
  ShaderMaterialParameters,
  Texture,
  Uniform,
  Vector2,
  Vector3,
  Vector4
} from 'three'
import { Matrix2DUniformInterface } from '~/math/Matrix2DUniformInterface'

import { addTexture2DUniforms, addUniform } from '../../utils/materials'
import { capitalize } from '../../utils/strings';

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

//nineSlice is actually a Grid effect
export type SupportedEffects = 'colorOverlay' | 'channelMixer' | 'nineSlice'
export type EffectProperties = Map<SupportedEffects, Map<string, number | Vector2 | Vector3 | Vector4 | Color>>

export interface SpritesheetMaterialOptions {
  mapTexture: Texture,
  size: Vector2,
  matrix: Matrix2DUniformInterface
  materialParams?: ShaderMaterialParameters
  effectProperties?: EffectProperties
  userData?:any
}

export class SpritesheetMeshBasicMaterial extends RawShaderMaterial {
  parameters: ShaderMaterialParameters
  size: Vector2
  mapTexture: Texture
  matrix2DInterface: Matrix2DUniformInterface
  constructor(options: SpritesheetMaterialOptions) {
    const uniforms: {[uniform:string]: IUniform}  = {
      opacity: new Uniform(1)
    }
    const defines = {}
    const parameters:ShaderMaterialParameters = {
      ...options.materialParams,
      fragmentShader,
      vertexShader,
      uniforms,
      defines,
      side: DoubleSide
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
    addUniform(uniforms, 'size', options.size)
    super(parameters)
    this.parameters = parameters
    this.matrix2DInterface = options.matrix
    this.mapTexture = options.mapTexture
    this.size = options.size
    this.userData = options.userData
  }
}
