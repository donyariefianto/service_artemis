import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { createProxyMiddleware } from 'http-proxy-middleware'
export default class ProxyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    if (ctx.request.url().startsWith('/tes/')) {
      const proxy = createProxyMiddleware({
        target: 'http://10.1.10.14:9000',
        changeOrigin: true,
        pathRewrite: {
          '^/tes': '', // Remove /proxy prefix when forwarding
        },
      })
      // proxy(ctx.request.request, ctx.response.response)
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
