precision highp float;

attribute vec2 sizeMask;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform vec2 size;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(size * sizeMask, 0.0, 1.0);
}
