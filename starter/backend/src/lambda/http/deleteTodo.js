import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { deleteTodoItem } from '../../businessLogic/todos.mjs'

const logger = createLogger('deleteTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event)
    const userId = getUserId(event)
    await deleteTodoItem(event.pathParameters.todoId, userId)
    return {
      statusCode: 204,
      body: JSON.stringify({})
    }
  })
