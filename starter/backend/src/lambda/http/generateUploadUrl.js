import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { generateUploadUrl } from '../../businessLogic/todos.mjs'

const logger = createLogger('generateUploadUrl')

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
    const todoId = event.pathParameters.todoId
    const uploadUrl = await generateUploadUrl(todoId, userId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  })