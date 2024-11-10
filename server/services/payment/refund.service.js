const paypal = require('@paypal/checkout-server-sdk');
const { client } = require('../../config/PayPalClient');
class RefundService {

    async getCaptureIdFromOrder(orderId) { // transactionID
        const request = new paypal.orders.OrdersGetRequest(orderId);

        try {
            const response = await client().execute(request);

            // Loop through purchase units and captures to get capture ID(s)
            const captures = [];
            response.result.purchase_units.forEach((unit) => {
                unit.payments.captures.forEach((capture) => {
                    captures.push(capture.id); // Capture ID
                });
            });

            if (captures.length > 0) {
                return captures[0]; // Return the first capture ID
            } else {
                throw new Error('No captures found for this order');
            }
        } catch (error) {
            console.error('Error fetching capture ID:', error);
            throw new Error('Could not retrieve capture ID from order');
        }
    }

    // Method to process refund using PayPal capture ID
    async refundByCaptureId(captureId, amount = null) {
        
        const request = new paypal.payments.CapturesRefundRequest(captureId);
        request.requestBody({});  // Empty body means full refund

        try {
            const response = await client().execute(request);
            return response.result;
        } catch (error) {
            console.error('Error during PayPal refund:', error);
            throw new Error('Refund failed');
        }
    }

    async refundTransaction(transactionId) {
        const captureId = await this.getCaptureIdFromOrder(transactionId);
        const request = new paypal.payments.CapturesRefundRequest(captureId);
        request.requestBody({});  // Empty body means full refund

        try {
            const response = await client().execute(request);
            return response.result;
        } catch (error) {
            console.error('Error during PayPal refund:', error);
            throw new Error('Refund failed');
        }
    }
}

module.exports = RefundService;
