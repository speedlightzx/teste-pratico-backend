import z from "zod";

export const updateGatewayStatusDTO = z.object({
    status: z
    .boolean({ error: 'Por favor, especifique true ou false para alterar o status do gateway.' })
    
}).strict()