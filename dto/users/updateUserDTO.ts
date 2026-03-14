import { UserRoles } from "@prisma/client";
import z from "zod";

export const updateUserDTO = z.object({
    role: z
    .enum(UserRoles, { error: 'Você precisa colocar um role para esse user. (User, Finance, Manager, Admin)' })
    .optional(),

    email: z
    .string({ error: "Você precisa colocar um email para esse user." })
    .email()
    .optional(),

    password: z
    .string({ error: "Você precisa colocar uma senha para esse user. Min: 6 caracteres." })
    .min(6)
    .optional()

}).strict()