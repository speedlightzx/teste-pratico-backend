import ValidatorService from '#services/validator_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { newProductDTO } from '../../dto/products/newProductDTO.js'
import { updateProductDTO } from '../../dto/products/updateProductDTO.js'
import PrismaService from '#services/prisma_service'

@inject()
export default class ProductsController {
    private prisma

    constructor(
        private validator:ValidatorService
    ) {
        this.prisma = PrismaService.getClient()
    }

    async getAllProducts({ response }: HttpContext) {
        const products = await this.prisma.products.findMany({
            select: {
                name: true,
                amount: true,
                id: true
            }
        })

        return response.ok({ products })
    }

    async getProduct({ params, response }: HttpContext) {
        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        const product = await this.prisma.products.findUnique({ 
            where: { id },
            select: {
                name: true,
                amount: true
            }
         })
        if(!product) return response.notFound({ error: 'Não foi encontrado nenhum produto com esse id.' })
        
        return response.ok({ product })
    }

    async postProduct({ response, request }: HttpContext) {
        const data = this.validator.validateDto(newProductDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        const { name, amount } = data.data

        await this.prisma.products.create({ data: {
            name,
            amount
        } })

        return response.created()
     }

    async putProduct({ params, response, request }: HttpContext) {
        const data = this.validator.validateDto(updateProductDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)
        
        const { name, amount } = data.data

        const product = await this.prisma.products.update({
            where: { id },
            data: {
                name,
                amount
            },
            select: {
                name: true,
                amount: true
            }
        })

        return response.ok({ product })
     }

    async deleteProduct({ response, params }: HttpContext) {
        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        const product = await this.prisma.products.deleteMany({ where: { id } })
        if(product.count == 0) return response.notFound({ error: 'Não foi encontrado nenhum produto com esse id.' })

        return response.noContent()
     }
}