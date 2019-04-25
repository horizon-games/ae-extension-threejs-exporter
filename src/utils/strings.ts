export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function pluralize(str: string) {
  if (str.charAt(str.length - 1) === 'y') {
    return str.slice(0, str.length - 1) + 'ies'
  } else {
    return str + 's'
  }
}

export function prefixVarName(prefix: string, name: string) {
  if (prefix === '') {
    return name
  }
  return prefix + capitalize(name)
}
