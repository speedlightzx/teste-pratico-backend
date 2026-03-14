import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

export default class PrismaService {
  private static instance: PrismaClient | null = null

  static getClient(): PrismaClient {
    if (!this.instance) {
      const adapter = new PrismaMariaDb({
        host: process.env.DB_HOST!,
        port: 3306,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_DATABASE!,
        allowPublicKeyRetrieval: true
      })
      this.instance = new PrismaClient({ adapter })
    }
    return this.instance
  }

  static async disconnect() {
    await this.instance?.$disconnect()
    this.instance = null
  }
}