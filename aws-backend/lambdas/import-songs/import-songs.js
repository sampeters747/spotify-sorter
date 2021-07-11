const { getUserTracks } = require(process.env.AWS ? "/opt/nodejs/spotify-api-utils" : "../../layers/dependencies/spotify-api-utils");
const AWS = require('aws-sdk');
const { BatchWrite } = require ('@aws/dynamodb-batch-iterator');

// Setting region
const REGION = process.env.AWS_REGION;
AWS.config.update({ region: REGION });

// Tablename
const TABLENAME = "PlaylistApplicationTable";
// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const createUserSongPutRequest = (song, userId) => {
    const item = {
        "primaryId": { "S": userId },
        "secondaryId": { "S": song.id },
        "title": { "S": song.title },
        "artist": { "S": song.artist_name },
        "preview_url": { "S": song.preview_url }
    }
    return {
        "PutRequest": {
            "Item": item
        }
    }
}

// function saveSongs(songs, userId) {
//     const putRequests = songs.map(song => createUserSongPutRequest(song, userId));
//     const offsets = createOffsetsArray(songs.length, 25);
//     const chunks = offsets.map(offset => putRequests.slice(offset, offset + 25));
//     const batchedRequests = chunks.map(chunk => {
//         const batchRequest = {
//             RequestItems: {
//                 TABLENAME: chunk
//             }
//         }
//         return batchRequest
//     });
//     batchedRequests.map(batch => {
//         ddb.batchWriteItem
//     })
// }
async function saveSongs(songs, userId) {
    const putRequests = songs.map(song => createUserSongPutRequest(song, userId));

    const keys = putRequests.map(req => [TABLENAME, req]);
    let count = 0
    for await (const item of new BatchWrite(ddb, keys)) {
        count += 1;
    }
    console.log(`Finished, wrote ${count} user songs to DynamoDB`);
    return true
}

async function importSongs(accessToken, userId) {
    try {
        const songs = await getUserTracks(accessToken);
        const status = await saveSongs(songs, userId).catch(e =>{
            console.log(e.message);
            console.log(e.stack);
            throw e
        } );
        console.log(status);
        return songs
    } catch (error) {
        throw error
    }
}

exports.lambdaHandler = async (event, context) => {
    try {
        const accessToken = event.requestContext.authorizer.lambda.accessToken;
        const userId = event.requestContext.authorizer.lambda.id;
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
                "error": err.message,
                "stackTrace": err.stack
            })
        }
    }
};
