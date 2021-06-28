const axios = require('axios')
const { signJWT } = require(process.env.AWS ? "/opt/nodejs/utils" : "../../layers/dependencies/utils");


/**
 * Sends a request to https://accounts.spotify.com/api/token to get access and refresh
 * tokens for a user
 * @async
 * @param {String} code Authorization code from Spotify web api
 * @returns {Promise<object>} Object containing access, refresh tokens
 */
 async function requestUserTokens(code) {
    const endpoint = 'https://accounts.spotify.com/api/token';
    const redirectUri = 'http://localhost:3000';
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    // Configuring request to Spotify token service
    const axiosConfig = {
        method: 'post',
        url: endpoint,
        headers: {
            Authorization: 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64'))
        },
        params: {
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        }
    };
    try {
        const response = await axios(axiosConfig);
        return response.data
    } catch (error) {
        throw new Error("Unable to retrieve tokens")
    }
}

/**
 * Takes an authorization code, exchanges it for access/refresh tokens from Spotify's
 * API, and creates a signed JWT the user can use on future requests
 * @param {string} code OAuth2 authorization code from Spotify's API
 * @returns {string} Signed JWT containing access/refresh tokens and scope/expiration info
 */
async function createAuthJWT(code) {
    try {
        // Requesting access/refresh tokens from Spotify API
        const responseBody = await requestUserTokens(code);
        const payload = {
            accessToken: responseBody.access_token,
            refreshToken: responseBody.refresh_token,
            scope: responseBody.scope,
            expires_in: responseBody.expires_in,
        };
        // Signing token
        return signJWT(payload, responseBody.expires_in);
    } catch (error) {
        throw error
    }
}

async function login(body) {
    let code = body.authCode;
    try {
        if (!code || code==="access_denied") {
            throw new Error("Missing valid authorization code");
        }
        return createAuthJWT(code);
    } catch (error) {
        throw error;
    }
}

exports.lambdaHandler = async (event, context) => {
    try {
        const authToken = await login(event.body);
        return {
            statusCode: 200,
            body: JSON.stringify({ "jwt": authToken })
        }
    } catch (error) {
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                "error": error.message,
                "stackTrace": error.stack
            })
        }
    }
   
}
