import z from "zod";

export const refundTransactionDTO = z.object({
    id: z
    .string({ error: 'Por favor, envie o id da transação que deseja reembolsar.' })
    
}).strict()