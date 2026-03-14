import 'dotenv/config'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Bcrypt } from '@adonisjs/core/hash/drivers/bcrypt'
import PrismaService from '#services/prisma_service'

export default class SeedDatabase extends BaseCommand {
  static commandName = 'seed:database'
  static description = 'seed the database'
  
  static options: CommandOptions = {}

  async run() {
    this.logger.info("Inserindo dados no banco...")
    const prisma = PrismaService.getClient()

    await prisma.gateways.createMany({ data: [
        { name: 'Gateway 1', isActive: true, priority: 'High' },
        { name: 'Gateway 2', isActive: true, priority: 'Medium' },
    ]})

    await prisma.products.createMany({ data: [
        { name: 'Refrigerante', amount: 8.99 },
        { name: 'Bolacha água e sal', amount: 5.99 },
        { name: 'Água mineral', amount: 6.99 },
        { name: 'Arroz', amount: 15.39 },
        { name: 'Feijão', amount: 12.00 },
        { name: 'Monitor 144hz', amount: 219.89 },
        { name: 'Mouse', amount: 12.59 },
        { name: 'Teclado', amount: 16.50 },
    ]})

    const bcrypt = new Bcrypt({})
    await prisma.users.createMany({ data: [
        { email: 'admin@gmail.com', password: await bcrypt.make('123'), role: "Admin" },
        { email: 'finance@gmail.com', password: await bcrypt.make('456'), role: "Finance" },
        { email: 'manager@gmail.com', password: await bcrypt.make('abc'), role: "Manager" },
        { email: 'user@gmail.com', password: await bcrypt.make('user'), role: "User" }
    ]})

    await prisma.$disconnect()
    this.logger.info("Dados inseridos.")
  }
}