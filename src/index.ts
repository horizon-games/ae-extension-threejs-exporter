/// <reference types="types-for-adobe/AfterEffects/2018"/>"
import { CSInterface, UIColor } from './vendor/CSInterface'

import { PCFShadowMap, WebGLRenderer, Scene, PerspectiveCamera, Mesh, SphereBufferGeometry, MeshBasicMaterial, OrthographicCamera, Camera, Color, PlaneGeometry, Side, BackSide, Object3D, PlaneBufferGeometry, Vector3, Matrix4, Euler, DoubleSide } from 'three'

const CSLibrary = new CSInterface()

function changeThemeColor() {
  let hostEnv = CSLibrary.getHostEnvironment()
  let UIColorObj = new UIColor()

  UIColorObj = hostEnv.appSkinInfo.appBarBackgroundColor
  let red = Math.round(UIColorObj.color.red)
  let green = Math.round(UIColorObj.color.green)
  let blue = Math.round(UIColorObj.color.blue)
  let alpha = Math.round(UIColorObj.color.alpha)
  let colorRGB = '#' + red.toString(16) + green.toString(16) + blue.toString(16)

  const bodyElement = window!.document!.getElementById('index_body')!
  bodyElement.style.backgroundColor = colorRGB
  bodyElement.style.opacity = (alpha / 255).toString()
}

window.onload = function() {
  CSLibrary.addEventListener('com.adobe.csxs.events.ThemeColorChanged', event => changeThemeColor())
  changeThemeColor()
}

let afterEffects: any

const __degToRad = Math.PI / 180
const __radToDeg = 1 / __degToRad
const __tempMatrix = new Matrix4()
function error(message: string) {
  debugger
  throw new Error(message)
}


function decorateMethodAfter(
  obj: any,
  methodName: string,
  newMethod: () => void
  ) {
  const oldMethod = obj[methodName] as () => void
  obj[methodName] = (...args: any[]) => {
    const result = oldMethod.apply(obj, args)
    newMethod.apply(obj, args)
    return result
  }
  }

const renderer = new WebGLRenderer({
  antialias: true,
  premultipliedAlpha: false
  // powerPreference: "high-performance"
  // powerPreference: "low-power"
})

class AERectGeometry extends PlaneBufferGeometry {
  constructor(width: number, height: number) {
    super(width, height)
    const halfWidth = width * 0.5
    const halfHeight = height * 0.5
    let array = this.attributes.position.array as number[]
    for (let i = 0; i < array.length; i+=3) {
      array[i] += halfWidth
      array[i+1] += halfHeight            
    }
  }
}

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
  error('No WebGL Support')
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
let rootScene = new Scene()

let camera: Camera = new PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.01,
  100
)

rootScene.add(camera)
rootScene.userData.activeCameras = [camera]

const sphere = new Mesh(new SphereBufferGeometry(500, 64, 32), new MeshBasicMaterial({color: 0xffffff, wireframe: true}))
rootScene.add(sphere)
function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  if (camera instanceof PerspectiveCamera) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
}
window.addEventListener('resize', onResize)
onResize()

async function convertCamera(layer: CameraLayer, comp: CompItem) {
  const cameraAe = await getAEProperty(layer, 'Camera Options')
  const zoom = await getAEProperty(cameraAe, 'Zoom')
  const angle = Math.atan2((await comp.height) * 0.5, await zoom.value)
  const degs = angle * 2 * __radToDeg
  // debugger
  const cam = new PerspectiveCamera(degs, await comp.width / await comp.height, 10, 10000)
  decorateMethodAfter(cam, 'updateProjectionMatrix', () => {
    cam.projectionMatrix.scale(new Vector3(1, -1, -1))
    debugger
  })
  cam.updateProjectionMatrix()
  return cam
}

async function syncArray(asyncArr: any[]) {
  if (!asyncArr.hasOwnProperty('length')) {
    return await syncArrayLike(asyncArr)
  }
  const arr: any[] = []
  for (let i = 0; i < asyncArr.length; i++) {
    arr[i] = await asyncArr[i]
  }
  return arr
}

