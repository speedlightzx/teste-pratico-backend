import z from "zod";

export const loginDTO = z.object({
    email: z
    .string({ error: "Você precisa colocar um email para fazer login." })
    .email({ error: "Por favor, insira um email válido." }),

    password: z
    .string({ error: "Você precisa colocar uma senha para fazer login." })
}).strict()