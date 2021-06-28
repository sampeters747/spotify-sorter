const axios = require('axios')
const jwt = require("jsonwebtoken");


/**
 * Creates a JWT using the environment variable TOKEN_SECRET as the secret key
 * @param {object} claims Object containing claims to be encoded
 * @param {number} expiresIn Number of seconds until the token expires
 * @returns {string} Signed token
 */
function signJWT(payload, expiresIn=3600) {
    const _tokenSecret = process.env.TOKEN_SECRET;
    return jwt.sign(payload, _tokenSecret, { expiresIn: expiresIn })
}

/**
 * Verifies a token hasn't been tampered with then returns the contents
 * @param {string} token Token to be verified
 * @returns {object} Claims contained in token
 */
function verifyJWT(token) {
    const _tokenSecret = process.env.TOKEN_SECRET;
    try {
        decoded = jwt.verify(token, _tokenSecret);
        return decoded
    } catch (error) {
        console.log(error);
        return {}
    }
}

module.exports = { signJWT, verifyJWT }