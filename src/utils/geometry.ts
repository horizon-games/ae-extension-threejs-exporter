import { PlaneBufferGeometry } from 'three';

import AENineSliceRectGeometry from '../meshes/AENineSliceRectGeometry';

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
let aeNineSliceRectGeometry:AENineSliceRectGeometry

export function getAERectGeometry(nineSlice = false) { 
  if(!aeRectGeometry) {
    aeRectGeometry = new AERectGeometry(1, 1)
  }
  if(!aeNineSliceRectGeometry) {
    aeNineSliceRectGeometry = new AENineSliceRectGeometry()
  }
  return nineSlice ? aeNineSliceRectGeometry : aeRectGeometry
}
