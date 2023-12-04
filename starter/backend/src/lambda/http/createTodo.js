import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { createTodoItem } from '../../businessLogic/todos.mjs'

const logger = createLogger('createTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event)
    const newTodo = JSON.parse(event.body)
    const userId = getUserId(event)
    const newTodoItem = await createTodoItem(newTodo, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodoItem
      })
    }
  })
