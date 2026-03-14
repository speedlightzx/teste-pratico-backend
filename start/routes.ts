/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import ProductsController from '#controllers/products_controller'
import PurchasesController from '#controllers/purchases_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import UsersController from '#controllers/users_controller'
import ClientsController from '#controllers/clients_controller'
import GatewaysController from '#controllers/gateways_controller'

router.get('/', async ({ response }) => {
    return response.status(200).send({ message: "OK" })
})
router.post('/login', [AuthController, 'login'])
router.post('/purchases', [PurchasesController, 'buyProducts'])

router.group(() => {
    router.get('/products', [ProductsController, 'getAllProducts'])
    router.get('/products/:id', [ProductsController, 'getProduct'])
    router.post('/products', [ProductsController, 'postProduct'])
    router.put('/products/:id', [ProductsController, 'putProduct'])
    router.delete('/products/:id', [ProductsController, 'deleteProduct'])

    router.get('/clients', [ClientsController, 'getAllClients'])
    router.get('/clients/:id', [ClientsController, 'getClient'])

    router.get('/purchases', [PurchasesController, 'getAllTransactions'])
    router.get('/purchases/:id', [PurchasesController, 'getTransaction'])
    router.post('/purchases/refund', [PurchasesController, 'refundTransaction'])
}).use([middleware.auth(), middleware.isFinanceOrHigher()])

router.group(() => {
    router.get('/users', [UsersController, 'getAllUsers'])
    router.get('/users/:id', [UsersController, 'getUser'])
    router.post('/users', [UsersController, 'postUser'])
    router.put('/users/:id', [UsersController, 'putUser'])
    router.delete('/users/:id', [UsersController, 'deleteUser'])
}).use([middleware.auth(), middleware.isManagerOrHigher()])

router.group(() => {
    router.post('/gateways/:id/status', [GatewaysController, 'updateStatus'])
    router.post('/gateways/:id/priority', [GatewaysController, 'updatePriority'])
    router.get('/gateways', [GatewaysController, 'getGateways'])
}).use([middleware.auth(), middleware.isAdminOrHigher()])