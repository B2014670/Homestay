const paypal = require('@paypal/checkout-server-sdk');
// const dotenv = require('dotenv');

// // Load environment variables from .env file
// dotenv.config();

// Set up PayPal environment and client
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials are missing in the environment variables');
    }

    return new paypal.core.SandboxEnvironment(clientId, clientSecret); // Use SandboxEnvironment for testing
}

// Create PayPal client using the environment
function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

module.exports = { client };
