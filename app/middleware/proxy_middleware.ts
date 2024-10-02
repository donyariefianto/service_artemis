import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { createProxyMiddleware } from 'http-proxy-middleware'
import env from '#start/env'

export default class ProxyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    if (ctx.request.url().startsWith('/drive/')) {
      const minio_service = env.get('MINIO_SERVICE')
      const proxy = createProxyMiddleware({
        target: minio_service,
        changeOrigin: true,
        pathRewrite: {
          '^/drive': '', // Remove /proxy prefix when forwarding
        },
      })
      return new Promise((resolve, reject) => {
        proxy(ctx.request.request, ctx.response.response, (err: any) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    }
    /**
     * Call next method in the pipeline and return its output
     */
    // await next()
  }
}
