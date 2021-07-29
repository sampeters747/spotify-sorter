const { getUserTracks } = require(process.env.AWS ? "/opt/nodejs/spotify-api-utils" : "../../layers/dependencies/spotify-api-utils");
const AWS = require('aws-sdk');
var AWSXRay = require('aws-xray-sdk');

// Setting region
// const REGION = process.env.AWS_REGION;
const REGION = 'us-west-2'
AWS.config.update({ region: REGION });

// Tablename
const TABLENAME = "PlaylistApplicationTable";
// Create the DynamoDB document client object
var documentClient = new AWS.DynamoDB.DocumentClient();

async function queryUserSongs(userId) {
    try {
        let params = {
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            KeyConditionExpression: 'primaryId = :userId',
            TableName: TABLENAME
        };
        const data = await documentClient.query(params).promise();
        return data.Items
    } catch (error) {
        console.log("Could not retrieve user songs from DynamoDB")
        throw error
    }
}

exports.lambdaHandler = async (event, context) => {
    try {
        const userId = event.requestContext.authorizer.lambda.id;
        const songs = await queryUserSongs(userId)
        return {
            statusCode: 200,
            body: JSON.stringify({
                songs: songs,
                count: songs.length
            })
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