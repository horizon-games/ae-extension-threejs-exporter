precision highp float;
uniform sampler2D mapTexture;
varying vec2 vUv;

#ifdef USE_MASK_CONTENT
uniform sampler2D contentMapTexture;
varying vec2 vContentUv;
#endif

void main() {
  gl_FragColor = texture2D(mapTexture, vUv);
  #ifdef USE_MASK_CONTENT
  vec4 contentTexel = texture2D(contentMapTexture, vContentUv);
  gl_FragColor.rgb = contentTexel.rgb;
  gl_FragColor.a *= contentTexel.a;
  #endif
}
