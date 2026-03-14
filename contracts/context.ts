import { Users } from "@prisma/client";

declare module '@adonisjs/core/http' {
    interface HttpContext {
        user: Users
    }
}