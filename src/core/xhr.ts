import { AxiosRequestConfig, AxiosResponse, AxiosPromise } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import cookie from '../helpers/cookie'
import { isURLSameOrigin } from '../helpers/url'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      url = '',
      method = 'get',
      data = null,
      headers = {},
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      auth
    } = config

    const request = new XMLHttpRequest()

    if (auth) {
      headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
    }

    if (cancelToken) {
      cancelToken.promise.then(reason => {
        request.abort()
        reject(reason)
      })
    }

    if (withCredentials) {
      request.withCredentials = true
    }

    if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName){
      const xsrfValue = cookie.read(xsrfCookieName)
      if (xsrfValue) {
        headers[xsrfHeaderName!] = xsrfValue
      }
    }

    if (timeout) request.timeout = timeout
    if (responseType) request.responseType = responseType

    request.open(method.toUpperCase(), url, true)

    request.onerror = function handleError() {
      reject(createError('Network Error', config, null, request))
    }

    request.ontimeout = function handleTimeout() {
      reject(
        createError(`Timeout of ${config.timeout} ms exceeded`, config, 'ECONNABORTED', request)
      )
    }

    request.onreadystatechange = function handleLoad() {
      if (request.readyState !== 4) return
      if (request.status === 0) return

      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      const responseData =
        responseType && responseType !== 'text' ? request.response : request.responseText

      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      handleResponse(response)
    }

    function handleResponse(response: AxiosResponse) {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }

    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    request.send(data)
  })
}
