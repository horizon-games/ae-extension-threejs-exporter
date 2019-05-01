/// <reference types="types-for-adobe/AfterEffects/2018"/>"
import {
  BackSide,
  Camera,
  Color,
  Euler,
  ImageUtils,
  MaterialParameters,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Object3D,
  OrthographicCamera,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  SphereBufferGeometry,
  Texture,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer
} from 'three'

import { MaskedSpritesheetMeshBasicMaterial } from './materials/MaskedSpritesheetMeshBasicMaterial';
import {
  EffectProperties, SpritesheetMeshBasicMaterial, SupportedEffects
} from './materials/SpritesheetMeshBasicMaterial'
import { Matrix2DUniformInterface } from './math/Matrix2DUniformInterface'
import { getAERectGeometry } from './utils/geometry';
import { capitalize, pluralize } from './utils/strings'
import { CSInterface, UIColor } from './vendor/CSInterface'
import { Matrix2D } from './vendor/easeljs/Matrix2D';

const CSLibrary = new CSInterface()

function changeThemeColor() {
  const hostEnv = CSLibrary.getHostEnvironment()
  let UIColorObj = new UIColor()

  UIColorObj = hostEnv.appSkinInfo.appBarBackgroundColor
  const red = Math.round(UIColorObj.color.red)
  const green = Math.round(UIColorObj.color.green)
  const blue = Math.round(UIColorObj.color.blue)
  const alpha = Math.round(UIColorObj.color.alpha)
  const colorRGB =
    '#' + red.toString(16) + green.toString(16) + blue.toString(16)

  const bodyElement = window!.document!.getElementById('index_body')!
  bodyElement.style.backgroundColor = colorRGB
  bodyElement.style.opacity = (alpha / 255).toString()
}

window.onload = () => {
  CSLibrary.addEventListener('com.adobe.csxs.events.ThemeColorChanged', event =>
    changeThemeColor()
  )
  changeThemeColor()
}

let afterEffects: any

let active = false

const __useAtlases = true

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
renderer.gammaFactor = 1.0 //2.2
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

const sphere = new Mesh(
  new SphereBufferGeometry(500, 64, 32),
  new MeshBasicMaterial({ color: 0xffffff, wireframe: true })
)
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
  const cam = new PerspectiveCamera(
    degs,
    (await comp.width) / (await comp.height),
    10,
    10000
  )
  decorateMethodAfter(cam, 'updateProjectionMatrix', () => {
    cam.projectionMatrix.scale(new Vector3(1, -1, -1))
  })
  cam.updateProjectionMatrix()
  return cam
}

async function syncArray(asyncArr: any[]) {
  if (!asyncArr.hasOwnProperty('length')) {
    return syncArrayLike(asyncArr)
  }
  const arr: any[] = []
  for (let i = 0; i < asyncArr.length; i++) {
    arr[i] = await asyncArr[i]
  }
  return arr
}

async function syncArrayLike(asyncArr: any[]) {
  const arr: any[] = []
  for (let i = 0; i < 99; i++) {
    const value = await asyncArr[i]
    if (value !== undefined) {
      arr[i] = value
    } else {
      break
    }
  }
  return arr
}

async function getAEProperty(base: any, namePath: string) {
  return findCollectionItemPath(base, 'property', namePath)
}

async function hasAEProperty(base: any, namePath: string) {
  try {
    await findCollectionItemPath(base, 'property', namePath)
    return true
  } catch (err) {
    return false
  }
}

async function findCollectionItemPath(
  base: any,
  collectionName: string,
  namePath: string
) {
  const names = namePath.split('.')
  let cursor = base
  while (names.length > 0) {
    cursor = await findCollectionItem(cursor, collectionName, names.shift()!)
  }
  return cursor
}

async function findCollectionItem(
  base: any,
  collectionName: string,
  name: string
) {
  const numName = 'num' + pluralize(capitalize(collectionName))
  if (
    !base ||
    !base.hasOwnProperty(numName) ||
    !base.hasOwnProperty(collectionName)
  ) {
    error('Collection is invalid.')
  }
  const collection = (await base[collectionName]) as (i: number) => any
  const num = await base[numName]
  const triedNames: string[] = []
  for (let i = 1; i <= num; i++) {
    const item = await collection(i)
    const tempName = await item.name
    if (tempName === name) {
      return item
    }
    triedNames.push(tempName)
  }
  const messageLines = [
    'Collection does not contain item named ' + name,
    'found the following Properties:'
  ]
  for (const triedName of triedNames) {
    messageLines.push('  ' + triedName)
  }
  error(messageLines.join('\n'))
}

