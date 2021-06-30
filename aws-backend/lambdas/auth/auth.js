const axios = require('axios');
const { findCookieValue, verifyJWT } = require(process.env.AWS ? "/opt/nodejs/utils" : "../../layers/dependencies/utils");
// const url = 'http://checkip.amazonaws.com/';


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
                "expiresIn": payload.expiresIn
            }
        };       
    } catch (error) {
        console.log(error.message);
        response = {
            "isAuthorized": true,
            "context": {
                "scope": payload.scope,
                "accessToken": payload.accessToken,
                "refreshToken": payload.refreshToken,
                "expiresIn": payload.expiresIn
            }
        };
    }
    return response;
};
