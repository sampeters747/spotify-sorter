const axios = require('axios')
const jwt = require("jsonwebtoken");
const SpotifyWebApi = require('spotify-web-api-node');

/**
 * Returns the value of a specific cookie in a array of cookie strings
 * @param {Array.<string>} cookies Array of cookie strings, ex. ['cookieName=val1', 'secondCookieName=val2'] 
 * @param {string} cookieName Name of the cookie whose value we want to return
 * @returns {string} Value of the cookie we wanted to find
 */
function findCookieValue(cookies, cookieName) {
    const fullCookie = cookies.find(element => element.split("=")[0] === cookieName);
    if (fullCookie) {
        const cookieValue = fullCookie.split("=")[1];
        return cookieValue
    }
    throw new Error(`Could not find cookie with name: ${cookieName}`);
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
        console.log(error.message);
        throw error
    }
}

/**
 * Initializes a new instance of the SpotifyWebApi class and sets the access token,
 * refresh token, client id, and client secret attributes.
 * @param {*} accessToken 
 * @param {*} refreshToken 
 * @returns {SpotifyWebApi} Configured SpotifyWebApi instance
 */
function createSpotifyApiInstance(accessToken, refreshToken=null) {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setClientId(process.env.SPOTIFY_CLIENT_ID);
    spotifyApi.setClientSecret(process.env.SPOTIFY_CLIENT_SECRET);
    return spotifyApi
}

/**
 * Filters an object, producing an object that's a subset of the original.
 * @param {Object} original Object to be filtered
 * @param {Array.<String>} keys Properties to include in the new object
 * @returns {Object} Filtered object
 */
function filterObject (original, keys) {
    let result = {}
    for (const key of keys) {
        if (original.hasOwnProperty(key)) {
            result[key] = original[key]
        }
    }
    return result
}


/**
 * Returns a reduced set of user information from the https://api.spotify.com/v1/me
 * endpoint.
 * @param {string} code OAuth2 access token from Spotify's API
 * @param {Array.<String>} keys Parts of the user profile we want to retrieve
 * @returns {Object} Object containing user information
 */
async function getSpotifyUserInfo(code, keys=["id", "display_name", "images", "href"]) {
    try {
        const spotifyApi = createSpotifyApiInstance(code);
        const apiResponse = await spotifyApi.getMe();
        const userInfo = apiResponse.body;
        const filteredInfo = filterObject(userInfo, keys)
        return filteredInfo
    } catch (error) {
        throw error
    }
}


module.exports = { 
    getSpotifyUserInfo, 
    createSpotifyApiInstance,
    filterObject, 
    findCookieValue, 
    signJWT, 
    verifyJWT }