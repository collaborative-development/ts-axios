import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import buildUrl from '../helpers/url'
// import { transformRequest, transformResponse } from '../helpers/data'
import { flattenHeaders, proccessHeaders } from '../helpers/headers'
import transform from './transform'

function transformUrl(config: AxiosRequestConfig): string {
  const { url = '', params } = config
  return buildUrl(url, params)
}

// function transformRequestData(config: AxiosRequestConfig): void {
//   return transformRequest(config.data)
// }

function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

// function transfromHeaders(config: AxiosRequestConfig): void {
//   const { headers = {}, data } = config
//   return proccessHeaders(headers, data)
// }

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
  proccessHeaders(config.headers, config.data)
  config.data = transform(config.data, config.headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!)
}

function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)
  processConfig(config)
  return xhr(config).then(res => transformResponseData(res))
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}

export default dispatchRequest