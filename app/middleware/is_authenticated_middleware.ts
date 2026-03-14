import AuthService from '#services/auth_service'
import PrismaService from '#services/prisma_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

@inject()
export default class IsAuthenticatedMiddleware {
  private prisma
  constructor(
    private authService:AuthService
  ) {
    this.prisma = PrismaService.getClient()
  }

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const authorizationToken =  ctx.request.header('Authorization')
    if(!authorizationToken?.startsWith('Bearer ')) return ctx.response.unauthorized({ error: 'A autorização precisa ser Bearer token.'})
  
    const token = authorizationToken.split('Bearer')[1].trim()

    const isValidToken = await this.authService.verifyToken(token)
    if(isValidToken == null) return ctx.response.unauthorized({ error: 'Token inválido.' })

    const userExists = await this.prisma.users.findFirst({ where: { id: isValidToken.userId } })
    if(!userExists) return ctx.response.unauthorized({ error: 'Usuário não encontrado.' })    

    ctx.user = userExists

    /**
     * Call next method in the pipeline and return its output
     */
    await next()
  }
}