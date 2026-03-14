/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * The error handler is used to convert an exception
 * to an HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'))

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 */
server.use([() => import('#middleware/container_bindings_middleware')])

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([() => import('@adonisjs/core/bodyparser_middleware')])

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({
  isAdminOrHigher: () => import('#middleware/is_admin_or_higher_middleware'),
  isManagerOrHigher: () => import('#middleware/is_manager_or_higher_middleware'),
  isFinanceOrHigher: () => import('#middleware/is_finance_or_higher_middleware'),
  auth: () => import('#middleware/is_authenticated_middleware')
})
