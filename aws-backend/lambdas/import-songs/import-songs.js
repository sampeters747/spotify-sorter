const {  createOffsetsArray, createSpotifyApiInstance } = require(process.env.AWS ? "/opt/nodejs/spotify-api-utils" : "../../layers/dependencies/spotify-api-utils");
const AWS = require('aws-sdk');
// const { BatchWrite } = require ('@aws/dynamodb-batch-iterator');

// Setting region
const REGION = process.env.AWS_REGION;
AWS.config.update({ region: REGION });

// Tablename
const TABLENAME = "PlaylistApplicationTable";
// Create the DynamoDB service object
// var ddb = AWSXRay.captureAWSClient(new AWS.DynamoDB());
var documentClient = new AWS.DynamoDB.DocumentClient();

async function addTrackFeatures(tracks, spotifyApi) {
    try {
        const trackIds = tracks.map(track => track.id);
        const response = await spotifyApi.getAudioFeaturesForTracks(trackIds);
        const trackFeatures = response.body.audio_features;
        const updatedUserTracks = tracks.map((track, index) => {
            let trackWithAudioFeatures = {
                ...trackFeatures[index],
                ...track
            };
            return trackWithAudioFeatures;
        });
        console.log({updatedUserTracks})
        return updatedUserTracks
    } catch (error) {
        console.log(error);
        throw error
    }
}

/**
 * Helper function that simplifies the nested track object returned by Spotify's API
 * into a simpler flat object containing only the info we need.
 * @param {Object} trackObj Original nested trackObject 
 * @returns {Object} Reduced flat object
 */
 function simplifyTrackObject(trackObj) {
    const track = trackObj.track;
    let result = {
        addedAt: trackObj.added_at,
        id: track.id,
        title: track.name,
        artist_name: track.artists[0].name ? track.artists[0].name : "null",
        preview_url: track.preview_url ? track.preview_url : "null",
        type: "track"
    }
    return result;
}


const createUserSongPutRequest = (song, userId) => {
    const item = {
        "primaryId": userId,
        "secondaryId": song.id,
        ...song
    }
    return {
        "PutRequest": {
            "Item": item
        }
    }
}

async function saveSongBatch(songs, userId) {
    try {
        const putRequests = songs.map(song => createUserSongPutRequest(song, userId));
        const params = {
            RequestItems: {
                [TABLENAME]: putRequests
            }
        }
        return await documentClient.batchWrite(params).promise()
    } catch (error) {
        throw error
    }
}

async function importSongsBatch(userId, offset, spotifyApi) {
    try {
        console.log(`starting batch`, offset);
        // Initial request to get batch of 50 tracks from user's library
        const response = await spotifyApi.getMySavedTracks({limit: 50, offset: offset});
        const userTracks = response.body.items;
        console.log('got tracks for', offset);
        // Modifying each track object to contain only the data we want
        const simplifiedUserTracks = userTracks.map(simplifyTrackObject);
        // Making second batch request to get set of audio feature data for each track
        const tracksWithAudioFeatures = await addTrackFeatures(simplifiedUserTracks, spotifyApi);
        console.log(`finished retrieving features for batch ${offset}`);
        // Since dynamodb has a max batch size of 25, we split our set of songs into 1-2 separate batches
        // before saving to ddb.
        let ddbBatches;
        if (tracksWithAudioFeatures.length > 25 ) {
            ddbBatches = [tracksWithAudioFeatures.slice(0,25), tracksWithAudioFeatures.slice(25,50)];
        } else {
            ddbBatches = [tracksWithAudioFeatures.slice(0,25)];
        }
        console.log("starting saving", offset);
        let saves = ddbBatches.map( batch => saveSongBatch(batch, userId));
        const finished = await Promise.all(saves)
        console.log("finished saving", offset);
        console.log(finished);
        return finished;
    } catch (e) {
        console.log(e);
        throw e
    }

}

async function importSongs(accessToken, userId) {
    try {
        const spotifyApi = createSpotifyApiInstance(accessToken);
        let response = await spotifyApi.getMySavedTracks({limit: 1})
        const total = response.body.total;
        // const total = 205;
        console.log(`Importing ${total} songs from user's spotify library`);
        console.time("import songs");
        // Creating array of offsets so we don't get the same 50 songs in the users library in every request
        const offsets = createOffsetsArray(total);
        console.log(offsets)
        const batches = offsets.map(offset => {
            return importSongsBatch(userId, offset, spotifyApi);
        })
        console.timeLog("import songs");
        let result = await Promise.all(batches);
        console.log(result);
        console.timeEnd("import songs");
        return result
    } catch (error) {
        console.log(error);
        throw error
    }
}

/**
 * Determines whether the event came from AWS SNS or AWS Api Gateway and extracts
 * the user details passed by the event.
 * @param {Object} event 
 * @returns Object containing user details
 */
function fetchUserDetails(event) {
    // Checking if a Sns message triggered the lambda
    if ("Records" in event && "Sns" in event.Records[0]) {
        // Sns message contains user details
        return JSON.parse(event.Records[0].Sns.Message)
    // Checking if a API gateway request triggered the lambda
    } else if (event.requestContext?.authorizer?.lambda?.accessToken) {
        // Lambda authorizer context contains user details
        return event.requestContext?.authorizer?.lambda
    } else {
        throw new Error("Was not able to determine what service invoked lambda")
    }
}

exports.lambdaHandler = async (event, context) => {
    try {
        const user = fetchUserDetails(event);
        const accessToken = user.accessToken;
        const userId = user.id;
        console.log(accessToken, userId, user);
        const songs = await importSongs(accessToken, userId);
        return {
            statusCode: 200,
            body: JSON.stringify(songs)
        }
    } catch (err) {
        console.log(err.message);
        console.log(err.stack);
        return {
            statusCode: 400,
            body: JSON.stringify({
                "error": JSON.stringify(err.message),
                "stackTrace": err.stack
            })
        }
    }
};

// const code = "BQDfvjZajH_HzUqrBVeFXPBF4BdpwbB5_IGaVjFVhJobyuqczZfU4N7j3rIywvX7UJXcdwYYbHUmT0SI4PydmKF_6wnX0CsdO5rHEbbDBOv7f17gPflsMoIl3dpgtKVrHpfNwVuBlL-IRjbpz0Cmb-w60oSn6A";
// (async () => {
//     try {
//         var text = await importSongs(code, "1");
//         console.log(text);
//     } catch (e) {
//         console.log(e.message);
//         console.log(e.stack);
//         // Deal with the fact the chain failed
//     }
// })();