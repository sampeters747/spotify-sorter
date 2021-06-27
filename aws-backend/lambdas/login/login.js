const { getSpotifyUserTokens, signJWT } = require("/opt/nodejs/utils");

exports.lambdaHandler = async (event, context) => {
    let response;
    let code;
    if (event.httpMethod === "POST") {
        // Retrieving user authorization code from request body
        code = event.body.authCode
    } else if (event.httpMethod === "GET") {
        // Retrieving user authorization code from query string params
        code = event.queryStringParameters.authCode
    }
    if (!code || code==="access_denied") {
        response = {
            "statusCode": 400,
            "body": JSON.stringify({
                "error": "Missing valid authorization code"
            })
        }
    } else {
        try {
            // Requesting access/refresh tokens from Spotify API
            const result = await getSpotifyUserTokens(code);
            if (!result) { throw "Unable to retrieve tokens" };
            // Defining JWT payload
            const payload = {
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                scope: result.scope,
                expires_in: result.expires_in,
            }
            // Signing token
            const token = signJWT(payload, result.expires_in);
            response = {
                "statusCode": 200,
                "body": JSON.stringify({ jwt: token })
            };
        } catch (error) {
            response = {
                "statusCode": 400,
                "body": JSON.stringify({
                    "error": error
                })
            };
        }
    }
    return response;
}
