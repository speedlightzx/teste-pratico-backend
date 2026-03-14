import ValidatorService from '#services/validator_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { newUserDTO } from '../../dto/users/newUserDTO.js'
import AuthService from '#services/auth_service'
import { updateUserDTO } from '../../dto/users/updateUserDTO.js'
import PrismaService from '#services/prisma_service'

@inject()
export default class UsersController {
    private prisma

    constructor(
        private validator:ValidatorService,
        private authService:AuthService
    ) {
        this.prisma = PrismaService.getClient()
    }

    async getAllUsers({ response }: HttpContext) {
        const users = await this.prisma.users.findMany({
            select: {
                email: true,
                role: true,
                id: true
            }
        })

        return response.ok({ users })
    }

    async getUser({ params, response }: HttpContext) {
        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        const user = await this.prisma.users.findUnique({ 
            where: { id },
            select: {
                email: true,
                role: true
            }
         })
        if(!user) return response.notFound({ error: 'Não foi encontrado nenhum user com esse id.' })
        
        return response.ok({ user })
    }

    async postUser({ response, request }: HttpContext) {
        const data = this.validator.validateDto(newUserDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        const { role, email, password } = data.data

        const emailAlreadyExists = await this.prisma.users.findFirst({ where: { email } })
        if(emailAlreadyExists) return response.conflict({ error: 'Já existe um user com esse email.' })

        const hashPassword = await this.authService.hashPassword(password)
        await this.prisma.users.create({ data: {
            role,
            email,
            password: hashPassword
        } })

        return response.created()
     }

    async putUser({ params, response, request }: HttpContext) {
        const data = this.validator.validateDto(updateUserDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        let { email, password, role } = data.data
        
        if(email) {
            const emailAlreadyExists = await this.prisma.users.findFirst({ where: { email } })
            if(emailAlreadyExists) return response.conflict({ error: 'Já existe um user com esse email.' })
        }

        if(password) password = await this.authService.hashPassword(password)

        const user = await this.prisma.users.update({
            where: { id },
            data: {
                email,
                role,
                password
            },
            select: {
                email: true,
                role: true
            }
        })

        return response.ok({ user })
     }

    async deleteUser({ response, params }: HttpContext) {
        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        const user = await this.prisma.users.deleteMany({ where: { id } })
        if(user.count == 0) return response.notFound({ error: 'Não foi encontrado nenhum user com esse id.' })

        return response.noContent()
     }
}