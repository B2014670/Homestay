const MongoDB = require("../utils/mongodb.util");
const cron = require('node-cron');
async function autoDeleteExpiredOrders() {
    const db = MongoDB.getDb();
    const roomCollection = db.collection("rooms");

    try {
        const currentDate = new Date();

        // Update documents by removing expired orders
        const result = await roomCollection.updateMany(
            {}, // Apply to all documents in the collection
            [
                {
                    $set: {
                        ordersRoom: {
                            $filter: {
                                input: "$ordersRoom",
                                as: "order",
                                cond: {
                                    $gte: [
                                        {
                                            $dateFromString: {
                                                dateString: { $arrayElemAt: ["$$order", 1] },
                                                format: "%d/%m/%Y"
                                            }
                                        },
                                        currentDate
                                    ]
                                }
                            }
                        }
                    }
                }
            ]
        );

        console.log(`Expired orders deleted: ${result.modifiedCount}`);
    } catch (error) {
        console.error("Error deleting expired orders:", error);
    }
}

function scheduleAutoDeleteExpiredOrders() {
    cron.schedule('0 0 * * *', async () => { // Midnight
        try {
            await autoDeleteExpiredOrders();
            console.log("Expired orders deleted successfully.");
        } catch (error) {
            console.error("Error while deleting expired orders:", error);
        }
    });
}

module.exports = { scheduleAutoDeleteExpiredOrders };