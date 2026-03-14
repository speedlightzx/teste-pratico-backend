import ValidatorService from '#services/validator_service'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { loginDTO } from '../../dto/auth/loginDTO.js'
import AuthService from '#services/auth_service'
import PrismaService from '#services/prisma_service'
import { Bcrypt } from '@adonisjs/core/hash/drivers/bcrypt'

@inject()
export default class AuthController {
    private prisma

    constructor(
        private validator:ValidatorService,
        private authService:AuthService
    ) {
        this.prisma = PrismaService.getClient()
    }

    async login({ request, response }: HttpContext) {
        const data = this.validator.validateDto(loginDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        const { email, password } = data.data

        const findUser = await this.prisma.users.findFirst({ where: { email } })
        if(!findUser) return response.unauthorized({ error: 'Credenciais inválidas.' })

        const isPasswordCorrect = await new Bcrypt({}).verify(findUser.password, password)
        if(!isPasswordCorrect) return response.unauthorized({ error: 'Credenciais inválidas.' })

        const token = await this.authService.generateToken(findUser.id, findUser.role)
        response.ok({ token })
    }
}