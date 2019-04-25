  attribute vec2 uv;
  attribute vec4 position;
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

  void main() {
    // vUv = uv;
    vUv = vec2(uv.x * mapUvMat23a.x + uv.y * mapUvMat23b.x + mapUvMat23a.z, uv.x * mapUvMat23a.y + uv.y * mapUvMat23b.y + mapUvMat23b.z);
    #ifdef USE_MASK_CONTENT
    vContentUv = vec2(uv.x * contentMapUvMat23a.x + uv.y * contentMapUvMat23b.x + contentMapUvMat23a.z, uv.x * contentMapUvMat23a.y + uv.y * contentMapUvMat23b.y + contentMapUvMat23b.z);
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * position;
  }