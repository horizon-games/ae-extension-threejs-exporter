import {
  BufferGeometry,
  Float32BufferAttribute,
  Sphere,
  Uint16BufferAttribute,
  Vector3
} from 'three'

export default class AERectGeometry extends BufferGeometry {
  constructor(backFace = false) {
    super()

    const vertCount = 4
    const triangleCount = 2
    const sizeMaskArr = new Float32Array(vertCount * 2)
    const indexArr = new Uint16Array(triangleCount * 3)

    let i2 = 0
    for (let iy = 0; iy < 2; iy++) {
      for (let ix = 0; ix < 2; ix++) {

        sizeMaskArr[i2] = ix
        sizeMaskArr[i2 + 1] = iy

        i2 += 2
      }
    }

		const a = 0
		const b = 2
		const c = 3
		const d = 1

		indexArr[0] = backFace ? b : a
		indexArr[1] = backFace ? a : b
		indexArr[2] = d

		indexArr[3] = backFace ? c : b
		indexArr[4] = backFace ? b : c
		indexArr[5] = d

    this.setIndex(new Uint16BufferAttribute(indexArr, 1))
    this.addAttribute('sizeMask', new Float32BufferAttribute(sizeMaskArr, 2))
    this.boundingSphere = new Sphere(new Vector3(), 1000)
  }
}
