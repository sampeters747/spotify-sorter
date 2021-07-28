
const SpotifyWebApi = require('spotify-web-api-node');

/**
 * Initializes a new instance of the SpotifyWebApi class and sets the access token,
 * refresh token, client id, and client secret attributes.
 * @param {String} accessToken 
 * @param {String} refreshToken 
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
 * Helper function creates an array of offsets to use when requesting portions of
 * a user's library
 * @param {Number} arraySize Size of the array we're creating offsets for 
 * @returns {Array.<Number>} List of offset numbers
 */
function createOffsetsArray(arraySize, offsetDist=50) {
    const totalOffsets = Math.ceil(arraySize/offsetDist);
    const offsets = Array(totalOffsets).fill().map((_, i) => i*offsetDist);
    return offsets
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
    createOffsetsArray,
}