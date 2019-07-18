import AENineSliceRectGeometry from '../meshes/AENineSliceRectGeometry';
import AERectGeometry from '../meshes/AERectGeometry';

let aeRectGeometry:AERectGeometry
let aeNineSliceRectGeometry:AENineSliceRectGeometry

export function getAERectGeometry(nineSlice = false) { 
  if(!aeRectGeometry) {
    aeRectGeometry = new AERectGeometry()
  }
  if(!aeNineSliceRectGeometry) {
    aeNineSliceRectGeometry = new AENineSliceRectGeometry()
  }
  return nineSlice ? aeNineSliceRectGeometry : aeRectGeometry
}
