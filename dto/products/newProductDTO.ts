import z from "zod";

export const newProductDTO = z.object({
    name: z
    .string({ error: "Você precisa colocar um nome para esse produto." }),

    amount: z
    .number({ error: "Você precisa colocar um preço para esse produto." })
}).strict()