async function syncArrayLike(asyncArr: any[]) {
  const arr: any[] = []
  for (let i = 0; i < 3; i++) {
    try {
      arr[i] = await asyncArr[i]
    } catch (err) {
      break
    }
  }
  return arr
}


function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function pluralize(str: string) {
  if (str.charAt(str.length-1) === 'y') {
    return str.slice(0, str.length - 1) + 'ies'
  } else {
    return str + 's'
  }
}
async function getAEProperty(base: any, namePath: string) {
  return findCollectionItemPath(base, 'property', namePath)
}

async function findCollectionItemPath(base: any, collectionName: string, namePath: string) {
  const names = namePath.split('.')
  let cursor = base
  while (names.length > 0) {
    cursor = await findCollectionItem(cursor, collectionName, names.shift()!)
  }
  return cursor
}

async function findCollectionItem(base: any, collectionName: string, name: string) {
  const numName = 'num' + pluralize(capitalize(collectionName))
  if (!base || !base.hasOwnProperty(numName) || !base.hasOwnProperty(collectionName)) {
    error('Collection is invalid.')
  }
  const collection = (await base[collectionName]) as (i: number) => any
  const num = await base[numName]
  const triedNames: string[] = []
  for (let i = 1; i <= num; i++) {
    const item = await(collection(i))
    const tempName = await item.name
    if (tempName === name) {
      return item
    }
    triedNames.push(tempName)
  }
  let messageLines = ['Collection does not contain item named ' + name, 'found the following Properties:']
  for (let i = 0; i < triedNames.length; i++) {
    messageLines.push('  ' + triedNames[i])
  }
  error(messageLines.join('\n'))
}

let _initedComp = false
async function initAfterEffects() {
  _initedComp = true
  const maybeComp = await (await (await afterEffects as Application).project).activeItem
  if (!maybeComp || await maybeComp.typeName !== 'Composition') {
    console.warn('activeItem is not a Composition. Select a Composition and try again.')
    return
  }
  const scene = new Scene()
  rootScene = scene
  await loadCompScene(scene, maybeComp as CompItem)
}

class QueuedCompScene {
  comp: CompItem
  scene: Scene
  constructor(comp: CompItem, scene: Scene) {
    this.comp = comp
    this.scene = scene
  }
}

const __subCompsQueue: QueuedCompScene[] = []

function __queueSubComp(comp: CompItem, scene: Scene) {
  __subCompsQueue.push(new QueuedCompScene(comp, scene))
}

