import { PCFShadowMap, WebGLRenderer, Scene, PerspectiveCamera, Mesh, SphereBufferGeometry, MeshBasicMaterial } from 'three'

const renderer = new WebGLRenderer({
  antialias: true,
  premultipliedAlpha: false
  // powerPreference: "high-performance"
  // powerPreference: "low-power"
})

function checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas')
      return (
        !!(window as any).WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      )
    } catch (e) {
      return false
    }
  }
  
if (checkWebGLSupport()) {
    // Add Renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
  } else {
    throw new Error('No WebGL Support')
  }
  
const attributeValues: string[] = [
  '-moz-crisp-edges',
  '-webkit-crisp-edges',
  'pixelated',
  'crisp-edges'
]

attributeValues.forEach(v => {
  renderer.context.canvas.style.setProperty('image-rendering', v)
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFShadowMap
renderer.gammaOutput = true
renderer.gammaFactor = 2.2
renderer.autoClear = false
renderer.setPixelRatio(window.devicePixelRatio)
const scene = new Scene()

const camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    100
)

scene.add(camera)

const sphere = new Mesh(new SphereBufferGeometry(5, 64, 32), new MeshBasicMaterial({color: 0xffffff, wireframe: true}))
scene.add(sphere)
function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}
window.addEventListener('resize', onResize)
onResize()

const loop = () => {
    sphere.rotation.y += 0.001
    renderer.render(scene, camera)
    requestAnimationFrame(loop)
}

// Start loop
requestAnimationFrame(loop)

console.log('hello world!')