async function collectCollectionNames(
  base:any,
  collectionName:string
) {
  const numName = 'num' + pluralize(capitalize(collectionName))
  if (
    !base ||
    !base.hasOwnProperty(numName) ||
    !base.hasOwnProperty(collectionName)
  ) {
    error('Collection is invalid.')
  }
  const collection = (await base[collectionName]) as (i: number) => any
  const num = await base[numName]
  const names: string[] = []
  for (let i = 1; i <= num; i++) {
    const item = await collection(i)
    names.push(await item.name)
  }
  return names
}

let _initedComp = false
async function initAfterEffects() {
  _initedComp = true
  const maybeComp = await (await ((await afterEffects) as Application).project)
    .activeItem
  if (!maybeComp || (await maybeComp.typeName) !== 'Composition') {
    console.warn(
      'activeItem is not a Composition. Select a Composition and try again.'
    )
    return
  }
  const mainComp = maybeComp as CompItem
  const scene = new Scene()
  rootScene = scene
  await loadCompScene(scene, mainComp)
  console.log('finished building comp')
  const projPath = await (await afterEffects.project).file
  const atlasCompName = await mainComp.name
  const scenePath = projPath + '.' + atlasCompName + '.three.json'
  const dataString = JSON.stringify(rootScene.toJSON())
  console.log('save json (' + dataString.length + ' bytes) to ' + scenePath)
  const result = cep.fs.writeFile(scenePath, dataString)
  console.log(result)
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
const __textureCache = new Map<string, Texture>()
function __getCachedTexture(path: string) {
  if (!__textureCache.has(path)) {
    __textureCache.set(
      path,
      ImageUtils.loadTexture(
        'file://' + path,
        undefined,
        tex => (tex.flipY = false)
      )
    )
  }
  return __textureCache.get(path)!
}

async function createLayerMesh(
  avLayer: AVLayer,
  source: any,
  isLayer3D: boolean,
  content: Color | string,
  transparent: boolean = false
) {
  const sourceWidth = await source.width
  const sourceHeight = await source.height
  const geometry = getAERectGeometry()
  // const opacity = await findCollectionItemPath(avLayer, "property", "Layer Styles.Blending Options.Advanced Blending.Fill Opacity")
  const opacity = await getAEProperty(avLayer, 'Transform.Opacity')
  const opacityVal = (await opacity.value) * 0.01
  const params: MaterialParameters = {
    side: BackSide,
    transparent: opacityVal < 1 || transparent,
    opacity: opacityVal,
    depthTest: isLayer3D,
    depthWrite: isLayer3D
  }

  let mesh: Mesh | undefined

  if (content instanceof Color) {
    const basicParams = params as MeshBasicMaterialParameters
    basicParams.color = content
    mesh = new Mesh(geometry, new MeshBasicMaterial(basicParams))
  } else {
    if (__useAtlases) {
      const usedIn = (await syncArray(await source.usedIn)) as CompItem[]
      let atlasComp: CompItem | undefined
      let indexToRemember = -1
      for (let i = 0; i < usedIn.length && !atlasComp; i++) {
        if ((await usedIn[i].name).indexOf('-atlas') !== -1) {
          atlasComp = usedIn[i]
          indexToRemember = i
        }
      }
      if (atlasComp) {
        const atlasWidth = await atlasComp.width
        const atlasHeight = await atlasComp.height
        const projPath = await (await afterEffects.project).file
        const atlasCompName = await atlasComp.name
        const atlasPath = projPath + '.' + atlasCompName + '.png'
        if (!__textureCache.has(atlasPath)) {
          console.log('rendering ' + atlasPath)
          await (await source.usedIn)[indexToRemember]
          await new Promise<boolean>(resolve => {
            CSLibrary.evalScript(
              'var tempFile = new File("' +
                atlasPath +
                '"); \
              lastDescribed.saveFrameToPng(0, tempFile);',
              result => {
                console.log(result)
                setTimeout(() => {
                  resolve(true)
                }, 1000)
              }
            )
          })
        }
        const numAtlasLayers = await atlasComp.numLayers
        let atlasLayer: AVLayer | undefined
        for (let i = 1; i <= numAtlasLayers && !atlasLayer; i++) {
          const maybeAtlasLayer = (await (await atlasComp.layer)(i)) as AVLayer
          const atlasLayerSource = await maybeAtlasLayer.source
          if (
            (await atlasLayerSource.file) === (await source.file) &&
            (await atlasLayerSource.name) === (await source.name)
          ) {
            atlasLayer = maybeAtlasLayer
          }
        }

        const effectProperties:EffectProperties = new Map<SupportedEffects, Map<string, number | Vector2 | Vector3 | Vector4 | Color>>()

        if(await hasAEProperty(avLayer, 'Effects')) {
          const effects = await getAEProperty(avLayer, 'Effects')
          const effectNames = await collectCollectionNames(effects, 'property')
          for (const effectName of effectNames) {
            if(effectName === "Channel Mixer") {
              const effect = await getAEProperty(effects, effectName)
              const channelNamesIn = ['Red', 'Green', 'Blue']
              const channelNamesOut = ['Red', 'Green', 'Blue', 'Const']
              const values:number[] = []
              for (let iIn = 0; iIn < channelNamesIn.length; iIn++) {
                for (let iOut = 0; iOut < channelNamesOut.length; iOut++) {
                  values.push(await (await getAEProperty(effect, channelNamesIn[iIn]+'-'+channelNamesOut[iOut])).value / 100)
                }
              }
              const props = new Map<string, Color>()
              props.set('red', new Color(values[0], values[4], values[8]))
              props.set('green', new Color(values[1], values[5], values[9]))
              props.set('blue', new Color(values[2], values[6], values[10]))
              effectProperties.set("channelMixer", props)
            }
          }
        }

        const transform = await getAEProperty(atlasLayer, 'Transform')
        const anchor = await getAEProperty(transform, 'Anchor Point')
        const anchorArr = await syncArray(await anchor.value)
        const position = await getAEProperty(transform, 'Position')
        const posArr = await syncArray(await position.value)
        const scale = await getAEProperty(transform, 'Scale')
        const scaleArr = await syncArray(await scale.value)
        const rotation = await getAEProperty(transform, 'Rotation')
        const angle = await rotation.value
        const mat23 = new Matrix2DUniformInterface()
        mat23.compose(
          posArr[0] / atlasWidth,
          posArr[1] / atlasHeight,
          scaleArr[0] * 0.01 * (sourceWidth / atlasWidth),
          scaleArr[1] * 0.01 * (sourceHeight / atlasHeight),
          angle,
          anchorArr[0] / sourceWidth,
          anchorArr[1] / sourceHeight
        )
        // debugger
        mesh = new Mesh(
          geometry,
          new SpritesheetMeshBasicMaterial({
            mapTexture: __getCachedTexture(atlasPath),
            matrix: mat23,
            materialParams: params,
            effectProperties
          })
        )
      } else {
        console.warn("Footage item doesn't belong to an atlas")
      }
    }
    if (!mesh) {
      const basicParams = params as MeshBasicMaterialParameters
      basicParams.map = __getCachedTexture(content)
      mesh = new Mesh(geometry, new MeshBasicMaterial(basicParams))
    }
  }
  mesh.userData.resolution = new Vector3(sourceWidth, sourceHeight, 1)
  return mesh
}

async function loadCompScene(scene: Scene, comp: CompItem) {
  const compWidth = await comp.width
  const compHeight = await comp.height
  const defaultCamera2D = (camera = new OrthographicCamera(
    0,
    compWidth,
    0,
    compHeight,
    -1000,
    1000
  ))
  scene.add(defaultCamera2D)
  const activeCameras: Array<Camera | null> = [null, defaultCamera2D]
  scene.userData.activeCameras = activeCameras

  const numLayers = await comp.numLayers

  let node: Object3D | null = null
  let isLayer3D = false
  let hasAnchor = false
  let maskLayer: AVLayer | undefined
  let maskNode: Mesh | undefined
  for (let index = 1; index <= numLayers; index++) {
    const layer = await (await comp.layer)(index)
    node = null
    isLayer3D = false
    hasAnchor = false
    const hasVideo = await layer.hasVideo
    const avLayer = hasVideo ? (layer as AVLayer) : undefined
    if (!(await layer.enabled) && !(avLayer && (await avLayer.isTrackMatte))) {
      continue
    }
    if (avLayer) {
      isLayer3D = await avLayer.threeDLayer
      hasAnchor = true
      const source = await avLayer.source
      if ((await source.typeName) === 'Composition') {
        const subScene = new Scene()
        __queueSubComp(source as CompItem, subScene)
        node = subScene
      } else {
        const mainSource = await source.mainSource
        if (mainSource) {
          if (mainSource.hasOwnProperty('color')) {
            const solidSource = mainSource as SolidSource
            const aeColor = await solidSource.color
            const color = new Color().fromArray(await syncArray(aeColor))
            node = await createLayerMesh(avLayer, source, isLayer3D, color)
          } else if (mainSource.hasOwnProperty('file')) {
            const footageSource = mainSource as FootageSource
            node = await createLayerMesh(
              avLayer,
              source,
              isLayer3D,
              await mainSource.file,
              await footageSource.hasAlpha
            )
          } else {
            error('Unsupported source type')
            node = null
          }
        }
      }
    } else if (await hasAEProperty(layer, 'Camera Options')) {
      const cam = await convertCamera(layer as CameraLayer, comp)
      node = cam
      isLayer3D = true
      scene.add(cam)
      activeCameras[0] = cam
    } else {
      error('Unsupported layer type')
    }
    if (node) {
      scene.add(node)
      node.name = await layer.name
      const transform = await getAEProperty(layer, 'Transform')
      const position = await getAEProperty(transform, 'Position')
      const posArr = await syncArray(await position.value)
      node.position.fromArray(posArr)
      const scale = await getAEProperty(transform, 'Scale')
      const scaleArr = await syncArray(await scale.value)
      if (scaleArr[2] === 0) {
        scaleArr[2] = 1
      }
      for (let i = 0; i < scaleArr.length; i++) {
        scaleArr[i] *= 0.01
      }
      node.scale.fromArray(scaleArr)
      if (isLayer3D) {
        const rotationX = await getAEProperty(transform, 'X Rotation')
        const rotationY = await getAEProperty(transform, 'Y Rotation')
        const rotationZ = await getAEProperty(transform, 'Z Rotation')
        node.rotation.x = (await rotationX.value) * __degToRad
        node.rotation.y = (await rotationY.value) * __degToRad
        node.rotation.z = (await rotationZ.value) * __degToRad
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
        const anchorPoint = new Vector3()
          .fromArray(anchorPointArr)
          .multiplyScalar(-1)
        node.userData.anchorPoint = anchorPoint
      }

      const matrix = node.matrix
      const localNode = node
      // TODO get a mathematician to write a more efficient matrix composer method that takes achnor point, orientation, position, rotation and scale
      // current implementation is slower but accurate
      node.updateMatrix = () => {
        matrix.identity()
        let p = localNode.position
        matrix.multiply(__tempMatrix.makeTranslation(p.x, p.y, p.z))
        if (localNode.userData.orientation) {
          matrix.multiply(
            __tempMatrix.makeRotationFromEuler(localNode.userData.orientation)
          )
        }
        matrix.multiply(__tempMatrix.makeRotationFromEuler(localNode.rotation))
        p = localNode.scale
        matrix.multiply(__tempMatrix.makeScale(p.x, p.y, p.z))
        p = localNode.userData.anchorPoint
        if (p) {
          matrix.multiply(__tempMatrix.makeTranslation(p.x, p.y, p.z))
        }
        p = localNode.userData.resolution
        if (p) {
          matrix.multiply(__tempMatrix.makeScale(p.x, p.y, p.z))
        }
      }
      node.updateMatrix()

      if (maskLayer && maskNode) {
        if (maskNode.material instanceof SpritesheetMeshBasicMaterial && node instanceof Mesh && node.material instanceof MeshBasicMaterial) {
          maskNode.updateMatrix()
          const content2DMatrix = new Matrix2DUniformInterface().fromObject3D(node)
          const mask2DMatrix = new Matrix2DUniformInterface().fromObject3D(maskNode)

          content2DMatrix.matrix.invert().appendMatrix(mask2DMatrix.matrix)
          content2DMatrix.updateUniforms()
          maskNode.material = new MaskedSpritesheetMeshBasicMaterial({
            mapTexture: maskNode.material.mapTexture,
            matrix: maskNode.material.matrix2DInterface,
            contentMapTexture: node.material.map!,
            contentMatrix: content2DMatrix,
            materialParams: maskNode.material.parameters
          })
        }
        node.visible = false
      }

      maskLayer = avLayer && (await avLayer.isTrackMatte) ? avLayer : undefined
      maskNode = maskLayer ? (node as Mesh) : undefined
    }
  }
  if (__subCompsQueue.length > 0) {
    const next = __subCompsQueue.shift()!
    await loadCompScene(next.scene, next.comp)
  }
}

function loop() {
  if (afterEffects && !_initedComp) {
    initAfterEffects()
  }
  sphere.rotation.y += 0.001
  if (rootScene.userData.activeCameras && active) {
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

window.addEventListener('focus', event => {
  const obj = document.querySelector('#isActiveExt')!
  if (!parseInt(obj.value, 10)) {
    obj.value = 1
    active = true
    console.log('Extension is active!')
  }
})

window.addEventListener('blur', event => {
  const obj = document.querySelector('#isActiveExt')!
  if (parseInt(obj.value, 10)) {
    obj.value = 0
    active = false
    console.log('Extension is deactive!')
  }
})
