import z from "zod";

export const updateProductDTO = z.object({
    name: z
    .string()
    .optional(),

    amount: z
    .number()
    .optional()

}).strict()