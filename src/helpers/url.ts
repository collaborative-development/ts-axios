import { isDate, isPlainObject } from './utils'

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

function encodeParams(values: string[], parts: string[], key: string) {
  values.forEach(val => {
    if (isDate(val)) val = val.toISOString()
    else if (isPlainObject(val)) val = JSON.stringify(val)
    parts.push(`${encode(key)}=${encode(val)}`)
  })
}

// {a: value, b: value} => [value, value]
function tansParamsToArray(params: any, parts: string[]) {
  const paramsKeys = Object.keys(params)

  paramsKeys.forEach(key => {
    let val = params[key]
    let values: string[]

    if (val == null) return

    if (Array.isArray(val)) {
      values = val
      key += '[]'
    } else values = [val]

    encodeParams(values, parts, key)
  })
}

function delUrlHashMark(serializedParams: string, url: string) {
  if (!serializedParams) return
  const markIndex = url.indexOf('#')
  if (markIndex !== -1) url = url.slice(0, markIndex)
}

export default function buildURL(url: string, params?: any) {
  if (!params) return url

  const parts: string[] = []

  tansParamsToArray(params, parts)

  let serializedParams = parts.join('&')

  delUrlHashMark(serializedParams, url)

  url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams

  return url
}

interface URLOrigin {
  protocol: string
  host: string
}

export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

const urlParsingNode = document.createElement('a')
const currentOrigin = resolveURL(window.location.href)

function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode

  return {
    protocol,
    host
  }
}
