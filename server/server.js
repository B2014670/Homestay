const { server } = require("./app"); //app
const config = require("./config");
const MongoDB = require("./utils/mongodb.util")
const { scheduleAutoDeleteExpiredOrders } = require("./cron/autoDelete");
const localtunnel = require("localtunnel");

const PORT = config.app.port;

async function startServer() {
  try {
    await MongoDB.connect(config.db.uri);
    console.log("Connected MongoDB:", config.db.uri);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    try {
      const tunnel = await localtunnel({ port: PORT, subdomain: "homestay1234" }); 
      console.log(`Public URL: ${tunnel.url}`);

      tunnel.on("close", () => {
        console.log("Localtunnel closed");
      });
    } catch (error) {
      console.error("Failed to start localtunnel", error);
    }

    scheduleAutoDeleteExpiredOrders();

  } catch (error) {
    console.log("Can't connect to MongoDB", error);
    process.exit();
  }
}

async function shutdown() {
  console.log("Shutting down server...");
  await MongoDB.disconnect();
  console.log("Disconnected from MongoDB");
  process.exit(0);
}

startServer();