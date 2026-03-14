import z from "zod";

export const buyProductDTO = z.object({

    products: z.array(z.object({
        productId: z
        .number({ error: 'Por favor, envie um id válido.' })
        .int({ error: 'Por favor, envie apenas números inteiros no id.' }),
        
        quantity: z
        .number({ error: 'Por favor, envie uma quantidade válida.' })
        .int({ error: 'Por favor, envie apenas números inteiros na quantidade.' })
        .min(1, { error: 'Você tem que comprar pelo menos 1 desse produto.' }),
    }), { error: 'Você precisa especificar os produtos e quantidades.' }),

    name: z
    .string({ error: 'Por favor, coloque um nome.' }),

    email: z
    .email({ error: 'Por favor, coloque um email.' }),

    cardNumber: z
    .string({ error: 'Por favor, coloque o número do seu cartão.' })
    .length(16, { error: 'O cartão deve conter 16 digitos.' }),

    cvv: z
    .string({ error: 'Por favor, coloque o CVV do seu cartão.' })
    .length(3, { error: 'O CVV deve conter 3 digitos.' })

}).strict()