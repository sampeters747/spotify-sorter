const axios = require('axios')
const jwt = require("jsonwebtoken");

/**
 * Sends a request to https://accounts.spotify.com/api/token to get access and refresh
 * tokens for a user
 * @async
 * @param {String} code Authorization code from Spotify web api
 * @returns {Promise<object>} Object containing access, refresh tokens
 */
async function getSpotifyUserTokens(code) {
    const endpoint = 'https://accounts.spotify.com/api/token'
    const redirectUri = "http://localhost:3000"
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
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
        const { data } = await axios(axiosConfig)
        return data;
    } catch (error) {
        console.error("Invalid authorization code: " + code);
        return null;
    }
}

/**
 * Creates a JWT using the environment variable TOKEN_SECRET as the secret key
 * @param {object} claims Object containing claims to be encoded
 * @param {number} expiresIn Number of seconds until the token expires
 * @returns {string} Signed token
 */
function signJWT(payload, expiresIn=3600) {
    const _tokenSecret = process.env.TOKEN_SECRET;
    return jwt.sign(payload, _tokenSecret, { expiresIn: expiresIn })
}

/**
 * Verifies a token hasn't been tampered with then returns the contents
 * @param {string} token Token to be verified
 * @returns {object} Claims contained in token
 */
function verifyJWT(token) {
    const _tokenSecret = process.env.TOKEN_SECRET;
    try {
        decoded = jwt.verify(token, _tokenSecret);
        return decoded
    } catch (error) {
        console.log(error);
        return {}
    }
}

module.exports = { getSpotifyUserTokens, signJWT, verifyJWT }