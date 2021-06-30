const axios = require('axios')
const jwt = require("jsonwebtoken");

/**
 * Returns the value of a specific cookie in a array of cookie strings
 * @param {Array.<string>} cookies Array of cookie strings, ex. ['cookieName=val1', 'secondCookieName=val2'] 
 * @param {string} cookieName Name of the cookie whose value we want to return
 * @returns {string} Value of the cookie we wanted to find
 */
function findCookieValue(cookies, cookieName) {
    const fullCookie = cookies.find(element => element.split("=")[0] === cookieName);
    if (fullCookie) {
        const cookieValue = fullCookie.split("=")[1];
        return cookieValue
    }
    throw new Error(`Could not find cookie with name: ${cookieName}`);
}

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
        console.log(error.message);
        throw error
    }
}

module.exports = { findCookieValue, signJWT, verifyJWT }