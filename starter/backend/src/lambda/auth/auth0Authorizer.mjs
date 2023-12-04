import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import jwkToPem from 'jwk-to-pem'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-3q0ye4hgaabznqpa.eu.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  logger.info('Verifying token')
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  const response = await Axios(jwksUrl)
  const responseData = response.data
  const signingKey = responseData['keys'].find(
    (key) => key['kid'] === jwt['header']['kid']
  )
  if (!signingKey) {
    throw new Error('Invalid Signing key')
  }

  return jsonwebtoken.verify(token, jwkToPem(signingKey), { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authorization header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authorization header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
