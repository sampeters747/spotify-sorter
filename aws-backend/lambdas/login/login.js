const axios = require('axios');
const AWS = require('aws-sdk');
const { signJWT } = require(process.env.AWS ? "/opt/nodejs/auth-utils" : "../../layers/dependencies/auth-utils");
const { getSpotifyUserInfo } = require(process.env.AWS ? "/opt/nodejs/spotify-api-utils" : "../../layers/dependencies/spotify-api-utils");

// Setting region
const REGION = process.env.AWS_REGION;
AWS.config.update({ region: REGION });

/**
 * Sends a request to https://accounts.spotify.com/api/token to get access and refresh
 * tokens for a user
 * @async
 * @param {String} code Authorization code from Spotify web api
 * @returns {Promise<object>} Object containing access, refresh tokens
 */
async function requestUserTokens(code) {
    const endpoint = 'https://accounts.spotify.com/api/token';
    const redirectUri = process.env.REDIRECT_URI;
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
 * @returns {string} Object containing 1: signed JWT with user info as a payload and 2: unsigned object holding user info (used internally)
 */
async function createAuthJWT(code) {
    try {
        // Requesting access/refresh tokens from Spotify API
        const responseBody = await requestUserTokens(code);
        // Getting user token
        const { id } = await getSpotifyUserInfo(responseBody.access_token);
        const payload = {
            accessToken: responseBody.access_token,
            refreshToken: responseBody.refresh_token,
            scope: responseBody.scope,
            expiresIn: responseBody.expires_in,
            id: id
        };
        // Signing token
        return { jwt: signJWT(payload, responseBody.expires_in), userObj: payload };
    } catch (error) {
        throw error
    }
};

/**
 * Publishes a message containing the user's details to a AWS SNS topic.
 * This event causes another lambda to asynchrounously import the user's library.
 * @param {Object} Object containing id and spotify API access code for a user. 
 */
async function publishUserLogin(user) {
    try {
        const params = {
            TopicArn: process.env.SNS_TOPIC_ARN,
            MessageStructure: "json",
            MessageAttributes: {
                operation: {
                    DataType: "String",
                    StringValue: "import_songs"
                }
            },
            Message: JSON.stringify({
                default: `${user.id} logged in`,
                lambda: JSON.stringify(user)
            })
        };
        params.TopicArn = process.env.SNS_TOPIC_ARN;
        var published = await new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
        console.log("Publishing to SNS topic was successful")
    } catch (error) {
        console.log("Publishing to SNS topic failed")
        throw error
    }
}

/**
 * Handles login logic. Exchanges authorization code for user specific access/refresh tokens
 * from Spotify's API, then creates a JWT containing those tokens and the user's, and publishes
 * a message to a SNS topic before returning the jwt
 * 
 *  
 */
async function login(event) {
    let code = event.queryStringParameters?.code;
    try {
        if (!code || code === "access_denied") {
            throw new Error("Missing valid authorization code");
        }
        let { jwt, userObj } = await createAuthJWT(code);
        await publishUserLogin(userObj);
        return jwt
    } catch (error) {
        throw error;
    }
};

exports.lambdaHandler = async (event, context) => {
    try {
        const authToken = await login(event);
        return {
            statusCode: 303,
            headers: {
                Location: "http://localhost:3000?status=success"
            },
            cookies: [`jwt=${authToken}; Max-Age=3600; HttpOnly; SameSite=None; Secure`]
        }
    } catch (error) {
        console.log(error.message);
        console.log(error.stack);
        return {
            statusCode: 303,
            headers: {
                Location: "http://localhost:3000"
            },

        }
    }
}
