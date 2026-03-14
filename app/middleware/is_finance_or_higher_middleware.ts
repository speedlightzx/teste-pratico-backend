import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class IsFinanceOrHigherMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    if(ctx.user.role == 'User') return ctx.response.forbidden({ error: 'Você não tem permissão para fazer isso.' })

    /**
     * Call next method in the pipeline and return its output
     */
    return await next()
  }
}