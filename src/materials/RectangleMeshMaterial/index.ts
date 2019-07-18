import { Color, RawShaderMaterial, Uniform, Vector2 } from 'three'


import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

export interface RectangleMaterialOptions {
	color: Color
  size: Vector2
  opacity?: number
}

interface IUniforms {
  color: Uniform
  size: Uniform
  opacity: Uniform
}

export default class RectangleMeshMaterial extends RawShaderMaterial {
  constructor(options: RectangleMaterialOptions) {
    const uniforms: IUniforms = {
      color: new Uniform(options.color),
      size: new Uniform(options.size),
      opacity: new Uniform(options.opacity !== undefined ? options.opacity : 1)
    }
    super({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms
    })
  }

  setSize(width: number, height: number) {
    this.uniforms.size.value.set(width, height)
  }

  set opacity(value: number) {
    if (this.uniforms) {
      this.uniforms.opacity.value = value
    }
  }

  get opacity() {
    if (this.uniforms) {
      return this.uniforms.opacity.value
    } else {
      return 1
    }
  }
}
