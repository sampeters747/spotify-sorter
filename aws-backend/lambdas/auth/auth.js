const { findCookieValue, verifyJWT } = require(process.env.AWS ? "/opt/nodejs/auth-utils" : "../../layers/dependencies/auth-utils");


exports.lambdaHandler = async (event, context) => {
    let response;
    try {
        const cookies = event.cookies;
        const token = findCookieValue(cookies, "jwt");
        const payload = verifyJWT(token);
        response = {
            "isAuthorized": true,
            "context": {
                "scope": payload.scope,
                "accessToken": payload.accessToken,
                "refreshToken": payload.refreshToken,
                "expiresIn": payload.expiresIn,
                "id": payload.id
            }
        };       
    } catch (error) {
        console.log(error.message);
        console.log(JSON.stringify(error.stack));
        response = {
            "isAuthorized": false,
            "context": {
            }
        };
    }
    return response;
};
