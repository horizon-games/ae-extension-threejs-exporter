import { PlaneBufferGeometry } from 'three';

class AERectGeometry extends PlaneBufferGeometry {
  constructor(width: number, height: number) {
    super(width, height)
    const halfWidth = width * 0.5
    const halfHeight = height * 0.5
    const array = this.attributes.position.array as number[]
    for (let i = 0; i < array.length; i += 3) {
      array[i] += halfWidth
      array[i + 1] += halfHeight
    }
  }
}

let aeRectGeometry:AERectGeometry

export function getAERectGeometry() { 
  if(!aeRectGeometry) {
    aeRectGeometry = new AERectGeometry(1, 1)
  }
  return aeRectGeometry
}
