import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { updateTodoItem } from '../../businessLogic/todos.mjs'

const logger = createLogger('updateTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event)
    const updatedTodo = JSON.parse(event.body)
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    await updateTodoItem(todoId, userId, updatedTodo)
    return {
      statusCode: 200,
      body: JSON.stringify({
        updatedTodo
      })
    }
  })
