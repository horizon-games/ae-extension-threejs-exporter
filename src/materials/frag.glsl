precision highp float;
uniform sampler2D mapTexture;
uniform float opacity;
varying vec2 vUv;

#ifdef USE_MASK_CONTENT
uniform sampler2D contentMapTexture;
varying vec2 vContentUv;
#endif

#ifdef USE_EFFECT_CHANNELMIXER
uniform vec3 channelMixerRed;
uniform vec3 channelMixerGreen;
uniform vec3 channelMixerBlue;
#endif

void main() {
  gl_FragColor = texture2D(mapTexture, vUv);
  #ifdef USE_MASK_CONTENT
  vec4 contentTexel = texture2D(contentMapTexture, vContentUv);
  gl_FragColor.rgb = contentTexel.rgb;
  gl_FragColor.a *= contentTexel.a;
  #endif
  #ifdef USE_EFFECT_CHANNELMIXER
  vec3 channelMixerLevels = gl_FragColor.rgb;
  gl_FragColor.rgb = channelMixerRed * channelMixerLevels.r + channelMixerGreen * channelMixerLevels.g + channelMixerBlue * channelMixerLevels.b;
  #endif
  gl_FragColor.a *= opacity;
}
