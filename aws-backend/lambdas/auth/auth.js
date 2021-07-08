const axios = require('axios');
const { findCookieValue, verifyJWT } = require(process.env.AWS ? "/opt/nodejs/utils" : "../../layers/dependencies/utils");
// const url = 'http://checkip.amazonaws.com/';


exports.lambdaHandler = async (event, context) => {
    let response;
    try {
        console.log(event);
        console.log(context);
        const cookies = event.cookies;
        const token = findCookieValue(cookies, "jwt");
        const payload = verifyJWT(token);
        console.log("payload");
        console.log(payload);
        response = {
            "isAuthorized": true,
            "context": {
                "scope": payload.scope,
                "accessToken": payload.accessToken,
                "refreshToken": payload.refreshToken,
                "expiresIn": payload.expiresIn
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
