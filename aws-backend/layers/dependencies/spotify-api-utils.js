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
 * Returns a reduced set of user information from the https://api.spotify.com/v1/me
 * endpoint.
 * @param {String} code OAuth2 access token from Spotify's API
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
}