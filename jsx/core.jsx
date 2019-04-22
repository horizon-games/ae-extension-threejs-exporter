/// <reference types="types-for-adobe/AfterEffects/2018"/>"
var blacklistedMethodNames = [
  '==',
  '=>'
];

var cacheArrs = []
function makeArrayAccessor(value) {
  var index = cacheArrs.indexOf(value)
  if(index === -1) {
    index = cacheArrs.length;
    cacheArrs.push(value)
  }
  var lines = ["(() => ({ "]
  for(i in value) {
    lines.push(makeArrayElementAccessor(index, i))
  }
  lines.push("}))()")
  return lines.join('\n')
}
function makeArrayElementAccessor(index, key) {
  return "get "+key+"(){ \
    return new Promise(resolve => { \
      CSLibrary.evalScript( \
        'describe(cacheArrs["+index+"]["+key+"])', \
        result => resolve(eval(result)) \
      ) \
    }) \
  },"
}

var cacheObjs = []
function makeObjectAccessor(value) {
  var index = cacheObjs.indexOf(value)
  if(index === -1) {
    index = cacheObjs.length;
    cacheObjs.push(value)
  }
  var lines = ["(() => ({ "]
  for(propName in value) {
    if(blacklistedMethodNames.indexOf(propName) === -1) {
      lines.push(makeObjectPropertyAccessor(index, propName))
    }
  }
  lines.push("}))()")
  return lines.join('\n')
}
function makeObjectPropertyAccessor(index, key) {
  var caster = key === 'file' ? '.fsName' : ''
  return "get "+key+"(){ \
    return new Promise(resolve => { \
      CSLibrary.evalScript( \
        'describe(cacheObjs["+index+"]."+key+caster+", cacheObjs["+index+"])', \
        result => resolve(eval(result)) \
      ) \
    }) \
  },"
}

var cacheMethods = []
var cacheMethodScopes = []
function makeMethodAccessor(value, scope) {
  var index = cacheMethods.length;
  cacheMethods.push(value)
  cacheMethodScopes.push(scope)
  return "(() => { \
    return function() { \
      var args = Array.prototype.slice.call(arguments); \
      return new Promise(resolve => { \
        CSLibrary.evalScript( \
          'describe(cacheMethods["+index+"].apply(cacheMethodScopes["+index+"], ['+args+']))', \
          result => resolve(eval(result)) \
        ) \
      }) \
    } \
  })()"
}

function describe(value, parent) {
  switch(typeof value) {
    case 'object':
      if(value === null) {
        return "(() => "+value+")()"
      } else if (Object.prototype.toString.apply(value) === '[object Array]') {
        return makeArrayAccessor(value)
      } else {
        return makeObjectAccessor(value)
      }
      break;
    case 'function':
      return makeMethodAccessor(value, parent)
      // return function test() { log('test'); }
    case "string":
      return "(() => \""+value+"\")()"
    default:
      return "(() => "+value+")()"
  }
}

function resetCaches() {
  cacheArrs.length = 0
  cacheObjs.length = 0
  cacheMethods.length = 0
  cacheMethodScopes.length = 0
}