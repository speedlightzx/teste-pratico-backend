import PrismaService from '#services/prisma_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
    private prisma

    constructor() {
        this.prisma = PrismaService.getClient()
    }

    async getAllClients({ response }: HttpContext) {
        const clients = await this.prisma.clients.findMany({
            select: {
                id: true,
                email: true,
                name: true
            }
        })

        return response.ok({ clients })
    }

    async getClient({ params, response }: HttpContext) {
        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        const client = await this.prisma.clients.findUnique({ 
            where: { id },
            select: {
                email: true,
                id: true,
                name: true,
                transaction: {
                    select: {
                        amount: true,
                        card_last_numbers: true,
                        external_id: true,
                        gateway_id: true,
                        status: true,
                        transactionProducts: {
                            select: {
                                quantity: true,
                                product: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
         })

        if(!client) return response.notFound({ error: 'Não foi encontrado nenhum cliente com esse id.' })
        
        return response.ok({ client })
    }
    
}