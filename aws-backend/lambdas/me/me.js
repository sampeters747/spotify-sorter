const { getSpotifyUserInfo } = require(process.env.AWS ? "/opt/nodejs/utils" : "../../layers/dependencies/spotify-api-utils");

exports.lambdaHandler = async (event, context) => {
    let response;
    try {
        const accessToken = event.requestContext.authorizer.lambda.accessToken
        const body = await getSpotifyUserInfo(accessToken)
        return {
            statusCode: 200,
            body: JSON.stringify(body)
        }
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ 
                "error": err.message,
                "stackTrace": err.stack
            })
        }
    }
};
