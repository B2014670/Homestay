const { MongoClient } = require("mongodb");

class MongoDB {
    static client = null;
    static db = null;

    static connect = async (uri) => {
        if (this.client) return this.client;
        this.client = await MongoClient.connect(uri);
        this.db = this.client.db();
        return this.client;
    };

    static getDb = () => {
        if (!this.db) {
            throw new Error("Database not initialized. Call connect() first.");
        }
        return this.db;
    };

    static disconnect = async () => {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log("Disconnected from MongoDB");
        } else {
            console.log("No MongoDB connection to close.");
        }
    };
}

module.exports = MongoDB;