async function loadCompScene(scene: Scene, comp: CompItem) {
  const defaultCamera2D = camera = new OrthographicCamera(0, await comp.width, 0, await comp.height, -1000, 1000)
  scene.add(defaultCamera2D)
  const activeCameras: (Camera | null)[] = [null, defaultCamera2D]
  scene.userData.activeCameras = activeCameras

  const numLayers = await comp.numLayers

  let node: Object3D | null = null
  let isLayer3D = false
  let hasAnchor = false
  for (let index = 1; index <= numLayers; index++) {
    const layer = await (await comp.layer)(index)
    node = null
    isLayer3D = false
    hasAnchor = false
    if (!(await layer.active)) {
      continue
    }
    if (await layer.hasVideo) {
      const avLayer = layer as AVLayer
      isLayer3D = await avLayer.threeDLayer
      hasAnchor = true
      const source = (await avLayer.source)
      if (await source.typeName === 'Composition') {
        const subScene = new Scene()
        __queueSubComp(source as CompItem, subScene)
        node = subScene
      } else {
        const mainSource = await source.mainSource
        if (mainSource && mainSource.hasOwnProperty('color')) {
          const solidSource = mainSource as SolidSource
          const aeColor = await solidSource.color
          const color = new Color().fromArray(await syncArray(aeColor))
          const geometry = new AERectGeometry(await source.width, await source.height)
          // const opacity = await findCollectionItemPath(avLayer, "property", "Layer Styles.Blending Options.Advanced Blending.Fill Opacity")
          const opacity = await getAEProperty(avLayer, 'Transform.Opacity')
          const opacityVal = (await opacity.value) * 0.01
          const mesh = new Mesh(geometry, new MeshBasicMaterial({
            color, 
            side: BackSide,
            transparent: opacityVal < 1,
            opacity: opacityVal,
            depthTest: isLayer3D,
            depthWrite: isLayer3D
          }))
          node = mesh
        } else {
          error('Unsupported type')
          node = null
        }
      }
    } else {
      const cam = await convertCamera(layer as CameraLayer, comp)
      node = cam
      isLayer3D = true
      scene.add(cam)
      activeCameras[0] = cam
    }
    if (node) {
      scene.add(node)
      const transform = await getAEProperty(layer, 'Transform')
      const position = await getAEProperty(transform, 'Position')
      const posArr = await syncArray(await position.value)
      node.position.fromArray(posArr)
      const scale = await getAEProperty(transform, 'Scale')
      const scaleArr = await syncArray(await scale.value)
      if (scaleArr[2] === 0) scaleArr[2] = 1
      for (let i = 0; i < scaleArr.length; i++) {
        scaleArr[i] *= 0.01
      }
      node.scale.fromArray(scaleArr)
      if (isLayer3D) {
        const rotationX = await getAEProperty(transform, 'X Rotation')
        const rotationY = await getAEProperty(transform, 'Y Rotation')
        const rotationZ = await getAEProperty(transform, 'Z Rotation')
        node.rotation.x = await rotationX.value * __degToRad
        node.rotation.y = await rotationY.value * __degToRad
        node.rotation.z = await rotationZ.value * __degToRad
        const orientationAe = await getAEProperty(transform, 'Orientation')
        const orientationArr = await syncArray(await orientationAe.value)
        for (let i = 0; i < orientationArr.length; i++) {
          orientationArr[i] *= __degToRad
        }
        const orientation = new Euler().fromArray(orientationArr)
        node.userData.orientation = orientation
      } else {
        const rotation = await getAEProperty(transform, 'Rotation')
        node.rotation.z = (await rotation.value) * __degToRad
      }
      node.renderOrder = isLayer3D ? -999999 : -index
      if (isLayer3D) {
        node.layers.set(2)
      }

      if (hasAnchor) {
        const anchorPointAe = await getAEProperty(transform, 'Anchor Point')
        const anchorPointArr = await syncArray(await anchorPointAe.value)
        const anchorPoint = new Vector3().fromArray(anchorPointArr).multiplyScalar(-1)
        node.userData.anchorPoint = anchorPoint
      }

      const matrix = node.matrix
      const prematrix = new Matrix4()
      const localNode = node
      // TODO get a mathematician to write a more efficient matrix composer method that takes achnor point, orientation, position, rotation and scale
      // current implementation is slower but accurate
      node.updateMatrix = () => {
        matrix.identity()
        let p = localNode.position
        matrix.multiply(__tempMatrix.makeTranslation(p.x, p.y, p.z))
        if (localNode.userData.orientation) {
          matrix.multiply(__tempMatrix.makeRotationFromEuler(localNode.userData.orientation))
        }
        matrix.multiply(__tempMatrix.makeRotationFromEuler(localNode.rotation))
        p = localNode.scale
        matrix.multiply(__tempMatrix.makeScale(p.x, p.y, p.z))
        p = localNode.userData.anchorPoint
        if (p) {
          matrix.multiply(__tempMatrix.makeTranslation(p.x, p.y, p.z))
        }
      }
    }
  }
  if (__subCompsQueue.length > 0) {
    const next = __subCompsQueue.shift()!
    await loadCompScene(next.scene, next.comp)
  }
}

function loop() {
  if (afterEffects && !_initedComp) initAfterEffects()
  sphere.rotation.y += 0.001
  if (rootScene.userData.activeCameras) {
    rootScene.userData.activeCameras.forEach(camera => {
      if (camera) {
        renderer.render(rootScene, camera)
      }
    })
  }
  requestAnimationFrame(loop)
}

// Start loop
requestAnimationFrame(loop)


console.log('Initiating AfterEffects connection...')
CSLibrary.evalScript('resetCaches()', result => {
  CSLibrary.evalScript('describe(app)', result => {
    console.log('AfterEffects connection established!')
    afterEffects = eval(result)
  })
})

// setTimeout(testLayer, 2000)