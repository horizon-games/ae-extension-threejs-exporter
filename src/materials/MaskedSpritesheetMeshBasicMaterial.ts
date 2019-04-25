import {
  Texture
} from 'three'

import { Matrix2DUniformInterface } from '../math/Matrix2DUniformInterface'
import { addTexture2DUniforms } from '../utils/materials';

import {
  SpritesheetMaterialOptions,
  SpritesheetMeshBasicMaterial
} from './SpritesheetMeshBasicMaterial'

export interface MaskedSpritesheetMaterialOptions
  extends SpritesheetMaterialOptions {
  contentMapTexture: Texture
  contentMatrix: Matrix2DUniformInterface
}

export class MaskedSpritesheetMeshBasicMaterial extends SpritesheetMeshBasicMaterial {
  contentMapTexture:Texture
  contentMatrix2DInterface: Matrix2DUniformInterface
  constructor(options: MaskedSpritesheetMaterialOptions) {
    super(options)
    addTexture2DUniforms(this.uniforms, options.contentMapTexture, options.contentMatrix, 'content')
    this.defines.USE_MASK_CONTENT = true
    this.contentMatrix2DInterface = options.contentMatrix
    this.contentMapTexture = options.contentMapTexture
  }
}
