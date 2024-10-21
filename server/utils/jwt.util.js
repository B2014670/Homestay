const { sign, verify } = require('jsonwebtoken');
const { promisify } = require('util');

// Convert callback-based functions to promises
const signAsync = promisify(sign);
const verifyAsync = promisify(verify);

exports.generateToken = async (payload, secretSignature, tokenLife) => {
    try {
        return await signAsync(
            { payload },
            secretSignature,
            { expiresIn: tokenLife },
        );
    } catch (error) {
        console.log(`Error in generating access token: ${error}`);
        return null;
    }
};

exports.verifyToken = async (token, secretKey) => {
    try {
        return await verifyAsync(token, secretKey);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token has expired.');
            // Optionally handle token expiration, e.g., refresh the token
        } else {
            console.log(`Error in verifying access token: ${error}`);
        }
        return null;
    }
};

exports.decodeToken = async (token, secretKey) => {
    try {
        return await verifyAsync(token, secretKey, {
            ignoreExpiration: true,
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token has expired.');
            // Optionally handle token expiration
        } else {
            console.log(`Error in decoding access token: ${error}`);
        }
        return null;
    }
};
