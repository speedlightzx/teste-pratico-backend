import ValidatorService from '#services/validator_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'
import { buyProductDTO } from '../../dto/purchases/buyProductsDTO.js';
import GatewayService from '#services/gateway_service';
import { refundTransactionDTO } from '../../dto/purchases/refundTransactionDTO.js';
import PrismaService from '#services/prisma_service';

@inject()
export default class PurchaseSController {
    private prisma

    constructor(
        private validator:ValidatorService,
        private gatewayService:GatewayService
    ) {
        this.prisma = PrismaService.getClient()
    }

    //comprar protudos
    async buyProducts({ request, response }: HttpContext) {
        //verifica se os dados recebidos estao corretos
        const data = this.validator.validateDto(buyProductDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        const { email, name, cvv, cardNumber, products } = data.data

        //encontra o produto no banco, se nao tiver devolve erro
        const productList = await this.prisma.products.findMany({ where: { id: { in: products.map(p => p.productId) } } })
        if(productList.length == 0) return response.notFound({ error: 'Nenhum produto foi encontrado.' })
        
        const purchaseValue = products.reduce((total, curr) => {
            const product = productList.find(p => p.id == curr.productId)
            if(!product) return total

            return total + (curr.quantity * Number(product.amount))
        }, 0)

        //se o cliente nao existir no banco, cria um novo
        let clientExists = await this.prisma.clients.findFirst({ where: { email } })
        if(!clientExists) clientExists = await this.prisma.clients.create({ data: {
            name: name,
            email: email
        }})

        const gatewayResponse = await this.gatewayService.tryToBuy({
            name,
            email,
            cvv,
            cardNumber,
            amount: purchaseValue * 100
         })

        if(!gatewayResponse.success) return response.gatewayTimeout({ 
            error: gatewayResponse.errorMessage || 'Nenhum gateway está disponível no momento. Tente novamente mais tarde.' 
        })
    
        await this.prisma.transactions.create({ data: {
            amount: purchaseValue,
            gateway_id: gatewayResponse.gatewayId!,
            external_id: gatewayResponse.purchaseId!,
            card_last_numbers: cardNumber.slice(-4),
            client_id: clientExists!.id,
            transactionProducts: { createMany: { data: productList.map(p => (
                { quantity: products.find(f => f.productId == p.id)!.quantity, product_id: p.id }
            ))  } }
        } })

        return response.ok({ message: "Compra realizada com sucesso.", gateway: gatewayResponse.gatewayId })
    }

    async getAllTransactions({ response }: HttpContext) {
        const allTransactions = await this.prisma.transactions.findMany({
            select: {
                amount: true,
                card_last_numbers: true,
                external_id: true,
                status: true,
                id: true,
                client: { select: {
                    email: true,
                    name: true
                }},
                gateway: { select: {
                    name: true,
                    id: true
                }},
                transactionProducts: { select: {
                    quantity: true,
                    product: { select: {
                        name: true,
                        amount: true
                    }}
                }}
            }
        })

        return response.ok({ allTransactions })
    }

    async getTransaction({ params, response }: HttpContext) {
        if(isNaN(params.id)) return response.badRequest({ error: 'Param id deve ser apenas números inteiros.' })
        const id = parseInt(params.id)

        const transaction = await this.prisma.transactions.findUnique({ 
            where: { id },
            select: {
                amount: true,
                card_last_numbers: true,
                id: true,
                status: true,
                external_id: true,
                client: { select: {
                    email: true,
                    name: true
                }},
                gateway: { select: {
                    id: true,
                    name: true
                }},
                transactionProducts: { select: {
                    quantity: true,
                    product: { select: {
                        amount: true,
                        name: true
                    }}
                }}
            }
         })

        if(!transaction) return response.notFound({ error: 'Não foi encontrado nenhuma transação com esse id.' })
        
        return response.ok({ transaction })
    }

    async refundTransaction({ request, response}: HttpContext) {
        const data = this.validator.validateDto(refundTransactionDTO, request.body())
        if('error' in data) return response.badRequest({ error: data.error })

        const { id } = data.data

        const gatewayResponse = await this.gatewayService.refundTransaction(id)
        console.log(gatewayResponse)
        if(!gatewayResponse.success) return response.notFound({ error: 'Não foi encontrado o id dessa transação. Verifique se o id está correto e tente novamente.' })

        await this.prisma.transactions.update({
            where: { external_id: id },
            data: {
                status: 'Refunded'
            }
        })

        return response.ok({ message: 'Compra reembolsada com sucesso.', gatewayId: gatewayResponse.gatewayId })
    }
}