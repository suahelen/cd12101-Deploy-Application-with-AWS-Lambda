const apiId = '5ebf4ctgm3'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
    domain: 'dev-3q0ye4hgaabznqpa.eu.auth0.com',    // Domain from Auth0
    clientId: 'VRSLRjGoMao2Xoe5yeVbruBhvhWZl8s3',  // Client id from an Auth0 application
    callbackUrl: 'http://localhost:3000/callback'
}