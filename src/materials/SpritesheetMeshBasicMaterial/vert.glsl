  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;

  uniform vec3 mapUvMat23a;
  uniform vec3 mapUvMat23b;

  varying vec2 vUv;

  #ifdef USE_MASK_CONTENT
  uniform vec3 contentMapUvMat23a;
  uniform vec3 contentMapUvMat23b;
  
  varying vec2 vContentUv;
  #endif

  attribute vec2 sizeMask;
  uniform vec2 size;
  #ifdef USE_EFFECT_NINESLICE
  attribute vec2 sliceSelector;
  uniform vec4 nineSliceU;
  uniform vec4 nineSliceV;
  uniform vec4 nineSliceXPadding;
  uniform vec4 nineSliceYPadding;
  #endif

  void main() {

    #ifdef USE_EFFECT_NINESLICE
    int ix = int(sliceSelector.x);
    int iy = int(sliceSelector.y);
    vec2 uv = vec2(nineSliceU[ix], nineSliceV[iy]);
    vec2 padding = vec2(nineSliceXPadding[ix], nineSliceYPadding[iy]);
    vec4 position = vec4(size * sizeMask + padding, 0.0, 1.0);
    #else
    vec2 uv = sizeMask;
    vec4 position = vec4(size * sizeMask, 0.0, 1.0);
    #endif

    // vUv = uv;
    vUv = vec2(uv.x * mapUvMat23a.x + uv.y * mapUvMat23b.x + mapUvMat23a.z, uv.x * mapUvMat23a.y + uv.y * mapUvMat23b.y + mapUvMat23b.z);
    #ifdef USE_MASK_CONTENT
    vContentUv = vec2(uv.x * contentMapUvMat23a.x + uv.y * contentMapUvMat23b.x + contentMapUvMat23a.z, uv.x * contentMapUvMat23a.y + uv.y * contentMapUvMat23b.y + contentMapUvMat23b.z);
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * position;
  }