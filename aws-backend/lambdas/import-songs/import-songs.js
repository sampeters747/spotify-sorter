const { getUserTracks } = require(process.env.AWS ? "/opt/nodejs/spotify-api-utils" : "../../layers/dependencies/spotify-api-utils");
const AWS = require('aws-sdk');
// Setting region
const REGION = process.env.AWS_REGION;
AWS.config.update({region: REGION});

// Tablename
const TABLENAME = "PlaylistApplicationTable"; 
// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

async function importSongs (accessToken, userId) {
    try {
        const songs = await getUserTracks(accessToken);
        return songs
    } catch (error) {
        throw error
    }
}

exports.lambdaHandler = async (event, context) => {
    try {
        const accessToken = event.requestContext.authorizer.lambda.accessToken;
        const songs = await importSongs(accessToken);
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
