import ValidatorService from '#services/validator_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { updateGatewayStatusDTO } from '../../dto/gateways/updateGatewayStatusDTO.js'
import { updateGatewayPriorityDTO } from '../../dto/gateways/updarteGatewayPriorityDTO.js'
import PrismaService from '#services/prisma_service'

@inject()
export default class GatewaysController {
    private prisma

    constructor(
        private validator:ValidatorService
    ) {
        this.prisma = PrismaService.getClient()
    }

    async updateStatus({ params, request, response }: HttpContext) {
        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        const data = this.validator.validateDto(updateGatewayStatusDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        const gateway = await this.prisma.gateways.updateMany({ 
            where: { id },
            data: {
                isActive: data.data.status
            }
        })

        if(!gateway.count) return response.notFound({ error: 'Não foi encontrado nenhum gateway com esse id.' })
        return response.ok({ message: `Gateway ${id} agora está ${data.data.status ? 'ativo' : 'inativo'}.` })
    }

    async updatePriority({ params, request, response }: HttpContext) {
        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        const data = this.validator.validateDto(updateGatewayPriorityDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        const gateway = await this.prisma.gateways.updateMany({ 
            where: { id },
            data: {
                priority: data.data.priority
            }
        })

        if(!gateway.count) return response.notFound({ error: 'Não foi encontrado nenhum gateway com esse id.' })
        return response.ok({ message: `Prioridade do Gateway ${id} alterada para ${data.data.priority}.` })
    }

    async getGateways({ response }: HttpContext) {
        const gateways = await this.prisma.gateways.findMany({
            select: {
                id: true,
                isActive: true,
                name: true,
                priority: true
            }
        })

        return response.ok({ gateways })
    }

}