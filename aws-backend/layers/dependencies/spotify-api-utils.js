
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
 * @param {Number} totalTracks Total number of tracks in the user's spotify library 
 * @returns {Array.<Number>} List of offset numbers
 */
function createOffsetsArray(totalTracks) {
    const totalOffsets = Math.ceil(totalTracks/50);
    const offsets = Array(totalOffsets).fill().map((_, i) => i*50);
    return offsets
}

/**
 * Helper function that simplifies a nested track object into a simpler flat object
 * containing only the info we need.
 * @param {Object} trackObj Original nested trackObject 
 * @returns {Object} Reduced flat object
 */
function simplifyTrackObject(trackObj) {
    const track = trackObj.track;
    let result = {
        addedAt: trackObj.added_at,
        id: track.id,
        title: track.name,
        artist_name: track.artists[0].name,
        preview_url: track.preview_url,
    }
    return result;
}

/**
 * Retrieves all tracks in a User's spotify library.
 * @param {String} code OAuth2 access token from Spotify's API
 * @returns {Object} Object containing user information
 */
async function getUserTracks(code) {
    try {
        const spotifyApi = createSpotifyApiInstance(code);
        let response = await spotifyApi.getMySavedTracks({limit: 1})
        const total = response.body.total;
        console.log(`Importing ${total} songs from user's spotify library`);
        // Creating array of offsets so we don't get the same 50 songs in the users library in every request
        const offsets = createOffsetsArray(total);
        // Asynchrounously requesting all the tracks in the user's library
        const apiResponses = offsets.map(offset => {
            return spotifyApi.getMySavedTracks({limit: 50, offset: offset})
        });
        // Waiting for all requests to finish
        const finishedResponses = await Promise.all(apiResponses);
        console.log('Finished requesting songs')
        // Combining the separate track item arrays in each response into a singular array
        const combinedTrackItems = finishedResponses.flatMap( response => response.body.items);
        // Simplifying track objects and returning entire array
        return combinedTrackItems.map(simplifyTrackObject);
        
    } catch (error) {
        throw error
    }
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
    getUserTracks,
    getSpotifyUserInfo, 
    createSpotifyApiInstance,
    filterObject, 
}

