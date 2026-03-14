import { inject } from "@adonisjs/core";
import { GatewayResponse } from "../../types/iGatewayResponse.js";
import NodeCache from "node-cache";
import { GatewayPurchase } from "../../types/iGatewayPurchase.js";
import PrismaService from "./prisma_service.js";

@inject()
export default class GatewayService {
    private cache:NodeCache
    private prisma

    constructor() {
        this.cache = new NodeCache({ stdTTL: 1800 })
        this.prisma = PrismaService.getClient()
    }

    async tryToBuy(
        purchaseData:GatewayPurchase
    ): Promise<GatewayResponse> {
        let gatewaysOrder = await this.prisma.gateways.findMany({
            orderBy: { priority: "asc" }
        })

        if(!gatewaysOrder) return { success: false }
        gatewaysOrder = gatewaysOrder.filter(g => g.isActive)

        let response: GatewayResponse = { success: false }

        //pega todos os nomes dos gateways registrados no banco
        for(const gateway of gatewaysOrder) {

            //se o primeiro gateway da lista for o gateway1, chama o gateway1
            if(gateway.name == 'Gateway 1') {
                const gatewayResponse = await this.buyOnGateway1(purchaseData)
                if(gatewayResponse.success) {
                    response = {
                        ...gatewayResponse,
                        gatewayId: gateway.id
                    }
                    break
                }

                response.errorMessage = gatewayResponse.errorMessage
            }

            if(gateway.name == 'Gateway 2') {
                const gatewayResponse = await this.buyOnGateway2(purchaseData)
                if(gatewayResponse.success) {
                    response = {
                        ...gatewayResponse,
                        gatewayId: gateway.id
                    }
                    break
                }

                response.errorMessage = gatewayResponse.errorMessage
            }

        }

        return response
    }

    async refundTransaction(id:string): Promise<GatewayResponse> {
        let gatewaysOrder = await this.prisma.gateways.findMany({
            orderBy: { priority: "asc" }
        })

        if(!gatewaysOrder) return { success: false }

        let response: GatewayResponse = { success: false }
        for(const gateway of gatewaysOrder) {
            if(gateway.name == 'Gateway 1') {
                const gatewayResponse = await this.refundGateway1Transaction(id)
                if(gatewayResponse.success) {
                    response = {
                        ...gatewayResponse,
                        gatewayId: gateway.id
                    }
                    break
                }

                response.errorMessage = gatewayResponse.errorMessage
            }

            if(gateway.name == 'Gateway 2') {
                const gatewayResponse = await this.refundGateway2Transaction(id)
                if(gatewayResponse.success) {
                    response = {
                        ...gatewayResponse,
                        gatewayId: gateway.id
                    }
                    break
                }

                response.errorMessage = gatewayResponse.errorMessage
            }

        }

        return response
    }

    private async getGateway1Token(): Promise<string|null> {
        let cachedToken = this.cache.get('gateway1TokenAccess')
        if(!cachedToken) {

            //faz a req com as credenciais fornecidas
            const gatewayToken = await fetch(`${process.env.GATEWAY1_URL}/login`, {
                method: "POST",
                body: JSON.stringify({ email: 'dev@betalent.tech', token: 'FEC9BB078BF338F464F96B48089EB498' })
            })


            //se nao tiver conseguido realizar o login, cancela na hora
            if(!gatewayToken.ok) return null

            //pega o token da resposta
            const token:any = await gatewayToken.json()

            //guarda no cache e salva na variavel para usar na req de criar transacao
            this.cache.set('gateway1TokenAccess', token.token)
            cachedToken = token.token
        }

        return cachedToken as string
    }

    private async buyOnGateway1(purchaseData:GatewayPurchase): Promise<GatewayResponse> {
        const gatewayToken = await this.getGateway1Token()
        const gatewayRes = await fetch(`${process.env.GATEWAY1_URL}/transactions`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${gatewayToken}` },
            body: JSON.stringify({
                amount: purchaseData.amount,
                name: purchaseData.name,
                email: purchaseData.email,
                cardNumber: purchaseData.cardNumber,
                cvv: purchaseData.cvv
            })
        })

        const data:any = await gatewayRes.json()
        if(gatewayRes.ok) return { success: true, purchaseId: data.id }

        return { success: false, errorMessage: data.error }
    }

    private async refundGateway1Transaction(id:string): Promise<GatewayResponse> {
        const gatewayToken = await this.getGateway1Token()
        const gatewayRes = await fetch(`${process.env.GATEWAY1_URL}/transactions/${id}/charge_back`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${gatewayToken}` },
        })

        const data:any = await gatewayRes.json()
        if(data.error) return { success: false, errorMessage: data.error }

        return { success: true }
    }

    private async buyOnGateway2(purchaseData:GatewayPurchase): Promise<GatewayResponse> {
        
        const gatewayRes = await fetch(`${process.env.GATEWAY2_URL}/transacoes`, {
            method: 'POST',
            body: JSON.stringify({
                valor: purchaseData.amount,
                nome: purchaseData.name,
                email: purchaseData.email,
                numeroCartao: purchaseData.cardNumber,
                cvv: purchaseData.cvv 
            }),
            headers: {
                "Gateway-Auth-Secret": '3d15e8ed6131446ea7e3456728b1211f',
                "Gateway-Auth-Token": 'tk_f2198cc671b5289fa856'
             }
        })

        //pega o conteudo da req do gateway2
        const data:any = await gatewayRes.json()

        //se nao tiver o objeto de erro, significa que deu certo, e retorna os dados do controller
        if(!data.erros) return { success: true, purchaseId: data.id }

        //se tiver erros retorna os erros
        //( testei com gatewayRes.ok, porem nao tava dando certo )
        return { success: false, errorMessage: data.erros[0].message }
    }

    private async refundGateway2Transaction(id:string): Promise<GatewayResponse> {
        const gatewayRes = await fetch(`${process.env.GATEWAY2_URL}/transacoes/reembolso`, {
            method: "POST",
            headers: {
                "Gateway-Auth-Secret": '3d15e8ed6131446ea7e3456728b1211f',
                "Gateway-Auth-Token": 'tk_f2198cc671b5289fa856'
            },
            body: JSON.stringify({ id })
        })

        const data:any = await gatewayRes.json()
        if(data.erros) return { success: false, errorMessage: data.erros[0].message }

        return { success: true }
    }
}