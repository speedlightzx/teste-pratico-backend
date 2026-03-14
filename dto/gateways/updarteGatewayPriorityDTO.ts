import { GatewayPriorities } from "@prisma/client";
import z from "zod";

export const updateGatewayPriorityDTO = z.object({
    priority: z
    .enum(GatewayPriorities, { error: 'Por favor, especifique a prioridade do gateway. ( Low, Medium, High )' })
    
}).strict()