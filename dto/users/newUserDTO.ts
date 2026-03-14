import { UserRoles } from "@prisma/client";
import z from "zod";

export const newUserDTO = z.object({
    email: z
    .string({ error: "Você precisa colocar um email para esse user." })
    .email(),

    password: z
    .string({ error: "Você precisa colocar uma senha para esse user." }),

    role: z
    .enum(UserRoles, { error: 'Você precisa colocar um role para esse user. (User, Finance, Manager, Admin)' })
}).strict()