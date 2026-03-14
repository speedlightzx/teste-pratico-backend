import { Bcrypt } from '@adonisjs/core/hash/drivers/bcrypt'
import { UserRoles } from '@prisma/client'
import { jwtVerify, SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export default class AuthService {
    private bcrypt = new Bcrypt({})

    async generateToken(userId:number, userRole:UserRoles): Promise<string> {
        return new SignJWT({ id: userId, role: userRole})
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(secret)
    }

    async verifyToken(token:string): Promise<{ userId: number, userRole: UserRoles } | null> {
        try {
            const { payload } = await jwtVerify(token, secret)
            return { userId: payload.id as number, userRole: payload.role as UserRoles }
        } catch(e) {
            return null
        } 
    }

    async hashPassword(password:string): Promise<string> {
        return await this.bcrypt.make(password)
    }
}